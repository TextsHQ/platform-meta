import WebSocket from "ws";
import type InstagramAPI from "./ig-api";

const INSTAGRAM_BASE_URL = "https://www.instagram.com/";

export default class InstagramWebSocket {
  ws: WebSocket
  private mqttSid = parseInt(Math.random().toFixed(16).split(".")[1]);

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
          Cookie: this.igApi.jar.getCookieStringSync(INSTAGRAM_BASE_URL),
        },
      }
    );
    this.ws.on("error", (err) => this.onError(err));
    process.on("SIGINT", () => {
      this.ws.close();
    });
  }

  private onError(event: Error) {
    console.log('onError', event);
  }

  private getMessages() {
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
  }

  private getThreads() {
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
  }
}
