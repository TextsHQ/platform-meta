import { relations } from 'drizzle-orm'
import { sqliteTable, integer, text, blob, primaryKey } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { InferModel } from 'drizzle-orm'

export const threads = sqliteTable('threads', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  threadKey: text('threadKey').notNull().primaryKey(),
  lastReadWatermarkTimestampMs: integer('lastReadWatermarkTimestampMs', { mode: 'timestamp' }),
  threadType: text('threadType'),
  folderName: text('folderName'),
  parentThreadKey: text('parentThreadKey'),
  lastActivityTimestampMs: integer('lastActivityTimestampMs', { mode: 'timestamp' }),
  snippet: text('snippet'),
  threadName: text('threadName'),
  threadPictureUrl: text('threadPictureUrl'),
  needsAdminApprovalForNewParticipant: integer('needsAdminApprovalForNewParticipant', { mode: 'boolean' }),
  threadPictureUrlFallback: text('threadPictureUrlFallback'),
  threadPictureUrlExpirationTimestampMs: integer('threadPictureUrlExpirationTimestampMs', { mode: 'timestamp' }),
  removeWatermarkTimestampMs: integer('removeWatermarkTimestampMs', { mode: 'timestamp' }),
  muteExpireTimeMs: integer('muteExpireTimeMs', { mode: 'timestamp' }),
  groupNotificationSettings: text('groupNotificationSettings'), // potentially blob type if it's a complex object
  isAdminSnippet: integer('isAdminSnippet', { mode: 'boolean' }),
  snippetSenderContactId: text('snippetSenderContactId'),
  snippetStringHash: text('snippetStringHash'),
  snippetStringArgument1: text('snippetStringArgument1'),
  snippetAttribution: text('snippetAttribution'),
  mailboxType: text('mailboxType'),
  draftMessage: text('draftMessage'),
  snippetAttributionStringHash: text('snippetAttributionStringHash'),
  disappearingSettingTtl: integer('disappearingSettingTtl'),
  disappearingSettingUpdatedTs: integer('disappearingSettingUpdatedTs', { mode: 'timestamp' }),
  disappearingSettingUpdatedBy: text('disappearingSettingUpdatedBy'),
  cannotReplyReason: text('cannotReplyReason'),
  customEmoji: text('customEmoji'),
  customEmojiImageUrl: text('customEmojiImageUrl'),
  outgoingBubbleColor: text('outgoingBubbleColor'),
  themeFbid: text('themeFbid'),
  authorityLevel: integer('authorityLevel'),
  muteMentionExpireTimeMs: integer('muteMentionExpireTimeMs', { mode: 'timestamp' }),
  muteCallsExpireTimeMs: integer('muteCallsExpireTimeMs', { mode: 'timestamp' }),
  ongoingCallState: text('ongoingCallState'),
  cannotUnsendReason: text('cannotUnsendReason'),
  snippetHasEmoji: integer('snippetHasEmoji', { mode: 'boolean' }),
  hasPersistentMenu: integer('hasPersistentMenu', { mode: 'boolean' }),
  disableComposerInput: integer('disableComposerInput', { mode: 'boolean' }),
  shouldRoundThreadPicture: integer('shouldRoundThreadPicture', { mode: 'boolean' }),
  proactiveWarningDismissTime: integer('proactiveWarningDismissTime'),
  isCustomThreadPicture: integer('isCustomThreadPicture', { mode: 'boolean' }),
  otidOfFirstMessage: text('otidOfFirstMessage'),
  normalizedSearchTerms: text('normalizedSearchTerms'),
  additionalThreadContext: text('additionalThreadContext'),
  disappearingThreadKey: text('disappearingThreadKey'),
  isDisappearingMode: integer('isDisappearingMode', { mode: 'boolean' }),
  disappearingModeInitiator: text('disappearingModeInitiator'),
  unreadDisappearingMessageCount: integer('unreadDisappearingMessageCount'),
  lastMessageCtaId: text('lastMessageCtaId'),
  lastMessageCtaType: text('lastMessageCtaType'),
  lastMessageCtaTimestampMs: integer('lastMessageCtaTimestampMs', { mode: 'timestamp' }),
  consistentThreadFbid: text('consistentThreadFbid'),
  threadDescription: a[70][1],
  unsendLimitMs: integer('unsendLimitMs', { mode: 'timestamp' }),
  capabilities2: a[79][1],
  capabilities3: a[80][1],
  syncGroup: a[83],
  threadInvitesEnabled: integer('threadInvitesEnabled', { mode: 'boolean' }),
  threadInviteLink: a[85],
  isAllUnreadMessageMissedCallXma: Boolean(a[86]),
  lastNonMissedCallXmaMessageTimestampMs: Number(a[87]),
  threadInvitesEnabledV2: Boolean(a[89]),
  hasPendingInvitation: Boolean(a[92]),
  eventStartTimestampMs: Number(a[93]),
  eventEndTimestampMs: Number(a[94]),
  takedownState: a[95],
  secondaryParentThreadKey: a[96],
  igFolder: a[97],
  inviterId: a[98],
  threadTags: a[99],
  threadStatus: a[100],
  threadSubtype: a[101],
  pauseThreadTimestamp: Number(a[102]),
})

export type IGThread = InferModel<typeof threads, 'select'>

