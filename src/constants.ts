import path from 'path'
import { texts } from '@textshq/platform-sdk'

export const NEVER_SYNC_TIMESTAMP = 9999999999999
export const BIGINT_MARKER = '$bigint'

const getBinaryPath = (binaryName: string) => path.join(texts.getBinariesDirPath('meta'), binaryName)

export const STICKERS_DIR_PATH = getBinaryPath('stickers')

export const DRIZZLE_DIR_PATH = getBinaryPath('drizzle')
