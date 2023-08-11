/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ClientContext,
  CurrentUser,
  LoginCreds,
  LoginResult,
  Message,
  MessageContent,
  MessageID,
  MessageSendOptions,
  OnServerEventCallback,
  PaginationArg,
  PlatformAPI,
  ServerEvent,
  Thread,
  ThreadID,
  User,
} from '@textshq/platform-sdk'
import { ActivityType, AttachmentType, InboxName, ReAuthError, texts } from '@textshq/platform-sdk'
import fs from 'fs/promises'
import url from 'url'
import { eq } from 'drizzle-orm'
import { CookieJar } from 'tough-cookie'

import InstagramAPI from './ig-api'
import InstagramWebSocket from './ig-socket'
import { getLogger } from './logger'
import getDB, { type DrizzleDB } from './store/db'
import { PAPIReturn, SerializedSession } from './types'
import { createPromise } from './util'
import { queryMessages, queryThreads } from './store/helpers'
import * as schema from './store/schema'

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
    wwwClaim: this.api.wwwClaim,
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

  getThreads = async (_folderName: string, pagination?: PaginationArg): PAPIReturn<'getThreads'> => {
    const folderName = _folderName === InboxName.REQUESTS ? InboxName.REQUESTS : InboxName.NORMAL
    this.logger.info('getThreads', { folderName, pagination })
    if (pagination) {
      const { threads, hasMoreBefore } = await this.socket.fetchThreads(folderName)
      return {
        items: threads,
        hasMore: hasMoreBefore,
        oldestCursor: `${this.api.lastThreadReference.reference_thread_key}-${this.api.lastThreadReference.reference_thread_key}`,
      }
    }

    const threads = await queryThreads(this.db, 'ALL', this.api.fbid, folderName)
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
    const messagesHasMoreBefore = this.api.messagesHasMoreBefore.get(threadID)
    this.logger.info('getMessages', { messagesHasMoreBefore })
    if (messagesHasMoreBefore) {
      const lastMessage = this.api.getOldestMessage(threadID)
      const { messages, hasMoreBefore } = await this.socket.fetchMessages(threadID, lastMessage.messageId, lastMessage.timestampMs) as any
      this.logger.info('getMessages, returning messages', { messages, hasMoreBefore })
      return {
        items: messages,
        hasMore: hasMoreBefore,
      }
    }
    const messages = queryMessages(this.db, threadID, 'ALL', this.api.fbid)
    return {
      items: messages,
      hasMore: this.api.messagesHasMoreBefore.get(threadID),
    }
  }

  getThread = async (threadID: string): PAPIReturn<'getThread'> => {
    const t = await queryThreads(this.db, [threadID], this.api.fbid, null)
    return t[0]
  }

  getMessage = (threadID: ThreadID, messageID: MessageID) => queryMessages(this.db, threadID, [messageID], this.api.fbid)[0]

  getUser = async (ids: { userID?: string } | { username?: string } | { phoneNumber?: string } | { email?: string }) => {
    // type check username
    this.logger.info('getUser', ids)
    if ('userID' in ids && typeof ids.userID === 'string') {
      const a = await this.socket.requestContacts([ids.userID])
      this.logger.info('getUser got user', a)
    }
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
    await this.socket.requestContacts(missingUserIDs)

    this.logger.debug('createThread', {
      users,
      missingUserIDs,
      resp,
    })
    const participants = [
      ...users.map(user => ({
        id: user.id,
        fullName: user.name,
        imgURL: user.profilePictureUrl,
        username: user.username,
        isSelf: user.id === this.api.fbid,
        isAdmin: user.id === this.api.fbid,
      })),
      ...missingUserIDs.map(userID => ({
        id: userID,
        isSelf: userID === this.api.fbid,
        isAdmin: userID === this.api.fbid,
        // fullName: null,
        // imgURL: null,
        // username: null,
      })),
    ].filter(Boolean)

    return {
      id: resp.threadId,
      title: null,
      imgURL: null,
      isUnread: false,
      isReadOnly: false,
      messages: {
        items: [],
        hasMore: false,
      },
      participants: {
        items: participants,
        hasMore: false,
      },
      timestamp: new Date(resp.now),
      type: 'group' as const,
    }
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

    if ('folderName' in updates) {
      if (updates.folderName === InboxName.NORMAL) {
        promises.push(this.socket.approveThread(threadID))
      }
    }

    await Promise.all(promises)
  }

  deleteThread = (threadID: string) => this.socket.deleteThread(threadID)

  sendMessage = async (threadID: string, { text, fileBuffer, isRecordedAudio, mimeType, fileName, filePath }: MessageContent, { pendingMessageID, quotedMessageID }: MessageSendOptions) => {
    if (!text) {
      if (fileBuffer || isRecordedAudio || !filePath) throw Error('not implemented')
      this.logger.info('sendMessage', filePath)
      const { timestamp, messageId } = await this.api.sendMedia(threadID, { pendingMessageID, quotedMessageID }, { fileName, filePath })
      this.logger.info('sendMessage got it', {
        timestamp,
        messageId,
      })
      const userMessage: Message = {
        id: messageId || pendingMessageID,
        timestamp,
        senderID: this.api.fbid,
        isSender: true,
        linkedMessageID: quotedMessageID,
        attachments: [{
          id: pendingMessageID,
          type: mimeType.startsWith('video/') ? AttachmentType.VIDEO : AttachmentType.IMG,
          srcURL: url.pathToFileURL(filePath).href,
        }],
      }
      return [userMessage]
    }
    const { timestamp, messageId } = await this.socket.sendMessage(threadID, { text }, { pendingMessageID, quotedMessageID })
    return [{
      id: messageId || pendingMessageID,
      timestamp,
      text,
      linkedMessageID: quotedMessageID,
      senderID: this.api.fbid,
      isSender: true,
    }]
  }

  sendActivityIndicator = (type: ActivityType, threadID: string) => {
    this.logger.info('sendActivityIndicator', threadID, type)
    if (![ActivityType.TYPING, ActivityType.NONE].includes(type)) return
    return this.socket.sendTypingIndicator(threadID, type === ActivityType.TYPING)
  }

  deleteMessage = (threadID: string, messageID: string, forEveryone?: boolean) => this.socket.unsendMessage(messageID)

  sendReadReceipt = (threadID: string, messageID: string, messageCursor?: string) => this.socket.sendReadReceipt(threadID, Date.now())

  addReaction = (threadID: string, messageID: string, reactionKey: string) => this.socket.addReaction(threadID, messageID, reactionKey)

  removeReaction = (threadID: string, messageID: string, reactionKey: string) => this.socket.addReaction(threadID, messageID, '')

  addParticipant = (threadID: string, participantID: string) => this.socket.addParticipants(threadID, [participantID])

  removeParticipant = (threadID: string, participantID: string) => this.socket.removeParticipant(threadID, participantID)

  changeParticipantRole = (threadID: string, participantID: string, role: 'admin' | 'regular') => this.socket.changeAdminStatus(threadID, participantID, role === 'admin')

  getOriginalObject = (objName: 'thread' | 'message', objectID: ThreadID | MessageID) => {
    if (objName === 'thread') {
      const thread = this.db.query.threads.findFirst({
        where: eq(schema.threads.threadKey, objectID),
        columns: {
          threadKey: true,
          thread: true,
          lastActivityTimestampMs: true,
          folderName: true,
          raw: true,
        },
        with: {
          participants: {
            columns: {
              userId: true,
              isAdmin: true,
              readWatermarkTimestampMs: true,
            },
            with: {
              contacts: {
                columns: {
                  id: true,
                  name: true,
                  username: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      })
      return JSON.stringify({
        ...thread,
        thread: JSON.parse(thread.thread),
        // raw: JSON.parse(thread.raw),
      }, null, 2)
    }
    if (objName === 'message') {
      const message = this.db.query.messages.findFirst({
        where: eq(schema.messages.messageId, objectID),
        columns: {
          raw: true,
          message: true,
          threadKey: true,
          messageId: true,
          offlineThreadingId: true,
          primarySortKey: true,
          timestampMs: true,
          senderId: true,
        },
        with: {
          attachments: {
            columns: {
              raw: true,
              attachmentFbid: true,
              attachment: true,
            },
          },
          reactions: true,
        },
      })
      return JSON.stringify({
        ...message,
        message: JSON.parse(message.message),
        // raw: JSON.parse(message.raw),
        attachments: message.attachments?.map(a => ({
          ...a,
          attachment: JSON.parse(a.attachment),
          // raw: JSON.parse(a.raw),
        })),
      }, null, 2)
    }
  }

  forwardMessage = async (_threadID: ThreadID, messageID: MessageID, threadIDs: ThreadID[]) => {
    await Promise.all(threadIDs.map(tid => this.socket.forwardMessage(tid, messageID)))
  }
}
