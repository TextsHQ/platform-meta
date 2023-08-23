__d("LSUpsertFolderSeenTimestamp", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.i64.gt(a[1], b.i64.cast([0, 0])) ? b.db.table(35).fetch([[[a[0]]]]).next().then(function (c, d) {
        var e = c.done;
        c = c.value;
        return e ? b.db.table(35).add({
          parentThreadKey: a[0], lastSeenRequestTimestampMs: a[1]
        }) : (d = c.item, b.i64.lt(d.lastSeenRequestTimestampMs, a[1]) ? b.fe(b.db.table(35).fetch([[[a[0]]]]), function (b) {
          var c = b.update;
          b.item;
          return c({lastSeenRequestTimestampMs: a[1]})
        }) : b.resolve())
      }) : b.resolve()
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
