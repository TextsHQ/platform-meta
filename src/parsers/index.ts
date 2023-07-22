// construct the conversations from undecipherable data
export function parseGetCursorResponse(payload: string) {
  const j = JSON.parse(payload);

  // tasks we are interested in
  let lsCalls = {
    upsertMessage: [],
  };

  // loop through the tasks
  for (const item of j.step[2][2][2].slice(1)) {
    // if we are interested in the task then add it to the lsCalls object
    if (item[1][1] in lsCalls) {
      lsCalls[item[1][1]].push(item[1].slice(2));
    }
  }

  // major shout out to Radon Rosborough(username radian-software) and  Scott Conway (username scottmconway) for their work in deciphering the lsCalls
  // this parsing would not be possible without their repos
  // https://github.com/scottmconway/unzuckify
  // https://github.com/radian-software/unzuckify
  // https://intuitiveexplanations.com/tech/messenger Radon's blog post on reverse engineering messenger. messenger and instagram use the same protocol

  let newMessages = [];
  for (const item of lsCalls.upsertMessage) {
    const message = item[0];
    const sentTs = item[5][1];
    const messageId = item[8];
    const authorId = item[10][1];

    newMessages.push({
      message,
      messageId,
      sentTs,
      authorId,
    });
  }
  return { newMessages, cursor: j.step[2][1][3][5] };
}
