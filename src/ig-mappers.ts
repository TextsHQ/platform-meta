import type { Thread, Message } from '@textshq/platform-sdk'
import type { IGMessage } from './ig-types'
import type { IGThread } from './store/schema'

export function mapThread(thread: IGThread): Thread {
  return {
    id: thread.threadKey,
    isUnread: false,
    isReadOnly: true,
    type: 'single',
    messages: null,
    participants: null,
  }
}

export function mapMessage(currentUserId: string, message: IGMessage): Message {
  const { messageId: id, threadKey: threadID, senderId: senderID, timestampMs, text } = message
  return {
    id,
    threadID,
    senderID,
    timestamp: new Date(timestampMs),
    text,
    isSender: senderID === currentUserId,
  }
}
