__d("LSUpdateForRollCallMessageDeleted", ["LSDeleteRollCall", "LSDeleteRollCallContribution", "LSGetViewerFBID", "LSUpdateRecentXMAForRollCallMessageDeleted", "LSUpdateRollCall"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, c = a[a.length - 1];
    c.n;
    var d = [], e = [], f;
    return c.seq([function (e) {
      return c.seq([function (b) {
        return c.ftr(c.db.table(255).fetch(), function (b) {
          return b.messageId === a[0]
        }).next().then(function (a, b) {
          var c = a.done;
          a = a.value;
          return c ? (c = [f, f, f], d[0] = c[0], d[1] = c[1], d[2] = c[2], c) : (b = a.item, c = [b.rollCallId, b.messageTimestampMs, b.rollCallContributionId], d[0] = c[0], d[1] = c[1], d[2] = c[2], c)
        })
      }, function (a) {
        return c.ct(c.ftr(c.db.table(255).fetch(), function (a) {
          return c.i64.eq(d[0], a.rollCallId)
        })).then(function (a) {
          return d[4] = a
        })
      }, function (a) {
        return c.sp(b("LSGetViewerFBID")).then(function (a) {
          return a = a, d[5] = a[0], a
        })
      }, function (b) {
        return c.ftr(c.db.table(255).fetch(), function (b) {
          return c.i64.eq(d[0], b.rollCallId) && a[0] !== b.messageId && c.i64.eq(d[5], b.contributorId)
        }).next().then(function (a, b) {
          b = a.done;
          a = a.value;
          return b ? d[6] = !1 : (a.item, d[6] = !0)
        })
      }, function (a) {
        return c.ftr(c.db.table(250).fetch(), function (a) {
          return c.i64.eq(d[0], a.rollCallId)
        }).next().then(function (a, b) {
          var c = a.done;
          a = a.value;
          return c ? d[8] = !1 : (b = a.item, d[8] = b.canViewWithoutContributing)
        })
      }, function (e) {
        return c.i64.neq(d[0], f) ? c.i64.le(d[4], c.i64.cast([0, 1])) ? c.sp(b("LSDeleteRollCall"), d[0], a[1]) : c.seq([function (e) {
          return c.sp(b("LSUpdateRecentXMAForRollCallMessageDeleted"), d[0], a[0])
        }, function (a) {
          return d[8] ? d[10] = !1 : d[10] = !d[6], c.sp(b("LSUpdateRollCall"), d[0], d[6], d[10])
        }, function (e) {
          return c.i64.neq(d[1], f) ? c.i64.neq(d[2], f) ? c.sp(b("LSDeleteRollCallContribution"), d[2], d[0], a[0], d[1], a[1]) : c.resolve() : c.resolve()
        }]) : c.resolve()
      }])
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a;
  f["default"] = c
}), 66);
