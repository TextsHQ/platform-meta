import { AnySQLiteTable } from 'drizzle-orm/sqlite-core'
import { sql, inArray } from 'drizzle-orm'

import { Thread, Participant, Message } from '@textshq/platform-sdk'
import type { DrizzleDB } from './db'
import { messages, threads } from './schema'

const hasData = (db: DrizzleDB, table: AnySQLiteTable) => db.select({ count: sql<number>`count(*)` }).from(table).get().count > 0

export const hasSomeCachedData = async (db: DrizzleDB) => ({
  hasThreads: hasData(db, threads),
  hasMessages: hasData(db, messages),
})

export const queryMessages = async (db: DrizzleDB, messageIds: string[] | 'ALL', fbid): Promise<Message[]> => {
  let _whereFunc
  if (messageIds === 'ALL') {
    _whereFunc = () => true
    // _whereFunc = (users, { eq }) => eq(users.id, 1)
  } else {
    _whereFunc = () => inArray(messages.messageId, messageIds)
  }
  return db.query.messages.findMany({
    where: _whereFunc,
    columns: {
      threadKey: true,
      messageId: true,
      timestampMs: true,
      senderId: true,
      text: true,
    },
  }).map(m => ({
    id: m.messageId,
    timestamp: m.timestampMs,
    senderID: m.senderId,
    text: m.text,
    isSender: m.senderId === fbid,
  }))
}

export const queryThreads = async (db: DrizzleDB, threadIDs: string[] | 'ALL', fbid): Promise<Thread[]> => {
  let _whereFunc
  if (threadIDs === 'ALL') {
    _whereFunc = () => true
    // _whereFunc = (users, { eq }) => eq(users.id, 1)
  } else {
    _whereFunc = () => inArray(threads.threadKey, threadIDs)
  }
  return db.query.threads.findMany({
    where: _whereFunc,
    columns: {
      threadKey: true,
      lastActivityTimestampMs: true,
      lastReadWatermarkTimestampMs: true,
      threadName: true,
      threadPictureUrl: true,
      threadType: true,

    },
    with: {
      participants:
          {
            columns: {},
            with: {
              users: {
                columns: {
                  id: true,
                  name: true,
                  username: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
      messages: {
        columns: {
          threadKey: true,
          messageId: true,
          timestampMs: true,
          senderId: true,
          text: true,
        },
      },
    },
  }).map(thread => {
    const isUnread = thread.lastActivityTimestampMs > thread.lastReadWatermarkTimestampMs
    const nu: Participant[] = thread.participants.map(p => ({
      id: p.users.id,
      username: p.users.username,
      fullName: p.users.name,
      imgURL: p.users.profilePictureUrl,
      isSelf: p.users.id === fbid,
      displayText: p.users.name,
      hasExited: false,
    }))
    const mu: Message[] = thread.messages.map(m => ({
      id: m.messageId,
      timestamp: m.timestampMs,
      senderID: m.senderId,
      text: m.text,
      isSender: m.senderId === fbid,

    }))
    const title = nu.filter(p => !p.isSelf).map(p => p.fullName).join(', ')
    return {
      id: thread.threadKey,
      title,
      isUnread,
      isReadOnly: false,
      imgURL: thread.threadPictureUrl,
      type: 'single',
      participants: {
        items: nu,
        hasMore: false,
      },
      messages: {
        items: mu,
        hasMore: false,
      },
    }
  })
}

export const FOREVER = 4117219200000 // 2100-06-21T00:00:00.000Z
