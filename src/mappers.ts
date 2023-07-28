import type { Message, Thread, MessageReaction, AttachmentWithURL, AttachmentType, User } from '@textshq/platform-sdk'
import type { ExtendedIGMessage, ExtendedIGThread } from './ig-types'
import type { IGThread, IGReaction, IGParticipant } from './store/schema'

export function mapUser(user: IGUser): User {
  return {
    _original: JSON.stringify(user),
}

export function mapParticipant(participant: IGParticipant): Participant {
  return {
    _original: JSON.stringify(participant),
    id: participant.userId,
    username: participant.username,
  }
}

export function mapThread(thread: IGThread, participants: IGParticipant): Thread {
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
      id: `${reaction.threadKey}-${reaction.messageId}-${reaction.actorId}-${reaction.reaction}`,
      participantID: reaction.actorId,
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
    id: `${reaction.threadKey}-${reaction.messageId}-${reaction.actorId}-${reaction.reaction}`,
    participantID: reaction.actorId,
    reactionKey: reaction.reaction,
  }
}
