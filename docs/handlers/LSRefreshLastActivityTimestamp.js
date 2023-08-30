__d("LSRefreshLastActivityTimestamp", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d = [];
    return b.seq([function (d) {
      return b.seq([function (d) {
        return b.db.table(12).fetchDesc([[[a[0]]]]).next().then(function (a, d) {
          var e = a.done;
          a = a.value;
          return e ? c[0] = b.i64.cast([0, 0]) : (d = a.item, c[0] = d.timestampMs)
        })
      }, function (d) {
        return b.db.table(9).fetch([[[a[0]]]]).next().then(function (a, d) {
          var e = a.done;
          a = a.value;
          return e ? c[2] = b.i64.cast([0, 0]) : (d = a.item, c[2] = d.lastActivityTimestampMs)
        })
      }, function (d) {
        return b.i64.neq(c[0], b.i64.cast([0, 0])) && b.i64.neq(c[0], c[2]) ? b.fe(b.db.table(9).fetch([[[a[0]]]]), function (a) {
          var b = a.update;
          a.item;
          return b({lastActivityTimestampMs: c[0]})
        }) : b.resolve()
      }])
    }, function (a) {
      return b.resolve(d)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
