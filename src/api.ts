import { AttachmentType, texts } from '@textshq/platform-sdk'
import type { Awaitable, ClientContext, CurrentUser, CustomEmojiMap, GetAssetOptions, LoginCreds, LoginResult, Message, MessageContent, MessageLink, MessageSendOptions, OnConnStateChangeCallback, OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap, SearchMessageOptions, Thread, User } from '@textshq/platform-sdk'
import { mkdir } from 'fs/promises'
import { CookieJar } from 'tough-cookie'
import { eq } from 'drizzle-orm'

import InstagramAPI from './ig-api'
import InstagramWebSocket from './ig-socket'
import { getLogger } from './logger'
import getDB, { type DrizzleDB } from './store/db'
import * as schema from './store/schema'
import { PAPIReturn, SerializedSession } from './types'
import { createPromise } from './util'

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

  onEvent: OnServerEventCallback

  constructor(readonly accountID: string) {}

  init = async (session: SerializedSession, { accountID, nativeArchiveSync, dataDirPath }: ClientContext) => {
    await mkdir(dataDirPath, { recursive: true })

    this.dataDirPath = dataDirPath
    this.nativeArchiveSync = nativeArchiveSync

    // const logPath = path.join(dataDirPath, 'platform-instagram.log')

    // this.logger = getLogger()
    // .child({
    //   stream: 'pi-' + this.accountID,
    //   instance: generateInstanceId(),
    // })

    // texts.log('ig log path', logPath)
    texts.log('is logging enabled', texts.isLoggingEnabled, dataDirPath)
    // if (texts.isLoggingEnabled) this.logger.info('ig log path', { logPath })

    this.db = await getDB(accountID, dataDirPath)

    if (!session?.jar) return
    const { jar, ua, authMethod, clientId, dtsg, fbid } = session
    this.api.jar = CookieJar.fromJSON(jar as unknown as string)
    this.api.ua = ua
    this.api.authMethod = authMethod
    this.api.clientId = clientId
    this.api.dtsg = dtsg
    this.api.fbid = fbid
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
    this.onEvent = data => {
      this.logger.info('instagram got server event', JSON.stringify(data, null, 2))
      onEvent(data)
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
    // this.api.socket?.getThreads?.()
    const threads: Thread[] = this.db.select().from(schema.threads).all().map(thread => ({
      id: thread.threadKey,
      isUnread: thread.lastActivityTimestampMs > thread.lastReadWatermarkTimestampMs,
      isReadOnly: false,
      participants: null,
      messages: null,
      type: 'single',
    }))
    return {
      items: threads,
      hasMore: false,
    }
  }

  getMessages = async (threadID: string, pagination: PaginationArg): PAPIReturn<'getMessages'> => {
    this.logger.info('getMessages', threadID, pagination)
    const messages = this.db.select().from(schema.messages).where(eq(schema.messages.threadKey, threadID)).all()

    // turn messages into a Message[]
    const mappedMessages: Message[] = messages.map(message => ({
      id: message.messageId,
      timestamp: message.timestampMs,
      senderID: message.senderId,
      text: message.text,
    }))
    return {
      items: mappedMessages,
      hasMore: false,
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
      this.api.sendImage(threadID, { fileName, filePath })
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
    const userMessage: Message = {
      id: pendingMessageID,
      timestamp: new Date(),
      text,
      senderID: this.currentUser.id,
      isSender: true,
    }
    this.socket.sendMessage(threadID, text)
    return [userMessage]
  }

  sendActivityIndicator = (threadID: string) => {
    this.socket.sendTypingIndicator(threadID)
  }

  deleteMessage = async (threadID: string, messageID: string, forEveryone?: boolean) => {
    this.logger.info('deleteMessage', { threadID, messageID, forEveryone })
  }

  sendReadReceipt = async (threadID: string, messageID: string, messageCursor?: string) => {
    this.logger.info('sendReadReceipt', { threadID, messageID, messageCursor })
  }

  addReaction = async (threadID: string, messageID: string, reactionKey: string) => {
    this.logger.info('addReaction', { threadID, messageID, reactionKey })
    // this.api.socket?.addReaction?.(threadID, messageID, reactionKey)
  }

  removeReaction = async (threadID: string, messageID: string, reactionKey: string) => {
    this.logger.info('removeReaction', { threadID, messageID, reactionKey })
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
