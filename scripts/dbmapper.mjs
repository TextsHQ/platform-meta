import * as schema from "/Users/rahulvaidun/Texts/platform-instagram/dist/store/schema.js";
import { getDB } from "./utils.mjs";
import { eq } from "drizzle-orm";

const db = await getDB();

async function mapThreads() {
    // const threads = await db.select({
    //     thread: {
    //         id: schema.threads.threadKey,
    //         readTs: schema.threads.lastReadWatermarkTimestampMs,
    //         lastActivityTs: schema.threads.lastActivityTimestampMs,
    //         type: schema.threads.threadType,
    //     },
    //     message: {
    //         id: schema.messages.messageId,
    //         text: schema.messages.text,
    //         sender: schema.messages.senderId,
    //         timestamp: schema.messages.timestampMs
    //     },
    //     participant: {
    //         id: schema.users.id,
    //         username: schema.users.username,
    //         imgURL: schema.users.profilePictureUrl
    //     }
    // }).from(schema.participants)
    // .leftJoin(schema.users, eq(schema.participants.userId, schema.users.id))
    // .leftJoin(schema.threads, eq(schema.participants.threadKey, schema.threads.threadKey))
    // .leftJoin(schema.messages, eq(schema.threads.threadKey, schema.messages.threadKey))
    // .all();

    // const threads = await db.select({
    //     threadKey: schema.threads.threadKey,
    //     participant: {
    //         id: schema.users.id,
    //         username: schema.users.username,
    //         imgURL: schema.users.profilePictureUrl
    //     }
    // }).from(schema.threads)
    // .leftJoin(schema.participants, eq(schema.participants.threadKey, schema.threads.threadKey))
    // .leftJoin(schema.users, eq(schema.participants.userId, schema.users.id))
    // .where(eq(schema.threads.threadKey, "100215018045203"))
    // .all();


    // const result = threads.reduce((acc, row) => {
    //     const { thread, message, participant  } = row;
    //     const {id: threadKey, readTs, lastActivityTs, type} = thread;
    //     if (!acc[threadKey]) {
    //         acc[threadKey] = { participants: [], messages: [],isUnread: lastActivityTs > readTs, type };
    //     }
    //     if (participant) {
    //         acc[threadKey].participants.push(participant);
    //     }
    //     if (message) {
    //         acc[threadKey].messages.push(message);
    //     }

    //     return acc;
    // }, {})

    const threadsTest = db.query.threads.findMany(
        {
            columns: {
                threadKey: true,
            },
            with: {
                participants: true,
                messages: true
            }
        }
    )

    console.log(JSON.stringify(threadsTest, null, 2))
}

mapThreads();