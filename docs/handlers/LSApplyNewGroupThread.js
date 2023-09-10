__d("LSApplyNewGroupThread", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      b = a[a.length - 1]
    b.n
    var c = [],
      d
    return b.seq([function (c) {
      return b.ftr(b.db.table(9).fetch(), function (c) {
        return b.i64.eq(c.threadKey, a[1]) || c.otidOfFirstMessage === a[0]
      }).next().then(function (c, e) {
        e = c.done
        c = c.value
        return e ? b.seq([function (c) {
          return b.fe(b.ftr(b.db.table(9).fetch([[[a[1]]]]), function (c) {
            return b.i64.eq(c.threadKey, a[1]) && b.i64.lt(c.authorityLevel, b.i64.cast([0, 80]))
          }), function (a) {
            return a["delete"]()
          })
        }, function (c) {
          return b.db.table(9).add({
            threadKey: a[1],
            mailboxType: b.i64.cast([0, 0]),
            threadType: a[2],
            folderName: a[3],
            parentThreadKey: a[4],
            threadPictureUrlFallback: a[5],
            lastActivityTimestampMs: a[6],
            lastReadWatermarkTimestampMs: a[6],
            ongoingCallState: b.i64.cast([0, 0]),
            nullstateDescriptionText1: a[8],
            nullstateDescriptionType1: a[9],
            nullstateDescriptionText2: a[10],
            nullstateDescriptionType2: a[11],
            cannotUnsendReason: a[12],
            capabilities: a[13],
            capabilities2: b.i64.cast([0, 0]),
            capabilities3: b.i64.cast([0, 0]),
            otidOfFirstMessage: a[0],
            authorityLevel: b.i64.cast([0, 80]),
            unsendLimitMs: b.i64.cast([-1, 4294967295]),
            inviterId: a[14],
            igFolder: a[15],
            threadSubtype: a[16]
          })
        }]) : (c.item, b.fe(b.ftr(b.db.table(9).fetch(), function (c) {
          return b.i64.eq(c.threadKey, a[1]) || c.otidOfFirstMessage === a[0]
        }), function (c) {
          var e = c.update
          c.item
          return e({
            threadKey: a[1],
            folderName: a[3],
            parentThreadKey: a[4],
            threadPictureUrlFallback: a[5],
            lastActivityTimestampMs: a[6],
            lastReadWatermarkTimestampMs: a[6],
            ongoingCallState: b.i64.cast([0, 0]),
            nullstateDescriptionText1: a[8],
            nullstateDescriptionType1: a[9],
            nullstateDescriptionText2: a[10],
            nullstateDescriptionType2: a[11],
            cannotUnsendReason: a[12],
            capabilities: a[13],
            capabilities2: b.i64.cast([0, 0]),
            capabilities3: b.i64.cast([0, 0]),
            authorityLevel: b.i64.cast([0, 80]),
            unsendLimitMs: b.i64.cast([-1, 4294967295]),
            cannotReplyReason: d,
            threadTags: d,
            secondaryParentThreadKey: d
          })
        }))
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a
  f["default"] = b
}), 66)
