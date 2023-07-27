// sends a message this is a test to send messages to the user with the username specified in the username variable
import { ws, publishTask, isConnectedPromise } from "./socket.mjs";
import { getTimeValues, parseMqttPacket } from "./utils.mjs";
import { parseSearchResult } from "./parsers.mjs";
import { sendMessage } from "./sendMessages.mjs";
const username = "kishan_bagaria";

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
      if (payload.payload.includes("taskExists")) {
        // console.log(payload.payload);
        const res = parseSearchResult(payload.payload);
        if (!res.insertSearchResult) return;
        const user = res.insertSearchResult.filter(
          (i) => i.username === username
        )[0];
        if (!user) {
          console.log("username not found in search results");
          return;
        } else {
          console.log("sending message to", user);
          sendMessage(
            user.userId,
            "this is a test message sent from createThreads.mjs"
          );
        }
      }
    });
  } else {
  }
});

const { timestamp, epoch_id, otid } = getTimeValues();
// ws.send(
//   mqtt.generate({
//     cmd: "publish",
//     messageId: 6,
//     qos: 1,
//     dup: false,
//     retain: false,
//     topic: "/ls_req",
//     payload: JSON.stringify({
//       app_id: "936619743392459",
//       payload: JSON.stringify({
//         tasks: [
//           {
//             label: "30",
//             payload: JSON.stringify({
//               query: username,
//               supported_types: [1, 3, 4, 2, 6, 7, 8, 9, 14],
//               session_id: null,
//               surface_type: 15,
//               group_id: null,
//               thread_id: null,
//             }),
//             queue_name: JSON.stringify(["search_primary", timestamp]),
//             task_id: 1,
//             failure_count: null,
//           },
//         ],
//       }),
//     }),
//   })
// );

const val = isConnectedPromise.then(() => {
  // search for the user
  publishTask({
    label: "30",
    payload: JSON.stringify({
      query: username,
      supported_types: [1, 3, 4, 2, 6, 7, 8, 9, 14],
      session_id: null,
      surface_type: 15,
      group_id: null,
      thread_id: null,
    }),
    queue_name: JSON.stringify(["search_primary", timestamp.toString()]),
    task_id: 1,
    failure_count: null,
  });
  publishTask({
    label: "31",
    payload: JSON.stringify({
      query: username,
      supported_types: [1, 3, 4, 2, 6, 7, 8, 9, 14],
      session_id: null,
      surface_type: 15,
      group_id: null,
      thread_id: null,
    }),
    queue_name: JSON.stringify(["search_secondary"]),
    task_id: 2,
    failure_count: null,
  });
});
