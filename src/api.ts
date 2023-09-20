import fs from 'fs/promises'
import url from 'url'
import type {
  ClientContext,
  CurrentUser,
  LoginCreds,
  LoginResult,
  Message,
  MessageContent,
  MessageID,
  MessageSendOptions,
  NotificationsInfo,
  OnServerEventCallback,
  PaginationArg,
  Participant,
  PlatformAPI,
  ServerEvent,
  Thread,
  ThreadFolderName,
  ThreadID,
  User,
} from '@textshq/platform-sdk'
import { ActivityType, AttachmentType, InboxName, ReAuthError } from '@textshq/platform-sdk'
import { and, asc, desc, eq, gte, inArray, lte, SQLWrapper } from 'drizzle-orm'
import { CookieJar } from 'tough-cookie'

import MetaMessengerAPI from './mm-api'
import MetaMessengerWebSocket from './socket'
import { getLogger, type Logger } from './logger'
import getDB, { type DrizzleDB } from './store/db'
import type { PAPIReturn, SerializedSession } from './types'
import { ParentThreadKey } from './types'
import * as schema from './store/schema'
import { preparedQueries } from './store/queries'
import KeyValueStore from './store/kv'
import { PromiseQueue } from './p-queue'
import EnvOptions, { type EnvKey, type EnvOptionsValue, THREAD_PAGE_SIZE } from './env'
import { toSqliteFormattedDateTimeString } from './util'

export default class PlatformMetaMessenger implements PlatformAPI {
  env: EnvKey

  db: DrizzleDB

  logger: Logger

  api: MetaMessengerAPI

  kv: KeyValueStore

  pQueue: PromiseQueue

  socket: MetaMessengerWebSocket

  envOpts: EnvOptionsValue

  private loadedThreadSet = new Set<string>()

  private earliestLoadedThreadCursor?: string

  constructor(readonly accountID: string, env: EnvKey) {
    this.env = env
    this.envOpts = EnvOptions[env]
    this.logger = getLogger(env)
    this.api = new MetaMessengerAPI(this, env)
    this.kv = new KeyValueStore(this)
    this.pQueue = new PromiseQueue(env)
    this.socket = new MetaMessengerWebSocket(this)
  }

  onEvent: OnServerEventCallback = events => {
    this.logger.debug(`${this.env} got server event before ready`, JSON.stringify(events, null, 2))
    this.pendingEvents.push(...events)
  }

  pendingEvents: ServerEvent[] = []

  preparedQueries: ReturnType<typeof preparedQueries>

