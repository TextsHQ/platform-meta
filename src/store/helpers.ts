import { asc, inArray, sql } from 'drizzle-orm'
import type { Participant, ThreadType } from '@textshq/platform-sdk'
import { InboxName } from '@textshq/platform-sdk'
import { AnySQLiteTable } from 'drizzle-orm/sqlite-core'

import type { DrizzleDB } from './db'
import { IGThreadInDB, messages, threads } from './schema'
import { mapMessages } from '../mappers'
import { getLogger } from '../logger'

const logger = getLogger('helpers')

export const queryThreads = async (db: DrizzleDB, threadIDs: string[] | 'ALL', fbid: string, inbox: InboxName.NORMAL | InboxName.REQUESTS | null = InboxName.NORMAL) => db.query.threads.findMany({
  ...(threadIDs !== 'ALL' && { where: inArray(threads.threadKey, threadIDs) }),
  columns: {
    folderName: true,
    lastActivityTimestampMs: true,
    threadKey: true,
    thread: true,
  },
  orderBy: [asc(threads.lastActivityTimestampMs)],
  with: {
    participants: {
      columns: {
        userId: true,
        isAdmin: true,
        readWatermarkTimestampMs: true,
      },
      with: {
        contacts: {
          columns: {
            id: true,
            name: true,
            username: true,
            profilePictureUrl: true,
          },
        },
      },
    },
    messages: {
      columns: {
        raw: true,
        threadKey: true,
        messageId: true,
        timestampMs: true,
        senderId: true,
        message: true,
        primarySortKey: true,
      },
      with: {
        attachments: {
          columns: {
            raw: true,
            attachmentFbid: true,
            attachment: true,
          },
        },
        reactions: true,
      },
      orderBy: [asc(messages.primarySortKey)],
    },
  },
}).map(t => {
  logger.debug(`queryThreads: ${t.threadKey}`, {
    t,
    thread: t.thread,
    tParsed: JSON.parse(t.thread),
  })
  const thread = JSON.parse(t.thread) as IGThreadInDB | null
  const isUnread = t.lastActivityTimestampMs?.getTime() > thread?.lastReadWatermarkTimestampMs
  let participants: Participant[] = t.participants.map(p => ({
    id: p.contacts.id,
    username: p.contacts.username,
    fullName: p.contacts.name,
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

  participants = participants.filter(p => !!p?.id)
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
    messages: {
      items: mapMessages(t.messages.sort((m1, m2) => {
        if (m1.primarySortKey === m2.primarySortKey) return 0
        return m1.primarySortKey > m2.primarySortKey ? 1 : -1
      }), {
        fbid,
        participants: t.participants,
        threadType,
        users: participants,
      }),
      hasMore: false,
    },
  } as const
}).filter(t => {
  if (inbox === null) return true
  return t.folderType === inbox
})

export const queryMessages = async (db: DrizzleDB, messageIds: string[] | 'ALL', fbid: string, threadKey: string) => {
  logger.debug('queryMessages', messageIds)
  const thread = await queryThreads(db, [threadKey], fbid)
  if (thread?.length === 0) return []
  const { messages: newMessages } = thread[0]
  return newMessages.items.filter(m => messageIds === 'ALL' || messageIds.includes(m.id))
}
const hasData = (db: DrizzleDB, table: AnySQLiteTable) => db.select({ count: sql<number>`count(*)` }).from(table).get().count > 0

export const hasSomeCachedData = async (db: DrizzleDB) => ({
  hasThreads: hasData(db, threads),
  hasMessages: hasData(db, messages),
})
