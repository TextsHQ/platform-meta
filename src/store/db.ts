import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'
import { getLogger } from '../logger'
import type { EnvKey } from '../env'
import { MetaMessengerError } from '../errors'
import { DRIZZLE_DIR_PATH } from '../constants'

export type DrizzleDB = BetterSQLite3Database<typeof schema>

const getDB = async (env: EnvKey, accountID: string, dataDirPath: string, retryAttempt = 0): Promise<{
  db: DrizzleDB
  dbClose: () => Promise<void>
}> => {
  const logger = getLogger(env, 'drizzle')

  logger.info('initializing in-memory database', {
    accountID,
    retryAttempt,
  })

  try {
    const sqlite = new Database(':memory:')
    sqlite.pragma('journal_mode = WAL')
    const db = drizzle(sqlite, {
      schema,
      logger: {
        logQuery: (query, params) => {
          logger.debug(query, { params })
        },
      },
    })

    logger.debug('migrating database', { retryAttempt })

    migrate(db, {
      migrationsFolder: DRIZZLE_DIR_PATH,
    })

    return {
      db,
      dbClose: async () => {
        logger.debug('closing in-memory database')
        sqlite.close()
      },
    }
  } catch (err) {
    logger.error('error migrating database', {
      retryAttempt,
    }, err)

    if (retryAttempt > 1) {
      throw new MetaMessengerError(env, -1, 'error migrating database', `retryAttempt: ${retryAttempt}, error: ${err?.message || JSON.stringify(err)}`)
    }

    return getDB(env, accountID, dataDirPath, retryAttempt + 1)
  }
}

export default getDB
