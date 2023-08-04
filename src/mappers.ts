import type { Message } from '@textshq/platform-sdk'

export function mapMessage(messages: any[], fbid): Message[] {
  console.log('mapping message from', JSON.stringify(messages, null, 2))
  return messages.map(m => ({ id: m.messageId,
    timestamp: m.timestampMs,
    senderID: m.senderId,
    text: m.text,
    isSender: m.senderId === fbid,
    threadID: m.threadKey,
    attachments: m.attachments.map(a => ({ type: 'img', srcURL: a.previewUrl })),
  }))
}
