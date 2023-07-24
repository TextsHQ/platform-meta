import { type Message, type Thread, type MessageReaction, type AttachmentWithURL, AttachmentType } from '@textshq/platform-sdk'

export function mapThread(thread: any): Thread {
  return {
    _original: `${JSON.stringify({ ...thread })}`,
    id: thread.threadId,
    // folderName: thread.pending ? 'requests' : 'normal',
    isUnread: thread.unread,
    isReadOnly: false,
    type: 'single',
    title: thread.groupName,
    messages: {
      items: [],
      hasMore: false,
      oldestCursor: '',
      newestCursor: '',
    },
    timestamp: new Date(Number(thread.lastSentTime)),
    participants: {
      items: thread?.participants?.map(participant => ({
        id: participant.userId,
        username: participant.username,
        fullName: participant.name,
      })),
      hasMore: false,
      oldestCursor: '',
      newestCursor: '',
    },
    lastReadMessageID: thread?.lastMessageDetails?.messageId,
    partialLastMessage: {
      id: thread?.lastMessageDetails?.messageId,
      senderID: thread?.lastMessageDetails?.authorId,
      text: thread?.lastMessageDetails?.message,
    },
  }
}

export function mapMessage(currentUserId: string, message: any): Message {
  const reactions: MessageReaction[] = []
  const attachments: AttachmentWithURL[] = []

  message.reaction?.forEach((reaction: any) => {
    reactions.push({
      id: `${reaction.reactorId}`,
      participantID: reaction.reactorId,
      reactionKey: reaction.reaction,
    })
  })

  message.images?.forEach((image: any) => {
    attachments.push({
      id: image.imageId,
      type: AttachmentType.IMG,
      srcURL: image.imageUrl,
    })
  })

  return {
    _original: `${JSON.stringify({ ...message })}`,
    id: message.messageId,
    senderID: message.authorId,
    threadID: message.threadId,
    text: message.message,
    timestamp: new Date(Number(message.sentTs)),
    isSender: message.authorId === currentUserId,
    reactions,
    attachments,
  }
}
export function mapReactions(reaction: any): MessageReaction {
  return {
    id: `${reaction.reactorId}`,
    participantID: reaction.reactorId,
    reactionKey: reaction.reaction,
  }
}
