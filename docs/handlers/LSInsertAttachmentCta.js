__d("LSInsertAttachmentCta", [], (function (a, b, c, d, e, f) {
  function a() {
    var a = arguments,
      b = a[a.length - 1]
    b.n
    var c = []
    return b.seq([function (c) {
      return b.db.table(19).add({
        ctaId: a[0],
        attachmentFbid: a[1],
        attachmentIndex: a[2],
        threadKey: a[3],
        messageId: a[5],
        title: a[6],
        type_: a[7],
        platformToken: a[8],
        actionUrl: a[9],
        nativeUrl: a[10],
        urlWebviewType: a[11],
        actionContentBlob: a[12],
        enableExtensions: a[13],
        extensionHeightType: a[14],
        targetId: a[15]
      })
    }, function (a) {
      return b.resolve(c)
    }])
  }

  b = a
  f["default"] = b
}), 66)
