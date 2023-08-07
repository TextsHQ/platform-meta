import type { User } from '@textshq/platform-sdk'
import type { DBParticipantInsert, IGUser } from './store/schema'
import type { IGThread, IGMessage } from './ig-types'
import { getAsDate, getAsMS, getAsString } from './util'

type RawItem = string[]

function p<T extends string | number | boolean | null>(value: string | [number, string]) {
  if (
    typeof value === 'string'
    || typeof value === 'number'
    || !Array.isArray(value)
  ) return value as T
  if (value[0] === 9) return null as T
  if (value[0] === 19) return Number(value[1]) as T
  return value[1] as T
}

function pDate(ms: number) {
  return ms ? new Date(ms) : undefined
}

// thread keys are integers but it's simpler to use strings
// mainly because texts itself uses strings for thread ids
function pThreadKey(threadKey: number) {
  return threadKey ? threadKey.toString() : undefined
}

const parseThread = (a: RawItem): IGThread => {
  const t: IGThread = {
    raw: JSON.stringify(a),
    // isUnread: Number(a[0][1]) > Number(a[1][1]),
    threadKey: pThreadKey(p<number>(a[7])),
    lastReadWatermarkTimestampMs: getAsMS(a[1][1]),
    // threadType: a[9][1] === '1' ? 'single' : 'group',
    threadType: a[9][1],
    folderName: a[10],
    parentThreadKey: pThreadKey(p<number>(a[35])),
    lastActivityTimestampMs: getAsMS(a[0][1]),
    snippet: a[2],
    threadName: a[3][1],
    threadPictureUrl: getAsString(a[4]),
    needsAdminApprovalForNewParticipant: Boolean(a[5][1]),
    threadPictureUrlFallback: a[11],
    threadPictureUrlExpirationTimestampMs: getAsMS(a[12][1]),
    removeWatermarkTimestampMs: getAsMS(a[13][1]),
    muteExpireTimeMs: getAsMS(a[14][1]),
    // muteCallsExpireTimeMs: getAsMS(a[15][1]),
    groupNotificationSettings: a[16][1],
    isAdminSnippet: Boolean(a[17][1]),
    snippetSenderContactId: a[18][1],
    snippetStringHash: a[21][1],
    snippetStringArgument1: a[22][1],
    snippetAttribution: a[23][1],
    snippetAttributionStringHash: a[24][1],
    disappearingSettingTtl: Number(a[25][1]),
    disappearingSettingUpdatedTs: getAsMS(a[26][1]),
    disappearingSettingUpdatedBy: a[27][1],
    cannotReplyReason: a[30][1],
    customEmoji: a[31][1],
    customEmojiImageUrl: a[32][1],
    outgoingBubbleColor: a[33][1],
    themeFbid: a[34][1],
    authorityLevel: 0,
    mailboxType: a[8][1],
    muteMentionExpireTimeMs: getAsMS(a[15][1]),
    muteCallsExpireTimeMs: getAsMS(a[16][1]),
    ongoingCallState: a[32][1],
    nullstateDescriptionText1: a[39][1],
    nullstateDescriptionType1: a[40][1],
    nullstateDescriptionText2: a[41][1],
    nullstateDescriptionType2: a[42][1],
    nullstateDescriptionText3: a[43],
    nullstateDescriptionType3: a[44],
    draftMessage: a[45],
    snippetHasEmoji: Boolean(a[46][1]),
    hasPersistentMenu: Boolean(a[47][1]),
    disableComposerInput: Boolean(a[48][1]),
    cannotUnsendReason: a[49][1],
    viewedPluginKey: a[50][1],
    viewedPluginContext: a[51][1],
    clientThreadKey: a[52][1],
    capabilities: a[53],
    shouldRoundThreadPicture: Boolean(a[54][1]),
    proactiveWarningDismissTime: Number(a[55][1]),
    isCustomThreadPicture: Boolean(a[56][1]),
    otidOfFirstMessage: a[57][1],
    normalizedSearchTerms: a[58],
    additionalThreadContext: a[59][1],
    disappearingThreadKey: a[60][1],
    isDisappearingMode: Boolean(a[61][1]),
    disappearingModeInitiator: a[62][1],
    unreadDisappearingMessageCount: Number(a[63][1]),
    lastMessageCtaId: a[65][1],
    lastMessageCtaType: a[66][1],
    lastMessageCtaTimestampMs: getAsMS(a[67][1]),
    consistentThreadFbid: a[68][1],
    threadDescription: a[70][1],
    unsendLimitMs: getAsMS(a[71][1]),
    capabilities2: a[79][1],
    capabilities3: a[80][1],
    syncGroup: a[83],
    threadInvitesEnabled: Boolean(a[84]),
    threadInviteLink: a[85],
    isAllUnreadMessageMissedCallXma: Boolean(a[86]),
    lastNonMissedCallXmaMessageTimestampMs: getAsMS(a[87]),
    threadInvitesEnabledV2: Boolean(a[89]),
    hasPendingInvitation: Boolean(a[92]),
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
  }

  if (Array.isArray(a[3])) {
    t.threadName = null
  } else {
    // eslint-disable-next-line prefer-destructuring
    t.threadName = a[3]
  }

  return t
  // loop through the keys and if the value is
}

