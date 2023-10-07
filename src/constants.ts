import path from 'path'
import { texts } from '@textshq/platform-sdk'

const PLATFORM_DIR_NAME = 'platform-meta'
const isiOS = process.platform as string === 'ios'

export const STICKERS_DIR_PATH = process.env.NODE_ENV === 'development' && !isiOS
  ? path.join(__dirname, `../../../packages/${PLATFORM_DIR_NAME}/binaries`, 'stickers')
  : path.join(texts.constants.BUILD_DIR_PATH, PLATFORM_DIR_NAME, 'stickers')
