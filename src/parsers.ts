// import { type InferModel } from 'drizzle-orm'
// import * as schema from './store/schema'

import type { ExtendedIGMessage, ExtendedIGThread, IGAttachment, IGMessage, IGReaction } from './ig-types'

type RawItem = string[]

// construct the conversations from undecipherable data
export function parsePayload(myUserId: string, payload: string) {
  const j = JSON.parse(payload)

  // tasks we are interested in
  const lsCalls = {
    verifyContactRowExists: [],
    addParticipantIdToGroupThread: [],
    deleteThenInsertThread: [],
    upsertMessage: [],
    upsertSyncGroupThreadsRange: [],
    upsertReaction: [],
    insertBlobAttachment: [],
  }

  const userLookup = {}
  const lastMessageLookup = {}
  const reactionLookup: Record<string, IGReaction[]> = {}
  const imageLookup: Record<string, { imageId: string, imageUrl: string }[]> = {}
  const attachments: Map<IGAttachment['threadKey'], IGAttachment[]> = new Map()

  const conversationParticipants = {}
  const conversations: ExtendedIGThread[] = []

  // loop through the tasks
  for (const item of j.step[2][2][2].slice(1)) {
    // if we are interested in the task then add it to the lsCalls object
    if (item[1][1] in lsCalls) {
      lsCalls[item[1][1]].push(item[1].slice(2))
    }
  }

  // major shout out to Radon Rosborough(username radian-software) and  Scott Conway (username scottmconway) for their work in deciphering the lsCalls
  // this parsing would not be possible without their repos
  // https://github.com/scottmconway/unzuckify
  // https://github.com/radian-software/unzuckify
  // https://intuitiveexplanations.com/tech/messenger Radon's blog post on reverse engineering messenger. messenger and instagram use the same protocol
  for (const item of lsCalls.verifyContactRowExists) {
    const userId = item[0][1]
    const name = item[3]
    const username = item[item.length - 1]
    userLookup[userId] = { name, username, userId }
  }

  for (const item of lsCalls.addParticipantIdToGroupThread) {
    const threadId = item[0][1] // in DMs is also the other user id
    const userId = item[1][1] // userId

    // if threadId does not exist then create an empty set
    if (!(threadId in conversationParticipants)) {
      conversationParticipants[threadId] = new Set()
    }
    conversationParticipants[threadId].add(userLookup[userId])
  }

  for (const item of lsCalls.upsertReaction) {
    const reactionSentTs = item[1][1]
    const messageId = item[2] as string
    // const messageId = item[2][1] as string
    const reactorId = item[3][1] as string
    // const reaction = item[4][1]
    const reaction = item[4]

    if (!(messageId in reactionLookup)) {
      reactionLookup[messageId] = []
    }
    reactionLookup[messageId].push({
      messageId,
      reactionSentTs,
      reactorId,
      reaction,
    })
  }

  for (const item of lsCalls.insertBlobAttachment) {
    const attachment: IGAttachment = {
      filename: item[0],
      threadKey: item[27],
      messageId: item[32],
      previewUrl: item[8],
      previewUrlFallback: item[9],
      previewUrlExpirationTimestampMs: item[10],
      previewUrlMimeType: item[11],
      previewWidth: item[14],
      previewHeight: item[15],
      timestampMs: item[31],
      attachmentType: item[29],
      attachmentFbid: item[34],
      filesize: item[1],
      hasMedia: item[2],
      playableUrl: item[3],
      playableUrlFallback: item[4],
      playableUrlExpirationTimestampMs: item[5],
      playableUrlMimeType: item[6],
      dashManifest: item[7],
      miniPreview: item[13],
      attributionAppId: item[16],
      attributionAppName: item[17],
    }

    attachments.set(
      attachment.threadKey,
      [...(attachments.get(attachment.threadKey) || []), attachment],
    )

    const { messageId } = attachment
    if (!(messageId in imageLookup)) {
      imageLookup[messageId] = []
    }
    imageLookup[messageId].push({
      imageId: attachment.attachmentFbid,
      imageUrl: attachment.previewUrl,
    })
  }

  const newMessages: ExtendedIGMessage[] = []
  for (const item of lsCalls.upsertMessage) {
    const message: IGMessage = {
      text: item[0],
      threadKey: item[3][1],
      messageId: item[8],
      timestampMs: item[5][1],
      senderId: item[10][1],
    }

    const _r = reactionLookup[message.messageId]
    const reaction = _r ? Array.from(_r) : null
    const images = imageLookup[message.messageId]

    newMessages.push({
      ...message,
      reaction,
      images,
    })
    lastMessageLookup[message.threadKey] = {
      ...message,
      reaction,
      images,
    }
  }

  for (const item of lsCalls.deleteThenInsertThread) {
    const lastActivityTimestampMs = item[0][1]
    const lastReadWatermarkTimestampMs = item[1][1]
    let threadName: string
    if (Array.isArray(item[3])) {
      threadName = null
    } else {
      // eslint-disable-next-line prefer-destructuring
      threadName = item[3]
    }

    const threadKey = item[7][1]

    // skip if threads have no participants ie no one is in the group
    if (!(threadKey in conversationParticipants)) continue

    // if threadName is null then set it to all the participants names
    if (threadName === null) {
      threadName = Array.from(conversationParticipants[threadKey])
        .filter(x => (x as any).userId !== myUserId)
        .map(x => (x as any).name)
        .join(', ')
    }

    conversations.push({
      lastActivityTimestampMs,
      lastReadWatermarkTimestampMs,
      snippet: item[2],
      threadName,
      threadPictureUrl: item[4],
      needsAdminApprovalForNewParticipant: item[5],
      authorityLevel: item[6],
      threadKey,
      parentThreadKey: item[38],
      mailboxType: item[8],
      threadType: item[9],
      folderName: item[10],
      threadPictureUrlFallback: item[11],
      threadPictureUrlExpirationTimestampMs: item[12],
      removeWatermarkTimestampMs: item[13],
      muteExpireTimeMs: item[14],
      muteMentionExpireTimeMs: item[15],
      muteCallsExpireTimeMs: item[16],
      groupNotificationSettings: item[19],
      isAdminSnippet: item[20],
      snippetSenderContactId: item[21],
      snippetStringHash: item[24],
      snippetStringArgument1: item[25],
      snippetAttribution: item[26],
      snippetAttributionStringHash: item[27],
      disappearingSettingTtl: item[28],
      disappearingSettingUpdatedTs: item[29],
      disappearingSettingUpdatedBy: item[30],
      ongoingCallState: item[32],
      cannotReplyReason: item[33],
      customEmoji: item[34],
      customEmojiImageUrl: item[35],
      outgoingBubbleColor: item[36],
      themeFbid: item[37],
      nullstateDescriptionText1: item[39],
      nullstateDescriptionType1: item[40],
      nullstateDescriptionText2: item[41],
      nullstateDescriptionType2: item[42],
      nullstateDescriptionText3: item[43],
      nullstateDescriptionType3: item[44],
      draftMessage: item[45],
      snippetHasEmoji: item[46],
      hasPersistentMenu: item[47][1],
      disableComposerInput: item[48],
      cannotUnsendReason: item[49],
      viewedPluginKey: item[50],
      viewedPluginContext: item[51],
      clientThreadKey: item[52],
      capabilities: item[53],
      shouldRoundThreadPicture: item[54],
      proactiveWarningDismissTime: item[55][1],
      isCustomThreadPicture: item[56],
      otidOfFirstMessage: item[57][1],
      normalizedSearchTerms: item[58],
      additionalThreadContext: item[59],
      disappearingThreadKey: item[60][1],
      isDisappearingMode: item[61][1],
      disappearingModeInitiator: item[62],
      unreadDisappearingMessageCount: item[63],
      lastMessageCtaId: item[65][1],
      lastMessageCtaType: item[66][1],
      lastMessageCtaTimestampMs: item[67],
      consistentThreadFbid: item[68],
      threadDescription: item[70],
      unsendLimitMs: item[71],
      capabilities2: item[79],
      capabilities3: item[80],
      syncGroup: item[83],
      threadInvitesEnabled: item[84],
      threadInviteLink: item[85],
      isAllUnreadMessageMissedCallXma: item[86],
      lastNonMissedCallXmaMessageTimestampMs: item[87],
      threadInvitesEnabledV2: item[89],
      hasPendingInvitation: item[92],
      eventStartTimestampMs: item[93],
      eventEndTimestampMs: item[94],
      takedownState: item[95],
      secondaryParentThreadKey: item[96],
      igFolder: item[97],
      inviterId: item[98],
      threadTags: item[99],
      threadStatus: item[100],
      threadSubtype: item[101],
      pauseThreadTimestamp: item[102],
      unread: Number(lastActivityTimestampMs) > Number(lastReadWatermarkTimestampMs),
      participants: Array.from(conversationParticipants[threadKey]),
      lastMessageDetails: lastMessageLookup[threadKey],
    })
  }

  return {
    newMessages,
    newConversations: conversations.length ? conversations : null,
    // return newreactions as an array if it exists and remove the set
    newReactions: Object.keys(reactionLookup).length ? Object.values(reactionLookup).flat() : null,
    cursor: j.step[2][1][3][5],
    hasMore: lsCalls.upsertSyncGroupThreadsRange?.[0]?.[3],
  }
}

