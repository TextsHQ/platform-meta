import { type PlatformInfo } from '@textshq/platform-sdk'

import infoDefaults from '../info'
import icon from './icon'

const js = `if (
window.location.hostname === 'www.instagram.com' &&
!window.location.pathname.includes('/challenge/') &&
window._sharedData.config.viewer.username) setTimeout(() => window.close(), 100)`

const info: PlatformInfo = {
  ...infoDefaults,
  name: 'instagram',
  displayName: 'Instagram',
  icon,
  browserLogin: {
    url: 'https://www.instagram.com',
    runJSOnLaunch: js,
    runJSOnNavigate: js,
  },
  getUserProfileLink: ({ username }) =>
    `https://www.instagram.com/${username}/`,
}

export default info
