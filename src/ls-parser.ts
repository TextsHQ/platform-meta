import { smartJSONStringify } from '@textshq/platform-sdk/dist/json'
import { LightSpeedStep, StoredProcedureName } from './ls-types'
import { getLogger } from './logger'
import { metaJSONStringify } from './util'

export type SimpleArgType = string | number | boolean | null | undefined

function getType(value: unknown) {
  const type = typeof value
  if (type !== 'object') return type
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  throw new Error(`Unknown type: ${type} for value: ${smartJSONStringify(value)}`)
}

// this is purely for optimization
// all methods should still be included in StoredProcedureName
// and also have a corresponding method in the payload handler
export const IGNORED_CALLS = new Set([
  'appendDataTraceAddon',
  'applyAdminMessageCTA',
  'applyNewGroupThread',
  'bumpThread',
  'changeViewerStatus',
  'checkAuthoritativeMessageExists',
  'clearPinnedMessages',
  'collapseAttachments',
  'computeDelayForTask',
  'deleteBannersByIds',
  'deleteRtcOngoingCallData',
  'deleteThenInsertAttachmentConversion',
  'deleteThenInsertContactPresence',
  'deleteThenInsertMessageRequest',
  'deleteThenInsertProactiveWarningSettings',
  'getFirstAvailableAttachmentCTAID',
  'handleRepliesOnUnsend',
  'hasMatchingAttachmentCTA',
  'hybridThreadDelete',
  'insertAttachmentItem',
  'insertIcebreakerData',
  'insertSearchSection',
  'issueNewTask',
  'mailboxTaskCompletionApiOnTaskCompletion',
  'markThreadRead',
  'mciTraceLog',
  'moveThreadToInboxAndUpdateParent',
  'overwriteAllThreadParticipantsAdminStatus',
  'queryAdditionalGroupThreads',
  'removeAllParticipantsForThread',
  'removeTask',
  'replaceOptimisticReaction',
  'setBotResponseInfo',
  'setForwardScore',
  'setHMPSStatus',
  'setMessageDisplayedContentTypes',
  'setMessageTextHasLinks',
  'setPinnedMessage',
  'setRegionHint',
  'shimCopyAllParticipantNicknamesForThread',
  'syncUpdateThreadName',
  'taskExists',
  'transportHybridParticipantUpdateReceipts',
  'truncateMetadataThreads',
  'truncatePresenceDatabase',
  'updateAttachmentCtaAtIndexIgnoringAuthority',
  'updateAttachmentItemCtaAtIndex',
  'updateCommunityThreadStaleState',
  'updateDeliveryReceipt',
  'updateExtraAttachmentColumns',
  'updateForRollCallMessageDeleted',
  'updateLastSyncCompletedTimestampMsToNow',
  'updateMessagesOptimisticContext',
  'updateOptimisticEphemeralMediaState',
  'updateOrInsertReactionV2',
  'updateParentFolderReadWatermark',
  'updateParticipantCapabilities',
  'updateParticipantLastMessageSendTimestamp',
  'updateParticipantSubscribeSourceText',
  'updatePreviewUrl',
  'updateSearchQueryStatus',
  'updateSelectiveSyncState',
  'updateThreadApprovalMode',
  'updateThreadAuthorityAndMappingWithOTIDFromJID',
  'updateThreadInviteLinksInfo',
  'updateThreadNullState',
  'updateThreadParticipantAdminStatus',
  'updateThreadSnippet',
  'updateThreadSnippetFromLastMessage',
  'updateUnsentMessageCollapsedStatus',
  'upsertFolder',
  'upsertFolderSeenTimestamp',
  'upsertGradientColor',
  'upsertProfileBadge',
  'upsertSequenceId',
  'upsertTheme',
  'verifyCommunityMemberContextualProfileExists',
  'verifyContactParticipantExist',
  'verifyHybridThreadExists',
  'writeCTAIdToThreadsTable',
  'writeThreadCapabilities',
])

const logger = getLogger('META', 'LightSpeedParser')

export type LSParserPayload = { procedure: StoredProcedureName, args: SimpleArgType[] }

export class LSParser {
  payloads: LSParserPayload[] = []

  private store = new Map()

  private static parse(payload: string) {
    const parser = new LSParser()
    const { step } = JSON.parse(payload)
    parser.decode(step)
    return parser.payloads
  }

  decode(data: any[]): any {
    const step_type = data[0] as LightSpeedStep
    const step_data = data.slice(1)
    switch (step_type) {
      case LightSpeedStep.BLOCK:
        for (const block_data of step_data) {
          this.decode(block_data)
        }
        break
      case LightSpeedStep.LOAD:
        return this.store.get(step_data[0])
      case LightSpeedStep.STORE:
        // eslint-disable-next-line no-case-declarations
        const value = this.decode(step_data[1])
        this.store.set(step_data[0], value)
        break
      case LightSpeedStep.STORE_ARRAY:
        this.store.set(step_data[0], step_data[1])
        this.decode(step_data.slice(2)[0])
        break
      case LightSpeedStep.CALL_STORED_PROCEDURE:
        this.handleStoredProcedure(step_data)
        break
      case LightSpeedStep.I64_FROM_STRING:
        return this.getValue(data)
      case LightSpeedStep.IF:
        // eslint-disable-next-line no-case-declarations
        const statement = step_data[0]
        // eslint-disable-next-line no-case-declarations
        const result = this.decode(statement)
        if (result) {
          this.decode(step_data[1])
          break
        }

        if (step_data.length >= 3 && step_data[2]) {
          this.decode(step_data[2])
        }
        break
      case LightSpeedStep.NOT:
        return this.decode(step_data[0])
      case LightSpeedStep.LOGGER_LOG: {
        const [msg, level] = (step_data as string[]) || []
        const log = (level === 'error' || level === 'warn' || level === 'warn')
          ? console[level] : console.log
        log('LSParser [LOGGER_LOG]', level, msg)
      }
        break
      default:
        console.log('[LSParser] skipping:', step_type, step_data)
    }
  }

  private handleStoredProcedure(data: any[]) {
    try {
      const procedure = data[0] as StoredProcedureName
      if (IGNORED_CALLS.has(procedure)) return
      const procedure_data = data.slice(1)
      const result_array: SimpleArgType[] = []
      for (let i = 0; i < procedure_data.length; i++) {
        const prop_data = procedure_data[i]
        result_array[i] = this.getValue(prop_data)
      }
      this.payloads.push({ procedure, args: result_array })
    } catch (e) {
      logger.error(e)
    }
  }

  private getValue(data: SimpleArgType | SimpleArgType[]) {
    const type = getType(data)
    switch (type) {
      case 'string':
      case 'boolean':
      case 'number':
      case 'undefined':
      case 'bigint': // we don't expect to see this
        return data
      case 'null': return null
      case 'array': {
        const typedData = data as unknown as [LightSpeedStep, ...SimpleArgType[]]
        switch (typedData[0]) {
          case LightSpeedStep.LOAD: return this.decode(typedData)
          case LightSpeedStep.UNDEFINED: return null
          case LightSpeedStep.I64_FROM_STRING: return BigInt(typedData[1]).toString()
          case LightSpeedStep.I64_ADD: {
            console.warn('I64_ADD', typedData)
            return
          }
          default: throw new Error(`Unknown step type: ${typedData[0]} for value: ${metaJSONStringify(data as any)}`)
        }
      }
      default: throw new Error(`Unknown type: ${type} for value: ${metaJSONStringify(data as any)}`)
    }
  }
}
