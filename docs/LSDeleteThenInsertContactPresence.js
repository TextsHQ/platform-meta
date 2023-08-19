__d("LSDeleteThenInsertContactPresence", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.db.table(186).put({
        contactId: a[0],
        status: a[1],
        expirationTimestampMs: a[3],
        lastActiveTimestampMs: a[2],
        capabilities: a[4],
        publishId: a[5]
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
