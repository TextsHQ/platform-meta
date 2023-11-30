import path from 'path'
import { texts } from '@textshq/platform-sdk'

export const NEVER_SYNC_TIMESTAMP = 9999999999999
export const BIGINT_MARKER = '$bigint'

const BINARIES_DIR_PATH = texts.getBinariesDirPath('meta')

const getBinaryPath = (binaryName: string) => path.join(BINARIES_DIR_PATH, binaryName)

export const STICKERS_DIR_PATH = getBinaryPath('stickers')

export const DRIZZLE_DIR_PATH = getBinaryPath('drizzle')
