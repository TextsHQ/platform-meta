__d("LSUpdateParticipantSubscribeSourceText", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.ftr(b.db.table(14).fetch([[[a[0], a[1]]]]), function (c) {
        return b.i64.eq(c.threadKey, a[0]) && b.i64.eq(b.i64.cast([0, 0]), b.i64.cast([0, 0])) && b.i64.eq(c.contactId, a[1])
      }), function (b) {
        var c = b.update;
        b.item;
        return c({subscribeSource: a[2]})
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
