import { Attribute, MessageDeletionMode, type PlatformInfo } from '@textshq/platform-sdk'
import icon from './icon'
import { genClientContext } from './util'

const info: PlatformInfo = {
  name: 'instagram',
  version: '3.0.0',
  displayName: 'Instagram',
  icon,
  loginMode: ['browser-extension', 'browser'],
  browserLogin: {
    url: 'https://instagram.com',
    authCookieName: 'sessionid',
  },
  deletionMode: MessageDeletionMode.UNSEND,
  attributes: new Set([
    Attribute.SUPPORTS_REQUESTS_INBOX,
    Attribute.SUPPORTS_DELETE_THREAD,
    // Attribute.CANNOT_MESSAGE_SELF,
    Attribute.SUPPORTS_MOVING_THREAD_TO_INBOX,
    Attribute.SUPPORTS_QUOTED_MESSAGES,
    Attribute.SUPPORTS_GROUP_PARTICIPANT_ROLE_CHANGE,
    Attribute.SUPPORTS_FORWARD,
    Attribute.SORT_MESSAGES_ON_PUSH,
  ]),
  reactions: {
    supported: {
      '❤️': { title: '❤️', render: '❤️' },
      '😂': { title: '😂', render: '😂' },
      '😮': { title: '😮', render: '😮' },
      '😢': { title: '😢', render: '😢' },
      '😡': { title: '😡', render: '😡' },
      '👍': { title: '👍', render: '👍' },
    },
    canReactWithAllEmojis: true,
    allowsMultipleReactionsToSingleMessage: false,
  },
  maxGroupTitleLength: 25,
  attachments: {
    noSupportForFiles: true,
    gifMimeType: 'video/mp4',
    maxSize: {
      // https://developers.facebook.com/docs/messenger-platform/send-messages/
      // "The Messenger Platform allows you to attach assets to messages, including audio, video, images, and files. The maximum attachment size is 25 MB."
      // "Please note that our servers might encode an uploaded file to ensure compatibility. It's possible to get a file size limit error if the resulting size surpasses the 25MB limit."
      // todo: unknown if these limits are just for the developer api or also for regular users using the messenger apps
      // or if it's applicable to instagram
      image: 25 * 1024 * 1024,
      video: 25 * 1024 * 1024,
      audio: 25 * 1024 * 1024,
      files: 25 * 1024 * 1024,
    },
  },
  typingDurationMs: 5000,
  generateUniqueMessageID: () => genClientContext().toString(),
  getUserProfileLink: ({ username }) =>
    `https://www.instagram.com/${username}/`,
}

export default info
