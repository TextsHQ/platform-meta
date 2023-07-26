import { texts } from '@textshq/platform-sdk'
import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import type { Logger } from 'pino'
import { resolve } from 'path'
import * as schema from './schema'

const getDB = async (name: string, sqlitePath: string, parentLogger: Logger) => {
  // resolve the path of ../drizzle
  const migrationsFolder = resolve(__dirname, '../drizzle')
  texts.log(`Initializing database ${name} at ${sqlitePath} (migrations folder: ${migrationsFolder})`)
  const sqlite = new Database(sqlitePath)
  const logger = parentLogger.child({ name: `db:drizzle:${name}` })
  const db = drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
        logger.info(query, { params }) // @TODO: maybe debug on prod?
      },
    },
  })
  migrate(db, { migrationsFolder })
  return db
}

export type DrizzleDB = BetterSQLite3Database<typeof schema>

export default getDB
