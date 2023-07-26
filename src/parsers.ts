// import { type InferModel } from 'drizzle-orm'
// import * as schema from './store/schema'

type IGReaction = {
  reactionSentTs: string
  reactorId: string
  reaction: string
  messageId: string
}

// construct the conversations from undecipherable data
export function parsePayload(myUserId: string, payload: string) {
  const j = JSON.parse(payload)

  // tasks we are interested in
  const lsCalls = {
    verifyContactRowExists: [],
    addParticipantIdToGroupThread: [],
    deleteThenInsertThread: [],
    upsertMessage: [],
    upsertSyncGroupThreadsRange: [],
    upsertReaction: [],
    insertBlobAttachment: [],
  }

  const userLookup = {}
  const lastMessageLookup = {}
  const reactionLookup: Record<string, IGReaction[]> = {}
  const imageLookup: Record<string, { imageId: string, imageUrl: string }[]> = {}
  const conversationParticipants = {}
  const conversations = []

  // loop through the tasks
  for (const item of j.step[2][2][2].slice(1)) {
    // if we are interested in the task then add it to the lsCalls object
    if (item[1][1] in lsCalls) {
      lsCalls[item[1][1]].push(item[1].slice(2))
    }
  }

  // major shout out to Radon Rosborough(username radian-software) and  Scott Conway (username scottmconway) for their work in deciphering the lsCalls
  // this parsing would not be possible without their repos
  // https://github.com/scottmconway/unzuckify
  // https://github.com/radian-software/unzuckify
  // https://intuitiveexplanations.com/tech/messenger Radon's blog post on reverse engineering messenger. messenger and instagram use the same protocol
  for (const item of lsCalls.verifyContactRowExists) {
    const userId = item[0][1]
    const name = item[3]
    const username = item[item.length - 1]
    userLookup[userId] = { name, username, userId }
  }

  for (const item of lsCalls.addParticipantIdToGroupThread) {
    const threadId = item[0][1] // in DMs is also the other user id
    const userId = item[1][1] // userId

    // if threadId does not exist then create an empty set
    if (!(threadId in conversationParticipants)) {
      conversationParticipants[threadId] = new Set()
    }
    conversationParticipants[threadId].add(userLookup[userId])
  }
  for (const item of lsCalls.upsertReaction) {
    const reactionSentTs = item[1][1]
    const messageId = item[2] as string
    // const messageId = item[2][1] as string
    const reactorId = item[3][1] as string
    // const reaction = item[4][1]
    const reaction = item[4]

    if (!(messageId in reactionLookup)) {
      reactionLookup[messageId] = []
    }
    reactionLookup[messageId].push({
      messageId,
      reactionSentTs,
      reactorId,
      reaction,
    })
  }

  for (const item of lsCalls.insertBlobAttachment) {
    const imageUrl = item[8]
    const messageId = item[32]
    const imageId = item[0]
    if (!(messageId in imageLookup)) {
      imageLookup[messageId] = []
    }
    imageLookup[messageId].push({
      imageId,
      imageUrl,
    })
  }

  const newMessages = []
  for (const item of lsCalls.upsertMessage) {
    const message = item[0]
    const threadId = item[3][1]
    const sentTs = item[5][1]
    const messageId = item[8]
    const authorId = item[10][1]

    const _r = reactionLookup[messageId]
    const reaction = _r ? Array.from(_r) : null
    const images = imageLookup[messageId]

    newMessages.push({
      message,
      messageId,
      sentTs,
      authorId,
      threadId,
      reaction,
      images,
    })
    lastMessageLookup[threadId] = {
      message,
      sentTs,
      messageId,
      authorId,
      threadId,
      reaction,
      images,
    }
  }

  for (const item of lsCalls.deleteThenInsertThread) {
    const lastSentTime = item[0][1]
    const lastReadTime = item[1][1]
    let groupName: string
    if (Array.isArray(item[3])) {
      groupName = null
    } else {
      // eslint-disable-next-line prefer-destructuring
      groupName = item[3]
    }

    const threadId = item[7][1]

    // skip if threads have no participants ie no one is in the group
    if (!(threadId in conversationParticipants)) continue

    // if groupName is null then set it to all the participants names
    if (groupName === null) {
      groupName = Array.from(conversationParticipants[threadId])
        .filter(x => (x as any).userId !== myUserId)
        .map(x => (x as any).name)
        .join(', ')
    }

    conversations.push({
      threadId,
      unread: Number(lastSentTime) > Number(lastReadTime),
      lastReadTime,
      lastSentTime,
      groupName,
      participants: Array.from(conversationParticipants[threadId]),
      lastMessageDetails: lastMessageLookup[threadId],
    })
  }

  return {
    newMessages: newMessages.length ? newMessages : null,
    newConversations: conversations.length ? conversations : null,
    // return newreactions as an array if it exists and remove the set
    newReactions: Object.keys(reactionLookup).length ? Object.values(reactionLookup).flat() : null,
    cursor: j.step[2][1][3][5],
    hasMore: lsCalls.upsertSyncGroupThreadsRange?.[0]?.[3],
  }
}

