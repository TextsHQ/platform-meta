// export function mapThread(thread: IGThread, currentUserIG: IGUser): Thread {
//   const messages = mapMessages(thread, currentUserIG.pk)
//   const currentUserLastSeen = thread.last_seen_at?.[currentUserIG.pk]
//   return {
//     _original: JSON.stringify(thread),
//     id: thread.thread_id,
//     folderName: thread.pending ? InboxName.REQUESTS : InboxName.NORMAL,
//     isUnread: BigInt(thread.items[0]?.timestamp || 0) > BigInt(currentUserLastSeen?.timestamp || 0),
//     lastReadMessageID: currentUserLastSeen?.item_id,
//     mutedUntil: thread.muted ? 'forever' : undefined,
//     isReadOnly: thread.input_mode !== 0,
//     messages: {
//       items: messages,
//       hasMore: thread.has_older,
//     },
//     timestamp: messages[messages.length - 1]?.timestamp,
//     type: thread.is_group ? 'group' : 'single',
//     title: thread.is_group ? thread.thread_title : undefined,
//     participants: {
//       items: mapParticipants(thread, currentUserIG),
//       hasMore: false,
//     },
//   }
// }
