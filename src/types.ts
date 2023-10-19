import type { PlatformAPI, Message } from '@textshq/platform-sdk'
import type { CookieJar } from 'tough-cookie'

export type MethodReturnType<T, K extends keyof T> = T[K] extends (...args: any[]) => infer R ? R : never

export type PAPIReturn<K extends keyof PlatformAPI> = Promise<Awaited<MethodReturnType<PlatformAPI, K>>>

export interface SerializedSession {
  jar: CookieJar.Serialized
  ua?: string
  authMethod?: 'login-window' | 'extension'
  _v: 'v3'
}

export const enum SyncGroup {
  MAILBOX = 1,
  CONTACT = 2,
  E2EE = 95,
}

export const ThreadFilter = Object.freeze({
  NONE: 0,
  UNREAD_ONLY: 1,
  GROUPS_ONLY: 2,
  IGD_PRO_PRIMARY: 3,
  IGD_PRO_GENERAL: 4,
  PINNED: 5,
  READ_BUT_UNRESPONDED: 6,
  THREAD_CHAT_LABEL: 7,
  BUSINESS_INBOX_FOLLOW_UP: 8,
  FAMILY_AND_FRIENDS: 9,
  CHANNELS: 10,
  IGD_PRO_CHANNELS: 11,
  BUSINESS_FOLDER_DONE: 12,
  BUSINESS_FOLDER_SPAM: 13,
  BUSINESS_FOLDER_FOLLOW_UP: 14,
  BUSINESS_SECONDARY_FILTER: 15,
  FROM_ADS: 16,
  PRIORITY: 17,
  ASSIGNED_ADMIN: 18,
  COMMUNITIES: 19,
  WORKROOMS_ONLY: 20,
  SUBTHREAD: 21,
  CHANNELS_AND_INVITES: 22,
  UNIFIED_BUSINESS_INBOX_IGD: 23,
  UNIFIED_BUSINESS_INBOX_MESSENGER: 24,
})

export const enum ParentThreadKey {
  PRIMARY = 0,
  GENERAL = -1,
  SPAM = -3,
  ARCHIVE = -10,
}

export type IGThread = {
  threadKey: string
  lastReadWatermarkTimestampMs: number
  threadType: string
  folderName: string
  parentThreadKey: ParentThreadKey
  lastActivityTimestampMs: number
  snippet: string
  threadName: string
  threadPictureUrl: string
  needsAdminApprovalForNewParticipant: boolean
  threadPictureUrlFallback: string
  threadPictureUrlExpirationTimestampMs: number
  removeWatermarkTimestampMs: number
  muteExpireTimeMs: number
  groupNotificationSettings: string // potentially a different type if it's a complex object
  isAdminSnippet: boolean
  snippetSenderContactId: string
  snippetStringHash: string
  snippetStringArgument1: string
  snippetAttribution: string
  mailboxType: string
  draftMessage: string
  snippetAttributionStringHash: string
  disappearingSettingTtl: number
  disappearingSettingUpdatedTs: number
  disappearingSettingUpdatedBy: string
  cannotReplyReason: string
  customEmoji: string
  customEmojiImageUrl: string
  outgoingBubbleColor: string
  themeFbid: string
  authorityLevel: number
  muteMentionExpireTimeMs: number
  muteCallsExpireTimeMs: number
  ongoingCallState: string
  cannotUnsendReason: string
  snippetHasEmoji: boolean
  hasPersistentMenu: boolean
  disableComposerInput: boolean
  shouldRoundThreadPicture: boolean
  proactiveWarningDismissTime: number
  isCustomThreadPicture: boolean
  otidOfFirstMessage: string
  normalizedSearchTerms: string
  additionalThreadContext: string
  disappearingThreadKey: string
  isDisappearingMode: boolean
  disappearingModeInitiator: string
  unreadDisappearingMessageCount: number
  lastMessageCtaId: string
  lastMessageCtaType: string
  lastMessageCtaTimestampMs: number
  consistentThreadFbid: string
  threadDescription: string
  unsendLimitMs: number
  capabilities2: string
  capabilities3: string
  syncGroup: string
  threadInvitesEnabled: boolean
  threadInviteLink: string
  isAllUnreadMessageMissedCallXma: boolean
  lastNonMissedCallXmaMessageTimestampMs: number
  threadInvitesEnabledV2: boolean
  hasPendingInvitation: boolean
  eventStartTimestampMs: number
  eventEndTimestampMs: number
  takedownState: string
  secondaryParentThreadKey: string
  igFolder: string
  inviterId: string
  threadTags: string
  threadStatus: string
  threadSubtype: string
  pauseThreadTimestamp: number
  nullstateDescriptionText1: string
  nullstateDescriptionText2: string
  nullstateDescriptionText3: string
  nullstateDescriptionType1: string
  nullstateDescriptionType2: string
  nullstateDescriptionType3: string
  viewedPluginKey: string
  viewedPluginContext: string
  clientThreadKey: string
  capabilities: string
}

