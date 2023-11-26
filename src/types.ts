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

export const enum SyncChannel {
  MAILBOX = 1,
  CONTACT = 2,
  E2EE = 95,
}

export enum ThreadRangeFilter {
  NONE = 0,
  UNREAD_ONLY = 1,
  GROUPS_ONLY = 2,
  IGD_PRO_PRIMARY = 3,
  IGD_PRO_GENERAL = 4,
  PINNED = 5,
  READ_BUT_UNRESPONDED = 6,
  THREAD_CHAT_LABEL = 7,
  BUSINESS_INBOX_FOLLOW_UP = 8,
  FAMILY_AND_FRIENDS = 9,
  CHANNELS = 10,
  IGD_PRO_CHANNELS = 11,
  BUSINESS_FOLDER_DONE = 12,
  BUSINESS_FOLDER_SPAM = 13,
  BUSINESS_FOLDER_FOLLOW_UP = 14,
  BUSINESS_SECONDARY_FILTER = 15,
  FROM_ADS = 16,
  PRIORITY = 17,
  ASSIGNED_ADMIN = 18,
  COMMUNITIES = 19,
  WORKROOMS_ONLY = 20,
  SUBTHREAD = 21,
  CHANNELS_AND_INVITES = 22,
  UNIFIED_BUSINESS_INBOX_IGD = 23,
  UNIFIED_BUSINESS_INBOX_MESSENGER = 24,
}

