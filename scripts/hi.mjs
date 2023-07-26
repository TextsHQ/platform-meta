import Database from "better-sqlite3";

import { drizzle } from "drizzle-orm/better-sqlite3";
import * as sqlite_core_1 from "drizzle-orm/sqlite-core";
const reactionsSchma = (0, sqlite_core_1.sqliteTable)("reactions", {
  original: (0, sqlite_core_1.blob)("_original", { mode: "json" }).$type(),
  threadKey: (0, sqlite_core_1.text)("threadKey")
    .notNull()
    .references(() => exports.threads.threadKey),
  timestampMs: (0, sqlite_core_1.integer)("timestampMs", { mode: "timestamp" }),
  messageId: (0, sqlite_core_1.text)("messageId")
    .notNull()
    .references(() => exports.messages.messageId),
  actorId: (0, sqlite_core_1.text)("actorId")
    .notNull()
    .references(() => exports.users.id),
  reaction: (0, sqlite_core_1.text)("reaction"),
});
const getDB = async () => {
  const sqlite = new Database("/Users/rahulvaidun/Texts/test.db");
  const db = drizzle(sqlite);
  return db;
};
const db = await getDB();
const res = db
  .insert(reactionsSchma)
  .values({
    threadKey: "105868004148209",
    timestampMs: "asdasd",
    messageId: "mid.$cAAA7H5r_VlCPuuV-EGJiaA4MKwFx",
    actorId: "100428318021025",
    reaction: "❤️",
    _original: { hi: "bye" },
  })
  .returning({ insertedId: reactionsSchma.threadKey });

console.log("inserted");
