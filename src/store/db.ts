import { resolve } from 'path'
import { access, mkdir, unlink } from 'fs/promises'
import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { getLogger, type Logger } from '../logger'
import { migrations } from './migrations'
import type { EnvKey } from '../env'
import { MetaMessengerError } from '../errors'

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

const getDB = async (env: EnvKey, accountID: string, dataDirPath: string, retryAttempt = 0): Promise<DrizzleDB> => {
  const logger = getLogger(env, 'drizzle')
  await createDirectoryIfNotExists(dataDirPath, logger)
  const sqlitePath = resolve(dataDirPath, '.cache.db')

  logger.info('initializing database at', {
    accountID,
    sqlitePath,
  })

  try {
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

    logger.debug('migrating database', { sqlitePath, retryAttempt })
    await db.transaction(async tx => {
      for (const migration of migrations) {
        tx.run(migration)
      }
    })

    return db
  } catch (err) {
    logger.error('error migrating database', {
      sqlitePath,
      retryAttempt,
    }, err)

    if (retryAttempt > 1) {
      throw new MetaMessengerError(env, -1, 'error migrating database', `retryAttempt: ${retryAttempt}, error: ${err?.message || JSON.stringify(err)}`)
    }

    return getDB(env, accountID, dataDirPath, retryAttempt + 1)
  }
}

export default getDB
