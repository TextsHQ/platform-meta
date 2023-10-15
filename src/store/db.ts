import { resolve } from 'path'
import { access, mkdir, unlink } from 'fs/promises'
import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'
import { getLogger, type Logger } from '../logger'
import { migrations } from './migrations.generated'
import type { EnvKey } from '../env'
import EnvOptions from '../env'
import { MetaMessengerError } from '../errors'
import { DBType, MigrateStrategy } from './helpers'
import { DRIZZLE_DIR_PATH } from '../constants'

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

const getDB = async (env: EnvKey, accountID: string, dataDirPath: string, retryAttempt = 0): Promise<{
  db: DrizzleDB
  dbClose: () => Promise<void>
}> => {
  const logger = getLogger(env, 'drizzle')
  const sqlitePath = resolve(dataDirPath, '.cache.db')

  const { migrationStrategy, dbType } = EnvOptions[env]

  let shouldRemoveDBFile = false
  if (dbType === DBType.PERSISTENT) {
    await createDirectoryIfNotExists(dataDirPath, logger)
    if ([MigrateStrategy.RECREATE_DRIZZLE, MigrateStrategy.RECREATE_SIMPLE].includes(migrationStrategy)) {
      shouldRemoveDBFile = true
    }
  }

  logger.info('initializing database at', {
    isPersistent: dbType === DBType.PERSISTENT,
    accountID,
    sqlitePath,
    migrationStrategy,
    retryAttempt,
    shouldRemoveDBFile,
  })

  try {
    if (retryAttempt > 0 || shouldRemoveDBFile) await removeDatabaseFile(sqlitePath, logger)
    const sqlite = new Database(sqlitePath)
    sqlite.pragma('journal_mode = WAL')
    const db = drizzle(sqlite, {
      schema,
      logger: {
        logQuery: (query, params) => {
          logger.debug(query, { params })
        },
      },
    })

    logger.debug('migrating database', { sqlitePath, retryAttempt, migrationStrategy })

    switch (migrationStrategy as MigrateStrategy) {
      case MigrateStrategy.RECREATE_SIMPLE:
        db.transaction(tx => {
          for (const migration of migrations) {
            tx.run(migration)
          }
        })
        break
      // case MigrateStrategy.RECREATE_DROP:
      //   for (const tableName of tableNames) {
      //     db.run(sql`drop table if exists \`${tableName}\``)
      //   }
      //   await db.transaction(async tx => {
      //     for (const migration of migrations) {
      //       tx.run(migration)
      //     }
      //   })
      //   break
      case MigrateStrategy.DRIZZLE:
      case MigrateStrategy.RECREATE_DRIZZLE:
        migrate(db, {
          migrationsFolder: DRIZZLE_DIR_PATH,
        })
        break
      default: break
    }

    return {
      db,
      dbClose: async () => {
        logger.debug('closing database', { sqlitePath })
        sqlite.close()
        if (shouldRemoveDBFile) await removeDatabaseFile(sqlitePath, logger)
      },
    }
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
