import { sqliteTable, integer, text, blob } from 'drizzle-orm/sqlite-core'
import type { IGMessage, IGParticipant, IGThread } from '../types'
import { InferModel } from 'drizzle-orm'

export const messages = sqliteTable('messages', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  threadKey: text('threadKey').notNull(),
  offlineThreadingId: text('offlineThreadingId'),
  authorityLevel: integer('authorityLevel'),
  timestampMs: integer('timestampMs', { mode: 'timestamp' }),
  messageId: text('messageId').primaryKey(),
  senderId: text('senderId').notNull(),
  isAdminMessage: integer('isAdminMessage', { mode: 'boolean' }),
  sendStatus: text('sendStatus'),
  text: text('text'),
  subscriptErrorMessage: text('subscriptErrorMessage'),
  stickerId: text('stickerId'),
  messageRenderingType: text('messageRenderingType'),
  isUnsent: integer('isUnsent', { mode: 'boolean' }),
  unsentTimestampMs: integer('unsentTimestampMs', { mode: 'timestamp' }),
  mentionOffsets: text('mentionOffsets'),
  mentionLengths: text('mentionLengths'),
  mentionIds: text('mentionIds'),
  mentionTypes: text('mentionTypes'),
  replySourceId: text('replySourceId'),
  replySourceType: text('replySourceType'),
})

export type Message = InferModel<typeof messages, 'select'>
export type NewMessage = InferModel<typeof messages, 'insert'>

export const messageRanges = sqliteTable('message_ranges', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  threadKey: text('threadKey').notNull(),
  senderId: text('senderId').notNull(),
  expirationTimestampMs: integer('expirationTimestampMs', { mode: 'timestamp' }),
})

export const typingIndicators = sqliteTable('typing_indicators', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  threadKey: text('threadKey').notNull(),
  minTimestampMs: integer('minTimestampMs', { mode: 'timestamp' }),
  minMessageId: text('minMessageId'),
  maxTimestampMs: integer('maxTimestampMs', { mode: 'timestamp' }),
  maxMessageId: text('maxMessageId'),
  isLoadingBefore: integer('isLoadingBefore', { mode: 'boolean' }),
  isLoadingAfter: integer('isLoadingAfter', { mode: 'boolean' }),
  hasMoreBefore: integer('hasMoreBefore', { mode: 'boolean' }),
  hasMoreAfter: integer('hasMoreAfter', { mode: 'boolean' }),
})

export const threads9 = sqliteTable('threads', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  lastReadWatermarkTimestampMs: integer('lastReadWatermarkTimestampMs', { mode: 'timestamp' }),
  folderName: text('folderName'),
  parentThreadKey: text('parentThreadKey'),
  lastActivityTimestampMs: integer('lastActivityTimestampMs', { mode: 'timestamp' }),
  snippet: text('snippet'),
  threadName: text('threadName'),
  threadPictureUrl: text('threadPictureUrl'),
  needsAdminApprovalForNewParticipant: integer('needsAdminApprovalForNewParticipant', { mode: 'boolean' }),
  threadPictureUrlFallback: text('threadPictureUrlFallback'),
  removeWatermarkTimestampMs: integer('removeWatermarkTimestampMs', { mode: 'timestamp' }),
  muteExpireTimeMs: integer('muteExpireTimeMs', { mode: 'timestamp' }),
  groupNotificationSettings: text('groupNotificationSettings'), // potentially blob type if it's a complex object
  isAdminSnippet: integer('isAdminSnippet', { mode: 'boolean' }),
  snippetSenderContactId: text('snippetSenderContactId'),
  snippetStringHash: text('snippetStringHash'),
  snippetStringArgument1: text('snippetStringArgument1'),
  snippetAttribution: text('snippetAttribution'),
  snippetAttributionStringHash: text('snippetAttributionStringHash'),
  disappearingSettingTtl: integer('disappearingSettingTtl'),
  disappearingSettingUpdatedTs: integer('disappearingSettingUpdatedTs', { mode: 'timestamp' }),
  disappearingSettingUpdatedBy: text('disappearingSettingUpdatedBy'),
  cannotReplyReason: text('cannotReplyReason'),
  customEmoji: text('customEmoji'),
  customEmojiImageUrl: text('customEmojiImageUrl'),
  outgoingBubbleColor: text('outgoingBubbleColor'),
  themeFbid: text('themeFbid'),
  nullstateDescriptionText1: text('nullstateDescriptionText1'),
})
