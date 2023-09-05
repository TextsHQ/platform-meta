import type Instagram from '../api'
import { keyValues } from './schema'
import { ParentThreadKey, SyncGroup } from '../mm-types'

type DbId = number

type Key =
  | '_fullConfig' // not used, for debugging
  | 'appId'
  | 'clientId'
  | 'fb_dtsg'
  | 'fbid'
  | 'hasTabbedInbox'
  | 'igUserId'
  | 'lsd'
  | 'mqttCapabilities'
  | 'mqttClientCapabilities'
  | 'wwwClaim'
  | `_lastReceivedCursor-${DbId}-${SyncGroup}` // not used, for debugging
  | `cursor-${DbId}-${SyncGroup}`
  | `syncParams-${SyncGroup}`
  | `threadsRanges-${SyncGroup}-${ParentThreadKey}`

const CACHED_KEYS = [
  'appId',
  'clientId',
  'fb_dtsg',
  'fbid',
  'hasTabbedInbox',
  'igUserId',
  'lsd',
  'mqttCapabilities',
  'mqttClientCapabilities',
  'syncParams-1',
  'syncParams-95',
  'wwwClaim',
] as const

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

export function includesKey<T extends string>(array: readonly T[], item: string): item is T {
  return array.includes(item as T)
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
    if (includesKey(CACHED_KEYS, key)) this.cache.set(key, value)
  }

  setMany(values: Partial<KeyValue>) {
    for (const [key, value] of Object.entries(values)) {
      this.set(key as Key, value as ValueType<Key>)
    }
  }

  get<K extends Key>(key: K) {
    const useCache = includesKey(CACHED_KEYS, key)
    if (useCache && this.cache.has(key)) {
      const cachedValue = this.cache.get(key) as ValueType<K>
      if (
        (typeof cachedValue === 'string' && cachedValue.length > 0)
        || typeof cachedValue === 'boolean'
      ) return cachedValue
    }
    const _value = this.papi.preparedQueries.getKeyValue.get({ key })
    const value = deserialize(key, _value?.value || '')
    if (useCache) this.cache.set(key, value)
    if (typeof value === 'string' && value.length === 0) return undefined
    return value as ValueType<K>
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
