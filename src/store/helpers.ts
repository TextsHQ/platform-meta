import type { DrizzleDB } from './db'

export type QueryMessagesArgs = Parameters<DrizzleDB['query']['messages']['findMany']>[0]

export enum QueryWhereSpecial {
  ALL,
  NEWEST,
  OLDEST,
}

export type QueryThreadsArgs = Parameters<DrizzleDB['query']['threads']['findMany']>[0]

export enum MigrateStrategy {
  /**
   * Recreates the database file and applies migrations.ts.
   */
  RECREATE_SIMPLE,

  /**
   * Recreates the database file and uses Drizzle's migration system.
   */
  RECREATE_DRIZZLE,

  /**
   * Uses Drizzle's migration system.
   */
  DRIZZLE,
}
