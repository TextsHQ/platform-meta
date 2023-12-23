import fs from 'fs/promises'
import { setTimeout as sleep } from 'timers/promises'
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
import { and, asc, desc, eq, gte, inArray, lt, lte, SQLWrapper } from 'drizzle-orm'

import path from 'path'
import MetaMessengerAPI from './mm-api'
import MetaMessengerWebSocket, { ThreadRemoveType } from './socket'
import { getLogger, type Logger } from './logger'
import getDB, { type DrizzleDB } from './store/db'
import type { PAPIReturn, SerializedSession } from './types'
import { ParentThreadKey, SyncChannel, SocketRequestResolverType } from './types'
import * as schema from './store/schema'
import { preparedQueries } from './store/queries'
import KeyValueStore from './store/kv'
import EnvOptions, { type EnvKey, type EnvOptionsValue, THREAD_PAGE_SIZE } from './env'
import { getCookieJar, getTimeValues } from './util'
import { STICKERS_DIR_PATH } from './constants'

export default class PlatformMetaMessenger implements PlatformAPI {
  env: EnvKey

  db: DrizzleDB

  private dbClose: () => Promise<void>

  private logger: Logger

  api: MetaMessengerAPI

  kv: KeyValueStore

  socket: MetaMessengerWebSocket

  envOpts: EnvOptionsValue

  constructor(readonly accountID: string, env: EnvKey) {
    this.env = env
    this.envOpts = EnvOptions[env]
    this.logger = getLogger(env)
    this.api = new MetaMessengerAPI(this, env)
    this.kv = new KeyValueStore(this)
    this.socket = new MetaMessengerWebSocket(this)
  }

  onEvent: OnServerEventCallback = events => {
    this.logger.debug(`${this.env} got server event before ready`, JSON.stringify(events, null, 2))
    this.pendingEvents.push(...events)
  }

  private pendingEvents: ServerEvent[] = []

  preparedQueries: ReturnType<typeof preparedQueries>

  init = async (session: SerializedSession, { accountID, dataDirPath }: ClientContext) => {
    if (session && session._v !== 'v3') throw new ReAuthError() // upgrade from android-based session

    await fs.mkdir(dataDirPath, { recursive: true })

    this.logger.info('starting', { dataDirPath, accountID })

    const { db, dbClose } = await getDB(this.env, accountID, dataDirPath)
    this.db = db
    this.dbClose = dbClose
    this.preparedQueries = preparedQueries(this.db)

    this.logger.debug('loading keys', this.kv.getAll())
    if (!session?.jar) return
    const { jar } = session
    this.api.jar = getCookieJar(jar)
    await this.api.init('init')
  }

