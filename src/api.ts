/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActivityType, AttachmentType, ReAuthError, texts } from '@textshq/platform-sdk'
import type { Awaitable, ClientContext, CurrentUser, CustomEmojiMap, GetAssetOptions, LoginCreds, LoginResult, Message, MessageContent, MessageLink, MessageSendOptions, OnConnStateChangeCallback, OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap, SearchMessageOptions, ServerEvent, Thread, User } from '@textshq/platform-sdk'
import fs from 'fs/promises'
import url from 'url'
import { CookieJar } from 'tough-cookie'

import InstagramAPI from './ig-api'
import InstagramWebSocket from './ig-socket'
import { getLogger } from './logger'
import getDB, { type DrizzleDB } from './store/db'
import { PAPIReturn, SerializedSession } from './types'
import { createPromise } from './util'
import { APP_ID, INSTAGRAM_BASE_URL } from './constants'
import { queryThreads, queryMessages } from './store/helpers'

export default class PlatformInstagram implements PlatformAPI {
  private _initPromise = createPromise<void>()

  get initPromise() {
    return this._initPromise.promise
  }

  logger = getLogger()

  db: DrizzleDB

  api = new InstagramAPI(this)

  socket = new InstagramWebSocket(this)

  sendPromiseMap = new Map<string, [(value) => void, (err: Error) => void]>()

  onEvent: OnServerEventCallback = events => {
    this.logger.info('instagram got server event before ready', JSON.stringify(events, null, 2))
    this.pendingEvents.push(...events)
  }

  pendingEvents: ServerEvent[] = []

  constructor(readonly accountID: string) {}

  init = async (session: SerializedSession, { accountID, dataDirPath }: ClientContext) => {
    if (session && typeof session.dtsg === 'undefined') throw new ReAuthError() // upgrade from android-based session

    await fs.mkdir(dataDirPath, { recursive: true })

    if (texts.isLoggingEnabled) this.logger.info('starting ig', { dataDirPath, accountID })

    this.db = await getDB(accountID, dataDirPath)

    if (!session?.jar) return
    const { jar, ua, authMethod, clientId, dtsg, fbid } = session
    this.api.jar = CookieJar.fromJSON(jar as unknown as string)
    this.api.ua = ua
    this.api.authMethod = authMethod
    this.api.clientId = clientId
    this.api.dtsg = dtsg
    this.api.fbid = fbid
    // this.api.cursor = session.lastCursor

    await this.api.init()
    this._initPromise.resolve()
  }

  // eslint-disable-next-line class-methods-use-this
  dispose = () => {
    this.socket?.dispose()
    // if (this.api?.socket?.ws?.readyState === WebSocket.OPEN) {
    //   this.api?.socket.ws.close()
    // }
  }

  currentUser: CurrentUser

  getCurrentUser = () => this.currentUser

  login = async (creds: LoginCreds): Promise<LoginResult> => {
    const cookieJarJSON = 'cookieJarJSON' in creds && creds.cookieJarJSON
    if (!cookieJarJSON) return { type: 'error', errorMessage: 'Cookies not found' }
    if (creds.jsCodeResult) {
      const { ua, authMethod } = JSON.parse(creds.jsCodeResult)
      this.api.ua = ua
      this.api.authMethod = authMethod || 'login-window'
    }
    this.api.jar = CookieJar.fromJSON(cookieJarJSON as any)
    await this.api.init()
    this._initPromise.resolve()
    return { type: 'success' }
  }

  logout = () => this.api.logout()

  serializeSession = (): SerializedSession => ({
    jar: this.api.jar.toJSON(),
    ua: this.api.ua,
    authMethod: this.api.authMethod ?? 'login-window',
    clientId: this.api.clientId,
    dtsg: this.api.dtsg,
    lsd: this.api.lsd,
    fbid: this.api.fbid,
    igUserId: this.api.igUserId,
    lastCursor: this.api.cursor,
  })

  subscribeToEvents = async (onEvent: OnServerEventCallback) => {
    if (this.pendingEvents.length > 0) {
      onEvent(this.pendingEvents)
      this.pendingEvents = []
    }

    this.onEvent = events => {
      this.logger.info('instagram got server event', JSON.stringify(events, null, 2))
      onEvent(events)
    }

    await this.socket.connect()
  }

