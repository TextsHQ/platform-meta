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
