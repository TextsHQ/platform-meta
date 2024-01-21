import { eq, like } from 'drizzle-orm'
import type PlatformAPI from '../api'
import { keyValues } from './schema'
import { type MetaThreadRanges, ParentThreadKey, SyncChannel } from '../types'
import { MM_DEFAULT_VALUES } from '../defaults'
import * as schema from './schema'

type DbId = string

type ThreadRangesFolderName = string
type ThreadRangesParentThreadKey = string
type ThreadRangesThreadRangeFilter = string

export type Key =
  | '_fullConfig' // not used, for debugging
  | 'wwwClaim'
  | `cursor-${DbId}`
  | `cursor-${DbId}-${SyncChannel}`
  | `threadsRanges-${SyncChannel}-${ParentThreadKey}`
  | `threadsRangesV2-${string}-${ParentThreadKey}`
  | `filteredThreadsRanges-${ThreadRangesFolderName}-${ThreadRangesParentThreadKey}-${ThreadRangesThreadRangeFilter}` // meta calls it v3

const CACHED_KEYS = [
  'wwwClaim',
] as const

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ValueType<K extends Key> = string

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
  return value as ValueType<K>
}

export function includesKey<T extends string>(array: readonly T[], item: string): item is T {
  return array.includes(item as T)
}

export default class KeyValueStore {
  constructor(private readonly papi: PlatformAPI) {}

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
    const _value = this.papi.db.select({
      value: schema.keyValues.value,
    }).from(schema.keyValues).where(eq(schema.keyValues.key, key)).get()
    const value = deserialize(key, _value?.value || '')
    if (useCache) this.cache.set(key, value)
    if (typeof value === 'string' && value.length === 0) return undefined
    return value as ValueType<K>
  }

  getAll(): KeyValue {
    const values = this.papi.db.select().from(schema.keyValues).all()
    return values.reduce<KeyValue>((acc, { key, value }) => {
      if (isKey(key)) {
        assignToAcc(acc, key, value as ValueType<typeof key>)
      }
      return acc
    }, initializeAccumulator<KeyValue>())
  }

  getThreadsRanges() {
    return this.papi.db.select().from(schema.keyValues)
      .where(like(schema.keyValues.key, 'threadsRanges-%'))
      .all()
      .map(range => ({
        key: range.key,
        value: {
          ...MM_DEFAULT_VALUES.sync_group_threads_ranges,
          ...(range.value ? JSON.parse(range.value) : {}),
        } as MetaThreadRanges,
      }))
  }

  getThreadsRangesV2() {
    return this.papi.db.select().from(schema.keyValues)
      .where(like(schema.keyValues.key, 'threadsRangesV2-%'))
      .all()
      .map(range => ({
        key: range.key,
        value: {
          ...MM_DEFAULT_VALUES.threads_ranges_v2__generated,
          ...(range.value ? JSON.parse(range.value) : {}),
        },
      }))
  }

  getFilteredThreadsRanges() {
    return this.papi.db.select().from(schema.keyValues)
      .where(like(schema.keyValues.key, 'filteredThreadsRanges-%'))
      .all()
      .map(range => ({
        key: range.key,
        value: {
          ...MM_DEFAULT_VALUES.filtered_threads_ranges_v3__generated,
          ...(range.value ? JSON.parse(range.value) : {}),
        },
      }))
  }
}
