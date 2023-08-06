import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { resolve } from 'path'
import { rm } from 'fs/promises'
import * as schema from './schema'
import { sleep } from '../util'
import { getLogger } from '../logger'

const getDB = async (accountID: string, dataDirPath: string, retryAttempt = 0) => {
  const logger = getLogger('drizzle')
  const migrationsFolder = resolve(__dirname, '../drizzle')
  const sqlitePath = resolve(dataDirPath, `cache-${accountID}.db`)
  if (retryAttempt === 1) {
    logger.info(`Cleaning database at ${sqlitePath}`, { retryAttempt })
    await rm(sqlitePath)
  } else if (retryAttempt > 1) {
    throw new Error('Failed to initialize database')
  }
  logger.info(`Initializing database at ${sqlitePath}`, { migrationsFolder, retryAttempt })
  const sqlite = new Database(sqlitePath)
  const db = drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
        logger.info(query, { params }) // @TODO: maybe debug on prod?
      },
    },
  })
  try {
    migrate(db, { migrationsFolder })
  } catch (e) {
    logger.error('Error migrating database, creating a fresh one', e)
    return getDB(accountID, dataDirPath, retryAttempt + 1)
  }
  await sleep(100) // @TODO: need a better way to wait for migrations to finish
  return db
}

export type DrizzleDB = BetterSQLite3Database<typeof schema>

export default getDB
