import type { IGThread, IGMessage } from './store/schema'

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
