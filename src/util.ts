import { texts } from '@textshq/platform-sdk'
import { randomBytes } from 'crypto'
import { AnySQLiteTable } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { createWriteStream } from 'fs'
import P, { multistream } from 'pino'
import mqtt from 'mqtt-packet'
import path from 'path'
import type WebSocket from 'ws'

import { DrizzleDB } from './store/db'
import { messages, threads } from './store/schema'

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

export const getLogger = (filename: string | undefined) => {
  const opts = {
    timestamp: () => `,"time":"${new Date().toJSON()}"`,
    level: texts?.isLoggingEnabled ? 'debug' : 'fatal',
  } as const
  if (filename) {
    return P(
      opts,
      multistream([
        { stream: process.stdout, level: opts.level },
        { stream: createWriteStream(filename, { flags: 'a' }), level: opts.level },
      ]),
    )
  }
  return P(opts)
}

export function generateInstanceId() {
  return randomBytes(2).toString('hex')
}

export const sleep = (ms: number) => new Promise(resolve => { setTimeout(resolve, ms) })

const hasData = (db: DrizzleDB, table: AnySQLiteTable) => db.select({ count: sql<number>`count(*)` }).from(table).get().count > 0

export const hasSomeCachedData = async (db: DrizzleDB) => ({
  hasThreads: hasData(db, threads),
  hasMessages: hasData(db, messages),
})

export const FOREVER = 4117219200000 // 2100-06-21T00:00:00.000Z

const path = require('path');

// Get the relative path from the current script file
const currentScriptPath = __filename;
const filePath = '/path/to/file.txt';
const relativePath = path.relative(path.dirname(currentScriptPath), filePath);

console.log(relativePath);
