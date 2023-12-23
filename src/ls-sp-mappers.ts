import { SimpleArgType } from './ls-parser'
import { SyncChannel } from './types'

export function executeFirstBlockForSyncTransaction(a: SimpleArgType[]) {
  return {
    databaseId: a[0] as string,
    epochId: a[1] as string,
    currentCursor: a[2] as string,
    nextCursor: a[3] as string,
    syncStatus: a[4] as string,
    sendSyncParams: a[5] as string,
    minTimeToSyncTimestampMs: a[6] as number,
    canIgnoreTimestamp: a[7] as string,
    syncChannel: a[8] as SyncChannel,
  }
}
