import axios from "axios";
import mqtt from "mqtt-packet";
import { get } from "./settings.mjs";

const cookies = get('cookies');

export async function getClientId() {
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

export async function apiCall(cid, dtsg, cursor = null) {
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

// parse mqtt packet
// promisifies the mqtt parser to make it easier to use
export function parseMqttPacket(data) {
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

export const mqttSid = parseInt(Math.random().toFixed(16).split(".")[1])
