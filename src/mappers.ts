import { AttachmentType } from '@textshq/platform-sdk'
import type { DBMessageSelectWithAttachments, IGMessageInDB, RawAttachment } from './store/schema'

function mapMimeTypeToAttachmentType(mimeType: string): AttachmentType {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/png':
      return AttachmentType.IMG
    case 'video/mp4':
      return AttachmentType.VIDEO
    case 'audio/mpeg':
      return AttachmentType.AUDIO
    default:
      return AttachmentType.UNKNOWN
  }
}

export function mapAttachment(a: DBMessageSelectWithAttachments['attachments'][number]) {
  const attachment = JSON.parse(a.attachment) as RawAttachment
  return {
    id: a.attachmentFbid,
    type: mapMimeTypeToAttachmentType(attachment.playableUrlMimeType),
    size: {
      width: attachment.previewWidth,
      height: attachment.previewHeight,
    },
    mimeType: attachment.playableUrlMimeType,
    fileSize: attachment.playableDurationMs,
    fileName: attachment.filename,
    srcURL: attachment.playableUrl,
  }
}

export function mapMessage(m: DBMessageSelectWithAttachments, fbid: string) {
  const message = JSON.parse(m.message) as IGMessageInDB
  return {
    _original: JSON.stringify({
      message,
      raw: m.raw,
    }),
    id: m.messageId,
    timestamp: m.timestampMs,
    senderID: m.senderId,
    text: message.text,
    isSender: m.senderId === fbid,
    threadID: m.threadKey,
    isAction: message.isAdminMessage,
    attachments: m.attachments.map(a => mapAttachment(a)),
  }
}

export function mapMessages(messages: DBMessageSelectWithAttachments[], fbid: string) {
  return messages.map(m => mapMessage(m, fbid))
}
