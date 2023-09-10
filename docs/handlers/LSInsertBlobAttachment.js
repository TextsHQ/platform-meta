__d("LSInsertBlobAttachment", [], (function(a, b, c, d, e, f) {
    function a() {
      var a = arguments
        , b = a[a.length - 1];
      b.n;
      var c = [], d;
      return b.seq([function(c) {
        return b.seq([function(c) {
          return b.fe(b.ftr(b.db.table(16).fetch([[[a[27], a[32], a[34]]]]), function(c) {
            return b.i64.eq(c.threadKey, a[27]) && b.i64.eq(b.i64.cast([0, 0]), a[28]) && c.messageId === a[32] && c.attachmentFbid === a[34] && b.i64.lt(c.authorityLevel, a[48]) && (b.i64.eq(c.attachmentType, b.i64.cast([0, 2])) || b.i64.eq(c.attachmentType, b.i64.cast([0, 3])) || b.i64.eq(c.attachmentType, b.i64.cast([0, 4])) || b.i64.eq(c.attachmentType, b.i64.cast([0, 5])) || b.i64.eq(c.attachmentType, b.i64.cast([0, 6])) || b.i64.eq(c.attachmentType, b.i64.cast([0, 10])) || b.i64.eq(c.attachmentType, b.i64.cast([0, 14]))) && b.i64.eq(c.ephemeralMediaState, d) && c.isSharable === !1
          }), function(a) {
            return a["delete"]()
          })
        }
          , function(c) {
            return b.db.table(16).add({
              threadKey: a[27],
              messageId: a[32],
              attachmentFbid: a[34],
              filename: a[0],
              filesize: a[1],
              hasMedia: a[2],
              isSharable: !1,
              playableUrl: a[3],
              playableUrlFallback: a[4],
              playableUrlExpirationTimestampMs: a[5],
              playableUrlMimeType: a[6],
              dashManifest: a[7],
              previewUrl: a[8],
              previewUrlFallback: a[9],
              previewUrlExpirationTimestampMs: a[10],
              previewUrlMimeType: a[11],
              miniPreview: a[13],
              previewWidth: a[14],
              previewHeight: a[15],
              attributionAppId: a[16],
              attributionAppName: a[17],
              attributionAppIcon: a[18],
              attributionAppIconFallback: a[19],
              attributionAppIconUrlExpirationTimestampMs: a[20],
              localPlayableUrl: a[21],
              playableDurationMs: a[22],
              attachmentIndex: a[23],
              accessibilitySummaryText: a[24],
              isPreviewImage: a[25],
              originalFileHash: a[26],
              attachmentType: a[29],
              timestampMs: a[31],
              offlineAttachmentId: a[33],
              hasXma: a[35],
              xmaLayoutType: a[36],
              xmasTemplateType: a[37],
              titleText: a[38],
              subtitleText: a[39],
              descriptionText: a[40],
              sourceText: a[41],
              faviconUrlExpirationTimestampMs: a[42],
              isBorderless: a[44],
              previewUrlLarge: a[45],
              samplingFrequencyHz: a[46],
              waveformData: a[47],
              authorityLevel: a[48]
            })
          }
        ])
      }
        , function(a) {
          return b.resolve(c)
        }
      ])
    }
    b = a;
    f["default"] = b
  }
), 66);
