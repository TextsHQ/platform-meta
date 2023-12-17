import { CookieJar } from 'tough-cookie'
import type { SimpleArgType } from './payload-parser'
import type { IGMessageRanges } from './types'
import { BIGINT_MARKER } from './constants'

export const genClientContext = () => {
  const randomBinary = Math.floor(Math.random() * 0xFFFFFFFF).toString(2).padStart(22, '0').slice(-22)
  const dateBinary = Date.now().toString(2)
  return BigInt(`0b${dateBinary}${randomBinary}`)
}

export class AutoIncrementStore {
  private i: number

  private counter: number

  private lastTimestamp: number

  constructor(private readonly start = 0) {
    this.i = start
    this.counter = 0
    this.lastTimestamp = 0
  }

  public incrementCounter(timestamp: number) {
    if (timestamp === this.lastTimestamp) {
      this.counter++
    } else {
      this.lastTimestamp = timestamp
      this.counter = 0
    }
    return this.counter
  }

  public gen() {
    return this.i++
  }

  public get current() {
    return this.i
  }
}

export const getTimeValues = (store: AutoIncrementStore) => {
  const now = Date.now()
  const timestamp = BigInt(now)

  const counter = BigInt(store.incrementCounter(now))

  const epoch_id = (timestamp << 22n) | (counter << 12n) | 42n
  const otid = epoch_id | BigInt(Math.floor(Math.random() * 2 ** 22))
  return {
    epoch_id,
    otid: otid.toString(),
    timestamp,
    now,
  }
}

type JSONValue = string | number | boolean | null | undefined | BigInt | JSONValue[] | { [key: string]: JSONValue }

const metaJSONStringifyCB = (key: string, value: JSONValue) => {
  if (typeof value === 'bigint') return `${BIGINT_MARKER}${value.toString()}`
  return value
}

export const metaJSONStringify = (obj: JSONValue) => {
  const output = JSON.stringify(obj, metaJSONStringifyCB)
  return output.replace(/"\$bigint(\d+)"/g, '$1')
}

export const getMqttSid = () => parseInt(Math.random().toFixed(16).split('.')[1], 10)

export const parseMessageRanges = (ranges: string) => ranges?.length > 0 && JSON.parse(ranges) as IGMessageRanges

export function createPromise<T>() {
  const p: {
    resolve?: (value: T | PromiseLike<T>) => void
    reject?: (reason?: any) => void
    promise?: Promise<T>
  } = {}
  p.promise = new Promise<T>((resolve, reject) => {
    p.resolve = resolve
    p.reject = reject
  })
  return p
}

export function parseMs(ms: SimpleArgType) {
  const num = Number(ms)
  return (!Number.isNaN(num) && num > 0) ? num : undefined
}

export function parseMsAsDate(arg: SimpleArgType) {
  const ms = parseMs(arg)
  return ms ? new Date(ms) : undefined
}

export function fixEmoji(emoji: string) {
  if (!emoji) return ''
  if (emoji === '❤') return '❤️'
  return emoji
}

export const getRetryTimeout = (attempt: number) =>
  Math.min(100 + (2 ** attempt + Math.random() * 100), 2000)

export function getOriginalURL(linkURL: string) {
  const MESSENGER_LINK_SHIM = '//l.messenger.com/l.php?u='
  const FACEBOOK_LINK_SHIM = '//l.facebook.com/l.php?u='

  if (
    !linkURL?.includes(MESSENGER_LINK_SHIM)
      && !linkURL?.includes(FACEBOOK_LINK_SHIM)
  ) {
    return linkURL
  }

  const parsed = new URL(linkURL)
  if (!parsed?.searchParams) return
  // {
  //   u: 'https://texts.com/',
  //   h: 'randomness',
  //   s: '1'
  // }
  const u = parsed.searchParams.getAll('u')
  if (u.length > 1) return linkURL
  return u[0]
}

export function parseUnicodeEscapeSequences(str: string) {
  return decodeURIComponent(JSON.parse('"' + str.replace(/\\u([\d\w]{4})/gi, (match, grp) => '\\u' + grp) + '"'))
}

export function getCookieJar(serialized: CookieJar.Serialized) {
  // @TODO remove this cookie to reset cursors
  // const cookieToRemove = env === 'IG' ? 'igd_ls' : 'm_ls'
  return CookieJar.fromJSON(serialized as unknown as string)
}

export class TypedMap<T> {
  private map = new Map<keyof T, T[keyof T]>()

  get<K extends keyof T>(key: K) {
    return this.map.get(key) as T[K]
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.map.set(key, value)
    return this
  }
}
