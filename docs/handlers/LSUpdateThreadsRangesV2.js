__d("LSUpdateThreadsRangesV2", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d = [];
    return b.seq([function (d) {
      return b.seq([function (c) {
        return b.fe(b.db.table(10).fetch([[[a[1]]]]), function (a) {
          return a["delete"]()
        })
      }, function (d) {
        return c[8] = b.i64.gt(a[2], b.i64.cast([0, 1])) && b.i64.gt(a[3], b.i64.cast([-2147483648, 0])), a[0] === "inbox" && b.i64.eq(a[1], b.i64.cast([0, 0])) && b.i64.eq(a[4], b.i64.cast([0, 1])) ? b.seq([function (d) {
          return c[9] = a[2], c[10] = a[3], c[11] = !1, c[12] = c[8], b.fe(b.db.table(198).fetch(), function (a) {
            a = a.item;
            return c[13] = a.minLastActivityTimestampMs, c[15] = a.minThreadKey, c[14] = b.i64.lt(c[9] == null ? c[13] : c[9], c[13]), c[9] = c[14] ? c[13] : c[9], c[10] = c[14] ? c[15] : c[10], c[11] = c[11] || a.isLoadingBefore, c[12] = c[12] || b.i64.gt(c[13], b.i64.cast([0, 1])) && b.i64.gt(c[15], b.i64.cast([-2147483648, 0]))
          })
        }, function (a) {
          return a = [c[9], c[10], c[11], c[12]], c[0] = a[0], c[1] = a[1], c[2] = a[2], c[3] = a[3], a
        }]) : b.resolve((d = [a[2], a[3], !1, c[8]], c[0] = d[0], c[1] = d[1], c[2] = d[2], c[3] = d[3], d))
      }, function (d) {
        return b.i64.eq(a[4], b.i64.cast([0, 1])) ? b.seq([function (d) {
          return c[9] = c[0], c[10] = c[1], c[11] = c[2], c[12] = c[3], b.fe(b.ftr(b.db.table(220).fetch(), function (c) {
            return b.i64.eq(c.parentThreadKey, a[1])
          }), function (a) {
            a = a.item;
            return c[13] = a.minLastActivityTimestampMs, c[15] = a.minThreadKey, c[14] = b.i64.lt(c[9] == null ? c[13] : c[9], c[13]), c[9] = c[14] ? c[13] : c[9], c[10] = c[14] ? c[15] : c[10], c[11] = c[11] || a.isLoadingBefore, c[12] = c[12] || b.i64.gt(c[13], b.i64.cast([0, 1])) && b.i64.gt(c[15], b.i64.cast([-2147483648, 0]))
          })
        }, function (a) {
          return a = [c[9], c[10], c[11], c[12]], c[4] = a[0], c[5] = a[1], c[6] = a[2], c[7] = a[3], a
        }]) : b.resolve((d = [c[0], c[1], c[2], c[3]], c[4] = d[0], c[5] = d[1], c[6] = d[2], c[7] = d[3], d))
      }, function (d) {
        return b.db.table(10).add({
          parentThreadKey: a[1],
          minThreadKey: c[5] == null ? b.i64.cast([-2147483648, 0]) : c[5],
          minLastActivityTimestampMs: c[4] == null ? b.i64.cast([0, 1]) : c[4],
          maxLastActivityTimestampMs: b.i64.cast([0, 1]),
          maxThreadKey: b.i64.cast([-2147483648, 0]),
          isLoadingBefore: c[6],
          isLoadingAfter: !1,
          hasMoreBefore: c[7],
          hasMoreAfter: !1
        })
      }])
    }, function (a) {
      return b.resolve(d)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
