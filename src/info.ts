import { PlatformInfo, MessageDeletionMode, texts } from '@textshq/platform-sdk'

const info: PlatformInfo = {
  name: 'x',
  version: '0.0.1',
  tags: ['Beta'],
  displayName: 'X',
  icon: `<svg width="1em" height="1em" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 500C0 223.858 223.858 0 500 0C776.142 0 1000 223.858 1000 500C1000 776.142 776.142 1000 500 1000H62.5C27.9822 1000 0 972.017 0 937.5V500Z" fill="currentColor" />
</svg>`,
  loginMode: 'custom',
  auth: texts.React?.lazy(() => import('./AuthForm')),
  deletionMode: MessageDeletionMode.UNSUPPORTED,
  attributes: new Set([
  ]),
}

export default info
