import WebSocket from "ws";
import mqtt from "mqtt-packet";
import type InstagramAPI from "./ig-api";
import { texts } from "@textshq/platform-sdk";
import { getMqttSid, getTimeValues } from "./util";

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
    process.on("SIGINT", () => {
      this.ws.close();
    });
  }

  private onError(event: Error) {
    console.log("onError", event);
  }

  private onOpen() {
    texts.log("Connected to Instagram WebSocket");
    // initiate connection
    this.ws.send(
      mqtt.generate({
        cmd: "connect",
        protocolId: "MQIsdp",
        clientId: "mqttwsclient",
        protocolVersion: 3,
        clean: true,
        keepalive: 10,
        username: JSON.stringify({
          u: "userid", // doesnt seem to matter
          s: this.mqttSid,
          cp: 3,
          ecp: 10,
          chat_on: true,
          fg: false,
          d: this.igApi.session.clientId,
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
          a: this.igApi.ua,
          aids: null,
        }),
      })
    );

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

  private onClose() {
    texts.log("Disconnected from Instagram WebSocket");
  }

  private getMessages(threadId: string) {
    this.publishTask({
      label: "228",
      payload: JSON.stringify({
        thread_key: Number(threadId),
        // direction: 0,
        // reference_timestamp_ms: Number(
        //   messages[messages.length - 1].sentTs
        // ),
        // reference_message_id: messages[messages.length - 1].messageId,
        sync_group: 1,
        // cursor: cursor,
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
        is_after: 0,
        parent_thread_key: 0,
        // reference_thread_key: Number(
        //   conversations[conversations.length - 1].threadId
        // ),
        // reference_activity_timestamp:
        // conversations[conversations.length - 1].lastSentTime,
        additional_pages_to_fetch: 0,
        // cursor: cursor,
        messaging_tag: null,
        sync_group: 1,
      }),
      queue_name: "trq",
      task_id: 1,
      failure_count: null,
    });
  }

  connect() {
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
          u: "17841418030588216",
          s: this.mqttSid,
          cp: 3,
          ecp: 10,
          chat_on: true,
          fg: false,
          d: this.igApi.session.clientId,
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
          a: this.igApi.ua,
          aids: null,
        }),
      })
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
}
