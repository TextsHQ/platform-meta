__d("LSInsertNewMessageRange", ["LSClearMessagePlaceholderRange"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      c = a[a.length - 1]
    c.n
    var d = [],
      e = []
    return c.seq([function (e) {
      return c.seq([function (d) {
        return c.sp(b("LSClearMessagePlaceholderRange"), a[0], a[9], c.i64.cast([0, 0]))
      }, function (b) {
        return c.ftr(c.db.table(13).fetch([[[a[0], {lte: a[5]}]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && c.i64.le(b.minTimestampMs, a[5]) && c.i64.ge(b.maxTimestampMs, a[5])
        }).next().then(function (b, c) {
          var e = b.done
          b = b.value
          return e ? (e = [a[1], a[3], a[7]], d[0] = e[0], d[1] = e[1], d[2] = e[2], e) : (c = b.item, e = [c.minTimestampMs, c.minMessageId, c.hasMoreBefore], d[0] = e[0], d[1] = e[1], d[2] = e[2], e)
        })
      }, function (b) {
        return c.ftr(c.db.table(13).fetch([[[a[0], {lte: a[6]}]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && c.i64.le(b.minTimestampMs, a[6]) && c.i64.ge(b.maxTimestampMs, a[6])
        }).next().then(function (b, c) {
          var e = b.done
          b = b.value
          return e ? (e = [a[2], a[4], a[8]], d[4] = e[0], d[5] = e[1], d[6] = e[2], e) : (c = b.item, e = [c.maxTimestampMs, c.maxMessageId, c.hasMoreAfter], d[4] = e[0], d[5] = e[1], d[6] = e[2], e)
        })
      }, function (b) {
        return c.fe(c.ftr(c.db.table(13).fetch([[[a[0], {lte: a[6]}]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && c.i64.ge(a[6], b.minTimestampMs) && c.i64.le(a[5], b.maxTimestampMs)
        }), function (a) {
          return a["delete"]()
        })
      }, function (b) {
        return c.db.table(13).put({
          threadKey: a[0],
          minTimestampMs: d[0],
          minMessageId: d[1],
          maxTimestampMs: d[4],
          maxMessageId: d[5],
          isLoadingBefore: !1,
          isLoadingAfter: !1,
          hasMoreBefore: d[2],
          hasMoreAfter: d[6]
        })
      }])
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a
  f["default"] = c
}), 66)
