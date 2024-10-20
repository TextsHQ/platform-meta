import { PlatformInfo, MessageDeletionMode, Attribute } from '@textshq/platform-sdk'
import infoDefaults from '../info'

const js = `
const stylesheet = document.createElement('style');
stylesheet.innerHTML = '[role="dialog"] { opacity: 0; }';
document.head.append(stylesheet);
document.querySelector('[data-testid="cookie-policy-manage-dialog"]').remove()
if (window.location.hostname === 'www.messenger.com') {
  const interval = setInterval(() => {
    if (+require('CurrentUserInitialData')?.USER_ID) {
      clearInterval(interval)
      setTimeout(() => window.close(), 100)
    }
  }, 100)
}
`

const info: PlatformInfo = {
  ...infoDefaults,
  name: 'fb-messenger',
  displayName: 'Messenger',
  icon: `
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 0H5C2.23858 0 0 2.23858 0 5V11C0 13.7614 2.23858 16 5 16H11C13.7614 16 16 13.7614 16 11V5C16 2.23858 13.7614 0 11 0Z" fill="url(#rg)"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M2 7.82C2 4.4765 4.6205 2 8 2C11.3795 2 14 4.478 14 7.8215C14 11.165 11.3795 13.6415 8 13.6415C7.3925 13.6415 6.8105 13.5605 6.263 13.4105C6.1565 13.382 6.0425 13.3895 5.942 13.4345L4.751 13.9595C4.67907 13.9912 4.60044 14.0048 4.52204 13.999C4.44363 13.9933 4.36784 13.9683 4.30133 13.9264C4.23482 13.8845 4.17963 13.8269 4.1406 13.7586C4.10157 13.6904 4.0799 13.6136 4.0775 13.535L4.0445 12.467C4.0415 12.335 3.9815 12.212 3.884 12.125C2.717 11.081 2 9.569 2 7.82ZM6.15951 6.72646L4.39701 9.52245C4.22751 9.79095 4.55751 10.0925 4.80951 9.90045L6.70251 8.46345C6.76479 8.41615 6.84079 8.39041 6.919 8.39014C6.99722 8.38987 7.07339 8.41508 7.13601 8.46195L8.5385 9.51345C8.63798 9.58816 8.75187 9.64144 8.87297 9.66991C8.99408 9.69839 9.11977 9.70144 9.24212 9.67889C9.36447 9.65634 9.48081 9.60867 9.5838 9.53888C9.6868 9.4691 9.7742 9.37872 9.8405 9.27345L11.6045 6.47896C11.7725 6.21046 11.4425 5.90746 11.1905 6.09946L9.2975 7.53646C9.23522 7.58376 9.15922 7.6095 9.08101 7.60977C9.00279 7.61004 8.92662 7.58483 8.86401 7.53796L7.46151 6.48646C7.36203 6.41175 7.24814 6.35847 7.12704 6.33C7.00593 6.30152 6.88024 6.29847 6.75789 6.32102C6.63554 6.34357 6.5192 6.39124 6.41621 6.46103C6.31321 6.53081 6.22581 6.62119 6.15951 6.72646Z" fill="white"/>
  <defs>
  <radialGradient id="rg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.68 15.9996) scale(17.6 17.5996)">
  <stop stop-color="#0099FF"/>
  <stop offset="0.6" stop-color="#A033FF"/>
  <stop offset="0.9" stop-color="#FF5280"/>
  <stop offset="1" stop-color="#FF7061"/>
  </radialGradient>
  </defs>
  </svg>
  `,
  brand: {
    background: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48">
    <rect width="48" height="48" fill="url(#a)"/>
    <defs>
    <radialGradient id="a" cx="0" cy="0" r="1" gradientTransform="matrix(52.8 0 0 52.7988 8.04 47.999)" gradientUnits="userSpaceOnUse">
    <stop stop-color="#09F"/>
    <stop offset=".6" stop-color="#A033FF"/>
    <stop offset=".9" stop-color="#FF5280"/>
    <stop offset="1" stop-color="#FF7061"/>
    </radialGradient>
    </defs>
    </svg>`,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48">
    <path fill="black" fill-rule="evenodd" d="M6 23.46C6 13.43 13.861 6 24 6s18 7.434 18 17.465c0 10.03-7.861 17.46-18 17.46a19.69 19.69 0 0 1-5.211-.694 1.447 1.447 0 0 0-.963.072l-3.573 1.576a1.44 1.44 0 0 1-2.02-1.274l-.1-3.204a1.422 1.422 0 0 0-.481-1.026C8.151 33.243 6 28.707 6 23.46Zm12.479-3.28-5.288 8.387c-.509.806.481 1.71 1.237 1.134l5.68-4.31a1.08 1.08 0 0 1 1.3-.005l4.207 3.154a2.698 2.698 0 0 0 3.907-.72l5.291-8.383c.505-.806-.486-1.715-1.242-1.139l-5.678 4.311a1.08 1.08 0 0 1-1.301.005l-4.207-3.155a2.7 2.7 0 0 0-3.907.72Z" clip-rule="evenodd"/>
    </svg>`,
  },
  browserLogin: {
    url: 'https://www.messenger.com',
    runJSOnLaunch: js,
    runJSOnNavigate: js,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  },
  autofillHostnames: ['messenger.com', 'facebook.com'],
  deletionMode: MessageDeletionMode.DELETE_FOR_EVERYONE,
  maxGroupTitleLength: 25,
  typingDurationMs: 5000,
  attributes: new Set([
    // TODO: Add support for these attributes
    Attribute.SUPPORTS_ARCHIVE,
    Attribute.SUPPORTS_REQUESTS_INBOX,
    Attribute.NO_SUPPORT_GROUP_TITLE_CHANGE,
    // Attribute.SUPPORTS_GROUP_IMAGE_CHANGE,
    // Attribute.SUPPORTS_GROUP_PARTICIPANT_ROLE_CHANGE,
    Attribute.SUPPORTS_PRESENCE,
    // Attribute.SUPPORTS_DELETE_THREAD,
    Attribute.SUPPORTS_MARK_AS_UNREAD,
    // Attribute.SUPPORTS_STOP_TYPING_INDICATOR,
    Attribute.SUPPORTS_QUOTED_MESSAGES,
    Attribute.CAN_MESSAGE_USERNAME,
    // Attribute.DEFINES_MESSAGE_CURSOR,
    Attribute.SUBSCRIBE_TO_ONLINE_OFFLINE_ACTIVITY,
    Attribute.SUPPORTS_PUSH_NOTIFICATIONS,
  ]),
  attachments: {
    gifMimeType: 'image/gif',
    recordedAudioMimeType: 'audio/wav',
    maxSize: infoDefaults.attachments.maxSize,
  },
  extra: {
    ...infoDefaults.extra,
    macOSAppBundleIDs: ['com.facebook.archon.developerID'],
  },
  getUserProfileLink: ({ username }) =>
    username && `https://www.messenger.com/t/${username}`,
}

export default info
