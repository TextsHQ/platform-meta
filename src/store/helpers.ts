import type { DrizzleDB } from './db'

export type QueryMessagesArgs = Parameters<DrizzleDB['query']['messages']['findMany']>[0]

export enum QueryWhereSpecial {
  ALL,
  NEWEST,
  OLDEST,
}

export type QueryThreadsArgs = Parameters<DrizzleDB['query']['threads']['findMany']>[0]
