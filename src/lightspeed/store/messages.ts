export type MessageSchemas = |
clearPinnedMessages
| upsertMessage
| setForwardScore
| setMessageDisplayedContentTypes
| deleteExistingMessageRanges
| insertNewMessageRange
| insertStickerAttachment
| insertXmaAttachment
| insertBlobAttachment
| upsertReaction
| deleteThenInsertMessageRequest
| verifyContactParticipantExist
| updateOrInsertReactionV2
| setMessageTextHasLinks

export interface setMessageTextHasLinks {
  threadKey: bigint
  messageId: string
  timestampMs: bigint
}

export interface updateOrInsertReactionV2 {
  threadKey: bigint
  messageId: string
  reactionFbid: bigint
  count: bigint
  authorityLevel: bigint
  viewerIsReactor: boolean
  viewerReactionTimestampMs: bigint
  lastUpdatedTimestampMs: bigint
}

export interface verifyContactParticipantExist {
  contactId: bigint
  threadKey: bigint
  unknownValue: string
}

export interface deleteThenInsertMessageRequest {
  threadKey: bigint
  unknownValue: bigint
  messageRequestStatus: bigint
}

export interface upsertReaction {
  threadKey: bigint
  timestampMs: bigint
  messageId: string
  actorId: bigint
  reaction: string
  authorityLevel: bigint
}

export interface insertBlobAttachment {
  filename: any
  filesize: any
  hasMedia: any
  playableUrl: any
  playableUrlFallback: any
  playableUrlExpirationTimestampMs: any
  playableUrlMimeType: any
  dashManifest: any
  previewUrl: any
  previewUrlFallback: any
  previewUrlExpirationTimestampMs: any
  previewUrlMimeType: any
  miniPreview: any
  previewWidth: any
  previewHeight: any
  attributionAppId: any
  attributionAppName: any
  attributionAppIcon: any
  attributionAppIconFallback: any
  attributionAppIconUrlExpirationTimestampMs: any
  localPlayableUrl: any
  playableDurationMs: any
  attachmentIndex: any
  accessibilitySummaryText: any
  isPreviewImage: any
  originalFileHash: any
  threadKey: any
  attachmentType: any
  timestampMs: any
  messageId: any
  offlineAttachmentId: any
  attachmentFbid: any
  hasXma: any
  xmaLayoutType: any
  xmasTemplateType: any
  titleText: any
  subtitleText: any
  descriptionText: any
  sourceText: any
  faviconUrlExpirationTimestampMs: any
  isBorderless: any
  previewUrlLarge: any
  samplingFrequencyHz: any
  waveformData: any
  authorityLevel: any
}

export interface insertXmaAttachment {
  filename: any
  filesize: any
  isSharable: any
  playableUrl: any
  playableUrlFallback: any
  playableUrlExpirationTimestampMs: any
  playableUrlMimeType: any
  previewUrl: any
  previewUrlFallback: any
  previewUrlExpirationTimestampMs: any
  previewUrlMimeType: any
  previewWidth: any
  previewHeight: any
  attributionAppId: any
  attributionAppName: any
  attributionAppIcon: any
  attributionAppIconFallback: any
  attributionAppIconUrlExpirationTimestampMs: any
  attachmentIndex: any
  accessibilitySummaryText: any
  shouldRespectServerPreviewSize: any
  subtitleIconUrl: any
  shouldAutoplayVideo: any
  threadKey: any
  attachmentType: any
  timestampMs: any
  messageId: any
  offlineAttachmentId: any
  attachmentFbid: any
  xmaLayoutType: any
  xmasTemplateType: any
  collapsibleId: any
  defaultCtaId: any
  defaultCtaTitle: any
  defaultCtaType: any
  attachmentCta1Id: any
  cta1Title: any
  cta1IconType: any
  cta1Type: any
  attachmentCta2Id: any
  cta2Title: any
  cta2IconType: any
  cta2Type: any
  attachmentCta3Id: any
  cta3Title: any
  cta3IconType: any
  cta3Type: any
  imageUrl: any
  imageUrlFallback: any
  imageUrlExpirationTimestampMs: any
  actionUrl: any
  titleText: any
  subtitleText: any
  subtitleDecorationType: any
  maxTitleNumOfLines: any
  maxSubtitleNumOfLines: any
  descriptionText: any
  sourceText: any
  faviconUrl: any
  faviconUrlFallback: any
  faviconUrlExpirationTimestampMs: any
  listItemsId: any
  listItemsDescriptionText: any
  listItemsDescriptionSubtitleText: any
  listItemsSecondaryDescriptionText: any
  listItemId1: any
  listItemTitleText1: any
  listItemContactUrlList1: any
  listItemProgressBarFilledPercentage1: any
  listItemContactUrlExpirationTimestampList1: any
  listItemContactUrlFallbackList1: any
  listItemAccessibilityText1: any
  listItemTotalCount1: any
  listItemId2: any
  listItemTitleText2: any
  listItemContactUrlList2: any
  listItemProgressBarFilledPercentage2: any
  listItemContactUrlExpirationTimestampList2: any
  listItemContactUrlFallbackList2: any
  listItemAccessibilityText2: any
  listItemTotalCount2: any
  listItemId3: any
  listItemTitleText3: any
  listItemContactUrlList3: any
  listItemProgressBarFilledPercentage3: any
  listItemContactUrlExpirationTimestampList3: any
  listItemContactUrlFallbackList3: any
  listItemAccessibilityText3: any
  listItemTotalCount3: any
  isBorderless: any
  headerImageUrlMimeType: any
  headerTitle: any
  headerSubtitleText: any
  headerImageUrl: any
  headerImageUrlFallback: any
  headerImageUrlExpirationTimestampMs: any
  previewImageDecorationType: any
  shouldHighlightHeaderTitleInTitle: any
  targetId: any
  attachmentLoggingType: any
  previewUrlLarge: any
  gatingType: any
  gatingTitle: any
  targetExpiryTimestampMs: any
  countdownTimestampMs: any
  shouldBlurSubattachments: any
  verifiedType: any
  captionBodyText: any
  isPublicXma: any
  replyCount: any
  authorityLevel: any
}

