import {
  ActivityType,
  ServerEventType,
  type ServerEvent,
  type StateSyncEvent,
  type ThreadMessagesRefreshEvent,
  type UserActivityEvent,
} from '@textshq/platform-sdk'
import { and, eq, lt } from 'drizzle-orm'
import { pick } from 'lodash'
import { smartJSONStringify } from '@textshq/platform-sdk/dist/json'
import type PlatformMetaMessenger from './api'
import * as schema from './store/schema'
import { getLogger } from './logger'
import { LSParser, type SimpleArgType } from './ls-parser'
import { fixEmoji, getOriginalURL, parseMessageRanges, parseMs, parseMsAsDate } from './util'
import {
  ParentThreadKey,
  SocketRequestResolverType,
  SyncChannel,
  type IGAttachment,
  type IGMessage,
  type IGMessageRanges,
  type IGReadReceipt,
  type IGThread,
} from './types'
import { mapParticipants } from './mappers'
import { QueryWhereSpecial } from './store/helpers'
import { MetaMessengerError } from './errors'
import * as mappers from './ls-sp-mappers'

type SearchArgumentType = 'user' | 'group' | 'unknown_user'

export interface MetaMessengerPayloadHandlerResponse {
  replaceOptimsiticMessage?: { // typo here is intentional, Meta names it like that
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
    isVerified: boolean
    cannotMessage: boolean
  }[]
  executeFirstBlockForSyncTransaction?: ReturnType<typeof mappers.executeFirstBlockForSyncTransaction>[]
}

type DbTransaction = Parameters<PlatformMetaMessenger['db']['transaction']>[0]

export default class MetaMessengerPayloadHandler {
  private readonly __logger: ReturnType<typeof getLogger>

  private readonly __parser = new LSParser()

  private __promises: Promise<unknown>[] = []

  private __sql: ((db: Parameters<DbTransaction>[0]) => ReturnType<DbTransaction>)[] = []

  private __afterCallbacks: (() => Promise<void> | void)[] = []

  private __threadsToSync = new Set<string>()

  private __messagesToSync = new Set<string>()

  private __messagesToIgnore = new Set<string>()

  private __responses: MetaMessengerPayloadHandlerResponse = {}

  private __errors: MetaMessengerError[] = []

  private __events: (StateSyncEvent | ThreadMessagesRefreshEvent | UserActivityEvent)[] = []

  constructor(
    private readonly __papi: PlatformMetaMessenger,
    __data: string,
    private readonly __requestId: number | 'initial' | 'snapshot',
  ) {
    this.__logger = getLogger(this.__papi.env, `payload:${this.__requestId}:${Date.now()}`)
    const payload = JSON.parse(__data)
    this.__parser.decode(payload.step)
  }

  async __handle() {
    const reqId = typeof this.__requestId === 'number' ? this.__requestId : undefined
    const { requestResolvers } = this.__papi.socket
    const hasResolver = requestResolvers.has(reqId)

    await this.__run()

    const hasErrors = this.__errors.length > 0

    if (hasErrors) {
      if (hasResolver) {
        requestResolvers.reject(reqId, this.__errors[0])
      }

      const errorEvents: ServerEvent[] = []

      this.__errors.forEach((err, i) => {
        this.__logger.error(err)
        if ((hasResolver && i === 0) || err?.isToastDisabled) return
        errorEvents.push({
          type: ServerEventType.TOAST,
          toast: {
            text: err?.getPublicMessage?.() || err?.toString?.() || `Unknown error: ${smartJSONStringify(err)}`,
          },
        })
      })

      if (errorEvents.length > 0) this.__papi.onEvent(errorEvents)
    }

    if (
      this.__requestId !== 'initial'
      && this.__requestId !== 'snapshot'
      // && this.__papi.api.initResolved
    ) {
      await this.__sync()
    }

    // wait for everything to be synced before resolving
    if (hasResolver && !hasErrors) {
      // this.__logger.debug(`resolved request for type ${requestType}`, this.__responses)
      requestResolvers.resolve(reqId, this.__responses)
    }

    if (this.__promises.length > 0) {
      await Promise.allSettled(this.__promises)
    }
  }

