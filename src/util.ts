import mqtt from 'mqtt-packet'
import type WebSocket from 'ws'

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
    promise?: Promise<T>
  } = {}
  p.promise = new Promise<T>(resolve => { p.resolve = resolve })
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
