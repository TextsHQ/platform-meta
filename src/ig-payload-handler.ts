import { ServerEventType } from '@textshq/platform-sdk'
import { eq } from 'drizzle-orm'
import type PlatformInstagram from './api'
import * as schema from './store/schema'
import { getLogger } from './logger'
import { generateCallList, type SimpleArgType } from './ig-payload-parser'

export default class InstagramPayloadHandler {
  private calls: ReturnType<typeof generateCallList>

  private afterCallbacks: (() => Promise<void>)[] = []

  private logger = getLogger('InstagramPayloadHandler')

  private papi: PlatformInstagram

  constructor(papi: PlatformInstagram, data: Parameters<typeof generateCallList>[0]) {
    this.papi = papi
    this.calls = generateCallList(data)
  }

  async run() {
    this.calls.forEach(([method, args]) => {
      if (typeof this[method] !== 'function') {
        this.logger.error(`Method ${method} does not exist in InstagramPayloadHandler`)
        return
      }
      const returns = this[method](...args)
      if (typeof returns === 'function') {
        this.afterCallbacks.push(returns)
      }
    })
  }

  sync = async () => {
    for (const callback of this.afterCallbacks) {
      await callback()
    }
  }

  runAndSync = async () => {
    await this.run()
    await this.sync()
  }

  private deleteThenInsertThread(a: SimpleArgType[]) {
    this.logger.debug('deleteThenInsertThread', a)
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

    this.papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadKey)).run()
    this.papi.db.insert(schema.threads).values({
      raw: JSON.stringify(a),
      threadKey,
      parentThreadKey: a[35] as unknown as number,
      lastActivityTimestampMs: new Date(thread.lastActivityTimestampMs),
      thread: JSON.stringify(thread),
    }).run()

    return async () => {
      this.logger.debug('deleteThenInsertThread (sync)', a)

      const newThread = await this.papi.getThread(threadKey)
      this.papi.onEvent?.([{
        type: ServerEventType.STATE_SYNC,
        objectName: 'thread',
        objectIDs: {},
        mutationType: 'upsert',
        entries: [newThread],
      }])
    }
  }

  private updateThreadMuteSetting(a: SimpleArgType[]) {
    this.logger.debug('updateThreadMuteSetting', a)
    const threadKey = a[0] as string
    const muteExpireTimeMs = Number(a[1])

    return () => {
      this.logger.debug('updateThreadMuteSetting (sync)', a)
      this.papi.onEvent?.([{
        type: ServerEventType.STATE_SYNC,
        objectName: 'thread',
        objectIDs: {},
        mutationType: 'update',
        entries: [{
          id: threadKey,
          mutedUntil: muteExpireTimeMs === -1 ? 'forever' : new Date(muteExpireTimeMs),
        }],
      }])
    }
  }
}
