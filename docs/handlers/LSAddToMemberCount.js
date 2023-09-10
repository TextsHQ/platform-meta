__d("LSAddToMemberCount", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d = [], e;
    return b.seq([function (d) {
      return b.db.table(9).fetch([[[a[0]]]]).next().then(function (d, f) {
        var g = d.done;
        d = d.value;
        return g ? 0 : (f = d.item, b.seq([function (d) {
          return c[2] = f.memberCount, b.i64.neq(c[2], e) ? b.resolve(c[0] = c[2]) : b.seq([function (d) {
            return b.ct(b.db.table(14).fetch([[[a[0]]]])).then(function (a) {
              return c[3] = a
            })
          }, function (a) {
            return c[0] = c[3]
          }])
        }, function (d) {
          return c[1] = b.i64.add(c[0], a[1]), b.fe(b.db.table(9).fetch([[[f.threadKey]]]), function (a) {
            var d = a.update;
            a.item;
            return d({memberCount: b.i64.gt(c[1], b.i64.cast([0, 0])) ? c[1] : b.i64.cast([0, 0])})
          })
        }]))
      })
    }, function (a) {
      return b.resolve(d)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
