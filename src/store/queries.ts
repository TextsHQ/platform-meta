import { asc, desc } from 'drizzle-orm'
import type { DrizzleDB } from './db'
import { messages as messagesSchema, threads as threadsSchema } from './schema'
import type { QueryMessagesArgs, QueryThreadsArgs } from './helpers'

// "sometimes Drizzle ORM you can go faster than better-sqlite3 driver"
// https://orm.drizzle.team/docs/performance

export async function queryThreads(db: DrizzleDB, args: Partial<Pick<QueryThreadsArgs, 'orderBy' | 'limit' | 'where'>> = {}) {
  const threads = await db.query.threads.findMany({
    columns: {
      folderName: true,
      parentThreadKey: true,
      lastActivityTimestampMs: true,
      threadKey: true,
      thread: true,
      ranges: true,
    },
    orderBy: [asc(threadsSchema.lastActivityTimestampMs)],
    with: {
      participants: {
        columns: {
          userId: true,
          isAdmin: true,
          readWatermarkTimestampMs: true,
          readActionTimestampMs: true,
        },
        with: {
          contacts: {
            columns: {
              id: true,
              name: true,
              username: true,
              profilePictureUrl: true,
              igContact: true,
            },
          },
        },
      },
      messages: {
        columns: {
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
              attachmentFbid: true,
              attachment: true,
            },
          },
          reactions: true,
        },
        orderBy: [desc(messagesSchema.primarySortKey)],
        limit: 1,
      },
    },
    ...args,
  })
  if (!threads || threads.length === 0) return []
  return threads
}

export type QueryThreadsResult = Awaited<ReturnType<typeof queryThreads>>

export async function queryMessages(db: DrizzleDB, args: Partial<Pick<QueryMessagesArgs, 'orderBy' | 'limit' | 'where'>> = {}) {
  const messages = await db.query.messages.findMany({
    columns: {
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
              readActionTimestampMs: true,
            },
            with: {
              contacts: {
                columns: {
                  id: true,
                  name: true,
                  username: true,
                  profilePictureUrl: true,
                  igContact: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [desc(messagesSchema.primarySortKey)],
    ...args,
  })
  if (!messages || messages.length === 0) return []
  return messages
}

export type QueryMessagesResult = Awaited<ReturnType<typeof queryMessages>>
