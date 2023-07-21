import WebSocket from "ws";
import mqtt from "mqtt-packet";
import { get, set } from './settings.mjs'
import { getClientId, apiCall, parseMqttPacket } from './utils.mjs'

const threads = get('threads')
const threadId = Object.keys(threads)[0]

let messages = [threads[threadId].lastMessageDetails];

const cookies = get('cookies');

// construct the conversations from undecipherable data
function parseResponse(payload) {
  const j = JSON.parse(payload);

  // tasks we are interested in
  let lsCalls = {
    upsertMessage: [],
  };

  // loop through the tasks
  for (const item of j.step[2][2][2].slice(1)) {
    // if we are interested in the task then add it to the lsCalls object
    if (item[1][1] in lsCalls) {
      lsCalls[item[1][1]].push(item[1].slice(2));
    }
  }

  // major shout out to Radon Rosborough(username radian-software) and  Scott Conway (username scottmconway) for their work in deciphering the lsCalls
  // this parsing would not be possible without their repos
  // https://github.com/scottmconway/unzuckify
  // https://github.com/radian-software/unzuckify
  // https://intuitiveexplanations.com/tech/messenger Radon's blog post on reverse engineering messenger. messenger and instagram use the same protocol

  let newMessages = [];
  for (const item of lsCalls.upsertMessage) {
    const message = item[0];
    const sentTs = item[5][1];
    const messageId = item[8];
    const authorId = item[10][1];

    newMessages.push({
      message,
      messageId,
      sentTs,
      authorId,
    });
  }
  return { newMessages, cursor: j.step[2][1][3][5] };
}

// get the initial conversations
async function getCursor(cid, dtsg) {
  const response = await apiCall(cid, dtsg);
  const { cursor } = parseResponse(
    response.data.data.lightspeed_web_request_for_igd.payload
  );
  return cursor;
}

const { clientId, dtsg, userId: myUserId } = await getClientId();

let cursor = await getCursor(clientId, dtsg);
console.log(cursor);
const mqttSid = parseInt(Math.random().toFixed(16).split(".")[1]);

const ws = new WebSocket(
  `wss://edge-chat.instagram.com/chat?sid=${mqttSid}&cid=${clientId}`,
  {
    origin: "https://www.instagram.com",
    headers: {
      Host: "edge-chat.instagram.com",
      Connection: "Upgrade",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
      Upgrade: "websocket",
      Origin: "https://www.instagram.com",
      "Sec-WebSocket-Version": "13",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      Cookie: cookies,
    },
  }
);
ws.on("error", function incoming(data) {
  console.log("Error", data);
});

