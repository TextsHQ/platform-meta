__d("LSSyncUpdateThreadName", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      b = a[a.length - 1]
    b.n
    var c = [],
      d
    return b.seq([function (c) {
      return b.fe(b.ftr(b.db.table(9).fetch([[[a[1]]]]), function (c) {
        return b.i64.eq(c.threadKey, a[1]) && ([b.i64.cast([0, 2]), b.i64.cast([0, 150]), b.i64.cast([0, 152]), b.i64.cast([0, 154])].some(function (a) {
          return b.i64.eq(c.threadType, a)
        }) || [b.i64.cast([0, 23]), b.i64.cast([0, 21]), b.i64.cast([0, 18]), b.i64.cast([0, 26])].some(function (a) {
          return b.i64.eq(c.threadType, a)
        }) || [b.i64.cast([0, 24]), b.i64.cast([0, 22]), b.i64.cast([0, 19]), b.i64.cast([0, 25])].some(function (a) {
          return b.i64.eq(c.threadType, a)
        }))
      }), function (b) {
        var c = b.update
        b.item
        return c({threadName: a[0] === "" ? d : a[0].trim()})
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a
  f["default"] = b
}), 66)
