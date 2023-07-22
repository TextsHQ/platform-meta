import WebSocket from "ws";
import mqtt from "mqtt-packet";
import { texts } from "@textshq/platform-sdk";
import type InstagramAPI from "./ig-api";
import { getMqttSid, getTimeValues, parseMqttPacket } from "./util";
import { parseMessagePayload } from "./parsers";

export default class InstagramWebSocket {
  ws: WebSocket;

  private mqttSid = getMqttSid()

  constructor(private readonly igApi: InstagramAPI) {
    this.ws = new WebSocket(
      `wss://edge-chat.instagram.com/chat?sid=${this.mqttSid}&cid=${this.igApi.session.clientId}`,
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
          "User-Agent": this.igApi.ua,
          Cookie: this.igApi.getCookies(),
        },
      }
    );
    this.ws.on("error", (err) => this.onError(err));
    this.ws.on("open", () => this.onOpen());
    this.ws.on("close", () => this.onClose());
    this.ws.on("message", (data) => {
      texts.log("ig socket: message", data);

      if (data.toString("hex") == "42020001") {
        this.getThreads()
      } else if (data[0] != 0x42) {

      }
    });
    process.on("SIGINT", () => {
      this.ws.close();
    });
  }

  private onError(event: Error) {
    texts.log("ig socket: error", event);
  }

  private onOpen() {
    texts.log("ig socket: open");
    this.connect();
    this.maybeSubscribeToDatabaseOne();
    this.sendAppSettings();
  }

  private onClose() {
    texts.log("ig socket: close");
  }

  private async parseNon0x42Data(data: Buffer) {
    // for some reason fb sends wrongly formatted packets for PUBACK.
    // this causes mqtt-packet to throw an error.
    // this is a hacky way to fix it.
    const payload = (await parseMqttPacket(data)) as any;
    if (!payload) return;

    // the broker sends 4 responses to the get messages command (request_id = 6)
    // 1. ack
    // 2. a response with a new cursor, the official client uses the new cursor to get more messages
    // however, the new cursor is not needed to get more messages, as the old cursor still works
    // not sure exactly what the new cursor is for, but it's not needed. the request_id is null
    // 3. unknown response with a request_id of 6. has no information
    // 4. the thread information. this is the only response that is needed. this packet has the text deleteThenInsertThread

    if (payload.request_id !== null) return;
    if (payload.payload.includes("upsertMessage")) {
      // @TODO: we need thread id here
      // this.processUpsertMessage(data);
    } else if (payload.payload.includes("deleteThenInsertThread")) {
      this.processDeleteThenInsertThread(data);
    }
  }

  private async processDeleteThenInsertThread(data: any) {
    const payload = (await parseMqttPacket(data)) as any;
    const { newConversations } = parseMessagePayload(this.igApi.session.fbid, payload.payload);
    console.log(JSON.stringify(newConversations, null, 2));
    // conversations.push(...newConversations);
    const { epoch_id } = getTimeValues();
    this.ws.send(
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
                  ...this.getLastThreadReference(newConversations),
                  is_after: 0,
                  parent_thread_key: 0,
                  additional_pages_to_fetch: 0,
                  messaging_tag: null,
                  sync_group: 1,
                }),
                queue_name: "trq",
                task_id: 1,
                failure_count: null,
              },
            ],
            epoch_id,
            version_id: "9477666248971112",
          }),
          request_id: 6,
          type: 3,
        }),
      })
    );

  }

  private async processUpsertMessage(threadId: string, data: any) {
    console.log("got messages");

    const payload = (await parseMqttPacket(data)) as any;

    const j = JSON.parse(payload.payload);
    console.log(JSON.stringify(j, null, 2));
    const { newMessages } = parseMessagePayload(this.igApi.session.fbid, payload.payload);
    console.log(JSON.stringify(newMessages, null, 2));
    // messages.push(...newMessages);
    // console.log('messages', messages)
    const lastMessage = newMessages[newMessages.length - 1];
    this.publishTask({
      label: "228",
      payload: JSON.stringify({
        thread_key: Number(threadId),
        direction: 0,
        reference_timestamp_ms: Number(lastMessage.sentTs),
        reference_message_id: lastMessage.messageId,
        sync_group: 1,
        cursor: this.igApi.cursor,
      }),
      queue_name: `mrq.${threadId}`,
      task_id: 1,
      failure_count: null,
    });
  }

  // initiate connection
  private connect() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) throw new Error("WebSocket is not open");

    this.ws.send(
      mqtt.generate({
        cmd: "connect",
        protocolId: "MQIsdp",
        clientId: "mqttwsclient",
        protocolVersion: 3,
        clean: true,
        keepalive: 10,
        username: JSON.stringify({
          u: "17841418030588216", // doesnt seem to matter
          s: this.mqttSid,
          cp: 3,
          ecp: 10,
          chat_on: true,
          fg: false,
          d: this.igApi.session.clientId, // client id
          ct: "cookie_auth",
          mqtt_sid: "", // @TODO: should we use the one from the cookie?
          aid: 936619743392459, // app id
          st: [],
          pm: [],
          dc: "",
          no_auto_fg: true,
          gas: null,
          pack: [],
          php_override: "",
          p: null,
          a: this.igApi.ua, // user agent
          aids: null,
        }),
      })
    );
  }

  private sendAppSettings() {
    // send app settings
    // need to wait for the ack before sending the subscribe
    this.ws.send(
      mqtt.generate({
        cmd: "publish",
        messageId: 1,
        qos: 1,
        topic: "/ls_app_settings",
        payload: JSON.stringify({
          ls_fdid: "",
          ls_sv: "9477666248971112", // version id
        }),
      } as any)
    );
  }

  sendTypingIndicator(threadID: string) {
    this.ws.send(
      mqtt.generate({
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
      } as any)
    ); // @TODO: fix mqtt-packet types
  }

  sendMessage(threadID: string, text: string) {
    const { epoch_id, otid, timestamp } = getTimeValues();
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
              text,
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

    this.ws.send(
      mqtt.generate({
        cmd: "publish",
        dup: false,
        qos: 1,
        retain: false,
        topic: "/ls_req",
        messageId: 4,
        payload: hmm,
      })
    );
  }

  // used for get messages and get threads
  publishTask(_tasks: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) throw new Error("WebSocket is not open");

    const tasks = Array.isArray(_tasks) ? _tasks : [_tasks];
    const { epoch_id } = getTimeValues();
    this.ws.send(
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
            tasks,
            epoch_id,
            version_id: "9477666248971112",
          }),
          request_id: 6,
          type: 3,
        }),
      })
    );
  }

  private getMessages(threadId: string) {
    const { newMessages, cursor } = this.igApi.cursorCache ?? {};
    const lastMessageInCursor = newMessages?.[newMessages.length - 1];

    this.publishTask({
      label: "228",
      payload: JSON.stringify({
        thread_key: Number(threadId),
        direction: 0,
        reference_timestamp_ms: Number(
          lastMessageInCursor.sentTs
        ),
        reference_message_id: lastMessageInCursor.messageId,
        sync_group: 1,
        cursor: cursor,
      }),
      queue_name: `mrq.${threadId}`,
      task_id: 1,
      failure_count: null,
    });
  }

  private getThreads() {
    this.publishTask({
      label: "145",
      payload: JSON.stringify({
        ...this.getLastThreadReference(),
        is_after: 0,
        parent_thread_key: 0,
        additional_pages_to_fetch: 0,
        messaging_tag: null,
        sync_group: 1,
      }),
      queue_name: "trq",
      task_id: 1,
      failure_count: null,
    });
  }

  private getLastThreadReference(conversations: any[] = this.igApi.cursorCache?.newConversations ?? []) {
    const lastConversationInCursor = conversations?.[conversations.length - 1];
    return {
      reference_thread_key: Number(lastConversationInCursor.threadId),
      reference_activity_timestamp: lastConversationInCursor.lastSentTime,
      cursor: this.igApi.cursor,
    };
  }


  // not sure exactly what this does but it's required.
  // my guess is it "subscribes to database 1"?
  // may need similar code to get messages.
  private maybeSubscribeToDatabaseOne() {
    const { epoch_id } = getTimeValues();
    this.ws.send(
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
            epoch_id,
            failure_count: null,
            last_applied_cursor: this.igApi.cursor,
            sync_params: null,
            version: 9477666248971112,
          }),
          request_id: 5,
          type: 2,
        }),
      })
    );
  }
}
