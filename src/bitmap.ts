export type CSRData = { // RsrcDetails
  type: string
  src: string
  c: number
  tsrc: string
  p: string
  m: string
}

export type BootloaderHandlePayload = {
  consistency: Consistency
  rsrcMap: { [key: string]: CSRData }
  csrUpgrade: string
}

export type Consistency = {
  rev?: number // int64
}

const CHAR_MAP = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'

export default class Bitmap {
  bitMap: number[] = []

  bits: number[] = []

  compressed_str = ''

  initialized = false

  phdOn: boolean

  csr: boolean

  private pendingCsrBitmaps: BootloaderHandlePayload[] = []

  private pendingBitmaps: number[] = []

  constructor(csr: boolean) {
    this.csr = csr
    this.phdOn = false
  }

  updateCsrBitmap(payload: BootloaderHandlePayload) {
    this.pendingCsrBitmaps.push(payload)
  }

  finishBitmap() {
    for (const payload of this.pendingCsrBitmaps) {
      if (payload.csrUpgrade && payload.csrUpgrade.length) {
        const newBits = Bitmap.parseCSRBits(payload.csrUpgrade)
        this.bitMap = this.bitMap.concat(...newBits)
      }

      if (payload.rsrcMap && Object.keys(payload.rsrcMap).length > 0) {
        for (const [_key, val] of Object.entries(payload.rsrcMap)) {
          const shouldAdd = (this.phdOn && val.c === 2) || (!this.phdOn && val.c !== 0)
          if (shouldAdd) {
            const newBits = Bitmap.parseCSRBits(val.p)
            this.bitMap = this.bitMap.concat(...newBits)
          }
        }
      }
    }

    for (const num of this.pendingBitmaps) {
      if (!this.bitMap.includes(num) && num !== 0) {
        this.bitMap.push(num)
      }
    }

    this.pendingCsrBitmaps = []
    this.pendingBitmaps = []
  }

  static parseCSRBits(s: string): number[] {
    const bits = s.slice(1).split(',')
    const newBits: number[] = []
    for (const bit of bits) {
      const num = parseInt(bit, 10) | 0
      if (!Number.isNaN(num)) newBits.push(parseInt(bit, 10))
    }
    return newBits
  }

  updateBitmap(num: number) {
    this.pendingBitmaps.push(num)
  }

  private updateBits() {
    let maxIndex = -1
    for (const index of this.bitMap) {
      if (index > maxIndex) {
        maxIndex = index
      }
    }

    if (maxIndex >= this.bits.length) {
      const expanded = new Array(maxIndex + 1).fill(0)
      for (let i = 0; i < this.bits.length; i++) {
        expanded[i] = this.bits[i]
      }
      this.bits = expanded
    }

    for (const index of this.bitMap) {
      if (this.bits[index] === 0 && this.compressed_str !== '') {
        this.compressed_str = ''
      }
      this.bits[index] = 1
    }
  }

  toCompressedString(): string {
    if (this.bitMap.length === 0) {
      return ''
    }
    this.updateBits()
    let result = ''
    let count = 1
    let lastValue = this.bits[0]
    result += lastValue.toString()
    for (let i = 1; i < this.bits.length; i++) {
      const currentValue = this.bits[i]
      if (currentValue === lastValue) {
        count++
      } else {
        result += Bitmap.encodeRunLength(count)
        lastValue = currentValue
        count = 1
      }
    }

    if (count > 0) {
      result += Bitmap.encodeRunLength(count)
    }

    this.compressed_str = Bitmap.encodeBase64(result)
    return this.compressed_str
  }

  static encodeRunLength(num: number): string {
    const binaryStr = num.toString(2)
    return '0'.repeat(binaryStr.length - 1) + binaryStr
  }

  static encodeBase64(binaryStr: string) {
    let binStr = binaryStr // linter keeps shouting at me for using the parameter
    while (binStr.length % 6 !== 0) {
      binStr += '0'
    }

    let result = ''
    for (let i = 0; i < binStr.length; i += 6) {
      const val = parseInt(binStr.substring(i, i + 6), 2)
      result += CHAR_MAP[val]
    }

    return result
  }
}