  dispose = async () => {
    this.logger.info('disposing')
    try {
      this.socket?.dispose?.()
      await this?.dbClose?.()
    } catch (e) {
      this.logger.error(e)
    }
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
    this.api.jar = getCookieJar(cookieJarJSON as any)
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

  searchUsers = async (query: string) => {
    await this.api.initPromise
    const { timestamp } = getTimeValues(this.socket.requestIds)
    const payload = JSON.stringify({
      query,
      supported_types: [1, 3, 4, 2, 6, 7, 8, 9, 14],
      session_id: null,
      surface_type: this.env === 'IG' ? 15 : 1,
      group_id: null,
      community_id: this.env !== 'IG' ? null : undefined,
      thread_id: null,
    })

    const [primary, secondary] = await Promise.all([
      this.socket.publishTask(SocketRequestResolverType.SEARCH_USERS_PRIMARY, [{
        label: '30',
        payload,
        queue_name: `["search_primary", ${JSON.stringify(timestamp.toString())}]`,
        task_id: this.socket.taskIds.gen(),
        failure_count: null,
      }]),
      this.socket.publishTask(SocketRequestResolverType.SEARCH_USERS_SECONDARY, [{
        label: '31',
        payload,
        queue_name: '["search_secondary"]',
        task_id: this.socket.taskIds.gen(),
        failure_count: null,
      }]),
    ])

    return [
      ...(primary?.insertSearchResult ?? []),
      ...(secondary?.insertSearchResult ?? []),
    ].filter(user => user.type === 'user')
  }

  getThreads = async (inbox: ThreadFolderName, pagination?: PaginationArg): PAPIReturn<'getThreads'> => {
    if (inbox !== InboxName.NORMAL && inbox !== InboxName.REQUESTS) throw Error('not implemented')
    await this.api.initPromise
    const isSpam = inbox === InboxName.REQUESTS

    this.logger.info('getThreads', { inbox, pagination, isSpam })

    const { direction = 'before' } = pagination || {}
    const cursorStr = pagination?.cursor
    const [lastActivity] = cursorStr?.split(',') || []

    const directionIsBefore = direction === 'before'
    const order = directionIsBefore ? desc : asc
    const filter = directionIsBefore ? lte : gte

    const parentThreadKeys: ParentThreadKey[] = []
    if (isSpam) {
      parentThreadKeys.push(ParentThreadKey.SPAM)
      if ((this.env === 'IG' && this.api.hasTabbedInbox()) || this.env === 'FB' || this.env === 'MESSENGER') {
        parentThreadKeys.push(ParentThreadKey.GENERAL)
      }
    } else {
      parentThreadKeys.push(ParentThreadKey.PRIMARY)
    }

    const folderFilter = inArray(schema.threads.parentThreadKey, parentThreadKeys)
    const whereArgs: SQLWrapper[] = [folderFilter]

    if (lastActivity) {
      whereArgs.push(filter(schema.threads.lastActivityTimestampMs, new Date(+lastActivity)))
    }

    const where = whereArgs.length > 1 ? and(...whereArgs) : folderFilter

    this.logger.debug('getThreads 3 where', whereArgs.length)
    const items = await this.api.queryThreads(where, {
      orderBy: [order(schema.threads.lastActivityTimestampMs)],
      limit: THREAD_PAGE_SIZE,
    })

    let oldestCursor: string | undefined
    const hasMoreInDatabase = items.length >= THREAD_PAGE_SIZE
    const hasMoreInServer = this.api.computeServerHasMoreThreads(inbox)
    const hasMore = hasMoreInDatabase || hasMoreInServer
    if (hasMoreInDatabase) {
      const lastThread = items.at(-1)
      let stamp = lastThread.extra.lastActivityTimestampMs
      if (!stamp?.toJSON()) stamp = new Date()
      oldestCursor = `${stamp.getTime()},${lastThread.id}`
    } else {
      await (this.env === 'IG'
        ? this.api.fetchMoreThreadsForIG(isSpam, typeof pagination === 'undefined')
        : this.api.fetchMoreThreadsV3(inbox)).catch(e => this.logger.error(e))
    }
    if (hasMore && (!items.length || !oldestCursor)) {
      // todo fix
      console.log('waiting 2s to avoid returning invalid data')
      await sleep(2_000)
      return this.getThreads(inbox, pagination)
    }

    return {
      items,
      hasMore,
      oldestCursor,
    }
  }

  getMessages = async (threadID: string, pagination: PaginationArg): PAPIReturn<'getMessages'> => {
    await this.api.initPromise
    this.logger.debug('getMessages [papi]', {
      threadID,
      pagination,
    })
    const ranges = await this.api.getMessageRanges(threadID)

    const { hasMoreBeforeFlag } = ranges
    if (hasMoreBeforeFlag) {
      try {
        // To handle simultaneous requests for getMessages for the same thread
        // we check whether we already have a promise for this thread
        // If we do, we just wait for it to resolve
        // If we don't, we create a new promise and call fetchMessages
        const promise = this.api.messageRangeResolvers.hasKey(threadID)
          ? this.api.messageRangeResolvers.getByKey(threadID).promise
          : Promise.allSettled([
            this.api.messageRangeResolvers.getOrCreate(threadID).promise,
            this.api.fetchMessages(threadID),
          ])
        await promise
      } catch (e) {
        this.logger.error(e)
      }
    }

    let where = eq(schema.messages.threadKey, threadID)
    const { direction = 'before', cursor } = pagination || {}
    const directionIsBefore = direction === 'before'
    const order = directionIsBefore ? desc : asc
    const filter = directionIsBefore ? lt : gte

    if (cursor) {
      const { primarySortKey } = await this.db.query.messages.findFirst({
        where: and(where, eq(schema.messages.messageId, cursor)),
        orderBy: [desc(schema.messages.primarySortKey)],
        columns: {
          primarySortKey: true,
        },
      }) || { primarySortKey: '0' }

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
      hasMore: hasMoreBeforeFlag,
    }
  }

  getThread = async (threadID: string): PAPIReturn<'getThread'> => {
    await this.api.initPromise
    const t = await this.api.queryThreads([threadID], null)
    return t[0]
  }

  getMessage = async (threadID: ThreadID, messageID: MessageID) => {
    await this.api.initPromise
    const [msg] = await this.api.queryMessages(threadID, [messageID])
    return msg
  }

  getUser = async (ids: { userID?: string } | { username?: string } | { phoneNumber?: string } | { email?: string }) => {
    await this.api.initPromise
    // type check username
    this.logger.debug('getUser', ids)
    if ('userID' in ids && typeof ids.userID === 'string') {
      const a = await this.api.requestContacts([ids.userID])
      this.logger.debug('getUser got user', a)
    }
    const username = 'username' in ids && ids.username
    const user: User = await this.api.getUserByUsername(username)
    this.logger.debug('got user', user)
    return user
  }

  createThread = async (userIDs: string[], title?: string, messageText?: string) => {
    await this.api.initPromise
    this.logger.debug('createThread', {
      userIDs,
      title,
      messageText,
    })
    if (userIDs.length === 1) {
      const [userID] = userIDs
      await this.api.requestThread(userID)
      const { contacts } = await this.api.getOrRequestContactsIfNotExist([userID])
      const user = contacts[0]
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

    const resp = await this.api.createGroupThread(userIDs)
    const { contacts, missing } = await this.api.getOrRequestContactsIfNotExist(userIDs)

    this.logger.debug('createThread', {
      contacts,
      missing,
      resp,
    })
    const { fbid } = this.api.config
    const participants = [
      ...contacts.map(user => ({
        id: user.id,
        fullName: user?.name || user?.username || this.envOpts.defaultContactName,
        imgURL: user.profilePictureUrl,
        username: user.username,
        isSelf: user.id === fbid,
        isAdmin: user.id === fbid,
      })),
      ...missing.map(userID => ({
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
    await this.api.initPromise

    this.logger.debug('updateThread', threadID, updates)
    const promises: Promise<unknown>[] = []

    if ('title' in updates) {
      promises.push(this.socket.publishTask(SocketRequestResolverType.SET_THREAD_NAME, [{
        label: '32',
        payload: JSON.stringify({
          thread_key: threadID,
          thread_name: updates.title,
        }),
        queue_name: threadID.toString(),
        task_id: this.socket.taskIds.gen(),
        failure_count: null,
      }]))
      // listen for the response syncUpdateThreadName
    }

    if ('mutedUntil' in updates) {
      promises.push(this.socket.publishTask(SocketRequestResolverType.MUTE_THREAD, [{
        label: '144',
        payload: JSON.stringify({
          thread_key: Number(threadID),
          mailbox_type: 0, // 0 = inbox
          mute_expire_time_ms: updates.mutedUntil === 'forever' ? -1 : 0,
          sync_group: SyncChannel.MAILBOX,
        }),
        queue_name: threadID.toString(),
        task_id: this.socket.taskIds.gen(),
        failure_count: null,
      }]))
      // listen for the response updateThreadMuteSetting
    }

    if ('folderName' in updates) {
      if (updates.folderName === InboxName.NORMAL) {
        promises.push(this.socket.publishTask(SocketRequestResolverType.MOVE_OUT_OF_MESSAGE_REQUESTS, [{
          label: '66',
          payload: JSON.stringify({
            thread_key: threadID,
            sync_group: SyncChannel.MAILBOX,
            ig_folder: 1,
          }),
          queue_name: 'message_request',
          task_id: this.socket.taskIds.gen(),
          failure_count: null,
        }]))
      }
    }

    await Promise.all(promises)
  }

  archiveThread = async (threadID: ThreadID, archived: boolean) => {
    if (archived) {
      await this.api.removeThread(ThreadRemoveType.ARCHIVE, threadID, SyncChannel.MAILBOX)
    } else {
      if (!this.envOpts.supportsArchive) throw new Error('unarchive thread is not supported in this environment')
      await this.socket.publishTask(SocketRequestResolverType.UNARCHIVE_THREAD, [{
        label: '242',
        payload: JSON.stringify({
          thread_id: threadID,
          sync_group: SyncChannel.MAILBOX,
        }),
        queue_name: 'unarchive_thread',
        task_id: this.socket.taskIds.gen(),
        failure_count: null,
      }])
    }
  }

  deleteThread = async (threadID: string) => {
    await this.api.initPromise
    await this.api.removeThread(ThreadRemoveType.DELETE, threadID, SyncChannel.MAILBOX)
  }

  sendMessage = async (threadID: string, { text, fileBuffer, isRecordedAudio, mimeType, fileName, filePath, mentionedUserIDs, giphyID }: MessageContent, { pendingMessageID, quotedMessageID }: MessageSendOptions) => {
    await this.api.initPromise

    let externalUrl: string
    let attribution_app_id: number
    if (giphyID) {
      externalUrl = `https://media1.giphy.com/media/${giphyID}/giphy.gif`
      attribution_app_id = 406655189415060
    }
    if (!text && filePath) {
      if (fileBuffer || isRecordedAudio) throw Error('not implemented')
      this.logger.debug('sendMessage', filePath)
      const { timestamp, messageId } = await this.api.sendMedia(threadID, { pendingMessageID, quotedMessageID }, { fileName, filePath })
      this.logger.debug('sendMessage got response', {
        timestamp,
        messageId,
      })
      const userMessage: Message = {
        id: messageId || pendingMessageID,
        timestamp,
        senderID: this.api.config.fbid,
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
    const { timestamp, messageId } = await this.api.sendMessage(threadID, { text, mentionedUserIDs }, { pendingMessageID, quotedMessageID }, [], externalUrl, attribution_app_id)
    return [{
      id: messageId,
      timestamp,
      text,
      linkedMessageID: quotedMessageID,
      senderID: this.api.config.fbid,
      isSender: true,
    }]
  }

  sendActivityIndicator = async (type: ActivityType, threadID: string) => {
    await this.api.initPromise
    this.logger.debug('sendActivityIndicator', threadID, type)
    if (![ActivityType.TYPING, ActivityType.NONE].includes(type)) return
    this.logger.debug(`sending typing indicator ${threadID}`)
    await this.socket.publishLightspeedRequest({
      payload: JSON.stringify({
        label: '3',
        payload: JSON.stringify({
          thread_key: threadID,
          is_group_thread: 0,
          is_typing: type === ActivityType.TYPING ? 1 : 0,
          attribution: 0,
        }),
        version: '6243569662359088',
      }),
      request_id: this.socket.requestIds.gen(),
      type: 4,
    })
  }

  deleteMessage = async (_threadID: string, messageID: string, _forEveryone?: boolean) => {
    await this.api.initPromise
    await this.socket.publishTask(SocketRequestResolverType.UNSEND_MESSAGE, [{
      label: '33',
      payload: JSON.stringify({
        message_id: messageID,
      }),
      queue_name: 'unsend_message',
      task_id: this.socket.taskIds.gen(),
      failure_count: null,
    }])
  }

  sendReadReceipt = async (threadID: string, _messageID: string, _messageCursor?: string) => {
    await this.api.initPromise
    await this.socket.publishTask(SocketRequestResolverType.SEND_READ_RECEIPT, [{
      label: '21',
      payload: JSON.stringify({
        thread_id: threadID,
        last_read_watermark_ts: Date.now(),
        sync_group: SyncChannel.MAILBOX,
      }),
      queue_name: threadID,
      task_id: this.socket.taskIds.gen(),
      failure_count: null,
    }])
  }

  addReaction = (threadID: string, messageID: string, reactionKey: string) => this.api.initPromise.then(() => this.api.mutateReaction(threadID, messageID, reactionKey))

  removeReaction = (threadID: string, messageID: string, _reactionKey: string) => this.api.initPromise.then(() => this.api.mutateReaction(threadID, messageID, ''))

  addParticipant = async (threadID: string, participantID: string) => {
    await this.api.initPromise
    await this.socket.publishTask(SocketRequestResolverType.ADD_PARTICIPANTS, [{
      label: '23',
      payload: JSON.stringify({
        thread_key: threadID,
        contact_ids: [participantID],
        sync_group: SyncChannel.MAILBOX,
      }),
      queue_name: threadID.toString(),
      task_id: this.socket.taskIds.gen(),
      failure_count: null,
    }])
    // listen for the response addParticipantIdToGroupThread
  }

  // reconnectRealtime = async () => {
  // await this.socket.reconnect()
  // }

  removeParticipant = async (threadID: string, participantID: string) => {
    await this.api.initPromise
    await this.socket.publishTask(SocketRequestResolverType.REMOVE_PARTICIPANT, [{
      label: '140',
      payload: JSON.stringify({
        thread_id: threadID,
        contact_id: participantID,
      }),
      queue_name: 'remove_participant_v2',
      task_id: this.socket.taskIds.gen(),
      failure_count: null,
    }])
    // listen for the response removeParticipantFromThread
  }

  changeParticipantRole = async (threadID: string, participantID: string, role: 'admin' | 'regular') => {
    await this.api.initPromise
    await this.socket.publishTask(SocketRequestResolverType.SET_ADMIN_STATUS, [{
      label: '25',
      payload: JSON.stringify({
        thread_key: threadID,
        contact_id: participantID,
        is_admin: role === 'admin' ? 1 : 0,
      }),
      queue_name: 'admin_status',
      task_id: this.socket.taskIds.gen(),
      failure_count: null,
    }])
    // listen for the response updateThreadParticipantAdminStatus
  }

  getOriginalObject = async (objName: 'thread' | 'message', objectID: ThreadID | MessageID) => {
    await this.api.initPromise
    if (objName === 'thread') {
      const thread = await this.db.query.threads.findFirst({
        where: eq(schema.threads.threadKey, objectID),
        columns: {
          threadKey: true,
          thread: true,
          lastActivityTimestampMs: true,
          parentThreadKey: true,
        },
        with: {
          participants: {
            with: {
              contacts: true,
            },
          },
        },
      })
      if (!thread) throw Error('thread not found')
      return JSON.stringify({
        ...thread,
        thread: JSON.parse(thread.thread),
        // raw: JSON.parse(thread.raw),
      }, null, 2)
    }
    if (objName === 'message') {
      const message = await this.db.query.messages.findFirst({
        where: eq(schema.messages.messageId, objectID),
        with: {
          attachments: true,
          reactions: true,
          thread: {
            with: {
              participants: {
                with: {
                  contacts: true,
                },
              },
            },
          },
        },
      })
      if (!message) throw Error('message not found')
      return JSON.stringify({
        ...message,
        message: JSON.parse(message.message),
        attachments: message.attachments?.map(a => ({
          ...a,
          attachment: JSON.parse(a.attachment),
        })),
      }, null, 2)
    }
  }

  forwardMessage = async (_threadID: ThreadID, forwarded_msg_id: MessageID, threadIDs: ThreadID[]) => {
    await this.api.initPromise

    await Promise.all(threadIDs.map(async thread_id => {
      if (!thread_id) throw new Error('thread_id is required')
      if (!forwarded_msg_id || !forwarded_msg_id.startsWith('mid.')) throw new Error('forwarded_msg_id is required')

      const { otid } = getTimeValues(this.socket.requestIds)
      await this.socket.publishTask(SocketRequestResolverType.FORWARD_MESSAGE, [{
        label: '46',
        payload: JSON.stringify({
          thread_id,
          otid: otid.toString(),
          source: (2 ** 16) + 8,
          send_type: 5,
          sync_group: SyncChannel.MAILBOX,
          forwarded_msg_id,
          strip_forwarded_msg_caption: 0,
          initiating_source: 1,
        }),
        queue_name: thread_id,
        task_id: this.socket.taskIds.gen(),
        failure_count: null,
      }])
    }))
  }

  registerForPushNotifications = async (type: keyof NotificationsInfo, token: string) => {
    await this.api.initPromise
    if (type !== 'web') throw Error('invalid type')
    const parsed = JSON.parse(token)
    await this.api.webPushRegister(parsed.endpoint, parsed.keys.p256dh, parsed.keys.auth)
  }

  getAsset = async (_: any, assetType: string, attachmentType: string, ...args: string[]) => {
    await this.api.initPromise
    this.logger.debug('getAsset', assetType, attachmentType, args)

    if (assetType === 'attachment' && attachmentType === 'ig_reel') {
      const [mediaId, reelId, username] = args
      const reel = await this.api.getIGReels(mediaId, reelId, username)
      return reel.url
    }

    if (assetType === 'sticker') {
      const [,, filename] = args
      const filePath = path.join(STICKERS_DIR_PATH, filename)
      return url.pathToFileURL(filePath).href
    }

    throw Error('not implemented')
  }
}
