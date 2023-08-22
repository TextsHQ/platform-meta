import fs from "fs";
import { parseRawPayload } from "./parsers.mjs";
import { getDB } from "./utils.mjs";
import * as schema from "/Users/rahulvaidun/Texts/platform-instagram/dist/store/schema.js";

const db = await getDB();

const rawPayload = fs.readFileSync("dbtest.json");
const rawd = parseRawPayload(rawPayload);
const parseMap = {
  deleteThenInsertThread: addThreads,
  verifyContactRowExists: addUsers,
  upsertMessage: addMessages,
  upsertReaction: addReactions,
  addParticipantIdToGroupThread: addParticipants,
};
// Remove empty lsCalls or lsCalls that are not in parseMap
for (const key in rawd) {
  if (rawd[key].length === 0 || !(key in parseMap)) {
    delete rawd[key];
  }
}
// for (const lsCallName in rawd) {
//   console.log(lsCallName);
//   await parseMap[lsCallName](rawd[key]);
// }
if ("deleteThenInsertThread" in rawd)
  await addThreads(rawd.deleteThenInsertThread);
if ("verifyContactRowExists" in rawd)
  await addUsers(rawd.verifyContactRowExists);
if ("addParticipantIdToGroupThread" in rawd)
  await addParticipants(rawd.addParticipantIdToGroupThread);
if ("upsertReaction" in rawd) await addReactions(rawd.upsertReaction);
if ("upsertMessage" in rawd) await addMessages(rawd.upsertMessage);
async function addThreads(threads) {
  // const sql = await db.insert(schema.threads).values(threads[0]).toSQL();
  // console.log(sql);
  // const ret = await db
  //   .insert(schema.threads)
  //   .values(threads)
  //   .onConflictDoNothing()
  //   .returning()
  //   .get();
  await db.insert(schema.threads).values(threads).onConflictDoNothing().run();
  console.log("added threads");
}

async function addUsers(users) {
  // console.log(users[0]);
  // const sql = await db.insert(schema.users).values(users[0]).toSQL();
  // console.log(sql);
  await db.insert(schema.users).values(users).onConflictDoNothing().run();
  console.log("added users");
}

function addParticipants(p) {
  // console.log(p[0]);
  // const sql = db.insert(schema.participants).values([p[2]]).toSQL();
  // console.log(sql);
  // toSQL() does not work just for this?

  db.insert(schema.participants).values(p).onConflictDoNothing().run();
  console.log("added participants");
}

function addMessages(messages) {
  // console.log(messages[0]);
  // const sql = db.insert(schema.messages).values(messages[0]).toSQL();
  // console.log(sql);
  return db
    .insert(schema.messages)
    .values(messages)
    .onConflictDoNothing()
    .run();
}

function addReactions(reactions) {
  // console.log(reactions[0]);
  // const sql = db.insert(schema.messages).values(reactions[0]).toSQL();
  // console.log(sql);
  return db
    .insert(schema.reactions)
    .values(reactions)
    .onConflictDoNothing()
    .run();
}
