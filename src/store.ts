import type { Message, Participant, Thread } from '@textshq/platform-sdk'

export class ChatMemoryStore {
  private participants = new Map<string, Participant>()

  private threads = new Map<string, Thread>()

  private messages = new Map<string, Message[]>()

  public upsertParticipant(participant: Participant) {
    this.participants.set(participant.id, {
      ...(this.participants.get(participant.id) || {}),
      ...participant,
    })
  }

  public getParticipant(id: Participant['id']) {
    return this.participants.get(id)
  }

  public upsertThread(thread: Thread) {
    this.threads.set(thread.id, {
      ...(this.threads.get(thread.id) || {}),
      ...thread,
    })
  }

  public addThreads(threads: Thread[] = []) {
    threads.forEach(thread => this.upsertThread(thread))
  }

  public getThreads(): Thread[] {
    return Array.from(this.threads.values())
  }

  public getThread(threadID: string) {
    return this.threads.get(threadID)
  }

  public addMessage(message: Message) {
    const messages = [
      ...(this.messages.get(message.threadID) || []),
      message,
    ].sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
    this.messages.set(message.threadID, messages)
  }

  public addMessages(messages: Message[] = []) {
    messages.forEach(message => this.addMessage(message))
  }

  public getMessages(threadID: string) {
    return this.messages.get(threadID) || []
  }

  public getAllMessages() {
    return Array.from(this.messages.values()).flat()
  }
}