const parseUser = (a: RawItem): IGUser => ({
  raw: JSON.stringify(a),
  id: a[0][1],
  profilePictureUrl: a[2] == null ? '' : a[2],
  name: a[3],
  username: a[20],
})

const parseParticipant = (a: RawItem): DBParticipantInsert => ({
  raw: JSON.stringify(a),
  threadKey: pThreadKey(p<number>(a[0])),
  userId: a[1][1],
  readWatermarkTimestampMs: pDate(p<number>(a[2])),
  readActionTimestampMs: pDate(p<number>(a[3])),
  deliveredWatermarkTimestampMs: pDate(p<number>(a[4])),
  // lastDeliveredWatermarkTimestampMs: getAsDate(a[5][1])),
  lastDeliveredActionTimestampMs: a[5][1] ? getAsDate(a[5][1]) : null,
  isAdmin: Boolean(a[6]),
})

const parseMessage = (a: RawItem): IGMessage => ({
  raw: JSON.stringify(a),
  text: p(a[0]),
  threadKey: pThreadKey(p<number>(a[3])),
  timestampMs: p(a[5]),
  messageId: p(a[8]),
  offlineThreadingId: p(a[9]),
  senderId: p(a[10]),
  authorityLevel: p(a[2]),
  primarySortKey: p(a[6]),
  isAdminMessage: p(a[12]),
  sendStatus: p(a[15]),
  sendStatusV2: p(a[16]),
  subscriptErrorMessage: p(a[1]),
  secondarySortKey: p(a[7]),
  stickerId: p(a[11]),
  messageRenderingType: p(a[13]),
  isUnsent: p(a[17]),
  unsentTimestampMs: p(a[18]),
  mentionOffsets: p(a[19]),
  mentionLengths: p(a[20]),
  mentionIds: p(a[21]),
  mentionTypes: p(a[22]),
  replySourceId: p(a[23]),
  replySourceType: p(a[24]),
  replySourceTypeV2: p(a[25]),
  replyStatus: p(a[26]),
  replySnippet: p(a[27]),
  replyMessageText: p(a[28]),
  replyToUserId: p(a[29]),
  replyMediaExpirationTimestampMs: p(a[30]),
  replyMediaUrl: p(a[31]),
  replyMediaPreviewWidth: p(a[33]),
  replyMediaPreviewHeight: p(a[34]),
  replyMediaUrlMimeType: p(a[35]),
  replyMediaUrlFallback: p(a[36]),
  replyCtaId: p(a[37]),
  replyCtaTitle: p(a[38]),
  replyAttachmentType: p(a[39]),
  replyAttachmentId: p(a[40]),
  replyAttachmentExtra: p(a[41]),
  isForwarded: p(a[42]),
  forwardScore: p(a[43]),
  hasQuickReplies: p(a[44]),
  adminMsgCtaId: p(a[45]),
  adminMsgCtaTitle: p(a[46]),
  adminMsgCtaType: p(a[47]),
  cannotUnsendReason: p(a[48]),
  textHasLinks: p(a[49]),
  viewFlags: p(a[50]),
  displayedContentTypes: p(a[51]),
  viewedPluginKey: p(a[52]),
  viewedPluginContext: p(a[53]),
  quickReplyType: p(a[54]),
  hotEmojiSize: p(a[55]),
  replySourceTimestampMs: p(a[56]),
  ephemeralDurationInSec: p(a[57]),
  msUntilExpirationTs: p(a[58]),
  ephemeralExpirationTs: p(a[59]),
  takedownState: p(a[60]),
  isCollapsed: p(a[61]),
  subthreadKey: p(a[62]),
})

const parseAttachment = (a: RawItem) => ({
  raw: JSON.stringify(a),
  filename: a[0],
  threadKey: a[27],
  messageId: a[32],
  previewUrl: a[8],
  previewUrlFallback: a[9],
  previewUrlExpirationTimestampMs: p<number>(a[10]),
  previewUrlMimeType: a[11],
  previewWidth: p<number>(a[14]),
  previewHeight: p<number>(a[15]),
  timestampMs: p<number>(a[31]),
  attachmentType: a[29],
  attachmentFbid: a[34],
  filesize: p<number>(a[1]),
  hasMedia: p<boolean>(a[2]),
  playableUrl: a[3],
  playableUrlFallback: a[4],
  playableUrlExpirationTimestampMs: p<number>(a[5]),
  playableUrlMimeType: a[6],
  dashManifest: a[7],
  miniPreview: a[13],
  attributionAppId: a[16],
  attributionAppName: a[17],
  isSharable: !1,
  attributionAppIcon: a[18],
  attributionAppIconFallback: a[19],
  attributionAppIconUrlExpirationTimestampMs: p<number>(a[20]),
  localPlayableUrl: a[21],
  playableDurationMs: p<number>(a[22]),
  attachmentIndex: a[23],
  accessibilitySummaryText: a[24],
  isPreviewImage: p<boolean>(a[25]),
  originalFileHash: a[26],
  offlineAttachmentId: a[33],
  hasXma: p<boolean>(a[35]),
  xmaLayoutType: a[36],
  xmasTemplateType: a[37],
  titleText: a[38],
  subtitleText: a[39],
  descriptionText: a[40],
  sourceText: a[41],
  faviconUrlExpirationTimestampMs: p<number>(a[42]),
  isBorderless: p<boolean>(a[44]),
  previewUrlLarge: a[45],
  samplingFrequencyHz: p<number>(a[46]),
  waveformData: a[47],
  authorityLevel: a[48],
})

