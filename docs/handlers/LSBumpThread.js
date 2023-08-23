__d("LSBumpThread", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.i64.eq(a[1], b.i64.cast([0, 1])) ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({lastReadWatermarkTimestampMs: a[0], lastActivityTimestampMs: a[0]})
      }) : b.i64.eq(a[1], b.i64.cast([0, 2])) ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({lastActivityTimestampMs: a[0]})
      }) : b.i64.eq(a[1], b.i64.cast([0, 3])) ? b.db.table(9).fetch([[[a[2]]]]).next().then(function (c, d) {
        var e = c.done;
        c = c.value;
        return e ? 0 : (d = c.item, b.i64.le(d.lastActivityTimestampMs, d.lastReadWatermarkTimestampMs) ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function (b) {
          var c = b.update;
          b.item;
          return c({lastReadWatermarkTimestampMs: a[0], lastActivityTimestampMs: a[0]})
        }) : b.fe(b.db.table(9).fetch([[[a[2]]]]), function (b) {
          var c = b.update;
          b.item;
          return c({lastActivityTimestampMs: a[0]})
        }))
      }) : b.resolve(0)
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
