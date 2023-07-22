import mqtt from "mqtt-packet";

export const genClientContext = () => {
  const randomBinary = Math.floor(Math.random() * 0xFFFFFFFF).toString(2).padStart(22, '0').slice(-22)
  const dateBinary = Date.now().toString(2)
  return BigInt(`0b${dateBinary}${randomBinary}`)
}

export const getTimeValues = () => {
  // console.log(typing.toString("hex").match(/../g).join(" "));
  // https://intuitiveexplanations.com/tech/messenger
  // link above has good explanation of otid
  const timestamp = BigInt(Date.now());
  const epoch_id = timestamp << BigInt(22);
  const otid = epoch_id + BigInt(Math.floor(Math.random() * 2 ** 22));
  return { timestamp, epoch_id, otid } as const
}

// parse mqtt packet
// promisifies the mqtt parser to make it easier to use
export function parseMqttPacket(data: Buffer) {
  const parser = mqtt.parser({
    protocolVersion: 3,
  });

  return new Promise((resolve, reject) => {
    parser.on("packet", (packet) => {
      const j = JSON.parse((packet as any).payload);
      resolve(j);
    });

    parser.on("error", (error) => {
      reject(error);
    });

    parser.parse(data);
  });
}

export const getMqttSid = () => parseInt(Math.random().toFixed(16).split(".")[1])
