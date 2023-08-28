__d("LSUpsertInboxThreadsRange", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.db.table(198).put({
        syncGroup: a[0],
        minLastActivityTimestampMs: a[1],
        hasMoreBefore: a[2],
        isLoadingBefore: a[3],
        minThreadKey: a[4]
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
