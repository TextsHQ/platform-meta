import WebSocket from "ws";
import mqtt from "mqtt-packet";
import { get } from "./settings.mjs";
import { getClientId, apiCall, mqttSid, getTimeValues } from "./utils.mjs";

const cookies = get("cookies");

let isConnectedPromiseResolve;
export const isConnectedPromise = new Promise((resolve, reject) => {
  isConnectedPromiseResolve = resolve;
});

// construct the conversations from undecipherable data
function parseGetCursorResponse(payload) {
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
  const { cursor } = parseGetCursorResponse(
    response.data.data.lightspeed_web_request_for_igd.payload
  );
  return cursor;
}

const { clientId, dtsg, userId: myUserId } = await getClientId();

let cursor = await getCursor(clientId, dtsg);

export const ws = new WebSocket(
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
  console.error("Error", data);
});

ws.on("open", function open() {
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
  console.error("on msg from socket", data);
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
    isConnectedPromiseResolve?.();
    console.error("resolved promise");
  } else if (data[0] != 0x42) {
    // @TODO
    console.error("data", data);
  } else {
  }
});

ws.on("close", function close() {
  console.error("disconnected");
});

process.on("SIGINT", () => {
  ws.close();
});

export function publishTask(_tasks) {
  const tasks = Array.isArray(_tasks) ? _tasks : [_tasks];
  const { epoch_id } = getTimeValues();
  const bytesToSend = mqtt.generate({
    cmd: "publish",
    messageId: 6,
    qos: 1,
    dup: false,
    retain: false,
    topic: "/ls_req",
    payload: JSON.stringify({
      app_id: "936619743392459",
      payload: JSON.stringify({
        tasks,
        epoch_id,
        version_id: "9477666248971112",
      }),
      request_id: 6,
      type: 3,
    }),
  });
  console.error(
    JSON.stringify({
      app_id: "936619743392459",
      payload: JSON.stringify({
        tasks,
        epoch_id,
        version_id: "9477666248971112",
      }),
      request_id: 6,
      type: 3,
    })
  );
  ws.send(bytesToSend);
  return bytesToSend;
}
