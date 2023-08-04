import { ActivityType, AttachmentType, texts } from '@textshq/platform-sdk'
import type { Awaitable, ClientContext, CurrentUser, CustomEmojiMap, GetAssetOptions, LoginCreds, LoginResult, Message, MessageContent, MessageLink, MessageSendOptions, OnConnStateChangeCallback, OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap, SearchMessageOptions, ServerEvent, Thread, User } from '@textshq/platform-sdk'
import { mkdir } from 'fs/promises'
import { CookieJar } from 'tough-cookie'
// import { eq } from 'drizzle-orm'

import InstagramAPI from './ig-api'
import InstagramWebSocket from './ig-socket'
import { getLogger } from './logger'
import getDB, { type DrizzleDB } from './store/db'
// import * as schema from './store/schema'
// import * as queries from './store/queries'
import { PAPIReturn, SerializedSession } from './types'
import { createPromise } from './util'
import { queryThreads } from './store/helpers'

export default class PlatformInstagram implements PlatformAPI {
  private loginEventCallback: (data: any) => void

  private dataDirPath: string

  private nativeArchiveSync: boolean | undefined

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

  init = async (session: SerializedSession, { accountID, nativeArchiveSync, dataDirPath }: ClientContext) => {
    await mkdir(dataDirPath, { recursive: true })

    this.dataDirPath = dataDirPath
    this.nativeArchiveSync = nativeArchiveSync

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

  logout = async () => {
    this.logger.info('logout')
    // @TODO: logout
  }

  serializeSession = (): SerializedSession => ({
    jar: this.api.jar.toJSON(),
    ua: this.api.ua,
    authMethod: this.api.authMethod ?? 'login-window',
    clientId: this.api.clientId,
    dtsg: this.api.dtsg,
    fbid: this.api.fbid,
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

  onLoginEvent = (onEvent: (data: any) => void) => {
    this.loginEventCallback = onEvent
  }

  onConnectionStateChange?: (onEvent: OnConnStateChangeCallback) => Awaitable<void>

  takeoverConflict?: () => Awaitable<void>

  searchUsers: (typed: string) => Awaitable<User[]>

  searchThreads?: (typed: string) => Awaitable<Thread[]>

  searchMessages?: (typed: string, pagination?: PaginationArg, options?: SearchMessageOptions) => Awaitable<Paginated<Message>>

  getPresence?: () => Awaitable<PresenceMap>

  getCustomEmojis?: () => Awaitable<CustomEmojiMap>

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

  getMessages = async (threadID: string, pagination: PaginationArg): PAPIReturn<'getMessages'> => {
    this.logger.info('getMessages, pagination is', pagination)
    const { messages, hasMoreBefore } = await this.socket.fetchMessages(threadID) as any
    this.logger.info('getMessages, returning messages', messages, hasMoreBefore)
    return {
      items: messages,
      hasMore: hasMoreBefore,
      oldestCursor: 'test',
    }
  }

  getThreadParticipants?: (threadID: string, pagination?: PaginationArg) => Awaitable<Paginated<Participant>>

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

  createThread: (userIDs: string[], title?: string, messageText?: string) => Awaitable<boolean | Thread>

  updateThread = async (threadID: string, updates: Partial<Thread>) => {
    this.logger.info('updateThread', threadID, updates)
  }

  deleteThread = async (threadID: string) => {
    this.logger.info('deleteThread', threadID)
  }

  reportThread = async (type: 'spam', threadID: string, firstMessageID?: string) => {
    this.logger.info('reportThread', type, threadID, firstMessageID)
    return true
  }

  sendMessage = async (threadID: string, { text, fileBuffer, isRecordedAudio, isGif, fileName, filePath }: MessageContent, { pendingMessageID }: MessageSendOptions) => {
    if (!threadID) return false
    if (!text) {
      // image
      if (fileBuffer || isRecordedAudio || isGif || !filePath) {
        this.logger.info('sendMessage', fileBuffer, isRecordedAudio, isGif, filePath)
        this.logger.info('sendMessage', 'second not')
        return false
      }
      this.logger.info('sendMessage', filePath)
      this.logger.info('sendMessage', 'called send image')
      await this.api.sendImage(threadID, { fileName, filePath })
      const userMessage: Message = {
        id: pendingMessageID,
        timestamp: new Date(),
        senderID: this.currentUser.id,
        isSender: true,
        attachments: [{
          id: pendingMessageID,
          type: AttachmentType.IMG,
          srcURL: filePath,
        }],
      }
      return [userMessage]
    }
    const { timestamp, messageId, offlineThreadingId } = await this.socket.sendMessage(threadID, { text }, { pendingMessageID })
    this.logger.info('got result from send message', { timestamp, messageId, offlineThreadingId }, {
      id: messageId || pendingMessageID,
      timestamp,
      text,
      senderID: this.api.fbid,
      isSender: true,
    })

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
    this.logger.info('deleteMessage', { threadID, messageID, forEveryone })
  }

  sendReadReceipt = async (threadID: string, messageID: string, messageCursor?: string) => {
    this.logger.info('sendReadReceipt', { threadID, messageID, messageCursor })
  }

  addReaction = async (threadID: string, messageID: string, reactionKey: string) => {
    this.logger.info('addReaction', { threadID, messageID, reactionKey })
    this.socket.addReaction(threadID, messageID, reactionKey)
  }

  removeReaction = async (threadID: string, messageID: string, reactionKey: string) => {
    this.logger.info('removeReaction', { threadID, messageID, reactionKey })
    // a message can only have a single reaction from a single participant
    this.socket.addReaction(threadID, messageID, '')
  }

  getLinkPreview = async (link: string): Promise<MessageLink> => {
    this.logger.info('getLinkPreview', { link })
    return { url: link, title: '' }
  }

  addParticipant = async (threadID: string, participantID: string) => {
    this.logger.info('addParticipant', { threadID, participantID })
  }

  removeParticipant = async (threadID: string, participantID: string) => {
    this.logger.info('removeParticipant', { threadID, participantID })
  }

  changeParticipantRole = async (threadID: string, participantID: string, role: string) => {
    this.logger.info('changeParticipantRole', { threadID, participantID, role })
  }

  changeThreadImage = async (threadID: string, imageBuffer: Buffer, mimeType: string) => {
    this.logger.info('changeThreadImage', { threadID, mimeType })
  }

  markAsUnread = async (threadID: string, messageID?: string) => {
    this.logger.info('markAsUnread', { threadID, messageID })
  }

  archiveThread = async (threadID: string, archived: boolean) => {
    this.logger.info('archiveThread', { threadID, archived })
  }

  pinThread = async (threadID: string, pinned: boolean) => {
    this.logger.info('pinThread', { threadID, pinned })
  }

  notifyAnyway = async (threadID: string) => {
    this.logger.info('notifyAnyway', { threadID })
  }

  onThreadSelected = async (threadID: string) => {
    this.logger.info('onThreadSelected', { threadID })
  }

  loadDynamicMessage = async (message: Message) => {
    this.logger.info('loadDynamicMessage', { message })
    return {}
  }

  getAsset = async (fetchOptions?: GetAssetOptions, ...args: string[]) => {
    this.logger.info('getAsset', { fetchOptions, args })
    return null
  }

  getOriginalObject = async (objName: 'thread' | 'message', objectID: string) => {
    this.logger.info('getOriginalObject', { objName, objectID })
    return ''
  }

  handleDeepLink = (link: string) => {
    this.logger.info('handleDeepLink', { link })
  }

  onResumeFromSleep = () => {
    this.logger.info('onResumeFromSleep')
  }
}
