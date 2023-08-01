import type { Message } from '@textshq/platform-sdk'

export function mapMessage(messages, fbid): Message[] {
  console.log('mapping message from', messages.attachments)
  return messages.map(m => ({ id: m.messageId,
    timestamp: m.timestampMs,
    senderID: m.senderId,
    text: m.text,
    isSender: m.senderId === fbid,
    threadID: m.threadKey,
  }))
}
