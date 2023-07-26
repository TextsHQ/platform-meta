import fs from "fs";
import { parseRawPayload } from "./parsers.mjs";
import { drizzle } from "drizzle-orm/better-sqlite3";

// import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from "better-sqlite3";
import * as schema from "/Users/rahulvaidun/Texts/platform-instagram/dist/store/schema.js";
import { sql } from "drizzle-orm";

const sqlite = new Database("/Users/rahulvaidun/Texts/test122.db");
const db = drizzle(sqlite);
// await migrate(db, {
//   migrationsFolder: "/Users/rahulvaidun/Texts/platform-instagram/drizzle",
// });
// return db;

const rawPayload = fs.readFileSync("scripts/dbtest.json");
const rawd = parseRawPayload(rawPayload);

// if (rawd.deleteThenInsertThread) addThreads(rawd.deleteThenInsertThread);
const dbRet = await db
  .insert(schema.reactions)
  .values({
    threadKey: "105868004148209",
    timestampMs: new Date().getTime(),
    messageId: "mid.$cAAA7H5r_VlCPuuV-EGJiaA4MKwFx",
    actorId: "100428318021025",
    reaction: "❤️",
  })
  .returning({ insertedId: schema.reactions.threadKey });

const result = await db
  .select({
    threadKey: schema.reactions.threadKey,
  })
  .from(schema.reactions);
sqlite.close();
console.log("inserted, ", result[0]);
// if (rawd.verifyContactRowExists) addUsers(rawd.verifyContactRowExists);
// if (rawd.addParticipantIdToGroupThread)
// addParticipants(rawd.addParticipantIdToGroupThread);
// if (rawd.upsertMessage) addMessages(rawd.upsertMessage);
// if (rawd.upsertReaction) addReactions(rawd.upsertReaction);

async function addThreads(threads) {
  console.log(threads);
  const ret = await db
    .insert(schema.threads)
    .values(threads)
    .returning({ id: schema.threads.threadKey });
  console.log(ret);
}

function addUsers(users) {
  return db.insert(schema.users).values(users);
}

function addParticipants(participants) {
  return db.insert(schema.participants).values(participants);
}

function addMessages(messages) {
  return db.insert(schema.messages).values(messages);
}

function addReactions(reactions) {
  return db.insert(schema.reactions).values(reactions);
}
