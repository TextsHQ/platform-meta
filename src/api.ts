import { ActivityType, Awaitable, ClientContext, CurrentUser, CustomEmojiMap, FetchInfo, LoginCreds, LoginResult, Message, MessageContent, MessageLink, MessageSendOptions, OnConnStateChangeCallback, OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap, SearchMessageOptions, SerializedSession, texts, Thread, User } from '@textshq/platform-sdk'
import type { Readable } from 'stream'
import type PlatformInfo from './info'
import InstagramAPI from './ig-api'
import { CookieJar } from 'tough-cookie'

export default class PlatformInstagram implements PlatformAPI {
  // private accountInfo: AccountInfo

  private loginEventCallback: (data: any) => void
  private api = new InstagramAPI(this)
  private pushEvent: OnServerEventCallback

  // init = async (session: SerializedSession, _: ClientContext, prefs: Record<keyof typeof PlatformInfo['prefs'], string | boolean>) => {
  //   this.accountInfo = accountInfo
  // }

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

  // getCurrentUser = async (): Promise<CurrentUser> => {
  //   texts.log(`instagram getting current user ${this.api.viewerConfig}`)
  //   const user = this.api.viewerConfig
  //   if (!user) throw new Error('User not found')
  //   return {
  //     id: user.id,
  //     fullName: user.full_name,
  //     imgURL: user.profile_pic_url,
  //     username: user.username,
  //   }
  // }

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

  subscribeToEvents = (onEvent: OnServerEventCallback) => {
    this.pushEvent = onEvent
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

  // getThreads: (folderName: string, pagination?: PaginationArg) => Awaitable<Paginated<Thread>>

  getThreads = async (folderName: string, pagination?: PaginationArg) => {
    const conversations = await this.api.fetchInitialConversations()
    texts.log('instagram got conversations', JSON.stringify(conversations, null, 2))

    const items: Thread[] = conversations?.newConversations.map((thread) => ({
      _original: JSON.stringify(thread),
      id: thread.threadId,
      // folderName: thread.pending ? 'requests' : 'normal',
      isUnread: thread.unread,
      isReadOnly: false,
      type: 'single',
      title: thread.groupName,
      messages: {
        items: [],
        hasMore: false,
        oldestCursor: '',
        newestCursor: ''
      },
      timestamp: new Date(Number(thread.lastSentTime)),
      participants: {
        items: thread?.participants?.map((participant) => ({
          id: participant.userId,
          username: participant.username,
          fullName: participant.name,
        })),
        hasMore: false,
        oldestCursor: '',
        newestCursor: ''
      },
      lastReadMessageID: thread?.lastMessageDetails?.messageId,
      partialLastMessage: {
        id: thread?.lastMessageDetails?.messageId,
        senderID: thread?.lastMessageDetails?.authorId,
        text: thread?.lastMessageDetails?.message,
      }
    }))

    return { items, hasMore: false }
  }

  getMessages: (threadID: string, pagination?: PaginationArg) => Awaitable<Paginated<Message>>

  getThreadParticipants?: (threadID: string, pagination?: PaginationArg) => Awaitable<Paginated<Participant>>

  getThread?: (threadID: string) => Awaitable<Thread>

  getMessage?: (messageID: string) => Awaitable<Message>

  // getUser?: (ids: { userID?: string } | { username?: string } | { phoneNumber?: string } | { email?: string }) => Awaitable<User>

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

  sendMessage?: (threadID: string, content: MessageContent, options?: MessageSendOptions) => Promise<boolean | Message[]>

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
