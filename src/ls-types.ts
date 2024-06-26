export const enum LightSpeedStep {
  BLOCK = 1,
  LOAD = 2,
  STORE = 3,
  STORE_ARRAY = 4,
  CALL_STORED_PROCEDURE = 5,
  CALL_NATIVE_TYPE_OPERATION = 6,
  CALL_NATIVE_OPERATION = 7,
  LIST = 8,
  UNDEFINED = 9,
  INFINITY = 10,
  NAN = 11,
  RETURN = 12,
  BOOL_TO_STR = 13,
  BLOBS_TO_STRING = 14,
  BLOBS_OF_STRING = 15,
  TO_BLOB = 16,
  I64_OF_FLOAT = 17,
  I64_TO_FLOAT = 18,
  I64_FROM_STRING = 19,
  I64_TO_STRING = 20,
  READ_GK = 21,
  READ_QE = 22,
  IF = 23,
  OR = 24,
  AND = 25,
  NOT = 26,
  IS_NULL = 27,
  ENFORCE_NOT_NULL = 28,
  GENERIC_EQUAL = 29,
  I64_EQUAL = 30,
  BLOB_EQUAL = 31,
  GENERIC_NOT_EQUAL = 32,
  I64_NOT_EQUAL = 33,
  BLOB_NOT_EQUAL = 34,
  GENERIC_GREATER_THAN = 35,
  I64_GREATER_THAN = 36,
  BLOB_GREATER_THAN = 37,
  GENERIC_GREATER_THAN_OR_EQUAL = 38,
  I64_GREATER_THAN_OR_EQUAL = 39,
  BLOB_GREATER_THAN_OR_EQUAL = 40,
  GENERIC_LESS_THAN = 41,
  I64_LESS_THAN = 42,
  BLOB_LESS_THAN = 43,
  GENERIC_LESS_THAN_OR_EQUAL = 44,
  I64_LESS_THAN_OR_EQUAL = 45,
  BLOB_LESS_THAN_OR_EQUAL = 46,
  THROW = 47,
  LOG_CONSOLE = 48,
  LOGGER_LOG = 49,
  NATIVE_OP_ARRAY_CREATE = 50,
  NATIVE_OP_ARRAY_APPEND = 51,
  NATIVE_OP_ARRAY_GET_SIZE = 52,
  NATIVE_OP_MAP_CREATE = 53,
  NATIVE_OP_MAP_GET = 54,
  NATIVE_OP_MAP_SET = 55,
  NATIVE_OP_MAP_KEYS = 56,
  NATIVE_OP_MAP_DELETE = 57,
  NATIVE_OP_MAP_HAS = 58,
  NATIVE_OP_STR_JOIN = 59,
  NATIVE_OP_CURRENT_TIME = 60,
  NATIVE_OP_JSON_STRINGIFY = 61,
  NATIVE_OP_RNG_NUM = 62,
  NATIVE_OP_LOCALIZATION_SUPPORTED = 63,
  NATIVE_OP_LOCALIZATION_SUPPORTED_V2 = 64,
  NATIVE_OP_RESOLVE_LOCALIZED = 65,
  NATIVE_OP_RESOLVE_LOCALIZED_V2 = 66,
  ADD = 68,
  I64_ADD = 69, //  [69,[2,1],[19,"0"]]
  I64_CAST = 70,
  READ_JUSTKNOB = 71,
  READ_IGGK = 72,
  GET_RUN_MODE = 73,
  STR_TRIM = 74,
  STR_REPLACE = 75,
  JOIN = 76,
  STR_LIKE = 77,
  LENGTH = 78,
  IN = 79,
  IN_VEC = 80,
  SUB = 81,
  MUL = 82,
  DIV = 83,
  MOD = 84,
  I64_SUB = 85,
  I64_MUL = 86,
  I64_DIV = 87,
  I64_MOD = 88,
  I64_IN = 89,
  I64_IN_VEC = 90,
  BITWISE_LEFT_SHIFT = 91,
  BITWISE_RIGHT_SHIFT = 92,
  ARITHMETIC_RIGHT_SHIFT = 93,
  BITWISE_AND = 94,
  BITWISE_OR = 95,
  BITWISE_XOR = 96,
  TERNARY = 97,
  XOR = 98,
  NULLISH_COALESE = 99,
  READ_COLUMN = 100,
  READ_COLUMN_REF = 101,
  READ_GROUP_COUNT = 102,
  COMMENT = 103,
  IMPORT = 104,
  LOOP = 105,
  QUERY_COMPARISON_EQUAL = 106,
  QUERY_COMPARISON_NOT_EQUAL = 107,
  QUERY_COMPARISON_GREATER_THAN = 108,
  QUERY_COMPARISON_GREATER_THAN_OR_EQUAL = 109,
  QUERY_COMPARISON_LESS_THAN = 110,
  QUERY_COMPARISON_LESS_THAN_OR_EQUAL = 111,
  QUERY_MERGE_CONSTRAINTS = 112,
  QUERY_FETCH_ROWS = 113,
  QUERY_FILTER_ROWS = 114,
  QUERY_SORT_ROWS_BY = 115,
  QUERY_DELETE_ROWS = 116,
  QUERY_SLICE_ROWS = 117,
  QUERY_COUNT_ROWS = 118,
  QUERY_PEEK_NEXT_ROW_ID = 119,
  QUERY_UPDATE_ROWS = 120,
  QUERY_INSERT_ROWS = 121,
  QUERY_PUT_ROWS = 122,
  QUERY_FOREACH_ROW = 123,
  QUERY_SELECT_MATCH_ROW = 124,
  QUERY_CURSOR_SLICE = 125,
  QUERY_GROUP_BY = 126,
  SUB_STRING = 127,
}

