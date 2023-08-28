__d("LSUpdateThreadNullState", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.db.table(9).fetch([[[a[0]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({
          threadPictureUrl: a[1],
          threadPictureUrlFallback: a[2],
          threadPictureUrlExpirationTimestampMs: a[3],
          nullstateDescriptionText1: a[4],
          nullstateDescriptionType1: a[9],
          nullstateDescriptionText2: a[5],
          nullstateDescriptionType2: a[10],
          nullstateDescriptionText3: a[6],
          nullstateDescriptionType3: a[11],
          capabilities: a[14]
        })
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