const parseThread = (a: RawItem) => {
  const tmap = {
    isUnread: Number(a[0][1]) > Number(a[1][1]),
    threadKey: a[7][1],
    lastReadWatermarkTimestampMs: new Date(Number(a[1][1])),
    threadType: a[9][1] === '1' ? 'single' : 'group',
    folderName: a[10],
    parentThreadKey: a[35][1],
    lastActivityTimestampMs: new Date(Number(a[0][1])),
    snippet: a[2],
    threadName: a[3][1],
    threadPictureUrl: a[4][1],
    needsAdminApprovalForNewParticipant: a[5][1],
    threadPictureUrlFallback: a[11],
    threadPictureUrlExpirationTimestampMs: new Date(Number(a[12][1])),
    removeWatermarkTimestampMs: new Date(Number(a[13][1])),
    muteExpireTimeMs: new Date(Number(a[14][1])),
    // muteCallsExpireTimeMs: new Date(Number(a[15][1])),
    groupNotificationSettings: a[16][1],
    isAdminSnippet: a[17][1],
    snippetSenderContactId: a[18][1],
    snippetStringHash: a[21][1],
    snippetStringArgument1: a[22][1],
    snippetAttribution: a[23][1],
    snippetAttributionStringHash: a[24][1],
    disappearingSettingTtl: a[25][1],
    disappearingSettingUpdatedTs: a[26][1],
    disappearingSettingUpdatedBy: a[27][1],
    cannotReplyReason: a[30][1],
    customEmoji: a[31][1],
    customEmojiImageUrl: a[32][1],
    outgoingBubbleColor: a[33][1],
    themeFbid: a[34][1],
    authorityLevel: a[6][1],
    mailboxType: a[8][1],
    muteMentionExpireTimeMs: a[15][1],
    muteCallsExpireTimeMs: a[16][1],
    ongoingCallState: a[32][1],
    nullstateDescriptionText1: a[39][1],
    nullstateDescriptionType1: a[40][1],
    nullstateDescriptionText2: a[41][1],
    nullstateDescriptionType2: a[42][1],
    nullstateDescriptionText3: a[43],
    nullstateDescriptionType3: a[44],
    draftMessage: a[45],
    snippetHasEmoji: a[46][1],
    hasPersistentMenu: a[47][1],
    disableComposerInput: a[48][1],
    cannotUnsendReason: a[49][1],
    viewedPluginKey: a[50][1],
    viewedPluginContext: a[51][1],
    clientThreadKey: a[52][1],
    capabilities: a[53],
    shouldRoundThreadPicture: a[54][1],
    proactiveWarningDismissTime: a[55][1],
    isCustomThreadPicture: a[56][1],
    otidOfFirstMessage: a[57][1],
    normalizedSearchTerms: a[58],
    additionalThreadContext: a[59][1],
    disappearingThreadKey: a[60][1],
    isDisappearingMode: a[61][1],
    disappearingModeInitiator: a[62][1],
    unreadDisappearingMessageCount: a[63][1],
    lastMessageCtaId: a[65][1],
    lastMessageCtaType: a[66][1],
    lastMessageCtaTimestampMs: a[67][1],
    consistentThreadFbid: a[68][1],
    threadDescription: a[70][1],
    unsendLimitMs: a[71][1],
    capabilities2: a[79][1],
    capabilities3: a[80][1],
    syncGroup: a[83],
    threadInvitesEnabled: a[84],
    threadInviteLink: a[85],
    isAllUnreadMessageMissedCallXma: a[86],
    lastNonMissedCallXmaMessageTimestampMs: a[87],
    threadInvitesEnabledV2: a[89],
    hasPendingInvitation: a[92],
    eventStartTimestampMs: a[93],
    eventEndTimestampMs: a[94],
    takedownState: a[95],
    secondaryParentThreadKey: a[96],
    igFolder: a[97],
    inviterId: a[98],
    threadTags: a[99],
    threadStatus: a[100],
    threadSubtype: a[101],
    pauseThreadTimestamp: a[102],
  }

  if (Array.isArray(a[3])) {
    tmap.threadName = null
  } else {
    // eslint-disable-next-line prefer-destructuring
    tmap.threadName = a[3]
  }
  return tmap
  // loop through the keys and if the value is
}

