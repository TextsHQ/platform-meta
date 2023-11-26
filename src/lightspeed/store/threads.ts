export type ThreadSchemas = |
addParticipantIdToGroupThread
| writeThreadCapabilities
| updateThreadsRangesV2
| deleteThenInsertThread
| upsertFolderSeenTimestamp
| updateReadReceipt
| threadsRangesQuery
| queryAdditionalGroupThreads
| updateTypingIndicator

export interface queryAdditionalGroupThreads {
  numThreads: bigint
  numMessages: bigint
  additionalPagesToFetch: bigint
}

// contains conditional indexes, implement later
export interface threadsRangesQuery {
  parentThreadKey: bigint
  unknownValue: boolean
  isAfter: boolean
  referenceThreadKey: bigint
  referenceThreadKey2: bigint
  referenceActivityTimestamp: bigint
  referenceActivityTimestamp2: bigint
  additionalPagesToFetch: boolean
  unknownValue2: boolean
}

export interface updateReadReceipt {
  readWatermarkTimestampMs: bigint
  threadKey: bigint
  contactId: bigint
  readActionTimestampMs: bigint
}

export interface upsertFolderSeenTimestamp {
  parentThreadKey: bigint
  lastSeenRequestTimestampMs: bigint
}

export interface deleteThenInsertThread {
  lastActivityTimestampMs: bigint
  lastReadWatermarkTimestampMs: bigint
  snippet: string
  threadName: string
  threadPictureUrl: string
  needsAdminApprovalForNewParticipant: boolean
  authorityLevel: bigint
  threadKey: bigint
  mailboxType: bigint
  threadType: bigint
  folderName: string
  threadPictureUrlFallback: string
  threadPictureUrlExpirationTimestampMs: bigint
  removeWatermarkTimestampMs: bigint
  muteExpireTimeMs: bigint
  muteCallsExpireTimeMs: bigint
  groupNotificationSettings: any
  isAdminSnippet: boolean
  snippetSenderContactId: bigint
  snippetStringHash: any
  snippetStringArgument1: any
  snippetAttribution: any
  snippetAttributionStringHash: any
  disappearingSettingTtl: any
  disappearingSettingUpdatedTs: any
  disappearingSettingUpdatedBy: any
  ongoingCallState: bigint
  cannotReplyReason: any
  customEmoji: any
  customEmojiImageUrl: any
  outgoingBubbleColor: any
  themeFbid: any
  parentThreadKey: bigint
  nullstateDescriptionText1: any
  nullstateDescriptionType1: any
  nullstateDescriptionText2: any
  nullstateDescriptionType2: any
  nullstateDescriptionText3: any
  nullstateDescriptionType3: any
  snippetHasEmoji: boolean
  hasPersistentMenu: boolean
  disableComposerInput: boolean
  cannotUnsendReason: bigint
  viewedPluginKey: any
  viewedPluginContext: any
  clientThreadKey: any
  capabilities: bigint
  shouldRoundThreadPicture: any
  proactiveWarningDismissTime: bigint
  isCustomThreadPicture: boolean
  otidOfFirstMessage: any
  normalizedSearchTerms: any
  additionalThreadContext: any
  disappearingThreadKey: any
  isDisappearingMode: boolean
  disappearingModeInitiator: any
  unreadDisappearingMessageCount: bigint
  lastMessageCtaId: any
  lastMessageCtaType: any
  consistentThreadFbid: bigint
  threadDescription: any
  unsendLimitMs: bigint
  syncGroup: bigint
  threadInvitesEnabled: bigint
  threadInviteLink: any
  numUnreadSubthreads: bigint
  subthreadCount: any
  threadInvitesEnabledV2: any
  eventStartTimestampMs: any
  eventEndTimestampMs: any
  takedownState: any
  memberCount: bigint
  secondaryParentThreadKey: any
  igFolder: any
  inviterId: any
  threadTags: bigint
  threadStatus: any
  threadSubtype: bigint
  pauseThreadTimestamp: any
}

export interface addParticipantIdToGroupThread {
  threadKey: bigint
  contactId: bigint
  readWatermarkTimestampMs: bigint
  readActionTimestampMs: bigint
  deliveredWatermarkTimestampMs: bigint
  nickname: bigint
  isAdmin: bigint
  subscribeSource: bigint
  authorityLevel: bigint
  normalizedSearchTerms: bigint
  isSuperAdmin: bigint
  threadRoles: bigint
}

export interface writeThreadCapabilities {
  threadKey: bigint
  capabilities: bigint
  capabilities2: bigint
  capabilities3: bigint
  capabilities4: bigint
}

export interface upsertInboxThreadsRange {
  syncGroup: bigint
  minLastActivityTimestampMs: bigint
  hasMoreBefore: boolean
  isLoadingBefore: boolean
  minThreadKey: bigint
}

export interface updateThreadsRangesV2 {
  folderName: string
  parentThreadKey: bigint
  minLastActivityTimestampMs: bigint // not certain
  minThreadKey: bigint // not certain
  IsLoadingBefore: bigint // not certain
}

export interface updateTypingIndicator {
  threadKey: bigint
  senderId: bigint
  isTyping: boolean
}
