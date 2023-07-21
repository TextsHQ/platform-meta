import WebSocket from "ws";
import mqtt from "mqtt-packet";
import { get, set } from "./settings.mjs"
import { mqttSid, getClientId } from "./utils.mjs"

const cookies = get('cookies');
const threads = get('threads')
const threadIDs = Object.keys(threads)
// const randomThreadID = threadIDs[Math.floor(Math.random() * threadIDs.length)]

// const parser = mqtt.parser({
//   protocolVersion: 3,
// });

const threadID = get('selectedThread');
const mqtt_sid = mqttSid;
const client_id = await getClientId()

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
        thread_key: threadID,
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
        label: "46",
        payload: JSON.stringify({
          thread_id: threadID,
          otid: otid.toString(),
          source: 0,
          send_type: 1,
          sync_group: 1,
          text: "this is a test message sent from script3.js using websockets and mqtt-packet",
          initiating_source: 1,
          skip_url_preview_gen: 0,
          text_has_links: 0,
        }),
        queue_name: threadID.toString(),
        task_id: 0,
        failure_count: null,
      },
      {
        label: "21",
        payload: JSON.stringify({
          thread_id: threadID,
          last_read_watermark_ts: Number(timestamp),
          sync_group: 1,
        }),
        queue_name: threadID.toString(),
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
