import { resolve } from 'path'
import { access, mkdir, unlink } from 'fs/promises'
import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
// import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'
import { getLogger, Logger } from '../logger'
import { migrations } from './migrations'
import type { EnvKey } from '../env'

// const logger = getLogger('meta', 'drizzle')
const migrationsFolder = resolve(__dirname, '../drizzle')

export type DrizzleDB = BetterSQLite3Database<typeof schema>

async function createDirectoryIfNotExists(dataDirPath: string, logger: Logger) {
  try {
    await access(dataDirPath)
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await mkdir(dataDirPath, { recursive: true })
      } catch (err) {
        logger.error('error occurred while creating the db directory', { dataDirPath }, err)
      }
    } else {
      logger.error('error occurred while accessing the db directory', { dataDirPath }, error)
    }
  }
}

async function removeDatabaseFile(sqlitePath: string, logger: Logger) {
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

async function migrateDatabase(db: DrizzleDB, sqlitePath: string, logger: Logger, retryAttempt = 0): Promise<void> {
  try {
    logger.debug('migrating database', { sqlitePath, retryAttempt })
    for (const migration of migrations) {
      await db.run(migration)
    }
  } catch (e) {
    logger.error('error migrating database', {
      sqlitePath,
      retryAttempt,
    }, e)
    if (retryAttempt === 1) {
      await removeDatabaseFile(sqlitePath, logger)
    }
    if (retryAttempt > 1) {
      throw new Error(e)
    }
    return migrateDatabase(db, sqlitePath, logger, retryAttempt + 1)
  }
}

const getDB = async (env: EnvKey, accountID: string, dataDirPath: string) => {
  const logger = getLogger(env, 'drizzle')
  await createDirectoryIfNotExists(dataDirPath, logger)
  const sqlitePath = resolve(dataDirPath, '.cache.db')

  logger.info('initializing database at', {
    accountID,
    migrationsFolder,
    sqlitePath,
  })

  await removeDatabaseFile(sqlitePath, logger)

  const sqlite = new Database(sqlitePath)
  const db = drizzle(sqlite, {
    schema,
    logger: {
      logQuery: (query, params) => {
        logger.debug(query, { params })
      },
    },
  })

  await migrateDatabase(db, sqlitePath, logger)
  return db
}

export default getDB
