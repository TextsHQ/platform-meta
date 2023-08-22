// sends the file test.webp to the selected thread
import WebSocket from "ws";
import axios from "axios";
import mqtt from "mqtt-packet";
import { get } from "./settings.mjs";
import fs from "fs";
import { ws } from "./socket.mjs";
import { getClientId } from "./utils.mjs";
const cookies = get("cookies");
const threadID = get("selectedThread");
if (!threadID) {
  console.log("No thread ID found. Please select a thread first.");
  process.exit(1);
}
const { clientId, dtsg, userId, lsd, hsi } = await getClientId();
console.log("dtsg is", dtsg);
console.log("lsd is", lsd);
async function uploadPhoto() {
  const file = fs.readFileSync("test.webp");
  const blob = new Blob([file], { type: "image/jpeg" });
  const formData = new FormData();
  formData.append("farr", blob, "test.webp");
  const res = await axios
    .post("https://www.instagram.com/ajax/mercury/upload.php", formData, {
      params: {
        __a: "1",
        fb_dtsg: dtsg,
      },
      headers: {
        authority: "www.instagram.com",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type":
          "multipart/form-data; boundary=----WebKitFormBoundaryK8furxKOo3188usO",
        cookie: cookies,
        origin: "https://www.instagram.com",
        referer: "https://www.instagram.com/direct/t/100428318021025/",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua":
          '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        "sec-ch-ua-full-version-list":
          '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.198", "Google Chrome";v="114.0.5735.198"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-ch-ua-platform-version": '"13.4.1"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "viewport-width": "1280",
        "x-asbd-id": "129477",
        "x-fb-lsd": "khvBZW0GBGHjqubNqNUMn2",
      },
    })
    .catch((err) => {
      console.log("axios errored");
      process.exit(1);
    });
  // Remove the "for (;;);" part from the response
  const response = res.data;
  const jsonStartIndex = response.indexOf("{");
  const jsonResponse = response.substring(jsonStartIndex);

  // Parse the JSON object
  const parsedData = JSON.parse(jsonResponse);
  console.log(parsedData);
  if (parsedData.payload) {
    console.log(parsedData.payload.metadata[0].image_id);
  }
  return parsedData;
}

const photoDetails = await uploadPhoto();
const fbid = photoDetails.payload.metadata[0].image_id;
console.log(fbid);
const timestamp = BigInt(Date.now());
const epoch_id = timestamp << BigInt(22);
const otid = epoch_id + BigInt(Math.floor(Math.random() * 2 ** 22));

const payload = JSON.stringify({
  app_id: "936619743392459",
  payload: JSON.stringify({
    tasks: [
      {
        label: "46",
        payload: JSON.stringify({
          thread_id: Number(threadID),
          otid: otid.toString(),
          source: 65537,
          send_type: 3,
          sync_group: 1,
          text: null,
          attachment_fbids: [fbid],
        }),
        queue_name: threadID.toString(),
        task_id: 2,
        failure_count: null,
      },
    ],
    epoch_id: Number(BigInt(Date.now()) << BigInt(22)),
    version_id: "9949577511749408",
    // data_trace_id: "#UFYHGcGHSJiR9Fs2/JTb7Q",
  }),
  request_id: 6,
  type: 3,
});

console.log(payload);
ws.send(
  mqtt.generate({
    cmd: "publish",
    messageId: 6,
    qos: 1,
    dup: false,
    retain: false,
    topic: "/ls_req",
    payload: payload,
  })
);
