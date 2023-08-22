const parseThread = (a) => {
  const tmap = {
    // isUnread: Number(a[0][1]) > Number(a[1][1]),
    threadKey: a[7][1],
    lastReadWatermarkTimestampMs: new Date(Number(a[1][1])),
    threadType: a[9][1] === "1" ? "single" : "group",
    folderName: a[10],
    parentThreadKey: a[35][1],
    lastActivityTimestampMs: new Date(Number(a[0][1])),
    snippet: a[2],
    threadName: a[3][1],
    threadPictureUrl: a[4],
    needsAdminApprovalForNewParticipant: a[5][1],
    threadPictureUrlFallback: a[11],
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
  };

  if (Array.isArray(a[3])) {
    tmap.threadName = null;
  } else {
    // eslint-disable-next-line prefer-destructuring
    tmap.threadName = a[3];
  }
  return tmap;
  // loop through the keys and if the value is
};

const parseUser = (a) => ({
  id: a[0][1],
  profilePictureUrl: a[2] == null ? "" : a[2],
  name: a[3],
  username: a[20],
});

const parseParticipant = (a) => ({
  threadKey: a[0][1],
  userId: a[1][1],
  readWatermarkTimestampMs: new Date(Number(a[2][1])),
  readActionTimestampMs: new Date(Number(a[3][1])),
  deliveredWatermarkTimestampMs: new Date(Number(a[4][1])),
  lastDeliveredActionTimestampMs: a[5][1] ? new Date(Number(a[5][1])) : null,
  isAdmin: a[6],
});

const parseMessage = (a) => ({
  text: a[0],
  threadKey: a[3][1],
  timestampMs: new Date(Number(a[5][1])),
  messageId: a[8],
  offlineThreadingId: a[9],
  senderId: a[10][1],
});

const parseReaction = (a) => ({
  threadKey: a[0][1],
  timestampMs: new Date(Number(a[1][1])),
  messageId: a[2],
  actorId: a[3][1],
  reaction: a[4],
});

const parseSearchArguments = (a) => ({
  // query: a[0],
  userId: a[1],
  displayName: a[5],
  profilePictureUrl: a[6],
  username: a[8],
  // messageId: a[9],
  // messageTimestampMs: new Date(Number(a[10])),
  // isVerified: a[12],
});

const parseMap = {
  deleteThenInsertThread: parseThread,
  upsertMessage: parseMessage,
  upsertReaction: parseReaction,
  addParticipantIdToGroupThread: parseParticipant,
  verifyContactRowExists: parseUser,
  insertSearchResult: parseSearchArguments,
};

export function parseRawPayload(payload) {
  const j = JSON.parse(payload);
  // tasks we are interested in
  const lsCalls = {
    verifyContactRowExists: [],
    addParticipantIdToGroupThread: [],
    deleteThenInsertThread: [],
    upsertMessage: [],
    upsertReaction: [],
    upsertSyncGroupThreadsRange: [],
    insertSearchResult: [],
  };

  // loop through the tasks
  for (const item of j.step[2][2][2].slice(1)) {
    // if we are interested in the task then add it to the lsCalls object
    if (item[1][1] in lsCalls) {
      console.error("item is", item[1][1]);
      lsCalls[item[1][1]].push(item[1].slice(2));
    }
  }

  // Remove empty lsCalls or lsCalls that are not in parseMap
  for (const key in lsCalls) {
    if (lsCalls[key].length === 0 || !(key in parseMap)) {
      delete lsCalls[key];
    }
  }
  // parse the lsCalls
  const result = {};

  for (const key in lsCalls) {
    result[key] = lsCalls[key].map(parseMap[key]);
  }
  return result;
}

export function parseSearchResult(payload) {
  const j = JSON.parse(payload);
  // tasks we are interested in
  const lsCalls = {
    insertSearchResult: [],
  };

  // loop through the tasks
  let i = 0;
  for (const i of j.step.slice(2)) {
    const functionName = i[2][2][1][1];
    const args = i[2][2][1].splice(2);

    // if we are interested in the task then add it to the lsCalls object
    if (functionName in lsCalls) {
      lsCalls[functionName].push(args);
    }
  }

  // Remove empty lsCalls or lsCalls that are not in parseMap
  for (const key in lsCalls) {
    if (lsCalls[key].length === 0 || !(key in parseMap)) {
      delete lsCalls[key];
    }
  }
  // parse the lsCalls
  const result = {};

  for (const key in lsCalls) {
    result[key] = lsCalls[key].map(parseMap[key]);
  }
  return result;
}
