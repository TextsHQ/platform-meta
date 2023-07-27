import type { IGThread } from './store/schema'

export type IGReaction = {
  reactionSentTs: string
  reactorId: string
  reaction: string
  messageId: string
}
export interface ExtendedIGThread extends IGThread {
  unread: boolean
  participants: IGParticipant[]
  lastMessageDetails: Partial<IGMessage>
}

export interface IGMessage {
  threadKey: string
  timestampMs: number
  messageId: string
  offlineThreadingId?: string
  authorityLevel?: number
  primarySortKey?: string
  senderId: string
  isAdminMessage?: boolean
  sendStatus?: number
  sendStatusV2?: number
  text?: string
  subscriptErrorMessage?: string
  secondarySortKey?: string
  stickerId?: string
  messageRenderingType?: number
  isUnsent?: boolean
  unsentTimestampMs?: number
  mentionOffsets?: number[]
  mentionLengths?: number[]
  mentionIds?: string[]
  mentionTypes?: number[]
  replySourceId?: string
  replySourceType?: number
  replySourceTypeV2?: number
  replyStatus?: number
  replySnippet?: string
  replyMessageText?: string
  replyToUserId?: string
  replyMediaExpirationTimestampMs?: number
  replyMediaUrl?: string
  replyMediaPreviewWidth?: number
  replyMediaPreviewHeight?: number
  replyMediaUrlMimeType?: string
  replyMediaUrlFallback?: string
  replyCtaId?: string
  replyCtaTitle?: string
  replyAttachmentType?: number
  replyAttachmentId?: string
  replyAttachmentExtra?: string
  isForwarded?: boolean
  forwardScore?: number
  hasQuickReplies?: boolean
  adminMsgCtaId?: string
  adminMsgCtaTitle?: string
  adminMsgCtaType?: number
  cannotUnsendReason?: number
  textHasLinks?: boolean
  viewFlags?: number
  displayedContentTypes?: number[]
  viewedPluginKey?: string
  viewedPluginContext?: string
  quickReplyType?: number
  hotEmojiSize?: number
  replySourceTimestampMs?: number
  ephemeralDurationInSec?: number
  msUntilExpirationTs?: number
  ephemeralExpirationTs?: number
  takedownState?: number
  isCollapsed?: boolean
  subthreadKey?: string
}

export interface ExtendedIGMessage extends IGMessage {
  reaction?: IGReaction[]
  attachements?: IGAttachment[]
  images?: {
    imageId: string
    imageUrl: string
  }[]
}

export interface IGAttachment {
  threadKey?: string
  messageId?: string
  attachmentFbid?: string
  filename?: string
  filesize?: number
  hasMedia?: boolean
  playableUrl?: string
  playableUrlFallback?: string
  playableUrlExpirationTimestampMs?: number
  playableUrlMimeType?: string
  dashManifest?: string
  previewUrl?: string
  previewUrlFallback?: string
  previewUrlExpirationTimestampMs?: number
  previewUrlMimeType?: string
  miniPreview?: string
  previewWidth?: number
  previewHeight?: number
  attributionAppId?: string
  attributionAppName?: string
  attributionAppIcon?: string
  attributionAppIconFallback?: string
  attributionAppIconUrlExpirationTimestampMs?: number
  localPlayableUrl?: string
  playableDurationMs?: number
  attachmentIndex?: number
  accessibilitySummaryText?: string
  isPreviewImage?: boolean
  originalFileHash?: string
  attachmentType?: number
  timestampMs?: number
  offlineAttachmentId?: string
  hasXma?: boolean
  xmaLayoutType?: number
  xmasTemplateType?: number
  titleText?: string
  subtitleText?: string
  descriptionText?: string
  sourceText?: string
  faviconUrlExpirationTimestampMs?: number
  isBorderless?: boolean
  previewUrlLarge?: string
  samplingFrequencyHz?: number
  waveformData?: string
  authorityLevel?: number
}

export interface IGParticipant {
  name: string
  username: string
  userId: string
}
