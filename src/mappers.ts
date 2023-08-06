import { AttachmentType } from '@textshq/platform-sdk'
import type { DBMessageSelectWithAttachments, IGMessageInDB, RawAttachment } from './store/schema'

export function mapAttachment(a: DBMessageSelectWithAttachments['attachments'][number]) {
  const attachment = JSON.parse(a.attachment) as RawAttachment
  return {
    id: a.attachmentFbid,
    type: AttachmentType.IMG,
    srcURL: attachment.playableUrl,
  }
}

export function mapMessage(m: DBMessageSelectWithAttachments, fbid: string) {
  const message = JSON.parse(m.message) as IGMessageInDB
  return {
    id: m.messageId,
    timestamp: m.timestampMs,
    senderID: m.senderId,
    text: message.text,
    isSender: m.senderId === fbid,
    threadID: m.threadKey,
    attachments: m.attachments.map(a => mapAttachment(a)),
  }
}

export function mapMessages(messages: DBMessageSelectWithAttachments[], fbid: string) {
  return messages.map(m => mapMessage(m, fbid))
}
