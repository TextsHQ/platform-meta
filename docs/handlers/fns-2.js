__d("LSClearLocalThreadPictureUrl", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d;
    return b.seq([function (c) {
      return function (a) {
        b.logger(a).info(a)
      }("clearLocalThreadPictureUrl"), b.fe(b.ftr(b.db.table(9).fetch([[[a[0]]]]), function (c) {
        return b.i64.eq(c.threadKey, a[0]) && !c.isCustomThreadPicture && (b.i64.eq(c.threadType, b.i64.cast([0, 2])) || b.i64.eq(c.threadType, b.i64.cast([0, 5]))) && c.threadPictureUrl !== d && b.like(c.threadPictureUrl, "file:%")
      }), function (a) {
        var b = a.update;
        a.item;
        return b({threadPictureUrl: d})
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
__d("LSDeleteRtcRoomOnThread", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.db.table(181).fetch([[[a[0]]]]), function (a) {
        return a["delete"]()
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
__d("LSRemoveParticipantFromThread", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.ftr(b.db.table(14).fetch([[[a[0], a[1]]]]), function (c) {
        return b.i64.eq(c.threadKey, a[0]) && b.i64.eq(b.i64.cast([0, 0]), b.i64.cast([0, 0])) && b.i64.eq(c.contactId, a[1])
      }), function (a) {
        return a["delete"]()
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
__d("LSUpdateInviterId", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.db.table(9).fetch([[[a[0]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({inviterId: a[1]})
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
__d("LSUpdateParticipantCapabilities", ["LSComputeParticipantCapabilities"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, c = a[a.length - 1];
    c.n;
    var d = [], e = [];
    return c.seq([function (f) {
      return c.seq([function (e) {
        return c.sp(b("LSComputeParticipantCapabilities"), a[0], a[1]).then(function (a) {
          return a = a, d[0] = a[0], a
        })
      }, function (b) {
        return c.fe(c.ftr(c.db.table(14).fetch([[[a[1], a[0]]]]), function (b) {
          return c.i64.eq(b.threadKey, a[1]) && c.i64.eq(c.i64.cast([0, 0]), c.i64.cast([0, 0])) && c.i64.eq(b.contactId, a[0])
        }), function (a) {
          var b = a.update;
          a.item;
          return b({participantCapabilities: d[0]})
        })
      }, function (a) {
        return e[0] = d[0]
      }])
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a;
  f["default"] = c
}), 66);

__d("LSUpdateThreadApprovalMode", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.db.table(9).fetch([[[a[0]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({needsAdminApprovalForNewParticipant: a[1]})
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
__d("LSUpdateThreadInviteLinksInfo", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.db.table(9).fetch([[[a[0]]]]), function (b) {
        var c = b.update;
        b = b.item;
        return c({
          threadInvitesEnabled: a[1] == null ? b.threadInvitesEnabledV2 : a[1],
          threadInvitesEnabledV2: a[1] == null ? b.threadInvitesEnabledV2 : a[1],
          threadInviteLink: a[2] == null ? b.threadInviteLink : a[2]
        })
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
__d("LSUpdateThreadParticipantAdminStatus", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [];
    return b.seq([function (c) {
      return b.fe(b.ftr(b.db.table(14).fetch([[[a[0], a[1]]]]), function (c) {
        return b.i64.eq(c.threadKey, a[0]) && b.i64.eq(b.i64.cast([0, 0]), b.i64.cast([0, 0])) && b.i64.eq(c.contactId, a[1])
      }), function (b) {
        var c = b.update;
        b.item;
        return c({isAdmin: a[2]})
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
__d("LSDeserializeFromJsonIntoDictionaryV2.nop", ["I64", "LSDict", "LSVec", "Promise", "unrecoverableViolation"], (function (a, b, c, d, e, f, g) {
  "use strict";

  function h(a) {
    function b(a, b) {
      return function () {
        return function (c) {
          c = a()(c);
          if (c != null) {
            var d = c[0];
            c = c[1];
            return [b(d), c]
          }
        }
      }
    }

    function e(a) {
      return JSON.parse('"' + a + '"')
    }

    function f(a) {
      return function () {
        return function (b) {
          var c = e(a);
          if (b.startsWith(c)) return [c, b.substr(c.length)]; else return void 0
        }
      }
    }

    function g() {
      for (var a = arguments.length, b = new Array(a), c = 0; c < a; c++) b[c] = arguments[c];
      return function () {
        return function (a) {
          var c = [];
          a = a;
          for (var d = 0; d < b.length; d++) {
            var e = b[d];
            e = e()(a);
            if (e == null) return void 0;
            a = e[1];
            c.push(e[0])
          }
          return [c, a]
        }
      }
    }

    function h(a) {
      return function () {
        return function (b) {
          var c = a.exec(b);
          return c != null ? [c, b.substr(c[0].length)] : void 0
        }
      }
    }

    function i() {
      for (var a = arguments.length, b = new Array(a), c = 0; c < a; c++) b[c] = arguments[c];
      return function () {
        return function (a) {
          for (var c = 0; c < b.length; c++) {
            var d = b[c];
            d = d()(a);
            if (d != null) return d
          }
        }
      }
    }

    function j(a) {
      return function () {
        return function (b) {
          var c = a()(b);
          return c != null ? c : [void 0, b]
        }
      }
    }

    function k(a) {
      return function () {
        return function (b) {
          var c = a()(b), d = [];
          b = b;
          while (c != null) b = c[1], d.push(c[0]), c = a()(b);
          return [d, b]
        }
      }
    }

    var l = h(/^[\n\r\s]*/), m = b(h(/^\"((?:[^\"\\]|\\.)*)\"/), function (a) {
      a = a[1];
      return e(a)
    }), n = b(h(/^-?\d+(?:(?:\.\d+)?[eE][-\+]?\d+|\.\d+)/), function (a) {
      a = a[0];
      return Number(a)
    });
    h = b(h(/^-?\d+/), function (a) {
      a = a[0];
      return d("I64").of_string(a)
    });
    var o = b(f("null"), function (a) {
      return null
    }), p = b(f("true"), function (a) {
      return !0
    }), q = b(f("false"), function (a) {
      return !1
    }), r = b(g(l, m, l, f(":"), function () {
      return s()
    }), function (a) {
      var b = a[1];
      a = a[4];
      return [b, a]
    });
    r = b(g(r, k(g(l, f(","), r))), function (a) {
      var b = a[0];
      a = a[1];
      return [b].concat(a.map(function (a) {
        a = a[2];
        return a
      }))
    });
    r = b(g(f("{"), j(r), l, f("}")), function (a) {
      a = a[1];
      return new (c("LSDict"))((a = a) != null ? a : [])
    });
    k = b(g(function () {
      return s()
    }, k(g(l, f(","), function () {
      return s()
    }))), function (a) {
      var b = a[0];
      a = a[1];
      return [b].concat(a.map(function (a) {
        a = a[2];
        return a
      }))
    });
    j = b(g(f("["), l, j(k), l, f("]")), function (a) {
      a = a[2];
      return c("LSVec").ofArray((a = a) != null ? a : [])
    });
    var s = b(g(l, i(r, m, n, h, j, o, p, q), l), function (a) {
      a = a[1];
      return a
    });
    k = s()(a);
    if (k == null) throw c("unrecoverableViolation")("error parsing string", "messenger_web_product");
    if (k[1] !== "") throw c("unrecoverableViolation")("unexpected " + k[1], "messenger_web_product");
    return k[0]
  }

  a = function (a, d, e) {
    a = h(e);
    if (a instanceof c("LSDict")) return b("Promise").resolve([a]);
    throw c("unrecoverableViolation")("unexpected Dictionary type", "messenger_web_product")
  };
  g["default"] = a
}), 98);
__d("LSUpdateThreadTheme", ["LSDeserializeFromJsonIntoDictionaryV2.nop"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d = [], e;
    return b.seq([function (c) {
      return b.fe(b.db.table(9).fetch([[[a[0]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({themeFbid: a[1], outgoingBubbleColor: a[2]})
      })
    }, function (a) {
      return b.resolve(d)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
