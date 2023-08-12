import { inArray } from 'drizzle-orm'
import type Instagram from '../api'
import { keyValues } from './schema'

type Key = `cursor-${1 | 95}`
| 'clientId'
| 'fb_dtsg'
| 'fbid'
| 'igUserId'
| 'lsd'
| 'wwwClaim'
| '_lastReceivedCursor' // not used, for debugging
| '_viewerConfig' // not used, for debugging

export default class KeyValueStore {
  constructor(private readonly papi: Instagram) {}

  private cache = new Map<Key, string>()

  set(key: Key, value: string) {
    this.papi.db.insert(keyValues)
      .values({ key, value })
      .onConflictDoUpdate({ target: keyValues.key, set: { value } })
      .run()
    this.cache.set(key, value)
  }

  setMany(values: Partial<Record<Key, string>>) {
    // this.papi.db.insert(keyValues)
    //   .values(Object.entries(values).map(([key, value]) => ({ key, value })))
    //   .onConflictDoUpdate({ target: keyValues.key, set: { value: keyValues.value } })
    //   .run()
    for (const [key, value] of Object.entries(values)) {
      this.set(key as Key, value)
    }
  }

  get(key: Key, useCache = true) {
    if (useCache && this.cache.has(key)) return this.cache.get(key)
    const _value = this.papi.preparedQueries.getKeyValue.get({ key })
    const value = _value?.value
    this.cache.set(key, value)
    return value
  }

  getAll() {
    const values = this.papi.preparedQueries.getAllKeyValues.all()
    return Object.fromEntries(values.map(({ key, value }) => [key, value])) as Record<Key, string>
  }

  getSome(keys: Key[]) {
    const values = this.papi.db.select({ value: keyValues.value })
      .from(keyValues)
      .where(inArray(keyValues.key, keys))
      .run()
    return Object.fromEntries(values.map(({ key, value }) => [key, value])) as Record<Key, string>
  }
}
