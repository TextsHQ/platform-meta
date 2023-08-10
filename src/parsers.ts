import type { DBParticipantInsert } from './store/schema'
import type { IGThread, IGMessage } from './ig-types'
import { getAsDate, getAsMS, getAsNumber, getAsString, parseValue } from './util'
import { IGContact } from './ig-types'

type RawItem = string[]

const parseThread = (a: RawItem): IGThread => {
  const t: IGThread = {
    raw: JSON.stringify(a),
    // isUnread: Number(a[0][1]) > Number(a[1][1]),
    threadKey: a[7][1],
    lastReadWatermarkTimestampMs: getAsMS(a[1][1]),
    // threadType: a[9][1] === '1' ? 'single' : 'group',
    threadType: a[9][1],
    folderName: a[10],
    parentThreadKey: a[35][1],
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

const parseVerifyContactRowExistsItem = (a: RawItem): IGContact => ({
  raw: JSON.stringify(a),
  id: a[0][1],
  profilePictureUrl: a[2] == null ? '' : a[2],
  name: a[3],
  username: a[20],
  profilePictureFallbackUrl: a[5],
  // name: d[0],
  secondaryName: a[20],
  // normalizedNameForSearch: d[0],
  isMemorialized: a[9],
  blockedByViewerStatus: parseValue(a[11]),
  canViewerMessage: a[12],
  // profilePictureLargeUrl: '',
  // isMessengerUser: !0,
  // rank: 0,
  contactType: parseValue(a[4]),
  // contactTypeExact: c.i64.cast([0, 0]),
  // requiresMultiway: !1,
  authorityLevel: parseValue(a[14]),
  // workForeignEntityType: c.i64.cast([0, 0]),
  capabilities: parseValue(a[15]),
  capabilities2: parseValue(a[16]),
  contactViewerRelationship: parseValue(a[19]),
  gender: parseValue(a[18]),
})

const parseParticipant = (a: RawItem): DBParticipantInsert => ({
  raw: JSON.stringify(a),
  threadKey: a[0][1],
  userId: a[1][1],
  readWatermarkTimestampMs: getAsDate(a[2][1]),
  readActionTimestampMs: getAsDate(a[3][1]),
  deliveredWatermarkTimestampMs: getAsDate(a[4][1]),
  // lastDeliveredWatermarkTimestampMs: getAsDate(a[5][1])),
  lastDeliveredActionTimestampMs: a[5][1] ? getAsDate(a[5][1]) : null,
  isAdmin: Boolean(a[6]),
})

const parseMessage = (a: RawItem): IGMessage => ({
  raw: JSON.stringify(a),
  text: a[0],
  threadKey: a[3][1],
  timestampMs: getAsMS(a[5][1]),
  messageId: a[8],
  offlineThreadingId: a[9],
  senderId: a[10][1],
  authorityLevel: Number(a[2][1]),
  primarySortKey: a[6][1],
  isAdminMessage: Boolean(a[12]),
  sendStatus: a[15][1],
  sendStatusV2: a[16][1],
  subscriptErrorMessage: a[1][1],
  secondarySortKey: a[7][1],
  stickerId: a[11][1],
  messageRenderingType: a[13][1],
  isUnsent: Boolean(a[17]),
  unsentTimestampMs: getAsMS(a[18][1]),
  mentionOffsets: a[19][1],
  mentionLengths: a[20][1],
  mentionIds: a[21][1],
  mentionTypes: a[22][1],
  replySourceId: parseValue<string>(a[23]),
  replySourceType: parseValue<string>(a[24]),
  replySourceTypeV2: parseValue<string>(a[25]),
  replyStatus: parseValue<string>(a[26]),
  replySnippet: parseValue(a[27]),
  replyMessageText: parseValue(a[28]),
  replyToUserId: parseValue<string>(a[29]),
  replyMediaExpirationTimestampMs: getAsMS(a[30][1]),
  replyMediaUrl: parseValue<string>(a[31]),
  replyMediaPreviewWidth: a[33][1],
  replyMediaPreviewHeight: a[34][1],
  replyMediaUrlMimeType: a[35][1],
  replyMediaUrlFallback: a[36][1],
  replyCtaId: a[37][1],
  replyCtaTitle: a[38][1],
  replyAttachmentType: a[39][1],
  replyAttachmentId: a[40][1],
  replyAttachmentExtra: a[41][1],
  isForwarded: Boolean(a[42]),
  forwardScore: a[43][1],
  hasQuickReplies: Boolean(a[44]),
  adminMsgCtaId: a[45][1],
  adminMsgCtaTitle: a[46][1],
  adminMsgCtaType: a[47][1],
  cannotUnsendReason: a[48][1],
  textHasLinks: getAsNumber(a[49]),
  viewFlags: a[50][1],
  displayedContentTypes: a[51][1],
  viewedPluginKey: a[52][1],
  viewedPluginContext: a[53][1],
  quickReplyType: a[54][1],
  hotEmojiSize: a[55][1],
  replySourceTimestampMs: getAsMS(a[56][1]),
  ephemeralDurationInSec: a[57][1],
  msUntilExpirationTs: getAsMS(a[58][1]),
  ephemeralExpirationTs: getAsMS(a[59][1]),
  takedownState: a[60][1],
  isCollapsed: Boolean(a[61]),
  subthreadKey: a[62][1],
  links: null,
})

const parseAttachment = (a: RawItem) => ({
  raw: JSON.stringify(a),
  filename: a[0],
  threadKey: a[27][1],
  messageId: a[32],
  previewUrl: a[8],
  previewUrlFallback: a[9],
  previewUrlExpirationTimestampMs: getAsMS(a[10][1]),
  previewUrlMimeType: a[11][1],
  previewWidth: Number(a[14][1]),
  previewHeight: Number(a[15][1]),
  timestampMs: getAsMS(a[31][1]),
  attachmentType: a[29][1],
  attachmentFbid: a[34],
  filesize: Number(a[1][1]),
  hasMedia: Boolean(a[2]),
  playableUrl: a[3],
  playableUrlFallback: a[4],
  playableUrlExpirationTimestampMs: getAsMS(a[5][1]),
  playableUrlMimeType: a[6],
  dashManifest: a[7],
  miniPreview: a[13],
  attributionAppId: a[16],
  attributionAppName: a[17],
  isSharable: !1,
  attributionAppIcon: a[18],
  attributionAppIconFallback: a[19],
  attributionAppIconUrlExpirationTimestampMs: getAsMS(a[20]),
  localPlayableUrl: a[21],
  playableDurationMs: getAsMS(a[22]),
  attachmentIndex: a[23],
  accessibilitySummaryText: a[24],
  isPreviewImage: Boolean(a[25]),
  originalFileHash: a[26],
  offlineAttachmentId: parseValue<string>(a[33]), // @TODO: is integer/bigint?
  hasXma: Boolean(a[35]),
  xmaLayoutType: a[36],
  xmasTemplateType: a[37],
  titleText: a[38],
  subtitleText: a[39],
  descriptionText: a[40],
  sourceText: a[41],
  faviconUrlExpirationTimestampMs: getAsMS(a[42]),
  isBorderless: Boolean(a[44]),
  previewUrlLarge: a[45],
  samplingFrequencyHz: Number(a[46]),
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

type SearchArgumentType = 'user' | 'group' | 'unknown_user'

const parseSearchArguments = (a: RawItem) => ({
  // query: a[0],
  id: a[1],
  // type of [1] is user
  // type of [2] is group chat
  type: (a[4][1] === '1' ? 'user' : a[4][1] === '2' ? 'group' : 'unknown_user') as SearchArgumentType,
  fullName: a[5],
  imgURL: a[6],
  username: a[8],
  // messageId: a[9],
  // messageTimestampMs: new Date(Number(a[10])),
  // isVerified: Boolean(a[12]),
})

const parseUpdateReadReceipt = (a: RawItem) => ({
  raw: JSON.stringify(a),
  readWatermarkTimestampMs: getAsMS(a[0][1]), // last message logged in user has read from
  threadKey: a[1][1],
  contactId: a[2][1],
  readActionTimestampMs: getAsMS(a[3][1]),
})

const parseInsertAttachmentItem = (a: RawItem) => ({
  attachmentFbid: a[0],
  threadKey: a[2][1],
  messageId: a[4],
  previewUrl: a[17],
})

const parseInsertAttachmentCta = (a: RawItem) => ({
  raw: JSON.stringify(a),
  attachmentFbid: a[1],
  threadKey: a[3][1],
  messageId: a[5],
  actionUrl: parseValue<string>(a[9]),
})

const parseInsertXmaAttachment = (a: RawItem) => ({
  raw: JSON.stringify(a),
  threadKey: a[25][1],
  attachmentFbid: a[32],
  messageId: a[30],
  playableUrl: a[8],
  playableUrlMimeType: a[11],
  previewWidth: Number(a[13][1]),
  previewHeight: Number(a[14][1]),
  timestampMs: getAsMS(a[29][1]),
  offlineAttachmentId: null,
})

const parseDeleteReaction = (a: RawItem) => ({
  threadKey: a[0][1],
  messageId: a[1],
  actorId: a[2][1],
})
const parseMap = {
  deleteThenInsertThread: parseThread,
  upsertMessage: parseMessage,
  upsertReaction: parseReaction,
  addParticipantIdToGroupThread: parseParticipant,
  verifyContactRowExists: parseVerifyContactRowExistsItem,
  insertBlobAttachment: parseAttachment,
  insertXmaAttachment: parseInsertXmaAttachment,
  upsertSyncGroupThreadsRange: parseUpsertSyncGroupThreadsRange,
  insertSearchResult: parseSearchArguments,
  insertNewMessageRange: parseInsertNewMessageRange,
  insertMessage: parseMessage,
  updateThreadMuteSetting: parseThreadMuteSetting,
  syncUpdateThreadName: parseUpdateThreadName,
  updateThreadParticipantAdminStatus: parseUpdateThreadParticipantAdminStatus,
  removeParticipantFromThread: parseRemoveParticipantFromThread,
  replaceOptimsiticMessage: parseReplaceOptimsiticMessage,
  updateReadReceipt: parseUpdateReadReceipt,
  insertAttachmentItem: parseInsertAttachmentItem,
  insertAttachmentCta: parseInsertAttachmentCta,
  deleteReaction: parseDeleteReaction,
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
    cursor: j.step[2][1]?.[3]?.[5] as string,
  }
}

export type ParsedPayload = ReturnType<typeof parseRawPayload>
