import axios from "axios";
import mqtt from "mqtt-packet";
import { get } from "./settings.mjs";
import path from "path";
import process from "process";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "/Users/rahulvaidun/Texts/platform-instagram/dist/store/schema.js";

import Database from "better-sqlite3";
const commonHeaders = {
  authority: "www.instagram.com",
  "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  "sec-ch-prefers-color-scheme": "light",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-ch-ua-platform-version": '"13.2.1"',
  "sec-ch-ua":
    '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
  "sec-fetch-site": "same-origin",
  "sec-ch-ua-full-version-list":
    '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.133", "Google Chrome";v="114.0.5735.133"',
  cookie: get("cookies"),
};
export const getDB = async () => {
  const sqlite = new Database("/Users/rahulvaidun/Texts/test.db");
  const db = drizzle(sqlite, {schema});
  // await migrate(db, {
  //   migrationsFolder: "/Users/rahulvaidun/Texts/platform-instagram/drizzle",
  // });
  return db;
};
export const getTimeValues = () => {
  // console.log(typing.toString("hex").match(/../g).join(" "));
  // https://intuitiveexplanations.com/tech/messenger
  // link above has good explanation of otid
  const timestamp = BigInt(Date.now());
  const epoch_id = timestamp << BigInt(22);
  const otid = epoch_id + BigInt(Math.floor(Math.random() * 2 ** 22));
  return { timestamp, epoch_id: Number(epoch_id), otid };
};
export async function getClientId() {
  const response = await axios.get("https://www.instagram.com/direct/", {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "cache-control": "max-age=0",
      "sec-ch-ua":
        '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "viewport-width": "558",
      ...commonHeaders,
    },
  });
  const resp = response.data;
  const clientId = resp.slice(resp.indexOf('{"clientID":')).split('"')[3];
  const dtsg = resp.slice(resp.indexOf("DTSGInitialData")).split('"')[4];
  const userId = resp.match(/"IG_USER_EIMU":"([^"]+)"/)?.[1];
  const lsd = resp.match(/"LSD",\[\],\{"token":"([^"]+)"\}/)?.[1];
  const hsi = resp.match(/"hsi":"(\d+)"/)?.[1];
  return { clientId, dtsg, userId, lsd, hsi };
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
        accept: "*/*",
        "cache-control": "no-cache",
        origin: "https://www.instagram.com",
        pragma: "no-cache",
        referer: "https://www.instagram.com/",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "x-ig-app-id": "936619743392459",
        ...commonHeaders,
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

export const mqttSid = parseInt(Math.random().toFixed(16).split(".")[1]);
export function stripExt(name) {
  const extension = path.extname(name);
  if (!extension) {
    return name;
  }

  return name.slice(0, -extension.length);
}

/**
 * Check if a module was run directly with node as opposed to being
 * imported from another module.
 * @param {ImportMeta} meta The `import.meta` object.
 * @return {boolean} The module was run directly with node.
 */
export function esMain(meta) {
  if (!meta || !process.argv[1]) {
    return false;
  }

  const require = createRequire(meta.url);
  const scriptPath = require.resolve(process.argv[1]);

  const modulePath = fileURLToPath(meta.url);

  const extension = path.extname(scriptPath);
  if (extension) {
    return modulePath === scriptPath;
  }

  return stripExt(modulePath) === scriptPath;
}
