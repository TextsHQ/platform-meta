import type PlatformAPI from './api'
import { DatabaseSyncQuery, DatabaseQueryMetadata, SyncChannel } from './types'
import { getTimeValues, metaJSONStringify } from './util'
import { DefaultDatabaseQueries } from './constants'
import { executeFirstBlockForSyncTransaction } from './ls-sp-mappers'

export default class SyncManager {
  store = new Map<number, DatabaseQueryMetadata>(DefaultDatabaseQueries)

  constructor(private readonly papi: PlatformAPI) {}

  async ensureSyncedSocket(databases: number[]) {
    for (const db of databases) {
      const queryData = this.store.get(db)
      if (!queryData) continue
      let requestType: number
      const { epoch_id } = getTimeValues(this.papi.socket.requestIds)
      const payload: DatabaseSyncQuery = {
        database: queryData.databaseId,
        version: this.papi.api.config.syncData.version,
        epoch_id,
        sync_params: null,
        failure_count: null,
        last_applied_cursor: null,
      }

      if (queryData.sendSyncParams) {
        requestType = 1
        payload.sync_params = this.getSyncParams(queryData.syncChannel)
      } else {
        requestType = 2
        payload.last_applied_cursor = queryData.lastAppliedCursor
      }
      /*
        TODO:
        only use one parser for each response while syncing, since the LightSpeedDataTable in the LightSpeedParser class
        stores all the dependencies/schemas in individual arrays it would be much more efficient to use a single class.
        const parser = new LightSpeedParser()
      */
      let res = await this.papi.socket.publishLightspeedRequest({
        payload: metaJSONStringify(payload),
        type: requestType,
      }, { waitForResponse: true })
      let transactions = res.executeFirstBlockForSyncTransaction
      let { currentCursor, nextCursor } = transactions[0]
      while (currentCursor !== nextCursor && nextCursor) {
        payload.last_applied_cursor = nextCursor
        res = await this.papi.socket.publishLightspeedRequest({
          payload: metaJSONStringify(payload),
          type: requestType,
        }, { waitForResponse: true })
        transactions = res.executeFirstBlockForSyncTransaction
        currentCursor = transactions[0].currentCursor
        nextCursor = transactions[0].nextCursor
        this.papi.logger.debug(`[DATABASE-SYNC-${db}] ${currentCursor}->${nextCursor} (done=${currentCursor === nextCursor})`)
      }
      for (const [k, v] of Object.entries(res)) {
        this.papi.logger.debug('synced data:', k, v)
      }
    }
  }

  getQuery(databaseId: number) {
    return this.store.get(databaseId)
  }

  getSyncParams(ch: SyncChannel) {
    if (ch === SyncChannel.MAILBOX) {
      return this.papi.api.config.syncParams.mailbox
    }
    if (ch === SyncChannel.CONTACT) {
      return JSON.stringify(this.papi.api.config.syncParams.contact)
    }
  }

  update(query: DatabaseQueryMetadata, overwrite: boolean) {
    if (overwrite) {
      this.store.set(query.databaseId, query)
    } else {
      this.store.set(query.databaseId, Object.assign(this.store.get(query.databaseId), query))
    }
  }

  updateMany(queries: DatabaseQueryMetadata[], overwrite: boolean) {
    for (const query of queries) {
      this.update(query, overwrite)
    }
  }

  syncTransaction(transaction: ReturnType<typeof executeFirstBlockForSyncTransaction>) {
    this.papi.logger.debug('synced transaction:', transaction)
    this.update({
      databaseId: Number(transaction.databaseId),
      sendSyncParams: transaction.sendSyncParams,
      lastAppliedCursor: transaction.nextCursor,
      syncChannel: Number(transaction.syncChannel),
    }, false)
  }
}
