type NumberString = `${number}`

export type OperationKey =
  | 'addParticipantIdToGroupThread'
  | 'bumpThread'
  | 'checkAuthoritativeMessageExists'
  | 'clearPinnedMessages'
  | 'computeDelayForTask'
  | 'deleteExistingMessageRanges'
  | 'deleteMessage'
  | 'deleteReaction'
  | 'deleteThenInsertContact'
  | 'deleteThenInsertContactPresence'
  | 'deleteThenInsertIGContactInfo'
  | 'deleteThenInsertIgThreadInfo'
  | 'deleteThenInsertMessageRequest'
  | 'deleteThenInsertThread'
  | 'deleteThread'
  | 'executeFinallyBlockForSyncTransaction'
  | 'executeFirstBlockForSyncTransaction'
  | 'getFirstAvailableAttachmentCTAID'
  | 'handleFailedTask'
  | 'hasMatchingAttachmentCTA'
  | 'insertAttachmentCta'
  | 'insertAttachmentItem'
  | 'insertBlobAttachment'
  | 'insertMessage'
  | 'insertNewMessageRange'
  | 'insertSearchResult'
  | 'insertSearchSection'
  | 'insertXmaAttachment'
  | 'issueError'
  | 'issueNewError'
  | 'markThreadRead'
  | 'mciTraceLog'
  | 'moveThreadToInboxAndUpdateParent'
  | 'removeOptimisticGroupThread'
  | 'removeParticipantFromThread'
  | 'removeTask'
  | 'replaceOptimisticThread'
  | 'replaceOptimsiticMessage'
  | 'setForwardScore'
  | 'setHMPSStatus'
  | 'setMessageDisplayedContentTypes'
  | 'setMessageTextHasLinks'
  | 'setRegionHint'
  | 'syncUpdateThreadName'
  | 'taskExists'
  | 'threadsRangesQuery'
  | 'updateAttachmentCtaAtIndexIgnoringAuthority'
  | 'updateAttachmentItemCtaAtIndex'
  | 'updateDeliveryReceipt'
  | 'updateExistingMessageRange'
  | 'updateFilteredThreadsRanges'
  | 'updateLastSyncCompletedTimestampMsToNow'
  | 'updateMessagesOptimisticContext'
  | 'updateParentFolderReadWatermark'
  | 'updateParticipantLastMessageSendTimestamp'
  | 'updateReadReceipt'
  | 'updateSearchQueryStatus'
  | 'updateThreadParticipantAdminStatus'
  | 'updateThreadSnippet'
  | 'updateThreadsRangesV2'
  | 'upsertFolderSeenTimestamp'
  | 'upsertInboxThreadsRange'
  | 'upsertMessage'
  | 'upsertReaction'
  | 'upsertSequenceId'
  | 'upsertSyncGroupThreadsRange'
  | 'verifyContactRowExists'
  | 'verifyThreadExists'
  | 'writeCTAIdToThreadsTable'
  | 'writeThreadCapabilities'

type OperationStep = [
  5,
  OperationKey,
  ...Array<NumberString | string | boolean>,
]

type NestedStep = [number, number, number, OperationStep]

type Step =
  | [number, OperationStep]
  | [number, NestedStep, [number, OperationStep]]
  | [number, [number, NestedStep], [number, OperationStep]]
  | [
    number,
    [number, NestedStep],
    [number, NestedStep],
    [number, OperationStep],
  ]

interface Payload {
  name: null
  step: Step[]
}

export interface IGResponse {
  request_id: number | null
  payload: string
  sp: string[]
  target: number
}

// interface DeserializedResponse extends Response {
//   payload: Payload
// }

export type SimpleArgType = string | number | boolean | null | undefined

const maxSafeIntStr = Number.MAX_SAFE_INTEGER.toString()
const minSafeIntStr = Number.MIN_SAFE_INTEGER.toString()

export function safeNumberOrString(input: unknown): number | string {
  if (typeof input !== 'string' && typeof input !== 'number') return String(input)

  const stringValue = input.toString()
  const isPositive = stringValue[0] !== '-'
  const len = stringValue.length

  if (
    (isPositive && (len < maxSafeIntStr.length || (len === maxSafeIntStr.length && stringValue <= maxSafeIntStr)))
    || (!isPositive && (len < minSafeIntStr.length || (len === minSafeIntStr.length && stringValue >= minSafeIntStr)))
  ) {
    return Number(stringValue)
  }

  return stringValue
}

export function generateCallList(payload: string) {
  if (!payload) {
    console.error(`Invalid payload: ${payload}`)
    return []
  }

  const calls: [OperationKey, SimpleArgType[]][] = []

  function transformArg(arg: unknown): SimpleArgType {
    // Example: [19, "600"]
    if (Array.isArray(arg) && arg[0] === 19) {
      // const numValue = Number(arg[1])
      // if (Number.isSafeInteger(numValue)) {
      //   return numValue
      // }
      return arg[1].toString()
      // return safeNumberOrString(arg[1])
    }

    // Example: [9]
    if (Array.isArray(arg) && arg[0] === 9) {
      return undefined
    }

    if (Array.isArray(arg)) {
      return JSON.stringify(arg)
    }

    switch (typeof arg) {
      case 'boolean':
        return arg ? 1 : 0
      case 'undefined':
      case 'string':
      case 'number':
        return arg
      default:
        console.error('Invalid argument', arg)
        throw new Error(`Invalid argument type:  ${typeof arg}`)
    }
  }

  function processStep(step: Step[] | NestedStep[] | OperationStep[]): void {
    if (!step || !Array.isArray(step)) {
      console.error('Invalid step', step)
      throw new Error('Invalid step!')
    }

    for (const item of step) {
      if (Array.isArray(item)) {
        // Base case: Detecting an operation step
        if (item[0] === 5 && typeof item[1] === 'string') {
          const methodName = item[1] as OperationKey
          const args = item.slice(2).map(arg => transformArg(arg))
          calls.push([methodName, args])
        } else {
          // Recursive call to handle nested steps
          processStep(item as Step[])
        }
      }
    }
  }

  // Extract the actual payload from the provided data
  const internalPayload = JSON.parse(payload) as Payload
  if (!internalPayload.step) {
    console.error('Invalid payload', internalPayload)
    throw new Error('Invalid payload!')
  }

  processStep(internalPayload.step)

  return calls
}

export type CallList = ReturnType<typeof generateCallList>
export type IGSocketPayload = Parameters<typeof generateCallList>[0]
