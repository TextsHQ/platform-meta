import { type Message, type Thread, type MessageReaction, type AttachmentWithURL, AttachmentType } from '@textshq/platform-sdk'
import type { ExtendedIGMessage, ExtendedIGThread, IGReaction } from './ig-types'
import type { IGThread } from './store/schema'

export function mapThread(thread: IGThread | ExtendedIGThread): Thread {
  return {
    _original: JSON.stringify(thread),
    id: thread.threadKey,
    // folderName: thread.pending ? 'requests' : 'normal',
    isUnread: 'unread' in thread ? thread.unread : false,
    isReadOnly: false,
    type: 'single',
    title: thread.threadName,
    messages: {
      items: [],
      hasMore: false,
      oldestCursor: '',
      newestCursor: '',
    },
    timestamp: new Date(Number(thread.lastActivityTimestampMs)),
    participants: {
      items: [],
      // items: thread?.participants?.map(participant => ({
      //   id: participant.userId,
      //   username: participant.username,
      //   fullName: participant.name,
      // })),
      hasMore: false,
      oldestCursor: '',
      newestCursor: '',
    },
    // lastReadMessageID: thread?.lastMessageDetails?.messageId,
    // partialLastMessage: {
    //   id: thread?.lastMessageDetails?.messageId,
    //   senderID: thread?.lastMessageDetails?.senderId,
    //   text: thread?.lastMessageDetails?.text,
    // },
  }
}

export function mapMessage(currentUserId: string, message: ExtendedIGMessage): Message {
  const reactions: MessageReaction[] = []
  const attachments: AttachmentWithURL[] = []

  message.reaction?.forEach(reaction => {
    reactions.push({
      id: reaction.reactorId,
      participantID: reaction.reactorId,
      reactionKey: reaction.reaction,
    })
  })

  message.images?.forEach(image => {
    attachments.push({
      id: image.imageId,
      type: AttachmentType.IMG,
      srcURL: image.imageUrl,
    })
  })

  return {
    _original: JSON.stringify(message),
    id: message.messageId,
    senderID: message.senderId,
    threadID: message.threadKey,
    text: message.text,
    timestamp: new Date(Number(message.timestampMs)),
    isSender: message.senderId === currentUserId,
    reactions,
    attachments,
  }
}
export function mapReactions(reaction: IGReaction): MessageReaction {
  return {
    id: `${reaction.reactorId}`,
    participantID: reaction.reactorId,
    reactionKey: reaction.reaction,
  }
}
