__d("LSSetMessageTextHasLinks", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.ftr(b.db.table(12).fetch([[[a[0], a[2], a[1]]]]), function (c) {
        return b.i64.eq(c.threadKey, a[0]) && b.i64.eq(b.i64.cast([0, 0]), b.i64.cast([0, 0])) && b.i64.eq(c.timestampMs, a[2]) && c.messageId === a[1]
      }), function (a) {
        var b = a.update;
        a.item;
        return b({textHasLinks: !0})
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
