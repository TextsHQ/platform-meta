import path from 'path'
import { texts } from '@textshq/platform-sdk'
import { DatabaseQueryMetadata, SyncChannel } from './types'

export const ASBD_ID = '129477'
export const VIEWPORT_WIDTH = '1280' // we should make sure this is the same all the time
export const NEVER_SYNC_TIMESTAMP = 9999999999999
export const BIGINT_MARKER = '$bigint'

const getBinaryPath = (binaryName: string) => path.join(texts.getBinariesDirPath('meta'), binaryName)

export const STICKERS_DIR_PATH = getBinaryPath('stickers')

export const DRIZZLE_DIR_PATH = getBinaryPath('drizzle')

export const DefaultDatabaseQueries: [number, DatabaseQueryMetadata][] = [
  [
    1,
    { databaseId: 1, sendSyncParams: false, lastAppliedCursor: null, syncChannel: SyncChannel.MAILBOX },
  ],
  [
    2,
    { databaseId: 2, sendSyncParams: false, lastAppliedCursor: null, syncChannel: SyncChannel.CONTACT },
  ],
  [
    95,
    { databaseId: 95, sendSyncParams: false, lastAppliedCursor: null, syncChannel: SyncChannel.CONTACT },
  ],
]

export const defaultSharedHeaders = {
  MacOS: {
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-ch-ua-platform-version': '"13.2.1"',
    'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="112", "Google Chrome";v="112"',
    'sec-ch-ua-full-version-list': '"Not_A Brand";v="8.0.0.0", "Chromium";v="112.0.0.0", "Google Chrome";v="112.0.0.0"',
    'sec-ch-ua-model': '""',
    'sec-fetch-site': 'same-origin',
  },
  Linux: {
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not=A?Brand";v="8"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform-version': '"6.4.12"',
    'sec-ch-ua-full-version-list': '"Not_A Brand";v="8.0.0.0", "Chromium";v="112.0.0.0", "Google Chrome";v="112.0.0.0"',
    'sec-ch-ua-model': '""',
    'sec-fetch-site': 'same-origin',
    'sec-ch-ua-platform': '"Linux"',
  },
  Windows: {
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="112", "Google Chrome";v="112"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform-version': '15.0.0',
    'sec-ch-ua-full-version-list': '"Not_A Brand";v="8.0.0.0", "Chromium";v="112.0.0.0", "Google Chrome";v="112.0.0.0"',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-model': '""',
    'sec-fetch-site': 'same-origin',
  },
}