export type IGMessage = {
  threadKey: string
  offlineThreadingId: string
  authorityLevel: number
  timestampMs: number
  messageId: string
  senderId: string
  isAdminMessage: boolean
  sendStatus: string
  sendStatusV2: string
  text: string
  subscriptErrorMessage: string
  stickerId: string
  messageRenderingType: string
  isUnsent: boolean
  unsentTimestampMs: number
  mentionOffsets: string
  mentionLengths: string
  mentionIds: string
  mentionTypes: string
  replySourceId: string
  replySourceType: string
  primarySortKey: string
  secondarySortKey: string
  replyMediaExpirationTimestampMs: number
  replySourceTypeV2: string
  replyStatus: string
  replySnippet: string
  replyMessageText: string
  replyToUserId: string
  replyMediaUrl: string
  replyMediaPreviewWidth: string
  replyMediaPreviewHeight: string
  replyMediaUrlMimeType: string
  replyMediaUrlFallback: string
  replyCtaId: string
  replyCtaTitle: string
  replyAttachmentType: string
  replyAttachmentId: string
  replyAttachmentExtra: string
  replyType?: string
  isForwarded: boolean
  forwardScore: string
  hasQuickReplies: boolean
  adminMsgCtaId: string
  adminMsgCtaTitle: string
  adminMsgCtaType: string
  cannotUnsendReason: string
  textHasLinks: number
  viewFlags: string
  displayedContentTypes: string
  viewedPluginKey: string
  viewedPluginContext: string
  quickReplyType: string
  hotEmojiSize: string
  replySourceTimestampMs: number
  ephemeralDurationInSec: string
  msUntilExpirationTs: number
  ephemeralExpirationTs: number
  takedownState: string
  isCollapsed: boolean
  subthreadKey: string
  links?: Message['links']
  extra?: {
    mediaLink?: string
    assetURL?: string
    primarySortKey?: number
  }
  textHeading?: string
}

