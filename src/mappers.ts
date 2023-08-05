import { Attachment, AttachmentType, Message } from '@textshq/platform-sdk'

export function mapAttachment(a: any) {
  // console.log('mapAttachment', a)
  return {
    id: a.id,
    type: AttachmentType.IMG,
    srcURL: a.previewUrl,
  }
}

export function mapMessage(m: any, fbid) {
  return {
    id: m.messageId,
    timestamp: m.timestampMs,
    senderID: m.senderId,
    text: m.text,
    isSender: m.senderId === fbid,
    threadID: m.threadKey,
    attachments: (m.attachments as any[]).map<Attachment>(a => mapAttachment(a)),
  }
}

export function mapMessages(messages: any[], fbid): Message[] {
  return messages.map<Message>(m => mapMessage(m, fbid))
}
