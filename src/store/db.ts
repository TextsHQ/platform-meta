import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import type { Logger } from 'pino'
import * as schema from './schema'

const getDB = async (name: string, sqlitePath: string, parentLogger: Logger) => {
  const sqlite = new Database(sqlitePath)
  const logger = parentLogger.child({ name: `db:drizzle:${name}` })
  return drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
        logger.info(query, { params }) // @TODO: maybe debug on prod?
      },
    },
  })
}

export type DrizzleDB = BetterSQLite3Database<typeof schema>

export default getDB
