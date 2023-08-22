__d("LSDeleteThenInsertIGContactInfo", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.db.table(176).put({
        contactId: a[0],
        igId: a[1],
        igFollowStatus: a[4],
        verificationStatus: a[5],
        linkedFbid: a[2],
        e2eeEligibility: a[6],
        supportsE2eeSpamdStorage: a[7]
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
