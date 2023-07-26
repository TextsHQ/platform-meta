import { texts } from '@textshq/platform-sdk'
import type { Awaitable, ClientContext, CurrentUser, CustomEmojiMap, LoginCreds, LoginResult, Message, MessageContent, MessageID, MessageLink, MessageSendOptions, OnConnStateChangeCallback, OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap, SearchMessageOptions, SerializedSession, Thread, ThreadID, User } from '@textshq/platform-sdk'
import path from 'path'
import { mkdir } from 'fs/promises'
import { CookieJar } from 'tough-cookie'
import { eq } from 'drizzle-orm'
import type { Logger } from 'pino'

import InstagramAPI from './ig-api'
import InstagramWebSocket from './ig-socket'
import { generateInstanceId, getLogger } from './util'
import getDB, { type DrizzleDB } from './store/db'
import * as schema from './store/schema'
import { PAPIReturn } from './types'

export default class PlatformInstagram implements PlatformAPI {
  private loginEventCallback: (data: any) => void

  private dataDirPath: string

  private nativeArchiveSync: boolean | undefined

  initPromise: Promise<void>

  logger: Logger

  db: DrizzleDB

  api: InstagramAPI

  onEvent: OnServerEventCallback

  constructor(readonly accountID: string) {}

  init = async (session: SerializedSession, { accountID, nativeArchiveSync, dataDirPath }: ClientContext) => {
    this.dataDirPath = dataDirPath
    this.nativeArchiveSync = nativeArchiveSync

    await mkdir(this.dataDirPath, { recursive: true })

    const logPath = path.join(dataDirPath, 'platform-instagram.log')

    this.logger = getLogger(logPath)
      .child({
        stream: 'pi-' + this.accountID,
        instance: generateInstanceId(),
      })

    if (texts.isLoggingEnabled) this.logger.info('ig log path', logPath)

    const dbPath = path.join(this.dataDirPath, `ig-${this.accountID}.db`)

    this.logger.info('ig db init', { dbPath })

    this.db = await getDB(accountID, dbPath, this.logger)

    this.api = new InstagramAPI(this)

    if (!session?.jar) return
    const { jar, ua, authMethod } = session
    this.api.jar = CookieJar.fromJSON(jar)
    this.api.ua = ua
    this.api.authMethod = authMethod
    this.initPromise = this.api.init()
    await this.initPromise
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
    this.initPromise = this.api.init()
    await this.initPromise
    return { type: 'success' }
  }

  // eslint-disable-next-line class-methods-use-this
  logout = async () => {
    // @TODO: logout
  }

  serializeSession = () => ({
    jar: this.api.jar?.toJSON(),
    ua: this.api.ua,
    authMethod: this.api.authMethod ?? 'login-window',
  })

  subscribeToEvents = async (onEvent: OnServerEventCallback) => {
    this.onEvent = data => {
      onEvent(data)
      this.logger.info('instagram got server event', JSON.stringify(data, null, 2))
    }
    this.api.socket = new InstagramWebSocket(this, this.api)
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
    this.api.socket?.getThreads?.()
    const threads = this.db.select().from(schema.threads).all().map(thread => ({
      ...thread,
      participants: null,
      messages: null,
    }))
    return {
      items: threads,
      hasMore: false,
    }
  }

  getMessages = async (threadID: string, pagination: PaginationArg): PAPIReturn<'getMessages'> => {
    this.logger.info('getMessages', threadID, pagination)

    this.api.socket?.getMessages?.(threadID)
    const messages = this.db.select().from(schema.messages).where(eq(schema.messages.threadID, threadID)).all()
    return {
      items: messages.map(m => ({
        ...m,
        action: null,
      })),
      hasMore: false,
    }
  }

  getThreadParticipants?: (threadID: string, pagination?: PaginationArg) => Awaitable<Paginated<Participant>>

  getThread = async (threadID: string): PAPIReturn<'getThread'> => {
    const [thread] = this.db.select().from(schema.threads).where(eq(schema.threads.id, threadID)).all()
    if (!thread) return null

    // @TODO: this could be a join and also needs to be paginated
    const messages = await this.getMessages(threadID, {
      cursor: null,
      direction: 'after',
    })

    return {
      ...thread,
      messages,
      participants: null,
    }
  }

  getMessage = (threadID: ThreadID, messageID: MessageID) => {
    const [message] = this.db.select().from(schema.messages)
      .where(eq(schema.messages.id, messageID))
      .where(eq(schema.messages.threadID, threadID))
      .all()
    return {
      ...message,
      action: null,
    }
  }

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

  sendMessage = async (threadID: string, { text }: MessageContent, { pendingMessageID }: MessageSendOptions) => {
    if (!text && !threadID) return false
    const userMessage: Message = {
      id: pendingMessageID,
      timestamp: new Date(),
      text,
      senderID: this.currentUser.id,
      isSender: true,
    }
    this.api.socket.sendMessage(threadID, text)
    return [userMessage]
  }

  sendActivityIndicator = (threadID: string) => {
    this.api.socket.sendTypingIndicator(threadID)
  }

  deleteMessage = async (threadID: string, messageID: string, forEveryone?: boolean) => {
    this.logger.info('deleteMessage', { threadID, messageID, forEveryone })
    return null
  }

  sendReadReceipt = async (threadID: string, messageID: string, messageCursor?: string) => {
    this.logger.info('sendReadReceipt', { threadID, messageID, messageCursor })
    return null
  }

  addReaction = async (threadID: string, messageID: string, reactionKey: string) => {
    this.logger.info('addReaction', { threadID, messageID, reactionKey })
    return null
  }

  removeReaction = async (threadID: string, messageID: string, reactionKey: string) => {
    this.logger.info('removeReaction', { threadID, messageID, reactionKey })
    return null
  }

  getLinkPreview = async (link: string): Promise<MessageLink> => {
    this.logger.info('getLinkPreview', { link })
    return { url: link, title: '' }
  }

  addParticipant = async (threadID: string, participantID: string) => {
    this.logger.info('addParticipant', { threadID, participantID })
    return null
  }

  removeParticipant = async (threadID: string, participantID: string) => {
    this.logger.info('removeParticipant', { threadID, participantID })
    return null
  }

  changeParticipantRole = async (threadID: string, participantID: string, role: string) => {
    this.logger.info('changeParticipantRole', { threadID, participantID, role })
    return null
  }

  changeThreadImage = async (threadID: string, imageBuffer: Buffer, mimeType: string) => {
    this.logger.info('changeThreadImage', { threadID, mimeType })
    return null
  }

  markAsUnread = async (threadID: string, messageID?: string) => {
    this.logger.info('markAsUnread', { threadID, messageID })
    return null
  }

  archiveThread = async (threadID: string, archived: boolean) => {
    this.logger.info('archiveThread', { threadID, archived })
    return null
  }

  pinThread = async (threadID: string, pinned: boolean) => {
    this.logger.info('pinThread', { threadID, pinned })
    return null
  }

  notifyAnyway = async (threadID: string) => {
    this.logger.info('notifyAnyway', { threadID })
    return null
  }

  onThreadSelected = async (threadID: string) => {
    this.logger.info('onThreadSelected', { threadID })
    return null
  }

  loadDynamicMessage = async (message: Message) => {
    this.logger.info('loadDynamicMessage', { message })
    return {}
  }

  getAsset = async (_, ...args: string[]) => {
    this.logger.info('getAsset', { args })
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
