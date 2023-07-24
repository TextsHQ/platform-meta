import type { Message, Participant, Thread } from '@textshq/platform-sdk'
import { eq, sql } from 'drizzle-orm'
import { DrizzleDB } from './db'
import * as schema from './schema';
import { ChatStoreInterface } from '../types';

export class ChatDBStore implements ChatStoreInterface {
  constructor(readonly db: DrizzleDB) {}

  public async upsertParticipant(participant: Participant) {
    await this.db.run(sql`INSERT INTO participants(id, name) VALUES(${participant.id}, ${participant.name}) ON CONFLICT(id) DO UPDATE SET name = excluded.name`;
  }

  getParticipant(id: Participant['id']) {
    const participant = this.db.select().from(schema.participants).where(eq(schema.participants.id, id)).all();
    return Promise.resolve(participant[0]); // Assume the id is unique and can only return 1 row
  }

  public async upsertThread(thread: Thread) {
    const keys = Object.keys(thread);
    const values = keys.map(key => thread[key]);

    let query = `INSERT INTO threads(${keys.join(', ')}) VALUES(${values.map(() => '?').join(', ')}) ON CONFLICT(id) DO UPDATE SET `;

    // Here we're updating all fields of the thread
    query += keys.map(key => `${key} = excluded.${key}`).join(', ');

    await sql(query, ...values);
  }

  public async addThreads(threads: Thread[] = []) {
    for (const thread of threads) {
      await this.upsertThread(thread);
    }
  }

  getThreads(): Promise<Thread[]> {
    const threads = this.db.select().from(schema.threads).all().map(thread => ({
      ...thread,
      participants: null,
      messages: null,
    }))
    return Promise.resolve(threads);
  }

  public async getThread(threadID: string): Promise<Thread> {
    const thread = await this.db.run(sql`SELECT * FROM threads WHERE id = ${threadID}`;
    return thread[0]; // Assume the id is unique and can only return 1 row
  }

  public async addMessage(message: Message) {
    const keys = Object.keys(message);
    const values = keys.map(key => message[key]);

    const query = `INSERT INTO messages(${keys.join(', ')}) VALUES(${values.map(() => '?').join(', ')})`;

    await sql(query, ...values);
  }

  public async addMessages(messages: Message[] = []) {
    for (const message of messages) {
      await this.addMessage(message);
    }
  }

  public async getMessages(threadID: string): Promise<Message[]> {
    const messages = await this.db.run(sql`SELECT * FROM messages WHERE threadID = ${threadID} ORDER BY timestamp ASC`;
    return messages;
  }

  public async getAllMessages(): Promise<Message[]> {
    const messages = await this.db.run(sql`SELECT * FROM messages`
    return messages;
  }
}
