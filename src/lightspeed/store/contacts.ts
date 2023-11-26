export type ContactSchemas = | setHMPSStatus
| upsertSequenceId
| verifyContactRowExists
| setRegionHint
| verifyCommunityMemberContextualProfileExists

export interface verifyCommunityMemberContextualProfileExists {
  contactId: bigint
  parentThreadKey: bigint
}

export interface setRegionHint {
  unknownValue: bigint
  regionHint: string
}

export interface verifyContactRowExists {
  id: bigint
  profilePictureUrl: string
  name: string
  contactType: bigint
  profilePictureFallbackUrl: string
  isMemorialized: boolean
  blockedByViewerStatus: bigint
  canViewerMessage: boolean
  authorityLevel: bigint
  capabilities: bigint
  capabilities2: bigint
  gender: bigint
  contactViewerRelationship: bigint
  secondaryName: string
}

export interface setHMPSStatus {
  accountId: bigint
  unknownValue: bigint
  timestamp: bigint
}

// what is this
export interface upsertSequenceId {
  lastAppliedMailboxSequenceId: bigint
}
