/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActivityType, AttachmentType, ReAuthError, texts } from '@textshq/platform-sdk'
import type { ClientContext, CurrentUser, LoginCreds, LoginResult, Message, MessageContent, MessageSendOptions, OnServerEventCallback, PaginationArg, PlatformAPI, ServerEvent, Thread, User } from '@textshq/platform-sdk'
import fs from 'fs/promises'
import url from 'url'
import { CookieJar } from 'tough-cookie'

import InstagramAPI from './ig-api'
import InstagramWebSocket from './ig-socket'
import { getLogger } from './logger'
import getDB, { type DrizzleDB } from './store/db'
import { PAPIReturn, SerializedSession } from './types'
import { createPromise } from './util'
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
      this.logger.info('getThreads, connecting to socket with ', { pagination })
      const { threads, hasMoreBefore } = await this.socket.getThreads() as any
      return {
        items: threads,
        hasMore: hasMoreBefore,
        oldestCursor: `${this.api.lastThreadReference.reference_thread_key}-${this.api.lastThreadReference.reference_thread_key}`,
      }
    }

    const threads = await queryThreads(this.db, 'ALL', this.api.fbid)
    this.logger.info('getThreads, returning threads from db', threads)
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
      this.logger.info('getMessages, fetching new messages from socket')
      const { messages, hasMoreBefore } = await this.socket.fetchMessages(threadID) as any
      this.logger.info('getMessages, returning messages', messages, hasMoreBefore)
      return {
        items: messages,
        hasMore: hasMoreBefore,
      }
    }
    const messages = await queryMessages(this.db, 'ALL', this.api.fbid, threadID)
    return {
      items: messages,
      hasMore: false,
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
    if (userIDs.length === 1) {
      const [userID] = userIDs
      const user = this.api.getContact(userID)
      await this.socket.createThread(userID)

      return {
        id: userID,
        title: user?.name,
        imgURL: user?.profilePictureUrl,
        isUnread: false,
        isReadOnly: false,
        messages: {
          items: [],
          hasMore: false,
        },
        participants: {
          items: [{
            id: userID,
            fullName: user?.name,
            imgURL: user?.profilePictureUrl,
            username: user?.username,
          }],
          hasMore: false,
        },
        timestamp: new Date(),
        type: 'single' as const,
      }
    }

    const resp = await this.socket.createGroupThread(userIDs)
    const users = this.api.getContacts(userIDs)
    /// compare with userIDs to see if all users were found
    const missingUserIDs = userIDs.filter(id => !users.find(u => u.id === id))
    // await this.socket.sendMessage(userIDs[0], { text: 'test' }, { pendingMessageID: 'test' })

    this.logger.debug('createThread', {
      users,
      missingUserIDs,
      resp,
    })
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

  deleteThread = (threadID: string) => this.socket.deleteThread(threadID)

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

  deleteMessage = (threadID: string, messageID: string, forEveryone?: boolean) => this.socket?.unsendMessage(messageID)

  sendReadReceipt = async (threadID: string, messageID: string, messageCursor?: string) => {
    this.logger.info('sendReadReceipt', { threadID, messageID, messageCursor })
  }

  addReaction = (threadID: string, messageID: string, reactionKey: string) => this.socket.addReaction(threadID, messageID, reactionKey)

  removeReaction = (threadID: string, messageID: string, reactionKey: string) => this.socket.addReaction(threadID, messageID, '')

  addParticipant = (threadID: string, participantID: string) => this.socket.addParticipants(threadID, [participantID])

  removeParticipant = (threadID: string, participantID: string) => this.socket.removeParticipant(threadID, participantID)

  changeParticipantRole = (threadID: string, participantID: string, role: 'admin' | 'regular') => this.socket.changeAdminStatus(threadID, participantID, role === 'admin')
}
