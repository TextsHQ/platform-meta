import WebSocket from "ws";
import axios from "axios";
import mqtt from "mqtt-packet";
import "dotenv/config";
import fs from "fs";
// import { uuid } from "uuidv4";
const args = process.argv.slice(2);

import { get, set } from './settings.mjs'
const cookies = get('cookies');

async function getClientId() {
  const response = await axios.get("https://www.instagram.com/direct/", {
    headers: {
      authority: "www.instagram.com",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
      "cache-control": "max-age=0",
      cookie: cookies,
      "sec-ch-prefers-color-scheme": "light",
      "sec-ch-ua":
        '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      "sec-ch-ua-full-version-list":
        '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.133", "Google Chrome";v="114.0.5735.133"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-ch-ua-platform-version": '"13.2.1"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      "viewport-width": "558",
    },
  });
  const resp = response.data;
  const clientId = resp.slice(resp.indexOf('{"clientID":')).split('"')[3];
  const dtsg = resp.slice(resp.indexOf("DTSGInitialData")).split('"')[4];
  const userId = resp.match(/"IG_USER_EIMU":"([^"]+)"/)?.[1];
  return { clientId, dtsg, userId };
}

async function apiCall(cid, dtsg, cursor = null) {
  const response = await axios.post(
    "https://www.instagram.com/api/graphql/",
    new URLSearchParams({
      fb_dtsg: dtsg,
      variables: JSON.stringify({
        deviceId: cid,
        requestId: 0,
        requestPayload: JSON.stringify({
          database: 1,
          epoch_id: 0,
          last_applied_cursor: cursor,
          sync_params: JSON.stringify({}),
          version: 9477666248971112,
        }),
        requestType: 1,
      }),
      doc_id: "6195354443842040",
    }),
    {
      headers: {
        authority: "www.instagram.com",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
        "cache-control": "no-cache",
        cookie: cookies,
        origin: "https://www.instagram.com",
        pragma: "no-cache",
        referer: "https://www.instagram.com/",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua":
          '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        "sec-ch-ua-full-version-list":
          '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.133", "Google Chrome";v="114.0.5735.133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-ch-ua-platform-version": '"13.2.1"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "x-ig-app-id": "936619743392459",
      },
    }
  );
  return response;
}

// construct the conversations from undecipherable data
function parseResponse(payload) {
  const j = JSON.parse(payload);
  // tasks we are interested in
  let lsCalls = {
    verifyContactRowExists: [],
    addParticipantIdToGroupThread: [],
    deleteThenInsertThread: [],
    upsertMessage: [],
  };
  let userLookup = {};
  let lastMessageLookup = {};
  let conversationParticipants = {};
  let conversations = [];

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
  for (const item of lsCalls.verifyContactRowExists) {
    const userId = item[0][1];
    const name = item[3];
    const username = item[item.length - 1];
    userLookup[userId] = { name, username, userId };
  }
  for (const item of lsCalls.addParticipantIdToGroupThread) {
    const threadId = item[0][1]; // in DMs is also the other user id
    const userId = item[1][1]; // userId

    // if threadId does not exist then create an empty set
    if (!(threadId in conversationParticipants)) {
      conversationParticipants[threadId] = new Set();
    }
    conversationParticipants[threadId].add(userLookup[userId]);
  }
  for (const item of lsCalls.upsertMessage) {
    const message = item[0];
    const threadId = item[3][1];
    const sentTs = item[5][1];
    const messageId = item[8];
    const authorId = item[10][1];

    lastMessageLookup[threadId] = {
      message,
      sentTs,
      messageId,
      authorId,
    };
  }
  for (const item of lsCalls.deleteThenInsertThread) {
    const lastSentTime = item[0][1];
    const lastReadTime = item[1][1];
    let groupName;
    if (Array.isArray(item[3])) {
      groupName = null;
    } else {
      groupName = item[3];
    }

    const threadId = item[7][1];

    // skip if threads have no participants ie no one is in the group
    if (!(threadId in conversationParticipants)) continue;

    // if groupName is null then set it to all the participants names
    if (groupName === null) {
      groupName = Array.from(conversationParticipants[threadId])
        .filter((x) => x.userId !== myUserId)
        .map((x) => x.name)
        .join(", ");
    }

    conversations.push({
      threadId,
      unread: Number(lastSentTime) > Number(lastReadTime),
      lastReadTime,
      lastSentTime,
      groupName,
      participants: Array.from(conversationParticipants[threadId]),
      lastMessageDetails: lastMessageLookup[threadId],
    });
  }
  return { newConversations: conversations, cursor: j.step[2][1][3][5] };
}

// get the initial conversations
async function initialConnection(cid, dtsg) {
  const response = await apiCall(cid, dtsg);
  const { newConversations, cursor } = await parseResponse(
    response.data.data.lightspeed_web_request_for_igd.payload
  );
  return { newConversations, cursor };
}

// parse mqtt packet
// promisifies the mqtt parser to make it easier to use
function parseMqttPacket(data) {
  const parser = mqtt.parser({
    protocolVersion: 3,
  });

  return new Promise((resolve, reject) => {
    parser.on("packet", (packet) => {
      const j = JSON.parse(packet.payload);
      resolve(j);
    });

    parser.on("error", (error) => {
      reject(error);
    });

    parser.parse(data);
  });
}

const { clientId, dtsg, userId: myUserId } = await getClientId();
console.log(clientId, dtsg, myUserId);
let { cursor, newConversations: conversations } = await initialConnection(
  clientId,
  dtsg
);
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

    // get threads
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
                label: "145",
                payload: JSON.stringify({
                  is_after: 0,
                  parent_thread_key: 0,
                  reference_thread_key: Number(
                    conversations[conversations.length - 1].threadId
                  ),
                  reference_activity_timestamp:
                    conversations[conversations.length - 1].lastSentTime,
                  additional_pages_to_fetch: 0,
                  cursor: cursor,
                  messaging_tag: null,
                  sync_group: 1,
                }),
                queue_name: "trq",
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
        payload.payload.includes("deleteThenInsertThread")
      ) {
        console.log("got messages");
        parseMqttPacket(data).then((payload) => {
          const { newConversations } = parseResponse(payload.payload);
          console.log(JSON.stringify(newConversations, null, 2));
          conversations.push(...newConversations);
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
                      label: "145",
                      payload: JSON.stringify({
                        is_after: 0,
                        parent_thread_key: 0,
                        reference_thread_key: Number(
                          conversations[conversations.length - 1].threadId
                        ),
                        reference_activity_timestamp:
                          conversations[conversations.length - 1].lastSentTime,
                        additional_pages_to_fetch: 0,
                        cursor: cursor,
                        messaging_tag: null,
                        sync_group: 1,
                      }),
                      queue_name: "trq",
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
  if (args.length === 0) return;
  let obj = {};
  for (const conversation of conversations) {
    let partobj = {};
    for (const participant of conversation.participants) {
      partobj[participant.userId] = participant;
    }
    conversation.participants = partobj;
    conversation;
    obj[conversation.threadId] = conversation;
  }
  fs.writeFile(args[0], JSON.stringify(obj, null, 2), (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
    console.log("file written");
  });
});

process.on("SIGINT", () => {
  ws.close();
});
