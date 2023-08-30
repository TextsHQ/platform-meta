__d("LSHandleRepliesOnUnsend", ["LSIssueNewTask"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, c = a[a.length - 1];
    c.n;
    var d = [], e = [], f;
    return c.seq([function (e) {
      return c.seq([function (b) {
        return d[0] = c.createArray(), c.fe(c.ftr(c.db.table(12).fetch([[[a[0]]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && b.replySourceId === a[1]
        }), function (a) {
          a = a.item;
          return d[2] = (d[0].push(a.messageId), d[0])
        })
      }, function (e) {
        return d[1] = c.i64.of_int32(d[0].length), (c.i64.eq(d[1], c.i64.cast([0, 0])) ? !0 : !1) ? c.resolve() : (d[2] = new c.Map(), d[2].set("thread_key", a[0]), d[2].set("message_id", a[1]), d[2].set("reply_message_ids", d[0]), d[3] = c.toJSON(d[2]), c.sp(b("LSIssueNewTask"), "update_replies_on_unsend", c.i64.cast([0, 74]), d[3], f, f, c.i64.cast([0, 0]), c.i64.cast([0, 0]), f, f, c.i64.cast([0, 0])))
      }])
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a;
  f["default"] = c
}), 66);
