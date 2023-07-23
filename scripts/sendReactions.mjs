import WebSocket from "ws";
import mqtt from "mqtt-packet";
import { get, set } from "./settings.mjs";
import { mqttSid, getClientId } from "./utils.mjs";

const cookies = get("cookies");
const threads = get("threads");
const threadIds = Object.keys(threads);

let threadId = get("selectedThread");
if (!threadId) {
  threadId = threadIds[Math.floor(Math.random() * threadIds.length)];
  set("selectedThread", threadId);
}
console.log(threads[threadId].lastMessageDetails.messageId);
process.exit(0);
const mqtt_sid = mqttSid;
const client_id = await getClientId();

const t = mqtt.generate({
  cmd: "connect",
  protocolId: "MQIsdp",
  clientId: "mqttwsclient",
  protocolVersion: 3,
  clean: true,
  keepalive: 10,
  username: JSON.stringify({
    u: "17841418030588216",
    s: mqtt_sid,
    cp: 3,
    ecp: 10,
    chat_on: true,
    fg: false,
    d: client_id,
    ct: "cookie_auth",
    mqtt_sid: "",
    aid: 936619743392459,
    st: [],
    pm: [],
    dc: "",
    no_auto_fg: true,
    gas: null,
    pack: [],
    php_override: "",
    p: null,
    a: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    aids: null,
  }),
});

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

// console.log(typing.toString("hex").match(/../g).join(" "));
// https://intuitiveexplanations.com/tech/messenger
// link above has good explanation of otid
const timestamp = BigInt(Date.now());
const epoch_id = timestamp << BigInt(22);
const otid = epoch_id + BigInt(Math.floor(Math.random() * 2 ** 22));
const hmm = JSON.stringify({
  app_id: "936619743392459",
  payload: JSON.stringify({
    tasks: [
      {
        label: "29",
        payload: JSON.stringify({
          thread_key: threadId,
          timestamp_ms: Number(timestamp),
          message_id: "",
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
    ],
    epoch_id: Number(epoch_id),
    version_id: "6243569662359088",
  }),
  request_id: 4,
  type: 3,
});

const t4 = mqtt.generate({
  cmd: "publish",
  dup: false,
  qos: 1,
  retain: false,
  topic: "/ls_req",
  messageId: 4,
  payload: hmm,
});

const ws = new WebSocket(
  `wss://edge-chat.instagram.com/chat?sid=${mqtt_sid}&cid=${client_id}`,
  {
    origin: "https://www.instagram.com",
    headers: {
      Cookie: cookies,
    },
  }
);

ws.on("error", function incoming(data) {
  // print the binary data received from the websocket server
  console.log("Error", data);
});

ws.on("open", function open() {
  console.log("connected");
  ws.send(t);
  // send typing indicator
  ws.send(typing);
  //wait 5 seconds
  setTimeout(() => {
    // send message
    ws.send(t4);
  }, 5000);

  // ws.send(t4);
});

ws.on("message", function incoming(data) {
  console.log("data", data);
});
