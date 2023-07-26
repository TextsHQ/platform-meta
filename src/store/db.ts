import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import type { Logger } from 'pino'
import { resolve, dirname } from 'path'
import * as schema from './schema'

const getDB = async (name: string, sqlitePath: string, parentLogger: Logger) => {
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
  migrate(db, { migrationsFolder: resolve(dirname(__filename), './drizzle') })
  return db
}

export type DrizzleDB = BetterSQLite3Database<typeof schema>

export default getDB
