__d("LSWriteCTAIdToThreadsTable", ["LSGetFirstAvailableAttachmentCTAID"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, c = a[a.length - 1];
    c.n;
    var d = [], e = [], f;
    return c.seq([function (e) {
      return a[1] === f ? c.fe(c.ftr(c.db.table(9).fetch([[[a[0]]]]), function (b) {
        return c.i64.eq(b.threadKey, a[0]) && (c.i64.neq(b.lastMessageCtaId, f) || b.lastMessageCtaType !== f)
      }), function (b) {
        var c = b.update;
        b.item;
        return c({lastMessageCtaId: f, lastMessageCtaType: f, lastMessageCtaTimestampMs: a[2]})
      }) : c.i64.neq(a[2], f) ? c.seq([function (b) {
        return c.db.table(9).fetch([[[a[0]]]]).next().then(function (a, b) {
          var e = a.done;
          a = a.value;
          return e ? d[0] = c.i64.cast([0, 0]) : (b = a.item, d[0] = b.lastActivityTimestampMs)
        })
      }, function (e) {
        return c.i64.ge(a[2], d[0]) ? c.seq([function (a) {
          return c.sp(b("LSGetFirstAvailableAttachmentCTAID")).then(function (a) {
            return a = a, d[2] = a[0], a
          })
        }, function (b) {
          return c.fe(c.db.table(9).fetch([[[a[0]]]]), function (b) {
            var c = b.update;
            b.item;
            return c({lastMessageCtaId: d[2], lastMessageCtaType: a[1], lastMessageCtaTimestampMs: a[2]})
          })
        }]) : c.resolve(0)
      }]) : c.resolve()
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a;
  f["default"] = c
}), 66);
