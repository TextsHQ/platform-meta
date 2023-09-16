import { PlatformInfo, MessageDeletionMode, Attribute } from '@textshq/platform-sdk'
import infoDefaults from '../info'
import icon from './icon'

const info: PlatformInfo = {
  ...infoDefaults,
  browserLogin: {
    url: 'https://facebook.com',
    authCookieName: 'c_user',
  },
  name: 'facebookdotcom',
  displayName: 'Messenger',
  icon,
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
    Attribute.DEFINES_MESSAGE_CURSOR,
    Attribute.SUBSCRIBE_TO_ONLINE_OFFLINE_ACTIVITY,
    Attribute.SUPPORTS_PUSH_NOTIFICATIONS,
  ]),
  attachments: {
    gifMimeType: 'image/gif',
    recordedAudioMimeType: 'audio/wav',
    maxSize: {
      // https://developers.facebook.com/docs/messenger-platform/send-messages/
      // "The Messenger Platform allows you to attach assets to messages, including audio, video, images, and files. The maximum attachment size is 25 MB."
      // "Please note that our servers might encode an uploaded file to ensure compatibility. It's possible to get a file size limit error if the resulting size surpasses the 25MB limit."
      // todo: unknown if these limits are just for the developer api or also for regular users using the messenger apps
      image: 25 * 1024 * 1024,
      video: 25 * 1024 * 1024,
      audio: 25 * 1024 * 1024,
      files: 25 * 1024 * 1024,
    },
  },
  notifications: {
    android: {
      senderID: '622912139302',
    },
  },
  extra: {
    macOSAppBundleIDs: ['com.facebook.archon.developerID'],
    knownIssues: [
      "Facebook may lock your account since it doesn't recognize Texts app and make you reset your password.",
      // "You'll get a login notification from Facebook saying Texts has logged in as a Google Pixel 2. There is no physical/simulated device used but how Texts identifies itself.",
    ],
  },
  getUserProfileLink: ({ username }) =>
    username && `https://www.messenger.com/t/${username}`,
}

export default info
