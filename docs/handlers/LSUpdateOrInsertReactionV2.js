__d("LSUpdateOrInsertReactionV2", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      b = a[a.length - 1]
    b.n
    var c = [],
      d = []
    return b.seq([function (d) {
      return b.db.table(226).fetch([[[a[0], a[1], a[2]]]]).next().then(function (d, e) {
        var f = d.done
        d = d.value
        return f ? b.db.table(12).fetch([[[a[1]]], "messageId"]).next().then(function (d, e) {
          var c = d.done
          d = d.value
          return c ? 0 : (e = d.item, b.seq([function (c) {
            return b.fe(b.ftr(b.db.table(226).fetch([[[a[0], a[1], a[2]]]]), function (c) {
              return b.i64.eq(c.threadKey, a[0]) && c.messageId === a[1] && b.i64.eq(c.reactionFbid, a[2]) && b.i64.lt(c.authorityLevel, a[5])
            }), function (a) {
              return a["delete"]()
            })
          }, function (c) {
            return b.db.table(226).add({
              messageId: a[1],
              threadKey: a[0],
              reactionFbid: a[2],
              messageTimestamp: e.timestampMs,
              authorityLevel: a[5],
              count: a[4],
              viewerIsReactor: a[6],
              viewerReactionTimestampMs: a[7],
              lastUpdatedTimestampMs: a[8]
            })
          }]))
        }) : (e = d.item, c[2] = e.lastUpdatedTimestampMs, c[1] = e.authorityLevel, b.i64.eq(a[5], b.i64.cast([0, 20])) || b.i64.eq(c[1], b.i64.cast([0, 80])) && b.i64.eq(a[5], b.i64.cast([0, 80])) || b.i64.eq(c[1], b.i64.cast([0, 20])) && b.i64.eq(a[5], b.i64.cast([0, 80])) && b.i64.le(b.i64.add(c[2], b.i64.cast([0, 2e3])), a[8]) || b.i64.eq(c[1], b.i64.cast([0, 20])) && b.i64.eq(a[5], b.i64.cast([0, 60])) || b.i64.eq(c[1], b.i64.cast([0, 60])) && b.i64.eq(a[5], b.i64.cast([0, 80])) && b.i64.le(c[2], a[8]) ? c[3] = !0 : c[3] = !1, c[3] ? b.db.table(226).put({
          messageId: a[1],
          threadKey: a[0],
          reactionFbid: a[2],
          messageTimestamp: e.messageTimestamp,
          reactionLiteral: a[3],
          count: a[4],
          authorityLevel: a[5],
          viewerIsReactor: a[6],
          viewerReactionTimestampMs: b.i64.cast([0, 0]),
          lastUpdatedTimestampMs: a[8]
        }) : b.resolve())
      })
    }, function (a) {
      return b.resolve(d)
    }])
  }

  b = a
  f["default"] = b
}), 66)
