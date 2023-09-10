import { type ServerEvent, ServerEventType, UNKNOWN_DATE } from '@textshq/platform-sdk'
import { and, eq } from 'drizzle-orm'
import { pick } from 'lodash'
import type PlatformMetaMessenger from './api'
import * as schema from './store/schema'
import { getLogger } from './logger'
import { CallList, generateCallList, type IGSocketPayload, type SimpleArgType } from './payload-parser'
import { fixEmoji, getAsDate, getAsMS, getOriginalURL } from './util'
import { type IGAttachment, type IGMessage, type IGReadReceipt, IGThread, ParentThreadKey, SyncGroup } from './types'
import { mapParticipants } from './mappers'
import { PromiseQueue } from './p-queue'
import { QueryWhereSpecial } from './store/helpers'
import { MetaMessengerError } from './errors'

type SearchArgumentType = 'user' | 'group' | 'unknown_user'

export interface MetaMessengerPayloadHandlerResponse {
  replaceOptimsiticMessage?: {
    offlineThreadingId: string
    messageId: string
  }
  replaceOptimisticThread?: {
    offlineThreadingId: string
    threadId: string
  }
  insertSearchResult?: {
    id: string
    type: SearchArgumentType
    fullName: string
    imgURL: string
    username: string
  }[]
}

export default class MetaMessengerPayloadHandler {
  private readonly __calls: CallList

  private readonly __logger: ReturnType<typeof getLogger>

  private readonly __pQueue: PromiseQueue

  constructor(
    private readonly __papi: PlatformMetaMessenger,
    private readonly __data: IGSocketPayload,
    private readonly __requestId: number | 'initial' | 'snapshot',
  ) {
    this.__logger = getLogger(this.__papi.env, `payload:${this.__requestId}:${Date.now()}`)
    this.__calls = generateCallList(this.__papi.env, __data)
    this.__pQueue = new PromiseQueue(this.__papi.env)
  }

  async __handle() {
    const [requestType, resolve, reject] = (
      this.__requestId !== null
      && this.__requestId !== 'initial'
      && this.__requestId !== 'snapshot'
      && this.__papi.socket.requestResolvers?.has(this.__requestId)
    ) ? this.__papi.socket.requestResolvers.get(this.__requestId) : ([undefined, undefined] as const)

    await this.__run()

    const hasErrors = this.__errors.length > 0

    if (hasErrors) {
      if (requestType) {
        reject(this.__errors[0])
      }

      const errorEvents: ServerEvent[] = []

      this.__errors.forEach((err, i) => {
        this.__logger.error(err)
        if ((requestType && i === 0) || err?.isToastDisabled) return
        errorEvents.push({
          type: ServerEventType.TOAST,
          toast: {
            text: err?.getPublicMessage?.() || err?.toString?.() || `Unknown error: ${JSON.stringify(err)}`,
          },
        })
      })

      this.__papi.onEvent(errorEvents)
    }

    if (this.__requestId !== 'initial' && this.__requestId !== 'snapshot') await this.__sync()

    // wait for everything to be synced before resolving
    if (requestType && !hasErrors) {
      this.__logger.debug(`resolved request for type ${requestType}`, this.__responses)
      resolve(this.__responses)
    }
  }

  private __afterCallbacks: (() => Promise<void> | void)[] = []

  private __threadsToSync = new Set<string>()

  private __messagesToSync = new Set<string>()

  private __messagesToIgnore = new Set<string>()

  private __responses: MetaMessengerPayloadHandlerResponse = {}

  private __errors: MetaMessengerError[] = []

  private __events: ServerEvent[] = []

  private __run = async () => {
    this.__logger.debug('loaded calls', { calls: this.__calls })
    for (const [method, args] of this.__calls) {
      if (method.startsWith('__')) {
        // we assume meta doesn't send any methods that start with __
        // this is to prevent any potential security issues
        // better way to handle this is prefixing the handlers or putting them in another class
        // but this is a quick "fix" that should work
        throw new MetaMessengerError(this.__papi.env, -1, `called a reserved method (${method})`)
      }

      const isValidMethod = method in this && typeof this[method] === 'function'
      if (!isValidMethod) {
        this.__logger.debug(`missing handler (${method})`, args)
        this.__errors.push(new MetaMessengerError(this.__papi.env, -1, `missing handler (${method})`, undefined, undefined, true))
        continue
      }

      try {
        this.__logger.debug(`calling method ${method}`, { args })
        const call = this[method].bind(this)

        const result = await call(args)

        if (typeof result === 'function') {
          this.__afterCallbacks.push(result)
        }
      } catch (err) {
        if (err instanceof MetaMessengerError) {
          this.__errors.push(err)
        } else {
          this.__errors.push(
            new MetaMessengerError(
              this.__papi.env,
              -1,
              `failed to call method (${method})`,
              typeof err === 'string' ? err : err.message,
              {
                error: err.toString(),
                // args: JSON.stringify(args), // @IMPORTANT@ This creates privacy issues
              },
            ),
          )
        }
      }
    }
  }

  private __sync = async (): Promise<void> => {
    for (const callback of this.__afterCallbacks) {
      await callback()
    }

    let toSync: ServerEvent[] = []
    if (this.__threadsToSync.size > 0) {
      const entries = await this.__papi.api.queryThreads([...this.__threadsToSync])
      if (entries.length > 0) {
        toSync.push({
          type: ServerEventType.STATE_SYNC,
          objectName: 'thread',
          objectIDs: {},
          mutationType: 'upsert',
          entries: entries.map(entry => ({
            ...entry,
            messages: {
              items: entry.messages.items,
              hasMore: true,
            },
          })),
        })
      }
      this.__threadsToSync.clear()
    }

    if (this.__events.length > 0) {
      this.__papi.onEvent([...toSync, ...this.__events])
      toSync = []
      this.__events = []
    }
  }

  private async __syncAttachment(threadKey: string, messageId: string) {
    if (this.__threadsToSync.has(threadKey) || this.__messagesToSync.has(messageId)) return

    const [message] = await this.__papi.api.queryMessages(threadKey, [messageId])
    if (!message) return
    this.__events.push({
      type: ServerEventType.STATE_SYNC,
      objectIDs: { threadID: message.threadID },
      mutationType: 'update',
      objectName: 'message',
      entries: [{
        ...pick(message, ['id', 'textHeading', 'attachments']),
      }],
    })
  }

