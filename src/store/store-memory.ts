
import type { Message, Participant, Thread } from '@textshq/platform-sdk'
import { ChatStoreInterface } from '../types'

export class ChatMemoryStore implements ChatStoreInterface {
  private participants = new Map<string, Participant>()

  private threads = new Map<string, Thread>()

  private messages = new Map<string, Message[]>()

  async upsertParticipant(participant: Participant) {
    this.participants.set(participant.id, {
      ...(this.participants.get(participant.id) || {}),
      ...participant,
    })
  }

  async getParticipant(id: Participant['id']) {
    return this.participants.get(id)
  }

  async upsertThread(thread: Thread) {
    this.threads.set(thread.id, {
      ...(this.threads.get(thread.id) || {}),
      ...thread,
    })
  }

  async addThreads(threads: Thread[] = []) {
    threads.forEach(thread => this.upsertThread(thread))
  }

  async getThreads(): Promise<Thread[]> {
    return Array.from(this.threads.values())
  }

  async getThread(threadID: string) {
    return this.threads.get(threadID)
  }

  async addMessage(message: Message) {
    const messages = [
      ...(this.messages.get(message.threadID) || []),
      message,
    ].sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
    this.messages.set(message.threadID, messages)
  }

  async addMessages(messages: Message[] = []) {
    messages.forEach(message => this.addMessage(message))
  }

  async getMessages(threadID: string) {
    return this.messages.get(threadID) || []
  }

  async getAllMessages() {
    return Array.from(this.messages.values()).flat()
  }
}
