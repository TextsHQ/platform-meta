import { AttachmentType, Message, type Participant, type Thread, ThreadType } from '@textshq/platform-sdk'
import type { DBMessageSelectWithAttachments, DBParticipantSelect, IGMessageInDB, RawAttachment } from './store/schema'
import { IGThreadInDB } from './store/schema'
import { fixEmoji } from './util'
import { DEFAULT_PARTICIPANT_NAME } from './constants'
import { ParseResult } from './parsers'

function mapMimeTypeToAttachmentType(mimeType: string): AttachmentType {
  switch (mimeType?.split('/')?.[0]) {
    case 'image': return AttachmentType.IMG
    case 'video': return AttachmentType.VIDEO
    case 'audio': return AttachmentType.AUDIO
    default: return AttachmentType.UNKNOWN
  }
}

export function mapAttachment(a: DBMessageSelectWithAttachments['attachments'][number]) {
  const attachment = JSON.parse(a.attachment) as RawAttachment
  const hasPlayableUrl = !!attachment.playableUrl
  const playableUrlMimeType = hasPlayableUrl && attachment.playableUrlMimeType
  const mimeType = attachment.previewUrlMimeType || playableUrlMimeType
  const type = mapMimeTypeToAttachmentType(playableUrlMimeType || attachment.previewUrlMimeType)
  return {
    // _original: JSON.stringify({
    //   attachment,
    //   raw: a.raw,
    // }),
    id: a.attachmentFbid,
    type,
    size: {
      width: attachment.previewWidth,
      height: attachment.previewHeight,
    },
    mimeType: attachment.playableUrlMimeType || attachment.previewUrlMimeType,
    fileSize: attachment.playableDurationMs,
    fileName: attachment.filename,
    srcURL: attachment.playableUrl || attachment.previewUrl,
    isGif: type === AttachmentType.VIDEO && (attachment.shouldAutoplayVideo || mimeType === 'image/gif'),
    extra: {
      text: attachment.descriptionText || attachment.titleText,
      igType: attachment.attachmentType,
    },
  }
}

export function mapReaction(r: DBMessageSelectWithAttachments['reactions'][number]) {
  return {
    id: r.actorId,
    reactionKey: fixEmoji(r.reaction),
    participantID: r.actorId,
    emoji: true,
  }
}

export type MapMessageCommonOptions = {
  users: Participant[] // naming seems wrong but maps to how ig client stores it
  participants: DBParticipantSelect[]
  fbid: string
  threadType: Thread['type']
}

export function mapMessage(m: DBMessageSelectWithAttachments, { threadType = 'single', participants, fbid, users }: MapMessageCommonOptions): Message {
  const message = JSON.parse(m.message) as IGMessageInDB
  let seen: boolean | { [participantID: string]: Date } = false
  if (threadType !== 'single') {
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

  const isAction = message.isAdminMessage
  const senderUsername = users.find(u => u?.id === m.senderId)?.username
  const text = message.text?.length > 0 ? (isAction ? message.text.replace(senderUsername, '{{sender}}') : message.text) : null
  const linkedMessageID = message.replySourceId?.startsWith('mid.') ? message.replySourceId : undefined

  const attachments = m.attachments.map(a => mapAttachment(a))
  const attachmentWithText = attachments.find(a => !!a.extra?.text)?.extra?.text

  if (message.text === '' && !message.textHeading && attachments?.length === 0) {
    message.textHeading = 'No longer available'
  }

  const textFooter = !message.isUnsent && attachmentWithText
  const textHeading = (!linkedMessageID && (message.textHeading || message.replySnippet)) || textFooter

  return {
    // _original: JSON.stringify({
    //   message,
    //   raw: m.raw,
    // }), // get original object works for debugging
    id: m.messageId,
    timestamp: m.timestampMs,
    senderID: m.senderId,
    isDeleted: message.isUnsent,
    text,
    isSender: m.senderId === fbid,
    threadID: m.threadKey,
    linkedMessageID,
    forwardedCount: message.isForwarded ? 1 : 0,
    isAction,
    attachments: attachments.filter(a => !!a.srcURL),
    reactions: m.reactions.map(r => mapReaction(r)),
    textHeading,
    textFooter: textFooter && textHeading !== textFooter ? textFooter : undefined,
    seen,
    links: message.links,
    parseTemplate: isAction,
    extra: message.extra,
    // sortKey: m.primarySortKey || message.secondarySortKey,
  }
}

export function mapMessages(messages: DBMessageSelectWithAttachments[], opts: MapMessageCommonOptions) {
  return messages.sort((m1, m2) => {
    if (m1.primarySortKey === m2.primarySortKey) return 0
    return m1.primarySortKey > m2.primarySortKey ? 1 : -1
  }).map(m => mapMessage(m, opts))
}

export function mapParticipants(_participants: DBParticipantSelect[], fbid: string) {
  const participants: Participant[] = _participants.map(p => ({
    id: p.contacts.id,
    username: p.contacts.username,
    fullName: p.contacts.name || p.contacts.username || DEFAULT_PARTICIPANT_NAME,
    imgURL: p.contacts.profilePictureUrl,
    isSelf: p.contacts.id === fbid,
    displayText: p.contacts.name,
    hasExited: false,
    isAdmin: Boolean(p.isAdmin),
  }))

  if (participants?.length > 1) {
    const otherParticipant = participants.findIndex(p => !p.isSelf)
    if (otherParticipant !== 0) {
      const item = participants[otherParticipant]
      participants.splice(otherParticipant, 1)
      participants.unshift(item)
    }
  }

  return participants.filter(p => !!p?.id)
}

export function mapThread(
  t: {
    threadKey: string
    thread: string
    ranges: string
    lastActivityTimestampMs: Date
    folderName: string
    messages?: DBMessageSelectWithAttachments[]
    participants: DBParticipantSelect[]
  },
  fbid: string,
) {
  const thread = JSON.parse(t.thread) as IGThreadInDB | null
  const ranges: ParseResult['insertNewMessageRange'] = t.ranges ? JSON.parse(t.ranges) : {}
  const isUnread = t.lastActivityTimestampMs?.getTime() > thread?.lastReadWatermarkTimestampMs
  const participants = mapParticipants(t.participants, fbid)

  const threadType: ThreadType = thread?.threadType === '1' ? 'single' : 'group'

  // let mutedUntil = null
  // if (thread.muteExpireTimeMs !== 0) {
  //   if (thread.muteExpireTimeMs === -1) {
  //     mutedUntil = 'forever'
  //   } else {
  //     mutedUntil = new Date(thread.muteExpireTimeMs)
  //   }
  // }
  // logger.debug(`mutedUntil: ${mutedUntil}`)
  return {
    id: t.threadKey as string,
    title: threadType === 'group' && thread?.threadName,
    isUnread,
    folderType: t.folderName,
    // ...mutedUntil && { mutedUntil },
    isReadOnly: false,
    imgURL: thread?.threadPictureUrl,
    type: threadType,
    participants: {
      items: participants,
      hasMore: false,
    },
    partialLastMessage: thread.snippet && {
      text: thread.snippet,
      senderID: thread.snippetSenderContactId,
      isSender: thread.snippetSenderContactId === fbid,
    },
    messages: {
      items: mapMessages(t.messages, {
        fbid,
        participants: t.participants,
        threadType,
        users: participants,
      }),
      hasMore: ranges.hasMoreBeforeFlag,
    },
  } as const
}