const parseUser = (a: RawItem) => ({
  id: a[0][1],
  profilePictureUrl: a[2] == null ? '' : a[2],
  name: a[3],
  username: a[20],
})

const parseParticipant = (a: RawItem) => ({
  threadKey: a[0][1],
  userId: a[1][1],
  readWatermarkTimestampMs: a[2][1],
  readActionTimestampMs: a[3][1],
  deliveredWatermarkTimestampMs: a[4][1],
  lastDeliveredWatermarkTimestampMs: a[5][1],
  isAdmin: a[6],
})

const parseMessage = (a: RawItem) => ({
  text: a[0],
  threadKey: a[3][1],
  timestampMs: a[5][1],
  messageId: a[8],
  offlineThreadingId: a[9],
  senderId: a[10][1],
  authorityLevel: a[2][1],
  primarySortKey: a[6][1],
  isAdminMessage: a[12],
  sendStatus: a[15][1],
  sendStatusV2: a[16][1],
  subscriptErrorMessage: a[1][1],
  secondarySortKey: a[7][1],
  stickerId: a[11][1],
  messageRenderingType: a[13][1],
  isUnsent: a[17],
  unsentTimestampMs: a[18][1],
  mentionOffsets: a[19][1],
  mentionLengths: a[20][1],
  mentionIds: a[21][1],
  mentionTypes: a[22][1],
  replySourceId: a[23][1],
  replySourceType: a[24][1],
  replySourceTypeV2: a[25][1],
  replyStatus: a[26][1],
  replySnippet: a[27][1],
  replyMessageText: a[28][1],
  replyToUserId: a[29][1],
  replyMediaExpirationTimestampMs: a[30][1],
  replyMediaUrl: a[31][1],
  replyMediaPreviewWidth: a[33][1],
  replyMediaPreviewHeight: a[34][1],
  replyMediaUrlMimeType: a[35][1],
  replyMediaUrlFallback: a[36][1],
  replyCtaId: a[37][1],
  replyCtaTitle: a[38][1],
  replyAttachmentType: a[39][1],
  replyAttachmentId: a[40][1],
  replyAttachmentExtra: a[41][1],
  isForwarded: a[42],
  forwardScore: a[43][1],
  hasQuickReplies: a[44],
  adminMsgCtaId: a[45][1],
  adminMsgCtaTitle: a[46][1],
  adminMsgCtaType: a[47][1],
  cannotUnsendReason: a[48][1],
  textHasLinks: a[49],
  viewFlags: a[50][1],
  displayedContentTypes: a[51][1],
  viewedPluginKey: a[52][1],
  viewedPluginContext: a[53][1],
  quickReplyType: a[54][1],
  hotEmojiSize: a[55][1],
  replySourceTimestampMs: a[56][1],
  ephemeralDurationInSec: a[57][1],
  msUntilExpirationTs: a[58][1],
  ephemeralExpirationTs: a[59][1],
  takedownState: a[60][1],
  isCollapsed: a[61],
  subthreadKey: a[62][1],
})

