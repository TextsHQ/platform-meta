__d("LSUpdateThreadSnippet", ["LSGetThreadParticipantDisplayName"], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, c = a[a.length - 1];
    c.n;
    var d = [], e = [], f;
    return c.seq([function (e) {
      return c.seq([function (a) {
        return c.resolve((d[1] = "", d[0] = d[1] === "" ? f : d[1]))
      }, function (e) {
        return d[0] !== f ? c.fe(c.db.table(9).fetch([[[a[0]]]]), function (b) {
          var c = b.update;
          b.item;
          return c({
            snippet: d[0],
            snippetStringHash: f,
            snippetStringArgument1: f,
            snippetAttribution: f,
            snippetAttributionStringHash: f,
            isAdminSnippet: a[2],
            snippetSenderContactId: a[3],
            snippetHasEmoji: a[4],
            viewedPluginKey: a[5],
            viewedPluginContext: a[6]
          })
        }) : a[7] ? c.seq([function (e) {
          return c.i64.neq(a[3], f) ? c.seq([function (e) {
            return c.sp(b("LSGetThreadParticipantDisplayName"), a[0], a[3]).then(function (a) {
              return a = a, d[2] = a[0], a
            })
          }, function (b) {
            return a[1] !== f ? d[3] = [d[2], ": ", a[1]].join("") : d[3] = f, d[1] = d[3]
          }]) : c.resolve(d[1] = a[1])
        }, function (b) {
          return c.fe(c.db.table(9).fetch([[[a[0]]]]), function (b) {
            var c = b.update;
            b.item;
            return c({
              snippet: d[1],
              snippetStringHash: f,
              snippetStringArgument1: f,
              snippetAttribution: f,
              snippetAttributionStringHash: f,
              isAdminSnippet: a[2],
              snippetSenderContactId: a[3],
              snippetHasEmoji: a[4],
              viewedPluginKey: a[5],
              viewedPluginContext: a[6]
            })
          })
        }]) : c.fe(c.db.table(9).fetch([[[a[0]]]]), function (b) {
          var c = b.update;
          b.item;
          return c({
            snippet: a[1],
            snippetStringHash: f,
            snippetStringArgument1: f,
            snippetAttribution: f,
            snippetAttributionStringHash: f,
            isAdminSnippet: a[2],
            snippetSenderContactId: a[3],
            snippetHasEmoji: a[4],
            viewedPluginKey: a[5],
            viewedPluginContext: a[6]
          })
        })
      }])
    }, function (a) {
      return c.resolve(e)
    }])
  }

  c = a;
  f["default"] = c
}), 66);
