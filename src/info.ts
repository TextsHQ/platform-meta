import { PlatformInfo, MessageDeletionMode, texts } from '@textshq/platform-sdk'
import icon from './icon'
import { genClientContext } from './util'

const info: PlatformInfo = {
  name: 'instagram',
  version: '3.0.0',
  displayName: 'Instagram',
  tags: ['Unstable'],
  icon,
  loginMode: ['browser-extension'],
  deletionMode: MessageDeletionMode.UNSUPPORTED,
  attributes: new Set([
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
  },
  typingDurationMs: 10_000,
  generateUniqueMessageID: () => genClientContext().toString(),
  getUserProfileLink: ({ username }) =>
    `https://www.instagram.com/${username}/`,
}

export default info
