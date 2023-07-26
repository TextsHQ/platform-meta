import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { resolve } from 'path'
import * as schema from './schema'
import { sleep } from '../util'
import { getLogger } from '../logger'

const getDB = async (name: string, dataDirPath: string) => {
  const logger = getLogger('drizzle')
  const migrationsFolder = resolve(__dirname, '../drizzle')
  const sqlitePath = resolve(dataDirPath, 'cache.db')
  logger.info(`Initializing database ${name} at ${sqlitePath} (migrations folder: ${migrationsFolder})`)
  const sqlite = new Database(sqlitePath)
  const db = drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
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
