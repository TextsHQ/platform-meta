import { ServerEvent, ServerEventType } from '@textshq/platform-sdk'
import { and, eq, inArray } from 'drizzle-orm'
import { forEach, groupBy } from 'lodash'
import type PlatformInstagram from './api'
import * as schema from './store/schema'
import { messages as messagesSchema } from './store/schema'
import { getLogger } from './logger'
import {
  type CallList,
  generateCallList,
  type IGSocketPayload,
  type OperationKey,
  type SimpleArgType,
} from './ig-payload-parser'
import { DEFAULT_PARTICIPANT_NAME, INSTAGRAM_BASE_URL } from './constants'
import { fixEmoji, getAsDate, getAsMS, getOriginalURL, InstagramSocketServerError } from './util'
import { IGAttachment, IGMessage, IGReadReceipt, ParentThreadKey, SyncGroup } from './ig-types'
import { mapMessages } from './mappers'
import { queryMessages } from './store/queries'
import { PromiseQueue } from './p-queue'

type SearchArgumentType = 'user' | 'group' | 'unknown_user'

export interface InstagramPayloadHandlerResponse {
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

export default class InstagramPayloadHandler {
  private calls: CallList

  pQueue = new PromiseQueue()

  private afterCallbacks: (() => Promise<void> | void)[] = []

  private logger = getLogger('payload')

  private papi: PlatformInstagram

  private threadsToSync = new Set<string>()

  private messagesToSync = new Set<string>()

  private messagesToIgnore = new Set<string>()

  private responses: InstagramPayloadHandlerResponse = {
    insertSearchResult: [],
  }

  private errors: InstagramSocketServerError[] = []

  private events: ServerEvent[] = []

  constructor(papi: PlatformInstagram, data: IGSocketPayload) {
    this.papi = papi
    if (!data) {
      this.logger.error('Invalid payload', {}, data)
      throw new Error('Invalid payload')
    }
    this.calls = generateCallList(data)
  }

  private getCall(method: OperationKey): ((args: SimpleArgType[]) => (() => void | Promise<void>) | void | Promise<void>) {
    if (method in this && typeof this[method] === 'function') {
      return this[method].bind(this)
    }
    throw new InstagramSocketServerError(0, 'UNHANDLED_CALL', `missing handler for ${method}`)
  }

  getResponse = () => this.responses

  getErrors = () => this.errors

  run = async () => {
    this.calls.forEach(([method, args]) => {
      try {
        const call = this.getCall(method)
        const returns = call(args) // @TODO: does not support async
        if (typeof returns === 'function') {
          this.afterCallbacks.push(returns)
        }
      } catch (e) {
        this.logger.error(e, { method })
      }
    })
  }

  sync = async (): Promise<void> => {
    for (const callback of this.afterCallbacks) {
      if (callback instanceof Promise) {
        await callback
      } else {
        callback()
      }
    }

    let toSync: ServerEvent[] = []
    if (this.threadsToSync.size > 0) {
      const entries = this.papi.api.queryThreads([...this.threadsToSync])
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
      this.threadsToSync.clear()
    }

    if (this.messagesToSync.size > 0) {
      const _messages = queryMessages(this.papi.db, {
        where: inArray(messagesSchema.messageId, [...this.messagesToSync]),
      })
      const messages = _messages?.length > 0 ? _messages : []
      const mappedMessages = mapMessages(messages, this.papi.kv.get('fbid'))
      const groupedMessages = groupBy(mappedMessages, 'threadID')
      forEach(groupedMessages, (entries, threadID) => {
        toSync.push({
          type: ServerEventType.STATE_SYNC,
          objectName: 'message',
          objectIDs: { threadID },
          mutationType: 'upsert',
          entries,
        })
      })
      this.messagesToSync.clear()
    }

    if (this.events.length > 0) {
      this.papi.onEvent([...toSync, ...this.events])
      toSync = []
      this.events = []
    }
  }

  runAndSync = async () => {
    await this.run()
    await this.sync()
  }

