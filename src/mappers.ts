import {
  AttachmentType,
  InboxName,
  type Message,
  type Thread,
  type Participant,
  type ThreadType,
  UNKNOWN_DATE,
} from '@textshq/platform-sdk'
import type { DBParticipantSelect, IGMessageInDB, IGThreadInDB, RawAttachment } from './store/schema'
import { fixEmoji } from './util'
import { IGMessageRanges, ParentThreadKey } from './types'
import type { QueryMessagesResult, QueryThreadsResult } from './store/queries'
import EnvOptions, { EnvKey } from './env'

function mapMimeTypeToAttachmentType(mimeType: string): AttachmentType {
  switch (mimeType?.split('/')?.[0]) {
    case 'image': return AttachmentType.IMG
    case 'video': return AttachmentType.VIDEO
    case 'audio': return AttachmentType.AUDIO
    default: return AttachmentType.UNKNOWN
  }
}

function mapSize(input: string | number | null): number | null {
  if (typeof input === 'number') return input
  if (typeof input === 'string') return Number(input)
  return null
}

export function mapAttachment(a: QueryMessagesResult[number]['attachments'][number]) {
  const attachment = JSON.parse(a.attachment) as RawAttachment
  const hasPlayableUrl = !!attachment.playableUrl
  const playableUrlMimeType = hasPlayableUrl && attachment.playableUrlMimeType
  const mimeType = attachment.previewUrlMimeType || playableUrlMimeType
  const type = mapMimeTypeToAttachmentType(playableUrlMimeType || attachment.previewUrlMimeType)
  return {
    id: a.attachmentFbid,
    type,
    size: attachment.previewWidth && attachment.previewHeight ? {
      width: mapSize(attachment.previewWidth),
      height: mapSize(attachment.previewHeight),
    } : undefined,
    mimeType: attachment.playableUrlMimeType || attachment.previewUrlMimeType,
    fileSize: attachment.playableDurationMs,
    fileName: attachment.filename,
    srcURL: attachment.playableUrl || attachment.previewUrl,
    isGif: type === AttachmentType.VIDEO && (attachment.shouldAutoplayVideo || mimeType === 'image/gif'),
    extra: {
      text: attachment.descriptionText || attachment.titleText,
      mmType: attachment.attachmentType,
      headerTitle: attachment.headerTitle,
    },
  }
}

export function mapReaction(r: QueryMessagesResult[number]['reactions'][number]) {
  return {
    id: r.actorId,
    reactionKey: fixEmoji(r.reaction),
    participantID: r.actorId,
    emoji: true,
  }
}

export function mapParticipants(_participants: DBParticipantSelect[], env: EnvKey, fbid: string) {
  const participants: Participant[] = _participants.map(p => ({
    id: p.contacts.id,
    username: p.contacts.username,
    fullName: p.contacts.name || p.contacts.username || EnvOptions[env].defaultContactName,
    imgURL: p.contacts.profilePictureUrl,
    isSelf: p.contacts.id === fbid,
    displayText: p.contacts.name,
    hasExited: false,
    isAdmin: Boolean(p.isAdmin),
    // isVerified: p.contacts.igContact.verificationStatus,
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

export function mapMessage(m: QueryMessagesResult[number] | QueryThreadsResult[number]['messages'][number], env: EnvKey, fbid: string, _thread?: QueryThreadsResult[number]): Message {
  // const thread = m.thread?.thread ? JSON.parse(m.thread.thread) as QueryMessagesResult[0]['thread'] : null
  const t = ('thread' in m) ? m.thread : _thread

  const participants = t?.participants || []
  const users = mapParticipants(participants, env, fbid)
  const message = JSON.parse(m.message) as IGMessageInDB
  let seen: boolean | { [participantID: string]: Date } = false
  const thread = t?.thread ? JSON.parse(t.thread) as IGThreadInDB : null
  const threadType = thread?.threadType === '1' ? 'single' : 'group'

  if (threadType !== 'single') {
    seen = participants.reduce(
      (acc, p) => {
        if (p.readWatermarkTimestampMs >= m.timestampMs) acc[p.userId] = UNKNOWN_DATE
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

  // @TODO: we should only loop over attachments once here
  const attachments = m.attachments.map(a => mapAttachment(a))
  const attachmentWithText = attachments.find(a => !!a.extra?.text)?.extra?.text
  const attachmentsWithMedia = attachments?.filter(att => !!att.srcURL)
  const reelWithTitle = attachments?.find(att => att.extra?.mmType === '7' && !!att.extra?.headerTitle)

  if (reelWithTitle?.extra?.headerTitle) {
    message.textHeading = `Shared a reel from @${reelWithTitle.extra.headerTitle}`
  }

  if (message.text === '' && !message.textHeading && attachmentsWithMedia?.length === 0 && !attachmentWithText) {
    message.textHeading = 'No longer available'
  }

  // else {
  //   const assetURL = message.extra?.assetURL
  //   if (assetURL?.includes('/ig_reel/')) {
  //     attachments.push({
  //       id: `story-in-${m.messageId}-video`,
  //       type: AttachmentType.VIDEO,
  //       size: {
  //         width: 1080,
  //         height: 1920,
  //       },
  //       mimeType: AttachmentType.VIDEO,
  //       fileSize: 0,
  //       fileName: `story-in-${m.messageId}.mp4`,
  //       srcURL: assetURL,
  //       isGif: false,
  //       extra: undefined,
  //     })
  //     attachments.push({
  //       id: `story-in-${m.messageId}-img`,
  //       type: AttachmentType.IMG,
  //       size: {
  //         width: 1080,
  //         height: 1920,
  //       },
  //       mimeType: AttachmentType.IMG,
  //       fileSize: 0,
  //       fileName: `story-in-${m.messageId}.jpg`,
  //       srcURL: assetURL,
  //       isGif: false,
  //       extra: undefined,
  //     })
  //   }
  // }

  const textFooter = !message.isUnsent && attachmentWithText
  const textHeading = (!linkedMessageID && (message.textHeading || message.replySnippet)) || textFooter

  return {
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
    attachments: attachmentsWithMedia,
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

export function mapMessages(messages: QueryMessagesResult | QueryThreadsResult[0]['messages'], env: EnvKey, fbid: string, t?: QueryThreadsResult[0]) {
  return messages.sort((m1, m2) => {
    if (m1.primarySortKey === m2.primarySortKey) return 0
    return m1.primarySortKey > m2.primarySortKey ? 1 : -1
  }).map(m => mapMessage(m, env, fbid, t))
}

export function mapThread(
  t: QueryThreadsResult[0],
  env: EnvKey,
  fbid: string,
  ranges: IGMessageRanges,
): Thread {
  const thread = JSON.parse(t.thread) as IGThreadInDB | null
  const isUnread = t.lastActivityTimestampMs?.getTime() > thread?.lastReadWatermarkTimestampMs
  const participants = mapParticipants(t.participants, env, fbid)

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
    title: threadType === 'group' ? thread?.threadName : null,
    isUnread,
    folderName: t.parentThreadKey === ParentThreadKey.SPAM ? InboxName.REQUESTS : InboxName.NORMAL,
    isArchived: t.parentThreadKey === ParentThreadKey.ARCHIVE,
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
      items: mapMessages(t.messages, env, fbid, t),
      hasMore: typeof ranges?.hasMoreBeforeFlag === 'boolean' ? ranges.hasMoreBeforeFlag : true,
    },
    extra: {
      lastActivityTimestampMs: t.lastActivityTimestampMs,
    },
  } as const
}
