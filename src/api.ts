import { texts } from '@textshq/platform-sdk'
import type { ActivityType, Awaitable, ClientContext, CurrentUser, CustomEmojiMap, FetchInfo, LoginCreds, LoginResult, Message, MessageContent, MessageLink, MessageSendOptions, OnConnStateChangeCallback, OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap, SearchMessageOptions, SerializedSession, Thread, User } from '@textshq/platform-sdk'
import type { Readable } from 'stream'
import type PlatformInfo from './info'
import InstagramAPI from './ig-api'
import { CookieJar } from 'tough-cookie'
import { mapMessage, mapThread } from './mapper'
import InstagramWebSocket from './ig-socket'

export default class PlatformInstagram implements PlatformAPI {

  private loginEventCallback: (data: any) => void
  api = new InstagramAPI(this)
  onEvent: OnServerEventCallback

  constructor(readonly accountID: string) {}

  init = async (session: SerializedSession, _: ClientContext) => {
    if (!session) return
    const { jar, ua, authMethod } = session
    this.api.jar = CookieJar.fromJSON(jar)
    this.api.ua = ua
    this.api.authMethod = authMethod
    await this.api.init()
  }

  dispose = () => {}

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
    return { type: 'success' }
  }

  logout = async () => {
    // @TODO: logout
  }

  serializeSession = () => ({
    jar: this.api.jar.toJSON(),
    ua: this.api.ua,
    authMethod: this.api.authMethod ?? 'login-window',
  })

  subscribeToEvents = async (onEvent: OnServerEventCallback) => {
    this.onEvent = (data) => {
      onEvent(data)
      texts.log('instagram got server event', JSON.stringify(data, null, 2))
    }
    this.api.socket = new InstagramWebSocket(this);
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

  getThreads = async (folderName: string, pagination?: PaginationArg) => {
    const cursorResult = await this.api.getCursor()
    texts.log('instagram got cursor', JSON.stringify(cursorResult, null, 2))

    const items = cursorResult?.newConversations.map((thread) => mapThread(thread))
    return { items, hasMore: false }
  }

  getMessages = async (threadID: string, pagination: PaginationArg): Promise<Paginated<Message>> => {
    const items = []
    this.api.debug_messagesCache.forEach((message) => {
      if (message.threadId === threadID) {
        items.push(mapMessage(this.api.session.fbid, message))
      }
    })
    this.api.socket.getMessages(threadID)
    return {
      items,
      hasMore: false,
    }
  }

  getThreadParticipants?: (threadID: string, pagination?: PaginationArg) => Awaitable<Paginated<Participant>>

  getThread?: (threadID: string) => Awaitable<Thread>

  getMessage?: (messageID: string) => Awaitable<Message>

  getUser = async (ids: { userID?: string } | { username?: string } | { phoneNumber?: string } | { email?: string }) => {
    // type check username
    const username = 'username' in ids && ids.username
    const user: User = await this.api.getUserByUsername(username)
    texts.log('instagram got user', user)
    return user
  }

  createThread: (userIDs: string[], title?: string, messageText?: string) => Awaitable<boolean | Thread>

  updateThread?: (threadID: string, updates: Partial<Thread>) => Awaitable<void>

  deleteThread?: (threadID: string) => Awaitable<void>

  reportThread?: (type: 'spam', threadID: string, firstMessageID?: string) => Awaitable<boolean>

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

  editMessage?: (threadID: string, messageID: string, content: MessageContent, options?: MessageSendOptions) => Promise<boolean | Message[]>

  forwardMessage?: (threadID: string, messageID: string, threadIDs?: string[], userIDs?: string[]) => Promise<void>

  sendActivityIndicator = (threadID: string) => {
    this.api.socket.sendTypingIndicator(threadID)
  }

  deleteMessage?: (threadID: string, messageID: string, forEveryone?: boolean) => Awaitable<void>

  sendReadReceipt: (threadID: string, messageID: string, messageCursor?: string) => Awaitable<void>

  addReaction?: (threadID: string, messageID: string, reactionKey: string) => Awaitable<void>

  removeReaction?: (threadID: string, messageID: string, reactionKey: string) => Awaitable<void>

  getLinkPreview?: (link: string) => Awaitable<MessageLink>

  addParticipant?: (threadID: string, participantID: string) => Awaitable<void>

  removeParticipant?: (threadID: string, participantID: string) => Awaitable<void>

  changeParticipantRole?: (threadID: string, participantID: string, role: string) => Awaitable<void>

  changeThreadImage?: (threadID: string, imageBuffer: Buffer, mimeType: string) => Awaitable<void>

  markAsUnread?: (threadID: string, messageID?: string) => Awaitable<void>

  archiveThread?: (threadID: string, archived: boolean) => Awaitable<void>

  pinThread?: (threadID: string, pinned: boolean) => Awaitable<void>

  notifyAnyway?: (threadID: string) => Awaitable<void>

  onThreadSelected?: (threadID: string) => Awaitable<void>

  loadDynamicMessage?: (message: Message) => Awaitable<Partial<Message>>

  getAsset?: (_, ...args: string[]) => Awaitable<string | Buffer | FetchInfo | Readable>

  getOriginalObject?: (objName: 'thread' | 'message', objectID: string) => Awaitable<string>

  handleDeepLink?: (link: string) => void

  onResumeFromSleep?: () => void
}