type MMSocketThreadQueueName = string
export type MMSocketTask = {
  failure_count: null
  task_id: number
  payload: string
} & ({
  label: '21' | '23' | '32' | '46' | '130' | '144' | '146' | '209' | '313'
  queue_name: MMSocketThreadQueueName
} | {
  label: '25'
  queue_name: 'admin_status'
} | {
  label: '29'
  queue_name: `["reaction",${string}]`
} | {
  label: '30'
  queue_name: `["search_primary",${string}]`
} | {
  label: '31'
  queue_name: '["search_secondary"]'
} | {
  label: '33'
  queue_name: 'unsend_message'
} | {
  label: '66'
  queue_name: 'message_request'
} | {
  label: '140'
  queue_name: 'remove_participant_v2'
} | {
  label: '145'
  queue_name: 'trq'
} | {
  label: '207'
  queue_name: 'cpq_v2'
} | {
  label: '228'
  queue_name: `mrq.${string}`
} | {
  label: '242'
  queue_name: 'unarchive_thread'
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
  previewUrlLarge?: string
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
  syncGroup: SyncChannel
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

export const IgTags_InboxFolder = Object.freeze({
  PRIMARY: 0,
  GENERAL: 1,
  ONLYIN3P: 2,
  SUBSCRIBER: 3,
  AD_RESPONSES: 4,
  PAID_SUBS: 5,
  AI_BOT: 6,
})

export const MessagingFolderTag = Object.freeze({
  INBOX: 'inbox',
  OTHER: 'other',
  SPAM: 'spam',
  PENDING: 'pending',
  MONTAGE: 'montage',
  HIDDEN: 'hidden',
  LEGACY: 'legacy',
  DISABLED: 'disabled',
  PAGE_BACKGROUND: 'page_background',
  PAGE_DONE: 'page_done',
  BLOCKED: 'blocked',
  COMMUNITY: 'community',
  RESTRICTED: 'restricted',
  BC_PARTNERSHIP: 'bc_partnership',
  E2EE_CUTOVER: 'e2ee_cutover',
  INTEROP: 'interop',
  ARCHIVED: 'archived',
  UNKNOWN: '',
})

export enum LSAuthorityLevel {
  OPTIMISTIC = 20,
  CLIENT_PARTIAL = 40,
  SERVER_PARTIAL = 60,
  AUTHORITATIVE_PENDING_REPLACEMENT = 75,
  AUTHORITATIVE = 80,
  CLIENT_AUTHORITATIVE_DELETE = 100,
}

export enum ThreadType {
  COMMUNITY_FOLDER = 17,
  COMMUNITY_GROUP = 18,
  COMMUNITY_GROUP_UNJOINED = 19,
  COMMUNITY_CHANNEL_CATEGORY = 20,
  COMMUNITY_PRIVATE_HIDDEN_JOINED_THREAD = 21,
  COMMUNITY_PRIVATE_HIDDEN_UNJOINED_THREAD = 22,
  COMMUNITY_BROADCAST_JOINED_THREAD = 23,
  COMMUNITY_BROADCAST_UNJOINED_THREAD = 24,
  COMMUNITY_GROUP_INVITED_UNJOINED = 25,
  COMMUNITY_SUB_THREAD = 26,
  DISCOVERABLE_PUBLIC_CHAT = 150,
  DISCOVERABLE_PUBLIC_CHAT_UNJOINED = 151,
  DISCOVERABLE_PUBLIC_BROADCAST_CHAT = 152,
  DISCOVERABLE_PUBLIC_BROADCAST_CHAT_UNJOINED = 153,
  DISCOVERABLE_PUBLIC_CHAT_V2 = 154,
  DISCOVERABLE_PUBLIC_CHAT_V2_UNJOINED = 155,
  ONE_TO_ONE = 1,
  GROUP = 2,
  ROOM = 3,
  MONTAGE = 4,
  MARKETPLACE = 5,
  FOLDER = 6,
  TINCAN_ONE_TO_ONE = 7,
  TINCAN_GROUP_DISAPPEARING = 8,
  CARRIER_MESSAGING_ONE_TO_ONE = 10,
  CARRIER_MESSAGING_GROUP = 11,
  TINCAN_ONE_TO_ONE_DISAPPEARING = 13,
  PAGE_FOLLOW_UP = 14,
  SECURE_MESSAGE_OVER_WA_ONE_TO_ONE = 15,
  SECURE_MESSAGE_OVER_WA_GROUP = 16,
  PINNED = 101,
  LWG = 102,
  XAC_GROUP = 200,
  AI_BOT = 201,
  UNKNOWN = 0,
  SELF_THREAD = 12,
  ARMADILLO_ONE_TO_ONE = -1,
  ARMADILLO_GROUP = -2,
}

export enum MessagingThreadSubtype {
  ADMIN_MODEL_V2_THREAD = 1,
  FB_GROUP_CHAT = 2,
  MARKETPLACE_THREAD = 3,
  SCHOOL_CHAT = 4,
  DEPRECATED__WORK_SYNCED_CHAT = 5,
  ADMIN_NOT_SUPPORTED_THREAD = 6,
  BELL_SYNCED_CHAT = 7,
  GAMES_APP_THREAD = 8,
  VAULT_CHAT = 9,
  VERSE_CHAT = 10,
  GENERIC_COMMERCE_THREAD = 11,
  USER_JOB_THREAD = 12,
  COWORKER_GROUP_THREAD = 13,
  APPROVAL_ENFORCED_CHATROOM_THREAD = 14,
  PARENT_APPROVED_SHEPHERD_MANAGED_THREAD = 15,
  CAMPUS_GROUP_THREAD = 16,
  LOCAL_COMMUNITIES_THREAD = 17,
  CHAT_FOR_ROOM_THREAD = 18,
  GAMING_PLAY_SQUAD = 19,
  CHAT_FOR_GROUP_ADMIN_TO_MEMBER_THREAD = 20,
  EITM_BACKED_IG_1TO1_THREAD = 21,
  LEARNING_SPACE = 23,
  E2EE_GROUP_THREAD_METADATA = 24,
  IGD_BC_PARTNERSHIP = 25,
  E2EE_1TO1_THREAD_METADATA = 26,
  JOBS_CAREER_GROUP_THREAD = 27,
  IG_CREATOR_SUBSCRIBER_GROUP_THREAD = 28,
  IG_CREATOR_SUBSCRIBER_BROADCAST_CHAT = 29,
  BUSINESS_SUPPORT_THREAD = 30,
  TAGGED_PII_DATA = 31,
  IG_DISCOVERABLE_CHAT_THREAD = 32,
  SUPPORT_MESSAGING_THREAD = 33,
  DISCOVERABLE_PUBLIC_CHAT = 34,
  DISCOVERABLE_PUBLIC_BROADCAST_CHAT = 35,
  DISCOVERABLE_PUBLIC_CHAT_V2 = 36,
  IG_DISCOVERABLE_CHAT_THREAD_V2 = 37,
  OCULUS_MEDIA_MESSAGING = 38,
  WORK_CHAT_THREAD_CENTRIC = 39,
  COMMUNITY_MESSAGING_PUBLIC_THREAD = 40,
  COMMUNITY_MESSAGING_PRIVATE_THREAD = 41,
  COMMUNITY_MESSAGING_ADMOD_THREAD = 42,
  COMMUNITY_MESSAGING_BROADCAST_THREAD = 43,
  IG_E2EE_GROUP_THREAD_METADATA = 44,
  IG_NFT_BROADCAST_CHAT = 45,
  STANDALONE_COMMUNITY_STANDARD_THREAD = 46,
  IGD_GROUP = 47,
  WORKCHAT_GROUP_THREAD = 48,
  WORKROOM_GROUP_THREAD = 49,
  OCULUS_GROUP_THREAD = 50,
  INTEROP_GROUP = 51,
  IG_BTV_E2EE_1TO1_THREAD_METADATA = 52,
  COMMUNITY_MESSAGING_HELPER_BOT_THREAD = 53,
  COMMUNITY_MESSAGING_SUB_THREAD = 54,
  IG_GROUP_PROFILES = 55,
  IG_PRIVATE_EVENT = 56,
  WA_GENAI_BOT_MAILBOX_THREAD = 57,
  MESSENGER_GENAI_BOT_MAILBOX_THREAD = 58,
  IG_GENAI_BOT_MAILBOX_THREAD = 59,
  ONE_TO_ONE = 1001,
  PARENT_APPROVED_ONE_TO_ONE = 1002,
  IG_ONLY_ONE_TO_ONE = 1003,
  INTEROP_ONE_TO_ONE = 1004,
  WHATSAPP_ONE_TO_ONE = 1005,
  WORKCHAT_ONE_TO_ONE = 1006,
  OC_PROXY_ONE_TO_ONE = 1007,
  MARKETPLACE_ASSISTANT_ONE_TO_ONE = 1008,
  PAGE_TO_USER = 1009,
  PAGE_TO_PAGE = 1010,
  MESSENGER_AI_BOT_ONE_TO_ONE = 1011,
  IG_AI_BOT_ONE_TO_ONE = 1012,
  OCULUS = 2001,
}

export const enum SocketRequestResolverType {
  QUERY_ADDITIONAL_GROUP_THREADS = 'QUERY_ADDITIONAL_GROUP_THREADS',
  ADD_PARTICIPANTS = 'ADD_PARTICIPANTS',
  ADD_REACTION = 'ADD_REACTION',
  ARCHIVE_THREAD = 'ARCHIVE_THREAD',
  CREATE_GROUP_THREAD = 'CREATE_GROUP_THREAD',
  CREATE_THREAD = 'CREATE_THREAD',
  DELETE_THREAD = 'DELETE_THREAD',
  FETCH_INITIAL_THREADS = 'FETCH_INITIAL_THREADS',
  FETCH_MESSAGES = 'FETCH_MESSAGES',
  FETCH_MORE_INBOX_THREADS = 'FETCH_MORE_INBOX_THREADS',
  FETCH_MORE_THREADS = 'FETCH_MORE_THREADS',
  FORWARD_MESSAGE = 'FORWARD_MESSAGE',
  GET_NEW_THREAD = 'GET_NEW_THREAD',
  GET_THREAD = 'GET_THREAD',
  MOVE_OUT_OF_MESSAGE_REQUESTS = 'MOVE_OUT_OF_MESSAGE_REQUESTS',
  MUTE_THREAD = 'MUTE_THREAD',
  REMOVE_PARTICIPANT = 'REMOVE_PARTICIPANT',
  REMOVE_THREAD = 'REMOVE_THREAD',
  REQUEST_CONTACTS = 'REQUEST_CONTACTS',
  SEARCH_USERS_PRIMARY = 'SEARCH_USERS_PRIMARY',
  SEARCH_USERS_SECONDARY = 'SEARCH_USERS_SECONDARY',
  SEND_MESSAGE = 'SEND_MESSAGE',
  SEND_READ_RECEIPT = 'SEND_READ_RECEIPT',
  SEND_TYPING_INDICATOR = 'SEND_TYPING_INDICATOR',
  SET_ADMIN_STATUS = 'SET_ADMIN_STATUS',
  SET_THREAD_FOLDER = 'SET_THREAD_FOLDER',
  SET_THREAD_NAME = 'SET_THREAD_NAME',
  UNARCHIVE_THREAD = 'UNARCHIVE_THREAD',
  UNSEND_MESSAGE = 'UNSEND_MESSAGE',
  SEND_ACTIVITY_INDICATOR = 'SEND_ACTIVITY_INDICATOR',
  SYNC_DATABASE = 'SYNC_DATABASE',
}

export type SyncTransaction = {
  databaseId: number
  sendSyncParams: boolean
  currentCursor: string | null
  nextCursor: string | null
  syncChannel: SyncChannel
}

export type DatabaseSyncVariables = {
  deviceId: string
  includeChatVisibility: boolean
  requestId: number
  requestPayload: string // json stringified payload
  requestType: number
}

export type DatabaseQueryMetadata = {
  databaseId: number
  sendSyncParams: boolean
  lastAppliedCursor: string | null
  syncChannel: SyncChannel
}

export type DatabaseSyncQuery = {
  database: number
  last_applied_cursor: string | null
  version: number
  epoch_id: number
  data_trace_id?: string
  failure_count: number | null
  sync_params: string | null
}
