import mqtt from "mqtt-packet";
import { getClientId, apiCall, parseMqttPacket } from "./utils.mjs";
import { ws } from "./socket.mjs";

import { set } from "./settings.mjs";

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
  const { newConversations, cursor } = parseResponse(
    response.data.data.lightspeed_web_request_for_igd.payload
  );
  return { newConversations, cursor };
}

const { clientId, dtsg, userId: myUserId } = await getClientId();
console.log(clientId, dtsg, myUserId);
let { cursor, newConversations: conversations } = await initialConnection(
  clientId,
  dtsg
);

ws.on("message", function incoming(data) {
  if (data.toString("hex") == "42020001") {
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
              // gets threads in the pending box
              {
                label: "145",
                payload: JSON.stringify({
                  is_after: 0,
                  parent_thread_key: -1,
                  reference_thread_key: 0,
                  reference_activity_timestamp: 9999999999999,
                  additional_pages_to_fetch: 0,
                  cursor: cursor,
                  messaging_tag: null,
                  sync_group: 1,
                }),
                queue_name: "trq",
                task_id: 2,
                failure_count: null,
              },
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
  set("threads", obj);
});
