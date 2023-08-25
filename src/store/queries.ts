import { asc, desc, eq, placeholder } from 'drizzle-orm'
import type { DrizzleDB } from './db'
import * as s from './schema'
import { messages as messagesSchema, threads as threadsSchema } from './schema'
import type { QueryMessagesArgs, QueryThreadsArgs } from './helpers'

// "sometimes Drizzle ORM you can go faster than better-sqlite3 driver"
// https://orm.drizzle.team/docs/performance

export async function queryThreads(db: DrizzleDB, args: Partial<Pick<QueryThreadsArgs, 'orderBy' | 'limit' | 'where'>> = {}) {
  const threads = await db.query.threads.findMany({
    columns: {
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
    orderBy: [desc(messagesSchema.primarySortKey)],
    ...args,
  })
  if (!messages || messages.length === 0) return []
  return messages
}

export type QueryMessagesResult = Awaited<ReturnType<typeof queryMessages>>

export function preparedQueries(db: DrizzleDB) {
  return {
    getAllKeyValues: db.select().from(s.keyValues).prepare(),
    getKeyValue: db.select({
      value: s.keyValues.value,
    }).from(s.keyValues).where(eq(s.keyValues.key, placeholder('key'))).prepare(),
    getContact: db
      .select({
        id: s.contacts.id,
        profilePictureUrl: s.contacts.profilePictureUrl,
        name: s.contacts.name,
        username: s.contacts.username,
        contact: s.contacts.contact,
      })
      .from(s.contacts)
      .limit(1)
      .where(eq(s.contacts.id, placeholder('contactId')))
      .prepare(),
  } as const
}
