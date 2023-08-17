__d("LSClearMessagePlaceholderRange", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      b = a[a.length - 1]
    b.n
    var c = []
    return b.seq([function (c) {
      return b.fe(b.ftr(b.db.table(13).fetch([[[a[0], b.i64.cast([0, 0])]]]), function (c) {
        return b.i64.eq(c.threadKey, a[0]) && c.minMessageId === a[1] && b.i64.eq(b.i64.cast([0, 0]), c.minTimestampMs) && b.i64.eq(a[2], c.maxTimestampMs)
      }), function (a) {
        return a["delete"]()
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a
  f["default"] = b
}), 66)
__d("LSCreateOfflineThreadingID", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      b = a[a.length - 1]
    b.n
    var c = [],
      d = []
    return c[0] = b.i64.random(), d[0] = b.i64.and_(b.i64.or_(b.i64.lsl_(a[0], b.i64.to_int32(b.i64.cast([0, 22]))), b.i64.and_(c[0], b.i64.cast([0, 4194303]))), b.i64.cast([2147483647, 4294967295])), b.resolve(d)
  }

  b = a
  f["default"] = b
}), 66)
__d("LSInsertNewMessageRange", ["LSClearMessagePlaceholderRange"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      c = a[a.length - 1]
    c.n
    var d = [],
      e = []
    return c.seq([function (e) {
      return c.seq([function (d) {
        return c.sp(b("LSClearMessagePlaceholderRange"), a[0], a[9], c.i64.cast([0, 0]))
      }, function (b) {
        return c.ftr(c.db.table(13).fetch([[[a[0], {lte: a[5]}]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && c.i64.le(b.minTimestampMs, a[5]) && c.i64.ge(b.maxTimestampMs, a[5])
        }).next().then(function (b, c) {
          var e = b.done
          b = b.value
          return e ? (e = [a[1], a[3], a[7]], d[0] = e[0], d[1] = e[1], d[2] = e[2], e) : (c = b.item, e = [c.minTimestampMs, c.minMessageId, c.hasMoreBefore], d[0] = e[0], d[1] = e[1], d[2] = e[2], e)
        })
      }, function (b) {
        return c.ftr(c.db.table(13).fetch([[[a[0], {lte: a[6]}]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && c.i64.le(b.minTimestampMs, a[6]) && c.i64.ge(b.maxTimestampMs, a[6])
        }).next().then(function (b, c) {
          var e = b.done
          b = b.value
          return e ? (e = [a[2], a[4], a[8]], d[4] = e[0], d[5] = e[1], d[6] = e[2], e) : (c = b.item, e = [c.maxTimestampMs, c.maxMessageId, c.hasMoreAfter], d[4] = e[0], d[5] = e[1], d[6] = e[2], e)
        })
      }, function (b) {
        return c.fe(c.ftr(c.db.table(13).fetch([[[a[0], {lte: a[6]}]]]), function (b) {
          return c.i64.eq(b.threadKey, a[0]) && c.i64.ge(a[6], b.minTimestampMs) && c.i64.le(a[5], b.maxTimestampMs)
        }), function (a) {
          return a["delete"]()
        })
      }, function (b) {
        return c.db.table(13).put({
          threadKey: a[0],
          minTimestampMs: d[0],
          minMessageId: d[1],
          maxTimestampMs: d[4],
          maxMessageId: d[5],
          isLoadingBefore: !1,
          isLoadingAfter: !1,
          hasMoreBefore: d[2],
          hasMoreAfter: d[6]
        })
      }])
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a
  f["default"] = c
}), 66)
__d("MAWBridgeMsgsLoadedHandler", ["I64", "LSClearMessagePlaceholderRange", "LSFactory", "LSInsertNewMessageRange", "MAWMiActOnMiThreadReadyForChatId", "MAWTimeUtils", "gkx"], (function (a, b, c, d, e, f, g) {
  "use strict"

  function a(a, b) {
    return d("MAWMiActOnMiThreadReadyForChatId").onMiThreadReadyForChatId(a, b.threadId, "MAWBridgeMsgsLoadedHandler", function (a, e) {
      return c("LSClearMessagePlaceholderRange")(e, "", d("MAWTimeUtils").MAX_TIMESTAMP_MS, c("LSFactory")(a)).then(function () {
        if (c("gkx")("6884")) {
          var f,
            g,
            h,
            i,
            j,
            k,
            l,
            m
          f = (f = (f = b.rangeExtensionType) == null ? void 0 : f.hasMoreBefore) != null ? f : !1
          g = (g = (g = b.rangeExtensionType) == null ? void 0 : g.hasMoreAfter) != null ? g : !1
          h = f && ((h = b.rangeExtensionType) == null ? void 0 : h.minMsgTs) != null ? d("I64").of_float(b.rangeExtensionType.minMsgTs) : d("MAWTimeUtils").MIN_TIMESTAMP_MS
          i = g && ((i = b.rangeExtensionType) == null ? void 0 : i.maxMsgTs) != null ? d("I64").of_float(b.rangeExtensionType.maxMsgTs) : d("MAWTimeUtils").MAX_TIMESTAMP_MS
          j = (j = (j = b.rangeExtensionType) == null ? void 0 : j.minMsgId) != null ? j : ""
          k = (k = (k = b.rangeExtensionType) == null ? void 0 : k.maxMsgId) != null ? k : ""
          l = ((l = b.rangeExtensionType) == null ? void 0 : l.rangeKind) === "before" ? h : d("MAWTimeUtils").MIN_TIMESTAMP_MS
          m = ((m = b.rangeExtensionType) == null ? void 0 : m.rangeKind) === "after" ? i : d("MAWTimeUtils").MAX_TIMESTAMP_MS
          return c("LSInsertNewMessageRange")(e, h, i, j, k, l, m, f, g, void 0, c("LSFactory")(a))
        } else {
          i = ((h = b.rangeExtensionType) == null ? void 0 : h.minMsgTs) != null ? d("I64").of_float(b.rangeExtensionType.minMsgTs) : d("MAWTimeUtils").MIN_TIMESTAMP_MS
          k = ((j = b.rangeExtensionType) == null ? void 0 : j.maxMsgTs) != null ? d("I64").of_float(b.rangeExtensionType.maxMsgTs) : d("MAWTimeUtils").MAX_TIMESTAMP_MS
          f = (m = (l = b.rangeExtensionType) == null ? void 0 : l.minMsgId) != null ? m : ""
          j = (h = (g = b.rangeExtensionType) == null ? void 0 : g.maxMsgId) != null ? h : ""
          m = ((l = b.rangeExtensionType) == null ? void 0 : l.rangeKind) === "extensionBefore" ? i : d("MAWTimeUtils").MIN_TIMESTAMP_MS
          h = ((g = b.rangeExtensionType) == null ? void 0 : g.rangeKind) === "extensionAfter" ? k : d("MAWTimeUtils").MAX_TIMESTAMP_MS
          l = (g = (l = b.rangeExtensionType) == null ? void 0 : l.hasMoreBefore) != null ? g : !1
          g = (g = (g = b.rangeExtensionType) == null ? void 0 : g.hasMoreAfter) != null ? g : !1
          return c("LSInsertNewMessageRange")(e, i, k, f, j, m, h, l, g, void 0, c("LSFactory")(a))
        }
      })
    })
  }

  g.call = a
}), 98)
__d("MAWBridgeMsgRangeLoadedHandler", ["I64", "LSFactory", "LSInsertNewMessageRange", "MAWMiActOnMiThreadReadyForChatId", "MAWTimeUtils", "Promise", "WALogger", "asyncToGeneratorRuntime"], (function (a, b, c, d, e, f, g) {
  "use strict"

  function h() {
    var a = babelHelpers.taggedTemplateLiteralLoose(["No messages found for thread ", " with message id ", ""])
    h = function () {
      return a
    }
    return a
  }

  function a(a, e) {
    if (e.rangeExtensionType == null) {
      d("WALogger").ERROR(h(), e.threadId, e.offsetMsgId)
      return b("Promise").resolve()
    }
    return d("MAWMiActOnMiThreadReadyForChatId").onMiThreadReadyForChatId(a, e.threadId, "MAWBridgeMsgRangeLoadedHandler", function () {
      var a = b("asyncToGeneratorRuntime").asyncToGenerator(function* (a, b) {
        var f,
          g,
          h,
          i,
          j,
          k
        f = ((f = e.rangeExtensionType) == null ? void 0 : f.minMsgTs) != null ? d("I64").of_float(e.rangeExtensionType.minMsgTs) : d("MAWTimeUtils").MIN_TIMESTAMP_MS
        g = ((g = e.rangeExtensionType) == null ? void 0 : g.maxMsgTs) != null ? d("I64").of_float(e.rangeExtensionType.maxMsgTs) : d("MAWTimeUtils").MAX_TIMESTAMP_MS
        h = (h = (h = e.rangeExtensionType) == null ? void 0 : h.minMsgId) != null ? h : ""
        i = (i = (i = e.rangeExtensionType) == null ? void 0 : i.maxMsgId) != null ? i : ""
        j = (j = (j = e.rangeExtensionType) == null ? void 0 : j.hasMoreBefore) != null ? j : !1
        k = (k = (k = e.rangeExtensionType) == null ? void 0 : k.hasMoreAfter) != null ? k : !1
        var l = e.offsetMsgId
        yield c("LSInsertNewMessageRange")(b, f, g, h, i, f, g, j, k, l, c("LSFactory")(a))
      })
      return function (b, c) {
        return a.apply(this, arguments)
      }
    }())
  }

  g.call = a
}), 98)
