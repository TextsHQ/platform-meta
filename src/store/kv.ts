import type Instagram from '../api'
import { keyValues } from './schema'

type Key = `cursor-${1 | 95}`
  | 'clientId'
  | 'fb_dtsg'
  | 'fbid'
  | 'igUserId'
  | 'lsd'
  | 'wwwClaim'
  | 'hasTabbedInbox'
  | `groupThreadsRange-${string}`
  | '_lastReceivedCursor' // not used, for debugging
  | '_viewerConfig' // not used, for debugging

type ValueType<K extends Key> =
  K extends 'hasTabbedInbox' ? boolean : string

type KeyValue = { [K in Key]: ValueType<K> }

function initializeAccumulator<T>(): T {
  return {} as T
}

function isKey(key: string): key is Key {
  return (initializeAccumulator<KeyValue>() as Record<string, unknown>)[key] !== undefined
}

function assignToAcc<K extends Key>(acc: KeyValue, key: K, value: ValueType<K>): void {
  acc[key] = value as KeyValue[K]
}

function serialize(value: ValueType<Key>) {
  return typeof value === 'boolean' ? JSON.stringify(value) : value
}

function deserialize<K extends Key>(key: K, value: string) {
  if (key === 'hasTabbedInbox') return JSON.parse(value) as ValueType<K>
  return value as ValueType<K>
}

export default class KeyValueStore {
  constructor(private readonly papi: Instagram) {}

  private cache = new Map<Key, ValueType<Key>>()

  set<K extends Key>(key: K, value: ValueType<K>) {
    const serializedValue = serialize(value)
    this.papi.db.insert(keyValues)
      .values({ key, value: serializedValue })
      .onConflictDoUpdate({ target: keyValues.key, set: { value: serializedValue } })
      .run()
    this.cache.set(key, value)
  }

  setMany(values: Partial<KeyValue>) {
    for (const [key, value] of Object.entries(values)) {
      this.set(key as Key, value as ValueType<Key>)
    }
  }

  get<K extends Key>(key: K, useCache = true): ValueType<K> | undefined {
    if (useCache && this.cache.has(key)) return this.cache.get(key) as ValueType<K>
    const _value = this.papi.preparedQueries.getKeyValue.get({ key })
    const value = deserialize(key, _value?.value || '')
    this.cache.set(key, value)
    return value
  }

  getAll(): KeyValue {
    const values = this.papi.preparedQueries.getAllKeyValues.all()
    return values.reduce<KeyValue>((acc, { key, value }) => {
      if (key === 'hasTabbedInbox') {
        assignToAcc(acc, key, JSON.parse(value) as ValueType<typeof key>)
      } else if (isKey(key)) {
        assignToAcc(acc, key, value as ValueType<typeof key>)
      }
      return acc
    }, initializeAccumulator<KeyValue>())
  }
}
