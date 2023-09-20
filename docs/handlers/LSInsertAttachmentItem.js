__d("LSInsertAttachmentItem", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      b = a[a.length - 1]
    b.n
    var c = []
    return b.seq([function (c) {
      return b.db.table(18).add({
        attachmentFbid: a[0],
        attachmentIndex: a[1],
        threadKey: a[2],
        messageId: a[4],
        defaultActionEnableExtensions: a[30],
        originalPageSenderId: a[7],
        titleText: a[8],
        subtitleText: a[9],
        playableUrl: a[12],
        playableUrlFallback: a[13],
        playableUrlExpirationTimestampMs: a[14],
        playableUrlMimeType: a[15],
        dashManifest: a[16],
        previewUrl: a[17],
        previewUrlFallback: a[18],
        previewUrlExpirationTimestampMs: a[19],
        previewUrlMimeType: a[20],
        previewWidth: a[21],
        previewHeight: a[22],
        imageUrl: a[23],
        defaultCtaId: a[24],
        defaultCtaTitle: a[25],
        defaultCtaType: a[26],
        defaultButtonType: a[28],
        defaultActionUrl: a[29],
        defaultWebviewHeightRatio: a[32],
        attachmentCta1Id: a[34],
        cta1Title: a[35],
        cta1IconType: a[36],
        cta1Type: a[37],
        attachmentCta2Id: a[39],
        cta2Title: a[40],
        cta2IconType: a[41],
        cta2Type: a[42],
        attachmentCta3Id: a[44],
        cta3Title: a[45],
        cta3IconType: a[46],
        cta3Type: a[47],
        faviconUrl: a[48],
        faviconUrlFallback: a[49],
        faviconUrlExpirationTimestampMs: a[50],
        previewUrlLarge: a[51]
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a
  f["default"] = b
}), 66)
