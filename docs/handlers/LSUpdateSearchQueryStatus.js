__d("LSUpdateSearchQueryStatus", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.seq([function (c) {
        return b.i64.eq(a[1], b.i64.cast([0, 1])) ? b.fe(b.db.table(67).fetch([[[a[0]]]]), function (b) {
          var c = b.update;
          b.item;
          return c({statusPrimary: a[2], endTimeMs: a[3], resultCount: a[4]})
        }) : b.resolve()
      }, function (c) {
        return b.i64.eq(a[1], b.i64.cast([0, 2])) ? b.fe(b.db.table(67).fetch([[[a[0]]]]), function (b) {
          var c = b.update;
          b.item;
          return c({statusSecondary: a[2], endTimeMs: a[3], resultCount: a[4]})
        }) : b.resolve()
      }])
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
