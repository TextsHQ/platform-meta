import { PlatformInfo, MessageDeletionMode, Attribute } from '@textshq/platform-sdk'
import infoDefaults from '../info'
import icon from './icon'

const info: PlatformInfo = {
  ...infoDefaults,
  name: 'facebook',
  displayName: 'Facebook',
  icon,
  browserLogin: {
    url: 'https://facebook.com',
    authCookieName: 'c_user',
  },
  tags: ['INTERNAL TESTING ONLY'],
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
    // Attribute.SUPPORTS_PUSH_NOTIFICATIONS,
  ]),
  attachments: {
    gifMimeType: 'image/gif',
    recordedAudioMimeType: 'audio/wav',
    maxSize: infoDefaults.attachments.maxSize,
  },
  extra: {
    macOSAppBundleIDs: ['com.facebook.archon.developerID'],
  },
  getUserProfileLink: ({ username }) =>
    username && `https://www.facebook.com/messages/t/${username}`,
}

export default info
