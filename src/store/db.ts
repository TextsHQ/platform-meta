import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
// import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import type { Logger } from 'pino'
import * as schema from './schema'

const getDB = async (name: string, sqlitePath: string, parentLogger: Logger) => {
  const sqlite = new Database('/Users/rahulvaidun/Texts/test.db')
  const logger = parentLogger.child({ name: `db:drizzle:${name}` })
  const db = drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
        logger.info(query, { params }) // @TODO: maybe debug on prod?
      },
    },
  })
  // await migrate(db, { migrationsFolder: '/Users/rahulvaidun/Texts/platform-instagram/drizzle' })
  return db
}

export const cache = {}

export type DrizzleDB = BetterSQLite3Database<typeof schema>

export default getDB
