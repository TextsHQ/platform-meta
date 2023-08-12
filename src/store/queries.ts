import { eq, placeholder } from 'drizzle-orm'
import type { DrizzleDB } from './db'
import * as s from './schema'

// "sometimes Drizzle ORM you can go faster than better-sqlite3 driver"
// https://orm.drizzle.team/docs/performance

export function preparedQueries(db: DrizzleDB) {
  return {
    getAllKeyValues: db.select().from(s.keyValues).prepare(),
    getKeyValue: db.select({
      value: s.keyValues.value,
    }).from(s.keyValues).where(eq(s.keyValues.key, placeholder('key'))).prepare(),
    getContact: db
      .select({
        id: s.contacts.id,
        profilePictureUrl: s.contacts.profilePictureUrl,
        name: s.contacts.name,
        username: s.contacts.username,
        contact: s.contacts.contact,
      })
      .from(s.contacts)
      .limit(1)
      .where(eq(s.contacts.id, placeholder('contactId')))
      .prepare(),
  } as const
}
