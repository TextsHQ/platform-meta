import type { IGThread, IGMessage, IGReaction, IGAttachment } from './store/schema'

export interface ExtendedIGThread extends IGThread {
  unread: boolean
  participants: IGParticipant[]
  lastMessageDetails: Partial<IGMessage>
}

export interface ExtendedIGMessage extends IGMessage {
  reaction?: IGReaction[]
  attachements?: IGAttachment[]
  images?: {
    imageId: string
    imageUrl: string
  }[]
}

export interface IGParticipant {
  name: string
  username: string
  userId: string
}
