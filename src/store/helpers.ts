import { asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { InboxName } from '@textshq/platform-sdk'
import { AnySQLiteTable } from 'drizzle-orm/sqlite-core'

import type { DrizzleDB } from './db'
import { IGThreadInDB, messages as messagesSchema, threads as threadsSchema } from './schema'
import { mapThread } from '../mappers'

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

export type QueryMessagesArgs = Parameters<DrizzleDB['query']['messages']['findMany']>[0]

const hasData = (db: DrizzleDB, table: AnySQLiteTable) => db.select({ count: sql<number>`count(*)` }).from(table).get().count > 0

export const hasSomeCachedData = (db: DrizzleDB) => ({
  hasThreads: hasData(db, threadsSchema),
  hasMessages: hasData(db, messagesSchema),
})