const parseThread = a => {
  const tmap = {
    isUnread: Number(a[0][1]) > Number(a[1][1]),
    threadKey: a[7],
    lastReadWatermarkTimestampMs: new Date(Number(a[1][1])),
    threadType: a[9][1] === '1' ? 'single' : 'group',
    folderName: a[10],
    parentThreadKey: a[35][1],
    lastActivityTimestampMs: new Date(Number(a[0][1])),
    snippet: a[2],
    threadName: a[3][1],
    threadPictureUrl: a[4],
    needsAdminApprovalForNewParticipant: a[5][1],
    threadPictureUrlFallback: a[11],
    threadPictureUrlExpirationTimestampMs: new Date(Number(a[12][1])),
    removeWatermarkTimestampMs: new Date(Number(a[13][1])),
    muteExpireTimeMs: new Date(Number(a[14][1])),
    // muteCallsExpireTimeMs: new Date(Number(a[15][1])),
    groupNotificationSettings: a[16][1],
    isAdminSnippet: a[17][1],
    snippetSenderContactId: a[18][1],
    snippetStringHash: a[21][1],
    snippetStringArgument1: a[22][1],
    snippetAttribution: a[23][1],
    snippetAttributionStringHash: a[24][1],
    disappearingSettingTtl: a[25][1],
    disappearingSettingUpdatedTs: a[26][1],
    disappearingSettingUpdatedBy: a[27][1],
    cannotReplyReason: a[30][1],
    customEmoji: a[31][1],
    customEmojiImageUrl: a[32][1],
    outgoingBubbleColor: a[33][1],
    themeFbid: a[34][1],
  }

  if (Array.isArray(a[3])) {
    tmap.threadName = null
  } else {
    // eslint-disable-next-line prefer-destructuring
    tmap.threadName = a[3]
  }
  return tmap
  // loop through the keys and if the value is
}

const parseUser = a => ({
  id: a[0][1],
  profilePictureUrl: a[2] == null ? '' : a[2],
  name: a[3],
  username: a[20],
})

const parseParticipant = a => ({
  threadKey: a[0][1],
  userId: a[1][1],
  readWatermarkTimestampMs: a[2][1],
  readActionTimestampMs: a[3][1],
  deliveredWatermarkTimestampMs: a[4][1],
  lastDeliveredWatermarkTimestampMs: a[5][1],
  isAdmin: a[6],
})

const parseMessage = a => ({
  text: a[0],
  threadKey: a[3][1],
  timestampMs: a[5][1],
  messageId: a[8],
  offlineThreadingId: a[9],
  senderId: a[10][1],
})

const parseReaction = a => ({
  threadKey: a[0][1],
  timestampMs: new Date(Number(a[1][1])),
  messageId: a[2],
  actorId: a[3][1],
  reaction: a[4],
})
export function parseRawPayload(payload) {
  const j = JSON.parse(payload)
  // tasks we are interested in
  const lsCalls = {
    verifyContactRowExists: [],
    addParticipantIdToGroupThread: [],
    deleteThenInsertThread: [],
    upsertMessage: [],
    upsertReaction: [],
    // insertBlobAttachment: [],
    upsertSyncGroupThreadsRange: [],
  }
  // loop through the tasks
  for (const item of j.step[2][2][2].slice(1)) {
    // if we are interested in the task then add it to the lsCalls object
    if (item[1][1] in lsCalls) {
      lsCalls[item[1][1]].push(item[1].slice(2))
    }
  }
  const res = {
    verifyContactRowExists: null,
    addParticipantIdToGroupThread: null,
    deleteThenInsertThread: null,
    upsertMessage: null,
    upsertReaction: null,
    upsertSyncGroupThreadsRange: null,
  }
  // lsCalls.deleteThenInsertThread = lsCalls.deleteThenInsertThread.map(parseThread)
  // lsCalls.verifyContactRowExists = lsCalls.verifyContactRowExists.map(parseUser)
  // lsCalls.addParticipantIdToGroupThread = lsCalls.addParticipantIdToGroupThread.map(parseParticipant)
  // lsCalls.upsertMessage = lsCalls.upsertMessage.map(parseMessage)
  // lsCalls.upsertReaction = lsCalls.upsertReaction.map(parseReaction)
  if (lsCalls.deleteThenInsertThread.length) {
    res.deleteThenInsertThread = lsCalls.deleteThenInsertThread.map(parseThread)
  }
  if (lsCalls.verifyContactRowExists.length) { res.verifyContactRowExists = lsCalls.verifyContactRowExists.map(parseUser) }
  if (lsCalls.addParticipantIdToGroupThread.length) {
    res.addParticipantIdToGroupThread = lsCalls.addParticipantIdToGroupThread.map(parseParticipant)
  }
  if (lsCalls.upsertMessage.length) { res.upsertMessage = lsCalls.upsertMessage.map(parseMessage) }
  if (lsCalls.upsertReaction.length) { res.upsertReaction = lsCalls.upsertReaction.map(parseReaction) }

  return res
}
