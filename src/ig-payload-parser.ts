type NumberString = `${number}`

type OperationKey =
  | 'mciTraceLog'
  | 'executeFirstBlockForSyncTransaction'
  | 'upsertMessage'
  | 'updateReadReceipt'
  | 'setForwardScore'
  | 'setMessageDisplayedContentTypes'
  | 'insertNewMessageRange'
  | 'upsertSequenceId'
  | 'executeFinallyBlockForSyncTransaction'
  | 'taskExists'
  | 'removeTask'
  | 'deleteThenInsertContactPresence'
  | 'upsertSyncGroupThreadsRange'
  | 'upsertInboxThreadsRange'
  | 'updateThreadsRangesV2'

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

export interface Response {
  request_id: number | null
  payload: string
  sp: string[]
  target: number
}

// interface DeserializedResponse extends Response {
//   payload: Payload
// }

export type SimpleArgType = string | number | boolean | null | undefined

export function generateCallList(payload: string) {
  const calls: [string, SimpleArgType[]][] = []

  function transformArg(arg: unknown): SimpleArgType {
    // Example: [19, "600"]
    if (Array.isArray(arg) && arg[0] === 19) {
      const numValue = Number(arg[1])
      if (Number.isSafeInteger(numValue)) {
        return numValue
      }
      return arg[1].toString()
    }

    // Example: [9]
    if (Array.isArray(arg) && arg[0] === 9) {
      return undefined
    }

    switch (typeof arg) {
      case 'boolean':
        return arg ? 1 : 0
      case 'undefined':
      case 'string':
      case 'number':
        return arg
      default:
        throw new Error('Invalid argument type')
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
          const methodName = item[1] as string
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
