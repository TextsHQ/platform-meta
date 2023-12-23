import { SimpleArgType } from './ls-parser'
import { ParentThreadKey, SyncChannel } from './types'
import { parseMsAsDate } from './util'

export function executeFirstBlockForSyncTransaction(a: SimpleArgType[]) {
  return {
    databaseId: a[0] as string,
    epochId: a[1] as string,
    currentCursor: a[2] as string,
    nextCursor: a[3] as string,
    syncStatus: a[4] as string,
    sendSyncParams: a[5] as boolean,
    minTimeToSyncTimestampMs: a[6] as number,
    canIgnoreTimestamp: a[7] as string,
    syncChannel: a[8] as SyncChannel,
  }
}

export function updateThreadsRangesV2(a: SimpleArgType[]) {
  return {
    mailboxType: a[0], // 'inbox'
    parentThreadKey: a[1] as ParentThreadKey, // [0,0]
    minLastActivityTimestampMs: a[2] as number, // [383, 3107845504]
    minThreadKey: a[3] as string, //  [233260, 3068464911]
    secondaryThreadRangeFilter: a[4], // @TODO: not sure [0, 1]
  }
}

export function upsertInboxThreadsRange(a: SimpleArgType[]) {
  return {
    syncGroup: a[0] as SyncChannel,
    minLastActivityTimestampMs: parseMsAsDate(a[1]),
    hasMoreBefore: Boolean(a[2]),
    isLoadingBefore: Boolean(a[3]),
    minThreadKey: a[4] as string,
  }
}

export function deleteThenInsertContact(a: SimpleArgType[]) {
  return {
    id: a[0] as string,
    profilePictureUrl: a[2] as string,
    profilePictureFallbackUrl: a[3] as string,
    profilePictureUrlExpirationTimestampMs: a[4] as string,
    profilePictureLargeUrl: a[5] as string,
    profilePictureLargeFallbackUrl: a[6] as string,
    profilePictureLargeUrlExpirationTimestampMs: a[7] as string,
    name: a[9] as string,
    secondaryName: a[41] as string,
    normalizedNameForSearch: a[10] as string,
    normalizedSearchTerms: a[33] as string,
    isMessengerUser: a[11] as string,
    isMemorialized: a[12] as string,
    isManagedByViewer: a[35] as string,
    blockedByViewerStatus: a[14] as string,
    rank: a[17] as string,
    firstName: a[18] as string,
    contactType: a[19] as string,
    contactTypeExact: a[20] as string,
    authorityLevel: a[21] as string,
    messengerCallLogThirdPartyId: a[22] as string,
    profileRingColor: a[23] as string,
    requiresMultiway: a[24] as string,
    blockedSinceTimestampMs: a[25] as string,
    fbUnblockedSinceTimestampMs: a[46] as string,
    canViewerMessage: a[26] as string,
    profileRingColorExpirationTimestampMs: a[27] as string,
    phoneNumber: a[28] as string,
    emailAddress: a[29] as string,
    workCompanyId: a[30] as string,
    workCompanyName: a[31] as string,
    workJobTitle: a[32] as string,
    deviceContactId: a[34] as string,
    workForeignEntityType: a[36] as string,
    capabilities: a[37] as string,
    capabilities2: a[38] as string,
    // profileRingState: d[0],
    contactViewerRelationship: a[39] as string,
    gender: a[40] as string,
    contactReachabilityStatusType: a[43] as string,
    restrictionType: a[44] as string,
    waConnectStatus: a[45] as string,
    // isEmployee: !1
  }
}
