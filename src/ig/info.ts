import { type PlatformInfo } from '@textshq/platform-sdk'

import infoDefaults from '../info'
import icon from './icon'

const info: PlatformInfo = {
  ...infoDefaults,
  name: 'instagram',
  version: '3.0.0',
  displayName: 'Instagram',
  icon,
  browserLogin: {
    url: 'https://instagram.com',
    authCookieName: 'sessionid',
  },
  notifications: {
    web: {
      vapidKey: 'BIBn3E_rWTci8Xn6P9Xj3btShT85Wdtne0LtwNUyRQ5XjFNkuTq9j4MPAVLvAFhXrUU1A9UxyxBA7YIOjqDIDHI', // browser_push_pub_key
    },
  },
  getUserProfileLink: ({ username }) =>
    `https://www.instagram.com/${username}/`,
}

export default info
