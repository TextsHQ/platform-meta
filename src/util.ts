import mqtt from 'mqtt-packet'
import type WebSocket from 'ws'
import { InboxName } from '@textshq/platform-sdk'

export const genClientContext = () => {
  const randomBinary = Math.floor(Math.random() * 0xFFFFFFFF).toString(2).padStart(22, '0').slice(-22)
  const dateBinary = Date.now().toString(2)
  return BigInt(`0b${dateBinary}${randomBinary}`)
}

export const getTimeValues = () => {
  // console.log(typing.toString("hex").match(/../g).join(" "));
  // https://intuitiveexplanations.com/tech/messenger
  // link above has good explanation of otid
  const now = Date.now()
  const timestamp = BigInt(now)
  const epoch_id = timestamp << BigInt(22)
  const otid = epoch_id + BigInt(Math.floor(Math.random() * 2 ** 22))
  return { timestamp, epoch_id: Number(epoch_id), otid, now } as const
}

// parse mqtt packet
// promisifies the mqtt parser to make it easier to use
export function parseMqttPacket(data: WebSocket.RawData) {
  const parser = mqtt.parser({
    protocolVersion: 3,
  })

  return new Promise((resolve, reject) => {
    parser.on('packet', packet => {
      const j = JSON.parse((packet as any).payload)
      resolve(j)
    })

    parser.on('error', error => {
      reject(error)
    })

    // @TODO:FIX TYPES FOR THIS
    parser.parse(data as Buffer)
  })
}

export const getMqttSid = () => parseInt(Math.random().toFixed(16).split('.')[1], 10)

export const sleep = (ms: number) => new Promise(resolve => { setTimeout(resolve, ms) })

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

export function getAsDate(ms: string) {
  return ms ? new Date(Number(ms)) : undefined
}

export function getAsMS(ms: string) {
  return ms ? Number(ms) : undefined
}

export function getAsString(value: string | (string | number)[]) {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value[0] === 9) return null // @TODO: 9 appears to be the type for null
  return null
}

export function getAsNumber(value: string | (string | number)[]) {
  if (typeof value === 'number') return value
  if (Array.isArray(value) && value[0] === 19) return value[1] as number // @TODO: 19 appears to be the type for int
  return null
}

export function parseValue<T extends string | number | boolean | null>(value: string | [number, string]) {
  if (
    typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
      || !Array.isArray(value)
  ) return value as T
  if (value[0] === 9) return null as T
  if (value[0] === 19) return String(value[1]) as T // can be bigint
  return value[1] as T
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

export const getInboxNameFromIGFolder = (folder: string) => (folder === 'inbox' ? InboxName.NORMAL : InboxName.REQUESTS)

export function parseUnicodeEscapeSequences(str: string) {
  return decodeURIComponent(JSON.parse('"' + str.replace(/\\u([\d\w]{4})/gi, (match, grp) => '\\u' + grp) + '"'))
}

export class InstagramSocketServerError extends Error {
  info: {
    id: number | string
    message: string
  }

  constructor(errorId: number | string, errorTitle: string, errorMessage: string) {
    super(`Error ${errorId}: ${errorMessage}`)
    this.name = errorTitle
    this.info = {
      id: errorId,
      message: errorMessage,
    }

    // Ensure the instance is correctly set up
    // If transpiling to ES5, this line is needed to correctly set up the prototype chain
    Object.setPrototypeOf(this, InstagramSocketServerError.prototype)

    // Capture the stack trace (removes the constructor call from it)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InstagramSocketServerError)
    }
  }

  toString() {
    return `${this.name} (ID: ${this.info.id}): ${this.message}`
  }
}
