import { inArray } from 'drizzle-orm'
import type { Participant, ThreadType } from '@textshq/platform-sdk'

import type { DrizzleDB } from './db'
import { IGThreadInDB, threads } from './schema'
import { mapMessages } from '../mappers'
import { getLogger } from '../logger'

const logger = getLogger('helpers')

export const queryThreads = async (db: DrizzleDB, threadIDs: string[] | 'ALL', fbid: string) => db.query.threads.findMany({
  ...(threadIDs !== 'ALL' && { where: inArray(threads.threadKey, threadIDs) }),
  columns: {
    threadKey: true,
    thread: true,
  },
  with: {
    participants: {
      with: {
        users: {
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
      },
      with: {
        attachments: {
          columns: {
            attachmentFbid: true,
            attachment: true,
          },
        },
        reactions: true,
      },
    },
  },
}).map(t => {
  logger.debug(`queryThreads: ${t.threadKey}`, {
    t,
    thread: t.thread,
    tParsed: JSON.parse(t.thread),
  })
  const thread = JSON.parse(t.thread) as IGThreadInDB | null
  const isUnread = thread?.lastActivityTimestampMs > thread?.lastReadWatermarkTimestampMs
  const participants: Participant[] = t.participants.map(p => ({
    id: p.users.id,
    username: p.users.username,
    fullName: p.users.name,
    imgURL: p.users.profilePictureUrl,
    isSelf: p.users.id === fbid,
    displayText: p.users.name,
    hasExited: false,
  }))

  const type: ThreadType = thread?.threadType === '1' ? 'single' : 'group'
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
    id: t.threadKey,
    title: thread?.threadType !== '1' && thread?.threadName,
    isUnread,
    // ...mutedUntil && { mutedUntil },
    isReadOnly: false,
    imgURL: thread?.threadPictureUrl,
    type,
    participants: {
      items: participants,
      hasMore: false,
    },
    messages: {
      items: mapMessages(t.messages, fbid, t.participants, type),
      hasMore: false,
    },
  }
})

export const queryMessages = async (db: DrizzleDB, messageIds: string[] | 'ALL', fbid: string, threadKey: string) => {
  logger.debug('queryMessages', messageIds)
  const thread = await queryThreads(db, [threadKey], fbid)
  const { messages: newMessages } = thread[0]
  return newMessages.items.filter(m => messageIds === 'ALL' || messageIds.includes(m.id))
}

export const FOREVER = 4117219200000 // 2100-06-21T00:00:00.000Z
