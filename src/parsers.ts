type IGReaction = {
  reactionSentTs: string
  reactorId: string
  reaction: string
  messageId: string
}

// construct the conversations from undecipherable data
export function parseGetCursorResponse(myUserId: string, payload: string) {
  const j = JSON.parse(payload)

  // tasks we are interested in
  const lsCalls = {
    verifyContactRowExists: [],
    addParticipantIdToGroupThread: [],
    deleteThenInsertThread: [],
    upsertMessage: [],
    upsertSyncGroupThreadsRange: [],
    upsertReaction: [],
  }

  const userLookup = {}
  const lastMessageLookup = {}
  const reactionLookup: Record<string, Set<IGReaction>> = {}
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
    const messageId = item[2][1] as string
    const reactorId = item[3][1] as string
    const reaction = item[4][1]

    if (!(messageId in reactionLookup)) {
      reactionLookup[messageId] = new Set()
    }
    reactionLookup[messageId].add({
      messageId,
      reactionSentTs,
      reactorId,
      reaction,
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
    newMessages.push({
      message,
      messageId,
      sentTs,
      authorId,
      threadId,
      reaction,
    })
    lastMessageLookup[threadId] = {
      message,
      sentTs,
      messageId,
      authorId,
      threadId,
      reaction,
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
    newMessages,
    newConversations: conversations,
    newReactions: reactionLookup,
    cursor: j.step[2][1][3][5],
    hasMore: lsCalls.upsertSyncGroupThreadsRange?.[0]?.[3],
  }
}

export function parseMessagePayload(myUserId: string, payload: string) {
  return parseGetCursorResponse(myUserId, payload)
}
