__d("LSInsertMessage", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d = [], e;
    return b.seq([function (d) {
      return b.i64.eq(a[2], b.i64.cast([0, 20])) ? b.db.table(12).add({
        threadKey: a[3],
        timestampMs: a[5],
        messageId: a[8],
        offlineThreadingId: a[9],
        authorityLevel: a[2],
        primarySortKey: a[6],
        senderId: a[10],
        isAdminMessage: a[12],
        sendStatus: a[15],
        sendStatusV2: a[16],
        text: a[0],
        subscriptErrorMessage: a[1],
        secondarySortKey: a[7],
        stickerId: a[11],
        messageRenderingType: a[13],
        isUnsent: a[17],
        unsentTimestampMs: a[18],
        mentionOffsets: a[19],
        mentionLengths: a[20],
        mentionIds: a[21],
        mentionTypes: a[22],
        replySourceId: a[23],
        replySourceType: a[24],
        replySourceTypeV2: a[25],
        replyStatus: a[26],
        replySnippet: a[27],
        replyMessageText: a[28],
        replyToUserId: a[29],
        replyMediaExpirationTimestampMs: a[30],
        replyMediaUrl: a[31],
        replyMediaPreviewWidth: a[33],
        replyMediaPreviewHeight: a[34],
        replyMediaUrlMimeType: a[35],
        replyMediaUrlFallback: a[36],
        replyCtaId: a[37],
        replyCtaTitle: a[38],
        replyAttachmentType: a[39],
        replyAttachmentId: a[40],
        replyAttachmentExtra: a[41],
        isForwarded: a[42],
        forwardScore: a[43],
        hasQuickReplies: a[44],
        adminMsgCtaId: a[45],
        adminMsgCtaTitle: a[46],
        adminMsgCtaType: a[47],
        cannotUnsendReason: a[48],
        textHasLinks: a[49],
        viewFlags: a[50],
        displayedContentTypes: a[51],
        viewedPluginKey: a[52],
        viewedPluginContext: a[53],
        quickReplyType: a[54],
        hotEmojiSize: a[55],
        replySourceTimestampMs: a[56],
        ephemeralDurationInSec: a[57],
        msUntilExpirationTs: a[58],
        ephemeralExpirationTs: a[59],
        takedownState: a[60],
        isCollapsed: a[61],
        subthreadKey: a[62]
      }) : b.seq([function (d) {
        return b.db.table(12).fetch([[[a[9]]], "optimistic"]).next().then(function (b, d) {
          var f = b.done;
          b = b.value;
          return f ? (f = [a[6], a[7], e], c[0] = f[0], c[1] = f[1], c[2] = f[2], f) : (d = b.item, f = [d.primarySortKey, d.secondarySortKey, d.localDataId], c[0] = f[0], c[1] = f[1], c[2] = f[2], f)
        })
      }, function (c) {
        return b.fe(b.ftr(b.db.table(12).fetch([[[a[9]]], "optimistic"]), function (c) {
          return c.offlineThreadingId === a[9] && b.i64.lt(c.authorityLevel, a[2])
        }), function (a) {
          return a["delete"]()
        })
      }, function (d) {
        return b.db.table(12).add({
          threadKey: a[3],
          timestampMs: a[5],
          messageId: a[8],
          offlineThreadingId: a[9],
          authorityLevel: a[2],
          primarySortKey: c[0],
          senderId: a[10],
          isAdminMessage: a[12],
          sendStatus: a[15],
          sendStatusV2: a[16],
          text: a[0],
          subscriptErrorMessage: a[1],
          secondarySortKey: c[1],
          stickerId: a[11],
          messageRenderingType: a[13],
          isUnsent: a[17],
          unsentTimestampMs: a[18],
          mentionOffsets: a[19],
          mentionLengths: a[20],
          mentionIds: a[21],
          mentionTypes: a[22],
          replySourceId: a[23],
          replySourceType: a[24],
          replySourceTypeV2: a[25],
          replyStatus: a[26],
          replySnippet: a[27],
          replyMessageText: a[28],
          replyToUserId: a[29],
          replyMediaExpirationTimestampMs: a[30],
          replyMediaUrl: a[31],
          replyMediaPreviewWidth: a[33],
          replyMediaPreviewHeight: a[34],
          replyMediaUrlMimeType: a[35],
          replyMediaUrlFallback: a[36],
          replyCtaId: a[37],
          replyCtaTitle: a[38],
          replyAttachmentType: a[39],
          replyAttachmentId: a[40],
          replyAttachmentExtra: a[41],
          isForwarded: a[42],
          forwardScore: a[43],
          hasQuickReplies: a[44],
          adminMsgCtaId: a[45],
          adminMsgCtaTitle: a[46],
          adminMsgCtaType: a[47],
          cannotUnsendReason: a[48],
          textHasLinks: a[49],
          viewFlags: a[50],
          displayedContentTypes: a[51],
          viewedPluginKey: a[52],
          viewedPluginContext: a[53],
          quickReplyType: a[54],
          hotEmojiSize: a[55],
          replySourceTimestampMs: a[56],
          ephemeralDurationInSec: a[57],
          msUntilExpirationTs: a[58],
          ephemeralExpirationTs: a[59],
          takedownState: a[60],
          isCollapsed: a[61],
          subthreadKey: a[62],
          localDataId: c[2]
        })
      }])
    }, function (a) {
      return b.resolve(d)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
