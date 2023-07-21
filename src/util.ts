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
