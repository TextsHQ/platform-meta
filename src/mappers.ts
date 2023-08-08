import { AttachmentType } from '@textshq/platform-sdk'
import type { DBMessageSelectWithAttachments, DBParticipantInsert, IGMessageInDB, RawAttachment } from './store/schema'

function mapMimeTypeToAttachmentType(mimeType: string): AttachmentType {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/png':
      return AttachmentType.IMG
    case 'video/mp4':
      return AttachmentType.VIDEO
    case 'audio/mpeg':
      return AttachmentType.AUDIO
    default:
      return AttachmentType.UNKNOWN
  }
}

export function mapAttachment(a: DBMessageSelectWithAttachments['attachments'][number]) {
  const attachment = JSON.parse(a.attachment) as RawAttachment
  return {
    id: a.attachmentFbid,
    type: mapMimeTypeToAttachmentType(attachment.playableUrlMimeType),
    size: {
      width: attachment.previewWidth,
      height: attachment.previewHeight,
    },
    mimeType: attachment.playableUrlMimeType,
    fileSize: attachment.playableDurationMs,
    fileName: attachment.filename,
    srcURL: attachment.playableUrl,
  }
}

export function mapReaction(r: DBMessageSelectWithAttachments['reactions'][number]) {
  return {
    id: r.actorId,
    reactionKey: r.reaction,
    participantID: r.actorId,
    emoji: true,
  }
}

export function mapMessage(m: DBMessageSelectWithAttachments, fbid: string, participants: DBParticipantInsert[], type) {
  const message = JSON.parse(m.message) as IGMessageInDB
  let seen
  if (type !== 'single') {
    seen = participants.reduce(
      (acc, p) => {
        if (p.readWatermarkTimestampMs >= m.timestampMs) acc[p.userId] = new Date(1) // Date(1) is unknown date
        return acc
      },
      {} as {
        [participantID: string]: Date // FIXME: platform SDK type is wrong. boolean causes threads client to crash
      },
    )
  } else {
    const otherp = participants.find(p => p.userId !== fbid)
    if (otherp) {
      seen = otherp.readWatermarkTimestampMs >= m.timestampMs
    }
  }

  console.log('seenstuff', seen)
  return {
    _original: JSON.stringify({
      message,
      raw: m.raw,
    }),
    id: m.messageId,
    timestamp: m.timestampMs,
    senderID: m.senderId,
    text: message.text,
    isSender: m.senderId === fbid,
    threadID: m.threadKey,
    isAction: message.isAdminMessage,
    attachments: m.attachments.map(a => mapAttachment(a)),
    reactions: m.reactions.map(r => mapReaction(r)),
    seen,
  }
}

export function mapMessages(messages: DBMessageSelectWithAttachments[], fbid: string, participants: DBParticipantInsert[], type) {
  return messages.map(m => mapMessage(m, fbid, participants, type))
}
