import { publishTask, isConnectedPromise, ws } from "./socket.mjs";
import { esMain, getTimeValues } from "./utils.mjs";
import { parseMqttPacket } from "./utils.mjs";
ws.on("message", function incoming(data) {
  if (data[0] != 0x42 && data.toString("hex") != "42020001") {
    parseMqttPacket(data).then((payload) => {
      if (!payload) return;
      // the broker sends 4 responses to the get messages command (request_id = 6)
      // 1. ack
      // 2. a response with a new cursor, the official client uses the new cursor to get more messages
      // however, the new cursor is not needed to get more messages, as the old cursor still works
      // not sure exactly what the new cursor is for, but it's not needed. the request_id is null
      // 3. unknown response with a request_id of 6. has no information
      // 4. the thread information. this is the only response that is needed. this packet has the text deleteThenInsertThread
      //   const j = JSON.parse(payload.payload);
      //   console.log(JSON.stringify(j, null, 2));
    });
  }
});
export function deleteThread(threadId) {
  // todo: check if you are sender of message

  publishTask({
    label: "146",
    payload: JSON.stringify({
      thread_key: threadId,
      remove_type: 0,
      sync_group: 1,
    }),
    queue_name: threadId,
    task_id: 1,
    failure_count: null,
  });
}
if (esMain(import.meta)) {
  const threadId = "100428318021025";

  isConnectedPromise.then(() => {
    console.log("deleting thread", threadId);
    deleteThread(threadId);
  });
}
