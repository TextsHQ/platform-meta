import { texts } from '@textshq/platform-sdk'
import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { resolve } from 'path'
import * as schema from './schema'
import { sleep } from '../util'
import type { LoggerInstance } from '../logger'

const getDB = async (name: string, dataDirPath: string, parentLogger: LoggerInstance) => {
  const migrationsFolder = resolve(__dirname, '../drizzle')
  const sqlitePath = resolve(dataDirPath, 'cache.db')
  texts.log(`Initializing database ${name} at ${sqlitePath} (migrations folder: ${migrationsFolder})`)
  const sqlite = new Database(sqlitePath)
  const logger = parentLogger.child({ name: `db:drizzle:${name}` })
  const db = drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
        texts.log(`IGDB ${query} ${JSON.stringify(params)}`)
        logger.info(query, { params }) // @TODO: maybe debug on prod?
      },
    },
  })
  migrate(db, { migrationsFolder })
  await sleep(100) // @TODO: need a better way to wait for migrations to finish
  return db
}

export type DrizzleDB = BetterSQLite3Database<typeof schema>

export default getDB
