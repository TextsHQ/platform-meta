import { type PlatformInfo } from '@textshq/platform-sdk'

import infoDefaults from '../info'
import icon from './icon'

const js = `if (
window.location.hostname === 'www.instagram.com' &&
!window.location.pathname.includes('/challenge/') &&
require('PolarisViewer')?.id) setTimeout(() => window.close(), 100)`

const info: PlatformInfo = {
  ...infoDefaults,
  name: 'instagram',
  displayName: 'Instagram',
  icon,
  brand: {
    background: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48">
    <rect width="48" height="48" fill="#E11B7E" />
    <rect width="48" height="48" fill="url(#a)" />
    <rect width="48" height="48" fill="url(#b)" />
    <rect width="48" height="48" fill="url(#c)" />
    <defs>
    <linearGradient id="a" x1="5.273" x2="21.047" y1="0" y2="43.008" gradientUnits="userSpaceOnUse">
    <stop offset=".04" stop-color="#4263DF" />
    <stop offset="1" stop-color="#D53585" stop-opacity="0" />
    </linearGradient>
    <radialGradient id="b" cx="0" cy="0" r="1" gradientTransform="rotate(-36.119 78.89 7.791) scale(44.3334)"
    gradientUnits="userSpaceOnUse">
    <stop offset=".13" stop-color="#FFAD05" />
    <stop offset="1" stop-color="#FF3F00" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="c" cx="0" cy="0" r="1" gradientTransform="rotate(-40.601 71.734 5.468) scale(30.0354)"
    gradientUnits="userSpaceOnUse">
    <stop offset=".01" stop-color="#FDDB86" />
    <stop offset="1" stop-color="#F06942" stop-opacity="0" />
    </radialGradient>
    </defs>
    </svg>`,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48">
    <path fill="black" fill-rule="evenodd" d="M16.796 9.488c-1.622.095-2.256.226-3.329.613-.541.221-.863.384-1.133.56-.268.174-.537.395-.943.781-.386.406-.607.675-.781.943-.176.27-.339.591-.56 1.133-.387 1.073-.517 1.707-.612 3.33-.1 2.386-.132 3.868-.114 7.134v.036c-.018 3.266.014 4.748.114 7.135.095 1.622.225 2.256.612 3.329.221.542.384.864.56 1.133.174.269.395.537.781.943.406.387.675.607.943.782.27.175.592.338 1.133.559 1.073.387 1.707.518 3.33.613 2.386.1 3.868.131 7.134.113h.037c3.265.018 4.747-.013 7.134-.113 1.623-.095 2.257-.226 3.33-.613.54-.22.863-.384 1.132-.56.269-.174.537-.394.943-.78.387-.407.607-.675.782-.944.175-.27.338-.591.56-1.133.387-1.073.517-1.706.612-3.329.1-2.387.132-3.869.114-7.135v-.036c.018-3.266-.014-4.748-.114-7.135-.095-1.622-.225-2.256-.613-3.329-.22-.542-.384-.864-.559-1.133-.175-.268-.395-.537-.782-.943-.406-.386-.674-.607-.943-.782-.27-.175-.591-.338-1.133-.559-1.072-.387-1.706-.518-3.328-.613-2.388-.1-3.87-.131-7.136-.113h-.036c-3.265-.018-4.748.014-7.135.113Zm7.149-3.3c-3.314-.019-4.846.014-7.295.116l-.026.002c-1.88.11-2.826.285-4.272.809l-.028.01-.027.011c-.65.264-1.187.518-1.7.853-.514.334-.952.713-1.434 1.173l-.026.026-.025.026c-.46.482-.84.92-1.174 1.433-.335.514-.588 1.05-.852 1.7l-.012.028-.01.028c-.524 1.445-.7 2.392-.81 4.271v.027c-.103 2.449-.136 3.98-.117 7.295v.009c-.019 3.314.014 4.845.116 7.295l.002.026c.11 1.879.285 2.826.81 4.27l.01.03.01.027c.265.65.518 1.186.853 1.7.334.514.713.951 1.173 1.433l.026.027.026.025c.482.46.92.84 1.433 1.174.514.334 1.05.588 1.7.852l.028.011.028.01c1.446.525 2.393.7 4.272.81h.026c2.449.104 3.98.136 7.295.118h.01c3.313.018 4.845-.014 7.294-.117l.026-.001c1.879-.11 2.826-.285 4.271-.81l.028-.01.028-.011c.65-.264 1.187-.518 1.7-.852.514-.334.951-.714 1.433-1.174l.027-.025.025-.027c.46-.482.84-.92 1.174-1.433.334-.514.588-1.05.852-1.7l.011-.028.01-.028c.525-1.445.7-2.392.81-4.271l.001-.026c.103-2.45.135-3.981.117-7.295v-.01c.018-3.313-.014-4.845-.117-7.295l-.001-.026c-.11-1.879-.285-2.825-.81-4.27l-.01-.029-.01-.028c-.265-.65-.519-1.186-.853-1.7-.334-.514-.713-.95-1.174-1.433l-.025-.026-.027-.026c-.482-.46-.92-.84-1.432-1.173-.514-.335-1.05-.589-1.701-.853l-.028-.01-.028-.011c-1.445-.524-2.392-.7-4.27-.81h-.027c-2.45-.103-3.981-.136-7.295-.117h-.01Z" clip-rule="evenodd"/>
    <path fill="black" fill-rule="evenodd" d="M23.95 18.047a5.953 5.953 0 1 0 0 11.906 5.953 5.953 0 0 0 0-11.906ZM14.808 24a9.14 9.14 0 1 1 18.28 0 9.14 9.14 0 0 1-18.28 0Z" clip-rule="evenodd"/>
    <path fill="black" d="M33.441 16.64a2.133 2.133 0 1 0 0-4.265 2.133 2.133 0 0 0 0 4.266Z"/>
  </svg>`,
  },
  browserLogin: {
    url: 'https://www.instagram.com',
    runJSOnLaunch: js,
    runJSOnNavigate: js,
  },
  getUserProfileLink: ({ username }) =>
    `https://www.instagram.com/${username}/`,
}

export default info
