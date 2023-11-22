// Surrogate are pairs of code points that together encode a single character.
const highSurrogateStart = 55296
const lowSurrogateEnd = 57343
const surrogatePairRegex = /[\uD800-\uDFFF]/

function isSurrogate(code: number) {
  return highSurrogateStart <= code && code <= lowSurrogateEnd
}

function containsSurrogates(str: string) {
  return surrogatePairRegex.test(str)
}

function getCharacterLength(str: string, index: number) {
  return 1 + Number(isSurrogate(str.charCodeAt(index)))
}

export function getStringLength(str: string) {
  if (!containsSurrogates(str)) return str.length
  let length = 0
  for (let i = 0; i < str.length; i += getCharacterLength(str, i)) { length++ }
  return length
}