  private async __syncContact(contactId: string) {
    const participants = await this.__papi.db.query.participants.findMany({
      where: eq(schema.participants.userId, contactId),
      columns: {
        threadKey: true,
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
        thread: {
          columns: {
            thread: true,
          },
        },
      },
    })
    if (participants.length === 0) return
    const fbid = this.__papi.kv.get('fbid')
    participants.forEach(p => {
      const isSelf = fbid === contactId
      const isSingle = p.threadKey === contactId
      if (isSelf && isSingle) return
      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectIDs: { threadID: p.threadKey },
        objectName: 'participant',
        mutationType: 'upsert',
        entries: mapParticipants([p], this.__papi.env, fbid),
      })
    })
  }

  private deleteThenInsertThread(a: SimpleArgType[]) {
    const thread = {
      // isUnread: Number(a[0][1]) > Number(a[1][1]),
      lastReadWatermarkTimestampMs: getAsMS(a[1]),
      // threadType: a[9][1] === '1' ? 'single' : 'group',
      threadType: a[9],
      folderName: a[10] as string,
      parentThreadKey: Number(a[35]),
      lastActivityTimestampMs: getAsMS(a[0]),
      snippet: a[2],
      threadPictureUrl: a[4],
      needsAdminApprovalForNewParticipant: a[5],
      threadPictureUrlFallback: a[11],
      threadPictureUrlExpirationTimestampMs: getAsMS(a[12]),
      removeWatermarkTimestampMs: getAsMS(a[13]),
      muteExpireTimeMs: getAsMS(a[14]),
      // muteCallsExpireTimeMs: getAsMS(a[15][1]),
      groupNotificationSettings: a[16],
      isAdminSnippet: a[17],
      snippetSenderContactId: a[18],
      snippetStringHash: a[21],
      snippetStringArgument1: a[22],
      snippetAttribution: a[23],
      snippetAttributionStringHash: a[24],
      disappearingSettingTtl: a[25],
      disappearingSettingUpdatedTs: getAsMS(a[26]),
      disappearingSettingUpdatedBy: a[27],
      cannotReplyReason: a[30],
      customEmoji: a[31],
      customEmojiImageUrl: a[32],
      outgoingBubbleColor: a[33],
      themeFbid: a[34],
      authorityLevel: 0,
      mailboxType: a[8],
      muteMentionExpireTimeMs: getAsMS(a[15]),
      muteCallsExpireTimeMs: getAsMS(a[16]),
      ongoingCallState: a[32],
      nullstateDescriptionText1: a[39],
      nullstateDescriptionType1: a[40],
      nullstateDescriptionText2: a[41],
      nullstateDescriptionType2: a[42],
      nullstateDescriptionText3: a[43],
      nullstateDescriptionType3: a[44],
      draftMessage: a[45],
      snippetHasEmoji: a[46],
      hasPersistentMenu: a[47],
      disableComposerInput: a[48],
      cannotUnsendReason: a[49],
      viewedPluginKey: a[50],
      viewedPluginContext: a[51],
      clientThreadKey: a[52],
      capabilities: a[53],
      shouldRoundThreadPicture: a[54],
      proactiveWarningDismissTime: a[55],
      isCustomThreadPicture: a[56],
      otidOfFirstMessage: a[57],
      normalizedSearchTerms: a[58],
      additionalThreadContext: a[59],
      disappearingThreadKey: a[60],
      isDisappearingMode: a[61],
      disappearingModeInitiator: a[62],
      unreadDisappearingMessageCount: a[63],
      lastMessageCtaId: a[65],
      lastMessageCtaType: a[66],
      lastMessageCtaTimestampMs: getAsMS(a[67]),
      consistentThreadFbid: a[68],
      threadDescription: a[70],
      unsendLimitMs: getAsMS(a[71]),
      capabilities2: a[79],
      capabilities3: a[80],
      syncGroup: a[83],
      threadInvitesEnabled: a[84],
      threadInviteLink: a[85],
      isAllUnreadMessageMissedCallXma: a[86],
      lastNonMissedCallXmaMessageTimestampMs: getAsMS(a[87]),
      threadInvitesEnabledV2: a[89],
      hasPendingInvitation: a[92],
      eventStartTimestampMs: getAsMS(a[93]),
      eventEndTimestampMs: getAsMS(a[94]),
      takedownState: a[95],
      secondaryParentThreadKey: a[96],
      igFolder: a[97],
      inviterId: a[98],
      threadTags: a[99],
      threadStatus: a[100],
      threadSubtype: a[101],
      pauseThreadTimestamp: getAsMS(a[102]),
      threadName: Array.isArray(a[3]) ? null : a[3],
    } as const
    const threadKey = a[7] as string
    this.__logger.debug('deleteThenInsertThread', a, { threadKey, thread })

    this.__papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadKey)).run()
    this.__papi.db.insert(schema.threads).values({
      raw: JSON.stringify(a),
      threadKey,
      folderName: thread.folderName,
      parentThreadKey: thread.parentThreadKey,
      lastActivityTimestampMs: new Date(thread.lastActivityTimestampMs),
      thread: JSON.stringify(thread),
    }).run()

    this.__threadsToSync.add(threadKey)

    return async () => {
      // there are new threads to send to the platform

      // this.__logger.debug('deleteThenInsertThread (sync)', a)
      //
      // const newThread = await this.__papi.getThread(threadKey)
      // this.__events.push({
      //   type: ServerEventType.STATE_SYNC,
      //   objectName: 'thread',
      //   objectIDs: {},
      //   mutationType: 'upsert',
      //   entries: [newThread],
      // }])
    }
  }

  private deleteThread(a: SimpleArgType[]) {
    const threadID = a[0] as string

    this.__papi.db.delete(schema.attachments).where(eq(schema.attachments.threadKey, threadID)).run()
    this.__papi.db.delete(schema.messages).where(eq(schema.messages.threadKey, threadID)).run()
    this.__papi.db.delete(schema.participants).where(eq(schema.participants.threadKey, threadID)).run()
    this.__papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadID)).run()

    return () => {
      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'thread',
        objectIDs: { threadID },
        mutationType: 'delete',
        entries: [threadID],
      })
    }
  }

  private updateThreadMuteSetting(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadMuteSetting', a)
    const threadKey = a[0] as string
    const muteExpireTimeMs = getAsMS(a[1])

    return () => {
      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'thread',
        objectIDs: {},
        mutationType: 'update',
        entries: [{
          id: threadKey,
          mutedUntil: muteExpireTimeMs === -1 ? 'forever' : new Date(muteExpireTimeMs),
        }],
      })
    }
  }

  private upsertMessage(a: SimpleArgType[]) {
    const m: IGMessage = {
      links: null,
      raw: JSON.stringify(a),
      threadKey: a[3] as string,
      timestampMs: getAsMS(a[5]),
      messageId: a[8] as string,
      offlineThreadingId: a[9] as string,
      authorityLevel: Number(a[2]),
      primarySortKey: a[6] as string,
      senderId: a[10] as string,
      isAdminMessage: Boolean(a[12]),
      sendStatus: a[15] as string,
      sendStatusV2: a[16] as string,
      text: a[0] as string,
      subscriptErrorMessage: a[1] as string,
      secondarySortKey: a[7] as string,
      stickerId: a[11] as string,
      messageRenderingType: a[13] as string,
      isUnsent: Boolean(a[17]),
      unsentTimestampMs: getAsMS(a[18]),
      mentionOffsets: a[19] as string,
      mentionLengths: a[20] as string,
      mentionIds: a[21] as string,
      mentionTypes: a[22] as string,
      replySourceId: a[23] as string,
      replySourceType: a[24] as string,
      replySourceTypeV2: a[25] as string,
      replyStatus: a[26] as string,
      replySnippet: a[27] as string,
      replyMessageText: a[28] as string,
      replyToUserId: a[29] as string,
      replyMediaExpirationTimestampMs: getAsMS(a[30]),
      replyMediaUrl: a[31] as string,
      replyMediaPreviewWidth: a[33] as string,
      replyMediaPreviewHeight: a[34] as string,
      replyMediaUrlMimeType: a[35] as string,
      replyMediaUrlFallback: a[36] as string,
      replyCtaId: a[37] as string,
      replyCtaTitle: a[38] as string,
      replyAttachmentType: a[39] as string,
      replyAttachmentId: a[40] as string,
      replyAttachmentExtra: a[41] as string,
      replyType: a[42] as string,
      isForwarded: Boolean(a[43]),
      forwardScore: a[44] as string,
      hasQuickReplies: Boolean(a[45]),
      adminMsgCtaId: a[46] as string,
      adminMsgCtaTitle: a[47] as string,
      adminMsgCtaType: a[48] as string,
      cannotUnsendReason: a[49] as string,
      textHasLinks: Number(a[50]),
      viewFlags: a[51] as string,
      displayedContentTypes: a[52] as string,
      viewedPluginKey: a[53] as string,
      viewedPluginContext: a[54] as string,
      quickReplyType: a[55] as string,
      hotEmojiSize: a[56] as string,
      replySourceTimestampMs: getAsMS(a[57]),
      ephemeralDurationInSec: a[58] as string,
      msUntilExpirationTs: getAsMS(a[59]),
      ephemeralExpirationTs: getAsMS(a[60]),
      takedownState: a[61] as string,
      isCollapsed: Boolean(a[62]),
      subthreadKey: a[63] as string,
    }
    const { messageId } = this.__papi.api.upsertMessage(m)
    this.__messagesToSync.add(messageId)
    this.__logger.debug('upsertMessage', m.threadKey, messageId, m.timestampMs, m.text)
  }

  private __upsertMessageAndSync(m: IGMessage) {
    this.__logger.debug('__upsertMessageAndSync', m.threadKey, m.messageId, m.timestampMs, m.text)
    const { messageId } = this.__papi.api.upsertMessage(m)
    this.__messagesToSync.add(messageId)
    return async () => {
      if (this.__threadsToSync.has(m.threadKey) || this.__messagesToIgnore.has(messageId)) return
      const [message] = await this.__papi.api.queryMessages(m.threadKey, [messageId])
      if (!message) return
      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'message',
        objectIDs: { threadID: message.threadID },
        mutationType: 'upsert',
        entries: [message],
      })
    }
  }

  private insertMessage(a: SimpleArgType[]) {
    this.__logger.debug('insertMessage', a)
    return this.__upsertMessageAndSync({
      raw: JSON.stringify(a),
      links: null,
      threadKey: a[3] as string,
      timestampMs: getAsMS(a[5] as string),
      messageId: a[8] as string,
      offlineThreadingId: a[9] as string,
      authorityLevel: Number(a[2]),
      primarySortKey: a[6] as string,
      senderId: a[10] as string,
      isAdminMessage: Boolean(a[12]),
      sendStatus: a[15] as string,
      sendStatusV2: a[16] as string,
      text: a[0] as string,
      subscriptErrorMessage: a[1] as string,
      secondarySortKey: a[7] as string,
      stickerId: a[11] as string,
      messageRenderingType: a[13] as string,
      isUnsent: Boolean(a[17]),
      unsentTimestampMs: getAsMS(a[18]),
      mentionOffsets: a[19] as string,
      mentionLengths: a[20] as string,
      mentionIds: a[21] as string,
      mentionTypes: a[22] as string,
      replySourceId: a[23] as string,
      replySourceType: a[24] as string,
      replySourceTypeV2: a[25] as string,
      replyStatus: a[26] as string,
      replySnippet: a[27] as string,
      replyMessageText: a[28] as string,
      replyToUserId: a[29] as string,
      replyMediaExpirationTimestampMs: getAsMS(a[30]),
      replyMediaUrl: a[31] as string,
      replyMediaPreviewWidth: a[33] as string,
      replyMediaPreviewHeight: a[34] as string,
      replyMediaUrlMimeType: a[35] as string,
      replyMediaUrlFallback: a[36] as string,
      replyCtaId: a[37] as string,
      replyCtaTitle: a[38] as string,
      replyAttachmentType: a[39] as string,
      replyAttachmentId: a[40] as string,
      replyAttachmentExtra: a[41] as string,
      isForwarded: Boolean(a[42]),
      forwardScore: a[43] as string,
      hasQuickReplies: Boolean(a[44]),
      adminMsgCtaId: a[45] as string,
      adminMsgCtaTitle: a[46] as string,
      adminMsgCtaType: a[47] as string,
      cannotUnsendReason: a[48] as string,
      textHasLinks: Number(a[49]),
      viewFlags: a[50] as string,
      displayedContentTypes: a[51] as string,
      viewedPluginKey: a[52] as string,
      viewedPluginContext: a[53] as string,
      quickReplyType: a[54] as string,
      hotEmojiSize: a[55] as string,
      replySourceTimestampMs: getAsMS(a[56] as string),
      ephemeralDurationInSec: a[57] as string,
      msUntilExpirationTs: getAsMS(a[58] as string),
      ephemeralExpirationTs: getAsMS(a[59] as string),
      takedownState: a[60] as string,
      isCollapsed: Boolean(a[61]),
      subthreadKey: a[62] as string,
    })
  }

  private deleteThenInsertMessage(a: SimpleArgType[]) {
    this.__logger.debug('deleteThenInsertMessage', a)
    return this.__upsertMessageAndSync({
      threadKey: a[3] as string,
      timestampMs: getAsMS(a[5]),
      messageId: a[8] as string,
      offlineThreadingId: a[9] as string,
      authorityLevel: Number(a[2]),
      primarySortKey: a[6] as string,
      senderId: a[10] as string,
      isAdminMessage: Boolean(a[12]),
      sendStatus: a[15] as string,
      sendStatusV2: a[16] as string,
      text: a[0] as string,
      subscriptErrorMessage: a[1] as string,
      secondarySortKey: a[7] as string,
      stickerId: a[11] as string,
      messageRenderingType: a[13] as string,
      isUnsent: Boolean(a[17]),
      unsentTimestampMs: getAsMS(a[18]),
      mentionOffsets: a[19] as string,
      mentionLengths: a[20] as string,
      mentionIds: a[21] as string,
      mentionTypes: a[22] as string,
      replySourceId: a[23] as string,
      replySourceType: a[24] as string,
      replySourceTypeV2: a[25] as string,
      replyStatus: a[26] as string,
      replySnippet: a[27] as string,
      replyMessageText: a[28] as string,
      replyToUserId: a[29] as string,
      replyMediaExpirationTimestampMs: getAsMS(a[30]),
      replyMediaUrl: a[31] as string,
      replyMediaPreviewWidth: a[33] as string,
      replyMediaPreviewHeight: a[34] as string,
      replyMediaUrlMimeType: a[35] as string,
      replyMediaUrlFallback: a[36] as string,
      replyCtaId: a[37] as string,
      replyCtaTitle: a[38] as string,
      replyAttachmentType: a[39] as string,
      replyAttachmentId: a[40] as string,
      replyAttachmentExtra: a[41] as string,
      isForwarded: Boolean(a[42]),
      forwardScore: a[43] as string,
      hasQuickReplies: Boolean(a[44]),
      adminMsgCtaId: a[45] as string,
      adminMsgCtaTitle: a[46] as string,
      adminMsgCtaType: a[47] as string,
      cannotUnsendReason: a[48] as string,
      textHasLinks: Number(a[49]),
      viewFlags: a[50] as string,
      displayedContentTypes: a[51] as string,
      viewedPluginKey: a[52] as string,
      viewedPluginContext: a[53] as string,
      quickReplyType: a[54] as string,
      hotEmojiSize: a[55] as string,
      replySourceTimestampMs: getAsMS(a[56]),
      ephemeralDurationInSec: a[57] as string,
      msUntilExpirationTs: getAsMS(a[58]),
      ephemeralExpirationTs: getAsMS(a[59]),
      takedownState: a[60] as string,
      isCollapsed: Boolean(a[61]),
      subthreadKey: a[62] as string,
    })
  }

  private updateReadReceipt(a: SimpleArgType[]) {
    const r: IGReadReceipt = {
      readWatermarkTimestampMs: getAsDate(a[0] as string), // last message logged in user has read from
      threadKey: a[1] as string,
      contactId: a[2] as string,
      readActionTimestampMs: getAsDate(a[3] as string),
    }

    this.__logger.debug('updateReadReceipt', a, r)

    this.__papi.db.update(schema.participants).set({
      readActionTimestampMs: r.readActionTimestampMs,
      readWatermarkTimestampMs: r.readWatermarkTimestampMs,
    })
      .where(and(
        eq(schema.participants.threadKey, r.threadKey),
        eq(schema.participants.userId, r.contactId),
      )).run()
    if (!r.readActionTimestampMs) return

    return async () => {
      if (this.__threadsToSync.has(r.threadKey)) return
      const [newestMessage] = await this.__papi.api.queryMessages(r.threadKey, QueryWhereSpecial.NEWEST)
      if (!newestMessage) return
      if (this.__messagesToSync.has(newestMessage.id)) return

      const readOn = r.readActionTimestampMs || UNKNOWN_DATE

      if (newestMessage.seen === true) return
      if (typeof newestMessage.seen !== 'boolean') {
        if (newestMessage.seen instanceof Date && newestMessage.seen.getTime?.() >= readOn.getTime()) return
        if (!(newestMessage.seen instanceof Date) && r.contactId in newestMessage.seen) {
          const contactSeen = newestMessage.seen[r.contactId]
          if (contactSeen === true) return
          if (
            typeof contactSeen !== 'boolean'
            && contactSeen instanceof Date
            && contactSeen.getTime?.() >= readOn.getTime()
          ) return
        }
      }

      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'message_seen',
        mutationType: 'upsert',
        objectIDs: { threadID: r.threadKey, messageID: newestMessage.id },
        entries: [{ [r.contactId]: r.readActionTimestampMs || UNKNOWN_DATE }],
      })
    }
  }

  private executeFirstBlockForSyncTransaction(a: SimpleArgType[]) {
    const database_id = a[0] as string
    const epoch_id = a[1] as string
    const currentCursor = a[3] as string
    const syncStatus = a[4] as string
    const sendSyncParams = a[5] as string
    // const minTimeToSyncTimestampMs = c.i64.eq(a[6], c.i64.cast([0, 0])) ? c.i64.cast([0, 0]) : c.i64.add(d[4], a[6])
    const canIgnoreTimestamp = a[7] as string
    const syncChannel = a[8] as SyncGroup // @TODO: not sure
    // const lastSyncCompletedTimestampMs = d[5]
    this.__logger.debug('executeFirstBlockForSyncTransaction', {
      database_id,
      epoch_id,
      currentCursor,
      syncStatus,
      sendSyncParams,
      canIgnoreTimestamp,
      syncChannel,
      a2: a[2],
    })

    this.__papi.kv.set(`cursor-${Number(database_id)}-${syncChannel}`, currentCursor)
    this.__papi.kv.set(`_lastReceivedCursor-${Number(database_id)}-${syncChannel}`, JSON.stringify({
      database_id,
      epoch_id,
      currentCursor,
      syncStatus,
      sendSyncParams,
      canIgnoreTimestamp,
      syncChannel,
    }))
  }

  private truncateTablesForSyncGroup(a: SimpleArgType[]) {
    this.__logger.debug('truncateTablesForSyncGroup (ignored)', a)
  }

  private mciTraceLog(a: SimpleArgType[]) {
    this.__logger.debug('mciTraceLog (ignored)', a)
  }

  private setForwardScore(a: SimpleArgType[]) {
    const forwardScore = {
      threadKey: a[0] as string,
      messageId: a[1] as string,
      timestampMs: a[2] as string,
      forwardScore: a[3] as string,
    }
    this.__logger.debug('setForwardScore (ignored)', a, forwardScore)
  }

  private setMessageDisplayedContentTypes(a: SimpleArgType[]) {
    this.__logger.debug('setMessageDisplayedContentTypes (ignored)', a)
  }

  private async insertNewMessageRange(a: SimpleArgType[]) {
    const msgRange = {
      threadKey: a[0] as string,
      minTimestamp: a[1] as string,
      maxTimestamp: a[2] as string,
      minMessageId: a[3] as string,
      maxMessageId: a[4] as string,
      hasMoreBeforeFlag: Boolean(a[7]),
      hasMoreAfterFlag: Boolean(a[8]),
    }
    this.__logger.debug('insertNewMessageRange', a, msgRange)
    await this.__papi.api.setMessageRanges(msgRange)
    await this.__papi.api.resolveMessageRanges(msgRange)
  }

  private async updateExistingMessageRange(a: SimpleArgType[]) {
    const isMaxTimestamp = Boolean(a[2])
    const timestamp = a[1] as string
    const msgRange = {
      threadKey: a[0] as string,
      hasMoreBeforeFlag: a[2] && !a[3],
      hasMoreAfterFlag: !a[2] && !a[3],
      maxTimestamp: isMaxTimestamp ? timestamp : undefined,
      minTimestamp: !isMaxTimestamp ? timestamp : undefined,
    }

    this.__logger.debug('updateExistingMessageRange', a, msgRange)
    await this.__papi.api.setMessageRanges(msgRange)
    await this.__papi.api.resolveMessageRanges(msgRange)
  }

  private upsertSequenceId(a: SimpleArgType[]) {
    this.__logger.debug('upsertSequenceId (ignored)', a)
  }

  private taskExists(a: SimpleArgType[]) {
    const taskId = a[0] as string
    this.__logger.debug('taskExists (ignored)', a, { taskId })
  }

  private removeTask(a: SimpleArgType[]) {
    const taskId = a[0] as string
    this.__logger.debug('removeTask (ignored)', a, { taskId })
  }

  private deleteThenInsertContactPresence(a: SimpleArgType[]) {
    const p = {
      contactId: a[0] as string,
      status: a[1] as string,
      expirationTimestampMs: getAsMS(a[3]),
      lastActiveTimestampMs: getAsMS(a[2]),
      capabilities: a[4] as string,
      publishId: a[5] as string,
    }
    this.__logger.debug('deleteThenInsertContactPresence (ignored)', a, p)
  }

  private upsertSyncGroupThreadsRange(a: SimpleArgType[]) {
    const range = {
      syncGroup: a[0] as SyncGroup,
      parentThreadKey: a[1] as ParentThreadKey,
      minLastActivityTimestampMs: a[2] as string,
      hasMoreBefore: Boolean(a[3]),
      isLoadingBefore: Boolean(a[4]),
      minThreadKey: a[5] as string,
    }
    this.__logger.debug('upsertSyncGroupThreadsRange', a)
    this.__papi.api.setSyncGroupThreadsRange(range)
  }

  private upsertInboxThreadsRange(a: SimpleArgType[]) {
    this.__logger.debug('upsertInboxThreadsRange (ignored)', a)
  }

  private updateThreadsRangesV2(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadsRangesV2 (ignored)', a)
  }

  private threadsRangesQuery(a: SimpleArgType[]) {
    this.__logger.debug('threadsRangesQuery (ignored)', a)
  }

  private addParticipantIdToGroupThread(a: SimpleArgType[]) {
    this.__logger.debug('addParticipantIdToGroupThread', a)
    const p = {
      raw: JSON.stringify(a),
      threadKey: a[0] as string,
      userId: a[1] as string,
      readWatermarkTimestampMs: getAsDate(a[2] as string),
      readActionTimestampMs: getAsDate(a[3] as string),
      deliveredWatermarkTimestampMs: getAsDate(a[4] as string),
      // lastDeliveredWatermarkTimestampMs: getAsDate(a[5][1])),
      lastDeliveredActionTimestampMs: a[5] ? getAsDate(a[5] as string) : null,
      isAdmin: Boolean(a[6]),
    }
    this.__papi.db.insert(schema.participants).values(p).onConflictDoUpdate({
      target: [schema.participants.threadKey, schema.participants.userId],
      set: { ...p },
    }).run()
    const contact = this.__papi.api.getContact(p.userId)

    return () => {
      if (this.__threadsToSync.has(p.threadKey)) return

      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectIDs: { threadID: p.threadKey },
        objectName: 'participant',
        mutationType: 'upsert',
        entries: [{
          id: p.userId,
          isAdmin: Boolean(p.isAdmin),
          username: contact?.username,
          fullName: contact?.name || contact?.username || this.__papi.envOpts.defaultContactName,
          imgURL: contact?.profilePictureUrl,
        }],
      })
    }
  }

  private verifyContactRowExists(a: SimpleArgType[]) {
    this.__logger.debug('verifyContactRowExists', a)
    const parsed = {
      raw: JSON.stringify(a),
      id: a[0],
      profilePictureUrl: a[2] == null ? '' : a[2],
      name: a[3],
      username: a[20],
      profilePictureFallbackUrl: a[5],
      // name: d[0],
      secondaryName: a[20],
      // normalizedNameForSearch: d[0],
      isMemorialized: a[9],
      blockedByViewerStatus: a[11],
      canViewerMessage: a[12],
      // profilePictureLargeUrl: '',
      // isMessengerUser: !0,
      // rank: 0,
      contactType: a[4],
      // contactTypeExact: c.i64.cast([0, 0]),
      // requiresMultiway: !1,
      authorityLevel: a[14],
      // workForeignEntityType: c.i64.cast([0, 0]),
      capabilities: a[15],
      capabilities2: a[16],
      contactViewerRelationship: a[19],
      gender: a[18],
    }
    const { id, raw, name, profilePictureUrl, username, ...contact } = parsed
    const c = {
      id: id as string,
      raw: raw as string,
      name: name as string,
      profilePictureUrl: profilePictureUrl as string,
      username: username as string,
      contact: JSON.stringify(contact),
    } as const

    this.__papi.db.insert(schema.contacts).values(c).onConflictDoUpdate({
      target: schema.contacts.id,
      set: { ...c },
    }).run()

    return () => {
      // this._syncContact(contactId)
    }
  }

  private setHMPSStatus(a: SimpleArgType[]) {
    this.__logger.debug('setHMPSStatus (ignored)', a)
  }

  private upsertFolderSeenTimestamp(a: SimpleArgType[]) {
    this.__logger.debug('upsertFolderSeenTimestamp (ignored)', a)
  }

  private async deleteExistingMessageRanges(a: SimpleArgType[]) {
    const threadKey = a[0] as string
    this.__logger.debug('deleteExistingMessageRanges', threadKey)
    const threadExists = await this.__papi.db.query.threads.findFirst({
      where: eq(schema.threads.threadKey, a[0] as string),
      columns: {
        threadKey: true,
        ranges: true,
      },
    })
    if (!threadExists || (threadExists && !threadExists.ranges)) return
    this.__papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadKey)).run()
  }

  private deleteThenInsertIgThreadInfo(a: SimpleArgType[]) {
    const threadKey = a[0] as string
    const igThreadId = a[1] as string
    this.__papi.db.update(schema.threads).set({
      threadKey,
      igThread: JSON.stringify({ igThreadId }),
    }).where(eq(schema.threads.threadKey, threadKey)).run()
    this.__logger.debug('deleteThenInsertIgThreadInfo', { threadKey, igThreadId })
  }

  private deleteThenInsertMessageRequest(a: SimpleArgType[]) {
    this.__logger.debug('deleteThenInsertMessageRequest (ignored)', a)
  }

  private deleteThenInsertContact(a: SimpleArgType[]) {
    const parsed = {
      id: a[0] as string,
      profilePictureUrl: a[2] as string,
      profilePictureFallbackUrl: a[3] as string,
      profilePictureUrlExpirationTimestampMs: a[4] as string,
      profilePictureLargeUrl: a[5] as string,
      profilePictureLargeFallbackUrl: a[6] as string,
      profilePictureLargeUrlExpirationTimestampMs: a[7] as string,
      name: a[9] as string,
      secondaryName: a[41] as string,
      normalizedNameForSearch: a[10] as string,
      normalizedSearchTerms: a[33] as string,
      isMessengerUser: a[11] as string,
      isMemorialized: a[12] as string,
      isManagedByViewer: a[35] as string,
      blockedByViewerStatus: a[14] as string,
      rank: a[17] as string,
      firstName: a[18] as string,
      contactType: a[19] as string,
      contactTypeExact: a[20] as string,
      authorityLevel: a[21] as string,
      messengerCallLogThirdPartyId: a[22] as string,
      profileRingColor: a[23] as string,
      requiresMultiway: a[24] as string,
      blockedSinceTimestampMs: a[25] as string,
      fbUnblockedSinceTimestampMs: a[46] as string,
      canViewerMessage: a[26] as string,
      profileRingColorExpirationTimestampMs: a[27] as string,
      phoneNumber: a[28] as string,
      emailAddress: a[29] as string,
      workCompanyId: a[30] as string,
      workCompanyName: a[31] as string,
      workJobTitle: a[32] as string,
      deviceContactId: a[34] as string,
      workForeignEntityType: a[36] as string,
      capabilities: a[37] as string,
      capabilities2: a[38] as string,
      // profileRingState: d[0],
      contactViewerRelationship: a[39] as string,
      gender: a[40] as string,
      contactReachabilityStatusType: a[43] as string,
      restrictionType: a[44] as string,
      waConnectStatus: a[45] as string,
      // isEmployee: !1
    }
    const { id, name, profilePictureUrl, secondaryName: username, ...contact } = parsed

    this.__logger.debug('deleteThenInsertContact', a, parsed)

    this.__papi.db.delete(schema.contacts).where(eq(schema.contacts.id, id)).run()
    this.__papi.db.insert(schema.contacts).values({
      raw: JSON.stringify(a),
      id,
      name,
      profilePictureUrl,
      username,
      contact: JSON.stringify(contact),
    } as const).run()

    this.__events.push({
      type: ServerEventType.STATE_SYNC,
      objectName: 'participant',
      objectIDs: { threadID: id },
      mutationType: 'upsert',
      entries: [{
        id,
        username,
        fullName: name || username || this.__papi.envOpts.defaultContactName,
        imgURL: profilePictureUrl,
      }],
    })
  }

  private deleteThenInsertIGContactInfo(a: SimpleArgType[]) {
    const contactId = a[0] as string

    const igContact = JSON.stringify({
      igId: a[1] as string,
      igFollowStatus: a[4] as string,
      verificationStatus: a[5] as string,
      linkedFbid: a[2] as string,
      e2eeEligibility: a[6] as string,
      supportsE2eeSpamdStorage: a[7] as string,
    })

    this.__logger.debug('deleteThenInsertIGContactInfo', a)

    // we don't keep it in a separate table, just in the contacts table
    // since we overwrite the profile, no need to delete first
    this.__papi.db.insert(schema.contacts).values({
      id: contactId,
      igContact,
    }).onConflictDoUpdate({
      target: schema.contacts.id,
      set: { igContact },
    }).run()
  }

  private writeThreadCapabilities(a: SimpleArgType[]) {
    this.__logger.debug('writeThreadCapabilities (ignored)', a)
  }

  private clearPinnedMessages(a: SimpleArgType[]) {
    this.__logger.debug('clearPinnedMessages (ignored)', a)
  }

  private updateLastSyncCompletedTimestampMsToNow(a: SimpleArgType[]) {
    this.__logger.debug('updateLastSyncCompletedTimestampMsToNow (ignored)', a)
  }

  private setMessageTextHasLinks(a: SimpleArgType[]) {
    this.__logger.debug('setMessageTextHasLinks (ignored)', a)
  }

  private updateAttachmentCtaAtIndexIgnoringAuthority(a: SimpleArgType[]) {
    this.__logger.debug('updateAttachmentCtaAtIndexIgnoringAuthority (ignored)', a)
  }

  private updateAttachmentItemCtaAtIndex(a: SimpleArgType[]) {
    this.__logger.debug('updateAttachmentItemCtaAtIndex (ignored)', a)
  }

  private deleteMessage(a: SimpleArgType[]) {
    const threadID = a[0] as string
    const messageID = a[1] as string
    this.__logger.debug('deleteMessage', a, { threadID, messageID })
    this.__papi.db.delete(schema.messages).where(and(
      eq(schema.messages.threadKey, threadID),
      eq(schema.messages.messageId, messageID),
    )).run()

    return () => {
      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'message',
        objectIDs: { threadID, messageID },
        mutationType: 'delete',
        entries: [messageID],
      })
    }
  }

  private deleteReaction(a: SimpleArgType[]) {
    const threadID = a[0] as string
    const messageID = a[1] as string
    const actorID = a[2] as string

    this.__logger.debug('deleteReaction', a, {
      threadID,
      messageID,
      actorID,
    })

    this.__papi.db.delete(schema.reactions).where(and(
      eq(schema.reactions.threadKey, threadID),
      eq(schema.reactions.messageId, messageID),
      eq(schema.reactions.actorId, actorID),
    )).run()

    return () => {
      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'message_reaction',
        objectIDs: { threadID, messageID },
        mutationType: 'delete',
        entries: [actorID],
      })
    }
  }

  private executeFinallyBlockForSyncTransaction(a: SimpleArgType[]) {
    this.__logger.debug('executeFinallyBlockForSyncTransaction (ignored)', a)
  }

  private async insertAttachmentCta(a: SimpleArgType[]) {
    const r = {
      raw: JSON.stringify(a),
      attachmentFbid: a[1] as string,
      threadKey: a[3] as string,
      messageId: a[5] as string,
      actionUrl: a[9] as string,
    }
    this.__logger.debug('insertAttachmentCta', a, r)
    // const messages = await this.__papi.db.select({ message: schema.messages.message }).from(schema.messages).where(eq(schema.messages.messageId, r.messageId!)).run()
    // FIXME: ^ above doesnt work, also the below code is an atrocity
    // ideally we would just update the field in the database without querying, parsing, updating, and reinserting the message
    const messages = await this.__papi.db.query.messages.findFirst({
      where: eq(schema.messages.messageId, r.messageId!),
      columns: {
        message: true,
      },
    })
    if (r.actionUrl && r.actionUrl !== 'null') {
      // const a = this.__papi.db.query.attachments.findFirst({
      //   where: eq(schema.attachments.attachmentFbid, r.attachmentFbid!),
      // })
      // const attachment = JSON.parse(a.attachment) as IGAttachment
      const parsedMessage = JSON.parse(messages.message) as IGMessage
      if (this.__papi.env !== 'IG') {
        this.__logger.error('insertAttachmentCta NON IG PLATFORM ', {}, JSON.stringify({
          parsedMessage,
          actionUrl: r.actionUrl,
          r,
        }))
      }

      const mediaLink = r.actionUrl.startsWith('/') ? `https://www.instagram.com${r.actionUrl}` : getOriginalURL(r.actionUrl) // @TODO: add env support

      this.__logger.debug('insertAttachmentCta mediaLink', mediaLink)
      const INSTAGRAM_PROFILE_BASE_URL = 'https://www.instagram.com/_u/' // @TODO: add env support
      if (mediaLink.startsWith(INSTAGRAM_PROFILE_BASE_URL)) {
        parsedMessage.extra = {}
        parsedMessage.links = [{
          url: mediaLink,
          title: `@${mediaLink.replace(INSTAGRAM_PROFILE_BASE_URL, '')} on Instagram`,
        }]
      } else if (mediaLink.startsWith(`https://${this.__papi.envOpts.domain}/`)) {
        parsedMessage.extra = {
          mediaLink,
        }
      } else {
        parsedMessage.links = [{
          url: mediaLink,
          title: parsedMessage.replySnippet,
        }]
      }

      const newMessage = JSON.stringify(parsedMessage)
      this.__logger.debug('insertAttachmentCta newMessage', newMessage)

      this.__papi.db.update(schema.messages).set({ message: newMessage }).where(eq(schema.messages.messageId, r.messageId!)).run()

      // if (r.actionUrl.startsWith('/')) {
      //   mparse.links = [{ url: `https://www.instagram.com${r.actionUrl}/` }]
      // } else {
      //   mparse.links = [{ url: r.actionUrl }]
      // }
    }
  }

  private insertAttachmentItem(a: SimpleArgType[]) {
    const i = {
      attachmentFbid: a[0],
      threadKey: a[2],
      messageId: a[4],
      previewUrl: a[17],
    }
    this.__logger.debug('insertAttachmentItem (ignored)', a, i)
  }

  private insertAttachment(a: SimpleArgType[]) {
    this.__logger.debug('insertAttachment (ignored)', a)
  }

  private insertBlobAttachment(a: SimpleArgType[]) {
    const ba: IGAttachment = {
      raw: JSON.stringify(a),
      filename: a[0] as string,
      threadKey: a[27] as string,
      messageId: a[32] as string,
      previewUrl: a[8] as string,
      previewUrlFallback: a[9] as string,
      previewUrlExpirationTimestampMs: getAsMS(a[10]),
      previewUrlMimeType: a[11] as string,
      previewWidth: Number(a[14]),
      previewHeight: Number(a[15]),
      timestampMs: getAsMS(a[31]),
      attachmentType: a[29] as string,
      attachmentFbid: a[34] as string,
      filesize: Number(a[1]),
      hasMedia: Boolean(a[2]),
      playableUrl: a[3] as string,
      playableUrlFallback: a[4] as string,
      playableUrlExpirationTimestampMs: getAsMS(a[5]),
      playableUrlMimeType: a[6] as string,
      dashManifest: a[7] as string,
      miniPreview: a[13] as string,
      attributionAppId: a[16] as string,
      attributionAppName: a[17] as string,
      isSharable: !1,
      attributionAppIcon: a[18] as string,
      attributionAppIconFallback: a[19] as string,
      attributionAppIconUrlExpirationTimestampMs: getAsMS(a[20]),
      localPlayableUrl: a[21] as string,
      playableDurationMs: getAsMS(a[22]),
      attachmentIndex: a[23] as string,
      accessibilitySummaryText: a[24] as string,
      isPreviewImage: Boolean(a[25]),
      originalFileHash: a[26] as string,
      offlineAttachmentId: a[33] as string, // @TODO: is integer/bigint?
      hasXma: Boolean(a[35]),
      xmaLayoutType: a[36] as string,
      xmasTemplateType: a[37] as string,
      titleText: a[38] as string,
      subtitleText: a[39] as string,
      descriptionText: a[40] as string,
      sourceText: a[41] as string,
      faviconUrlExpirationTimestampMs: getAsMS(a[42]),
      isBorderless: Boolean(a[44]),
      previewUrlLarge: a[45] as string,
      samplingFrequencyHz: Number(a[46]),
      waveformData: a[47] as string,
      authorityLevel: a[48] as string,
    }
    this.__logger.debug('insertBlobAttachment', a, ba)
    const { messageId } = this.__papi.api.upsertAttachment(ba)

    return async () => {
      await this.__syncAttachment(ba.threadKey, messageId)
    }
  }

  private insertXmaAttachment(a: SimpleArgType[]) {
    const ba: IGAttachment = {
      raw: JSON.stringify(a),
      threadKey: a[25] as string,
      messageId: a[30] as string,
      attachmentFbid: a[32] as string,
      filename: a[1] as string,
      filesize: Number(a[2]),
      hasMedia: !1,
      isSharable: Boolean(a[3]),
      playableUrl: a[4] as string,
      playableUrlFallback: a[5] as string,
      playableUrlExpirationTimestampMs: getAsMS(a[6]),
      playableUrlMimeType: a[7] as string,
      previewUrl: a[8] as string,
      previewUrlFallback: a[9] as string,
      previewUrlExpirationTimestampMs: getAsMS(a[10]),
      previewUrlMimeType: a[11] as string,
      previewWidth: Number(a[13]),
      previewHeight: Number(a[14]),
      attributionAppId: a[15] as string,
      attributionAppName: a[16] as string,
      attributionAppIcon: a[17] as string,
      attributionAppIconFallback: a[18] as string,
      attributionAppIconUrlExpirationTimestampMs: getAsMS(a[19]),
      attachmentIndex: a[20] as string,
      accessibilitySummaryText: a[21] as string,
      shouldRespectServerPreviewSize: Boolean(a[22]),
      subtitleIconUrl: a[23] as string,
      shouldAutoplayVideo: Boolean(a[24]),
      attachmentType: a[27] as string,
      timestampMs: getAsMS(a[29]),
      offlineAttachmentId: a[31] as string,
      hasXma: !0,
      xmaLayoutType: a[33] as string,
      xmasTemplateType: a[34] as string,
      collapsibleId: a[35] as string,
      defaultCtaId: a[36] as string,
      defaultCtaTitle: a[37] as string,
      defaultCtaType: a[38] as string,
      attachmentCta1Id: a[40] as string,
      cta1Title: a[41] as string,
      cta1IconType: a[42] as string,
      cta1Type: a[43] as string,
      attachmentCta2Id: a[45] as string,
      cta2Title: a[46] as string,
      cta2IconType: a[47] as string,
      cta2Type: a[48] as string,
      attachmentCta3Id: a[50] as string,
      cta3Title: a[51] as string,
      cta3IconType: a[52] as string,
      cta3Type: a[53] as string,
      imageUrl: a[54] as string,
      imageUrlFallback: a[55] as string,
      imageUrlExpirationTimestampMs: getAsMS(a[56]),
      actionUrl: a[57] as string,
      titleText: a[58] as string,
      subtitleText: a[59] as string,
      maxTitleNumOfLines: a[60] as string,
      maxSubtitleNumOfLines: a[61] as string,
      descriptionText: a[62] as string,
      sourceText: a[63] as string,
      faviconUrl: a[64] as string,
      faviconUrlFallback: a[65] as string,
      faviconUrlExpirationTimestampMs: getAsMS(a[66]),
      listItemsId: a[68] as string,
      listItemsDescriptionText: a[69] as string,
      listItemsDescriptionSubtitleText: a[70] as string,
      listItemsSecondaryDescriptionText: a[71] as string,
      listItemId1: a[72] as string,
      listItemTitleText1: a[73] as string,
      listItemContactUrlList1: a[74] as string,
      listItemProgressBarFilledPercentage1: a[75] as string,
      listItemContactUrlExpirationTimestampList1: a[76] as string,
      listItemContactUrlFallbackList1: a[77] as string,
      listItemAccessibilityText1: a[78] as string,
      listItemTotalCount1: a[79] as string,
      listItemId2: a[80] as string,
      listItemTitleText2: a[81] as string,
      listItemContactUrlList2: a[82] as string,
      listItemProgressBarFilledPercentage2: a[83] as string,
      listItemContactUrlExpirationTimestampList2: a[84] as string,
      listItemContactUrlFallbackList2: a[85] as string,
      listItemAccessibilityText2: a[86] as string,
      listItemTotalCount2: a[87] as string,
      listItemId3: a[88] as string,
      listItemTitleText3: a[89] as string,
      listItemContactUrlList3: a[90] as string,
      listItemProgressBarFilledPercentage3: a[91] as string,
      listItemContactUrlExpirationTimestampList3: a[92] as string,
      listItemContactUrlFallbackList3: a[93] as string,
      listItemAccessibilityText3: a[94] as string,
      listItemTotalCount3: a[95] as string,
      isBorderless: Boolean(a[99]),
      headerImageUrlMimeType: a[100] as string,
      headerTitle: a[101] as string,
      headerSubtitleText: a[102] as string,
      headerImageUrl: a[103] as string,
      headerImageUrlFallback: a[104] as string,
      headerImageUrlExpirationTimestampMs: getAsMS(a[105]),
      previewImageDecorationType: a[106] as string,
      shouldHighlightHeaderTitleInTitle: a[107] as string,
      targetId: a[108] as string,
      attachmentLoggingType: a[111] as string,
      previewUrlLarge: a[113] as string,
      gatingType: a[114] as string,
      gatingTitle: a[115] as string,
      targetExpiryTimestampMs: getAsMS(a[116]),
      countdownTimestampMs: getAsMS(a[117]),
      shouldBlurSubattachments: a[118] as string,
      verifiedType: a[119] as string,
      captionBodyText: a[120] as string,
      isPublicXma: a[121] as string,
      authorityLevel: a[122] as string,
    }
    this.__logger.debug('insertXmaAttachment', a, ba)
    const { messageId } = this.__papi.api.upsertAttachment(ba)
    return async () => {
      await this.__syncAttachment(ba.threadKey, messageId)
    }
  }

  private insertSearchResult(a: SimpleArgType[]) {
    const r = {
      // query: a[0],
      id: a[1] as string,
      // type of [1] is user
      // type of [2] is group chat
      type: (String(a[4]) === '1' ? 'user' : String(a[4]) === '2' ? 'group' : 'unknown_user') as SearchArgumentType,
      fullName: a[5] as string,
      imgURL: a[6] as string,
      username: a[8] as string,
      // messageId: a[9],
      // messageTimestampMs: new Date(Number(a[10])),
      // isVerified: Boolean(a[12]),
    }
    this.__logger.debug('insertSearchResult', a, r)
    if (!this.__responses.insertSearchResult || !this.__responses.insertSearchResult.length) this.__responses.insertSearchResult = []
    this.__responses.insertSearchResult.push(r)
  }

  private issueNewError(a: SimpleArgType[]) {
    this.__logger.debug('issueNewError', a)
    const _requestId = a[0] as string
    const errorId = Number(a[1]) // @TODO: not sure what this value is
    const errorTitle = a[2] as string
    const errorMessage = a[3] as string
    this.__errors.push(new MetaMessengerError(this.__papi.env, errorId, errorTitle, errorMessage, {
      requestId: _requestId,
      issuedByMethod: 'issueNewError',
    }))
  }

  private issueError(a: SimpleArgType[]) {
    // @TODO: we don't know how to parse this error yet
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, 'unknown error', JSON.stringify(a), {
      issuedByMethod: 'issueError',
    }))
  }

  private markOptimisticMessageFailed(a: SimpleArgType[]) {
    this.__logger.debug('markOptimisticMessageFailed', a)
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, 'failed to update optimistic message', JSON.stringify(a), {
      args: JSON.stringify(a),
      issuedByMethod: 'markOptimisticMessageFailed',
    }))
  }

  private handleSyncFailure(a: SimpleArgType[]) {
    // @TODO: we don't know how to parse this error yet
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, 'unknown error', JSON.stringify(a), {
      issuedByMethod: 'handleSyncFailure',
    }))
  }

  private handleFailedTask(a: SimpleArgType[]) {
    const taskId = a[0] as string
    const queueName = a[1] as string
    const errorMessage = a[2] as string
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, 'failed to handle task', `${errorMessage} (task #${this.__requestId}/${taskId} in ${queueName})`, {
      taskId,
      queueName,
      args: JSON.stringify(a),
      issuedByMethod: 'handleFailedTask',
    }))
  }

  private updateTypingIndicator(a: SimpleArgType[]) {
    this.__logger.debug('updateTypingIndicator (ignored)', a)
  }

  private removeOptimisticGroupThread(a: SimpleArgType[]) {
    const offlineThreadingId = a[0] as string
    this.__logger.debug('removeOptimisticGroupThread', a, { offlineThreadingId })
    if (!offlineThreadingId) return
    return () => {
      // @TODO: implement, this happens on new thread creation
      // this.__events.push({
      //   type: ServerEventType.STATE_SYNC,
      //   mutationType: 'delete',
      //   objectName: 'thread',
      //   objectIDs: {},
      //   entries: [offlineThreadingId],
      // })
    }
  }

  private removeParticipantFromThread(a: SimpleArgType[]) {
    this.__logger.debug('removeParticipantFromThread', a)
    const threadID = a[0] as string
    const userId = a[1] as string

    this.__papi.db.delete(schema.participants).where(and(
      eq(schema.participants.threadKey, threadID),
      eq(schema.participants.userId, userId),
    )).run()

    return () => {
      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectIDs: { threadID },
        objectName: 'participant',
        mutationType: 'delete',
        entries: [userId],
      })
    }
  }

  private replaceOptimisticThread(a: SimpleArgType[]) {
    const offlineThreadingId = a[0] as string
    const threadId = a[1] as string
    this.__logger.debug('replaceOptimisticThread', a, {
      offlineThreadingId,
      threadId,
    })
    if (this.__responses.replaceOptimisticThread?.threadId) { // @TODO: not sure if it needs to handle multiple in one payload
      this.__logger.warn('replaceOptimisticThread: already exists', a)
      return
    }
    this.__responses.replaceOptimisticThread = {
      offlineThreadingId,
      threadId,
    }
  }

  private replaceOptimsiticMessage(a: SimpleArgType[]) {
    const offlineThreadingId = a[0] as string
    const messageId = a[1] as string
    this.__logger.debug('replaceOptimsiticMessage', a, {
      offlineThreadingId,
      messageId,
    })

    this.__messagesToIgnore.add(messageId)

    if (this.__responses.replaceOptimsiticMessage?.messageId) { // @TODO: not sure if it needs to handle multiple in one payload
      this.__logger.warn('replaceOptimsiticMessage: already exists', a)
    }

    this.__responses.replaceOptimsiticMessage = {
      offlineThreadingId,
      messageId,
    }
  }

  private syncUpdateThreadName(a: SimpleArgType[]) {
    const t = {
      threadName: a[0] as string,
      threadKey: a[1] as string,
    }
    this.__logger.debug('syncUpdateThreadName (ignored)', a, t)
  }

  private updateDeliveryReceipt(a: SimpleArgType[]) {
    this.__logger.debug('updateDeliveryReceipt (ignored)', a)
  }

  private updateFilteredThreadsRanges(a: SimpleArgType[]) {
    const b = {
      folderName: a[0] as string,
      parentThreadKey: a[1] as string,
      threadRangeFilter: a[2] as string,
      minLastActivityTimestampMs: a[3] as string,
      minThreadKey: a[4] as string,
      secondaryThreadRangeFilter: a[7] as string,
      threadRangeFilterValue: a[8] as string,
    }
    this.__logger.debug('updateFilteredThreadsRanges (ignored)', a, b)
  }

  private updateThreadParticipantAdminStatus(a: SimpleArgType[]) {
    const b = {
      threadKey: a[0] as string,
      participantId: a[1] as string,
      isAdmin: Boolean(a[2]),
    }
    this.__logger.debug('updateThreadParticipantAdminStatus (ignored)', a, b)
  }

  private upsertReaction(a: SimpleArgType[]) {
    this.__logger.debug('upsertReaction', a)
    const r = {
      raw: JSON.stringify(a),
      threadKey: a[0] as string,
      timestampMs: getAsDate(a[1] as string),
      messageId: a[2] as string,
      actorId: a[3] as string,
      reaction: fixEmoji(a[4] as string),
    }
    this.__papi.db
      .insert(schema.reactions)
      .values(r)
      .onConflictDoUpdate({
        target: [schema.reactions.threadKey, schema.reactions.messageId, schema.reactions.actorId],
        set: { ...r },
      })
      .run()

    return () => {
      if (this.__threadsToSync.has(r.threadKey) || this.__messagesToSync.has(r.messageId)) return

      this.__events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'message_reaction',
        objectIDs: {
          threadID: r.threadKey,
          messageID: r.messageId,
        },
        mutationType: 'upsert',
        entries: [{
          id: r.actorId,
          reactionKey: r.reaction,
          participantID: r.actorId,
          emoji: true,
        }],
      })
    }
  }

  private verifyThreadExists(a: SimpleArgType[]) {
    this.__logger.debug('verifyThreadExists', a)
    const threadId = a[0] as string
    const thread = this.__papi.db.query.threads.findFirst({
      where: eq(schema.threads.threadKey, threadId),
    })
    if (!thread) {
      this.__logger.info('thread does not exist, skipping payload and calling getThread')
      this.__pQueue.addPromise(this.__papi.socket.getThread(threadId).then(d => {
        this.__logger.debug('getThread finished', d)
      }))
    }
  }

  private getFirstAvailableAttachmentCTAID(a: SimpleArgType[]) {
    this.__logger.debug('getFirstAvailableAttachmentCTAID (ignored)', a)
  }

  private hasMatchingAttachmentCTA(a: SimpleArgType[]) {
    this.__logger.debug('hasMatchingAttachmentCTA (ignored)', a)
  }

  private computeDelayForTask(a: SimpleArgType[]) {
    this.__logger.debug('computeDelayForTask (ignored)', a)
  }

  private checkAuthoritativeMessageExists(a: SimpleArgType[]) {
    this.__logger.debug('checkAuthoritativeMessageExists (ignored)', a)
  }

  private markThreadRead(a: SimpleArgType[]) {
    this.__logger.debug('markThreadRead (ignored)', a)
  }

  private moveThreadToInboxAndUpdateParent(a: SimpleArgType[]) {
    this.__logger.debug('moveThreadToInboxAndUpdateParent (ignored)', a)
  }

  private setRegionHint(a: SimpleArgType[]) {
    this.__logger.debug('setRegionHint (ignored)', a)
  }

  private updateMessagesOptimisticContext(a: SimpleArgType[]) {
    this.__logger.debug('updateMessagesOptimisticContext (ignored)', a)
  }

  private updateParentFolderReadWatermark(a: SimpleArgType[]) {
    this.__logger.debug('updateParentFolderReadWatermark (ignored)', a)
  }

  private updateParticipantLastMessageSendTimestamp(a: SimpleArgType[]) {
    this.__logger.debug('updateParticipantLastMessageSendTimestamp (ignored)', a)
  }

  private updateThreadSnippet(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadSnippet (ignored)', a)
  }

  private writeCTAIdToThreadsTable(a: SimpleArgType[]) {
    const i = { lastMessageCtaType: a[1], lastMessageCtaTimestampMs: a[2] }
    this.__logger.debug('writeCTAIdToThreadsTable (ignored)', a, i)
  }

  private bumpThread(a: SimpleArgType[]) {
    this.__logger.debug('bumpThread (ignored)', a)
  }

  private insertSearchSection(a: SimpleArgType[]) {
    this.__logger.debug('insertSearchSection (ignored)', a)
  }

  private updateSearchQueryStatus(a: SimpleArgType[]) {
    const s = { statusPrimary: a[2] as string, endTimeMs: a[3] as string, resultCount: a[4] as string }
    this.__logger.debug('updateSearchQueryStatus (ignored)', s, a)
  }

  private upsertGradientColor(a: SimpleArgType[]) {
    this.__logger.debug('upsertGradientColor (ignored)', a)
  }

  private mailboxTaskCompletionApiOnTaskCompletion(a: SimpleArgType[]) {
    this.__logger.debug('mailboxTaskCompletionApiOnTaskCompletion (ignored)', a)
  }

  // eslint-disable-next-line class-methods-use-this
  private upsertTheme(_a: SimpleArgType[]) {
    // don't care about themes, spams the logs
    // this.__logger.debug('upsertTheme (ignored)', a)
  }

  private truncatePresenceDatabase(a: SimpleArgType[]) {
    this.__logger.debug('truncatePresenceDatabase (ignored)', a)
  }

  private appendDataTraceAddon(a: SimpleArgType[]) {
    this.__logger.debug('appendDataTraceAddon (ignored)', a)
  }

  private replaceOptimisticReaction(a: SimpleArgType[]) {
    this.__logger.debug('replaceOptimisticReaction (ignored)', a)
  }

  private issueNewTask(a: SimpleArgType[]) {
    this.__logger.debug('issueNewTask (ignored)', a)
  }

  private updateCommunityThreadStaleState(a: SimpleArgType[]) {
    this.__logger.debug('updateCommunityThreadStaleState (ignored)', a)
  }

  private updateThreadNullState(a: SimpleArgType[]) {
    const parsed: Partial<IGThread> = {
      threadPictureUrl: a[1] as string,
      threadPictureUrlFallback: a[2] as string,
      threadPictureUrlExpirationTimestampMs: Number(a[3]),
      nullstateDescriptionText1: a[4] as string,
      nullstateDescriptionType1: a[9] as string,
      nullstateDescriptionText2: a[5] as string,
      nullstateDescriptionType2: a[10] as string,
      nullstateDescriptionText3: a[6] as string,
      nullstateDescriptionType3: a[11] as string,
      capabilities: a[14] as string,
    }
    this.__logger.debug('updateThreadNullState (ignored)', a, parsed)
  }

  private updateSelectiveSyncState(a: SimpleArgType[]) {
    this.__logger.debug('updateSelectiveSyncState (ignored)', a)
  }

  private updateExtraAttachmentColumns(a: SimpleArgType[]) {
    this.__logger.debug('updateExtraAttachmentColumns (ignored)', a)
  }

  private updateSubscriptErrorMessage(a: SimpleArgType[]) {
    const parsed = {
      threadKey: a[0] as string,
      offlineThreadingID: a[1] as string,
      errorMessage: a[2] as string,
    }
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, parsed.errorMessage))
  }

  private updateUnsentMessageCollapsedStatus(a: SimpleArgType[]) {
    this.__logger.debug('updateUnsentMessageCollapsedStatus (ignored)', a)
  }

  private handleRepliesOnUnsend(a: SimpleArgType[]) {
    this.__logger.debug('handleRepliesOnUnsend (ignored)', a)
  }

  private updateForRollCallMessageDeleted(a: SimpleArgType[]) {
    this.__logger.debug('updateForRollCallMessageDeleted (ignored)', a)
  }

  private updateOptimisticEphemeralMediaState(a: SimpleArgType[]) {
    this.__logger.debug('updateOptimisticEphemeralMediaState (ignored)', a)
  }

  private updateThreadSnippetFromLastMessage(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadSnippetFromLastMessage (ignored)', a)
  }

  private updateThreadApprovalMode(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadApprovalMode (ignored)', a)
  }

  private updateParticipantCapabilities(a: SimpleArgType[]) {
    this.__logger.debug('updateParticipantCapabilities (ignored)', a)
  }

  private updateThreadInviteLinksInfo(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadInviteLinksInfo (ignored)', a)
  }

  private updateOrInsertThread(a: SimpleArgType[]) {
    this.deleteThenInsertThread(a)
  }

  private setPinnedMessage(a: SimpleArgType[]) {
    this.__logger.debug('setPinnedMessage (ignored)', a)
  }

  private truncateMetadataThreads(a: SimpleArgType[]) {
    this.__logger.debug('truncateMetadataThreads (ignored)', a)
  }

  private truncateThreadRangeTablesForSyncGroup(a: SimpleArgType[]) {
    this.__logger.debug('truncateThreadRangeTablesForSyncGroup (ignored)', a)
  }

  private updateThreadAuthorityAndMappingWithOTIDFromJID(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadAuthorityAndMappingWithOTIDFromJID (ignored)', a)
  }

  private transportHybridParticipantUpdateReceipts(a: SimpleArgType[]) {
    this.__logger.debug('transportHybridParticipantUpdateReceipts (ignored)', a)
  }

  private shimCopyAllParticipantNicknamesForThread(a: SimpleArgType[]) {
    this.__logger.debug('shimCopyAllParticipantNicknamesForThread (ignored)', a)
  }

  private hybridThreadDelete(a: SimpleArgType[]) {
    this.__logger.debug('hybridThreadDelete (ignored)', a)
  }

  private upsertFolder(a: SimpleArgType[]) {
    this.__logger.debug('upsertFolder (ignored)', a)
  }

  private verifyHybridThreadExists(a: SimpleArgType[]) {
    this.__logger.debug('verifyHybridThreadExists (ignored)', a)
  }

  private insertStickerAttachment(a: SimpleArgType[]) {
    this.__logger.debug('insertStickerAttachment (ignored)', a)
  }
}
