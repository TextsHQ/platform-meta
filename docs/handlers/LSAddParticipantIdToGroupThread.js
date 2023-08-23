__d("LSAddParticipantIdToGroupThread", ["LSComputeParticipantCapabilities"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, c = a[a.length - 1];
    c.n;
    var d = [], e = [];
    return c.seq([function (e) {
      return c.seq([function (e) {
        return c.sp(b("LSComputeParticipantCapabilities"), a[1], a[0]).then(function (a) {
          return a = a, d[0] = a[0], a
        })
      }, function (b) {
        return c.ftr(c.db.table(14).fetch([[[a[0], a[1]]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && c.i64.eq(c.i64.cast([0, 0]), c.i64.cast([0, 0])) && c.i64.eq(b.contactId, a[1]) && c.i64.gt(b.authorityLevel, a[9])
        }).next().then(function (b) {
          var e = b.done;
          b.value;
          return e ? c.db.table(14).put({
            threadKey: a[0],
            contactId: a[1],
            readWatermarkTimestampMs: a[2],
            readActionTimestampMs: a[3],
            deliveredWatermarkTimestampMs: a[4],
            nickname: a[5],
            normalizedSearchTerms: a[10],
            isAdmin: a[6],
            isSuperAdmin: a[11],
            subscribeSource: a[7],
            authorityLevel: a[9],
            participantCapabilities: d[0],
            groupParticipantJoinState: c.i64.cast([0, 0]),
            isModerator: !1,
            threadRoles: a[12]
          }) : 0
        })
      }])
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a;
  f["default"] = c
}), 66);

