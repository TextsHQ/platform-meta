import { asc, eq, inArray, sql } from 'drizzle-orm'
import { InboxName, Message } from '@textshq/platform-sdk'
import { AnySQLiteTable } from 'drizzle-orm/sqlite-core'

import type { DrizzleDB } from './db'
import { IGThreadInDB, messages as messagesSchema, threads as threadsSchema } from './schema'
import { mapMessages, mapParticipants, mapThread } from '../mappers'

export const queryThreads = async (db: DrizzleDB, threadIDs: string[] | 'ALL', fbid: string, inbox: InboxName.NORMAL | InboxName.REQUESTS | null = InboxName.NORMAL) => db.query.threads.findMany({
  ...(threadIDs !== 'ALL' && { where: inArray(threadsSchema.threadKey, threadIDs) }),
  columns: {
    folderName: true,
    lastActivityTimestampMs: true,
    threadKey: true,
    thread: true,
  },
  orderBy: [asc(threadsSchema.lastActivityTimestampMs)],
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
        raw: false,
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
            raw: false,
            attachmentFbid: true,
            attachment: true,
          },
        },
        reactions: true,
      },
      orderBy: [asc(messagesSchema.primarySortKey)],
    },
  },
}).map(t => mapThread(t, fbid)).filter(t => {
  if (inbox === null) return true
  return t.folderType === inbox
})

export function getThread(db: DrizzleDB, threadKey: string) {
  const t = db.query.threads.findFirst({
    where: eq(threadsSchema.threadKey, threadKey),
    columns: {
      threadKey: true,
      thread: true,
      lastActivityTimestampMs: true,
      folderName: true,
      // raw: true,
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
    },
  })

  if (!t) throw new Error(`Thread ${threadKey} not found`)

  return {
    ...t,
    thread: JSON.parse(t.thread) as IGThreadInDB,
  } as const
}

export type ThreadQueryResult = ReturnType<typeof getThread>

export const queryMessages = (db: DrizzleDB, threadKeyOrThread: string | ThreadQueryResult, messageIds: string[] | 'ALL', fbid: string): Message[] => {
  const t = typeof threadKeyOrThread === 'string' ? getThread(db, threadKeyOrThread) : threadKeyOrThread
  const messages = db.query.messages.findMany({
    where: messageIds === 'ALL' ? eq(messagesSchema.threadKey, t.threadKey) : inArray(messagesSchema.messageId, messageIds),
    columns: {
      // raw: true,
      message: true,
      threadKey: true,
      messageId: true,
      offlineThreadingId: true,
      primarySortKey: true,
      timestampMs: true,
      senderId: true,
    },
    with: {
      attachments: {
        columns: {
          raw: false,
          attachmentFbid: true,
          attachment: true,
        },
      },
      reactions: true,
      thread: {
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
        },
      },
    },
    orderBy: [asc(messagesSchema.primarySortKey)],

  })
  if (!messages || messages.length === 0) return []
  return mapMessages(messages, {
    threadType: t?.thread.threadType === '1' ? 'single' : 'group',
    users: mapParticipants(t.participants, fbid),
    participants: t.participants,
    fbid,
  })
}

const hasData = (db: DrizzleDB, table: AnySQLiteTable) => db.select({ count: sql<number>`count(*)` }).from(table).get().count > 0

export const hasSomeCachedData = (db: DrizzleDB) => ({
  hasThreads: hasData(db, threadsSchema),
  hasMessages: hasData(db, messagesSchema),
})
