import { ActivityType, Awaitable, ClientContext, CurrentUser, CustomEmojiMap, FetchInfo, LoginCreds, LoginResult, Message, MessageContent, MessageLink, MessageSendOptions, OnConnStateChangeCallback, OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap, SearchMessageOptions, SerializedSession, texts, Thread, User } from '@textshq/platform-sdk'
import type { Readable } from 'stream'
import type PlatformInfo from './info'
import InstagramAPI from './ig-api'

export default class PlatformInstagram implements PlatformAPI {
  // private accountInfo: AccountInfo

  private loginEventCallback: (data: any) => void
  private api = new InstagramAPI(this)

  // init = async (session: SerializedSession, _: ClientContext, prefs: Record<keyof typeof PlatformInfo['prefs'], string | boolean>) => {
  //   this.accountInfo = accountInfo
  // }

  init = async (session: SerializedSession) => {
    if (!session) return
    this.api.init()
  }

  dispose: () => Awaitable<void>

  getCurrentUser: () => Awaitable<CurrentUser>

  login: (creds?: LoginCreds) => Promise<LoginResult>

  logout?: () => Awaitable<void>

  serializeSession = () => ({
    jar: this.api.jar.toJSON(),
    ua: this.api.ua,
    authMethod: this.api.authMethod ?? 'login-window',
  })
  subscribeToEvents: (onEvent: OnServerEventCallback) => Awaitable<void>

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

  getThreads: (folderName: string, pagination?: PaginationArg) => Awaitable<Paginated<Thread>>

  getMessages: (threadID: string, pagination?: PaginationArg) => Awaitable<Paginated<Message>>

  getThreadParticipants?: (threadID: string, pagination?: PaginationArg) => Awaitable<Paginated<Participant>>

  getThread?: (threadID: string) => Awaitable<Thread>

  getMessage?: (messageID: string) => Awaitable<Message>

  getUser?: (ids: { userID?: string } | { username?: string } | { phoneNumber?: string } | { email?: string }) => Awaitable<User>

  createThread: (userIDs: string[], title?: string, messageText?: string) => Awaitable<boolean | Thread>

  updateThread?: (threadID: string, updates: Partial<Thread>) => Awaitable<void>

  deleteThread?: (threadID: string) => Awaitable<void>

  reportThread?: (type: 'spam', threadID: string, firstMessageID?: string) => Awaitable<boolean>

  sendMessage?: (threadID: string, content: MessageContent, options?: MessageSendOptions) => Promise<boolean | Message[]>

  editMessage?: (threadID: string, messageID: string, content: MessageContent, options?: MessageSendOptions) => Promise<boolean | Message[]>

  forwardMessage?: (threadID: string, messageID: string, threadIDs?: string[], userIDs?: string[]) => Promise<void>

  sendActivityIndicator: (type: ActivityType, threadID?: string) => Awaitable<void>

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
