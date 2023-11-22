import {
  Attachment,
  AttachmentType,
  InboxName,
  type Message,
  type Thread,
  type Participant,
  type ThreadType,
  MessageActionType,
  MessageSeen,
  MessageContent,
  TextAttributes,
} from '@textshq/platform-sdk'
import { inArray } from 'drizzle-orm'
import { truncate } from 'lodash'
import { contacts } from './store/schema'
import type { DBParticipantSelect, IGMessageInDB, IGThreadInDB, RawAttachment } from './store/schema'
import { fixEmoji } from './util'
import { IGMessageRanges, ParentThreadKey, StickerConstants } from './types'
import type { QueryMessagesResult, QueryThreadsResult } from './store/queries'
import EnvOptions, { EnvKey } from './env'
import { DrizzleDB } from './store/db'
import { getStringLength } from './unicode-utils'

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

export function mapTextAttributes(
  text: MessageContent['text'],
  { mentionOffsets, mentionLengths, mentionIds, mentionTypes }: {
    mentionOffsets: string
    mentionLengths: string
    mentionIds: string
    mentionTypes: string
  },
): TextAttributes {
  const textAttributes: TextAttributes = {
    entities: [],
  }

  if (mentionOffsets && mentionLengths && mentionIds && mentionTypes) {
    const offsets = mentionOffsets.split(',')
    const lengths = mentionLengths.split(',')
    const ids = mentionIds.split(',')
    const types = mentionTypes.split(',')

    for (let i = 0; i < offsets.length; i++) {
      const offset = Number(offsets[i])
      const length = Number(lengths[i])
      const id = ids[i]
      const type = types[i]

      const textLength = getStringLength(text.slice(0, offset))
      const offsetDiff = offset - textLength

      if (type === 'p') {
        textAttributes.entities.push({
          from: offset - offsetDiff,
          to: offset - offsetDiff + length,
          mentionedUser: {
            id,
          },
        })
      }
    }
  }

  return textAttributes
}

function mapMessage(m: QueryMessagesResult[number] | QueryThreadsResult[number]['messages'][number], env: EnvKey, fbid: string, _thread?: QueryThreadsResult[number]) {
  // const thread = m.thread?.thread ? JSON.parse(m.thread.thread) as QueryMessagesResult[0]['thread'] : null
  const t = ('thread' in m) ? m.thread : _thread

  const participants = t?.participants || []
  const users = mapParticipants(participants, env, fbid)
  const message = JSON.parse(m.message) as IGMessageInDB

  const isAction = message.isAdminMessage
  const senderUsername = users.find(u => u?.id === m.senderId)?.username
  const { mentionOffsets, mentionLengths, mentionIds, mentionTypes } = message
  const textAttributes = mapTextAttributes(message.text, { mentionOffsets, mentionLengths, mentionIds, mentionTypes })

  const text = message.text?.length > 0 ? (isAction ? message.text.replace(senderUsername, '{{sender}}') : message.text) : null
  const linkedMessageID = message.replySourceId?.startsWith('mid.') ? message.replySourceId : undefined

  const { attachments } = m
  let attachmentWithText: string
  const attachmentsWithMedia: Attachment[] = []
  let reelWithTitle: Attachment

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
        isSticker: true,
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
    textHeading: typeof textHeading === 'string' ? textHeading : undefined,
    textFooter: textFooter && textHeading !== textFooter ? textFooter : undefined,
    links: message.links,
    parseTemplate: isAction,
    textAttributes,
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
      const isSender = r.actorId === fbid
      extraMessages.push({
        id: `${mapped.id}-${r.actorId}`,
        timestamp: new Date(+r.timestampMs),
        senderID: r.actorId,
        isSender,
        text: `${isSender ? 'You' : '{{sender}}'} reacted with ${reactionKey}${truncated ? `: ${truncated}` : ''}`,
        action: {
          type: MessageActionType.MESSAGE_REACTION_CREATED,
          messageID: mapped.id,
          participantID: r.actorId,
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
export const mapMessages = (messages: QueryMessagesResult | QueryThreadsResult[0]['messages'], env: EnvKey, fbid: string, t?: QueryThreadsResult[0]): Message[] => {
  const sortedQueryMessages = messages.sort((m1, m2) => {
    if (m1.primarySortKey === m2.primarySortKey) return 0
    return m1.primarySortKey > m2.primarySortKey ? 1 : -1
  })

  // Find last message that is from sender (isSender === true)
  const lastMessageAsSender = sortedQueryMessages.slice().reverse().find(m => m.senderId === fbid)
  let lastSeen: MessageSeen = null

  if (lastMessageAsSender && lastMessageAsSender) {
    const thread = t || (('thread' in lastMessageAsSender) && lastMessageAsSender.thread) as QueryThreadsResult[0]
    const participants = thread?.participants || []
    const parsedThread = thread ? JSON.parse(thread.thread) as IGThreadInDB : null
    const threadType = parsedThread?.threadType === '1' ? 'single' : 'group'

    lastSeen = threadType === 'single'
      ? participants.find(p => p.userId !== fbid && p.readWatermarkTimestampMs >= lastMessageAsSender.timestampMs)?.readWatermarkTimestampMs
      : participants.reduce(
        (acc, p) => {
          if (p.readWatermarkTimestampMs >= lastMessageAsSender.timestampMs) acc[p.userId] = p.readWatermarkTimestampMs
          return acc
        },
        {} as Record<string, Date>,
      )
  }

  const mappedMessages = sortedQueryMessages.flatMap(m => mapMessage(m, env, fbid, t)).filter(Boolean)

  if (lastMessageAsSender && lastSeen) {
    mappedMessages.find(message => message.id === lastMessageAsSender.messageId).seen = lastSeen
  }

  return mappedMessages
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
    isArchived: env === 'IG' ? undefined : t.parentThreadKey === ParentThreadKey.ARCHIVE,
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

export async function mapUserMentions(
  db: DrizzleDB,
  text: MessageContent['text'],
  mentionedUserIDs: MessageContent['mentionedUserIDs'],
): Promise<{ [key: string]: string }> {
  // Query the database for mentioned users
  const mentionedUsers = await db.query.contacts.findMany({
    where: inArray(contacts.id, mentionedUserIDs),
  })

  // Prepare the result object
  const result: { [key: string]: string } = {
    mention_offsets: '',
    mention_lengths: '',
    mention_ids: '',
    mention_types: '',
  }

  // Process each mentioned user
  mentionedUsers.forEach(user => {
    const userMention = `@${user.name}`
    let offset = text.indexOf(userMention)

    while (offset !== -1) {
      // Add mention details to the result object
      result.mention_offsets += `${offset},`
      result.mention_lengths += `${user.name.length + 1},`
      result.mention_ids += `${user.id},`
      result.mention_types += 'p,'

      // Find next occurrence
      offset = text.indexOf(userMention, offset + userMention.length)
    }
  })

  // Remove the trailing commas
  Object.keys(result).forEach(key => {
    result[key] = result[key].slice(0, -1)
  })

  return result
}
