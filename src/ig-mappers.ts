// import type { Thread, Message } from '@textshq/platform-sdk'
// import type { IGThread, IGMessage } from './store/schema'

// // given a list of threadIDs, return a list of Thread objects from the IG store
// export function mapThreads(db, threadIDs: string[]): Thread {

// }

// export function mapMessage(currentUserId: string, message: IGMessage): Message {
//   const { messageId: id, threadKey: threadID, senderId: senderID, timestampMs, text } = message
//   return {
//     id,
//     threadID,
//     senderID,
//     timestamp: new Date(timestampMs),
//     text,
//     isSender: senderID === currentUserId,
//   }
// }