const parseAttachment = (a: RawItem) => ({
  filename: a[0],
  threadKey: a[27],
  messageId: a[32],
  previewUrl: a[8],
  previewUrlFallback: a[9],
  previewUrlExpirationTimestampMs: a[10],
  previewUrlMimeType: a[11],
  previewWidth: a[14],
  previewHeight: a[15],
  timestampMs: a[31],
  attachmentType: a[29],
  attachmentFbid: a[34],
  filesize: a[1],
  hasMedia: a[2],
  playableUrl: a[3],
  playableUrlFallback: a[4],
  playableUrlExpirationTimestampMs: a[5],
  playableUrlMimeType: a[6],
  dashManifest: a[7],
  miniPreview: a[13],
  attributionAppId: a[16],
  attributionAppName: a[17],
  isSharable: !1,
  attributionAppIcon: a[18],
  attributionAppIconFallback: a[19],
  attributionAppIconUrlExpirationTimestampMs: a[20],
  localPlayableUrl: a[21],
  playableDurationMs: a[22],
  attachmentIndex: a[23],
  accessibilitySummaryText: a[24],
  isPreviewImage: a[25],
  originalFileHash: a[26],
  offlineAttachmentId: a[33],
  hasXma: a[35],
  xmaLayoutType: a[36],
  xmasTemplateType: a[37],
  titleText: a[38],
  subtitleText: a[39],
  descriptionText: a[40],
  sourceText: a[41],
  faviconUrlExpirationTimestampMs: a[42],
  isBorderless: a[44],
  previewUrlLarge: a[45],
  samplingFrequencyHz: a[46],
  waveformData: a[47],
  authorityLevel: a[48],
})

