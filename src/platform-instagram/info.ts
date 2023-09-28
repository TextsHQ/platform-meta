import { type PlatformInfo } from '@textshq/platform-sdk'

import infoDefaults from '../info'
import icon from './icon'

const info: PlatformInfo = {
  ...infoDefaults,
  name: 'instagram',
  displayName: 'Instagram',
  icon,
  browserLogin: {
    url: 'https://instagram.com',
    authCookieName: 'sessionid',
  },
  getUserProfileLink: ({ username }) =>
    `https://www.instagram.com/${username}/`,
}

export default info
