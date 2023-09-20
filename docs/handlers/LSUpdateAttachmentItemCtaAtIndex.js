__d("LSUpdateAttachmentItemCtaAtIndex", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments, b = a[a.length - 1];
    b.n;
    var c = [], d;
    return b.seq([function (c) {
      return b.i64.eq(a[5], b.i64.cast([0, 0])) ? b.fe(b.db.table(18).fetch([[[a[0], a[1]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({defaultCtaId: a[2], defaultCtaTitle: a[3], defaultCtaType: a[4]})
      }) : b.i64.eq(a[5], b.i64.cast([0, 1])) ? b.fe(b.db.table(18).fetch([[[a[0], a[1]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({attachmentCta1Id: a[2], cta1Title: a[3], cta1Type: a[4], cta1IconType: d})
      }) : b.i64.eq(a[5], b.i64.cast([0, 2])) ? b.fe(b.db.table(18).fetch([[[a[0], a[1]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({attachmentCta2Id: a[2], cta2Title: a[3], cta2Type: a[4], cta2IconType: d})
      }) : b.i64.eq(a[5], b.i64.cast([0, 3])) ? b.fe(b.db.table(18).fetch([[[a[0], a[1]]]]), function (b) {
        var c = b.update;
        b.item;
        return c({attachmentCta3Id: a[2], cta3Title: a[3], cta3Type: a[4], cta3IconType: d})
      }) : b.resolve(function (a) {
        b.logger(a).warn(a)
      }("Unexpected CTA index"))
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a;
  f["default"] = b
}), 66);
