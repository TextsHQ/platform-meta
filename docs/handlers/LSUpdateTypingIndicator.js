__d("LSUpdateTypingIndicator", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d = [];
    return b.seq([function (d) {
      return b.seq([function (d) {
        return a[2] ? (c[0] = b.i64.of_float(Date.now()), b.db.table(52).put({
          threadKey: a[0], senderId: a[1], expirationTimestampMs: b.i64.add(c[0], b.i64.cast([0, 5e3]))
        })) : b.resolve()
      }, function (c) {
        return a[2] ? b.resolve() : b.fe(b.ftr(b.db.table(52).fetch([[[a[0], a[1]]]]), function (c) {
          return b.i64.eq(c.threadKey, a[0]) && b.i64.eq(b.i64.cast([0, 0]), b.i64.cast([0, 0])) && b.i64.eq(c.senderId, a[1])
        }), function (a) {
          return a["delete"]()
        })
      }])
    }, function (a) {
      return b.resolve(d)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
