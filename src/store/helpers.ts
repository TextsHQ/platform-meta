import { asc, inArray } from 'drizzle-orm'
import type { Participant, ThreadFolderName, ThreadType } from '@textshq/platform-sdk'

import { InboxName } from '@textshq/platform-sdk/dist/enums'
import type { DrizzleDB } from './db'
import { IGThreadInDB, threads, messages } from './schema'
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
  const isUnread = thread?.lastActivityTimestampMs > thread?.lastReadWatermarkTimestampMs
  const participants: Participant[] = t.participants.map(p => ({
    id: p.contacts.id,
    username: p.contacts.username,
    fullName: p.contacts.name,
    imgURL: p.contacts.profilePictureUrl,
    isSelf: p.contacts.id === fbid,
    displayText: p.contacts.name,
    hasExited: false,
    isAdmin: Boolean(p.isAdmin),
  }))

  const threadType: ThreadType = thread?.threadType === '1' ? 'single' : 'group'
  const folderType: ThreadFolderName = thread?.folderName === 'inbox' ? InboxName.NORMAL : InboxName.REQUESTS
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
    title: threadType === 'group' && thread?.threadName,
    isUnread,
    folderType,
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
  }
})

export const queryMessages = async (db: DrizzleDB, messageIds: string[] | 'ALL', fbid: string, threadKey: string) => {
  logger.debug('queryMessages', messageIds)
  const thread = await queryThreads(db, [threadKey], fbid)
  if (thread?.length === 0) return []
  const { messages: newMessages } = thread[0]
  return newMessages.items.filter(m => messageIds === 'ALL' || messageIds.includes(m.id))
}
