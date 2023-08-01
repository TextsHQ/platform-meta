import { AnySQLiteTable } from 'drizzle-orm/sqlite-core'
import { sql, inArray } from 'drizzle-orm'

import { Thread, Participant, Message } from '@textshq/platform-sdk'
import type { DrizzleDB } from './db'
import { messages, threads } from './schema'
import { mapMessage } from '../mappers'

const hasData = (db: DrizzleDB, table: AnySQLiteTable) => db.select({ count: sql<number>`count(*)` }).from(table).get().count > 0

export const hasSomeCachedData = async (db: DrizzleDB) => ({
  hasThreads: hasData(db, threads),
  hasMessages: hasData(db, messages),
})

export const queryMessages = async (db: DrizzleDB, messageIds: string[] | 'ALL', fbid): Promise<Message[]> => {
  console.log('queryMessages', messageIds)
  const storedMessages = db.query.messages.findMany({
    ...(messageIds !== 'ALL' && { where: inArray(messages.messageId, messageIds) }),
    columns: {
      threadKey: true,
      messageId: true,
      timestampMs: true,
      senderId: true,
      text: true,
    },
    with: {
      attachments: {
        columns: {
          previewUrl: true,
        },
      },
    },
  })
  return mapMessage(storedMessages, fbid)
}

export const queryThreads = async (db: DrizzleDB, threadIDs: string[] | 'ALL', fbid): Promise<Thread[]> => db.query.threads.findMany({
  ...(threadIDs !== 'ALL' && { where: inArray(threads.threadKey, threadIDs) }),
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
      with: {
        attachments: {
          columns: {
            previewUrl: true,
          },
        },
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
  const mu: Message[] = mapMessage(thread.messages, fbid)
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

export const FOREVER = 4117219200000 // 2100-06-21T00:00:00.000Z
