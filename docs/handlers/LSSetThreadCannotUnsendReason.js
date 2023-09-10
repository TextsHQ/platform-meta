__d("LSSetThreadCannotUnsendReason", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.db.table(9).fetch([[[a[0]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({cannotUnsendReason: a[1]})
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
