export type SyncSchemas = |
executeFirstBlockForSyncTransaction
| executeFinallyBlockForSyncTransaction
| upsertSyncGroupThreadsRange
| truncateTablesForSyncGroup
| mciTraceLog

export interface mciTraceLog {
  unknownValue: bigint
  mciTraceUnsampledEventTraceId: string
  unknownValue2: any
  unknownValue3: bigint
  unknownValue4: any
  dataScriptExecute: string
  unknownValue5: any
}

export interface executeFirstBlockForSyncTransaction {
  databaseId: bigint
  epochId: bigint
  currentCursor: string | null
  nextCursor: string | null
  syncStatus: bigint
  sendSyncParams: boolean
  minTimeToSyncTimestampMs: bigint
  canIgnoreTimestamp: boolean
  syncChannel: bigint
  unknownValue: any
}

export interface executeFinallyBlockForSyncTransaction {
  shouldFlush: boolean
  syncDatabaseId: bigint
  epochId: bigint
}

export interface truncateTablesForSyncGroup {
  syncGroup: bigint
}

export interface upsertSyncGroupThreadsRange {
  syncGroup: bigint
  parentThreadKey: bigint
  minLastActivityTimestampMs: bigint
  hasMoreBefore: boolean
  isLoadingBefore: boolean
  minThreadKey: bigint
}
