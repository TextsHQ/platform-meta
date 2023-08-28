__d("LSUpsertSyncGroupThreadsRange", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.db.table(220).put({
        syncGroup: a[0],
        parentThreadKey: a[1],
        minLastActivityTimestampMs: a[2],
        hasMoreBefore: a[3],
        isLoadingBefore: a[4],
        minThreadKey: a[5]
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
