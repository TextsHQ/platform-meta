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
    Attribute.CANNOT_MESSAGE_SELF,
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
  attachments: {
    noSupportForFiles: true,
    gifMimeType: 'video/mp4',
  },
  typingDurationMs: 10_000,
  generateUniqueMessageID: () => genClientContext().toString(),
  getUserProfileLink: ({ username }) =>
    `https://www.instagram.com/${username}/`,
}

export default info
