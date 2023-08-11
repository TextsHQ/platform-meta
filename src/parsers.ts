import type { DBParticipantInsert } from './store/schema'
import type { IGThread, IGMessage } from './ig-types'
import { getAsDate, getAsMS, getAsNumber, getAsString, getInboxNameFromIGFolder, parseValue } from './util'
import { IGContact } from './ig-types'

type RawItem = string[]

type SearchArgumentType = 'user' | 'group' | 'unknown_user'

const parseMap = {
  deleteThenInsertThread: (a: RawItem) => {
    const t: IGThread = {
      raw: JSON.stringify(a),
      // isUnread: Number(a[0][1]) > Number(a[1][1]),
      threadKey: a[7][1],
      lastReadWatermarkTimestampMs: getAsMS(a[1][1]),
      // threadType: a[9][1] === '1' ? 'single' : 'group',
      threadType: a[9][1],
      folderName: getInboxNameFromIGFolder(parseValue<string>(a[10])),
      parentThreadKey: parseValue<string>(a[35]),
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
  },
  upsertMessage: (a: RawItem): IGMessage => ({
    raw: JSON.stringify(a),
    links: null,
    threadKey: parseValue<string>(a[3]),
    timestampMs: getAsMS(parseValue<string>(a[5])),
    messageId: parseValue<string>(a[8]),
    offlineThreadingId: parseValue<string>(a[9]),
    authorityLevel: getAsNumber(a[2]),
    primarySortKey: parseValue<string>(a[6]),
    senderId: parseValue<string>(a[10]),
    isAdminMessage: parseValue<boolean>(a[12]),
    sendStatus: parseValue<string>(a[15]),
    sendStatusV2: parseValue<string>(a[16]),
    text: parseValue<string>(a[0]),
    subscriptErrorMessage: parseValue<string>(a[1]),
    secondarySortKey: parseValue<string>(a[7]),
    stickerId: parseValue<string>(a[11]),
    messageRenderingType: parseValue<string>(a[13]),
    isUnsent: parseValue<boolean>(a[17]),
    unsentTimestampMs: getAsMS(parseValue<string>(a[18])),
    mentionOffsets: parseValue<string>(a[19]),
    mentionLengths: parseValue<string>(a[20]),
    mentionIds: parseValue<string>(a[21]),
    mentionTypes: parseValue<string>(a[22]),
    replySourceId: parseValue<string>(a[23]),
    replySourceType: parseValue<string>(a[24]),
    replySourceTypeV2: parseValue<string>(a[25]),
    replyStatus: parseValue<string>(a[26]),
    replySnippet: parseValue<string>(a[27]),
    replyMessageText: parseValue<string>(a[28]),
    replyToUserId: parseValue<string>(a[29]),
    replyMediaExpirationTimestampMs: getAsMS(parseValue<string>(a[30])),
    replyMediaUrl: parseValue<string>(a[31]),
    replyMediaPreviewWidth: parseValue<string>(a[33]),
    replyMediaPreviewHeight: parseValue<string>(a[34]),
    replyMediaUrlMimeType: parseValue<string>(a[35]),
    replyMediaUrlFallback: parseValue<string>(a[36]),
    replyCtaId: parseValue<string>(a[37]),
    replyCtaTitle: parseValue<string>(a[38]),
    replyAttachmentType: parseValue<string>(a[39]),
    replyAttachmentId: parseValue<string>(a[40]),
    replyAttachmentExtra: parseValue<string>(a[41]),
    replyType: parseValue<string>(a[42]),
    isForwarded: parseValue<boolean>(a[43]),
    forwardScore: parseValue<string>(a[44]),
    hasQuickReplies: parseValue<boolean>(a[45]),
    adminMsgCtaId: parseValue<string>(a[46]),
    adminMsgCtaTitle: parseValue<string>(a[47]),
    adminMsgCtaType: parseValue<string>(a[48]),
    cannotUnsendReason: parseValue<string>(a[49]),
    textHasLinks: parseValue<number>(a[50]),
    viewFlags: parseValue<string>(a[51]),
    displayedContentTypes: parseValue<string>(a[52]),
    viewedPluginKey: parseValue<string>(a[53]),
    viewedPluginContext: parseValue<string>(a[54]),
    quickReplyType: parseValue<string>(a[55]),
    hotEmojiSize: parseValue<string>(a[56]),
    replySourceTimestampMs: getAsMS(parseValue<string>(a[57])),
    ephemeralDurationInSec: parseValue<string>(a[58]),
    msUntilExpirationTs: getAsMS(parseValue<string>(a[59])),
    ephemeralExpirationTs: getAsMS(parseValue<string>(a[60])),
    takedownState: parseValue<string>(a[61]),
    isCollapsed: parseValue<boolean>(a[62]),
    subthreadKey: parseValue<string>(a[63]),
  }),
  upsertReaction: (a: RawItem) => ({
    raw: JSON.stringify(a),
    threadKey: a[0][1],
    timestampMs: getAsDate(a[1][1]),
    messageId: a[2],
    actorId: a[3][1],
    reaction: a[4],
  }),
  addParticipantIdToGroupThread: (a: RawItem): DBParticipantInsert => ({
    raw: JSON.stringify(a),
    threadKey: a[0][1],
    userId: a[1][1],
    readWatermarkTimestampMs: getAsDate(a[2][1]),
    readActionTimestampMs: getAsDate(a[3][1]),
    deliveredWatermarkTimestampMs: getAsDate(a[4][1]),
    // lastDeliveredWatermarkTimestampMs: getAsDate(a[5][1])),
    lastDeliveredActionTimestampMs: a[5][1] ? getAsDate(a[5][1]) : null,
    isAdmin: Boolean(a[6]),
  }),
  verifyContactRowExists: (a: RawItem): IGContact => ({
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
  }),
  deleteThenInsertContact: (a: RawItem) => ({
    id: a[0][1],
    profilePictureUrl: a[2] == null ? '' : a[2],
    name: a[9],
    username: a[41],
  }),
  insertBlobAttachment: (a: RawItem) => ({
    raw: JSON.stringify(a),
    filename: a[0],
    threadKey: a[27][1],
    messageId: a[32],
    previewUrl: a[8],
    previewUrlFallback: a[9],
    previewUrlExpirationTimestampMs: getAsMS(a[10][1]),
    previewUrlMimeType: a[11][1],
    previewWidth: Number(parseValue<string>(a[14])),
    previewHeight: Number(parseValue<string>(a[15])),
    timestampMs: getAsMS(a[31][1]),
    attachmentType: a[29][1],
    attachmentFbid: a[34],
    filesize: Number(parseValue<string>(a[1])),
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
  }),
  insertXmaAttachment: (a: RawItem) => ({
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
  }),
  upsertSyncGroupThreadsRange: (a: RawItem) => ({
    hasMoreBefore: Boolean(a[3]),
    minLastActivityTimestampMs: getAsMS(a[2][1]),
    minThreadKey: getAsMS(a[5][1]),
  }),
  insertSearchResult: (a: RawItem) => ({
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
  }),
  insertNewMessageRange: (a: RawItem) => ({
    threadKey: a[0][1],
    hasMoreBefore: Boolean(a[7]),
  }),
  insertMessage: (a: RawItem): IGMessage => ({
    raw: JSON.stringify(a),
    links: null,
    threadKey: parseValue<string>(a[3]),
    timestampMs: getAsMS(parseValue<string>(a[5])),
    messageId: parseValue<string>(a[8]),
    offlineThreadingId: parseValue<string>(a[9]),
    authorityLevel: parseValue<number>(a[2]),
    primarySortKey: parseValue<string>(a[6]),
    senderId: parseValue<string>(a[10]),
    isAdminMessage: parseValue<boolean>(a[12]),
    sendStatus: parseValue<string>(a[15]),
    sendStatusV2: parseValue<string>(a[16]),
    text: parseValue<string>(a[0]),
    subscriptErrorMessage: parseValue<string>(a[1]),
    secondarySortKey: parseValue<string>(a[7]),
    stickerId: parseValue<string>(a[11]),
    messageRenderingType: parseValue<string>(a[13]),
    isUnsent: parseValue<boolean>(a[17]),
    unsentTimestampMs: getAsMS(parseValue<string>(a[18])),
    mentionOffsets: parseValue<string>(a[19]),
    mentionLengths: parseValue<string>(a[20]),
    mentionIds: parseValue<string>(a[21]),
    mentionTypes: parseValue<string>(a[22]),
    replySourceId: parseValue<string>(a[23]),
    replySourceType: parseValue<string>(a[24]),
    replySourceTypeV2: parseValue<string>(a[25]),
    replyStatus: parseValue<string>(a[26]),
    replySnippet: parseValue<string>(a[27]),
    replyMessageText: parseValue<string>(a[28]),
    replyToUserId: parseValue<string>(a[29]),
    replyMediaExpirationTimestampMs: getAsMS(parseValue<string>(a[30])),
    replyMediaUrl: parseValue<string>(a[31]),
    replyMediaPreviewWidth: parseValue<string>(a[33]),
    replyMediaPreviewHeight: parseValue<string>(a[34]),
    replyMediaUrlMimeType: parseValue<string>(a[35]),
    replyMediaUrlFallback: parseValue<string>(a[36]),
    replyCtaId: parseValue<string>(a[37]),
    replyCtaTitle: parseValue<string>(a[38]),
    replyAttachmentType: parseValue<string>(a[39]),
    replyAttachmentId: parseValue<string>(a[40]),
    replyAttachmentExtra: parseValue<string>(a[41]),
    isForwarded: parseValue<boolean>(a[42]),
    forwardScore: parseValue<string>(a[43]),
    hasQuickReplies: parseValue<boolean>(a[44]),
    adminMsgCtaId: parseValue<string>(a[45]),
    adminMsgCtaTitle: parseValue<string>(a[46]),
    adminMsgCtaType: parseValue<string>(a[47]),
    cannotUnsendReason: parseValue<string>(a[48]),
    textHasLinks: parseValue<number>(a[49]),
    viewFlags: parseValue<string>(a[50]),
    displayedContentTypes: parseValue<string>(a[51]),
    viewedPluginKey: parseValue<string>(a[52]),
    viewedPluginContext: parseValue<string>(a[53]),
    quickReplyType: parseValue<string>(a[54]),
    hotEmojiSize: parseValue<string>(a[55]),
    replySourceTimestampMs: getAsMS(parseValue<string>(a[56])),
    ephemeralDurationInSec: parseValue<string>(a[57]),
    msUntilExpirationTs: getAsMS(parseValue<string>(a[58])),
    ephemeralExpirationTs: getAsMS(parseValue<string>(a[59])),
    takedownState: parseValue<string>(a[60]),
    isCollapsed: parseValue<boolean>(a[61]),
    subthreadKey: parseValue<string>(a[62]),
  }),
  updateThreadMuteSetting: (a: RawItem) => ({
    threadKey: a[0][1],
    muteExpireTimeMs: getAsMS(a[1][1]),
  }),
  syncUpdateThreadName: (a: RawItem) => ({
    threadName: a[0],
    threadKey: a[1][1],
  }),
  updateThreadParticipantAdminStatus: (a: RawItem) => ({
    threadKey: a[0][1],
    participantId: a[1][1],
    isAdmin: Boolean(a[2]),
  }),
  removeParticipantFromThread: (a: RawItem) => ({
    threadKey: a[0][1],
    contactId: a[1][1],
  }),
  replaceOptimsiticMessage: (a: RawItem) => ({
    offlineThreadingId: a[0],
    messageId: a[1],
  }),
  replaceOptimisticThread: (a: RawItem) => ({
    offlineThreadingId: parseValue<string>(a[0]),
    threadId: parseValue<string>(a[1]),
  }),
  updateReadReceipt: (a: RawItem) => ({
    raw: JSON.stringify(a),
    readWatermarkTimestampMs: getAsMS(a[0][1]), // last message logged in user has read from
    threadKey: a[1][1],
    contactId: a[2][1],
    readActionTimestampMs: getAsMS(a[3][1]),
  }),
  insertAttachmentItem: (a: RawItem) => ({
    attachmentFbid: a[0],
    threadKey: a[2][1],
    messageId: a[4],
    previewUrl: a[17],
  }),
  insertAttachmentCta: (a: RawItem) => ({
    raw: JSON.stringify(a),
    attachmentFbid: a[1],
    threadKey: a[3][1],
    messageId: a[5],
    actionUrl: parseValue<string>(a[9]),
  }),
  deleteReaction: (a: RawItem) => ({
    threadKey: a[0][1],
    messageId: a[1],
    actorId: a[2][1],
  }),
  verifyThreadExists: (a: RawItem) => ({
    threadKey: a[0][1],
  }),
  deleteMessage: (a: RawItem) => ({
    threadKey: a[0][1],
    messageId: a[1],
  }),
  updateExistingMessageRange: (a: RawItem) => ({
    threadKey: a[0][1],
    maxTimestampMs: getAsMS(a[1][1]),
    hasMoreBefore: Boolean(a[3]),
    hasMoreAfter: Boolean(a[4]),
  }),
  removeOptimisticGroupThread: (a: RawItem) => ({
    offlineThreadingId: parseValue<string>(a[0]),
  }),
  taskExists: (a: RawItem) => ({
    taskId: parseValue<string>(a[0]),
  }),
  issueNewError: (a: RawItem) => ({
    requestId: parseValue<string>(a[0]),
    errorId: parseValue<string>(a[1]), // @TODO: not sure what this value is
    errorTitle: parseValue<string>(a[2]),
    errorMessage: parseValue<string>(a[3]),
  }),
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