export interface insertStickerAttachment {
  playableUrl: any
  playableUrlFallback: any
  playableUrlExpirationTimestampMs: any
  playableUrlMimeType: any
  previewUrl: any
  previewUrlFallback: any
  previewUrlExpirationTimestampMs: any
  previewUrlMimeType: any
  previewWidth: any
  previewHeight: any
  imageUrlMimeType: any
  attachmentIndex: any
  accessibilitySummaryText: any
  threadKey: any
  timestampMs: any
  messageId: any
  attachmentFbid: any
  imageUrl: any
  imageUrlFallback: any
  imageUrlExpirationTimestampMs: any
  faviconUrlExpirationTimestampMs: any
  avatarViewSize: any
  avatarCount: any
  targetId: any
  mustacheText: any
  authorityLevel: any
}

export interface insertNewMessageRange {
  threadKey: bigint
  minTimestampMsTemplate: bigint
  maxTimestampMsTemplate: bigint
  minMessageId: bigint
  maxMessageId: bigint
  maxTimestampMs: bigint
  minTimestampMs: bigint
  hasMoreBefore: boolean
  hasMoreAfter: boolean
  unknownValue: any
}

export interface deleteExistingMessageRanges {
  consistentThreadFbid: bigint
}

export interface setMessageDisplayedContentTypes {
  threadKey: bigint
  messageId: string
  timestampMs: bigint
  text: string
  unknownValue: boolean
  unknownValue2: boolean
}

export interface setForwardScore {
  threadKey: bigint
  messageId: string
  timestampMs: bigint
  forwardScore: bigint
}

export interface upsertMessage {
  text: string
  subscriptErrorMessage: string
  authorityLevel: bigint
  threadKey: bigint
  timestampMs: bigint
  primarySortKey: bigint
  secondarySortKey: bigint
  messageId: string
  offlineThreadingId: string
  senderId: bigint
  stickerId: bigint
  isAdminMessage: boolean
  messageRenderingType: bigint
  sendStatus: bigint
  sendStatusV2: bigint
  isUnsent: boolean
  unsentTimestampMs: any
  mentionOffsets: any
  mentionLengths: any
  mentionIds: any
  mentionTypes: any
  replySourceId: any
  replySourceType: any
  replySourceTypeV2: any
  replyStatus: any
  replySnippet: any
  replyMessageText: any
  replyToUserId: any
  replyMediaExpirationTimestampMs: any
  replyMediaUrl: any
  replyMediaPreviewWidth: any
  replyMediaPreviewHeight: any
  replyMediaUrlMimeType: any
  replyMediaUrlFallback: any
  replyCtaId: any
  replyCtaTitle: any
  replyAttachmentType: any
  replyAttachmentId: any
  replyAttachmentExtra: any
  replyType: any
  isForwarded: boolean
  forwardScore: any
  hasQuickReplies: boolean
  adminMsgCtaId: any
  adminMsgCtaTitle: any
  adminMsgCtaType: any
  cannotUnsendReason: bigint
  textHasLinks: boolean
  viewFlags: bigint
  displayedContentTypes: bigint
  viewedPluginKey: any
  viewedPluginContext: any
  quickReplyType: bigint
  hotEmojiSize: any
  replySourceTimestampMs: any
  ephemeralDurationInSec: any
  msUntilExpirationTs: any
  ephemeralExpirationTs: any
  takedownState: any
  isCollapsed: boolean
  subthreadKey: any
  botResponseId: any
  editCount: bigint
  isPaidPartnership: any
}

export interface clearPinnedMessages {
  threadKey: bigint
}
