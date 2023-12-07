import { asc, desc, eq, like, sql } from 'drizzle-orm'
import type { DrizzleDB } from './db'
import * as schema from './schema'
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

export function preparedQueries(db: DrizzleDB) {
  return {
    getAllKeyValues: db.select().from(schema.keyValues).prepare(),
    getKeyValue: db.select({
      value: schema.keyValues.value,
    }).from(schema.keyValues).where(eq(schema.keyValues.key, sql.placeholder('key'))).prepare(),
    getThreadsRanges: db.select().from(schema.keyValues).where(like(schema.keyValues.key, 'threadsRanges-%')).prepare(),
    getThreadsRangesV2: db.select().from(schema.keyValues).where(like(schema.keyValues.key, 'threadsRangesV2-%')).prepare(),
    getFilteredThreadsRanges: db.select().from(schema.keyValues).where(like(schema.keyValues.key, 'filteredThreadsRanges-%')).prepare(),
    getContact: db
      .select({
        id: schema.contacts.id,
        profilePictureUrl: schema.contacts.profilePictureUrl,
        name: schema.contacts.name,
        username: schema.contacts.username,
        contact: schema.contacts.contact,
      })
      .from(schema.contacts)
      .limit(1)
      .where(eq(schema.contacts.id, sql.placeholder('contactId')))
      .prepare(),
  } as const
}
