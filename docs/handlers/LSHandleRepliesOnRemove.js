__d("LSHandleRepliesOnRemove", ["LSDeleteMessage"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, c = a[a.length - 1];
    c.n;
    var d = [], e;
    return c.seq([function (d) {
      return c.seq([function (b) {
        return c.fe(c.ftr(c.db.table(12).fetch([[[a[0]]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && b.replySourceId === a[1]
        }), function (a) {
          var b = a.item;
          return c.fe(c.ftr(c.db.table(12).fetch([[[b.threadKey, b.timestampMs, b.messageId]]]), function (a) {
            return c.i64.eq(a.threadKey, b.threadKey) && c.i64.eq(c.i64.cast([0, 0]), c.i64.cast([0, 0])) && c.i64.eq(a.timestampMs, b.timestampMs) && a.messageId === b.messageId
          }), function (a) {
            var b = a.update;
            a.item;
            return b({
              replySourceId: e,
              replySourceTimestampMs: e,
              replySourceType: e,
              replySourceTypeV2: e,
              replySnippet: e,
              replyStatus: e,
              replyToUserId: e,
              replyMessageText: e,
              replyMediaExpirationTimestampMs: e,
              replyMediaUrl: e,
              replyMediaUrlFallback: e,
              replyMediaPreviewWidth: e,
              replyMediaPreviewHeight: e,
              replyMediaUrlMimeType: e,
              replyAttachmentType: e,
              replyAttachmentId: e,
              replyAttachmentExtra: e
            })
          })
        })
      }, function (d) {
        return c.fe(c.ftr(c.db.table(12).fetch([[[a[0]]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && b.replySourceId === a[1] && c.i64.eq(b.replyType, c.i64.cast([0, 1]))
        }), function (a) {
          a = a.item;
          return c.sp(b("LSDeleteMessage"), a.threadKey, a.messageId)
        })
      }])
    }, function (a) {
      return c.resolve(d)
    }])
  }

  c = a;
  f["default"] = c
}), 66);
