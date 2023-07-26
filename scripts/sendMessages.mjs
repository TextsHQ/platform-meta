// send a message to a user with user id
import WebSocket from "ws";
import mqtt from "mqtt-packet";
import { get, set } from "./settings.mjs";
import { getTimeValues, esMain } from "./utils.mjs";
import { ws, publishTask, isConnectedPromise } from "./socket.mjs";

export function sendMessage(threadId, message) {
  // typing indicator
  const typing = mqtt.generate({
    cmd: "publish",
    messageId: 9,
    topic: "/ls_req",
    payload: JSON.stringify({
      app_id: "936619743392459",
      payload: JSON.stringify({
        label: "3",
        payload: JSON.stringify({
          thread_key: threadId,
          is_group_thread: 0,
          is_typing: 1,
          attribution: 0,
        }),
        version: "6243569662359088",
      }),
      request_id: 45,
      type: 4,
    }),
  });
  const { timestamp, otid } = getTimeValues();
  const tasks = [
    {
      label: "46",
      payload: JSON.stringify({
        thread_id: threadId,
        otid: otid.toString(),
        source: 0,
        send_type: 1,
        sync_group: 1,
        text: message,
        initiating_source: 1,
        skip_url_preview_gen: 0,
        text_has_links: 0,
      }),
      queue_name: threadId.toString(),
      task_id: 0,
      failure_count: null,
    },
    {
      label: "21",
      payload: JSON.stringify({
        thread_id: threadId,
        last_read_watermark_ts: Number(timestamp),
        sync_group: 1,
      }),
      queue_name: threadId.toString(),
      task_id: 1,
      failure_count: null,
    },
  ];
  isConnectedPromise.then(() => {
    ws.send(typing);
    //wait 3 seconds
    setTimeout(() => {
      // send message
      publishTask(tasks);
    }, 3000);
  });
}

if (esMain(import.meta)) {
  ws.on("message", function incoming(data) {
    console.log("data", data);
  });
  const cookies = get("cookies");
  const threads = get("threads");
  const threadIds = Object.keys(threads);
  const message =
    "this is a test message sent from script3.js using websockets and mqtt-packet";

  let threadId = get("selectedThread");
  if (!threadId) {
    threadId = threadIds[Math.floor(Math.random() * threadIds.length)];
    set("selectedThread", threadId);
  }
  sendMessage(threadId, message);
}