export type IGAttachment = {
  threadKey: string
  messageId: string
  attachmentFbid: string
  filename: string
  filesize: number
  hasMedia: boolean
  isSharable: boolean
  playableUrl: string
  playableUrlFallback: string
  playableUrlExpirationTimestampMs: number
  playableUrlMimeType: string
  dashManifest?: string
  previewUrl: string
  previewUrlFallback: string
  previewUrlExpirationTimestampMs: number
  previewUrlMimeType: string
  miniPreview?: string
  previewWidth: number
  previewHeight: number
  attributionAppId: string
  attributionAppName: string
  attributionAppIcon: string
  attributionAppIconFallback: string
  attributionAppIconUrlExpirationTimestampMs: number
  localPlayableUrl?: string
  playableDurationMs?: number
  attachmentIndex: string
  accessibilitySummaryText: string
  isPreviewImage?: boolean
  originalFileHash?: string
  attachmentType: string
  timestampMs: number
  offlineAttachmentId: string
  hasXma: boolean
  xmaLayoutType: string
  xmasTemplateType: string
  titleText: string
  subtitleText: string
  descriptionText: string
  sourceText: string
  faviconUrlExpirationTimestampMs: number
  isBorderless: boolean
  previewUrlLarge: string
  samplingFrequencyHz?: number
  waveformData?: string
  authorityLevel: string
  shouldRespectServerPreviewSize?: boolean
  subtitleIconUrl?: string
  shouldAutoplayVideo?: boolean
  collapsibleId?: string
  defaultCtaId?: string
  defaultCtaTitle?: string
  defaultCtaType?: string
  attachmentCta1Id?: string
  cta1IconType?: string
  cta1Type?: string
  attachmentCta2Id?: string
  cta2Title?: string
  cta2IconType?: string
  cta2Type?: string
  attachmentCta3Id?: string
  cta3Title?: string
  cta3IconType?: string
  cta3Type?: string
  imageUrl?: string
  imageUrlFallback?: string
  imageUrlExpirationTimestampMs?: number
  actionUrl?: string
  maxTitleNumOfLines?: string
  maxSubtitleNumOfLines?: string
  faviconUrl?: string
  faviconUrlFallback?: string
  listItemsId?: string
  listItemsDescriptionText?: string
  listItemsDescriptionSubtitleText?: string
  listItemsSecondaryDescriptionText?: string
  listItemId1?: string
  listItemTitleText1?: string
  listItemContactUrlList1?: string
  listItemProgressBarFilledPercentage1?: string
  listItemContactUrlExpirationTimestampList1?: string
  listItemContactUrlFallbackList1?: string
  listItemAccessibilityText1?: string
  listItemTotalCount1?: string
  listItemId2?: string
  listItemTitleText2?: string
  listItemContactUrlList2?: string
  listItemProgressBarFilledPercentage2?: string
  listItemContactUrlExpirationTimestampList2?: string
  listItemContactUrlFallbackList2?: string
  listItemAccessibilityText2?: string
  listItemTotalCount2?: string
  listItemId3?: string
  listItemTitleText3?: string
  listItemContactUrlList3?: string
  listItemProgressBarFilledPercentage3?: string
  listItemContactUrlExpirationTimestampList3?: string
  listItemContactUrlFallbackList3?: string
  listItemAccessibilityText3?: string
  listItemTotalCount3?: string
  headerImageUrlMimeType?: string
  headerTitle?: string
  headerSubtitleText?: string
  headerImageUrl?: string
  headerImageUrlFallback?: string
  headerImageUrlExpirationTimestampMs?: number
  previewImageDecorationType?: string
  shouldHighlightHeaderTitleInTitle?: string
  targetId?: string
  attachmentLoggingType?: string
  gatingType?: string
  gatingTitle?: string
  targetExpiryTimestampMs?: number
  countdownTimestampMs?: number
  shouldBlurSubattachments?: string
  verifiedType?: string
  captionBodyText?: string
  isPublicXma?: string
  cta1Title?: string
  imageUrlMimeType?: string
  avatarViewSize?: number
  avatarCount?: number
  mustacheText?: string
}

export type IGReadReceipt = {
  threadKey: string
  contactId: string
  readWatermarkTimestampMs?: Date
  readActionTimestampMs?: Date
}

export type IGContact = {
  id: string
  profilePictureUrl: string
  name: string
  username: string
  profilePictureFallbackUrl: string
  secondaryName: string
  isMemorialized: string
  blockedByViewerStatus: string
  canViewerMessage: string
  contactType: string
  authorityLevel: string
  capabilities: string
  capabilities2: string
  contactViewerRelationship: string
  gender: string
}

export type IGMessageRanges = {
  threadKey: string
  minTimestamp: string
  maxTimestamp: string
  minMessageId?: string
  maxMessageId?: string
  hasMoreBeforeFlag: boolean
  hasMoreAfterFlag: boolean
}

export type MetaThreadRanges = {
  syncGroup: SyncGroup
  parentThreadKey: ParentThreadKey
  minLastActivityTimestampMs: string
  hasMoreBefore: boolean
  isLoadingBefore: boolean
  minThreadKey: string
}

// Borrowed from messenger.com JS bundle
export const StickerConstants = Object.freeze({
  MOBILE_LIKE_STICKER_PACK_ID: '227877430692340',
  GRAVEYARD_PACK_ID: '604597256247273',
  LIKE_STICKER_ID: '227878347358915',
  HOT_LIKE_SMALL_STICKER_ID: '369239263222822',
  HOT_LIKE_MEDIUM_STICKER_ID: '369239343222814',
  HOT_LIKE_LARGE_STICKER_ID: '369239383222810',
  MRU_STICKER_PACK: '599061016853145',
  SEARCH_PACK_ID: '680229632032514',
  FEED_PACK_ID: '2239834712900285',
  OZ_PACK_ID: '1456625217993235',
  AVATARS_PACK_ID: '2191329907595522',
  TRENDING_STICKER_PACK_ID: '924487421216423',
  SPRITE_PADDING: '24',
  PayloadSource: {
    VIEW_ACTION: 'view-action',
  },
  DEFAULT_FRAME_RATE: 83,
  TRAY_SIZE: 64,
  THREAD_SIZE: 120,
})

