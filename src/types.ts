import type { Message, Participant, PlatformAPI, Thread } from '@textshq/platform-sdk'

export interface ChatStoreInterface {
  upsertParticipant(participant: Participant): Promise<void>
  getParticipant(id: Participant['id']): Promise<Participant | undefined>
  upsertThread(thread: Thread): Promise<void>
  addThreads(threads?: Thread[]): Promise<void>
  getThreads(): Promise<Thread[]>
  getThread(threadID: string): Promise<Thread | undefined>
  addMessage(message: Message): Promise<void>
  addMessages(messages?: Message[]): Promise<void>
  getMessages(threadID: string): Promise<Message[]>
  getAllMessages(): Promise<Message[]>
}

export type MethodReturnType<T, K extends keyof T> = T[K] extends (...args: any[]) => infer R ? R : never

export type PAPIReturn<K extends keyof PlatformAPI> = Promise<Awaited<MethodReturnType<PlatformAPI, K>>>

// @TODO: replace with responses from IG API
export type IGThread = Record<string, any>
export type IGMessage = Record<string, any>
export type IGParticipant = Record<string, any>
