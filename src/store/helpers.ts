import { AnySQLiteTable } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

import type { DrizzleDB } from './db'
import { messages, threads } from './schema'

const hasData = (db: DrizzleDB, table: AnySQLiteTable) => db.select({ count: sql<number>`count(*)` }).from(table).get().count > 0

export const hasSomeCachedData = async (db: DrizzleDB) => ({
  hasThreads: hasData(db, threads),
  hasMessages: hasData(db, messages),
})

export const FOREVER = 4117219200000 // 2100-06-21T00:00:00.000Z
