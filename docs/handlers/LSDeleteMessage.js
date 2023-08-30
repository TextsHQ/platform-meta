__d("LSDeleteMessage", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.ftr(b.db.table(12).fetch([[[a[0]]]]), function (c) {
        return c.messageId === a[1] && b.i64.eq(c.threadKey, a[0])
      }), function (a) {
        return a["delete"]()
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
