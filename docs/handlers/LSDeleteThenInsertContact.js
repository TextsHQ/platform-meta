__d("LSDeleteThenInsertContact", ["LSSetThreadImageURL"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, c = a[a.length - 1];
    c.n;
    var d = [], e = [], f;
    return c.seq([function (e) {
      return c.seq([function (b) {
        return c.i64.eq(a[23], c.i64.cast([0, 39423])) ? d[0] = c.i64.cast([0, 1]) : (c.i64.eq(a[23], c.i64.cast([0, 14342874])) ? d[1] = c.i64.cast([0, 2]) : d[1] = f, d[0] = d[1]), c.ftr(c.db.table(7).fetch([[[a[0]]]]), function (b) {
          return c.i64.eq(b.id, a[0]) && c.i64.eq(c.i64.cast([0, 1]), c.i64.cast([0, 1])) && c.i64.gt(b.authorityLevel, a[21])
        }).next().then(function (b) {
          var e = b.done;
          b.value;
          return e ? c.db.table(7).put({
            id: a[0],
            profilePictureUrl: a[2],
            profilePictureFallbackUrl: a[3],
            profilePictureUrlExpirationTimestampMs: a[4],
            profilePictureLargeUrl: a[5],
            profilePictureLargeFallbackUrl: a[6],
            profilePictureLargeUrlExpirationTimestampMs: a[7],
            name: a[9],
            secondaryName: a[41],
            normalizedNameForSearch: a[10],
            normalizedSearchTerms: a[33],
            isMessengerUser: a[11],
            isMemorialized: a[12],
            isManagedByViewer: a[35],
            blockedByViewerStatus: a[14],
            rank: a[17],
            firstName: a[18],
            contactType: a[19],
            contactTypeExact: a[20],
            authorityLevel: a[21],
            messengerCallLogThirdPartyId: a[22],
            profileRingColor: a[23],
            requiresMultiway: a[24],
            blockedSinceTimestampMs: a[25],
            fbUnblockedSinceTimestampMs: a[46],
            canViewerMessage: a[26],
            profileRingColorExpirationTimestampMs: a[27],
            phoneNumber: a[28],
            emailAddress: a[29],
            workCompanyId: a[30],
            workCompanyName: a[31],
            workJobTitle: a[32],
            deviceContactId: a[34],
            workForeignEntityType: a[36],
            capabilities: a[37],
            capabilities2: a[38],
            profileRingState: d[0],
            contactViewerRelationship: a[39],
            gender: a[40],
            contactReachabilityStatusType: a[43],
            restrictionType: a[44],
            waConnectStatus: a[45],
            isEmployee: !1
          }) : 0
        })
      }, function (d) {
        return c.sp(b("LSSetThreadImageURL"), a[0], a[2], a[3], a[4], !1, !0)
      }])
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a;
  f["default"] = c
}), 66);
