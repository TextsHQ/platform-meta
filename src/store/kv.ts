import type Instagram from '../api'
import { keyValues } from './schema'

type Key = 'lastCursor' | 'authMethod'

export default class KeyValueStore {
  constructor(private readonly papi: Instagram) {}

  set(key: Key, value: string) {
    this.papi.db.insert(keyValues)
      .values({ key, value })
      .onConflictDoUpdate({ target: keyValues.key, set: { value } })
      .run()
  }

  get(key: Key) {
    const value = this.papi.preparedQueries.getKeyValue.get({ key })
    return value?.value
  }

  getAll() {
    const values = this.papi.preparedQueries.getAllKeyValues.all()
    return Object.fromEntries(values.map(({ key, value }) => [key, value])) as Record<Key, string>
  }
}