ws.on("open", function open() {
  console.log("connected");

  // initiate connection
  ws.send(
    mqtt.generate({
      cmd: "connect",
      protocolId: "MQIsdp",
      clientId: "mqttwsclient",
      protocolVersion: 3,
      clean: true,
      keepalive: 10,
      username: JSON.stringify({
        u: "userid", // doesnt seem to matter
        s: mqttSid,
        cp: 3,
        ecp: 10,
        chat_on: true,
        fg: false,
        d: clientId,
        ct: "cookie_auth",
        mqtt_sid: "",
        aid: 936619743392459, // app id
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
    })
  );

  // send app settings
  // need to wait for the ack before sending the subscribe
  ws.send(
    mqtt.generate({
      cmd: "publish",
      messageId: 1,
      qos: 1,
      topic: "/ls_app_settings",
      payload: JSON.stringify({
        ls_fdid: "",
        ls_sv: "9477666248971112", // version id
      }),
    })
  );
});

ws.on("message", function incoming(data) {
  if (data.toString("hex") == "42020001") {
    // ack for app settings

    // subscribe to /ls_resp
    ws.send(
      mqtt.generate({
        cmd: "subscribe",
        qos: 1,
        subscriptions: [
          {
            topic: "/ls_resp",
            qos: 0,
          },
        ],
        messageId: 3,
      })
    );

    // get messages
    ws.send(
      mqtt.generate({
        cmd: "publish",
        messageId: 6,
        qos: 1,
        dup: false,
        retain: false,
        topic: "/ls_req",
        payload: JSON.stringify({
          app_id: "936619743392459",
          payload: JSON.stringify({
            tasks: [
              {
                label: "228",
                payload: JSON.stringify({
                  thread_key: Number(threadId),
                  direction: 0,
                  reference_timestamp_ms: Number(
                    messages[messages.length - 1].sentTs
                  ),
                  reference_message_id: messages[messages.length - 1].messageId,
                  sync_group: 1,
                  cursor: cursor,
                }),
                queue_name: `mrq.${threadId}`,
                task_id: 1,
                failure_count: null,
              },
            ],
            epoch_id: Number(BigInt(Date.now()) << BigInt(22)),
            version_id: "9477666248971112",
          }),
          request_id: 6,
          type: 3,
        }),
      })
    );

    // not sure exactly what this does but it's required.
    // my guess is it "subscribes to database 1"?
    // may need similar code to get messages.
    ws.send(
      mqtt.generate({
        cmd: "publish",
        messageId: 5,
        qos: 1,
        dup: false,
        retain: false,
        topic: "/ls_req",
        payload: JSON.stringify({
          app_id: "936619743392459",
          payload: JSON.stringify({
            database: 1,
            epoch_id: Number(BigInt(Date.now()) << BigInt(22)),
            failure_count: null,
            last_applied_cursor: cursor,
            sync_params: null,
            version: 9477666248971112,
          }),
          request_id: 5,
          type: 2,
        }),
      })
    );
  } else if (data[0] != 0x42) {
    // for some reason fb sends wrongly formatted packets for PUBACK.
    // this causes mqtt-packet to throw an error.
    // this is a hacky way to fix it.
    parseMqttPacket(data).then((payload) => {
      if (!payload) return;
      // the broker sends 4 responses to the get messages command (request_id = 6)
      // 1. ack
      // 2. a response with a new cursor, the official client uses the new cursor to get more messages
      // however, the new cursor is not needed to get more messages, as the old cursor still works
      // not sure exactly what the new cursor is for, but it's not needed. the request_id is null
      // 3. unknown response with a request_id of 6. has no information
      // 4. the thread information. this is the only response that is needed. this packet has the text deleteThenInsertThread
      if (
        payload.request_id === null &&
        payload.payload.includes("upsertMessage")
      ) {
        console.log("got messages");
        parseMqttPacket(data).then((payload) => {
          const j = JSON.parse(payload.payload);
          console.log(JSON.stringify(j, null, 2));
          const { newMessages } = parseResponse(payload.payload);
          console.log(JSON.stringify(newMessages, null, 2));
          messages.push(...newMessages);
          ws.send(
            mqtt.generate({
              cmd: "publish",
              messageId: 6,
              qos: 1,
              dup: false,
              retain: false,
              topic: "/ls_req",
              payload: JSON.stringify({
                app_id: "936619743392459",
                payload: JSON.stringify({
                  tasks: [
                    {
                      label: "228",
                      payload: JSON.stringify({
                        thread_key: Number(threadId),
                        direction: 0,
                        reference_timestamp_ms: Number(
                          messages[messages.length - 1].sentTs
                        ),
                        reference_message_id:
                          messages[messages.length - 1].messageId,
                        sync_group: 1,
                        cursor: cursor,
                      }),
                      queue_name: `mrq.${threadId}`,
                      task_id: 1,
                      failure_count: null,
                    },
                  ],
                  epoch_id: Number(BigInt(Date.now()) << BigInt(22)),
                  version_id: "9477666248971112",
                }),
                request_id: 6,
                type: 3,
              }),
            })
          );
        });
      }
    });
  }
});

ws.on("close", function close() {
  console.log("disconnected");
  set(`messages.${threadId}`,messages)
});

process.on("SIGINT", () => {
  ws.close();
});
