import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import type { Logger } from 'pino'
import * as schema from './schema'

const getDB = async (name: string, sqlitePath: string, logger: Logger) => {
  const sqlite = new Database(sqlitePath)
  return drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
        logger.debug('drizzle(ig)', query, { params })
      },
    },
  })
}

export type DrizzleDB = BetterSQLite3Database<typeof schema>

export default getDB