  private deleteThenInsertThread(a: SimpleArgType[]) {
    const thread = {
      // isUnread: Number(a[0][1]) > Number(a[1][1]),
      lastReadWatermarkTimestampMs: Number(a[1]),
      // threadType: a[9][1] === '1' ? 'single' : 'group',
      threadType: a[9],
      folderName: a[10],
      parentThreadKey: a[35],
      lastActivityTimestampMs: Number(a[0]),
      snippet: a[2],
      threadPictureUrl: a[4],
      needsAdminApprovalForNewParticipant: a[5],
      threadPictureUrlFallback: a[11],
      threadPictureUrlExpirationTimestampMs: Number(a[12]),
      removeWatermarkTimestampMs: Number(a[13]),
      muteExpireTimeMs: Number(a[14]),
      // muteCallsExpireTimeMs: Number(a[15][1]),
      groupNotificationSettings: a[16],
      isAdminSnippet: a[17],
      snippetSenderContactId: a[18],
      snippetStringHash: a[21],
      snippetStringArgument1: a[22],
      snippetAttribution: a[23],
      snippetAttributionStringHash: a[24],
      disappearingSettingTtl: a[25],
      disappearingSettingUpdatedTs: Number(a[26]),
      disappearingSettingUpdatedBy: a[27],
      cannotReplyReason: a[30],
      customEmoji: a[31],
      customEmojiImageUrl: a[32],
      outgoingBubbleColor: a[33],
      themeFbid: a[34],
      authorityLevel: 0,
      mailboxType: a[8],
      muteMentionExpireTimeMs: Number(a[15]),
      muteCallsExpireTimeMs: Number(a[16]),
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
      lastMessageCtaTimestampMs: Number(a[67]),
      consistentThreadFbid: a[68],
      threadDescription: a[70],
      unsendLimitMs: Number(a[71]),
      capabilities2: a[79],
      capabilities3: a[80],
      syncGroup: a[83],
      threadInvitesEnabled: a[84],
      threadInviteLink: a[85],
      isAllUnreadMessageMissedCallXma: a[86],
      lastNonMissedCallXmaMessageTimestampMs: Number(a[87]),
      threadInvitesEnabledV2: a[89],
      hasPendingInvitation: a[92],
      eventStartTimestampMs: Number(a[93]),
      eventEndTimestampMs: Number(a[94]),
      takedownState: a[95],
      secondaryParentThreadKey: a[96],
      igFolder: a[97],
      inviterId: a[98],
      threadTags: a[99],
      threadStatus: a[100],
      threadSubtype: a[101],
      pauseThreadTimestamp: Number(a[102]),
      threadName: Array.isArray(a[3]) ? null : a[3],
    } as const
    const threadKey = a[7] as string
    this.logger.debug('deleteThenInsertThread', a, { threadKey, thread })

    this.papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadKey)).run()
    this.papi.db.insert(schema.threads).values({
      raw: JSON.stringify(a),
      threadKey,
      parentThreadKey: a[35] as unknown as number,
      lastActivityTimestampMs: new Date(thread.lastActivityTimestampMs),
      thread: JSON.stringify(thread),
    }).run()

    this.threadsToSync.add(threadKey)

