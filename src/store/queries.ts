import { eq, placeholder } from 'drizzle-orm'
import type { DrizzleDB } from './db'
import { keyValues } from './schema'

// "sometimes Drizzle ORM you can go faster than better-sqlite3 driver"
// https://orm.drizzle.team/docs/performance

export function preparedQueries(db: DrizzleDB) {
  return {
    getAllKeyValues: db.select().from(keyValues).prepare(),
    getKeyValue: db.select({
      value: keyValues.value,
    }).from(keyValues).where(eq(keyValues.key, placeholder('key'))).prepare(),
  } as const
}
