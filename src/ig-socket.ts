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
}
