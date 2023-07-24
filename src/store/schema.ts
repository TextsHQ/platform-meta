import { MessageBehavior } from '@textshq/platform-sdk'
import { sqliteTable, integer, text, blob } from 'drizzle-orm/sqlite-core'
// import { relations } from 'drizzle-orm'
import type { IGMessage, IGParticipant, IGThread } from '../types'

export const threads = sqliteTable('threads', {
  original: blob('_original', { mode: 'json' }).$type<IGThread>(),
  id: text('id').primaryKey(),
  folderName: text('folderName'),
  title: text('title'),
  isUnread: integer('isUnread', { mode: 'boolean' }),
  lastReadMessageID: text('lastReadMessageID'),
  isReadOnly: integer('isReadOnly', { mode: 'boolean' }),
  isArchived: integer('isArchived', { mode: 'boolean' }),
  isPinned: integer('isPinned', { mode: 'boolean' }),
  mutedUntil: integer('mutedUntil', { mode: 'timestamp' }),
  type: text('type', { enum: ['single', 'group', 'channel', 'broadcast'] }).notNull().default('single'),
  timestamp: integer('timestamp', { mode: 'timestamp' }),
  imgURL: text('imgURL'),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  description: text('description'),
  partialLastMessage: blob('partialLastMessage'),
  messageExpirySeconds: integer('messageExpirySeconds'),
})

export const messages = sqliteTable('messages', {
  original: blob('_original', { mode: 'json' }).$type<IGMessage>(),
  id: text('id').primaryKey(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  editedTimestamp: integer('editedTimestamp', { mode: 'timestamp' }),
  expiresInSeconds: integer('expiresInSeconds'),
  forwardedCount: integer('forwardedCount'),
  forwardedFromText: text('forwardedFromText'),
  forwardedFromThreadID: integer('forwardedFromThreadID'),
  forwardedFromUserID: integer('forwardedFromUserID'),
  senderID: text('senderID').notNull(),
  threadID: text('threadID').notNull().references(() => threads.id),
  text: text('text'),
  textAttributes: blob('textAttributes'),
  textHeading: text('textHeading'),
  textFooter: text('textFooter'),
  iframeURL: text('iframeURL'),
  seen: integer('seen', { mode: 'timestamp' }),
  isDelivered: integer('isDelivered', { mode: 'boolean' }),
  isHidden: integer('isHidden', { mode: 'boolean' }),
  isSender: integer('isSender', { mode: 'boolean' }),
  isAction: integer('isAction', { mode: 'boolean' }),
  isDeleted: integer('isDeleted', { mode: 'boolean' }),
  isErrored: integer('isErrored', { mode: 'boolean' }),
  parseTemplate: integer('parseTemplate', { mode: 'boolean' }),
  linkedMessageThreadID: text('linkedMessageThreadID'),
  linkedMessageID: text('linkedMessageID'),
  action: text('action'),
  cursor: text('cursor'),
  behavior: text('behavior', { enum: [MessageBehavior.SILENT, MessageBehavior.KEEP_READ, MessageBehavior.DONT_NOTIFY] }).default(null),
  accountID: text('accountID'),
  sortKey: text('sortKey'),
})

// export const threadsRelations = relations(threads, ({ many }) => ({
//   messages: many(messages),
// }))

export const participants = sqliteTable('participants', {
  original: blob('original', { mode: 'json' }).$type<IGParticipant>(),
  threadID: text('threadID').notNull().references(() => threads.id),
  id: text('id').notNull().primaryKey(),
  name: text('name'),
})
