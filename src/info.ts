import { Attribute, MessageDeletionMode, type PlatformInfo } from '@textshq/platform-sdk'
import { genClientContext } from './helpers'

const infoDefaults = {
  version: '1.0.0',
  loginMode: ['browser', 'browser-extension'] as PlatformInfo['loginMode'],
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
    Attribute.SUPPORTS_PUSH_NOTIFICATIONS,
  ]),
  notifications: {
    web: {
      vapidKey: 'BIBn3E_rWTci8Xn6P9Xj3btShT85Wdtne0LtwNUyRQ5XjFNkuTq9j4MPAVLvAFhXrUU1A9UxyxBA7YIOjqDIDHI', // browser_push_pub_key / BrowserPushPubKey
    },
  },
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
  typingDurationMs: 5_000,
  generateUniqueMessageID: () => genClientContext().toString(),
  extra: {
    knownIssues: [
      'Re-authentication might be required redundantly and threads will not load for some users.',
    ],
  },
} satisfies Partial<PlatformInfo>

export default infoDefaults
