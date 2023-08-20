import { ServerEventType } from '@textshq/platform-sdk'
import { eq } from 'drizzle-orm'
import { RawItem } from './types'
import type PlatformInstagram from './api'
import * as schema from './store/schema'
import { getLogger } from './logger'
import { getAsMS } from './util'

type Command = [string, unknown[]]

export type IGSocketResponse = {
  sp: string[]
  payload: string
}

function generateCallList(data: IGSocketResponse): Command[] {
  const calls: Command[] = []
  const supportedCommands = data.sp

  // Helper function to handle argument transformation
  function transformArg(arg: any): any {
    // Example: [19, "600"]
    if (Array.isArray(arg) && arg[0] === 19) {
      const numValue = Number(arg[1])
      if (Number.isSafeInteger(numValue)) {
        return numValue
      }
      return arg[1].toString()
    }
    // Example: [9]
    if (Array.isArray(arg) && arg[0] === 9) {
      return undefined
    }
    return arg
  }

  function processStep(step: any[]): void {
    if (!step) {
      console.error('Invalid step', step)
      throw new Error('Invalid step!')
    }
    for (const item of step) {
      if (Array.isArray(item) && item.length > 0) {
        // Check for method call, e.g., [5, "mciTraceLog", ...]
        if (item[0] === 5 && typeof item[1] === 'string') {
          const methodName = item[1]
          if (!supportedCommands.includes(methodName)) {
            console.error(`Unsupported command: ${methodName}`)
            continue
          }

          // Map args using the helper function
          const args = item.slice(2).map(arg => transformArg(arg))
          calls.push([methodName, args])
        } else {
          // Recursive call for nested structure
          processStep(item)
        }
      }
    }
  }

  // Extract the actual payload from the provided data
  const internalPayload = JSON.parse(data.payload as unknown as string) as { step: any[] }
  if (!internalPayload.step) {
    console.error('Invalid payload', internalPayload)
    throw new Error('Invalid payload!')
  }
  processStep(internalPayload.step)

  return calls
}

export default class InstagramPayloadHandler {
  private sp: IGSocketResponse['sp']

  private calls: Command[]

  private afterCallbacks: (() => void)[] = []

  private logger = getLogger('InstagramPayloadHandler')

  private papi: PlatformInstagram

  constructor(papi: PlatformInstagram, data: IGSocketResponse) {
    this.papi = papi
    this.calls = generateCallList(data)
    this.calls.forEach(([method, args]) => {
      if (typeof this[method] !== 'function') {
        this.logger.warn(`Method ${method} does not exist in InstagramPayloadHandler`)
        return
      }
      const returns = this[method](...args)
      if (returns instanceof Promise) {
        returns.catch(e => {
          this.logger.error(e, { method }, `Error in method ${method}`)
        })
      } else if (typeof returns === 'function') {
        this.afterCallbacks.push(returns)
      }
    })
  }

  public async sync() {
    await Promise.all(this.afterCallbacks.map(cb => cb()))
  }

  private deleteThenInsertThread(a: RawItem) {
    const thread = {
      // isUnread: Number(a[0][1]) > Number(a[1][1]),
      lastReadWatermarkTimestampMs: getAsMS(a[1]),
      // threadType: a[9][1] === '1' ? 'single' : 'group',
      threadType: a[9],
      folderName: a[10],
      parentThreadKey: a[35],
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
      ongoingCallState: a[32][1],
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
      lastMessageCtaId: a[65][1],
      lastMessageCtaType: a[66][1],
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

    // @TODO: parsers should handle this before we come here
    for (const key in thread) {
      if (typeof thread[key] === 'boolean') {
        thread[key] = thread[key] ? 1 : 0
      }
    }

    const threadKey = a[7]

    this.papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadKey)).run()
    this.papi.db.insert(schema.threads).values({
      raw: JSON.stringify(a),
      threadKey,
      parentThreadKey: a[35] as unknown as number,
      lastActivityTimestampMs: new Date(thread.lastActivityTimestampMs),
      thread: JSON.stringify(thread),
    }).run()

    return async () => {
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

  private updateThreadMuteSetting(a: RawItem) {
    const threadKey = a[0]
    const muteExpireTimeMs = getAsMS(a[1])

    return () => {
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
