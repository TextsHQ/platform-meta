import path from 'path'
import { texts } from '@textshq/platform-sdk'

const PLATFORM_DIR_NAME = 'platform-meta'
const isiOS = process.platform as string === 'ios'

const getBinaryPath = (binaryName: string) => (texts.IS_DEV && !isiOS
  ? path.join(__dirname, '../binaries', binaryName)
  : path.join(texts.constants.BUILD_DIR_PATH, PLATFORM_DIR_NAME, binaryName))

export const STICKERS_DIR_PATH = getBinaryPath('stickers')

export const DRIZZLE_DIR_PATH = getBinaryPath('drizzle')
