import {
  AttachmentType,
  InboxName,
  type Message,
  type Thread,
  type Participant,
  type ThreadType,
  MessageActionType,
  UNKNOWN_DATE,
} from '@textshq/platform-sdk'
import { truncate } from 'lodash'
import type { DBParticipantSelect, IGMessageInDB, IGThreadInDB, RawAttachment } from './store/schema'
import { fixEmoji } from './util'
import { IGMessageRanges, ParentThreadKey, StickerConstants } from './types'
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

export function mapMessage(m: QueryMessagesResult[number] | QueryThreadsResult[number]['messages'][number], env: EnvKey, fbid: string, _thread?: QueryThreadsResult[number]) {
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

  const { attachments } = m
  let attachmentWithText: string
  const attachmentsWithMedia: ReturnType<typeof mapAttachment>[] = []
  let reelWithTitle: ReturnType<typeof mapAttachment>

  for (const a of attachments) {
    const mapped = mapAttachment(a)
    if (!attachmentWithText && !!mapped.extra?.text) attachmentWithText = mapped.extra.text
    if (mapped.srcURL) attachmentsWithMedia.push(mapped)
    if (!message.links && mapped.extra?.mmType === '7' && !!mapped.extra?.headerTitle && !reelWithTitle) reelWithTitle = mapped
  }

  if (reelWithTitle?.extra?.headerTitle) {
    // const what = (reelWithTitle.extra.mmType === '7') ? 'story' : 'post'
    message.textHeading = `Shared media from @${reelWithTitle.extra.headerTitle}`
  }

  if (!message.links && message.text === '' && !message.textHeading && attachmentsWithMedia?.length === 0 && !attachmentWithText && !message?.stickerId) {
    message.textHeading = 'No longer available'
  } else if (message.stickerId) {
    if (message.stickerId === StickerConstants.HOT_LIKE_SMALL_STICKER_ID
      || message.stickerId === StickerConstants.HOT_LIKE_MEDIUM_STICKER_ID
      || message.stickerId === StickerConstants.HOT_LIKE_LARGE_STICKER_ID) {
      // This is only for hardcoded stickers (not the ones where the sticker comes as an attachment)
      const fileName = 'blue-thumbs-up'
      // Replace the existing attachment with a new one to use the SVG file
      attachmentsWithMedia.splice(0, 1, {
        fileSize: undefined,
        fileName: undefined,
        isGif: false,
        extra: undefined,
        id: fileName,
        type: AttachmentType.IMG,
        mimeType: 'image/svg+xml',
        srcURL: `asset://$accountID/sticker/${m.threadKey}/${m.messageId}/${fileName}`,
        size: { width: 64, height: 64 },
      })
    }
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

  const mapped: Message = {
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
    textHeading,
    textFooter: textFooter && textHeading !== textFooter ? textFooter : undefined,
    seen,
    links: message.links,
    parseTemplate: isAction,
    extra: {
      ...(message.extra || {}),
      primarySortKey: m.primarySortKey,
    },
  }

  const extraMessages: Message[] = []
  const reactions: Message['reactions'] = []

  if (m.reactions?.length > 0) {
    const truncated = truncate(mapped.text || mapped.textHeading || mapped.textFooter || '')
    let lastSortKey = m.primarySortKey
    for (const r of m.reactions) {
      const reactionKey = fixEmoji(r.reaction)
      lastSortKey += 1
      reactions.push({
        id: r.actorId,
        reactionKey,
        participantID: r.actorId,
        emoji: true,
      })
      extraMessages.push({
        id: r.actorId,
        timestamp: new Date(+r.timestampMs),
        senderID: mapped.senderID,
        isSender: mapped.isSender,
        text: `${mapped.isSender ? 'You' : '{{sender}}'} reacted with ${reactionKey}${truncated ? `: ${truncated}` : ''}`,
        action: {
          type: MessageActionType.MESSAGE_REACTION_CREATED,
          messageID: mapped.id,
          participantID: mapped.senderID,
          reactionKey,
        },
        parseTemplate: true,
        isAction: true,
        isHidden: true,
        extra: {
          primarySortKey: lastSortKey,
        },
      })
    }
  }

  mapped.reactions = reactions
  return [mapped, ...extraMessages]
}

// export const mapMessages = (messages: QueryMessagesResult | QueryThreadsResult[0]['messages'], env: EnvKey, fbid: string, t?: QueryThreadsResult[0]): Message[] => messages.flatMap(m => mapMessage(m, env, fbid, t).filter(Boolean).sort((m1, m2) => {
//   if (m1.extra?.primarySortKey === m2.extra?.primarySortKey) return 0
//   return m1.extra?.primarySortKey > m2.extra?.primarySortKey ? 1 : -1
// }))
export const mapMessages = (messages: QueryMessagesResult | QueryThreadsResult[0]['messages'], env: EnvKey, fbid: string, t?: QueryThreadsResult[0]): Message[] =>
  messages.flatMap(m => mapMessage(m, env, fbid, t)).filter(Boolean).sort((m1, m2) => {
    if (m1.extra?.primarySortKey === m2.extra?.primarySortKey) return 0
    return m1.extra?.primarySortKey > m2.extra?.primarySortKey ? 1 : -1
  })

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