export type StoredProcedureName =
  | 'addParticipantIdToGroupThread'
  | 'appendDataTraceAddon'
  | 'applyAdminMessageCTA'
  | 'applyNewGroupThread'
  | 'bumpThread'
  | 'changeViewerStatus'
  | 'checkAuthoritativeMessageExists'
  | 'clearPinnedMessages'
  | 'collapseAttachments'
  | 'computeDelayForTask'
  | 'deleteBannersByIds'
  | 'deleteExistingMessageRanges'
  | 'deleteMessage'
  | 'deleteReaction'
  | 'deleteRtcOngoingCallData'
  | 'deleteThenInsertAdminApprovalRequest'
  | 'deleteThenInsertAttachmentConversion'
  | 'deleteThenInsertContact'
  | 'deleteThenInsertContactPresence'
  | 'deleteThenInsertIGContactInfo'
  | 'deleteThenInsertIgThreadInfo'
  | 'deleteThenInsertMessage'
  | 'deleteThenInsertMessageRequest'
  | 'deleteThenInsertProactiveWarningSettings'
  | 'deleteThenInsertThread'
  | 'deleteThread'
  | 'executeFinallyBlockForSyncTransaction'
  | 'executeFirstBlockForSyncTransaction'
  | 'getFirstAvailableAttachmentCTAID'
  | 'handleFailedTask'
  | 'handleRepliesOnUnsend'
  | 'handleSyncFailure'
  | 'hasMatchingAttachmentCTA'
  | 'insertAttachment'
  | 'insertAttachmentCta'
  | 'insertAttachmentItem'
  | 'insertBlobAttachment'
  | 'insertIcebreakerData'
  | 'insertMessage'
  | 'insertNewMessageRange'
  | 'insertQuickReplyCTA'
  | 'insertSearchResult'
  | 'insertSearchSection'
  | 'insertStickerAttachment'
  | 'insertXmaAttachment'
  | 'issueError'
  | 'issueInsertPersistentMenuCtasForThreadTask'
  | 'issueInsertPersistentMenuItemsForThreadTask'
  | 'issueNewError'
  | 'issueNewTask'
  | 'mailboxTaskCompletionApiOnTaskCompletion'
  | 'markOptimisticMessageFailed'
  | 'markThreadRead'
  | 'mciTraceLog'
  | 'moveThreadToInboxAndUpdateParent'
  | 'overwriteAllThreadParticipantsAdminStatus'
  | 'queryAdditionalGroupThreads'
  | 'removeAllParticipantsForThread'
  | 'removeOptimisticGroupThread'
  | 'removeParticipantFromThread'
  | 'removeTask'
  | 'replaceOptimisticReaction'
  | 'replaceOptimisticThread'
  | 'replaceOptimsiticMessage'
  | 'resetIsLoadingBeforeOrAfterForThreadRangeV2'
  | 'setBotResponseInfo'
  | 'setForwardScore'
  | 'setHMPSStatus'
  | 'setMessageDisplayedContentTypes'
  | 'setMessageTextHasLinks'
  | 'setMessagesViewedPlugin'
  | 'setPinnedMessage'
  | 'setRegionHint'
  | 'storyContactSyncFromBucket'
  | 'syncUpdateThreadName'
  | 'taskExists'
  | 'threadsRangesQuery'
  | 'truncatePresenceDatabase'
  | 'truncateTablesForSyncGroup'
  | 'updateAttachmentCtaAtIndexIgnoringAuthority'
  | 'updateAttachmentItemCtaAtIndex'
  | 'updateCommunityThreadStaleState'
  | 'updateDeliveryReceipt'
  | 'updateExistingMessageRange'
  | 'updateExtraAttachmentColumns'
  | 'updateFilteredThreadsRanges'
  | 'updateForRollCallMessageDeleted'
  | 'updateLastSyncCompletedTimestampMsToNow'
  | 'updateMessagesOptimisticContext'
  | 'updateOptimisticEphemeralMediaState'
  | 'updateOrInsertReactionV2'
  | 'updateOrInsertThread'
  | 'updateParentFolderReadWatermark'
  | 'updateParticipantCapabilities'
  | 'updateParticipantLastMessageSendTimestamp'
  | 'updateParticipantSubscribeSourceText'
  | 'updatePreviewUrl'
  | 'updateReadReceipt'
  | 'updateSearchQueryStatus'
  | 'updateSelectiveSyncState'
  | 'updateSubscriptErrorMessage'
  | 'updateThreadApprovalMode'
  | 'updateThreadInviteLinksInfo'
  | 'updateThreadMuteSetting'
  | 'updateThreadNullState'
  | 'updateThreadParticipantAdminStatus'
  | 'updateThreadSnippet'
  | 'updateThreadSnippetFromLastMessage'
  | 'updateThreadsRangesV2'
  | 'updateTypingIndicator'
  | 'updateUnsentMessageCollapsedStatus'
  | 'upsertFolder'
  | 'upsertFolderSeenTimestamp'
  | 'upsertGradientColor'
  | 'upsertInboxThreadsRange'
  | 'upsertMessage'
  | 'upsertProfileBadge'
  | 'upsertReaction'
  | 'upsertSequenceId'
  | 'upsertSyncGroupThreadsRange'
  | 'upsertTheme'
  | 'verifyCommunityMemberContextualProfileExists'
  | 'verifyContactParticipantExist'
  | 'verifyContactRowExists'
  | 'verifyCustomCommandsExist'
  | 'verifyHybridThreadExists'
  | 'verifyThreadExists'
  | 'writeCTAIdToThreadsTable'
  | 'writeThreadCapabilities'