export const insertThreadSchema = createInsertSchema(threads).required({
  threadKey: true,
  original: true,
})

export const selectThreadSchema = createSelectSchema(threads)

export const messages = sqliteTable('messages', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  threadKey: text('threadKey').notNull().references(() => threads.threadKey),
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

export const insertMessageSchema = createInsertSchema(messages)
export const selectMessageSchema = createSelectSchema(messages)

export const messageRelations = relations(messages, ({ one }) => ({
  thread: one(threads, { fields: [messages.threadKey], references: [threads.threadKey] }),
}))

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

export const insertTypingIndicatorSchema = createInsertSchema(typingIndicators)
export const selectTypingIndicatorSchema = createSelectSchema(typingIndicators)

export const attachments = sqliteTable('attachments', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  threadKey: text('threadKey').notNull().references(() => threads.threadKey),
  messageId: text('messageId').notNull().references(() => messages.messageId),
  attachmentFbid: text('attachmentFbid'),
  filename: text('filename'),
  filesize: integer('filesize'),
  hasMedia: integer('hasMedia', { mode: 'boolean' }),
  isSharable: integer('isSharable', { mode: 'boolean' }),
  playableUrl: text('playableUrl'),
  playableUrlFallback: text('playableUrlFallback'),
  playableUrlExpirationTimestampMs: integer('playableUrlExpirationTimestampMs', { mode: 'timestamp' }),
  playableUrlMimeType: text('playableUrlMimeType'),
  dashManifest: text('dashManifest'),
  previewUrl: text('previewUrl'),
  previewUrlFallback: text('previewUrlFallback'),
  previewUrlExpirationTimestampMs: integer('previewUrlExpirationTimestampMs', { mode: 'timestamp' }),
  previewUrlMimeType: text('previewUrlMimeType'),
  miniPreview: text('miniPreview'),
  previewWidth: integer('previewWidth'),
  previewHeight: integer('previewHeight'),
  attributionAppId: text('attributionAppId'),
  attributionAppName: text('attributionAppName'),
  attributionAppIcon: text('attributionAppIcon'),
  attributionAppIconFallback: text('attributionAppIconFallback'),
  attributionAppIconUrlExpirationTimestampMs: integer('attributionAppIconUrlExpirationTimestampMs', { mode: 'timestamp' }),
  localPlayableUrl: text('localPlayableUrl'),
  playableDurationMs: integer('playableDurationMs'),
  attachmentIndex: integer('attachmentIndex'),
  accessibilitySummaryText: text('accessibilitySummaryText'),
  isPreviewImage: integer('isPreviewImage', { mode: 'boolean' }),
  originalFileHash: text('originalFileHash'),
  attachmentType: text('attachmentType'),
  timestampMs: integer('timestampMs', { mode: 'timestamp' }),
  offlineAttachmentId: text('offlineAttachmentId'),
  hasXma: integer('hasXma', { mode: 'boolean' }),
  xmaLayoutType: text('xmaLayoutType'),
  xmasTemplateType: text('xmasTemplateType'),
  titleText: text('titleText'),
  subtitleText: text('subtitleText'),
  descriptionText: text('descriptionText'),
  sourceText: text('sourceText'),
  faviconUrlExpirationTimestampMs: integer('faviconUrlExpirationTimestampMs', { mode: 'timestamp' }),
  isBorderless: integer('isBorderless', { mode: 'boolean' }),
  previewUrlLarge: text('previewUrlLarge'),
  samplingFrequencyHz: integer('samplingFrequencyHz'),
  waveformData: text('waveformData'),
  authorityLevel: text('authorityLevel'),
})

export const insertAttachmentSchema = createInsertSchema(attachments)
export const selectAttachmentSchema = createSelectSchema(attachments)

export const users = sqliteTable('users', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  id: text('id').notNull().primaryKey(),
  profilePictureUrl: text('profilePictureUrl'),
  name: text('name'),
  username: text('username'),
})

export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const participants = sqliteTable('participants', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  threadKey: text('threadKey').notNull().references(() => threads.threadKey),
  userId: text('userId').notNull().references(() => users.id),
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
  user: one(users, { fields: [participants.userId], references: [users.id] }),
}))

export const userRelations = relations(users, ({ many }) => ({
  participants: many(participants),
}))

export const threadsRelation = relations(threads, ({ many }) => ({
  messages: many(messages),
  participants: many(participants),
}))

export type IGParticipant = InferModel<typeof participants, 'select'>
export const insertParticipantSchema = createInsertSchema(participants)
export const selectParticipantSchema = createSelectSchema(participants)

export const reactions = sqliteTable('reactions', {
  original: blob('_original', { mode: 'json' }).$type<Record<string, any>>(),
  // threadKey: text('threadKey').references(() => threads.threadKey),
  threadKey: text('threadKey'),
  timestampMs: integer('timestampMs', { mode: 'timestamp' }),
  messageId: text('messageId'),
  // messageId: text('messageId').notNull().references(() => messages.messageId),
  // actorId: text('actorId').notNull().references(() => users.id),
  actorId: text('actorId'),
  reaction: text('reaction'),
})

export const insertReactionSchema = createInsertSchema(reactions)
export const selectReactionSchema = createSelectSchema(reactions)
