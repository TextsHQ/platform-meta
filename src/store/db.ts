import { resolve } from 'path'
import { unlink, access, mkdir } from 'fs/promises'
import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import { texts } from '@textshq/platform-sdk'
import * as schema from './schema'
import { sleep } from '../util'
import { getLogger } from '../logger'

const logger = getLogger('drizzle')
const migrationsFolder = resolve(__dirname, '../drizzle')

export type DrizzleDB = BetterSQLite3Database<typeof schema>

async function createDirectoryIfNotExists(dataDirPath: string) {
  try {
    await access(dataDirPath)
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await mkdir(dataDirPath, { recursive: true })
      } catch (err) {
        logger.error('error occurred while creating the directory:', dataDirPath, error)
      }
    } else {
      logger.error('error occurred while accessing the directory:', dataDirPath, error)
    }
  }
}

async function removeDatabaseFile(sqlitePath: string) {
  try {
    logger.warn('removing database file', { sqlitePath })
    await unlink(sqlitePath)
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('database file does not exist', { sqlitePath })
    } else {
      logger.error('error occurred while removing the database file', { sqlitePath }, error)
    }
  }
}

async function migrateDatabase(db: DrizzleDB, sqlitePath: string, retryAttempt = 0) {
  try {
    logger.debug('migrating database', { sqlitePath, retryAttempt })
    migrate(db, { migrationsFolder })
    await sleep(200) // @TODO: need a better way to wait for migrations to finish, `migrate` should be sync but it isn't
  } catch (e) {
    console.error(e)
    logger.error('error migrating database', e.toString())
    texts.Sentry.captureException(e)
    if (retryAttempt === 1) {
      await removeDatabaseFile(sqlitePath)
    }
    if (retryAttempt > 1) {
      throw new Error(e)
    }
    return migrateDatabase(db, sqlitePath, retryAttempt + 1)
  }
}

const getDB = async (accountID: string, dataDirPath: string, cleanStart = false) => {
  await createDirectoryIfNotExists(dataDirPath)
  const sqlitePath = resolve(dataDirPath, '.cache.db')

  logger.info('initializing database at', { accountID, migrationsFolder, sqlitePath, cleanStart })

  if (cleanStart) await removeDatabaseFile(sqlitePath)

  const sqlite = new Database(sqlitePath)
  const db = drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
        logger.debug(query, { params })
      },
    },
  })

  await migrateDatabase(db, sqlitePath)
  return db
}

export default getDB