  searchUsers = (typed: string) => this.socket.searchUsers(typed)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getThreads = async (_folderName: string, pagination?: PaginationArg): PAPIReturn<'getThreads'> => {
    this.logger.info('getThreads, pagination is', pagination)
    if (pagination) {
      const { threads, hasMoreBefore } = await this.socket.getThreads() as any
      return {
        items: threads,
        hasMore: hasMoreBefore,
        oldestCursor: `${this.api.lastThreadReference.reference_thread_key}-${this.api.lastThreadReference.reference_thread_key}`,
      }
    }

    const threads = await queryThreads(this.db, 'ALL', this.api.fbid)
    this.logger.info('getThreads, returning threads', threads)
    const { hasMoreBefore } = this.api.lastThreadReference
    return {
      items: threads,
      hasMore: hasMoreBefore,
      oldestCursor: `${this.api.lastThreadReference.reference_thread_key}-${this.api.lastThreadReference.reference_thread_key}`,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMessages = async (threadID: string, pagination: PaginationArg): PAPIReturn<'getMessages'> => {
    const hmb = this.api.messagesHasMoreBefore[threadID]
    this.logger.info(`getMessages, messagesHasMoreBefore is  ${this.api.messagesHasMoreBefore[threadID]}`)
    if (hmb) {
      const { messages, hasMoreBefore } = await this.socket.fetchMessages(threadID) as any
      this.logger.info('getMessages, returning messages', messages, hasMoreBefore)
      return {
        items: messages,
        hasMore: hasMoreBefore,
        oldestCursor: 'test',
      }
    }
    const messages = await queryMessages(this.db, 'ALL', this.api.fbid, threadID)
    return {
      items: messages,
      hasMore: hmb,
      oldestCursor: 'test',
    }
  }

  // getThread = async (threadID: string): PAPIReturn<'getThread'> => {
  //   const [thread] = this.db.select().from(schema.threads).where(eq(schema.threads.id, threadID)).all()
  //   if (!thread) return null

  //   // @TODO: this could be a join and also needs to be paginated
  //   const messages = await this.getMessages(threadID, {
  //     cursor: null,
  //     direction: 'after',
  //   })

  //   return {
  //     ...thread,
  //     messages,
  //     participants: null,
  //   }
  // }

  // getMessage = (threadID: ThreadID, messageID: MessageID) => {
  //   const [message] = this.db.select().from(schema.messages)
  //     .where(eq(schema.messages.messageId, messageID))
  //     .where(eq(schema.messages.threadKey, threadID))
  //     .all()
  //   return {
  //     ...message,
  //     action: null,
  //   }
  // }

  getUser = async (ids: { userID?: string } | { username?: string } | { phoneNumber?: string } | { email?: string }) => {
    // type check username
    const username = 'username' in ids && ids.username
    const user: User = await this.api.getUserByUsername(username)
    this.logger.info('instagram got user', user)
    return user
  }

  createThread = async (userIDs: string[], title?: string, messageText?: string) => {
    this.logger.debug('createThread', {
      userIDs,
      title,
      messageText,
    })
    await this.socket.sendMessage(userIDs[0], { text: 'test' }, { pendingMessageID: 'test' })
    throw new Error('Method not implemented.')
  }

  updateThread = async (threadID: string, updates: Partial<Thread>) => {
    this.logger.info('updateThread', threadID, updates)
    const promises: Promise<void>[] = []

    if ('title' in updates) {
      promises.push(this.socket.setThreadName(threadID, updates.title))
    }

    if ('mutedUntil' in updates) {
      promises.push(this.socket.muteThread(threadID, updates.mutedUntil === 'forever' ? -1 : 0))
    }

    await Promise.all(promises)
  }

  deleteThread = async (threadID: string) => {
    this.logger.debug('deleteThread', threadID)
    await this.socket.deleteThread(threadID)
  }

  sendMessage = async (threadID: string, { text, fileBuffer, isRecordedAudio, mimeType, fileName, filePath }: MessageContent, { pendingMessageID }: MessageSendOptions) => {
    if (!text) {
      if (fileBuffer || isRecordedAudio || !filePath) throw Error('not implemented')
      this.logger.info('sendMessage', filePath)
      const { timestamp, messageId } = await this.api.sendMedia(threadID, { fileName, filePath })
      this.logger.info('sendMessage got it', {
        timestamp,
        messageId,
      })
      const userMessage: Message = {
        id: messageId || pendingMessageID,
        timestamp,
        senderID: this.api.fbid,
        isSender: true,
        attachments: [{
          id: pendingMessageID,
          type: mimeType.startsWith('video/') ? AttachmentType.VIDEO : AttachmentType.IMG,
          srcURL: url.pathToFileURL(filePath).href,
        }],
      }
      return [userMessage]
    }
    const { timestamp, messageId } = await this.socket.sendMessage(threadID, { text }, { pendingMessageID })
    return [{
      id: messageId || pendingMessageID,
      timestamp,
      text,
      senderID: this.api.fbid,
      isSender: true,
    }]
  }

  sendActivityIndicator = (type: ActivityType, threadID: string) => {
    this.logger.info('sendActivityIndicator', threadID, type)
    if (![ActivityType.TYPING, ActivityType.NONE].includes(type)) return
    return this.socket.sendTypingIndicator(threadID, type === ActivityType.TYPING)
  }

  deleteMessage = async (threadID: string, messageID: string, forEveryone?: boolean) => {
    this.logger.debug('deleteMessage', { threadID, messageID, forEveryone })
    await this.socket?.unsendMessage(messageID)
  }

  sendReadReceipt = async (threadID: string, messageID: string, messageCursor?: string) => {
    this.logger.info('sendReadReceipt', { threadID, messageID, messageCursor })
  }

  addReaction = async (threadID: string, messageID: string, reactionKey: string) => {
    this.logger.info('addReaction', { threadID, messageID, reactionKey })
    await this.socket.addReaction(threadID, messageID, reactionKey)
  }

  removeReaction = async (threadID: string, messageID: string, reactionKey: string) => {
    this.logger.info('removeReaction', { threadID, messageID, reactionKey })
    await this.socket.addReaction(threadID, messageID, '')
  }

  addParticipant = async (threadID: string, participantID: string) => {
    this.logger.info('addParticipant', { threadID, participantID })
    await this.socket?.addParticipants(threadID, [participantID])
  }

  removeParticipant = async (threadID: string, participantID: string) => {
    this.logger.info('removeParticipant', { threadID, participantID })
    await this.socket.removeParticipant(threadID, participantID)
  }

  changeParticipantRole = async (threadID: string, participantID: string, role: 'admin' | 'regular') => {
    this.logger.debug('changeParticipantRole', { threadID, participantID, role })
    await this.socket?.changeAdminStatus(threadID, participantID, role === 'admin')
  }
}