    return async () => {
      // there are new threads to send to the platform

      // this.logger.debug('deleteThenInsertThread (sync)', a)
      //
      // const newThread = await this.papi.getThread(threadKey)
      // this.events.push({
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

    this.papi.db.delete(schema.attachments).where(eq(schema.attachments.threadKey, threadID)).run()
    this.papi.db.delete(schema.messages).where(eq(schema.messages.threadKey, threadID)).run()
    this.papi.db.delete(schema.participants).where(eq(schema.participants.threadKey, threadID)).run()
    this.papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadID)).run()

    return () => {
      this.events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'thread',
        objectIDs: { threadID },
        mutationType: 'delete',
        entries: [threadID],
      })
    }
  }

  private updateThreadMuteSetting(a: SimpleArgType[]) {
    this.logger.debug('updateThreadMuteSetting', a)
    const threadKey = a[0] as string
    const muteExpireTimeMs = Number(a[1])

    return () => {
      this.events.push({
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
    this.logger.debug('upsertMessage', a)
    const m: IGMessage = {
      links: null,
      raw: JSON.stringify(a),
      threadKey: a[3] as string,
      timestampMs: getAsMS(a[5]),
      messageId: a[8] as string,
      offlineThreadingId: a[9] as string,
      authorityLevel: a[2] as number,
      primarySortKey: a[6] as string,
      senderId: a[10] as string,
      isAdminMessage: a[12] as boolean,
      sendStatus: a[15] as string,
      sendStatusV2: a[16] as string,
      text: a[0] as string,
      subscriptErrorMessage: a[1] as string,
      secondarySortKey: a[7] as string,
      stickerId: a[11] as string,
      messageRenderingType: a[13] as string,
      isUnsent: a[17] as boolean,
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
      isForwarded: a[43] as boolean,
      forwardScore: a[44] as string,
      hasQuickReplies: a[45] as boolean,
      adminMsgCtaId: a[46] as string,
      adminMsgCtaTitle: a[47] as string,
      adminMsgCtaType: a[48] as string,
      cannotUnsendReason: a[49] as string,
      textHasLinks: a[50] as number,
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
      isCollapsed: a[62] as boolean,
      subthreadKey: a[63] as string,
    }

    const { messageId } = this.papi.api.upsertMessage(m)
    this.messagesToSync.add(messageId)
  }

  private insertMessage(a: SimpleArgType[]) {
    const m: IGMessage = {
      raw: JSON.stringify(a),
      links: null,
      threadKey: a[3] as string,
      timestampMs: getAsMS(a[5] as string),
      messageId: a[8] as string,
      offlineThreadingId: a[9] as string,
      authorityLevel: a[2] as number,
      primarySortKey: a[6] as string,
      senderId: a[10] as string,
      isAdminMessage: a[12] as boolean,
      sendStatus: a[15] as string,
      sendStatusV2: a[16] as string,
      text: a[0] as string,
      subscriptErrorMessage: a[1] as string,
      secondarySortKey: a[7] as string,
      stickerId: a[11] as string,
      messageRenderingType: a[13] as string,
      isUnsent: a[17] as boolean,
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
      isForwarded: a[42] as boolean,
      forwardScore: a[43] as string,
      hasQuickReplies: a[44] as boolean,
      adminMsgCtaId: a[45] as string,
      adminMsgCtaTitle: a[46] as string,
      adminMsgCtaType: a[47] as string,
      cannotUnsendReason: a[48] as string,
      textHasLinks: a[49] as number,
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
      isCollapsed: a[61] as boolean,
      subthreadKey: a[62] as string,
    }
    this.logger.debug('insertMessage', a, m)

    const { messageId } = this.papi.api.upsertMessage(m)
    this.messagesToSync.add(messageId)
  }

  private updateReadReceipt(a: SimpleArgType[]) {
    const r: IGReadReceipt = {
      readWatermarkTimestampMs: getAsDate(a[0] as string), // last message logged in user has read from
      threadKey: a[1] as string,
      contactId: a[2] as string,
      readActionTimestampMs: getAsDate(a[3] as string),
    }

    this.logger.debug('updateReadReceipt', a, r)

    this.papi.db.update(schema.participants).set({
      readActionTimestampMs: r.readActionTimestampMs,
      readWatermarkTimestampMs: r.readWatermarkTimestampMs,
    })
      .where(and(
        eq(schema.participants.threadKey, r.threadKey),
        eq(schema.participants.userId, r.contactId),
      )).run()
    if (!r.readActionTimestampMs) return

    return () => {
      const newestMessage = this.papi.api.getNewestMessage(r.threadKey)
      this.messagesToSync.add(newestMessage.messageId)
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
    this.logger.debug('executeFirstBlockForSyncTransaction', a, {
      database_id,
      epoch_id,
      currentCursor,
      syncStatus,
      sendSyncParams,
      canIgnoreTimestamp,
      syncChannel,
    })

    this.papi.kv.set(`cursor-${syncChannel}`, currentCursor)
    this.papi.kv.set(`_lastReceivedCursor-${syncChannel}`, JSON.stringify({
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
    this.logger.debug('truncateTablesForSyncGroup (ignored)', a)
  }

  private mciTraceLog(a: SimpleArgType[]) {
    this.logger.debug('mciTraceLog (ignored)', a)
  }

  private setForwardScore(a: SimpleArgType[]) {
    const forwardScore = {
      threadKey: a[0] as string,
      messageId: a[1] as string,
      timestampMs: a[2] as string,
      forwardScore: a[3] as string,
    }
    this.logger.debug('setForwardScore (ignored)', a, forwardScore)
  }

  private setMessageDisplayedContentTypes(a: SimpleArgType[]) {
    this.logger.debug('setMessageDisplayedContentTypes (ignored)', a)
  }

  private insertNewMessageRange(a: SimpleArgType[]) {
    const msgRange = {
      threadKey: a[0] as string,
      minTimestamp: a[1] as string,
      maxTimestamp: a[2] as string,
      minMessageId: a[3] as string,
      maxMessageId: a[4] as string,
      hasMoreBeforeFlag: a[7] as boolean,
      hasMoreAfterFlag: a[8] as boolean,
    }
    this.logger.debug('insertNewMessageRange', a, msgRange)
    this.papi.api.setMessageRanges(msgRange)
  }

  private updateExistingMessageRange(a: SimpleArgType[]) {
    const isMaxTimestamp = a[2] as boolean
    const timestamp = a[1] as string
    const msgRange = {
      raw: JSON.stringify(a),
      threadKey: a[0] as string,
      hasMoreBeforeFlag: a[2] && !a[3],
      hasMoreAfterFlag: !a[2] && !a[3],
      maxTimestamp: isMaxTimestamp ? timestamp : undefined,
      minTimestamp: !isMaxTimestamp ? timestamp : undefined,
    }

    this.logger.debug('updateExistingMessageRange', a, msgRange)
    this.papi.api.setMessageRanges(msgRange)
  }

  private upsertSequenceId(a: SimpleArgType[]) {
    this.logger.debug('upsertSequenceId (ignored)', a)
  }

  private taskExists(a: SimpleArgType[]) {
    const taskId = a[0] as string
    this.logger.debug('taskExists (ignored)', a, { taskId })
  }

  private removeTask(a: SimpleArgType[]) {
    const taskId = a[0] as string
    this.logger.debug('removeTask (ignored)', a, { taskId })
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
    this.logger.debug('deleteThenInsertContactPresence (ignored)', a, p)
  }

  private upsertSyncGroupThreadsRange(a: SimpleArgType[]) {
    const range = {
      syncGroup: a[0] as SyncGroup,
      parentThreadKey: a[1] as ParentThreadKey,
      minLastActivityTimestampMs: a[2] as string,
      hasMoreBefore: a[3] as boolean,
      isLoadingBefore: a[4] as boolean,
      minThreadKey: a[5] as string,
    }
    this.logger.debug('upsertSyncGroupThreadsRange', a)
    this.papi.api.setSyncGroupThreadsRange(range)
  }

  private upsertInboxThreadsRange(a: SimpleArgType[]) {
    this.logger.debug('upsertInboxThreadsRange (ignored)', a)
  }

  private updateThreadsRangesV2(a: SimpleArgType[]) {
    this.logger.debug('updateThreadsRangesV2 (ignored)', a)
  }

  private threadsRangesQuery(a: SimpleArgType[]) {
    this.logger.debug('threadsRangesQuery (ignored)', a)
  }

  private addParticipantIdToGroupThread(a: SimpleArgType[]) {
    this.logger.debug('addParticipantIdToGroupThread', a)
    const p = {
      raw: JSON.stringify(a),
      threadKey: a[0] as string,
      userId: a[1] as string,
      readWatermarkTimestampMs: getAsDate(a[2] as string),
      readActionTimestampMs: getAsDate(a[3] as string),
      deliveredWatermarkTimestampMs: getAsDate(a[4] as string),
      // lastDeliveredWatermarkTimestampMs: getAsDate(a[5][1])),
      lastDeliveredActionTimestampMs: a[5] ? getAsDate(a[5] as string) : null,
      isAdmin: a[6] as boolean,
    }
    this.papi.db.insert(schema.participants).values(p).onConflictDoUpdate({
      target: [schema.participants.threadKey, schema.participants.userId],
      set: { ...p },
    }).run()
    const contact = this.papi.api.getContact(p.userId)

    return () => {
      this.events.push({
        type: ServerEventType.STATE_SYNC,
        objectIDs: { threadID: p.threadKey },
        objectName: 'participant',
        mutationType: 'upsert',
        entries: [{
          id: p.userId,
          isAdmin: p.isAdmin,
          username: contact?.username,
          fullName: contact?.name || contact?.username || DEFAULT_PARTICIPANT_NAME,
          imgURL: contact?.profilePictureUrl,
        }],
      })
    }
  }

  private verifyContactRowExists(a: SimpleArgType[]) {
    this.logger.debug('verifyContactRowExists', a)
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

    this.papi.db.insert(schema.contacts).values(c).onConflictDoUpdate({
      target: schema.contacts.id,
      set: { ...c },
    }).run()

    return () => {
      const p = this.papi.db.query.participants.findMany({
        where: eq(schema.participants.userId, c.id),
        columns: {
          threadKey: true,
        },
      }).map(({ threadKey }) => threadKey)
      if (p.length === 0) return

      [...new Set(p)].forEach(threadID => {
        this.events.push({
          type: ServerEventType.STATE_SYNC,
          objectIDs: { threadID },
          objectName: 'participant',
          mutationType: 'upsert',
          entries: [{
            id: threadID,
            fullName: c?.name || c?.username || DEFAULT_PARTICIPANT_NAME,
            username: c.username,
            imgURL: c.profilePictureUrl,
          }],
        })
      })
    }
  }

  private setHMPSStatus(a: SimpleArgType[]) {
    this.logger.debug('setHMPSStatus (ignored)', a)
  }

  private upsertFolderSeenTimestamp(a: SimpleArgType[]) {
    this.logger.debug('upsertFolderSeenTimestamp (ignored)', a)
  }

  private deleteExistingMessageRanges(a: SimpleArgType[]) {
    this.logger.debug('deleteExistingMessageRanges (ignored)', a)
  }

  private deleteThenInsertIgThreadInfo(a: SimpleArgType[]) {
    this.logger.debug('deleteThenInsertIgThreadInfo (ignored)', a)
  }

  private writeThreadCapabilities(a: SimpleArgType[]) {
    this.logger.debug('writeThreadCapabilities (ignored)', a)
  }

  private clearPinnedMessages(a: SimpleArgType[]) {
    this.logger.debug('clearPinnedMessages (ignored)', a)
  }

  private deleteThenInsertMessageRequest(a: SimpleArgType[]) {
    this.logger.debug('deleteThenInsertMessageRequest (ignored)', a)
  }

  private updateLastSyncCompletedTimestampMsToNow(a: SimpleArgType[]) {
    this.logger.debug('updateLastSyncCompletedTimestampMsToNow (ignored)', a)
  }

  private setMessageTextHasLinks(a: SimpleArgType[]) {
    this.logger.debug('setMessageTextHasLinks (ignored)', a)
  }

  private updateAttachmentCtaAtIndexIgnoringAuthority(a: SimpleArgType[]) {
    this.logger.debug('updateAttachmentCtaAtIndexIgnoringAuthority (ignored)', a)
  }

  private updateAttachmentItemCtaAtIndex(a: SimpleArgType[]) {
    this.logger.debug('updateAttachmentItemCtaAtIndex (ignored)', a)
  }

  private deleteMessage(a: SimpleArgType[]) {
    const threadID = a[0] as string
    const messageID = a[1] as string
    this.logger.debug('deleteMessage', a, { threadID, messageID })
    this.papi.db.delete(schema.messages).where(and(
      eq(schema.messages.threadKey, threadID),
      eq(schema.messages.messageId, messageID),
    )).run()

    return () => {
      this.events.push({
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

    this.logger.debug('deleteReaction', a, {
      threadID,
      messageID,
      actorID,
    })

    this.papi.db.delete(schema.reactions).where(and(
      eq(schema.reactions.threadKey, threadID),
      eq(schema.reactions.messageId, messageID),
      eq(schema.reactions.actorId, actorID),
    )).run()

    return () => {
      this.events.push({
        type: ServerEventType.STATE_SYNC,
        objectName: 'message_reaction',
        objectIDs: { threadID, messageID },
        mutationType: 'delete',
        entries: [actorID],
      })
    }
  }

  private deleteThenInsertContact(a: SimpleArgType[]) {
    const _c = {
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
    this.logger.debug('deleteThenInsertContact (ignored)', a, _c)
    // @TODO: implement
  }

  private deleteThenInsertIGContactInfo(a: SimpleArgType[]) {
    const c = {
      contactId: a[0],
      igId: a[1],
      igFollowStatus: a[4],
      verificationStatus: a[5],
      linkedFbid: a[2],
      e2eeEligibility: a[6],
      supportsE2eeSpamdStorage: a[7],
    }
    this.logger.debug('deleteThenInsertIGContactInfo (ignored)', a, c)
    // @TODO: implement
  }

  private executeFinallyBlockForSyncTransaction(a: SimpleArgType[]) {
    this.logger.debug('executeFinallyBlockForSyncTransaction (ignored)', a)
  }

  private insertAttachmentCta(a: SimpleArgType[]) {
    const r = {
      raw: JSON.stringify(a),
      attachmentFbid: a[1] as string,
      threadKey: a[3] as string,
      messageId: a[5] as string,
      actionUrl: a[9] as string,
    }
    this.logger.debug('insertAttachmentCta', a, r)
    // const messages = await this.papi.db.select({ message: schema.messages.message }).from(schema.messages).where(eq(schema.messages.messageId, r.messageId!)).run()
    // FIXME: ^ above doesnt work, also the below code is an atrocity
    // ideally we would just update the field in the database without querying, parsing, updating, and reinserting the message
    const messages = this.papi.db.query.messages.findFirst({
      where: eq(schema.messages.messageId, r.messageId!),
      columns: {
        message: true,
      },
    })
    if (r.actionUrl && r.actionUrl !== 'null') {
      // const a = this.papi.db.query.attachments.findFirst({
      //   where: eq(schema.attachments.attachmentFbid, r.attachmentFbid!),
      // })
      // const attachment = JSON.parse(a.attachment) as IGAttachment
      const mparse = JSON.parse(messages.message) as IGMessage

      const mediaLink = r.actionUrl.startsWith('/') ? `https://www.instagram.com${r.actionUrl}` : getOriginalURL(r.actionUrl)

      this.logger.info('insertAttachmentCta mediaLink', mediaLink)
      const INSTAGRAM_PROFILE_BASE_URL = 'https://www.instagram.com/_u/'
      if (mediaLink.startsWith(INSTAGRAM_PROFILE_BASE_URL)) {
        mparse.extra = {}
        mparse.links = [{
          url: mediaLink,
          title: `@${mediaLink.replace(INSTAGRAM_PROFILE_BASE_URL, '')} on Instagram`,
        }]
      } else if (mediaLink.startsWith(INSTAGRAM_BASE_URL)) {
        mparse.extra = {
          mediaLink,
        }
      } else {
        mparse.links = [{
          url: mediaLink,
          title: mparse.replySnippet,
        }]
      }

      const newMessage = JSON.stringify(mparse)
      this.logger.debug('insertAttachmentCta newMessage', newMessage)

      this.papi.db.update(schema.messages).set({ message: newMessage }).where(eq(schema.messages.messageId, r.messageId!)).run()

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
    this.logger.debug('insertAttachmentItem (ignored)', a, i)
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
      previewWidth: a[14] as number,
      previewHeight: a[15] as number,
      timestampMs: getAsMS(a[31]),
      attachmentType: a[29] as string,
      attachmentFbid: a[34] as string,
      filesize: a[1] as number,
      hasMedia: a[2] as boolean,
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
      isPreviewImage: a[25] as boolean,
      originalFileHash: a[26] as string,
      offlineAttachmentId: a[33] as string, // @TODO: is integer/bigint?
      hasXma: a[35] as boolean,
      xmaLayoutType: a[36] as string,
      xmasTemplateType: a[37] as string,
      titleText: a[38] as string,
      subtitleText: a[39] as string,
      descriptionText: a[40] as string,
      sourceText: a[41] as string,
      faviconUrlExpirationTimestampMs: getAsMS(a[42]),
      isBorderless: a[44] as boolean,
      previewUrlLarge: a[45] as string,
      samplingFrequencyHz: a[46] as number,
      waveformData: a[47] as string,
      authorityLevel: a[48] as string,
    }
    this.logger.debug('insertBlobAttachment', a, ba)
    const { messageId } = this.papi.api.upsertAttachment(ba)
    this.messagesToSync.add(messageId)
  }

  private insertXmaAttachment(a: SimpleArgType[]) {
    const ba: IGAttachment = {
      raw: JSON.stringify(a),
      threadKey: a[25] as string,
      messageId: a[30] as string,
      attachmentFbid: a[32] as string,
      filename: a[1] as string,
      filesize: a[2] as number,
      hasMedia: !1,
      isSharable: a[3] as boolean,
      playableUrl: a[4] as string,
      playableUrlFallback: a[5] as string,
      playableUrlExpirationTimestampMs: getAsMS(a[6]),
      playableUrlMimeType: a[7] as string,
      previewUrl: a[8] as string,
      previewUrlFallback: a[9] as string,
      previewUrlExpirationTimestampMs: getAsMS(a[10]),
      previewUrlMimeType: a[11] as string,
      previewWidth: a[13] as number,
      previewHeight: a[14] as number,
      attributionAppId: a[15] as string,
      attributionAppName: a[16] as string,
      attributionAppIcon: a[17] as string,
      attributionAppIconFallback: a[18] as string,
      attributionAppIconUrlExpirationTimestampMs: getAsMS(a[19]),
      attachmentIndex: a[20] as string,
      accessibilitySummaryText: a[21] as string,
      shouldRespectServerPreviewSize: a[22] as boolean,
      subtitleIconUrl: a[23] as string,
      shouldAutoplayVideo: a[24] as boolean,
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
      isBorderless: a[99] as boolean,
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
    this.logger.debug('insertXmaAttachment', a, ba)
    const { messageId } = this.papi.api.upsertAttachment(ba)
    this.messagesToSync.add(messageId)
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
    this.logger.debug('insertSearchResult', a, r)
    this.responses.insertSearchResult.push(r)
  }

  private issueNewError(a: SimpleArgType[]) {
    this.logger.debug('issueNewError', a)
    const _requestId = a[0] as string
    const errorId = a[1] as string // @TODO: not sure what this value is
    const errorTitle = a[2] as string
    const errorMessage = a[3] as string
    this.errors.push(new InstagramSocketServerError(errorId, errorTitle, errorMessage))
  }

  private issueError(a: SimpleArgType[]) {
    this.logger.error('issueError (ignored)', { params: JSON.stringify(a) })
  }

  private handleFailedTask(a: SimpleArgType[]) {
    this.logger.error('handleFailedTask (ignored)', { params: JSON.stringify(a) })
  }

  private removeOptimisticGroupThread(a: SimpleArgType[]) {
    const offlineThreadingId = a[0] as string
    this.logger.debug('removeOptimisticGroupThread', a, { offlineThreadingId })
    if (!offlineThreadingId) return
    return () => {
      // @TODO: implement, this happens on new thread creation
      // this.events.push({
      //   type: ServerEventType.STATE_SYNC,
      //   mutationType: 'delete',
      //   objectName: 'thread',
      //   objectIDs: {},
      //   entries: [offlineThreadingId],
      // })
    }
  }

  private removeParticipantFromThread(a: SimpleArgType[]) {
    this.logger.debug('removeParticipantFromThread', a)
    const threadID = a[0] as string
    const userId = a[1] as string

    this.papi.db.delete(schema.participants).where(and(
      eq(schema.participants.threadKey, threadID),
      eq(schema.participants.userId, userId),
    )).run()

    return () => {
      this.events.push({
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
    this.logger.debug('replaceOptimisticThread', a, {
      offlineThreadingId,
      threadId,
    })
    if (this.responses.replaceOptimisticThread?.threadId) { // @TODO: not sure if it needs to handle multiple in one payload
      this.logger.warn('replaceOptimisticThread: already exists', a)
      return
    }
    this.responses.replaceOptimisticThread = {
      offlineThreadingId,
      threadId,
    }
  }

  private replaceOptimsiticMessage(a: SimpleArgType[]) {
    const offlineThreadingId = a[0] as string
    const messageId = a[1] as string
    this.logger.debug('replaceOptimsiticMessage', a, {
      offlineThreadingId,
      messageId,
    })

    this.messagesToIgnore.add(messageId)

    if (this.responses.replaceOptimsiticMessage?.messageId) { // @TODO: not sure if it needs to handle multiple in one payload
      this.logger.warn('replaceOptimsiticMessage: already exists', a)
      return
    }

    this.responses.replaceOptimsiticMessage = {
      offlineThreadingId,
      messageId,
    }
  }

  private syncUpdateThreadName(a: SimpleArgType[]) {
    const t = {
      threadName: a[0] as string,
      threadKey: a[1] as string,
    }
    this.logger.debug('syncUpdateThreadName (ignored)', a, t)
  }

  private updateDeliveryReceipt(a: SimpleArgType[]) {
    this.logger.debug('updateDeliveryReceipt (ignored)', a)
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
    this.logger.debug('updateFilteredThreadsRanges (ignored)', a, b)
  }

  private updateThreadParticipantAdminStatus(a: SimpleArgType[]) {
    const b = {
      threadKey: a[0] as string,
      participantId: a[1] as string,
      isAdmin: a[2] as boolean,
    }
    this.logger.debug('updateThreadParticipantAdminStatus (ignored)', a, b)
  }

  private upsertReaction(a: SimpleArgType[]) {
    this.logger.debug('upsertReaction', a)
    const r = {
      raw: JSON.stringify(a),
      threadKey: a[0] as string,
      timestampMs: getAsDate(a[1] as string),
      messageId: a[2] as string,
      actorId: a[3] as string,
      reaction: fixEmoji(a[4] as string),
    }
    this.papi.db
      .insert(schema.reactions)
      .values(r)
      .onConflictDoUpdate({
        target: [schema.reactions.threadKey, schema.reactions.messageId, schema.reactions.actorId],
        set: { ...r },
      })
      .run()

    return () => {
      this.events.push({
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
    this.logger.debug('verifyThreadExists', a)
    const threadId = a[0] as string
    const thread = this.papi.db.query.threads.findFirst({
      where: eq(schema.threads.threadKey, threadId),
    })
    if (!thread) {
      this.logger.info('thread does not exist, skipping payload and calling getThread')
      this.pQueue.addPromise(this.papi.socket.getThread(threadId))
    }
  }

  private getFirstAvailableAttachmentCTAID(a: SimpleArgType[]) {
    this.logger.debug('getFirstAvailableAttachmentCTAID (ignored)', a)
  }

  private hasMatchingAttachmentCTA(a: SimpleArgType[]) {
    this.logger.debug('hasMatchingAttachmentCTA (ignored)', a)
  }

  private computeDelayForTask(a: SimpleArgType[]) {
    this.logger.debug('computeDelayForTask (ignored)', a)
  }

  private checkAuthoritativeMessageExists(a: SimpleArgType[]) {
    this.logger.debug('checkAuthoritativeMessageExists (ignored)', a)
  }

  private markThreadRead(a: SimpleArgType[]) {
    this.logger.debug('markThreadRead (ignored)', a)
  }

  private moveThreadToInboxAndUpdateParent(a: SimpleArgType[]) {
    this.logger.debug('moveThreadToInboxAndUpdateParent (ignored)', a)
  }

  private setRegionHint(a: SimpleArgType[]) {
    this.logger.debug('setRegionHint (ignored)', a)
  }

  private updateMessagesOptimisticContext(a: SimpleArgType[]) {
    this.logger.debug('updateMessagesOptimisticContext (ignored)', a)
  }

  private updateParentFolderReadWatermark(a: SimpleArgType[]) {
    this.logger.debug('updateParentFolderReadWatermark (ignored)', a)
  }

  private updateParticipantLastMessageSendTimestamp(a: SimpleArgType[]) {
    this.logger.debug('updateParticipantLastMessageSendTimestamp (ignored)', a)
  }

  private updateThreadSnippet(a: SimpleArgType[]) {
    this.logger.debug('updateThreadSnippet (ignored)', a)
  }

  private writeCTAIdToThreadsTable(a: SimpleArgType[]) {
    const i = { lastMessageCtaType: a[1], lastMessageCtaTimestampMs: a[2] }
    this.logger.debug('writeCTAIdToThreadsTable (ignored)', a, i)
  }

  private bumpThread(a: SimpleArgType[]) {
    this.logger.debug('bumpThread (ignored)', a)
  }

  private insertSearchSection(a: SimpleArgType[]) {
    this.logger.debug('insertSearchSection (ignored)', a)
  }

  private updateSearchQueryStatus(a: SimpleArgType[]) {
    this.logger.debug('updateSearchQueryStatus (ignored)', a)
  }
}
