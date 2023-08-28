import type { InferSelectModel } from 'drizzle-orm'
import { relations } from 'drizzle-orm'
import { blob, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { IGAttachment, IGMessage, IGThread } from '../ig-types'

export type IGThreadInDB = Omit<IGThread, 'raw' | 'threadKey' | 'lastActivityTimestampMs'>

export const threads = sqliteTable('threads', {
  threadKey: text('threadKey').notNull().primaryKey(),
  // thread: blob('thread', { mode: 'json' }).$type<IGThreadInDB>(), //SqliteError: JSON cannot hold BLOB values
  thread: text('thread'),
  lastActivityTimestampMs: integer('lastActivityTimestampMs', { mode: 'timestamp' }),
  folderName: text('folderName'),
  parentThreadKey: integer('parentThreadKey'),
  raw: text('raw'),
  igThread: text('igThread'),
  // hasMoreBefore: integer('hasMoreBefore', { mode: 'boolean' }),
  ranges: text('ranges'),
})

export type IGMessageInDB = Omit<IGMessage, 'raw' | 'messageId' | 'threadKey' | 'offlineThreadingId' | 'timestampMs' | 'primarySortKey' | 'senderId'>

export const messages = sqliteTable('messages', {
  raw: text('raw'),
  // message: blob('message', { mode: 'json' }).$type<RawMessage>(),
  message: text('message'),
  threadKey: text('threadKey').notNull(),
  messageId: text('messageId').primaryKey(),
  offlineThreadingId: text('offlineThreadingId'),
  primarySortKey: text('primarySortKey'),
  timestampMs: integer('timestampMs', { mode: 'timestamp' }),
  senderId: text('senderId').notNull(),
})

export type RawAttachment = Omit<IGAttachment, 'raw' | 'threadKey' | 'messageId' | 'attachmentFbid' | 'timestampMs' | 'offlineAttachmentId'>

export const attachments = sqliteTable('attachments', {
  raw: text('raw'),
  attachment: text('attachment'),
  // attachment: blob('attachment', { mode: 'json' }).$type<RawAttachment>(),
  threadKey: text('threadKey').notNull(), // .references(() => threads.threadKey),
  messageId: text('messageId').notNull(), // .references(() => messages.messageId),
  attachmentFbid: text('attachmentFbid'),
  timestampMs: integer('timestampMs', { mode: 'timestamp' }),
  offlineAttachmentId: text('offlineAttachmentId'),
}, table => ({
  pk: primaryKey(table.threadKey, table.messageId, table.attachmentFbid),
}))

export const attachmentRelations = relations(attachments, ({ one }) => ({
  message: one(messages, { fields: [attachments.messageId], references: [messages.messageId] }),
}))

export const contacts = sqliteTable('contacts', {
  id: text('id').notNull().primaryKey(),
  raw: text('raw'),
  contact: text('contact'),
  igContact: blob('igContact', { mode: 'json' }).$type<{
    igId: string
    igFollowStatus: string
    verificationStatus: string
    linkedFbid: string
    e2eeEligibility: string
    supportsE2eeSpamdStorage: string
  }>(),
  profilePictureUrl: text('profilePictureUrl'),
  name: text('name'),
  username: text('username'),
})

export const participants = sqliteTable('participants', {
  // original: blob('_original', { mode: 'json' }).$type<unknown>(),
  raw: text('raw'),
  threadKey: text('threadKey').notNull(), // .references(() => threads.threadKey),
  userId: text('userId').notNull(),
  readWatermarkTimestampMs: integer('readWatermarkTimestampMs', { mode: 'timestamp' }),
  readActionTimestampMs: integer('readActionTimestampMs', { mode: 'timestamp' }),
  deliveredWatermarkTimestampMs: integer('deliveredWatermarkTimestampMs', { mode: 'timestamp' }),
  lastDeliveredActionTimestampMs: integer('lastDeliveredActionTimestampMs', { mode: 'timestamp' }),
  // lastDeliveredWatermarkTimestampMs: integer('lastDeliveredWatermarkTimestampMs', { mode: 'timestamp' }),
  isAdmin: integer('isAdmin', { mode: 'boolean' }),
}, table => ({
  pk: primaryKey(table.threadKey, table.userId),
}))

export const participantRelations = relations(participants, ({ one }) => ({
  thread: one(threads, { fields: [participants.threadKey], references: [threads.threadKey] }),
  contacts: one(contacts, { fields: [participants.userId], references: [contacts.id] }),
}))

export const contactRelations = relations(contacts, ({ many }) => ({
  participants: many(participants),
}))

export const threadsRelation = relations(threads, ({ many }) => ({
  messages: many(messages),
  participants: many(participants),
}))

export type DBContactSelect = InferSelectModel<typeof contacts>
export type DBParticipantSelect =
  Pick<InferSelectModel<typeof participants>, 'userId' | 'isAdmin' | 'readWatermarkTimestampMs'>
  & {
    contacts: Pick<DBContactSelect, 'id' | 'name' | 'username' | 'profilePictureUrl' | 'igContact'>
  }

export const reactions = sqliteTable('reactions', {
  raw: text('raw'),
  // original: blob('_original', { mode: 'json' }).$type<unknown>(),
  // threadKey: text('threadKey').references(() => threads.threadKey),
  threadKey: text('threadKey'),
  timestampMs: integer('timestampMs', { mode: 'timestamp' }),
  messageId: text('messageId'),
  // messageId: text('messageId').notNull().references(() => messages.messageId),
  // actorId: text('actorId').notNull().references(() => contacts.id),
  actorId: text('actorId'),
  reaction: text('reaction'),
}, table => ({
  pk: primaryKey(table.threadKey, table.messageId, table.actorId),
}))

export const reactionRelations = relations(reactions, ({ one }) => ({
  message: one(messages, { fields: [reactions.messageId], references: [messages.messageId] }),
}))
export const messageRelations = relations(messages, ({ one, many }) => ({
  thread: one(threads, { fields: [messages.threadKey], references: [threads.threadKey] }),
  reactions: many(reactions),
  attachments: many(attachments),
}))
export type DBReaction = InferSelectModel<typeof reactions>

export const keyValues = sqliteTable('key_values', {
  key: text('key').notNull().primaryKey(),
  value: text('value'),
})