export const MNetRankType = Object.freeze({
  INBOX_ACTIVE_NOW: 0,
  MESSENGER_USER_SEARCH: 1,
  MONTAGE_USER: 2,
  BROADCAST_FLOW_TOP_CONTACTS: 3,
  BROADCAST_FLOW_NEEDY_CONTACTS: 4,
  MESSENGER_GROUP_SEARCH: 5,
  RTC_TOP_CONTACTS: 6,
  PSTN_TOP_CONTACTS: 7,
  MESSENGER_NON_CONTACT_SEARCH: 8,
  MESSENGER_SEARCH_BOOTSTRAP: 9,
  ACTIVE_BEEPER: 10,
  MONTAGE_AND_ACTIVE_NOW: 11,
  MESSENGER_PAGE_SEARCH: 12,
  MESSENGER_GAME_SEARCH: 13,
  WWW_NULLSTATE: 14,
  RTC_GROWTH: 15,
  MESSENGER_OMNIPICKER_NULLSTATE: 16,
  RTC_SEQUENTIAL_TOP_CONTACTS: 17,
  MESSENGER_USER_SEARCH_NULLSTATE: 18,
  MLITE_DIODE_PROMOTION: 19,
  MESSENGER_PENDING_REQUEST: 20,
  MESSENGER_CLOSE_CONNECTION: 21,
  MESSENGER_MONTAGE_SEEN_SHEET: 22,
  MESSENGER_OMNIPICKER_KEYPRESS: 23,
  MESSENGER_NOTIF_QP_TARGETING_UPSELL_TYPE: 24,
  CONTACT_TAB_ACTIVE_NOW: 26,
  MESSENGER_UNIV_NULLSTATE_BLEND: 27,
  MESSENGER_INBOX_THREADS: 28,
  INBOX_ACTIVE_NOW_NO_BOOSTING: 29,
  BROADCAST_FLOW_TOP_CONTACTS_FB_SHARE: 30,
  BROADCAST_FLOW_TOP_CONTACTS_MESSENGER_SHARE: 31,
  BROADCAST_FLOW_TOP_CONTACTS_EXTERNAL_SHARE: 32,
  MESSENGER_TRENDING_STICKERS: 33,
  MESSENGER_BROADCAST_FLOW_TOP_THREADS: 34,
  MESSENGER_SENDS_28D: 35,
  MESSENGER_ROOM_INVITE: 36,
  MESSENGER_ROOM_INVITE_SEARCH: 37,
  INBOX_ACTIVE_NOW_PREFETCH: 38,
  MESSENGER_BLENDED_KEYPRESS: 39,
  MESSENGER_BLENDED_NULLSTATE: 40,
  MESSENGER_CARRIER_MESSAGING: 41,
  MESSENGER_ROOM_INVITE_GROUP: 42,
  MESSENGER_INBOX_BIRTHDAY_ITEM: 43,
  INSTAGRAM_DIRECT_SEARCH_NULLSTATE: 44,
  BROADCAST_FLOW_TOP_CONTACTS_AND_TOP_THREAD_FB_SHARE: 45,
  BROADCAST_FLOW_TOP_THREADS_FB_SHARE: 46,
  FB_H_SCROLL_RANKING: 47,
  FB_MESSAGING_USER_SEARCH: 48,
  FB_MESSAGING_USER_SEARCH_NULLSTATE: 49,
  MESSENGER_ACTIVE_NOW_TRAY_ACTIVE_CC: 50,
  MESSENGER_SHARE_SHEET: 51,
  MESSENGER_COMMUNITY_TAB_UNJOINED_COMMUNITIES: 52,
})

export type MMFilteredThreadsRanges = {
  folderName: string
  parentThreadKey: string
  threadRangeFilter: string
  minLastActivityTimestampMs: string
  minThreadKey: string
  secondaryThreadRangeFilter: string
  threadRangeFilterValue: string
}
