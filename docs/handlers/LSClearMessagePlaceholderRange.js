__d("LSClearMessagePlaceholderRange", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      b = a[a.length - 1]
    b.n
    var c = []
    return b.seq([function (c) {
      return b.fe(b.ftr(b.db.table(13).fetch([[[a[0], b.i64.cast([0, 0])]]]), function (c) {
        return b.i64.eq(c.threadKey, a[0]) && c.minMessageId === a[1] && b.i64.eq(b.i64.cast([0, 0]), c.minTimestampMs) && b.i64.eq(a[2], c.maxTimestampMs)
      }), function (a) {
        return a["delete"]()
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a
  f["default"] = b
}), 66)
