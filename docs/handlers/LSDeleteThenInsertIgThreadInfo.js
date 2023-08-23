__d("LSDeleteThenInsertIgThreadInfo", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.db.table(194).put({threadKey: a[0], igThreadId: a[1]})
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