  init = async (session: SerializedSession, { accountID, dataDirPath }: ClientContext) => {
    if (session && session._v !== 'v3') throw new ReAuthError() // upgrade from android-based session

    await fs.mkdir(dataDirPath, { recursive: true })

    this.logger.info('starting', { dataDirPath, accountID })

    this.db = await getDB(this.env, accountID, dataDirPath)
    this.preparedQueries = preparedQueries(this.db)

    this.logger.debug('loading keys', this.kv.getAll())
    if (!session?.jar) return
    const { jar } = session
    this.api.jar = CookieJar.fromJSON(jar as unknown as string)
    await this.api.init('init')
  }

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
    await this.api.init('login')
    return { type: 'success' }
  }

  logout = () => this.api.logout()

  serializeSession = (): SerializedSession => ({
    _v: 'v3',
    jar: this.api.jar.toJSON(),
    ua: this.api.ua,
    authMethod: this.api.authMethod ?? 'login-window',
  })

  subscribeToEvents = async (onEvent: OnServerEventCallback) => {
    if (this.pendingEvents.length > 0) {
      onEvent(this.pendingEvents)
      this.pendingEvents = []
    }

    this.onEvent = onEvent
  }

  searchUsers = (typed: string) => this.socket.searchUsers(typed)

  getThreads = async (_folderName: ThreadFolderName, pagination?: PaginationArg): PAPIReturn<'getThreads'> => {
    await this.api.initPromise
    const folderName = _folderName === InboxName.REQUESTS ? InboxName.REQUESTS : InboxName.NORMAL
    const isSpam = folderName === InboxName.REQUESTS

    this.logger.debug('getThreads', { folderName, _folderName, pagination, isSpam })

    const result = await (this.env === 'IG' ? this.api.fetchMoreThreads(isSpam, typeof pagination === 'undefined') : this.socket.fetchMoreThreadsV3(isSpam ? 'requests' : 'inbox'))

    this.logger.debug('getThreads', { folderName, _folderName, pagination, isSpam }, { result })

    const { direction = 'before' } = pagination || {}
    const cursor = (() => {
      const cursorStr = pagination?.cursor
      if (cursorStr) {
        const [lastActivity, threadKey] = cursorStr.split(',')
        return [lastActivity, threadKey] as const
      }
    })()

    const directionIsBefore = direction === 'before'
    const order = directionIsBefore ? desc : asc
    const filter = directionIsBefore ? lte : gte

    const parentThreadKeys: ParentThreadKey[] = []
    if (isSpam) {
      parentThreadKeys.push(ParentThreadKey.SPAM)
      if ((this.env === 'IG' && this.kv.get('hasTabbedInbox')) || this.env === 'FB' || this.env === 'MESSENGER') {
        parentThreadKeys.push(ParentThreadKey.GENERAL)
      }
    } else {
      parentThreadKeys.push(ParentThreadKey.PRIMARY)
    }

    const folderFilter = inArray(schema.threads.parentThreadKey, parentThreadKeys)
    const whereArgs: SQLWrapper[] = [folderFilter]

    if (cursor?.[0] && cursor[0] !== '0') {
      whereArgs.push(filter(schema.threads.lastActivityTimestampMs, new Date(cursor?.[0])))
    }

    const where = whereArgs.length > 1 ? and(...whereArgs) : folderFilter

    this.logger.debug('getThreads 3 where', whereArgs.length)
    const items = await this.api.queryThreads(where, {
      orderBy: [order(schema.threads.lastActivityTimestampMs)],
      limit: THREAD_PAGE_SIZE,
    })

    const lastThread = items[items.length - 1]

    let oldestCursor: string | undefined
    if (items.length >= THREAD_PAGE_SIZE) {
      let stamp = lastThread.extra.lastActivityTimestampMs
      if (!stamp?.toJSON()) {
        stamp = new Date()
      }
      oldestCursor = `${toSqliteFormattedDateTimeString(stamp)},${lastThread.id}`
    }

    const hasMoreInDatabase = items.length >= THREAD_PAGE_SIZE
    const hasMoreInServer = isSpam ? this.api.computeHasMoreSpamThreads() : this.api.computeHasMoreThreads()
    const hasMore = hasMoreInDatabase || hasMoreInServer
    const oCursor = oldestCursor || (hasMore ? '0,0' : undefined)
    return {
      items,
      hasMore,
      oldestCursor: oCursor,
    }
  }

  getMessages = async (threadID: string, pagination: PaginationArg): PAPIReturn<'getMessages'> => {
    const ranges = await this.api.getMessageRanges(threadID)
    this.logger.debug('getMessages [papi]', {
      threadID,
      pagination,
      ranges,
    })

    await this.socket.fetchMessages(threadID, ranges)

    let hasMore = typeof ranges?.hasMoreBeforeFlag === 'boolean' ? ranges.hasMoreBeforeFlag : true
    try {
      await this.socket.waitForMessageRange(threadID)
      const _ranges = await this.api.getMessageRanges(threadID)
      if (typeof _ranges?.hasMoreBeforeFlag !== 'undefined') {
        hasMore = _ranges.hasMoreBeforeFlag // refetch ranges from db
      }
    } catch (e) {
      this.logger.error(e)
      hasMore = true
    }

    let where = eq(schema.messages.threadKey, threadID)
    const { primarySortKey } = await this.db.query.messages.findFirst({
      where,
      orderBy: [desc(schema.messages.primarySortKey)],
      columns: {
        primarySortKey: true,
      },
    }) || { primarySortKey: '0' }

    const { direction = 'before', cursor } = pagination || {}
    const directionIsBefore = direction === 'before'
    const order = directionIsBefore ? desc : asc
    const filter = directionIsBefore ? lte : gte

    if (cursor) {
      where = and(
        where,
        filter(schema.messages.primarySortKey, primarySortKey),
      )
    }
    const items = await this.api.queryMessages(threadID, where, {
      orderBy: [order(schema.messages.primarySortKey)],
      // limit: 20,
    })
    return {
      items,
      hasMore,
    }
  }

  getThread = async (threadID: string): PAPIReturn<'getThread'> => {
    const t = await this.api.queryThreads([threadID], null)
    return t[0]
  }

  getMessage = async (threadID: ThreadID, messageID: MessageID) => {
    const [msg] = await this.api.queryMessages(threadID, [messageID])
    return msg
  }

  getUser = async (ids: { userID?: string } | { username?: string } | { phoneNumber?: string } | { email?: string }) => {
    // type check username
    this.logger.debug('getUser', ids)
    if ('userID' in ids && typeof ids.userID === 'string') {
      const a = await this.socket.requestContacts([ids.userID])
      this.logger.debug('getUser got user', a)
    }
    const username = 'username' in ids && ids.username
    const user: User = await this.api.getUserByUsername(username)
    this.logger.debug('got user', user)
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
      await this.socket.getThread(userID)
      const user = this.api.getContact(userID)

      const participants: Participant[] = [{
        id: userID,
        fullName: user?.name || user?.username || this.envOpts.defaultContactName,
        imgURL: user?.profilePictureUrl,
        username: user?.username,
      }]
      return {
        id: userID,
        title: user?.name,
        imgURL: user?.profilePictureUrl,
        isUnread: false,
        isReadOnly: false,
        messages: {
          items: [] as Message[],
          hasMore: false,
        },
        participants: {
          items: participants,
          hasMore: false,
        },
        timestamp: new Date(),
        type: 'single' as const,
      } as const
    }

    const resp = await this.socket.createGroupThread(userIDs)
    const users = await this.api.getContacts(userIDs)
    /// compare with userIDs to see if all users were found
    const missingUserIDs = userIDs.filter(id => !users.find(u => u.id === id))
    await this.socket.requestContacts(missingUserIDs)

    this.logger.debug('createThread', {
      users,
      missingUserIDs,
      resp,
    })
    const fbid = this.kv.get('fbid')
    const participants = [
      ...users.map(user => ({
        id: user.id,
        fullName: user?.name || user?.username || this.envOpts.defaultContactName,
        imgURL: user.profilePictureUrl,
        username: user.username,
        isSelf: user.id === fbid,
        isAdmin: user.id === fbid,
      })),
      ...missingUserIDs.map(userID => ({
        id: userID,
        isSelf: userID === fbid,
        isAdmin: userID === fbid,
        // fullName: null,
        // imgURL: null,
        // username: null,
      })),
    ].filter(Boolean)

    return {
      id: resp.threadId,
      // title: null,
      // imgURL: null,
      isUnread: false,
      isReadOnly: false,
      messages: {
        items: [] as Message[],
        hasMore: false,
      },
      participants: {
        items: participants,
        hasMore: false,
      },
      timestamp: new Date(resp.now),
      type: 'group' as const,
    } as const
  }

  updateThread = async (threadID: string, updates: Partial<Thread>) => {
    this.logger.debug('updateThread', threadID, updates)
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

  deleteThread = async (threadID: string) => {
    await this.socket.deleteThread(threadID)
  }

  sendMessage = async (threadID: string, { text, fileBuffer, isRecordedAudio, mimeType, fileName, filePath }: MessageContent, { pendingMessageID, quotedMessageID }: MessageSendOptions) => {
    if (!text) {
      if (fileBuffer || isRecordedAudio || !filePath) throw Error('not implemented')
      this.logger.debug('sendMessage', filePath)
      const { timestamp, messageId } = await this.api.sendMedia(threadID, { pendingMessageID, quotedMessageID }, { fileName, filePath })
      this.logger.debug('sendMessage got response', {
        timestamp,
        messageId,
      })
      const userMessage: Message = {
        id: messageId || pendingMessageID,
        timestamp,
        senderID: this.kv.get('fbid'),
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
      id: messageId,
      timestamp,
      text,
      linkedMessageID: quotedMessageID,
      senderID: this.kv.get('fbid'),
      isSender: true,
    }]
  }

  sendActivityIndicator = (type: ActivityType, threadID: string) => {
    this.logger.debug('sendActivityIndicator', threadID, type)
    if (![ActivityType.TYPING, ActivityType.NONE].includes(type)) return
    return this.socket.sendTypingIndicator(threadID, type === ActivityType.TYPING)
  }

  deleteMessage = (threadID: string, messageID: string, _forEveryone?: boolean) => this.socket.unsendMessage(messageID)

  sendReadReceipt = (threadID: string, _messageID: string, _messageCursor?: string) => this.socket.sendReadReceipt(threadID, Date.now())

  addReaction = (threadID: string, messageID: string, reactionKey: string) => this.socket.addReaction(threadID, messageID, reactionKey)

  removeReaction = (threadID: string, messageID: string, _reactionKey: string) => this.socket.addReaction(threadID, messageID, '')

  addParticipant = (threadID: string, participantID: string) => this.socket.addParticipants(threadID, [participantID])

  removeParticipant = (threadID: string, participantID: string) => this.socket.removeParticipant(threadID, participantID)

  changeParticipantRole = (threadID: string, participantID: string, role: 'admin' | 'regular') => this.socket.changeAdminStatus(threadID, participantID, role === 'admin')

  getOriginalObject = async (objName: 'thread' | 'message', objectID: ThreadID | MessageID) => {
    if (objName === 'thread') {
      const thread = await this.db.query.threads.findFirst({
        where: eq(schema.threads.threadKey, objectID),
        columns: {
          threadKey: true,
          thread: true,
          lastActivityTimestampMs: true,
          parentThreadKey: true,
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
                  igContact: true,
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
      const message = await this.db.query.messages.findFirst({
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

  registerForPushNotifications = async (type: keyof NotificationsInfo, token: string) => {
    if (type !== 'web') throw Error('invalid type')
    const parsed: PushSubscriptionJSON = JSON.parse(token)
    await this.api.webPushRegister(parsed.endpoint, parsed.keys.p256dh, parsed.keys.auth)
  }

  getAsset = async (_: any, assetType: string, attachmentType: string, ...args: string[]) => {
    this.logger.debug('getAsset', assetType, attachmentType, args)
    if (assetType !== 'attachment' || attachmentType !== 'ig_reel') {
      throw Error('not implemented')
    }
    const [mediaId, reelId, username] = args
    const reel = await this.api.getIGReels(mediaId, reelId, username)
    return reel.url
  }
}
