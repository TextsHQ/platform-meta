__d("LSUpdateLastSyncCompletedTimestampMsToNow", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d = [];
    return b.seq([function (d) {
      return c[0] = b.i64.of_float(Date.now()), b.fe(b.db.table(1).fetch([[[a[0]]]]), function (a) {
        var b = a.update;
        a.item;
        return b({lastSyncCompletedTimestampMs: c[0]})
      })
    }, function (a) {
      return b.resolve(d)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