const parseReaction = (a: RawItem) => ({
  raw: JSON.stringify(a),
  threadKey: a[0][1],
  timestampMs: getAsDate(a[1][1]),
  messageId: a[2],
  actorId: a[3][1],
  reaction: a[4],
})

const parseUpsertSyncGroupThreadsRange = (a: RawItem) => ({
  hasMoreBefore: Boolean(a[3]),
  minLastActivityTimestampMs: getAsMS(a[2][1]),
  minThreadKey: getAsMS(a[5][1]),
})

const parseInsertNewMessageRange = (a: RawItem) => ({
  threadKey: a[0][1],
  hasMoreBefore: Boolean(a[7]),
})
const parseThreadMuteSetting = (a: RawItem) => ({
  threadKey: a[0][1],
  muteExpireTimeMs: getAsMS(a[1][1]),
})

const parseUpdateThreadName = (a: RawItem) => ({
  threadName: a[0],
  threadKey: a[1][1],
})
const parseRemoveParticipantFromThread = (a: RawItem) => ({
  threadKey: a[0][1],
  contactId: a[1][1],
})
const parseUpdateThreadParticipantAdminStatus = (a: RawItem) => ({
  threadKey: a[0][1],
  participantId: a[1][1],
  isAdmin: Boolean(a[2]),
})

const parseReplaceOptimsiticMessage = (a: RawItem) => ({
  offlineThreadingId: a[0],
  messageId: a[1],
})

const parseSearchArguments = (a: RawItem): User => ({
  // query: a[0],
  id: a[1],
  fullName: a[5],
  imgURL: a[6],
  username: a[8],
  // messageId: a[9],
  // messageTimestampMs: new Date(Number(a[10])),
  isVerified: Boolean(a[12]),
})

const parseMap = {
  deleteThenInsertThread: parseThread,
  upsertMessage: parseMessage,
  upsertReaction: parseReaction,
  addParticipantIdToGroupThread: parseParticipant,
  verifyContactRowExists: parseUser,
  insertBlobAttachment: parseAttachment,
  upsertSyncGroupThreadsRange: parseUpsertSyncGroupThreadsRange,
  insertSearchResult: parseSearchArguments,
  insertNewMessageRange: parseInsertNewMessageRange,
  insertMessage: parseMessage,
  updateThreadMuteSetting: parseThreadMuteSetting,
  syncUpdateThreadName: parseUpdateThreadName,
  updateThreadParticipantAdminStatus: parseUpdateThreadParticipantAdminStatus,
  removeParticipantFromThread: parseRemoveParticipantFromThread,
  replaceOptimsiticMessage: parseReplaceOptimsiticMessage,
} as const

type ParseFunctions = typeof parseMap

// Infer the return types of parse functions
type ParseReturnTypes = {
  [K in keyof ParseFunctions]: ParseFunctions[K] extends (...args: any[]) => infer R ? R : never;
}

// ResultType is an object with the same keys as parseMap,
// and each value is an array of the inferred return type of the corresponding parse function.
type ResultType = {
  [K in keyof ParseReturnTypes]: ParseReturnTypes[K][];
}

function interestedOperation(operation: any[]) {
  if (operation[0] === 5 && operation[1] in parseMap) {
    return parseMap[operation[1]](operation.slice(2))
  }
}

function recursiveParse(arr: any[]) {
  const res: Partial<ResultType> = {}
  for (const item of arr) {
    if (Array.isArray(item)) {
      const interested = interestedOperation(item)
      if (interested) {
        if (res[item[1]]) {
          res[item[1]].push(interested)
        }
        res[item[1]] = [interested]
      } else {
        const result = recursiveParse(item)
        if (Object.keys(result).length > 0) {
          //  for each key in result if the key is in res then concat the arrays
          for (const key in result) {
            if (res[key]) {
              res[key] = res[key].concat(result[key])
            } else {
              res[key] = result[key]
            }
          }
        }
      }
    }
  }
  return res
}

export function parseRawPayload(payload: string) {
  const j = JSON.parse(payload)
  return {
    ...recursiveParse(j.step),
    cursor: j.step[2][1][3][5] as string,
  }
}
