// import { randomBytes } from 'crypto'
// import { createWriteStream } from 'fs'
// import P, { multistream } from 'pino'
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
  const timestamp = BigInt(Date.now())
  const epoch_id = timestamp << BigInt(22)
  const otid = epoch_id + BigInt(Math.floor(Math.random() * 2 ** 22))
  return { timestamp, epoch_id: Number(epoch_id), otid } as const
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

// export const getLogger = (filename: string | undefined) => {
//   const opts = {
//     timestamp: () => `,"time":"${new Date().toJSON()}"`,
//     level: texts?.isLoggingEnabled ? 'debug' : 'fatal',
//   } as const
//   if (filename) {
//     return P(
//       opts,
//       multistream([
//         { stream: process.stdout, level: opts.level },
//         { stream: createWriteStream(filename, { flags: 'a' }), level: opts.level },
//       ]),
//     )
//   }
//   return P(opts)
// }

// @TODO:used for pino
// export function generateInstanceId() {
//   return randomBytes(2).toString('hex')
// }

export const sleep = (ms: number) => new Promise(resolve => { setTimeout(resolve, ms) })

export function createPromise<T>() {
  const p: {
    resolve?: (value: T | PromiseLike<T>) => void
    promise?: Promise<T>
  } = {
    promise: new Promise<T>(resolve => { p.resolve = resolve }),
  }
  return p
}