const parseReaction = (a: RawItem) => ({
  threadKey: a[0][1],
  timestampMs: new Date(Number(a[1][1])),
  messageId: a[2],
  actorId: a[3][1],
  reaction: a[4],
})

export function parseRawPayload(payload: string) {
  const j = JSON.parse(payload)
  // tasks we are interested in
  const lsCalls = {
    verifyContactRowExists: [],
    addParticipantIdToGroupThread: [],
    deleteThenInsertThread: [],
    upsertMessage: [],
    upsertReaction: [],
    insertBlobAttachment: [],
    insertAttachmentItem: [],
    upsertSyncGroupThreadsRange: [],
    clearPinnedMessages: [],
    writeThreadCapabilities: [],
    deleteThenInsertIgThreadInfo: [],
    setMessageDisplayedContentTypes: [],
    setForwardScore: [],
    updateReadReceipt: [],
    insertXmaAttachment: [],
    getFirstAvailableAttachmentCTAID: [],
    insertAttachmentCta: [],
    updateAttachmentItemCtaAtIndex: [],
    updateAttachmentCtaAtIndexIgnoringAuthority: [],
    deleteExistingMessageRanges: [],
    insertNewMessageRange: [],
    upsertFolderSeenTimestamp: [],
  }

  // loop through the tasks
  for (const item of j.step[2][2][2].slice(1)) {
    // if we are interested in the task then add it to the lsCalls object
    if (item[1][1] in lsCalls) {
      lsCalls[item[1][1]].push(item[1].slice(2))
    }
  }

  console.log('lsCalls', lsCalls)

  return {
    verifyContactRowExists: lsCalls.verifyContactRowExists.map(parseUser),
    addParticipantIdToGroupThread: lsCalls.addParticipantIdToGroupThread.map(parseParticipant),
    deleteThenInsertThread: lsCalls.deleteThenInsertThread.map(parseThread),
    upsertMessage: lsCalls.upsertMessage.map(parseMessage),
    upsertReaction: lsCalls.upsertReaction.map(parseReaction),
    upsertSyncGroupThreadsRange: null,
    insertBlobAttachment: lsCalls.insertBlobAttachment.map(parseAttachment),
  }
}
