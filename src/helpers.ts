export const genClientContext = () => {
  const randomBinary = Math.floor(Math.random() * 0xFFFFFFFF).toString(2).padStart(22, '0').slice(-22)
  const dateBinary = Date.now().toString(2)
  return BigInt(`0b${dateBinary}${randomBinary}`)
}