  private __run = async () => {
    for (const { procedure, args } of this.__parser.payloads) {
      if (procedure.startsWith('__')) {
        // we assume meta doesn't send any methods that start with __
        // this is to prevent any potential security issues
        // better way to handle this is prefixing the handlers or putting them in another class
        // but this is a quick "fix" that should work
        throw new MetaMessengerError(this.__papi.env, -1, `called a reserved method (${procedure})`)
      }

      const isValidMethod = procedure in this && typeof this[procedure] === 'function'
      if (!isValidMethod) {
        this.__logger.warn(`missing handler (${procedure})`, args)
        this.__errors.push(new MetaMessengerError(this.__papi.env, -1, `missing handler (${procedure})`, undefined, undefined, true))
        continue
      }

      try {
        const call = this[procedure].bind(this)
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
              `failed to call method (${procedure})`,
              typeof err === 'string' ? err : err.message,
              {
                error: err.toString(),
                // args: smartJSONStringify(args), // @IMPORTANT@ This creates privacy issues
              },
            ),
          )
        }
      }
    }

    try {
      await this.__papi.db.transaction(async tx => {
        await Promise.all(this.__sql.map(sql => sql(tx)))
      }, {
        behavior: 'exclusive',
      })
    } catch (e) {
      this.__logger.error(e)
    }
  }

  private __sync = async (): Promise<void> => {
    for (const callback of this.__afterCallbacks) {
      await callback()
    }

    const toSync: StateSyncEvent[] = []
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

    const finalEvents = [...toSync, ...this.__events].filter(Boolean)
    if (finalEvents.length > 0) {
      this.__papi.onEvent(finalEvents)
      this.__events = []
    }
  }

  private __syncMessageRanges = async (r: IGMessageRanges) => {
    const { threadKey, ...newRanges } = r
    this.__logger.debug('__syncMessageRanges', threadKey, newRanges)

    await this.__papi.db.transaction(async tx => {
      const currentRanges = tx.select({
        ranges: schema.threads.ranges,
      }).from(schema.threads).where(eq(schema.threads.threadKey, threadKey)).get()

      const ranges = {
        ...parseMessageRanges(currentRanges?.ranges),
        ...r,
      }

      tx.update(schema.threads).set({
        ranges: smartJSONStringify(ranges),
      }).where(eq(schema.threads.threadKey, threadKey)).run()
    })

    if (this.__papi.api.messageRangeResolvers.hasKey(threadKey)) {
      this.__papi.api.messageRangeResolvers.resolveByKey(threadKey, newRanges)
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
    const { fbid } = this.__papi.api.config
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

  private __upsertMessageAndSync(m: IGMessage) {
    this.__logger.debug('__upsertMessageAndSync', m.threadKey, m.messageId, m.timestampMs, m.text)

    if (this.__papi.api.sendMessageResolvers.hasKey(m.offlineThreadingId)) {
      this.__papi.api.sendMessageResolvers.resolveByKey(m.offlineThreadingId, {
        replaceOptimsiticMessage: {
          messageId: m.messageId,
          offlineThreadingId: m.offlineThreadingId,
        },
      })
    }

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

  private addParticipantIdToGroupThread(a: SimpleArgType[]) {
    this.__logger.debug('addParticipantIdToGroupThread', a)
    const p = {
      threadKey: a[0] as string,
      userId: a[1] as string,
      readWatermarkTimestampMs: parseMsAsDate(a[2]),
      readActionTimestampMs: parseMsAsDate(a[3]),
      deliveredWatermarkTimestampMs: parseMsAsDate(a[4]),
      // lastDeliveredWatermarkTimestampMs: parseMsAsDate(a[5]])),
      lastDeliveredActionTimestampMs: a[5] ? parseMsAsDate(a[5]) : null,
      isAdmin: Boolean(a[6]),
    }

    this.__sql.push(tx => tx.insert(schema.participants).values(p).onConflictDoUpdate({
      target: [schema.participants.threadKey, schema.participants.userId],
      set: { ...p },
    }).run())

    return async () => {
      if (this.__threadsToSync.has(p.threadKey)) return

      const { contacts } = await this.__papi.api.getOrRequestContactsIfNotExist([p.userId])
      if (contacts.length === 0) return

      const contact = contacts[0]
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

  private appendDataTraceAddon(a: SimpleArgType[]) {
    this.__logger.debug('appendDataTraceAddon (ignored)', a)
  }

  private applyAdminMessageCTA(a: SimpleArgType[]) {
    this.__logger.debug('applyAdminMessageCTA (ignored)', a)
  }

  private applyNewGroupThread(a: SimpleArgType[]) {
    const parsed = {
      otidOfFirstMessage: a[0],
      threadKey: a[1],
      // mailboxType: b.i64.cast([0, 0]),
      threadType: a[2],
      folderName: a[3],
      parentThreadKey: a[4],
      threadPictureUrlFallback: a[5],
      lastActivityTimestampMs: a[6],
      lastReadWatermarkTimestampMs: a[6],
      // ongoingCallState: b.i64.cast([0, 0]),
      nullstateDescriptionText1: a[8],
      nullstateDescriptionType1: a[9],
      nullstateDescriptionText2: a[10],
      nullstateDescriptionType2: a[11],
      cannotUnsendReason: a[12],
      capabilities: a[13],
      // capabilities2: b.i64.cast([0, 0]),
      // capabilities3: b.i64.cast([0, 0]),
      // authorityLevel: b.i64.cast([0, 80]),
      // unsendLimitMs: b.i64.cast([-1, 4294967295]),
      inviterId: a[14],
      igFolder: a[15],
      threadSubtype: a[16],
    }
    this.__logger.debug('applyNewGroupThread (ignored)', a, parsed)
  }

  private bumpThread(a: SimpleArgType[]) {
    this.__logger.debug('bumpThread (ignored)', a)
  }

  private changeViewerStatus(a: SimpleArgType[]) {
    this.__logger.debug('changeViewerStatus (ignored)', a)
  }

  private checkAuthoritativeMessageExists(a: SimpleArgType[]) {
    this.__logger.debug('checkAuthoritativeMessageExists (ignored)', a)
  }

  private clearPinnedMessages(a: SimpleArgType[]) {
    this.__logger.debug('clearPinnedMessages (ignored)', a)
  }

  private computeDelayForTask(a: SimpleArgType[]) {
    this.__logger.debug('computeDelayForTask (ignored)', a)
  }

  private async deleteExistingMessageRanges(a: SimpleArgType[]) {
    const threadKey = a[0] as string
    this.__logger.debug('deleteExistingMessageRanges', threadKey)
    // const threadExists = await this.__papi.db.query.threads.findFirst({
    //   where: eq(schema.threads.threadKey, a[0] as string),
    //   columns: {
    //     threadKey: true,
    //     ranges: true,
    //   },
    // })
    // if (!threadExists || (threadExists && !threadExists.ranges)) return
    // this.__papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadKey)).run()
  }

  private deleteMessage(a: SimpleArgType[]) {
    const threadID = a[0] as string
    const messageID = a[1] as string
    this.__logger.debug('deleteMessage', a, { threadID, messageID })
    this.__sql.push(tx => tx.delete(schema.messages).where(and(
      eq(schema.messages.threadKey, threadID),
      eq(schema.messages.messageId, messageID),
    )).run())

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

    this.__sql.push(tx => tx.delete(schema.reactions).where(and(
      eq(schema.reactions.threadKey, threadID),
      eq(schema.reactions.messageId, messageID),
      eq(schema.reactions.actorId, actorID),
    )).run())

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

  private deleteRtcOngoingCallData(a: SimpleArgType[]) {
    this.__logger.debug('deleteRtcOngoingCallData (ignored)', a)
  }

  private deleteThenInsertContact(a: SimpleArgType[]) {
    const parsed = mappers.deleteThenInsertContact(a)
    const { id, name, profilePictureUrl, secondaryName: username, ...contact } = parsed

    this.__logger.debug('deleteThenInsertContact', a, parsed)

    this.__sql.push(db => {
      db.delete(schema.contacts).where(eq(schema.contacts.id, id)).run()
      db.insert(schema.contacts).values({
        id,
        name,
        profilePictureUrl,
        username,
        contact: JSON.stringify(contact),
      } as const).run()
    })

    return () => {
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
  }

  private deleteThenInsertContactPresence(a: SimpleArgType[]) {
    const p = {
      contactId: a[0] as string,
      status: a[1] as string,
      expirationTimestampMs: parseMsAsDate(a[3]),
      lastActiveTimestampMs: parseMsAsDate(a[2]),
      capabilities: a[4] as string,
      publishId: a[5] as string,
    }
    this.__logger.debug('deleteThenInsertContactPresence (ignored)', a, p)
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
    this.__sql.push(tx => tx.insert(schema.contacts).values({
      id: contactId,
      igContact,
    }).onConflictDoUpdate({
      target: schema.contacts.id,
      set: { igContact },
    }).run())
  }

  private deleteThenInsertIgThreadInfo(a: SimpleArgType[]) {
    const threadKey = a[0] as string
    const igThreadId = a[1] as string
    this.__logger.debug('deleteThenInsertIgThreadInfo', { threadKey, igThreadId })
    this.__sql.push(tx => tx.update(schema.threads).set({
      threadKey,
      igThread: JSON.stringify({ igThreadId }),
    }).where(eq(schema.threads.threadKey, threadKey)).run())
  }

  private deleteThenInsertMessage(a: SimpleArgType[]) {
    this.__logger.debug('deleteThenInsertMessage', a)
    return this.__upsertMessageAndSync({
      threadKey: a[3] as string,
      timestampMs: parseMs(a[5]),
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
      unsentTimestampMs: parseMs(a[18]),
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
      replyMediaExpirationTimestampMs: parseMs(a[30]),
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
      replySourceTimestampMs: parseMs(a[56]),
      ephemeralDurationInSec: a[57] as string,
      msUntilExpirationTs: parseMs(a[58]),
      ephemeralExpirationTs: parseMs(a[59]),
      takedownState: a[60] as string,
      isCollapsed: Boolean(a[61]),
      subthreadKey: a[62] as string,
    })
  }

  private deleteThenInsertMessageRequest(a: SimpleArgType[]) {
    this.__logger.debug('deleteThenInsertMessageRequest (ignored)', a)
  }

  private deleteThenInsertThread(a: SimpleArgType[]) {
    const thread = {
      // isUnread: Number(a[0][1]) > Number(a[1][1]),
      lastReadWatermarkTimestampMs: parseMs(a[1]),
      // threadType: a[9][1] === '1' ? 'single' : 'group',
      threadType: a[9],
      folderName: a[10] as string,
      parentThreadKey: Number(a[35]),
      lastActivityTimestampMs: parseMs(a[0]),
      snippet: a[2],
      threadPictureUrl: a[4],
      needsAdminApprovalForNewParticipant: a[5],
      threadPictureUrlFallback: a[11],
      threadPictureUrlExpirationTimestampMs: parseMs(a[12]),
      removeWatermarkTimestampMs: parseMs(a[13]),
      muteExpireTimeMs: parseMs(a[14]),
      // muteCallsExpireTimeMs: parseMs(a[15][1]),
      groupNotificationSettings: a[16],
      isAdminSnippet: a[17],
      snippetSenderContactId: a[18],
      snippetStringHash: a[21],
      snippetStringArgument1: a[22],
      snippetAttribution: a[23],
      snippetAttributionStringHash: a[24],
      disappearingSettingTtl: a[25],
      disappearingSettingUpdatedTs: parseMs(a[26]),
      disappearingSettingUpdatedBy: a[27],
      cannotReplyReason: a[30],
      customEmoji: a[31],
      customEmojiImageUrl: a[32],
      outgoingBubbleColor: a[33],
      themeFbid: a[34],
      authorityLevel: 0,
      mailboxType: a[8],
      muteMentionExpireTimeMs: parseMs(a[15]),
      muteCallsExpireTimeMs: parseMs(a[16]),
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
      lastMessageCtaTimestampMs: parseMs(a[67]),
      consistentThreadFbid: a[68],
      threadDescription: a[70],
      unsendLimitMs: parseMs(a[71]),
      capabilities2: a[79],
      capabilities3: a[80],
      syncGroup: a[83],
      threadInvitesEnabled: a[84],
      threadInviteLink: a[85],
      isAllUnreadMessageMissedCallXma: a[86],
      lastNonMissedCallXmaMessageTimestampMs: parseMs(a[87]),
      threadInvitesEnabledV2: a[89],
      hasPendingInvitation: a[92],
      eventStartTimestampMs: parseMs(a[93]),
      eventEndTimestampMs: parseMs(a[94]),
      takedownState: a[95],
      secondaryParentThreadKey: a[96],
      igFolder: a[97],
      inviterId: a[98],
      threadTags: a[99],
      threadStatus: a[100],
      threadSubtype: a[101],
      pauseThreadTimestamp: parseMs(a[102]),
      threadName: Array.isArray(a[3]) ? null : a[3],
    } as const
    const threadKey = a[7] as string
    this.__logger.debug('deleteThenInsertThread', a, { threadKey, thread })

    this.__sql.push(db => {
      db.delete(schema.threads).where(eq(schema.threads.threadKey, threadKey)).run()
      db.insert(schema.threads).values({
        threadKey,
        folderName: thread.folderName,
        parentThreadKey: thread.parentThreadKey,
        lastActivityTimestampMs: new Date(thread.lastActivityTimestampMs),
        thread: JSON.stringify(thread),
      }).run()
    })

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

    this.__sql.push(db => {
      db.delete(schema.attachments).where(eq(schema.attachments.threadKey, threadID)).run()
      db.delete(schema.messages).where(eq(schema.messages.threadKey, threadID)).run()
      db.delete(schema.participants).where(eq(schema.participants.threadKey, threadID)).run()
      db.delete(schema.threads).where(eq(schema.threads.threadKey, threadID)).run()
    })

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

  private executeFinallyBlockForSyncTransaction(a: SimpleArgType[]) {
    this.__logger.debug('executeFinallyBlockForSyncTransaction (ignored)', a)
  }

  private executeFirstBlockForSyncTransaction(a: SimpleArgType[]) {
    const data = mappers.executeFirstBlockForSyncTransaction(a)
    if (!this.__responses.executeFirstBlockForSyncTransaction?.length) {
      this.__responses.executeFirstBlockForSyncTransaction = []
    }
    this.__responses.executeFirstBlockForSyncTransaction.push(data)
    this.__papi.kv.set(`cursor-${Number(data.databaseId)}-${data.syncChannel}`, data.nextCursor)
  }

  private getFirstAvailableAttachmentCTAID(a: SimpleArgType[]) {
    this.__logger.debug('getFirstAvailableAttachmentCTAID (ignored)', a)
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

  private handleRepliesOnUnsend(a: SimpleArgType[]) {
    this.__logger.debug('handleRepliesOnUnsend (ignored)', a)
  }

  private handleSyncFailure(a: SimpleArgType[]) {
    // @TODO: we don't know how to parse this error yet
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, 'unknown error', JSON.stringify(a), {
      issuedByMethod: 'handleSyncFailure',
    }))
  }

  private hasMatchingAttachmentCTA(a: SimpleArgType[]) {
    this.__logger.debug('hasMatchingAttachmentCTA (ignored)', a)
  }

  private hybridThreadDelete(a: SimpleArgType[]) {
    this.__logger.debug('hybridThreadDelete (ignored)', a)
  }

  private insertQuickReplyCTA(a: SimpleArgType[]) {
    this.__logger.debug('insertQuickReplyCTA (ignored)', a)
  }

  private async insertAttachment(a: SimpleArgType[]) {
    const r = {
      threadKey: a[32] as string,
      messageId: a[37] as string,
      attachmentFbid: a[39] as string,
      hasMedia: a[3] as boolean,
      isSharable: a[4] as boolean,
      attachmentType: a[34] as string,
      timestampMs: parseMs(a[36]),
      hasXma: a[40] as boolean,
      authorityLevel: a[124] as string,
      filename: a[1] as string,
      filesize: Number(a[2]),
      playableUrl: a[5] as string,
      playableUrlFallback: a[6] as string,
      playableUrlExpirationTimestampMs: parseMs(a[7]),
      playableUrlMimeType: a[8] as string,
      dashManifest: a[9] as string,
      previewUrl: a[10] as string,
      previewUrlFallback: a[11] as string,
      previewUrlExpirationTimestampMs: parseMs(a[12]),
      previewUrlMimeType: a[13] as string,
      miniPreview: a[15] as string,
      previewWidth: Number(a[16]),
      previewHeight: Number(a[17]),
      imageUrlMimeType: a[18] as string,
      attributionAppId: a[19] as string,
      attributionAppName: a[20] as string,
      attributionAppIcon: a[21] as string,
      attributionAppIconFallback: a[22] as string,
      attributionAppIconUrlExpirationTimestampMs: parseMs(a[23]),
      localPlayableUrl: a[24] as string,
      playableDurationMs: parseMs(a[25]),
      attachmentIndex: a[26] as string,
      decryptionKey: a[27], // TODO: what is this?
      accessibilitySummaryText: a[28] as string,
      isPreviewImage: a[29] as boolean,
      originalFileHash: a[30] as string,
      shouldRespectServerPreviewSize: a[31] as boolean,
      offlineAttachmentId: a[38] as string,
      xmaLayoutType: a[41] as string,
      xmasTemplateType: a[42] as string,
      collapsibleId: a[43] as string,
      defaultCtaId: a[44] as string,
      defaultCtaTitle: a[45] as string,
      defaultCtaType: a[46] as string,
      attachmentCta1Id: a[48] as string,
      cta1Title: a[49] as string,
      cta1IconType: a[50] as string,
      cta1Type: a[51] as string,
      attachmentCta2Id: a[53] as string,
      cta2Title: a[54] as string,
      cta2IconType: a[55] as string,
      cta2Type: a[56] as string,
      attachmentCta3Id: a[58] as string,
      cta3Title: a[59] as string,
      cta3IconType: a[60] as string,
      cta3Type: a[61] as string,
      imageUrl: a[62] as string,
      imageUrlFallback: a[63] as string,
      imageUrlExpirationTimestampMs: parseMs(a[64]),
      actionUrl: a[65] as string,
      titleText: a[66] as string,
      subtitleText: a[67] as string,
      maxTitleNumOfLines: a[68] as string,
      maxSubtitleNumOfLines: a[69] as string,
      descriptionText: a[70] as string,
      sourceText: a[71] as string,
      faviconUrl: a[72] as string,
      faviconUrlFallback: a[73] as string,
      faviconUrlExpirationTimestampMs: parseMs(a[74]),
      originalPageSenderId: a[75] as string,
      listItemsId: a[77] as string,
      listItemsDescriptionText: a[78] as string,
      listItemsSecondaryDescriptionText: a[79] as string,
      listItemId1: a[80] as string,
      listItemTitleText1: a[81] as string,
      listItemContactUrlList1: a[82] as string,
      listItemProgressBarFilledPercentage1: a[83] as string,
      listItemContactUrlExpirationTimestampList1: a[84] as string,
      listItemContactUrlFallbackList1: a[85] as string,
      listItemTotalCount1: a[86] as string,
      listItemId2: a[87] as string,
      listItemTitleText2: a[88] as string,
      listItemContactUrlList2: a[89] as string,
      listItemProgressBarFilledPercentage2: a[90] as string,
      listItemContactUrlExpirationTimestampList2: a[91] as string,
      listItemContactUrlFallbackList2: a[92] as string,
      listItemTotalCount2: a[93] as string,
      listItemId3: a[94] as string,
      listItemTitleText3: a[95] as string,
      listItemContactUrlList3: a[96] as string,
      listItemContactUrlExpirationTimestampList3: a[98] as string,
      listItemContactUrlFallbackList3: a[99] as string,
      listItemTotalCount3: a[100] as string,
      isBorderless: a[101] as boolean,
      headerImageUrlMimeType: a[102] as string,
      headerTitle: a[103] as string,
      headerSubtitleText: a[104] as string,
      headerImageUrl: a[105] as string,
      headerImageUrlFallback: a[106] as string,
      headerImageUrlExpirationTimestampMs: parseMs(a[107]),
      previewImageDecorationType: a[108] as string,
      shouldHighlightHeaderTitleInTitle: a[109] as string,
      targetId: a[110] as string,
      ephemeralMediaState: a[114] as string,
      viewerSeenTimestampMs: parseMs(a[115]),
      gatingType: a[116] as string,
      gatingTitle: a[117] as string,
      targetExpiryTimestampMs: parseMs(a[118]),
      countdownTimestampMs: parseMs(a[119]),
      shouldBlurSubattachments: a[120] as string,
      verifiedType: a[121] as string,
      igStoryReplyType: a[122] as string,
      isAttachmentConsumed: a[123] as boolean,
    }

    this.__logger.debug('insertAttachment', r)
    const { messageId } = await this.__papi.api.upsertAttachment(r)

    return () => this.__syncAttachment(r.threadKey, messageId)
  }

  private async insertAttachmentCta(a: SimpleArgType[]) {
    const r = {
      ctaId: a[0],
      attachmentFbid: a[1],
      attachmentIndex: a[2],
      threadKey: a[3],
      messageId: a[5] as string,
      title: a[6],
      type_: a[7],
      platformToken: a[8],
      actionUrl: a[9] as string,
      nativeUrl: a[10],
      urlWebviewType: a[11],
      actionContentBlob: a[12],
      enableExtensions: a[13],
      extensionHeightType: a[14],
      targetId: a[15],
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

    let assetURL: string
    if (r?.title === 'attachment' && r?.type_ === 'xma_web_url' && r.actionUrl?.startsWith('https://www.instagram.com/stories/')) {
      // https://www.instagram.com/stories/ogzcn/3195371052958782801?reel_id=3660493&reel_owner_id=3660493
      try {
        const reelUrl = new URL(r.actionUrl)
        const [,_reelType, username, mediaId] = reelUrl.pathname.split('/')
        const reelId = reelUrl.searchParams.get('reel_id')
        assetURL = `asset://$accountID/attachment/ig_reel/${mediaId}/${reelId}/${username}`
      } catch (e) {
        this.__logger.error('insertAttachmentCta', e)
      }
    }

    if (r.actionUrl && r.actionUrl !== 'null') {
      // const a = this.__papi.db.query.attachments.findFirst({
      //   where: eq(schema.attachments.attachmentFbid, r.attachmentFbid!),
      // })
      // const attachment = JSON.parse(a.attachment) as IGAttachment
      const parsedMessage = JSON.parse(messages.message) as IGMessage

      const mediaLink = r.actionUrl.startsWith('/') ? `https://www.instagram.com${r.actionUrl}` : getOriginalURL(r.actionUrl) // @TODO: add env support

      this.__logger.debug('insertAttachmentCta mediaLink', mediaLink)
      const INSTAGRAM_PROFILE_BASE_URL = 'https://www.instagram.com/_u/' // @TODO: add env support
      if (mediaLink.startsWith(INSTAGRAM_PROFILE_BASE_URL)) {
        parsedMessage.extra = {
          assetURL,
        }
        parsedMessage.links = [{
          url: mediaLink,
          title: `@${mediaLink.replace(INSTAGRAM_PROFILE_BASE_URL, '')} on Instagram`,
        }]
      } else if (mediaLink.startsWith(`https://${this.__papi.envOpts.domain}/`)) {
        parsedMessage.extra = {
          mediaLink,
          assetURL,
        }
      } else {
        parsedMessage.links = [{
          url: mediaLink,
          title: parsedMessage.replySnippet,
        }]
      }

      const newMessage = JSON.stringify(parsedMessage)
      this.__logger.debug('insertAttachmentCta newMessage', newMessage)

      this.__sql.push(tx => tx.update(schema.messages).set({ message: newMessage }).where(eq(schema.messages.messageId, r.messageId!)).run())

      // if (r.actionUrl.startsWith('/')) {
      //   mparse.links = [{ url: `https://www.instagram.com${r.actionUrl}/` }]
      // } else {
      //   mparse.links = [{ url: r.actionUrl }]
      // }
    }
  }

  private async insertAttachmentItem(a: SimpleArgType[]) {
    const {
      threadKey,
      messageId,
      attachmentFbid,
      ...attachment
    } = {
      attachmentFbid: a[0] as string,
      attachmentIndex: a[1],
      threadKey: a[2] as string,
      messageId: a[4] as string,
      defaultActionEnableExtensions: a[30],
      originalPageSenderId: a[7],
      titleText: a[8],
      subtitleText: a[9],
      playableUrl: a[12],
      playableUrlFallback: a[13],
      playableUrlExpirationTimestampMs: a[14],
      playableUrlMimeType: a[15],
      dashManifest: a[16],
      previewUrl: a[17],
      previewUrlFallback: a[18],
      previewUrlExpirationTimestampMs: a[19],
      previewUrlMimeType: a[20],
      previewWidth: a[21],
      previewHeight: a[22],
      imageUrl: a[23],
      defaultCtaId: a[24],
      defaultCtaTitle: a[25],
      defaultCtaType: a[26],
      defaultButtonType: a[28],
      defaultActionUrl: a[29],
      defaultWebviewHeightRatio: a[32],
      attachmentCta1Id: a[34],
      cta1Title: a[35],
      cta1IconType: a[36],
      cta1Type: a[37],
      attachmentCta2Id: a[39],
      cta2Title: a[40],
      cta2IconType: a[41],
      cta2Type: a[42],
      attachmentCta3Id: a[44],
      cta3Title: a[45],
      cta3IconType: a[46],
      cta3Type: a[47],
      faviconUrl: a[48],
      faviconUrlFallback: a[49],
      faviconUrlExpirationTimestampMs: a[50],
      previewUrlLarge: a[51],
    }
    this.__logger.debug('insertAttachmentItem (ignored)', a, {
      threadKey,
      messageId,
      attachmentFbid,
      attachment,
    })

    //
    // const current = await this.__papi.db.query.attachments.findFirst({
    //   columns: {
    //     attachment: true,
    //   },
    //   where: and(
    //     eq(schema.attachments.threadKey, threadKey),
    //     eq(schema.attachments.messageId, messageId),
    //     eq(schema.attachments.attachmentFbid, attachmentFbid),
    //   ),
    // })
    //
    // const mapped = {
    //   threadKey,
    //   messageId,
    //   attachmentFbid,
    //   attachment: JSON.stringify({
    //     ...(current?.attachment ? JSON.parse(current.attachment) : {}),
    //     ...attachment,
    //   }),
    // }
    //
    // this.__papi.db.insert(schema.attachments).values(mapped).onConflictDoUpdate({
    //   target: [schema.attachments.threadKey, schema.attachments.messageId, schema.attachments.attachmentFbid],
    //   set: { ...mapped },
    // }).run()
  }

  private async insertBlobAttachment(a: SimpleArgType[]) {
    const ba: IGAttachment = {
      filename: a[0] as string,
      threadKey: a[27] as string,
      messageId: a[32] as string,
      previewUrl: a[8] as string,
      previewUrlFallback: a[9] as string,
      previewUrlExpirationTimestampMs: parseMs(a[10]),
      previewUrlMimeType: a[11] as string,
      previewWidth: Number(a[14]),
      previewHeight: Number(a[15]),
      timestampMs: parseMs(a[31]),
      attachmentType: a[29] as string,
      attachmentFbid: a[34] as string,
      filesize: Number(a[1]),
      hasMedia: Boolean(a[2]),
      playableUrl: a[3] as string,
      playableUrlFallback: a[4] as string,
      playableUrlExpirationTimestampMs: parseMs(a[5]),
      playableUrlMimeType: a[6] as string,
      dashManifest: a[7] as string,
      miniPreview: a[13] as string,
      attributionAppId: a[16] as string,
      attributionAppName: a[17] as string,
      isSharable: !1,
      attributionAppIcon: a[18] as string,
      attributionAppIconFallback: a[19] as string,
      attributionAppIconUrlExpirationTimestampMs: parseMs(a[20]),
      localPlayableUrl: a[21] as string,
      playableDurationMs: parseMs(a[22]),
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
      faviconUrlExpirationTimestampMs: parseMs(a[42]),
      isBorderless: Boolean(a[44]),
      previewUrlLarge: a[45] as string,
      samplingFrequencyHz: Number(a[46]),
      waveformData: a[47] as string,
      authorityLevel: a[48] as string,
    }
    this.__logger.debug('insertBlobAttachment', a, ba)
    const { messageId } = await this.__papi.api.upsertAttachment(ba)

    return async () => {
      await this.__syncAttachment(ba.threadKey, messageId)
    }
  }

  private insertIcebreakerData(a: SimpleArgType[]) {
    this.__logger.debug('insertIcebreakerData (ignored)', a)
  }

  private insertMessage(a: SimpleArgType[]) {
    this.__logger.debug('insertMessage', a)
    return this.__upsertMessageAndSync({
      links: null,
      threadKey: a[3] as string,
      timestampMs: parseMs(a[5] as string),
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
      unsentTimestampMs: parseMs(a[18]),
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
      replyMediaExpirationTimestampMs: parseMs(a[30]),
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
      replySourceTimestampMs: parseMs(a[56]),
      ephemeralDurationInSec: a[57] as string,
      msUntilExpirationTs: parseMs(a[58]),
      ephemeralExpirationTs: parseMs(a[59]),
      takedownState: a[60] as string,
      isCollapsed: Boolean(a[61]),
      subthreadKey: a[62] as string,
    })
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
    await this.__syncMessageRanges(msgRange)
  }

  private insertSearchResult(a: SimpleArgType[]) {
    const r = {
      query: a[0],
      resultId: a[1] as string,
      globalIndex: a[2],
      type_: a[3],
      threadType: a[4] as string,
      displayName: a[5] as string,
      profilePicUrl: a[6] as string,
      secondaryProfilePicUrl: a[7],
      contextLine: a[8] as string,
      messageId: a[9],
      messageTimestampMs: a[10],
      blockedByViewerStatus: a[11],
      isVerified: Boolean(a[12]),
      isInteropEligible: a[13],
      restrictionType: a[14],
      isGroupsXacEligible: a[15],
      canViewerMessage: a[18] as boolean,
      isInvitedToCmChannel: a[16],
      isEligibleForCmInvite: a[17],
      isWaAddressable: a[19],
      waEligibility: a[20],
      isArmadilloTlcEligible: a[21],
      communityId: a[22],
      otherUserId: a[23],
      threadJoinLinkHash: a[24],
      supportsE2eeSpamdStorage: a[25],
      defaultE2eeThreads: a[26],
      isRestrictedByViewer: a[27],
      defaultE2eeThreadOneToOne: a[28],
      hasCutoverThread: a[29],
      isViewerUnconnected: a[30],
      resultIgid: a[31],
    } as const
    this.__logger.debug('insertSearchResult', a, r)
    if (!this.__responses.insertSearchResult || !this.__responses.insertSearchResult.length) this.__responses.insertSearchResult = []
    this.__responses.insertSearchResult.push({
      id: r.resultId,
      type: (r.threadType === '1' ? 'user' : r.threadType === '2' ? 'group' : 'unknown_user') as SearchArgumentType,
      fullName: r.displayName,
      username: r.type_ === '9' ? r.contextLine : null, // type_ is instagram username
      imgURL: r.profilePicUrl,
      isVerified: r.isVerified,
      cannotMessage: !r.canViewerMessage,
    })
  }

  private insertSearchSection(a: SimpleArgType[]) {
    this.__logger.debug('insertSearchSection (ignored)', a)
  }

  private async insertStickerAttachment(a: SimpleArgType[]) {
    const sticker: IGAttachment = {
      attachmentType: undefined,
      attributionAppIcon: undefined,
      attributionAppIconFallback: undefined,
      attributionAppIconUrlExpirationTimestampMs: 0,
      attributionAppId: undefined,
      attributionAppName: undefined,
      descriptionText: undefined,
      filename: undefined,
      filesize: 0,
      isBorderless: false,
      offlineAttachmentId: undefined,
      previewUrlLarge: undefined,
      sourceText: undefined,
      subtitleText: undefined,
      titleText: undefined,
      xmaLayoutType: undefined,
      xmasTemplateType: undefined,
      threadKey: a[14] as string,
      messageId: a[18] as string,
      attachmentFbid: a[19] as string,
      hasMedia: true,
      isSharable: false,
      playableUrl: a[0] as string,
      playableUrlFallback: a[1] as string,
      playableUrlExpirationTimestampMs: a[2] as number,
      playableUrlMimeType: a[3] as string,
      previewUrl: a[4] as string,
      previewUrlFallback: a[5] as string,
      previewUrlExpirationTimestampMs: a[6] as number,
      previewUrlMimeType: a[7] as string,
      previewWidth: a[9] as number,
      previewHeight: a[10] as number,
      imageUrlMimeType: a[11] as string,
      attachmentIndex: a[12] as string,
      accessibilitySummaryText: a[13] as string,
      // attachmentType: b.i64.cast([0, 1]),
      timestampMs: a[17] as number,
      hasXma: false,
      imageUrl: a[20] as string,
      imageUrlFallback: a[21] as string,
      imageUrlExpirationTimestampMs: a[22] as number,
      faviconUrlExpirationTimestampMs: a[23] as number,
      avatarViewSize: a[25] as number,
      avatarCount: a[26] as number,
      targetId: a[27] as string,
      mustacheText: a[30] as string,
      authorityLevel: a[31] as string,
    }
    this.__logger.debug('insertStickerAttachment', sticker)

    const { messageId } = await this.__papi.api.upsertAttachment(sticker)
    return () => this.__syncAttachment(sticker.threadKey, messageId)
  }

  private async insertXmaAttachment(a: SimpleArgType[]) {
    const ba: IGAttachment = {
      threadKey: a[25] as string,
      messageId: a[30] as string,
      attachmentFbid: a[32] as string,
      filename: a[1] as string,
      filesize: Number(a[2]),
      hasMedia: !1,
      isSharable: Boolean(a[3]),
      playableUrl: a[4] as string,
      playableUrlFallback: a[5] as string,
      playableUrlExpirationTimestampMs: parseMs(a[6]),
      playableUrlMimeType: a[7] as string,
      previewUrl: a[8] as string,
      previewUrlFallback: a[9] as string,
      previewUrlExpirationTimestampMs: parseMs(a[10]),
      previewUrlMimeType: a[11] as string,
      previewWidth: Number(a[13]),
      previewHeight: Number(a[14]),
      attributionAppId: a[15] as string,
      attributionAppName: a[16] as string,
      attributionAppIcon: a[17] as string,
      attributionAppIconFallback: a[18] as string,
      attributionAppIconUrlExpirationTimestampMs: parseMs(a[19]),
      attachmentIndex: a[20] as string,
      accessibilitySummaryText: a[21] as string,
      shouldRespectServerPreviewSize: Boolean(a[22]),
      subtitleIconUrl: a[23] as string,
      shouldAutoplayVideo: Boolean(a[24]),
      attachmentType: a[27] as string,
      timestampMs: parseMs(a[29]),
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
      imageUrlExpirationTimestampMs: parseMs(a[56]),
      actionUrl: a[57] as string,
      titleText: a[58] as string,
      subtitleText: a[59] as string,
      maxTitleNumOfLines: a[60] as string,
      maxSubtitleNumOfLines: a[61] as string,
      descriptionText: a[62] as string,
      sourceText: a[63] as string,
      faviconUrl: a[64] as string,
      faviconUrlFallback: a[65] as string,
      faviconUrlExpirationTimestampMs: parseMs(a[66]),
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
      headerImageUrlExpirationTimestampMs: parseMs(a[105]),
      previewImageDecorationType: a[106] as string,
      shouldHighlightHeaderTitleInTitle: a[107] as string,
      targetId: a[108] as string,
      attachmentLoggingType: a[111] as string,
      previewUrlLarge: a[113] as string,
      gatingType: a[114] as string,
      gatingTitle: a[115] as string,
      targetExpiryTimestampMs: parseMs(a[116]),
      countdownTimestampMs: parseMs(a[117]),
      shouldBlurSubattachments: a[118] as string,
      verifiedType: a[119] as string,
      captionBodyText: a[120] as string,
      isPublicXma: a[121] as string,
      authorityLevel: a[122] as string,
    }
    this.__logger.debug('insertXmaAttachment', a, ba)
    const { messageId } = await this.__papi.api.upsertAttachment(ba)
    return async () => {
      await this.__syncAttachment(ba.threadKey, messageId)
    }
  }

  private issueError(a: SimpleArgType[]) {
    // @TODO: we don't know how to parse this error yet
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, 'unknown error', JSON.stringify(a), {
      issuedByMethod: 'issueError',
    }))
  }

  private issueInsertPersistentMenuCtasForThreadTask(a: SimpleArgType[]) {
    this.__logger.error('encountered issueInsertPersistentMenuCtasForThreadTask (ignored)', {}, `value: ${JSON.stringify(a)}`)
  }

  private issueInsertPersistentMenuItemsForThreadTask(a: SimpleArgType[]) {
    this.__logger.error('encountered issueInsertPersistentMenuItemsForThreadTask (ignored)', {}, `value: ${JSON.stringify(a)}`)
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

  private issueNewTask(a: SimpleArgType[]) {
    this.__logger.debug('issueNewTask (ignored)', a)
  }

  private mailboxTaskCompletionApiOnTaskCompletion(a: SimpleArgType[]) {
    this.__logger.debug('mailboxTaskCompletionApiOnTaskCompletion (ignored)', a)
  }

  private markOptimisticMessageFailed(a: SimpleArgType[]) {
    this.__logger.debug('markOptimisticMessageFailed', a)
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, 'failed to update optimistic message', JSON.stringify(a), {
      args: JSON.stringify(a),
      issuedByMethod: 'markOptimisticMessageFailed',
    }))
  }

  private markThreadRead(a: SimpleArgType[]) {
    this.__logger.debug('markThreadRead (ignored)', a)
  }

  private mciTraceLog(a: SimpleArgType[]) {
    this.__logger.debug('mciTraceLog (ignored)', a)
  }

  private moveThreadToInboxAndUpdateParent(a: SimpleArgType[]) {
    this.__logger.debug('moveThreadToInboxAndUpdateParent (ignored)', a)
  }

  private overwriteAllThreadParticipantsAdminStatus(a: SimpleArgType[]) {
    this.__logger.debug('overwriteAllThreadParticipantsAdminStatus (ignored)', a)
  }

  private queryAdditionalGroupThreads(a: SimpleArgType[]) {
    this.__logger.debug('queryAdditionalGroupThreads (ignored)', a)
  }

  private resetIsLoadingBeforeOrAfterForThreadRangeV2(a: SimpleArgType[]) {
    this.__logger.debug('resetIsLoadingBeforeOrAfterForThreadRangeV2 (ignored)', a)
  }

  private removeAllParticipantsForThread(a: SimpleArgType[]) {
    this.__logger.debug('removeAllParticipantsForThread (ignored)', a)
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

    this.__sql.push(tx => tx.delete(schema.participants).where(and(
      eq(schema.participants.threadKey, threadID),
      eq(schema.participants.userId, userId),
    )).run())

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

  private removeTask(a: SimpleArgType[]) {
    const taskId = a[0] as string
    this.__logger.debug('removeTask (ignored)', a, { taskId })
  }

  private replaceOptimisticReaction(a: SimpleArgType[]) {
    this.__logger.debug('replaceOptimisticReaction (ignored)', a)
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

  private setMessagesViewedPlugin(a: SimpleArgType[]) {
    this.__logger.debug('setMessagesViewedPlugin (ignored)', a)
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

  private setHMPSStatus(a: SimpleArgType[]) {
    this.__logger.debug('setHMPSStatus (ignored)', a)
  }

  private setMessageDisplayedContentTypes(a: SimpleArgType[]) {
    this.__logger.debug('setMessageDisplayedContentTypes (ignored)', a)
  }

  private setMessageTextHasLinks(a: SimpleArgType[]) {
    this.__logger.debug('setMessageTextHasLinks (ignored)', a)
  }

  private setPinnedMessage(a: SimpleArgType[]) {
    this.__logger.debug('setPinnedMessage (ignored)', a)
  }

  private setRegionHint(a: SimpleArgType[]) {
    this.__logger.debug('setRegionHint (ignored)', a)
  }

  private shimCopyAllParticipantNicknamesForThread(a: SimpleArgType[]) {
    this.__logger.debug('shimCopyAllParticipantNicknamesForThread (ignored)', a)
  }

  private storyContactSyncFromBucket(a: SimpleArgType[]) {
    this.__logger.debug('storyContactSyncFromBucket (ignored)', a)
  }

  private syncUpdateThreadName(a: SimpleArgType[]) {
    const t = {
      threadName: a[0] as string,
      threadKey: a[1] as string,
    }
    this.__logger.debug('syncUpdateThreadName (ignored)', a, t)
  }

  private taskExists(a: SimpleArgType[]) {
    const taskId = a[0] as string
    this.__logger.debug('taskExists (ignored)', a, { taskId })
  }

  private threadsRangesQuery(a: SimpleArgType[]) {
    this.__papi.api.paginationQueue.executeTask(async () => {
      const task = await this.__papi.api.threadsRangesQuery(
        mappers.threadsRangesQuery(a),
        SyncChannel.MAILBOX,
      )
      await this.__papi.socket.publishTask(SocketRequestResolverType.FETCH_MORE_THREADS, [task], {
        timeoutMs: 15_000,
      })
    })
  }

  private transportHybridParticipantUpdateReceipts(a: SimpleArgType[]) {
    this.__logger.debug('transportHybridParticipantUpdateReceipts (ignored)', a)
  }

  private truncateMetadataThreads(a: SimpleArgType[]) {
    this.__logger.debug('truncateMetadataThreads (ignored)', a)
  }

  private truncatePresenceDatabase(a: SimpleArgType[]) {
    this.__logger.debug('truncatePresenceDatabase (ignored)', a)
  }

  private truncateTablesForSyncGroup(a: SimpleArgType[]) {
    const syncGroup = a[0] as string
    if (syncGroup === '1') {
      // remove SyncChannel.MAILBOX
    }
    this.__logger.debug('truncateTablesForSyncGroup (ignored)', { syncGroup })
  }

  private truncateThreadRangeTablesForSyncGroup(a: SimpleArgType[]) {
    this.__logger.debug('truncateThreadRangeTablesForSyncGroup (ignored)', a)
  }

  private updateAttachmentCtaAtIndexIgnoringAuthority(a: SimpleArgType[]) {
    this.__logger.debug('updateAttachmentCtaAtIndexIgnoringAuthority (ignored)', a)
  }

  private updateAttachmentItemCtaAtIndex(a: SimpleArgType[]) {
    this.__logger.debug('updateAttachmentItemCtaAtIndex (ignored)', a)
  }

  private updateCommunityThreadStaleState(a: SimpleArgType[]) {
    this.__logger.debug('updateCommunityThreadStaleState (ignored)', a)
  }

  private updateDeliveryReceipt(a: SimpleArgType[]) {
    this.__logger.debug('updateDeliveryReceipt (ignored)', a)
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

    await this.__syncMessageRanges(msgRange)
  }

  private updateExtraAttachmentColumns(a: SimpleArgType[]) {
    this.__logger.debug('updateExtraAttachmentColumns (ignored)', a)
  }

  private updateFilteredThreadsRanges(a: SimpleArgType[]) {
    const ranges = mappers.updateFilteredThreadsRanges(a)
    this.__papi.kv.set(`filteredThreadsRanges-${ranges.folderName}-${ranges.parentThreadKey}-${ranges.threadRangeFilter}`, JSON.stringify(ranges))
    this.__logger.debug('updateFilteredThreadsRanges', ranges)
  }

  private updateForRollCallMessageDeleted(a: SimpleArgType[]) {
    this.__logger.debug('updateForRollCallMessageDeleted (ignored)', a)
  }

  private updateLastSyncCompletedTimestampMsToNow(a: SimpleArgType[]) {
    this.__logger.debug('updateLastSyncCompletedTimestampMsToNow (ignored)', a)
  }

  private updateMessagesOptimisticContext(a: SimpleArgType[]) {
    this.__logger.debug('updateMessagesOptimisticContext (ignored)', a)
  }

  private updateOptimisticEphemeralMediaState(a: SimpleArgType[]) {
    this.__logger.debug('updateOptimisticEphemeralMediaState (ignored)', a)
  }

  private deleteThenInsertProactiveWarningSettings(a: SimpleArgType[]) {
    this.__logger.debug('deleteThenInsertProactiveWarningSettings (ignored)', a)
  }

  private deleteBannersByIds(a: SimpleArgType[]) {
    this.__logger.debug('deleteBannersByIds (ignored)', a)
  }

  private deleteThenInsertAttachmentConversion(a: SimpleArgType[]) {
    this.__logger.debug('deleteThenInsertAttachmentConversion (ignored)', a)
  }

  private updateOrInsertThread(a: SimpleArgType[]) {
    this.deleteThenInsertThread(a)
  }

  private updateParentFolderReadWatermark(a: SimpleArgType[]) {
    this.__logger.debug('updateParentFolderReadWatermark (ignored)', a)
  }

  private updateParticipantCapabilities(a: SimpleArgType[]) {
    this.__logger.debug('updateParticipantCapabilities (ignored)', a)
  }

  private updateParticipantLastMessageSendTimestamp(a: SimpleArgType[]) {
    this.__logger.debug('updateParticipantLastMessageSendTimestamp (ignored)', a)
  }

  private updateParticipantSubscribeSourceText(a: SimpleArgType[]) {
    this.__logger.debug('updateParticipantSubscribeSourceText (ignored)', a)
  }

  private updatePreviewUrl(a: SimpleArgType[]) {
    this.__logger.debug('updatePreviewUrl (ignored)', a)
  }

  private async updateReadReceipt(a: SimpleArgType[]) {
    const r: IGReadReceipt = {
      readWatermarkTimestampMs: parseMsAsDate(a[0]), // last message logged in user has read from
      threadKey: a[1] as string,
      contactId: a[2] as string,
      readActionTimestampMs: parseMsAsDate(a[3]),
    }

    this.__logger.debug('updateReadReceipt', a, r)

    if (!r.readWatermarkTimestampMs) return

    if (this.__threadsToSync.has(r.threadKey)) return
    const [newestMessage] = await this.__papi.api.queryMessages(r.threadKey, QueryWhereSpecial.NEWEST)
    if (!newestMessage) return
    if (this.__messagesToSync.has(newestMessage.id)) return

    this.__sql.push(tx => tx.update(schema.participants).set({
      readWatermarkTimestampMs: r.readWatermarkTimestampMs,
      ...(r.readActionTimestampMs && { readActionTimestampMs: r.readActionTimestampMs }),
    }).where(and(
      eq(schema.participants.threadKey, r.threadKey),
      eq(schema.participants.userId, r.contactId),
      lt(schema.participants.readWatermarkTimestampMs, r.readWatermarkTimestampMs),
    )).run())

    const readOn = r.readActionTimestampMs
    if (!readOn) return

    if (newestMessage.seen && typeof newestMessage.seen !== 'boolean') {
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
      entries: [{ [r.contactId]: readOn }],
    })
  }

  private updateSearchQueryStatus(a: SimpleArgType[]) {
    const s = { statusPrimary: a[2] as string, endTimeMs: a[3] as string, resultCount: a[4] as string }
    this.__logger.debug('updateSearchQueryStatus (ignored)', s, a)
  }

  private updateSelectiveSyncState(a: SimpleArgType[]) {
    this.__logger.debug('updateSelectiveSyncState (ignored)', a)
  }

  private updateSubscriptErrorMessage(a: SimpleArgType[]) {
    const parsed = {
      threadKey: a[0] as string,
      offlineThreadingID: a[1] as string,
      errorMessage: a[2] as string,
    }
    this.__errors.push(new MetaMessengerError(this.__papi.env, -1, parsed.errorMessage))
  }

  private updateThreadApprovalMode(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadApprovalMode (ignored)', a)
  }

  private updateThreadAuthorityAndMappingWithOTIDFromJID(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadAuthorityAndMappingWithOTIDFromJID (ignored)', a)
  }

  private updateThreadInviteLinksInfo(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadInviteLinksInfo (ignored)', a)
  }

  private updateThreadMuteSetting(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadMuteSetting', a)
    const threadKey = a[0] as string
    const muteExpireTimeMs = parseMs(a[1])

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

  private updateThreadParticipantAdminStatus(a: SimpleArgType[]) {
    const b = {
      threadKey: a[0] as string,
      participantId: a[1] as string,
      isAdmin: Boolean(a[2]),
    }
    this.__logger.debug('updateThreadParticipantAdminStatus (ignored)', a, b)
  }

  private updateThreadSnippet(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadSnippet (ignored)', a)
  }

  private updateThreadSnippetFromLastMessage(a: SimpleArgType[]) {
    this.__logger.debug('updateThreadSnippetFromLastMessage (ignored)', a)
  }

  private updateThreadsRangesV2(a: SimpleArgType[]) {
    const r = mappers.updateThreadsRangesV2(a)
    this.__logger.debug('updateThreadsRangesV2', r)
    this.__papi.kv.set(`threadsRangesV2-${a[0]}-${a[1] as ParentThreadKey}`, JSON.stringify(r))
  }

  private updateTypingIndicator(a: SimpleArgType[]) {
    const r = {
      threadKey: a[0],
      senderId: a[1],
      // expirationTimestampMS: a[2] ? Date.now() : 0,
      isTyping: a[2],
    }
    const eventData: UserActivityEvent = {
      type: ServerEventType.USER_ACTIVITY,
      activityType: r.isTyping ? ActivityType.TYPING : ActivityType.NONE,
      threadID: r.threadKey.toString(),
      participantID: r.senderId.toString(),
      durationMs: r.isTyping ? 5_000 : 0,
    }
    this.__logger.debug('updateTypingIndicator event:', eventData)
    return () => {
      this.__events.push(eventData)
    }
  }

  private updateUnsentMessageCollapsedStatus(a: SimpleArgType[]) {
    this.__logger.debug('updateUnsentMessageCollapsedStatus (ignored)', a)
  }

  private upsertFolder(a: SimpleArgType[]) {
    this.__logger.debug('upsertFolder (ignored)', a)
  }

  private upsertFolderSeenTimestamp(a: SimpleArgType[]) {
    this.__logger.debug('upsertFolderSeenTimestamp (ignored)', a)
  }

  // eslint-disable-next-line class-methods-use-this
  private upsertGradientColor(_a: SimpleArgType[]) {
    // this.__logger.debug('upsertGradientColor (ignored)', a)
  }

  private updateOrInsertReactionV2(a: SimpleArgType[]) {
    const r = {
      messageId: a[1],
      threadKey: a[0],
      reactionFbid: a[2],
      // messageTimestamp: e.timestampMs,
      authorityLevel: a[5],
      count: a[4],
      viewerIsReactor: a[6],
      viewerReactionTimestampMs: a[7],
      lastUpdatedTimestampMs: a[8],
    }
    this.__logger.debug('updateOrInsertReactionV2 (ignored)', a, r)
  }

  private upsertInboxThreadsRange(a: SimpleArgType[]) {
    const data = mappers.upsertInboxThreadsRange(a)
    // @TODO - save this
    this.__logger.debug('upsertInboxThreadsRange (ignored)', data)
  }

  private upsertMessage(a: SimpleArgType[]) {
    const m: IGMessage = {
      links: null,
      threadKey: a[3] as string,
      timestampMs: parseMs(a[5]),
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
      unsentTimestampMs: parseMs(a[18]),
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
      replyMediaExpirationTimestampMs: parseMs(a[30]),
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
      replySourceTimestampMs: parseMs(a[57]),
      ephemeralDurationInSec: a[58] as string,
      msUntilExpirationTs: parseMs(a[59]),
      ephemeralExpirationTs: parseMs(a[60]),
      takedownState: a[61] as string,
      isCollapsed: Boolean(a[62]),
      subthreadKey: a[63] as string,
    }
    const { messageId } = this.__papi.api.upsertMessage(m)
    this.__messagesToSync.add(messageId)
    this.__logger.debug('upsertMessage', m.threadKey, messageId, m.timestampMs, m.text)
  }

  private upsertProfileBadge(a: SimpleArgType[]) {
    this.__logger.debug('upsertProfileBadge (ignored)', a)
  }

  private upsertReaction(a: SimpleArgType[]) {
    this.__logger.debug('upsertReaction', a)
    const r = {
      threadKey: a[0] as string,
      timestampMs: parseMsAsDate(a[1]),
      messageId: a[2] as string,
      actorId: a[3] as string,
      reaction: fixEmoji(a[4] as string),
    }
    this.__sql.push(tx => tx
      .insert(schema.reactions)
      .values(r)
      .onConflictDoUpdate({
        target: [schema.reactions.threadKey, schema.reactions.messageId, schema.reactions.actorId],
        set: { ...r },
      }).run())

    return () => {
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
      }, {
        type: ServerEventType.THREAD_MESSAGES_REFRESH,
        threadID: r.threadKey,
      })
    }
  }

  private upsertSequenceId(a: SimpleArgType[]) {
    this.__logger.debug('upsertSequenceId (ignored)', a)
  }

  private upsertSyncGroupThreadsRange(a: SimpleArgType[]) {
    const range = mappers.upsertSyncGroupThreadsRange(a)
    this.__logger.debug('upsertSyncGroupThreadsRange', a)
    this.__papi.api.setSyncGroupThreadsRange(range)
  }

  // eslint-disable-next-line class-methods-use-this
  private upsertTheme(_a: SimpleArgType[]) {
    // don't care about themes, spams the logs
    // this.__logger.debug('upsertTheme (ignored)', a)
  }

  private verifyCommunityMemberContextualProfileExists(a: SimpleArgType[]) {
    this.__logger.debug('verifyCommunityMemberContextualProfileExists (ignored)', a)
  }

  private verifyContactParticipantExist(a: SimpleArgType[]) {
    this.__logger.debug('verifyContactParticipantExist (ignored)', a)
  }

  private verifyCustomCommandsExist(a: SimpleArgType[]) {
    this.__logger.debug('verifyCustomCommandsExist (ignored)', a)
  }

  private verifyContactRowExists(a: SimpleArgType[]) {
    this.__logger.debug('verifyContactRowExists', a)
    const parsed = {
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
    const { id, name, profilePictureUrl, username, ...contact } = parsed
    const c = {
      id: id as string,
      name: name as string,
      profilePictureUrl: profilePictureUrl as string,
      username: username as string,
      contact: JSON.stringify(contact),
    } as const

    this.__sql.push(tx => tx.insert(schema.contacts).values(c).onConflictDoUpdate({
      target: schema.contacts.id,
      set: { ...c },
    }).run())

    return () => {
      // this._syncContact(contactId)
    }
  }

  private verifyHybridThreadExists(a: SimpleArgType[]) {
    this.__logger.debug('verifyHybridThreadExists (ignored)', a)
  }

  private async verifyThreadExists(a: SimpleArgType[]) {
    this.__logger.debug('verifyThreadExists', a)
    const threadId = a[0] as string
    const thread = await this.__papi.db.query.threads.findFirst({
      where: eq(schema.threads.threadKey, threadId),
      columns: {
        threadKey: true,
      },
    })
    if (!thread?.threadKey) {
      this.__logger.info('thread does not exist, skipping payload and calling getThread')
      this.__promises.push(this.__papi.api.requestThread(threadId))
    }
  }

  private writeCTAIdToThreadsTable(a: SimpleArgType[]) {
    const i = { lastMessageCtaType: a[1], lastMessageCtaTimestampMs: a[2] }
    this.__logger.debug('writeCTAIdToThreadsTable (ignored)', a, i)
  }

  private writeThreadCapabilities(a: SimpleArgType[]) {
    this.__logger.debug('writeThreadCapabilities (ignored)', a)
  }

  private setBotResponseInfo(a: SimpleArgType[]) {
    this.__logger.debug('setBotResponseInfo (ignored)', a)
  }

  private collapseAttachments(a: SimpleArgType[]) {
    this.__logger.debug('collapseAttachments (ignored)', a)
  }
}
