/*FB_PKG_DELIM*/

__d(
  "LSBumpThread",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [];
      return b.seq([
        function (c) {
          return b.i64.eq(a[1], b.i64.cast([0, 1]))
            ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function (b) {
                var c = b.update;
                b.item;
                return c({
                  lastReadWatermarkTimestampMs: a[0],
                  lastActivityTimestampMs: a[0],
                });
              })
            : b.i64.eq(a[1], b.i64.cast([0, 2]))
            ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function (b) {
                var c = b.update;
                b.item;
                return c({
                  lastActivityTimestampMs: a[0],
                });
              })
            : b.i64.eq(a[1], b.i64.cast([0, 3]))
            ? b.db
                .table(9)
                .fetch([[[a[2]]]])
                .next()
                .then(function (c, d) {
                  var e = c.done;
                  c = c.value;
                  return e
                    ? 0
                    : ((d = c.item),
                      b.i64.le(
                        d.lastActivityTimestampMs,
                        d.lastReadWatermarkTimestampMs
                      )
                        ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function (b) {
                            var c = b.update;
                            b.item;
                            return c({
                              lastReadWatermarkTimestampMs: a[0],
                              lastActivityTimestampMs: a[0],
                            });
                          })
                        : b.fe(b.db.table(9).fetch([[[a[2]]]]), function (b) {
                            var c = b.update;
                            b.item;
                            return c({
                              lastActivityTimestampMs: a[0],
                            });
                          }));
                })
            : b.resolve(0);
        },
        function (a) {
          return b.resolve(c);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "LSCheckAuthoritativeMessageExists",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [],
        d = [];
      return b.seq([
        function (e) {
          return b.seq([
            function (d) {
              return b
                .ftr(b.db.table(12).fetch([[[a[0]]]]), function (c) {
                  return (
                    b.i64.eq(c.threadKey, a[0]) &&
                    c.offlineThreadingId === a[1] &&
                    b.i64.eq(c.authorityLevel, b.i64.cast([0, 80]))
                  );
                })
                .next()
                .then(function (a, b) {
                  b = a.done;
                  a = a.value;
                  return b ? (c[0] = !1) : (a.item, (c[0] = !0));
                });
            },
            function (a) {
              return (d[0] = c[0]);
            },
          ]);
        },
        function (a) {
          return b.resolve(d);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "LSInsertMessage",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [],
        d = [],
        e;
      return b.seq([
        function (d) {
          return b.i64.eq(a[2], b.i64.cast([0, 20]))
            ? b.db.table(12).add({
                threadKey: a[3],
                timestampMs: a[5],
                messageId: a[8],
                offlineThreadingId: a[9],
                authorityLevel: a[2],
                primarySortKey: a[6],
                senderId: a[10],
                isAdminMessage: a[12],
                sendStatus: a[15],
                sendStatusV2: a[16],
                text: a[0],
                subscriptErrorMessage: a[1],
                secondarySortKey: a[7],
                stickerId: a[11],
                messageRenderingType: a[13],
                isUnsent: a[17],
                unsentTimestampMs: a[18],
                mentionOffsets: a[19],
                mentionLengths: a[20],
                mentionIds: a[21],
                mentionTypes: a[22],
                replySourceId: a[23],
                replySourceType: a[24],
                replySourceTypeV2: a[25],
                replyStatus: a[26],
                replySnippet: a[27],
                replyMessageText: a[28],
                replyToUserId: a[29],
                replyMediaExpirationTimestampMs: a[30],
                replyMediaUrl: a[31],
                replyMediaPreviewWidth: a[33],
                replyMediaPreviewHeight: a[34],
                replyMediaUrlMimeType: a[35],
                replyMediaUrlFallback: a[36],
                replyCtaId: a[37],
                replyCtaTitle: a[38],
                replyAttachmentType: a[39],
                replyAttachmentId: a[40],
                replyAttachmentExtra: a[41],
                isForwarded: a[42],
                forwardScore: a[43],
                hasQuickReplies: a[44],
                adminMsgCtaId: a[45],
                adminMsgCtaTitle: a[46],
                adminMsgCtaType: a[47],
                cannotUnsendReason: a[48],
                textHasLinks: a[49],
                viewFlags: a[50],
                displayedContentTypes: a[51],
                viewedPluginKey: a[52],
                viewedPluginContext: a[53],
                quickReplyType: a[54],
                hotEmojiSize: a[55],
                replySourceTimestampMs: a[56],
                ephemeralDurationInSec: a[57],
                msUntilExpirationTs: a[58],
                ephemeralExpirationTs: a[59],
                takedownState: a[60],
                isCollapsed: a[61],
                subthreadKey: a[62],
              })
            : b.seq([
                function (d) {
                  return b.db
                    .table(12)
                    .fetch([[[a[9]]], "optimistic"])
                    .next()
                    .then(function (b, d) {
                      var f = b.done;
                      b = b.value;
                      return f
                        ? ((f = [a[6], a[7], e]),
                          (c[0] = f[0]),
                          (c[1] = f[1]),
                          (c[2] = f[2]),
                          f)
                        : ((d = b.item),
                          (f = [
                            d.primarySortKey,
                            d.secondarySortKey,
                            d.localDataId,
                          ]),
                          (c[0] = f[0]),
                          (c[1] = f[1]),
                          (c[2] = f[2]),
                          f);
                    });
                },
                function (c) {
                  return b.fe(
                    b.ftr(
                      b.db.table(12).fetch([[[a[9]]], "optimistic"]),
                      function (c) {
                        return (
                          c.offlineThreadingId === a[9] &&
                          b.i64.lt(c.authorityLevel, a[2])
                        );
                      }
                    ),
                    function (a) {
                      return a["delete"]();
                    }
                  );
                },
                function (d) {
                  return b.db.table(12).add({
                    threadKey: a[3],
                    timestampMs: a[5],
                    messageId: a[8],
                    offlineThreadingId: a[9],
                    authorityLevel: a[2],
                    primarySortKey: c[0],
                    senderId: a[10],
                    isAdminMessage: a[12],
                    sendStatus: a[15],
                    sendStatusV2: a[16],
                    text: a[0],
                    subscriptErrorMessage: a[1],
                    secondarySortKey: c[1],
                    stickerId: a[11],
                    messageRenderingType: a[13],
                    isUnsent: a[17],
                    unsentTimestampMs: a[18],
                    mentionOffsets: a[19],
                    mentionLengths: a[20],
                    mentionIds: a[21],
                    mentionTypes: a[22],
                    replySourceId: a[23],
                    replySourceType: a[24],
                    replySourceTypeV2: a[25],
                    replyStatus: a[26],
                    replySnippet: a[27],
                    replyMessageText: a[28],
                    replyToUserId: a[29],
                    replyMediaExpirationTimestampMs: a[30],
                    replyMediaUrl: a[31],
                    replyMediaPreviewWidth: a[33],
                    replyMediaPreviewHeight: a[34],
                    replyMediaUrlMimeType: a[35],
                    replyMediaUrlFallback: a[36],
                    replyCtaId: a[37],
                    replyCtaTitle: a[38],
                    replyAttachmentType: a[39],
                    replyAttachmentId: a[40],
                    replyAttachmentExtra: a[41],
                    isForwarded: a[42],
                    forwardScore: a[43],
                    hasQuickReplies: a[44],
                    adminMsgCtaId: a[45],
                    adminMsgCtaTitle: a[46],
                    adminMsgCtaType: a[47],
                    cannotUnsendReason: a[48],
                    textHasLinks: a[49],
                    viewFlags: a[50],
                    displayedContentTypes: a[51],
                    viewedPluginKey: a[52],
                    viewedPluginContext: a[53],
                    quickReplyType: a[54],
                    hotEmojiSize: a[55],
                    replySourceTimestampMs: a[56],
                    ephemeralDurationInSec: a[57],
                    msUntilExpirationTs: a[58],
                    ephemeralExpirationTs: a[59],
                    takedownState: a[60],
                    isCollapsed: a[61],
                    subthreadKey: a[62],
                    localDataId: c[2],
                  });
                },
              ]);
        },
        function (a) {
          return b.resolve(d);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "LSMoveThreadToInboxAndUpdateParent",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [];
      return b.seq([
        function (c) {
          return b.fe(b.db.table(9).fetch([[[a[0]]]]), function (b) {
            var c = b.update;
            b.item;
            return c({
              folderName: "inbox",
              parentThreadKey: a[1],
            });
          });
        },
        function (a) {
          return b.resolve(c);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "LSUpdateParticipantLastMessageSendTimestamp",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [];
      return b.resolve(c);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "LSUpdateThreadSnippet",
  ["LSGetThreadParticipantDisplayName"],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        c = a[a.length - 1];
      c.n;
      var d = [],
        e = [],
        f;
      return c.seq([
        function (e) {
          return c.seq([
            function (a) {
              return c.resolve(((d[1] = ""), (d[0] = d[1] === "" ? f : d[1])));
            },
            function (e) {
              return d[0] !== f
                ? c.fe(c.db.table(9).fetch([[[a[0]]]]), function (b) {
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
                      viewedPluginContext: a[6],
                    });
                  })
                : a[7]
                ? c.seq([
                    function (e) {
                      return c.i64.neq(a[3], f)
                        ? c.seq([
                            function (e) {
                              return c
                                .sp(
                                  b("LSGetThreadParticipantDisplayName"),
                                  a[0],
                                  a[3]
                                )
                                .then(function (a) {
                                  return (a = a), (d[2] = a[0]), a;
                                });
                            },
                            function (b) {
                              return (
                                a[1] !== f
                                  ? (d[3] = [d[2], ": ", a[1]].join(""))
                                  : (d[3] = f),
                                (d[1] = d[3])
                              );
                            },
                          ])
                        : c.resolve((d[1] = a[1]));
                    },
                    function (b) {
                      return c.fe(
                        c.db.table(9).fetch([[[a[0]]]]),
                        function (b) {
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
                            viewedPluginContext: a[6],
                          });
                        }
                      );
                    },
                  ])
                : c.fe(c.db.table(9).fetch([[[a[0]]]]), function (b) {
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
                      viewedPluginContext: a[6],
                    });
                  });
            },
          ]);
        },
        function (a) {
          return c.resolve(e);
        },
      ]);
    }
    c = a;
    f["default"] = c;
  },
  66
);
__d(
  "LSUpdateTypingIndicator",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [],
        d = [];
      return b.seq([
        function (d) {
          return b.seq([
            function (d) {
              return a[2]
                ? ((c[0] = b.i64.of_float(Date.now())),
                  b.db.table(52).put({
                    threadKey: a[0],
                    senderId: a[1],
                    expirationTimestampMs: b.i64.add(
                      c[0],
                      b.i64.cast([0, 5e3])
                    ),
                  }))
                : b.resolve();
            },
            function (c) {
              return a[2]
                ? b.resolve()
                : b.fe(
                    b.ftr(b.db.table(52).fetch([[[a[0], a[1]]]]), function (c) {
                      return (
                        b.i64.eq(c.threadKey, a[0]) &&
                        b.i64.eq(b.i64.cast([0, 0]), b.i64.cast([0, 0])) &&
                        b.i64.eq(c.senderId, a[1])
                      );
                    }),
                    function (a) {
                      return a["delete"]();
                    }
                  );
            },
          ]);
        },
        function (a) {
          return b.resolve(d);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "PolarisDataControlsSupportRoot.entrypoint",
  ["JSResourceForInteraction"],
  function (a, b, c, d, e, f, g) {
    "use strict";
    a = {
      getPreloadProps: function (a) {
        return {
          queries: {},
        };
      },
      root: c("JSResourceForInteraction")(
        "PolarisDataControlsSupportRoot.react"
      ).__setRef("PolarisDataControlsSupportRoot.entrypoint"),
    };
    g["default"] = a;
  },
  98
);
__d(
  "PolarisCreateStyleRoot.entrypoint",
  ["JSResourceForInteraction"],
  function (a, b, c, d, e, f, g) {
    "use strict";
    a = {
      getPreloadProps: function (a) {
        return {
          queries: {},
        };
      },
      root: c("JSResourceForInteraction")(
        "PolarisCreateStyleRoot.react"
      ).__setRef("PolarisCreateStyleRoot.entrypoint"),
    };
    g["default"] = a;
  },
  98
);
__d(
  "PolarisDataDownloadRequestRoot.entrypoint",
  ["JSResourceForInteraction"],
  function (a, b, c, d, e, f, g) {
    "use strict";
    a = {
      getPreloadProps: function (a) {
        return {
          queries: {},
        };
      },
      root: c("JSResourceForInteraction")(
        "PolarisDataDownloadRequestRoot.react"
      ).__setRef("PolarisDataDownloadRequestRoot.entrypoint"),
    };
    g["default"] = a;
  },
  98
); /*FB_PKG_DELIM*/

__d(
  "LSUpdateOrInsertThread",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [],
        d = [],
        e;
      return b.seq([
        function (d) {
          return b.db
            .table(9)
            .fetch([[[a[7]]]])
            .next()
            .then(function (d, f) {
              var g = d.done;
              d = d.value;
              return g
                ? b.db.table(9).add({
                    threadKey: a[7],
                    lastReadWatermarkTimestampMs: a[1],
                    authorityLevel: a[6],
                    mailboxType: a[8],
                    threadType: a[9],
                    folderName: a[10],
                    ongoingCallState: a[32],
                    parentThreadKey: a[38],
                    lastActivityTimestampMs: a[0],
                    snippet: a[2],
                    threadName: a[3],
                    threadPictureUrl: a[4],
                    needsAdminApprovalForNewParticipant: a[5],
                    threadPictureUrlFallback: a[11],
                    threadPictureUrlExpirationTimestampMs: a[12],
                    removeWatermarkTimestampMs: a[13],
                    muteExpireTimeMs: a[14],
                    muteMentionExpireTimeMs: a[15],
                    muteCallsExpireTimeMs: a[16],
                    groupNotificationSettings: a[19],
                    isAdminSnippet: a[20],
                    snippetSenderContactId: a[21],
                    snippetStringHash: a[24],
                    snippetStringArgument1: a[25],
                    snippetAttribution: a[26],
                    snippetAttributionStringHash: a[27],
                    disappearingSettingTtl: a[28],
                    disappearingSettingUpdatedTs: a[29],
                    disappearingSettingUpdatedBy: a[30],
                    cannotReplyReason: a[33],
                    customEmoji: a[34],
                    customEmojiImageUrl: a[35],
                    outgoingBubbleColor: a[36],
                    themeFbid: a[37],
                    nullstateDescriptionText1: a[39],
                    nullstateDescriptionType1: a[40],
                    nullstateDescriptionText2: a[41],
                    nullstateDescriptionType2: a[42],
                    nullstateDescriptionText3: a[43],
                    nullstateDescriptionType3: a[44],
                    draftMessage: a[45],
                    snippetHasEmoji: a[46],
                    hasPersistentMenu: a[47],
                    disableComposerInput: a[48],
                    cannotUnsendReason: a[49],
                    viewedPluginKey: a[50],
                    viewedPluginContext: a[51],
                    clientThreadKey: a[52],
                    capabilities: a[53],
                    shouldRoundThreadPicture: a[54],
                    proactiveWarningDismissTime: a[55],
                    isCustomThreadPicture: a[56],
                    otidOfFirstMessage: a[57],
                    normalizedSearchTerms: a[58],
                    additionalThreadContext: a[59],
                    disappearingThreadKey: a[60],
                    isDisappearingMode: a[61],
                    disappearingModeInitiator: a[62],
                    unreadDisappearingMessageCount: a[63],
                    lastMessageCtaId: a[65],
                    lastMessageCtaType: a[66],
                    lastMessageCtaTimestampMs: a[67],
                    consistentThreadFbid: a[68],
                    threadDescription: a[70],
                    unsendLimitMs: a[71],
                    capabilities2: a[79],
                    capabilities3: a[80],
                    syncGroup: a[83],
                    threadInvitesEnabled: a[84],
                    threadInviteLink: a[85],
                    isAllUnreadMessageMissedCallXma: a[86],
                    lastNonMissedCallXmaMessageTimestampMs: a[87],
                    threadInvitesEnabledV2: a[89],
                    hasPendingInvitation: a[92],
                    eventStartTimestampMs: a[93],
                    eventEndTimestampMs: a[94],
                    takedownState: a[95],
                    secondaryParentThreadKey: a[96],
                    igFolder: a[97],
                    inviterId: a[98],
                    threadTags: a[99],
                    threadStatus: a[100],
                    threadSubtype: a[101],
                    pauseThreadTimestamp: a[102],
                  })
                : ((f = d.item),
                  (c[1] = f.lastActivityTimestampMs),
                  (c[3] = f.parentThreadKey),
                  (c[2] = f.disappearingThreadKey),
                  (c[4] = f.isDisappearingMode),
                  b.i64.le(f.authorityLevel, a[6])
                    ? b.i64.gt(c[1], a[0]) && b.i64.neq(c[2], e)
                      ? (b.i64.eq(a[38], b.i64.cast([-1, 4294967286])) &&
                        b.i64.eq(c[3], b.i64.cast([0, 0]))
                          ? ((g = [c[3], f.folderName]),
                            (c[5] = g[0]),
                            (c[6] = g[1]),
                            g)
                          : ((d = [a[38], a[10]]),
                            (c[5] = d[0]),
                            (c[6] = d[1]),
                            d),
                        b.fe(b.db.table(9).fetch([[[a[7]]]]), function (b) {
                          var d = b.update;
                          b.item;
                          return d({
                            lastReadWatermarkTimestampMs:
                              f.lastReadWatermarkTimestampMs,
                            authorityLevel: a[6],
                            threadType: a[9],
                            folderName: c[6],
                            ongoingCallState: a[32],
                            parentThreadKey: c[5],
                            lastActivityTimestampMs: c[1],
                            snippet: a[2],
                            threadName: a[3],
                            threadPictureUrl: a[4],
                            needsAdminApprovalForNewParticipant: a[5],
                            threadPictureUrlFallback: a[11],
                            threadPictureUrlExpirationTimestampMs: a[12],
                            removeWatermarkTimestampMs: a[13],
                            muteExpireTimeMs: a[14],
                            muteMentionExpireTimeMs: a[15],
                            muteCallsExpireTimeMs: a[16],
                            groupNotificationSettings: a[19],
                            isAdminSnippet: a[20],
                            snippetSenderContactId: a[21],
                            snippetStringHash: a[24],
                            snippetStringArgument1: a[25],
                            snippetAttribution: a[26],
                            snippetAttributionStringHash: a[27],
                            disappearingSettingTtl: a[28],
                            disappearingSettingUpdatedTs: a[29],
                            disappearingSettingUpdatedBy: a[30],
                            cannotReplyReason: a[33],
                            customEmoji: a[34],
                            customEmojiImageUrl: a[35],
                            outgoingBubbleColor: a[36],
                            themeFbid: a[37],
                            nullstateDescriptionText1: a[39],
                            nullstateDescriptionType1: a[40],
                            nullstateDescriptionText2: a[41],
                            nullstateDescriptionType2: a[42],
                            nullstateDescriptionText3: a[43],
                            nullstateDescriptionType3: a[44],
                            draftMessage: a[45],
                            snippetHasEmoji: a[46],
                            hasPersistentMenu: a[47],
                            disableComposerInput: a[48],
                            cannotUnsendReason: a[49],
                            viewedPluginKey: a[50],
                            viewedPluginContext: a[51],
                            clientThreadKey: a[52],
                            capabilities: a[53],
                            shouldRoundThreadPicture: a[54],
                            proactiveWarningDismissTime: a[55],
                            isCustomThreadPicture: a[56],
                            otidOfFirstMessage: a[57],
                            normalizedSearchTerms: a[58],
                            additionalThreadContext: a[59],
                            disappearingThreadKey: c[2],
                            isDisappearingMode: c[4],
                            disappearingModeInitiator: a[62],
                            unreadDisappearingMessageCount: a[63],
                            lastMessageCtaId: a[65],
                            lastMessageCtaType: a[66],
                            lastMessageCtaTimestampMs: a[67],
                            consistentThreadFbid: a[68],
                            threadDescription: a[70],
                            unsendLimitMs: a[71],
                            capabilities2: a[79],
                            capabilities3: a[80],
                            syncGroup: a[83],
                            threadInvitesEnabled: a[84],
                            threadInviteLink: a[85],
                            isAllUnreadMessageMissedCallXma: a[86],
                            lastNonMissedCallXmaMessageTimestampMs: a[87],
                            threadInvitesEnabledV2: a[89],
                            hasPendingInvitation: a[92],
                            eventStartTimestampMs: a[93],
                            eventEndTimestampMs: a[94],
                            takedownState: a[95],
                            secondaryParentThreadKey: a[96],
                            igFolder: a[97],
                            inviterId: a[98],
                            threadTags: a[99],
                            threadStatus: a[100],
                            threadSubtype: a[101],
                            pauseThreadTimestamp: a[102],
                            avatarStickerInstructionKeyId: e,
                            avatarStickerId: e,
                            avatarStickerThumbnailImageUrl: e,
                            avatarStickerThumbnailImageMimeType: e,
                            avatarStickerOriginalImageUrl: e,
                            avatarStickerOriginalImageMimeType: e,
                            memberCount: e,
                          });
                        }))
                      : b.fe(b.db.table(9).fetch([[[a[7]]]]), function (b) {
                          var d = b.update;
                          b.item;
                          return d({
                            lastReadWatermarkTimestampMs: a[1],
                            authorityLevel: a[6],
                            threadType: a[9],
                            folderName: a[10],
                            ongoingCallState: a[32],
                            parentThreadKey: a[38],
                            lastActivityTimestampMs: a[0],
                            snippet: a[2],
                            threadName: a[3],
                            threadPictureUrl: a[4],
                            needsAdminApprovalForNewParticipant: a[5],
                            threadPictureUrlFallback: a[11],
                            threadPictureUrlExpirationTimestampMs: a[12],
                            removeWatermarkTimestampMs: a[13],
                            muteExpireTimeMs: a[14],
                            muteMentionExpireTimeMs: a[15],
                            muteCallsExpireTimeMs: a[16],
                            groupNotificationSettings: a[19],
                            isAdminSnippet: a[20],
                            snippetSenderContactId: a[21],
                            snippetStringHash: a[24],
                            snippetStringArgument1: a[25],
                            snippetAttribution: a[26],
                            snippetAttributionStringHash: a[27],
                            disappearingSettingTtl: a[28],
                            disappearingSettingUpdatedTs: a[29],
                            disappearingSettingUpdatedBy: a[30],
                            cannotReplyReason: a[33],
                            customEmoji: a[34],
                            customEmojiImageUrl: a[35],
                            outgoingBubbleColor: a[36],
                            themeFbid: a[37],
                            nullstateDescriptionText1: a[39],
                            nullstateDescriptionType1: a[40],
                            nullstateDescriptionText2: a[41],
                            nullstateDescriptionType2: a[42],
                            nullstateDescriptionText3: a[43],
                            nullstateDescriptionType3: a[44],
                            draftMessage: a[45],
                            snippetHasEmoji: a[46],
                            hasPersistentMenu: a[47],
                            disableComposerInput: a[48],
                            cannotUnsendReason: a[49],
                            viewedPluginKey: a[50],
                            viewedPluginContext: a[51],
                            clientThreadKey: a[52],
                            capabilities: a[53],
                            shouldRoundThreadPicture: a[54],
                            proactiveWarningDismissTime: a[55],
                            isCustomThreadPicture: a[56],
                            otidOfFirstMessage: a[57],
                            normalizedSearchTerms: a[58],
                            additionalThreadContext: a[59],
                            disappearingThreadKey: c[2],
                            isDisappearingMode: c[4],
                            disappearingModeInitiator: a[62],
                            unreadDisappearingMessageCount: a[63],
                            lastMessageCtaId: a[65],
                            lastMessageCtaType: a[66],
                            lastMessageCtaTimestampMs: a[67],
                            consistentThreadFbid: a[68],
                            threadDescription: a[70],
                            unsendLimitMs: a[71],
                            capabilities2: a[79],
                            capabilities3: a[80],
                            syncGroup: a[83],
                            threadInvitesEnabled: a[84],
                            threadInviteLink: a[85],
                            isAllUnreadMessageMissedCallXma: a[86],
                            lastNonMissedCallXmaMessageTimestampMs: a[87],
                            threadInvitesEnabledV2: a[89],
                            hasPendingInvitation: a[92],
                            eventStartTimestampMs: a[93],
                            eventEndTimestampMs: a[94],
                            takedownState: a[95],
                            secondaryParentThreadKey: a[96],
                            igFolder: a[97],
                            inviterId: a[98],
                            threadTags: a[99],
                            threadStatus: a[100],
                            threadSubtype: a[101],
                            pauseThreadTimestamp: a[102],
                            avatarStickerInstructionKeyId: e,
                            avatarStickerId: e,
                            avatarStickerThumbnailImageUrl: e,
                            avatarStickerThumbnailImageMimeType: e,
                            avatarStickerOriginalImageUrl: e,
                            avatarStickerOriginalImageMimeType: e,
                            memberCount: e,
                          });
                        })
                    : b.resolve());
            });
        },
        function (a) {
          return b.resolve(d);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "BillingWrapperContext",
  ["react"],
  function (a, b, c, d, e, f, g) {
    "use strict";
    a = d("react");
    b = a.createContext();
    c = b;
    g["default"] = c;
  },
  98
); /*FB_PKG_DELIM*/

__d(
  "LSGetParentThreadKey",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [],
        d = [];
      return b.seq([
        function (e) {
          return b.seq([
            function (d) {
              return b.db
                .table(9)
                .fetch([[[a[0]]]])
                .next()
                .then(function (a, d) {
                  var e = a.done;
                  a = a.value;
                  return e
                    ? (c[0] = b.i64.cast([0, 0]))
                    : ((d = a.item), (c[0] = d.parentThreadKey));
                });
            },
            function (a) {
              return (d[0] = c[0]);
            },
          ]);
        },
        function (a) {
          return b.resolve(d);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "LSUpdateFolderThreadSnippet",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [],
        d = [],
        e;
      return b.seq([
        function (d) {
          return b.seq([
            function (d) {
              return b.i64.neq(a[1], e)
                ? b.resolve((c[0] = a[1]))
                : b.seq([
                    function (d) {
                      return b
                        .ct(
                          b.ftr(
                            b.db
                              .table(9)
                              .fetch([
                                [[a[0]]],
                                "parentThreadKeyLastActivityTimestampMs",
                              ]),
                            function (c) {
                              return (
                                b.i64.eq(c.parentThreadKey, a[0]) &&
                                b.i64.lt(
                                  c.lastReadWatermarkTimestampMs,
                                  c.lastActivityTimestampMs
                                )
                              );
                            }
                          )
                        )
                        .then(function (a) {
                          return (c[5] = a);
                        });
                    },
                    function (a) {
                      return (c[0] = c[5]);
                    },
                  ]);
            },
            function (d) {
              return (
                (c[1] = a[2].get("all_read")),
                a[2],
                (c[2] = a[2].get("unread_singular")),
                a[2],
                (c[3] = a[2].get("unread_plural")),
                a[2],
                b.i64.eq(c[0], b.i64.cast([0, 0]))
                  ? (c[4] = c[1])
                  : (b.i64.eq(c[0], b.i64.cast([0, 1]))
                      ? (c[5] = [b.i64.to_string(c[0]), c[2]].join(""))
                      : (c[5] = [b.i64.to_string(c[0]), c[3]].join("")),
                    (c[4] = c[5])),
                b.fe(b.db.table(9).fetch([[[a[0]]]]), function (a) {
                  var b = a.update;
                  a.item;
                  return b({
                    snippet: c[4],
                    snippetStringHash: e,
                    snippetStringArgument1: e,
                    snippetAttribution: e,
                    snippetAttributionStringHash: e,
                  });
                })
              );
            },
          ]);
        },
        function (a) {
          return b.resolve(d);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "LSUpdateParentFolderReadWatermark",
  ["LSGetParentThreadKey", "LSUpdateFolderThreadSnippet"],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        c = a[a.length - 1];
      c.n;
      var d = [],
        e = [],
        f;
      return c.seq([
        function (e) {
          return c.seq([
            function (e) {
              return c.sp(b("LSGetParentThreadKey"), a[0]).then(function (a) {
                return (a = a), (d[0] = a[0]), a;
              });
            },
            function (e) {
              return c.i64.neq(d[0], c.i64.cast([0, 0]))
                ? c.seq([
                    function (a) {
                      return c
                        .sb(
                          c.ftr(
                            c.db
                              .table(9)
                              .fetch([
                                [[d[0]]],
                                "parentThreadKeyLastActivityTimestampMs",
                              ]),
                            function (a) {
                              return (
                                c.i64.eq(a.parentThreadKey, d[0]) &&
                                c.i64.lt(
                                  a.lastReadWatermarkTimestampMs,
                                  a.lastActivityTimestampMs
                                )
                              );
                            }
                          ),
                          [["lastReadWatermarkTimestampMs", "ASC"]]
                        )
                        .next()
                        .then(function (a, b) {
                          var c = a.done;
                          a = a.value;
                          return c
                            ? (d[1] = f)
                            : ((b = a.item),
                              (d[1] = b.lastReadWatermarkTimestampMs));
                        });
                    },
                    function (a) {
                      return c.i64.neq(d[1], f)
                        ? c.fe(c.db.table(9).fetch([[[d[0]]]]), function (a) {
                            var b = a.update;
                            a.item;
                            return b({
                              lastReadWatermarkTimestampMs: d[1],
                            });
                          })
                        : c.seq([
                            function (a) {
                              return c.db
                                .table(9)
                                .fetch([[[d[0]]]])
                                .next()
                                .then(function (a, b) {
                                  var c = a.done;
                                  a = a.value;
                                  return c
                                    ? (d[3] = f)
                                    : ((b = a.item),
                                      (d[3] = b.lastActivityTimestampMs));
                                });
                            },
                            function (a) {
                              return c.i64.neq(d[3], f)
                                ? c.fe(
                                    c.db.table(9).fetch([[[d[0]]]]),
                                    function (a) {
                                      var b = a.update;
                                      a.item;
                                      return b({
                                        lastReadWatermarkTimestampMs: d[3],
                                      });
                                    }
                                  )
                                : c.resolve();
                            },
                          ]);
                    },
                    function (e) {
                      return c.sp(
                        b("LSUpdateFolderThreadSnippet"),
                        d[0],
                        f,
                        a[1]
                      );
                    },
                  ])
                : c.resolve();
            },
          ]);
        },
        function (a) {
          return c.resolve(e);
        },
      ]);
    }
    c = a;
    f["default"] = c;
  },
  66
);
__d(
  "LSWriteCTAIdToThreadsTable",
  ["LSGetFirstAvailableAttachmentCTAID"],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        c = a[a.length - 1];
      c.n;
      var d = [],
        e = [],
        f;
      return c.seq([
        function (e) {
          return a[1] === f
            ? c.fe(
                c.ftr(c.db.table(9).fetch([[[a[0]]]]), function (b) {
                  return (
                    c.i64.eq(b.threadKey, a[0]) &&
                    (c.i64.neq(b.lastMessageCtaId, f) ||
                      b.lastMessageCtaType !== f)
                  );
                }),
                function (b) {
                  var c = b.update;
                  b.item;
                  return c({
                    lastMessageCtaId: f,
                    lastMessageCtaType: f,
                    lastMessageCtaTimestampMs: a[2],
                  });
                }
              )
            : c.i64.neq(a[2], f)
            ? c.seq([
                function (b) {
                  return c.db
                    .table(9)
                    .fetch([[[a[0]]]])
                    .next()
                    .then(function (a, b) {
                      var e = a.done;
                      a = a.value;
                      return e
                        ? (d[0] = c.i64.cast([0, 0]))
                        : ((b = a.item), (d[0] = b.lastActivityTimestampMs));
                    });
                },
                function (e) {
                  return c.i64.ge(a[2], d[0])
                    ? c.seq([
                        function (a) {
                          return c
                            .sp(b("LSGetFirstAvailableAttachmentCTAID"))
                            .then(function (a) {
                              return (a = a), (d[2] = a[0]), a;
                            });
                        },
                        function (b) {
                          return c.fe(
                            c.db.table(9).fetch([[[a[0]]]]),
                            function (b) {
                              var c = b.update;
                              b.item;
                              return c({
                                lastMessageCtaId: d[2],
                                lastMessageCtaType: a[1],
                                lastMessageCtaTimestampMs: a[2],
                              });
                            }
                          );
                        },
                      ])
                    : c.resolve(0);
                },
              ])
            : c.resolve();
        },
        function (a) {
          return c.resolve(e);
        },
      ]);
    }
    c = a;
    f["default"] = c;
  },
  66
); /*FB_PKG_DELIM*/

__d(
  "LSUpdateExistingMessageRange",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [];
      return b.seq([
        function (c) {
          return b
            .ftr(b.db.table(13).fetch([[[a[0]]]]), function (c) {
              return (
                b.i64.eq(c.threadKey, a[0]) &&
                (a[2]
                  ? b.i64.eq(c.maxTimestampMs, a[1])
                  : b.i64.eq(c.minTimestampMs, a[1]))
              );
            })
            .next()
            .then(function (c, d) {
              var e = c.done;
              c = c.value;
              return e
                ? 0
                : ((d = c.item),
                  b.db.table(13).put({
                    threadKey: d.threadKey,
                    minTimestampMs: d.minTimestampMs,
                    minMessageId: d.minMessageId,
                    maxTimestampMs: d.maxTimestampMs,
                    maxMessageId: d.maxMessageId,
                    isLoadingBefore: !1,
                    isLoadingAfter: !1,
                    hasMoreBefore: a[2] && !a[3] ? d.hasMoreBefore : !1,
                    hasMoreAfter: a[2] && !a[3] ? !1 : d.hasMoreAfter,
                  }));
            });
        },
        function (a) {
          return b.resolve(c);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "LSInsertBlobAttachment",
  [],
  function (a, b, c, d, e, f) {
    function a() {
      var a = arguments,
        b = a[a.length - 1];
      b.n;
      var c = [],
        d;
      return b.seq([
        function (c) {
          return b.seq([
            function (c) {
              return b.fe(
                b.ftr(
                  b.db.table(16).fetch([[[a[27], a[32], a[34]]]]),
                  function (c) {
                    return (
                      b.i64.eq(c.threadKey, a[27]) &&
                      b.i64.eq(b.i64.cast([0, 0]), a[28]) &&
                      c.messageId === a[32] &&
                      c.attachmentFbid === a[34] &&
                      b.i64.lt(c.authorityLevel, a[48]) &&
                      (b.i64.eq(c.attachmentType, b.i64.cast([0, 2])) ||
                        b.i64.eq(c.attachmentType, b.i64.cast([0, 3])) ||
                        b.i64.eq(c.attachmentType, b.i64.cast([0, 4])) ||
                        b.i64.eq(c.attachmentType, b.i64.cast([0, 5])) ||
                        b.i64.eq(c.attachmentType, b.i64.cast([0, 6])) ||
                        b.i64.eq(c.attachmentType, b.i64.cast([0, 10])) ||
                        b.i64.eq(c.attachmentType, b.i64.cast([0, 14]))) &&
                      b.i64.eq(c.ephemeralMediaState, d) &&
                      c.isSharable === !1
                    );
                  }
                ),
                function (a) {
                  return a["delete"]();
                }
              );
            },
            function (c) {
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
                authorityLevel: a[48],
              });
            },
          ]);
        },
        function (a) {
          return b.resolve(c);
        },
      ]);
    }
    b = a;
    f["default"] = b;
  },
  66
);
__d(
  "polarisLogODSToConsole",
  ["polarisDeveloperSettings"],
  function (a, b, c, d, e, f, g) {
    "use strict";

    function a(a, b) {
      if (!d("polarisDeveloperSettings").getCanLogODSToConsole()) return;
      var c = d("polarisDeveloperSettings").getConsoleLogODSFilter();
      if (c) {
        c = RegExp(c);
        if (!c.test(a)) return;
      }
      console.table(((c = {}), (c[a] = (a = b) != null ? a : 1), c));
    }
    g["default"] = a;
  },
  98
);
; /*FB_PKG_DELIM*/

__d("commitWorkplaceChatBotSubmitFeedbackMutation_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "6107272026057140"
}), null);
__d("commitWorkplaceChatBotSubmitFeedbackMutation.graphql", ["commitWorkplaceChatBotSubmitFeedbackMutation_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "input"
            }],
            c = [{
                alias: "results",
                args: [{
                    kind: "Variable",
                    name: "data",
                    variableName: "input"
                }],
                concreteType: "WorkplaceChatBotSubmitFeedbackResponsePayload",
                kind: "LinkedField",
                name: "workplace_chat_bot_submit_feedback",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "success",
                    storageKey: null
                }],
                storageKey: null
            }];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "commitWorkplaceChatBotSubmitFeedbackMutation",
                selections: c,
                type: "Mutation",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "commitWorkplaceChatBotSubmitFeedbackMutation",
                selections: c
            },
            params: {
                id: b("commitWorkplaceChatBotSubmitFeedbackMutation_facebookRelayOperation"),
                metadata: {},
                name: "commitWorkplaceChatBotSubmitFeedbackMutation",
                operationKind: "mutation",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("GroupsCometAdmodChatsPendingPostReviewDialogQuery$Parameters", ["GroupsCometAdmodChatsPendingPostReviewDialogQuery_facebookRelayOperation", "IsMergQAPolls.relayprovider", "IsWorkUser.relayprovider"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("GroupsCometAdmodChatsPendingPostReviewDialogQuery_facebookRelayOperation"),
            metadata: {},
            name: "GroupsCometAdmodChatsPendingPostReviewDialogQuery",
            operationKind: "query",
            text: null,
            providedVariables: {
                __relay_internal__pv__IsWorkUserrelayprovider: b("IsWorkUser.relayprovider"),
                __relay_internal__pv__IsMergQAPollsrelayprovider: b("IsMergQAPolls.relayprovider")
            }
        }
    };
    e.exports = a
}), null);
__d("GroupsCometAdmodChatsReviewDialogQuery$Parameters", ["GroupsCometAdmodChatsReviewDialogQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("GroupsCometAdmodChatsReviewDialogQuery_facebookRelayOperation"),
            metadata: {},
            name: "GroupsCometAdmodChatsReviewDialogQuery",
            operationKind: "query",
            text: null
        }
    };
    e.exports = a
}), null);
__d("MarketplaceCometReviewOffersDialogQuery$Parameters", ["MarketplaceCometReviewOffersDialogQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("MarketplaceCometReviewOffersDialogQuery_facebookRelayOperation"),
            metadata: {},
            name: "MarketplaceCometReviewOffersDialogQuery",
            operationKind: "query",
            text: null
        }
    };
    e.exports = a
}), null);
__d("CometMarketplaceCreateDiscountedPriceDialogContentQuery$Parameters", ["CometMarketplaceCreateDiscountedPriceDialogContentQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("CometMarketplaceCreateDiscountedPriceDialogContentQuery_facebookRelayOperation"),
            metadata: {},
            name: "CometMarketplaceCreateDiscountedPriceDialogContentQuery",
            operationKind: "query",
            text: null
        }
    };
    e.exports = a
}), null);
__d("CometMarketplaceCreateDiscountedPriceDialogNUXQuery$Parameters", ["CometMarketplaceCreateDiscountedPriceDialogNUXQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("CometMarketplaceCreateDiscountedPriceDialogNUXQuery_facebookRelayOperation"),
            metadata: {},
            name: "CometMarketplaceCreateDiscountedPriceDialogNUXQuery",
            operationKind: "query",
            text: null
        }
    };
    e.exports = a
}), null);
__d("P2MAttachBankSlipDialogQuery$Parameters", ["P2MAttachBankSlipDialogQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("P2MAttachBankSlipDialogQuery_facebookRelayOperation"),
            metadata: {},
            name: "P2MAttachBankSlipDialogQuery",
            operationKind: "query",
            text: null
        }
    };
    e.exports = a
}), null);
__d("P2MOrderDetailDialogQuery$Parameters", ["P2MOrderDetailDialogQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("P2MOrderDetailDialogQuery_facebookRelayOperation"),
            metadata: {
                live: {
                    polling_interval: 1e4
                }
            },
            name: "P2MOrderDetailDialogQuery",
            operationKind: "query",
            text: null
        }
    };
    e.exports = a
}), null);
__d("P2MOffsiteBankTransferDialogQuery$Parameters", ["P2MOffsiteBankTransferDialogQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("P2MOffsiteBankTransferDialogQuery_facebookRelayOperation"),
            metadata: {},
            name: "P2MOffsiteBankTransferDialogQuery",
            operationKind: "query",
            text: null
        }
    };
    e.exports = a
}), null);
__d("MWChatCustomerFeedbackFormDataQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "5832261760118587"
}), null);
__d("MWChatCustomerFeedbackFormDataQuery.graphql", ["MWChatCustomerFeedbackFormDataQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "formID"
            }],
            c = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "type",
                storageKey: null
            };
        c = [{
            alias: null,
            args: [{
                kind: "Variable",
                name: "form_id",
                variableName: "formID"
            }],
            concreteType: "MessengerFeedbackFormDataResult",
            kind: "LinkedField",
            name: "messenger_feedback_form_data",
            plural: !1,
            selections: [{
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "form_id",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "page_id",
                storageKey: null
            }, {
                alias: null,
                args: null,
                concreteType: "MessengerFeedbackBusinessPrivacyObject",
                kind: "LinkedField",
                name: "privacy",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "url",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "text",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "label",
                    storageKey: null
                }],
                storageKey: null
            }, {
                alias: null,
                args: null,
                concreteType: "MessengerFeedbackFormScreenObject",
                kind: "LinkedField",
                name: "first_screen",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "MessengerFeedbackQuestionObject",
                    kind: "LinkedField",
                    name: "feedback_questions",
                    plural: !0,
                    selections: [{
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "id",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "title",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "is_default_title",
                        storageKey: null
                    }, c, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "score_label",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "score_option",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "left_score_label",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "right_score_label",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        concreteType: "MessengerFeedBackQuestionFollowup",
                        kind: "LinkedField",
                        name: "follow_up",
                        plural: !1,
                        selections: [c, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "placeholder",
                            storageKey: null
                        }],
                        storageKey: null
                    }],
                    storageKey: null
                }],
                storageKey: null
            }],
            storageKey: null
        }];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "MWChatCustomerFeedbackFormDataQuery",
                selections: c,
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "MWChatCustomerFeedbackFormDataQuery",
                selections: c
            },
            params: {
                id: b("MWChatCustomerFeedbackFormDataQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatCustomerFeedbackFormDataQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("MWChatCustomerFeedbackStateQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "4589106431193063"
}), null);
__d("MWChatCustomerFeedbackStateQuery.graphql", ["MWChatCustomerFeedbackStateQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "formID"
            }],
            c = [{
                alias: null,
                args: [{
                    fields: [{
                        kind: "Variable",
                        name: "form_id",
                        variableName: "formID"
                    }],
                    kind: "ObjectValue",
                    name: "input"
                }],
                concreteType: "MessengerFeedbackFormStateQueryObject",
                kind: "LinkedField",
                name: "messenger_feedback_form_state",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "form_state",
                    storageKey: null
                }],
                storageKey: null
            }];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "MWChatCustomerFeedbackStateQuery",
                selections: c,
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "MWChatCustomerFeedbackStateQuery",
                selections: c
            },
            params: {
                id: b("MWChatCustomerFeedbackStateQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatCustomerFeedbackStateQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("MWChatPIIFormNuxQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "5048028465289521"
}), null);
__d("MWChatPIIFormNuxQuery.graphql", ["MWChatPIIFormNuxQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
            alias: null,
            args: null,
            concreteType: "MessengerPIIFormFirstPartyPrivacyObject",
            kind: "LinkedField",
            name: "messenger_pii_nux",
            plural: !1,
            selections: [{
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "description",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "url_text",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "url",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "title",
                storageKey: null
            }],
            storageKey: null
        }];
        return {
            fragment: {
                argumentDefinitions: [],
                kind: "Fragment",
                metadata: null,
                name: "MWChatPIIFormNuxQuery",
                selections: a,
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: [],
                kind: "Operation",
                name: "MWChatPIIFormNuxQuery",
                selections: a
            },
            params: {
                id: b("MWChatPIIFormNuxQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatPIIFormNuxQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("MWChatPIIFormStateQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "4923666631045015"
}), null);
__d("MWChatPIIFormStateQuery.graphql", ["MWChatPIIFormStateQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "formID"
            }],
            c = [{
                alias: null,
                args: [{
                    fields: [{
                        kind: "Variable",
                        name: "form_id",
                        variableName: "formID"
                    }],
                    kind: "ObjectValue",
                    name: "input"
                }],
                concreteType: "MessengerPIIFormStateQueryObject",
                kind: "LinkedField",
                name: "messenger_pii_form_state",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "state",
                    storageKey: null
                }],
                storageKey: null
            }];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "MWChatPIIFormStateQuery",
                selections: c,
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "MWChatPIIFormStateQuery",
                selections: c
            },
            params: {
                id: b("MWChatPIIFormStateQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatPIIFormStateQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("MWChatReceiptDataQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "7735392359808092"
}), null);
__d("MWChatReceiptDataQuery.graphql", ["MWChatReceiptDataQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = {
                defaultValue: null,
                kind: "LocalArgument",
                name: "messageID"
            },
            c = {
                defaultValue: null,
                kind: "LocalArgument",
                name: "receiptID"
            },
            d = [{
                alias: null,
                args: [{
                    kind: "Variable",
                    name: "message_id",
                    variableName: "messageID"
                }, {
                    kind: "Variable",
                    name: "receipt_id",
                    variableName: "receiptID"
                }],
                concreteType: "ReceiptDataResult",
                kind: "LinkedField",
                name: "receipt_data",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "recipient_name",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "merchant_name",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "order_id",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "payment_method",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "order_url",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "cancellation_url",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "address_line_1",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "address_line_2",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "address_line_3",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "total_cost",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "total_tax",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "shipping_cost",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "subtotal",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "order_time",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    concreteType: "ReceiptItem",
                    kind: "LinkedField",
                    name: "items",
                    plural: !0,
                    selections: [{
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "name",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "description",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "thumb_url",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "quantity",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "price",
                        storageKey: null
                    }],
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    concreteType: "Adjustment",
                    kind: "LinkedField",
                    name: "adjustments",
                    plural: !0,
                    selections: [{
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "adjustment_type",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "display_adjustment_amount",
                        storageKey: null
                    }],
                    storageKey: null
                }],
                storageKey: null
            }];
        return {
            fragment: {
                argumentDefinitions: [a, c],
                kind: "Fragment",
                metadata: null,
                name: "MWChatReceiptDataQuery",
                selections: d,
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: [c, a],
                kind: "Operation",
                name: "MWChatReceiptDataQuery",
                selections: d
            },
            params: {
                id: b("MWChatReceiptDataQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatReceiptDataQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("commitWorkplaceChatBotSubmitFeedbackMutation", ["CometRelay", "Promise", "commitWorkplaceChatBotSubmitFeedbackMutation.graphql"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h, i = h !== void 0 ? h : h = b("commitWorkplaceChatBotSubmitFeedbackMutation.graphql");

    function a(a) {
        var c = a.action_content_blob,
            e = a.config;
        return new(b("Promise"))(function(a, b) {
            d("CometRelay").commitMutation(e.environment, {
                mutation: i,
                onCompleted: function(b) {
                    a((b = b.results) == null ? void 0 : b.success)
                },
                onError: function(a) {
                    b(a)
                },
                variables: {
                    input: {
                        action_content_blob: c
                    }
                }
            })
        })
    }
    g["default"] = a
}), 98);
__d("GroupsCometAdmodChatsPendingPostReviewDialog.entrypoint", ["GroupsCometAdmodChatsPendingPostReviewDialogQuery$Parameters", "JSResourceForInteraction", "WebPixelRatio"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            var b = a.authorID,
                e = a.groupID,
                f = a.postID;
            a = a.scale;
            return {
                queries: {
                    queryReference: {
                        parameters: c("GroupsCometAdmodChatsPendingPostReviewDialogQuery$Parameters"),
                        variables: {
                            authorID: b,
                            feedLocation: "GROUP_PENDING",
                            focusCommentID: null,
                            groupID: e,
                            postID: f,
                            privacySelectorRenderLocation: "COMET_STREAM",
                            renderLocation: "group_pending_queue",
                            scale: a ? a : d("WebPixelRatio").get(),
                            useDefaultActor: !1
                        }
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("GroupsCometAdmodChatsPendingPostReviewDialog.react").__setRef("GroupsCometAdmodChatsPendingPostReviewDialog.entrypoint")
    };
    b = a;
    g["default"] = b
}), 98);
__d("GroupsCometAdmodChatsReviewDialog.entrypoint", ["GroupsCometAdmodChatsReviewDialogQuery$Parameters", "JSResourceForInteraction", "WebPixelRatio"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            var b = a.groupID,
                e = a.profileID;
            a = a.scale;
            return {
                queries: {
                    queryReference: {
                        parameters: c("GroupsCometAdmodChatsReviewDialogQuery$Parameters"),
                        variables: {
                            groupID: b,
                            profileID: e,
                            scale: a ? a : d("WebPixelRatio").get()
                        }
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("GroupsCometAdmodChatsReviewDialog.react").__setRef("GroupsCometAdmodChatsReviewDialog.entrypoint")
    };
    b = a;
    g["default"] = b
}), 98);
__d("MarketplaceCometReviewOffersDialog.entrypoint", ["JSResourceForInteraction", "MarketplaceCometReviewOffersDialogQuery$Parameters", "WebPixelRatio"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            a = a.listingId;
            return {
                queries: {
                    queryReference: {
                        options: {
                            fetchPolicy: "network-only"
                        },
                        parameters: c("MarketplaceCometReviewOffersDialogQuery$Parameters"),
                        variables: {
                            listingId: a,
                            scale: d("WebPixelRatio").get()
                        }
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("MarketplaceCometReviewOffersDialog.react").__setRef("MarketplaceCometReviewOffersDialog.entrypoint")
    };
    g["default"] = a
}), 98);
__d("CometMarketplaceCreateDiscountedPriceDialog.entrypoint", ["CometMarketplaceCreateDiscountedPriceDialogContentQuery$Parameters", "CometMarketplaceCreateDiscountedPriceDialogNUXQuery$Parameters", "JSResourceForInteraction", "WebPixelRatio"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            var b = d("WebPixelRatio").get();
            return {
                queries: {
                    cometMarketplaceCreateDiscountedPriceDialogContentQueryReference: {
                        parameters: c("CometMarketplaceCreateDiscountedPriceDialogContentQuery$Parameters"),
                        variables: {
                            thread_id: a.threadId
                        }
                    },
                    cometMarketplaceCreateDiscountedPriceDialogNUXQueryReference: {
                        parameters: c("CometMarketplaceCreateDiscountedPriceDialogNUXQuery$Parameters"),
                        variables: {
                            contentParams: {
                                pixelRatio: b
                            },
                            scale: b
                        }
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("CometMarketplaceCreateDiscountedPriceDialog.react").__setRef("CometMarketplaceCreateDiscountedPriceDialog.entrypoint")
    };
    g["default"] = a
}), 98);
__d("P2MAttachBankSlipDialog.entrypoint", ["JSResourceForInteraction", "P2MAttachBankSlipDialogQuery$Parameters"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            a = a.orderID;
            return {
                queries: {
                    P2MAttachBankSlipDialogQueryReference: {
                        parameters: b("P2MAttachBankSlipDialogQuery$Parameters"),
                        variables: {
                            orderID: a
                        }
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("P2MAttachBankSlipDialog.react").__setRef("P2MAttachBankSlipDialog.entrypoint")
    };
    g["default"] = a
}), 98);
__d("FBP2MCheckoutDialog.entrypoint", ["JSResourceForInteraction"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function() {
            return {}
        },
        root: c("JSResourceForInteraction")("FBP2MCheckoutDialog.react").__setRef("FBP2MCheckoutDialog.entrypoint")
    };
    g["default"] = a
}), 98);
__d("P2MOrderDetailDialog.entrypoint", ["JSResourceForInteraction", "P2MOrderDetailDialogQuery$Parameters"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            a = a.orderID;
            return {
                queries: {
                    P2MOrderDetailDialogQueryReference: {
                        parameters: b("P2MOrderDetailDialogQuery$Parameters"),
                        variables: {
                            orderID: a
                        }
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("P2MOrderDetailDialog.react").__setRef("P2MOrderDetailDialog.entrypoint")
    };
    g["default"] = a
}), 98);
__d("P2MOffsiteBankTransferDialog.entrypoint", ["JSResourceForInteraction", "P2MOffsiteBankTransferDialogQuery$Parameters"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            a = a.orderID;
            return {
                queries: {
                    P2MOffsiteBankTransferDialogQueryReference: {
                        parameters: b("P2MOffsiteBankTransferDialogQuery$Parameters"),
                        variables: {
                            input: {
                                invoice_id: a
                            }
                        }
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("P2MOffsiteBankTransferDialog.react").__setRef("P2MOffsiteBankTransferDialog.entrypoint")
    };
    g["default"] = a
}), 98);
__d("CancellationToken.bs", ["bs_caml_exceptions"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = c("bs_caml_exceptions").create("CancellationToken.TokenCancelled");

    function a() {
        var a = {
            contents: !1
        };
        return {
            cancel: function() {
                a.contents = !0
            },
            isCancelled: function() {
                return a.contents
            }
        }
    }
    g.TokenCancelled = b;
    g.make = a
}), 98);
__d("CancellablePromise.bs", ["CancellationToken.bs", "Promise"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a, c, e) {
        return e.then(function(e) {
            if (a.isCancelled()) return b("Promise").reject({
                RE_EXN_ID: d("CancellationToken.bs").TokenCancelled
            });
            else return c(e)
        })
    }

    function c(a, c) {
        return c["catch"](function(c) {
            if (c.RE_EXN_ID === d("CancellationToken.bs").TokenCancelled) return b("Promise").resolve(a);
            else return b("Promise").reject(c)
        })
    }
    g.then_ = a;
    g.ignoreFailed = c
}), 98);
__d("MWEncryptedUrl.bs", ["invariant", "Base64.bs", "CancellablePromise.bs", "CancellationToken.bs", "Crypto.bs", "Promise", "bs_pervasives", "promiseDone", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    e = d("react");
    var i = e.useEffect,
        j = e.useState;

    function a(a, e, f) {
        var g = j(e != null ? void 0 : a),
            k = g[0],
            l = g[1];
        i(function() {
            var g = d("CancellationToken.bs").make(),
                i = 0;
            if (e != null && a != null) {
                var j = d("CancellablePromise.bs").ignoreFailed(void 0, d("CancellablePromise.bs").then_(g, function(a) {
                    var e;
                    switch (f.TAG) {
                        case 1:
                            e = "data:image/jpeg;base64,";
                            break;
                        case 6:
                            e = "data:audio/wav;base64,";
                            break;
                        case 7:
                            e = "data:video/mp4;base64,";
                            break;
                        default:
                            e = c("bs_pervasives").failwith("Unsupported attachment for encryptedUrl")
                    }
                    l(function() {
                        return e + d("Base64.bs").fromArrayBuffer(a)
                    });
                    return b("Promise").resolve()
                }, d("CancellablePromise.bs").then_(g, function(a) {
                    var b = a[1],
                        c = b.slice(0, 2),
                        e = b.slice(2, 14);
                    b = b.slice(14);
                    return d("Crypto.bs").decrypt({
                        additionalData: c,
                        iv: e,
                        name: "AES-GCM",
                        tagLength: 128
                    }, a[0], b)
                }, d("CancellablePromise.bs").then_(g, function(a) {
                    var c = d("Base64.bs").toArrayBuffer(e);
                    c.byteLength === 32 || h(0, 20660);
                    return b("Promise").all([d("Crypto.bs").importKey("raw", c, {
                        NAME: "Aes",
                        VAL: "AES-GCM"
                    }, !1, ["decrypt"]), b("Promise").resolve(a)])
                }, d("CancellablePromise.bs").then_(g, function(a) {
                    return a.arrayBuffer()
                }, window.fetch(a))))));
                c("promiseDone")(j)
            } else i = 1;
            i === 1 && l(a);
            return g.cancel
        }, [a, e, l]);
        return k
    }
    g.useMaybeEncryptedUrl = a
}), 98);
__d("XCometMessengerAttachmentMediaControllerRouteBuilder", ["jsRouteBuilder"], (function(a, b, c, d, e, f, g) {
    a = c("jsRouteBuilder")("/messenger_attachment_media/", Object.freeze({}), void 0);
    b = a;
    g["default"] = b
}), 98);
__d("MWChatAttachmentMediaPreview.bs", ["fbt", "CometImageCover.react", "CometPressable.react", "I64", "MWEncryptedUrl.bs", "XCometMessengerAttachmentMediaControllerRouteBuilder", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = String(18) + "px",
        k = {
            imageContainer: {
                borderTop: "xzg4506",
                borderEnd: "xycxndf",
                borderBottom: "xua58t2",
                borderStart: "x4xrfw5",
                boxShadow: "x1yi6u8n",
                lineHeight: "x14ju556",
                verticalAlign: "xxymvpz",
                $$css: !0
            },
            standalone: {
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                borderTopEndRadius: "x1g8br2z",
                borderTopStartRadius: "x1tlxs6b",
                $$css: !0
            }
        };

    function l(a) {
        var b = a.attachmentMediaUrl,
            e = a.decryptionKey,
            f = a.previewUrl;
        a = a.widthStyle;
        f = d("MWEncryptedUrl.bs").useMaybeEncryptedUrl(f, e, {
            _0: {
                appAttribution: void 0,
                blurredImageUri: void 0,
                decryptionKey: void 0,
                isGIF: !1,
                photoFbid: void 0,
                previewHeight: void 0,
                previewUrl: "",
                previewWidth: void 0,
                title: void 0
            },
            TAG: 1
        });
        if (f != null) return i.jsx(c("CometPressable.react"), {
            "aria-label": h._("__JHASH__mrw3CpFXi7r__JHASH__"),
            linkProps: {
                url: b
            },
            testid: void 0,
            xstyle: function() {
                return [k.standalone]
            },
            children: i.jsx(c("CometImageCover.react"), {
                src: f,
                style: {
                    borderBottomLeftRadius: j,
                    borderBottomRightRadius: j,
                    borderTopLeftRadius: j,
                    borderTopRightRadius: j,
                    maxHeight: String(200) + "px",
                    maxWidth: "100%",
                    minHeight: String(24) + "px",
                    width: a
                }
            })
        });
        else return null
    }

    function m(a) {
        var b, c;
        b = d("I64").to_int32((b = a.previewHeight) != null ? b : d("I64").one);
        c = d("I64").to_int32((c = a.previewWidth) != null ? c : d("I64").one);
        c = c / b;
        a = a.previewWidth;
        if (a != null) return (b > 200 ? 200 * c : d("I64").to_float(a)).toString() + "px";
        else return "auto"
    }

    function a(a) {
        a = a.attachment;
        var b = a.previewUrl;
        if (b != null) return i.jsx("div", {
            className: "xzg4506 xycxndf xua58t2 x4xrfw5 x1yi6u8n x14ju556 xxymvpz x1gn5b1j x230xth x1g8br2z x1tlxs6b",
            children: i.jsx(l, {
                attachmentMediaUrl: c("XCometMessengerAttachmentMediaControllerRouteBuilder").buildURL({
                    attachment_id: a.attachmentFbid,
                    thread_id: d("I64").to_string(a.threadKey)
                }),
                decryptionKey: a.decryptionKey,
                previewUrl: b,
                widthStyle: m(a)
            })
        });
        else return null
    }
    b = a;
    g.make = b
}), 98);
__d("MWChatEphemeralButton.react", ["ix", "BaseImage_DEPRECATED.react", "MWPChatEphemeralButton.bs", "MWXIcon.react", "MWXText.react", "fbicon", "react", "useCurrentDisplayMode"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("fbicon")._(h("656360"), 20);

    function k() {
        var a = c("useCurrentDisplayMode")();
        return i.jsx(c("BaseImage_DEPRECATED.react"), {
            className: "x1b0d499",
            src: j.src,
            style: {
                filter: a === "dark" ? "invert(41%) sepia(25%) saturate(7193%) hue-rotate(202deg) brightness(106%) contrast(106%)" : "invert(44%) sepia(95%) saturate(2777%) hue-rotate(182deg) brightness(102%) contrast(103%)"
            }
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.attachment,
            d = a.connectBottom,
            e = a.connectTop;
        a = a.outgoing;
        return i.jsx(c("MWPChatEphemeralButton.bs"), {
            attachment: b,
            connectBottom: d,
            connectTop: e,
            outgoing: a,
            renderContent: function(a, b, d, e) {
                a = b === "expired" ? "disabled" : "primary";
                d = b === "unseen" ? i.jsx(k, {}) : b === "expired" ? i.jsx(c("MWXIcon.react"), {
                    color: "disabled",
                    icon: j
                }) : i.jsx(c("MWXIcon.react"), {
                    color: "primary",
                    icon: j
                });
                return i.jsx("div", {
                    className: "x1gslohp x11i5rnm x12nagc x1mh8g0r",
                    children: i.jsxs(c("MWXText.react"), {
                        color: a,
                        type: "bodyLink3",
                        children: [d, i.jsx("span", {
                            className: "x1i64zmx xjmsjum",
                            children: e
                        })]
                    })
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatImageInsetShadow.react", ["react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            imageShadow: {
                borderTop: "xa1me7u",
                borderEnd: "x13z1dwb",
                borderBottom: "xpkj8wx",
                borderStart: "x1g8y7dm",
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                borderTopEndRadius: "x1g8br2z",
                borderTopStartRadius: "x1tlxs6b",
                bottom: "x1ey2m1c",
                boxSizing: "x9f619",
                end: "xds687c",
                pointerEvents: "x47corl",
                position: "x10l6tqk",
                start: "x17qophe",
                top: "x13vifvy",
                $$css: !0
            }
        };

    function a(a) {
        a = a.xstyle;
        return h.jsx("div", {
            className: c("stylex")(i.imageShadow, a)
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("useBlockedUserInterstitial", ["I64", "JSResourceForInteraction", "LSContactBitOffset", "LSContactBlockedByViewerStatus", "LSFactory", "LSIntEnum", "LSMessagingThreadTypeUtil", "LSOptimisticPseudoUnblock", "MWCMThreadTypes.react", "MWPActor.react", "Promise", "ReQL.bs", "WebStorage", "getWarningCardStorageKey", "gkx", "promiseDone", "react", "recoverableViolation", "useCometLazyDialog", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatBlockWarningCardDialog.react").__setRef("useBlockedUserInterstitial")),
            e = a[0];
        a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatPseudoBlockWarningCardDialog.react").__setRef("useBlockedUserInterstitial"));
        var f = a[0];
        a = c("useCometLazyDialog")(c("JSResourceForInteraction")("RestrictedUserInterstitialDialog.react").__setRef("useBlockedUserInterstitial"));
        var g = a[0],
            i = c("useReStore")(),
            j = d("MWPActor.react").useActor();
        return h(function(a, h, k, l) {
            if (h == null) return k();
            var m = d("MWCMThreadTypes.react").isBroadcastThread(h.threadType);
            c("promiseDone")(b("Promise").all([d("ReQL.bs").toArray(d("ReQL.bs").map(d("ReQL.bs").filter(d("ReQL.bs").mergeJoin(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(i.table("participants")), {
                hd: a,
                tl: 0
            }), d("ReQL.bs").getKeyRange(d("ReQL.bs").fromIndexAscending(i.table("contacts").index("blockedByViewerStatusId")), {
                hd: d("LSIntEnum").ofNumber(c("LSContactBlockedByViewerStatus").MESSAGE_BLOCKED),
                tl: 0
            })), function(a) {
                var b = a[0];
                if (!d("I64").equal(a[1].id, j))
                    if (!m || b.isAdmin === !0) return !0;
                    else return b.isModerator === !0;
                else return !1
            }), function(a) {
                return a[1]
            })), d("ReQL.bs").toArray(d("ReQL.bs").map(d("ReQL.bs").filter(d("ReQL.bs").mergeJoin(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(i.table("participants")), {
                hd: a,
                tl: 0
            }), d("ReQL.bs").getKeyRange(d("ReQL.bs").fromIndexAscending(i.table("contacts").index("blockedByViewerStatusId")), {
                hd: d("LSIntEnum").ofNumber(c("LSContactBlockedByViewerStatus").FULLY_BLOCKED),
                tl: 0
            })), function(a) {
                var b = a[0];
                if (!d("I64").equal(a[1].id, j))
                    if (!m || b.isAdmin === !0) return !0;
                    else return b.isModerator === !0;
                else return !1
            }), function(a) {
                return a[1]
            })), d("ReQL.bs").toArray(d("ReQL.bs").map(d("ReQL.bs").filter(d("ReQL.bs").mergeJoin(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(i.table("participants")), {
                hd: a,
                tl: 0
            }), d("ReQL.bs").fromTableAscending(i.table("contacts"))), function(a) {
                return !d("I64").equal(a[1].id, j)
            }), function(a) {
                return a[1]
            })), d("ReQL.bs").first(d("ReQL.bs").map(d("ReQL.bs").filter(d("ReQL.bs").mergeJoin(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(i.table("participants")), {
                hd: a,
                tl: 0
            }), d("ReQL.bs").fromTableAscending(i.table("contacts"))), function(a) {
                return !d("I64").equal(a[1].id, j)
            }), function(a) {
                return a[1]
            }))]), function(b) {
                var j = b[3],
                    m = b[2];
                b = b[1].concat(b[0]);
                var n = d("LSMessagingThreadTypeUtil").isOneToOne(h.threadType),
                    o = d("LSMessagingThreadTypeUtil").isGroup(h.threadType),
                    p = j != null ? d("LSContactBitOffset").has(d("LSIntEnum").ofNumber(26), j) : !1,
                    q = c("WebStorage").getLocalStorage(),
                    r = c("getWarningCardStorageKey")(a),
                    s = q != null ? q.getItem(r) : void 0;
                s = s != null ? s === "true" : !1;
                n = n && p;
                p = !s && b.length > 0 && o;
                if (n) {
                    n = function(a) {
                        if (j != null) {
                            c("promiseDone")(i.runInTransaction(function(b) {
                                return c("LSOptimisticPseudoUnblock")(j.id, a, c("LSFactory")(b))
                            }, "readwrite"), function() {
                                return k()
                            }, function() {
                                return k()
                            });
                            return
                        }
                    };
                    return f({
                        contact: j,
                        entryPoint: l,
                        onClose: function() {},
                        onOptIn: n,
                        thread: h
                    }, function() {})
                }
                if (p) {
                    n = function() {
                        var a = q != null ? c("WebStorage").setItemGuarded(q, r, "true") : void 0;
                        a != null && c("recoverableViolation")("Unable to set item at path for BlockedUserInterstitial", "messenger_web_product");
                        return k()
                    };
                    return e({
                        blockees: b,
                        onOptIn: n,
                        thread: h
                    }, function() {})
                }
                p = m.filter(function(a) {
                    return (a = d("LSContactBitOffset").has(d("LSIntEnum").ofNumber(66), a)) != null ? a : !1
                });
                b = !s && c("gkx")("735") && p.length > 0 && o;
                if (!b) return k();
                n = function() {
                    var a = q != null ? c("WebStorage").setItemGuarded(q, r, "true") : void 0;
                    a != null && c("recoverableViolation")("Unable to set item at path for RestrictedUserInterstitial", "messenger_web_product");
                    return k()
                };
                return g({
                    onOptIn: n,
                    restrictedUsers: p,
                    thread: h
                }, function() {})
            })
        }, [j, i, e, f, g])
    }
    g["default"] = a
}), 98);
__d("useMWChatOpenTabByThreadKey", ["I64", "LSAuthorityLevel", "LSContactType", "LSFactory", "LSIntEnum", "LSVerifyThreadRowExists", "MWChatOpenTabForPage.bs", "MWPActor.react", "Promise", "ReQL.bs", "promiseDone", "react", "useMWBaseChatOpenTabForUser", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    e = d("react");
    var h = e.useCallback,
        i = e.useMemo;

    function a(a, e) {
        var f = c("useReStore")(),
            g = c("useMWBaseChatOpenTabForUser")(void 0, e),
            j = g[0],
            k = d("MWChatOpenTabForPage.bs").useHook(void 0, e),
            l = d("MWPActor.react").useActor(),
            m = i(function() {
                return new(b("Promise"))(function(b, e) {
                    e = d("ReQL.bs").mergeJoin(d("ReQL.bs").filter(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(f.table("participants")), {
                        hd: a,
                        tl: 0
                    }), function(a) {
                        return !d("I64").equal(a.contactId, l)
                    }), d("ReQL.bs").fromTableAscending(f.table("contacts")));
                    var g = {
                        contents: function() {}
                    };
                    g.contents = e.subscribe(function(a, e) {
                        if (e.operation === "delete") return;
                        a = e.value[1];
                        if (d("I64").ge(a.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").AUTHORITATIVE))) {
                            g.contents();
                            return b(a)
                        }
                    });
                    c("promiseDone")(d("ReQL.bs").first(e), function(e) {
                        if (e != null) {
                            e = e[1];
                            if (d("I64").ge(e.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").AUTHORITATIVE))) {
                                g.contents();
                                return b(e)
                            } else return
                        }
                        c("promiseDone")(f.runInTransaction(function(b) {
                            return c("LSVerifyThreadRowExists")(a, d("LSIntEnum").ofNumber(1), d("LSIntEnum").ofNumber(1), c("LSFactory")(b))
                        }, "readwrite"))
                    })
                })
            }, [a, f]);
        return h(function() {
            c("promiseDone")(m, function(b) {
                var e = d("I64").to_string(a);
                b = b.contactType;
                if (d("I64").equal(b, d("LSIntEnum").ofNumber(c("LSContactType").PAGE))) return k(e, !1);
                else return j(e, !1)
            })
        }, [m, j, k, a])
    }
    g["default"] = a
}), 98);
__d("MWLSImagePostbackCtaHandler.bs", ["ActorURI", "I64", "LSFactory", "LSInsertNewMediaSend", "LSIntEnum", "LSLocalApplyOptimisticMessageWithAttachments", "LSMailboxType", "LSMarkSubJobCompletedV2", "LSMessageReplySourceType", "LSMessageReplySourceTypeV2", "LSOptimisticSendMessage", "LSResumeMediaSendJob", "LSShape", "LSThreadAttributionTypeUtil.bs", "LSVec", "MWPActor.react", "MWThreadKey.react", "MercuryConfig", "MercuryLocalIDs", "MessagingAttachmentType", "Promise", "URI", "XComposerPhotoUploader", "promiseDone", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo;

    function i(a, e, f, g, h, i, j) {
        var k = d("MercuryLocalIDs").generateOfflineThreadingID();
        return c("LSLocalApplyOptimisticMessageWithAttachments")(e, f, d("LSIntEnum").ofNumber(1), void 0, void 0, !1, void 0, void 0, d("LSIntEnum").ofNumber(c("LSMessageReplySourceType").NONE), d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").NONE), void 0, c("LSVec").make([d("LSShape").ofRecord({
            action_url: void 0,
            attachment_fbid: k,
            attachment_index: d("I64").zero,
            attachment_type: d("LSIntEnum").ofNumber(c("MessagingAttachmentType").IMAGE),
            cta1_title: void 0,
            cta2_title: void 0,
            cta3_title: void 0,
            description_text: void 0,
            filename: "postback image.jpg",
            filesize: void 0,
            has_media: !0,
            has_xma: !1,
            image_url: void 0,
            mini_preview: void 0,
            offline_attachment_id: k,
            original_file_hash: void 0,
            playable_duration_ms: void 0,
            playable_url: void 0,
            playable_url_mime_type: void 0,
            preview_height: void 0,
            preview_url: g,
            preview_url_mime_type: "image/jpeg ",
            preview_width: void 0,
            source_text: void 0,
            subtitle_text: void 0,
            title_text: void 0,
            xma_layout_type: void 0,
            xmas_template_type: void 0
        })]), void 0, c("LSFactory")(a)).then(function(c) {
            var e = c[0];
            return a.table("messages_optimistic_context").add({
                externalAttachmentUrl: void 0,
                initiatingSource: void 0,
                markThreadRead: !0,
                messageId: void 0,
                offlineThreadingId: e,
                platformRef: void 0,
                platformToken: h,
                replySourceId: void 0,
                replySourceType: void 0,
                sendType: void 0,
                skipUrlPreviewGen: void 0,
                taskId: d("I64").of_string(e),
                threadAttributionSource: i,
                threadKey: f
            }).then(function() {
                return b("Promise").resolve([e, k])
            })
        })
    }

    function a(a, e) {
        var f = c("useReStore")(),
            g = d("MWPActor.react").useActor(),
            j = d("MWThreadKey.react").useMWThreadKeyMemoizedExn();
        return h(function() {
            return function(h, k, l) {
                var m = d("I64").to_string(g),
                    n = function(a) {
                        var e = a[1],
                            g = a[0],
                            h = new(c("XComposerPhotoUploader"))({
                                concurrentLimit: 3,
                                onUploadFailure: function(a, b) {
                                    return !0
                                },
                                onUploadProgress: function(a, b) {},
                                onUploadStart: function(a) {
                                    a = f.runInTransaction(function(a) {
                                        return c("LSInsertNewMediaSend")(e, g, d("I64").zero, d("LSIntEnum").ofNumber(c("MessagingAttachmentType").IMAGE), !1, !1, !1, !1, c("LSFactory")(a))
                                    }, "readwrite");
                                    c("promiseDone")(a)
                                },
                                onUploadSuccess: function(a, b) {
                                    a = b.response.payload.metadata[0];
                                    var h = a.image_id;
                                    if (h == null) return;
                                    b = f.runInTransaction(function(a) {
                                        return c("LSMarkSubJobCompletedV2")(e, d("I64").of_string(h.toString()), void 0, void 0, void 0, c("LSFactory")(a)).then(function() {
                                            return c("LSResumeMediaSendJob")(g, d("I64").zero, void 0, c("LSFactory")(a))
                                        })
                                    }, "readwrite");
                                    c("promiseDone")(b)
                                },
                                retryLimit: 1,
                                uploadEndpoint: new(d("ActorURI").create)(new(c("URI"))(c("MercuryConfig").upload_url), m)
                            });
                        a = window.fetch(l).then(function(a) {
                            return a.blob()
                        }).then(function(a) {
                            h.getAsyncUploadRequest([new File([a], "postback image.jpg", {
                                type: "image/jpeg"
                            })]).send();
                            return b("Promise").resolve()
                        });
                        c("promiseDone")(a)
                    },
                    o = d("LSThreadAttributionTypeUtil.bs").getSource(j, a),
                    p = f.runInTransaction(function(a) {
                        var b;
                        return c("LSOptimisticSendMessage")(g, j, d("LSIntEnum").ofNumber(1), d("LSIntEnum").ofNumber(c("LSMailboxType").MESSENGER), h, h, !1, void 0, void 0, void 0, void 0, o, void 0, void 0, void 0, d("LSIntEnum").ofNumber(c("LSMessageReplySourceType").NONE), d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").NONE), void 0, void 0, void 0, !0, !0, void 0, (b = e) != null ? b : void 0, void 0, void 0, void 0, c("LSFactory")(a))
                    }, "readwrite").then(function(a) {
                        return f.runInTransaction(function(a) {
                            return i(a, g, j, l, k, o, e).then(function(a) {
                                n(a)
                            })
                        }, "readwrite")
                    });
                c("promiseDone")(p)
            }
        }, [f, g, j])
    }
    g.usePostbackCtaHandler = a
}), 98);
__d("MWLSWebUrlCtaHandler.bs", ["JSResourceForInteraction", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWInboxUrlWebviewDialog.react").__setRef("MWLSWebUrlCtaHandler.bs")),
            b = a[0];
        return h(function(a) {
            return b({
                htmlBlob: a
            }, function() {})
        }, [b])
    }
    g.useShowWebViewDialog = a
}), 98);
__d("useMWLSMarketplaceXmaCtaHandler", ["LSFactory", "LSOptimisticProcessMarketplaceCallFunctionCTA", "MWThreadKey.react", "promiseDone", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a() {
        var a = c("useReStore")(),
            b = d("MWThreadKey.react").useMWThreadKeyMemoizedExn();
        return h(function(d, e, f, g) {
            c("promiseDone")(a.runInTransaction(function(a) {
                return c("LSOptimisticProcessMarketplaceCallFunctionCTA")(d, b, e, f, g, c("LSFactory")(a))
            }, "readwrite"))
        }, [a, b])
    }
    g["default"] = a
}), 98);
__d("MWChatCustomerFeedbackFormDataQuery", ["CometRelay", "MWChatCustomerFeedbackFormDataQuery.graphql", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h, i = function(a, b, e) {
            b = d("CometRelay").fetchQuery(b, j, {
                formID: a
            }).toPromise().then(function(a) {
                a && e({
                    firstScreen: a.messenger_feedback_form_data.first_screen,
                    formId: a.messenger_feedback_form_data.form_id,
                    pageId: a.messenger_feedback_form_data.page_id,
                    privacy: a.messenger_feedback_form_data.privacy
                })
            });
            c("promiseDone")(b)
        },
        j = h !== void 0 ? h : h = b("MWChatCustomerFeedbackFormDataQuery.graphql");
    a = function(a, b, c) {
        i(a, b, function(a) {
            return c(a)
        })
    };
    g.fetch = a
}), 98);
__d("MWChatCustomerFeedbackStateQuery", ["CometRelay", "MWChatCustomerFeedbackStateQuery.graphql", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h, i = function(a, b, e) {
            b = d("CometRelay").fetchQuery(b, j, {
                formID: a
            }).toPromise().then(function(a) {
                a && e(a.messenger_feedback_form_state.form_state)
            });
            c("promiseDone")(b)
        },
        j = h !== void 0 ? h : h = b("MWChatCustomerFeedbackStateQuery.graphql");
    a = function(a, b, c) {
        i(a, b, function(a) {
            return c(a)
        })
    };
    g.fetch = a
}), 98);
__d("MWChatEmojiUtil.bs", ["LSHotEmojiSize", "LSIntEnum"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        if (a == null) return 32;
        a = d("LSIntEnum").toNumber(a);
        switch (a) {
            case c("LSHotEmojiSize").MEDIUM:
                return 56;
            case c("LSHotEmojiSize").LARGE:
                return 96;
            default:
                return 32
        }
    }
    g.transformHotEmojiSizeForWeb = a
}), 98);
__d("MWChatPollXMAActionHandler.bs", ["JSResourceForInteraction", "MWThreadKey.react", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a() {
        var a = d("MWThreadKey.react").useMWThreadKeyMemoized(),
            b = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatPollDetailsDialog.react").__setRef("MWChatPollXMAActionHandler.bs")),
            e = b[0];
        return h(function(b, c) {
            return e({
                pollId: b,
                threadKey: a,
                title: c
            }, function() {})
        }, [e])
    }
    g.useHandler = a
}), 98);
__d("MWV2ChatSeenHeadsRow.react", ["fbt", "CometImage.react", "CometLazyDialogTrigger.react", "CometPressable.react", "JSResourceForInteraction", "MDSGlimmer.react", "MWLSThreadDisplayContext", "MWPThreadTheme.bs", "MWV2MessageRowIsRowFocusedContext.bs", "MWXTooltip.react", "MWXTooltipGroup.react", "MercuryTimestamp", "getFBTSafeGenderFromGenderConst", "react", "stylex"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    b = d("react");
    var j = b.useContext,
        k = b.useRef,
        l = 5,
        m = c("JSResourceForInteraction")("MWV2ChatSeenHeadsDialog.react").__setRef("MWV2ChatSeenHeadsRow.react"),
        n = {
            heads: {
                display: "x78zum5",
                flexShrink: "x2lah0s",
                $$css: !0
            },
            img: {
                borderTopStartRadius: "x14yjl9h",
                borderTopEndRadius: "xudhj91",
                borderBottomEndRadius: "x18nykt9",
                borderBottomStartRadius: "xww2gxu",
                height: "x1v9usgg",
                paddingEnd: "x19um543",
                paddingStart: "x1m6msm",
                verticalAlign: "xxymvpz",
                width: "x6jxa94",
                $$css: !0
            },
            mask: {
                backgroundColor: "xcrg951",
                $$css: !0
            },
            overflow: {
                backgroundColor: "x1qhmfi1",
                borderTopStartRadius: "x1lq5wgf",
                borderTopEndRadius: "xgqcy7u",
                borderBottomEndRadius: "x30kzoy",
                borderBottomStartRadius: "x9jhf4c",
                color: "xi81zsa",
                fontSize: "x1ncwhqj",
                fontWeight: "x117nqv4",
                lineHeight: "x1hkbg2g",
                marginTop: "xdj266r",
                marginEnd: "x11i5rnm",
                marginBottom: "xat24cr",
                marginStart: "x1mh8g0r",
                paddingTop: "xexx8yu",
                paddingEnd: "x150jy0e",
                paddingBottom: "x18d9i69",
                paddingStart: "x1e558r4",
                textAlign: "x2b8uid",
                $$css: !0
            },
            root: {
                display: "x78zum5",
                paddingBottom: "x1120s5i",
                $$css: !0
            },
            spacer: {
                flexBasis: "x1r8uery",
                flexGrow: "x1iyjqo2",
                $$css: !0
            }
        };

    function o(a, b, d, e) {
        if (!d) return [];
        d = Math.max(Math.floor(b - 9), 0);
        a = a.slice(d, b);
        var f = "\n" + h._("__JHASH__8_D_WS90lqj__JHASH__", [h._param("Number of additional views", d, [0])]);
        a = i.jsxs("ul", {
            children: [a.reverse().map(function(a, b) {
                return i.jsx("li", {
                    children: a.name
                }, String(b))
            }), d > 0 ? i.jsx("li", {
                children: f
            }, "overflow") : null]
        });
        return [i.jsx(c("MWXTooltip.react"), {
            align: e === "Inbox" ? "middle" : "end",
            forceInlineDisplay: !0,
            position: "above",
            tooltip: a,
            children: i.jsx("span", {
                className: "x1qhmfi1 x1lq5wgf xgqcy7u x30kzoy x9jhf4c xi81zsa x1ncwhqj x117nqv4 x1hkbg2g xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x150jy0e x18d9i69 x1e558r4 x2b8uid",
                children: h._("__JHASH__hpZlVXKj1CE__JHASH__", [h._param("the number of additional viewers", b, [0])])
            })
        }, "overflow")]
    }

    function p(a) {
        var b = a.displayContext,
            e = a.index;
        a = a.user;
        var f = a.timestamp > 0 ? h._("__JHASH__i65FoHjBJBT__JHASH__", [h._name("full name", a.name, c("getFBTSafeGenderFromGenderConst")(a.gender)), h._param("seen time", d("MercuryTimestamp").getPreciseTimestamp(a.timestamp))]) : h._("__JHASH__o0y2JESDXU1__JHASH__", [h._name("full name", a.name, c("getFBTSafeGenderFromGenderConst")(a.gender))]);
        return i.jsx(c("MWXTooltip.react"), {
            align: b === "Inbox" ? "middle" : "end",
            forceInlineDisplay: !0,
            position: "above",
            tooltip: f,
            children: a.imageSrc === "" ? i.jsx(c("MDSGlimmer.react"), {
                index: e,
                xstyle: n.img
            }) : i.jsx(c("CometImage.react"), {
                alt: f,
                src: a.imageSrc,
                xstyle: n.img
            })
        })
    }
    p.displayName = p.name + " [from " + f.id + "]";

    function q(a, b) {
        var c = a.length,
            d = c > l;
        c = Math.max(Math.floor(c - (d ? l - 1 : l)), 0);
        var e = a.slice(c);
        return [].concat(o(a, c, d, b), e.map(function(a, c) {
            return i.jsx(p, {
                displayContext: b,
                index: c,
                user: a
            }, a.id)
        }))
    }

    function a(a) {
        var b = a.messageSeenBy,
            e = a.xstyle;
        a = d("MWPThreadTheme.bs").useHook();
        var f = j(d("MWV2MessageRowIsRowFocusedContext.bs").context),
            g = f.setFocused,
            l = f.setIsDialogOpened,
            o = b.length,
            p = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext(),
            r = k(null);
        return i.jsxs("div", {
            className: c("stylex")(n.root, d("MWPThreadTheme.bs").isGradient(a) ? n.mask : !1),
            role: "none",
            children: [i.jsx("div", {
                className: "x1r8uery x1iyjqo2"
            }), i.jsx(c("CometLazyDialogTrigger.react"), {
                dialogProps: {
                    messageSeenBy: b,
                    onClose: function() {}
                },
                dialogResource: m,
                onHide: function() {
                    l(function() {
                        return !1
                    }), g(function() {
                        return !0
                    })
                },
                children: function(a) {
                    return i.jsx(c("CometPressable.react"), {
                        "aria-label": h._("__JHASH__JhvMDLpCFuF__JHASH__", [h._param("number of participants who have seen this message", String(o))]).toString(),
                        onPress: function() {
                            l(function() {
                                return !0
                            }), a()
                        },
                        overlayDisabled: !0,
                        ref: r,
                        xstyle: function() {
                            return [n.heads, e]
                        },
                        children: i.jsx(c("MWXTooltipGroup.react"), {
                            children: q(b, p)
                        })
                    })
                }
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWV2MessageEndOfGroupContentTextOnly.react", ["fbt", "MWMessageDeliveryStatus", "MWStatusText.react", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            statusText: {
                paddingBottom: "xwib8y2",
                paddingTop: "x1iorvi4",
                $$css: !0
            }
        };

    function k(a) {
        var b = a.alignLeft,
            d = a.enableSeenInfo;
        a = a.num;
        return !d ? i.jsx(i.Fragment, {}) : i.jsx(c("MWStatusText.react"), {
            alignLeft: b,
            text: h._("__JHASH__SlWkB_YFGR6__JHASH__", [h._param("seenByNumber", String(a))]).toString(),
            xstyle: j.statusText
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.alignLeft,
            e = a.enableSeenInfo;
        e = e === void 0 ? !0 : e;
        a = a.status;
        var f = d("MWMessageDeliveryStatus").getBroadcastStatusTitle(a);
        switch (a.type) {
            case "NoneStatus":
                return null;
            case "Error":
                return i.jsx(c("MWStatusText.react"), {
                    error: !0,
                    text: f.toString(),
                    xstyle: j.statusText
                });
            case "SingleSeenHead":
                return i.jsx(k, {
                    enableSeenInfo: e,
                    num: 1
                });
            case "MultipleSeenHeads":
            case "DeliveredAndRead":
                break;
            case "SeenCount":
                return i.jsx(k, {
                    alignLeft: b,
                    enableSeenInfo: e,
                    num: a.count
                });
            case "Loading":
                return i.jsx(c("MWStatusText.react"), {
                    alignLeft: b,
                    text: f.toString(),
                    xstyle: j.statusText
                });
            case "RetriableError":
                return i.jsx(c("MWStatusText.react"), {
                    alignLeft: b,
                    error: !0,
                    text: f.toString(),
                    xstyle: j.statusText
                });
            default:
                return i.jsx(c("MWStatusText.react"), {
                    text: f.toString(),
                    xstyle: j.statusText
                })
        }
        return i.jsx(k, {
            enableSeenInfo: e,
            num: a.heads.length
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWV2MessageEndOfGroupContent.react", ["MWMessageDeliveryStatus", "MWPMessageListColumn.react", "MWV2ChatSeenHeadsRow.react", "MWV2MessageEndOfGroupContentTextOnly.react", "cr:5836", "cr:5837", "cr:7033", "cr:7034", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            baseStyle: {
                marginEnd: "x1emribx",
                marginTop: "x1gslohp",
                $$css: !0
            },
            lastMessage: {
                marginBottom: "x12nagc",
                $$css: !0
            },
            nonLastMessage: {
                marginBottom: "xod5an3",
                $$css: !0
            },
            seenHeads: {
                marginTop: "x1gslohp",
                marginEnd: "xw3qccf",
                marginBottom: "xjpr12u",
                marginStart: "x1mh8g0r",
                $$css: !0
            }
        };

    function a(a) {
        var e = a.alignLeft,
            f = a.enableSeenInfo;
        f = f === void 0 ? !0 : f;
        var g = a.hasTextBasedMessageReceipts,
            j = a.isLastMessage,
            k = a.isOutgoing,
            l = a.isTextOnly,
            m = a.message;
        a = a.status;
        if (l === !0) return h.jsx(c("MWV2MessageEndOfGroupContentTextOnly.react"), {
            alignLeft: e,
            enableSeenInfo: f,
            status: a
        });
        if (a.type === "MultipleSeenHeads") return h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnShrinkwrap, {
            children: h.jsx(c("MWV2ChatSeenHeadsRow.react"), {
                messageSeenBy: a.heads,
                xstyle: [i.seenHeads, g && (j ? i.lastMessage : i.nonLastMessage), g && i.baseStyle]
            })
        });
        if (g && a.type === "SingleSeenHead" && b("cr:7033") != null) return h.jsx(b("cr:7033"), {
            head: a.head,
            text: d("MWMessageDeliveryStatus").getSingleSeenHead(a.head),
            xstyle: [j ? i.lastMessage : i.nonLastMessage, i.baseStyle]
        });
        if (g && a.type === "SingleSeenHead" && b("cr:5836") != null) return h.jsx(b("cr:5836"), {
            head: a.head,
            text: d("MWMessageDeliveryStatus").getSingleSeenHead(a.head),
            xstyle: [j ? i.lastMessage : i.nonLastMessage, i.baseStyle]
        });
        if (k && g && b("cr:7034") != null) return h.jsx(b("cr:7034"), {
            alignLeft: e,
            isLastMessage: j,
            message: m,
            status: a,
            xstyle: [j ? i.lastMessage : i.nonLastMessage, i.baseStyle]
        });
        return k && g && b("cr:5837") != null ? h.jsx(b("cr:5837"), {
            alignLeft: e,
            isLastMessage: j,
            message: m,
            status: a,
            xstyle: [j ? i.lastMessage : i.nonLastMessage, i.baseStyle]
        }) : null
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g.MWV2MessageEndOfGroupContent = a
}), 98);
__d("useMWUIPaymentDetailsDialog", ["FBPayHubTransactionDetailDialog.entrypoint", "useCometEntryPointDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        return c("useCometEntryPointDialog")(c("FBPayHubTransactionDetailDialog.entrypoint"), {
            transactionID: a
        })
    }
    g["default"] = a
}), 98);
__d("MWLSShowPaymentDetails.bs", ["fbt", "LSIntEnum", "MWLSDatabaseLazySync.bs", "promiseDone", "react", "useMWUIPaymentDetailsDialog"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    b = d("react");
    var i = b.useEffect,
        j = b.useMemo,
        k = b.useState;

    function a() {
        var a = k(null),
            b = a[0],
            e = a[1];
        a = k(!1);
        var f = a[0],
            g = a[1];
        a = c("useMWUIPaymentDetailsDialog")(b);
        var l = a[0],
            m = d("MWLSDatabaseLazySync.bs").useSync(d("LSIntEnum").ofNumber(15));
        i(function() {
            b != null && f && l({
                title: h._("__JHASH__gOv13cta-Bn__JHASH__"),
                transactionID: b
            }, function() {
                return g(!1)
            })
        }, [b, f, l]);
        return j(function() {
            return function(a) {
                c("promiseDone")(m());
                g(function() {
                    return !0
                });
                return e(function() {
                    return a
                })
            }
        }, [g, e, m])
    }
    g.useHook = a
}), 98);
__d("MWP2PPaymentMethodAdd.bs", ["JSResourceForInteraction", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo;

    function a() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatComposerP2PPaymentMethodAddDialog.react").__setRef("MWP2PPaymentMethodAdd.bs")),
            b = a[0];
        return h(function() {
            return function(a, c) {
                a = a != null ? a : function() {};
                return b({
                    id: c.id
                }, a)
            }
        }, [b])
    }
    g.useP2PPaymentMethodAdd = a
}), 98);
__d("MWP2PPaymentRequestCancel.bs", ["JSResourceForInteraction", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo;

    function a() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatComposerP2PPaymentRequestCancelDialog.react").__setRef("MWP2PPaymentRequestCancel.bs")),
            b = a[0];
        return h(function() {
            return function(a, c) {
                a = a != null ? a : function() {};
                return b({
                    id: c.id
                }, a)
            }
        }, [b])
    }
    g.useP2PPaymentRequestCancel = a
}), 98);
__d("MWP2PPaymentRequestConfirm.bs", ["JSResourceForInteraction", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo;

    function a() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatComposerP2PPaymentRequestConfirmDialog.react").__setRef("MWP2PPaymentRequestConfirm.bs")),
            b = a[0];
        return h(function() {
            return function(a, c) {
                a = a != null ? a : function() {};
                return b({
                    id: c.id
                }, a)
            }
        }, [b])
    }
    g.useP2PPaymentRequestConfirm = a
}), 98);
__d("MWP2PPaymentRequestDecline.bs", ["JSResourceForInteraction", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo;

    function a() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatComposerP2PPaymentRequestDeclineDialog.react").__setRef("MWP2PPaymentRequestDecline.bs")),
            b = a[0];
        return h(function() {
            return function(a, c) {
                a = a != null ? a : function() {};
                return b({
                    id: c.id
                }, a)
            }
        }, [b])
    }
    g.useP2PPaymentRequestDecline = a
}), 98);
__d("MWP2PPaymentTransactionDecline.bs", ["JSResourceForInteraction", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo;

    function a() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatComposerP2PPaymentTransactionDeclineDialog.react").__setRef("MWP2PPaymentTransactionDecline.bs")),
            b = a[0];
        return h(function() {
            return function(a, c) {
                a = a != null ? a : function() {};
                return b({
                    id: c.id
                }, a)
            }
        }, [b])
    }
    g.useP2PPaymentTransactionDecline = a
}), 98);
__d("MWP2PPaymentTransactionInformationVerify.bs", ["JSResourceForInteraction", "XP2PVerificationDialogBaseControllerRouteBuilder", "gkx", "nullthrows", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("CometCompatModal.react").__setRef("MWP2PPaymentTransactionInformationVerify.bs")),
            b = a[0];
        a = c("useCometLazyDialog")(c("JSResourceForInteraction")("CometP2PPaymentIDVFlow.react").__setRef("MWP2PPaymentTransactionInformationVerify.bs"));
        var d = a[0];
        return h(function(a) {
            a = a.id;
            if (c("gkx")("94")) return d({
                transferId: c("nullthrows")(a)
            }, function() {});
            else return b({
                params: {
                    rel: "dialog-post",
                    uri: c("XP2PVerificationDialogBaseControllerRouteBuilder").buildURL({
                        id: c("nullthrows")(a),
                        is_sender_flow: !1
                    })
                }
            }, function() {})
        }, [b])
    }
    g.useP2PPaymentTransactionInformationVerify = a
}), 98);
__d("useMWUIAttachBankSlipDialog", ["P2MAttachBankSlipDialog.entrypoint", "useCometEntryPointDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        return c("useCometEntryPointDialog")(c("P2MAttachBankSlipDialog.entrypoint"), {
            orderID: a
        })
    }
    g["default"] = a
}), 98);
__d("MWLSShowAttachBankSlip.bs", ["react", "useMWUIAttachBankSlipDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useEffect,
        i = b.useMemo,
        j = b.useState;

    function a() {
        var a = j(null),
            b = a[0],
            d = a[1];
        a = j(!1);
        var e = a[0],
            f = a[1];
        a = c("useMWUIAttachBankSlipDialog")(b);
        var g = a[0];
        h(function() {
            b != null && e && g({
                orderID: b
            }, function() {
                return f(!1)
            })
        }, [b, e, g]);
        return i(function() {
            return function(a) {
                f(function() {
                    return !0
                });
                return d(function() {
                    return a
                })
            }
        }, [f, d])
    }
    g.useHook = a
}), 98);
__d("useMWUIOrderDetailsDialog", ["P2MOrderDetailDialog.entrypoint", "useCometEntryPointDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        return c("useCometEntryPointDialog")(c("P2MOrderDetailDialog.entrypoint"), {
            orderID: a
        })
    }
    g["default"] = a
}), 98);
__d("MWLSShowOrderDetails.bs", ["react", "useMWUIOrderDetailsDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useEffect,
        i = b.useMemo,
        j = b.useState;

    function a() {
        var a = j(null),
            b = a[0],
            d = a[1];
        a = j(!1);
        var e = a[0],
            f = a[1];
        a = c("useMWUIOrderDetailsDialog")(b);
        var g = a[0];
        h(function() {
            b != null && e && g({
                orderID: b
            }, function() {
                return f(!1)
            })
        }, [b, e, g]);
        return i(function() {
            return function(a) {
                f(function() {
                    return !0
                });
                return d(function() {
                    return a
                })
            }
        }, [f, d])
    }
    g.useHook = a
}), 98);
__d("useMWUICheckoutDialog", ["FBP2MCheckoutDialog.entrypoint", "useCometEntryPointDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a, b) {
        return c("useCometEntryPointDialog")(c("FBP2MCheckoutDialog.entrypoint"), {
            orderID: a,
            pageID: b
        })
    }
    g["default"] = a
}), 98);
__d("MWLSShowCheckout.bs", ["react", "useMWUICheckoutDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useEffect,
        i = b.useMemo,
        j = b.useState;

    function a() {
        var a = j(null),
            b = a[0],
            d = a[1];
        a = j("");
        var e = a[0],
            f = a[1];
        a = j(!1);
        var g = a[0],
            k = a[1];
        a = c("useMWUICheckoutDialog")(b);
        var l = a[0];
        h(function() {
            b != null && g && l({
                orderID: b,
                pageID: e
            }, function() {
                return k(!1)
            })
        }, [b, e, g, l]);
        return i(function() {
            return function(a, b) {
                k(function() {
                    return !0
                });
                d(function() {
                    return a
                });
                return f(function() {
                    return b
                })
            }
        }, [k, d])
    }
    g.useHook = a
}), 98);
__d("useMWUIOffsiteBankTransferDialog", ["P2MOffsiteBankTransferDialog.entrypoint", "useCometEntryPointDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        return c("useCometEntryPointDialog")(c("P2MOffsiteBankTransferDialog.entrypoint"), {
            orderID: a
        })
    }
    g["default"] = a
}), 98);
__d("MWLSShowOffsiteBankTransfer.bs", ["react", "useMWUIOffsiteBankTransferDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useEffect,
        i = b.useMemo,
        j = b.useState;

    function a() {
        var a = j(null),
            b = a[0],
            d = a[1];
        a = j(!1);
        var e = a[0],
            f = a[1];
        a = c("useMWUIOffsiteBankTransferDialog")(b);
        var g = a[0];
        h(function() {
            b != null && e && g({
                orderID: b
            }, function() {
                return f(!1)
            })
        }, [b, e, g]);
        return i(function() {
            return function(a) {
                f(function() {
                    return !0
                });
                return d(function() {
                    return a
                })
            }
        }, [f, d])
    }
    g.useHook = a
}), 98);
__d("MWChatPIIFormNuxQuery", ["CometRelay", "MWChatPIIFormNuxQuery.graphql", "PiiActionFlowFalcoEvent", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h, i = function(a, b, e, f) {
            a = d("CometRelay").fetchQuery(a, j, {}).toPromise().then(function(a) {
                a && (c("PiiActionFlowFalcoEvent").log(function() {
                    return {
                        event_name: "pii_initial_query_success",
                        extra_data: "",
                        form_id: b,
                        page_id: e
                    }
                }), a.messenger_pii_nux == null ? f({
                    description: "",
                    seen: !0,
                    title: "",
                    url: "",
                    url_text: ""
                }) : f({
                    description: a.messenger_pii_nux.description,
                    seen: !1,
                    title: a.messenger_pii_nux.title,
                    url: a.messenger_pii_nux.url,
                    url_text: a.messenger_pii_nux.url_text
                }))
            }, function(a) {
                c("PiiActionFlowFalcoEvent").log(function() {
                    return {
                        event_name: "pii_initial_query_failure",
                        extra_data: a.message,
                        form_id: b,
                        page_id: e
                    }
                })
            });
            c("promiseDone")(a)
        },
        j = h !== void 0 ? h : h = b("MWChatPIIFormNuxQuery.graphql");
    a = function(a, b, c, d) {
        i(a, b, c, function(a) {
            return d(a)
        })
    };
    g.fetch = a
}), 98);
__d("MWChatPIIFormStateQuery", ["CometRelay", "MWChatPIIFormStateQuery.graphql", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h, i = function(a, b, e) {
            b = d("CometRelay").fetchQuery(b, j, {
                formID: a
            }).toPromise().then(function(a) {
                a && e(a.messenger_pii_form_state.state)
            });
            c("promiseDone")(b)
        },
        j = h !== void 0 ? h : h = b("MWChatPIIFormStateQuery.graphql");
    a = function(a, b, c) {
        i(a, b, function(a) {
            return c(a)
        })
    };
    g.fetch = a
}), 98);
__d("MWChatReceiptDataQuery", ["CometRelay", "CometRelayEnvironment", "MWChatReceiptDataQuery.graphql", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h;
    a = function(a, b, e) {
        c("promiseDone")(d("CometRelay").fetchQuery(c("CometRelayEnvironment"), i, {
            messageID: b,
            receiptID: a
        }).toPromise().then(function(a) {
            if ((a == null ? void 0 : a.receipt_data) != null) {
                a = a.receipt_data;
                var b = a.items ? a.items.map(function(a) {
                        return {
                            description: a.description,
                            name: a.name,
                            price: a.price,
                            quantity: a.quantity,
                            thumb_url: a.thumb_url
                        }
                    }) : [],
                    c = a.adjustments ? a.adjustments.map(function(a) {
                        return {
                            adjustment_type: a.adjustment_type,
                            display_adjustment_amount: a.display_adjustment_amount
                        }
                    }) : [];
                e({
                    address_line_1: a.address_line_1,
                    address_line_2: a.address_line_2,
                    address_line_3: a.address_line_3,
                    adjustments: c,
                    cancellation_url: a.cancellation_url,
                    items: b,
                    merchant_name: a.merchant_name,
                    order_id: a.order_id,
                    order_time: a.order_time,
                    order_url: a.order_url,
                    payment_method: a.payment_method,
                    recipient_name: a.recipient_name,
                    shipping_cost: a.shipping_cost,
                    subtotal: a.subtotal,
                    total_cost: a.total_cost,
                    total_tax: a.total_tax
                })
            }
        }))
    };
    var i = h !== void 0 ? h : h = b("MWChatReceiptDataQuery.graphql");
    g.fetch = a
}), 98);
__d("MWRollCallTimerPill.react", ["fbt", "I64", "MDSText.react", "react", "useInterval"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    b = d("react");
    var j = b.useMemo,
        k = b.useState;

    function l(a) {
        var b = 1e3,
            c = b * 60,
            d = c * 60,
            e = d * 24;
        a = a;
        var f = Math.floor(a / e);
        a -= f * e;
        e = Math.floor(a / d);
        a -= e * d;
        d = Math.floor(a / c);
        a -= d * c;
        c = Math.floor(a / b);
        a -= c * b;
        return {
            days: f,
            hours: e,
            minutes: d,
            seconds: c
        }
    }

    function a(a) {
        var b = a.attachment;
        a = j(function() {
            var a;
            return d("I64").to_float((a = b.countdownTimestampMs) != null ? a : d("I64").zero)
        }, [b.countdownTimestampMs]);
        var e = k(Date.now()),
            f = e[0],
            g = e[1];
        e = f > a;
        c("useInterval")(function() {
            g(Date.now())
        }, e ? 6e4 : 1e3, [g]);
        if (!e) {
            e = l(a - f);
            var m = e.minutes;
            e = e.seconds;
            m = ("0" + m).slice(-2) + ":" + ("0" + e).slice(-2)
        } else if (b.cta1Type === "xma_roll_call_open_viewer") m = h._("__JHASH__iEcmesFoHMR__JHASH__");
        else {
            e = l(f - a);
            f = e.days;
            a = e.hours;
            e = e.minutes;
            f > 30 ? m = h._("__JHASH__FgpGUEY9N0G__JHASH__") : f > 0 ? m = h._("__JHASH__UZjF4IaHC-f__JHASH__", [h._param("days", f)]) : a > 0 ? m = h._("__JHASH__4LZO7x78s0P__JHASH__", [h._param("hours", a)]) : m = h._("__JHASH__JXYYWJwIx9x__JHASH__", [h._param("minutes", Math.max(1, e))])
        }
        return i.jsx("div", {
            className: "x1h0vfkc x1a2cdl4 xnhgr82 x1qt0ttw xgk8upj x9f619 x78zum5 xdt5ytf x1qx5ct2 xl56j7k xkrivgy x1gryazu x1sxyh0 xurb0ha xeq5yr9",
            children: i.jsx(c("MDSText.react"), {
                numberOfLines: 1,
                type: "meta4",
                children: m
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWRollcallXMAAttachmentItemImage.react", ["CometBlurredBackgroundImage.react", "CometImageCover.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            blurredCard: {
                backgroundColor: "x1jx94hy",
                $$css: !0
            },
            rollCallCard: {
                borderTopStartRadius: "xfh8nwu",
                borderTopEndRadius: "xoqspk4",
                borderBottomEndRadius: "x12v9rci",
                borderBottomStartRadius: "x138vmkv",
                filter: "xa5fk4t",
                height: "x1xx6w2s",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                width: "xq1dxzn",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.previewUrl;
        a = a.shouldBlur;
        return h.jsx("div", {
            className: "xfh8nwu xoqspk4 x12v9rci x138vmkv xa5fk4t x1xx6w2s x6ikm8r x10wlt62 xq1dxzn",
            children: a ? h.jsx(c("CometBlurredBackgroundImage.react"), {
                src: b,
                xstyle: i.blurredCard
            }) : h.jsx(c("CometImageCover.react"), {
                alt: "",
                src: b,
                style: {
                    bottom: "0",
                    left: "0",
                    position: "absolute",
                    right: "0",
                    top: "0"
                }
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWMessageDeliveryStatusIcons", ["cr:151"], (function(a, b, c, d, e, f, g) {
    "use strict";
    g["default"] = b("cr:151")
}), 98);
__d("MWChatGutterItem.bs", ["MWChatSingleSeenHead.react", "MWLSThreadDisplayContext", "MWMessageDeliveryStatus", "MWMessageDeliveryStatusIcons", "MWTheme.react", "MWXTooltip.react", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            icon: {
                display: "x78zum5",
                flexShrink: "x2lah0s",
                height: "x1v9usgg",
                marginEnd: "xw3qccf",
                marginStart: "xsgj6o6",
                userSelect: "x87ps6o",
                verticalAlign: "x11njtxf",
                width: "x6jxa94",
                $$css: !0
            },
            incoming: {
                flexDirection: "x15zctf7",
                $$css: !0
            },
            mask: {
                backgroundColor: "xcrg951",
                $$css: !0
            },
            noneStatus: {
                flexShrink: "x2lah0s",
                width: "x17z2i9w",
                $$css: !0
            },
            root: {
                alignItems: "xuk3077",
                display: "x78zum5",
                $$css: !0
            },
            singleSeenHead: {
                marginEnd: "xw3qccf",
                marginStart: "xsgj6o6",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.errorMessage,
            e = a.status,
            f = a.incoming,
            g = a.hasRepliedToMessage,
            j = a.id;
        f = f != null ? f : !1;
        g = g != null ? g : !1;
        a = (a = a.xstyle) != null ? a : !1;
        j = j != null ? j : "";
        var k = d("MWTheme.react").useTheme();
        k = d("MWTheme.react").isGradient(k);
        var l = d("MWMessageDeliveryStatus").getStatusTitle(e),
            m = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        b = e.type === "Error" && b != null ? b : l;
        var n;
        switch (e.type) {
            case "NoneStatus":
                n = h.jsx("div", {
                    className: "x2lah0s x17z2i9w"
                });
                break;
            case "SingleSeenHead":
                n = h.jsx(c("MWChatSingleSeenHead.react"), {
                    altText: l,
                    head: e.head,
                    xstyle: i.singleSeenHead
                });
                break;
            case "DeliveredAndRead":
                n = h.jsx(c("MWMessageDeliveryStatusIcons").DeliveredAndReadIcon, {
                    size: 12,
                    xstyle: i.icon
                });
                break;
            case "MultipleSeenHeads":
            case "SeenCount":
            case "Loading":
            case "RetriableError":
                n = null;
                break;
            default:
                var o;
                switch (e.type) {
                    case "Sending":
                        o = h.jsx(c("MWMessageDeliveryStatusIcons").SendingIcon, {
                            size: 12,
                            xstyle: i.icon
                        });
                        break;
                    case "Sent":
                        o = h.jsx(c("MWMessageDeliveryStatusIcons").SentIcon, {
                            size: 12,
                            xstyle: i.icon
                        });
                        break;
                    case "Delivered":
                        o = h.jsx(c("MWMessageDeliveryStatusIcons").DeliveredIcon, {
                            size: 12,
                            xstyle: i.icon
                        });
                        break;
                    case "Error":
                        o = h.jsx(c("MWMessageDeliveryStatusIcons").ErrorIcon, {
                            size: 12,
                            title: b.toString(),
                            xstyle: i.icon
                        });
                        break;
                    default:
                        o = null
                }
                n = h.jsx("div", {
                    children: o
                })
        }
        l = b !== "" ? h.jsx(c("MWXTooltip.react"), {
            align: function() {
                switch (m === "Inbox" ? "middle" : "end_") {
                    case "start":
                        return "start";
                    case "middle":
                        return "middle";
                    case "end_":
                        return "end";
                    case "stretch":
                        return "stretch"
                }
            }(),
            position: "above",
            tooltip: b,
            children: n
        }) : n;
        return h.jsx("div", {
            className: c("stylex")(i.root, k && !g ? i.mask : !1, f ? i.incoming : !1, a),
            "data-testid": void 0,
            id: j,
            role: "none",
            children: l
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWLSOpenStaticLocationDialog.react", ["I64", "JSResourceForInteraction", "MWThreadKey.react", "Promise", "ReQL.bs", "ReQLSuspense", "promiseDone", "react", "useCometLazyDialog", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a() {
        var a = c("useReStore")(),
            e = d("MWThreadKey.react").useMWThreadKeyMemoizedExn(),
            g = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatStaticLocationDialog.react").__setRef("MWLSOpenStaticLocationDialog.react")),
            i = g[0];
        return h(function(g) {
            g = d("ReQL.bs").first(d("ReQL.bs").map(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(a.table("attachments")), {
                hd: e,
                tl: {
                    hd: g,
                    tl: 0
                }
            }), function(b) {
                b = b.defaultCtaId;
                b = b != null ? b : d("I64").zero;
                b = d("ReQLSuspense").first(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(a.table("attachment_ctas")), {
                    hd: b,
                    tl: 0
                }), f.id + ":48");
                if (b != null) return b.nativeUrl
            }), f.id + ":32").then(function(a) {
                a = (a = a) != null ? a : "";
                a = a.split(",");
                var c = a[0];
                a = a[1];
                i({
                    latitude: c,
                    longitude: a
                }, function() {});
                return b("Promise").resolve()
            });
            c("promiseDone")(g)
        }, [a, e, i])
    }
    g.useHook = a
}), 98);
__d("useMWUIMemberRequestDialog", ["GroupsCometAdminActivityLogItemSeeDetailsDialog.entrypoint", "GroupsCometAdmodChatsReviewDialog.entrypoint", "WebPixelRatio", "useCometEntryPointDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a, b, e, f) {
        a = c("useCometEntryPointDialog")(c("GroupsCometAdminActivityLogItemSeeDetailsDialog.entrypoint"), {
            routeProps: {
                adminActivityID: f,
                groupID: b,
                isManagementActivityLogTargetProfilePlus: !1
            }
        });
        b = c("useCometEntryPointDialog")(c("GroupsCometAdmodChatsReviewDialog.entrypoint"), {
            groupID: b,
            profileID: e,
            scale: d("WebPixelRatio").get()
        });
        return f != null && f !== "0" ? a : b
    }
    g["default"] = a
}), 98);
__d("MWLSShowMemberRequest.bs", ["react", "useMWUIMemberRequestDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useEffect,
        i = b.useMemo,
        j = b.useState;

    function a() {
        var a = j(null),
            b = a[0],
            d = a[1];
        a = j("");
        var e = a[0],
            f = a[1];
        a = j("");
        var g = a[0],
            k = a[1];
        a = j("");
        var l = a[0],
            m = a[1];
        a = j(!1);
        var n = a[0],
            o = a[1];
        a = c("useMWUIMemberRequestDialog")(b, e, g, l);
        var p = a[0];
        h(function() {
            b != null && n && p({
                activityLogTarget: "Group",
                groupID: e
            }, function() {
                return o(!1)
            })
        }, [b, n]);
        return i(function() {
            return function(a, b, c, e) {
                o(!0);
                d(a);
                f(b);
                k(c);
                return m(e)
            }
        }, [o, d])
    }
    g.useHook = a
}), 98);
__d("useMWUIPendingPostDialog", ["GroupsCometAdminActivityLogItemSeeDetailsDialog.entrypoint", "GroupsCometAdmodChatsPendingPostReviewDialog.entrypoint", "WebPixelRatio", "useCometEntryPointDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a, b, e, f, g) {
        a = c("useCometEntryPointDialog")(c("GroupsCometAdminActivityLogItemSeeDetailsDialog.entrypoint"), {
            routeProps: {
                adminActivityID: g,
                groupID: b,
                isManagementActivityLogTargetProfilePlus: !1
            }
        });
        e = c("useCometEntryPointDialog")(c("GroupsCometAdmodChatsPendingPostReviewDialog.entrypoint"), {
            authorID: e,
            groupID: b,
            postID: f,
            scale: d("WebPixelRatio").get()
        });
        return g != null && g !== "0" ? a : e
    }
    g["default"] = a
}), 98);
__d("MWLSShowPendingPost.bs", ["react", "useMWUIPendingPostDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useEffect,
        i = b.useMemo,
        j = b.useState;

    function a() {
        var a = j(null),
            b = a[0],
            d = a[1];
        a = j("");
        var e = a[0],
            f = a[1];
        a = j("");
        var g = a[0],
            k = a[1];
        a = j("");
        var l = a[0],
            m = a[1];
        a = j("");
        var n = a[0],
            o = a[1];
        a = j(!1);
        var p = a[0],
            q = a[1];
        a = c("useMWUIPendingPostDialog")(b, e, g, l, n);
        var r = a[0];
        h(function() {
            b != null && p && r({
                activityLogTarget: "Group",
                groupID: e
            }, function() {
                return q(!1)
            })
        }, [b, p]);
        return i(function() {
            return function(a, b, c, e, g) {
                q(!0);
                d(a);
                f(b);
                k(c);
                m(e);
                return o(g)
            }
        }, [q, d])
    }
    g.useHook = a
}), 98);
__d("useMWV2MediaViewerShowDialog", ["JSResourceForInteraction", "MWV2MediaViewerFallback.react", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useEffect;

    function j(a) {
        return h.jsx(c("MWV2MediaViewerFallback.react"), {
            onClose: a
        })
    }
    j.displayName = j.name + " [from " + f.id + "]";

    function a(a) {
        var b = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWV2MediaViewer.react").__setRef("useMWV2MediaViewerShowDialog"), j),
            d = b[0],
            e = b[1];
        i(function() {
            a || e()
        }, [e, a]);
        return [d, e]
    }
    g["default"] = a
}), 98);
__d("XCometMessengerMediaControllerRouteBuilder", ["jsRouteBuilder"], (function(a, b, c, d, e, f, g) {
    a = c("jsRouteBuilder")("/messenger_media/", Object.freeze({}), void 0);
    b = a;
    g["default"] = b
}), 98);
__d("XCometMessengerPhotoControllerRouteBuilder", ["jsRouteBuilder"], (function(a, b, c, d, e, f, g) {
    a = c("jsRouteBuilder")("/messenger_photo/", Object.freeze({}), void 0);
    b = a;
    g["default"] = b
}), 98);
__d("useMWV2MediaViewerURL", ["I64", "Int64Hooks", "LSIntEnum", "MessagingAttachmentType", "XCometMessengerMediaControllerRouteBuilder", "XCometMessengerPhotoControllerRouteBuilder"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        return d("Int64Hooks").useMemoInt64(function() {
            var b = d("I64").equal(a.attachmentType, d("LSIntEnum").ofNumber(c("MessagingAttachmentType").ANIMATED_IMAGE));
            return b ? c("XCometMessengerPhotoControllerRouteBuilder").buildURL({
                fbid: a.attachmentFbid,
                message_id: a.messageId,
                photo_ids: void 0
            }) : c("XCometMessengerMediaControllerRouteBuilder").buildURL({
                attachment_id: a.attachmentFbid,
                message_id: a.messageId,
                thread_id: d("I64").to_string(a.threadKey)
            })
        }, [a.threadKey, a.attachmentType, a.messageId, a.attachmentFbid])
    }
    g["default"] = a
}), 98);
__d("MWV2MessageTimestampTooltip.react", ["fbt", "I64", "Int64Hooks", "LSIntEnum", "MWMessageUnsentTimestampText.react", "MWXTooltip.react", "MercuryTimestamp", "cr:1654", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");

    function a(a) {
        var e = a.children,
            f = a.message,
            g = b("cr:1654") == null ? void 0 : b("cr:1654")(f.messageId);
        a = d("Int64Hooks").useMemoInt64(function() {
            var a = f.isUnsent,
                b = f.unsentTimestampMs;
            if (d("I64").equal(f.displayedContentTypes, d("LSIntEnum").ofNumber(65536))) return h._("__JHASH__OwAZycr4-8G__JHASH__");
            return b != null && a ? i.jsx(c("MWMessageUnsentTimestampText.react"), {
                timestampMs: f.timestampMs,
                unsentTimestampMs: b
            }) : i.jsxs("div", {
                children: [i.jsx("div", {
                    children: g != null && g > 0 ? "Send Latency: " + g.toString() + "ms" : null
                }), i.jsx("div", {
                    children: h._("__JHASH__GNnexJRNZQN__JHASH__", [h._param("time", d("MercuryTimestamp").getPreciseTimestamp(d("I64").to_float(f.timestampMs)))])
                })]
            })
        }, [f, g]);
        return i.jsx(c("MWXTooltip.react"), {
            align: "middle",
            position: "start",
            tooltip: a,
            children: e
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("CtmMultiPhotoCarouselMsgrMultiPhotoCarouselClickFalcoEvent", ["FalcoLoggerInternal", "getFalcoLogPolicy_DO_NOT_USE"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = c("getFalcoLogPolicy_DO_NOT_USE")("1746398");
    b = d("FalcoLoggerInternal").create("ctm_multi_photo_carousel_msgr_multi_photo_carousel_click", a);
    e = b;
    g["default"] = e
}), 98);
__d("MakeRoomRingbackCommon.bs", ["cr:9972"], (function(a, b, c, d, e, f, g) {
    "use strict";
    g.useHook = b("cr:9972").useHook
}), 98);
__d("useGetMWXMAMentorshipDialog", ["JSResourceForInteraction", "MentorshipMessengerLoggingUtils", "react", "recoverableViolation", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback,
        i = c("JSResourceForInteraction")("MentorshipLeaveSurveyDialog.react").__setRef("useGetMWXMAMentorshipDialog");

    function a() {
        var a = c("useCometLazyDialog")(i),
            b = a[0];
        return h(function(a) {
            var e = a.programID;
            if (e == null) {
                c("recoverableViolation")("programID cannot be null", "messenger_web_product");
                return
            }
            d("MentorshipMessengerLoggingUtils").logMessengerEvent({
                destContainer: "messenger_thread",
                destUnit: "leave_survey",
                displayName: "End Program",
                event: "click_unit",
                extraData: {
                    content_id: a.promptID,
                    prompt_type: "MENTORSHIP_MESSENGER_LEAVE_PROMPT"
                },
                programID: e,
                unit: "prompt_unit"
            });
            return b({
                programID: e
            })
        }, [b])
    }
    g["default"] = a
}), 98);
__d("useMWChatShowPIIForm", ["CometRelay", "JSResourceForInteraction", "MWChatPIIFormNuxQuery", "MWChatPIIFormScreenQuery", "MWChatPIIFormStateQuery", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback,
        i = c("JSResourceForInteraction")("MWChatPIIFormDialog.react").__setRef("useMWChatShowPIIForm");

    function a() {
        var a = c("useCometLazyDialog")(i),
            b = a[0],
            e = d("CometRelay").useRelayEnvironment();
        return h(function(a) {
            var c = a.pageId,
                f = a.color,
                g = a.numScreens,
                h = a.currentIndex,
                i = a.formId,
                j = a.firstScreen;
            d("MWChatPIIFormStateQuery").fetch(i, e, function(a) {
                d("MWChatPIIFormNuxQuery").fetch(e, i, c, function(k) {
                    if (g > 1) {
                        d("MWChatPIIFormScreenQuery").fetch(i, c, 1, e, function(d) {
                            return b({
                                color: f,
                                ctaType: null,
                                currentIndex: h,
                                firstScreen: j,
                                formId: i,
                                numScreens: g,
                                nuxData: k,
                                pageId: c,
                                secondScreen: (d = d) != null ? d : void 0,
                                state: a
                            })
                        });
                        return
                    } else return b({
                        color: f,
                        ctaType: null,
                        currentIndex: h,
                        firstScreen: j,
                        formId: i,
                        numScreens: g,
                        nuxData: k,
                        pageId: c,
                        secondScreen: void 0,
                        state: a
                    })
                })
            })
        }, [e, b])
    }
    g["default"] = a
}), 98);
__d("MWChatXmaThirdPartyActionHandler.bs", ["fbt", "CometMarketplaceCreateDiscountedPriceDialog.entrypoint", "CometRelay", "CtmMultiPhotoCarouselMsgrMultiPhotoCarouselClickFalcoEvent", "JSResourceForInteraction", "MWChatCustomerFeedbackFormDataQuery", "MWChatCustomerFeedbackStateQuery", "MWChatPIIFormScreenQuery", "MWChatPIIFormStateQuery", "MWChatReceiptDataQuery", "MWLSOpenStaticLocationDialog.react", "MWLSShowAttachBankSlip.bs", "MWLSShowCheckout.bs", "MWLSShowMemberRequest.bs", "MWLSShowOffsiteBankTransfer.bs", "MWLSShowOrderDetails.bs", "MWLSShowPaymentDetails.bs", "MWLSShowPendingPost.bs", "MWP2PPaymentMethodAdd.bs", "MWP2PPaymentRequestCancel.bs", "MWP2PPaymentRequestConfirm.bs", "MWP2PPaymentRequestDecline.bs", "MWP2PPaymentTransactionDecline.bs", "MWP2PPaymentTransactionInformationVerify.bs", "MakeRoomRingbackCommon.bs", "MarketplaceCometReviewOffersDialog.entrypoint", "Popup", "cometPushToast", "commitWorkplaceChatBotSubmitFeedbackMutation", "cr:11076", "emptyFunction", "promiseDone", "react", "requireDeferred", "useCometDynamicEntryPointDialog", "useCometLazyDialog", "useGetMWXMAMentorshipDialog", "useMWChatShowPIIForm", "useMWLSMarketplaceXmaCtaHandler"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react").useCallback,
        j = c("requireDeferred")("ZenonUserActionLoggerCommon").__setRef("MWChatXmaThirdPartyActionHandler.bs");

    function k() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatReceiptModal.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            var c = a.receiptId;
            if (c != null) {
                d("MWChatReceiptDataQuery").fetch(c, a.messageId, function(a) {
                    var c = h._("__JHASH__PDJB6VYGeXn__JHASH__");
                    return b({
                        receipt: a,
                        title: c
                    })
                });
                return
            }
        }, [b])
    }

    function l() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("PaymentsCometInfomationBottomSheetDialog.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            var d;
            b({
                contentType: a.contentType.content_type,
                orderID: (d = a.orderID) != null ? d : "",
                pageID: a.pageID
            }, c("emptyFunction"))
        }, [b])
    }

    function m() {
        var a = d("CometRelay").useRelayEnvironment();
        return i(function(b) {
            var e = {
                environment: a
            };
            b = c("commitWorkplaceChatBotSubmitFeedbackMutation")({
                action_content_blob: b.feedbackActionContentBlob,
                config: e
            });
            e = b.then(function() {
                d("cometPushToast").cometPushSimpleToast("Feedback submitted!", 2e3)
            }, function() {
                d("cometPushToast").cometPushSimpleToast("Error in submitting feedback!", 2e3)
            });
            c("promiseDone")(e)
        }, [a])
    }
    var n = c("JSResourceForInteraction")("MWChatCustomerFeedbackDialog.react").__setRef("MWChatXmaThirdPartyActionHandler.bs");

    function o() {
        var a = c("useCometLazyDialog")(n),
            b = a[0],
            e = d("CometRelay").useRelayEnvironment();
        return i(function(a) {
            var c = a.feedbackFormId;
            d("MWChatCustomerFeedbackStateQuery").fetch(c, e, function(a) {
                d("MWChatCustomerFeedbackFormDataQuery").fetch(c, e, function(c) {
                    return b({
                        firstScreen: c.firstScreen,
                        formId: c.formId,
                        pageId: c.pageId,
                        privacy: c.privacy,
                        state: a
                    })
                })
            })
        }, [e, b])
    }

    function p() {
        var a = c("useCometLazyDialog")(n),
            b = a[0],
            e = d("CometRelay").useRelayEnvironment();
        return i(function(a) {
            var c = a.pageId,
                f = a.formId,
                g = a.privacy,
                h = a.firstScreen;
            d("MWChatCustomerFeedbackStateQuery").fetch(f, e, function(a) {
                return b({
                    firstScreen: h,
                    formId: f,
                    pageId: c,
                    privacy: g,
                    state: a
                })
            })
        }, [e, b])
    }

    function q() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatPIIFormDialog.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0],
            e = d("CometRelay").useRelayEnvironment();
        return i(function(a) {
            var c = a.nuxData,
                f = a.piiForm,
                g = f.pageId,
                h = f.color,
                i = f.numScreens,
                j = f.currentIndex,
                k = f.formId,
                l = f.firstScreen,
                m = a.ctaType;
            d("MWChatPIIFormStateQuery").fetch(k, e, function(a) {
                if (i > 1) {
                    d("MWChatPIIFormScreenQuery").fetch(k, g, 1, e, function(d) {
                        return b({
                            color: h,
                            ctaType: m,
                            currentIndex: j,
                            firstScreen: l,
                            formId: k,
                            numScreens: i,
                            nuxData: c,
                            pageId: g,
                            secondScreen: d,
                            state: a
                        }, function() {})
                    });
                    return
                } else return b({
                    color: h,
                    ctaType: m,
                    currentIndex: j,
                    firstScreen: l,
                    formId: k,
                    numScreens: i,
                    nuxData: c,
                    pageId: g,
                    secondScreen: void 0,
                    state: a
                }, function() {})
            })
        }, [e, b])
    }

    function r() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWInboxUrlWebviewDialog.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function() {
            var a = h._("__JHASH__aZQ8B3AjBfu__JHASH__").toString();
            b({
                htmlBlob: a
            })
        }, [b])
    }

    function s() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MessengerCometBookingDetailsModal.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            return b({
                pageID: a.pageId,
                requestID: a.requestId
            })
        }, [b])
    }

    function t() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWFbpayOfferDialog.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            var c;
            return b({
                offerId: (c = a.offerId) != null ? c : "",
                title: a.title
            })
        }, [b])
    }

    function u() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatLiveLocationDialog.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            return b({})
        }, [b])
    }

    function v() {
        var a = d("MWLSOpenStaticLocationDialog.react").useHook();
        return i(function(b) {
            return a(b.msgId)
        }, [a])
    }

    function w() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatBusinessBoardingPassDetail.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            return b({
                boardingPassDetail: a
            })
        }, [b])
    }

    function x() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatBusinessItineraryDetail.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            return b({
                itineraryPayload: a
            })
        }, [b])
    }

    function y() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatBusinessMessengerExtension.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            return b({
                actionLink: a.actionLink,
                pageID: a.pageID,
                threadID: a.pageID,
                userID: a.userID
            }, c("emptyFunction"))
        }, [b])
    }

    function z() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatRichWidgetExtension.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            return b({
                actionLink: a.actionLink,
                pageID: a.pageID
            }, c("emptyFunction"))
        }, [b])
    }

    function A(a) {
        return i(function(b) {
            j.onReady(function(a) {
                return a.logClick({
                    component: "start_call_button",
                    surface: "admin_message"
                })
            });
            return a(b.hasVideo, b.threadId, b.trigger)
        }, [a])
    }

    function B() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWChatGuestChatHistoryModal.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            return b({
                guestID: a.guestId,
                pageID: a.pageId
            })
        }, [b])
    }

    function C() {
        return i(function(a) {
            if (b("cr:11076") != null) return b("cr:11076").$$process(a.ctaId, a.messageId)
        }, [])
    }

    function D(a) {
        d("Popup").open(a, 1024, 500)
    }

    function E() {
        var a = c("useCometLazyDialog")(c("JSResourceForInteraction")("CometJoinRoomFromPortalDialog.react").__setRef("MWChatXmaThirdPartyActionHandler.bs")),
            b = a[0];
        return i(function(a) {
            return b({
                linkUrl: a.linkUrl
            })
        }, [b])
    }

    function F() {
        var a = c("useCometDynamicEntryPointDialog")(c("MarketplaceCometReviewOffersDialog.entrypoint"));
        return i(function(b) {
            return a({
                listingId: b
            }, void 0)
        }, [a])
    }

    function G() {
        var a = c("useCometDynamicEntryPointDialog")(c("CometMarketplaceCreateDiscountedPriceDialog.entrypoint"));
        return i(function(b) {
            return a({
                threadId: b
            }, {
                threadId: b
            })
        }, [a])
    }

    function a(a, b) {
        var e = k(),
            f = p(),
            g = o(),
            h = C(),
            i = q(),
            j = t(),
            n = u(),
            H = v(),
            I = s(),
            J = w(),
            K = B(),
            L = x(),
            M = y(),
            N = z(),
            O = d("MWP2PPaymentRequestCancel.bs").useP2PPaymentRequestCancel(),
            P = d("MWP2PPaymentRequestConfirm.bs").useP2PPaymentRequestConfirm(),
            Q = d("MWP2PPaymentRequestDecline.bs").useP2PPaymentRequestDecline(),
            R = d("MWP2PPaymentTransactionDecline.bs").useP2PPaymentTransactionDecline(),
            S = d("MWP2PPaymentMethodAdd.bs").useP2PPaymentMethodAdd(),
            T = d("MWP2PPaymentTransactionInformationVerify.bs").useP2PPaymentTransactionInformationVerify(),
            U = A(b),
            V = d("MakeRoomRingbackCommon.bs").useHook(),
            W = E(),
            X = c("useGetMWXMAMentorshipDialog")(),
            Y = l(),
            Z = m(),
            $ = d("MWLSShowMemberRequest.bs").useHook(),
            aa = d("MWLSShowPendingPost.bs").useHook(),
            ba = d("MWLSShowPaymentDetails.bs").useHook(),
            ca = d("MWLSShowOrderDetails.bs").useHook(),
            da = d("MWLSShowCheckout.bs").useHook(),
            ea = d("MWLSShowAttachBankSlip.bs").useHook(),
            fa = d("MWLSShowOffsiteBankTransfer.bs").useHook(),
            ga = c("useMWLSMarketplaceXmaCtaHandler")(),
            ha = F(),
            ia = G(),
            ja = c("useMWChatShowPIIForm")(),
            ka = r();
        return function(b) {
            if (b.NAME === "P2PPaymentTransactionInformationVerify") return T(b.VAL);
            if (b.NAME === "P2PPaymentTransactionDecline") return R(void 0, b.VAL);
            if (b.NAME === "MakeWorkJoinableCallInvite" || b.NAME === "MakeRoomRingback") return V(b.VAL);
            if (b.NAME === "P2MCheckout") {
                var d = b.VAL;
                return da(d.orderID, d.pageID)
            }
            if (b.NAME === "ShowCustomerFeedback") return f(b.VAL);
            if (b.NAME === "P2MInformationalMessageBottomSheet") return Y(b.VAL);
            if (b.NAME === "WorkplaceChatBotSubmitFeedback") return Z(b.VAL);
            if (b.NAME === "ShowFbpayOfferDetails") return j(b.VAL);
            if (b.NAME === "P2PPaymentRequestCancel") return O(void 0, b.VAL);
            if (b.NAME === "SendImagePostback") {
                d = b.VAL;
                var k = d.loggingDetails;
                k != null && c("CtmMultiPhotoCarouselMsgrMultiPhotoCarouselClickFalcoEvent").log(function() {
                    return {
                        consumer_id: k.consumer_id,
                        event_data: {
                            ad_id: k.ad_id,
                            cta: "button",
                            index: String(k.index)
                        },
                        event_location: "unknown",
                        page_id: k.page_id
                    }
                });
                return a(d.message, d.platformToken, d.image)
            }
            if (b.NAME === "ShowMessengerExtensions") return M(b.VAL);
            if (b.NAME === "OpenAccountLink") return h(b.VAL);
            if (b.NAME === "ShowPIIForm") return ja(b.VAL);
            if (b.NAME === "P2MOffsiteBankTransferCTA") return fa(b.VAL.orderID);
            if (b.NAME === "P2PPaymentTransactionReceiveMoney") return S(void 0, b.VAL);
            if (b.NAME === "ShowBoardingPass") return J(b.VAL);
            if (b.NAME === "P2MOrderDetails") return ca(b.VAL.orderID);
            if (b.NAME === "ShowStaticLocationDetails") return H(b.VAL);
            if (b.NAME === "P2PPaymentTransactionDetails") return ba(b.VAL.id);
            if (b.NAME === "P2PPaymentRequestDecline") return Q(void 0, b.VAL);
            if (b.NAME === "ShowMentorshipDialog") return X(b.VAL);
            if (b.NAME === "ShowBookingDetails") return I(b.VAL);
            if (b.NAME === "ShowOrderConfirmation") return e(b.VAL);
            if (b.NAME === "ShowCustomerFeedbackForm") return g(b.VAL);
            if (b.NAME === "ShowMessengerRichWidgetExtension") return N(b.VAL);
            if (b.NAME === "ShowItinerary") return L(b.VAL);
            if (b.NAME === "OpenAccountLinkUrl") return D(b.VAL);
            if (b.NAME === "MakeJoinRoomFromPortal") return W(b.VAL);
            if (b.NAME === "P2MAttachBankSlip") return ea(b.VAL.orderID);
            if (b.NAME === "AdmodChatsShowPendingPost") {
                d = b.VAL;
                return aa(d.targetId, d.groupId, d.authorId, d.postId, d.activityLogItemId)
            }
            if (b.NAME === "P2PPaymentRequestConfirm") return P(void 0, b.VAL);
            if (b.NAME === "MakeRtcCall") return U(b.VAL);
            if (b.NAME === "ProcessMarketplaceCallFunction") {
                d = b.VAL;
                var l = d.actionType,
                    m = d.attachmentFbid,
                    o = d.messageId;
                d = d.targetId;
                return ga(o, m, d, l)
            }
            if (b.NAME === "ShowPIIFormForFormBuilder") return i(b.VAL);
            if (b.NAME === "ShowLiveLocationDetails") return n(b.VAL);
            if (b.NAME === "AdmodChatsShowMemberRequest") {
                o = b.VAL;
                return $(o.targetId, o.groupId, o.profileId, o.activityLogItemId)
            }
            if (b.NAME === "ShowGuestChatHistory") return K(b.VAL);
            if (b.NAME === "ShowInThreadFormDetails") return ka();
            m = b.VAL;
            d = m.threadId;
            l = m.listingId;
            switch (m.ctaType) {
                case "SHIPPED_DECLINED_OFFER_SEND_ANOTHER_PRICE":
                case "SHIPPED_EXPIRED_OFFER_SEND_ANOTHER_PRICE":
                    if (d != null) return ia(d);
                    else return;
                case "SHIPPED_OFFER_CANCEL":
                    if (l != null) return ha(l);
                    else return;
                default:
                    return
            }
        }
    }
    e = a;
    g.useHandler = e
}), 98);
__d("MWMessageListAttachmentDimensions.bs", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo;

    function a(a, b) {
        return h(function() {
            var c = b.previewWidthLarge,
                d = b.previewHeightLarge;
            return a != null && c != null && d != null && a === "Inbox" ? [c, d] : [b.previewWidth, b.previewHeight]
        }, [a, b])
    }
    g.useHook = a
}), 98);
__d("MWV2ChatImage.react", ["fbt", "I64", "LSAuthorityLevel", "LSIntEnum", "MWChatImageInsetShadow.react", "MWInboxInfoSharedContentQPLLogger.bs", "MWLSThreadDisplayContext", "MWMessageListAttachmentDimensions.bs", "MWMessageListMediaPressableContainer.bs", "MWPStableImage.bs", "MWV2AttachmentProgressBar.react", "MWV2LogMessageClick.bs", "MWV2UseFocusRowAfterClosingPushView.bs", "gkx", "react", "stylex", "useMWV2MediaViewerShowDialog", "useMWV2MediaViewerURL", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            appAttr: {
                alignItems: "x6s0dn4",
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                display: "x78zum5",
                lineHeight: "x1rfph6h",
                paddingTop: "x1iorvi4",
                paddingEnd: "xsyo7zv",
                paddingBottom: "xjkvuk6",
                paddingStart: "x16hj40l",
                $$css: !0
            },
            appIcon: {
                borderTopStartRadius: "x14yjl9h",
                borderTopEndRadius: "xudhj91",
                borderBottomEndRadius: "x18nykt9",
                borderBottomStartRadius: "xww2gxu",
                height: "xlup9mm",
                marginEnd: "x1w0mnb",
                objectFit: "x19kjcj4",
                width: "x1kky2od",
                $$css: !0
            },
            appText: {
                color: "xzsf02u",
                fontSize: "x1nxh6w3",
                wordBreak: "x13faqbe",
                $$css: !0
            },
            container: {
                display: "x78zum5",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                position: "x1n2onr6",
                $$css: !0
            },
            content: {
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                marginTop: "xdj266r",
                marginEnd: "x11i5rnm",
                marginBottom: "xat24cr",
                marginStart: "x1mh8g0r",
                position: "x1n2onr6",
                $$css: !0
            },
            incomingConnectBottom: {
                borderBottomStartRadius: "x10y3i5r",
                $$css: !0
            },
            incomingConnectTop: {
                borderTopStartRadius: "x1lcm9me",
                $$css: !0
            },
            outgoingConnectBottom: {
                borderBottomEndRadius: "xrt01vj",
                $$css: !0
            },
            outgoingConnectTop: {
                borderTopEndRadius: "x1yr5g0i",
                $$css: !0
            },
            standalone: {
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                borderTopEndRadius: "x1g8br2z",
                borderTopStartRadius: "x1tlxs6b",
                $$css: !0
            },
            withAppAttribution: {
                borderBottomEndRadius: "x5pf9jr",
                borderBottomStartRadius: "xo71vjh",
                borderTopEndRadius: "x1g8br2z",
                borderTopStartRadius: "x1tlxs6b",
                $$css: !0
            }
        };

    function k(a) {
        a = a.attachment;
        var b = a.attributionAppName;
        if (b == null) return null;
        a = a.attributionAppIcon;
        return i.jsxs("div", {
            className: "x6s0dn4 x1gn5b1j x230xth x78zum5 x1rfph6h x1iorvi4 xsyo7zv xjkvuk6 x16hj40l",
            children: [a != null ? i.jsx("img", {
                className: "x14yjl9h xudhj91 x18nykt9 xww2gxu xlup9mm x1w0mnb x19kjcj4 x1kky2od",
                role: "presentation",
                src: a
            }) : null, i.jsx("span", {
                className: "xzsf02u x1nxh6w3 x13faqbe",
                children: b
            })]
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function a(a) {
        var b, e = a.attachment,
            f = a.connectBottom,
            g = a.connectTop,
            l = a.getPreviewUrl,
            m = a.message,
            n = a.navigateToRouteForMediaViewer;
        a = a.outgoing;
        var o = c("useReStore")(),
            p = (b = n) != null ? b : !0;
        b = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        var q = e.attributionAppName != null;
        b = d("MWMessageListAttachmentDimensions.bs").useHook(b, e);
        var r = b[0];
        b = b[1];
        var s = c("useMWV2MediaViewerURL")(e);
        g = g ? a ? j.outgoingConnectTop : j.incomingConnectTop : !1;
        f = f === !0 ? a ? j.outgoingConnectBottom : j.incomingConnectBottom : !1;
        a = c("gkx")("1924962");
        var t = d("MWV2UseFocusRowAfterClosingPushView.bs").useHook();
        n = c("useMWV2MediaViewerShowDialog")((n = n) != null ? n : !0);
        var u = n[0],
            v = n[1];
        n = l(e);
        if (n == null || n.length === 0) return null;
        l = p && d("I64").gt(m.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").CLIENT_PARTIAL)) ? {
            passthroughProps: {
                origSrc: n
            },
            url: s
        } : void 0;
        s = function() {
            d("MWV2LogMessageClick.bs").log(o, m, 28);
            d("MWInboxInfoSharedContentQPLLogger.bs").logOpenSharedContentFromThread("media");
            t(function() {
                return !0
            });
            if (!p) return u({
                attachment: e
            }, function() {})
        };
        return i.jsxs(c("MWMessageListMediaPressableContainer.bs"), {
            attachment: e,
            disabled: d("I64").le(m.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").CLIENT_PARTIAL)),
            linkProps_: l,
            onHoverIn: function() {
                if (!p) return v()
            },
            onPress: s,
            testid: void 0,
            xstyle: [j.container, j.standalone, g, f],
            children: [i.jsx(d("MWPStableImage.bs").make, {
                alt: e.titleText != null && a ? e.titleText : h._("__JHASH__mrw3CpFXi7r__JHASH__"),
                className: c("stylex")(j.content, q ? j.withAppAttribution : j.standalone, g, f),
                height: b != null ? d("I64").to_float(b) : void 0,
                maxHeight: 200,
                maxWidth: 480,
                src: n,
                width: r != null ? d("I64").to_float(r) : void 0,
                children: i.jsx(k, {
                    attachment: e
                })
            }), d("I64").le(m.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").CLIENT_PARTIAL)) ? i.jsx(c("MWV2AttachmentProgressBar.react"), {
                attachment: e
            }) : null, i.jsx(c("MWChatImageInsetShadow.react"), {
                xstyle: [g, f]
            })]
        }, e.attachmentFbid)
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWResponsiveVideo.bs", ["CometObjectFitContainer.react", "CometPlaceholder.react", "LSIntEnum", "MDSGlimmer.react", "MWLSThreadDisplayContext", "MWPThreadCapabilitiesContext", "deferredLoadComponent", "gkx", "react", "requireDeferredForDisplay", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useMemo,
        j = c("deferredLoadComponent")(c("requireDeferredForDisplay")("MWChatVideoPlayer.react").__setRef("MWResponsiveVideo.bs")),
        k = {
            container: {
                maxWidth: "x193iq5w",
                minHeight: "x11md1zd",
                minWidth: "x450l9j",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                position: "x1n2onr6",
                $$css: !0
            },
            fill: {
                bottom: "x1ey2m1c",
                start: "x17qophe",
                position: "x10l6tqk",
                end: "xds687c",
                top: "x13vifvy",
                zIndex: "x1vjfegm",
                $$css: !0
            },
            glimmer: {
                height: "x5yr21d",
                position: "x10l6tqk",
                width: "xh8yej3",
                $$css: !0
            },
            glimmerFallback: {
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                borderTopEndRadius: "x1g8br2z",
                borderTopStartRadius: "x1tlxs6b",
                display: "x78zum5",
                height: "x5yr21d",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                position: "x10l6tqk",
                width: "xh8yej3",
                $$css: !0
            }
        };

    function l(a) {
        return [a === "Inbox" ? 240 : 180, 140]
    }

    function a(a) {
        var b = a.connectTopStyles,
            e = a.fbid,
            f = a.height,
            g = a.maxHeight,
            m = a.maxWidth,
            n = a.src,
            o = a.width,
            p = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        a = i(function() {
            var a = o != null ? f != null ? [o, f] : [500, 300] : [500, 300];
            return a[0] / a[1]
        }, [o, f]);
        var q = d("MWPThreadCapabilitiesContext").useHook(),
            r = c("gkx")("1581") && q(d("LSIntEnum").ofNumber(46));
        q = i(function() {
            var a = l(p);
            return {
                maxHeight: g.toString() + "px",
                minHeight: r ? a[1].toString(10) + "px" : "",
                minWidth: r ? a[0].toString(10) + "px" : "",
                width: Math.min((a = o) != null ? a : 500, m).toString() + "px"
            }
        }, [g, o, m, r, p]);
        return h.jsxs("div", {
            className: "x193iq5w x11md1zd x450l9j x6ikm8r x10wlt62 x1n2onr6",
            style: q,
            children: [h.jsx("div", {
                className: "x1ey2m1c x17qophe x10l6tqk xds687c x13vifvy x1vjfegm",
                children: h.jsx(c("CometPlaceholder.react"), {
                    fallback: h.jsx("div", {
                        className: c("stylex")(k.glimmerFallback, b),
                        children: h.jsx(c("MDSGlimmer.react"), {
                            index: 0,
                            xstyle: k.glimmer
                        })
                    }),
                    children: h.jsx(j, {
                        autoPlaySetting: r ? "off" : void 0,
                        controls: "mwchat",
                        fbid: e,
                        hideExpandButton: !0,
                        originalHeight: (q = f) != null ? q : 300,
                        originalWidth: (b = o) != null ? b : 500,
                        sdSrc: n
                    })
                })
            }), h.jsx(c("CometObjectFitContainer.react"), {
                contentAspectRatio: a,
                objectFitMode: "CONTAINER_WIDTH_BASED_ASPECT_RATIO",
                children: null
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWV2ChatVideo.bs", ["fbt", "I64", "LSAuthorityLevel", "LSIntEnum", "MWChatImageInsetShadow.react", "MWLSThreadDisplayContext", "MWMessageListMediaPressableContainer.bs", "MWResponsiveVideo.bs", "MWV2AttachmentProgressBar.react", "MWV2LogMessageClick.bs", "MWV2UseFocusRowAfterClosingPushView.bs", "MWVideoPlayerControllerContext.react", "gkx", "react", "recoverableViolation", "useCometRouterDispatcher", "useMWV2MediaViewerShowDialog", "useMWV2MediaViewerURL", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    b = d("react");
    var j = b.useContext,
        k = b.useMemo,
        l = b.useRef,
        m = {
            incoming_connect_top: {
                borderTopStartRadius: "x1lcm9me",
                $$css: !0
            },
            outgoing_connect_top: {
                borderTopEndRadius: "x1yr5g0i",
                $$css: !0
            },
            root: {
                backfaceVisibility: "xlp1x4z",
                backgroundColor: "xcrg951",
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                borderTopEndRadius: "x1g8br2z",
                borderTopStartRadius: "x1tlxs6b",
                display: "x1lliihq",
                maxWidth: "x193iq5w",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                position: "x1n2onr6",
                $$css: !0
            }
        };

    function n(a) {
        var b = a.attachment,
            e = a.connectTop,
            f = a.getPreviewUrl,
            g = a.message,
            k = a.navigateToRouteForMediaViewer,
            l = k === void 0 ? !0 : k;
        k = a.outgoing;
        var n = c("useReStore")(),
            o = c("useCometRouterDispatcher")(),
            p = c("useMWV2MediaViewerURL")(b);
        a = e ? k ? m.outgoing_connect_top : m.incoming_connect_top : !1;
        var q = d("MWV2UseFocusRowAfterClosingPushView.bs").useHook();
        e = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        k = c("useMWV2MediaViewerShowDialog")(l);
        var r = k[0],
            s = k[1],
            t = j(c("MWVideoPlayerControllerContext.react")),
            u = f(b);
        if (u == null || u === "") return null;
        var v = c("gkx")("5293");
        k = l && d("I64").gt(g.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").CLIENT_PARTIAL)) && !v ? {
            passthroughProps: {
                origSrc: u
            },
            url: p
        } : void 0;
        f = b.previewWidth;
        var w = b.previewHeight,
            x = {
                ariaLabel: h._("__JHASH__Sk-r4mWi0bD__JHASH__"),
                attachment: b,
                disabled: d("I64").le(g.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").CLIENT_PARTIAL)),
                onHoverIn: function() {
                    if (!l) return s()
                },
                onPress: function() {
                    d("MWV2LogMessageClick.bs").log(n, g, 27);
                    q(function() {
                        return !0
                    });
                    if (!l) return r({
                        attachment: b
                    }, function() {});
                    if (v) {
                        var a = t.ref.current;
                        if (a) {
                            var e = a.getCurrentState();
                            e = e.volume;
                            var f = a.getPlayheadPosition();
                            o == null ? void 0 : o.go(p, {
                                passthroughProps: {
                                    origSrc: u,
                                    startTimestamp: f,
                                    volumeSetting: e
                                }
                            });
                            a.setMuted(!0, "product_initiated")
                        } else c("recoverableViolation")("Missing controller", "messenger_web_product")
                    }
                },
                overlayDisabled: !0,
                testid: "chat-video",
                xstyle: [m.root, a]
            };
        k != null && (x.linkProps_ = k);
        return i.jsxs(c("MWMessageListMediaPressableContainer.bs"), babelHelpers["extends"]({}, x, {
            children: [i.jsx(c("MWResponsiveVideo.bs"), {
                connectTopStyles: a,
                fbid: b.attachmentFbid,
                height: w != null ? d("I64").to_float(w) : void 0,
                maxHeight: 200,
                maxWidth: e === "Inbox" ? 500 : 167,
                src: u,
                width: f != null ? d("I64").to_float(f) : void 0
            }), d("I64").le(g.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").CLIENT_PARTIAL)) ? i.jsx(c("MWV2AttachmentProgressBar.react"), {
                attachment: b
            }) : null, i.jsx(c("MWChatImageInsetShadow.react"), {
                xstyle: a
            })]
        }))
    }
    n.displayName = n.name + " [from " + f.id + "]";

    function a(a) {
        var b = l(null),
            d = k(function() {
                return {
                    ref: b
                }
            }, [b]);
        return i.jsx(c("MWVideoPlayerControllerContext.react").Provider, {
            value: d,
            children: i.jsx(n, babelHelpers["extends"]({}, a))
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWMessageListAttachment.react", ["fbt", "LSMediaUrl.bs", "MWAudioPlayer.react", "MWLSThreadDisplayContext", "MWV2ChatImage.react", "MWV2ChatVideo.bs", "MWV2Sticker.react", "MWV2TombstonedMessage.bs", "react", "recoverableViolation", "stylex"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useCallback;

    function a(a) {
        var b = a.connectBottom,
            d = a.connectTop;
        a = a.xstyle;
        return i.jsx("div", {
            className: c("stylex")(a),
            children: i.jsx(c("MWV2TombstonedMessage.bs"), {
                connectBottom: b,
                connectTop: d,
                children: h._("__JHASH__962PS6SI-P2__JHASH__")
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function b(a) {
        var b = a.attachment,
            e = a.connectTop,
            f = a.message,
            g = a.navigateToRouteForMediaViewer;
        a = a.outgoing;
        var h = j(function(a) {
            return d("LSMediaUrl.bs").Attachment.playableUrl(a)
        }, []);
        return i.jsx(c("MWV2ChatVideo.bs"), {
            attachment: b,
            connectTop: e,
            getPreviewUrl: h,
            message: f,
            navigateToRouteForMediaViewer: g,
            outgoing: a
        })
    }
    b.displayName = b.name + " [from " + f.id + "]";

    function e(a) {
        var b = a.attachment,
            c = a.isReply;
        a = a.outgoing;
        var e = j(function(a) {
            return d("LSMediaUrl.bs").Attachment.playableUrl(a)
        }, []);
        return i.jsx(d("MWAudioPlayer.react").MWAudioPlayer, {
            attachment: b,
            getPlayableUrl: e,
            isReply: c,
            outgoing: a
        })
    }
    e.displayName = e.name + " [from " + f.id + "]";

    function k(a) {
        var b = a.attachment,
            e = a.connectBottom,
            f = a.connectTop,
            g = a.message,
            h = a.navigateToRouteForMediaViewer;
        a = a.outgoing;
        var k = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext(),
            l = j(function(a) {
                var b = a.previewUrlLarge;
                return b != null && k === "Inbox" ? b : d("LSMediaUrl.bs").Attachment.previewUrl(a)
            }, [k]),
            m = function(a) {
                return d("LSMediaUrl.bs").Attachment.playableUrl(a)
            };
        return i.jsx(c("MWV2ChatImage.react"), {
            attachment: b,
            connectBottom: e,
            connectTop: f,
            getPlayableUrl: m,
            getPreviewUrl: l,
            message: g,
            navigateToRouteForMediaViewer: h,
            outgoing: a
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function l(a) {
        a = a.attachment;
        var b = j(function(a) {
            var b;
            b = (b = d("LSMediaUrl.bs").Attachment.playableUrl(a)) != null ? b : d("LSMediaUrl.bs").Attachment.previewUrl(a);
            if (b != null) return b;
            c("recoverableViolation")("Sticker Attachment has no preview_url or playable_url: " + a.attachmentFbid, "messenger_privacy_web")
        }, []);
        return i.jsx(c("MWV2Sticker.react"), {
            attachment: a,
            getPreviewUrl: b
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";
    g.MWMessageListAttachmentError = a;
    g.MWMessageListAttachmentVideo = b;
    g.MWMessageListAttachmentAudio = e;
    g.MWMessageListAttachmentImage = k;
    g.MWMessageListAttachmentSticker = l
}), 98);
__d("MWV2ChatImagesGrid.bs", ["fbt", "CometImageCover.react", "CometPhotoGrid.react", "CometPressable.react", "LSMediaUrl.bs", "MWLSThreadDisplayContext", "react", "stylex", "useMWV2MediaViewerURL"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useMemo,
        k = {
            large: {
                width: "x7cdydq",
                $$css: !0
            },
            pressable: {
                borderTopStartRadius: "x1lcm9me",
                borderTopEndRadius: "x1yr5g0i",
                borderBottomEndRadius: "xrt01vj",
                borderBottomStartRadius: "x10y3i5r",
                display: "x1lliihq",
                height: "x5yr21d",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                width: "xh8yej3",
                $$css: !0
            },
            root: {
                maxWidth: "x193iq5w",
                $$css: !0
            },
            small: {
                width: "x1so1ns2",
                $$css: !0
            }
        };

    function l(a) {
        var b = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        return j(function() {
            var c = a.previewUrlLarge;
            if (c != null && b === "Inbox") return c;
            else return d("LSMediaUrl.bs").Attachment.previewUrl(a)
        }, [a, b])
    }

    function m(a) {
        a = a.attachment;
        var b = l(a);
        a = c("useMWV2MediaViewerURL")(a);
        if (b != null) return i.jsx(c("CometPressable.react"), {
            "aria-label": h._("__JHASH__mrw3CpFXi7r__JHASH__"),
            linkProps: {
                passthroughProps: {
                    origSrc: b
                },
                url: a
            },
            overlayRadius: 4,
            xstyle: function() {
                return [k.pressable]
            },
            children: i.jsx(c("CometImageCover.react"), {
                src: b
            })
        });
        else return null
    }

    function a(a) {
        a = a.attachments;
        var b = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        return i.jsx("div", {
            className: c("stylex")(k.root, b === "Inbox" ? k.large : k.small),
            "data-testid": void 0,
            children: i.jsx(c("CometPhotoGrid.react"), {
                children: a.map(function(a) {
                    return i.jsx(m, {
                        attachment: a
                    }, a.attachmentFbid)
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("MWV2UnsupportedAttachment.bs", ["fbt", "MDSCautionTriangleSvgIcon.react", "MWXText.react", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");

    function j() {
        return i.jsx("div", {
            className: "x6s0dn4 xgx9qek x14yjl9h xudhj91 x18nykt9 xww2gxu x78zum5 xl56j7k xmo9yow x1iorvi4 x150jy0e xjkvuk6 x1e558r4",
            children: i.jsx(c("MDSCautionTriangleSvgIcon.react"), {
                color: "primary",
                size: 24
            })
        })
    }
    j.displayName = j.name + " [from " + f.id + "]";

    function a(a) {
        a = a.attachment;
        a = a.descriptionText;
        return i.jsxs("div", {
            className: "x6s0dn4 x78zum5 xjkvuk6 x1iorvi4 x87ps6o",
            children: [i.jsx(j, {}), i.jsxs("div", {
                className: "xzsf02u x1iyjqo2 x1s688f x13faqbe",
                children: [i.jsx(c("MWXText.react"), {
                    type: "headline4",
                    children: h._("__JHASH__Uhh5LwoNOuv__JHASH__")
                }), a != null ? i.jsx("div", {
                    className: "x889kno",
                    children: i.jsx(c("MWXText.react"), {
                        color: "secondary",
                        type: "body4",
                        children: a
                    })
                }) : null]
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("MWXMAAttachmentActionTriggerWithOpenChatTab.react", ["I64", "Int64Hooks", "LSThreadAttributionStore.bs", "MWLSThread", "useBlockedUserInterstitial", "useCometRouterDispatcher", "useMWChatOpenTabByThreadKey", "useReStore", "useShouldShowMessagingEntrypointInCometRoot"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        var b = a.children;
        a = a.threadKey;
        return b(h(a))
    }

    function h(a) {
        var b = c("useBlockedUserInterstitial")(),
            e = c("useShouldShowMessagingEntrypointInCometRoot")("CHAT"),
            f = c("useCometRouterDispatcher")(),
            g = c("useMWChatOpenTabByThreadKey")(a, "chatInThread"),
            h = c("useReStore")();
        return d("Int64Hooks").useCallbackInt64(function(c, i) {
            if (e) {
                var j = d("MWLSThread").getThreadExn(h, a);
                return b(a, j, function() {
                    var a = i.metaKey || i.ctrlKey || i.shiftKey;
                    if (!a) return g()
                }, "chatInThread")
            } else if (f != null) {
                j = d("MWLSThread").getThreadExn(h, a);
                return b(a, j, function() {
                    d("LSThreadAttributionStore.bs").setSource(d("I64").to_string(a), "chatInThread"), f.go(c, {})
                }, "chatInThread")
            } else return
        }, [h, f, e, b, g, a])
    }
    g["default"] = a
}), 98);
__d("MWXMALink.react", ["CometLink.react", "MAWArmadilloLink.react", "MAWArmadilloLinkContext.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            link: {
                color: "x1heor9g",
                ":hover_textDecoration": "x1lku1pv",
                $$css: !0
            }
        };

    function a(a) {
        var b = d("MAWArmadilloLinkContext.react").useMAWArmadilloLink();
        return b ? h.jsx(c("MAWArmadilloLink.react"), babelHelpers["extends"]({}, a, {
            bypassMDS_DO_NOT_USE: !0,
            xstyle: i.link
        })) : h.jsx(c("CometLink.react"), babelHelpers["extends"]({}, a))
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("useGetMWXMACtaRegistryHandler", ["$InternalEnum", "ConstUriUtils", "CurrentEnvironment", "I64", "LSMessagingInitiatingSourceHook.bs", "LSMessagingSource", "MWChatPollXMAActionHandler.bs", "MWChatXmaThirdPartyActionHandler.bs", "MWLSImagePostbackCtaHandler.bs", "MWLSPostbackCtaHandler.bs", "MWLSWebUrlCtaHandler.bs", "MWStartRTCCallUtils", "XCometMessengerControllerRouteBuilder", "XCometStoriesControllerRouteBuilder", "XMessengerDotComCometMainControllerRouteBuilder", "cr:131", "cr:236", "cr:4538", "cr:4539", "cr:5751", "emptyFunction", "gkx", "isStringNullOrEmpty", "justknobx", "nullthrows", "useCometRouterDispatcher", "useRollcallContributionsXMAActionHandler"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = (f = (e = b("cr:4539")) != null ? e : b("cr:131")) != null ? f : c("emptyFunction"),
        i = (e = b("cr:5751")) != null ? e : c("emptyFunction"),
        j = (e = (f = b("cr:4538")) != null ? f : b("cr:236")) != null ? e : c("emptyFunction"),
        k = b("$InternalEnum")({
            SUBTHREAD_LINK: "//community_subthread/"
        });

    function a() {
        var a = d("LSMessagingInitiatingSourceHook.bs").useHook(),
            b = d("LSMessagingSource").useHook();
        b = d("MWLSImagePostbackCtaHandler.bs").usePostbackCtaHandler(b, a);
        a = d("MWStartRTCCallUtils").useStartRTCCall();
        var e = d("MWChatXmaThirdPartyActionHandler.bs").useHandler(b, a),
            f = d("MWLSPostbackCtaHandler.bs").usePostbackCtaHandler(),
            g = d("MWChatPollXMAActionHandler.bs").useHandler(),
            l = d("useRollcallContributionsXMAActionHandler").useRollcallContributionsXMAActionHandler(),
            m = d("MWLSWebUrlCtaHandler.bs").useShowWebViewDialog(),
            n = c("useCometRouterDispatcher")();
        b = j();
        var o = h({
            onSuccess: (a = b) != null ? a : c("emptyFunction")
        });
        a = (b = i()) != null ? b : [];
        var p = a[0];
        return function(a) {
            var b = a.actionUrl,
                h = a.platformToken,
                i = a.type_,
                j = a.title,
                q = a.messageId,
                r = a.threadKey,
                s = a.attachmentFbid,
                t = ["Title: " + j, "Type: " + i, "PlatformTokenPresent: " + (h != null).toString(), "ActionUrlPresent: " + (b != null).toString(), "ActionContentBlobPresent: " + (a.actionContentBlob != null).toString()].join(", ");
            if (i === "xma_roll_call_open_viewer" || i === "xma_roll_call_add_yours") return a.targetId == null ? {
                actionType: "NOT_SUPPORTED",
                primaryInfo: void 0
            } : {
                actionType: "BUTTON",
                primaryInfo: function() {
                    l(c("nullthrows")(a.targetId), r, null)
                },
                secondaryInfo: void 0
            };
            if (i === "xma_event_rsvp" && c("gkx")("3170")) return {
                actionType: "BUTTON",
                primaryInfo: function() {},
                secondaryInfo: void 0
            };
            if (i === "xma_rtc_audio" || i === "xma_rtc_missed_audio" || i === "xma_rtc_new_audio_default" || i === "xma_rtc_ended_audio") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e({
                        NAME: "MakeRtcCall",
                        VAL: {
                            hasVideo: !1,
                            threadId: d("I64").to_string(r),
                            trigger: i
                        }
                    })
                },
                secondaryInfo: void 0
            };
            if (i === "xma_rtc_video" || i === "xma_rtc_new_video_default" || i === "xma_rtc_new_video_from_fb_share" || i === "xma_rtc_new_video_from_fb_video_share" || i === "xma_rtc_missed_video" || i === "xma_rtc_ended_video") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e({
                        NAME: "MakeRtcCall",
                        VAL: {
                            hasVideo: !0,
                            threadId: d("I64").to_string(r),
                            trigger: i
                        }
                    })
                },
                secondaryInfo: void 0
            };
            if (i === "xma_postback") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return f(h, j)
                },
                secondaryInfo: [d("I64").to_string(r), 31]
            };
            if (i === "xma_open_dialog") {
                var u;
                if (b == null) return {
                    actionType: "CTA_ERROR",
                    primaryInfo: "Expected an open dialog url but didn't get any",
                    secondaryInfo: "messenger_business_core_product"
                };
                u = (u = d("ConstUriUtils").getUri(b)) == null ? void 0 : u.getQueryData == null ? void 0 : u.getQueryData();
                if (u == null) return {
                    actionType: "CTA_ERROR",
                    primaryInfo: "Expected a valid open dialog url but didn't get any",
                    secondaryInfo: "messenger_business_core_product"
                };
                var v = String(u.page_id).toString(),
                    w = String(u.guest_id).toString();
                return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return e({
                            NAME: "ShowGuestChatHistory",
                            VAL: {
                                guestId: w,
                                pageId: v
                            }
                        })
                    },
                    secondaryInfo: void 0
                }
            }
            if (i === "xma_p2p_payment_details" || i === "xma_p2p_request_pay" || i === "xma_p2p_payment_details_receive_money" || i === "xma_p2p_verify_info") {
                var x = a.targetId;
                return x == null ? {
                    actionType: "CTA_ERROR",
                    primaryInfo: "P2P Transaction encounterd without txn id",
                    secondaryInfo: "messenger_privacy_web"
                } : {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return e({
                            NAME: "P2PPaymentTransactionDetails",
                            VAL: {
                                currentStatus: null,
                                id: d("I64").to_string(x)
                            }
                        })
                    },
                    secondaryInfo: void 0
                }
            }
            if (i === "fill_in_thread_form" || i === "filled_in_thread_form_successfully") {
                var y = a.actionContentBlob;
                return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return e({
                            NAME: "ShowInThreadFormDetails",
                            VAL: JSON.parse(c("nullthrows")(y))
                        })
                    },
                    secondaryInfo: void 0
                }
            }
            if (i === "xma_join_from_portal" && b != null) return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e({
                        NAME: "MakeJoinRoomFromPortal",
                        VAL: {
                            linkUrl: b
                        }
                    })
                },
                secondaryInfo: void 0
            };
            if (i === "xma_live_location_sharing") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e(a.nativeUrl != null ? {
                        NAME: "ShowStaticLocationDetails",
                        VAL: {
                            msgId: q
                        }
                    } : {
                        NAME: "ShowLiveLocationDetails",
                        VAL: {
                            messageId: q,
                            titleString: j
                        }
                    })
                },
                secondaryInfo: void 0
            };
            var z = a.actionContentBlob,
                A = a.targetId;
            if (i === "xma_poll_details_button" || i === "xma_poll_details_card") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return g(A, z)
                },
                secondaryInfo: void 0
            };
            if (z != null && A != null) try {
                var B = JSON.parse(z);
                if (i === "xma_admod_chat_member_request") return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        var a = B.activityLogItemID,
                            b = B.groupID,
                            c = B.profileID;
                        return e({
                            NAME: "AdmodChatsShowMemberRequest",
                            VAL: {
                                activityLogItemId: a != null ? JSON.stringify(a) : "",
                                groupId: b != null ? JSON.stringify(b) : "",
                                profileId: c != null ? JSON.stringify(c) : "",
                                targetId: A != null ? d("I64").to_string(A) : ""
                            }
                        })
                    },
                    secondaryInfo: void 0
                };
                else if (i === "xma_admod_chat_pending_post") return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        var a = B.activityLogItemID,
                            b = B.authorID,
                            c = B.groupID,
                            f = B.postID;
                        return e({
                            NAME: "AdmodChatsShowPendingPost",
                            VAL: {
                                activityLogItemId: a != null ? JSON.stringify(a) : "",
                                authorId: b != null ? JSON.stringify(b) : "",
                                groupId: c != null ? JSON.stringify(c) : "",
                                postId: f != null ? JSON.stringify(f) : "",
                                targetId: A != null ? d("I64").to_string(A) : ""
                            }
                        })
                    },
                    secondaryInfo: void 0
                }
            } catch (a) {
                if (i !== "marketplace_xma_call_function" || !c("gkx")("5527")) return {
                    actionType: "NOT_SUPPORTED",
                    primaryInfo: void 0
                }
            }
            u = a.targetId;
            if (u != null) {
                var C = {
                    orderID: d("I64").to_string(u)
                };
                if (i === "xma_p2m_payment_details") return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return e({
                            NAME: "P2MOrderDetails",
                            VAL: C
                        })
                    },
                    secondaryInfo: void 0
                };
                else if (i === "xma_p2m_attach_receipt") return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return e({
                            NAME: "P2MAttachBankSlip",
                            VAL: C
                        })
                    },
                    secondaryInfo: void 0
                };
                else if (i === "xma_p2m_offsite_bank_transfer") return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return e({
                            NAME: "P2MOffsiteBankTransferCTA",
                            VAL: C
                        })
                    },
                    secondaryInfo: void 0
                };
                if (i === "xma_p2m_checkout") {
                    var D = {
                        orderID: d("I64").to_string(u),
                        pageID: d("I64").to_string(r)
                    };
                    return {
                        actionType: "BUTTON",
                        primaryInfo: function() {
                            return e({
                                NAME: "P2MCheckout",
                                VAL: D
                            })
                        },
                        secondaryInfo: void 0
                    }
                }
                if (i === "xma_p2m_informational_message_bottom_sheet") {
                    var E = {
                        contentType: JSON.parse(c("nullthrows")(z)),
                        orderID: d("I64").to_string(u),
                        pageID: d("I64").to_string(r)
                    };
                    return {
                        actionType: "BUTTON",
                        primaryInfo: function() {
                            return e({
                                NAME: "P2MInformationalMessageBottomSheet",
                                VAL: E
                            })
                        },
                        secondaryInfo: void 0
                    }
                }
            }
            if (z == null && (i === "xma_direct_send" || i === "xma_biz_inbox_form_send" || i === "xma_feedback_send")) return {
                actionType: "CTA_ERROR",
                primaryInfo: "Expected pii_form data but didn't get any",
                secondaryInfo: "mb_apix"
            };
            if (i === "xma_direct_send") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e({
                        NAME: "ShowPIIForm",
                        VAL: JSON.parse(c("nullthrows")(z))
                    })
                },
                secondaryInfo: [d("I64").to_string(r), 45]
            };
            if (i === "xma_biz_inbox_form_send") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e({
                        NAME: "ShowPIIFormForFormBuilder",
                        VAL: {
                            ctaType: i,
                            nuxData: {
                                description: "",
                                seen: !0,
                                title: "",
                                url: "",
                                url_text: ""
                            },
                            piiForm: JSON.parse(c("nullthrows")(z))
                        }
                    })
                },
                secondaryInfo: [d("I64").to_string(r), 45]
            };
            if (i === "xma_feedback_send") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e({
                        NAME: "ShowCustomerFeedbackForm",
                        VAL: {
                            feedbackFormId: c("nullthrows")(z)
                        }
                    })
                },
                secondaryInfo: [d("I64").to_string(r), 69]
            };
            if (i === "xma_workplace_chat_bot_submit_feedback") {
                var F = {
                    feedbackActionContentBlob: c("nullthrows")(z)
                };
                return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return e({
                            NAME: "WorkplaceChatBotSubmitFeedback",
                            VAL: F
                        })
                    },
                    secondaryInfo: void 0
                }
            }
            if (i === "xma_account_link") return b == null ? {
                actionType: "CTA_ERROR",
                primaryInfo: "Expected an account link url but didn't get any",
                secondaryInfo: "mb_apix"
            } : {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e({
                        NAME: "OpenAccountLinkUrl",
                        VAL: b
                    })
                },
                secondaryInfo: [d("I64").to_string(r), 49]
            };
            if (i === "xma_open_joinable_call_invite_url") return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    var a;
                    return e({
                        NAME: "MakeWorkJoinableCallInvite",
                        VAL: {
                            linkUrl: (a = b) != null ? a : ""
                        }
                    })
                },
                secondaryInfo: void 0
            };
            if (i === "xma_montage_share") {
                if (a.targetId == null) return {
                    actionType: "NOT_SUPPORTED",
                    primaryInfo: void 0
                };
                u = (u = c("XCometStoriesControllerRouteBuilder").buildUri({
                    card_id: window.btoa("S:_ISC:" + d("I64").to_string(a.targetId)),
                    view_single: !0
                }).setDomain("www.facebook.com")) == null ? void 0 : u.setProtocol("https");
                return u == null ? {
                    actionType: "NOT_SUPPORTED",
                    primaryInfo: void 0
                } : {
                    actionType: "URL",
                    primaryInfo: c("nullthrows")(u).toString(),
                    secondaryInfo: void 0
                }
            }
            if (i === "marketplace_xma_call_function") return a.actionContentBlob == null || a.targetId == null ? {
                actionType: "NOT_SUPPORTED",
                primaryInfo: void 0
            } : {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return e({
                        NAME: "ProcessMarketplaceCallFunction",
                        VAL: {
                            actionType: c("nullthrows")(a.actionContentBlob),
                            attachmentFbid: s,
                            messageId: q,
                            targetId: c("nullthrows")(a.targetId)
                        }
                    })
                },
                secondaryInfo: void 0
            };
            if (i === "marketplace_xma_open_dialog") {
                if (b == null || a.actionContentBlob == null) return {
                    actionType: "CTA_ERROR",
                    primaryInfo: "Expected an open dialog url and actionContentBlob but didn't get any",
                    secondaryInfo: "messenger_business_core_product"
                };
                u = d("ConstUriUtils").getUri(b);
                if (u == null) return {
                    actionType: "CTA_ERROR",
                    primaryInfo: "Found invalid url when creating CTA",
                    secondaryInfo: "messenger_business_core_product"
                };
                var G = String(u.getQueryParam("listingID")).toString();
                return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return e({
                            NAME: "OpenMarketplaceDialog",
                            VAL: {
                                ctaType: c("nullthrows")(a.actionContentBlob),
                                listingId: G,
                                threadId: d("I64").to_string(r)
                            }
                        })
                    },
                    secondaryInfo: void 0
                }
            }
            if (i === "xma_ctm_in_thread_multiphoto_reply_image") {
                if (a.actionContentBlob == null) return {
                    actionType: "NOT_SUPPORTED",
                    primaryInfo: void 0
                };
                try {
                    u = JSON.parse(a.actionContentBlob);
                    var H = u.action_prefill,
                        I = u.ad_id,
                        J = u.customer_id,
                        K = u.index,
                        L = u.page_id,
                        M = u.reply_image_uri;
                    if (H == null || M == null) return {
                        actionType: "NOT_SUPPORTED",
                        primaryInfo: void 0
                    };
                    var N = '{"in_thread_multiphoto_xma_reply": true}';
                    return {
                        actionType: "BUTTON",
                        primaryInfo: function() {
                            return e({
                                NAME: "SendImagePostback",
                                VAL: {
                                    image: M,
                                    loggingDetails: {
                                        ad_id: I.toString(),
                                        consumer_id: J.toString(),
                                        index: K,
                                        page_id: L.toString()
                                    },
                                    message: H,
                                    platformToken: c("isStringNullOrEmpty")(h) ? N : h
                                }
                            })
                        },
                        secondaryInfo: void 0
                    }
                } catch (a) {
                    return {
                        actionType: "NOT_SUPPORTED",
                        primaryInfo: void 0
                    }
                }
            }
            if (i === "xma_disabled_cta") return {
                actionType: "DISABLED_BUTTON",
                primaryInfo: void 0
            };
            if (i === "xma_open_native") {
                var O;
                u = a.nativeUrl;
                O = new URL((O = u) != null ? O : "");
                if (u != null && u.startsWith("fb-messenger://user-thread/")) {
                    var P = u.substr("fb-messenger://user-thread/".length);
                    return {
                        actionType: "DEEPLINK",
                        primaryInfo: {
                            loggingDetails: [d("I64").to_string(r), 33],
                            threadKey: d("I64").of_string(P)
                        }
                    }
                }
                if (u != null && O.pathname === k.SUBTHREAD_LINK) {
                    var Q = O.searchParams.get("subthread_fbid");
                    if (Q != null && p != null) return {
                        actionType: "BUTTON",
                        primaryInfo: function() {
                            return p(d("I64").of_string(Q))
                        },
                        secondaryInfo: void 0
                    }
                }
                var R = a.actionContentBlob;
                if (R != null) return {
                    actionType: "BUTTON",
                    primaryInfo: function() {
                        return m(R)
                    },
                    secondaryInfo: void 0
                };
                if (b != null)
                    if (b.includes("://m.me/j/") && c("gkx")("6970")) {
                        if (c("justknobx")._("159") && a.targetId != null) {
                            P = d("I64").to_string(a.targetId);
                            var S = c("CurrentEnvironment").messengerdotcom ? c("XMessengerDotComCometMainControllerRouteBuilder").buildURL({
                                thread_key: P
                            }) : c("XCometMessengerControllerRouteBuilder").buildURL({
                                thread_key: P
                            });
                            return {
                                actionType: "BUTTON",
                                primaryInfo: function() {
                                    return n == null ? void 0 : n.go(S, {})
                                },
                                secondaryInfo: void 0
                            }
                        }
                        return {
                            actionType: "BUTTON",
                            primaryInfo: function() {
                                return o == null ? void 0 : o(b)
                            },
                            secondaryInfo: void 0
                        }
                    } else return {
                        actionType: "URL",
                        primaryInfo: b,
                        secondaryInfo: [d("I64").to_string(r), 33]
                    };
                return {
                    actionType: "CTA_ERROR",
                    primaryInfo: "No Url found while parsing Open Native XMA " + t,
                    secondaryInfo: "messenger_privacy_web"
                }
            }
            if (z != null && z.length > 0 && z !== "{}" && !z.includes("notification_message_token")) return {
                actionType: "BUTTON",
                primaryInfo: function() {
                    return m(z)
                },
                secondaryInfo: void 0
            };
            if (b != null) {
                if (a.enableExtensions === !0) {
                    var T = {
                        actionLink: b,
                        pageID: d("I64").to_string(r),
                        sourceTitle: (u = j) != null ? u : "",
                        userID: d("I64").to_string(r)
                    };
                    if (i === "xma_open_rich_widget") return {
                        actionType: "BUTTON",
                        primaryInfo: function() {
                            return e({
                                NAME: "ShowMessengerRichWidgetExtension",
                                VAL: T
                            })
                        },
                        secondaryInfo: [d("I64").to_string(r), 33]
                    };
                    else return {
                        actionType: "BUTTON",
                        primaryInfo: function() {
                            return e({
                                NAME: "ShowMessengerExtensions",
                                VAL: T
                            })
                        },
                        secondaryInfo: [d("I64").to_string(r), 33]
                    }
                }
                return {
                    actionType: "URL",
                    primaryInfo: b,
                    secondaryInfo: [d("I64").to_string(r), 32]
                }
            }
            return {
                actionType: "CTA_ERROR",
                primaryInfo: "Unknown CTA encountered while parsing XMA. " + t,
                secondaryInfo: "messenger_privacy_web"
            }
        }
    }
    g["default"] = a
}), 98);
__d("MWXMAAttachmentActionTriggerDefault.react", ["fbt", "CometPressable.react", "I64", "MWInboxRouteBuilder.bs", "MWLSThread", "MWXMAAttachmentActionTriggerWithOpenChatTab.react", "MWXMALink.react", "MessengerWebUXLogger", "ReQL", "ReQLSuspense", "logXMACtaClicked", "react", "recoverableViolation", "useGetMWXMACtaRegistryHandler", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            link: {
                ":hover_textDecoration": "x1lku1pv",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.attachmentItem,
            e = a.children,
            g = c("useReStore")(),
            k = b.defaultCtaId,
            l = b.defaultCtaType,
            m = b.threadKey,
            n = d("ReQLSuspense").useFirst(function() {
                var a;
                return d("ReQL").fromTableAscending(g.table("attachment_ctas")).getKeyRange((a = k) != null ? a : d("I64").zero)
            }, [g, k], f.id + ":55");
        a = c("useGetMWXMACtaRegistryHandler")();
        var o = c("MessengerWebUXLogger") == null ? void 0 : c("MessengerWebUXLogger").useInteractionLogger(),
            p = d("MWLSThread").useThread(m, function(a) {
                return a.threadType
            });
        if (n == null) return e;
        a = a(n);
        switch (a.actionType) {
            case "BUTTON":
                var q, r = a.primaryInfo,
                    s = a.secondaryInfo;
                return i.jsx(c("CometPressable.react"), {
                    "aria-label": (q = b.titleText) != null ? q : "",
                    onPress: function() {
                        o == null ? void 0 : o({
                            ctaType: l,
                            eventName: "open_xma_attachment_cta",
                            threadKey: m,
                            threadType: p
                        });
                        d("logXMACtaClicked").logXMACtaClicked({
                            cta: n,
                            loggingDetails: s,
                            source: 1
                        });
                        return r()
                    },
                    children: e
                });
            case "DISABLED_BUTTON":
                return i.jsx(c("CometPressable.react"), {
                    "aria-label": (q = b.titleText) != null ? q : "",
                    disabled: !0,
                    children: e
                });
            case "URL":
                q = a.primaryInfo;
                if (!(q.startsWith("http") || q.startsWith("/"))) return e;
                var t = a.secondaryInfo;
                return i.jsx(c("MWXMALink.react"), {
                    href: q,
                    label: (q = b.titleText) != null ? q : h._("__JHASH__jBGVUqdMJ6C__JHASH__").toString(),
                    onClick: function() {
                        return d("logXMACtaClicked").logXMACtaClicked({
                            cta: n,
                            loggingDetails: t,
                            source: 1
                        })
                    },
                    target: "_blank",
                    xstyle: j.link,
                    children: e
                });
            case "DEEPLINK":
                b = a.primaryInfo;
                var u = b.loggingDetails;
                q = b.threadKey;
                var v = d("MWInboxRouteBuilder.bs").buildURL({
                    thread_key: d("I64").to_string(q)
                });
                return i.jsx(c("MWXMAAttachmentActionTriggerWithOpenChatTab.react"), {
                    threadKey: q,
                    children: function(a) {
                        return i.jsx(c("MWXMALink.react"), {
                            href: v,
                            onClick: function(b) {
                                a(v, b);
                                return d("logXMACtaClicked").logXMACtaClicked({
                                    cta: n,
                                    loggingDetails: u,
                                    source: 1
                                })
                            },
                            preventLocalNavigation: !0,
                            children: e
                        })
                    }
                });
            case "CTA_ERROR":
                c("recoverableViolation")(a.primaryInfo, a.secondaryInfo);
                return e;
            case "NOT_SUPPORTED":
                return e
        }
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentActionTrigger.react", ["MWXMAAttachmentActionTriggerDefault.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.attachmentItem,
            d = a.children;
        a = a.isPressable;
        if (a) return h.jsx(c("MWXMAAttachmentActionTriggerDefault.react"), {
            attachmentItem: b,
            children: d
        });
        else return d
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWUseArePollsEnabled", ["MWCMIsAnyCMThread", "MWLSThread", "gkx"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        a = d("MWLSThread").useThread(a);
        var b = c("gkx")("1845815");
        return b || a != null && c("MWCMIsAnyCMThread")(a.threadType)
    }
    g["default"] = a
}), 98);
__d("useMWCMPollsV1Enabled", ["LSIntEnum", "LSThreadBitOffset", "MWLSThread"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        a = (a = d("MWLSThread").useThread(a, function(a) {
            return {
                pollsV1UICapability: d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(158), a)
            }
        })) != null ? a : {};
        a = a.pollsV1UICapability;
        return a === !0
    }
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemCtaButton.react", ["I64", "JSResourceForInteraction", "LSMessagingThreadTypeUtil", "MDSButton.react", "MWCMIsAnyCMThread", "MWLSThread", "MWUseArePollsEnabled", "MWXLazyPopoverTrigger.react", "MWXMAAttachmentActionTriggerWithOpenChatTab.react", "MWXMAAttachmentItemCtaButtonBase.react", "MWXTooltip.react", "MessengerWebUXLogger", "logXMACtaClicked", "react", "useGetMWXMACtaRegistryHandler", "useMWCMPollsV1Enabled", "useMWCMPollsV2Enabled"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = c("JSResourceForInteraction")("MWCMEventRSVPXMADropdownMenu.react").__setRef("MWXMAAttachmentItemCtaButton.react");

    function a(a) {
        var b = a.attachmentId,
            e = a.ctaIconType,
            f = a.ctaId,
            g = a.messageId,
            j = a.threadKey,
            k = a.title;
        a = a.type;
        var l = c("MessengerWebUXLogger") == null ? void 0 : c("MessengerWebUXLogger").useInteractionLogger(),
            m = d("MWLSThread").useThread(j, function(a) {
                return a.threadType
            }),
            n = {
                ctaType: a,
                eventName: "open_xma_attachment_cta",
                threadKey: j,
                threadType: m
            };
        m = c("useGetMWXMACtaRegistryHandler")();
        var o = c("MWUseArePollsEnabled")(j),
            p = c("useMWCMPollsV1Enabled")(j),
            q = c("useMWCMPollsV2Enabled")(j),
            r = d("MWLSThread").useThread(j, function(a) {
                return c("MWCMIsAnyCMThread")(a.threadType)
            }),
            s = d("MWLSThread").useThread(j, function(a) {
                return d("LSMessagingThreadTypeUtil").isUnjoinedDiscoverablePublicBroadcastChannel(a.threadType) || d("LSMessagingThreadTypeUtil").isSocialChannelUnjoined(a.threadType)
            });
        if (!o && (a === "xma_poll_details_button" || a === "xma_poll_details_card")) return null;
        return ((o = r) != null ? o : !1) && !p && !q && a === "xma_poll_details_button" ? null : h.jsx(c("MWXMAAttachmentItemCtaButtonBase.react"), {
            attachmentId: b,
            ctaIconType: e,
            ctaId: f,
            getCtaRegistryHandler: m,
            messageId: g,
            renderButtonActionEventButton: function(a, b, e, f, g, j) {
                return h.jsx(c("MWXLazyPopoverTrigger.react"), {
                    align: "stretch",
                    popoverProps: {
                        eventId: d("I64").of_string(a),
                        threadKey: b
                    },
                    popoverResource: i,
                    popoverType: "menu",
                    position: "above",
                    preloadTrigger: "button",
                    children: function(a, b, i, k, m, o) {
                        return h.jsx(c("MWXTooltip.react"), {
                            tooltip: e,
                            children: h.jsx(c("MDSButton.react"), {
                                icon: f,
                                label: e,
                                onHoverIn: k,
                                onHoverOut: m,
                                onPress: function() {
                                    l == null ? void 0 : l(n);
                                    d("logXMACtaClicked").logXMACtaClicked({
                                        cta: g,
                                        loggingDetails: j,
                                        source: 2
                                    });
                                    return b()
                                },
                                onPressIn: o,
                                ref: a,
                                type: "secondary"
                            })
                        })
                    }
                })
            },
            renderButtonActionNonEventButton: function(a, b, e, f, g) {
                return h.jsx(c("MWXTooltip.react"), {
                    tooltip: a,
                    children: h.jsx(c("MDSButton.react"), {
                        disabled: s,
                        icon: b,
                        label: a,
                        onPress: function() {
                            l == null ? void 0 : l(n);
                            d("logXMACtaClicked").logXMACtaClicked({
                                cta: e,
                                loggingDetails: f,
                                source: 2
                            });
                            return g()
                        },
                        type: "secondary"
                    })
                })
            },
            renderDeeplinkActionButton: function(a, b, e, f, g) {
                return h.jsx(c("MWXTooltip.react"), {
                    tooltip: a,
                    children: h.jsx(c("MWXMAAttachmentActionTriggerWithOpenChatTab.react"), {
                        threadKey: b,
                        children: function(b) {
                            return h.jsx(c("MDSButton.react"), {
                                label: a,
                                linkProps: {
                                    preventLocalNavigation: !0,
                                    url: g
                                },
                                onPress: function(a) {
                                    b(g, a);
                                    l == null ? void 0 : l(n);
                                    return d("logXMACtaClicked").logXMACtaClicked({
                                        cta: e,
                                        loggingDetails: f,
                                        source: 2
                                    })
                                },
                                type: "secondary"
                            })
                        }
                    })
                })
            },
            renderDisabledButtonActionButton: function(a) {
                return h.jsx(c("MWXTooltip.react"), {
                    tooltip: a,
                    children: h.jsx(c("MDSButton.react"), {
                        disabled: !0,
                        label: a,
                        type: "secondary"
                    })
                })
            },
            renderUrlActionButton: function(a, b, e, f, g) {
                return h.jsx(c("MWXTooltip.react"), {
                    tooltip: a,
                    children: h.jsx(c("MDSButton.react"), {
                        icon: b,
                        label: k,
                        linkProps: {
                            target: "_blank",
                            url: g
                        },
                        onPress: function() {
                            l == null ? void 0 : l(n), d("logXMACtaClicked").logXMACtaClicked({
                                cta: e,
                                loggingDetails: f,
                                source: 2
                            })
                        },
                        type: "secondary"
                    })
                })
            },
            threadKey: j,
            title: k,
            type: a
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemListItems.react", ["I64", "MWChatPollFacepile.bs", "MWLSThreadDisplayContext", "MWPColorUtils", "MWPThreadTheme.bs", "MWXMAAttachmentItemListItemsBase.react", "MWXText.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        a = a.attachment;
        var b = d("MWPThreadTheme.bs").useHook(),
            e = b.threadTheme.fallbackColor,
            f = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        return h.jsx(c("MWXMAAttachmentItemListItemsBase.react"), {
            attachment: a,
            renderDefaultListItem: function(a) {
                return h.jsx("li", {
                    className: "x1r4l5d8 x16u764g x14vqqas xsag5q8 xz9dl7a",
                    children: h.jsxs("div", {
                        children: [h.jsx(d("MWChatPollFacepile.bs").make, {
                            contactWithBorder: !1,
                            contacts: a.contacts.map(function(a) {
                                return {
                                    name: void 0,
                                    profile_picture_url: a.url
                                }
                            }),
                            countOverride: a.totalCount != null ? d("I64").to_int32(a.totalCount) : void 0,
                            limit: 9,
                            optionId: a.id,
                            overflowStyle: "overlayLastPhoto",
                            size: "large"
                        }), a.titleText != null ? h.jsx("div", {
                            className: "xsgj6o6 x1xmf6yo",
                            children: h.jsx(c("MWXText.react"), {
                                color: "secondary",
                                numberOfLines: 2,
                                type: "body4",
                                children: a.titleText
                            })
                        }) : null]
                    })
                }, d("I64").to_string(a.id))
            },
            renderPercentageListItem: function(a, b) {
                return h.jsxs("li", {
                    className: "x14vqqas",
                    children: [h.jsxs("div", {
                        className: "x78zum5 x1qughib",
                        children: [a.titleText != null ? h.jsx(c("MWXText.react"), {
                            numberOfLines: f === "Inbox" ? 3 : 1,
                            type: "headline4",
                            children: a.titleText
                        }) : null, h.jsx("div", {
                            className: "x1i64zmx",
                            children: h.jsx(d("MWChatPollFacepile.bs").make, {
                                contacts: a.contacts.map(function(a) {
                                    return {
                                        name: void 0,
                                        profile_picture_url: a.url
                                    }
                                }),
                                countOverride: a.totalCount != null ? d("I64").to_int32(a.totalCount) : void 0,
                                direction: "reversed",
                                gap: "negative",
                                optionId: a.id,
                                size: "small"
                            })
                        })]
                    }), h.jsx("div", {
                        className: "x1wpzbip x1lq5wgf xgqcy7u x30kzoy x9jhf4c xdk7pt xod5an3 x1xmf6yo",
                        children: h.jsx("div", {
                            className: "x1lq5wgf xgqcy7u x30kzoy x9jhf4c xdk7pt",
                            style: {
                                backgroundColor: d("MWPColorUtils").int64ToHex(e),
                                width: d("I64").to_string(b) + "%"
                            }
                        })
                    })]
                }, d("I64").to_string(a.id))
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemMainText.react", ["MDSTextPairing.react", "MWXMAIconParser.react", "MWXText.react", "qex", "react", "stylex", "xmaLayouts"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            description: {
                paddingTop: "x889kno",
                $$css: !0
            },
            hscroll: {
                paddingEnd: "xsyo7zv",
                paddingStart: "x16hj40l",
                $$css: !0
            },
            root: {
                maxWidth: "x193iq5w",
                whiteSpace: "x126k92a",
                width: "xh8yej3",
                $$css: !0
            },
            titleText: {
                marginBottom: "xahult9",
                $$css: !0
            },
            withIcon: {
                paddingBottom: "xg8j3zb",
                paddingTop: "xyqdw3p",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.attachment,
            e = a.attachmentItem,
            f = a.bodyLineLimit,
            g = a.getFaviconUrlXMA,
            j = a.headlineLineLimit,
            k = a.isHscroll,
            l = a.subtitleText,
            m = a.title;
        a = a.xmaLayout;
        b = d("MWXMAIconParser.react").parse((g = g(b, e)) != null ? g : "");
        e = c("qex")._("1501");
        g = m !== "" ? e == null || e !== 13 ? h.jsx(c("MDSTextPairing.react"), {
            headline: m,
            headlineLineLimit: j,
            level: 4,
            testid: void 0
        }) : h.jsx(c("MWXText.react"), {
            testid: void 0,
            type: "bodyLink4",
            children: m
        }) : null;
        j = l !== "" ? e == null || e !== 13 ? h.jsx("div", {
            className: "x889kno",
            children: h.jsx(c("MDSTextPairing.react"), {
                body: l,
                bodyColor: "secondary",
                bodyLineLimit: f,
                level: 4
            })
        }) : h.jsx("div", {
            className: "x889kno",
            children: h.jsx(c("MWXText.react"), {
                type: "meta4",
                children: l
            })
        }) : null;
        return h.jsxs("div", {
            className: c("stylex")(i.root, b == null ? k ? i.hscroll : !1 : i.withIcon),
            children: [a === d("xmaLayouts").XMA_LAYOUTS.UNIFIED_LAYOUT && g !== null ? h.jsx("div", {
                className: "xahult9",
                children: g
            }) : g, j]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAEventFacepiles.react", ["CometFacepile.react", "I64", "ReQL", "ReQLSuspense", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.count,
            e = a.ctaId;
        a = a.urls;
        var g = e ? d("I64").to_string(e) : "",
            i = c("useReStore")();
        g = d("ReQLSuspense").useFirst(function() {
            return e != null ? d("ReQL").fromTableAscending(i.table("attachment_ctas")).getKeyRange(e) : d("ReQL").empty()
        }, [i, g], f.id + ":48");
        var j = b != null ? d("I64").le(b, d("I64").of_int32(9)) : !1;
        g = j ? void 0 : {
            target: "_blank",
            url: g == null ? void 0 : g.actionUrl
        };
        j = j ? a.map(function(a) {
            return {
                source: {
                    uri: a
                }
            }
        }) : a.slice(0, 9).map(function(a) {
            return {
                source: {
                    uri: a
                }
            }
        });
        return j.length > 0 ? h.jsx("div", {
            className: "x78zum5 xl56j7k",
            "data-testid": void 0,
            children: h.jsx("div", {
                className: "x78zum5 xdt5ytf x193iq5w x889kno x1a8lsjc",
                role: "gridcell",
                children: h.jsx(c("CometFacepile.react"), {
                    count: b != null ? d("I64").to_int32(b) : a.length,
                    isOverlapping: !0,
                    items: j,
                    linkProps: g,
                    size: 32
                })
            })
        }) : null
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemBody.react", ["LSMediaUrl.bs", "MDSTextPairing.react", "MWXMAAttachmentActionTrigger.react", "MWXMAAttachmentItemCtaButton.react", "MWXMAAttachmentItemIcon.react", "MWXMAAttachmentItemListItems.react", "MWXMAAttachmentItemMainText.react", "MWXMAEventFacepiles.react", "MWXMAIconParser.react", "react", "stylex", "xmaLayouts"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            buttonsOnly: {
                marginTop: "xdj266r",
                $$css: !0
            },
            buttonsWrapper: {
                justifySelf: "x1qab1bc",
                marginTop: "x14vqqas",
                $$css: !0
            },
            description: {
                display: "x78zum5",
                flexDirection: "x1q0g3np",
                flexGrow: "x1iyjqo2",
                marginEnd: "xw3qccf",
                $$css: !0
            },
            descriptionSubtitleText: {
                display: "x78zum5",
                justifyContent: "xl56j7k",
                paddingBottom: "xwib8y2",
                paddingTop: "x889kno",
                $$css: !0
            },
            descriptionText: {
                display: "x78zum5",
                flexDirection: "x1q0g3np",
                flexGrow: "x1iyjqo2",
                justifyContent: "xl56j7k",
                marginEnd: "xw3qccf",
                $$css: !0
            },
            hasFavicon: {
                paddingEnd: "x4uap5",
                paddingStart: "xkhd6sd",
                $$css: !0
            },
            root: {
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                flexGrow: "x1iyjqo2",
                justifyContent: "xl56j7k",
                marginTop: "x14vqqas",
                marginEnd: "xq8finb",
                marginBottom: "xod5an3",
                marginStart: "x16n37ib",
                minHeight: "xisnujt",
                $$css: !0
            },
            rootWithHeaderAndNoMedia: {
                marginTop: "xdj266r",
                $$css: !0
            },
            secondaryDescriptionText: {
                marginBottom: "xod5an3",
                $$css: !0
            },
            xmaUnifiedtyles: {
                marginTop: "x14vqqas",
                marginEnd: "xktsk01",
                marginBottom: "x1yztbdb",
                marginStart: "x1d52u69",
                $$css: !0
            }
        };

    function a(a) {
        var b, e = a.attachment,
            f = a.attachmentItem,
            g = a.bodyLineLimit,
            m = a.getFaviconUrlXMA,
            n = a.headlineLineLimit,
            o = a.isHscroll,
            p = a.isPressable,
            q = a.isStandalone;
        a = a.xmaLayout;
        b = d("MWXMAIconParser.react").parse((b = m(e, f)) != null ? b : "");
        var r = f.titleText == null && f.subtitleText == null && b == null,
            s = f.titleText != null || !q ? f.titleText : e.titleText,
            t = f.subtitleText != null || !q ? f.subtitleText : e.subtitleText;
        m = s == null && t == null ? [] : [h.jsx(c("MWXMAAttachmentActionTrigger.react"), {
            attachmentItem: f,
            isPressable: p,
            children: h.jsxs("div", {
                className: c("stylex")(i.description, b == null ? !1 : i.hasFavicon),
                children: [h.jsx(c("MWXMAAttachmentItemIcon.react"), {
                    icon: b
                }), h.jsx(c("MWXMAAttachmentItemMainText.react"), {
                    attachment: e,
                    attachmentItem: f,
                    bodyLineLimit: g,
                    getFaviconUrlXMA: m,
                    headlineLineLimit: n,
                    isHscroll: o,
                    isStandalone: q,
                    subtitleText: (p = t) != null ? p : "",
                    title: (b = s) != null ? b : "",
                    xmaLayout: a
                })]
            })
        })];
        o = e.listItemsDescriptionText;
        q = e.listItemsDescriptionSubtitleText;
        t = d("LSMediaUrl.bs").Attachment.avatarViewUrlList(e);
        p = c("MWXMAEventFacepiles.react") && t.length !== 0 ? [h.jsx(c("MWXMAEventFacepiles.react"), {
            count: e.avatarCount,
            ctaId: f.attachmentCta1Id,
            urls: t
        })] : [];
        s = e.cta2IconType;
        b = e.cta3IconType;
        t = e.listItemId1;
        var u = e.listItemsSecondaryDescriptionText,
            v = e.messageId,
            w = e.threadKey,
            x = f.attachmentCta1Id,
            y = f.attachmentCta2Id,
            z = f.attachmentCta3Id,
            A = f.cta1IconType,
            B = f.cta1Title,
            C = f.cta1Type,
            D = f.cta2Title,
            E = f.cta2Type,
            F = f.cta3Title,
            G = f.cta3Type;
        r = C != null && B != null && x != null ? [h.jsxs("div", {
            className: c("stylex")(i.buttonsWrapper, r ? i.buttonsOnly : !1),
            children: [h.jsx(c("MWXMAAttachmentItemCtaButton.react"), {
                attachmentId: e.attachmentFbid,
                ctaIconType: A,
                ctaId: x,
                messageId: v,
                threadKey: w,
                title: B,
                type: C
            }), E != null && D != null && y != null ? h.jsxs(h.Fragment, {
                children: [h.jsx(c("MWXMAAttachmentItemCtaButton.react"), {
                    attachmentId: e.attachmentFbid,
                    ctaIconType: s,
                    ctaId: y,
                    messageId: v,
                    threadKey: w,
                    title: D,
                    type: E
                }), G != null && F != null && z != null ? h.jsx(c("MWXMAAttachmentItemCtaButton.react"), {
                    ctaIconType: b,
                    ctaId: z,
                    messageId: v,
                    threadKey: w,
                    title: F,
                    type: G
                }) : null]
            }) : null]
        })] : [];
        A = o != null ? [h.jsx(j, {
            headlineLineLimit: n,
            listItemsDescriptionText: o
        })] : [];
        x = q != null ? [h.jsx(k, {
            bodyLineLimit: g,
            value: q
        })] : [];
        B = t != null ? [h.jsx(c("MWXMAAttachmentItemListItems.react"), {
            attachment: e
        })] : [];
        C = u != null ? [h.jsx(l, {
            bodyLineLimit: g,
            listItemsSecondaryDescriptionText: u
        })] : [];
        s = [m, A, x, p, B, C, r].reduce(function(a, b) {
            return a.concat(b)
        }, []);
        y = d("LSMediaUrl.bs").Attachment.previewUrl(e) != null || d("LSMediaUrl.bs").AttachmentItem.previewUrl(f) != null || d("LSMediaUrl.bs").AttachmentItem.playableUrl(f) != null;
        return s.length === 0 ? null : h.jsx("div", {
            className: c("stylex")(i.root, a === d("xmaLayouts").XMA_LAYOUTS.UNIFIED_LAYOUT ? i.xmaUnifiedtyles : !1, a !== d("xmaLayouts").XMA_LAYOUTS.UNIFIED_LAYOUT && !y && e.headerTitle != null ? i.rootWithHeaderAndNoMedia : !1),
            children: s.map(function(a, b) {
                return h.jsx(h.Fragment, {
                    children: a
                }, String(b))
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function j(a) {
        var b = a.headlineLineLimit;
        a = a.listItemsDescriptionText;
        return h.jsx("div", {
            className: "x78zum5 x1q0g3np x1iyjqo2 xl56j7k xw3qccf",
            children: h.jsx(c("MDSTextPairing.react"), {
                headline: a,
                headlineLineLimit: b,
                level: 4,
                textAlign: "center"
            })
        })
    }
    j.displayName = j.name + " [from " + f.id + "]";

    function k(a) {
        var b = a.bodyLineLimit;
        a = a.value;
        return h.jsx("div", {
            className: "x78zum5 xl56j7k xwib8y2 x889kno",
            children: h.jsx(c("MDSTextPairing.react"), {
                body: a,
                bodyColor: "secondary",
                bodyLineLimit: b,
                level: 4,
                textAlign: "center"
            })
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function l(a) {
        var b = a.bodyLineLimit;
        a = a.listItemsSecondaryDescriptionText;
        return h.jsx("div", {
            className: "xod5an3",
            children: h.jsx(c("MDSTextPairing.react"), {
                body: a,
                bodyColor: "secondary",
                bodyLineLimit: b,
                level: 4
            })
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemAttribution.react", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        a = a.attachment;
        var b = a.attributionAppIcon;
        a = a.attributionAppName;
        return b != null && a != null ? h.jsxs("div", {
            className: "x6s0dn4 x1gn5b1j x230xth x78zum5 x1rfph6h x1iorvi4 xsyo7zv xjkvuk6 x16hj40l",
            children: [h.jsx("img", {
                className: "x14yjl9h xudhj91 x18nykt9 xww2gxu xlup9mm x1kky2od",
                src: b
            }), h.jsx("span", {
                className: "xzsf02u x1nxh6w3 x1mnrxsn x13faqbe",
                children: a
            })]
        }) : null
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemImage.react", ["CometImageCover.react", "I64", "LSIntEnum", "MNLSXMALayoutType", "cr:886", "react", "xmaLayouts"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var e = a.attachment,
            f = a.attachmentItem,
            g = a.cardWidth,
            i = a.isStandalone,
            j = a.previewUrl;
        a = a.xmaLayout;
        var k = f.previewWidth == null ? 0 : d("I64").to_int32(f.previewWidth),
            l = f.previewHeight == null ? 0 : d("I64").to_int32(f.previewHeight),
            m = f.defaultCtaType;
        m === "xma_montage_share" ? m = !0 : m = f.imageUrl == null ? i : k === l;
        f = k !== 0 ? l !== 0 ? k / l : 0 : 0;
        e.xmaLayoutType != null && d("I64").equal(e.xmaLayoutType, d("LSIntEnum").ofNumber(c("MNLSXMALayoutType").STANDARD_DXMA)) && (f = 2);
        i = g;
        g = {
            height: (f === 0 ? 106 : i / f).toString() + "px",
            width: i.toString() + "px"
        };
        var n = {};
        a === d("xmaLayouts").XMA_LAYOUTS.UNIFIED_LAYOUT && (l > k && (g.height = i.toString() + "px", g.width = (f === 0 ? 106 : i * f).toString() + "px"), n = babelHelpers["extends"]({
            aspectRatio: void 0,
            flexGrow: "0",
            margin: "auto"
        }, g));
        if (j.length === 0 || j === "") return null;
        if (b("cr:886") && e.gatingTitle != null && e.gatingType != null) return h.jsx(b("cr:886"), {
            gatingTitle: e.gatingTitle,
            gatingType: e.gatingType,
            mediaDimension: g,
            previewUrl: j
        });
        return m ? h.jsx("div", {
            className: "x78zum5 x1n2onr6 xh8yej3",
            children: h.jsx("img", {
                alt: "",
                src: j,
                style: babelHelpers["extends"]({
                    aspectRatio: f,
                    flexGrow: "1",
                    height: "auto",
                    maxWidth: "100%",
                    objectFit: "cover"
                }, n)
            })
        }) : h.jsx("div", {
            className: "x78zum5 x1n2onr6 xh8yej3",
            style: g,
            children: h.jsx(c("CometImageCover.react"), {
                alt: "",
                src: j,
                style: {
                    bottom: "0",
                    left: "0",
                    position: "absolute",
                    right: "0",
                    top: "0"
                }
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemDefaultPreview.react", ["CometObjectFitContainer.react", "CometPlaceholder.react", "I64", "MDSGlimmer.react", "MWLSThreadDisplayContext", "MWPBaseXMAAttachmentItem.bs", "MWRollcallXMAAttachmentItemImage.react", "MWXMAAttachmentActionTrigger.react", "MWXMAAttachmentItemAttribution.react", "MWXMAAttachmentItemImage.react", "deferredLoadComponent", "react", "requireDeferredForDisplay"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = c("deferredLoadComponent")(c("requireDeferredForDisplay")("MWChatVideoPlayer.react").__setRef("MWXMAAttachmentItemDefaultPreview.react")),
        j = {
            glimmer: {
                height: "x5yr21d",
                position: "x10l6tqk",
                width: "xh8yej3",
                $$css: !0
            },
            root: {
                display: "x78zum5",
                height: "x5yr21d",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                position: "x10l6tqk",
                width: "xh8yej3",
                $$css: !0
            }
        };

    function a(a) {
        var b, e = a.attachment,
            f = a.attachmentItem,
            g = a.cardWidth,
            j = a.getPlayableUrl,
            k = a.getPreviewUrlXMA,
            m = a.isPressable,
            n = a.isStandalone;
        a = a.xmaLayout;
        b = (b = e.shouldAutoplayVideo) != null ? b : !1;
        var o = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        o = o === "Inbox";
        o = d("MWPBaseXMAAttachmentItem.bs").getXMAAttachmentItemPreview({
            attachment: e,
            attachmentItem: f,
            getPreviewUrl: k,
            preferLargePreview: o
        });
        k = k(e, f);
        j = j(e, f);
        switch (o.TAG) {
            case 0:
                return j == null ? null : h.jsxs(c("MWXMAAttachmentActionTrigger.react"), {
                    attachmentItem: f,
                    isPressable: m,
                    children: [h.jsx(l, {
                        attachmentItem: f,
                        children: h.jsx(i, {
                            controls: b ? "none" : "mwchat",
                            fbid: f.attachmentFbid,
                            hideExpandButton: !1,
                            originalHeight: f.previewHeight != null ? d("I64").to_int32(f.previewHeight) : 0,
                            originalWidth: f.previewWidth != null ? d("I64").to_int32(f.previewWidth) : 0,
                            sdSrc: j
                        })
                    }), b ? h.jsx(c("MWXMAAttachmentItemAttribution.react"), {
                        attachment: e
                    }) : null]
                });
            case 1:
                if (k == null) return null;
                if (f.defaultCtaType === "xma_roll_call_open_viewer") {
                    return h.jsx(c("MWRollcallXMAAttachmentItemImage.react"), {
                        previewUrl: k,
                        shouldBlur: (o = e.shouldBlurSubattachments) != null ? o : !1
                    })
                }
                return h.jsx(c("MWXMAAttachmentActionTrigger.react"), {
                    attachmentItem: f,
                    isPressable: m,
                    children: h.jsx(c("MWXMAAttachmentItemImage.react"), {
                        attachment: e,
                        attachmentItem: f,
                        cardWidth: g,
                        isStandalone: n,
                        previewUrl: k,
                        xmaLayout: a
                    })
                });
            case 2:
                return null
        }
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function k() {
        return h.jsx("div", {
            className: "x78zum5 x5yr21d x6ikm8r x10wlt62 x10l6tqk xh8yej3",
            children: h.jsx(c("MDSGlimmer.react"), {
                index: 0,
                xstyle: j.glimmer
            })
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function l(a) {
        var b, e = a.attachmentItem;
        a = a.children;
        b = d("I64").to_int32((b = e.previewWidth) != null ? b : d("I64").zero);
        e = d("I64").to_int32((e = e.previewHeight) != null ? e : d("I64").zero);
        b = b !== 0 ? e !== 0 ? b / e : 0 : 0;
        e = e > 250 && b < .8;
        return h.jsx(c("CometObjectFitContainer.react"), {
            contentAspectRatio: e ? .8 : b,
            children: h.jsx(c("CometPlaceholder.react"), {
                fallback: h.jsx(k, {}),
                children: a
            })
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemHeaderIcon.bs", ["CometImageCover.react", "CometSkittleIcon.react", "react", "xmaLayouts"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.icon;
        a = a.xmaLayout;
        a = a === void 0 ? d("xmaLayouts").XMA_LAYOUTS.DEFAULT : a;
        if (b.TAG === 1) {
            a = a === d("xmaLayouts").XMA_LAYOUTS.UNIFIED_LAYOUT ? "40px" : "32px";
            return h.jsx("div", {
                className: "x6s0dn4 x78zum5 x5yr21d xq8finb",
                children: h.jsx(c("CometImageCover.react"), {
                    alt: "Icon for this message's header",
                    src: b._0,
                    style: {
                        borderRadius: "50%",
                        height: a,
                        width: a
                    }
                })
            })
        }
        return h.jsx("div", {
            className: "x6s0dn4 x78zum5 x5yr21d xq8finb",
            children: h.jsx(c("CometSkittleIcon.react"), {
                color: b._0.color,
                icon: b._0.icon,
                size: 36
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemHeader.react", ["MDSTextPairing.react", "MWXMAAttachmentItemHeaderIcon.bs", "MWXMAIconParser.react", "MWXText.react", "react", "stylex", "xmaLayouts"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            root: {
                alignItems: "x6s0dn4",
                display: "x78zum5",
                marginTop: "x14vqqas",
                marginEnd: "xq8finb",
                marginBottom: "xod5an3",
                marginStart: "x16n37ib",
                $$css: !0
            },
            withBorder: {
                borderBottom: "xua58t2",
                marginTop: "xdj266r",
                marginEnd: "x11i5rnm",
                marginBottom: "xat24cr",
                marginStart: "x1mh8g0r",
                paddingStart: "x1swvt13",
                paddingEnd: "x1pi30zi",
                paddingTop: "xz9dl7a",
                paddingBottom: "xsag5q8",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.attachment,
            e = a.getHeaderUrlXMA;
        a = a.xmaLayout;
        a = a === void 0 ? d("xmaLayouts").XMA_LAYOUTS.DEFAULT : a;
        var f = b.headerTitle;
        if (f == null) return null;
        var g = b.headerSubtitleText;
        e = e(b);
        b = e == null ? void 0 : d("MWXMAIconParser.react").parse(e);
        e = a === d("xmaLayouts").XMA_LAYOUTS.UNIFIED_LAYOUT;
        return h.jsxs("div", {
            className: c("stylex")(i.root, e ? i.withBorder : !1),
            children: [b != null && h.jsx(c("MWXMAAttachmentItemHeaderIcon.bs"), {
                icon: b,
                xmaLayout: a
            }), e && g !== null && g != null && g !== "" ? h.jsx(c("MDSTextPairing.react"), {
                headline: f,
                level: 4,
                meta: g
            }) : h.jsx(c("MWXText.react"), {
                type: "bodyLink3",
                children: f
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemDefaultXMAContent.react", ["MWXMAAttachmentItemBody.react", "MWXMAAttachmentItemDefaultPreview.react", "MWXMAAttachmentItemHeader.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.attachment,
            d = a.attachmentItem,
            e = a.bodyLineLimit,
            f = a.cardWidth,
            g = a.getFaviconUrlXMA,
            i = a.getHeaderUrlXMA,
            j = a.getPlayableUrl,
            k = a.getPreviewUrlXMA,
            l = a.headlineLineLimit,
            m = a.isHscroll,
            n = a.isPressable,
            o = a.isStandalone;
        a = a.xmaLayout;
        var p = b.defaultCtaType;
        return p === "xma_montage_share" || p === "xma_roll_call_open_viewer" ? h.jsx(c("MWXMAAttachmentItemDefaultPreview.react"), {
            attachment: b,
            attachmentItem: d,
            cardWidth: f,
            getPlayableUrl: j,
            getPreviewUrlXMA: k,
            isPressable: n,
            isStandalone: o,
            xmaLayout: a
        }) : h.jsxs(h.Fragment, {
            children: [h.jsx(c("MWXMAAttachmentItemHeader.react"), {
                attachment: b,
                getHeaderUrlXMA: i,
                xmaLayout: a
            }), h.jsx(c("MWXMAAttachmentItemDefaultPreview.react"), {
                attachment: b,
                attachmentItem: d,
                cardWidth: f,
                getPlayableUrl: j,
                getPreviewUrlXMA: k,
                isPressable: n,
                isStandalone: o,
                xmaLayout: a
            }), h.jsx(c("MWXMAAttachmentItemBody.react"), {
                attachment: b,
                attachmentItem: d,
                bodyLineLimit: e,
                getFaviconUrlXMA: g,
                getPreviewUrlXMA: k,
                headlineLineLimit: l,
                isHscroll: m,
                isPressable: n,
                isStandalone: o,
                xmaLayout: a
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAPrivateAttachment.react", ["fbt", "ix", "CometIcon.react", "IconSource", "MWXMAAttachmentActionTrigger.react", "MWXText.react", "TetraText.react", "react"], (function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = d("react");

    function a(a) {
        var b = a.attachment,
            c = a.attachmentItem;
        a = a.isPressable;
        var d = b.defaultCtaType;
        return d === "xma_montage_share" ? j.jsx(k, {
            attachment: b
        }) : j.jsxs(j.Fragment, {
            children: [j.jsx(k, {
                attachment: b
            }), j.jsx(l, {
                attachmentItem: c,
                isPressable: a
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function k(a) {
        a = a.attachment;
        var b = new(c("IconSource"))("FB", i("1423125"), 32);
        a = a.defaultCtaType;
        if (a === "xma_montage_share") return j.jsx("div", {
            className: "x6s0dn4 x1qb2erx xjw5052 x78zum5 xdt5ytf x1dr9wh xl56j7k x2b8uid xni59qk",
            children: j.jsx("div", {
                className: "x14vqqas xq8finb xod5an3 x16n37ib",
                children: j.jsx(c("CometIcon.react"), {
                    icon: b
                })
            })
        });
        a = h._("__JHASH__k6ImVzA0WcG__JHASH__");
        return j.jsxs("div", {
            className: "x6s0dn4 x99fzhk xzudefj x78zum5 xdt5ytf x1iu8u7t xl56j7k x2b8uid xh8yej3",
            children: [j.jsx("div", {
                className: "x14vqqas xq8finb xod5an3 x16n37ib",
                children: j.jsx(c("CometIcon.react"), {
                    icon: b
                })
            }), j.jsx(c("TetraText.react"), {
                color: "white",
                type: "bodyLink4",
                children: a
            })]
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function l(a) {
        var b = a.attachmentItem;
        a = a.isPressable;
        return j.jsx(c("MWXMAAttachmentActionTrigger.react"), {
            attachmentItem: b,
            isPressable: a,
            children: j.jsx("div", {
                className: "x78zum5 x1q0g3np x1iyjqo2 xw3qccf",
                children: j.jsx("div", {
                    className: "x78zum5 xdt5ytf x1iyjqo2 xl56j7k x14vqqas xq8finb xod5an3 x16n37ib x193iq5w xisnujt x1jzhcrs xh8yej3",
                    children: j.jsx(c("MWXText.react"), {
                        type: "meta4",
                        children: h._("__JHASH__N1DOsSnTIti__JHASH__")
                    })
                })
            })
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItem.react", ["LSIntEnum", "LSMediaUrl.bs", "MWLSThreadDisplayContext", "MWPBaseXMAAttachmentItem.bs", "MWPThreadCapabilitiesContext", "MWXMAAttachmentActionTrigger.react", "MWXMAAttachmentItemDefaultXMAContent.react", "MWXMAPrivateAttachment.react", "react", "stylex", "xmaLayouts"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useCallback,
        j = {
            root: {
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                height: "x5yr21d",
                $$css: !0
            },
            withBorder: {
                borderTop: "xzg4506",
                borderEnd: "xycxndf",
                borderBottom: "xua58t2",
                borderStart: "x4xrfw5",
                $$css: !0
            }
        },
        k = new Set(["xma_rtc_video", "xma_rtc_missed_video", "xma_rtc_missed_group_video", "xma_rtc_ended_video", "xma_rtc_new_video_default", "xma_rtc_new_video_from_fb_share", "xma_rtc_new_video_from_fb_video_share", "xma_rtc_new_video_from_cowatch_share", "xma_rtc_cowatch_start_video"]),
        l = new Set(["xma_rtc_audio", "xma_rtc_missed_audio", "xma_rtc_missed_group_audio", "xma_rtc_ended_audio", "xma_rtc_new_audio_default", "xma_rtc_new_audio_from_fb_share", "xma_rtc_new_audio_from_fb_video_share", "xma_rtc_new_audio_from_cowatch_share"]);

    function a(a) {
        var b = a.attachment,
            e = a.attachmentItem,
            f = a.bodyLineLimit;
        f = f === void 0 ? 3 : f;
        var g = a.cardWidth;
        g = g === void 0 ? 300 : g;
        var m = a.getFaviconUrlXMA,
            n = a.getHeaderUrlXMA;
        n = n === void 0 ? d("LSMediaUrl.bs").Attachment.headerImageUrl : n;
        var o = a.getPlayableUrl,
            p = a.getPreviewUrlXMA,
            q = a.headlineLineLimit;
        q = q === void 0 ? 3 : q;
        var r = a.isHscroll,
            s = a.isStandalone;
        a = a.xmaLayout;
        a = a === void 0 ? d("xmaLayouts").XMA_LAYOUTS.DEFAULT : a;
        var t = d("MWPThreadCapabilitiesContext").useHook(),
            u = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext() === "Inbox",
            v = i(function(a, b) {
                a = d("MWPBaseXMAAttachmentItem.bs").getXMAAttachmentItemPreview({
                    attachment: a,
                    attachmentItem: b,
                    preferLargePreview: u
                });
                switch (a.TAG) {
                    case 0:
                    case 1:
                        return a._0;
                    case 2:
                        return
                }
            }, [u]),
            w = t(d("LSIntEnum").ofNumber(25));
        t = t(d("LSIntEnum").ofNumber(24));
        var x = b.defaultCtaType;
        w = x != null ? l.has(x) && !w || k.has(x) && !t : !1;
        t = (x = b.shouldAutoplayVideo) != null ? x : !1;
        x = t && b.attributionAppIcon != null && b.attributionAppName != null;
        t = c("stylex")(j.root, x ? j.withBorder : !1);
        x = e.attachmentCta1Id != null;
        var y = b.gatingType;
        y = y != null ? y === 4..toString() : !1;
        return h.jsx(c("MWXMAAttachmentActionTrigger.react"), {
            attachmentItem: e,
            isPressable: !x && !w,
            children: h.jsx("div", {
                className: t,
                "data-testid": void 0,
                children: y ? h.jsx(c("MWXMAPrivateAttachment.react"), {
                    attachment: b,
                    attachmentItem: e,
                    isPressable: x && !w
                }) : h.jsx(c("MWXMAAttachmentItemDefaultXMAContent.react"), {
                    attachment: b,
                    attachmentItem: e,
                    bodyLineLimit: f,
                    cardWidth: g,
                    getFaviconUrlXMA: (t = m) != null ? t : function(a, b) {
                        return (a = (a = d("LSMediaUrl.bs").Attachment.faviconUrl(a)) != null ? a : d("LSMediaUrl.bs").AttachmentItem.faviconUrl(b)) != null ? a : ""
                    },
                    getHeaderUrlXMA: n,
                    getPlayableUrl: (y = o) != null ? y : v,
                    getPreviewUrlXMA: (b = p) != null ? b : v,
                    headlineLineLimit: q,
                    isHscroll: r,
                    isPressable: x && !w,
                    isStandalone: s,
                    xmaLayout: a
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentHorizontalItems.react", ["fbt", "CometHScroll.react", "I64", "MWXMAAttachmentItem.react", "qex", "react", "stylex"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = 284,
        k = {
            cardWrapper: {
                backgroundColor: "x2bj2ny",
                height: "x5yr21d",
                width: "xh8yej3",
                $$css: !0
            },
            flexibleContainer: {
                "@media (max-width: 1439px)_maxWidth": "x1bu0bv6",
                "@media (min-width: 1440px)_maxWidth": "x6vbh5p",
                $$css: !0
            },
            scrollerThinTab: {
                width: "xh8yej3",
                $$css: !0
            },
            spacer: {
                marginTop: "xvijh9v",
                $$css: !0
            },
            topElement: {
                borderTopEndRadius: "x13lgxp2",
                borderTopStartRadius: "x168nmei",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.attachmentItems,
            e = a.cardWidth,
            f = a.fullWidthContainer;
        f = f === void 0 ? !1 : f;
        var g = a.hasText,
            l = g === void 0 ? !1 : g,
            m = a.xstyle,
            n = babelHelpers.objectWithoutPropertiesLoose(a, ["attachmentItems", "cardWidth", "fullWidthContainer", "hasText", "xstyle"]);
        return i.jsx("div", {
            className: c("stylex")(!f && k.flexibleContainer, c("qex")._("1499") && k.scrollerThinTab),
            children: i.jsx(d("CometHScroll.react").Container, {
                accessibilityLabel: h._("__JHASH__grvWiY5ySlo__JHASH__"),
                cardWidth: e != null ? {
                    type: "fixed",
                    width: e
                } : {
                    minWidth: j,
                    type: "responsive"
                },
                gap: 8,
                children: b.map(function(a, b) {
                    return i.jsx(d("CometHScroll.react").Child, {
                        expanding: !0,
                        children: i.jsx("div", {
                            className: "x2bj2ny x5yr21d xh8yej3",
                            children: i.jsx("div", {
                                className: c("stylex")(m, b === 0 && l && k.topElement, l && k.spacer),
                                children: i.jsx(c("MWXMAAttachmentItem.react"), babelHelpers["extends"]({}, n, {
                                    attachmentItem: a,
                                    cardWidth: e,
                                    isStandalone: !1
                                }))
                            })
                        })
                    }, d("I64").to_string(a.attachmentIndex))
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentItemIgProfile.react", ["LSMediaUrl.bs", "MWPXMAIgProfile.react", "MWXMAAttachmentActionTrigger.react", "MWXMAAttachmentItemHeader.react", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.attachment,
            e = a.attachmentItems,
            f = a.getHeaderUrlXMA;
        f = f === void 0 ? d("LSMediaUrl.bs").Attachment.headerImageUrl : f;
        a = a.xstyle;
        var g = e[0];
        return h.jsx(c("MWXMAAttachmentActionTrigger.react"), {
            attachmentItem: g,
            isPressable: !0,
            children: h.jsxs("div", {
                className: c("stylex")(a),
                "data-testid": void 0,
                children: [h.jsx(c("MWXMAAttachmentItemHeader.react"), {
                    attachment: b,
                    getHeaderUrlXMA: f
                }), h.jsx(c("MWPXMAIgProfile.react"), {
                    attachmentItems: e
                })]
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentSharedStackFrontCard.react", ["I64", "LSMediaUrl.bs", "MDSText.react", "MWChatPollFacepile.bs", "MWRollCallTimerPill.react", "MWXMAAttachmentItemCtaButton.react", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            ctaContainer: {
                marginTop: "x1xmf6yo",
                $$css: !0
            },
            facepileContainer: {
                marginTop: "xr1yuqi",
                marginEnd: "xkrivgy",
                marginBottom: "x4ii5y1",
                marginStart: "x1gryazu",
                $$css: !0
            },
            frontCard: {
                backgroundColor: "x1jx94hy",
                borderTopStartRadius: "xfh8nwu",
                borderTopEndRadius: "xoqspk4",
                borderBottomEndRadius: "x12v9rci",
                borderBottomStartRadius: "x138vmkv",
                boxShadow: "x28gwc1",
                boxSizing: "x9f619",
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                height: "x5yr21d",
                overflowX: "xw2csxc",
                overflowY: "x1odjw0f",
                paddingTop: "xz9dl7a",
                paddingEnd: "xn6708d",
                paddingBottom: "xsag5q8",
                paddingStart: "x1ye3gou",
                width: "xh8yej3",
                $$css: !0
            },
            titleContainer: {
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                flexGrow: "x1iyjqo2",
                marginTop: "x1xmf6yo",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.attachment;
        a = a.xstyle;
        var e = d("LSMediaUrl.bs").Attachment.avatarViewUrlList(b),
            f = b.countdownTimestampMs;
        f = f != null && !d("I64").equal(f, d("I64").of_int32(0)) ? h.jsx(c("MWRollCallTimerPill.react"), {
            attachment: b
        }) : null;
        var g = null;
        b.attachmentCta1Id != null && b.cta1Title != null && b.cta1Type != null && (g = h.jsx(c("MWXMAAttachmentItemCtaButton.react"), {
            attachmentId: b.attachmentFbid,
            ctaId: b.attachmentCta1Id,
            messageId: b.messageId,
            threadKey: b.threadKey,
            title: b.cta1Title,
            type: b.cta1Type
        }));
        g = h.jsx("div", {
            className: "x1xmf6yo",
            children: g
        });
        return h.jsxs("div", {
            className: c("stylex")(i.frontCard, a),
            children: [f, h.jsx("div", {
                className: "x78zum5 xdt5ytf x1iyjqo2 x1xmf6yo",
                children: h.jsx(c("MDSText.react"), {
                    align: "center",
                    numberOfLines: 3,
                    type: "headlineEmphasized4",
                    children: b.titleText
                })
            }), h.jsx("div", {
                className: "xr1yuqi xkrivgy x4ii5y1 x1gryazu",
                children: h.jsx(d("MWChatPollFacepile.bs").make, {
                    contacts: e.map(function(a) {
                        return {
                            name: void 0,
                            profile_picture_url: a
                        }
                    }),
                    direction: "reversed",
                    gap: "negative",
                    size: "large"
                })
            }), g]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentSharedStackItem.react", ["MWXMAAttachmentItem.react", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            stackItem: {
                borderTopStartRadius: "x107yiy2",
                borderTopEndRadius: "xv8uw2v",
                borderBottomEndRadius: "x1tfwpuw",
                borderBottomStartRadius: "x2g32xy",
                bottom: "x1ey2m1c",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                position: "x10l6tqk",
                start: "x17qophe",
                $$css: !0
            }
        },
        j = 213,
        k = 160;

    function a(a) {
        var b = a.attachment,
            d = a.attachmentItem,
            e = a.index,
            f = a.totalItems;
        a = a.xstyle;
        var g = e % 2 === 0 ? -4 : 4,
            l = 0,
            m = 0;
        switch (e) {
            case 0:
                l = 0;
                m = -12;
                break;
            case 1:
                l = 58;
                m = -20;
                break;
            case 2:
                l = 34;
                m = -28;
                break
        }
        return h.jsx("div", {
            className: c("stylex")(i.stackItem, a),
            style: {
                height: j,
                transform: "rotate(" + g + "deg) translateX(" + l + "px) translateY(" + m + "px)",
                width: k,
                zIndex: f - e
            },
            children: d.previewUrl != null && h.jsx(c("MWXMAAttachmentItem.react"), {
                attachment: b,
                attachmentItem: d,
                cardWidth: k,
                isHscroll: !1,
                isStandalone: !0
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachmentSharedStackLayout.react", ["MWXMAAttachmentSharedStackItem.react", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            centered: {
                marginTop: "xr1yuqi",
                marginEnd: "xkrivgy",
                marginBottom: "x4ii5y1",
                marginStart: "x1gryazu",
                $$css: !0
            },
            stackContainer: {
                position: "x1n2onr6",
                $$css: !0
            },
            stackItem: {
                bottom: "x1ey2m1c",
                position: "x10l6tqk",
                start: "x17qophe",
                $$css: !0
            },
            stackItemFront: {
                start: "x3f4u1h",
                $$css: !0
            }
        },
        j = 213,
        k = 160;

    function a(a) {
        var b = a.attachment,
            d = a.attachmentItems,
            e = a.centered;
        e = e === void 0 ? !1 : e;
        var f = a.children;
        a = a.xstyle;
        var g = d.slice(0, 3);
        d = j + 32;
        var l = k + 64;
        return h.jsxs("div", {
            className: c("stylex")(i.stackContainer, a, e && i.centered),
            style: {
                height: d,
                width: l
            },
            children: [g.map(function(a, d) {
                return h.jsx(c("MWXMAAttachmentSharedStackItem.react"), {
                    attachment: b,
                    attachmentItem: a,
                    index: d,
                    totalItems: g.length
                }, d)
            }), h.jsx("div", {
                className: "x1ey2m1c x10l6tqk x3f4u1h",
                style: {
                    height: j,
                    width: k,
                    zIndex: g.length + 1
                },
                children: f
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXMAAttachment.react", ["I64", "Int64Hooks", "LSIntEnum", "MNLSXMALayoutType", "MWLSThreadDisplayContext", "MWXMAAttachmentHorizontalItems.react", "MWXMAAttachmentItem.react", "MWXMAAttachmentItemIgProfile.react", "MWXMAAttachmentSharedStackFrontCard.react", "MWXMAAttachmentSharedStackLayout.react", "MWXMAAttachmentVerticalLayout.react", "ReQL", "ReQLSuspense", "react", "recoverableViolation", "stylex", "useReStore", "xmaLayouts"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function i(a) {
        return {
            attachmentCta1Id: a.attachmentCta1Id,
            attachmentCta2Id: a.attachmentCta2Id,
            attachmentCta3Id: a.attachmentCta3Id,
            attachmentFbid: a.attachmentFbid,
            attachmentIndex: a.attachmentIndex,
            cta1Title: a.cta1Title,
            cta1Type: a.cta1Type,
            cta2Title: a.cta2Title,
            cta2Type: a.cta2Type,
            cta3Title: a.cta3Title,
            cta3Type: a.cta3Type,
            dashManifest: a.dashManifest,
            defaultActionEnableExtensions: !1,
            defaultActionUrl: void 0,
            defaultButtonType: void 0,
            defaultCtaId: a.defaultCtaId,
            defaultCtaTitle: a.defaultCtaTitle,
            defaultCtaType: a.defaultCtaType,
            defaultWebviewHeightRatio: void 0,
            faviconUrl: a.faviconUrl,
            faviconUrlExpirationTimestampMs: a.faviconUrlExpirationTimestampMs,
            faviconUrlFallback: a.faviconUrlFallback,
            imageUrl: a.imageUrl,
            messageId: a.messageId,
            originalPageSenderId: a.originalPageSenderId,
            playableUrl: a.playableUrl,
            playableUrlExpirationTimestampMs: a.playableUrlExpirationTimestampMs,
            playableUrlFallback: a.playableUrlFallback,
            playableUrlMimeType: a.playableUrlMimeType,
            previewHeight: a.previewHeight,
            previewUrl: a.previewUrl,
            previewUrlExpirationTimestampMs: a.previewUrlExpirationTimestampMs,
            previewUrlFallback: a.previewUrlFallback,
            previewUrlLarge: a.previewUrlLarge,
            previewUrlMimeType: a.previewUrlMimeType,
            previewWidth: a.previewWidth,
            subtitleText: a.subtitleText,
            threadKey: a.threadKey,
            titleText: a.titleText
        }
    }
    var j = {
            cardWidth: {
                maxWidth: "xw5ewwj",
                width: "xh8yej3",
                $$css: !0
            },
            outgoing_xma: {
                marginStart: "x1gryazu",
                $$css: !0
            }
        },
        k = {
            card: {
                borderTopStartRadius: "x1tlxs6b",
                borderTopEndRadius: "x1g8br2z",
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                height: "x5yr21d",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                verticalAlign: "xxymvpz",
                $$css: !0
            },
            opaqueCard: {
                backgroundColor: "xmjcpbm",
                $$css: !0
            },
            rootForHScrollInChatTab: {
                maxWidth: "xaka53j",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.attachment,
            e = a.bodyLineLimit,
            g = a.cardWidth,
            l = a.connectBottom,
            m = a.connectTop,
            n = a.fullWidthContainer;
        n = n === void 0 ? !1 : n;
        var o = a.getFaviconUrlXMA,
            p = a.getHeaderUrlXMA,
            q = a.getPlayableUrl,
            r = a.getPreviewUrlXMA,
            s = a.hasText;
        s = s === void 0 ? !1 : s;
        var t = a.headlineLineLimit,
            u = a.outgoing,
            v = a.xmaLayout;
        v = v === void 0 ? d("xmaLayouts").XMA_LAYOUTS.DEFAULT : v;
        a = a.xstyle;
        var w = c("useReStore")(),
            x = b.attachmentFbid,
            y = b.attachmentType,
            z = b.isBorderless,
            A = b.xmaLayoutType,
            B = d("ReQLSuspense").useArray(function() {
                return d("ReQL").fromTableAscending(w.table("attachment_items")).getKeyRange(x)
            }, [x, w], f.id + ":148"),
            C = d("Int64Hooks").useMemoInt64(function() {
                return A != null ? [d("I64").equal(A, d("LSIntEnum").ofNumber(c("MNLSXMALayoutType").HSCROLL)), d("I64").equal(A, d("LSIntEnum").ofNumber(c("MNLSXMALayoutType").XCENTER)), d("I64").equal(A, d("LSIntEnum").ofNumber(c("MNLSXMALayoutType").SINGLE)), d("I64").equal(A, d("LSIntEnum").ofNumber(c("MNLSXMALayoutType").SHARED_STACK))] : [!1, !1, !1]
            }, [A]),
            D = C[0],
            E = C[1],
            F = C[2];
        C = C[3];
        var G = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext(),
            H = null;
        C ? H = h.jsx(c("MWXMAAttachmentSharedStackLayout.react"), {
            attachment: b,
            attachmentItems: B,
            children: h.jsx(c("MWXMAAttachmentSharedStackFrontCard.react"), {
                attachment: b
            })
        }) : D ? H = h.jsx(c("MWXMAAttachmentHorizontalItems.react"), {
            attachment: b,
            attachmentItems: B,
            bodyLineLimit: e,
            cardWidth: g,
            fullWidthContainer: n,
            getFaviconUrlXMA: o,
            getHeaderUrlXMA: p,
            getPlayableUrl: q,
            getPreviewUrlXMA: r,
            hasText: s,
            headlineLineLimit: t,
            isHscroll: D,
            xmaLayout: v,
            xstyle: [k.card, k.opaqueCard]
        }) : F && B.length === 6 ? H = h.jsx(c("MWXMAAttachmentVerticalLayout.react"), {
            centered: !0,
            connectBottom: l,
            connectTop: m,
            outgoing: u,
            xmaLayout: v,
            xstyle: [k.card, k.opaqueCard],
            children: h.jsx(c("MWXMAAttachmentItemIgProfile.react"), {
                attachment: b,
                attachmentItems: B,
                getHeaderUrlXMA: p
            })
        }) : E && B.length === 1 ? H = h.jsx(c("MWXMAAttachmentVerticalLayout.react"), {
            centered: !0,
            connectBottom: l,
            connectTop: m,
            outgoing: u,
            xmaLayout: v,
            xstyle: [k.card, k.opaqueCard],
            children: h.jsx(c("MWXMAAttachmentItem.react"), {
                attachment: b,
                attachmentItem: B[0],
                bodyLineLimit: e,
                cardWidth: g,
                getFaviconUrlXMA: o,
                getHeaderUrlXMA: p,
                getPlayableUrl: q,
                getPreviewUrlXMA: r,
                headlineLineLimit: t,
                isHscroll: D,
                isStandalone: !0,
                xmaLayout: v
            })
        }) : B.length === 0 ? H = h.jsx(c("MWXMAAttachmentVerticalLayout.react"), {
            connectBottom: l,
            connectTop: m,
            outgoing: u,
            xmaLayout: v,
            xstyle: [k.card, z !== !0 && k.opaqueCard],
            children: h.jsx(c("MWXMAAttachmentItem.react"), {
                attachment: b,
                attachmentItem: i(b),
                bodyLineLimit: e,
                cardWidth: g,
                getFaviconUrlXMA: o,
                getHeaderUrlXMA: p,
                getPlayableUrl: q,
                getPreviewUrlXMA: r,
                headlineLineLimit: t,
                isHscroll: D,
                isStandalone: !0,
                xmaLayout: v
            })
        }) : B.length === 1 ? H = h.jsx(c("MWXMAAttachmentVerticalLayout.react"), {
            connectBottom: l,
            connectTop: m,
            outgoing: u,
            xmaLayout: v,
            xstyle: [k.card, k.opaqueCard],
            children: h.jsx(c("MWXMAAttachmentItem.react"), {
                attachment: b,
                attachmentItem: B[0],
                bodyLineLimit: e,
                cardWidth: g,
                getFaviconUrlXMA: o,
                getHeaderUrlXMA: p,
                getPlayableUrl: q,
                getPreviewUrlXMA: r,
                headlineLineLimit: t,
                isHscroll: D,
                isStandalone: !0,
                xmaLayout: v
            })
        }) : c("recoverableViolation")("Unknown combination of XMA items and layout. n Attachment Items: " + String(B.length) + ", Layout: " + (A == null ? "na" : d("I64").to_string(A)) + ", Attachment Type: " + d("I64").to_string(y), "messenger_web_product");
        C = v === d("xmaLayouts").XMA_LAYOUTS.UNIFIED_LAYOUT ? [j.cardWidth, u && j.outgoing_xma] : j.cardWidth;
        return h.jsx("div", {
            className: c("stylex")(D && G === "ChatTab" && k.rootForHScrollInChatTab, !D && !E && C, a),
            children: H
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g.xmaCardStyles = j;
    g.MWXMAAttachment = a
}), 98);
__d("MWMessageListAttachmentContainer.react", ["CometErrorBoundary.react", "I64", "LSIntEnum", "MWChatAttachmentMediaPreview.bs", "MWChatEphemeralButton.react", "MWLSThreadDisplayContext", "MWMessageListAttachment.react", "MWPMessageIsReply.bs", "MWPMessageListAttachment.react", "MWPSolidMessageBubble.bs", "MWV2ChatBubble.react", "MWV2ChatFileV2.bs", "MWV2ChatImagesGrid.bs", "MWV2UnsupportedAttachment.bs", "MWXMAAttachment.react", "RavenMessagingState", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            file: {
                paddingTop: "xexx8yu",
                paddingEnd: "x4uap5",
                paddingBottom: "x18d9i69",
                paddingStart: "xkhd6sd",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.connectBottom,
            e = a.connectTop,
            f = a.hasEmphasisRing;
        f = f === void 0 ? !1 : f;
        var g = a.hasText,
            j = g === void 0 ? !1 : g,
            k = a.message,
            l = a.outgoing,
            m = a.xstyle;
        g = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        var n = g === "ChatTab" ? 180 : void 0;
        return h.jsx(c("MWPMessageListAttachment.react"), {
            connectBottom: b,
            connectTop: e,
            message: k,
            renderAudioAttachment: function(a) {
                return h.jsx(d("MWMessageListAttachment.react").MWMessageListAttachmentAudio, {
                    attachment: a,
                    isReply: c("MWPMessageIsReply.bs")(k),
                    outgoing: l
                })
            },
            renderEmphasisRing: f ? function(a, b) {
                return h.jsx(d("MWV2ChatBubble.react").EmphasisRing, {
                    hasXMA: a,
                    isBeforeXMA: !1,
                    isOutgoing: l,
                    shouldConnectBottom: !1,
                    shouldConnectTop: e,
                    children: b
                })
            } : void 0,
            renderEphemeralMediaAttachment: function(a) {
                var f = a.ephemeralMediaState;
                if (f != null)
                    if (d("I64").equal(f, d("LSIntEnum").ofNumber(c("RavenMessagingState").PERMANENT))) return h.jsx(d("MWChatAttachmentMediaPreview.bs").make, {
                        attachment: a
                    });
                    else return h.jsx(c("MWChatEphemeralButton.react"), {
                        attachment: a,
                        connectBottom: b,
                        connectTop: e,
                        outgoing: l
                    });
                else return null
            },
            renderFileAttachment: function(a) {
                return h.jsx(d("MWPSolidMessageBubble.bs").make, {
                    connectBottom: b,
                    connectTop: e,
                    outgoing: l,
                    style: {
                        backgroundColor: "var(--comment-background)"
                    },
                    xstyle: i.file,
                    children: h.jsx(c("MWV2ChatFileV2.bs"), {
                        attachment: a
                    })
                })
            },
            renderImageAttachment: function(c, b, a) {
                return h.jsx(d("MWMessageListAttachment.react").MWMessageListAttachmentImage, {
                    attachment: c,
                    connectBottom: a,
                    connectTop: b,
                    message: k,
                    outgoing: l
                })
            },
            renderImageGrid: function(a) {
                return h.jsx(d("MWV2ChatImagesGrid.bs").make, {
                    attachments: a
                })
            },
            renderStickerAttachment: function(a) {
                return h.jsx(d("MWMessageListAttachment.react").MWMessageListAttachmentSticker, {
                    attachment: a
                })
            },
            renderUnsupportedAttachment: function(a) {
                return h.jsx(d("MWPSolidMessageBubble.bs").make, {
                    connectBottom: b,
                    connectTop: e,
                    outgoing: l,
                    style: {
                        backgroundColor: "var(--comment-background)"
                    },
                    children: h.jsx(d("MWV2UnsupportedAttachment.bs").make, {
                        attachment: a
                    })
                })
            },
            renderVideoAttachment: function(a) {
                return h.jsx(d("MWMessageListAttachment.react").MWMessageListAttachmentVideo, {
                    attachment: a,
                    connectTop: e,
                    message: k,
                    outgoing: l
                })
            },
            renderXMAAttachment: function(a) {
                return h.jsx(c("CometErrorBoundary.react"), {
                    fallback: function(a) {
                        return h.jsx(d("MWMessageListAttachment.react").MWMessageListAttachmentError, {
                            connectBottom: b,
                            connectTop: e,
                            xstyle: m
                        })
                    },
                    children: h.jsx(d("MWXMAAttachment.react").MWXMAAttachment, {
                        attachment: a,
                        cardWidth: n,
                        connectBottom: b,
                        connectTop: e,
                        hasText: j,
                        outgoing: l,
                        xstyle: m
                    })
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = h.memo(a);
    g["default"] = b
}), 98);
__d("MWV2ChatEmoji.react", ["CometTextWithEntities.react", "I64", "LSHotEmojiSize", "LSIntEnum", "MWChatEmojiUtil.bs", "MWChatTextTransform", "MWV2ChatBubble.react", "cr:2472", "cr:3200", "qex", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useMemo;

    function a(a) {
        var e = a.hasEmphasisRing;
        e = e === void 0 ? !1 : e;
        var f = a.isSecureMessage;
        f = f === void 0 ? !1 : f;
        var g = a.message;
        a = i(function() {
            var a = c("qex")._("1546");
            return d("MWChatTextTransform").epdTextTransformsWithOptions({
                size: a == null || a !== "dynamic" ? 32 : d("MWChatEmojiUtil.bs").transformHotEmojiSizeForWeb(g.hotEmojiSize)
            })
        }, [g.hotEmojiSize]);
        var j = g.text;
        if (j == null) return null;
        j = b("cr:2472") == null ? j : b("cr:2472").unvault(j);
        var k = g.hotEmojiSize;
        k = k != null && (d("I64").equal(k, d("LSIntEnum").ofNumber(c("LSHotEmojiSize").SMALL)) || d("I64").equal(k, d("LSIntEnum").ofNumber(c("LSHotEmojiSize").MEDIUM)) || d("I64").equal(k, d("LSIntEnum").ofNumber(c("LSHotEmojiSize").LARGE)));
        if (f && k && j === "\ud83d\udc4d") return b("cr:3200") == null ? null : h.jsx(b("cr:3200"), {});
        f = h.jsx(c("CometTextWithEntities.react"), {
            text: j,
            transforms: a,
            withParagraphs: !0
        });
        return e ? h.jsx(d("MWV2ChatBubble.react").EmphasisRing, {
            hasXMA: !1,
            isBeforeXMA: !1,
            isOutgoing: !1,
            shouldConnectBottom: !1,
            shouldConnectTop: !1,
            children: f
        }) : f
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWV2ChatUnsentMessage.react", ["fbt", "CometPressable.react", "I64", "Int64Hooks", "MWCMIsAnyCMThread", "MWLSThread", "MWV2TombstonedMessage.bs", "MWXText.react", "ReQL.bs", "ReQLSubscription.bs", "XCometGroupAdminActivitiesControllerRouteBuilder", "cr:6023", "react", "useCommunityFolder", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            linkText: {
                paddingStart: "x16hj40l",
                paddingEnd: "xsyo7zv",
                paddingTop: "x1y1aw1k",
                paddingBottom: "xwib8y2",
                $$css: !0
            }
        };

    function k(a) {
        var d = a.attachment,
            e = a.isSecureMessage;
        a = a.message;
        var f = h._("__JHASH__I-2GRtvMpnJ__JHASH__");
        a = b("cr:6023") == null ? void 0 : b("cr:6023").useUnsendContentInSecureThread(a);
        a = a == null ? f : a;
        if (e) e = a;
        else if (d != null) {
            a = d.descriptionText;
            e = a != null ? a : f
        } else e = f;
        return i.jsx(c("MWV2TombstonedMessage.bs"), {
            ariaLabel: e.toString(),
            children: e
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function l(a) {
        a = a.attachment;
        if (a != null) {
            a = a.descriptionText;
            a = a != null ? a : h._("__JHASH__HdJ22izQlT7__JHASH__")
        } else a = h._("__JHASH__HdJ22izQlT7__JHASH__");
        return i.jsx(c("MWV2TombstonedMessage.bs"), {
            ariaLabel: a.toString(),
            children: a
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";

    function m(a) {
        var b = a.attachment;
        a = a.thread;
        a = c("useCommunityFolder")(a);
        if (b != null) {
            b = b.cta1Title;
            b = b != null ? b : h._("__JHASH__8jyfQXNgswL__JHASH__")
        } else b = h._("__JHASH__8jyfQXNgswL__JHASH__");
        if (a != null) return i.jsx(c("CometPressable.react"), {
            linkProps: {
                url: "https://www.facebook.com" + c("XCometGroupAdminActivitiesControllerRouteBuilder").buildURL({
                    idorvanity: d("I64").to_string(a.fbGroupId)
                })
            },
            overlayDisabled: !0,
            xstyle: function() {
                return [j.linkText]
            },
            children: i.jsx(c("MWXText.react"), {
                color: "blueLink",
                type: "meta2",
                children: b
            })
        });
        else return null
    }
    m.displayName = m.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.isSecureMessage,
            e = a.message;
        a = a.outgoing;
        var f = c("useReStore")(),
            g = e.messageId,
            h = e.threadKey,
            j = d("MWLSThread").useThread(h),
            n = d("ReQLSubscription.bs").useFirst(d("Int64Hooks").useMemoInt64(function() {
                return d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(f.table("attachments")), {
                    hd: h,
                    tl: {
                        hd: g,
                        tl: 0
                    }
                })
            }, [f, g, h]), "xrc8lvuy");
        if (n != null) {
            var o = n.cta1Type;
            o = o != null ? o === "xma_view_activity_log" : !1
        } else o = !1;
        return i.jsxs(i.Fragment, {
            children: [a ? i.jsx(l, {
                attachment: n
            }) : i.jsx(k, {
                attachment: n,
                isSecureMessage: b,
                message: e
            }), j != null && o && c("MWCMIsAnyCMThread")(j.threadType) ? i.jsx(m, {
                attachment: n,
                thread: j
            }) : null]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g.MWV2ChatUnsentMessage = a
}), 98); /*FB_PKG_DELIM*/
__d("MWChatForwardDialogQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "6112170612169266"
}), null);
__d("MWChatForwardDialogQuery$Parameters", ["MWChatForwardDialogQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("MWChatForwardDialogQuery_facebookRelayOperation"),
            metadata: {},
            name: "MWChatForwardDialogQuery",
            operationKind: "query",
            text: null
        }
    };
    e.exports = a
}), null);
__d("MWChatUserBirthdayQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "4679476245513562"
}), null);
__d("MWChatUserBirthdayQuery.graphql", ["MWChatUserBirthdayQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = {
            alias: null,
            args: null,
            concreteType: "Date",
            kind: "LinkedField",
            name: "birthdate",
            plural: !1,
            selections: [{
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "day",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "month",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "year",
                storageKey: null
            }],
            storageKey: null
        };
        return {
            fragment: {
                argumentDefinitions: [],
                kind: "Fragment",
                metadata: null,
                name: "MWChatUserBirthdayQuery",
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "Viewer",
                    kind: "LinkedField",
                    name: "viewer",
                    plural: !1,
                    selections: [{
                        alias: "user",
                        args: null,
                        concreteType: "User",
                        kind: "LinkedField",
                        name: "account_user",
                        plural: !1,
                        selections: [a],
                        storageKey: null
                    }],
                    storageKey: null
                }],
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: [],
                kind: "Operation",
                name: "MWChatUserBirthdayQuery",
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "Viewer",
                    kind: "LinkedField",
                    name: "viewer",
                    plural: !1,
                    selections: [{
                        alias: "user",
                        args: null,
                        concreteType: "User",
                        kind: "LinkedField",
                        name: "account_user",
                        plural: !1,
                        selections: [a, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "id",
                            storageKey: null
                        }],
                        storageKey: null
                    }],
                    storageKey: null
                }]
            },
            params: {
                id: b("MWChatUserBirthdayQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatUserBirthdayQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("MWChatUserEmailQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "5146654855396537"
}), null);
__d("MWChatUserEmailQuery.graphql", ["MWChatUserEmailQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
            alias: null,
            args: null,
            concreteType: "Viewer",
            kind: "LinkedField",
            name: "viewer",
            plural: !1,
            selections: [{
                alias: null,
                args: null,
                concreteType: "Email",
                kind: "LinkedField",
                name: "all_emails",
                plural: !0,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "display_email",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "is_primary",
                    storageKey: null
                }],
                storageKey: null
            }],
            storageKey: null
        }];
        return {
            fragment: {
                argumentDefinitions: [],
                kind: "Fragment",
                metadata: null,
                name: "MWChatUserEmailQuery",
                selections: a,
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: [],
                kind: "Operation",
                name: "MWChatUserEmailQuery",
                selections: a
            },
            params: {
                id: b("MWChatUserEmailQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatUserEmailQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("MWChatUserPhoneNumberQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "5063442323698780"
}), null);
__d("MWChatUserPhoneNumberQuery.graphql", ["MWChatUserPhoneNumberQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = {
            alias: null,
            args: null,
            concreteType: "Phone",
            kind: "LinkedField",
            name: "all_phones",
            plural: !0,
            selections: [{
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "is_preferred",
                storageKey: null
            }, {
                alias: null,
                args: null,
                concreteType: "PhoneNumber",
                kind: "LinkedField",
                name: "phone_number",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "universal_number",
                    storageKey: null
                }],
                storageKey: null
            }],
            storageKey: null
        };
        return {
            fragment: {
                argumentDefinitions: [],
                kind: "Fragment",
                metadata: null,
                name: "MWChatUserPhoneNumberQuery",
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "Viewer",
                    kind: "LinkedField",
                    name: "viewer",
                    plural: !1,
                    selections: [{
                        alias: "user",
                        args: null,
                        concreteType: "User",
                        kind: "LinkedField",
                        name: "account_user",
                        plural: !1,
                        selections: [a],
                        storageKey: null
                    }],
                    storageKey: null
                }],
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: [],
                kind: "Operation",
                name: "MWChatUserPhoneNumberQuery",
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "Viewer",
                    kind: "LinkedField",
                    name: "viewer",
                    plural: !1,
                    selections: [{
                        alias: "user",
                        args: null,
                        concreteType: "User",
                        kind: "LinkedField",
                        name: "account_user",
                        plural: !1,
                        selections: [a, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "id",
                            storageKey: null
                        }],
                        storageKey: null
                    }],
                    storageKey: null
                }]
            },
            params: {
                id: b("MWChatUserPhoneNumberQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatUserPhoneNumberQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("MWChatUserProfileLocationQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "4696875653751924"
}), null);
__d("MWChatUserProfileLocationQuery.graphql", ["MWChatUserProfileLocationQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = {
            alias: null,
            args: null,
            concreteType: "StreetAddress",
            kind: "LinkedField",
            name: "address",
            plural: !1,
            selections: [{
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "city",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "region",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "postal_code",
                storageKey: null
            }],
            storageKey: null
        };
        return {
            fragment: {
                argumentDefinitions: [],
                kind: "Fragment",
                metadata: null,
                name: "MWChatUserProfileLocationQuery",
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "Viewer",
                    kind: "LinkedField",
                    name: "viewer",
                    plural: !1,
                    selections: [{
                        alias: "user",
                        args: null,
                        concreteType: "User",
                        kind: "LinkedField",
                        name: "account_user",
                        plural: !1,
                        selections: [a],
                        storageKey: null
                    }],
                    storageKey: null
                }],
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: [],
                kind: "Operation",
                name: "MWChatUserProfileLocationQuery",
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "Viewer",
                    kind: "LinkedField",
                    name: "viewer",
                    plural: !1,
                    selections: [{
                        alias: "user",
                        args: null,
                        concreteType: "User",
                        kind: "LinkedField",
                        name: "account_user",
                        plural: !1,
                        selections: [a, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "id",
                            storageKey: null
                        }],
                        storageKey: null
                    }],
                    storageKey: null
                }]
            },
            params: {
                id: b("MWChatUserProfileLocationQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatUserProfileLocationQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("BillableAccountUtilsAccountTypeQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "7186005611440799"
}), null);
__d("BillableAccountUtilsAccountTypeQuery.graphql", ["BillableAccountUtilsAccountTypeQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "paymentAccountID"
            }],
            c = [{
                kind: "Variable",
                name: "payment_legacy_account_id",
                variableName: "paymentAccountID"
            }],
            d = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "__typename",
                storageKey: null
            };
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "BillableAccountUtilsAccountTypeQuery",
                selections: [{
                    alias: null,
                    args: c,
                    concreteType: null,
                    kind: "LinkedField",
                    name: "billable_account_by_payment_account",
                    plural: !1,
                    selections: [d],
                    storageKey: null
                }],
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "BillableAccountUtilsAccountTypeQuery",
                selections: [{
                    alias: null,
                    args: c,
                    concreteType: null,
                    kind: "LinkedField",
                    name: "billable_account_by_payment_account",
                    plural: !1,
                    selections: [d, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "id",
                        storageKey: null
                    }],
                    storageKey: null
                }]
            },
            params: {
                id: b("BillableAccountUtilsAccountTypeQuery_facebookRelayOperation"),
                metadata: {},
                name: "BillableAccountUtilsAccountTypeQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("BillableAccountUtilsQEQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "5238903736133946"
}), null);
__d("BillableAccountUtilsQEQuery.graphql", ["BillableAccountUtilsQEQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = {
                defaultValue: null,
                kind: "LocalArgument",
                name: "disable_auto_exposure_logging"
            },
            c = {
                defaultValue: null,
                kind: "LocalArgument",
                name: "param"
            },
            d = {
                defaultValue: null,
                kind: "LocalArgument",
                name: "paymentAccountID"
            },
            e = {
                defaultValue: null,
                kind: "LocalArgument",
                name: "qe"
            },
            f = [{
                kind: "Variable",
                name: "payment_legacy_account_id",
                variableName: "paymentAccountID"
            }],
            g = {
                alias: null,
                args: [{
                    kind: "Variable",
                    name: "disable_auto_exposure_logging",
                    variableName: "disable_auto_exposure_logging"
                }, {
                    kind: "Variable",
                    name: "param",
                    variableName: "param"
                }, {
                    kind: "Variable",
                    name: "qe_universe",
                    variableName: "qe"
                }],
                kind: "ScalarField",
                name: "qe_on_payment_account_by_string",
                storageKey: null
            };
        return {
            fragment: {
                argumentDefinitions: [a, c, d, e],
                kind: "Fragment",
                metadata: null,
                name: "BillableAccountUtilsQEQuery",
                selections: [{
                    alias: null,
                    args: f,
                    concreteType: null,
                    kind: "LinkedField",
                    name: "billable_account_by_payment_account",
                    plural: !1,
                    selections: [g],
                    storageKey: null
                }],
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: [d, e, c, a],
                kind: "Operation",
                name: "BillableAccountUtilsQEQuery",
                selections: [{
                    alias: null,
                    args: f,
                    concreteType: null,
                    kind: "LinkedField",
                    name: "billable_account_by_payment_account",
                    plural: !1,
                    selections: [{
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "__typename",
                        storageKey: null
                    }, g, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "id",
                        storageKey: null
                    }],
                    storageKey: null
                }]
            },
            params: {
                id: b("BillableAccountUtilsQEQuery_facebookRelayOperation"),
                metadata: {},
                name: "BillableAccountUtilsQEQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("BillableAccountUtilsQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "4884655151655882"
}), null);
__d("BillableAccountUtilsQuery.graphql", ["BillableAccountUtilsQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "paymentAccountID"
            }],
            c = [{
                kind: "Variable",
                name: "payment_legacy_account_id",
                variableName: "paymentAccountID"
            }],
            d = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "billing_flags",
                storageKey: null
            },
            e = [{
                kind: "Literal",
                name: "filter",
                value: "PRIMARY_ONLY"
            }],
            f = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "__typename",
                storageKey: null
            },
            g = {
                alias: null,
                args: null,
                concreteType: "CurrencyQuantity",
                kind: "LinkedField",
                name: "balance",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "offset_amount",
                    storageKey: null
                }],
                storageKey: null
            },
            h = {
                kind: "InlineFragment",
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "account_status",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "payment_modes",
                    storageKey: null
                }],
                type: "AdAccount",
                abstractKey: null
            },
            i = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "has_acked_soft_tax_info_problem",
                storageKey: null
            },
            j = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "id",
                storageKey: null
            };
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "BillableAccountUtilsQuery",
                selections: [{
                    alias: null,
                    args: c,
                    concreteType: null,
                    kind: "LinkedField",
                    name: "billable_account_by_payment_account",
                    plural: !1,
                    selections: [d, {
                        alias: null,
                        args: null,
                        concreteType: null,
                        kind: "LinkedField",
                        name: "billing_payment_account",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: e,
                            concreteType: "PaymentCredentialDetails",
                            kind: "LinkedField",
                            name: "billing_payment_methods",
                            plural: !0,
                            selections: [{
                                alias: null,
                                args: null,
                                concreteType: null,
                                kind: "LinkedField",
                                name: "credential",
                                plural: !1,
                                selections: [{
                                    kind: "InlineFragment",
                                    selections: [f, g],
                                    type: "StoredBalance",
                                    abstractKey: null
                                }],
                                storageKey: null
                            }],
                            storageKey: 'billing_payment_methods(filter:"PRIMARY_ONLY")'
                        }],
                        storageKey: null
                    }, h, i],
                    storageKey: null
                }],
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "BillableAccountUtilsQuery",
                selections: [{
                    alias: null,
                    args: c,
                    concreteType: null,
                    kind: "LinkedField",
                    name: "billable_account_by_payment_account",
                    plural: !1,
                    selections: [f, d, {
                        alias: null,
                        args: null,
                        concreteType: null,
                        kind: "LinkedField",
                        name: "billing_payment_account",
                        plural: !1,
                        selections: [f, {
                            alias: null,
                            args: e,
                            concreteType: "PaymentCredentialDetails",
                            kind: "LinkedField",
                            name: "billing_payment_methods",
                            plural: !0,
                            selections: [{
                                alias: null,
                                args: null,
                                concreteType: null,
                                kind: "LinkedField",
                                name: "credential",
                                plural: !1,
                                selections: [f, j, {
                                    kind: "InlineFragment",
                                    selections: [g],
                                    type: "StoredBalance",
                                    abstractKey: null
                                }],
                                storageKey: null
                            }],
                            storageKey: 'billing_payment_methods(filter:"PRIMARY_ONLY")'
                        }, j],
                        storageKey: null
                    }, i, j, h],
                    storageKey: null
                }]
            },
            params: {
                id: b("BillableAccountUtilsQuery_facebookRelayOperation"),
                metadata: {},
                name: "BillableAccountUtilsQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("BillingPaymentMethodDisplayUtilsQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "6317953964953172"
}), null);
__d("BillingPaymentMethodDisplayUtilsQuery.graphql", ["BillingPaymentMethodDisplayUtilsQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "paymentMethodID"
            }],
            c = [{
                kind: "Variable",
                name: "id",
                variableName: "paymentMethodID"
            }],
            d = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "__typename",
                storageKey: null
            },
            e = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "last_four_digits",
                storageKey: null
            },
            f = {
                kind: "InlineFragment",
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "card_association_name",
                    storageKey: null
                }, e],
                type: "ExternalCreditCard",
                abstractKey: null
            };
        e = {
            kind: "InlineFragment",
            selections: [{
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "bank_name",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "bank_account_type",
                storageKey: null
            }, e],
            type: "DirectDebit",
            abstractKey: null
        };
        var g = {
                kind: "InlineFragment",
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "email",
                    storageKey: null
                }],
                type: "PaymentPaypalBillingAgreement",
                abstractKey: null
            },
            h = {
                kind: "InlineFragment",
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "legal_entity_name",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "partition_from",
                    storageKey: null
                }],
                type: "IEntEC",
                abstractKey: "__isIEntEC"
            },
            i = {
                kind: "InlineFragment",
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "CurrencyAmount",
                    kind: "LinkedField",
                    name: "balance_amount",
                    plural: !1,
                    selections: [{
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "currency",
                        storageKey: null
                    }],
                    storageKey: null
                }],
                type: "StoredBalance",
                abstractKey: null
            };
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "BillingPaymentMethodDisplayUtilsQuery",
                selections: [{
                    alias: null,
                    args: c,
                    concreteType: null,
                    kind: "LinkedField",
                    name: "node",
                    plural: !1,
                    selections: [{
                        kind: "InlineDataFragmentSpread",
                        name: "BillingPaymentMethodDisplayUtils_paymentCredential",
                        selections: [{
                            kind: "InlineFragment",
                            selections: [d, f, e, g, h, i],
                            type: "PaymentCredential",
                            abstractKey: "__isPaymentCredential"
                        }],
                        args: null,
                        argumentDefinitions: []
                    }],
                    storageKey: null
                }],
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "BillingPaymentMethodDisplayUtilsQuery",
                selections: [{
                    alias: null,
                    args: c,
                    concreteType: null,
                    kind: "LinkedField",
                    name: "node",
                    plural: !1,
                    selections: [d, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "id",
                        storageKey: null
                    }, {
                        kind: "InlineFragment",
                        selections: [f, e, g, h, i],
                        type: "PaymentCredential",
                        abstractKey: "__isPaymentCredential"
                    }],
                    storageKey: null
                }]
            },
            params: {
                id: b("BillingPaymentMethodDisplayUtilsQuery_facebookRelayOperation"),
                metadata: {},
                name: "BillingPaymentMethodDisplayUtilsQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("BillingPaymentMethodDisplayUtils_paymentCredential.graphql", [], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "InlineDataFragment",
        name: "BillingPaymentMethodDisplayUtils_paymentCredential"
    };
    e.exports = a
}), null);
__d("SupportUserChatThreadDeleteMessageMutation.graphql", [], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "input"
            }],
            b = [{
                alias: null,
                args: [{
                    kind: "Variable",
                    name: "data",
                    variableName: "input"
                }],
                concreteType: "XFBSupportUserDeleteMessageResponsePayload",
                kind: "LinkedField",
                name: "xfb_support_user_delete_message",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "client_mutation_id",
                    storageKey: null
                }],
                storageKey: null
            }];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "SupportUserChatThreadDeleteMessageMutation",
                selections: b,
                type: "Mutation",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "SupportUserChatThreadDeleteMessageMutation",
                selections: b
            },
            params: {
                id: "7932696706801502",
                metadata: {},
                name: "SupportUserChatThreadDeleteMessageMutation",
                operationKind: "mutation",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("SupportUserChatThreadMainQuery.graphql", [], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "data"
            }],
            b = [{
                kind: "Variable",
                name: "data",
                variableName: "data"
            }],
            c = {
                alias: null,
                args: null,
                concreteType: "XFBMessageThreadKey",
                kind: "LinkedField",
                name: "thread_key",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "other_user_id",
                    storageKey: null
                }],
                storageKey: null
            },
            d = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "id",
                storageKey: null
            },
            e = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "name",
                storageKey: null
            },
            f = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "uri",
                storageKey: null
            },
            g = {
                alias: null,
                args: [{
                    kind: "Literal",
                    name: "scale",
                    value: 10
                }],
                concreteType: "XFBImage",
                kind: "LinkedField",
                name: "profile_picture",
                plural: !1,
                selections: [f],
                storageKey: "profile_picture(scale:10)"
            },
            h = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "updated_time_precise",
                storageKey: null
            },
            i = [d],
            j = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "timestamp_precise",
                storageKey: null
            },
            k = [{
                alias: null,
                args: null,
                concreteType: null,
                kind: "LinkedField",
                name: "actor",
                plural: !1,
                selections: i,
                storageKey: null
            }, j],
            l = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "message_id",
                storageKey: null
            },
            m = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "offline_threading_id",
                storageKey: null
            },
            n = {
                alias: null,
                args: null,
                concreteType: "XFBMessagingParticipant",
                kind: "LinkedField",
                name: "message_sender",
                plural: !1,
                selections: i,
                storageKey: null
            },
            o = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "__typename",
                storageKey: null
            },
            p = {
                alias: null,
                args: null,
                concreteType: "XFBTextWithEntities",
                kind: "LinkedField",
                name: "message",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "text",
                    storageKey: null
                }],
                storageKey: null
            },
            q = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "legacy_attachment_id",
                storageKey: null
            },
            r = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "height",
                storageKey: null
            },
            s = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "width",
                storageKey: null
            },
            t = {
                alias: null,
                args: null,
                concreteType: "XFBImage",
                kind: "LinkedField",
                name: "image",
                plural: !1,
                selections: [f, r, s],
                storageKey: null
            },
            u = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "url",
                storageKey: null
            },
            v = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "mimetype",
                storageKey: null
            },
            w = {
                alias: null,
                args: null,
                concreteType: "XFBVect2",
                kind: "LinkedField",
                name: "original_dimensions",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "x",
                    storageKey: null
                }, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "y",
                    storageKey: null
                }],
                storageKey: null
            },
            x = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "playable_url",
                storageKey: null
            },
            y = {
                alias: null,
                args: null,
                concreteType: "XFBImage",
                kind: "LinkedField",
                name: "image",
                plural: !1,
                selections: [f, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "mime_type",
                    storageKey: null
                }, r, s],
                storageKey: null
            };
        f = {
            alias: null,
            args: null,
            concreteType: "XFBImage",
            kind: "LinkedField",
            name: "image",
            plural: !1,
            selections: [f, s, r, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "downloadable_uri",
                storageKey: null
            }],
            storageKey: null
        };
        s = {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "animated_image_caption",
            storageKey: null
        };
        r = {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "platform_xmd_encoded",
            storageKey: null
        };
        var z = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "action_url",
                storageKey: null
            },
            A = [{
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "title",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "cta_id",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "target_id",
                storageKey: null
            }, {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "type",
                storageKey: null
            }, z];
        A = {
            alias: null,
            args: null,
            concreteType: "XFBMessengerGenericXMATemplateExtraFields",
            kind: "LinkedField",
            name: "messenger_generic_xma_template_extra_info",
            plural: !1,
            selections: [{
                alias: null,
                args: null,
                concreteType: "XFBMessengerGenericXMATemplateCTA",
                kind: "LinkedField",
                name: "cta1",
                plural: !1,
                selections: A,
                storageKey: null
            }, {
                alias: null,
                args: null,
                concreteType: "XFBMessengerGenericXMATemplateCTA",
                kind: "LinkedField",
                name: "cta2",
                plural: !1,
                selections: A,
                storageKey: null
            }, {
                alias: null,
                args: null,
                concreteType: "XFBMessengerGenericXMATemplateCTA",
                kind: "LinkedField",
                name: "cta3",
                plural: !1,
                selections: A,
                storageKey: null
            }],
            storageKey: null
        };
        z = {
            kind: "InlineFragment",
            selections: [{
                alias: null,
                args: null,
                concreteType: "XFBMessengerCallToAction",
                kind: "LinkedField",
                name: "call_to_actions",
                plural: !0,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "action_title",
                    storageKey: null
                }, d, {
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "action_open_type",
                    storageKey: null
                }, z],
                storageKey: null
            }],
            type: "XFBMessengerBusinessMessage",
            abstractKey: null
        };
        var B = {
                kind: "InlineFragment",
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "snippet",
                    storageKey: null
                }],
                type: "XFBGenericAdminTextMessage",
                abstractKey: null
            },
            C = [{
                alias: null,
                args: null,
                concreteType: null,
                kind: "LinkedField",
                name: "actor",
                plural: !1,
                selections: [o, d],
                storageKey: null
            }, j];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "SupportUserChatThreadMainQuery",
                selections: [{
                    alias: "message_thread",
                    args: b,
                    concreteType: "XFBMessageThread",
                    kind: "LinkedField",
                    name: "xfb_support_user_message_thread",
                    plural: !1,
                    selections: [c, {
                        alias: null,
                        args: null,
                        concreteType: "XFBAllMessagingParticipantsOfThreadConnection",
                        kind: "LinkedField",
                        name: "all_participants",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            concreteType: "XFBMessagingParticipant",
                            kind: "LinkedField",
                            name: "nodes",
                            plural: !0,
                            selections: [d, {
                                alias: null,
                                args: null,
                                concreteType: null,
                                kind: "LinkedField",
                                name: "messaging_actor",
                                plural: !1,
                                selections: [d, e, g],
                                storageKey: null
                            }],
                            storageKey: null
                        }],
                        storageKey: null
                    }, h, {
                        alias: null,
                        args: null,
                        concreteType: "XFBMessagingReadReceiptsOfThreadConnection",
                        kind: "LinkedField",
                        name: "read_receipts",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            concreteType: "XFBMessagingReadReceipt",
                            kind: "LinkedField",
                            name: "nodes",
                            plural: !0,
                            selections: k,
                            storageKey: null
                        }],
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        concreteType: "XFBMessagingDeliveryReceiptsOfThreadConnection",
                        kind: "LinkedField",
                        name: "delivery_receipts",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            concreteType: "XFBMessagingDeliveryReceipt",
                            kind: "LinkedField",
                            name: "nodes",
                            plural: !0,
                            selections: k,
                            storageKey: null
                        }],
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        concreteType: "XFBMessagesOfThreadConnection",
                        kind: "LinkedField",
                        name: "messages",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            concreteType: null,
                            kind: "LinkedField",
                            name: "nodes",
                            plural: !0,
                            selections: [l, m, j, n, o, {
                                kind: "InlineFragment",
                                selections: [p, {
                                    alias: null,
                                    args: null,
                                    concreteType: null,
                                    kind: "LinkedField",
                                    name: "blob_attachments",
                                    plural: !0,
                                    selections: [o, {
                                        kind: "InlineFragment",
                                        selections: [q, t, u],
                                        type: "XFBMessageImage",
                                        abstractKey: null
                                    }, {
                                        kind: "InlineFragment",
                                        selections: [q, v, w, x, u, y],
                                        type: "XFBMessageVideo",
                                        abstractKey: null
                                    }, {
                                        kind: "InlineFragment",
                                        selections: [q, f, s],
                                        type: "XFBMessageAnimatedImage",
                                        abstractKey: null
                                    }],
                                    storageKey: null
                                }, r, {
                                    alias: null,
                                    args: null,
                                    concreteType: "XFBExtensibleMessageAttachment",
                                    kind: "LinkedField",
                                    name: "extensible_attachment",
                                    plural: !1,
                                    selections: [q, {
                                        alias: null,
                                        args: null,
                                        concreteType: "XFBStoryAttachment",
                                        kind: "LinkedField",
                                        name: "story_attachment",
                                        plural: !1,
                                        selections: [A, {
                                            alias: null,
                                            args: null,
                                            concreteType: null,
                                            kind: "LinkedField",
                                            name: "target",
                                            plural: !1,
                                            selections: [o, z],
                                            storageKey: null
                                        }],
                                        storageKey: null
                                    }],
                                    storageKey: null
                                }],
                                type: "XFBUserMessage",
                                abstractKey: null
                            }, B],
                            storageKey: null
                        }],
                        storageKey: null
                    }],
                    storageKey: null
                }],
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "SupportUserChatThreadMainQuery",
                selections: [{
                    alias: "message_thread",
                    args: b,
                    concreteType: "XFBMessageThread",
                    kind: "LinkedField",
                    name: "xfb_support_user_message_thread",
                    plural: !1,
                    selections: [c, {
                        alias: null,
                        args: null,
                        concreteType: "XFBAllMessagingParticipantsOfThreadConnection",
                        kind: "LinkedField",
                        name: "all_participants",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            concreteType: "XFBMessagingParticipant",
                            kind: "LinkedField",
                            name: "nodes",
                            plural: !0,
                            selections: [d, {
                                alias: null,
                                args: null,
                                concreteType: null,
                                kind: "LinkedField",
                                name: "messaging_actor",
                                plural: !1,
                                selections: [o, d, e, g],
                                storageKey: null
                            }],
                            storageKey: null
                        }],
                        storageKey: null
                    }, h, {
                        alias: null,
                        args: null,
                        concreteType: "XFBMessagingReadReceiptsOfThreadConnection",
                        kind: "LinkedField",
                        name: "read_receipts",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            concreteType: "XFBMessagingReadReceipt",
                            kind: "LinkedField",
                            name: "nodes",
                            plural: !0,
                            selections: C,
                            storageKey: null
                        }],
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        concreteType: "XFBMessagingDeliveryReceiptsOfThreadConnection",
                        kind: "LinkedField",
                        name: "delivery_receipts",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            concreteType: "XFBMessagingDeliveryReceipt",
                            kind: "LinkedField",
                            name: "nodes",
                            plural: !0,
                            selections: C,
                            storageKey: null
                        }],
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        concreteType: "XFBMessagesOfThreadConnection",
                        kind: "LinkedField",
                        name: "messages",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            concreteType: null,
                            kind: "LinkedField",
                            name: "nodes",
                            plural: !0,
                            selections: [l, m, j, n, o, {
                                kind: "InlineFragment",
                                selections: [p, {
                                    alias: null,
                                    args: null,
                                    concreteType: null,
                                    kind: "LinkedField",
                                    name: "blob_attachments",
                                    plural: !0,
                                    selections: [o, {
                                        kind: "InlineFragment",
                                        selections: [q, t, u, d],
                                        type: "XFBMessageImage",
                                        abstractKey: null
                                    }, {
                                        kind: "InlineFragment",
                                        selections: [q, v, w, x, u, y, d],
                                        type: "XFBMessageVideo",
                                        abstractKey: null
                                    }, {
                                        kind: "InlineFragment",
                                        selections: [q, f, s, d],
                                        type: "XFBMessageAnimatedImage",
                                        abstractKey: null
                                    }, {
                                        kind: "InlineFragment",
                                        selections: i,
                                        type: "XFBMessageAudio",
                                        abstractKey: null
                                    }, {
                                        kind: "InlineFragment",
                                        selections: i,
                                        type: "XFBMessageFile",
                                        abstractKey: null
                                    }, {
                                        kind: "InlineFragment",
                                        selections: i,
                                        type: "XFBMessageSelfieSticker",
                                        abstractKey: null
                                    }],
                                    storageKey: null
                                }, r, {
                                    alias: null,
                                    args: null,
                                    concreteType: "XFBExtensibleMessageAttachment",
                                    kind: "LinkedField",
                                    name: "extensible_attachment",
                                    plural: !1,
                                    selections: [q, {
                                        alias: null,
                                        args: null,
                                        concreteType: "XFBStoryAttachment",
                                        kind: "LinkedField",
                                        name: "story_attachment",
                                        plural: !1,
                                        selections: [A, {
                                            alias: null,
                                            args: null,
                                            concreteType: null,
                                            kind: "LinkedField",
                                            name: "target",
                                            plural: !1,
                                            selections: [o, z, d],
                                            storageKey: null
                                        }],
                                        storageKey: null
                                    }, d],
                                    storageKey: null
                                }],
                                type: "XFBUserMessage",
                                abstractKey: null
                            }, B, d],
                            storageKey: null
                        }],
                        storageKey: null
                    }, d],
                    storageKey: null
                }]
            },
            params: {
                id: "7107214405960607",
                metadata: {
                    live: {
                        polling_interval: 2500
                    }
                },
                name: "SupportUserChatThreadMainQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("SupportUserChatThreadSendMessageMutation.graphql", [], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "input"
            }],
            b = [{
                kind: "Variable",
                name: "data",
                variableName: "input"
            }],
            c = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "client_mutation_id",
                storageKey: null
            },
            d = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "message_id",
                storageKey: null
            },
            e = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "offline_threading_id",
                storageKey: null
            },
            f = {
                alias: null,
                args: null,
                kind: "ScalarField",
                name: "timestamp_precise",
                storageKey: null
            };
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "SupportUserChatThreadSendMessageMutation",
                selections: [{
                    alias: null,
                    args: b,
                    concreteType: "XFBCustomerChatSupportSendMessageResponsePayload",
                    kind: "LinkedField",
                    name: "xfb_customer_chat_support_send_message",
                    plural: !1,
                    selections: [c, {
                        alias: null,
                        args: null,
                        concreteType: null,
                        kind: "LinkedField",
                        name: "message",
                        plural: !1,
                        selections: [d, e, f],
                        storageKey: null
                    }],
                    storageKey: null
                }],
                type: "Mutation",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "SupportUserChatThreadSendMessageMutation",
                selections: [{
                    alias: null,
                    args: b,
                    concreteType: "XFBCustomerChatSupportSendMessageResponsePayload",
                    kind: "LinkedField",
                    name: "xfb_customer_chat_support_send_message",
                    plural: !1,
                    selections: [c, {
                        alias: null,
                        args: null,
                        concreteType: null,
                        kind: "LinkedField",
                        name: "message",
                        plural: !1,
                        selections: [{
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "__typename",
                            storageKey: null
                        }, d, e, f, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "id",
                            storageKey: null
                        }],
                        storageKey: null
                    }],
                    storageKey: null
                }]
            },
            params: {
                id: "7018457174834372",
                metadata: {},
                name: "SupportUserChatThreadSendMessageMutation",
                operationKind: "mutation",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("CometBlinkingTitleMessageContext", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = d("react");
    b = a.createContext(null);
    g["default"] = b
}), 98);
__d("CometSetBlinkingTitleMessageContext", ["react", "recoverableViolation"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = d("react");
    b = a.createContext(function() {
        c("recoverableViolation")("No provider of CometSetBlinkingTitleMessageContext exists", "comet_ui")
    });
    g["default"] = b
}), 98);
__d("MWNotificationRenderer.bs", ["fbt", "I64", "LSIntEnum"], (function(a, b, c, d, e, f, g, h) {
    "use strict";

    function a(a, b, c, e, f, g) {
        if (d("I64").equal(a.senderId, b)) return g(h._("__JHASH__rY0dxFqgz-w__JHASH__"));
        a = f.nickname;
        if (a != null) b = a;
        else {
            f = e.firstName;
            b = f != null ? f : e.name
        }
        a = c.threadName;
        if (a != null) return g(h._("__JHASH__OUbuC9yLTGc__JHASH__", [h._param("senderName", b), h._param("groupName", a)]));
        else if (d("I64").equal(c.threadType, d("LSIntEnum").ofNumber(2))) return g(h._("__JHASH__xWtep4OGpvD__JHASH__", [h._param("name", b)]));
        else return g(h._("__JHASH__uh-zU0Y_fAB__JHASH__", [h._param("name", b)]))
    }
    g.renderDocumentTitle = a
}), 98);
__d("QPLE2ESessionMarkers", ["$InternalEnum"], (function(a, b, c, d, e, f) {
    a = b("$InternalEnum")({
        NONE: "none",
        START: "start",
        END: "end"
    });
    c = a;
    f["default"] = c
}), 66);
__d("QPLE2E", ["QuickPerformanceLogger"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = function() {
        function a() {}
        var b = a.prototype;
        b.logPoint = function(a, b, d, e) {
            var f, g;
            e === void 0 && (e = {});
            f = (f = e.timestamp) != null ? f : c("QuickPerformanceLogger").currentTimestamp();
            var h = babelHelpers["extends"]({}, e.pointData);
            g = (g = e.action) != null ? g : 12524;
            e.secondaryOrder != void 0 && (h.string || (h.string = {}), h.string.qpl_e2e__secondary_order = e.secondaryOrder);
            if (e.sessionMarker && e.sessionMarker !== "none") {
                var i;
                h.bool || (h.bool = {});
                h.bool = babelHelpers["extends"]({}, h.bool, (i = {}, i.qpl_e2e__session_marker_start_point = e.sessionMarker === "start", i.qpl_e2e__session_marker_end_point = e.sessionMarker === "end", i))
            }
            c("QuickPerformanceLogger").markerStart(a, void 0, f, {
                samplingBasis: d
            });
            c("QuickPerformanceLogger").markerPoint(a, b, {
                data: h,
                timestamp: f * 2
            });
            e.annotations && c("QuickPerformanceLogger").markerAnnotate(a, e.annotations);
            c("QuickPerformanceLogger").markerAnnotate(a, {
                string: (i = {}, i.join_id = d, i.qpl_join__source = "client", i),
                bool: (b = {}, b.qpl_e2e__align_points = !0, b)
            });
            c("QuickPerformanceLogger").markerEnd(a, g, void 0, f)
        };
        return a
    }();
    b = new a();
    g["default"] = b
}), 98);
__d("CSIGChatComposer.bs", ["IGDComposerView.react", "MWMediaManager.bs", "MWPComposerEditor.bs", "MWPReplyContext.bs", "MWV2FileDropzone.react", "MWV2SendOpenMessage", "emptyFunction", "fileInputAcceptValues", "gkx", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useContext,
        j = b.useImperativeHandle;

    function a(a) {
        var b = a.thread,
            e = c("gkx")("1808");
        a = i(d("MWPReplyContext.bs").context);
        var f = a.reply;
        a = d("MWMediaManager.bs").useMediaManager(b, void 0, void 0, !0);
        var g = a.handleFileSelect,
            k = d("MWV2SendOpenMessage").useOnSendOpenMessage(b, function() {}, void 0, !1),
            l = c("emptyFunction"),
            m = i(d("MWV2FileDropzone.react").mWV2FileDropzoneContext);
        j(m, function() {
            return {
                enabled: !0,
                handler: g
            }
        }, [g]);
        m = /Android/i.test(navigator.userAgent);
        var n = m ? ["image/*"] : d("fileInputAcceptValues").PHOTO_AND_VIDEO.concat();
        return h.jsx(d("MWPComposerEditor.bs").MWPComposerEditor, {
            isPreviewThread: !1,
            mediaStaging: a.mediaStaging,
            onSendEmptyMessage: c("emptyFunction"),
            onSendMessage: k,
            onTypingStateChanged: l,
            thread: b,
            children: function(a, d, i, j) {
                return h.jsx(c("IGDComposerView.react"), {
                    attachmentsSupported: e && f == null,
                    editor: a,
                    editorElementRef: i,
                    emojisSupported: !1,
                    hasStuffToSend: d,
                    hideUploadPlaceholder: !0,
                    isSecureThread: !1,
                    multiple: !1,
                    onAttachmentsAdded: g,
                    onSendMessage: k,
                    policyProduct: "messaging_lightswitch",
                    sendMessage: j,
                    supportedFileTypes: n,
                    surface: "mwp_cs_ig_chat_composer",
                    thread: b
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    e = a;
    g.make = e
}), 98);
__d("CSIGChatBubble.bs", ["MWPSolidMessageBubble.bs", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useMemo;

    function j(a) {
        var b = a.children,
            c = a.connectBottom,
            e = a.connectTop,
            f = a.outgoing,
            g = a.precedesXMA;
        a = i(function() {
            return f && !g ? {
                backgroundColor: "#3797F0"
            } : {
                backgroundColor: "rgb(var(--ig-highlight-background))"
            }
        }, [f, g]);
        return h.jsx(d("MWPSolidMessageBubble.bs").make, {
            connectBottom: c,
            connectTop: e,
            outgoing: f,
            precedesXMA: g,
            style: a,
            children: b
        })
    }
    j.displayName = j.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.children,
            c = a.connectBottom,
            d = a.connectTop,
            e = a.outgoing;
        a = a.precedesXMA;
        c = h.jsx(j, {
            connectBottom: c,
            connectTop: d,
            outgoing: e,
            precedesXMA: a,
            children: b
        });
        if (a) return h.jsx("div", {
            role: "none",
            style: {
                width: "100%"
            },
            children: c
        });
        else return c
    }
    b = a;
    g.make = b
}), 98);
__d("MDSContextualMenuIcon.react", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a() {
        return h.jsxs("svg", {
            height: "22px",
            viewBox: "0 0 22 22",
            width: "22px",
            children: [h.jsx("circle", {
                cx: "11",
                cy: "6",
                fill: "var(--placeholder-icon)",
                r: "2",
                strokeWidth: "1px"
            }), h.jsx("circle", {
                cx: "11",
                cy: "11",
                fill: "var(--placeholder-icon)",
                r: "2",
                strokeWidth: "1px"
            }), h.jsx("circle", {
                cx: "11",
                cy: "16",
                fill: "var(--placeholder-icon)",
                r: "2",
                strokeWidth: "1px"
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXDeferredPopoverTrigger.react", ["cr:7153", "cr:7154", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        if (b("cr:7153") != null) return h.jsx(b("cr:7153"), babelHelpers["extends"]({}, a));
        return b("cr:7154") != null ? h.jsx(b("cr:7154"), babelHelpers["extends"]({}, a)) : null
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("useMWPCanUserEditMessage", ["I64", "LSAuthorityLevel", "LSHotEmojiSize", "LSIntEnum", "LSMessagingThreadTypeUtil", "MWPActor.react", "ReQL", "ReQLSuspense", "gkx", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a, b) {
        var e, g = d("LSMessagingThreadTypeUtil").isSecure(b.threadType),
            h = d("MWPActor.react").useActor(),
            i = c("useReStore")(),
            j = d("ReQLSuspense").useFirst(function() {
                return d("ReQL").fromTableAscending(i.table("attachments")).getKeyRange(b.threadKey, a.messageId)
            }, [i, a.messageId, b.threadKey], f.id + ":32");
        g = c("gkx")("8016") && g;
        h = d("I64").equal(a.senderId, h);
        var k = a.text != null && a.text !== "";
        e = d("I64").equal((e = a.hotEmojiSize) != null ? e : d("I64").zero, d("LSIntEnum").ofNumber(c("LSHotEmojiSize").NONE));
        j = ((j = j == null ? void 0 : j.hasXma) != null ? j : !1) || a.mentionIds != null;
        var l = a.isUnsent === !1 && d("I64").equal(a.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").AUTHORITATIVE));
        return g && h && k && e && !j && l
    }
    g["default"] = a
}), 98);
__d("MWV2ContextualActionsButton.react", ["fbt", "CometPressable.react", "I64", "JSResourceForInteraction", "LSContactBitOffset", "LSIntEnum", "LSMessagingThreadTypeUtil", "LSThreadBitOffset", "MAWGating", "MDSContextualMenuIcon.react", "MWCMThreadTypes.react", "MWLSFeatureLimitedStatus.bs", "MWPActor.react", "MWV2LogMessageClick.bs", "MWV2MessageRowActionsContext.bs", "MWV2MessageRowIsRowFocusedContext.bs", "MWXDeferredPopoverTrigger.react", "MWXTooltip.react", "ReQL", "ReQLSuspense", "emptyFunction", "gkx", "react", "requireDeferred", "useCometLazyDialog", "useMWPCanRemoveMessageGlobally", "useMWPCanUserEditMessage", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    b = d("react");
    var j = b.useCallback,
        k = b.useContext,
        l = b.useEffect,
        m = c("requireDeferred")("MWV2ContextualActionsMenu.react").__setRef("MWV2ContextualActionsButton.react");

    function a(a) {
        var b = a.canRemoveMessageGlobally,
            e = a.closeActionsMenu,
            g = a.extraActions,
            n = a.learnMoreOnMessageRemove,
            o = a.message,
            p = a.onRemoveMessageLogger,
            q = a.setMoreMenuOpen,
            r = a.showForwardActionInContextualMenu,
            s = a.showReplyActionInContextualMenu,
            t = a.thread,
            u = c("useReStore")(),
            v = h._("__JHASH__I1DdCdLzOkz__JHASH__");
        a = c("useMWPCanRemoveMessageGlobally")(t, o);
        var w = c("useMWPCanUserEditMessage")(o, t),
            x = d("MWCMThreadTypes.react").isJoinedCMThread(t.threadType),
            y = d("MWLSFeatureLimitedStatus.bs").useIsReadOnlyFeatureLimited(),
            z = d("ReQLSuspense").useFirst(function() {
                return x ? d("ReQL").fromTableAscending(u.table("participants")).getKeyRange(t.threadKey, o.senderId) : d("ReQL").empty()
            }, [x, u, t.threadKey, o.senderId], f.id + ":129"),
            A = d("ReQLSuspense").useFirst(function() {
                return x ? d("ReQL").fromTableAscending(u.table("contacts")).getKeyRange(o.senderId) : d("ReQL").empty()
            }, [u, x, o.senderId], f.id + ":139"),
            B = d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(93), t),
            C = d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(102), t),
            D = d("LSMessagingThreadTypeUtil").isSecure(t.threadType);
        y = (!D || d("MAWGating").isFeatureLimitEnabled()) && y;
        var E = !y && c("gkx")("1840885"),
            F = d("MWPActor.react").useActor();
        A = A != null && ((A = d("LSContactBitOffset").has(d("LSIntEnum").ofNumber(77), A)) != null ? A : !1);
        var G = d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(172), t) && !o.isUnsent,
            H = o.isUnsent,
            I = !1;
        x || d("LSMessagingThreadTypeUtil").isDiscoverableChannel(t.threadType) ? I = !H && a : D ? I = !y && (d("MAWGating").isUnsendGlobalEnabled() && d("I64").equal(o.senderId, F) && !o.isUnsent || d("MAWGating").isUnsendLocallyEnabled()) : I = C && E;
        H = c("useCometLazyDialog")(c("JSResourceForInteraction")("MWV2RemoveMessageDialog.react").__setRef("MWV2ContextualActionsButton.react"));
        var J = H[0];
        a = (z == null ? void 0 : z.isAdmin) === !0;
        D = o.unsentTimestampMs != null;
        y = d("MWCMThreadTypes.react").isJoinedCMThread(t.threadType) && B && !a && !d("I64").equal(F, o.senderId) && !D && !A;
        C = d("MWCMThreadTypes.react").isJoinedCMThread(t.threadType) && !d("I64").equal(F, o.senderId) && !D;
        E = d("MWCMThreadTypes.react").isJoinedCMThread(t.threadType) && d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(167), t);
        H = j(function() {
            var a = {
                message: o,
                removeLogger: p,
                thread: t
            };
            return J(a, c("emptyFunction"))
        }, [o, p, J, t]);
        z = d("MWV2MessageRowActionsContext.bs").useMessageRowActionsContext();
        var K = z.removeMessage;
        I ? K.current = H : K.current = c("emptyFunction");
        var L = j(function() {
            if (c("gkx")("3417")) {
                K.current = c("emptyFunction");
                return
            }
        }, [K]);
        l(function() {
            return L
        }, [L]);
        var M = k(d("MWV2MessageRowIsRowFocusedContext.bs").context);
        return !(r || s || G || I || C || w || g != null) ? null : i.jsx(c("MWXDeferredPopoverTrigger.react"), {
            align: "middle",
            onVisibilityChange: function(a) {
                q(function() {
                    return a
                });
                return M.setFocused(function() {
                    return a
                })
            },
            popoverProps: {
                canRemoveMessageGlobally: b,
                closeActionsMenu: e,
                extraActions: g,
                learnMoreOnMessageRemove: n,
                message: o,
                onRemoveMessageLogger: p,
                showCreateSubthread: E,
                showEditInContextualMenu: w,
                showForwardActionInContextualMenu: r,
                showPinMessageActionInContextualMenu: G,
                showReplyActionInContextualMenu: s,
                showReportCommunityMessageToAdmin: y,
                showReportCommunityMessageToFacebook: C,
                showUnsendInContextualMenu: I,
                thread: t
            },
            popoverResource: m,
            popoverType: "menu",
            position: "above",
            children: function(a, b) {
                var e = function() {
                    b();
                    return d("MWV2LogMessageClick.bs").log(u, o, 48)
                };
                return i.jsx(c("MWXTooltip.react"), {
                    align: "middle",
                    position: "above",
                    tooltip: v,
                    children: i.jsx(c("CometPressable.react"), {
                        "aria-label": v,
                        expanding: !0,
                        onPress: e,
                        overlayDisabled: !0,
                        ref: a,
                        testid: void 0,
                        children: i.jsx("div", {
                            className: "xc26acl x6s0dn4 x14yjl9h xudhj91 x18nykt9 xww2gxu x1ypdohk x78zum5 x2lah0s xxk0z11 xl56j7k x11i5rnm x1mh8g0r x1n2onr6 x2b8uid xvy4d1p x15vn3sj",
                            children: i.jsx("div", {
                                className: "x17rw0jw x197sbye x17z2i9w x4gyw5p x1o7uuvo",
                                children: i.jsx(c("MDSContextualMenuIcon.react"), {})
                            })
                        })
                    })
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatColors.bs", [], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        action: {
            alignContent: "xc26acl",
            alignItems: "x6s0dn4",
            borderTopStartRadius: "x14yjl9h",
            borderTopEndRadius: "xudhj91",
            borderBottomEndRadius: "x18nykt9",
            borderBottomStartRadius: "xww2gxu",
            cursor: "x1ypdohk",
            display: "x78zum5",
            flexShrink: "x2lah0s",
            height: "xxk0z11",
            justifyContent: "xl56j7k",
            marginEnd: "x11i5rnm",
            marginStart: "x1mh8g0r",
            position: "x1n2onr6",
            textAlign: "x2b8uid",
            width: "xvy4d1p",
            ":hover_backgroundColor": "x15vn3sj",
            $$css: !0
        },
        icon: {
            height: "x17rw0jw",
            opacity: "x197sbye",
            width: "x17z2i9w",
            ":active_opacity": "x4gyw5p",
            ":hover_opacity": "x1o7uuvo",
            $$css: !0
        },
        svgFill: {
            fill: "x148u3ch",
            $$css: !0
        },
        svgStroke: {
            fill: "xbh8q5q",
            stroke: "xmb71p3",
            $$css: !0
        }
    };
    b = {
        styles: a
    };
    g.MessageActions = b
}), 98);
__d("MWChatForwardDialog.entrypoint", ["JSResourceForInteraction", "MWChatForwardDialogQuery$Parameters", "MWXacGating.bs", "WebPixelRatio"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            return {
                queries: {
                    forwardQueryReference: {
                        parameters: b("MWChatForwardDialogQuery$Parameters"),
                        variables: {
                            scale: d("WebPixelRatio").get(),
                            suppress_xac_groups: !d("MWXacGating.bs").isGroupsEnabled()
                        }
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("MWChatForwardDialog.react").__setRef("MWChatForwardDialog.entrypoint")
    };
    g["default"] = a
}), 98);
__d("useMWChatForward", ["MWChatForwardDialog.entrypoint", "MWChatInteractionLog.bs", "MWChatMessageId", "qpl", "react", "useCometEntryPointDialog"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useCallback,
        i = b.useRef;

    function a(a) {
        var b = a.dropToggle,
            e = a.forwardDialogType,
            f = a.messageID,
            g = a.onClose,
            j = a.onSend;
        a = i(null);
        var k = c("useCometEntryPointDialog")(c("MWChatForwardDialog.entrypoint"), {}),
            l = k[0];
        k = h(function() {
            var a = d("MWChatMessageId").getMessageId(f);
            a != null && d("MWChatInteractionLog.bs").logStartUserFlow(c("qpl")._(25298392, "4881"), a);
            l({
                dropToggle: b,
                forwardDialogType: e,
                messageID: f,
                onSend: j
            }, g)
        }, [j, l, f, g, e, b]);
        return {
            onClick: k,
            triggerRef: a
        }
    }
    g["default"] = a
}), 98);
__d("MWChatForwardAction.bs", ["CometPressable.react", "MWChatColors.bs", "MWXTooltip.react", "ODS", "emptyFunction", "gkx", "react", "stylex", "useMWChatForward"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            icon: {
                opacity: "x1hc1fzr",
                $$css: !0
            }
        },
        j = h.jsx("svg", {
            "aria-hidden": !0,
            height: "22px",
            viewBox: "0 0 36 36",
            width: "22px",
            children: h.jsxs("g", {
                fill: "none",
                fillRule: "evenodd",
                stroke: "none",
                strokeWidth: "1",
                children: [h.jsx("polygon", {
                    points: "0 36 36 36 36 0 0 0"
                }), h.jsx("path", {
                    className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.svgFill),
                    d: "M22.001,11.0081937 L19,11.0081937 L19,23.007676 C19,23.5599911 18.5525,24.0073413 18,24.0073413 C17.448,24.0073413 17,23.5599911 17,23.007676 L17,11.0081937 L13.998,11.0081937 C13.199,11.0081937 12.7225,10.1169921 13.166,9.45171483 L17.1675,3.44572576 C17.5635,2.85142475 18.436,2.85142475 18.832,3.44572576 L22.8335,9.45171483 C23.2765,10.1169921 22.8,11.0081937 22.001,11.0081937 M24,31 L12,31 C9.791,31 8,29.2105991 8,27.0028383 L8,18.0103492 C8,15.8030883 9.791,14.0131875 12,14.0131875 L14,14.0131875 C14.5525,14.0131875 15,14.4610376 15,15.0128528 C15,15.5646681 14.5525,16.0120183 14,16.0120183 L12,16.0120183 C10.8955,16.0120183 10,16.9067187 10,18.0103492 L10,27.0028383 C10,28.1064688 10.8955,29.0011693 12,29.0011693 L24,29.0011693 C25.1045,29.0011693 26,28.1064688 26,27.0028383 L26,18.0103492 C26,16.9067187 25.1045,16.0120183 24,16.0120183 L22,16.0120183 C21.448,16.0120183 21,15.5646681 21,15.0128528 C21,14.4610376 21.448,14.0131875 22,14.0131875 L24,14.0131875 C26.2095,14.0131875 28,15.8030883 28,18.0103492 L28,27.0028383 C28,29.2105991 26.2095,31 24,31"
                })]
            })
        });

    function k(a) {
        d("ODS").bumpEntityKey(3185, "mwchat_actions", "forward"), a == null ? void 0 : a.onClick()
    }

    function a(a) {
        var b = a.dropToggle;
        b = b === void 0 ? !1 : b;
        var e = a.forwardDialogType;
        e = e === void 0 ? "open_" : e;
        var f = a.label,
            g = a.messageID;
        a = a.onForward;
        var l = c("useMWChatForward")({
            dropToggle: b,
            forwardDialogType: e,
            messageID: g,
            onClose: c("emptyFunction"),
            onSend: a
        });
        return h.jsx(c("MWXTooltip.react"), {
            align: "middle",
            position: "above",
            tooltip: f,
            children: h.jsx("div", {
                className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.action),
                children: h.jsx(c("CometPressable.react"), {
                    "aria-label": f,
                    expanding: !0,
                    onPress: function() {
                        return k(l)
                    },
                    overlayDisabled: !0,
                    role: c("gkx")("1224637") ? "menuitem" : "button",
                    testid: void 0,
                    children: h.jsx("div", {
                        className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.icon, i.icon),
                        children: j
                    })
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("MWV2ForwardMessageButton.bs", ["fbt", "I64", "Int64Hooks", "LSBitFlag", "LSIntEnum", "LSMessagingThreadTypeUtil", "MAWGating", "MWChatForwardAction.bs", "MWChatMessageId", "MWV2ForwardMessage.bs", "ReQL.bs", "ReQLSubscription.bs", "react", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");

    function j(a, b) {
        var e = c("useReStore")();
        return d("ReQLSubscription.bs").useFirstExn(d("Int64Hooks").useMemoInt64(function() {
            return d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(e.table("threads")), {
                hd: b.threadKey,
                tl: 0
            })
        }, [e, b.threadKey]), "2bqq9v8u")
    }

    function a(a) {
        var b = a.message,
            e = c("useReStore")();
        e = j(e, b);
        var f = d("LSMessagingThreadTypeUtil").isSecure(e.threadType),
            g = d("MAWGating").isCrossForwardEnabled();
        f = f ? g ? "cross_transport" : "secure" : g ? "cross_transport" : "open_";
        g = d("MWChatMessageId").makeSent(d("I64").to_string(b.threadKey), b.messageId, d("I64").to_string(b.timestampMs));
        var k = b.stickerId,
            l = d("MWV2ForwardMessage.bs").useForwardMessage(b);
        e = !d("LSMessagingThreadTypeUtil").isSecure(e.threadType);
        b = d("LSBitFlag").has(d("LSIntEnum").ofNumber(1), b.displayedContentTypes) && !b.textHasLinks || d("LSBitFlag").has(d("LSIntEnum").ofNumber(16384), b.displayedContentTypes) || d("LSBitFlag").has(d("LSIntEnum").ofNumber(2), b.displayedContentTypes) || d("LSBitFlag").has(d("LSIntEnum").ofNumber(4), b.displayedContentTypes) || d("LSBitFlag").has(d("LSIntEnum").ofNumber(512), b.displayedContentTypes) || k != null && d("I64").equal(k, d("I64").of_string("369239263222822")) || k != null && d("I64").equal(k, d("I64").of_string("369239343222814")) || k != null && d("I64").equal(k, d("I64").of_string("369239383222810"));
        k = e && !b || a.dropForwardE2eeToggle === !0;
        return i.jsx(d("MWChatForwardAction.bs").make, {
            dropToggle: k,
            forwardDialogType: f,
            label: h._("__JHASH__GvPr2MwluxY__JHASH__"),
            messageID: g,
            onForward: l
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWXPopoverLoadingState.react", ["cr:2518", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    d("react"), g["default"] = b("cr:2518")
}), 98);
__d("MWChatReactionsActionContainer.react", ["JSResourceForInteraction", "MWV2MessageRowIsRowFocusedContext.bs", "MWXLazyPopoverTrigger.react", "MWXPopoverLoadingState.react", "emptyFunction", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useCallback,
        j = b.useContext,
        k = b.useState,
        l = {
            popoverLoading: {
                minHeight: "x1wiwyrm",
                minWidth: "x1q6reyq",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.align;
        b = b === void 0 ? "middle" : b;
        var e = a.alwaysShowEmojiPicker;
        e = e === void 0 ? !1 : e;
        var f = a.children,
            g = a.closeActionsMenu,
            m = a.disableCustomReactions;
        m = m === void 0 ? !1 : m;
        var n = a.hasReactionsV2,
            o = a.isBroadcastThread,
            p = a.isSecure;
        p = p === void 0 ? !1 : p;
        var q = a.messageID,
            r = a.onVisibilityChange,
            s = a.reactionsPopoverResource,
            t = a.selectedReactions,
            u = a.sendReaction,
            v = j(d("MWV2MessageRowIsRowFocusedContext.bs").context);
        s = (a = s) != null ? a : c("JSResourceForInteraction")("MWChatReactionsMenu.react").__setRef("MWChatReactionsActionContainer.react");
        a = k(!1);
        var w = a[0],
            x = a[1],
            y = t != null && t.length > 0 && t[0] || void 0;
        a = e || w;
        e = i(function(a) {
            var b = y != null && n !== !0 && y === a;
            u(a, b);
            return g()
        }, [y, n, u, g]);
        w = i(function(a) {
            a || x(!1), r(a), v.setFocused(a)
        }, [v, r]);
        return h.jsx(c("MWXLazyPopoverTrigger.react"), {
            align: b === "end_" ? "end" : b,
            fallback: h.jsx(c("MWXPopoverLoadingState.react"), {
                withArrow: !1,
                xstyle: l.popoverLoading
            }),
            onVisibilityChange: w,
            popoverProps: {
                closeActionsMenu: g,
                disableCustomReactions: m,
                isBroadcastThread: o,
                isSecure: p,
                messageID: q,
                onClose: c("emptyFunction"),
                onSelect: e,
                selectedReactions: t,
                setShowEmojiPicker: x,
                showEmojiPicker: a
            },
            popoverResource: s,
            popoverType: a ? "dialog" : "menu",
            position: a ? "below" : "above",
            children: f
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWMessageReactionIcon.react", ["fbt", "MWChatColors.bs", "react", "stylex"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");

    function a(a) {
        var b = a.size;
        b = b === void 0 ? 16 : b;
        a = a.viewBox;
        a = a === void 0 ? "0 0 16 16" : a;
        return i.jsxs("svg", {
            fill: "none",
            height: b,
            viewBox: a,
            width: b,
            xmlns: "http://www.w3.org/2000/svg",
            children: [i.jsx("title", {
                children: h._("__JHASH__Wo2O5nlXhKT__JHASH__")
            }), i.jsx("path", {
                className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.svgFill),
                d: "M12.48 0.64C12.48 0.286538 12.7665 0 13.12 0C13.4735 0 13.76 0.286538 13.76 0.64V2.08C13.76 2.16837 13.8316 2.24 13.92 2.24H15.36C15.7135 2.24 16 2.52654 16 2.88C16 3.23346 15.7135 3.52 15.36 3.52H13.92C13.8316 3.52 13.76 3.59163 13.76 3.68V5.12C13.76 5.47346 13.4735 5.76 13.12 5.76C12.7665 5.76 12.48 5.47346 12.48 5.12V3.68C12.48 3.59163 12.4084 3.52 12.32 3.52H10.88C10.5265 3.52 10.24 3.23346 10.24 2.88C10.24 2.52654 10.5265 2.24 10.88 2.24H12.32C12.4084 2.24 12.48 2.16837 12.48 2.08V0.64Z"
            }), i.jsx("path", {
                className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.svgFill),
                clipRule: "evenodd",
                d: "M8.96 2.42705C8.96 2.28386 8.86505 2.15735 8.726 2.12317C8.18582 1.99041 7.62113 1.92 7.04 1.92C3.15192 1.92 0 5.07192 0 8.96C0 12.8481 3.15192 16 7.04 16C10.9281 16 14.08 12.8481 14.08 8.96C14.08 8.37887 14.0096 7.81418 13.8768 7.274C13.8427 7.13495 13.7161 7.04 13.573 7.04H13.12C12.0596 7.04 11.2 6.18039 11.2 5.12C11.2 4.94327 11.0567 4.8 10.88 4.8C9.81961 4.8 8.96 3.94039 8.96 2.88V2.42705ZM4.63999 6.4C4.03999 6.4 3.67999 6.88 3.67999 7.68C3.67999 8.48 4.03999 8.96 4.63999 8.96C5.23999 8.96 5.59999 8.48 5.59999 7.68C5.59999 6.88 5.23999 6.4 4.63999 6.4ZM9.43999 6.4C8.83999 6.4 8.47999 6.88 8.47999 7.68C8.47999 8.48 8.83999 8.96 9.43999 8.96C10.04 8.96 10.4 8.48 10.4 7.68C10.4 6.88 10.04 6.4 9.43999 6.4ZM10.56 11.2C10.56 12.48 8.96 13.76 7.04 13.76C5.12 13.76 3.52 12.48 3.52 11.2C3.52 11.0233 3.66327 10.88 3.84 10.88H10.24C10.4167 10.88 10.56 11.0233 10.56 11.2Z",
                fillRule: "evenodd"
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatReactionsAction.react", ["fbt", "CometPressable.react", "MWChatColors.bs", "MWChatMessageId", "MWChatReactionsActionContainer.react", "MWMessageReactionIcon.react", "MWV2MessageRowActionsContext.bs", "MWXTooltip.react", "ODS", "emptyFunction", "gkx", "react", "stylex", "useIsMultiReactionEnabled"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    b = d("react");
    var j = b.useCallback,
        k = b.useEffect,
        l = i.jsxs("svg", {
            height: "22px",
            viewBox: "0 0 22 22",
            width: "22px",
            children: [i.jsx("circle", {
                className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.svgStroke),
                cx: "11",
                cy: "11",
                r: "7",
                strokeWidth: "1.5px"
            }), i.jsx("path", {
                className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.svgStroke),
                d: "M8,13Q11,16,14,13",
                strokeWidth: "1.5px"
            }), i.jsx("circle", {
                className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.svgFill),
                cx: "9",
                cy: "10",
                r: "1.2"
            }), i.jsx("circle", {
                className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.svgFill),
                cx: "13",
                cy: "10",
                r: "1.2"
            })]
        });

    function a(a) {
        var b = h._("__JHASH__czR8vxcW0mN__JHASH__"),
            e = d("MWV2MessageRowActionsContext.bs").useMessageRowActionsContext(),
            f = e.openReactionsMenu,
            g = j(function(a) {
                if (c("gkx")("3417")) {
                    f.current = c("emptyFunction");
                    return
                }
            }, [f]);
        k(function() {
            return g
        }, [g]);
        e = a.messageID;
        e = d("MWChatMessageId").getThreadId(e);
        var m = d("useIsMultiReactionEnabled").useIsMultiReactEnabled(e);
        return i.jsx(c("MWChatReactionsActionContainer.react"), babelHelpers["extends"]({}, a, {
            children: function(a, e, g, h, j, k) {
                g = function() {
                    e(), d("ODS").bumpEntityKey(3185, "mwchat_actions", "reaction")
                };
                f.current = g;
                return i.jsx(c("MWXTooltip.react"), {
                    align: "middle",
                    position: "above",
                    tooltip: b,
                    children: i.jsx(c("CometPressable.react"), {
                        "aria-label": b,
                        expanding: !0,
                        onHoverIn: h,
                        onHoverOut: j,
                        onPress: g,
                        onPressIn: k,
                        overlayDisabled: !0,
                        ref: a,
                        role: "button",
                        testid: void 0,
                        children: i.jsx("div", {
                            className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.action),
                            children: i.jsx("div", {
                                className: c("stylex")(d("MWChatColors.bs").MessageActions.styles.icon),
                                children: m ? i.jsx(c("MWMessageReactionIcon.react"), {
                                    size: 22,
                                    viewBox: "-4 -2 22 22"
                                }) : l
                            })
                        })
                    })
                })
            }
        }))
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWV2MessageReactionButton.react", ["I64", "LSMessagingThreadTypeUtil", "MAWGating", "MAWPSendOrRemoveReaction.react", "MWCMThreadTypes.react", "MWChatMessageId", "MWChatReactionsAction.react", "MWLSFeatureLimitedStatus.bs", "MWV2MessageReactionHooks", "react", "useIsReactionsV2Enabled"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useCallback,
        j = b.useMemo;

    function a(a) {
        var b = a.closeActionsMenu,
            e = a.message,
            f = a.onReactionsSendLogger,
            g = a.reactionsPopoverResource,
            k = a.setReactionsMenuOpen;
        a = a.thread;
        var l = d("MWV2MessageReactionHooks").MWV2MessageReactionHooks.useSelectedReaction(e),
            m = d("MWV2MessageReactionHooks").MWV2MessageReactionHooks.useSelectedReactionsV2(e),
            n = d("LSMessagingThreadTypeUtil").isSecure(a.threadType),
            o = d("MAWPSendOrRemoveReaction.react").useSendOrRemoveReaction(e, n, "reaction_tray"),
            p = d("MWLSFeatureLimitedStatus.bs").useIsReadOnlyFeatureLimited();
        p = (!n || d("MAWGating").isFeatureLimitEnabled()) && p;
        var q = d("I64").to_string(a.threadKey),
            r = d("I64").to_string(e.timestampMs),
            s = j(function() {
                return d("MWChatMessageId").makeSent(q, e.messageId, r)
            }, [q, e.messageId, r]),
            t = i(function(a, b) {
                f && f();
                return o(e.messageId, b ? void 0 : a, b ? "remove_reaction" : "reaction")
            }, [o, e.messageId]),
            u = d("MWCMThreadTypes.react").isBroadcastThread(a.threadType);
        a = d("useIsReactionsV2Enabled").useIsReactionsV2Enabled(a.threadKey);
        if (p) return null;
        else {
            return h.jsx(c("MWChatReactionsAction.react"), {
                closeActionsMenu: b,
                disableCustomReactions: a && u,
                hasReactionsV2: a,
                isBroadcastThread: u,
                isSecure: n,
                messageID: s,
                onVisibilityChange: k,
                reactionsPopoverResource: g,
                selectedReactions: a ? (p = m) != null ? p : void 0 : l != null ? [l] : void 0,
                sendReaction: t
            })
        }
    }
    g["default"] = a
}), 98);
__d("MWV2OneToOneThreadBlockedContext.bs", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    c = d("react");
    e = c.createContext;
    var h = c.createElement,
        i = c.useContext,
        j = e(!1);

    function a() {
        return i(j)
    }

    function b(a) {
        var b = a.blocked;
        a = a.children;
        return h(j.Provider, {
            children: a,
            value: b
        })
    }
    f = b;
    g.useIsBlocked = a;
    g.make = f
}), 98);
__d("MDSReplyActionSvgIcon.react", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a() {
        return h.jsx("svg", {
            height: "22px",
            viewBox: "1 1 21 21",
            width: "22px",
            children: h.jsx("g", {
                className: "x148u3ch",
                fillRule: "evenodd",
                strokeWidth: "1",
                children: h.jsx("path", {
                    d: "M10.8932368,14.7625445 C10.8932368,15.535432 10.0849567,15.996442 9.48116675,15.5677995 L4.03193175,11.696707 C3.49257425,11.313742 3.49287675,10.4694645 4.03193175,10.0864995 L9.48116675,6.2157095 C10.0849567,5.7867645 10.8932368,6.248077 10.8932368,7.020662 L10.8938418,9.0755445 C15.2129368,9.0755445 18.1517243,11.027577 18.1523293,15.7226795 C18.1523293,16.0820495 17.9036743,16.3349395 17.5273643,16.3349395 C17.2487618,16.3349395 17.0164418,16.1746145 16.8527893,15.680027 C16.1588543,13.584307 14.1063918,12.7049395 10.8938418,12.7049395 L10.8932368,14.7625445 Z"
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWV2ReplyButton.bs", ["fbt", "CometPressable.react", "MDSReplyActionSvgIcon.react", "MWPReplyContext.bs", "MWV2MessageListIsRowModalContext.bs", "MWV2MessageRowActionsContext.bs", "MWXTooltip.react", "emptyFunction", "gkx", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    b = d("react");
    var j = b.useCallback,
        k = b.useContext,
        l = b.useEffect;

    function a(a) {
        var b = a.message;
        a = h._("__JHASH__xFCj85w6vra__JHASH__");
        var e = k(d("MWPReplyContext.bs").context),
            f = e.setReply,
            g = k(d("MWV2MessageListIsRowModalContext.bs").context),
            m = function() {
                f({
                    messageId: b.messageId,
                    offlineThreadingId: b.offlineThreadingId,
                    sendStatusV2: b.sendStatusV2,
                    timestampMs: b.timestampMs
                }, b.threadKey);
                return g(function() {
                    return ""
                })
            };
        e = d("MWV2MessageRowActionsContext.bs").useMessageRowActionsContext();
        var n = e.replyToMessage;
        n.current = m;
        var o = j(function() {
            if (c("gkx")("3417")) {
                n.current = c("emptyFunction");
                return
            }
        }, [n]);
        l(function() {
            return o
        }, [o]);
        return i.jsx(c("MWXTooltip.react"), {
            align: "middle",
            position: "above",
            tooltip: a,
            children: i.jsx("div", {
                className: "xc26acl x6s0dn4 x14yjl9h xudhj91 x18nykt9 xww2gxu x1ypdohk x78zum5 x2lah0s xxk0z11 xl56j7k x11i5rnm x1mh8g0r x1n2onr6 x2b8uid xvy4d1p x15vn3sj",
                children: i.jsx(c("CometPressable.react"), {
                    "aria-label": a,
                    expanding: !0,
                    onPress: function() {
                        return m()
                    },
                    overlayDisabled: !0,
                    testid: void 0,
                    children: i.jsx("div", {
                        className: "x17rw0jw x197sbye x17z2i9w x4gyw5p x1o7uuvo",
                        children: i.jsx(c("MDSReplyActionSvgIcon.react"), {})
                    })
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    e = a;
    g.make = e
}), 98);
__d("MWXTooltipGroup.react", ["cr:11874"], (function(a, b, c, d, e, f, g) {
    "use strict";
    g["default"] = b("cr:11874")
}), 98);
__d("useMWHasForwardAction", ["I64", "LSAuthorityLevel", "LSBitFlag", "LSContactBitOffset", "LSIntEnum", "LSMessagingThreadTypeUtil", "LSThreadBitOffset", "MAWGating", "MAWMsg", "MWCMIsAnyCMThread", "MWLSFeatureLimitedStatus.bs", "MWV2OneToOneThreadBlockedContext.bs", "MessagingAttachmentType", "ReQL", "ReQLSuspense", "gkx", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a, b, e) {
        var g = c("useReStore")(),
            h = d("LSMessagingThreadTypeUtil").isSecure(a.threadType),
            i = b.ephemeralDurationInSec;
        i = i != null ? d("I64").gt(i, d("I64").zero) : !1;
        var j = d("MWLSFeatureLimitedStatus.bs").useIsReadOnlyFeatureLimited() && (!h || d("MAWGating").isFeatureLimitEnabled()),
            k = d("I64").equal(b.displayedContentTypes, d("LSIntEnum").ofNumber(4096)),
            l = d("I64").equal(b.displayedContentTypes, d("LSIntEnum").ofNumber(64)),
            m = d("MWV2OneToOneThreadBlockedContext.bs").useIsBlocked(),
            n = d("ReQLSuspense").useFirst(function() {
                return d("ReQL").fromTableAscending(g.table("contacts")).getKeyRange(a.threadKey)
            }, [a.threadKey, g], f.id + ":58");
        n = n != null ? (n = d("LSContactBitOffset").has(d("LSIntEnum").ofNumber(66), n)) != null ? n : !1 : !1;
        var o = c("MWCMIsAnyCMThread")(a.threadType) && d("I64").equal(b.sendStatusV2, d("LSIntEnum").ofNumber(4)),
            p = d("LSBitFlag").has(d("LSIntEnum").ofNumber(2), b.displayedContentTypes);
        h = (h ? !i && !k && !(l && !c("gkx")("9045")) : !0) && c("gkx")("1844772") && !m && !n && !j && !b.isUnsent && !o && !d("MAWMsg").isPlaceholder(b) && d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(103), a) && d("I64").gt(b.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").OPTIMISTIC)) && (e != null && d("I64").equal(e.attachmentType, d("LSIntEnum").ofNumber(c("MessagingAttachmentType").XMA)) && (e.attachmentCta1Id != null || e.attachmentCta2Id != null || e.attachmentCta3Id != null || e.defaultCtaId != null) ? e.isSharable : !0);
        i = p && h;
        return {
            hasForwardAction: h,
            shouldShowForwardAction: i
        }
    }
    g["default"] = a
}), 98);
__d("useMWV2MessageForwardAction", ["I64", "LSBitFlag", "LSIntEnum", "LSMessagingThreadTypeUtil", "MAWGating", "MWChatMessageId", "MWV2ForwardMessage.bs", "MWV2LogMessageClick.bs", "MWV2MessageRowIsRowFocusedContext.bs", "gkx", "promiseDone", "react", "useMWChatForward", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useCallback,
        i = b.useContext;

    function a(a, b) {
        var e = c("useReStore")(),
            f = c("gkx")("1224637"),
            g = !f && d("LSMessagingThreadTypeUtil").isSecure(a.threadType);
        f = !f && d("MAWGating").isCrossForwardEnabled();
        g = g ? f ? "cross_transport" : "secure" : f ? "cross_transport" : "open_";
        f = d("MWChatMessageId").makeSent(d("I64").to_string(b.threadKey), b.messageId, d("I64").to_string(b.timestampMs));
        var j = d("MWV2ForwardMessage.bs").useForwardMessage(b),
            k = i(d("MWV2MessageRowIsRowFocusedContext.bs").context),
            l = k.setFocused,
            m = k.setIsDialogOpened;
        k = b.stickerId;
        a = !d("LSMessagingThreadTypeUtil").isSecure(a.threadType);
        k = d("LSBitFlag").has(d("LSIntEnum").ofNumber(1), b.displayedContentTypes) && !b.textHasLinks || d("LSBitFlag").has(d("LSIntEnum").ofNumber(16384), b.displayedContentTypes) || d("LSBitFlag").has(d("LSIntEnum").ofNumber(2), b.displayedContentTypes) || d("LSBitFlag").has(d("LSIntEnum").ofNumber(4), b.displayedContentTypes) || d("LSBitFlag").has(d("LSIntEnum").ofNumber(512), b.displayedContentTypes) || d("LSBitFlag").has(d("LSIntEnum").ofNumber(1024), b.displayedContentTypes) || k != null && d("I64").equal(k, d("I64").of_string("369239263222822")) || k != null && d("I64").equal(k, d("I64").of_string("369239343222814")) || k != null && d("I64").equal(k, d("I64").of_string("369239383222810"));
        var n = c("useMWChatForward")({
            dropToggle: a && !k,
            forwardDialogType: g,
            messageID: f,
            onClose: h(function() {
                m(function() {
                    return !1
                }), l(function() {
                    return !0
                })
            }, [l, m]),
            onSend: h(function(a) {
                return c("promiseDone")(j(a))
            }, [j])
        });
        return function() {
            d("MWV2LogMessageClick.bs").log(e, b, 44), n != null && (m(function() {
                return !0
            }), n.onClick())
        }
    }
    g["default"] = a
}), 98);
__d("MWMessageRowActions.react", ["I64", "LSBitFlag", "LSContactBitOffset", "LSIntEnum", "LSMessagingThreadTypeUtil", "LSThreadBitOffset", "MNLSXMALayoutType", "MWCMIsAnyCMThread", "MWCMThreadTypes.react", "MWLSThreadDisplayContext", "MWPBaseMessageListRowActions.react", "MWV2ContextualActionsButton.react", "MWV2ForwardMessageButton.bs", "MWV2MessageReactionButton.react", "MWV2MessageRowActionsContext.bs", "MWV2OneToOneThreadBlockedContext.bs", "MWV2ReplyButton.bs", "MWXTooltipGroup.react", "ReQL", "ReQLSuspense", "cr:5743", "cr:7122", "emptyFunction", "gkx", "qex", "react", "useMWHasForwardAction", "useMWV2MessageForwardAction", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    e = d("react");
    var i = e.useCallback,
        j = e.useEffect,
        k = e.useState;

    function l(a) {
        var b = c("useReStore")();
        return d("ReQLSuspense").useFirstExn(function() {
            return d("ReQL").fromTableAscending(b.table("threads")).getKeyRange(a.threadKey)
        }, [b, a.threadKey], f.id + ":62")
    }

    function m(a) {
        var e = a.alwaysShowForwardForMediaMessages,
            g = a.canRemoveMessageGlobally,
            k = a.closeActionsMenu,
            m = a.dropForwardE2eeToggle,
            n = a.extraActions,
            o = a.interactedWith,
            p = a.learnMoreOnMessageRemove,
            q = a.message,
            r = a.onReactionsSendLogger,
            s = a.onRemoveMessageLogger,
            t = a.outgoing,
            u = a.reactionsPopoverResource,
            v = a.setMoreMenuOpen,
            w = a.setReactionsMenuOpen;
        a = a.shouldHideHoverMenuReact;
        var x = l(q),
            y = d("MWV2OneToOneThreadBlockedContext.bs").useIsBlocked(),
            z = c("useReStore")(),
            A = x.threadKey,
            B = d("ReQLSuspense").useFirst(function() {
                return d("ReQL").fromTableAscending(z.table("contacts")).getKeyRange(A)
            }, [A, z], f.id + ":110"),
            C = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        B = B != null ? (B = d("LSContactBitOffset").has(d("LSIntEnum").ofNumber(66), B)) != null ? B : !1 : !1;
        var D = d("LSMessagingThreadTypeUtil").isSecure(x.threadType),
            E = !d("I64").equal(q.displayedContentTypes, d("LSIntEnum").ofNumber(1)),
            F = c("MWCMIsAnyCMThread")(x.threadType) && d("I64").equal(q.sendStatusV2, d("LSIntEnum").ofNumber(4)),
            G = d("ReQLSuspense").useFirst(function() {
                return E ? d("ReQL").fromTableAscending(z.table("attachments")).getKeyRange(q.threadKey, q.messageId) : d("ReQL").empty()
            }, [z, q.messageId, q.threadKey, E], f.id + ":134"),
            H = c("useMWHasForwardAction")(x, q, G),
            I = H.hasForwardAction;
        H = H.shouldShowForwardAction;
        var J = !y && !B && !F && d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(42), x) && !q.isUnsent,
            K = d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(169), x);
        y = !y && !B && !q.isUnsent && !F && (d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(18), x) || K) && (D ? c("qex")._("1525") === !0 : !0);
        B = J && !e && o;
        F = o && y && !a;
        K = d("MWCMThreadTypes.react").isJoinedCMThread(x.threadType) && C === "Inbox" && d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(167), x) && !((G == null ? void 0 : G.xmaLayoutType) != null && d("I64").equal(G.xmaLayoutType, d("LSIntEnum").ofNumber(c("MNLSXMALayoutType").THREAD_SHORTCUT)));
        e = D && d("I64").equal(q.sendStatusV2, d("LSIntEnum").ofNumber(5));
        y = c("useMWV2MessageForwardAction")(x, q);
        a = d("MWV2MessageRowActionsContext.bs").useMessageRowActionsContext();
        var L = a.forwardMessage;
        I && (L.current = y);
        var M = i(function() {
            if (c("gkx")("3417")) {
                L.current = c("emptyFunction");
                return
            }
        }, [L]);
        j(function() {
            return M
        }, [M]);
        return h.jsxs(d("MWPBaseMessageListRowActions.react").MWPBaseMessageListRowActionsList, {
            outgoing: t,
            children: [H ? h.jsx(d("MWPBaseMessageListRowActions.react").MWPBaseMessageListRowActionsListItem, {
                children: h.jsx(c("MWV2ForwardMessageButton.bs"), {
                    dropForwardE2eeToggle: m,
                    message: q
                })
            }) : null, F ? h.jsx(d("MWPBaseMessageListRowActions.react").MWPBaseMessageListRowActionsListItem, {
                children: h.jsx(c("MWV2MessageReactionButton.react"), {
                    closeActionsMenu: k,
                    message: q,
                    onReactionsSendLogger: r,
                    reactionsPopoverResource: u,
                    setReactionsMenuOpen: w,
                    thread: x
                })
            }) : null, b("cr:7122") != null && e ? h.jsx(d("MWPBaseMessageListRowActions.react").MWPBaseMessageListRowActionsListItem, {
                children: h.jsx(b("cr:7122"), {
                    message: q
                })
            }) : null, B ? h.jsx(d("MWPBaseMessageListRowActions.react").MWPBaseMessageListRowActionsListItem, {
                children: h.jsx(d("MWV2ReplyButton.bs").make, {
                    message: q
                })
            }) : null, K && b("cr:5743") != null ? h.jsx(d("MWPBaseMessageListRowActions.react").MWPBaseMessageListRowActionsListItem, {
                children: h.jsx(b("cr:5743"), {
                    message: q
                })
            }) : null, o ? h.jsx(d("MWPBaseMessageListRowActions.react").MWPBaseMessageListRowActionsListItem, {
                children: h.jsx(c("MWV2ContextualActionsButton.react"), {
                    canRemoveMessageGlobally: g,
                    closeActionsMenu: k,
                    extraActions: n,
                    learnMoreOnMessageRemove: p,
                    message: q,
                    onRemoveMessageLogger: s,
                    setMoreMenuOpen: v,
                    showForwardActionInContextualMenu: !H && I,
                    showReplyActionInContextualMenu: !B && J,
                    thread: x
                })
            }) : null]
        })
    }
    m.displayName = m.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.ariaHidden,
            e = a.canRemoveMessageGlobally,
            f = a.dropForwardE2eeToggle,
            g = a.extraActions,
            i = a.focused,
            j = a.hasReactions,
            l = a.hovered,
            n = a.learnMoreOnMessageRemove,
            o = a.message,
            p = a.onReactionsSendLogger,
            q = a.onRemoveMessageLogger,
            r = a.outgoing,
            s = a.reactionsPopoverResource;
        a = a.shouldHideHoverMenuReact;
        a = a === void 0 ? !1 : a;
        var t = k(!1),
            u = t[0];
        t = t[1];
        var v = k(!1),
            w = v[0];
        v = v[1];
        var x = d("LSBitFlag").has(d("LSIntEnum").ofNumber(2), o.displayedContentTypes);
        l = l || i || w || u;
        return h.jsx(c("MWXTooltipGroup.react"), {
            children: h.jsx(d("MWPBaseMessageListRowActions.react").MWPBaseMessageListRowActionsContainer, {
                ariaHidden: (i = b) != null ? i : !1,
                hasReactions: j,
                outgoing: r,
                children: l || x ? h.jsx(m, {
                    alwaysShowForwardForMediaMessages: x,
                    canRemoveMessageGlobally: (w = e) != null ? w : !0,
                    closeActionsMenu: c("emptyFunction"),
                    dropForwardE2eeToggle: f,
                    extraActions: (u = g) != null ? u : null,
                    interactedWith: l,
                    learnMoreOnMessageRemove: n,
                    message: o,
                    onReactionsSendLogger: p,
                    onRemoveMessageLogger: q,
                    outgoing: r,
                    reactionsPopoverResource: s,
                    setMoreMenuOpen: v,
                    setReactionsMenuOpen: t,
                    shouldHideHoverMenuReact: a
                }) : null
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("CSIGChatMessageRow.bs", ["CSIGChatBubble.bs", "CometErrorBoundary.react", "I64", "IGDAttachmentOpen.react", "IGDChatEmoji.react", "IGDMessageListText.react", "IGDMessageRowFooter.react", "IGDMessageSendingStatus.react", "LSIntEnum", "MWMessageRowActions.react", "MWPActor.react", "MWPBaseMessage.react", "MWPBaseMessageListRow.react", "MWPBaseMessageRowHeader.react", "MWPMessageListColumn.react", "MWPMessageListRowWithKeyboardInteractions.bs", "MWPMessageLoggingWrapper.bs", "MWPMessageParsingUtils.bs", "MWThreadKey.react", "MWV2ChatAdminMessage.react", "MWV2ChatErrorBubble.react", "MWV2MessageProfilePhoto.react", "MWV2MessageRowSimple.react", "MWV2MessageStartOfGroupContent.bs", "MWXText.react", "react", "useCometUniqueID"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    e = d("react");
    var i = e.memo,
        j = e.useState;

    function a(a) {
        var b = a.isFirstMessageInGroup,
            e = a.isGroupThread,
            f = a.isLastMessageInGroup,
            g = a.message,
            i = a.nextMessage,
            j = a.outgoing,
            k = a.prevMessage;
        return h.jsx(c("MWPBaseMessage.react"), {
            checkEmoticon: !1,
            isFirstMessageInGroup: b,
            isLastMessageInGroup: f,
            message: g,
            nextMessage: i,
            outgoing: j,
            prevMessage: k,
            reactions: [],
            renderAttachment: function(a, b, e) {
                return h.jsx(d("MWThreadKey.react").MWThreadKeyProvider, {
                    id: g.threadKey,
                    children: h.jsx(c("IGDAttachmentOpen.react"), {
                        connectBottom: b,
                        connectTop: a,
                        hasText: e,
                        message: g,
                        nextMessage: i,
                        outgoing: j,
                        prevMessage: k
                    })
                })
            },
            renderEmoji: function(a) {
                return h.jsx(c("IGDChatEmoji.react"), {
                    text: a.text
                })
            },
            renderMessageBubble: function(a, e, f, g, b) {
                return h.jsx(d("CSIGChatBubble.bs").make, {
                    connectBottom: f,
                    connectTop: e,
                    outgoing: b,
                    precedesXMA: g,
                    children: h.jsx(c("IGDMessageListText.react"), {
                        enableMessengerTextFormatting: !0,
                        isSecureMessage: !1,
                        message: a,
                        outgoing: b,
                        precedesXMA: g
                    })
                })
            },
            renderMessageContainer: function(a, b) {
                return h.jsx(d("MWPMessageLoggingWrapper.bs").make, {
                    messageId: g.messageId,
                    optimisticMessageId: g.offlineThreadingId,
                    xstyle: b,
                    children: a
                })
            },
            renderMessageFooter: function() {
                return h.jsx(c("IGDMessageRowFooter.react"), {
                    hasReactions: !1,
                    isGroupThread: e,
                    message: g,
                    outgoing: j,
                    reactions: []
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    var k = i(a);

    function b(a) {
        var b = a.domElementRef,
            e = a.isGroupThread,
            f = e === void 0 ? !0 : e,
            g = a.isModal,
            i = a.message;
        e = a.nextMessage;
        var l = a.prevMessage;
        a = a.stopHoveringRef;
        var m = d("MWPActor.react").useActor(),
            n = d("MWPMessageParsingUtils.bs").isStartOfGroup(i, l),
            o = d("MWPMessageParsingUtils.bs").isEndOfGroup(i, e),
            p = d("I64").equal(i.senderId, m);
        m = c("useCometUniqueID")();
        var q = j(!1),
            r = q[0];
        q = q[1];
        var s = j(!1),
            t = s[0];
        s = s[1];
        var u = j(!1),
            v = u[0];
        u = u[1];
        if (i.isAdminMessage) return h.jsx(c("MWV2MessageRowSimple.react"), {
            children: h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnShrinkwrap, {
                centered: !0,
                children: h.jsx(d("MWV2ChatAdminMessage.react").MWV2ChatAdminMessage, {
                    message: i,
                    nextMessage: e,
                    prevMessage: l
                })
            })
        });
        m = {
            children: [h.jsx(c("MWPBaseMessageRowHeader.react"), {
                isFirstMessageInGroup: n,
                isGroupThread: f,
                message: i,
                outgoing: p,
                renderForwardSnippet: function() {
                    return null
                },
                renderPinnedText: function() {
                    return null
                },
                renderReplySnippet: function() {
                    return null
                },
                renderTextWrapper: function(a) {
                    return h.jsx(c("MWXText.react"), {
                        color: "secondary",
                        type: "meta4",
                        children: a
                    })
                },
                renderTimestamp: void 0
            }, "header"), h.jsxs(h.Fragment, {
                children: [n ? h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnVerticalRhythm, {
                    height: 2
                }) : null, h.jsx(d("MWPBaseMessageListRow.react").MWPBaseMessageListRowBody, {
                    hasReactions: !1,
                    message: i,
                    outgoing: p,
                    renderGutterItem: function() {
                        return h.jsx("div", {
                            className: "x78zum5 x98rzlu x1kky2od",
                            children: d("I64").equal(i.sendStatusV2, d("LSIntEnum").ofNumber(1)) ? h.jsx(c("IGDMessageSendingStatus.react"), {}) : null
                        })
                    },
                    renderMessageActions: function() {
                        return h.jsx(c("MWMessageRowActions.react"), {
                            ariaHidden: g === !1,
                            focused: r || v || g,
                            hasReactions: !1,
                            hovered: t,
                            message: i,
                            outgoing: p
                        })
                    },
                    renderProfile: function() {
                        return h.jsx(c("MWV2MessageProfilePhoto.react"), {
                            isGroupThread: f,
                            isLastMessageInGroup: o,
                            message: i
                        })
                    },
                    children: h.jsx(c("CometErrorBoundary.react"), {
                        fallback: function() {
                            return h.jsx(c("MWV2ChatErrorBubble.react"), {
                                isReply: !1
                            })
                        },
                        children: h.jsx(k, {
                            isFirstMessageInGroup: n,
                            isGroupThread: f,
                            isLastMessageInGroup: o,
                            message: i,
                            nextMessage: e,
                            outgoing: p,
                            prevMessage: l
                        })
                    })
                }), o ? h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnVerticalRhythm, {
                    height: 7
                }) : null]
            }, "body")],
            isDialogOpened: v,
            isFocused: r,
            isModal: g,
            message: i,
            messageDomID: m,
            nextMessage: e,
            outgoing: p,
            prevMessage: l,
            setFocused: q,
            setHovered: s,
            setIsDialogOpened: u,
            stopHoveringRef: a
        };
        e = n ? void 0 : b;
        e != null && (m.domElementRef = e);
        return h.jsxs(h.Fragment, {
            children: [n ? h.jsx(d("MWV2MessageStartOfGroupContent.bs").make, {
                domElementRef: b,
                message: i,
                prevMessage: l
            }) : null, h.jsx(d("MWPMessageListRowWithKeyboardInteractions.bs").make, babelHelpers["extends"]({}, m))]
        })
    }
    e = i(b);
    f = e;
    g.make = f
}), 98);
__d("MWClickedMessageContext.react", ["GroupsCometChatsEngagementLogger", "I64", "LSFactory", "LSFetchMessageSeenCount", "emptyFunction", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    e = b.createContext;
    var i = b.useCallback,
        j = b.useContext,
        k = b.useMemo,
        l = b.useState,
        m = e({
            clickedMessageId: null,
            fetchMessageSeenCount: c("emptyFunction"),
            hasError: !1,
            isLoading: !1,
            setClickedMessageId: c("emptyFunction")
        });

    function a(a) {
        a = a.children;
        var b = l(null),
            e = b[0],
            f = b[1];
        b = l(!1);
        var g = b[0],
            j = b[1];
        b = l(!1);
        var n = b[0],
            o = b[1],
            p = c("useReStore")(),
            q = i(function(a, b, e) {
                o(!0), f(b), p.runInTransaction(function(d) {
                    return c("LSFetchMessageSeenCount")(a, b, c("LSFactory")(d))
                }, "readwrite").then(function() {
                    o(!1);
                    j(!1);
                    if (e != null) {
                        var c;
                        d("GroupsCometChatsEngagementLogger").log({
                            action: "impression",
                            client_extras: {
                                mid: b
                            },
                            community_id: (c = d("I64").to_string(e.folderId)) != null ? c : null,
                            event: "seen_count_rendered",
                            group_id: (c = d("I64").to_string(e.fbGroupId)) != null ? c : null,
                            source: "message_bubble",
                            surface: "thread_view",
                            thread_id: d("I64").to_string(a)
                        })
                    }
                })["catch"](function() {
                    o(!1), j(!0)
                })
            }, [p]);
        b = k(function() {
            return {
                clickedMessageId: e,
                fetchMessageSeenCount: q,
                hasError: g,
                isLoading: n,
                setClickedMessageId: f
            }
        }, [e, q, g, n]);
        return h.jsx(m.Provider, {
            value: b,
            children: a
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = {
        Provider: a,
        useHook: function() {
            return j(m)
        }
    };
    g["default"] = b
}), 98);
__d("MWPMessageRowCalculateStatus.react", ["GenderConst", "I64", "LSIntEnum", "LSMediaUrl.bs", "LSThreadBitOffset", "MWClickedMessageContext.react", "MWLSThread", "MWMessageDeliveryStatus", "MWPActor.react", "QE2Logger", "ReQL", "ReQLSuspense", "qex", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    d("react");
    var h = d("react").useState;

    function a(a) {
        var b = a.children,
            e = a.isBroadcastThread,
            g = a.isLargeGroup,
            h = a.isSecureGroupThread,
            i = a.message,
            j = a.nextMessage,
            m = d("MWPActor.react").useActor(),
            n = c("useReStore")(),
            o = d("I64").equal(m, i.senderId),
            p = j != null && !d("I64").equal(m, j.senderId),
            q = i.isUnsent,
            r = Boolean(d("MWLSThread").useThread(i.threadKey, function(a) {
                return d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(140), a)
            })),
            s = !i.isUnsent && r,
            t = j == null;
        r = c("MWClickedMessageContext.react").useHook();
        var u = r.clickedMessageId,
            v = r.hasError;
        r = r.isLoading;
        var w = d("ReQLSuspense").useFirst(function() {
                return s ? d("ReQL").fromTableAscending(n.table("community_chat_message_seen_count")).getKeyRange(i.threadKey, i.messageId) : d("ReQL").empty()
            }, [n, s, i.threadKey, i.messageId], f.id + ":82"),
            x = k(a, function(a) {
                return !t && a.length === 0
            }, [t]),
            y = l(function() {
                return d("ReQL").fromTableDescending(n.table("participants").index("threadKeyReadWatermarkTimestampMs")).getKeyRange(i.threadKey).filter(function(a) {
                    return !d("I64").equal(a.contactId, m)
                }).take(1)
            }, function(a) {
                return a.length > 0
            }, [i.threadKey, m]).length > 0,
            z = l(function() {
                return d("ReQL").fromTableDescending(n.table("participants").index("threadKeyReadWatermarkTimestampMs")).getKeyRange(i.threadKey).bounds({
                    gte: {
                        hd: i.timestampMs,
                        tl: 0
                    }
                }).filter(function(a) {
                    return !d("I64").equal(a.contactId, m)
                }).take(1)
            }, function(a) {
                return y && a.length > 0
            }, [i.timestampMs, i.threadKey, m, y]),
            A = z.length > 0,
            B = l(function() {
                return d("ReQL").fromTableAscending(n.table("participants").index("threadKeyReadWatermarkTimestampMs")).getKeyRange(i.threadKey).bounds({
                    lt: {
                        hd: i.timestampMs,
                        tl: 0
                    }
                }).filter(function(a) {
                    return !d("I64").equal(a.contactId, m)
                }).take(1)
            }, function(a) {
                return A && a.length === 0
            }, [i.threadKey, A, i.timestampMs, m]).length === 0 && A,
            C = l(function() {
                return d("ReQL").fromTableDescending(n.table("participants").index("threadKeyDeliveredWatermarkTimestampMs")).getKeyRange(i.threadKey).bounds({
                    gte: {
                        hd: i.timestampMs,
                        tl: 0
                    }
                }).filter(function(a) {
                    return !d("I64").equal(a.contactId, m)
                }).take(1)
            }, function(a) {
                return a.length > 0 || A
            }, [i.threadKey, i.timestampMs, A, m]).length > 0,
            D = k(a, function(a) {
                return A && a.length === 0
            }, [A]);
        if (i.isAdminMessage) return b({
            type: "NoneStatus"
        });
        if (e)
            if (!s) {
                if (!o || j != null || q) return b({
                    type: "NoneStatus"
                })
            } else {
                if (u !== i.messageId) return b({
                    type: "NoneStatus"
                });
                if (r) return b({
                    type: "Loading"
                });
                return v ? b({
                    type: "RetriableError"
                }) : w != null ? b(d("MWMessageDeliveryStatus").seenCount(d("I64").to_int32(w.seenCount))) : b({
                    type: "Loading"
                })
            } if (!o) return h || g ? b({
            type: "NoneStatus"
        }) : x.length > 0 ? a.children(d("MWMessageDeliveryStatus").seenHead(x)) : a.children({
            type: "NoneStatus"
        });
        if (p && h) return b({
            type: "NoneStatus"
        });
        if (d("I64").equal(i.sendStatusV2, d("I64").of_int32(0))) return b({
            type: "NoneStatus"
        });
        if (d("I64").equal(i.sendStatusV2, d("I64").of_int32(4)) || d("I64").equal(i.sendStatusV2, d("I64").of_int32(5))) return b({
            type: "Error"
        });
        if (d("I64").equal(i.sendStatusV2, d("I64").of_int32(1))) return b({
            type: "Sending"
        });
        if (d("I64").equal(i.sendStatusV2, d("I64").of_int32(6))) return b({
            type: "Sent"
        });
        if (g)
            if (j != null || q) return b({
                type: "NoneStatus"
            });
            else if (d("I64").equal(i.sendStatusV2, d("I64").of_int32(2))) return b({
            type: "Delivered"
        });
        if (A) {
            e = !1;
            h && (e = c("qex")._("891") === !0, d("QE2Logger").logExposureForUser("messenger_armadillo_web_message_states"));
            if (h && !e) {
                u = j == null || d("I64").compare(z[0].readWatermarkTimestampMs, j.timestampMs) < 0;
                return u && D.length > 0 ? b(d("MWMessageDeliveryStatus").deliveredAndRead(D, B)) : b({
                    type: "NoneStatus"
                })
            } else return D.length > 0 ? b(d("MWMessageDeliveryStatus").seenHead(D)) : b({
                type: "NoneStatus"
            })
        }
        return C ? b({
            type: "Delivered"
        }) : b({
            type: "Sent"
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    var i = 10;

    function j(a) {
        var b = a.message;
        a = a.nextMessage;
        var e = c("useReStore")(),
            g = (a == null ? void 0 : a.isAdminMessage) === !0,
            h = d("ReQLSuspense").useFirst(function() {
                return g ? d("ReQL").fromTableAscending(e.table("messages").index("messageDisplayOrder")).getKeyRange(b.threadKey).bounds({
                    gt: {
                        hd: b.primarySortKey,
                        tl: 0
                    }
                }).take(i).filter(function(a) {
                    return !a.isAdminMessage
                }) : d("ReQL").empty()
            }, [e, g, b.primarySortKey, b.threadKey], f.id + ":387");
        return g ? h : a
    }

    function k(a, b, e) {
        var g = c("useReStore")(),
            h = d("MWPActor.react").useActor(),
            i = a.message,
            k = j(a);
        a = l(function() {
            var a = k != null ? {
                gte: {
                    hd: i.timestampMs,
                    tl: 0
                },
                lt: {
                    hd: k.timestampMs,
                    tl: 0
                }
            } : {
                gte: {
                    hd: i.timestampMs,
                    tl: 0
                }
            };
            return d("ReQL").fromTableAscending(g.table("participants").index("threadKeyReadWatermarkTimestampMs")).getKeyRange(i.threadKey).bounds(a).filter(function(a) {
                return !d("I64").equal(a.contactId, h)
            }).map(function(a) {
                var b = d("ReQLSuspense").first(d("ReQL").fromTableAscending(g.table("contacts")).getKeyRange(a.contactId), f.id + ":452");
                return [a, b]
            })
        }, b, [g, i.threadKey, i.timestampMs, k == null ? void 0 : k.timestampMs, k == null, h].concat(e));
        return a.map(function(a) {
            var b, e = a[0];
            a = a[1];
            if (a == null) return;
            return {
                gender: c("GenderConst").UNKNOWN_SINGULAR,
                id: d("I64").to_string(a.id),
                imageSrc: d("LSMediaUrl.bs").Contact.profilePictureUrl(a),
                name: (b = e.nickname) != null ? b : a.name,
                timestamp: d("I64").to_float(e.readActionTimestampMs)
            }
        }).filter(Boolean)
    }

    function l(a, b, c) {
        var e = h(void 0),
            g = e[0];
        e = e[1];
        c = d("ReQLSuspense").useArray(function() {
            return g != null ? d("ReQL").empty() : a()
        }, [].concat(c, [g]), f.id + ":505");
        b(c) && g == null && e(c);
        return g != null ? g : c
    }
    g["default"] = a
}), 98);
__d("MWChatBusinessQuickReply.react", ["CometImage.react", "MDSTextPairing.react", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            image: {
                borderTopStartRadius: "x1z11no5",
                borderTopEndRadius: "xjy5m1g",
                borderBottomEndRadius: "x1mnwbp6",
                borderBottomStartRadius: "x4pb5v6",
                "float": "xrbpyxo",
                height: "x158ke7r",
                marginTop: "x16ldp7u",
                marginEnd: "x1t4t16n",
                marginBottom: "xz62fqu",
                marginStart: "xbmpl8g",
                width: "x1kl0l3y",
                $$css: !0
            },
            root: {
                alignItems: "x6s0dn4",
                backgroundColor: "xcrg951",
                borderTop: "x731872",
                borderEnd: "x170eksp",
                borderBottom: "xug2kuu",
                borderStart: "x1p5fkxa",
                borderTopStartRadius: "xfh8nwu",
                borderTopEndRadius: "xoqspk4",
                borderBottomEndRadius: "x12v9rci",
                borderBottomStartRadius: "x138vmkv",
                boxShadow: "x1vnslfi",
                boxSizing: "x9f619",
                cursor: "x1ypdohk",
                fontFamily: "xjb2p0i",
                fontWeight: "xk50ysn",
                justifyContent: "xl56j7k",
                marginTop: "xr9ek0c",
                marginEnd: "x1emribx",
                marginBottom: "xjpr12u",
                marginStart: "x1i64zmx",
                overflowWrap: "x1mzt3pk",
                paddingBottom: "x1a8lsjc",
                paddingEnd: "xn6708d",
                paddingStart: "x1ye3gou",
                paddingTop: "x889kno",
                textAlign: "x1yc453h",
                wordBreak: "x13faqbe",
                $$css: !0
            },
            vertical: {
                paddingBottom: "xsag5q8",
                paddingEnd: "xn6708d",
                paddingStart: "xr9oo41",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.bodyLineLimit;
        b = b === void 0 ? 1 : b;
        var d = a.imageUrl,
            e = a.onClick,
            f = a.quickReplyVertical;
        f = f === void 0 ? !1 : f;
        a = a.text;
        return h.jsx("div", {
            className: c("stylex")(f ? i.vertical : !1),
            children: h.jsxs("button", {
                className: "x6s0dn4 xcrg951 x731872 x170eksp xug2kuu x1p5fkxa xfh8nwu xoqspk4 x12v9rci x138vmkv x1vnslfi x9f619 x1ypdohk xjb2p0i xk50ysn xl56j7k xr9ek0c x1emribx xjpr12u x1i64zmx x1mzt3pk x1a8lsjc xn6708d x1ye3gou x889kno x1yc453h x13faqbe",
                onClick: e,
                children: [d != null ? h.jsx(c("CometImage.react"), {
                    src: d,
                    xstyle: i.image
                }) : null, h.jsx(c("MDSTextPairing.react"), {
                    body: a,
                    bodyLineLimit: b,
                    level: 3
                })]
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatBusinessQuickReplyText.bs", ["MWChatBusinessQuickReply.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.onSend,
            d = a.quickReply;
        a = a.quickReplyVertical;
        var e = a ? 3 : 1,
            f = function() {
                return b(d)
            },
            g = d.image_url;
        return h.jsx(c("MWChatBusinessQuickReply.react"), {
            bodyLineLimit: e,
            imageUrl: (e = g) != null ? e : void 0,
            onClick: f,
            quickReplyVertical: a,
            text: d.title
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("MWChatUserBirthdayQuery", ["CometRelay", "MWChatUserBirthdayQuery.graphql", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h, i = "en-US";

    function j(a, b, c, d) {
        c = new Date(c, b - 1, a);
        return c.toLocaleDateString(d, {
            day: "numeric",
            month: "numeric",
            year: "numeric"
        })
    }
    a = function() {
        var a = d("CometRelay").useRelayEnvironment();
        return function(b) {
            var e = d("CometRelay").fetchQuery(a, k, {}).toPromise().then(function(a) {
                a = a == null ? void 0 : a.viewer.user.birthdate;
                if (a) {
                    var c = a == null ? void 0 : a.day,
                        d = a == null ? void 0 : a.month;
                    a = a == null ? void 0 : a.year;
                    c && d && a && b(j(c, d, a, i))
                }
            });
            c("promiseDone")(e)
        }
    };
    var k = h !== void 0 ? h : h = b("MWChatUserBirthdayQuery.graphql");
    g.useUserBirthdayDataQuery = a
}), 98);
__d("MWChatBusinessQuickReplyUserBirthday.bs", ["MWChatBusinessQuickReply.react", "MWChatUserBirthdayQuery", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useEffect,
        j = b.useState;

    function a(a) {
        var b = a.onSend,
            e = a.quickReply,
            f = a.quickReplyVertical;
        a = a.userID;
        var g = d("MWChatUserBirthdayQuery").useUserBirthdayDataQuery(),
            k = j(),
            l = k[0],
            m = k[1];
        i(function() {
            g(function(a) {
                return m(a)
            })
        }, [a, g, m]);
        if (l == null) return null;
        k = e.content_type;
        a = e.data;
        var n = e.image_url;
        e = e.payload;
        var o = {
            content_type: k,
            data: a,
            image_url: n,
            payload: e,
            title: l
        };
        k = function() {
            return b(o)
        };
        return h.jsx(c("MWChatBusinessQuickReply.react"), {
            onClick: k,
            quickReplyVertical: f,
            text: l
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatUserEmailQuery", ["CometRelay", "MWChatUserEmailQuery.graphql", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h;
    a = function() {
        var a = d("CometRelay").useRelayEnvironment();
        return function(b) {
            var e = d("CometRelay").fetchQuery(a, i, {}).toPromise().then(function(a) {
                a = a == null ? void 0 : a.viewer.all_emails;
                if (a && a.length > 0) {
                    var c = a.find(function(a) {
                        return a.is_primary
                    });
                    c != null ? b(c.display_email) : b(a[0].display_email)
                }
            });
            c("promiseDone")(e)
        }
    };
    var i = h !== void 0 ? h : h = b("MWChatUserEmailQuery.graphql");
    g.useUserEmailDataQuery = a
}), 98);
__d("MWChatBusinessQuickReplyUserEmail.bs", ["MWChatBusinessQuickReply.react", "MWChatUserEmailQuery", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useEffect,
        j = b.useState;

    function a(a) {
        var b = a.onSend,
            e = a.quickReply,
            f = a.quickReplyVertical;
        a = a.userID;
        var g = d("MWChatUserEmailQuery").useUserEmailDataQuery(),
            k = j(),
            l = k[0],
            m = k[1];
        i(function() {
            g(m)
        }, [a, g, m]);
        return l == null ? null : h.jsx(c("MWChatBusinessQuickReply.react"), {
            onClick: function() {
                return b({
                    content_type: e.content_type,
                    data: e.data,
                    image_url: e.image_url,
                    payload: e.payload,
                    title: l
                })
            },
            quickReplyVertical: f,
            text: l
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatUserPhoneNumberQuery", ["CometRelay", "MWChatUserPhoneNumberQuery.graphql", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h;
    a = function() {
        var a = d("CometRelay").useRelayEnvironment();
        return function(b) {
            var e = d("CometRelay").fetchQuery(a, i, {}).toPromise().then(function(a) {
                a = a == null ? void 0 : a.viewer.user.all_phones;
                if (a && a.length > 0) {
                    var c = a.find(function(a) {
                        return a.is_preferred
                    });
                    if (c != null) {
                        b((c = c.phone_number) == null ? void 0 : c.universal_number)
                    } else {
                        b((c = a[0].phone_number) == null ? void 0 : c.universal_number)
                    }
                }
            });
            c("promiseDone")(e)
        }
    };
    var i = h !== void 0 ? h : h = b("MWChatUserPhoneNumberQuery.graphql");
    g.useUserPhoneNumberDataQuery = a
}), 98);
__d("MWChatBusinessQuickReplyUserPhoneNumber.bs", ["MWChatBusinessQuickReply.react", "MWChatUserPhoneNumberQuery", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useEffect,
        j = b.useState;

    function a(a) {
        var b = a.onSend,
            e = a.quickReply,
            f = a.quickReplyVertical;
        a = a.userID;
        var g = d("MWChatUserPhoneNumberQuery").useUserPhoneNumberDataQuery(),
            k = j(function() {}),
            l = k[0],
            m = k[1];
        i(function() {
            g(function(a) {
                return m(function() {
                    return a
                })
            })
        }, [a, g, m]);
        if (l == null) return null;
        k = e.content_type;
        a = e.data;
        var n = e.image_url;
        e = e.payload;
        var o = {
            content_type: k,
            data: a,
            image_url: n,
            payload: e,
            title: l
        };
        k = function() {
            return b(o)
        };
        return h.jsx(c("MWChatBusinessQuickReply.react"), {
            onClick: k,
            quickReplyVertical: f,
            text: l
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatUserProfileLocationQuery", ["CometRelay", "MWChatUserProfileLocationQuery.graphql", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h;
    a = function() {
        var a = d("CometRelay").useRelayEnvironment();
        return function(b) {
            var e = d("CometRelay").fetchQuery(a, i, {}).toPromise().then(function(a) {
                a = a == null ? void 0 : (a = a.viewer.user.address) == null ? void 0 : a.region;
                a != null && a !== "" && b(a)
            });
            c("promiseDone")(e)
        }
    };
    e = function() {
        var a = d("CometRelay").useRelayEnvironment();
        return function(b) {
            var e = d("CometRelay").fetchQuery(a, i, {}).toPromise().then(function(a) {
                a = a == null ? void 0 : a.viewer.user.address;
                a = a == null ? void 0 : a.postal_code;
                a && b(a)
            });
            c("promiseDone")(e)
        }
    };
    var i = h !== void 0 ? h : h = b("MWChatUserProfileLocationQuery.graphql");
    g.useUserProfileStateDataQuery = a;
    g.useUserProfileZipCodeDataQuery = e
}), 98);
__d("MWChatBusinessQuickReplyUserState.bs", ["MWChatBusinessQuickReply.react", "MWChatUserProfileLocationQuery", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useEffect,
        j = b.useState;

    function a(a) {
        var b = a.onSend,
            e = a.quickReply,
            f = a.quickReplyVertical;
        a = a.userID;
        var g = d("MWChatUserProfileLocationQuery").useUserProfileStateDataQuery(),
            k = j(),
            l = k[0],
            m = k[1];
        i(function() {
            g(function(a) {
                return m(a)
            })
        }, [a, g, m]);
        if (l == null) return null;
        k = e.content_type;
        a = e.data;
        var n = e.image_url;
        e = e.payload;
        var o = {
            content_type: k,
            data: a,
            image_url: n,
            payload: e,
            title: l
        };
        k = function() {
            return b(o)
        };
        return h.jsx(c("MWChatBusinessQuickReply.react"), {
            onClick: k,
            quickReplyVertical: f,
            text: l
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatBusinessQuickReplyUserZipCode.bs", ["MWChatBusinessQuickReply.react", "MWChatUserProfileLocationQuery", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useEffect,
        j = b.useState;

    function a(a) {
        var b = a.onSend,
            e = a.quickReply,
            f = a.quickReplyVertical;
        a = a.userID;
        var g = d("MWChatUserProfileLocationQuery").useUserProfileZipCodeDataQuery(),
            k = j(),
            l = k[0],
            m = k[1];
        i(function() {
            g(function(a) {
                return m(a)
            })
        }, [a, g, m]);
        if (l == null) return null;
        k = e.content_type;
        a = e.data;
        var n = e.image_url;
        e = e.payload;
        var o = {
            content_type: k,
            data: a,
            image_url: n,
            payload: e,
            title: l
        };
        k = function() {
            return b(o)
        };
        return h.jsx(c("MWChatBusinessQuickReply.react"), {
            onClick: k,
            quickReplyVertical: f,
            text: l
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatBusinessQuickReplyList.bs", ["CometScrollableArea.react", "CurrentUser", "I64", "LSIntEnum", "LSQuickReplyType", "MWChatBusinessQuickReplyText.bs", "MWChatBusinessQuickReplyUserBirthday.bs", "MWChatBusinessQuickReplyUserEmail.bs", "MWChatBusinessQuickReplyUserPhoneNumber.bs", "MWChatBusinessQuickReplyUserState.bs", "MWChatBusinessQuickReplyUserZipCode.bs", "MessengerWebEventsFalcoEvent", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useEffect,
        j = {
            container: {
                position: "x1n2onr6",
                width: "xh8yej3",
                $$css: !0
            },
            mask: {
                backgroundColor: "xcrg951",
                $$css: !0
            },
            pillContainer: {
                backgroundColor: "xcrg951",
                display: "x78zum5",
                flexDirection: "x1q0g3np",
                flexWrap: "xozqiw3",
                paddingTop: "x1nn3v0j",
                paddingEnd: "x1sxyh0",
                paddingBottom: "x1a8lsjc",
                paddingStart: "xurb0ha",
                $$css: !0
            },
            pillContainerVertical: {
                alignItems: "xuk3077",
                backgroundColor: "xcrg951",
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                paddingTop: "xm7lytj",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.arrayQR,
            e = a.id,
            f = a.onSend;
        a = a.quickReplyType;
        a = a != null ? a : d("LSIntEnum").ofNumber(c("LSQuickReplyType").NONE);
        var g = d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSQuickReplyType").VERTICAL));
        i(function() {
            c("MessengerWebEventsFalcoEvent").log(function() {
                return {
                    event_name: "render_quick_replies",
                    other_user_fbid: e
                }
            })
        }, [e]);
        return h.jsx("div", {
            className: "x1n2onr6 xh8yej3 xcrg951",
            children: h.jsx(c("CometScrollableArea.react"), {
                horizontal: !0,
                children: h.jsx("div", {
                    className: c("stylex")(g ? j.pillContainerVertical : j.pillContainer),
                    children: b.map(function(a, b) {
                        var e = c("CurrentUser").getID(),
                            i = a.content_type;
                        switch (i) {
                            case "text":
                                return h.jsx(d("MWChatBusinessQuickReplyText.bs").make, {
                                    onSend: f,
                                    quickReply: a,
                                    quickReplyVertical: g
                                }, String(b));
                            case "user_birthday":
                                return h.jsx(c("MWChatBusinessQuickReplyUserBirthday.bs"), {
                                    onSend: f,
                                    quickReply: a,
                                    quickReplyVertical: g,
                                    userID: e
                                }, String(b));
                            case "user_email":
                                return h.jsx(c("MWChatBusinessQuickReplyUserEmail.bs"), {
                                    onSend: f,
                                    quickReply: a,
                                    quickReplyVertical: g,
                                    userID: e
                                }, String(b));
                            case "user_phone_number":
                                return h.jsx(c("MWChatBusinessQuickReplyUserPhoneNumber.bs"), {
                                    onSend: f,
                                    quickReply: a,
                                    quickReplyVertical: g,
                                    userID: e
                                }, String(b));
                            case "user_state":
                                return h.jsx(c("MWChatBusinessQuickReplyUserState.bs"), {
                                    onSend: f,
                                    quickReply: a,
                                    quickReplyVertical: g,
                                    userID: e
                                }, String(b));
                            case "user_zip_code":
                                return h.jsx(c("MWChatBusinessQuickReplyUserZipCode.bs"), {
                                    onSend: f,
                                    quickReply: a,
                                    quickReplyVertical: g,
                                    userID: e
                                }, String(b));
                            default:
                                return null
                        }
                    })
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("MWPQuickReplies.bs", ["I64", "LSFactory", "LSIntEnum", "LSMailboxType", "LSMessageReplySourceType", "LSMessageReplySourceTypeV2", "LSMessagingSource", "LSOptimisticSendMessage", "LSThreadAttributionTypeUtil.bs", "MWChatBusinessQuickReplyList.bs", "MWPActor.react", "Promise", "ReQL.bs", "ReQLSubscription.bs", "ReQLSuspense", "promiseDone", "react", "recoverableViolation", "useReStore", "withCometPlaceholder"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useMemo;

    function j(a) {
        var e = a.lastMessageId,
            g = a.quickReplyType,
            j = a.threadKey,
            k = d("LSMessagingSource").useHook(),
            l = c("useReStore")(),
            m = d("MWPActor.react").useActor();
        a = d("ReQLSubscription.bs").useArray(i(function() {
            return d("ReQL.bs").filter(d("ReQL.bs").map(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(l.table("quick_reply_ctas")), {
                hd: j,
                tl: {
                    hd: e,
                    tl: 0
                }
            }), function(a) {
                var b = a.type_;
                b = b === "quick_reply_text" ? "text" : b === "quick_reply_phone" ? "user_phone_number" : b === "quick_reply_email" ? "user_email" : (c("recoverableViolation")("Unexpected quick-reply type", "messenger_web_produce"), "");
                return {
                    content_type: b,
                    data: void 0,
                    image_url: a.imageUrl,
                    payload: a.platformToken,
                    title: a.title
                }
            }), function(a) {
                return a.content_type !== ""
            })
        }, [l, e, j]), "ertea3ul", f.id + ":53");
        if (a.length > 0) return h.jsx(d("MWChatBusinessQuickReplyList.bs").make, {
            arrayQR: a,
            id: d("I64").to_string(m),
            onSend: function(a) {
                var e = d("LSThreadAttributionTypeUtil.bs").getSource(j, k),
                    f = l.runInTransaction(function(f) {
                        var g;
                        g = (g = a.payload) != null ? g : void 0;
                        return c("LSOptimisticSendMessage")(m, j, d("LSIntEnum").ofNumber(1), d("LSIntEnum").ofNumber(c("LSMailboxType").MESSENGER), a.title, void 0, !1, void 0, void 0, void 0, void 0, e, void 0, g, void 0, d("LSIntEnum").ofNumber(c("LSMessageReplySourceType").NONE), d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").NONE), void 0, void 0, void 0, !0, !0, void 0, void 0, void 0, void 0, void 0, c("LSFactory")(f)).then(function(a) {
                            return b("Promise").resolve(a)
                        })
                    }, "readwrite");
                c("promiseDone")(f)
            },
            quickReplyType: g
        });
        else return null
    }

    function a(a) {
        var b = a.threadKey,
            e = c("useReStore")();
        a = d("ReQLSuspense").useFirst(function() {
            return d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableDescending(e.table("messages")), {
                hd: b,
                tl: 0
            })
        }, [e, b], f.id + ":158");
        if (a != null) return h.jsx(j, {
            lastMessageId: a.messageId,
            quickReplyType: a.quickReplyType,
            threadKey: b
        });
        else return null
    }
    e = d("withCometPlaceholder").withCometPlaceholder(a);
    g.make = e
}), 98);
__d("CSIGChatMessageList.bs", ["CSIGChatMessageRow.bs", "IGDMessageSeenStatus.react", "MWMessageElementRefList.bs", "MWPAriaLabelForMessageListGrid.bs", "MWPBaseMessageList.react", "MWPMessageListFocusTable.bs", "MWPMessageRowCalculateStatus.react", "MWPQuickReplies.bs", "MWV2MessageActionsVisibility.bs", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useCallback,
        j = b.useState;

    function a(a) {
        var b = a.contextBanner,
            e = a.thread;
        a = d("MWPAriaLabelForMessageListGrid.bs").useHook(e);
        var f = d("MWV2MessageActionsVisibility.bs").useStopHoveringRef(),
            g = d("MWMessageElementRefList.bs").make(),
            k = j(""),
            l = k[0];
        k = k[1];
        var m = i(function() {
            return h.jsx(d("MWPQuickReplies.bs").make, {
                threadKey: e.threadKey
            })
        }, [e]);
        m = {
            renderFooter: m,
            renderRow: function(a) {
                var b = a.prevMessage,
                    i = a.nextMessage,
                    j = a.message;
                return h.jsx(c("MWPMessageRowCalculateStatus.react"), {
                    isBroadcastThread: !1,
                    isLargeGroup: !1,
                    isSecureGroupThread: !1,
                    message: j,
                    nextMessage: i,
                    children: function(a) {
                        return h.jsxs(h.Fragment, {
                            children: [h.jsx(d("CSIGChatMessageRow.bs").make, {
                                domElementRef: g.set(j.messageId),
                                isModal: !1,
                                message: j,
                                nextMessage: i,
                                prevMessage: b,
                                status: a,
                                stopHoveringRef: f
                            }), i != null ? null : h.jsx(c("IGDMessageSeenStatus.react"), {
                                message: j,
                                thread: e
                            })]
                        })
                    }
                })
            },
            thread: e
        };
        b != null && (m.renderHeader = function() {
            return b
        });
        return h.jsx(d("MWPMessageListFocusTable.bs").make, {
            ariaLabel: a,
            modal: l,
            setModal: k,
            children: h.jsx(c("MWPBaseMessageList.react"), babelHelpers["extends"]({}, m))
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    e = a;
    g.make = e
}), 98);
__d("CSIGChatMessageListContainer.bs", ["CSIGChatMessageList.bs", "MWPMessageListColumn.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.contextBanner;
        a = a.thread;
        return h.jsx(d("CSIGChatMessageList.bs").make, {
            contextBanner: h.jsxs(d("MWPMessageListColumn.react").MWPMessageListColumnShrinkwrap, {
                children: [h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnVerticalRhythm, {
                    height: 20
                }), b, h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnVerticalRhythm, {
                    height: 10
                })]
            }),
            thread: a
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("CSIGChatThreadDetail.bs", ["CSIGChatComposer.bs", "CSIGChatMessageListContainer.bs", "IGDThreadCapabilitiesContextProvider.react", "ReQL.bs", "ReQLSubscription.bs", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useMemo;

    function a(a) {
        a = a.contextBanner;
        var b = c("useReStore")(),
            e = d("ReQLSubscription.bs").useFirst(i(function() {
                return d("ReQL.bs").fromTableAscending(b.table("threads"))
            }, [b]), "y23zfzi8");
        if (e != null) return h.jsx("div", {
            className: "x78zum5 xdt5ytf x1iyjqo2 x6prxxf x6ikm8r x10wlt62 x5yr21d xh8yej3 x13vifvy x17qophe xixxii4",
            children: h.jsxs(c("IGDThreadCapabilitiesContextProvider.react"), {
                thread: e,
                children: [h.jsx("div", {
                    className: "x78zum5 x1r8uery xdt5ytf x1iyjqo2 xw2csxc x1odjw0f",
                    children: h.jsx(d("CSIGChatMessageListContainer.bs").make, {
                        contextBanner: a,
                        thread: e
                    })
                }), h.jsx(d("CSIGChatComposer.bs").make, {
                    thread: e
                })]
            })
        });
        else return null
    }
    b = a;
    g.make = b
}), 98);
__d("CSIGChatThread.bs", ["CSChatActor.bs", "CSIGChatThreadDetail.bs", "CometTransientDialogProvider.react", "MWChatFocusComposerContext", "MWV2IsTabFocusedContext.bs", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.actorId;
        a = a.contextBanner;
        return h.jsx(d("CSChatActor.bs").make, {
            actorId: b,
            children: h.jsx(d("MWChatFocusComposerContext").Provider, {
                children: h.jsx(d("MWV2IsTabFocusedContext.bs").MWV2IsTabFocusedContextProvider, {
                    isFocused: !0,
                    children: h.jsx(c("CometTransientDialogProvider.react"), {
                        children: h.jsx(d("CSIGChatThreadDetail.bs").make, {
                            contextBanner: a
                        })
                    })
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("SupportUserChatRelayEnvironment", ["CurrentUser", "RelayFBResponseCache", "RelayModern", "URI", "cr:1121434", "createRelayFBNetwork", "createRelayFBNetworkFetch", "createRelayFBSubscribeFunction", "getCrossOriginTransport"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a() {
        var a = c("createRelayFBNetwork")(c("createRelayFBNetworkFetch")({
            getAdditionalData: function() {
                return {
                    av: c("CurrentUser").getID()
                }
            },
            graphURI: new(c("URI"))("/api/graphql/ccs/"),
            queryResponseCache: c("RelayFBResponseCache"),
            transportBuilder: b("getCrossOriginTransport").withCredentials,
            useXController: !1
        }), c("createRelayFBSubscribeFunction")({
            queryResponseCache: c("RelayFBResponseCache")
        }));
        return d("RelayModern").createEnvironment({
            actorID: c("CurrentUser").getID(),
            configName: "SupportUserChatRelayEnvironment",
            log: b("cr:1121434") != null ? b("cr:1121434")() : null,
            network: a
        })
    }
    g.get = a
}), 98);
__d("SupportUserChatThread.react", ["fbt", "ix", "BaseTheme.react", "CSChatLSDatabase.bs", "CSChatLSGraphQLAdapter.bs", "CSChatRoot.bs", "CSIGChatThread.bs", "CometBlinkingTitleMessageProvider.react", "CometErrorBoundary.react", "CometHeadlineWithAddOn.react", "CometImage.react", "CometNullState.react", "CometPlaceholder.react", "CometProgressRingIndeterminate.react", "CometRelay", "IGDThemeConfig", "NullStateGeneral", "Promise", "SupportUserChatRelayEnvironment", "SupportUserChatThreadDeleteMessageMutation.graphql", "SupportUserChatThreadMainQuery.graphql", "SupportUserChatThreadSendMessageMutation.graphql", "react", "useCometAlertDialog"], (function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j, k, l, m = d("react"),
        n = {
            badge: {
                display: "x78zum5",
                flexDirection: "x1q0g3np",
                justifyContent: "xl56j7k",
                marginTop: "x1xmf6yo",
                $$css: !0
            },
            banner: {
                alignItems: "x6s0dn4",
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                width: "xh8yej3",
                $$css: !0
            },
            imageContainer: {
                alignItems: "x6s0dn4",
                backgroundColor: "x83z2og",
                borderTop: "xa1me7u",
                borderEnd: "x13z1dwb",
                borderBottom: "xpkj8wx",
                borderStart: "x1g8y7dm",
                borderTopStartRadius: "x14yjl9h",
                borderTopEndRadius: "xudhj91",
                borderBottomEndRadius: "x18nykt9",
                borderBottomStartRadius: "xww2gxu",
                display: "x78zum5",
                height: "xjp8j0k",
                justifyContent: "xl56j7k",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                width: "x13oubkp",
                $$css: !0
            },
            root: {
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                flexGrow: "x1iyjqo2",
                justifyContent: "xl56j7k",
                width: "xh8yej3",
                $$css: !0
            },
            spinner: {
                alignSelf: "xamitd3",
                $$css: !0
            },
            thread: {
                display: "x78zum5",
                flexGrow: "x1iyjqo2",
                $$css: !0
            }
        };

    function a(a) {
        return m.jsx("div", {
            className: "x78zum5 xdt5ytf x1iyjqo2 xl56j7k xh8yej3",
            children: m.jsx(c("CometErrorBoundary.react"), {
                fallback: function() {
                    return m.jsx(c("CometNullState.react"), {
                        body: "This may be because of a technical error that we are working to get fixed. Try reloading this page",
                        headline: "Customer Support Chat Isn't Available Right Now",
                        icon: c("NullStateGeneral")
                    })
                },
                children: m.jsx(o, {
                    clientThreadKey: a.clientThreadKey,
                    nonce: a.nonce,
                    userID: a.userID
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function o(a) {
        if (a.userID === null) return m.jsx(r, {});
        var b = d("SupportUserChatRelayEnvironment").get();
        return m.jsx(d("CometRelay").RelayEnvironmentProvider, {
            environment: b,
            children: m.jsx(c("CometPlaceholder.react"), {
                fallback: m.jsx(r, {}),
                children: m.jsx(p, {
                    chatSupportUserID: a.userID,
                    clientThreadKey: a.clientThreadKey,
                    nonce: a.nonce
                })
            })
        })
    }
    o.displayName = o.name + " [from " + f.id + "]";

    function p(a) {
        var b = a.chatSupportUserID,
            e = a.clientThreadKey;
        a = a.nonce;
        var f = s(b, a),
            g = f[0];
        f = t();
        var j = f[0];
        f = u(b, a);
        var k = f[0];
        f = {
            deleteMessage: function(a, b) {
                return k({
                    messageId: b,
                    threadId: a
                })
            },
            markThreadAsRead: function(a, b) {
                return j()
            },
            sendMessage: function(a, b, c, d, e) {
                return g({
                    attachmentIds: e,
                    offlineMessageId: b,
                    platformToken: d,
                    text: c,
                    threadId: a
                })
            }
        };
        a = q({
            chatSupportUserID: b,
            clientThreadKey: e,
            nonce: a
        });
        var l = m.jsxs("div", {
            className: "x6s0dn4 x78zum5 xdt5ytf xh8yej3",
            children: [m.jsx("div", {
                className: "x6s0dn4 x83z2og xa1me7u x13z1dwb xpkj8wx x1g8y7dm x14yjl9h xudhj91 x18nykt9 xww2gxu x78zum5 xjp8j0k xl56j7k x6ikm8r x10wlt62 x13oubkp",
                children: m.jsx(c("CometImage.react"), {
                    height: 64,
                    src: "/images/customer_support/Instagram_Glyph_Gradient.png",
                    width: 64
                })
            }), m.jsx("div", {
                className: "x78zum5 x1q0g3np xl56j7k x1xmf6yo",
                children: m.jsx(c("CometHeadlineWithAddOn.react"), {
                    addOn: m.jsx(c("CometImage.react"), {
                        src: i("1832018")
                    }),
                    color: "primary",
                    type: "headlineEmphasized2",
                    children: h._("__JHASH__0ljHBbWr0Lu__JHASH__")
                })
            })]
        });
        return m.jsx(c("CometBlinkingTitleMessageProvider.react"), {
            children: m.jsxs(d("CSChatLSDatabase.bs").make, {
                children: [m.jsx(d("CSChatLSGraphQLAdapter.bs").make, {
                    callbacks: f,
                    clientThreadKey: e,
                    data: a
                }), m.jsx(c("BaseTheme.react"), {
                    config: c("IGDThemeConfig"),
                    xstyle: n.thread,
                    children: m.jsx(d("CSChatRoot.bs").make, {
                        children: m.jsx(d("CSIGChatThread.bs").make, {
                            actorId: b,
                            contextBanner: l
                        })
                    })
                })]
            })
        })
    }
    p.displayName = p.name + " [from " + f.id + "]";

    function q(a) {
        var c = a.chatSupportUserID,
            e = a.clientThreadKey;
        a = a.nonce;
        return d("CometRelay").useLazyLoadQuery(j !== void 0 ? j : j = b("SupportUserChatThreadMainQuery.graphql"), {
            data: {
                chat_support_user_id: c,
                nonce: a != null ? {
                    sensitive_string_value: a
                } : null,
                thread_id: e
            }
        }, {
            fetchPolicy: "network-only"
        })
    }

    function r() {
        return m.jsx("div", {
            className: "xamitd3",
            children: m.jsx(c("CometProgressRingIndeterminate.react"), {
                color: "disabled",
                size: 72
            })
        })
    }
    r.displayName = r.name + " [from " + f.id + "]";

    function s(a, c) {
        var e = d("CometRelay").useMutation(k !== void 0 ? k : k = b("SupportUserChatThreadSendMessageMutation.graphql")),
            f = e[0];

        function g(d) {
            var e = d.attachmentIds,
                g = d.offlineMessageId,
                h = d.platformToken,
                i = d.text,
                j = d.threadId;
            return new(b("Promise"))(function(b, d) {
                return f({
                    onCompleted: function() {
                        return b()
                    },
                    onError: function() {
                        return d()
                    },
                    variables: {
                        input: {
                            attachment_ids: e,
                            chat_support_user_id: a,
                            client_mutation_id: g,
                            message_text: i,
                            nonce: c != null ? {
                                sensitive_string_value: c
                            } : null,
                            page_id: j,
                            platform_token: h
                        }
                    }
                })
            })
        }
        return [g]
    }

    function t() {
        return [function() {}]
    }

    function u(a, e) {
        var f = c("useCometAlertDialog")(),
            g = d("CometRelay").useMutation(l !== void 0 ? l : l = b("SupportUserChatThreadDeleteMessageMutation.graphql")),
            i = g[0];

        function j(c) {
            var d = c.messageId;
            c.threadId;
            return new(b("Promise"))(function(b) {
                return i({
                    onCompleted: function() {
                        return b()
                    },
                    onError: function() {
                        f({
                            body: h._("__JHASH__EdRM5gfObm8__JHASH__"),
                            title: h._("__JHASH__vPbGECLy-wz__JHASH__")
                        })
                    },
                    variables: {
                        input: {
                            chat_support_user_id: a,
                            message_id: d,
                            nonce: e != null ? {
                                sensitive_string_value: e
                            } : null
                        }
                    }
                })
            })
        }
        return [j]
    }
    g["default"] = a
}), 98);
__d("SupportUserChatThreadRoot.react", ["SupportUserChatThread.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        a = a.props;
        var b = a.routeProps.thread_key,
            d = a.routeProps.user_id;
        a = a.routeProps.nonce;
        return h.jsx(c("SupportUserChatThread.react"), {
            clientThreadKey: b,
            nonce: a,
            userID: d
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("BillableAccountUtils", ["fbt", "BillableAccountUtilsAccountTypeQuery.graphql", "BillableAccountUtilsQEQuery.graphql", "BillableAccountUtilsQuery.graphql", "BillingPaymentModeUtils", "RelayHooks", "regeneratorRuntime"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i, j, k, l = i !== void 0 ? i : i = b("BillableAccountUtilsQuery.graphql"),
        m = j !== void 0 ? j : j = b("BillableAccountUtilsAccountTypeQuery.graphql"),
        n = k !== void 0 ? k : k = b("BillableAccountUtilsQEQuery.graphql");

    function a(a, c) {
        var d, e;
        return b("regeneratorRuntime").async(function(f) {
            while (1) switch (f.prev = f.next) {
                case 0:
                    f.next = 2;
                    return b("regeneratorRuntime").awrap(a.fetchQuery({
                        options: {
                            fetchPolicy: "store-or-network"
                        },
                        query: m,
                        queryName: m.params.name,
                        variables: {
                            paymentAccountID: c
                        }
                    }, {
                        event_context: "get_billable_account_type"
                    }));
                case 2:
                    e = f.sent;
                    return f.abrupt("return", e == null ? void 0 : (d = e.billable_account_by_payment_account) == null ? void 0 : d.__typename);
                case 4:
                case "end":
                    return f.stop()
            }
        }, null, this)
    }

    function c(a, c, e, f) {
        var g, h;
        return b("regeneratorRuntime").async(function(i) {
            while (1) switch (i.prev = i.next) {
                case 0:
                    i.next = 2;
                    return b("regeneratorRuntime").awrap(d("RelayHooks").fetchQuery(a, n, {
                        param: f,
                        paymentAccountID: c,
                        qe: e
                    }).toPromise());
                case 2:
                    h = i.sent;
                    return i.abrupt("return", (h == null ? void 0 : (g = h.billable_account_by_payment_account) == null ? void 0 : g.qe_on_payment_account_by_string) === !0);
                case 4:
                case "end":
                    return i.stop()
            }
        }, null, this)
    }

    function e(a) {
        if (a === "ScimCompany") return "MOR_WORKPLACE_USAGE";
        else if (a === "CommerceBillableAccount") return "MOR_CP_RETURN_LABEL";
        else if (a === "WhatsAppBusinessAccount") return "MOR_WA_PAID_MESSAGING";
        else if (a === "BCPBrandProfileDelegate") return "CREATOR_MARKETPLACE";
        return "MOR_ADS_INVOICE"
    }

    function f(a) {
        return a === "ScimCompany" ? 87 : 65
    }

    function o(a, c, e) {
        var f;
        return b("regeneratorRuntime").async(function(g) {
            while (1) switch (g.prev = g.next) {
                case 0:
                    e === void 0 && (e = "0");
                    g.next = 3;
                    return b("regeneratorRuntime").awrap(d("RelayHooks").fetchQuery(a, l, {
                        paymentAccountID: c
                    }).toPromise());
                case 3:
                    f = g.sent;
                    return g.abrupt("return", p(f, e));
                case 5:
                case "end":
                    return g.stop()
            }
        }, null, this)
    }

    function p(a, b) {
        var c, e, f;
        a = a == null ? void 0 : a.billable_account_by_payment_account;
        c = (c = a == null ? void 0 : a.account_status) != null ? c : "ACTIVE";
        e = (e = a == null ? void 0 : a.billing_flags) != null ? e : [];
        f = (f = a == null ? void 0 : a.payment_modes) != null ? f : ["SUPPORTS_POSTPAY"];
        if (c === "UNSETTLED" || c === "IN_GRACE_PERIOD") return "PAY_NOW";
        if (d("BillingPaymentModeUtils").isPrepayOnlyAccount(f)) {
            c = (c = ((c = a == null ? void 0 : (c = a.billing_payment_account) == null ? void 0 : c.billing_payment_methods) != null ? c : [])[0]) == null ? void 0 : c.credential;
            if (c != null && c.__typename === "StoredBalance") {
                c = parseFloat((c = c == null ? void 0 : (c = c.balance) == null ? void 0 : c.offset_amount) != null ? c : "0");
                if (c === 0 || c < parseFloat(b)) return "ADD_FUNDS"
            }
        }
        if (e.includes("MISSING_PAYMENT_METHOD")) return d("BillingPaymentModeUtils").isPrepayOnlyAccount(f) ? "ADD_FUNDS" : "ADD_PM";
        return e.includes("TAX_INFO_PROBLEM_SOFT_CRTICAL") || e.includes("TAX_INFO_PROBLEM_HARD") || e.includes("CURRENCY_COUNTRY_MISMATCH") || e.includes("TAX_INFO_PROBLEM_SOFT") && !(a == null ? void 0 : a.has_acked_soft_tax_info_problem) ? "COLLECT_ACCOUNT_INFO" : "NONE"
    }

    function q(a) {
        if (a === "ScimCompany") return h._("__JHASH__zdXLbxuBcVf__JHASH__");
        else if (a === "WhatsAppBusinessAccount") return h._("__JHASH__TwrPlwwhqbp__JHASH__");
        else if (a === "AdAccount") return h._("__JHASH__pbiBoscQs3F__JHASH__");
        else if (a === "CommerceBillableAccount") return h._("__JHASH__VCyhq37bNHJ__JHASH__");
        else if (a === "BCPBrandProfileDelegate") return h._("__JHASH__Ogk4eO2yjL9__JHASH__");
        else return h._("__JHASH__TX8dpa3HmFH__JHASH__")
    }
    g.getBillableAccountType = a;
    g.fetchQEForAccountByString = c;
    g.getPaymentItemType = e;
    g.getPaypalMerchantGroup = f;
    g.shouldOpenBillingWizard = o;
    g._shouldOpenBillingWizard = p;
    g.getBillableAccProductName = q
}), 98);
__d("BillingPaymentMethodDisplayUtils", ["BillingPaymentMethodDisplay", "BillingPaymentMethodDisplayUtilsQuery.graphql", "BillingPaymentMethodDisplayUtils_paymentCredential.graphql", "RelayHooks"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h, i, j = h !== void 0 ? h : h = b("BillingPaymentMethodDisplayUtilsQuery.graphql"),
        k = i !== void 0 ? i : i = b("BillingPaymentMethodDisplayUtils_paymentCredential.graphql");

    function a(a, b) {
        return a.fetchQuery({
            query: j,
            queryName: j.params.name,
            variables: {
                paymentMethodID: b
            }
        }, {
            event_context: "payment_method_display_utils"
        })
    }

    function c(a) {
        return l(a == null ? void 0 : a.node)
    }

    function l(a, b) {
        b === void 0 && (b = "");
        a = d("RelayHooks").readInlineData(k, a);
        switch (a == null ? void 0 : a.__typename) {
            case "ExternalCreditCard":
                return d("BillingPaymentMethodDisplay").getCreditCardDisplay(a.card_association_name, a.last_four_digits);
            case "PaymentPaypalBillingAgreement":
                return d("BillingPaymentMethodDisplay").getPayPalDisplay(a.email);
            case "DirectDebit":
                return d("BillingPaymentMethodDisplay").getBankDisplay(a.bank_name, a.bank_account_type, a.last_four_digits);
            case "ExtendedCredit":
            case "MonthlyInvoicing":
            case "SharedMonthlyInvoicing":
                return d("BillingPaymentMethodDisplay").getMonthlyInvoicingDisplay(a.legal_entity_name, a.partition_from);
            case "StoredBalance":
                return d("BillingPaymentMethodDisplay").getSharedStoredBalanceDisplay((a = a.balance_amount) == null ? void 0 : a.currency)
        }
        return b
    }
    g.query = j;
    g.paymentMethodDisplayQuery = a;
    g.getPaymentMethodDisplayFromQuery = c;
    g.getPaymentMethodDisplayFromFragment = l
}), 98); /*FB_PKG_DELIM*/
__d("LSOptimisticSendAttachmentForward", ["LSInsertOptimisticAttachment", "LSIssueNewTaskAndGetTaskID", "LSLocalApplyOptimisticMessage", "LSUpdateOptimisticAttachmentPreview"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments,
            c = a[a.length - 1];
        c.n;
        var d = [],
            e = [],
            f;
        return c.seq([function(g) {
            return c.seq([function(e) {
                return d[1] = a[3] === "" ? f : a[3], d[1] !== f ? c.seq([function(b) {
                    return c.fe(c.ftr(c.db.table(16).fetch([
                        [
                            [a[1], d[1]]
                        ]
                    ]), function(b) {
                        return c.i64.eq(b.threadKey, a[1]) && b.messageId === d[1] && c.i64.eq(b.authorityLevel, c.i64.cast([0, 20]))
                    }), function(b) {
                        var d = b.update;
                        b.item;
                        return d({
                            attachmentFbid: c.i64.to_string(a[7])
                        })
                    })
                }, function(a) {
                    return d[0] = d[1]
                }]) : c.seq([function(e) {
                    return c.sp(b("LSLocalApplyOptimisticMessage"), a[0], a[1], a[2], a[4], a[5], a[6], f, f, f, f, c.i64.cast([0, 3]), f, f, f, !0).then(function(a) {
                        return a = a, d[2] = a[0], d[3] = a[1], a
                    })
                }, function(e) {
                    return c.ftr(c.db.table(16).fetch(), function(b) {
                        return b.attachmentFbid === c.i64.to_string(a[7])
                    }).next().then(function(e, h) {
                        var i = e.done;
                        e = e.value;
                        return i ? c.sp(b("LSInsertOptimisticAttachment"), a[1], d[3], d[2], d[2], c.i64.to_string(a[7]), c.i64.cast([0, 2]), f, f, !0, !1) : (h = e.item, c.seq([function(e) {
                            return c.sp(b("LSInsertOptimisticAttachment"), a[1], d[3], d[2], d[2], c.i64.to_string(a[7]), h.attachmentType, h.filename, h.attributionAppId, !0, !1)
                        }, function(e) {
                            return c.sp(b("LSUpdateOptimisticAttachmentPreview"), a[1], d[2], c.i64.to_string(a[7]), h.playableUrl, h.playableUrlFallback, h.playableUrlExpirationTimestampMs, h.playableUrlMimeType, h.previewUrl, h.previewUrlFallback, h.previewUrlExpirationTimestampMs, h.previewUrlMimeType, h.previewWidth, h.previewHeight)
                        }]))
                    })
                }, function(a) {
                    return d[0] = d[2]
                }])
            }, function(e) {
                return c.seq([function(e) {
                    return d[2] = c.createArray(), d[4] = (d[2].push(a[7]), d[2]), c.sp(b("LSIssueNewTaskAndGetTaskID"), c.i64.to_string(a[1]), c.i64.cast([0, 46]), "", f, f, c.i64.cast([0, 0]), c.i64.cast([0, 0]), c.i64.cast([0, 1]), f, c.i64.cast([0, 0])).then(function(a) {
                        return a = a, d[3] = a[0], a
                    })
                }, function(b) {
                    return c.db.table(31).add({
                        taskId: d[3],
                        threadKey: a[1],
                        offlineThreadingId: d[0],
                        threadAttributionSource: a[8],
                        sendType: c.i64.cast([0, 4]),
                        markThreadRead: !1,
                        initiatingSource: a[9]
                    })
                }])
            }, function(a) {
                return e[0] = d[0]
            }])
        }, function(a) {
            return c.resolve(e)
        }])
    }
    c = a;
    f["default"] = c
}), 66);
__d("LSOptimisticSendMessageForward", ["LSInsertOptimisticAttachment", "LSIssueNewTaskAndGetTaskID", "LSLocalApplyOptimisticMessage", "LSPredefineTraceForTask", "LSUpdateOptimisticAttachmentPreview"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments,
            c = a[a.length - 1];
        c.n;
        var d = [],
            e = [],
            f;
        return c.seq([function(g) {
            return c.seq([function(e) {
                return c.ftr(c.db.table(12).fetch([
                    [
                        [a[3], a[4], a[5]]
                    ]
                ]), function(b) {
                    return c.i64.eq(b.threadKey, a[3]) && c.i64.eq(c.i64.cast([0, 0]), c.i64.cast([0, 0])) && c.i64.eq(b.timestampMs, a[4]) && b.messageId === a[5] && c.i64.eq(b.authorityLevel, c.i64.cast([0, 80]))
                }).next().then(function(e, h) {
                    var i = e.done;
                    e = e.value;
                    return i ? (d[2] = c.createArray(), d[3] = (d[2].push("optimisticSendMessageForward msg not found"), d[2]), d[4] = (d[2].push(a[5]), d[2]), d[5] = c.toJSON(d[2]), function(a) {
                        c.logger(a).mustfix(a)
                    }(d[5]), d[0] = "") : (h = e.item, c.seq([function(e) {
                        return d[8] = h.forwardScore, d[2] = h.text, d[3] = d[8], c.sp(b("LSLocalApplyOptimisticMessage"), a[0], a[1], a[2], d[2], f, f, h.stickerId, h.hotEmojiSize, f, f, c.i64.cast([0, 3]), f, d[3], f, !0).then(function(a) {
                            return a = a, d[4] = a[0], d[5] = a[1], a
                        })
                    }, function(e) {
                        return c.fe(c.db.table(16).fetch([
                            [
                                [h.threadKey, h.messageId]
                            ]
                        ]), function(e) {
                            var h = e.item;
                            return c.seq([function(e) {
                                return d[13] = h.attachmentFbid, d[9] = c.createArray(), d[10] = (d[9].push(d[13]), d[9]), d[11] = (d[9].push(d[4]), d[9]), d[12] = c.toJSON(d[9]), c.sp(b("LSInsertOptimisticAttachment"), a[1], d[5], d[4], d[13], d[12], h.attachmentType, h.filename, f, h.hasMedia, h.hasXma)
                            }, function(e) {
                                return c.sp(b("LSUpdateOptimisticAttachmentPreview"), a[1], d[4], d[12], h.playableUrl, h.playableUrlFallback, h.playableUrlExpirationTimestampMs, h.playableUrlMimeType, h.previewUrl, h.previewUrlFallback, h.previewUrlExpirationTimestampMs, h.previewUrlMimeType, h.previewWidth, h.previewHeight)
                            }])
                        })
                    }, function(e) {
                        return c.sp(b("LSIssueNewTaskAndGetTaskID"), c.i64.to_string(a[1]), c.i64.cast([0, 46]), "", f, f, c.i64.cast([0, 0]), c.i64.cast([0, 0]), c.i64.cast([0, 1]), f, c.i64.cast([0, 0])).then(function(a) {
                            return a = a, d[6] = a[0], a
                        })
                    }, function(a) {
                        return f !== f ? c.sp(b("LSPredefineTraceForTask"), f, d[6], c.i64.to_string(c.i64.cast([0, 46])), d[4]) : c.resolve()
                    }, function(b) {
                        return c.db.table(31).add({
                            taskId: d[6],
                            threadKey: a[1],
                            offlineThreadingId: d[4],
                            messageId: a[5],
                            threadAttributionSource: a[6],
                            sendType: c.i64.cast([0, 5]),
                            markThreadRead: !1,
                            initiatingSource: a[7]
                        })
                    }, function(b) {
                        return d[9] = new c.Map(), d[10] = d[9].set("optimisticSendMessageForward", a[1]), d[11] = d[9].set("fwdMsgID", a[5]), d[12] = c.toJSON(d[9]), d[7] = d[12],
                            function(a) {
                                c.logger(a).info(a)
                            }(d[7]), d[0] = d[4]
                    }]))
                })
            }, function(a) {
                return e[0] = d[0]
            }])
        }, function(a) {
            return c.resolve(e)
        }])
    }
    c = a;
    f["default"] = c
}), 66);
__d("IGDSEmojiConstants", ["fbt"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = h._("__JHASH__VHC0VCJsTvE__JHASH__"),
        j = h._("__JHASH__l2KcVpjSAn2__JHASH__"),
        k = h._("__JHASH__IUaEGHAB0gl__JHASH__"),
        l = h._("__JHASH__zP1MgSFndq1__JHASH__"),
        m = h._("__JHASH__dHbrxmRVXR6__JHASH__"),
        n = h._("__JHASH__WvahIXJNL33__JHASH__"),
        o = h._("__JHASH__GAAKwU7atH-__JHASH__");
    a = h._("__JHASH__1aWijKWuvmZ__JHASH__");
    b = function() {
        return [
            [128514],
            [128558],
            [128525],
            [128546],
            [128079],
            [128293],
            [127881],
            [128175],
            [10084, 65039],
            [129315],
            [129392],
            [128536],
            [128557],
            [128522]
        ]
    };
    c = function() {
        var a = [
                [55357, 56832],
                [55357, 56835],
                [55357, 56836],
                [55357, 56833],
                [55357, 56838],
                [55357, 56837],
                [55358, 56611],
                [55357, 56834],
                [55357, 56898],
                [55357, 56899],
                [55357, 56841],
                [55357, 56842],
                [55357, 56839],
                [55358, 56688],
                [55357, 56845],
                [55358, 56617],
                [55357, 56856],
                [55357, 56855],
                [9786],
                [55357, 56858],
                [55357, 56857],
                [55357, 56843],
                [55357, 56859],
                [55357, 56860],
                [55358, 56618],
                [55357, 56861],
                [55358, 56593],
                [55358, 56599],
                [55358, 56621],
                [55358, 56619],
                [55358, 56596],
                [55358, 56592],
                [55358, 56616],
                [55357, 56848],
                [55357, 56849],
                [55357, 56886],
                [55357, 56847],
                [55357, 56850],
                [55357, 56900],
                [55357, 56876],
                [55358, 56613],
                [55357, 56844],
                [55357, 56852],
                [55357, 56874],
                [55358, 56612],
                [55357, 56884],
                [55357, 56887],
                [55358, 56594],
                [55358, 56597],
                [55358, 56610],
                [55358, 56622],
                [55358, 56615],
                [55358, 56693],
                [55358, 56694],
                [55358, 56692],
                [55357, 56885],
                [55358, 56623],
                [55358, 56608],
                [55358, 56691],
                [55357, 56846],
                [55358, 56595],
                [55358, 56784],
                [55357, 56853],
                [55357, 56863],
                [55357, 56897],
                [9785],
                [55357, 56878],
                [55357, 56879],
                [55357, 56882],
                [55357, 56883],
                [55358, 56698],
                [55357, 56870],
                [55357, 56871],
                [55357, 56872],
                [55357, 56880],
                [55357, 56869],
                [55357, 56866],
                [55357, 56877],
                [55357, 56881],
                [55357, 56854],
                [55357, 56867],
                [55357, 56862],
                [55357, 56851],
                [55357, 56873],
                [55357, 56875],
                [55357, 56868],
                [55357, 56865],
                [55357, 56864],
                [55358, 56620],
                [55357, 56840],
                [55357, 56447],
                [55357, 56448],
                [9760],
                [55357, 56489],
                [55358, 56609],
                [55357, 56441],
                [55357, 56442],
                [55357, 56443],
                [55357, 56445],
                [55357, 56446],
                [55358, 56598],
                [55357, 56890],
                [55357, 56888],
                [55357, 56889],
                [55357, 56891],
                [55357, 56892],
                [55357, 56893],
                [55357, 56896],
                [55357, 56895],
                [55357, 56894],
                [55357, 56459],
                [55357, 56395],
                [55358, 56602],
                [55357, 56720],
                [9995],
                [55357, 56726],
                [55357, 56396],
                [9996],
                [55358, 56606],
                [55358, 56607],
                [55358, 56600],
                [55358, 56601],
                [55357, 56392],
                [55357, 56393],
                [55357, 56390],
                [55357, 56725],
                [55357, 56391],
                [9757],
                [55357, 56397],
                [55357, 56398],
                [9994],
                [55357, 56394],
                [55358, 56603],
                [55358, 56604],
                [55357, 56399],
                [55357, 56908],
                [55357, 56400],
                [55358, 56626],
                [55358, 56605],
                [55357, 56911],
                [9997],
                [55357, 56453],
                [55358, 56627],
                [55357, 56490],
                [55358, 56757],
                [55358, 56758],
                [55357, 56386],
                [55357, 56387],
                [55358, 56800],
                [55358, 56759],
                [55358, 56756],
                [55357, 56384],
                [55357, 56385],
                [55357, 56389],
                [55357, 56388],
                [55357, 56438],
                [55358, 56786],
                [55357, 56422],
                [55357, 56423],
                [55358, 56785],
                [55357, 56433],
                [55357, 56424],
                [55358, 56788],
                [55357, 56424, 8205, 55358, 56752],
                [55357, 56424, 8205, 55358, 56753],
                [55357, 56424, 8205, 55358, 56755],
                [55357, 56424, 8205, 55358, 56754],
                [55357, 56425],
                [55357, 56425, 8205, 55358, 56752],
                [55357, 56425, 8205, 55358, 56753],
                [55357, 56425, 8205, 55358, 56755],
                [55357, 56425, 8205, 55358, 56754],
                [55357, 56433, 8205, 9792, 65039],
                [55357, 56433, 8205, 9794, 65039],
                [55358, 56787],
                [55357, 56436],
                [55357, 56437],
                [55357, 56909],
                [55357, 56909, 8205, 9794, 65039],
                [55357, 56909, 8205, 9792, 65039],
                [55357, 56910],
                [55357, 56910, 8205, 9794, 65039],
                [55357, 56910, 8205, 9792, 65039],
                [55357, 56901],
                [55357, 56901, 8205, 9794, 65039],
                [55357, 56901, 8205, 9792, 65039],
                [55357, 56902],
                [55357, 56902, 8205, 9794, 65039],
                [55357, 56902, 8205, 9792, 65039],
                [55357, 56449],
                [55357, 56449, 8205, 9794, 65039],
                [55357, 56449, 8205, 9792, 65039],
                [55357, 56907],
                [55357, 56907, 8205, 9794, 65039],
                [55357, 56907, 8205, 9792, 65039],
                [55357, 56903],
                [55357, 56903, 8205, 9794, 65039],
                [55357, 56903, 8205, 9792, 65039],
                [55358, 56614],
                [55358, 56614, 8205, 9794, 65039],
                [55358, 56614, 8205, 9792, 65039],
                [55358, 56631],
                [55358, 56631, 8205, 9794, 65039],
                [55358, 56631, 8205, 9792, 65039],
                [55357, 56424, 8205, 9877, 65039],
                [55357, 56425, 8205, 9877, 65039],
                [55357, 56424, 8205, 55356, 57235],
                [55357, 56425, 8205, 55356, 57235],
                [55357, 56424, 8205, 55356, 57323],
                [55357, 56425, 8205, 55356, 57323],
                [55357, 56424, 8205, 9878, 65039],
                [55357, 56425, 8205, 9878, 65039],
                [55357, 56424, 8205, 55356, 57150],
                [55357, 56425, 8205, 55356, 57150],
                [55357, 56424, 8205, 55356, 57203],
                [55357, 56425, 8205, 55356, 57203],
                [55357, 56424, 8205, 55357, 56615],
                [55357, 56425, 8205, 55357, 56615],
                [55357, 56424, 8205, 55356, 57325],
                [55357, 56425, 8205, 55356, 57325],
                [55357, 56424, 8205, 55357, 56508],
                [55357, 56425, 8205, 55357, 56508],
                [55357, 56424, 8205, 55357, 56620],
                [55357, 56425, 8205, 55357, 56620],
                [55357, 56424, 8205, 55357, 56507],
                [55357, 56425, 8205, 55357, 56507],
                [55357, 56424, 8205, 55356, 57252],
                [55357, 56425, 8205, 55356, 57252],
                [55357, 56424, 8205, 55356, 57256],
                [55357, 56425, 8205, 55356, 57256],
                [55357, 56424, 8205, 9992, 65039],
                [55357, 56425, 8205, 9992, 65039],
                [55357, 56424, 8205, 55357, 56960],
                [55357, 56425, 8205, 55357, 56960],
                [55357, 56424, 8205, 55357, 56978],
                [55357, 56425, 8205, 55357, 56978],
                [55357, 56430],
                [55357, 56430, 8205, 9794, 65039],
                [55357, 56430, 8205, 9792, 65039],
                [55357, 56693],
                [55357, 56693, 65039, 8205, 9794, 65039],
                [55357, 56693, 65039, 8205, 9792, 65039],
                [55357, 56450],
                [55357, 56450, 8205, 9794, 65039],
                [55357, 56450, 8205, 9792, 65039],
                [55357, 56439],
                [55357, 56439, 8205, 9794, 65039],
                [55357, 56439, 8205, 9792, 65039],
                [55358, 56628],
                [55357, 56440],
                [55357, 56435],
                [55357, 56435, 8205, 9794, 65039],
                [55357, 56435, 8205, 9792, 65039],
                [55357, 56434],
                [55358, 56789],
                [55358, 56629],
                [55357, 56432],
                [55358, 56624],
                [55358, 56625],
                [55357, 56444],
                [55356, 57221],
                [55358, 56630],
                [55358, 56760],
                [55358, 56760, 8205, 9794, 65039],
                [55358, 56760, 8205, 9792, 65039],
                [55358, 56761],
                [55358, 56761, 8205, 9794, 65039],
                [55358, 56761, 8205, 9792, 65039],
                [55358, 56793],
                [55358, 56793, 8205, 9794, 65039],
                [55358, 56793, 8205, 9792, 65039],
                [55358, 56794],
                [55358, 56794, 8205, 9794, 65039],
                [55358, 56794, 8205, 9792, 65039],
                [55358, 56795],
                [55358, 56795, 8205, 9794, 65039],
                [55358, 56795, 8205, 9792, 65039],
                [55358, 56796],
                [55358, 56796, 8205, 9794, 65039],
                [55358, 56796, 8205, 9792, 65039],
                [55358, 56797],
                [55358, 56797, 8205, 9794, 65039],
                [55358, 56797, 8205, 9792, 65039],
                [55358, 56798],
                [55358, 56798, 8205, 9794, 65039],
                [55358, 56798, 8205, 9792, 65039],
                [55358, 56799],
                [55358, 56799, 8205, 9794, 65039],
                [55358, 56799, 8205, 9792, 65039],
                [55357, 56454],
                [55357, 56454, 8205, 9794, 65039],
                [55357, 56454, 8205, 9792, 65039],
                [55357, 56455],
                [55357, 56455, 8205, 9794, 65039],
                [55357, 56455, 8205, 9792, 65039],
                [55357, 57014],
                [55357, 57014, 8205, 9794, 65039],
                [55357, 57014, 8205, 9792, 65039],
                [55356, 57283],
                [55356, 57283, 8205, 9794, 65039],
                [55356, 57283, 8205, 9792, 65039],
                [55357, 56451],
                [55357, 56698],
                [55357, 56692],
                [55357, 56431],
                [55357, 56431, 8205, 9794, 65039],
                [55357, 56431, 8205, 9792, 65039],
                [55358, 56790],
                [55358, 56790, 8205, 9794, 65039],
                [55358, 56790, 8205, 9792, 65039],
                [55358, 56792],
                [55357, 56429],
                [55357, 56427],
                [55357, 56428],
                [55357, 56463],
                [55357, 56424, 8205, 10084, 65039, 8205, 55357, 56459, 8205, 55357, 56424],
                [55357, 56425, 8205, 10084, 65039, 8205, 55357, 56459, 8205, 55357, 56425],
                [55357, 56465],
                [55357, 56424, 8205, 10084, 65039, 8205, 55357, 56424],
                [55357, 56425, 8205, 10084, 65039, 8205, 55357, 56425],
                [55357, 56426],
                [55357, 56424, 8205, 55357, 56425, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56425, 8205, 55357, 56423],
                [55357, 56424, 8205, 55357, 56425, 8205, 55357, 56423, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56425, 8205, 55357, 56422, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56425, 8205, 55357, 56423, 8205, 55357, 56423],
                [55357, 56424, 8205, 55357, 56424, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56424, 8205, 55357, 56423],
                [55357, 56424, 8205, 55357, 56424, 8205, 55357, 56423, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56424, 8205, 55357, 56422, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56424, 8205, 55357, 56423, 8205, 55357, 56423],
                [55357, 56425, 8205, 55357, 56425, 8205, 55357, 56422],
                [55357, 56425, 8205, 55357, 56425, 8205, 55357, 56423],
                [55357, 56425, 8205, 55357, 56425, 8205, 55357, 56423, 8205, 55357, 56422],
                [55357, 56425, 8205, 55357, 56425, 8205, 55357, 56422, 8205, 55357, 56422],
                [55357, 56425, 8205, 55357, 56425, 8205, 55357, 56423, 8205, 55357, 56423],
                [55357, 56424, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56422, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56423],
                [55357, 56424, 8205, 55357, 56423, 8205, 55357, 56422],
                [55357, 56424, 8205, 55357, 56423, 8205, 55357, 56423],
                [55357, 56425, 8205, 55357, 56422],
                [55357, 56425, 8205, 55357, 56422, 8205, 55357, 56422],
                [55357, 56425, 8205, 55357, 56423],
                [55357, 56425, 8205, 55357, 56423, 8205, 55357, 56422],
                [55357, 56425, 8205, 55357, 56423, 8205, 55357, 56423],
                [55357, 56803],
                [55357, 56420],
                [55357, 56421],
                [55357, 56419],
                [55358, 56819],
                [55356, 57090],
                [9730],
                [55358, 56821],
                [55358, 56822],
                [55357, 56403],
                [55357, 56694],
                [55358, 56701],
                [55358, 56700],
                [55357, 56404],
                [55357, 56405],
                [55357, 56406],
                [55358, 56803],
                [55358, 56804],
                [55358, 56805],
                [55358, 56806],
                [55357, 56407],
                [55357, 56408],
                [55357, 56409],
                [55357, 56410],
                [55357, 56411],
                [55357, 56412],
                [55357, 56413],
                [55356, 57234],
                [55357, 56414],
                [55357, 56415],
                [55358, 56702],
                [55358, 56703],
                [55357, 56416],
                [55357, 56417],
                [55357, 56418],
                [55357, 56401],
                [55357, 56402],
                [55356, 57257],
                [55356, 57235],
                [55358, 56802],
                [9937],
                [55357, 56452],
                [55357, 56461],
                [55357, 56508]
            ],
            b = [
                [55357, 56904],
                [55357, 56905],
                [55357, 56906],
                [55357, 56485],
                [55357, 56491],
                [55357, 56486],
                [55357, 56488],
                [55357, 56373],
                [55357, 56338],
                [55358, 56717],
                [55357, 56374],
                [55357, 56341],
                [55357, 56361],
                [55357, 56378],
                [55358, 56714],
                [55358, 56733],
                [55357, 56369],
                [55357, 56328],
                [55358, 56705],
                [55357, 56367],
                [55357, 56325],
                [55357, 56326],
                [55357, 56372],
                [55357, 56334],
                [55358, 56708],
                [55358, 56723],
                [55358, 56716],
                [55357, 56366],
                [55357, 56322],
                [55357, 56323],
                [55357, 56324],
                [55357, 56375],
                [55357, 56342],
                [55357, 56343],
                [55357, 56381],
                [55357, 56335],
                [55357, 56337],
                [55357, 56336],
                [55357, 56362],
                [55357, 56363],
                [55358, 56729],
                [55358, 56722],
                [55357, 56344],
                [55358, 56719],
                [55358, 56731],
                [55357, 56365],
                [55357, 56321],
                [55357, 56320],
                [55357, 56377],
                [55357, 56368],
                [55357, 56327],
                [55357, 56383],
                [55358, 56724],
                [55358, 56711],
                [55357, 56379],
                [55357, 56360],
                [55357, 56380],
                [55358, 56728],
                [55358, 56737],
                [55357, 56382],
                [55358, 56707],
                [55357, 56340],
                [55357, 56339],
                [55357, 56355],
                [55357, 56356],
                [55357, 56357],
                [55357, 56358],
                [55357, 56359],
                [55357, 56650],
                [55358, 56709],
                [55358, 56710],
                [55358, 56738],
                [55358, 56713],
                [55358, 56730],
                [55358, 56732],
                [55357, 56376],
                [55357, 56330],
                [55357, 56354],
                [55358, 56718],
                [55357, 56333],
                [55357, 56370],
                [55357, 56329],
                [55358, 56725],
                [55358, 56726],
                [55357, 56371],
                [55357, 56331],
                [55357, 56364],
                [55357, 56351],
                [55357, 56352],
                [55357, 56353],
                [55358, 56712],
                [55357, 56345],
                [55357, 56346],
                [55357, 56332],
                [55358, 56715],
                [55357, 56347],
                [55357, 56348],
                [55357, 56349],
                [55357, 56350],
                [55358, 56727],
                [55357, 56695],
                [55357, 56696],
                [55358, 56706],
                [55358, 56735],
                [55358, 56736],
                [55357, 56464],
                [55356, 57144],
                [55357, 56494],
                [55356, 57333],
                [55356, 57145],
                [55358, 56640],
                [55356, 57146],
                [55356, 57147],
                [55356, 57148],
                [55356, 57143],
                [55356, 57137],
                [55356, 57138],
                [55356, 57139],
                [55356, 57140],
                [55356, 57141],
                [55356, 57150],
                [55356, 57151],
                [9752],
                [55356, 57152],
                [55356, 57153],
                [55356, 57154],
                [55356, 57155],
                [55356, 57156],
                [55356, 57136],
                [55358, 56704],
                [55358, 56734],
                [55358, 56720],
                [55358, 56721],
                [55356, 57101],
                [55356, 57102],
                [55356, 57103],
                [55356, 57104],
                [55356, 57105],
                [55356, 57106],
                [55356, 57107],
                [55356, 57108],
                [55356, 57109],
                [55356, 57110],
                [55356, 57111],
                [55356, 57112],
                [55356, 57113],
                [55356, 57114],
                [55356, 57115],
                [55356, 57116],
                [9728],
                [55356, 57117],
                [55356, 57118],
                [11088],
                [55356, 57119],
                [55356, 57120],
                [9729],
                [9925],
                [9928],
                [55356, 57124],
                [55356, 57125],
                [55356, 57126],
                [55356, 57127],
                [55356, 57128],
                [55356, 57129],
                [55356, 57130],
                [55356, 57131],
                [55356, 57132],
                [55356, 57096],
                [9730],
                [9748],
                [9889],
                [10052],
                [9731],
                [9924],
                [9732],
                [55357, 56613],
                [55357, 56487],
                [55356, 57098],
                [55356, 57220],
                [10024],
                [55356, 57227],
                [55356, 57229]
            ],
            c = [
                [55356, 57159],
                [55356, 57160],
                [55356, 57161],
                [55356, 57162],
                [55356, 57163],
                [55356, 57164],
                [55356, 57165],
                [55358, 56685],
                [55356, 57166],
                [55356, 57167],
                [55356, 57168],
                [55356, 57169],
                [55356, 57170],
                [55356, 57171],
                [55358, 56669],
                [55356, 57157],
                [55358, 56677],
                [55358, 56657],
                [55356, 57158],
                [55358, 56660],
                [55358, 56661],
                [55356, 57149],
                [55356, 57142],
                [55358, 56658],
                [55358, 56684],
                [55358, 56678],
                [55356, 57156],
                [55358, 56668],
                [55356, 57136],
                [55356, 57182],
                [55358, 56656],
                [55358, 56662],
                [55358, 56680],
                [55358, 56687],
                [55358, 56670],
                [55358, 56768],
                [55356, 57174],
                [55356, 57175],
                [55358, 56681],
                [55358, 56659],
                [55356, 57172],
                [55356, 57183],
                [55356, 57173],
                [55356, 57133],
                [55358, 56682],
                [55356, 57134],
                [55356, 57135],
                [55358, 56665],
                [55356, 57203],
                [55358, 56664],
                [55356, 57202],
                [55358, 56675],
                [55358, 56663],
                [55356, 57215],
                [55358, 56770],
                [55358, 56683],
                [55356, 57201],
                [55356, 57176],
                [55356, 57177],
                [55356, 57178],
                [55356, 57179],
                [55356, 57180],
                [55356, 57181],
                [55356, 57184],
                [55356, 57186],
                [55356, 57187],
                [55356, 57188],
                [55356, 57189],
                [55358, 56686],
                [55356, 57185],
                [55358, 56671],
                [55358, 56672],
                [55358, 56673],
                [55356, 57190],
                [55356, 57191],
                [55356, 57192],
                [55356, 57193],
                [55356, 57194],
                [55356, 57218],
                [55356, 57200],
                [55358, 56769],
                [55358, 56679],
                [55356, 57195],
                [55356, 57196],
                [55356, 57197],
                [55356, 57198],
                [55356, 57199],
                [55356, 57212],
                [55358, 56667],
                [9749],
                [55356, 57205],
                [55356, 57206],
                [55356, 57214],
                [55356, 57207],
                [55356, 57208],
                [55356, 57209],
                [55356, 57210],
                [55356, 57211],
                [55358, 56642],
                [55358, 56643],
                [55358, 56676],
                [55358, 56674],
                [55356, 57213],
                [55356, 57204],
                [55358, 56644]
            ],
            d = [
                [55357, 56692],
                [55358, 56791],
                [55358, 56791, 8205, 9794, 65039],
                [55358, 56791, 8205, 9792, 65039],
                [55356, 57287],
                [9975],
                [55356, 57282],
                [55356, 57292],
                [55356, 57292, 65039, 8205, 9794, 65039],
                [55356, 57292, 65039, 8205, 9792, 65039],
                [55356, 57284],
                [55356, 57284, 8205, 9794, 65039],
                [55356, 57284, 8205, 9792, 65039],
                [55357, 56995],
                [55357, 56995, 8205, 9794, 65039],
                [55357, 56995, 8205, 9792, 65039],
                [55356, 57290],
                [55356, 57290, 8205, 9794, 65039],
                [55356, 57290, 8205, 9792, 65039],
                [9977],
                [9977, 65039, 8205, 9794, 65039],
                [9977, 65039, 8205, 9792, 65039],
                [55356, 57291],
                [55356, 57291, 65039, 8205, 9794, 65039],
                [55356, 57291, 65039, 8205, 9792, 65039],
                [55357, 57012],
                [55357, 57012, 8205, 9794, 65039],
                [55357, 57012, 8205, 9792, 65039],
                [55357, 57013],
                [55357, 57013, 8205, 9794, 65039],
                [55357, 57013, 8205, 9792, 65039],
                [55358, 56632],
                [55358, 56632, 8205, 9794, 65039],
                [55358, 56632, 8205, 9792, 65039],
                [55358, 56636],
                [55358, 56636, 8205, 9794, 65039],
                [55358, 56636, 8205, 9792, 65039],
                [55358, 56637],
                [55358, 56637, 8205, 9794, 65039],
                [55358, 56637, 8205, 9792, 65039],
                [55358, 56638],
                [55358, 56638, 8205, 9794, 65039],
                [55358, 56638, 8205, 9792, 65039],
                [55358, 56633],
                [55358, 56633, 8205, 9794, 65039],
                [55358, 56633, 8205, 9792, 65039],
                [55358, 56792],
                [55358, 56792, 8205, 9794, 65039],
                [55358, 56792, 8205, 9792, 65039],
                [55356, 57258],
                [55357, 57081],
                [55356, 57239],
                [55356, 57247],
                [55356, 57259],
                [55356, 57238],
                [55356, 57286],
                [55356, 57285],
                [55358, 56647],
                [55358, 56648],
                [55358, 56649],
                [9917],
                [9918],
                [55358, 56654],
                [55356, 57280],
                [55356, 57296],
                [55356, 57288],
                [55356, 57289],
                [55356, 57278],
                [55358, 56655],
                [55356, 57267],
                [55356, 57295],
                [55356, 57297],
                [55356, 57298],
                [55358, 56653],
                [55356, 57299],
                [55356, 57336],
                [55358, 56650],
                [55358, 56651],
                [9971],
                [9976],
                [55356, 57251],
                [55356, 57277],
                [55356, 57279],
                [55357, 57079],
                [55358, 56652],
                [55356, 57263],
                [55356, 57265],
                [55356, 57262],
                [55356, 57264],
                [55356, 57266],
                [55358, 56809],
                [9823],
                [55356, 57261],
                [55356, 57256],
                [55358, 56821],
                [55358, 56822],
                [55356, 57276],
                [55356, 57252],
                [55356, 57255],
                [55356, 57271],
                [55356, 57272],
                [55356, 57273],
                [55356, 57274],
                [55356, 57275],
                [55358, 56641],
                [55356, 57260],
                [55356, 57337]
            ],
            e = [
                [55357, 56995],
                [55357, 56830],
                [55356, 57300],
                [9968],
                [55356, 57099],
                [55357, 56827],
                [55356, 57301],
                [55356, 57302],
                [55356, 57308],
                [55356, 57309],
                [55356, 57310],
                [55356, 57311],
                [55356, 57307],
                [55356, 57303],
                [55356, 57304],
                [55356, 57306],
                [55356, 57312],
                [55356, 57313],
                [55356, 57314],
                [55356, 57315],
                [55356, 57316],
                [55356, 57317],
                [55356, 57318],
                [55356, 57320],
                [55356, 57321],
                [55356, 57322],
                [55356, 57323],
                [55356, 57324],
                [55356, 57325],
                [55356, 57327],
                [55356, 57328],
                [55357, 56466],
                [55357, 56828],
                [55357, 56829],
                [9962],
                [55357, 56652],
                [55357, 56653],
                [9961],
                [55357, 56651],
                [9970],
                [9978],
                [55356, 57089],
                [55356, 57091],
                [55356, 57305],
                [55356, 57092],
                [55356, 57093],
                [55356, 57094],
                [55356, 57095],
                [55356, 57097],
                [55356, 57248],
                [55356, 57249],
                [55356, 57250],
                [55357, 56962],
                [55357, 56963],
                [55357, 56964],
                [55357, 56965],
                [55357, 56966],
                [55357, 56967],
                [55357, 56968],
                [55357, 56969],
                [55357, 56970],
                [55357, 56989],
                [55357, 56990],
                [55357, 56971],
                [55357, 56972],
                [55357, 56973],
                [55357, 56974],
                [55357, 56976],
                [55357, 56977],
                [55357, 56978],
                [55357, 56979],
                [55357, 56980],
                [55357, 56981],
                [55357, 56982],
                [55357, 56983],
                [55357, 56984],
                [55357, 56986],
                [55357, 56987],
                [55357, 56988],
                [55356, 57294],
                [55356, 57293],
                [55357, 57077],
                [55357, 57010],
                [55357, 57076],
                [55357, 56975],
                [55357, 57060],
                [9981],
                [55357, 57e3],
                [55357, 56997],
                [55357, 56998],
                [55357, 56999],
                [9875],
                [9973],
                [55357, 56996],
                [55357, 57075],
                [9972],
                [55357, 57061],
                [55357, 56994],
                [9992],
                [55357, 57065],
                [55357, 57067],
                [55357, 57068],
                [55357, 56506],
                [55357, 56961],
                [55357, 56991],
                [55357, 56992],
                [55357, 56993],
                [55357, 57072],
                [55357, 56960],
                [55357, 57080],
                [55356, 57120],
                [55356, 57100],
                [9969],
                [55356, 57222],
                [55356, 57223],
                [55356, 57233],
                [55357, 56500],
                [55357, 56501],
                [55357, 56502],
                [55357, 56503],
                [55357, 56831],
                [55357, 57026],
                [55357, 57027],
                [55357, 57028],
                [55357, 57029]
            ],
            f = [
                [55357, 56460],
                [55357, 56691],
                [55357, 56483],
                [55357, 57024],
                [55357, 57036],
                [55357, 56618],
                [55356, 57338],
                [55357, 56826],
                [55358, 56813],
                [55358, 56817],
                [55357, 56456],
                [55357, 57058],
                [55357, 57038],
                [55358, 56819],
                [8987],
                [9203],
                [8986],
                [9200],
                [9201],
                [9202],
                [55357, 56688],
                [55356, 57121],
                [9969],
                [55358, 56808],
                [55356, 57224],
                [55356, 57225],
                [55356, 57226],
                [55356, 57230],
                [55356, 57231],
                [55356, 57232],
                [55358, 56807],
                [55356, 57216],
                [55356, 57217],
                [55357, 56622],
                [55358, 56831],
                [55357, 56697],
                [55358, 56824],
                [55357, 56764],
                [55358, 56821],
                [55358, 56822],
                [55357, 57037],
                [55357, 56575],
                [55357, 56462],
                [55357, 56559],
                [55356, 57241],
                [55356, 57242],
                [55356, 57243],
                [55357, 56571],
                [55357, 56561],
                [55357, 56562],
                [9742],
                [55357, 56542],
                [55357, 56543],
                [55357, 56544],
                [55357, 56587],
                [55357, 56588],
                [55357, 56507],
                [55357, 56741],
                [55357, 56744],
                [9e3],
                [55357, 56753],
                [55357, 56754],
                [55357, 56509],
                [55357, 56510],
                [55357, 56511],
                [55357, 56512],
                [55358, 56814],
                [55356, 57253],
                [55356, 57246],
                [55357, 56573],
                [55357, 56570],
                [55357, 56567],
                [55357, 56568],
                [55357, 56569],
                [55357, 56572],
                [55357, 56589],
                [55357, 56590],
                [55357, 56687],
                [55357, 56481],
                [55357, 56614],
                [55356, 57326],
                [55357, 56532],
                [55357, 56533],
                [55357, 56534],
                [55357, 56535],
                [55357, 56536],
                [55357, 56537],
                [55357, 56538],
                [55357, 56531],
                [55357, 56515],
                [55357, 56540],
                [55357, 56516],
                [55357, 56560],
                [55357, 56798],
                [55357, 56529],
                [55357, 56598],
                [55356, 57335],
                [55357, 56496],
                [55357, 56500],
                [55357, 56501],
                [55357, 56502],
                [55357, 56503],
                [55357, 56504],
                [55357, 56499],
                [55358, 56830],
                [9993],
                [55357, 56551],
                [55357, 56552],
                [55357, 56553],
                [55357, 56548],
                [55357, 56549],
                [55357, 56550],
                [55357, 56555],
                [55357, 56554],
                [55357, 56556],
                [55357, 56557],
                [55357, 56558],
                [55357, 56819],
                [9999],
                [10002],
                [55357, 56715],
                [55357, 56714],
                [55357, 56716],
                [55357, 56717],
                [55357, 56541],
                [55357, 56513],
                [55357, 56514],
                [55357, 56770],
                [55357, 56517],
                [55357, 56518],
                [55357, 56786],
                [55357, 56787],
                [55357, 56519],
                [55357, 56520],
                [55357, 56521],
                [55357, 56522],
                [55357, 56523],
                [55357, 56524],
                [55357, 56525],
                [55357, 56526],
                [55357, 56711],
                [55357, 56527],
                [55357, 56528],
                [9986],
                [55357, 56771],
                [55357, 56772],
                [55357, 56785],
                [55357, 56594],
                [55357, 56595],
                [55357, 56591],
                [55357, 56592],
                [55357, 56593],
                [55357, 56797],
                [55357, 56616],
                [9935],
                [9874],
                [55357, 57056],
                [55357, 56801],
                [9876],
                [55357, 56619],
                [55357, 57057],
                [55357, 56615],
                [55357, 56617],
                [9881],
                [55357, 56796],
                [9878],
                [55357, 56599],
                [9939],
                [55358, 56816],
                [55358, 56818],
                [9879],
                [55358, 56810],
                [55358, 56811],
                [55358, 56812],
                [55357, 56620],
                [55357, 56621],
                [55357, 56545],
                [55357, 56457],
                [55357, 56458],
                [55357, 57002],
                [55357, 57039],
                [55357, 57035],
                [55357, 57021],
                [55357, 57023],
                [55357, 57025],
                [55358, 56820],
                [55358, 56823],
                [55358, 56825],
                [55358, 56826],
                [55358, 56827],
                [55358, 56828],
                [55358, 56829],
                [55358, 56815],
                [55357, 57004],
                [9904],
                [9905],
                [55357, 56831],
                [55357, 57008]
            ],
            g = [
                [55357, 56472],
                [55357, 56477],
                [55357, 56470],
                [55357, 56471],
                [55357, 56467],
                [55357, 56478],
                [55357, 56469],
                [55357, 56479],
                [10083],
                [55357, 56468],
                [10084],
                [55358, 56801],
                [55357, 56475],
                [55357, 56474],
                [55357, 56473],
                [55357, 56476],
                [55357, 56740],
                [55357, 56495],
                [55357, 56482],
                [55357, 56492],
                [55357, 56385, 65039, 8205, 55357, 56808, 65039],
                [55357, 56815],
                [55357, 56493],
                [55357, 56484],
                [55357, 56494],
                [9832],
                [55357, 56456],
                [55357, 57041],
                [55357, 56667],
                [55357, 56679],
                [55357, 56656],
                [55357, 56668],
                [55357, 56657],
                [55357, 56669],
                [55357, 56658],
                [55357, 56670],
                [55357, 56659],
                [55357, 56671],
                [55357, 56660],
                [55357, 56672],
                [55357, 56661],
                [55357, 56673],
                [55357, 56662],
                [55357, 56674],
                [55357, 56663],
                [55357, 56675],
                [55357, 56664],
                [55357, 56676],
                [55357, 56665],
                [55357, 56677],
                [55357, 56666],
                [55357, 56678],
                [55356, 57088],
                [9824],
                [9829],
                [9830],
                [9827],
                [55356, 56527],
                [55356, 56324],
                [55356, 57268],
                [55357, 56583],
                [55357, 56584],
                [55357, 56585],
                [55357, 56586],
                [55357, 56546],
                [55357, 56547],
                [55357, 56559],
                [55357, 56596],
                [55357, 56597],
                [55356, 57269],
                [55356, 57270],
                [55356, 57319],
                [55357, 57006],
                [55357, 57008],
                [9855],
                [55357, 57017],
                [55357, 57018],
                [55357, 57019],
                [55357, 57020],
                [55357, 57022],
                [9888],
                [55357, 57016],
                [9940],
                [55357, 57003],
                [55357, 57011],
                [55357, 57005],
                [55357, 57007],
                [55357, 57009],
                [55357, 57015],
                [55357, 56606],
                [9762],
                [9763],
                [11014],
                [8599],
                [10145],
                [8600],
                [11015],
                [8601],
                [11013],
                [8598],
                [8597],
                [8596],
                [8617],
                [8618],
                [10548],
                [10549],
                [55357, 56579],
                [55357, 56580],
                [55357, 56601],
                [55357, 56602],
                [55357, 56603],
                [55357, 56604],
                [55357, 56605],
                [55357, 57040],
                [9883],
                [55357, 56649],
                [10017],
                [9784],
                [9775],
                [10013],
                [9766],
                [9770],
                [9774],
                [55357, 56654],
                [55357, 56623],
                [9800],
                [9801],
                [9802],
                [9803],
                [9804],
                [9805],
                [9806],
                [9807],
                [9808],
                [9809],
                [9810],
                [9811],
                [9934],
                [55357, 56576],
                [55357, 56577],
                [55357, 56578],
                [9654],
                [9193],
                [9664],
                [9194],
                [55357, 56636],
                [9195],
                [55357, 56637],
                [9196],
                [9209],
                [9167],
                [55356, 57254],
                [55357, 56581],
                [55357, 56582],
                [55357, 56566],
                [55357, 56563],
                [55357, 56564],
                [10006],
                [10133],
                [10134],
                [10135],
                [9854],
                [8252],
                [8265],
                [10067],
                [10068],
                [10069],
                [10071],
                [9851],
                [55357, 56625],
                [55357, 56539],
                [55357, 56624],
                [11093],
                [9989],
                [9745],
                [10004],
                [10060],
                [10062],
                [10160],
                [10175],
                [12349],
                [10035],
                [10036],
                [10055],
                [169],
                [174],
                [8482],
                [35, 65039, 8419],
                [48, 65039, 8419],
                [49, 65039, 8419],
                [50, 65039, 8419],
                [51, 65039, 8419],
                [52, 65039, 8419],
                [53, 65039, 8419],
                [54, 65039, 8419],
                [55, 65039, 8419],
                [56, 65039, 8419],
                [57, 65039, 8419],
                [55357, 56607],
                [55357, 56608],
                [55357, 56609],
                [55357, 56610],
                [55357, 56611],
                [55357, 56612],
                [55356, 56688],
                [55356, 56718],
                [55356, 56689],
                [55356, 56721],
                [55356, 56722],
                [55356, 56723],
                [8505],
                [55356, 56724],
                [9410],
                [55356, 56725],
                [55356, 56726],
                [55356, 56702],
                [55356, 56727],
                [55356, 56703],
                [55356, 56728],
                [55356, 56729],
                [55356, 56730],
                [55356, 56833],
                [55356, 56834],
                [55356, 56887],
                [55356, 56886],
                [55356, 56879],
                [55356, 56912],
                [55356, 56889],
                [55356, 56858],
                [55356, 56882],
                [55356, 56913],
                [55356, 56888],
                [55356, 56884],
                [55356, 56883],
                [12951],
                [12953],
                [55356, 56890],
                [55356, 56885],
                [55357, 56628],
                [55357, 56629],
                [9899],
                [9898],
                [11035],
                [11036],
                [9724],
                [9723],
                [9726],
                [9725],
                [9642],
                [9643],
                [55357, 56630],
                [55357, 56631],
                [55357, 56632],
                [55357, 56633],
                [55357, 56634],
                [55357, 56635],
                [55357, 56480],
                [55357, 56627],
                [55357, 56626]
            ];
        return {
            SMILEYS_PEOPLE: {
                emojis: a,
                label: i
            },
            ANIMALS_NATURE: {
                emojis: b,
                label: j
            },
            FOOD_DRINK: {
                emojis: c,
                label: k
            },
            ACTIVITES: {
                emojis: d,
                label: l
            },
            TRAVEL_PLACES: {
                emojis: e,
                label: m
            },
            OBJECTS: {
                emojis: f,
                label: n
            },
            SYMBOLS: {
                emojis: g,
                label: o
            }
        }
    };
    g.EMOJI_TRAY_MOST_POPULAR = a;
    g.getMostPopularEmojis = b;
    g.getEmojis = c
}), 98);
__d("useIGDSEmojis", ["IGDSEmojiConstants", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo;

    function a() {
        var a = h(d("IGDSEmojiConstants").getMostPopularEmojis, []),
            b = h(d("IGDSEmojiConstants").getEmojis, []);
        return {
            Emojis: b,
            mostPopularEmojis: a
        }
    }
    g["default"] = a
}), 98);
__d("IGDSEmojiTray.react", ["BaseButton.react", "IGDSBox.react", "IGDSEmoji.react", "IGDSEmojiConstants", "IGDSText.react", "react", "useIGDSEmojis"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            emoji: {
                alignItems: "x6s0dn4",
                fontSize: "x579bpy",
                fontWeight: "x1fcty0u",
                height: "x10w6t97",
                justifyContent: "xl56j7k",
                width: "x1td3qas",
                $$css: !0
            },
            emojiButton: {
                color: "x173jzuc",
                height: "x10w6t97",
                lineHeight: "xggjnk3",
                marginTop: "x1k70j0n",
                marginEnd: "x1w0mnb",
                marginBottom: "xzueoph",
                marginStart: "x1mnrxsn",
                textAlign: "x2b8uid",
                userSelect: "x87ps6o",
                width: "x1td3qas",
                ":active_opacity": "x1d5wrs8",
                $$css: !0
            }
        };

    function j(a) {
        a = a.headerText;
        return h.jsx(c("IGDSBox.react"), {
            marginBottom: 2,
            marginEnd: 2,
            marginStart: 2,
            marginTop: 4,
            width: "100%",
            children: h.jsx(c("IGDSText.react").BodyEmphasized, {
                color: "secondaryText",
                textAlign: "start",
                children: a
            })
        })
    }
    j.displayName = j.name + " [from " + f.id + "]";

    function k(a) {
        var b = a.emoji,
            d = a.emojiCodePoint,
            e = a.onClick;
        return h.jsx(c("BaseButton.react"), {
            onClick: function() {
                e != null && e(d)
            },
            xstyle: i.emojiButton,
            children: h.jsx("div", {
                className: "x6s0dn4 x579bpy x1fcty0u x10w6t97 xl56j7k x1td3qas",
                children: h.jsx(c("IGDSEmoji.react"), {
                    emoji: b
                })
            })
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";
    var l = 309,
        m = 309;

    function a(a) {
        var b = a.onClick,
            e = a.height;
        e = e === void 0 ? l : e;
        a = a.width;
        a = a === void 0 ? m : a;
        var f = c("useIGDSEmojis")(),
            g = f.Emojis;
        f = f.mostPopularEmojis;
        return h.jsx(c("IGDSBox.react"), {
            height: e,
            margin: 2,
            overflow: "scrollY",
            width: a,
            children: h.jsxs(c("IGDSBox.react"), {
                direction: "row",
                wrap: !0,
                children: [h.jsx(c("IGDSBox.react"), {
                    margin: 2,
                    width: "100%",
                    children: h.jsx(c("IGDSText.react").BodyEmphasized, {
                        color: "secondaryText",
                        textAlign: "start",
                        children: d("IGDSEmojiConstants").EMOJI_TRAY_MOST_POPULAR
                    })
                }), f.map(function(a) {
                    var c = String.fromCodePoint.apply(String, a);
                    return h.jsx(k, {
                        emoji: c,
                        emojiCodePoint: a,
                        onClick: b
                    }, c)
                }), Object.keys(g).map(function(a) {
                    var c = g[a],
                        d = c.emojis;
                    c = c.label;
                    return h.jsxs(h.Fragment, {
                        children: [h.jsx(j, {
                            headerText: c
                        }), d.map(function(a) {
                            var c = String.fromCodePoint.apply(String, a);
                            return h.jsx(k, {
                                emoji: c,
                                emojiCodePoint: a,
                                onClick: b
                            }, c)
                        })]
                    }, a)
                })]
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDComposerEmojiPicker.react", ["IGDSEmojiTray.react", "IGDSPopover.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        a.onClose;
        var b = a.onSelect;
        a = h.jsx("div", {
            className: "xz9dl7a xj6ak53",
            children: h.jsx(c("IGDSEmojiTray.react"), {
                onClick: function(a) {
                    b(a)
                },
                width: "auto"
            })
        });
        return h.jsx(c("IGDSPopover.react"), {
            popoverContent: a,
            popoverName: "emojiTray",
            withArrow: !0
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDMessageEmojiPicker.react", ["CometPopover.react", "IGDSEmojiTray.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.onClose,
            d = a.onSelect;
        a = function(a) {
            d(a);
            return b()
        };
        return h.jsx(c("CometPopover.react"), {
            arrowAlignment: "edge",
            withArrow: !0,
            children: h.jsx(c("IGDSEmojiTray.react"), {
                onClick: a
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDMessageCopyButton.react", ["fbt", "Clipboard", "IGDSButton.react", "MWPActor.react", "promiseDone", "react", "requireDeferred", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = c("requireDeferred")("MWLogMessageAction").__setRef("IGDMessageCopyButton.react");

    function a(a) {
        var b = a.message,
            e = a.onClose,
            f = c("useReStore")(),
            g = d("MWPActor.react").useActor();
        a = function() {
            var a;
            d("Clipboard").copy((a = b.text) != null ? a : "");
            e();
            j.onReady(function(a) {
                return c("promiseDone")(a.log(f, b.messageId, b.threadKey, "message_dot_menu", "copy", void 0, void 0, void 0, b.senderId, void 0, g))
            })
        };
        return i.jsx(c("IGDSButton.react"), {
            display: "block",
            label: h._("__JHASH__3LRiqsZl3CP__JHASH__"),
            onClick: a,
            role: "menuitem",
            variant: "white_link"
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWChatInteractionLog.bs", ["QPLUserFlow"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = new Map();

    function a(a, b) {
        var d = Date.now() | 0;
        h.set(b, d);
        c("QPLUserFlow").start(a, {
            cancelOnUnload: !0,
            instanceKey: d,
            timeoutInMs: 6e4
        })
    }

    function b(a, b, d) {
        b = h.get(b);
        if (!(b == null)) {
            c("QPLUserFlow").endFailure(a, d, {
                instanceKey: b
            });
            return
        }
    }

    function d(a, b) {
        b = h.get(b);
        if (!(b == null)) {
            c("QPLUserFlow").endSuccess(a, {
                instanceKey: b
            });
            return
        }
    }

    function e(a, b, d) {
        b = h.get(b);
        if (!(b == null)) {
            c("QPLUserFlow").addPoint(a, d, {
                instanceKey: b
            });
            return
        }
    }
    g.logStartUserFlow = a;
    g.logFailUserFlow = b;
    g.logSuccessUserFlow = d;
    g.logPointUserFlow = e
}), 98);
__d("MercuryIDs", ["gkx"], (function(a, b, c, d, e, f) {
    "use strict";
    var g = {
        isValid: function(a) {
            return a == null || a === "" || typeof a !== "string" ? !1 : /^\w{3,12}:.+/.test(a)
        },
        isValidThreadID: function(a) {
            if (!g.isValid(a)) return !1;
            a = g.tokenize(a);
            switch (a.type) {
                case "user":
                case "support":
                case "thread":
                case "root":
                    return !0;
                default:
                    return (a.type === "pending" || a.type === "group") && !b("gkx")("863760") ? !0 : !1
            }
        },
        tokenize: function(a) {
            if (a == null || a === "" || !g.isValid(a)) throw new Error("bad_id_format " + String(a));
            var b = a.indexOf(":");
            return {
                type: a.substr(0, b),
                value: a.substr(b + 1)
            }
        },
        getUserIDFromParticipantID: function(a) {
            if (!g.isValid(a)) throw new Error("bad_id_format " + a);
            a = g.tokenize(a);
            var b = a.type;
            a = a.value;
            return b === "fbid" ? a : null
        },
        getParticipantIDFromUserID: function(a) {
            if (isNaN(a)) throw new Error("Not a user ID: " + a);
            return "fbid:" + a
        },
        getUserIDFromThreadID: function(a) {
            return !this.isCanonical(a) ? null : this.tokenize(a).value
        },
        getThreadIDFromUserID: function(a) {
            return "user:" + a
        },
        getThreadIDFromThreadFBID: function(a) {
            return "thread:" + a
        },
        getThreadIDFromSupportInboxItemID: function(a) {
            return "support:" + a
        },
        getThreadFBIDFromThreadID: function(a) {
            return this.tokenize(a).value
        },
        getThreadKeyfromThreadIDUserID: function(a, b) {
            if (a == null || a === "" || !g.isValid(a)) throw new Error("bad_id_format " + String(a));
            var c = this.tokenize(a).type;
            a = this.tokenize(a).value;
            if (c !== "user") return "g" + a;
            c = "";
            var d = "";
            if (a.length !== b.length) a.length > b.length ? (c = a, d = b) : (c = b, d = a);
            else if (b === a) return b + "u" + a;
            else {
                var e = 0;
                while (e < a.length && e < b.length)
                    if (a[e] === b[e]) e++;
                    else {
                        a[e] > b[e] ? (c = a, d = b) : (c = b, d = a);
                        break
                    }
            }
            return d + "u" + c
        },
        getThreadIDFromParticipantID: function(a) {
            a = this.getUserIDFromParticipantID(a);
            return a ? this.getThreadIDFromUserID(a) : null
        },
        getParticipantIDFromFromThreadID: function(a) {
            a = this.getUserIDFromThreadID(a);
            return a ? this.getParticipantIDFromUserID(a) : null
        },
        getSupportInboxItemIDFromThreadID: function(a) {
            return this.tokenize(a).value
        },
        isCanonical: function(a) {
            return this.isValid(a) && this.tokenize(a).type === "user"
        },
        isGroupChat: function(a) {
            return this.isValid(a) && this.tokenize(a).type !== "user"
        },
        isLocalThread: function(a) {
            return this.isValid(a) && this.tokenize(a).type === "root"
        }
    };
    e.exports = g
}), null);
__d("MWChatThreadId", ["LSIntEnum", "MercuryIDs", "unrecoverableViolation"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        switch (a.NAME) {
            case "Group":
                return d("MercuryIDs").getThreadIDFromThreadFBID(a.VAL);
            case "User":
                return d("MercuryIDs").getThreadIDFromUserID(a.VAL);
            case "Page":
                return d("MercuryIDs").getThreadIDFromUserID(a.VAL);
            case "UserSecret":
                throw c("unrecoverableViolation")("Not supported", "messenger_web_product")
        }
    }

    function b(a) {
        switch (a.NAME) {
            case "Group":
            case "User":
            case "Page":
            case "UserSecret":
                return a.VAL
        }
    }

    function e(a) {
        switch (a.NAME) {
            case "Group":
                return "g." + a.VAL;
            case "Page":
                return "p." + a.VAL;
            case "User":
                return "u." + a.VAL;
            case "UserSecret":
                throw c("unrecoverableViolation")("Not supported", "messenger_web_product")
        }
    }

    function f(a) {
        switch (a.targetType) {
            case "GROUP":
                return {
                    NAME: "Group", VAL: a.targetID
                };
            case "PAGE":
                return {
                    NAME: "Page", VAL: a.targetID
                };
            case "USER":
                return {
                    NAME: "User", VAL: a.targetID
                };
            default:
                throw c("unrecoverableViolation")("Invalid id", "messenger_web_product")
        }
    }

    function h(a) {
        return a.NAME === "User"
    }

    function i(a) {
        return a.NAME === "UserSecret"
    }

    function j(a) {
        if (a == null) return;
        a = a.split(":");
        if (a.length !== 2) return;
        var b = a[0];
        a = a[1];
        switch (b) {
            case "thread":
                return {
                    NAME: "Group", VAL: a
                };
            case "user":
                return {
                    NAME: "User", VAL: a
                };
            default:
                return
        }
    }

    function k(a) {
        a = a.NAME;
        if (a === "Group") return d("LSIntEnum").ofNumber(2);
        return a === "User" || a === "Page" ? d("LSIntEnum").ofNumber(1) : d("LSIntEnum").ofNumber(7)
    }
    g.getMercuryID = a;
    g.getFBID = b;
    g.serializeFuture = e;
    g.fromJs = f;
    g.isUser = h;
    g.isSecret = i;
    g.deserializeFromLegacyThreadId = j;
    g.getMessagingThreadType = k
}), 98);
__d("MWThread_DEPRECATED.bs", ["FBLogger", "I64", "gkx", "react", "unrecoverableViolation"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = h.createContext,
        j = h.createElement,
        k = h.useContext,
        l = i();

    function a() {
        if (c("gkx")("7530")) {
            var a = c("FBLogger")("work_web_messaging");
            a.blameToPreviousFile();
            a.mustfix("MWThread_DEPRECATED useId usage in Workplace")
        }
        return k(l)
    }

    function m() {
        if (c("gkx")("7530")) {
            var a = c("FBLogger")("work_web_messaging");
            a.blameToPreviousFile();
            a.mustfix("MWThread_DEPRECATED useIdExn usage in Workplace")
        }
        a = k(l);
        if (a == null) throw c("unrecoverableViolation")("This hook can only be used in a component wrapped with a MWThread_DEPRECATED provider", "messenger_e2ee_web");
        return a
    }

    function b(a) {
        return d("I64").of_string(a.VAL)
    }

    function e() {
        return m().VAL
    }

    function f(a) {
        return a.VAL
    }

    function n(a) {
        var b = a.children;
        a = a.id;
        var d = k(l);
        if (d != null) throw c("unrecoverableViolation")("You can't nest MWThread in another MWThread_DEPRECATED. This will cause SEVs as things might think they're in the wrong thread", "messenger_web_product");
        return j(l.Provider, {
            children: b,
            value: a
        })
    }
    h = n;
    g.context = l;
    g.useId = a;
    g.useIdExn = m;
    g.toThreadKey = b;
    g.useFBID = e;
    g.key = f;
    g.make = h
}), 98);
__d("useGetForwardSource", ["LSIntEnum", "LSMessagingThreadAttributionType", "MWLSThreadDisplayContext"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a() {
        var a = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        if (a != null)
            if (a === "Inbox") return d("LSIntEnum").ofNumber(c("LSMessagingThreadAttributionType").MESSENGER_INBOX_FORWARD);
            else if (a === "ChatTab") return d("LSIntEnum").ofNumber(c("LSMessagingThreadAttributionType").MESSENGER_CHAT_FORWARD);
        else return d("LSIntEnum").ofNumber(c("LSMessagingThreadAttributionType").MESSENGER_BROADCAST_FLOW);
        else return d("LSIntEnum").ofNumber(c("LSMessagingThreadAttributionType").MESSENGER_BROADCAST_FLOW)
    }
    g["default"] = a
}), 98);
__d("WorkChatMessageType.bs", [], (function(a, b, c, d, e, f) {
    "use strict";
    a = "text";
    b = "gif";
    c = "sticker";
    d = "audio";
    e = "file";
    f.text = a;
    f.gif = b;
    f.sticker = c;
    f.audio = d;
    f.file = e
}), 66);
__d("getMWReplySourceId", ["MWChatMessageId"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        if (a == null) return;
        return d("MWChatMessageId").getMessageId(a.content._0.messageID)
    }
    g["default"] = a
}), 98);
__d("useMWLSSendStickerMessage", ["I64", "Int64Hooks", "LSFactory", "LSIntEnum", "LSMailboxType", "LSMessageReplySourceType", "LSMessageReplySourceTypeV2", "LSOptimisticSendMessage", "LSShape", "LSThreadAttributionTypeUtil.bs", "MWPActor.react", "MWThread_DEPRECATED.bs", "WorkChatMessageType.bs", "getMWReplySourceId", "promiseDone", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a, b, e) {
        var f = c("useReStore")(),
            g = d("MWPActor.react").useActor();
        return d("Int64Hooks").useCallbackInt64(function(h, i, j, k) {
            c("promiseDone")(f.runInTransaction(function(e) {
                var f, l = d("MWThread_DEPRECATED.bs").toThreadKey(h);
                f = d("LSThreadAttributionTypeUtil.bs").getSource(l, (f = a) != null ? f : "unknown");
                return c("LSOptimisticSendMessage")(g, l, d("LSIntEnum").ofNumber(1), d("LSIntEnum").ofNumber(c("LSMailboxType").MESSENGER), void 0, void 0, !1, d("I64").of_string(i), void 0, void 0, void 0, f, void 0, void 0, c("getMWReplySourceId")(j), d("LSIntEnum").ofNumber(c("LSMessageReplySourceType").MESSAGE), d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").MESSAGE), void 0, void 0, void 0, !0, !0, d("LSShape").ofRecord({
                    playable_url: void 0,
                    playable_url_expiration_timestamp_ms: void 0,
                    playable_url_fallback: void 0,
                    playable_url_mime_type: void 0,
                    preview_height: d("I64").zero,
                    preview_url: k,
                    preview_url_expiration_timestamp_ms: void 0,
                    preview_url_fallback: void 0,
                    preview_url_mime_type: void 0,
                    preview_width: d("I64").zero
                }), b, void 0, void 0, void 0, c("LSFactory")(e))
            }, "readwrite").then(function(a) {
                e == null ? void 0 : e(d("WorkChatMessageType.bs").sticker, 1, a[0])
            }))
        }, [f, g, b, a, e])
    }
    g["default"] = a
}), 98);
__d("MWLSForwardMessage.bs", ["I64", "Int64Hooks", "LSFactory", "LSMediaUrl.bs", "LSMessagingInitiatingSourceHook.bs", "LSMessagingSource", "LSOptimisticSendAttachmentForward", "LSOptimisticSendMessageForward", "MWChatInteractionLog.bs", "MWChatThreadId", "MWPActor.react", "MWThread_DEPRECATED.bs", "ODS", "Promise", "ReQL.bs", "promiseDone", "qpl", "useGetForwardSource", "useMWLSSendStickerMessage", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a() {
        var a = c("useReStore")(),
            e = d("MWPActor.react").useActor(),
            f = d("LSMessagingInitiatingSourceHook.bs").useHook(),
            g = c("useGetForwardSource")(),
            h = d("LSMessagingSource").useHook(),
            i = c("useMWLSSendStickerMessage")(h, f);
        return d("Int64Hooks").useCallbackInt64(function(h, j) {
            var k = d("MWChatThreadId").getMessagingThreadType(h),
                l = d("MWThread_DEPRECATED.bs").toThreadKey(h);
            switch (j.TAG) {
                case 0:
                case 1:
                    return;
                case 2:
                    j = j._0;
                    var m = j.timestamp,
                        n = j.messageId,
                        o = j.threadId;
                    d("ODS").bumpEntityKey(3185, "mw_forward", "send");
                    d("MWChatInteractionLog.bs").logPointUserFlow(c("qpl")._(25298392, "4881"), n, "sending");
                    var p = function() {
                        return a.runInTransaction(function(a) {
                            return c("LSOptimisticSendMessageForward")(e, l, k, o, m, n, g, f, c("LSFactory")(a))
                        }, "readwrite").then(function() {})
                    };
                    c("promiseDone")(d("ReQL.bs").first(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(a.table("messages")), {
                        hd: o,
                        tl: {
                            hd: m,
                            tl: {
                                hd: n,
                                tl: 0
                            }
                        }
                    })).then(function(c) {
                        if (c == null) return p();
                        var e = c.stickerId;
                        if (e != null) return d("ReQL.bs").first(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(a.table("attachments")), {
                            hd: o,
                            tl: {
                                hd: n,
                                tl: 0
                            }
                        })).then(function(a) {
                            a = a != null ? d("LSMediaUrl.bs").Attachment.previewUrl(a) : void 0;
                            i(h, d("I64").to_string(e), void 0, a);
                            return b("Promise").resolve()
                        });
                        else return p()
                    }), function() {
                        d("ODS").bumpEntityKey(3185, "mw_forward", "success");
                        return d("MWChatInteractionLog.bs").logSuccessUserFlow(c("qpl")._(25298392, "4881"), n)
                    }, function() {
                        d("ODS").bumpEntityKey(3185, "mw_forward", "failure");
                        return d("MWChatInteractionLog.bs").logFailUserFlow(c("qpl")._(25298392, "4881"), n, "ls_error")
                    });
                    return
            }
        }, [a, e, f, g, i])
    }

    function e() {
        var a = c("useReStore")(),
            b = d("MWPActor.react").useActor(),
            e = d("LSMessagingInitiatingSourceHook.bs").useHook(),
            f = c("useGetForwardSource")();
        return d("Int64Hooks").useMemoInt64(function() {
            return function(g, h, i) {
                d("ODS").bumpEntityKey(3185, "mw_forward", "send");
                i != null && d("MWChatInteractionLog.bs").logPointUserFlow(c("qpl")._(25298392, "4881"), i, "sending");
                var j = d("MWChatThreadId").getMessagingThreadType(g),
                    k = d("MWThread_DEPRECATED.bs").toThreadKey(g);
                c("promiseDone")(a.runInTransaction(function(a) {
                    return c("LSOptimisticSendAttachmentForward")(b, k, j, void 0, void 0, void 0, void 0, d("I64").of_string(h), f, e, c("LSFactory")(a))
                }, "readwrite"), function() {
                    d("ODS").bumpEntityKey(3185, "mw_forward", "success");
                    if (i != null) return d("MWChatInteractionLog.bs").logSuccessUserFlow(c("qpl")._(25298392, "4881"), i)
                }, function() {
                    i != null && d("MWChatInteractionLog.bs").logFailUserFlow(c("qpl")._(25298392, "4881"), i, "ls_error"), d("ODS").bumpEntityKey(3185, "mw_forward", "failure")
                })
            }
        }, [a, b, e, f])
    }
    g.useForwardMessage = a;
    g.useForwardAttachment = e
}), 98);
__d("MWV2ForwardMessage.bs", ["$InternalEnum", "FBLogger", "I64", "Int64Hooks", "LSMessagingThreadTypeUtil", "MAWDbMsg", "MAWThreadId", "MAWVerifyThreadCutover", "MWChatMessageId", "MWLSForwardMessage.bs", "MWPActor.react", "MWQPLMarkers", "MWThread_DEPRECATED.bs", "Promise", "ReQL", "ReQLSuspense", "asyncToGeneratorRuntime", "cr:282", "cr:338", "cr:4950", "cr:6938", "unrecoverableViolation", "useGetForwardSource", "useReStore", "useSendToSentLogging"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function h(a, b) {
        var c = b.threadKey;
        return d("ReQLSuspense").useFirstExn(function() {
            return d("ReQL").fromTableAscending(a.table("threads")).getKeyRange(c)
        }, [a, c], f.id + ":53")
    }

    function i(a, b) {
        return d("ReQL").firstAsync(d("ReQL").fromTableAscending(a.table("threads")).getKeyRange(b))
    }

    function j(a, b, c) {
        return d("ReQL").firstAsync(d("ReQL").mergeJoin(d("ReQL").fromTableAscending(a.table("participants")).getKeyRange(b), d("ReQL").fromTableAscending(a.table("contacts"))).filter(function(a) {
            a[0];
            a = a[1];
            return !d("I64").equal(a.id, c)
        }))
    }

    function k(a, b) {
        var c = b.messageId,
            e = b.threadKey;
        return d("ReQLSuspense").useFirst(function() {
            return d("ReQL").fromTableAscending(a.table("attachments")).getKeyRange(e, c)
        }, [a, c, e], f.id + ":82")
    }
    var l = b("$InternalEnum")({
        SecureToOpen: "secure_to_open",
        SecureToSecure: "secure_to_secure"
    });

    function a(a) {
        var e = c("useReStore")(),
            f = h(e, a),
            g = k(e, a),
            m = d("LSMessagingThreadTypeUtil").isSecure(f.threadType),
            n = d("MWPActor.react").useActor(),
            o = !d("I64").equal(n, a.senderId),
            p = d("MWLSForwardMessage.bs").useForwardMessage(),
            q = c("useGetForwardSource")(),
            r = d("MWChatMessageId").makeSent(d("I64").to_string(a.threadKey), a.messageId, d("I64").to_string(a.timestampMs)),
            s = c("useSendToSentLogging")({
                attachment_type: "forward",
                message_type: "forward"
            }),
            t = d("Int64Hooks").useCallbackInt64(function() {
                var f = b("asyncToGeneratorRuntime").asyncToGenerator(function*(f) {
                    var h = d("MWThread_DEPRECATED.bs").toThreadKey(f),
                        k = (yield d("MAWVerifyThreadCutover").verifyThreadCutover(b("Promise").resolve(e), h)),
                        p = s({
                            isCutover: k,
                            isSecure: m,
                            targetID: f.VAL
                        }, a.messageId + "-" + f.VAL, q),
                        r = p.addMetadata,
                        t = p.endFailure;
                    p = p.s2sInstanceKey;
                    h = (yield b("Promise").all([d("MAWThreadId").isSecureThreadId(e, h), i(e, h), j(e, h, n)]));
                    var u = h[0],
                        v = h[1];
                    h = h[2];
                    u = u || k;
                    try {
                        if (b("cr:6938") != null && !u) {
                            r == null ? void 0 : r("forward_type", l.SecureToOpen);
                            return b("cr:6938").forwardMessage(e, f, a, o, g, n, q)
                        }
                        k = d("MAWDbMsg").toMsgId(a.messageId);
                        if (k == null) throw c("unrecoverableViolation")("Message does not have an id", "messenger_web_product");
                        if (b("cr:338") != null) {
                            r == null ? void 0 : r("forward_type", l.SecureToSecure);
                            if (b("cr:282") != null && v != null) {
                                b("cr:338").forwardMessage(e, f, k, q, (u = p) != null ? u : void 0);
                                return b("cr:282").call(e, n, v, h, d("LSMessagingThreadTypeUtil").isOneToOne(v.threadType))
                            }
                            return b("cr:338").forwardMessage(e, f, k, q, (r = p) != null ? r : void 0)
                        }
                        throw c("unrecoverableViolation")("We won't reach to this step, if you are in QE, you should use secure forward", "messenger_web_product")
                    } catch (a) {
                        t == null ? void 0 : t(d("MWQPLMarkers").MESSAGE_SEND_TO_SENT.FAIL_FORWARDING_MESSAGE, a.name + ": " + a.message);
                        c("FBLogger")("messenger_e2ee_web").catching(a).mustfix("MW Fail forwarding a message");
                        throw a
                    }
                });
                return function(a) {
                    return f.apply(this, arguments)
                }
            }(), [e, n, a, o, g, q, m, s]),
            u = d("Int64Hooks").useCallbackInt64(function() {
                var c = b("asyncToGeneratorRuntime").asyncToGenerator(function*(c) {
                    var h = d("MWThread_DEPRECATED.bs").toThreadKey(c);
                    h = (yield b("Promise").all([d("MAWThreadId").isSecureThreadId(e, h), i(e, h), j(e, h, n), d("MAWVerifyThreadCutover").verifyThreadCutover(b("Promise").resolve(e), h)]));
                    var k = h[0],
                        l = h[1],
                        m = h[2];
                    h = h[3];
                    k = k || h;
                    if (b("cr:4950") != null && k)
                        if (b("cr:282") != null && l != null) {
                            b("cr:4950").forwardMessage(e, c, f, a, o, g, q);
                            return b("cr:282").call(e, n, l, m, d("LSMessagingThreadTypeUtil").isOneToOne(l.threadType))
                        } else return b("cr:4950").forwardMessage(e, c, f, a, o, g, q);
                    return p(c, r)
                });
                return function(a) {
                    return c.apply(this, arguments)
                }
            }(), [e, p, o, g, a, r, n, q, f]);
        return d("Int64Hooks").useMemoInt64(function() {
            return m ? t : u
        }, [m, t, u])
    }
    g.useForwardMessage = a
}), 98);
__d("IGDMessageForwardButton.react", ["fbt", "CometLazyDialogTrigger.react", "IGDContactSearchDialogType.flow", "IGDSButton.react", "IGDSDialogPlaceholder.react", "JSResourceForInteraction", "MWV2ForwardMessage.bs", "Promise", "asyncToGeneratorRuntime", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = c("JSResourceForInteraction")("IGDAWOminipickerDialog.react").__setRef("IGDMessageForwardButton.react");

    function k(a) {
        switch (a.type) {
            case "thread":
                return {
                    NAME: "Group", VAL: a.candidate.id
                };
            case "user":
                return {
                    NAME: "User", VAL: a.candidate.id
                }
        }
    }

    function a(a) {
        a = a.message;
        var e = d("MWV2ForwardMessage.bs").useForwardMessage(a);
        a = function() {
            var a = b("asyncToGeneratorRuntime").asyncToGenerator(function*(a) {
                a = Array.from(a.values()).map(function(a) {
                    return e(k(a))
                });
                yield b("Promise").allSettled(a)
            });
            return function(b) {
                return a.apply(this, arguments)
            }
        }();
        return i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: {
                includeGroup: !0,
                maxRecipients: 5,
                onSubmit: a,
                searchType: d("IGDContactSearchDialogType.flow").IGDContactSearchDialogType.FORWARD_MESSAGE,
                submitButtonLabel: h._("__JHASH__Mg5C78xztSX__JHASH__").toString(),
                titleLabel: h._("__JHASH__vSmnaQ11N0G__JHASH__").toString()
            },
            dialogResource: j,
            fallback: function(a) {
                return i.jsx(c("IGDSDialogPlaceholder.react"), {
                    fixedHeight: !0,
                    onClose: a,
                    size: "large"
                })
            },
            children: function(a) {
                return i.jsx(c("IGDSButton.react"), {
                    "data-testid": void 0,
                    display: "block",
                    label: h._("__JHASH__YherSGbeO3h__JHASH__"),
                    onClick: a,
                    role: "menuitem",
                    variant: "white_link"
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDMessageReportButton.react", ["fbt", "CometLazyDialogTrigger.react", "IGDSButton.react", "MWPActor.react", "promiseDone", "react", "requireDeferred", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = c("requireDeferred")("MWLogMessageAction").__setRef("IGDMessageReportButton.react");

    function a(a) {
        var b = a.dialogProps,
            e = a.dialogResource,
            f = a.message,
            g = a.setReportDialogOpen,
            k = d("MWPActor.react").useActor(),
            l = c("useReStore")(),
            m = h._("__JHASH__iy-oX7MfwVR__JHASH__");
        return i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: b,
            dialogResource: e,
            children: function(a) {
                return i.jsx(c("IGDSButton.react"), {
                    "data-testid": void 0,
                    display: "block",
                    label: m,
                    onClick: function() {
                        g(!0), a(), j.onReady(function(a) {
                            return c("promiseDone")(a.log(l, f.messageId, f.threadKey, "message_dot_menu", "report", void 0, void 0, void 0, f.senderId, void 0, k))
                        })
                    },
                    role: "menuitem",
                    variant: "white_link"
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDMessageUnsendButton.react", ["fbt", "CometLazyDialogTrigger.react", "IGDSButton.react", "JSResourceForInteraction", "PolarisDirectLogger", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = c("JSResourceForInteraction")("IGDMessageUnsendDialog.react").__setRef("IGDMessageUnsendButton.react");

    function a(a) {
        var b = a.message,
            e = a.setUnsendDialogOpen,
            f = h._("__JHASH__H8A15z0PXSW__JHASH__");
        return i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: {
                message: b,
                onClose: function() {
                    return e(!1)
                }
            },
            dialogResource: j,
            children: function(a) {
                return i.jsx(c("IGDSButton.react"), {
                    "data-testid": void 0,
                    display: "block",
                    label: f,
                    onClick: function() {
                        a(), e(!0), d("PolarisDirectLogger").DirectLogger.logDirectEvent("DirectThread", "direct_delete_message_attempt")
                    },
                    role: "menuitem",
                    variant: "white_link"
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("useIGDBroadcastChannelImpressionLoggerWithCheck", ["MWCMThreadTypes.react", "promiseDone", "react", "useIGDBroadcastChannelLogger", "useSinglePartialViewImpression"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a(a, b, e) {
        var f = c("useIGDBroadcastChannelLogger")(a);
        a = h(function() {
            b != null && d("MWCMThreadTypes.react").isIGBroadcastChannelThread(b) && c("promiseDone")(f(e))
        }, [b, f, e]);
        return c("useSinglePartialViewImpression")({
            onImpressionStart: a
        })
    }
    g["default"] = a
}), 98);
__d("IGDMessageMoreMenuPopover.react", ["BaseTheme.react", "CometPopover.react", "FocusGroup.react", "I64", "IGDBroadcastChannelLoggingShapes", "IGDMessageCopyButton.react", "IGDMessageForwardButton.react", "IGDMessageReportButton.react", "IGDMessageUnsendButton.react", "JSResourceForInteraction", "LSMediaUrl.bs", "MWPActor.react", "PolarisDirectLogger", "ReQL", "ReQLSuspense", "focusScopeQueries", "qex", "react", "useIGDBroadcastChannelImpressionLoggerWithCheck", "usePolarisAnalyticsContext", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = {
        "card-background": "black"
    };
    e = {
        "card-background": "black"
    };
    var i = {
        dark: e,
        light: b,
        type: "VARIABLES"
    };
    e = d("FocusGroup.react").createFocusGroup(d("focusScopeQueries").tabbableScopeQuery);
    var j = e[0],
        k = e[1];

    function a(a) {
        var b = a.isCopyable,
            e = a.isForwardable,
            g = a.isGroup,
            l = a.isMessageRequest,
            m = a.isReportable,
            n = a.isSecure,
            o = a.isUnsendable,
            p = a.message,
            q = a.onClose,
            r = a.setReportDialogOpen,
            s = a.setUnsendDialogOpen;
        a = a.threadSubType;
        var t = d("MWPActor.react").useActor(),
            u = c("useReStore")();
        e = e && !l ? h.jsx(k, {
            children: h.jsx("div", {
                className: "x1e558r4 x150jy0e",
                role: "none",
                children: h.jsx(c("IGDMessageForwardButton.react"), {
                    message: p
                })
            })
        }) : null;
        b = b ? h.jsx(k, {
            children: h.jsx("div", {
                className: "x1e558r4 x150jy0e",
                role: "none",
                children: h.jsx(c("IGDMessageCopyButton.react"), {
                    message: p,
                    onClose: q
                })
            })
        }) : null;
        q = c("useIGDBroadcastChannelImpressionLoggerWithCheck")(p.threadKey, a, d("IGDBroadcastChannelLoggingShapes").MESSAGE_OPTIONS_RENDERED_SHAPE);
        d("PolarisDirectLogger").DirectLogger.logDirectEvent("DirectMessageOptionsDialogDesktop", "direct_tooltip_options_click");
        a = d("ReQLSuspense").useFirst(function() {
            return d("ReQL").fromTableAscending(u.table("contacts")).getKeyRange(p.senderId)
        }, [u, p.senderId], f.id + ":122");
        var v = d("ReQLSuspense").useFirst(function() {
                return d("ReQL").fromTableAscending(u.table("ig_thread_info")).getKeyRange(p.threadKey)
            }, [u, p.threadKey], f.id + ":129"),
            w = d("ReQLSuspense").useFirst(function() {
                return d("ReQL").fromTableAscending(u.table("mailbox_metadata")).getKeyRange(t)
            }, [u, t], f.id + ":136"),
            x = c("usePolarisAnalyticsContext")() + "WWW",
            y = null;
        if (w && m && a) {
            var z;
            a = {
                onClose: function() {
                    r(!1)
                },
                profilePicUrl: d("LSMediaUrl.bs").Contact.profilePictureUrl(a),
                senderId: d("I64").to_string(p.senderId),
                username: (m = a.secondaryName) != null ? m : ""
            };
            m = (m = c("qex")._("673")) != null ? m : !1;
            z = (z = c("qex")._("676")) != null ? z : !1;
            n && m ? y = h.jsx(k, {
                children: h.jsx("div", {
                    className: "x1e558r4 x150jy0e",
                    children: h.jsx(c("IGDMessageReportButton.react"), {
                        dialogProps: babelHelpers["extends"]({}, a, {
                            isGroup: g,
                            messageId: p.messageId,
                            threadId: d("I64").to_string(p.threadKey)
                        }),
                        dialogResource: c("JSResourceForInteraction")("PolarisDirectReportingEncryptedMessageModal").__setRef("IGDMessageMoreMenuPopover.react"),
                        message: p,
                        setReportDialogOpen: r
                    })
                })
            }) : v && z && (y = h.jsx(k, {
                children: h.jsx("div", {
                    className: "x1e558r4 x150jy0e",
                    children: h.jsx(c("IGDMessageReportButton.react"), {
                        dialogProps: babelHelpers["extends"]({}, a, {
                            containerModule: x,
                            isGroup: g,
                            messageInfo: {
                                fbMessageId: p.messageId,
                                mailboxId: d("I64").to_string(w.id)
                            },
                            threadId: v.igThreadId
                        }),
                        dialogResource: c("JSResourceForInteraction")("PolarisDirectReportingMessageModal").__setRef("IGDMessageMoreMenuPopover.react"),
                        message: p,
                        setReportDialogOpen: r
                    })
                })
            }))
        }
        n = o && !l ? h.jsx(k, {
            children: h.jsx("div", {
                className: "x1e558r4 x150jy0e",
                role: "none",
                children: h.jsx(c("IGDMessageUnsendButton.react"), {
                    message: p,
                    setUnsendDialogOpen: s
                })
            })
        }) : null;
        return h.jsx(c("BaseTheme.react"), {
            config: i,
            children: h.jsx(c("CometPopover.react"), {
                withArrow: !0,
                children: h.jsx(j, {
                    orientation: "horizontal",
                    children: h.jsxs("div", {
                        className: "x78zum5 x1f6kntn x1y1aw1k x1sxyh0 xwib8y2 xurb0ha",
                        ref: q,
                        role: "menu",
                        children: [e, b, n, y]
                    })
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("MWChatMessageUnreadIndicator.react", ["fbt", "MDSRow.react", "MDSRowItem.react", "MWXText.react", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            line: {
                backgroundColor: "x1iuwi03",
                flexGrow: "x1iyjqo2",
                height: "xjm9jq1",
                $$css: !0
            }
        };

    function a() {
        var a = h._("__JHASH__dAK4xN4bf5e__JHASH__");
        return i.jsxs(c("MDSRow.react"), {
            "aria-label": a,
            paddingVertical: 12,
            spacingVertical: 0,
            children: [i.jsx(c("MDSRowItem.react"), {
                verticalAlign: "center",
                xstyle: j.line,
                children: i.jsx(i.Fragment, {})
            }), i.jsx(c("MDSRowItem.react"), {
                children: i.jsx(c("MWXText.react"), {
                    color: "secondary",
                    isSemanticHeading: !0,
                    type: "meta4",
                    children: a
                })
            }), i.jsx(c("MDSRowItem.react"), {
                verticalAlign: "center",
                xstyle: j.line,
                children: i.jsx(i.Fragment, {})
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWExtraPinnedMessagePadding.react", ["MWPMessageListColumn.react", "react", "useMWPIsMessagePinned"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        a = a.nextMessage;
        a = c("useMWPIsMessagePinned")(a);
        return a && h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnVerticalRhythm, {
            height: 6
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MDSForwardSvgIcon.react", ["MDSSvgIcon.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        return h.jsx(c("MDSSvgIcon.react"), babelHelpers["extends"]({}, a, {
            children: h.jsx("path", {
                clipRule: "evenodd",
                d: "M30.22 19.497l-10.5 7.198c-1.163.797-2.722-.06-2.722-1.497v-3.204H8.001A2 2 0 016 19.996v-3.997A2 2 0 018 14h8.998v-3.198c0-1.437 1.559-2.294 2.722-1.497l10.5 7.197c1.04.713 1.04 2.283 0 2.995z",
                fillRule: "evenodd"
            })
        }))
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWForwardedContent.react", ["MDSForwardSvgIcon.react", "MWPForwardedContent.bs", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.message;
        a = a.outgoing;
        b = d("MWPForwardedContent.bs").useTitle(b, a);
        return h.jsxs("div", {
            className: "x6s0dn4 x78zum5 xg8j3zb x1nn3v0j",
            children: [h.jsx(c("MDSForwardSvgIcon.react"), {
                color: "tertiary",
                size: 16
            }), h.jsx("div", {
                className: "x12scifz x1pg5gke x1h0ha7o",
                children: b
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWPMessagePinnedText.react", ["fbt", "react", "useMWPIsMessagePinned"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");

    function a(a) {
        var b = a.divider;
        a = a.message;
        a = c("useMWPIsMessagePinned")(a);
        var d = h._("__JHASH__hknrqEeMk6h__JHASH__");
        return a && i.jsxs(i.Fragment, {
            children: [b != null && i.jsx("span", {
                className: "x1sdyfia",
                children: b
            }), i.jsx("span", {
                "aria-label": d,
                children: d
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWPinnedMessageDropdownButton.react", ["fbt", "ix", "JSResourceForInteraction", "MWXLazyPopoverTrigger.react", "TetraIcon.react", "fbicon", "react"], (function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = d("react"),
        k = c("JSResourceForInteraction")("MWPinnedMessageItemHoverDropdownMenu.react").__setRef("MWPinnedMessageDropdownButton.react");

    function a(a) {
        var b = a.hidden;
        a = a.message;
        return !b && j.jsx("div", {
            className: "x1a87ojn x10l6tqk xwa60dl",
            children: j.jsx(c("MWXLazyPopoverTrigger.react"), {
                popoverProps: {
                    message: a
                },
                popoverResource: k,
                children: function(a, b) {
                    return j.jsx(c("TetraIcon.react"), {
                        "aria-label": h._("__JHASH__2-Q8CjJAjMD__JHASH__"),
                        color: "secondary",
                        icon: d("fbicon")._(i("484386"), 16),
                        onPress: b,
                        ref: a
                    })
                }
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MDSPinnedMessageIcon.react", ["MDSSvgIcon.react", "react", "useUniqueID"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = c("useUniqueID")(),
            d = c("useUniqueID")(),
            e = c("useUniqueID")(),
            f = c("useUniqueID")();
        return h.jsxs(c("MDSSvgIcon.react"), babelHelpers["extends"]({}, a, {
            children: [h.jsx("g", {
                filter: "url(#" + b + ")",
                children: h.jsx("rect", {
                    fill: "url(#" + d + ")",
                    height: "2",
                    width: "8",
                    x: "17",
                    y: "26"
                })
            }), h.jsx("path", {
                d: "M23.9989 27.5928L23.9988 27.5383L24.0367 27.585C24.1817 27.7518 24.7409 28.2715 25.8875 27.9427C26.9382 27.6414 26.5281 26.8227 26.371 26.5705C26.3138 26.4819 26.2525 26.3965 26.1873 26.3135L16.8703 14.3899C16.2845 15.045 15.5884 15.6539 14.8084 16.0737L23.9989 27.5928Z",
                fill: "url(#" + e + ")"
            }), h.jsx("path", {
                d: "M11.5653 17.1305C15.7434 17.1305 19.1305 13.7434 19.1305 9.56526C19.1305 5.38708 15.7434 2 11.5653 2C7.38708 2 4 5.38708 4 9.56526C4 13.7434 7.38708 17.1305 11.5653 17.1305Z",
                fill: "#FF0D0D"
            }), h.jsx("path", {
                d: "M9.19306 12.5345C6.38338 10.2164 5.72669 6.37369 7.72578 3.95078C9.72486 1.52787 13.6231 1.44245 16.432 3.76062C19.2417 6.07879 19.8984 9.92145 17.8993 12.3444C15.9002 14.7673 12.0019 14.8519 9.19306 12.5345Z",
                fill: "url(#" + f + ")"
            }), h.jsxs("defs", {
                children: [h.jsxs("filter", {
                    colorInterpolationFilters: "sRGB",
                    filterUnits: "userSpaceOnUse",
                    height: "2.8",
                    id: b,
                    width: "8.8",
                    x: "16.6",
                    y: "25.6",
                    children: [h.jsx("feFlood", {
                        floodOpacity: "0",
                        result: "BackgroundImageFix"
                    }), h.jsx("feBlend", {
                        "in": "SourceGraphic",
                        in2: "BackgroundImageFix",
                        mode: "normal",
                        result: "shape"
                    }), h.jsx("feGaussianBlur", {
                        result: "effect1_foregroundBlur_28_51",
                        stdDeviation: "0.2"
                    })]
                }), h.jsxs("linearGradient", {
                    gradientUnits: "userSpaceOnUse",
                    id: d,
                    x1: "25",
                    x2: "17.6667",
                    y1: "27",
                    y2: "27",
                    children: [h.jsx("stop", {
                        stopColor: "#969495"
                    }), h.jsx("stop", {
                        offset: "1",
                        stopColor: "#D9D9D9",
                        stopOpacity: "0"
                    })]
                }), h.jsxs("linearGradient", {
                    gradientUnits: "userSpaceOnUse",
                    id: e,
                    x1: "20.4956",
                    x2: "21.941",
                    y1: "22.4135",
                    y2: "21.2698",
                    children: [h.jsx("stop", {
                        stopColor: "#666666"
                    }), h.jsx("stop", {
                        offset: "1",
                        stopColor: "#CACCCD"
                    })]
                }), h.jsxs("radialGradient", {
                    cx: "0",
                    cy: "0",
                    gradientTransform: "translate(12.8132 8.1471) rotate(129.523) scale(5.68739 6.59482)",
                    gradientUnits: "userSpaceOnUse",
                    id: f,
                    r: "1",
                    children: [h.jsx("stop", {
                        stopColor: "white",
                        stopOpacity: "0.5"
                    }), h.jsx("stop", {
                        offset: "1",
                        stopColor: "white",
                        stopOpacity: "0"
                    })]
                })]
            })]
        }))
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("usePinnedIconAnimation", ["react", "useDebouncedValue"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useEffect,
        i = b.useRef,
        j = b.useState,
        k = {
            mountAnimationIncoming: {
                animationDuration: "x5hsz1j",
                animationName: "x1ko8byu",
                animationTimingFunction: "x4hg4is",
                $$css: !0
            },
            mountAnimationOutgoing: {
                animationDuration: "x5hsz1j",
                animationName: "x1c78tyx",
                animationTimingFunction: "x4hg4is",
                $$css: !0
            },
            unmountAnimation: {
                animationDuration: "x5hsz1j",
                animationFillMode: "x10e4vud",
                animationName: "xvma63k",
                animationTimingFunction: "x4hg4is",
                $$css: !0
            }
        };

    function a(a, b) {
        var d = j(!1),
            e = d[0],
            f = d[1],
            g = i(a);
        d = b ? k.mountAnimationOutgoing : k.mountAnimationIncoming;
        h(function() {
            a !== g.current && f(!0), g.current = a
        }, [a]);
        return {
            mountAnimation: e ? d : null,
            shouldShow: c("useDebouncedValue")(a, 200),
            unmountAnimation: k.unmountAnimation
        }
    }
    g["default"] = a
}), 98);
__d("MWPinnedMessageOverlay.react", ["MDSPinnedMessageIcon.react", "react", "stylex", "useMWPIsMessagePinned", "usePinnedIconAnimation"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            alignEnd: {
                end: "xds687c",
                transform: "x7b9nwf",
                $$css: !0
            },
            alignStart: {
                start: "x17qophe",
                transform: "x1op1vkj",
                $$css: !0
            },
            container: {
                position: "x10l6tqk",
                top: "x13vifvy",
                zIndex: "xhtitgo",
                $$css: !0
            },
            relative: {
                position: "x1n2onr6",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.alreadyRenderedPin,
            d = a.children,
            e = a.message;
        a = a.outgoing;
        e = c("useMWPIsMessagePinned")(e);
        var f = c("usePinnedIconAnimation")(e, a),
            g = f.mountAnimation,
            j = f.shouldShow;
        f = f.unmountAnimation;
        return !j || b ? h.jsx(h.Fragment, {
            children: d
        }) : d && h.jsxs("div", {
            className: "x1n2onr6",
            children: [h.jsx("div", {
                className: c("stylex")([i.container, a ? i.alignEnd : i.alignStart, e ? g : f]),
                children: h.jsx(c("MDSPinnedMessageIcon.react"), {
                    color: "tertiary",
                    size: 16
                })
            }), d]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("useMWIsXMARoom", ["ReQL", "ReQLSuspense", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        var b = c("useReStore")(),
            e = d("ReQLSuspense").useFirst(function() {
                return d("ReQL").fromTableAscending(b.table("attachments")).getKeyRange(a.threadKey, a.messageId)
            }, [b, a], f.id + ":25");
        return (e == null ? void 0 : e.defaultCtaType) === "xma_web_url" && (e == null ? void 0 : e.attachmentLoggingType) === "xma_open_native_rooms_invite"
    }
    g["default"] = a
}), 98);
__d("MWPinnedMessageRowFooterNUXWrapperRequireNUX.react", ["nux:344", "react", "useMWIsXMARoom", "withCometPlaceholder"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = function() {
            return b("nux:344") == null ? void 0 : b("nux:344")("WEB_MSGR_PINNED_MESSAGES_NUX")
        };

    function a(a) {
        var b = a.isLastMessage,
            d = a.isOutgoing,
            e = a.isPinnedMessageList;
        a = a.message;
        var f = a.textHasLinks;
        a = c("useMWIsXMARoom")(a);
        d = !d && (f || a) && b && !e;
        return !d ? null : h.jsx(i, {})
    }
    a.displayName = a.name + " [from " + f.id + "]";
    e = d("withCometPlaceholder").withCometPlaceholder(a);
    g["default"] = e
}), 98);
__d("MWRepliesGIF.react", ["fbt", "CometPlaceholder.react", "I64", "LSMediaUrl.bs", "MWRepliesImage.react", "MWV2ReplyTo.bs", "ReQL", "ReQLSuspense", "cr:6426", "react", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            italic: {
                fontStyle: "x1k4tb9n",
                $$css: !0
            }
        };

    function k(a) {
        var e = a.isSecureMessage;
        e = e === void 0 ? !1 : e;
        var g = a.message;
        a = a.outgoing;
        var k = c("useReStore")(),
            l = d("ReQLSuspense").useFirst(function() {
                var a, b;
                a = (a = g.replyAttachmentId) != null ? a : d("I64").zero;
                b = (b = g.replySourceId) != null ? b : "";
                return d("ReQL").fromTableAscending(k.table("attachments")).getKeyRange(g.threadKey, b, d("I64").to_string(a))
            }, [k, g], f.id + ":48"),
            m;
        l != null && (b("cr:6426") == null || !e ? m = d("LSMediaUrl.bs").Attachment.previewUrl(l) : m = b("cr:6426").getAttachmentBlobNonOptional(l.attachmentFbid));
        if (m != null && m !== "") return i.jsx(c("MWRepliesImage.react"), {
            height: g.replyMediaPreviewHeight,
            outgoing: a,
            src: m,
            width: g.replyMediaPreviewWidth
        });
        else return i.jsx(d("MWV2ReplyTo.bs").make, {
            outgoing: a,
            xstyle: j.italic,
            children: h._("__JHASH__kPmtZiB6viN__JHASH__")
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function a(a) {
        return i.jsx(c("CometPlaceholder.react"), {
            fallback: null,
            children: i.jsx(k, babelHelpers["extends"]({}, a))
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWRepliesMedia.react", ["fbt", "ix", "CometIcon.react", "CometPlaceholder.react", "I64", "IconSource", "LSMediaUrl.bs", "MWRepliesImage.react", "MWV2ReplyTo.bs", "ReQL", "ReQLSuspense", "WAArmadilloXMA.pb", "cr:6426", "react", "useReStore"], (function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = d("react"),
        k = {
            FBIcon: {
                marginTop: "x14vqqas",
                marginEnd: "xq8finb",
                marginBottom: "xod5an3",
                marginStart: "x16n37ib",
                $$css: !0
            },
            italic: {
                fontStyle: "x1k4tb9n",
                $$css: !0
            },
            postBackground: {
                alignItems: "x6s0dn4",
                backdropFilter: "x99fzhk",
                background: "x18aeczl",
                borderTopStartRadius: "x1tlxs6b",
                borderTopEndRadius: "x1g8br2z",
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                height: "xpyat2d",
                justifyContent: "xl56j7k",
                textAlign: "x2b8uid",
                width: "x1exxlbk",
                $$css: !0
            },
            storyBackground: {
                alignItems: "x6s0dn4",
                backdropFilter: "x1qb2erx",
                background: "xjw5052",
                borderTopStartRadius: "xyi19xy",
                borderTopEndRadius: "x1ccrb07",
                borderBottomEndRadius: "xtf3nb5",
                borderBottomStartRadius: "x1pc53ja",
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                height: "x1wkxgih",
                justifyContent: "xl56j7k",
                opacity: "x197sbye",
                textAlign: "x2b8uid",
                width: "xni59qk",
                $$css: !0
            }
        };

    function l(a) {
        var e = a.isSecureMessage,
            g = a.message;
        a = a.outgoing;
        var l = h._("__JHASH__bznTdd53oJN__JHASH__"),
            m = c("useReStore")(),
            n = d("ReQLSuspense").useFirst(function() {
                var a = g.replyAttachmentId,
                    b = g.replySourceId;
                return b != null && a != null ? d("ReQL").fromTableAscending(m.table("attachments")).getKeyRange(g.threadKey, b, d("I64").to_string(a)) : d("ReQL").empty()
            }, [m, g], f.id + ":86"),
            o = n != null && n.hasXma && e && n.gatingType === String(d("WAArmadilloXMA.pb").EXTENDED_CONTENT_MESSAGE_OVERLAY_ICON_GLYPH.PRIVATE);
        if (n != null && n.hasXma && e) {
            var p;
            p = (p = n.defaultCtaType) != null ? p : ""
        } else p = "";
        var q = new(c("IconSource"))("FB", i("1423124"), 28);
        if (o)
            if (p === "xma_montage_share") return j.jsx("div", {
                className: "x6s0dn4 x1qb2erx xjw5052 xyi19xy x1ccrb07 xtf3nb5 x1pc53ja x78zum5 xdt5ytf x1wkxgih xl56j7k x197sbye x2b8uid xni59qk",
                children: j.jsx("div", {
                    className: "x14vqqas xq8finb xod5an3 x16n37ib",
                    children: j.jsx(c("CometIcon.react"), {
                        icon: q
                    })
                })
            });
            else return j.jsx("div", {
                className: "x6s0dn4 x99fzhk x18aeczl x1tlxs6b x1g8br2z x1gn5b1j x230xth x78zum5 xdt5ytf xpyat2d xl56j7k x2b8uid x1exxlbk",
                children: j.jsx("div", {
                    className: "x14vqqas xq8finb xod5an3 x16n37ib",
                    children: j.jsx(c("CometIcon.react"), {
                        icon: q
                    })
                })
            });
        o = b("cr:6426") != null && e ? function(a) {
            return n != null && n.hasXma ? a.replyAttachmentId != null ? b("cr:6426").getInfoUrlXMA(n, "preview") : void 0 : a.replyAttachmentId != null ? b("cr:6426").getAttachmentBlobNonOptional(d("I64").to_string(a.replyAttachmentId)) : void 0
        } : d("LSMediaUrl.bs").Message.replyMediaUrl;
        p = o(g);
        return p != null && p !== "" ? j.jsx(c("MWRepliesImage.react"), {
            height: g.replyMediaPreviewHeight,
            outgoing: a,
            src: p,
            width: g.replyMediaPreviewWidth
        }) : j.jsx(d("MWV2ReplyTo.bs").make, {
            outgoing: a,
            xstyle: k.italic,
            children: l
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.isSecureMessage;
        b = b === void 0 ? !1 : b;
        var d = a.message;
        a = a.outgoing;
        return j.jsx(c("CometPlaceholder.react"), {
            fallback: null,
            children: j.jsx(l, {
                isSecureMessage: b,
                message: d,
                outgoing: a
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWRepliesRollcallContribution.react", ["fbt", "CometBlurredBackgroundImage.react", "CometImageCover.react", "CometPlaceholder.react", "I64", "LSMediaUrl.bs", "MWV2ReplyTo.bs", "ReQL", "ReQLSuspense", "isStringNullOrEmpty", "react", "stylex", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = 213,
        k = 213,
        l = {
            blurredImage: {
                borderBottomStartRadius: "x230xth",
                borderTopStartRadius: "x1tlxs6b",
                borderTopEndRadius: "x1g8br2z",
                borderBottomEndRadius: "x1gn5b1j",
                $$css: !0
            },
            italic: {
                fontStyle: "x1k4tb9n",
                $$css: !0
            },
            outgoing: {
                borderBottomEndRadius: "xrt01vj",
                borderBottomStartRadius: "x230xth",
                $$css: !0
            },
            unblurredImageContainer: {
                borderBottomStartRadius: "x230xth",
                borderTopStartRadius: "x1tlxs6b",
                borderTopEndRadius: "x1g8br2z",
                borderBottomEndRadius: "x1gn5b1j",
                opacity: "x197sbye",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                $$css: !0
            }
        };

    function a(a) {
        return i.jsx(c("CometPlaceholder.react"), {
            fallback: null,
            children: i.jsx(m, babelHelpers["extends"]({}, a))
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function m(a) {
        var b, e = a.message;
        a = a.outgoing;
        var g = h._("__JHASH__-iobVkYmlUt__JHASH__"),
            m = c("useReStore")(),
            n = d("I64").of_string((b = e.replyAttachmentExtra) != null ? b : "0");
        b = d("ReQLSuspense").useFirst(function() {
            return d("ReQL").fromTableAscending(m.table("roll_calls")).getKeyRange(n)
        }, [m, n], f.id + ":71");
        b = (b = b == null ? void 0 : b.isBlurred) != null ? b : !0;
        var o = d("LSMediaUrl.bs").Message.replyMediaUrl(e),
            p = e.replyMediaPreviewHeight != null ? d("I64").to_float(e.replyMediaPreviewHeight) : 0;
        e = e.replyMediaPreviewWidth != null ? d("I64").to_float(e.replyMediaPreviewWidth) : 0;
        var q = Math.min(1, j / p),
            r = Math.min(1, k / e);
        p = Math.round(p * Math.min(q, r));
        e = Math.round(e * Math.min(q, r));
        return !c("isStringNullOrEmpty")(o) ? b ? i.jsx("div", {
            style: {
                height: p,
                width: e
            },
            children: i.jsx(c("CometBlurredBackgroundImage.react"), {
                src: o,
                xstyle: [l.blurredImage, a && l.outgoing]
            })
        }) : i.jsx("div", {
            className: c("stylex")([l.unblurredImageContainer, a && l.outgoing]),
            style: {
                height: p,
                width: e
            },
            children: i.jsx(c("CometImageCover.react"), {
                alt: "",
                src: o
            })
        }) : i.jsx(d("MWV2ReplyTo.bs").make, {
            outgoing: a,
            xstyle: l.italic,
            children: g
        })
    }
    m.displayName = m.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWRepliesText.react", ["CometTextWithEntities.react", "MWChatTextFormatting", "MWChatTextTransform", "MWV2ReplyTo.bs", "cr:2472", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useMemo;

    function a(a) {
        var e = a.outgoing,
            f = a.text;
        a = i(function() {
            return {
                MessengerTextFormatting: [d("MWChatTextFormatting").replyRenderer]
            }
        }, []);
        var g = i(function() {
                return d("MWChatTextFormatting").getFormattingRanges(f)
            }, [f]),
            j = b("cr:2472") == null ? f : b("cr:2472").unvault(f);
        return h.jsx(d("MWV2ReplyTo.bs").make, {
            outgoing: e,
            children: h.jsx("div", {
                className: "xi81zsa x126k92a",
                children: h.jsx(c("CometTextWithEntities.react"), {
                    maxLength: 120,
                    maxLines: 3,
                    ranges: g,
                    renderers: a,
                    text: j,
                    transforms: d("MWChatTextTransform").epdTextTransformsNoVault,
                    truncationStyle: "ellipsis-only",
                    withParagraphs: !1
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWRepliesUnavailable.react", ["fbt", "MWV2ReplyTo.bs", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            root: {
                fontStyle: "x1k4tb9n",
                $$css: !0
            }
        };

    function a(a) {
        a = a.outgoing;
        var b = h._("__JHASH__3TzRhHHRgwV__JHASH__");
        return i.jsx(d("MWV2ReplyTo.bs").make, {
            outgoing: a,
            xstyle: j.root,
            children: b
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWRepliesVideo.react", ["fbt", "ix", "CometImage.react", "CometPlaceholder.react", "I64", "LSMediaUrl.bs", "MWLSThreadDisplayContext", "MWPStableImage.bs", "MWV2ReplyTo.bs", "ReQL", "ReQLSuspense", "cr:6426", "react", "useReStore"], (function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = d("react"),
        k = {
            italic: {
                fontStyle: "x1k4tb9n",
                $$css: !0
            },
            playButtonContainer: {
                alignItems: "x6s0dn4",
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                height: "x5yr21d",
                justifyContent: "xl56j7k",
                position: "x10l6tqk",
                start: "x17qophe",
                top: "x13vifvy",
                width: "xh8yej3",
                $$css: !0
            },
            thumbnail: {
                borderTopStartRadius: "x1tlxs6b",
                borderTopEndRadius: "x1g8br2z",
                borderBottomEndRadius: "x1gn5b1j",
                borderBottomStartRadius: "x230xth",
                filter: "xin470k",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                $$css: !0
            },
            thumbnailContainer: {
                position: "x1n2onr6",
                $$css: !0
            }
        };

    function l(a) {
        var e = a.isSecureMessage;
        e = e === void 0 ? !1 : e;
        var g = a.message;
        a = a.outgoing;
        var l = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        l = l === "ChatTab";
        var m = c("useReStore")(),
            n = d("ReQLSuspense").useFirst(function() {
                var a, b;
                a = (a = g.replyAttachmentId) != null ? a : d("I64").zero;
                b = (b = g.replySourceId) != null ? b : "";
                return d("ReQL").fromTableAscending(m.table("attachments")).getKeyRange(g.threadKey, b, d("I64").to_string(a))
            }, [m, g], f.id + ":73"),
            o;
        n != null && (b("cr:6426") == null || !e ? o = d("LSMediaUrl.bs").Attachment.previewUrl(n) : o = b("cr:6426").getAttachmentBlobNonOptional(n.attachmentFbid));
        if (o == null) return j.jsx(d("MWV2ReplyTo.bs").make, {
            outgoing: a,
            xstyle: k.italic,
            children: h._("__JHASH__7WGJ1daCkBD__JHASH__")
        });
        e = g.replyMediaPreviewHeight != null ? d("I64").to_float(g.replyMediaPreviewHeight) : void 0;
        a = g.replyMediaPreviewWidth != null ? d("I64").to_float(g.replyMediaPreviewWidth) : void 0;
        var p = 100;
        l = l ? 180 : 300;
        (n == null ? void 0 : n.previewUrlMimeType) != null ? n = j.jsx(d("MWPStableImage.bs").make, {
            alt: "",
            className: "x1tlxs6b x1g8br2z x1gn5b1j x230xth xin470k x6ikm8r x10wlt62",
            height: e,
            maxHeight: p,
            maxWidth: l,
            src: o,
            width: a
        }) : n = j.jsx("video", {
            alt: "",
            className: "x1tlxs6b x1g8br2z x1gn5b1j x230xth xin470k x6ikm8r x10wlt62",
            height: e != null && e > p ? "100%" : e,
            src: o,
            style: {
                maxHeight: p,
                maxWidth: l
            },
            width: a != null && a > l ? "100%" : a
        });
        return j.jsxs("div", {
            className: "x1n2onr6",
            children: [n, j.jsx("div", {
                className: "x6s0dn4 x78zum5 xdt5ytf x5yr21d xl56j7k x10l6tqk x17qophe x13vifvy xh8yej3",
                children: j.jsx(c("CometImage.react"), {
                    src: i("354763")
                })
            })]
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";

    function a(a) {
        return j.jsx(c("CometPlaceholder.react"), {
            fallback: null,
            children: j.jsx(l, babelHelpers["extends"]({}, a))
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWRepliedMessage.bs", ["MWPBaseRepliedMessage.bs", "MWRepliesAttachment.react", "MWRepliesExpired.react", "MWRepliesGIF.react", "MWRepliesMedia.react", "MWRepliesRemoved.react", "MWRepliesRollcallContribution.react", "MWRepliesSticker.react", "MWRepliesStory.react", "MWRepliesText.react", "MWRepliesUnavailable.react", "MWRepliesVideo.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.message,
            e = a.outgoing;
        a = a.isSecureMessage;
        a = a != null ? a : !1;
        return h.jsx(d("MWPBaseRepliedMessage.bs").make, {
            isSecureMessage: a,
            message: b,
            outgoing: e,
            renderAttachment: c("MWRepliesAttachment.react"),
            renderExpiredMessage: c("MWRepliesExpired.react"),
            renderGIF: c("MWRepliesGIF.react"),
            renderMedia: c("MWRepliesMedia.react"),
            renderRemovedMessage: c("MWRepliesRemoved.react"),
            renderRollcallContribution: c("MWRepliesRollcallContribution.react"),
            renderSticker: c("MWRepliesSticker.react"),
            renderStory: c("MWRepliesStory.react"),
            renderTextMessage: c("MWRepliesText.react"),
            renderUnavailableMessage: c("MWRepliesUnavailable.react"),
            renderVideo: c("MWRepliesVideo.react")
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("MDSReplySvgIcon.react", ["MDSSvgIcon.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        return h.jsx(c("MDSSvgIcon.react"), babelHelpers["extends"]({}, a, {
            children: h.jsx("path", {
                clipRule: "evenodd",
                d: "M18.005 24.4c0 1.278-1.336 2.04-2.334 1.332l-9.007-6.399c-.891-.633-.89-2.028 0-2.661l9.007-6.398c.998-.71 2.334.053 2.334 1.33l.001 3.397c7.14 0 11.997 3.226 11.998 10.987 0 .594-.411 1.012-1.033 1.012-.46 0-.845-.265-1.115-1.083-1.147-3.464-4.54-4.917-9.85-4.917v3.4z",
                fillRule: "evenodd"
            })
        }))
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("useMWIsReplyToAuthor", ["I64", "LSIntEnum", "LSMessageReplySourceTypeV2"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        return a.replySourceTypeV2 != null && d("I64").equal(a.replySourceTypeV2, d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").XMA))
    }
    g["default"] = a
}), 98);
__d("useMWReplySnippetContent", ["fbt", "Actor", "I64", "MWPMessageAuthor.react", "useMWIsReplyToAuthor", "useMWPIsMessagePinned"], (function(a, b, c, d, e, f, g, h) {
    "use strict";

    function a(a, b) {
        var e = c("useMWPIsMessagePinned")(a),
            f = d("MWPMessageAuthor.react").useAuthorName();
        f = f[0];
        var g = d("Actor").useActor();
        g = g[0];
        g = g === d("I64").to_string(a.senderId);
        var i = c("useMWIsReplyToAuthor")(a);
        return !e || g || i ? a.replySnippet : b ? h._("__JHASH__lpeJtmI6peT__JHASH__").toString() : h._("__JHASH__bGQxu-uwmpe__JHASH__", [h._param("name", f)]).toString()
    }
    g["default"] = a
}), 98);
__d("MWReplySnippet.react", ["I64", "LSIntEnum", "LSMessageReplySourceTypeV2", "MDSForwardSvgIcon.react", "MDSReplySvgIcon.react", "MWEditedEyebrow.react", "gkx", "react", "useMWReplySnippetContent"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            container: {
                alignItems: "x6s0dn4",
                color: "x12scifz",
                display: "x78zum5",
                fontSize: "x1pg5gke",
                paddingBottom: "xg8j3zb",
                paddingTop: "x1nn3v0j",
                $$css: !0
            },
            separator: {
                paddingEnd: "x150jy0e",
                paddingStart: "x1e558r4",
                $$css: !0
            },
            text: {
                paddingStart: "x1h0ha7o",
                $$css: !0
            }
        };

    function j(a) {
        a = a.replySourceType;
        if (a == null) return null;
        if (d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").MESSAGE)) || d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").STORY))) return h.jsx(c("MDSReplySvgIcon.react"), {
            color: "tertiary",
            size: 16
        });
        else if (d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").FORWARD)) || d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").IG_STORY_SHARE)) || d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSMessageReplySourceTypeV2").FB_STORY_SHARE))) return h.jsx(c("MDSForwardSvgIcon.react"), {
            color: "tertiary",
            size: 16
        });
        return null
    }
    j.displayName = j.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.message;
        a = a.outgoing;
        a = c("useMWReplySnippetContent")(b, a);
        if (a == null) return null;
        var d = c("gkx")("8016");
        return h.jsxs("div", {
            className: "x6s0dn4 x12scifz x78zum5 x1pg5gke xg8j3zb x1nn3v0j",
            "data-testid": void 0,
            children: [h.jsx(j, {
                replySourceType: b == null ? void 0 : b.replySourceTypeV2
            }), h.jsx("div", {
                className: "x1h0ha7o",
                children: a
            }), h.jsx(c("MWEditedEyebrow.react"), {
                hasSeparator: !0,
                isEdited: d,
                xstyle: i.separator
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("UseMWIsReplyToAuthor.bs", ["useMWIsReplyToAuthor"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        return c("useMWIsReplyToAuthor")(a)
    }
    g.make = a
}), 98);
__d("MWMessageRow.react", ["CometErrorBoundary.react", "CometMiddot.react", "CometPlaceholder.react", "CometPressable.react", "GroupsCometChatsEngagementLogger", "I64", "Int64Hooks", "LSIntEnum", "LSMessagingThreadTypeUtil", "LSThreadBitOffset", "MNLSXMALayoutType", "MWCMIsAnyCMThread", "MWCMThreadTypes.react", "MWChatGutterItem.bs", "MWChatMessageUnreadIndicator.react", "MWClickedMessageContext.react", "MWExtraPinnedMessagePadding.react", "MWForwardedContent.react", "MWLSThread", "MWLSThreadDisplayContext", "MWMessageDeliveryStatus", "MWMessageListAttachmentContainer.react", "MWMessageReactionsContainer.react", "MWMessageRowActions.react", "MWPActor.react", "MWPBaseMessage.react", "MWPBaseMessageListRow.react", "MWPBaseMessageRowHeader.react", "MWPMessageFooter.react", "MWPMessageIsReply.bs", "MWPMessageListColumn.react", "MWPMessageListRowWithKeyboardInteractions.bs", "MWPMessageLoggingWrapper.bs", "MWPMessageParsingUtils.bs", "MWPMessagePinnedText.react", "MWPMessageReactions.react", "MWPMessageRowCalculateStatus.react", "MWPMessageS2SLoggingWrapper", "MWPinnedMessageDropdownButton.react", "MWPinnedMessageOverlay.react", "MWPinnedMessageRowFooterNUXWrapperRequireNUX.react", "MWRepliedMessage.bs", "MWReplySnippet.react", "MWV2ChatAdminMessage.react", "MWV2ChatBubble.react", "MWV2ChatEmoji.react", "MWV2ChatErrorBubble.react", "MWV2ChatText.bs", "MWV2ChatUnsentMessage.react", "MWV2MessageEndOfGroupContent.react", "MWV2MessageProfilePhoto.react", "MWV2MessageRowSimple.react", "MWV2MessageStartOfGroupContent.bs", "MWV2MessageTimestampTooltip.react", "MWV2ReplyError.bs", "MWXText.react", "QE2Logger", "ReQL", "ReQL.bs", "ReQLSubscription.bs", "UseMWIsReplyToAuthor.bs", "asyncToGeneratorRuntime", "cr:120", "cr:4443", "deferredLoadComponent", "gkx", "justknobx", "promiseDone", "qex", "react", "requireDeferredForDisplay", "stylex", "useCometUniqueID", "useIsMultiReactionEnabled", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    a = d("react");
    e = a.memo;
    var i = a.startTransition,
        j = a.useCallback,
        k = a.useMemo,
        l = a.useState,
        m = (b("cr:4443") || {}).make,
        n = c("deferredLoadComponent")(c("requireDeferredForDisplay")("MWMessageReactionsContainerV2.react").__setRef("MWMessageRow.react")),
        o = {
            adminMessageAttachment: {
                boxSizing: "x9f619",
                maxWidth: "x1i5r0r9",
                minWidth: "xwj5yc2",
                paddingBottom: "xdvlbce",
                paddingStart: "x5ib6vp",
                paddingEnd: "xc73u3c",
                paddingTop: "x1nn3v0j",
                "@supports(max-width: min(100%, 500px))_maxWidth": "x8ibpz6",
                $$css: !0
            },
            alignEnd: {
                alignItems: "xuk3077",
                $$css: !0
            },
            emptyGutter: {
                width: "x51ohtg",
                $$css: !0
            },
            emptyGutterForTextReceipts: {
                width: "x1xc55vz",
                $$css: !0
            },
            gutter: {
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                width: "xw4jnvo",
                $$css: !0
            },
            multiReactContainer: {
                display: "x78zum5",
                flexDirection: "x1q0g3np",
                $$css: !0
            },
            multiReactContainerOutgoing: {
                alignSelf: "xpvyfi4",
                $$css: !0
            },
            reply: {
                alignItems: "x1cy8zhl",
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                $$css: !0
            },
            replyMargin: {
                marginBottom: "x1q5jw98",
                minHeight: "xvnwnnf",
                $$css: !0
            }
        },
        p = e(function(a) {
            var e = a.hasClickState,
                f = e === void 0 ? !1 : e,
                g = a.hasMessageEmphasisRing;
            e = a.isFirstMessageInGroup;
            var i = a.isLastMessageInGroup,
                j = a.isSecureMessage,
                k = a.message,
                l = a.nextMessage,
                m = a.offlineAttachmentId,
                n = a.outgoing,
                o = a.prevMessage,
                p = a.reactions,
                q = a.reactionsV2,
                r = a.renderAttachment;
            a = a.threadType;
            var s = c("MWClickedMessageContext.react").useHook(),
                t = s.clickedMessageId,
                u = s.fetchMessageSeenCount,
                v = s.hasError,
                w = s.setClickedMessageId,
                x = c("useReStore")(),
                y = d("LSMessagingThreadTypeUtil").isDiscoverablePublicBroadcastChannel(a),
                z = d("useIsMultiReactionEnabled").useIsMultiReactEnabled(k.threadKey),
                A = d("Int64Hooks").useCallbackInt64(function() {
                    c("promiseDone")(b("asyncToGeneratorRuntime").asyncToGenerator(function*() {
                        var a = (yield d("ReQL").firstAsync(d("ReQL").fromTableAscending(x.table("threads")).getKeyRange(k.threadKey))),
                            b = a == null ? null : yield d("ReQL").firstAsync(d("ReQL").fromTableAscending(x.table("community_folders")).getKeyRange(a.parentThreadKey));
                        a != null && b != null && d("GroupsCometChatsEngagementLogger").log({
                            action: "tap",
                            client_extras: {
                                mid: k.messageId
                            },
                            community_id: d("I64").to_string(b.folderId),
                            event: "render_seen_count",
                            group_id: d("I64").to_string(b.fbGroupId),
                            source: "message_bubble",
                            surface: "thread_view",
                            thread_id: d("I64").to_string(a.threadKey)
                        });
                        if (t === k.messageId && !v) return w(null);
                        else return u(k.threadKey, k.messageId, b)
                    })())
                }, [x, t, k.messageId, k.threadKey, v, w, u]);
            return h.jsx(c("MWPBaseMessage.react"), {
                checkEmoticon: !0,
                isFirstMessageInGroup: e,
                isLastMessageInGroup: i,
                message: k,
                nextMessage: l,
                outgoing: n,
                prevMessage: o,
                reactions: p,
                reactionsV2: q,
                renderAttachment: function(a, b, d) {
                    return r != null && j ? r(k, o, l, n) : h.jsx(c("MWMessageListAttachmentContainer.react"), {
                        connectBottom: b,
                        connectTop: a,
                        hasEmphasisRing: g,
                        hasText: d,
                        message: k,
                        outgoing: n
                    })
                },
                renderEmoji: function() {
                    return h.jsx(c("MWV2ChatEmoji.react"), {
                        hasEmphasisRing: g,
                        isSecureMessage: j,
                        message: k
                    })
                },
                renderMessageBubble: function(a, b, c, e) {
                    return h.jsx(d("MWV2ChatBubble.react").ChatBubble, {
                        connectBottom: c,
                        connectTop: b,
                        hasEmphasisRing: g,
                        message: k,
                        outgoing: n,
                        precedesXMA: e,
                        children: h.jsx(d("MWV2ChatText.bs").make, {
                            isSecureMessage: j,
                            message: k,
                            outgoing: n
                        })
                    })
                },
                renderMessageContainer: function(a, e) {
                    var g;
                    g = h.jsx(d("MWPMessageLoggingWrapper.bs").make, {
                        messageId: k.messageId,
                        optimisticMessageId: (g = m) != null ? g : k.offlineThreadingId,
                        xstyle: f ? [!1] : e,
                        children: y && b("cr:120") ? h.jsx(b("cr:120"), {
                            message: k,
                            children: a
                        }) : h.jsx(c("MWV2MessageTimestampTooltip.react"), {
                            message: k,
                            children: a
                        })
                    });
                    if (f) return h.jsx(c("CometPressable.react"), {
                        onPress: A,
                        overlayDisabled: !0,
                        xstyle: e,
                        children: g
                    });
                    else return g
                },
                renderMessageFooter: function() {
                    if (z) return null;
                    var a = q != null && q.length > 0;
                    return h.jsx(d("MWPMessageFooter.react").MWPMessageFooter, {
                        outgoing: n,
                        children: !a && p.length < 1 ? null : h.jsx(d("MWPMessageReactions.react").MWPMessageReactions, {
                            message: k,
                            outgoing: n,
                            reactions: p,
                            reactionsV2: a ? q : void 0,
                            children: function(b, d, e, f, g) {
                                return h.jsx(c("MWMessageReactionsContainer.react"), {
                                    count: d,
                                    emojis: b,
                                    message: f,
                                    reactions: e,
                                    reactionsV2: a ? q : void 0,
                                    threadKey: g
                                })
                            }
                        })
                    })
                },
                renderUnsentMessage: function() {
                    return h.jsx(c("MWV2MessageTimestampTooltip.react"), {
                        message: k,
                        children: h.jsx(d("MWV2ChatUnsentMessage.react").MWV2ChatUnsentMessage, {
                            isSecureMessage: j,
                            message: k,
                            outgoing: n
                        })
                    })
                }
            })
        });

    function q() {
        var a = d("MWLSThreadDisplayContext").useMWLSThreadDisplayContext();
        return k(function() {
            var b = c("gkx")("571") ? "12px" : a === "Inbox" ? "16px" : "8px";
            return {
                dark: {
                    "mwp-message-list-profile-start-padding": b
                },
                light: {
                    "mwp-message-list-profile-start-padding": b
                },
                type: "VARIABLES"
            }
        }, [a])
    }
    f = e(function(a) {
        var b = a.displayMode;
        b = b === void 0 ? "standard" : b;
        var e = a.domElementRef,
            f = a.fbGroupId,
            g = a.hasMessageEmphasisRing,
            r = a.isCMAdmin,
            s = r === void 0 ? !1 : r,
            t = a.isModal,
            u = a.isSecureMessage,
            v = a.message,
            w = a.nextMessage,
            x = a.prevMessage,
            y = a.renderAttachment;
        r = a.shouldRenderUnreadIndicator;
        var z = a.stopHoveringRef,
            A = a.threadType;
        a = a.useReactionsV2;
        var B = a === void 0 ? !1 : a,
            C = b === "pinnedMessages";
        a = d("MWPActor.react").useActor();
        b = c("MWClickedMessageContext.react").useHook();
        var aa = b.clickedMessageId,
            D = C || d("MWPMessageParsingUtils.bs").isStartOfGroup(v, x),
            E = C || d("MWPMessageParsingUtils.bs").isEndOfGroup(v, w),
            F = c("MWCMIsAnyCMThread")(A),
            G = d("MWCMThreadTypes.react").isBroadcastThread(A);
        b = d("LSMessagingThreadTypeUtil").isDiscoverablePublicBroadcastChannel(A);
        var H = d("LSMessagingThreadTypeUtil").isGroup(A),
            I = d("LSMessagingThreadTypeUtil").isSecure(A),
            J = Boolean(d("MWLSThread").useThread(v.threadKey, function(a) {
                return d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(140), a)
            })),
            K = !1;
        if (I) {
            var L;
            K = (L = c("qex")._("891")) != null ? L : !1;
            d("QE2Logger").logExposureForUser("messenger_armadillo_web_message_states")
        } else K = c("justknobx")._("1250");
        var M = d("useIsMultiReactionEnabled").useIsMultiReactEnabled(v.threadKey);
        L = !v.isUnsent && J;
        var N = L && !b,
            O = !C && d("I64").equal(v.senderId, a),
            P = w == null,
            Q = d("MWPMessageReactions.react").useReactions(v),
            R = d("MWPMessageReactions.react").useReactionsV2(v),
            ba = M && R.some(function(a) {
                return d("I64").to_int32(a.count) > 0
            });
        J = l(!1);
        var S = J[0],
            T = J[1];
        L = l(!1);
        var U = L[0],
            V = L[1],
            W = j(function(a) {
                return i(function() {
                    return V(a)
                })
            }, [V, i]),
            X = j(function(a) {
                return i(function() {
                    return T(a)
                })
            }, [T, i]),
            ca = c("useCometUniqueID")();
        a = l(!1);
        var Y = a[0],
            da = a[1],
            ea = !O,
            fa = ea && H,
            Z = c("MWPMessageIsReply.bs")(v),
            ga = (Q.length > 0 || R.length > 0) && !M;
        J = d("UseMWIsReplyToAuthor.bs").make(v);
        var ha = J || v.replySourceId == null ? !1 : v.replyMediaExpirationTimestampMs != null ? d("I64").gt(v.replyMediaExpirationTimestampMs, d("I64").zero) : !0,
            ia = G && c("gkx")("6159") || C || b || K,
            ja = function(a) {
                return h.jsx(c("MWXText.react"), {
                    color: "secondary",
                    type: "meta4",
                    children: a
                })
            },
            ka = q();
        L = r === !0 ? h.jsx(c("MWV2MessageRowSimple.react"), {
            children: h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnGrow, {
                children: h.jsx(c("MWChatMessageUnreadIndicator.react"), {})
            })
        }) : null;
        var la = c("useReStore")(),
            ma = v.messageId,
            na = v.threadKey,
            $ = d("ReQLSubscription.bs").useArray(k(function() {
                return d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(la.table("attachments")), {
                    hd: na,
                    tl: {
                        hd: ma,
                        tl: 0
                    }
                })
            }, [la, ma, na]), "tawsd338");
        a = $.length > 0 && $[0].xmaLayoutType != null && d("I64").equal($[0].xmaLayoutType, d("LSIntEnum").ofNumber(c("MNLSXMALayoutType").STANDARD_DXMA));
        J = $.length > 0 && $[0].xmaLayoutType != null && d("I64").equal($[0].xmaLayoutType, d("LSIntEnum").ofNumber(c("MNLSXMALayoutType").SHARED_STACK));
        if (v.isAdminMessage) {
            b = h.jsxs(d("MWPMessageListColumn.react").MWPMessageListColumnShrinkwrap, {
                centered: !0,
                children: [h.jsx(d("MWV2ChatAdminMessage.react").MWV2ChatAdminMessage, {
                    message: v,
                    nextMessage: w,
                    prevMessage: x
                }), h.jsx(c("MWMessageListAttachmentContainer.react"), {
                    connectBottom: !1,
                    connectTop: !1,
                    message: v,
                    outgoing: O,
                    xstyle: o.adminMessageAttachment
                })]
            });
            v.adminMsgCtaType == null ? r = h.jsx(c("MWV2MessageRowSimple.react"), {
                children: b
            }) : r = h.jsx(d("MWPMessageListRowWithKeyboardInteractions.bs").make, {
                domElementRef: D ? void 0 : e,
                isDialogOpened: Y,
                isFocused: S,
                isModal: t,
                message: v,
                messageDomID: ca,
                nextMessage: w,
                outgoing: O,
                prevMessage: x,
                setFocused: X,
                setHovered: W,
                setIsDialogOpened: da,
                stopHoveringRef: z,
                theme: ka,
                children: b
            })
        } else a || J ? r = h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnShrinkwrap, {
            centered: !0,
            children: h.jsx(c("MWV2MessageRowSimple.react"), {
                children: h.jsx(c("MWMessageListAttachmentContainer.react"), {
                    connectBottom: !1,
                    connectTop: !1,
                    message: v,
                    outgoing: O,
                    xstyle: o.adminMessageAttachment
                })
            })
        }) : r = h.jsxs(h.Fragment, {
            children: [L, D && !C ? h.jsx(d("MWV2MessageStartOfGroupContent.bs").make, {
                domElementRef: e,
                message: v,
                prevMessage: x
            }) : null, h.jsx(c("MWPMessageRowCalculateStatus.react"), {
                isBroadcastThread: G,
                isLargeGroup: !1,
                isSecureGroupThread: I && H,
                message: v,
                nextMessage: w,
                children: function(a) {
                    var b;
                    return h.jsxs(d("MWPMessageListRowWithKeyboardInteractions.bs").make, {
                        domElementRef: D ? void 0 : e,
                        isDialogOpened: Y,
                        isFocused: S,
                        isModal: t,
                        message: v,
                        messageDomID: ca,
                        nextMessage: w,
                        outgoing: O,
                        prevMessage: x,
                        setFocused: X,
                        setHovered: W,
                        setIsDialogOpened: da,
                        stopHoveringRef: z,
                        theme: ka,
                        children: [h.jsx(c("MWPBaseMessageRowHeader.react"), {
                            alwaysRenderSenderName: C,
                            fbGroupId: f,
                            isAnyCMThread: F,
                            isFirstMessageInGroup: D,
                            isGroupThread: H,
                            message: v,
                            outgoing: O,
                            renderForwardSnippet: function() {
                                return h.jsx(c("MWForwardedContent.react"), {
                                    message: v,
                                    outgoing: O
                                })
                            },
                            renderPinnedText: function(a, b) {
                                return C ? null : h.jsx(c("MWPMessagePinnedText.react"), {
                                    divider: b && h.jsx(c("CometMiddot.react"), {}),
                                    message: v
                                })
                            },
                            renderReplySnippet: function() {
                                return h.jsx(c("MWReplySnippet.react"), {
                                    message: v,
                                    outgoing: O
                                })
                            },
                            renderTextWrapper: function(a) {
                                return h.jsx(c("MWXText.react"), {
                                    color: "secondary",
                                    type: "meta4",
                                    children: a
                                })
                            },
                            renderTimestamp: C ? ja : void 0
                        }), h.jsxs(h.Fragment, {
                            children: [D && !fa ? h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnVerticalRhythm, {
                                height: 2
                            }) : null, Z && h.jsx("div", {
                                className: c("stylex")(o.reply, O ? o.alignEnd : !1, ha ? o.replyMargin : !1),
                                role: "none",
                                children: h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnWithGutters, {
                                    grow: !0,
                                    children: h.jsx(c("CometErrorBoundary.react"), {
                                        fallback: function(a) {
                                            return h.jsx(d("MWV2ReplyError.bs").make, {
                                                outgoing: O
                                            })
                                        },
                                        children: C ? h.jsx(d("MWRepliedMessage.bs").make, {
                                            isSecureMessage: u,
                                            message: v,
                                            outgoing: O
                                        }) : h.jsx(c("MWPinnedMessageOverlay.react"), {
                                            alreadyRenderedPin: !1,
                                            message: v,
                                            outgoing: O,
                                            children: h.jsx(d("MWRepliedMessage.bs").make, {
                                                isSecureMessage: u,
                                                message: v,
                                                outgoing: O
                                            })
                                        })
                                    })
                                })
                            }), h.jsx(c("MWPMessageS2SLoggingWrapper"), {
                                messageId: v.messageId,
                                optimisticMessageId: (b = $ == null ? void 0 : (b = $[0]) == null ? void 0 : b.offlineAttachmentId) != null ? b : v.offlineThreadingId,
                                statusType: a.type,
                                children: h.jsx(d("MWPBaseMessageListRow.react").MWPBaseMessageListRowBody, {
                                    hasReactions: ga,
                                    message: v,
                                    outgoing: O,
                                    renderGutterItem: function() {
                                        return ia ? h.jsx("div", {
                                            className: c("stylex")(K ? o.emptyGutterForTextReceipts : o.emptyGutter),
                                            role: "none"
                                        }) : h.jsx(c("MWChatGutterItem.bs"), {
                                            errorMessage: v.subscriptErrorMessage != null && F ? v.subscriptErrorMessage : void 0,
                                            incoming: !1,
                                            status: a,
                                            xstyle: o.gutter
                                        })
                                    },
                                    renderMessageActions: function() {
                                        return C ? h.jsx(c("MWPinnedMessageDropdownButton.react"), {
                                            hidden: !U && !S,
                                            message: v
                                        }) : h.jsx(c("MWMessageRowActions.react"), {
                                            ariaHidden: t === !1,
                                            focused: S || Y || t,
                                            hasReactions: ga,
                                            hovered: U,
                                            message: v,
                                            outgoing: O,
                                            shouldHideHoverMenuReact: ba
                                        })
                                    },
                                    renderMultiReactions: function() {
                                        if (v.isUnsent) return null;
                                        var a = R != null && R.length > 0;
                                        return !M || !a ? null : h.jsx("div", {
                                            className: c("stylex")(o.multiReactContainer, O ? o.multiReactContainerOutgoing : !1),
                                            children: h.jsx(d("MWPMessageReactions.react").MWPMessageReactions, {
                                                message: v,
                                                outgoing: O,
                                                reactions: Q,
                                                reactionsV2: R,
                                                children: function(a, b, d, e, f, g) {
                                                    return h.jsx(c("CometPlaceholder.react"), {
                                                        fallback: null,
                                                        children: h.jsx(n, {
                                                            emojis: a,
                                                            message: e,
                                                            onOpenDialog: g,
                                                            outgoing: O,
                                                            reactionsV2: R
                                                        })
                                                    })
                                                }
                                            })
                                        })
                                    },
                                    renderProfile: function() {
                                        return h.jsx(c("MWV2MessageProfilePhoto.react"), {
                                            ariaHidden: H ? !t : !0,
                                            isCMAdmin: s,
                                            isGroupThread: H,
                                            isLastMessageInGroup: E,
                                            message: v
                                        })
                                    },
                                    children: h.jsx(c("CometErrorBoundary.react"), {
                                        fallback: function(a) {
                                            return h.jsx(c("MWV2ChatErrorBubble.react"), {
                                                isReply: Z
                                            })
                                        },
                                        children: C ? h.jsx(p, {
                                            hasClickState: N,
                                            hasMessageEmphasisRing: g,
                                            isFirstMessageInGroup: D,
                                            isLastMessageInGroup: E,
                                            isSecureMessage: u,
                                            message: v,
                                            nextMessage: w,
                                            offlineAttachmentId: $ && $.length > 0 ? $[0].offlineAttachmentId : null,
                                            outgoing: O,
                                            prevMessage: x,
                                            reactions: Q,
                                            reactionsV2: B ? R : void 0,
                                            renderAttachment: y,
                                            threadType: A
                                        }) : h.jsx(c("MWPinnedMessageOverlay.react"), {
                                            alreadyRenderedPin: Z,
                                            message: v,
                                            outgoing: O,
                                            children: h.jsx(p, {
                                                hasClickState: N,
                                                hasMessageEmphasisRing: g,
                                                isFirstMessageInGroup: D,
                                                isLastMessageInGroup: E,
                                                isSecureMessage: u,
                                                message: v,
                                                nextMessage: w,
                                                offlineAttachmentId: $ && $.length > 0 ? $[0].offlineAttachmentId : null,
                                                outgoing: O,
                                                prevMessage: x,
                                                reactions: Q,
                                                reactionsV2: B ? R : void 0,
                                                renderAttachment: y,
                                                threadType: A
                                            })
                                        })
                                    })
                                })
                            }), h.jsx(c("MWPinnedMessageRowFooterNUXWrapperRequireNUX.react"), {
                                isLastMessage: P,
                                isOutgoing: O,
                                isPinnedMessageList: C,
                                message: v
                            }), h.jsx(c("MWExtraPinnedMessagePadding.react"), {
                                nextMessage: w
                            }), N && aa === v.messageId ? h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnVerticalRhythm, {
                                height: 6
                            }) : E && !K ? h.jsx(d("MWPMessageListColumn.react").MWPMessageListColumnVerticalRhythm, {
                                height: 7
                            }) : null]
                        }), C ? null : h.jsx(d("MWPBaseMessageListRow.react").MWPBaseMessageListRowFooter, {
                            message: v,
                            nextMessage: w,
                            showContent: N || d("MWMessageDeliveryStatus").isAlwaysShownStatus(a) && K,
                            children: function() {
                                return h.jsx(d("MWV2MessageEndOfGroupContent.react").MWV2MessageEndOfGroupContent, {
                                    alignLeft: N && ea,
                                    hasTextBasedMessageReceipts: K,
                                    isLastMessage: P,
                                    isOutgoing: O,
                                    isTextOnly: G,
                                    message: v,
                                    status: a
                                })
                            }
                        })]
                    })
                }
            })]
        });
        return h.jsxs(h.Fragment, {
            children: [r, m == null ? null : h.jsx(m, {})]
        })
    });
    g.useTheme = q;
    g.MWMessageRow = f
}), 98); /*FB_PKG_DELIM*/
__d("MessengerCreateVideoMeetupLinkMutation_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "4971536746285420"
}), null);
__d("MessengerCreateVideoMeetupLinkMutation.graphql", ["MessengerCreateVideoMeetupLinkMutation_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "input"
            }],
            c = [{
                alias: null,
                args: [{
                    kind: "Variable",
                    name: "data",
                    variableName: "input"
                }],
                concreteType: "CreateVideoMeetupLinkResponsePayload",
                kind: "LinkedField",
                name: "create_video_meetup_link",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "MessengerCallInviteLink",
                    kind: "LinkedField",
                    name: "meetup_link",
                    plural: !1,
                    selections: [{
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "id",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "link_url",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "link_hash",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "is_audio_only",
                        storageKey: null
                    }],
                    storageKey: null
                }],
                storageKey: null
            }];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "MessengerCreateVideoMeetupLinkMutation",
                selections: c,
                type: "Mutation",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "MessengerCreateVideoMeetupLinkMutation",
                selections: c
            },
            params: {
                id: b("MessengerCreateVideoMeetupLinkMutation_facebookRelayOperation"),
                metadata: {},
                name: "MessengerCreateVideoMeetupLinkMutation",
                operationKind: "mutation",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("VideoChatLinksUserActionsMultiplexLogger", ["cr:1443591"], (function(a, b, c, d, e, f, g) {
    "use strict";
    g["default"] = b("cr:1443591")
}), 98);
__d("useZenonCallInvite", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useEffect,
        i = b.useState;

    function a(a) {
        var b = i(function() {
                return a ? a.getCurrentInvite() : null
            }),
            c = b[0],
            d = b[1];
        h(function() {
            if (a) {
                var b = a.addListener("callInvite", d);
                return function() {
                    b.remove()
                }
            } else d(null)
        }, [a]);
        return c
    }
    g["default"] = a
}), 98);
__d("ZenonCallWindowErrors", [], (function(a, b, c, d, e, f) {
    "use strict";
    a = function(a) {
        babelHelpers.inheritsLoose(b, a);

        function b() {
            var b, c;
            for (var d = arguments.length, e = new Array(d), f = 0; f < d; f++) e[f] = arguments[f];
            return (b = c = a.call.apply(a, [this].concat(e)) || this, c.name = "ZenonOpeningAnotherCallError", b) || babelHelpers.assertThisInitialized(c)
        }
        return b
    }(babelHelpers.wrapNativeSuper(Error));
    b = function(a) {
        babelHelpers.inheritsLoose(b, a);

        function b() {
            var b, c;
            for (var d = arguments.length, e = new Array(d), f = 0; f < d; f++) e[f] = arguments[f];
            return (b = c = a.call.apply(a, [this].concat(e)) || this, c.name = "ZenonConferenceNameMutationFailedError", b) || babelHelpers.assertThisInitialized(c)
        }
        return b
    }(babelHelpers.wrapNativeSuper(Error));
    c = function(a) {
        babelHelpers.inheritsLoose(b, a);

        function b() {
            var b, c;
            for (var d = arguments.length, e = new Array(d), f = 0; f < d; f++) e[f] = arguments[f];
            return (b = c = a.call.apply(a, [this].concat(e)) || this, c.name = "ZenonIncompleteControllerParamsError", b) || babelHelpers.assertThisInitialized(c)
        }
        return b
    }(babelHelpers.wrapNativeSuper(Error));
    d = function(a) {
        babelHelpers.inheritsLoose(b, a);

        function b() {
            var b, c;
            for (var d = arguments.length, e = new Array(d), f = 0; f < d; f++) e[f] = arguments[f];
            return (b = c = a.call.apply(a, [this].concat(e)) || this, c.name = "ZenonUnsupportedThreadTypeError", b) || babelHelpers.assertThisInitialized(c)
        }
        return b
    }(babelHelpers.wrapNativeSuper(Error));
    e = function(a) {
        babelHelpers.inheritsLoose(b, a);

        function b() {
            var b, c;
            for (var d = arguments.length, e = new Array(d), f = 0; f < d; f++) e[f] = arguments[f];
            return (b = c = a.call.apply(a, [this].concat(e)) || this, c.name = "ZenonCannotAcceptInviteError", b) || babelHelpers.assertThisInitialized(c)
        }
        return b
    }(babelHelpers.wrapNativeSuper(Error));
    var g = function(b) {
            babelHelpers.inheritsLoose(a, b);

            function a() {
                var a, c;
                for (var d = arguments.length, e = new Array(d), f = 0; f < d; f++) e[f] = arguments[f];
                return (a = c = b.call.apply(b, [this].concat(e)) || this, c.name = "ZenonInviteNotFoundError", a) || babelHelpers.assertThisInitialized(c)
            }
            return a
        }(babelHelpers.wrapNativeSuper(Error)),
        h = function(b) {
            babelHelpers.inheritsLoose(a, b);

            function a() {
                var a, c;
                for (var d = arguments.length, e = new Array(d), f = 0; f < d; f++) e[f] = arguments[f];
                return (a = c = b.call.apply(b, [this].concat(e)) || this, c.name = "ZenonUninitializedError", a) || babelHelpers.assertThisInitialized(c)
            }
            return a
        }(babelHelpers.wrapNativeSuper(Error));
    f.OpeningAnotherCallError = a;
    f.ConferenceNameMutationFailedError = b;
    f.IncompleteControllerParamsError = c;
    f.UnsupportedThreadTypeError = d;
    f.CannotAcceptInviteError = e;
    f.InviteNotFoundError = g;
    f.UninitializedError = h
}), 66);
__d("MessengerCreateVideoMeetupLinkMutation", ["MessengerCreateVideoMeetupLinkMutation.graphql", "Promise", "cr:1012418", "gkx"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h;

    function a(a, d, e) {
        return new(b("Promise"))(function(f, g) {
            var i;
            b("cr:1012418").commitMutation(a, {
                mutation: h !== void 0 ? h : h = b("MessengerCreateVideoMeetupLinkMutation.graphql"),
                onCompleted: function(a) {
                    var b, c, d;
                    b = a == null ? void 0 : (b = a.create_video_meetup_link) == null ? void 0 : (b = b.meetup_link) == null ? void 0 : b.is_audio_only;
                    c = a == null ? void 0 : (c = a.create_video_meetup_link) == null ? void 0 : (c = c.meetup_link) == null ? void 0 : c.link_url;
                    d = a == null ? void 0 : (d = a.create_video_meetup_link) == null ? void 0 : (d = d.meetup_link) == null ? void 0 : d.link_hash;
                    a = a == null ? void 0 : (a = a.create_video_meetup_link) == null ? void 0 : (a = a.meetup_link) == null ? void 0 : a.id;
                    return c != null && d != null && b != null ? f({
                        isAudioOnly: b,
                        linkHash: d,
                        linkId: a,
                        linkUrl: c
                    }) : g({
                        error: "Failed to create linkurl."
                    })
                },
                onError: function(a) {
                    g(a)
                },
                optimisticUpdater: null,
                variables: {
                    input: {
                        client_mutation_id: "",
                        funnel_session_id: e,
                        link_options: {
                            availability_settings_options: (d == null ? void 0 : d.linkSurface) === "MESSENGER_V2" ? {
                                join_permission: d == null ? void 0 : d.joinPermission,
                                visibility_mode: (i = d == null ? void 0 : d.visibilityMode) != null ? i : "NONE"
                            } : void 0,
                            chat_mode: (i = d == null ? void 0 : d.chatMode) != null ? i : null,
                            is_audio_only: (i = d == null ? void 0 : d.isAudioOnly) != null ? i : null,
                            is_live_enabled: (i = d == null ? void 0 : d.isLiveEnabled) != null ? i : null,
                            is_room_join_requestable: (i = d == null ? void 0 : d.joinRequestable) != null ? i : null,
                            link_surface: (i = d == null ? void 0 : d.linkSurface) != null ? i : c("gkx")("1224637") ? "WORKPLACE" : void 0,
                            revocation_behavior: (i = d == null ? void 0 : d.revocationBehavior) != null ? i : null,
                            should_allow_anonymous_guests: (i = d == null ? void 0 : d.allowAnonymousGuests) != null ? i : !0,
                            supports_pages: (i = d == null ? void 0 : d.supportsPages) != null ? i : !1,
                            supports_profile_plus: (i = d == null ? void 0 : d.supportsProfilePlus) != null ? i : !1,
                            visibility_mode: (d == null ? void 0 : d.linkSurface) === "MESSENGER_V2" ? void 0 : (i = d == null ? void 0 : d.visibilityMode) != null ? i : "NONE"
                        }
                    }
                }
            })
        })
    }
    g["default"] = a
}), 98);
__d("RoomsLinkUtils", ["ConstUriUtils"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        a = d("ConstUriUtils").getUri(a);
        var b = a == null ? void 0 : a.getDomain();
        a = a == null ? void 0 : (a = a.stripTrailingSlash()) == null ? void 0 : a.getPath();
        if (a == null) return null;
        if (b === "msngr.com") return a.substring(1);
        var c = /^\/v(id)?\//;
        if (b === "m.me" && c.test(a)) return a.replace(c, "");
        b = /^\/groupcall\/LINK:/;
        return b.test(a) ? a.replace(b, "") : null
    }
    g.getRoomsLinkHash = a
}), 98);
__d("XGroupCallControllerRouteBuilder", ["jsRouteBuilder"], (function(a, b, c, d, e, f, g) {
    a = c("jsRouteBuilder")("/groupcall/{?call_context}/", Object.freeze({
        users_to_ring: [],
        has_video: !0,
        initialize_video: !0,
        auto_join: !1,
        use_joining_context: !1,
        has_seen_interstitial: !1,
        use_dapp: !1,
        is_e2ee_mandated: !1
    }), void 0);
    b = a;
    g["default"] = b
}), 98);
__d("ZenonCallIdentifiersUtil", ["Random"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a() {
        return String(d("Random").uint32() + 1)
    }
    g.generateZenonClientSessionID = a
}), 98);
__d("ZenonPeerID", ["invariant"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = "MW_PEER_ID";

    function a(a) {
        a.length > 0 || h(0, 33504);
        if (a === "MW_PEER_ID") return i;
        isNaN(a) === !1 || h(0, 33551, a);
        return a
    }

    function b(a) {
        return isNaN(a) || a === i ? null : a
    }
    g.ZenonMWPeerID = i;
    g.convertStringToPeerID = a;
    g.convertPeerIDForLogging = b
}), 98);
__d("randomZenonNonce", ["Random"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = 2,
        i = 6,
        j = 36,
        k = 2176782336;

    function a() {
        var a = "";
        for (var b = 0; b < h; b++) {
            var c = Math.floor(d("Random").random() * k).toString(j);
            while (c.length < i) c = "0" + c;
            a += c
        }
        return a
    }
    g["default"] = a
}), 98);
__d("ZenonPreCallHookBuilderHelper", ["ConstUriUtils", "FBLogger", "MessengerCreateVideoMeetupLinkMutation", "Promise", "RoomsLinkUtils", "VideoChatLinksUserActionsMultiplexLogger", "XGroupCallControllerRouteBuilder", "ZenonActorHooks", "ZenonCallIdentifiersUtil", "ZenonCallWindowErrors", "ZenonPeerID", "ZenonSignalingProtocol", "asyncToGeneratorRuntime", "gkx", "nullthrows", "randomZenonNonce"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        return h.apply(this, arguments)
    }

    function h() {
        h = b("asyncToGeneratorRuntime").asyncToGenerator(function*(a) {
            if (a === null) throw new(d("ZenonCallWindowErrors").UninitializedError)();
            var b = a.callInviteModel;
            a = a.callWindowController;
            var e = b.getCurrentInvite();
            if (e === null) throw new(d("ZenonCallWindowErrors").InviteNotFoundError)();
            if (e.type !== "ringing" || e.context.type !== "thread") throw new(d("ZenonCallWindowErrors").CannotAcceptInviteError)();
            var f = c("randomZenonNonce")(),
                g = e.context.type === "thread" && e.context.thread.type === 1 && e.isE2eeMandated ? babelHelpers["extends"]({}, e.context.thread, {
                    secureOneToOneThreadPeerId: e.inviterID
                }) : e.context.thread;
            a = a.initCall({
                context: {
                    controllerParams: e.controllerParams,
                    intent: "accept invite"
                },
                isE2eeMandated: e.isE2eeMandated,
                joinContext: {
                    thread: g != null ? g : {
                        id: "0",
                        type: 2
                    },
                    type: "thread"
                },
                mediaType: e.requestingVideo ? "video" : "audio",
                nonce: f,
                representedID: e.receiverUserId
            });
            g = a[0];
            e = a[1];
            b.accept(f, {
                isPopupBlocked: g === null
            });
            yield e
        });
        return h.apply(this, arguments)
    }

    function e(a, b, c, d, e, f) {
        return i.apply(this, arguments)
    }

    function i() {
        i = b("asyncToGeneratorRuntime").asyncToGenerator(function*(a, b, e, f, g, h) {
            h === void 0 && (h = {
                allowAnonymousGuests: !c("gkx")("1224637")
            });
            if (a === null) throw new(d("ZenonCallWindowErrors").UninitializedError)();
            o(g, e, f).setEvent("meetup_attempt_create_meetup").log();
            try {
                a = (yield c("MessengerCreateVideoMeetupLinkMutation")(b, h, g));
                b = a.linkUrl;
                if (b != null) {
                    o(g, e, f).setEvent("meetup_create_success").setVideoCallLinkURLRaw(b).log();
                    return b
                } else o(g, e, f).setEvent("meetup_create_failed").log();
                return b
            } catch (a) {
                o(g, e, f).setEvent("meetup_create_failed").log();
                o(g, e, f).setEvent("error").setErrorType("LinkCreationError " + a.name).setErrorDetails(a.description).log();
                throw a
            }
        });
        return i.apply(this, arguments)
    }

    function f(a) {
        return j.apply(this, arguments)
    }

    function j() {
        j = b("asyncToGeneratorRuntime").asyncToGenerator(function*(a) {
            var e = a.actorID,
                f = a.callback_users,
                g = a.context,
                h = a.forceSkipChildLobby;
            h = h === void 0 ? !1 : h;
            var i = a.funnelSessionID;
            i = i === void 0 ? null : i;
            var j = a.hasVideo;
            j = j === void 0 ? !0 : j;
            var k = a.linkUrl,
                l = a.referrerContext;
            l = l === void 0 ? null : l;
            var o = a.skipLinkUrlRewrite;
            o = o === void 0 ? !1 : o;
            var p = a.startCallImmediately;
            p = p === void 0 ? !1 : p;
            a = a.trigger;
            if (g === null) throw new(d("ZenonCallWindowErrors").UninitializedError)();
            var q = g.callWindowController;
            g = g.incomingRingSDK;
            var r = c("randomZenonNonce")(),
                s = d("ZenonCallIdentifiersUtil").generateZenonClientSessionID(),
                t = k;
            if (!o) {
                o = (o = d("ConstUriUtils").getUri(k)) == null ? void 0 : o.getQueryParam("funnel_session_id");
                k = m(k);
                t = n(k, p ? r : null, f, o != null ? String(o) : i, h, l, e, a, j)
            }
            if (t == null) return b("Promise").reject("An invalid URI was provided");
            k = q.initCall({
                context: {
                    existingCall: null,
                    intent: "start or join",
                    invitees: [],
                    signalingID: s
                },
                joinContext: {
                    linkUrl: t,
                    type: "link"
                },
                mediaType: "video",
                nonce: r,
                representedID: d("ZenonActorHooks").ZenonActor.getID()
            });
            p = k[0];
            f = k[1];
            g.startCallIntent(r, {
                callTrigger: (o = a) != null ? o : "meetup_join",
                isE2eeMandated: !1,
                isPopupBlocked: p === null,
                isVideo: j,
                peerID: d("ZenonPeerID").ZenonMWPeerID,
                protocol: c("ZenonSignalingProtocol").MW,
                signalingID: s
            });
            yield f
        });
        return j.apply(this, arguments)
    }

    function k(a, b) {
        return l.apply(this, arguments)
    }

    function l() {
        l = b("asyncToGeneratorRuntime").asyncToGenerator(function*(a, b) {
            var e = b.existingCall,
                f = b.extra,
                g = b.invitees,
                h = b.isE2eeMandated,
                i = b.mediaType,
                j = b.thread;
            b = b.trigger;
            if (a === null) throw new(d("ZenonCallWindowErrors").UninitializedError)();
            var k = a.callWindowController;
            a = a.incomingRingSDK;
            var l = d("ZenonCallIdentifiersUtil").generateZenonClientSessionID(),
                m = c("randomZenonNonce")();
            k = k.initCall({
                context: {
                    existingCall: e,
                    intent: "start or join",
                    invitees: g,
                    signalingID: l
                },
                extra: f,
                isE2eeMandated: h,
                joinContext: {
                    thread: j,
                    type: "thread"
                },
                mediaType: i,
                nonce: m,
                representedID: d("ZenonActorHooks").ZenonActor.getID()
            });
            e = k[0];
            g = k[1];
            a.startCallIntent(m, {
                callTrigger: b,
                isE2eeMandated: (f = h) != null ? f : !1,
                isPopupBlocked: e === null,
                isVideo: i === "video",
                peerID: j.type === 1 ? j.id : d("ZenonPeerID").ZenonMWPeerID,
                protocol: c("ZenonSignalingProtocol").MW,
                signalingID: l
            });
            yield g
        });
        return l.apply(this, arguments)
    }

    function m(a) {
        var b = d("RoomsLinkUtils").getRoomsLinkHash(a);
        b == null && c("FBLogger")("rtc_www").mustfix('Could not extract LinkHash from Video Chat Link. Link = "%s"', a);
        return b
    }

    function n(a, b, d, e, f, g, h, i, j) {
        if (a == null) return "";
        a = {
            call_context: "LINK:" + a,
            call_trigger: (a = i) != null ? a : "",
            has_video: j,
            users_to_ring: (i = d) != null ? i : []
        };
        b != null && (a.nonce = b);
        e != null && (a.funnel_session_id = e);
        f === !0 && (a.auto_join = !0);
        g != null && (a.referrer_context = g);
        h != null && (a.av = h);
        return c("nullthrows")(c("XGroupCallControllerRouteBuilder").buildUri(a).getQualifiedUri()).toString()
    }

    function o(a, b, d) {
        return new(c("VideoChatLinksUserActionsMultiplexLogger"))().setFunnelSessionIDRaw(a).setSurface(b).setComponent(d)
    }
    g.acceptCall = a;
    g.createMeetup = e;
    g.joinMeetup = f;
    g.startCall = k
}), 98);
__d("ZenonPreCallHookBuilder", ["CometRelay", "FBLogger", "Promise", "ZenonPreCallHookBuilderHelper", "err", "gkx", "promiseDone", "react", "useZenonCallInvite"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = h.useCallback,
        j = h.useContext,
        k = h.useDebugValue,
        l = h.useEffect,
        m = 6e4;

    function a(a) {
        return function() {
            var b = j(a);
            return i(function() {
                return d("ZenonPreCallHookBuilderHelper").acceptCall(b)
            }, [b])
        }
    }

    function e(a) {
        return function() {
            var b = j(a);
            b = c("useZenonCallInvite")(b ? b.callInviteModel : null);
            k(b);
            return b
        }
    }

    function f(a, b) {
        return function(d, e) {
            return function() {
                var f = j(a),
                    g = d(),
                    h = e(),
                    k = b();
                return i(function(a) {
                    if (!c("gkx")("1811099")) return;
                    var b = a.existingCall,
                        d = a.thread;
                    if (!f || !f.incomingRingSDK.isCallSupported({
                            threadType: d.type,
                            type: "thread"
                        })) h(a);
                    else switch (d.type) {
                        case 1:
                            c("promiseDone")(k(babelHelpers["extends"]({}, a, {
                                invitees: [d.id]
                            })));
                            break;
                        case 15:
                            if (d.secureOneToOneThreadPeerId == null) throw c("err")("secureOneToOneThreadPeerId should be defined when starting a call from a secure 1:1 thread");
                            c("promiseDone")(k(babelHelpers["extends"]({}, a, {
                                invitees: [d.secureOneToOneThreadPeerId]
                            })));
                            break;
                        case 2:
                        case 16:
                            b === null || b.call_state === "NO_ONGOING_CALL" ? g(a, function(b) {
                                c("promiseDone")(k(babelHelpers["extends"]({}, a, {
                                    invitees: b
                                })))
                            }) : c("promiseDone")(k(babelHelpers["extends"]({}, a, {
                                invitees: []
                            })));
                            break;
                        default:
                            c("FBLogger")("rtc_www").blameToPreviousFrame().mustfix("Attempted to start RTC call for unsupported thread type %d", d.type)
                    }
                }, [f, g, h, k])
            }
        }
    }

    function n(a, b) {
        return function() {
            var c = j(a),
                d = b();
            l(function() {
                if (c && d && d.type === "ringing") {
                    var a = window.setTimeout(function() {
                        c.callInviteModel.decline("NoAnswerTimeout")
                    }, m);
                    return function() {
                        window.clearTimeout(a)
                    }
                }
            }, [c, d])
        }
    }

    function o(a) {
        return function() {
            var e = j(a);
            return i(function(a) {
                var f = a.existingCall,
                    g = a.extra,
                    h = a.invitees,
                    i = a.isE2eeMandated,
                    j = a.mediaType,
                    k = a.thread;
                a = a.trigger;
                return !c("gkx")("1811099") ? b("Promise").resolve() : d("ZenonPreCallHookBuilderHelper").startCall(e, {
                    existingCall: f,
                    extra: g,
                    invitees: h,
                    isE2eeMandated: i,
                    mediaType: j,
                    thread: k,
                    trigger: a
                })
            }, [e])
        }
    }

    function p(a) {
        return function() {
            var e = j(a),
                f = d("CometRelay").useRelayEnvironment();
            return i(function(a, g, h, i) {
                return !c("gkx")("1811099") ? b("Promise").resolve(null) : d("ZenonPreCallHookBuilderHelper").createMeetup(e, f, a, g, h, i)
            }, [e, f])
        }
    }

    function q(a) {
        return function() {
            var e = j(a);
            return i(function(a, f) {
                f === void 0 && (f = {});
                if (!c("gkx")("1811099")) return b("Promise").resolve();
                f = (f = f) != null ? f : {};
                var g = f.actorID,
                    h = f.callbackUsers,
                    i = f.mediaType,
                    j = f.referrerContext,
                    k = f.startCallImmediately;
                f = f.trigger;
                return d("ZenonPreCallHookBuilderHelper").joinMeetup({
                    actorID: g,
                    callback_users: h,
                    context: e,
                    forceSkipChildLobby: !1,
                    hasVideo: i != null ? i === "video" : !0,
                    linkUrl: a,
                    referrerContext: j,
                    startCallImmediately: k,
                    trigger: f
                })
            }, [e])
        }
    }
    g.createAcceptCallCallbackHook = a;
    g.createCallInviteHook = e;
    g.createInviteAndStartCallCallbackHookFactory = f;
    g.createNoAnswerTimeoutHook = n;
    g.createStartCallCallbackHook = o;
    g.createCreateMeetupCallbackHook = p;
    g.createJoinMeetupCallbackHook = q
}), 98);
__d("IGWebPreCallHooks", ["IGWebPreCallContext", "ZenonPreCallHookBuilder"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = d("ZenonPreCallHookBuilder").createAcceptCallCallbackHook(c("IGWebPreCallContext"));
    b = d("ZenonPreCallHookBuilder").createCallInviteHook(c("IGWebPreCallContext"));
    e = d("ZenonPreCallHookBuilder").createStartCallCallbackHook(c("IGWebPreCallContext"));
    g.useAcceptCallCallback = a;
    g.useCallInvite = b;
    g.useStartCallCallback = e
}), 98);
__d("VideoChatLinksUserActionsTypedLogger", ["Banzai", "GeneratedLoggerUtils", "nullthrows"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        function a() {
            this.$1 = {}
        }
        var c = a.prototype;
        c.log = function(a) {
            b("GeneratedLoggerUtils").log("logger:VideoChatLinksUserActionsLoggerConfig", this.$1, b("Banzai").BASIC, a)
        };
        c.logVital = function(a) {
            b("GeneratedLoggerUtils").log("logger:VideoChatLinksUserActionsLoggerConfig", this.$1, b("Banzai").VITAL, a)
        };
        c.logImmediately = function(a) {
            b("GeneratedLoggerUtils").log("logger:VideoChatLinksUserActionsLoggerConfig", this.$1, {
                signal: !0
            }, a)
        };
        c.clear = function() {
            this.$1 = {};
            return this
        };
        c.getData = function() {
            return babelHelpers["extends"]({}, this.$1)
        };
        c.updateData = function(a) {
            this.$1 = babelHelpers["extends"]({}, this.$1, a);
            return this
        };
        c.setCallEndReason = function(a) {
            this.$1.call_end_reason = a;
            return this
        };
        c.setCallID = function(a) {
            this.$1.call_id = a;
            return this
        };
        c.setCameraEnabled = function(a) {
            this.$1.camera_enabled = a;
            return this
        };
        c.setClientAppVersion = function(a) {
            this.$1.client_app_version = a;
            return this
        };
        c.setClientLockStatus = function(a) {
            this.$1.client_lock_status = a;
            return this
        };
        c.setClientMonoTimeMs = function(a) {
            this.$1.client_mono_time_ms = a;
            return this
        };
        c.setClienttime = function(a) {
            this.$1.clienttime = a;
            return this
        };
        c.setComponent = function(a) {
            this.$1.component = a;
            return this
        };
        c.setConferenceNameRaw = function(a) {
            this.$1.conference_name_raw = a;
            return this
        };
        c.setCreationAction = function(a) {
            this.$1.creation_action = a;
            return this
        };
        c.setErrorDetails = function(a) {
            this.$1.error_details = a;
            return this
        };
        c.setErrorType = function(a) {
            this.$1.error_type = a;
            return this
        };
        c.setEvent = function(a) {
            this.$1.event = a;
            return this
        };
        c.setEventDetails = function(a) {
            this.$1.event_details = b("GeneratedLoggerUtils").serializeMap(a);
            return this
        };
        c.setEventFireTimestamp = function(a) {
            this.$1.event_fire_timestamp = a;
            return this
        };
        c.setEventFireTimestampOnClient = function(a) {
            this.$1.event_fire_timestamp_on_client = a;
            return this
        };
        c.setExceptionObject = function(a) {
            this.$1.exception_object = a;
            return this
        };
        c.setExperimentsEnabled = function(a) {
            this.$1.experiments_enabled = b("GeneratedLoggerUtils").serializeMap(a);
            return this
        };
        c.setFalcoBatchSequence = function(a) {
            this.$1.falco_batch_sequence = a;
            return this
        };
        c.setFunnelSessionIDRaw = function(a) {
            this.$1.funnel_session_id_raw = a;
            return this
        };
        c.setGroupID = function(a) {
            this.$1.group_id = a;
            return this
        };
        c.setGroupSize = function(a) {
            this.$1.group_size = a;
            return this
        };
        c.setGuestUserID = function(a) {
            this.$1.guest_user_id = a;
            return this
        };
        c.setKickedUserID = function(a) {
            this.$1.kicked_user_id = a;
            return this
        };
        c.setLinkShareTo = function(a) {
            this.$1.link_share_to = a;
            return this
        };
        c.setLocalCallID = function(a) {
            this.$1.local_call_id = a;
            return this
        };
        c.setMediaDevices = function(a) {
            this.$1.media_devices = a;
            return this
        };
        c.setMicrophoneEnabled = function(a) {
            this.$1.microphone_enabled = a;
            return this
        };
        c.setOpenLinkFrom = function(a) {
            this.$1.open_link_from = a;
            return this
        };
        c.setOpenLinkFromAppVersion = function(a) {
            this.$1.open_link_from_app_version = a;
            return this
        };
        c.setReason = function(a) {
            this.$1.reason = a;
            return this
        };
        c.setReferralSurface = function(a) {
            this.$1.referral_surface = a;
            return this
        };
        c.setRoomIDRaw = function(a) {
            this.$1.room_id_raw = a;
            return this
        };
        c.setServerInfoData = function(a) {
            this.$1.server_info_data = a;
            return this
        };
        c.setSource = function(a) {
            this.$1.source = a;
            return this
        };
        c.setStatus = function(a) {
            this.$1.status = a;
            return this
        };
        c.setSurface = function(a) {
            this.$1.surface = a;
            return this
        };
        c.setTargetedUserIds = function(a) {
            this.$1.targeted_user_ids = b("GeneratedLoggerUtils").serializeVector(a);
            return this
        };
        c.setThreadSyncRoomData = function(a) {
            this.$1.thread_sync_room_data = b("GeneratedLoggerUtils").serializeMap(a);
            return this
        };
        c.setThreadType = function(a) {
            this.$1.thread_type = a;
            return this
        };
        c.setUserIdsToBeRemoved = function(a) {
            this.$1.user_ids_to_be_removed = b("GeneratedLoggerUtils").serializeVector(a);
            return this
        };
        c.setVideoCallLinkHashRaw = function(a) {
            this.$1.video_call_link_hash_raw = a;
            return this
        };
        c.setVideoCallLinkIDRaw = function(a) {
            this.$1.video_call_link_id_raw = a;
            return this
        };
        c.setVideoCallLinkIdentifierRaw = function(a) {
            this.$1.video_call_link_identifier_raw = a;
            return this
        };
        c.setVideoCallLinkURLRaw = function(a) {
            this.$1.video_call_link_url_raw = a;
            return this
        };
        c.updateExtraData = function(a) {
            a = b("nullthrows")(b("GeneratedLoggerUtils").serializeMap(a));
            b("GeneratedLoggerUtils").checkExtraDataFieldNames(a, g);
            this.$1 = babelHelpers["extends"]({}, this.$1, a);
            return this
        };
        c.addToExtraData = function(a, b) {
            var c = {};
            c[a] = b;
            return this.updateExtraData(c)
        };
        return a
    }();
    var g = {
        call_end_reason: !0,
        call_id: !0,
        camera_enabled: !0,
        client_app_version: !0,
        client_lock_status: !0,
        client_mono_time_ms: !0,
        clienttime: !0,
        component: !0,
        conference_name_raw: !0,
        creation_action: !0,
        error_details: !0,
        error_type: !0,
        event: !0,
        event_details: !0,
        event_fire_timestamp: !0,
        event_fire_timestamp_on_client: !0,
        exception_object: !0,
        experiments_enabled: !0,
        falco_batch_sequence: !0,
        funnel_session_id_raw: !0,
        group_id: !0,
        group_size: !0,
        guest_user_id: !0,
        kicked_user_id: !0,
        link_share_to: !0,
        local_call_id: !0,
        media_devices: !0,
        microphone_enabled: !0,
        open_link_from: !0,
        open_link_from_app_version: !0,
        reason: !0,
        referral_surface: !0,
        room_id_raw: !0,
        server_info_data: !0,
        source: !0,
        status: !0,
        surface: !0,
        targeted_user_ids: !0,
        thread_sync_room_data: !0,
        thread_type: !0,
        user_ids_to_be_removed: !0,
        video_call_link_hash_raw: !0,
        video_call_link_id_raw: !0,
        video_call_link_identifier_raw: !0,
        video_call_link_url_raw: !0
    };
    f["default"] = a
}), 66); /*FB_PKG_DELIM*/
__d("BaseHScrollConstants", [], (function(a, b, c, d, e, f) {
    "use strict";
    a = 1600;
    b = 10;
    f.MAX_CONTAINER_WIDTH = a;
    f.WIGGLE_ROOM = b
}), 66);
__d("smoothScrollTo", ["ExecutionEnvironment", "UserAgent"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = c("UserAgent").isBrowser("Firefox");
    b = c("ExecutionEnvironment").canUseDOM && window.matchMedia("(prefers-reduced-motion: reduce)");
    var i = b && b.matches,
        j = c("ExecutionEnvironment").canUseDOM && document.documentElement != null && "scrollBehavior" in document.documentElement.style,
        k = new WeakMap();

    function a(a, b) {
        var c = b.left;
        c = c === void 0 ? 0 : c;
        b = b.top;
        b = b === void 0 ? 0 : b;
        h && (!k.get(a) && c !== 0 && (a.scrollLeft += c / Math.abs(c), k.set(a, !0)));
        j ? a.scrollTo({
            behavior: i ? "auto" : "smooth",
            left: c,
            top: b
        }) : a.scrollTo(c, b)
    }
    g["default"] = a
}), 98);
__d("useContainerBreakpoints", ["$InternalEnum", "gkx", "react", "useResizeObserver"], (function(a, b, c, d, e, f, g) {
    "use strict";
    f = d("react");
    var h = f.useCallback,
        i = f.useState,
        j = b("$InternalEnum")({
            BiggerContainerSmallerChild: 0,
            BiggerContainerBiggerChild: 1
        });

    function k(a, b) {
        var c = a[0],
            d = c.maxContainerWidth;
        c = c.width;
        a = a.slice(1);
        if (d === Infinity || a.length === 0) return c;
        switch (b) {
            case j.BiggerContainerSmallerChild:
                var e = "calc((" + d + "px - 100%) * 9999)",
                    f = k(a, b);
                typeof f === "number" && (f = "min(" + f + "px, (100% - " + (d + .1) + "px) * 9999)");
                return "max(" + f + ", min(" + c + ", " + e + "))";
            case j.BiggerContainerBiggerChild:
                f = "calc((100% - " + d + "px) * 9999)";
                e = k(a, b);
                return "min(" + e + ", max(" + c + ", " + f + "))"
        }
    }

    function a(a, b) {
        b = i(null);
        var d = b[0],
            e = b[1];
        b = h(function(b) {
            b = b.width;
            var c;
            for (var d = a, f = Array.isArray(d), g = 0, d = f ? d : d[typeof Symbol === "function" ? Symbol.iterator : "@@iterator"]();;) {
                var h;
                if (f) {
                    if (g >= d.length) break;
                    h = d[g++]
                } else {
                    g = d.next();
                    if (g.done) break;
                    h = g.value
                }
                h = h;
                if (b > h.maxContainerWidth) continue;
                c = h.width;
                break
            }
            e(c)
        }, [a]);
        b = c("useResizeObserver")(b);
        return [b, d]
    }

    function e(a, b) {
        a = k(a, b);
        return [void 0, a]
    }
    d = c("gkx")("1549702") ? e : a;
    g.BreakpointRelationship = j;
    g.useContainerBreakpoints = d
}), 98);
__d("BaseHScroll.react", ["BaseHScrollConstants", "BaseScrollableArea.react", "BaseView.react", "FocusInertRegion.react", "HiddenSubtreePassiveContext", "Locale", "UserAgent", "emptyFunction", "react", "smoothScrollTo", "stylex", "useBaseHScrollFakeCards", "useContainerBreakpoints", "useEventHandler", "useMergeRefs", "useUnsafeRef_DEPRECATED"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    e = d("react");
    var i = e.useCallback,
        j = e.useContext,
        k = e.useLayoutEffect,
        l = e.useMemo,
        m = e.useRef,
        n = e.useState,
        o = d("Locale").isRTL();
    e = c("UserAgent").isBrowser("Safari < 14") || c("UserAgent").isBrowser("Mobile Safari < 14");
    var p = c("UserAgent").isBrowser("Chrome"),
        q = c("UserAgent").isBrowser("IE") || c("UserAgent").isBrowser("Edge"),
        aa = o && e,
        r = h.createContext(null);

    function a(a) {
        var b = a.accessibilityLabel,
            e = a.buttonWrapperStyle,
            f = a.cardWidth,
            g = a.containerXStyle;
        g = g === void 0 ? t.containerPaddingDefault : g;
        var p = a.outerContainerXStyle,
            u = a.scrollViewXStyle,
            ba = a.scrollContainerXStyle,
            v = a.disableScrolling;
        v = v === void 0 ? !1 : v;
        var w = a.gap,
            x = w === void 0 ? 0 : w;
        w = a.hideArrows;
        w = w === void 0 ? !1 : w;
        var y = a.initialScrollToIndex,
            z = a.initialScrollSmoothing,
            A = z === void 0 ? !1 : z;
        z = a.isButtonInward;
        z = z === void 0 ? !1 : z;
        var B = a.maxContentWindowWidth,
            ca = a.nextButton,
            C = a.peekWidth,
            da = a.prevButton,
            D = a.onPressNext,
            ea = D === void 0 ? c("emptyFunction") : D;
        D = a.onPressPrev;
        var fa = D === void 0 ? c("emptyFunction") : D;
        D = a.peek;
        var E = D === void 0 ? !1 : D;
        D = a.peekPaddingStart;
        var F = a.peekPaddingEnd,
            G = a.testid,
            H = babelHelpers.objectWithoutPropertiesLoose(a, ["accessibilityLabel", "buttonWrapperStyle", "cardWidth", "containerXStyle", "outerContainerXStyle", "scrollViewXStyle", "scrollContainerXStyle", "disableScrolling", "gap", "hideArrows", "initialScrollToIndex", "initialScrollSmoothing", "isButtonInward", "maxContentWindowWidth", "nextButton", "peekWidth", "prevButton", "onPressNext", "onPressPrev", "peek", "peekPaddingStart", "peekPaddingEnd", "testid"]);
        G = B != null && E && F != null && D != null;
        var I = f.type === "responsive" ? f.minWidth : f.width;
        a = l(function() {
            var a = [];
            if (f.type === "fixed") a.push({
                maxContainerWidth: Infinity,
                width: I + "px"
            });
            else if (E && B != null) {
                var b = C * 2,
                    c = 2 * I + x + b,
                    e = 1;
                while (c < B + b) {
                    var g = e <= 1 || x === 0 ? 0 : (e - 1) * x;
                    g = g + b;
                    g = g === 0 ? "100%" : "(100% - " + g + "px)";
                    a.push({
                        maxContainerWidth: c,
                        width: "calc(" + g + " / " + e + ")"
                    });
                    c += x + I;
                    e++
                }
                g = e <= 1 || x === 0 ? 0 : (e - 1) * x;
                c = g + b;
                c = c === 0 ? "100%" : "(100% - " + c + "px)";
                a.push({
                    maxContainerWidth: B + b,
                    width: "calc(" + c + " / " + e + ")"
                });
                a.push({
                    maxContainerWidth: Infinity,
                    width: (B - g) / e
                })
            } else {
                b = E ? C * 2 : 0;
                c = 2 * I + x + b;
                g = 1;
                while (c < d("BaseHScrollConstants").MAX_CONTAINER_WIDTH) {
                    e = g <= 1 || x === 0 ? 0 : (g - 1) * x;
                    e = e + b;
                    e = e === 0 ? "100%" : "(100% - " + e + "px)";
                    a.push({
                        maxContainerWidth: c,
                        width: "calc(" + e + " / " + g + ")"
                    });
                    c += x + I;
                    g++
                }
                e = g <= 1 || x === 0 ? 0 : (g - 1) * x;
                c = e + b;
                e = c === 0 ? "100%" : "(100% - " + c + "px)";
                a.push({
                    maxContainerWidth: Infinity,
                    width: "calc(" + e + " / " + g + ")"
                })
            }
            return a
        }, [f.type, E, B, I, C, x]);
        a = d("useContainerBreakpoints").useContainerBreakpoints(a, d("useContainerBreakpoints").BreakpointRelationship.BiggerContainerSmallerChild);
        var J = a[0],
            K = a[1];
        a = l(function() {
            if (E && B != null) return [{
                maxContainerWidth: B + C * 2,
                width: C
            }, {
                maxContainerWidth: Infinity,
                width: "calc((100% - " + B + "px) / 2)"
            }];
            return E ? [{
                maxContainerWidth: Infinity,
                width: C
            }] : [{
                maxContainerWidth: Infinity,
                width: 0
            }]
        }, [B, E, C]);
        a = d("useContainerBreakpoints").useContainerBreakpoints(a, d("useContainerBreakpoints").BreakpointRelationship.BiggerContainerBiggerChild);
        var L = a[0];
        a = a[1];
        a = B != null && typeof a === "string" && a.includes("min(") ? "max(" + C + "px, (100% - " + B + "px) / 2)" : a;
        var M = c("useUnsafeRef_DEPRECATED")(null),
            N = h.Children.count(H.children),
            O = n(H.isCircular ? !1 : !o),
            P = O[0],
            Q = O[1];
        O = n(H.isCircular ? !1 : o);
        var R = O[0],
            S = O[1],
            T = m(!1);
        k(function() {
            var a;
            a = (a = M.current) == null ? void 0 : a.getDOMNode();
            if (a == null) return;
            if (o) {
                var b = a.clientWidth,
                    c = a.scrollLeft;
                a = a.scrollWidth;
                c > 50 && c > a - b - 50 && (T.current = !0)
            }
        }, []);
        var U = c("useEventHandler")(function() {
            var a;
            a = (a = M.current) == null ? void 0 : a.getDOMNode();
            if (a == null) return;
            var b = a.getBoundingClientRect();
            b = b.width;
            var c = a.scrollLeft,
                d = a.scrollWidth;
            if (!H.isCircular) o && !q ? T.current ? (Q(c > d - b - x), S(c < x)) : (Q(c > -x), S(c < -d + b + x)) : (Q(c < x), S(c > d - b - x));
            else {
                c = Z.current(a);
                d = c.childCards;
                if (d == null || d[0] == null) return;
                ha({
                    isRTL: o,
                    isRTLScrollFromMaxScroll: T,
                    scrollRef: M
                })
            }
        });
        O = c("useBaseHScrollFakeCards")({
            children: H.isCircular ? H.children : [],
            fakeCardXStyle: H.isCircular ? H.fakeCardXStyle : null,
            gap: x,
            isCircular: (O = H.isCircular) != null ? O : !1,
            minWidth: I,
            onResize: U,
            peek: E,
            peekWidth: C
        });
        var V = O[0],
            ga = O[1],
            W = O[2],
            ha = O[3];
        O = c("useMergeRefs")(J, L, W);
        var ia = j(c("HiddenSubtreePassiveContext"));
        k(function() {
            var a = ia.subscribeToChanges(function(a) {
                a.hidden || U()
            });
            return function() {
                return a.remove()
            }
        }, [ia, U]);
        k(function() {
            U()
        }, [N, U]);
        var X = m(x);
        k(function() {
            X.current = x
        }, [x]);
        var Y = i(function(a) {
                var b = a.getBoundingClientRect(),
                    c = B != null ? Math.min(b.width - (E ? 2 * C : 0), B) : E ? b.width - 2 * C : b.width,
                    d = (b.width - c) / 2,
                    e = b.left + d;
                b = b.right - d;
                d = Array.from(a.children[0].children).filter(function(a) {
                    return a.tagName === "DIV"
                });
                return {
                    childCards: d,
                    containerLeft: e,
                    containerRight: b,
                    containerWidth: c
                }
            }, [B, E, C]),
            Z = m(Y);
        k(function() {
            Z.current = Y
        }, [Y]);
        var $ = ((J = V) != null ? J : []).length;
        k(function() {
            var a;
            if (y == null && $ === 0) return;
            var b = (a = M.current) == null ? void 0 : a.getDOMNode();
            if (b == null) return;
            a = Z.current(b);
            a = a.childCards;
            var d = 0;
            if (y != null)
                for (var e = 0; e < Math.min(y, a.length); e++) d += a[e].getBoundingClientRect().width + X.current;
            if ($ !== 0) {
                e = y == null ? 0 : y;
                for (var f = e; f < Math.min(e + $, a.length); f++) d += a[f].getBoundingClientRect().width + X.current
            }
            f = function(a) {
                A ? c("smoothScrollTo")(b, {
                    left: a
                }) : b.scrollTo(a, 0)
            };
            if (o && !q)
                if (T.current) {
                    a = b.scrollWidth - b.getBoundingClientRect().width;
                    f(a - d)
                } else f(-d);
            else f(d)
        }, [y, A, $]);
        L = function() {
            var a;
            a = (a = M.current) == null ? void 0 : a.getDOMNode();
            if (a == null) return;
            var b = Y(a),
                e = b.childCards,
                f = b.containerLeft;
            b = b.containerRight;
            var g;
            for (var h = o ? 0 : e.length - 1; o ? h < e.length : h >= 0; o ? h++ : h--) {
                var i = e[h].getBoundingClientRect();
                if (i.left <= f - d("BaseHScrollConstants").WIGGLE_ROOM) {
                    g = i;
                    break
                }
            }
            if (g == null) return;
            i = g.right - b;
            i !== 0 && (o && q ? c("smoothScrollTo")(a, {
                left: a.scrollLeft - i
            }) : c("smoothScrollTo")(a, {
                left: a.scrollLeft + i
            }), fa())
        };
        W = function() {
            var a;
            a = (a = M.current) == null ? void 0 : a.getDOMNode();
            if (a == null) return;
            var b = Y(a),
                e = b.childCards,
                f = b.containerLeft;
            b = b.containerRight;
            var g;
            for (var h = o ? e.length - 1 : 0; o ? h >= 0 : h < e.length; o ? h-- : h++) {
                var i = e[h].getBoundingClientRect();
                if (i.right >= b + d("BaseHScrollConstants").WIGGLE_ROOM) {
                    g = i;
                    break
                }
            }
            if (g == null) return;
            i = g.left - f;
            i !== 0 && (o && q ? c("smoothScrollTo")(a, {
                left: a.scrollLeft - i
            }) : c("smoothScrollTo")(a, {
                left: a.scrollLeft + i
            }), ea())
        };
        J = l(function() {
            return K != null ? {
                gap: x,
                width: K
            } : null
        }, [K, x]);
        s(M, N);
        return h.jsxs(c("BaseView.react"), {
            ref: O,
            testid: void 0,
            xstyle: p,
            children: [h.jsx("div", {
                "aria-hidden": w || !!P,
                className: c("stylex")(t.buttonWrapper, (w || !!P) && t.hidden, e),
                style: o ? {
                    right: a != null && !G ? a : E ? C : 0,
                    transform: "translate(calc(" + (!E && z ? 0 : 50) + "% + " + (E ? x / 2 : 0) + "px), -50%)"
                } : {
                    left: a != null && !G ? a : E ? C : 0,
                    transform: "translate(calc(-" + (!E && z ? 0 : 50) + "% - " + (E ? x / 2 : 0) + "px), -50%)"
                },
                suppressHydrationWarning: !H.isCircular,
                children: da(o ? W : L, !!P)
            }), h.jsx(c("BaseView.react"), {
                "aria-label": b,
                role: b != null ? "region" : void 0,
                xstyle: [t.scrollContainer, g, ba],
                children: h.jsxs(c("BaseScrollableArea.react"), {
                    hideScrollbar: !0,
                    horizontal: !0,
                    onScroll: U,
                    ref: M,
                    style: {
                        scrollPadding: a
                    },
                    vertical: !1,
                    xstyle: [t.scrollView, !aa && t.scrollViewSnap, v && t.scrollViewNoScroll, u],
                    children: [E && B != null && D == null && h.jsx("span", {
                        style: {
                            flexShrink: 0,
                            minWidth: C,
                            width: "calc((100% - " + B + "px) / 2)"
                        }
                    }), E && (D != null || B == null) && h.jsx("span", {
                        style: {
                            minWidth: (N = D) != null ? N : C
                        }
                    }), h.jsxs(r.Provider, {
                        value: J,
                        children: [V, H.children, ga]
                    }), E && B != null && F == null && h.jsx("span", {
                        style: {
                            flexShrink: 0,
                            minWidth: C,
                            width: "calc((100% - " + B + "px) / 2)"
                        }
                    }), E && (F != null || B == null) && h.jsx("span", {
                        style: {
                            minWidth: (O = F) != null ? O : C
                        }
                    })]
                })
            }), h.jsx("div", {
                "aria-hidden": w || !!R,
                className: c("stylex")(t.buttonWrapper, (w || !!R) && t.hidden, e),
                style: o ? {
                    left: a != null && !G ? a : E ? C : 0,
                    transform: "translate(calc(-" + (!E && z ? 0 : 50) + "% - " + (E ? x / 2 : 0) + "px), -50%)"
                } : {
                    right: a != null && !G ? a : E ? C : 0,
                    transform: "translate(calc(" + (!E && z ? 0 : 50) + "% + " + (E ? x / 2 : 0) + "px), -50%)"
                },
                suppressHydrationWarning: !H.isCircular,
                children: ca(o ? L : W, !!R)
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function b(a) {
        var b = a["aria-hidden"];
        b = b === void 0 ? !1 : b;
        var d = a.children,
            e = a.expanding;
        e = e === void 0 ? !1 : e;
        var f = a.role,
            g = a.type;
        g = g === void 0 ? "default" : g;
        a = a.xstyle;
        var i = j(r);
        if (i == null) return null;
        var k = i.gap;
        i = i.width;
        g = {
            flexBasis: g === "custom" ? void 0 : g === "doubleWidth" ? "calc((" + i + ") * 2 + " + k + "px)" : i
        };
        return h.jsx(c("FocusInertRegion.react"), {
            disabled: !b,
            children: h.jsx("div", {
                "aria-hidden": b,
                className: c("stylex")(t.card, o && t.cardRTL, u[k], e && t.cardExpanding, a),
                role: f,
                style: g,
                children: d
            })
        })
    }
    b.displayName = b.name + " [from " + f.id + "]";
    var s = function(a, b) {};
    p && (s = function(a, b) {
        var d = c("useUnsafeRef_DEPRECATED")(null);
        k(function() {
            var b, c = d.current;
            b = (b = a.current) == null ? void 0 : b.getDOMNode();
            c != null && b != null && (b.scrollLeft = c)
        }, [b, a]);
        b = (b = a.current) == null ? void 0 : b.getDOMNode();
        b != null && (d.current = b.scrollLeft)
    });
    var t = {
            buttonWrapper: {
                opacity: "x1hc1fzr",
                position: "x10l6tqk",
                top: "xwa60dl",
                transitionDuration: "x1d8287x",
                transitionProperty: "x19991ni",
                transitionTimingFunction: "xwji4o3",
                zIndex: "x1vjfegm",
                $$css: !0
            },
            card: {
                flexGrow: "x1c4vz4f",
                flexShrink: "x2lah0s",
                minWidth: "xeuugli",
                scrollSnapAlign: "x1bhewko",
                $$css: !0
            },
            cardExpanding: {
                display: "x78zum5",
                $$css: !0
            },
            cardRTL: {
                scrollSnapAlign: "x83psoy",
                $$css: !0
            },
            containerPaddingDefault: {
                paddingBottom: "xwib8y2",
                paddingTop: "x1y1aw1k",
                $$css: !0
            },
            hidden: {
                opacity: "xg01cxk",
                pointerEvents: "x47corl",
                $$css: !0
            },
            scrollContainer: {
                marginBottom: "x1wsgfga",
                marginTop: "x9otpla",
                $$css: !0
            },
            scrollView: {
                boxSizing: "x9f619",
                marginBottom: "xat24cr",
                paddingBottom: "xwib8y2",
                paddingTop: "x1y1aw1k",
                scrollbarWidth: "x1rohswg",
                $$css: !0
            },
            scrollViewNoScroll: {
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                $$css: !0
            },
            scrollViewSnap: {
                scrollSnapType: "xhfbhpw",
                $$css: !0
            }
        },
        u = {
            0: {
                marginEnd: "x11i5rnm",
                $$css: !0
            },
            4: {
                marginEnd: "xw3qccf",
                ":last-of-type_marginEnd": "xnqqybz",
                $$css: !0
            },
            8: {
                marginEnd: "x1emribx",
                ":last-of-type_marginEnd": "xnqqybz",
                $$css: !0
            },
            12: {
                marginEnd: "xq8finb",
                ":last-of-type_marginEnd": "xnqqybz",
                $$css: !0
            },
            16: {
                marginEnd: "xktsk01",
                ":last-of-type_marginEnd": "xnqqybz",
                $$css: !0
            }
        };
    g.HScrollContainer = a;
    g.HScrollChild = b
}), 98);
__d("useBaseHScrollFakeCards", ["BaseHScroll.react", "BaseHScrollConstants", "UserAgent", "react", "useEventHandler", "useResizeObserver"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = d("react").useState;

    function a(a) {
        var b = a.children,
            e = a.fakeCardXStyle,
            f = a.gap,
            g = a.isCircular,
            j = a.minWidth,
            k = a.onResize,
            l = a.peek,
            m = a.peekWidth;
        a = i(0);
        var n = a[0],
            o = a[1];
        a = c("useEventHandler")(function(a) {
            a = a.width;
            a = Math.min(a, d("BaseHScrollConstants").MAX_CONTAINER_WIDTH);
            var c = l ? m * 2 : 0;
            if (g) {
                a = Math.floor((a - c + f) / (j + f));
                b.length < a ? o(0) : o(a)
            }
            k()
        });
        a = c("useResizeObserver")(a);
        var p = n !== 0 ? b.slice(-n) : [];
        n = b.slice(0, n);
        p = g ? p.map(function(a, b) {
            return h.createElement(d("BaseHScroll.react").HScrollChild, babelHelpers["extends"]({}, a.props, {
                "aria-hidden": !0,
                key: "head-" + b,
                xstyle: [a.props.xstyle, e]
            }))
        }) : null;
        n = g ? n.map(function(a, b) {
            return h.createElement(d("BaseHScroll.react").HScrollChild, babelHelpers["extends"]({}, a.props, {
                "aria-hidden": !0,
                key: "tail-" + b,
                xstyle: [a.props.xstyle, e]
            }))
        }) : null;
        var q = function(a) {
            var b = a.isRTL,
                e = a.isRTLScrollFromMaxScroll;
            a = a.scrollRef;
            var g = (a = a.current) == null ? void 0 : a.getDOMNode();
            if (g != null) {
                var h = c("UserAgent").isBrowser("IE") || c("UserAgent").isBrowser("Edge");
                a = g.offsetWidth;
                var i = g.scrollLeft,
                    j = g.scrollWidth,
                    k = 0,
                    n = b ? -(j - a) : j - a,
                    o = function(a) {
                        var c = function(a) {
                            g.scrollTo == null ? void 0 : g.scrollTo(a, 0)
                        };
                        if (b && !h)
                            if (e.current) {
                                var d = g.scrollWidth - g.getBoundingClientRect().width;
                                c(d - a)
                            } else c(-a);
                        else c(a)
                    },
                    p = l ? m * 2 : 0,
                    q = d("BaseHScrollConstants").WIGGLE_ROOM / 2;
                if (i >= k - q && i <= k + q) {
                    k = j - 2 * a + p - f;
                    o(k)
                }
                if (i >= n - q && i <= n + q) {
                    j = a - p + f;
                    o(j)
                }
            }
        };
        return [p, n, a, q]
    }
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("LSOptimisticUnsendMessage", ["LSIssueNewTaskWithExtraOperations"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments,
            c = a[a.length - 1];
        c.n;
        var d = [],
            e = [],
            f;
        return c.seq([function(e) {
            return d[0] = new c.Map(), d[0].set("message_id", a[0]), d[1] = c.toJSON(d[0]), c.sp(b("LSIssueNewTaskWithExtraOperations"), "unsend_message", c.i64.cast([0, 33]), d[1], f, f, c.i64.cast([0, 0]), c.i64.cast([0, 0]), f, f, c.i64.cast([0, 0]), f)
        }, function(a) {
            return c.resolve(e)
        }])
    }
    c = a;
    f["default"] = c
}), 66);
__d("IGDBCAction", ["$InternalEnum"], (function(a, b, c, d, e, f) {
    a = b("$InternalEnum")({
        CLICK: "click",
        IMPRESSION: "impression",
        SWIPE: "swipe",
        TAP: "tap",
        TOGGLE: "toggle",
        VIEW: "view"
    });
    c = a;
    f["default"] = c
}), 66);
__d("IGDBCSource", ["$InternalEnum"], (function(a, b, c, d, e, f) {
    a = b("$InternalEnum")({
        ACCEPT_INVITE_BUTTON: "accept_invite_button",
        ACCEPT_USER_NUX_BUTTON: "accept_user_nux_button",
        ACTIVITY_FEED_ITEM: "activity_feed_item",
        ADD_COLLABORATOR: "add_collaborator",
        ADD_COLLABORATOR_BUTTON: "add_collaborator_button",
        ADD_COLLABORATOR_PROMO_BANNER: "add_collaborator_promo_banner",
        ADD_MODERATOR: "add_moderator",
        ADD_MODERATOR_BUTTON: "add_moderator_button",
        ADD_MODERATOR_PROMO_BANNER: "add_moderator_promo_banner",
        AMA_QUESTIONS_BUTTON: "ama_questions_button",
        BACK_BUTTON: "back_button",
        BLOCK_USER_BUTTON: "block_user_button",
        BROADCAST_CHAT_BUTTON: "broadcast_chat_button",
        BROADCAST_CHAT_INVITE_LINK: "broadcast_chat_invite_link",
        BROADCAST_CHAT_NOTIFICATION: "broadcast_chat_notification",
        BROADCAST_CHATS_NOTIFICATIONS: "broadcast_chats_notifications",
        BROADCAST_JCS_JOIN_CHAT_BUTTON: "broadcast_jcs_join_chat_button",
        BROADCAST_JOIN_CHAT_STICKER: "broadcast_join_chat_sticker",
        BROADCAST_THREAD_ITEM: "broadcast_thread_item",
        BULK_DELETE_WITH_BROADCAST_CHAT: "bulk_delete_with_broadcast_chat",
        BULK_DELETE_WITH_BROADCAST_CHAT_DIALOG: "bulk_delete_with_broadcast_chat_dialog",
        CAMERA_ICON: "camera_icon",
        CAROUSEL_NUX: "carousel_nux",
        CHANNEL_CONTROLS_ITEM: "channel_controls_item",
        CHANNEL_DURATION_SHEET: "channel_duration_sheet",
        CHANNEL_EYEBROW_LINK: "channel_eybrow_link",
        CHANNEL_ITEM: "channel_item",
        CHANNEL_LINK_BOTTOM_SHEET: "channel_link_bottom_sheet",
        CHANNEL_NAME: "channel_name",
        CHANNEL_OPTION: "channel_options",
        CHAT_LINK_COPY_TEXT: "chat_link_copy_text",
        CHAT_PHOTO_PICKER: "chat_photo_picker",
        COLLABORATOR_INVITE_LIMIT_DIALOG: "collaborator_invite_limit_dialog",
        COMMENT_LIKE_BUTTON: "comment_like_button",
        COMMENT_OPTIONS_REMOVE: "comment_options_remove",
        COMMENT_OPTIONS_REPLY: "comment_options_reply",
        COMMENT_OPTIONS_REPORT: "comment_options_report",
        COMMENTS_COMPOSER: "comments_composer",
        COMMENTS_PILL: "comments_pill",
        COMMENTS_SHEET: "comments_sheet",
        COMMENTS_SWIPE_SHORTCUT: "comments_swipe_shortcut",
        COMMENTS_TOGGLE: "comments_toggle",
        COMMENTS_UPSELL_BANNER: "comments_upsell_banner",
        CREATE_BROADCAST_CHAT: "create_broadcast_chat",
        CREATE_BROADCAST_CHAT_BUTTON: "create_broadcast_chat_button",
        CREATE_BROADCAST_CHAT_ITEM: "create_broadcast_chat_item",
        CREATE_BUTTON: "create_button",
        CREATE_CHANNEL_VIEW: "create_channel_view",
        CUSTOMIZE_BUTTON: "customize_button",
        DECLINE_BUTTON: "decline_button",
        DECLINE_COLLABORATOR: "decline_collaborator",
        DECLINE_INVITE_BUTTON: "decline_invite_button",
        DECLINE_MODERATOR: "decline_moderator",
        DELETE_BROADCAST_CHAT: "delete_broadcast_chat",
        DELETE_CHAT_DIALOG: "delete_chat_dialog",
        DONE_BUTTON: "done_button",
        END_CHAT: "end_chat",
        END_CHAT_CTA_BUTTON: "end_chat_cta_button",
        END_CHAT_DIALOG: "end_chat_dialog",
        EXIT_USER_NUX_BUTTON: "exit_user_nux_button",
        FIRST_MESSAGE_BANNER: "first_message_banner",
        FOLLOW_TO_JOIN_CHAT_SHEET: "follow_to_join_chat_sheet",
        GET_STARTED_BUTTON: "get_started_button",
        GROUP_NAME_TEXTBOX: "group_name_textbox",
        INBOX_MULTISELECT_THREAD_OPTIONS: "inbox_multiselect_thread_options",
        INVITE_BUTTON: "invite_button",
        INVITE_COLLABORATOR_CTA: "invite_collaborator_cta",
        INVITE_LINK_JOIN_CHAT_BUTTON: "invite_link_join_chat_button",
        INVITE_LINK_SETTING: "invite_link_setting",
        INVITE_LINK_TOGGLE: "invite_link_toggle",
        JOIN_BROADCAST_CHAT: "join_broadcast_chat",
        JOIN_BROADCAST_CHAT_BUTTON: "join_broadcast_chat_button",
        JOIN_CHAT_BUTTON: "join_chat_button",
        JOIN_COLLABORATOR: "join_collaborator",
        JOIN_MODERATOR: "join_moderator",
        JOIN_WAITLIST_BUTTON: "join_waitlist_button",
        LEARN_MORE_BUTTON: "learn_more_button",
        LIMIT_TO_SUBSCRIBERS_TOGGLE: "limit_to_subscribers_toggle",
        MESSAGE_OPTIONS: "message_options",
        MESSAGE_OPTIONS_DIALOG: "message_options_dialog",
        MESSAGE_OPTIONS_DOT_MENU: "message_options_dot_menu",
        MESSAGE_REACTIONS: "message_reactions",
        MESSAGE_SNIPPET: "message_snippet",
        MIMICRY_UPSELL_BANNER: "mimicry_upsell_banner",
        MODERATOR_INVITE_LIMIT_DIALOG: "moderator_invite_limit_dialog",
        MUTE_CTA_BUTTON: "mute_cta_button",
        MUTE_MENTIONS_REPLIES_TOGGLE: "mute_mentions_replies_toggle",
        MUTE_MESSAGE_TOGGLE: "mute_message_toggle",
        MUTE_REACTIONS_TOGGLE: "mute_reactions_toggle",
        OMNIPICKER_VIEW: "omnipicker_view",
        OPEN_BROADCAST_CHAT: "open_broadcast_chat",
        OPEN_CHAT_SHEET: "open_chat_sheet",
        PHOTO_SELECTOR: "photo_selector",
        PIN_CHANNEL_TOGGLE: "pin_channel_toggle",
        PIN_TO_PROFILE_TOGGLE: "pin_to_profile_toggle",
        PLUS_BUTTON: "plus_button",
        POLL_RESPONSES: "poll_responses",
        POST_STORY_BROADCAST_JCS: "post_story_broadcast_jcs",
        PROFILE_VIEW: "profile_view",
        PROMPT: "prompt",
        QP_VIEW: "qp_view",
        REACTION_LIST: "reaction_list",
        REMOVE_BUTTON: "remove_button",
        REMOVE_CHAT_DIALOG: "remove_chat_dialog",
        REMOVE_COLLABORATOR: "remove_collaborator",
        REMOVE_COLLABORATOR_DIALOG: "remove_collaborator_dialog",
        REMOVE_MODERATOR: "remove_moderator",
        REMOVE_MODERATOR_DIALOG: "remove_moderator_dialog",
        REMOVE_VIDEO_BUTTON: "remove_video_button",
        REPLY_SWIPE_SHORTCUT: "reply_swipe_shortcut",
        REPORT_BUTTON: "report_button",
        REPORT_COMMENT_BUTTON: "report_comment_button",
        RESET_TEXT: "reset_text",
        RESIGN_COLLABORATOR: "resign_collaborator",
        RESIGN_COLLABORATOR_DIALOG: "resign_collaborator_dialog",
        RESIGN_CTA_BUTTON: "resign_cta_button",
        RESIGN_MODERATOR: "resign_moderator",
        RESIGN_MODERATOR_DIALOG: "resign_moderator_dialog",
        RESPONSE: "response",
        SAVE_TO_CHANNEL_BUTTON: "save_to_channel_button",
        SEARCH_RESULT_CHANNEL_ITEM: "search_result_channel_item",
        SEE_BROADCAST_CHAT_BUTTON: "see_broadcast_chat_button",
        SEE_CHANNEL_BUTTON: "see_channel_button",
        SEE_CHANNEL_TOOLTIP: "see_channel_tooltip",
        SEE_EXAMPLE_BUTTON: "see_example_button",
        SEND_LINK_CTA_BUTTON: "send_link_cta_button",
        SEND_LINK_INSTAGRAM_TEXT: "send_link_instagram_text",
        SHARE_BUTTON: "share_button",
        SHARE_TO_STORY_CTA_BUTTON: "share_to_story_cta_button",
        SHARE_TO_STORY_LINK_BUTTON: "share_to_story_link_button",
        SHARE_TO_STORY_MESSAGE: "share_to_story_message",
        SHARE_TO_STORY_MESSAGE_BUTTON: "share_to_story_message_button",
        SHARED_MEDIA: "shared_media",
        SHOW_ON_PROFILE_TOGGLE: "show_on_profile_toggle",
        START_BROADCAST_CHAT_BUTTON: "start_broadcast_chat_button",
        SUBSCRIBE_TO_JOIN_CHAT_SHEET: "subscribe_to_join_chat_sheet",
        THEME_SELECTOR: "theme_selector",
        THREAD_LIST_ITEM: "thread_list_item",
        THREAD_SWIPE_OPTIONS: "thread_swipe_options",
        UNSEND_MESSAGE: "unsend_message",
        UPSELL_BUTTON: "upsell_button",
        USER_DOT_MENU: "user_dot_menu",
        USER_PROFILE_HEADER: "user_profile_header",
        VIEW_REACTIONS_BUTTON: "view_reactions_button",
        VIEW_SEEN_ACTIVE_COUNT: "view_seen_active_count",
        WATCH_NOW_BUTTON: "watch_now_button",
        WELCOME_VIDEO_CREATION: "welcome_video_creation",
        WELCOME_VIDEO_PIP: "welcome_video_pip",
        WELCOME_VIDEO_REPLACE_BUTTON: "welcome_video_replace_button",
        WELCOME_VIDEO_SETTINGS: "welcome_video_settings",
        WELCOME_VIDEO_THUMBNAIL: "welcome_video_thumbnail"
    });
    c = a;
    f["default"] = c
}), 66);
__d("useIGDBroadcastChannelUnsendMessageLogger", ["MWCMThreadTypes.react", "ReQL", "promiseDone", "react", "useIGDBroadcastChannelLogger", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a(a, b) {
        var e = a.threadSubtype != null && d("MWCMThreadTypes.react").isIGBroadcastChannelThread(a.threadSubtype),
            f = c("useIGDBroadcastChannelLogger")(a.threadKey),
            g = c("useReStore")(),
            i = h(function(a, d, e) {
                c("promiseDone")(f({
                    action: a,
                    event: d,
                    extra: {
                        mid: b.messageId
                    },
                    parent_surface: "broadcast",
                    source: e,
                    surface: "thread_view"
                }))
            }, [f, b.messageId]),
            j = h(function() {
                if (e) {
                    i("tap", "unsend_message_attempt", "message_options_dialog");
                    var c = d("ReQL").fromTableAscending(g.table("messages")).getKeyRange(a.threadKey, b.timestampMs, b.messageId).subscribe(function(a, b) {
                        b.operation === "put" && b.value.unsentTimestampMs != null && (i("view", "unsend_message_successful", "unsend_message"), c())
                    })
                }
            }, [g, e, i, b.messageId, b.timestampMs, a.threadKey]),
            k = h(function() {
                e && i("view", "unsend_message_error", "unsend_message")
            }, [e, i]);
        return {
            onClick: j,
            onReject: k
        }
    }
    g["default"] = a
}), 98);
__d("useMAWPRevokeMessage", ["I64", "LSIntEnum", "MAWBridgeSendAndReceive", "MAWDbMsg", "MAWJobDefinitions", "MAWTimedJob", "MWLSDefaultThreadSource", "MWPActor.react", "WAJobOrchestratorTypes", "promiseDone", "react", "requireDeferred", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useMemo,
        i = c("requireDeferred")("MWLogSend.bs").__setRef("useMAWPRevokeMessage");

    function a(a) {
        var b = d("MWPActor.react").useActor(),
            e = c("useReStore")(),
            f = d("MWLSDefaultThreadSource").useHook();
        return h(function() {
            return function(g) {
                var h = g.messageId,
                    j = g.threadKey;
                g = d("MAWDbMsg").toMsgId(h);
                if (g == null) return;
                c("promiseDone")(d("MAWBridgeSendAndReceive").sendAndReceive("backend", "getProtocolMsgIdByMsgId", {
                    msgId: g
                }).then(function(c) {
                    var g;
                    if (c == null) return;
                    var h = (g = a == null ? void 0 : a.threadType) != null ? g : d("LSIntEnum").ofNumber(15),
                        k = f(j);
                    i.onReady(function(a) {
                        var f = d("I64").to_string(j);
                        return a.log(e, j, h, c.externalId, [], b, k, 26, !1, 0, 1, f, void 0, void 0, void 0)
                    });
                    return d("MAWTimedJob").TimedUIJobStarters.waitUntilCompleted(d("MAWJobDefinitions").jobSerializers.revokeMsgs([c], {
                        priority: d("WAJobOrchestratorTypes").JOB_PRIORITY.UI_ACTION
                    }))
                }))
            }
        }, [e, b, a])
    }
    g["default"] = a
}), 98);
__d("MWV2LogMessageClick.bs", ["I64", "LSMessagingThreadTypeUtil", "Promise", "ReQL.bs", "UserAgentData", "promiseDone", "requireDeferred"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = c("requireDeferred")("LsMessageClickFalcoEvent").__setRef("MWV2LogMessageClick.bs");

    function a(a, e, f, g, i) {
        i = e.threadKey;
        c("promiseDone")(d("ReQL.bs").first(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(a.table("threads")), {
            hd: i,
            tl: 0
        })).then(function(a) {
            a != null && !d("LSMessagingThreadTypeUtil").isSecure(a.threadType) && h.onReady(function(a) {
                a.log(function() {
                    var a = {};
                    g != null && (a.action = g);
                    a.browserName = c("UserAgentData").browserName;
                    return {
                        click: {
                            category: 2
                        },
                        click_target: {
                            type: f
                        },
                        extra: JSON.stringify(a),
                        message: {
                            id: e.messageId,
                            sender_id: void 0,
                            sent_time: d("I64").to_float(e.timestampMs)
                        },
                        thread: {
                            id: d("I64").to_string(e.threadKey),
                            key: void 0,
                            type: void 0
                        },
                        xma: void 0
                    }
                })
            });
            return b("Promise").resolve()
        }))
    }
    g.log = a
}), 98);
__d("useMWV2GlobalRemoveMessage", ["LSFactory", "LSOptimisticUnsendMessage", "LSPlatformWaitForTaskCompletion", "MWV2LogMessageClick.bs", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a() {
        var a = c("useReStore")();
        return h(function(b) {
            d("MWV2LogMessageClick.bs").log(a, b, 47);
            return c("LSPlatformWaitForTaskCompletion")(a, function(a) {
                return c("LSOptimisticUnsendMessage")(b.messageId, c("LSFactory")(a))
            }, "optimisticUnsendMessage")
        }, [a])
    }
    g["default"] = a
}), 98);
__d("IGDMessageUnsendDialog.react", ["fbt", "IGDSActionDialog.react", "IGDSDialogItem.react", "LSMessagingThreadTypeUtil", "MWLSThread", "promiseDone", "react", "useIGDBroadcastChannelUnsendMessageLogger", "useMAWPRevokeMessage", "useMWV2GlobalRemoveMessage"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useCallback;

    function k(a) {
        var b = a.message,
            e = a.onClose;
        a = a.thread;
        var f = c("useMWV2GlobalRemoveMessage")(),
            g = c("useMAWPRevokeMessage")(a),
            k = d("LSMessagingThreadTypeUtil").isSecure(a.threadType),
            l = c("useIGDBroadcastChannelUnsendMessageLogger")(a, b);
        a = j(function() {
            k ? g(b) : (l.onClick(), c("promiseDone")(f(b), function() {}, l.onReject)), e()
        }, [k, b, e, l, f, g]);
        return i.jsxs(c("IGDSActionDialog.react"), {
            body: h._("__JHASH__oSfhQWPikoo__JHASH__"),
            forceTop: !0,
            isVisible: !0,
            onModalClose: e,
            title: h._("__JHASH__HdevtT4EQpN__JHASH__"),
            children: [i.jsx(d("IGDSDialogItem.react").IGDSDialogItem, {
                color: "errorOrDestructive",
                onClick: a,
                children: h._("__JHASH__XpPA5BjJC8Y__JHASH__")
            }), i.jsx(d("IGDSDialogItem.react").IGDSDialogItem, {
                onClick: e,
                children: h._("__JHASH__KyxxxYIyMcs__JHASH__")
            })]
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.message;
        a = a.onClose;
        var c = d("MWLSThread").useThread(b.threadKey);
        return !c ? null : i.jsx(k, {
            message: b,
            onClose: a,
            thread: c
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("CometFacepile.react", ["fbt", "ix", "BaseContainerQueryElement.react", "CometComponentWithKeyCommands.react", "CometIcon.react", "CometKeys", "CometPressable.react", "CometProfilePhoto.react", "CometTooltip.react", "FocusGroup.react", "ReactDOMComet", "TetraText.react", "fbicon", "focusScopeQueries", "react", "stylex", "useCometUniqueID", "useIntersectionObserver"], (function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = d("react");
    b = d("react");
    var k = b.useCallback,
        l = b.useRef,
        m = b.useState;
    e = d("FocusGroup.react").createFocusGroup(d("focusScopeQueries").tabbableScopeQuery);
    var n = e[0],
        o = e[1],
        p = 4,
        q = 6,
        r = -4,
        s = {
            item: {
                position: "x1n2onr6",
                $$css: !0
            },
            items: {
                display: "x78zum5",
                flexDirection: "x1q0g3np",
                marginTop: "xhsvlbd",
                marginBottom: "x16pr9af",
                overflowX: "x6ikm8r",
                paddingTop: "x889kno",
                paddingBottom: "x1a8lsjc",
                position: "x1n2onr6",
                $$css: !0
            },
            itemWithActivity: {
                marginStart: "x1mnrxsn",
                $$css: !0
            },
            itemWithSpacing: {
                marginStart: "xsgj6o6",
                $$css: !0
            },
            overflow24: {
                height: "xxk0z11",
                width: "xvy4d1p",
                $$css: !0
            },
            overflow32: {
                height: "x10w6t97",
                width: "x1td3qas",
                $$css: !0
            },
            overflow40: {
                height: "x1vqgdyp",
                width: "x100vrsf",
                $$css: !0
            },
            overflow48: {
                height: "xsdox4t",
                width: "x1useyqa",
                $$css: !0
            },
            overflowItem: {
                alignItems: "x6s0dn4",
                borderTopStartRadius: "x14yjl9h",
                borderTopEndRadius: "xudhj91",
                borderBottomEndRadius: "x18nykt9",
                borderBottomStartRadius: "xww2gxu",
                display: "x78zum5",
                flexShrink: "x2lah0s",
                justifyContent: "xl56j7k",
                pointerEvents: "x71s49j",
                $$css: !0
            },
            overflowItemBg: {
                fill: "x1wnuiir",
                $$css: !0
            },
            overflowItemContainer: {
                bottom: "x1jn9clo",
                display: "x78zum5",
                end: "xds687c",
                flexDirection: "x1q0g3np",
                pointerEvents: "x47corl",
                position: "x10l6tqk",
                start: "x17qophe",
                top: "x1eu8d0j",
                $$css: !0
            },
            overflowItemOverlay: {
                fill: "x1wnuiir",
                opacity: "xg01cxk",
                transitionDuration: "x1ebt8du",
                transitionProperty: "x19991ni",
                transitionTimingFunction: "x1dhq9h",
                $$css: !0
            },
            overflowItemOverlayHovered: {
                fill: "x4bmajx",
                opacity: "x1hc1fzr",
                transitionDuration: "x1mq3mr6",
                $$css: !0
            },
            overflowItemOverlayPressed: {
                fill: "x1tgjyoi",
                opacity: "x1hc1fzr",
                transitionDuration: "x1mq3mr6",
                $$css: !0
            },
            overflowItemSVG: {
                bottom: "x1ey2m1c",
                end: "xds687c",
                position: "x10l6tqk",
                start: "x17qophe",
                top: "x13vifvy",
                $$css: !0
            },
            overlappingItem: {
                marginStart: "x139jcc6",
                $$css: !0
            },
            pressableItem: {
                borderTopStartRadius: "x14yjl9h",
                borderTopEndRadius: "xudhj91",
                borderBottomEndRadius: "x18nykt9",
                borderBottomStartRadius: "xww2gxu",
                display: "x1lliihq",
                $$css: !0
            },
            root: {
                display: "x78zum5",
                flexDirection: "xdt5ytf",
                $$css: !0
            },
            rootInline: {
                alignItems: "x6s0dn4",
                flexDirection: "x1q0g3np",
                $$css: !0
            },
            text: {
                paddingTop: "xz9dl7a",
                $$css: !0
            },
            textInline: {
                paddingStart: "x1e558r4",
                paddingTop: "xexx8yu",
                $$css: !0
            },
            wrapper: {
                paddingEnd: "xn6708d",
                paddingStart: "x1swvt13",
                paddingTop: "xyamay9",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.items,
            e = a.isOverlapping,
            f = e === void 0 ? !1 : e;
        e = a.isTextInline;
        e = e === void 0 ? !1 : e;
        var g = a.count,
            i = g === void 0 ? b.length : g;
        g = a.ellipsisTooltip;
        var k = a.linkProps,
            m = a.onPress,
            w = a.size,
            x = a.testid;
        x = a.testOnly_pressed;
        var y = x === void 0 ? !1 : x;
        x = a.text;
        a = a.withWrapper;
        var z = b.some(function(a) {
                return a.addOn != null
            }),
            A = b.some(function(a) {
                return ((a = a.addOn) == null ? void 0 : a.type) === "activityBadge"
            }),
            B = f ? r : A ? q : p,
            C = Math.min(i, b.length, e ? 3 : Infinity),
            D = l(null),
            E = c("useCometUniqueID")(),
            F = [{
                command: {
                    key: c("CometKeys").LEFT
                },
                description: h._("__JHASH__m_OLWX7kM2N__JHASH__"),
                handler: function() {}
            }, {
                command: {
                    key: c("CometKeys").RIGHT
                },
                description: h._("__JHASH__XPwbX58ULdf__JHASH__"),
                handler: function() {}
            }];
        z = j.jsxs("div", {
            className: "x78zum5 x1q0g3np xhsvlbd x16pr9af x6ikm8r x889kno x1a8lsjc x1n2onr6",
            ref: D,
            role: "row",
            children: [b.slice(0, C).map(function(a, b) {
                var d = a.containerComponent,
                    e = a.linkProps,
                    g = a.onPress,
                    h = a.testOnly_pressed;
                a = babelHelpers.objectWithoutPropertiesLoose(a, ["containerComponent", "linkProps", "onPress", "testOnly_pressed"]);
                return j.jsxs(j.Fragment, {
                    children: [j.jsx(c("BaseContainerQueryElement.react"), {
                        breakpoint: (b + 1) * (w + B) - B,
                        inverseToContainer: !0,
                        maxWidth: "100%",
                        minWidth: 0
                    }), j.jsx(t, babelHelpers["extends"]({}, a, {
                        Container: d,
                        FocusItemComponent: o,
                        divClassName: c("stylex")(s.item, b > 0 && s.itemWithSpacing, b > 0 && A && s.itemWithActivity, b > 0 && f && s.overlappingItem),
                        isOverlapped: f && b > 0,
                        isOverlapping: f,
                        parentRef: D,
                        pressableProps: g || e ? {
                            display: "inline",
                            linkProps: e,
                            onPress: g,
                            overlayDisabled: f,
                            overlayRadius: w / 2,
                            testOnly_pressed: h,
                            xstyle: s.pressableItem
                        } : null,
                        role: "cell",
                        shape: "circle",
                        size: w
                    }))]
                }, b)
            }), !z && (m || k) && j.jsxs("div", {
                className: "x1jn9clo x78zum5 xds687c x1q0g3np x47corl x10l6tqk x17qophe x1eu8d0j",
                children: [b.slice(0, Math.min(b.length, C < i ? C : i)).map(function(a, b) {
                    return b === 0 && i > 1 ? null : j.jsx(c("BaseContainerQueryElement.react"), {
                        breakpoint: (b + 1) * (w + B) - B,
                        maxWidth: b === i - 1 ? "100%" : w + B,
                        minWidth: 0
                    }, "overflowPusher" + b)
                }), j.jsx(v, {
                    FocusItemComponent: o,
                    "aria-label": h._("__JHASH__fu6soEiUs4x__JHASH__"),
                    count: i,
                    ellipsisTooltip: g,
                    linkProps: k,
                    onPress: m,
                    overlayDisabled: !0,
                    parentRef: D,
                    size: w,
                    spacing: B,
                    testid: void 0,
                    xstyle: [s.overflowItem, w === 24 && s.overflow24, w === 32 && s.overflow32, w === 40 && s.overflow40, w === 48 && s.overflow48],
                    children: function(a) {
                        var b = a.hovered;
                        a = a.pressed;
                        return j.jsxs(j.Fragment, {
                            children: [j.jsxs("svg", {
                                className: "x1ey2m1c xds687c x10l6tqk x17qophe x13vifvy",
                                height: w,
                                viewBox: "0 0 " + w + " " + w,
                                width: w,
                                children: [f && C > 1 && j.jsxs("mask", {
                                    id: E,
                                    suppressHydrationWarning: !0,
                                    children: [j.jsx("circle", {
                                        cx: w / 2,
                                        cy: w / 2,
                                        fill: "white",
                                        r: w / 2
                                    }), j.jsx("circle", {
                                        cx: -w / 2 + 4,
                                        cy: w / 2,
                                        fill: "black",
                                        r: w / 2 + 2
                                    })]
                                }), j.jsx("circle", babelHelpers["extends"]({
                                    className: "x1wnuiir",
                                    cx: w / 2,
                                    cy: w / 2,
                                    r: w / 2,
                                    suppressHydrationWarning: !0
                                }, f && C > 1 ? {
                                    mask: "url(#" + E + ")"
                                } : null)), j.jsx("circle", babelHelpers["extends"]({
                                    className: c("stylex")(s.overflowItemOverlay, b && s.overflowItemOverlayHovered, (a || y) && s.overflowItemOverlayPressed),
                                    cx: w / 2,
                                    cy: w / 2,
                                    r: w / 2,
                                    suppressHydrationWarning: !0
                                }, f && C > 1 ? {
                                    mask: "url(#" + E + ")"
                                } : null))]
                            }), j.jsx(c("CometIcon.react"), {
                                color: "white",
                                icon: u(w)
                            })]
                        })
                    }
                })]
            })]
        });
        b = j.jsxs("div", {
            className: c("stylex")(s.root, e && s.rootInline),
            "data-testid": void 0,
            role: "grid",
            children: [j.jsx(c("CometComponentWithKeyCommands.react"), {
                commandConfigs: F,
                children: j.jsx(n, {
                    orientation: "horizontal",
                    tabScopeQuery: d("focusScopeQueries").tabbableScopeQuery,
                    wrap: !0,
                    children: z
                })
            }), x != null ? j.jsx("div", {
                className: c("stylex")(s.text, e && s.textInline),
                children: j.jsx(c("TetraText.react"), {
                    color: "secondary",
                    type: "body3",
                    children: x
                })
            }) : null]
        });
        return a ? j.jsx("div", {
            className: "xn6708d x1swvt13 xyamay9",
            children: b
        }) : b
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function t(a) {
        var b = a.Container,
            e = a.FocusItemComponent,
            f = a.divClassName;
        a.isOverlapping;
        var g = a.parentRef,
            h = a.pressableProps;
        a = babelHelpers.objectWithoutPropertiesLoose(a, ["Container", "FocusItemComponent", "divClassName", "isOverlapping", "parentRef", "pressableProps"]);
        var i = m(!1),
            l = i[0],
            n = i[1];
        i = k(function(a) {
            var b = a.intersectionRatio;
            d("ReactDOMComet").flushSync(function() {
                n(b < .5)
            })
        }, []);
        i = c("useIntersectionObserver")(i, {
            root: function() {
                var a;
                return (a = g.current) != null ? a : null
            },
            threshold: .5
        });
        a = j.jsx(c("CometProfilePhoto.react"), babelHelpers["extends"]({}, a, {
            overlayDisabled: !0
        }));
        h && (a = j.jsx(c("CometPressable.react"), babelHelpers["extends"]({}, h, {
            disabled: l,
            role: "cell",
            children: a
        })));
        b && (a = j.jsx(b, {
            children: a
        }));
        return j.jsx("div", {
            className: f,
            ref: i,
            role: "cell",
            children: j.jsx(e, {
                disabled: l,
                children: a
            })
        })
    }
    t.displayName = t.name + " [from " + f.id + "]";

    function u(a) {
        switch (a) {
            case 32:
                return d("fbicon")._(i("484386"), 16);
            case 40:
            case 48:
                return d("fbicon")._(i("484388"), 24);
            default:
                return d("fbicon")._(i("484385"), 12)
        }
    }

    function v(a) {
        var b = a.FocusItemComponent;
        a.count;
        var e = a.ellipsisTooltip,
            f = a.parentRef,
            g = a.size,
            h = a.spacing;
        a = babelHelpers.objectWithoutPropertiesLoose(a, ["FocusItemComponent", "count", "ellipsisTooltip", "parentRef", "size", "spacing"]);
        var i = m(!1),
            l = i[0],
            n = i[1];
        i = m(null);
        var o = i[0],
            p = i[1];
        i = k(function(a) {
            var b = a.intersectionRatio;
            d("ReactDOMComet").flushSync(function() {
                n(b < .5)
            })
        }, []);
        i = c("useIntersectionObserver")(i, {
            root: function() {
                var a;
                return (a = f.current) != null ? a : null
            },
            threshold: .5
        });
        var q = function(a) {
            if (!a) return;
            a = f.current;
            if (!a) return;
            a = a.getBoundingClientRect();
            a = a.width;
            a = Math.floor((a + h) / (g + h));
            p(a - 1)
        };
        a = j.jsx(c("CometPressable.react"), babelHelpers["extends"]({}, a, {
            ref: i,
            role: "cell"
        }));
        e && (a = j.jsx(c("CometTooltip.react"), {
            align: "middle",
            onVisibilityChange: q,
            position: "below",
            tooltip: o != null ? e(o) : "",
            children: a
        }));
        return j.jsxs(b, {
            disabled: l,
            children: [" ", a, " "]
        })
    }
    v.displayName = v.name + " [from " + f.id + "]";
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("MWV2ChatReactionsTooltip.react", ["fbt", "FBLogger", "I64", "LSAuthorityLevel", "LSClearReactionsV2DetailsAndRange", "LSContactBlockedByViewerStatus", "LSContactGender", "LSContactIdType", "LSContactType", "LSContactViewerRelationship", "LSContactWorkForeignEntityType", "LSFactory", "LSIntEnum", "LSIssueReactionsV2DetailsUsersListFetch", "LSVerifyContactRowExists", "MWLSThread", "MWPActor.react", "Promise", "ReQL", "ReQLSuspense", "intlSummarizeNumber", "promiseDone", "react", "useIsReactionsV2Enabled", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    e = d("react");
    var j = e.useEffect,
        k = e.useMemo,
        l = 9;

    function m(a) {
        var b = c("useReStore")(),
            e = d("ReQLSuspense").useArray(function() {
                return a == null ? d("ReQL").empty() : d("ReQL").fromTableAscending(b.table("contextual_profile_v1").index("associatedEntityIdAndOwner")).getKeyRange(a)
            }, [b, a], f.id + ":53"),
            g = k(function() {
                var a = new Map();
                for (var b = e, c = Array.isArray(b), f = 0, b = c ? b : b[typeof Symbol === "function" ? Symbol.iterator : "@@iterator"]();;) {
                    var g;
                    if (c) {
                        if (f >= b.length) break;
                        g = b[f++]
                    } else {
                        f = b.next();
                        if (f.done) break;
                        g = f.value
                    }
                    g = g;
                    var h = g == null ? void 0 : g.profileName;
                    h != null && a.set(d("I64").to_string(g.ownerId), h)
                }
                return a
            }, [e]);
        return g
    }

    function a(a) {
        var b = a.messageId,
            c = a.reactions;
        a = a.threadKey;
        var e = d("MWLSThread").useThread(a, function(a) {
                return a.parentThreadKey
            }),
            f = d("useIsReactionsV2Enabled").useIsReactionsV2Enabled(a);
        return f ? i.jsx(o, {
            messageId: b,
            parentThreadKey: e,
            reactions: c,
            threadKey: a
        }) : i.jsx(n, {
            messageId: b,
            parentThreadKey: e,
            reactions: c,
            threadKey: a
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function n(a) {
        var e = a.messageId,
            g = a.parentThreadKey,
            n = a.reactions,
            o = a.threadKey,
            p = c("useReStore")(),
            q = d("ReQLSuspense").useArray(function() {
                return d("ReQL").leftJoin(d("ReQL").fromTableAscending(p.table("reactions")).getKeyRange(o, e), d("ReQL").fromTableAscending(p.table("contacts")))
            }, [p, o, e], f.id + ":115"),
            r = m(g);
        j(function() {
            c("promiseDone")(p.runInTransaction(function(a) {
                return b("Promise").all(q.map(function(e) {
                    e = e[1];
                    if (e != null) return c("LSVerifyContactRowExists")(e.id, d("LSIntEnum").ofNumber(c("LSContactIdType").FBID), void 0, void 0, d("LSIntEnum").ofNumber(c("LSContactType").USER), void 0, void 0, void 0, void 0, !1, !1, d("LSIntEnum").ofNumber(c("LSContactBlockedByViewerStatus").UNBLOCKED), void 0, !1, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").CLIENT_PARTIAL), void 0, void 0, d("LSIntEnum").ofNumber(c("LSContactWorkForeignEntityType").UNKNOWN), d("LSIntEnum").ofNumber(c("LSContactGender").UNKNOWN), d("LSIntEnum").ofNumber(c("LSContactViewerRelationship").UNKNOWN), void 0, c("LSFactory")(a));
                    else return b("Promise").resolve()
                }))
            }, "readwrite"))
        }, [p, q]);
        a = k(function() {
            var a = new Map(q.map(function(a) {
                    var b = a[1];
                    b == null && c("FBLogger")("messenger_web_product").debug("missing contact for reaction tooltip");
                    return [d("I64").to_string(a[0].actorId), b != null ? b.name : h._("__JHASH__AaE4hJExM0x__JHASH__")]
                })),
                b = n.map(function(b) {
                    b = d("I64").to_string(b.actorId);
                    if (r.has(b)) return r.get(b);
                    b = a.get(b);
                    if (b == null) return "";
                    else return b
                }).filter(function(a) {
                    return a !== ""
                }),
                e = b.length;
            b = b.slice(0, l);
            if (e > l) {
                e = e - l;
                b.push(h._("__JHASH__KVtJcih6CQz__JHASH__", [h._plural(e), h._param("count", String(e))]))
            }
            return b
        }, [r, n, q]);
        g = a.map(function(a, b) {
            return i.jsx("div", {
                children: a
            }, String(b))
        });
        return i.jsx("div", {
            children: g
        })
    }
    n.displayName = n.name + " [from " + f.id + "]";

    function o(a) {
        var b, e = a.messageId,
            g = a.parentThreadKey,
            k = a.threadKey,
            n = c("useReStore")();
        j(function() {
            c("promiseDone")(n.runInTransaction(function(a) {
                return c("LSClearReactionsV2DetailsAndRange")(c("LSFactory")(a))
            }, "readwrite")), c("promiseDone")(n.runInTransaction(function(a) {
                return c("LSIssueReactionsV2DetailsUsersListFetch")(k, e, void 0, void 0, c("LSFactory")(a))
            }, "readwrite"))
        }, [n, k, e]);
        var o = m(g);
        a = d("ReQLSuspense").useArray(function() {
            return d("ReQL").fromTableAscending(n.table("reactions_v2_details")).getKeyRange(k, e).map(function(a) {
                var b;
                return (b = o.get(d("I64").to_string(a.reactorId))) != null ? b : a.fullName
            })
        }, [n, o, k, e], f.id + ":248");
        g = d("ReQLSuspense").useArray(function() {
            return d("ReQL").fromTableAscending(n.table("reactions_v2")).getKeyRange(k, e)
        }, [n, k, e], f.id + ":261");
        var p = g ? g.map(function(a) {
            return a.viewerIsReactor
        }) : [];
        p = p.length > 0 ? p.reduce(function(a, b) {
            return a || b
        }) : !1;
        var q = d("MWPActor.react").useActor(),
            r = d("ReQLSuspense").useFirst(function() {
                return d("ReQL").fromTableAscending(n.table("contacts")).getKeyRange(q)
            }, [n, q], f.id + ":280");
        g = g ? g.map(function(a) {
            return d("I64").to_int32(a.count)
        }).filter(function(a) {
            return a > 0
        }) : [];
        b = (b = (r == null ? void 0 : r.id) != null ? o.get(d("I64").to_string(r.id)) : null) != null ? b : r == null ? void 0 : r.name;
        JSON.stringify(g) === JSON.stringify([1]) && p && b != null && a.length === 0 ? a.push(b) : p && a[0] != null && r && b != null && ((g = a[0]) == null ? void 0 : g.toString()) !== b && a.unshift(b);
        p = h._("__JHASH__GTBXwO8BaZr__JHASH__");
        r = a.slice(0, l);
        if (a.length > l) {
            g = a.length - l;
            r.push(h._("__JHASH__KVtJcih6CQz__JHASH__", [h._plural(g), h._param("count", String(c("intlSummarizeNumber")(g)))]))
        }
        b = r.length === 0 ? p : r.map(function(a, b) {
            return i.jsx("div", {
                children: a
            }, String(b))
        });
        return i.jsx("div", {
            children: b
        })
    }
    o.displayName = o.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWMessageReactionsContainer.react", ["I64", "MWChatReactionEmoji.bs", "MWChatReactionsUtils.bs", "MWV2ChatReactionsTooltip.react", "MWXTooltip.react", "intlSummarizeNumber", "react", "stylex", "useIsReactionDialogEnabled"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            emoji: {
                alignItems: "x6s0dn4",
                backgroundColor: "x2bj2ny",
                borderTopStartRadius: "x14yjl9h",
                borderTopEndRadius: "xudhj91",
                borderBottomEndRadius: "x18nykt9",
                borderBottomStartRadius: "xww2gxu",
                lineHeight: "x14ju556",
                $$css: !0
            },
            emojiMargin: {
                marginEnd: "xcwd3tp",
                $$css: !0
            },
            emojiNum: {
                color: "xi81zsa",
                fontSize: "x1ncwhqj",
                lineHeight: "x14ju556",
                minWidth: "xdhweic",
                paddingEnd: "x150jy0e",
                paddingStart: "x1e558r4",
                textAlign: "x2b8uid",
                $$css: !0
            },
            emojiRow: {
                alignItems: "x6s0dn4",
                backgroundColor: "x2bj2ny",
                borderTopStartRadius: "x1a2cdl4",
                borderTopEndRadius: "xnhgr82",
                borderBottomEndRadius: "x1qt0ttw",
                borderBottomStartRadius: "xgk8upj",
                boxShadow: "x10vwrwz",
                display: "x78zum5",
                justifyContent: "xl56j7k",
                paddingTop: "x4p5aij",
                paddingEnd: "x19um543",
                paddingBottom: "x1j85h84",
                paddingStart: "x1m6msm",
                textAlign: "xp4054r",
                $$css: !0
            },
            emojiWithCursor: {
                cursor: "x1ypdohk",
                $$css: !0
            },
            scaleHeartEmoji: {
                transform: "xhqu4j4",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.count,
            e = a.emojis,
            f = a.message,
            g = a.reactions,
            k = a.reactionsV2;
        a = a.threadKey;
        f = f.messageId;
        k = k != null ? k.map(function(a) {
            return d("I64").to_int32(a.count)
        }).reduce(function(a, b) {
            return a + b
        }, 0) : 0;
        var l = c("useIsReactionDialogEnabled")(a);
        k = k > 1 ? k : b;
        var m = k > 1;
        b = e.map(function(a, b) {
            var f = m || b !== e.length - 1,
                g = d("MWChatReactionsUtils.bs").isHeart(a[0]);
            return h.jsx("div", {
                className: c("stylex")(i.emoji, l ? i.emojiWithCursor : !1, f ? i.emojiMargin : !1),
                children: h.jsx("div", {
                    className: c("stylex")(g ? i.scaleHeartEmoji : !1),
                    children: h.jsx(d("MWChatReactionEmoji.bs").make, {
                        emoji: a,
                        size: 16,
                        testid: void 0
                    })
                })
            }, String(b))
        });
        b = h.jsxs("div", {
            className: "x6s0dn4 x2bj2ny x1a2cdl4 xnhgr82 x1qt0ttw xgk8upj x10vwrwz x78zum5 xl56j7k x4p5aij x19um543 x1j85h84 x1m6msm xp4054r",
            role: "none",
            children: [b, m ? h.jsx(j, {
                reactionCount: k
            }) : null]
        });
        return l ? h.jsx(c("MWXTooltip.react"), {
            align: "middle",
            position: "above",
            tooltip: h.jsx(c("MWV2ChatReactionsTooltip.react"), {
                messageId: f,
                reactions: g,
                threadKey: a
            }),
            children: b
        }) : b
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function j(a) {
        a = a.reactionCount;
        a = c("intlSummarizeNumber")(a);
        var b = a.length;
        return h.jsx("div", {
            className: "xi81zsa x1ncwhqj x14ju556 xdhweic x150jy0e x1e558r4 x2b8uid",
            role: "none",
            style: {
                width: b + "ch"
            },
            children: a
        })
    }
    j.displayName = j.name + " [from " + f.id + "]";
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("MWPTransparentMessageBubble.bs", ["react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = 36;
    e = b + 6 | 0;
    e + 14 | 0;
    var i = {
        bubble: {
            maxWidth: "x1okitfd",
            overflowX: "x6ikm8r",
            overflowY: "x10wlt62",
            overflowWrap: "x1mzt3pk",
            paddingTop: "xm7lytj",
            paddingEnd: "xn6708d",
            paddingBottom: "xwib8y2",
            paddingStart: "x1ye3gou",
            position: "x1n2onr6",
            wordBreak: "x13faqbe",
            ":after_borderTopColor": "xzackxk",
            ":after_borderEndColor": "x1vvs6jl",
            ":after_borderBottomColor": "x1p8yz0e",
            ":after_borderStartColor": "x1e72984",
            ":after_borderTopStartRadius": "x1qxsuse",
            ":after_borderTopEndRadius": "x1pwr4jm",
            ":after_borderBottomEndRadius": "xgt0i0e",
            ":after_borderBottomStartRadius": "xhiudvi",
            ":after_borderTopStyle": "x1ikrcl6",
            ":after_borderEndStyle": "xrlr1mf",
            ":after_borderBottomStyle": "x13m8g0b",
            ":after_borderStartStyle": "x1wea3ti",
            ":after_borderTopWidth": "x1pdxsal",
            ":after_borderEndWidth": "xgyc039",
            ":after_borderBottomWidth": "xza5l1d",
            ":after_borderStartWidth": "xcavrb8",
            ":after_bottom": "x1p4c0ny",
            ":after_content": "x5l10my",
            ":after_display": "xieozyd",
            ":after_end": "x14rr3af",
            ":after_pointerEvents": "x1kx6eu5",
            ":after_position": "x1x824oc",
            ":after_start": "x1fefmpr",
            ":after_top": "x1a3valx",
            $$css: !0
        },
        incoming_connect_bot: {
            ":after_borderBottomStartRadius": "x1fyu3th",
            $$css: !0
        },
        incoming_connect_top: {
            ":after_borderTopStartRadius": "xe80118",
            $$css: !0
        },
        outgoing_connect_bot: {
            ":after_borderBottomEndRadius": "x7yvbyb",
            $$css: !0
        },
        outgoing_connect_top: {
            ":after_borderTopEndRadius": "x1chp5k1",
            $$css: !0
        },
        precedes_xma: {
            boxSizing: "x9f619",
            maxWidth: "xw5ewwj",
            width: "xh8yej3",
            ":after_borderBottomEndRadius": "x1bxxhgu",
            ":after_borderBottomStartRadius": "x1yn7maq",
            $$css: !0
        }
    };

    function a(a) {
        var b = a.children,
            d = a.connectBottom,
            e = a.connectTop,
            f = a.outgoing;
        a = a.precedesXMA;
        return h.jsx("div", {
            className: c("stylex")(i.bubble, e ? f ? i.outgoing_connect_top : i.incoming_connect_top : !1, !a && d ? f ? i.outgoing_connect_bot : i.incoming_connect_bot : !1, a ? i.precedes_xma : !1),
            role: "none",
            children: b
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    d = a;
    g.make = d
}), 98);
__d("MWV2ChatBubble.react", ["MWPColorUtils", "MWPMessageIsReply.bs", "MWPSolidMessageBubble.bs", "MWPThreadTheme.bs", "MWPTransparentMessageBubble.bs", "gkx", "react", "stylex", "useMWInlineStylesForReply", "xmaLayouts"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            emphasis_ring: {
                backgroundColor: "xjbqb8w",
                borderTop: "xkaxx8j",
                borderEnd: "xif9i9b",
                borderBottom: "x1ueo1nx",
                borderStart: "x1jawzb3",
                display: "x78zum5",
                maxWidth: "x1hvl878",
                position: "x1n2onr6",
                "::after_borderTopColor": "xs65dz8",
                "::after_borderEndColor": "x12bj33z",
                "::after_borderBottomColor": "x15uivxv",
                "::after_borderStartColor": "xbxgwnb",
                "::after_borderTopStartRadius": "xquudas",
                "::after_borderTopEndRadius": "x6p43zf",
                "::after_borderBottomEndRadius": "x1wnhr99",
                "::after_borderBottomStartRadius": "x1gquc79",
                "::after_borderTopStyle": "xynf4tj",
                "::after_borderEndStyle": "xdspwft",
                "::after_borderBottomStyle": "x1r9ni5o",
                "::after_borderStartStyle": "x1d52zm6",
                "::after_borderTopWidth": "x31ga2r",
                "::after_borderEndWidth": "xcmxnv6",
                "::after_borderBottomWidth": "x13afdcp",
                "::after_borderStartWidth": "x10va8jt",
                "::after_bottom": "xdb1ctf",
                "::after_content": "x1s928wv",
                "::after_display": "xhkezso",
                "::after_end": "x4bhatf",
                "::after_pointerEvents": "x2q1x1w",
                "::after_position": "x1j6awrg",
                "::after_start": "xhg89tr",
                "::after_top": "x7kqs8i",
                "::after_zIndex": "xitxdhh",
                "::before_borderTopColor": "xdxy94m",
                "::before_borderEndColor": "xt7heth",
                "::before_borderBottomColor": "xq7m7h9",
                "::before_borderStartColor": "xp0hy2t",
                "::before_borderTopStartRadius": "x2e93ah",
                "::before_borderTopEndRadius": "xigdz7j",
                "::before_borderBottomEndRadius": "x1vxwiij",
                "::before_borderBottomStartRadius": "xfgw0w6",
                "::before_borderTopStyle": "xnvurfn",
                "::before_borderEndStyle": "xv1ta3e",
                "::before_borderBottomStyle": "x1opv7go",
                "::before_borderStartStyle": "x1dtnpoi",
                "::before_borderTopWidth": "x1b8stmw",
                "::before_borderEndWidth": "xyhsekn",
                "::before_borderBottomWidth": "xmbliey",
                "::before_borderStartWidth": "x1igdxxj",
                "::before_bottom": "xe80sof",
                "::before_content": "x1cpjm7i",
                "::before_display": "x1fgarty",
                "::before_end": "x105ji64",
                "::before_opacity": "x1u3qutx",
                "::before_pointerEvents": "xkk1bqk",
                "::before_position": "x1hmns74",
                "::before_start": "xbs7dl3",
                "::before_top": "x51xajf",
                "::before_zIndex": "x12maryy",
                $$css: !0
            },
            emphasis_ring_before_xma: {
                borderBottom: "x112ta8",
                "::after_borderBottom": "x1bxl7c5",
                "::after_borderBottomEndRadius": "x1qo8dsh",
                "::after_borderBottomStartRadius": "x1oiup0q",
                "::before_borderBottom": "xozyfcf",
                "::before_borderBottomEndRadius": "x1nxuetn",
                "::before_borderBottomStartRadius": "x1doa7m0",
                $$css: !0
            },
            emphasis_ring_connect_bottom_incoming: {
                "::after_borderBottomStartRadius": "x1573djm",
                "::before_borderBottomStartRadius": "x106tphz",
                $$css: !0
            },
            emphasis_ring_connect_bottom_outgoing: {
                "::after_borderBottomEndRadius": "x1nb2ndt",
                "::before_borderBottomEndRadius": "x7ft4bm",
                $$css: !0
            },
            emphasis_ring_connect_top_incoming: {
                "::after_borderTopStartRadius": "x14nzmgs",
                "::before_borderTopStartRadius": "x58eeit",
                $$css: !0
            },
            emphasis_ring_connect_top_outgoing: {
                "::after_borderTopEndRadius": "xe41ffp",
                "::before_borderTopEndRadius": "x1cbhpwz",
                $$css: !0
            },
            emphasis_ring_xma: {
                borderTop: "x76ihet",
                width: "x1o2z316",
                "::after_borderTop": "x12dgpll",
                "::after_borderTopEndRadius": "x1utvphz",
                "::after_borderTopStartRadius": "x17dqjr0",
                "::before_borderTop": "xp2bjph",
                "::before_borderTopEndRadius": "xajc7s",
                "::before_borderTopStartRadius": "x1eo7yr1",
                $$css: !0
            }
        };

    function j(a, b) {
        if (c("gkx")("1969")) {
            var e = b ? a.outgoingGradientColors : a.incomingGradientColors;
            if (e != null && e.length > 0) return {
                backgroundColor: d("MWPColorUtils").int64ToHex(e[0].color)
            }
        }
        if (b) return {
            backgroundColor: d("MWPColorUtils").int64ToHex(a.threadTheme.fallbackColor)
        };
        else return {
            backgroundColor: "var(--wash)"
        }
    }

    function k(a) {
        var b = a.children,
            e = a.connectBottom,
            f = a.connectTop,
            g = a.gradientColors,
            i = a.outgoing,
            j = a.precedesXMA;
        a = a.threadTheme;
        a = c("useMWInlineStylesForReply")(a, g, i);
        return h.jsx(d("MWPSolidMessageBubble.bs").make, {
            connectBottom: e,
            connectTop: f,
            outgoing: i,
            precedesXMA: j,
            style: a,
            children: b
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function l(a) {
        var b = a.children,
            d = a.hasXMA,
            e = a.isBeforeXMA,
            f = a.isOutgoing,
            g = a.shouldConnectBottom;
        a = a.shouldConnectTop;
        e = [i.emphasis_ring, e ? i.emphasis_ring_before_xma : g ? f ? i.emphasis_ring_connect_bottom_outgoing : i.emphasis_ring_connect_bottom_incoming : !1, d ? a ? i.emphasis_ring_xma : !1 : a ? f ? i.emphasis_ring_connect_top_outgoing : i.emphasis_ring_connect_top_incoming : !1];
        return h.jsx("div", {
            className: c("stylex")(e),
            "data-testid": void 0,
            children: b
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.children,
            e = a.connectBottom,
            f = a.connectTop,
            g = a.hasEmphasisRing;
        g = g === void 0 ? !1 : g;
        var i = a.message,
            m = a.outgoing,
            n = a.precedesXMA;
        a = a.xmaLayout;
        a = a === void 0 ? d("xmaLayouts").XMA_LAYOUTS.DEFAULT : a;
        var o = d("MWPThreadTheme.bs").useHook(),
            p = m ? o.outgoingGradientColors : o.incomingGradientColors,
            q = o.threadTheme;
        i = c("MWPMessageIsReply.bs")(i);
        i = i ? h.jsx(k, {
            connectBottom: e,
            connectTop: f,
            gradientColors: p,
            outgoing: m,
            precedesXMA: n,
            threadTheme: q,
            children: b
        }) : c("gkx")("1969") && m && Boolean(q.backgroundUrl) ? h.jsx(d("MWPSolidMessageBubble.bs").make, {
            connectBottom: e,
            connectTop: f,
            outgoing: m,
            precedesXMA: n,
            style: j(o, m),
            xmaLayout: a,
            children: b
        }) : m && p.length > 1 ? h.jsx(d("MWPTransparentMessageBubble.bs").make, {
            connectBottom: e,
            connectTop: f,
            outgoing: m,
            precedesXMA: n,
            children: b
        }) : h.jsx(d("MWPSolidMessageBubble.bs").make, {
            connectBottom: e,
            connectTop: f,
            outgoing: m,
            precedesXMA: n,
            style: j(o, m),
            xmaLayout: a,
            children: b
        });
        return g ? h.jsx(l, {
            hasXMA: !1,
            isBeforeXMA: n,
            isOutgoing: m,
            shouldConnectBottom: e,
            shouldConnectTop: f,
            children: i
        }) : i
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g.EmphasisRing = l;
    g.ChatBubble = a
}), 98); /*FB_PKG_DELIM*/
__d("MWPinnedMessageList.react", ["CometColumn.react", "CometColumnItem.react", "CometPagelet.react", "I64", "LSMessagingThreadTypeUtil", "MWMessageRow.react", "MWPAriaLabelForMessageListGrid.bs", "MWPBaseMessageList_DEPRECATED.bs", "MWPMessageListFocusTable.bs", "MWPThreadCapabilitiesContext", "MWV2MessageActionsVisibility.bs", "ReQL", "ReQLSuspense", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useMemo,
        j = b.useState,
        k = function(a, b) {
            var c = d("ReQLSuspense").useArray(function() {
                return d("ReQL").mergeJoin(d("ReQL").fromTableAscending(b.table("participants")).getKeyRange(a.threadKey), d("ReQL").fromTableAscending(b.table("contacts")))
            }, [b, a], f.id + ":50");
            return c.reduce(function(a, b) {
                var c = b[0];
                b = b[1];
                return a.set(d("I64").to_string(b.id), [c, b])
            }, new Map())
        };

    function a(a) {
        var b = a.messages,
            e = a.thread;
        a = c("useReStore")();
        a = k(e, a);
        var f = d("MWPAriaLabelForMessageListGrid.bs").useHook(e),
            g = d("LSMessagingThreadTypeUtil").isSecure(e.threadType),
            l = d("MWV2MessageActionsVisibility.bs").useStopHoveringRef(),
            m = i(function() {
                return e.threadType
            }, [e]),
            n = j(""),
            o = n[0],
            p = n[1];
        return h.jsx(d("MWPBaseMessageList_DEPRECATED.bs").make, {
            messages: b,
            participants: a,
            renderRow: function(a) {
                var b = a.message,
                    c = a.nextMessage;
                a = a.prevMessage;
                var f = g ? e.threadKey === b.threadKey : !1;
                return h.jsx(d("MWMessageRow.react").MWMessageRow, {
                    displayMode: "pinnedMessages",
                    domElementRef: {
                        current: null
                    },
                    hasMessageEmphasisRing: !1,
                    isModal: o === b.messageId,
                    isSecureMessage: f,
                    message: b,
                    nextMessage: c,
                    prevMessage: a,
                    stopHoveringRef: l,
                    threadType: m
                })
            },
            thread: e,
            children: function(a) {
                return h.jsx("div", {
                    className: "x1hq5gj4",
                    children: h.jsx(d("CometPagelet.react").Placeholder, {
                        fallback: null,
                        name: "MWPinnedMessageList",
                        children: h.jsx(d("MWPThreadCapabilitiesContext").Provider, {
                            thread: e,
                            children: h.jsx(d("MWPMessageListFocusTable.bs").make, {
                                ariaLabel: f,
                                modal: o,
                                setModal: p,
                                children: h.jsx(c("CometColumn.react"), {
                                    hasDividers: !0,
                                    spacing: 8,
                                    children: a.map(function(a, b) {
                                        return h.jsx(c("CometColumnItem.react"), {
                                            children: a
                                        }, "pin_mes_" + b)
                                    })
                                })
                            })
                        })
                    })
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWPinnedMessagesInterstitialIcon.react", ["ix", "CometImageFromIXValue.react", "react", "stylex", "useCurrentDisplayMode"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    b = d("react").forwardRef;

    function a(a, b) {
        var d = a.alt;
        a = a.xstyle;
        var e = c("useCurrentDisplayMode")();
        e = e === "dark";
        e = e ? h("210429") : h("210430");
        d = i.jsx(c("CometImageFromIXValue.react"), {
            alt: d,
            objectFit: "cover",
            ref: b,
            source: e
        });
        return a == null ? d : i.jsx("div", {
            className: c("stylex")(a),
            children: d
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    e = b(a);
    g["default"] = e
}), 98);
__d("MWPinnedMessagesDialogNullState.react", ["fbt", "MDSTextPairing.react", "MWPinnedMessagesInterstitialIcon.react", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = h._("__JHASH__j5_7-TuMABc__JHASH__"),
        k = h._("__JHASH__57H7O12wuL5__JHASH__");

    function a() {
        return i.jsxs("div", {
            className: "x6s0dn4 x1q0q8m5 x1qhh985 xu3j5b3 xcfux6l x26u7qi xm0m39n x13fuv20 x972fbf x9f619 x78zum5 xdt5ytf x1iyjqo2 xs83m0k x5yr21d xl56j7k xat24cr x11i5rnm x1mh8g0r xdj266r x2lwn1j xeuugli x18d9i69 xxbr6pl xbbxn1n xexx8yu x1n2onr6 xh8yej3 x1ja2u2z",
            children: [i.jsx("div", {
                className: "xsag5q8 x1oysuqx",
                children: i.jsx(c("MWPinnedMessagesInterstitialIcon.react"), {})
            }), i.jsx(c("MDSTextPairing.react"), {
                body: i.jsx("div", {
                    className: "x1e56ztr x1xmf6yo",
                    children: k
                }),
                bodyColor: "tertiary",
                headline: j,
                headlineColor: "secondary",
                level: 4,
                reduceEmphasis: !0,
                textAlign: "center"
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWPinnedMessageListContainer.react", ["BaseTheme.react", "CometProgressRingIndeterminate.react", "CometScrollableArea.react", "LSFactory", "LSMessagePointQuery", "MWPinnedMessageList.react", "MWPinnedMessagesDialogNullState.react", "ReQL", "ReQLSuspense", "asyncToGeneratorRuntime", "promiseDone", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    e = d("react");
    var i = e.useCallback,
        j = e.useEffect,
        k = {
            centeredContainer: {
                alignItems: "x6s0dn4",
                display: "x78zum5",
                justifyContent: "xl56j7k",
                width: "xh8yej3",
                $$css: !0
            },
            container: {
                height: "x1egiwwb",
                $$css: !0
            },
            fullHeight: {
                height: "x5yr21d",
                $$css: !0
            }
        },
        l = {
            dark: {
                divider: "var(--hover-overlay)"
            },
            light: {
                divider: "var(--hover-overlay)"
            },
            type: "VARIABLES"
        };

    function a(a) {
        var e = a.threadKey,
            g = c("useReStore")(),
            m = d("ReQLSuspense").useFirst(function() {
                return d("ReQL").fromTableAscending(g.table("threads")).getKeyRange(e)
            }, [g, e], f.id + ":65"),
            n = d("ReQLSuspense").useArray(function() {
                return m == null ? d("ReQL").empty() : d("ReQL").fromTableDescending(g.table("msg_pinned_messages_v2").index("pinnedMessageDisplayOrder")).getKeyRange(m.threadKey).map(function(a) {
                    a = a.messageId;
                    var b = d("ReQLSuspense").first(d("ReQL").fromTableDescending(g.table("messages").index("messageId")).getKeyRange(a), f.id + ":81");
                    return {
                        message: b,
                        pinnedMessageId: a
                    }
                })
            }, [g, m], f.id + ":70");
        a = [];
        a = n.reduce(function(a, b) {
            b = b.message;
            return b != null ? [].concat(a, [b]) : a
        }, a);
        var o = n.some(function(a) {
                return a.message == null
            }),
            p = i(function() {
                var a = b("asyncToGeneratorRuntime").asyncToGenerator(function*(a, b) {
                    yield g.runInTransaction(function(d) {
                        return c("LSMessagePointQuery")(a.threadKey, b, a.threadType, c("LSFactory")(d))
                    }, "readwrite")
                });
                return function(b, c) {
                    return a.apply(this, arguments)
                }
            }(), [g]);
        j(function() {
            m && n.forEach(function(a) {
                var b = a.message;
                a = a.pinnedMessageId;
                b == null && c("promiseDone")(p(m, a))
            })
        }, [n, p, m]);
        return h.jsx("div", {
            className: "x1egiwwb",
            children: a.length === 0 && !o ? h.jsx(c("MWPinnedMessagesDialogNullState.react"), {}) : h.jsx(c("CometScrollableArea.react"), {
                expanding: !1,
                horizontal: !1,
                xstyle: k.fullHeight,
                children: h.jsxs(c("BaseTheme.react"), {
                    config: l,
                    children: [m && h.jsx(c("MWPinnedMessageList.react"), {
                        messages: a,
                        thread: m
                    }), o && h.jsx("div", {
                        className: "x6s0dn4 x78zum5 xl56j7k xh8yej3",
                        children: h.jsx(c("CometProgressRingIndeterminate.react"), {
                            color: "disabled",
                            size: 24
                        })
                    })]
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("WorkXMAContentContext", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    c = d("react");
    e = c.createContext;
    var h = c.useContext,
        i = e();

    function a() {
        return i.Provider
    }

    function b() {
        return h(i)
    }
    g.getProvider = a;
    g.useWorkXMAContentContext = b
}), 98);
__d("MWChatPollFacepile.bs", ["fbt", "ix", "CometImage.react", "CometPressable.react", "CometTintedIcon.react", "JSResourceForInteraction", "MWV2MessageRowIsRowFocusedContext.bs", "MWXTooltip.react", "MWXTooltipGroup.react", "WorkXMAContentContext", "fbicon", "react", "stylex", "useCometLazyDialog"], (function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = d("react"),
        k = d("react").useContext,
        l = {
            contact: {
                borderTopStartRadius: "x14yjl9h",
                borderTopEndRadius: "xudhj91",
                borderBottomEndRadius: "x18nykt9",
                borderBottomStartRadius: "xww2gxu",
                $$css: !0
            },
            contactGapNegative: {
                marginStart: "xrzrlj5",
                $$css: !0
            },
            contactGapNormal: {
                marginStart: "xsgj6o6",
                $$css: !0
            },
            contactLarge: {
                height: "x10w6t97",
                width: "x1td3qas",
                $$css: !0
            },
            contactMedium: {
                height: "x1qx5ct2",
                width: "xw4jnvo",
                $$css: !0
            },
            contactSmall: {
                height: "x1v9usgg",
                width: "x6jxa94",
                $$css: !0
            },
            contactWithBorder: {
                borderTopColor: "x1exxf4d",
                borderTopStyle: "x13fuv20",
                borderTopWidth: "x178xt8z",
                marginTop: "x1y332i5",
                $$css: !0
            },
            overflow: {
                backgroundColor: "x1vtvx1t",
                borderTopStartRadius: "x1rcc7c0",
                borderTopEndRadius: "xbtbmw4",
                borderBottomEndRadius: "x1lie4ck",
                borderBottomStartRadius: "x16hxpj1",
                boxSizing: "x9f619",
                color: "xi81zsa",
                fontSize: "x1nxh6w3",
                fontWeight: "xk50ysn",
                height: "x1qx5ct2",
                lineHeight: "x1u7k74",
                marginBottom: "x4ii5y1",
                marginStart: "xrzrlj5",
                marginTop: "xr1yuqi",
                paddingTop: "x1nn3v0j",
                paddingEnd: "x1sxyh0",
                paddingBottom: "x1120s5i",
                paddingStart: "xurb0ha",
                $$css: !0
            },
            overflowOverlay: {
                alignItems: "x6s0dn4",
                backgroundColor: "xdit8p8",
                borderTopStartRadius: "x14yjl9h",
                borderTopEndRadius: "xudhj91",
                borderBottomEndRadius: "x18nykt9",
                borderBottomStartRadius: "xww2gxu",
                bottom: "x1ey2m1c",
                display: "x78zum5",
                end: "xds687c",
                justifyContent: "xl56j7k",
                opacity: "x1us6l5c",
                overflowX: "x6ikm8r",
                overflowY: "x10wlt62",
                position: "x10l6tqk",
                start: "x17qophe",
                top: "x13vifvy",
                zIndex: "x1vjfegm",
                $$css: !0
            },
            photoWrap: {
                display: "x1rg5ohu",
                marginBottom: "x4ii5y1",
                marginTop: "xr1yuqi",
                position: "x1n2onr6",
                $$css: !0
            },
            root: {
                display: "x78zum5",
                $$css: !0
            },
            rootReversed: {
                flexDirection: "x15zctf7",
                $$css: !0
            }
        };

    function m(a) {
        var b = a.align,
            d = a.children,
            e = a.position;
        a = a.tooltip;
        if (a != null) return j.jsx(c("MWXTooltip.react"), {
            align: function() {
                switch (b) {
                    case "start":
                        return "start";
                    case "middle":
                        return "middle";
                    case "end_":
                        return "end";
                    case "stretch":
                        return "stretch"
                }
            }(),
            position: function() {
                switch (e) {
                    case "below":
                        return "below";
                    case "above":
                        return "above";
                    case "start":
                        return "start";
                    case "end_":
                        return "end"
                }
            }(),
            tooltip: a,
            children: d
        });
        else return d
    }

    function a(a) {
        var b = a.gap,
            e = a.direction,
            f = a.limit,
            g = a.contactWithBorder,
            n = a.overflowStyle,
            o = a.contacts,
            p = a.countOverride,
            q = a.optionId,
            r = a.size,
            s = b != null ? b : "normal",
            t = e != null ? e : "normal",
            u = f != null ? f : 2,
            v = g != null ? g : !0,
            w = n != null ? n : "showTotalCount",
            x = o.length > u;
        if (x && w === "showTotalCount") {
            a = o.slice(0, -u | 0).reverse().filter(function(a) {
                return a.name != null
            }).map(function(a) {
                a = a.name;
                if (a != null) return a;
                else return ""
            });
            b = a.length === 0 ? void 0 : j.jsx("ul", {
                children: a.map(function(a, b) {
                    return j.jsx("li", {
                        children: a
                    }, String(b))
                })
            });
            e = j.jsx(m, {
                align: "middle",
                position: "above",
                tooltip: b,
                children: j.jsx("div", {
                    className: "x1vtvx1t x1rcc7c0 xbtbmw4 x1lie4ck x16hxpj1 x9f619 xi81zsa x1nxh6w3 xk50ysn x1qx5ct2 x1u7k74 x4ii5y1 xrzrlj5 xr1yuqi x1nn3v0j x1sxyh0 x1120s5i xurb0ha",
                    children: "+" + String((p != null ? p : o.length) - 2 | 0)
                })
            })
        } else e = null;
        f = j.jsxs(c("MWXTooltipGroup.react"), {
            children: [e, o.slice(-(x ? u : 1e3) | 0).reverse().map(function(a, b) {
                return j.jsxs("div", {
                    className: c("stylex")(l.photoWrap, s === "normal" ? l.contactGapNormal : l.contactGapNegative, r === "medium" ? l.contactMedium : r === "small" ? l.contactSmall : l.contactLarge),
                    children: [j.jsx(m, {
                        align: "middle",
                        position: "above",
                        tooltip: a.name,
                        children: j.jsx(c("CometImage.react"), {
                            src: a.profile_picture_url,
                            xstyle: [l.contact, r === "medium" ? l.contactMedium : r === "small" ? l.contactSmall : l.contactLarge, v ? l.contactWithBorder : !1]
                        })
                    }), x && w === "overlayLastPhoto" && b === (u - 1 | 0) ? j.jsx("div", {
                        className: "x6s0dn4 xdit8p8 x14yjl9h xudhj91 x18nykt9 xww2gxu x1ey2m1c x78zum5 xds687c xl56j7k x1us6l5c x6ikm8r x10wlt62 x10l6tqk x17qophe x13vifvy x1vjfegm",
                        children: j.jsx(c("CometTintedIcon.react"), {
                            color: "white",
                            icon: d("fbicon")._(i("484386"), 16)
                        })
                    }) : null]
                }, String(b))
            })]
        });
        var y = d("WorkXMAContentContext").useWorkXMAContentContext();
        g = k(d("MWV2MessageRowIsRowFocusedContext.bs").context);
        var z = g.setIsDialogOpened,
            A = g.setFocused;
        if (q != null && y != null) {
            n = c("useCometLazyDialog")(c("JSResourceForInteraction")("ChatLSGeminiChatPollFacepileDialog.react").__setRef("MWChatPollFacepile.bs"));
            var B = n[0];
            return j.jsx(c("CometPressable.react"), {
                "aria-label": h._("__JHASH__WPE2y-osfy7__JHASH__").toString(),
                onPress: function() {
                    z(function() {
                        return !0
                    });
                    return B({
                        onHide: function() {
                            z(function() {
                                return !1
                            });
                            return A(function() {
                                return !0
                            })
                        },
                        optionId: q,
                        pollId: y
                    }, function() {})
                },
                overlayDisabled: !0,
                xstyle: function() {
                    return [l.root, t === "reversed" ? l.rootReversed : !1]
                },
                children: f
            })
        }
        return j.jsx("div", {
            className: c("stylex")(l.root, t === "reversed" ? l.rootReversed : !1),
            children: f
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98); /*FB_PKG_DELIM*/
__d("RTCCallState.bs", ["I64", "LSIntEnum", "LSRtcCallState", "recoverableViolation"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function h(a) {
        if (d("I64").equal(a, d("LSIntEnum").ofNumber(2))) return !0;
        else return d("I64").equal(a, d("LSIntEnum").ofNumber(8))
    }

    function a(a, b) {
        if (d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSRtcCallState").NO_ONGOING_CALL))) return "NO_ONGOING_CALL";
        else if (d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSRtcCallState").AUDIO_GROUP_CALL)))
            if (h(b)) return "AUDIO_GROUP_CALL";
            else return "AUDIO_1TO1_CALL";
        else if (d("I64").equal(a, d("LSIntEnum").ofNumber(c("LSRtcCallState").VIDEO_GROUP_CALL)))
            if (h(b)) return "VIDEO_GROUP_CALL";
            else return "VIDEO_1TO1_CALL";
        else {
            c("recoverableViolation")("Unknown RTCCallState: " + (d("I64").to_string(a) + ("L and threadType combination: " + (d("I64").to_string(b) + "L"))), "messenger_web_product");
            return "NO_ONGOING_CALL"
        }
    }
    g.ofLsRtcCallState = a
}), 98);
__d("getMWLSOngoingCallServerInfoData", ["ReQL"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a, b) {
        return d("ReQL").fromTableAscending(a.table("rtc_ongoing_calls_on_threads_v2")).getKeyRange(b).map(function(a) {
            return a.ongoingCallServerInfoData
        })
    }
    g["default"] = a
}), 98);
__d("useMWLSGetOngoingCallState", ["MWLSThread", "MWThreadKey.react"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a() {
        var a = d("MWThreadKey.react").useMWThreadKeyMemoizedExn();
        return d("MWLSThread").useThread(a, function(a) {
            return a.ongoingCallState
        })
    }
    g["default"] = a
}), 98);
__d("MWLSStartPhoneCall.bs", ["I64", "Int64Hooks", "LSIntEnum", "LSMessagingThreadTypeUtil", "MWPActor.react", "MWThreadKey.react", "Promise", "RTCCallState.bs", "ReQL", "ReQL.bs", "getMWLSOngoingCallServerInfoData", "promiseDone", "recoverableViolation", "useMWLSGetOngoingCallState", "useRTWebCometStartCallCallback", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a() {
        var a = c("useReStore")(),
            e = c("useRTWebCometStartCallCallback")(),
            f = d("MWThreadKey.react").useMWThreadKeyMemoizedExn(),
            g = c("useMWLSGetOngoingCallState")(),
            h = d("MWPActor.react").useActor(),
            i = d("Int64Hooks").useCallbackInt64(function(i, j, k) {
                var l = i ? "video" : "audio";
                c("promiseDone")(b("Promise").all([d("ReQL.bs").first(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(a.table("threads")), {
                    hd: f,
                    tl: 0
                })), d("ReQL.bs").first(d("ReQL.bs").map(d("ReQL.bs").filter(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(a.table("participants")), {
                    hd: f,
                    tl: 0
                }), function(a) {
                    return !d("I64").equal(a.contactId, h)
                }), function(a) {
                    return d("I64").to_string(a.contactId)
                })), d("ReQL.bs").first(d("ReQL.bs").map(d("ReQL.bs").getKeyRange(d("ReQL.bs").fromTableAscending(a.table("mi_act_mapping_table")), {
                    hd: f,
                    tl: 0
                }), function(a) {
                    return a.jid
                }))]).then(function(h) {
                    var i = h[0],
                        m = h[1],
                        n = h[2];
                    if (i == null) {
                        c("recoverableViolation")("Cannot find thread when trying to call someone", "messenger_web_product");
                        return
                    }
                    return d("ReQL").firstAsync(c("getMWLSOngoingCallServerInfoData")(a, f)).then(function(a) {
                        return b("Promise").resolve(e({
                            existingCall: g != null && a != null ? {
                                call_state: d("RTCCallState.bs").ofLsRtcCallState(g, i.threadType),
                                initiator_fbid: null,
                                server_info_data: a
                            } : null,
                            isE2eeMandated: d("LSMessagingThreadTypeUtil").isSecure(i.threadType),
                            mediaType: l,
                            thread: {
                                e2eeThreadID: n == null ? void 0 : d("I64").to_string(n),
                                id: j,
                                secureOneToOneThreadPeerId: m != null && d("I64").equal(i.threadType, d("LSIntEnum").ofNumber(15)) ? m : void 0,
                                type: d("I64").to_int32(i.threadType)
                            },
                            trigger: k
                        }))
                    })
                }), void 0, function(a) {
                    c("recoverableViolation")("Error making a phone call", "rtc_www", {
                        error: a.Error
                    })
                })
            }, [h, e, f, a, g]),
            j = g != null ? d("I64").equal(g, d("I64").one) ? {
                _0: void 0,
                TAG: 1
            } : d("I64").equal(g, d("I64").of_string("2")) ? {
                _0: void 0,
                TAG: 0
            } : void 0 : void 0;
        return [i, j]
    }
    g.useMakeRTCCall = a
}), 98);
__d("MWStartRTCCallUtils", ["MWLSStartPhoneCall.bs", "MessengerDesktopDeepLinkUtils", "MessengerDesktopDeeplinkEventFalcoEvent", "MessengerDesktopLocalServerRequest", "ODS", "Promise", "gkx", "promiseDone", "qex", "react", "uuidv4"], (function(a, b, c, d, e, f, g) {
    "use strict";
    e = d("react");
    var h = e.useCallback,
        i = e.useEffect,
        j = e.useRef,
        k = e.useState;

    function l() {
        var a = k(!1),
            b = a[0],
            e = a[1],
            f = j(!1);
        i(function() {
            if (f.current) return;
            f.current = !0;
            if (c("gkx")("1987549") || !d("MessengerDesktopDeepLinkUtils").isMessengerDesktopDeeplinkEligible()) return;
            if (c("qex")._("45") !== !0) return;
            d("ODS").bumpEntityKey(3303, "dapp_calling_entrypoints", "is_dapp_running");
            c("promiseDone")(d("MessengerDesktopDeepLinkUtils").isMessengerDesktopRunning(d("MessengerDesktopDeepLinkUtils").PORT).then(function(a) {
                if (!a || a !== 200) {
                    a || d("ODS").bumpEntityKey(3303, "dapp_calling_entrypoints", "localhost_did_not_respond");
                    a === 500 && d("ODS").bumpEntityKey(3303, "dapp_calling_entrypoints", "localhost_responded_but_crashed");
                    return
                }
                e(!0)
            }))
        });
        return b
    }

    function m(a) {
        var e = j(c("uuidv4")()).current;
        return h(function(f, g, h) {
            var i = "/call?threadid=" + g + "&isvideocall=" + (f ? 1 : 0) + "&funnel_id=" + e;
            d("ODS").bumpEntityKey(3303, "dapp_calling_entrypoints", "initiating_dapp_call");
            n({
                funnelSessionId: e
            });
            c("promiseDone")(b("Promise").all([new(c("MessengerDesktopLocalServerRequest"))(i, d("MessengerDesktopDeepLinkUtils").PORT).setOnLoadEndHandler(function() {}).setErrorHandler(function(b) {
                d("ODS").bumpEntityKey(3303, "dapp_calling_entrypoints", "call_failed_with_error_" + b), a(f, g, h)
            }).setTimeoutHandler(function() {
                d("ODS").bumpEntityKey(3303, "dapp_calling_entrypoints", "call_timed_out"), a(f, g, h)
            }).send()]))
        }, [a, e])
    }

    function a() {
        var a = l(),
            b = d("MWLSStartPhoneCall.bs").useMakeRTCCall();
        b = b[0];
        var c = m(b);
        return a ? c : b
    }

    function n(a) {
        var b = a.funnelSessionId;
        c("MessengerDesktopDeeplinkEventFalcoEvent").logImmediately(function() {
            return {
                event: "attempt_localhost_deeplink",
                eventLocation: "browser",
                eventType: "call",
                funnelSessionId: b,
                mobile_app_source: "unknown"
            }
        })
    }
    g.useShouldTryWithMessengerDesktop = l;
    g.useStartRTCCall = a;
    g.logCallAttemptViaLocalhost = n
}), 98); /*FB_PKG_DELIM*/
__d("MessengerDesktopPresenceInfo", ["FBLogger", "WebStorage"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = "__fb_messenger_desktop_presence_info";

    function a() {
        var a = c("WebStorage").getLocalStorageForRead();
        return JSON.parse((a = a == null ? void 0 : a.getItem(h)) != null ? a : "null")
    }

    function b() {
        var a = c("WebStorage").getLocalStorage();
        if (a == null) {
            c("FBLogger")("desktop_messenger_deeplink_presence", "local_storage_not_found").warn("Messenger Desktop Presence Token cannot be created if local storage doesn't exist");
            return null
        }
        var b = {
            lastActiveTimestamp: Date.now()
        };
        a = c("WebStorage").setItemGuarded(a, h, JSON.stringify(b));
        a != null && c("FBLogger")("desktop_messenger_deeplink_presence", "create_presence_info_error").warn(a.toString());
        return b
    }
    g.getPresenceInfo = a;
    g.createPresenceInfo = b
}), 98);
__d("MessengerDesktopLocalServerRequest", ["ConstUriUtils", "MessengerDesktopPresenceInfo"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = 2e3;
    a = function() {
        function a(a, b) {
            var c = this;
            this.$1 = function() {
                c.request.status === 200 && d("MessengerDesktopPresenceInfo").createPresenceInfo()
            };
            b = "http://localhost:" + b + a;
            this.uri = (a = (a = d("ConstUriUtils").getUri(b)) == null ? void 0 : a.toString()) != null ? a : b;
            this.request = new XMLHttpRequest();
            this.request.timeout = h;
            this.request.onloadend = this.$1
        }
        var b = a.prototype;
        b.setOnLoadEndHandler = function(a) {
            var b = this;
            this.request.onloadend = function() {
                b.$1(), a(b.request.status)
            };
            return this
        };
        b.setErrorHandler = function(a) {
            var b = this;
            this.request.onerror = function() {
                b.request.status === 500 && d("MessengerDesktopPresenceInfo").createPresenceInfo(), a(b.request.status)
            };
            return this
        };
        b.setTimeoutHandler = function(a) {
            this.request.ontimeout = a;
            return this
        };
        b.send = function() {
            this.request.open("GET", this.uri), this.request.send()
        };
        return a
    }();
    g["default"] = a
}), 98);
__d("XMessengerDotComDesktopLaunchAppInterstitialControllerRouteBuilder", ["jsRouteBuilder"], (function(a, b, c, d, e, f, g) {
    a = c("jsRouteBuilder")("/desktop/launch/", Object.freeze({}), void 0);
    b = a;
    g["default"] = b
}), 98);
__d("MessengerDesktopDeepLinkUtils", ["fbt", "MessengerDesktopLocalServerRequest", "MessengerDesktopPresenceInfo", "MessengerDesktopPromoEventLogger", "ODS", "Promise", "UserAgent", "XMessengerDotComDesktopControllerRouteBuilder", "XMessengerDotComDesktopLaunchAppInterstitialControllerRouteBuilder", "gkx", "promiseDone", "qex", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = i.useCallback,
        k = i.useEffect,
        l = i.useRef,
        m = i.useState,
        n = "messenger",
        o = 3103,
        p = 1e3 * 60 * 60 * 24 * 28,
        q = "https://www.messenger.com/desktop/";

    function a(a) {
        return n + "://room?joinurl=" + a
    }

    function r(a) {
        return new(b("Promise"))(function(b) {
            new(c("MessengerDesktopLocalServerRequest"))("/ping", a).setOnLoadEndHandler(function(a) {
                return b(a)
            }).setTimeoutHandler(function(a) {
                return b(!1)
            }).setErrorHandler(function(a) {
                return b(!1)
            }).send()
        })
    }

    function e() {
        var a = d("MessengerDesktopPresenceInfo").getPresenceInfo();
        return a == null ? !1 : Date.now() - a.lastActiveTimestamp <= p
    }

    function s() {
        var a = c("gkx")("655"),
            b = c("gkx")("4716");
        if (b) {
            b = c("gkx")("4687");
            return a || b
        } else return a
    }

    function f() {
        return c("gkx")("5542")
    }

    function t() {
        if (c("gkx")("1987549") || !s()) return !1;
        switch (w()) {
            case "Windows":
                return c("qex")._("167") === !0;
            case "Mac":
                return c("gkx")("297");
            default:
                return !1
        }
    }

    function u() {
        var a = m(!1),
            b = a[0];
        a = a[1];
        var e = m(!1),
            f = e[0],
            g = e[1];
        if (w() !== "Windows") return !1;
        if (c("gkx")("1987549") || !s()) return !1;
        if (c("qex")._("167") !== !0) return !1;
        if (b) return f;
        d("ODS").bumpEntityKey(3303, "dapp_non_calling_entrypoints", "initiating_dapp_call");
        a(!0);
        c("promiseDone")(r(o).then(function(a) {
            if (!a || a !== 200) {
                a || d("ODS").bumpEntityKey(3303, "dapp_non_calling_entrypoints", "localhost_did_not_respond");
                a === 500 && d("ODS").bumpEntityKey(3303, "dapp_non_calling_entrypoints", "localhost_responded_but_crashed");
                return
            }
            g(!0)
        }));
        return f
    }
    var v = {
        openMessengerForDesktop: h._("__JHASH__XxNs-oGUpT___JHASH__"),
        openMessengerForMac: h._("__JHASH__tlUlAHzvu6R__JHASH__"),
        openMessengerForWindows: h._("__JHASH__3NgfF3NHofM__JHASH__"),
        tryMessengerForDesktop: h._("__JHASH___P6bnngRU_E__JHASH__"),
        tryMessengerForMac: h._("__JHASH__3Fm9-zbx5PN__JHASH__"),
        tryMessengerForWindows: h._("__JHASH__56Y2Um9FCTk__JHASH__")
    };

    function w() {
        if (c("UserAgent").isPlatform("Windows")) return "Windows";
        else if (c("UserAgent").isPlatform("Mac OS X")) return "Mac";
        return "Desktop"
    }

    function x(a) {
        return (a = c("XMessengerDotComDesktopControllerRouteBuilder").buildUri({
            funnel_session_id: a
        }).setDomain("www.messenger.com")) == null ? void 0 : (a = a.setProtocol("https")) == null ? void 0 : a.toString()
    }

    function y(a) {
        return (a = c("XMessengerDotComDesktopLaunchAppInterstitialControllerRouteBuilder").buildUri(a).setDomain("messenger.com")) == null ? void 0 : (a = a.setProtocol("https")) == null ? void 0 : a.toString()
    }

    function z() {
        var a = s() ? "open" : "try",
            b = w();
        return v[a + "MessengerFor" + b]
    }

    function A(a) {
        var b;
        return s() ? (b = y(a)) != null ? b : q : (b = x(a.funnel_session_id)) != null ? b : q
    }

    function B(a, b) {
        var c = l(!1);
        k(function() {
            c.current || (c.current = !0, d("MessengerDesktopPromoEventLogger").log({
                event: "Impression",
                funnelSessionId: a,
                location: b
            }))
        }, [a, b]);
        return j(function() {
            d("MessengerDesktopPromoEventLogger").log({
                event: "Click",
                funnelSessionId: a,
                location: b
            })
        }, [a, b])
    }
    g.PORT = o;
    g.getRoomDeepLink = a;
    g.isMessengerDesktopRunning = r;
    g.isMessengerDesktopProbablyInstalled = e;
    g.isMessengerDesktopDeeplinkEligible = s;
    g.isMessengerDesktopPromoEligible = f;
    g.isMessengerDesktopDeeplinkEnabled = t;
    g.useMessengerDesktopWindowsDeeplinkSwitcher = u;
    g.getDeeplinkButtonLabel = z;
    g.getDeeplinkButtonURI = A;
    g.useMessengerDesktopPromoEventLogger = B
}), 98); /*FB_PKG_DELIM*/
__d("MessengerPlatformClientTypedLogger", ["Banzai", "GeneratedLoggerUtils"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        function a() {
            this.$1 = {}
        }
        var c = a.prototype;
        c.log = function(a) {
            b("GeneratedLoggerUtils").log("logger:MessengerPlatformClientLoggerConfig", this.$1, b("Banzai").BASIC, a)
        };
        c.logVital = function(a) {
            b("GeneratedLoggerUtils").log("logger:MessengerPlatformClientLoggerConfig", this.$1, b("Banzai").VITAL, a)
        };
        c.logImmediately = function(a) {
            b("GeneratedLoggerUtils").log("logger:MessengerPlatformClientLoggerConfig", this.$1, {
                signal: !0
            }, a)
        };
        c.clear = function() {
            this.$1 = {};
            return this
        };
        c.getData = function() {
            return babelHelpers["extends"]({}, this.$1)
        };
        c.updateData = function(a) {
            this.$1 = babelHelpers["extends"]({}, this.$1, a);
            return this
        };
        c.setAppID = function(a) {
            this.$1.appid = a;
            return this
        };
        c.setAppversion = function(a) {
            this.$1.appversion = a;
            return this
        };
        c.setClientUserID = function(a) {
            this.$1.client_userid = a;
            return this
        };
        c.setClienttime = function(a) {
            this.$1.clienttime = a;
            return this
        };
        c.setCountry = function(a) {
            this.$1.country = a;
            return this
        };
        c.setDeviceid = function(a) {
            this.$1.deviceid = a;
            return this
        };
        c.setExtraClientData = function(a) {
            this.$1.extra_client_data = a;
            return this
        };
        c.setIsemployee = function(a) {
            this.$1.isemployee = a;
            return this
        };
        c.setLoggingToken = function(a) {
            this.$1.logging_token = a;
            return this
        };
        c.setName = function(a) {
            this.$1.name = a;
            return this
        };
        c.setRawclienttime = function(a) {
            this.$1.rawclienttime = a;
            return this
        };
        c.setSessionid = function(a) {
            this.$1.sessionid = a;
            return this
        };
        c.setThreadID = function(a) {
            this.$1.thread_id = a;
            return this
        };
        return a
    }();
    c = {
        appid: !0,
        appversion: !0,
        client_userid: !0,
        clienttime: !0,
        country: !0,
        deviceid: !0,
        extra_client_data: !0,
        isemployee: !0,
        logging_token: !0,
        name: !0,
        rawclienttime: !0,
        sessionid: !0,
        thread_id: !0
    };
    f["default"] = a
}), 66);
__d("GraphQLMessengerPlatformCtaPostHandlingMutation_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "4973572169363354"
}), null);
__d("GraphQLMessengerPlatformCtaPostHandlingMutation.graphql", ["GraphQLMessengerPlatformCtaPostHandlingMutation_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "input"
            }],
            c = [{
                alias: null,
                args: [{
                    kind: "Variable",
                    name: "data",
                    variableName: "input"
                }],
                concreteType: "MessengerPlatformCtaPostHandlingResponsePayload",
                kind: "LinkedField",
                name: "messenger_platform_cta_post_handling",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    kind: "ScalarField",
                    name: "client_mutation_id",
                    storageKey: null
                }],
                storageKey: null
            }];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "GraphQLMessengerPlatformCtaPostHandlingMutation",
                selections: c,
                type: "Mutation",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "GraphQLMessengerPlatformCtaPostHandlingMutation",
                selections: c
            },
            params: {
                id: b("GraphQLMessengerPlatformCtaPostHandlingMutation_facebookRelayOperation"),
                metadata: {},
                name: "GraphQLMessengerPlatformCtaPostHandlingMutation",
                operationKind: "mutation",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("XMNCommerceCTAPostProcessController", ["XController"], (function(a, b, c, d, e, f) {
    e.exports = b("XController").create("/messages/commerce/cta/postprocess/", {
        cta_id: {
            type: "String",
            required: !0
        },
        message_id: {
            type: "String"
        }
    })
}), null);
__d("MNCommerceCTAProcessor", ["AsyncRequest", "CurrentUser", "GraphQLMessengerPlatformCtaPostHandlingMutation.graphql", "MessengerPlatformClientTypedLogger", "PopupWindow", "WebGraphQLMutationHelper", "XMNCommerceCTAPostProcessController", "nullthrows"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = function() {
        function a() {}
        var b = a.prototype;
        b.process = function(a, b) {
            b === void 0 && (b = null);
            var e = d("PopupWindow").open("", 500, 1024);
            a = c("XMNCommerceCTAPostProcessController").getURIBuilder().setString("cta_id", a).setString("message_id", b).getURI();
            new(c("AsyncRequest"))().setURI(a).setMethod("POST").setHandler(function(a) {
                return e.location = a.payload
            }).send()
        };
        b.postHandle = function(a, b) {
            a = d("WebGraphQLMutationHelper").getMutationURI(c("nullthrows")(c("GraphQLMessengerPlatformCtaPostHandlingMutation.graphql").params.id), {
                cta_id: a,
                message_id: b
            });
            new(c("AsyncRequest"))().setURI(a).send()
        };
        b.logCTAClick = function(a) {
            var b, d;
            d = (d = a) != null ? d.logging_token : d;
            var e = d ? JSON.parse(d).click_source : "UNKNOWN";
            e = {
                action_id: (b = a) != null ? b.id : b,
                action_type: (b = a) != null ? b.action_type : b,
                action_url: ((b = a) != null ? b.action_url : b) || ((b = a) != null ? b.action_link : b),
                click_source: e,
                page_id: (b = a) != null ? b.page_id : b
            };
            new(c("MessengerPlatformClientTypedLogger"))().setClientUserID(c("CurrentUser").getID()).setName("did_tap_call_to_action").setExtraClientData(JSON.stringify(e)).setLoggingToken(d).log()
        };
        return a
    }();
    b = new a();
    g["default"] = b
}), 98); /*FB_PKG_DELIM*/
__d("MWV2SeenHead.bs", ["GenderConst", "I64", "LSIntEnum", "LSMediaUrl.bs", "MWMessageDeliveryStatus"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function h(a) {
        var b, e = a[1];
        a = a[0];
        return {
            gender: c("GenderConst").NOT_A_PERSON,
            id: d("I64").to_string(e.id),
            imageSrc: d("LSMediaUrl.bs").Contact.profilePictureUrl(e),
            name: (b = a.nickname) != null ? b : e.name,
            timestamp: d("I64").to_float(a.readActionTimestampMs)
        }
    }

    function a(a, b) {
        var c = {
            contents: d("I64").zero
        };
        a.forEach(function(a, e, f) {
            e = a[0];
            if (!d("I64").equal(e.contactId, b) && d("I64").gt(e.deliveredWatermarkTimestampMs, c.contents)) {
                c.contents = e.deliveredWatermarkTimestampMs;
                return
            }
        });
        return c.contents
    }

    function b(a) {
        return new Set([d("I64").to_string(a)])
    }

    function e(a, b, c, e, f, g) {
        var i = [];
        b.forEach(function(b, e, f) {
            if (c.has(e) || a.isAdminMessage) return;
            if (!d("I64").equal(a.sendStatusV2, d("LSIntEnum").ofNumber(2))) return;
            f = b[0];
            var j = d("I64").equal(a.senderId, f.contactId);
            f = d("I64").le(a.timestampMs, f.readWatermarkTimestampMs);
            if (j || f) {
                i.push(h(b));
                if (!g) {
                    c.add(e);
                    return
                } else return
            }
        });
        var j = i.length === 0 && c.size === 1;
        if (i.length <= 0)
            if (d("I64").equal(a.senderId, f)) return d("MWMessageDeliveryStatus").getDeliveryStatusForMessageSentByYou(a, e, j);
            else return {
                type: "NoneStatus"
            };
        if (!g)
            if (i.length > 1) return {
                heads: i,
                type: "MultipleSeenHeads"
            };
            else return {
                head: i[0],
                type: "SingleSeenHead"
            };
        f = i.length === (b.size - 1 | 0);
        return {
            delivered: f,
            heads: i,
            type: "DeliveredAndRead"
        }
    }
    g.calculateMaxDeliveredTimestamp = a;
    g.makeExistingSeenHeads = b;
    g.deliveryStatusForMessage = e
}), 98);
__d("MWPOneToOneThreadBlockedContext.bs", ["I64", "Int64Hooks", "LSContactBlockedByViewerStatus", "LSIntEnum", "MWV2OneToOneThreadBlockedContext.bs", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.children,
            e = a.participants,
            f = a.thread;
        a = d("Int64Hooks").useMemoInt64(function() {
            if (!(d("I64").equal(f.threadType, d("LSIntEnum").ofNumber(1)) || d("I64").equal(f.threadType, d("LSIntEnum").ofNumber(15)))) return !1;
            var a = {
                contents: !1
            };
            e.forEach(function(b, e, f) {
                if (!d("I64").equal(b[1].blockedByViewerStatus, d("LSIntEnum").ofNumber(c("LSContactBlockedByViewerStatus").UNBLOCKED))) {
                    a.contents = !0;
                    return
                }
            });
            return a.contents
        }, [f.threadType, e]);
        return h.jsx(d("MWV2OneToOneThreadBlockedContext.bs").make, {
            blocked: a,
            children: b
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    b = a;
    g.make = b
}), 98);
__d("MWPBaseMessageList_DEPRECATED.bs", ["BaseHeadingContextWrapper.react", "LSMessagingThreadTypeUtil", "MWPActor.react", "MWPMessageAuthor.react", "MWPOneToOneThreadBlockedContext.bs", "MWV2SeenHead.bs", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.children,
            e = a.messages,
            f = a.participants,
            g = a.renderRow;
        a = a.thread;
        var i = d("MWPActor.react").useActor(),
            j = d("MWV2SeenHead.bs").calculateMaxDeliveredTimestamp(f, i),
            k = d("MWV2SeenHead.bs").makeExistingSeenHeads(i),
            l = d("LSMessagingThreadTypeUtil").isGroup(a.threadType) && d("LSMessagingThreadTypeUtil").isSecure(a.threadType),
            m = [];
        for (var n = e.length - 1 | 0; n >= 0; --n) {
            var o = n === 0 ? void 0 : e[n - 1 | 0],
                p = n >= (e.length - 1 | 0) ? void 0 : e[n + 1 | 0],
                q = e[n],
                r = d("MWV2SeenHead.bs").deliveryStatusForMessage(q, f, k, j, i, l);
            m.push(h.jsx(d("MWPMessageAuthor.react").MWPMessageAuthor, {
                contactId: q.senderId,
                threadKey: q.threadKey,
                children: g({
                    message: q,
                    nextMessage: p,
                    prevMessage: o,
                    status: r
                })
            }, q.messageId))
        }
        if (m.length === 0) return null;
        else return h.jsx(c("BaseHeadingContextWrapper.react"), {
            children: h.jsx("div", {
                className: "x1ja2u2z",
                children: h.jsx(d("MWPOneToOneThreadBlockedContext.bs").make, {
                    participants: f,
                    thread: a,
                    children: b(m.reverse())
                })
            })
        })
    }
    b = a;
    g.make = b
}), 98); /*FB_PKG_DELIM*/
__d("MWMessageDeliverySentTimestamp", ["fbt", "I64"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("I64").of_int32(60),
        j = d("I64").of_int32(60 * 60),
        k = d("I64").of_int32(24 * 60 * 60),
        l = d("I64").of_int32(7 * 24 * 60 * 60);

    function a(a, b) {
        b = d("I64").of_float(b.getTime() / 1e3);
        a = d("I64").div(a, d("I64").of_int32(1e3));
        b = d("I64").sub(b, a);
        a = h._("__JHASH__FdnMQ3ayYbi__JHASH__");
        if (d("I64").lt(b, i)) return a;
        else if (d("I64").lt(b, j)) {
            var c = d("I64").to_string(d("I64").div(b, i));
            return h._("__JHASH__wurNpoApU1z__JHASH__", [h._param("minutes", c)])
        } else if (d("I64").lt(b, k)) {
            c = d("I64").to_string(d("I64").div(b, j));
            return h._("__JHASH__Og6TIDKGh51__JHASH__", [h._param("hours", c)])
        } else if (d("I64").lt(b, l)) {
            c = d("I64").to_string(d("I64").div(b, k));
            return h._("__JHASH___ys48wQwNKi__JHASH__", [h._param("days", c)])
        } else return a
    }
    g.getSentTitleWithTimestamp = a
}), 98);
__d("MWMessageOutgoingStatus.react", ["MWMessageDeliverySentTimestamp", "MWMessageDeliveryStatus", "MWMessageSendingContext.react", "MWPThreadTheme.bs", "MWStatusText.react", "clearTimeout", "react", "setTimeout", "stylex", "useServerTime"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useEffect,
        j = b.useMemo,
        k = b.useRef,
        l = b.useState,
        m = 3e3,
        n = {
            mask: {
                backgroundColor: "xcrg951",
                $$css: !0
            },
            mountAnimation: {
                animationDuration: "x4afe7t",
                animationName: "x1nuzdyh",
                animationTimingFunction: "x4hg4is",
                display: "x1rg5ohu",
                $$css: !0
            },
            statusText: {
                paddingTop: "xexx8yu",
                paddingEnd: "x4uap5",
                paddingBottom: "x18d9i69",
                paddingStart: "xkhd6sd",
                position: "x1n2onr6",
                $$css: !0
            },
            statusTextRow: {
                display: "x78zum5",
                justifyContent: "x13a6bvl",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.alignLeft,
            e = a.isLastMessage,
            f = a.message,
            g = a.status,
            o = a.xstyle;
        a = l(!1);
        var p = a[0],
            q = a[1],
            r = k(null),
            s = k(!1);
        a = c("MWMessageSendingContext.react").useHook();
        var t = a.findSendingMessage,
            u = a.trackSendingMessage,
            v = a.untrackSendingMessage;
        a = d("MWPThreadTheme.bs").useHook();
        var w = c("useServerTime")();
        i(function() {
            v(f.offlineThreadingId);
            g.type === "Sending" ? (u(f.offlineThreadingId), r.current = c("setTimeout")(function() {
                q(!0)
            }, m)) : r.current && c("clearTimeout")(r.current);
            return function() {
                r.current && c("clearTimeout")(r.current)
            }
        }, [t, f.offlineThreadingId, g.type, u, v]);
        var x = j(function() {
            g.type === "Sending" ? u(f.offlineThreadingId) : t(f.offlineThreadingId) && (s.current = !0);
            var a = g.type === "Sending" || s.current;
            a = [n.statusText, a && n.mountAnimation, o];
            switch (g.type) {
                case "Sending":
                    return p ? h.jsx(c("MWStatusText.react"), {
                        alignLeft: b,
                        text: d("MWMessageDeliveryStatus").Titles.sending.toString(),
                        xstyle: a
                    }) : null;
                case "Sent":
                case "Delivered":
                    return e ? h.jsx(c("MWStatusText.react"), {
                        alignLeft: b,
                        text: d("MWMessageDeliverySentTimestamp").getSentTitleWithTimestamp(f.timestampMs, w).toString(),
                        xstyle: a
                    }) : null;
                case "Error":
                    return h.jsx(c("MWStatusText.react"), {
                        alignLeft: b,
                        error: !0,
                        text: d("MWMessageDeliveryStatus").Titles.error.toString(),
                        xstyle: a
                    });
                default:
                    return null
            }
        }, [b, t, e, f.offlineThreadingId, f.timestampMs, w, p, g.type, u, o]);
        return h.jsx("div", {
            className: c("stylex")(n.statusTextRow, d("MWPThreadTheme.bs").isGradient(a) ? n.mask : !1),
            "data-testid": void 0,
            children: x
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("useMWBaseChatOpenTabForUser", ["I64", "LSDatabaseSingleton", "LSIntEnum", "LSThreadAttributionStore.bs", "MWChatInteraction.bs", "MWChatStateActions", "MWChatStateV2.bs", "MWChatStateV2Types", "WALoggerDeferred", "promiseDone", "react", "requireDeferred", "useCometFeedNoRoutingNavigationEventLogger", "useMWChatOpenTabTraceProvider"], (function(a, b, c, d, e, f, g) {
    "use strict";
    b = d("react");
    var h = b.useCallback,
        i = b.useMemo,
        j = c("requireDeferred")("MAWVerifyThreadCutover").__setRef("useMWBaseChatOpenTabForUser"),
        k = c("requireDeferred")("MWChatLogOpenChatTab").__setRef("useMWBaseChatOpenTabForUser"),
        l = c("requireDeferred")("MWChatOpenSecureTabForUserCallback.bs").__setRef("useMWBaseChatOpenTabForUser"),
        m = c("requireDeferred")("MWLSPreloadThreadForContact.bs").__setRef("useMWBaseChatOpenTabForUser");

    function a(a, b) {
        var e = a != null ? a : !1,
            f = c("useMWChatOpenTabTraceProvider")(),
            g = c("useCometFeedNoRoutingNavigationEventLogger")();
        a = h(function(a) {
            m.onReady(function(b) {
                return b.verifyThreadExists(a)
            })
        }, []);
        var n = d("MWChatStateV2.bs").useDispatch(),
            o = h(function(a) {
                return n(d("MWChatStateActions").openTab(Date.now(), {
                    shouldFocus: !e
                }, {
                    threadKeyDescriptor: {
                        clientThreadKey: void 0,
                        threadKey: a,
                        threadType: d("LSIntEnum").ofNumber(1)
                    },
                    type: d("MWChatStateV2Types").MWChatStateTabType.ChatTab
                }))
            }, [n, e]),
            p = h(function(a) {
                l.onReady(function(b) {
                    return b.openChatTab(a, e, n)
                })
            }, [n, e]),
            q = h(function(a, c) {
                g(Date.now(), "", "messenger"), d("LSThreadAttributionStore.bs").setSource(a, b), k.onReady(function(d) {
                    return d.logOpenUserTab(c, a, b)
                })
            }, [b, g]),
            r = i(function() {
                return function(a, e) {
                    var g = d("I64").of_string(a),
                        h = e ? 15 : 1;
                    f(function(b, f) {
                        if (e === !0) {
                            q(a, e);
                            d("MWChatInteraction.bs").set(a, b);
                            return p(a)
                        } else j.onReady(function(e) {
                            c("promiseDone")(e.verifyThreadCutover(c("LSDatabaseSingleton"), g).then(function(h) {
                                f.addAnnotationInt("is_cutover", h ? 1 : 0);
                                if (h === !0) return e.getCutoverThread(c("LSDatabaseSingleton"), g).then(function(e) {
                                    e || c("promiseDone")(d("WALoggerDeferred").logWithTags(["MWChatOpenTabForUser", "OpenTab"], ["No existing MI mapping found for cutover thread"], "WARN"));
                                    var g = e ? e.serverThreadKey : d("I64").of_string(a);
                                    g = d("I64").to_string(g);
                                    q(g, e != null);
                                    d("MWChatInteraction.bs").set(g, b);
                                    f.addAnnotation("isSecure", e ? "true" : "false");
                                    f.addAnnotation("thread_id", g);
                                    return p(a)
                                });
                                else {
                                    d("MWChatInteraction.bs").set(a, b);
                                    q(a, !1);
                                    return o(d("I64").of_string(a))
                                }
                            }))
                        })
                    }, h, b, a)
                }
            }, [f, b, q, p, o]),
            s = i(function() {
                return function(a, g) {
                    var h = g ? 15 : 1;
                    f(function(b, f) {
                        if (g === !0) {
                            q(a, g);
                            d("MWChatInteraction.bs").set(a, b);
                            var h = d("I64").of_string(a);
                            return n(d("MWChatStateActions").openTab(Date.now(), {
                                shouldFocus: !e
                            }, {
                                threadKeyDescriptor: {
                                    clientThreadKey: void 0,
                                    threadKey: h,
                                    threadType: d("LSIntEnum").ofNumber(15)
                                },
                                type: d("MWChatStateV2Types").MWChatStateTabType.ChatTab
                            }))
                        } else j.onReady(function(e) {
                            c("promiseDone")(e.verifyThreadCutover(c("LSDatabaseSingleton"), d("I64").of_string(a)).then(function(c) {
                                q(a, c);
                                d("MWChatInteraction.bs").set(a, b);
                                if (c === !0) {
                                    f.addAnnotation("isSecure", c ? "true" : "false");
                                    f.addAnnotation("thread_id", a);
                                    return p(a)
                                } else return o(d("I64").of_string(a))
                            }))
                        })
                    }, h, b, a)
                }
            }, [q, f, b, n, e, p, o]);
        return [r, a, s]
    }
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("FDSMWMessageDeliveryStatusIcons.bs", ["MWMessageDeliveryStatus", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            disabled: {
                fill: "xsrhx6k",
                $$css: !0
            },
            negative: {
                fill: "x1i5740i",
                $$css: !0
            }
        };

    function j(a) {
        switch (a) {
            case 12:
                return "12px";
            case 14:
                return "14px";
            case 16:
                return "16px"
        }
    }

    function a(a) {
        var b = a.size;
        a = a.xstyle;
        return h.jsxs("svg", {
            className: c("stylex")(i.disabled, a),
            height: j(b),
            role: "img",
            viewBox: "2 2 20 20",
            width: j(b),
            xmlns: "http://www.w3.org/2000/svg",
            children: [h.jsx("title", {
                children: d("MWMessageDeliveryStatus").Titles.sending
            }), h.jsx("path", {
                d: "m12 2a10 10 0 1 0 10 10 10.011 10.011 0 0 0 -10-10zm0 18.5a8.5 8.5 0 1 1 8.5-8.5 8.51 8.51 0 0 1 -8.5 8.5z"
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";

    function b(a) {
        var b = a.size;
        a = a.xstyle;
        return h.jsxs("svg", {
            className: c("stylex")(i.disabled, a),
            "data-testid": void 0,
            height: j(b),
            role: "img",
            viewBox: "2 2 20 20",
            width: j(b),
            xmlns: "http://www.w3.org/2000/svg",
            children: [h.jsx("title", {
                children: d("MWMessageDeliveryStatus").Titles.sent
            }), h.jsx("path", {
                d: "m12 2a10 10 0 1 0 10 10 10.011 10.011 0 0 0 -10-10zm0 18.5a8.5 8.5 0 1 1 8.5-8.5 8.51 8.51 0 0 1 -8.5 8.5z"
            }), h.jsx("path", {
                d: "m15.982 8.762-5.482 5.487-2.482-2.478a.75.75 0 0 0 -1.06 1.06l3.008 3.008a.748.748 0 0 0 1.06 0l6.016-6.016a.75.75 0 0 0 -1.06-1.061z"
            })]
        })
    }
    b.displayName = b.name + " [from " + f.id + "]";

    function e(a) {
        var b = a.size;
        a = a.xstyle;
        return h.jsxs("svg", {
            className: c("stylex")(i.disabled, a),
            "data-testid": void 0,
            height: j(b),
            role: "img",
            viewBox: "2 2 20 20",
            width: j(b),
            xmlns: "http://www.w3.org/2000/svg",
            children: [h.jsx("title", {
                children: d("MWMessageDeliveryStatus").Titles.delivered
            }), h.jsx("path", {
                d: "m12 2a10 10 0 1 0 10 10 10.011 10.011 0 0 0 -10-10zm5.219 8-6.019 6.016a1 1 0 0 1 -1.414 0l-3.005-3.008a1 1 0 1 1 1.419-1.414l2.3 2.3 5.309-5.31a1 1 0 1 1 1.41 1.416z"
            })]
        })
    }
    e.displayName = e.name + " [from " + f.id + "]";

    function k(a) {
        var b = a.size,
            e = a.title;
        e = e === void 0 ? d("MWMessageDeliveryStatus").Titles.error.toString() : e;
        a = a.xstyle;
        return h.jsxs("svg", {
            className: c("stylex")(i.negative, a),
            height: j(b),
            role: "img",
            viewBox: "2 2 20 20",
            width: j(b),
            xmlns: "http://www.w3.org/2000/svg",
            children: [h.jsx("title", {
                children: e
            }), h.jsx("path", {
                d: "m12 2a10 10 0 1 0 10 10 10.011 10.011 0 0 0 -10-10zm0 15.139a1.125 1.125 0 1 1 1.125-1.125 1.127 1.127 0 0 1 -1.125 1.125zm.8-3.81a.75.75 0 0 1 -.75.685.852.852 0 0 1 -.847-.685l-.45-5.145c0-.022 0-.043 0-.065a1.254 1.254 0 1 1 2.5 0z"
            })]
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function l(a) {
        var b = a.size;
        a = a.xstyle;
        return h.jsx("svg", {
            className: c("stylex")(i.disabled, a),
            height: j(b),
            role: "img",
            viewBox: "0 0 16 16",
            width: j(b),
            xmlns: "http://www.w3.org/2000/svg",
            children: h.jsx("path", {
                clipRule: "evenodd",
                d: "M8 16A8 8 0 108 0a8 8 0 000 16zm.473-5.26a.5.5 0 00.08.605l.27.271a1 1 0 001.572-.205l3.379-5.818a1 1 0 00-1.73-1.004l-.974 1.678a.911.911 0 01-.034.06L8.473 10.74zm1.3-5.147A1 1 0 008.045 4.59L5.417 9.114a.15.15 0 01-.236.03L3.798 7.763a1 1 0 10-1.414 1.414l2.44 2.44a1 1 0 001.571-.205l3.379-5.818z",
                fillRule: "evenodd"
            })
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";
    f = {
        SendingIcon: a,
        SentIcon: b,
        DeliveredIcon: e,
        DeliveredAndReadIcon: l,
        ErrorIcon: k
    };
    a = f;
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("MWChatPIIFormScreenQuery_facebookRelayOperation", [], (function(a, b, c, d, e, f) {
    e.exports = "5021823607854583"
}), null);
__d("MWChatPIIFormScreenQuery.graphql", ["MWChatPIIFormScreenQuery_facebookRelayOperation"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        var a = [{
                defaultValue: null,
                kind: "LocalArgument",
                name: "formID"
            }, {
                defaultValue: null,
                kind: "LocalArgument",
                name: "screenIndex"
            }],
            c = [{
                alias: null,
                args: [{
                    fields: [{
                        kind: "Variable",
                        name: "form_id",
                        variableName: "formID"
                    }, {
                        kind: "Variable",
                        name: "screen_index",
                        variableName: "screenIndex"
                    }],
                    kind: "ObjectValue",
                    name: "input"
                }],
                concreteType: "MessengerPIIFormSingleScreenObject",
                kind: "LinkedField",
                name: "messenger_pii_form_single_screen",
                plural: !1,
                selections: [{
                    alias: null,
                    args: null,
                    concreteType: "MessengerPIIFormScreenObject",
                    kind: "LinkedField",
                    name: "screen",
                    plural: !1,
                    selections: [{
                        alias: null,
                        args: null,
                        kind: "ScalarField",
                        name: "screen_title",
                        storageKey: null
                    }, {
                        alias: null,
                        args: null,
                        concreteType: "MessengerPIIQuestionObject",
                        kind: "LinkedField",
                        name: "questions",
                        plural: !0,
                        selections: [{
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "id",
                            storageKey: null
                        }, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "title",
                            storageKey: null
                        }, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "subtitle",
                            storageKey: null
                        }, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "type",
                            storageKey: null
                        }, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "placeholder",
                            storageKey: null
                        }, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "length",
                            storageKey: null
                        }, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "format",
                            storageKey: null
                        }, {
                            alias: null,
                            args: null,
                            kind: "ScalarField",
                            name: "mask",
                            storageKey: null
                        }],
                        storageKey: null
                    }],
                    storageKey: null
                }],
                storageKey: null
            }];
        return {
            fragment: {
                argumentDefinitions: a,
                kind: "Fragment",
                metadata: null,
                name: "MWChatPIIFormScreenQuery",
                selections: c,
                type: "Query",
                abstractKey: null
            },
            kind: "Request",
            operation: {
                argumentDefinitions: a,
                kind: "Operation",
                name: "MWChatPIIFormScreenQuery",
                selections: c
            },
            params: {
                id: b("MWChatPIIFormScreenQuery_facebookRelayOperation"),
                metadata: {},
                name: "MWChatPIIFormScreenQuery",
                operationKind: "query",
                text: null
            }
        }
    }();
    e.exports = a
}), null);
__d("MWChatPIIFormScreenQuery", ["CometRelay", "MWChatPIIFormScreenQuery.graphql", "PiiActionFlowFalcoEvent", "promiseDone"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h, i = function(a, b, e, f, g) {
            f = d("CometRelay").fetchQuery(f, j, {
                formID: a,
                screenIndex: e
            }).toPromise().then(function(d) {
                if (d) {
                    d = d.messenger_pii_form_single_screen.screen;
                    var e = d.questions.map(function(a) {
                            return {
                                format: a.format,
                                id: a.id,
                                length: a.length,
                                mask: a.mask,
                                placeholder: a.placeholder,
                                subtitle: a.subtitle,
                                title: a.title,
                                type: a.type
                            }
                        }),
                        f = {
                            question_list_size: d.questions.length
                        };
                    c("PiiActionFlowFalcoEvent").log(function() {
                        return {
                            event_name: "pii_single_page_query_success",
                            extra_data: JSON.stringify(f),
                            form_id: a,
                            page_id: b
                        }
                    });
                    g({
                        questions: e,
                        screen_title: d.screen_title
                    })
                }
            }, function(d) {
                c("PiiActionFlowFalcoEvent").log(function() {
                    return {
                        event_name: "pii_single_page_query_failure",
                        extra_data: d.message,
                        form_id: a,
                        page_id: b
                    }
                })
            });
            c("promiseDone")(f)
        },
        j = h !== void 0 ? h : h = b("MWChatPIIFormScreenQuery.graphql");
    a = function(a, b, c, d, e) {
        i(a, b, c, d, function(a) {
            return e(a)
        })
    };
    g.fetch = a
}), 98); /*FB_PKG_DELIM*/
__d("MentorshipClientSideEventsTypedLogger", ["Banzai", "GeneratedLoggerUtils", "nullthrows"], (function(a, b, c, d, e, f) {
    "use strict";
    a = function() {
        function a() {
            this.$1 = {}
        }
        var c = a.prototype;
        c.log = function(a) {
            b("GeneratedLoggerUtils").log("logger:MentorshipClientSideEventsLoggerConfig", this.$1, b("Banzai").BASIC, a)
        };
        c.logVital = function(a) {
            b("GeneratedLoggerUtils").log("logger:MentorshipClientSideEventsLoggerConfig", this.$1, b("Banzai").VITAL, a)
        };
        c.logImmediately = function(a) {
            b("GeneratedLoggerUtils").log("logger:MentorshipClientSideEventsLoggerConfig", this.$1, {
                signal: !0
            }, a)
        };
        c.clear = function() {
            this.$1 = {};
            return this
        };
        c.getData = function() {
            return babelHelpers["extends"]({}, this.$1)
        };
        c.updateData = function(a) {
            this.$1 = babelHelpers["extends"]({}, this.$1, a);
            return this
        };
        c.setActorID = function(a) {
            this.$1.actor_id = a;
            return this
        };
        c.setAppID = function(a) {
            this.$1.app_id = a;
            return this
        };
        c.setAppVersion = function(a) {
            this.$1.app_version = a;
            return this
        };
        c.setApplicationID = function(a) {
            this.$1.application_id = a;
            return this
        };
        c.setApplicationProfileID = function(a) {
            this.$1.application_profile_id = a;
            return this
        };
        c.setCohortGroupOrPageID = function(a) {
            this.$1.cohort_group_or_page_id = a;
            return this
        };
        c.setCohortID = function(a) {
            this.$1.cohort_id = a;
            return this
        };
        c.setContainerType = function(a) {
            this.$1.container_type = a;
            return this
        };
        c.setDestinationContainerType = function(a) {
            this.$1.destination_container_type = a;
            return this
        };
        c.setDestinationUnitType = function(a) {
            this.$1.destination_unit_type = a;
            return this
        };
        c.setDisplayName = function(a) {
            this.$1.display_name = a;
            return this
        };
        c.setEvent = function(a) {
            this.$1.event = a;
            return this
        };
        c.setExplicitActorType = function(a) {
            this.$1.explicit_actor_type = a;
            return this
        };
        c.setPairCreationType = function(a) {
            this.$1.pair_creation_type = a;
            return this
        };
        c.setProgramGroupID = function(a) {
            this.$1.program_group_id = a;
            return this
        };
        c.setProgramID = function(a) {
            this.$1.program_id = a;
            return this
        };
        c.setProgramThreadID = function(a) {
            this.$1.program_thread_id = a;
            return this
        };
        c.setSessionID = function(a) {
            this.$1.session_id = a;
            return this
        };
        c.setSourceContainerType = function(a) {
            this.$1.source_container_type = a;
            return this
        };
        c.setSourceUnitType = function(a) {
            this.$1.source_unit_type = a;
            return this
        };
        c.setUnitType = function(a) {
            this.$1.unit_type = a;
            return this
        };
        c.updateExtraData = function(a) {
            a = b("nullthrows")(b("GeneratedLoggerUtils").serializeMap(a));
            b("GeneratedLoggerUtils").checkExtraDataFieldNames(a, g);
            this.$1 = babelHelpers["extends"]({}, this.$1, a);
            return this
        };
        c.addToExtraData = function(a, b) {
            var c = {};
            c[a] = b;
            return this.updateExtraData(c)
        };
        return a
    }();
    var g = {
        actor_id: !0,
        app_id: !0,
        app_version: !0,
        application_id: !0,
        application_profile_id: !0,
        cohort_group_or_page_id: !0,
        cohort_id: !0,
        container_type: !0,
        destination_container_type: !0,
        destination_unit_type: !0,
        display_name: !0,
        event: !0,
        explicit_actor_type: !0,
        pair_creation_type: !0,
        program_group_id: !0,
        program_id: !0,
        program_thread_id: !0,
        session_id: !0,
        source_container_type: !0,
        source_unit_type: !0,
        unit_type: !0
    };
    f["default"] = a
}), 66);
__d("MentorshipMessengerLoggingUtils", ["CurrentUser", "MentorshipClientSideEventsTypedLogger"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        var b = new(c("MentorshipClientSideEventsTypedLogger"))().setEvent(a.event).setActorID(c("CurrentUser").getID()).setProgramID(a.programID).setDisplayName(a.displayName).updateExtraData(a.extraData).setContainerType("messenger_thread").setUnitType(a.unit);
        a.event == "click_unit" && b.setDestinationContainerType(a.destContainer).setDestinationUnitType(a.destUnit);
        b.log()
    }
    g.logMessengerEvent = a
}), 98); /*FB_PKG_DELIM*/
__d("useCometDynamicEntryPointDialog", ["CometDialogContext", "CometDialogLoadingState.react", "CometRelay", "CometSuspendedDialogImpl.react", "clearTimeout", "react", "setTimeout", "tracePolicyFromResource", "useCometRelayEntrypointContextualEnvironmentProvider"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");
    b = d("react");
    var i = b.useCallback,
        j = b.useContext,
        k = b.useEffect,
        l = b.useRef;

    function m(a) {
        var b = a.entryPoint,
            e = a.environmentProvider,
            f = a.onClose,
            g = a.otherProps,
            i = a.preloadedEntryPoint,
            j = a.preloadParams;
        a = d("CometRelay").useEntryPointLoader(e, b);
        var m = a[0],
            n = a[1],
            o = a[2],
            p = (e = m) != null ? e : i,
            q = l(null);
        k(function() {
            q.current != null && (c("clearTimeout")(q.current), q.current = null);
            p.isDisposed && n(j);
            return function() {
                q.current = c("setTimeout")(function() {
                    m ? o() : i.dispose(), q.current = null
                }, 6e4)
            }
        }, [o, p.isDisposed, i, j, n, m]);
        b = babelHelpers["extends"]({}, g, {
            onClose: f
        });
        return h.jsx(d("CometRelay").EntryPointContainer, {
            entryPointReference: i,
            props: b
        })
    }
    m.displayName = m.name + " [from " + f.id + "]";
    var n = function(a) {
        return h.jsx(c("CometDialogLoadingState.react"), {
            onClose: a
        })
    };

    function a(a, b, e) {
        var f = c("useCometRelayEntrypointContextualEnvironmentProvider")(),
            g = j(c("CometDialogContext"));
        return i(function(h, i, j, k) {
            var l = d("CometRelay").loadEntryPoint(f, a, h),
                o = m,
                p = function() {
                    j && j.apply(void 0, arguments);
                    var a = l == null ? void 0 : l.dispose;
                    a && a()
                };
            g(c("CometSuspendedDialogImpl.react"), {
                dialog: o,
                dialogProps: {
                    entryPoint: a,
                    environmentProvider: f,
                    otherProps: i,
                    preloadedEntryPoint: l,
                    preloadParams: h
                },
                fallback: (o = e) != null ? o : n
            }, {
                loadType: "entrypoint",
                preloadTrigger: b,
                tracePolicy: (i = k) != null ? i : c("tracePolicyFromResource")("comet.dialog", a.root)
            }, p)
        }, [f, a, g, e, b])
    }
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("GroupsCometAdminActivityLogItemSeeDetailsDialogQuery$Parameters", ["GroupsCometAdminActivityLogItemSeeDetailsDialogQuery_facebookRelayOperation", "IsMergQAPolls.relayprovider", "IsWorkUser.relayprovider", "StoriesArmadilloReplyEnabled.relayprovider", "StoriesRing.relayprovider"], (function(a, b, c, d, e, f) {
    "use strict";
    a = {
        kind: "PreloadableConcreteRequest",
        params: {
            id: b("GroupsCometAdminActivityLogItemSeeDetailsDialogQuery_facebookRelayOperation"),
            metadata: {},
            name: "GroupsCometAdminActivityLogItemSeeDetailsDialogQuery",
            operationKind: "query",
            text: null,
            providedVariables: {
                __relay_internal__pv__IsWorkUserrelayprovider: b("IsWorkUser.relayprovider"),
                __relay_internal__pv__IsMergQAPollsrelayprovider: b("IsMergQAPolls.relayprovider"),
                __relay_internal__pv__StoriesArmadilloReplyEnabledrelayprovider: b("StoriesArmadilloReplyEnabled.relayprovider"),
                __relay_internal__pv__StoriesRingrelayprovider: b("StoriesRing.relayprovider")
            }
        }
    };
    e.exports = a
}), null);
__d("GroupsCometAdminActivityLogItemSeeDetailsDialog.entrypoint", ["GroupsCometAdminActivityLogItemSeeDetailsDialogQuery$Parameters", "JSResourceForInteraction", "WebPixelRatio"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            a = a.routeProps;
            var c = a.adminActivityID,
                e = a.groupID;
            a = a.isManagementActivityLogTargetProfilePlus;
            c = {
                UFI2CommentsProvider_commentsKey: "GroupsCometAdminActivityLogItem",
                adminActivityID: c,
                displayCommentsContextEnableComment: null,
                displayCommentsContextIsAdPreview: null,
                displayCommentsContextIsAggregatedShare: null,
                displayCommentsContextIsStorySet: null,
                displayCommentsFeedbackContext: null,
                feedbackSource: 0,
                feedLocation: "GROUP_ADMIN_TO_MEMBER_FEEDBACK",
                focusCommentID: null,
                groupID: e,
                isManagementActivityLogTargetProfilePlus: a,
                privacySelectorRenderLocation: "COMET_STREAM",
                renderLocation: "group_admin_to_member_feedback",
                scale: d("WebPixelRatio").get(),
                useDefaultActor: !1
            };
            return {
                queries: {
                    queryReference: {
                        parameters: b("GroupsCometAdminActivityLogItemSeeDetailsDialogQuery$Parameters"),
                        variables: c
                    }
                }
            }
        },
        root: c("JSResourceForInteraction")("GroupsCometAdminActivityLogItemSeeDetailsDialog.react").__setRef("GroupsCometAdminActivityLogItemSeeDetailsDialog.entrypoint")
    };
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("PopupWindow", ["DOMDimensions", "DOMQuery", "FlowMigrationUtilsForLegacyFiles", "Layer", "Popup", "getViewportDimensions", "isFalsey"], (function(a, b, c, d, e, f, g) {
    var h = {
        allowShrink: !0,
        strategy: "vector",
        timeout: 100,
        widthElement: null
    };

    function b(a) {
        Object.assign(h, a), window.setInterval(i, h.timeout)
    }

    function i() {
        var a = c("getViewportDimensions")(),
            b = j(),
            e = c("Layer").getTopmostLayer();
        if (e) {
            e = (e = e.getRoot()) == null ? void 0 : e.firstChild;
            e || d("FlowMigrationUtilsForLegacyFiles").invariantViolation("topMostLayer.getRoot().firstChild is null.");
            var f = d("DOMDimensions").getElementDimensions(e);
            f.height += d("DOMDimensions").measureElementBox(e, "height", !0, !0, !0);
            f.width += d("DOMDimensions").measureElementBox(e, "width", !0, !0, !0);
            b.height = Math.max(b.height, f.height);
            b.width = Math.max(b.width, f.width)
        }
        e = b.height - a.height;
        f = b.width - a.width;
        f < 0 && c("isFalsey")(h.widthElement) && (f = 0);
        f = f > 1 ? f : 0;
        c("isFalsey")(h.allowShrink) && e < 0 && (e = 0);
        if (e || f) try {
            window.console && window.console.firebug, window.resizeBy(f, e), f && window.moveBy(f / -2, 0)
        } catch (a) {}
    }

    function j() {
        var b = d("DOMDimensions").getDocumentDimensions();
        if (h.strategy === "offsetHeight") {
            var e = document.body;
            if (!e) d("FlowMigrationUtilsForLegacyFiles").invariantViolation("document.body is null.");
            else {
                b.height = (e = e.offsetHeight) != null ? e : 0
            }
        }
        if (c("isFalsey")(h.widthElement) && typeof h.widthElement === "string") {
            e = d("DOMQuery").scry(document.body, h.widthElement)[0];
            e && (b.width = d("DOMDimensions").getElementDimensions(e).width)
        }
        e = a.Dialog;
        e && e.max_bottom && e.max_bottom > b.height && (b.height = e.max_bottom);
        return b
    }

    function e(a, b, c, e) {
        return d("Popup").open(a, c, b, e)
    }
    g._opts = h;
    g.init = b;
    g._resizeCheck = i;
    g._getDocumentSize = j;
    g.open = e
}), 98); /*FB_PKG_DELIM*/
__d("CometPhotoGrid.react", ["CometAspectRatioContainer.react", "react", "stylex"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            item: {
                boxSizing: "x9f619",
                flexBasis: "x1yu6fn4",
                $$css: !0
            },
            itemEnlarged: {
                flexBasis: "x4pfjvb",
                $$css: !0
            },
            itemNarrowSpacing: {
                paddingTop: "x1nn3v0j",
                paddingEnd: "xg83lxy",
                paddingBottom: "x1120s5i",
                paddingStart: "x1h0ha7o",
                $$css: !0
            },
            itemWideSpacing: {
                paddingTop: "xyqdw3p",
                paddingEnd: "x10ogl3i",
                paddingBottom: "xg8j3zb",
                paddingStart: "x1k2j06m",
                $$css: !0
            },
            wrapper: {
                display: "x78zum5",
                flexDirection: "x1q0g3np",
                flexWrap: "x1a02dak",
                $$css: !0
            },
            wrapperNarrowSpacing: {
                marginTop: "x1kgmq87",
                marginEnd: "xwrv7xz",
                marginBottom: "xmgb6t1",
                marginStart: "x8182xy",
                $$css: !0
            },
            wrapperWideSpacing: {
                marginTop: "x1198e8h",
                marginEnd: "xj3m2qm",
                marginBottom: "x1huwwth",
                marginStart: "x1uirj4r",
                $$css: !0
            }
        };

    function j(a, b) {
        return a < 2 && b % 3 === 2
    }

    function a(a) {
        var b = a.spacing,
            d = b === void 0 ? "narrow" : b;
        b = a.uniformGrid;
        var e = b === void 0 ? !1 : b;
        b = babelHelpers.objectWithoutPropertiesLoose(a, ["spacing", "uniformGrid"]);
        a = h.Children.toArray(b.children);
        var f = a.length;
        return h.jsx("div", {
            className: c("stylex")(i.wrapper, d === "narrow" && i.wrapperNarrowSpacing, d === "wide" && i.wrapperWideSpacing),
            children: h.Children.map(a, function(a, b) {
                return h.jsx("div", {
                    className: c("stylex")(i.item, d === "wide" && i.itemWideSpacing, d === "narrow" && i.itemNarrowSpacing, !e && j(b, f) && i.itemEnlarged),
                    children: h.jsx(c("CometAspectRatioContainer.react"), {
                        aspectRatio: 1,
                        children: a
                    })
                })
            })
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98); /*FB_PKG_DELIM*/
__d("CometHScroll.react", ["fbt", "BaseHScroll.react", "ChevronLeftFilled24.svg.react", "ChevronRightFilled24.svg.react", "CometCircleButton.react", "CometTrackingNodeProvider.react", "Locale", "SVGIcon", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useCallback,
        k = h._("__JHASH__J8Yoib5UPEE__JHASH__"),
        l = h._("__JHASH__EhkFtPPvOVh__JHASH__"),
        m = d("Locale").isRTL(),
        n = 44;

    function a(a) {
        var b = a.nextButtonLabel,
            e = b === void 0 ? k : b;
        b = a.prevButtonLabel;
        var f = b === void 0 ? l : b;
        b = a.reduceArrowSize;
        var g = b === void 0 ? !1 : b;
        b = babelHelpers.objectWithoutPropertiesLoose(a, ["nextButtonLabel", "prevButtonLabel", "reduceArrowSize"]);
        a = j(function(a, b) {
            return i.jsx(c("CometTrackingNodeProvider.react"), {
                trackingNode: 419,
                children: i.jsx(c("CometCircleButton.react"), {
                    color: "secondary",
                    disabled: b,
                    icon: d("SVGIcon").svgIcon(m ? c("ChevronRightFilled24.svg.react") : c("ChevronLeftFilled24.svg.react")),
                    label: f,
                    onPress: a,
                    size: g ? 40 : 48,
                    testid: void 0,
                    type: "overlay-raised"
                })
            })
        }, [f, g]);
        var h = j(function(a, b) {
            return i.jsx(c("CometTrackingNodeProvider.react"), {
                trackingNode: 420,
                children: i.jsx(c("CometCircleButton.react"), {
                    color: "secondary",
                    disabled: b,
                    icon: d("SVGIcon").svgIcon(m ? c("ChevronLeftFilled24.svg.react") : c("ChevronRightFilled24.svg.react")),
                    label: e,
                    onPress: a,
                    size: g ? 40 : 48,
                    testid: void 0,
                    type: "overlay-raised"
                })
            })
        }, [e, g]);
        return i.jsx(d("BaseHScroll.react").HScrollContainer, babelHelpers["extends"]({}, b, {
            nextButton: h,
            peekWidth: n,
            prevButton: a
        }))
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g.Container = a;
    g.Child = d("BaseHScroll.react").HScrollChild
}), 98);
; /*FB_PKG_DELIM*/

__d("LSIssueNewTaskWithExtraOperationsAndGetTaskID", ["LSIssueNewTaskAndGetTaskID", "LSMailboxTaskCompletionApiOnTaskInsertion"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments,
            c = a[a.length - 1];
        c.n;
        var d = [],
            e = [];
        return c.seq([function(f) {
            return c.seq([function(e) {
                return c.sp(b("LSIssueNewTaskAndGetTaskID"), a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]).then(function(a) {
                    return a = a, d[0] = a[0], a
                })
            }, function(a) {
                return c.sp(b("LSMailboxTaskCompletionApiOnTaskInsertion"), d[0])
            }, function(a) {
                return e[0] = d[0]
            }])
        }, function(a) {
            return c.resolve(e)
        }])
    }
    c = a;
    f["default"] = c
}), 66);
__d("LSMoveIgFolder", ["LSIssueNewError", "LSIssueNewTask", "LSUpsertIgFolder"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments,
            c = a[a.length - 1];
        c.n;
        var d = [],
            e = [],
            f;
        return c.seq([function(e) {
            return c.seq([function(b) {
                return c.db.table(9).fetch([
                    [
                        [a[0]]
                    ]
                ]).next().then(function(a, b) {
                    var e = a.done;
                    a = a.value;
                    return e ? d[0] = c.i64.cast([0, 1]) : (b = a.item, d[8] = b.syncGroup, c.i64.neq(d[8], f) ? d[7] = d[8] : d[7] = c.i64.cast([0, 1]), d[0] = d[7])
                })
            }, function(a) {
                return c.sb(c.db.table(115).fetch(), [
                    ["timestampMs", "DESC"]
                ]).next().then(function(a, b) {
                    var c = a.done;
                    a = a.value;
                    return c ? d[2] = !1 : (b = a.item, d[2] = b.errorShouldBeShown)
                })
            }, function(a) {
                return d[2] === !0 ? c.seq([function(a) {
                    return c.localizeV2Async(c.i64.cast([0, 2285622730]), f).then(function(a) {
                        return d[7] = a
                    })
                }, function(a) {
                    return c.localizeV2Async(c.i64.cast([0, 1919524925]), f).then(function(a) {
                        return d[8] = a
                    })
                }, function(a) {
                    return c.sp(b("LSIssueNewError"), f, c.i64.cast([0, 1545093]), d[7], d[8], f, f)
                }]) : c.resolve()
            }, function(e) {
                return d[4] = new c.Map(), d[4].set("thread_key", a[0]), d[4].set("old_ig_folder", a[1]), d[4].set("new_ig_folder", a[2]), d[4].set("sync_group", d[0]), d[5] = d[4].get("thread_key"), d[4], d[6] = c.toJSON(d[4]), c.sp(b("LSIssueNewTask"), c.i64.to_string(d[5]), c.i64.cast([0, 511]), d[6], f, f, c.i64.cast([0, 0]), c.i64.cast([0, 0]), f, f, c.i64.cast([0, 0]))
            }, function(d) {
                return c.sp(b("LSUpsertIgFolder"), a[0], a[2])
            }])
        }, function(a) {
            return c.resolve(e)
        }])
    }
    c = a;
    f["default"] = c
}), 66);
__d("LSMuteCallsFromThread", ["LSIssueNewTask"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments,
            c = a[a.length - 1];
        c.n;
        var d = [],
            e = [],
            f;
        return c.seq([function(e) {
            return c.seq([function(b) {
                return c.db.table(9).fetch([
                    [
                        [a[0]]
                    ]
                ]).next().then(function(a, b) {
                    var e = a.done;
                    a = a.value;
                    return e ? d[0] = c.i64.cast([0, 1]) : (b = a.item, d[6] = b.syncGroup, c.i64.neq(d[6], f) ? d[5] = d[6] : d[5] = c.i64.cast([0, 1]), d[0] = d[5])
                })
            }, function(e) {
                return d[2] = new c.Map(), d[2].set("thread_key", a[0]), d[2].set("mailbox_type", a[1]), d[2].set("mute_calls_expire_time_ms", a[2]), d[2].set("request_id", a[3]), d[2].set("sync_group", d[0]), d[3] = d[2].get("thread_key"), d[2], d[4] = c.toJSON(d[2]), c.sp(b("LSIssueNewTask"), c.i64.to_string(d[3]), c.i64.cast([0, 229]), d[4], f, f, c.i64.cast([0, 0]), c.i64.cast([0, 0]), f, f, c.i64.cast([0, 0]))
            }])
        }, function(a) {
            return c.resolve(e)
        }])
    }
    c = a;
    f["default"] = c
}), 66);
__d("LSOptimisticMuteThread", ["LSIssueNewTaskWithExtraOperationsAndGetTaskID"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments,
            c = a[a.length - 1];
        c.n;
        var d = [],
            e = [],
            f;
        return c.seq([function(e) {
            return c.seq([function(b) {
                return c.fe(c.db.table(9).fetch([
                    [
                        [a[0]]
                    ]
                ]), function(b) {
                    var c = b.update;
                    b.item;
                    return c({
                        muteExpireTimeMs: a[2]
                    })
                })
            }, function(e) {
                return c.sp(b("LSIssueNewTaskWithExtraOperationsAndGetTaskID"), c.i64.to_string(a[0]), c.i64.cast([0, 144]), "", f, f, c.i64.cast([0, 0]), c.i64.cast([0, 0]), c.i64.cast([0, 1]), f, c.i64.cast([0, 0]), f).then(function(a) {
                    return a = a, d[0] = a[0], a
                })
            }, function(b) {
                return c.db.table(32).add({
                    taskId: d[0],
                    threadKey: a[0]
                })
            }])
        }, function(a) {
            return c.resolve(e)
        }])
    }
    c = a;
    f["default"] = c
}), 66);
__d("useIsEndChannelEnabled", ["I64", "LSIntEnum", "LSThreadBitOffset", "ThreadStatus", "useIGDIsViewerAdmin"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        var b = a.threadStatus != null && d("I64").equal(a.threadStatus, d("I64").of_int32(c("ThreadStatus").PAUSED)),
            e = d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(154), a);
        a = c("useIGDIsViewerAdmin")(a);
        return a && e && !b
    }
    g.useIsEndChannelEnabled = a
}), 98);
__d("IGDDeleteThreadInboxInfoButton.react", ["fbt", "CometLazyDialogTrigger.react", "IGDBaseButton.react", "IGDBroadcastChannelQPL", "IGDSBox.react", "IGDSText.react", "JSResourceForInteraction", "MWCMThreadTypes.react", "MWPBumpEntityKey", "ReQL", "emptyFunction", "promiseDone", "react", "useIGDBroadcastChannelLogger", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useRef,
        k = {
            buttonContainer: {
                paddingTop: "xyamay9",
                paddingBottom: "x1l90r2v",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.onClick,
            e = b === void 0 ? c("emptyFunction") : b,
            f = a.onDelete,
            g = a.thread,
            l = c("useReStore")(),
            m = j(null),
            n = c("useIGDBroadcastChannelLogger")(g.threadKey),
            o = g.threadSubtype != null && d("MWCMThreadTypes.react").isIGBroadcastChannelThread(g.threadSubtype),
            p = o ? h._("__JHASH__teB8cfQpjUc__JHASH__") : h._("__JHASH__V4lQZHEHmJ1__JHASH__");
        return i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: {
                onDelete: function() {
                    if (o) {
                        c("promiseDone")(n({
                            action: "tap",
                            event: "thread_delete_attempt",
                            parent_surface: "broadcast",
                            source: "delete_chat_dialog",
                            surface: "thread_details"
                        }));
                        var a = d("ReQL").fromTableAscending(l.table("threads")).getKeyRange(g.threadKey).subscribe(function(b, e) {
                            e.operation === "delete" && (c("promiseDone")(n({
                                action: "view",
                                event: "thread_delete_successful",
                                parent_surface: "broadcast",
                                source: "delete_broadcast_chat",
                                surface: "thread_details"
                            })), d("IGDBroadcastChannelQPL").logDeleteChannelSuccess(o), a())
                        })
                    }
                    f()
                },
                thread: g
            },
            dialogResource: c("JSResourceForInteraction")("IGDChatSettingsDeleteThreadDialog.react").__setRef("IGDDeleteThreadInboxInfoButton.react"),
            onHide: function() {
                o && c("promiseDone")(n({
                    action: "tap",
                    event: "thread_delete_cancel",
                    parent_surface: "broadcast",
                    source: "delete_chat_dialog",
                    surface: "thread_details"
                }))
            },
            children: function(a) {
                return i.jsx(c("IGDSBox.react"), {
                    direction: "column",
                    xstyle: k.buttonContainer,
                    children: i.jsx(c("IGDBaseButton.react"), {
                        onClick: function() {
                            a();
                            e();
                            o && c("promiseDone")(n({
                                action: "tap",
                                event: "delete_broadcast_chat_dialog_rendered",
                                parent_surface: "broadcast",
                                source: "delete_broadcast_chat",
                                surface: "thread_details"
                            }));
                            return d("MWPBumpEntityKey").bumpEntityKeyWithAppId("igd.infobar", "delete_thread")
                        },
                        ref: m,
                        children: i.jsx(c("IGDSText.react"), {
                            color: "errorOrDestructive",
                            size: "label",
                            textAlign: "start",
                            children: p
                        })
                    })
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDDeleteOpenThreadInboxInfoButton.react", ["I64", "IGDBroadcastChannelQPL", "IGDConfirmDeleteOpenMessageRequestLogger", "IGDDeleteThreadInboxInfoButton.react", "IGDOpenDeleteOpenMessageRequestDialogLogger", "LSIntEnum", "react", "useIGDDeleteOpenThread"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.thread,
            e = c("useIGDDeleteOpenThread")(b),
            f = d("I64").equal(b.parentThreadKey, d("LSIntEnum").ofNumber(-1)),
            g = d("I64").equal(b.parentThreadKey, d("LSIntEnum").ofNumber(-3));
        return h.jsx(c("IGDDeleteThreadInboxInfoButton.react"), {
            onClick: function() {
                if (f || g) {
                    d("IGDOpenDeleteOpenMessageRequestDialogLogger").logOpenDeleteOpenMessageRequestDialog(b);
                    return
                }
                d("IGDBroadcastChannelQPL").logDeleteChannelStart(b)
            },
            onDelete: function() {
                e();
                if (f || g) {
                    d("IGDConfirmDeleteOpenMessageRequestLogger").logConfirmDeleteOpenMessageRequest(b);
                    return
                }
            },
            thread: b
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDThreadDetailRow.react", ["IGDSBox.react", "IGDSText.react", "react", "useIGDDeviceType"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            addOnEnd: {
                flexShrink: "x2lah0s",
                marginStart: "x16n37ib",
                $$css: !0
            },
            mobileRoot: {
                paddingStart: "x1swvt13",
                paddingEnd: "x1pi30zi",
                $$css: !0
            },
            root: {
                flexWrap: "xozqiw3",
                minHeight: "x879a55",
                paddingStart: "xbbxn1n",
                paddingEnd: "xxbr6pl",
                paddingTop: "xyinxu5",
                paddingBottom: "x1g2khh7",
                width: "xh8yej3",
                $$css: !0
            },
            text: {
                flexBasis: "x1r8uery",
                flexGrow: "x1iyjqo2",
                flexShrink: "xs83m0k",
                minWidth: "xeuugli",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.addOnEnd;
        a = a.text;
        var e = d("useIGDDeviceType").useIGDDeviceType().isMobile;
        return h.jsxs(c("IGDSBox.react"), {
            alignItems: "center",
            direction: "row",
            justifyContent: "between",
            xstyle: [i.root, e && i.mobileRoot],
            children: [h.jsx(c("IGDSBox.react"), {
                alignItems: "start",
                xstyle: i.text,
                children: h.jsx(c("IGDSText.react"), {
                    size: "label",
                    children: a
                })
            }), h.jsx(c("IGDSBox.react"), {
                xstyle: i.addOnEnd,
                children: b
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDEncryptionKeysSection.react", ["fbt", "CometLazyDialogTrigger.react", "CometPressable.react", "IGDSChevronIcon", "IGDThreadDetailRow.react", "JSResourceForInteraction", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            container: {
                textAlign: "x1yc453h",
                width: "xh8yej3",
                $$css: !0
            }
        };

    function a(a) {
        a = a.thread;
        var b = h._("__JHASH__Urimk0QzpYC__JHASH__"),
            d = c("JSResourceForInteraction")("IGDEncryptionKeysDialog.react").__setRef("IGDEncryptionKeysSection.react");
        return i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: {
                thread: a
            },
            dialogResource: d,
            children: function(a) {
                return i.jsx(c("CometPressable.react"), {
                    onPress: function() {
                        return a()
                    },
                    xstyle: j.container,
                    children: i.jsx(c("IGDThreadDetailRow.react"), {
                        addOnEnd: i.jsx(c("IGDSChevronIcon"), {
                            alt: "chevron",
                            color: "ig-tertiary-text",
                            direction: "next",
                            size: 16
                        }),
                        text: b
                    })
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDLeaveGroupInboxInfoButton.react", ["fbt", "IGDBaseButton.react", "IGDSBox.react", "IGDSText.react", "JSResourceForInteraction", "MWPBumpEntityKey", "react", "useCometLazyDialog"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useRef,
        k = {
            buttonContainer: {
                paddingBottom: "xsag5q8",
                paddingTop: "xyamay9",
                $$css: !0
            },
            descriptionLabel: {
                paddingTop: "xz9dl7a",
                paddingBottom: "xsag5q8",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.thread;
        a = j(null);
        var e = c("useCometLazyDialog")(c("JSResourceForInteraction")("IGDChatSettingsLeaveThreadDialog.react").__setRef("IGDLeaveGroupInboxInfoButton.react")),
            f = e[0];
        return i.jsxs(i.Fragment, {
            children: [i.jsx(c("IGDSBox.react"), {
                direction: "column",
                xstyle: k.buttonContainer,
                children: i.jsx(c("IGDBaseButton.react"), {
                    onClick: function() {
                        f({
                            thread: b
                        });
                        return d("MWPBumpEntityKey").bumpEntityKeyWithAppId("igd.infobar", "leave_chat")
                    },
                    ref: a,
                    children: i.jsx(c("IGDSText.react"), {
                        color: "errorOrDestructive",
                        size: "label",
                        textAlign: "start",
                        children: h._("__JHASH__hLJyeZmT1H___JHASH__")
                    })
                })
            }), i.jsx(c("IGDSBox.react"), {
                xstyle: k.descriptionLabel,
                children: i.jsx(c("IGDSText.react"), {
                    color: "secondaryText",
                    size: "body",
                    textAlign: "start",
                    children: h._("__JHASH__GnubGc0xFZ5__JHASH__")
                })
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("useMWLSCanLeaveGroup", ["I64", "LSIntEnum", "LSMessagingThreadTypeUtil", "LSThreadBitOffset"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        var b = d("I64").equal(a.parentThreadKey, d("LSIntEnum").ofNumber(-10));
        if (d("LSMessagingThreadTypeUtil").isGroup(a.threadType) && d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(28), a)) return !b;
        else return !1
    }
    g["default"] = a
}), 98);
__d("IGDThreadActionSection.react", ["fbt", "I64", "IGDAiAgentsUtils", "IGDBaseButton.react", "IGDDeleteOpenThreadInboxInfoButton.react", "IGDEncryptionKeysSection.react", "IGDLeaveGroupInboxInfoButton.react", "IGDSBox.react", "IGDSText.react", "LSMessagingThreadTypeUtil", "MWPActor.react", "ReQL", "ReQLSuspense", "cr:5048", "cr:5346", "cr:6411", "cr:6646", "react", "useIsEndChannelEnabled", "useMWLSCanLeaveGroup", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            actions: {
                flexShrink: "x2lah0s",
                paddingStart: "xbbxn1n",
                paddingEnd: "xxbr6pl",
                paddingTop: "x1y1aw1k",
                paddingBottom: "xwib8y2",
                $$css: !0
            },
            actionsMobile: {
                paddingStart: "x1swvt13",
                paddingEnd: "x1pi30zi",
                $$css: !0
            },
            buttonContainer: {
                paddingTop: "xyamay9",
                paddingBottom: "x1l90r2v",
                $$css: !0
            }
        };

    function a(a) {
        var e = a.isMobile,
            g = a.isSecure,
            k = a.isViewerInGroup,
            l = a.thread;
        a = c("useMWLSCanLeaveGroup")(l);
        var m = d("MWPActor.react").useActor(),
            n = c("useReStore")(),
            o = d("ReQLSuspense").useFirst(function() {
                return d("LSMessagingThreadTypeUtil").isOneToOne(l.threadType) && !d("IGDAiAgentsUtils").isAiThread(l.threadSubtype) ? d("ReQL").mergeJoin(d("ReQL").fromTableAscending(n.table("participants")).getKeyRange(l.threadKey), d("ReQL").fromTableAscending(n.table("contacts"))).filter(function(a) {
                    a[0];
                    a = a[1];
                    return !d("I64").equal(a.id, m)
                }).map(function(a) {
                    a[0];
                    a = a[1];
                    return a
                }) : d("ReQL").empty()
            }, [l.threadType, l.threadKey, n, m, l.threadSubtype], f.id + ":70"),
            p = h._("__JHASH__ayttqZWI5VP__JHASH__"),
            q = !g && o != null && b("cr:5048") != null ? i.jsx(b("cr:5048"), {
                contact: o,
                thread: l
            }) : null;
        o = o != null && b("cr:6646") != null ? i.jsx(b("cr:6646"), {
            clickPoint: "direct_thread_info",
            contact: o,
            onClose: function() {},
            renderButton: function(a, b) {
                return i.jsx(c("IGDSBox.react"), {
                    direction: "column",
                    xstyle: j.buttonContainer,
                    children: i.jsx(c("IGDBaseButton.react"), {
                        onClick: a,
                        children: i.jsx(c("IGDSText.react"), {
                            color: "errorOrDestructive",
                            size: "label",
                            textAlign: "start",
                            children: b
                        })
                    })
                })
            },
            thread: l
        }) : null;
        var r = d("useIsEndChannelEnabled").useIsEndChannelEnabled(l) && b("cr:5346") != null ? i.jsx(b("cr:5346"), {
            pauseTimestamp: l.pauseThreadTimestamp,
            threadKey: l.threadKey
        }) : null;
        return i.jsxs(i.Fragment, {
            children: [g ? i.jsxs(i.Fragment, {
                children: [i.jsx(c("IGDSBox.react"), {
                    direction: "column",
                    marginTop: 3,
                    xstyle: [j.actions, e && j.actionsMobile],
                    children: i.jsx(c("IGDSText.react"), {
                        size: "label",
                        weight: "semibold",
                        children: p
                    })
                }), i.jsx(c("IGDEncryptionKeysSection.react"), {
                    thread: l
                })]
            }) : null, i.jsxs(c("IGDSBox.react"), {
                direction: "column",
                xstyle: [j.actions, e && j.actionsMobile],
                children: [q, o, r, k && a ? i.jsx(c("IGDLeaveGroupInboxInfoButton.react"), {
                    thread: l
                }) : null, g ? b("cr:6411") == null ? i.jsx(c("IGDDeleteOpenThreadInboxInfoButton.react"), {
                    thread: l
                }) : i.jsx(b("cr:6411"), {
                    thread: l
                }) : i.jsx(c("IGDDeleteOpenThreadInboxInfoButton.react"), {
                    thread: l
                })]
            })]
        })
    }
    g["default"] = a
}), 98);
__d("IGDThreadDetailRowButton.react", ["IGDSButton.react", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            root: {
                backgroundColor: "x19g9edo",
                color: "x5n08af",
                ":hover_backgroundColor": "x1rtvea0",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.buttonRef,
            d = a.isDisabled;
        d = d === void 0 ? !1 : d;
        var e = a.onClick;
        a = a.text;
        if (b != null) return h.jsx(c("IGDSButton.react"), {
            display: "block",
            isDisabled: d,
            label: a,
            onClick: e,
            ref: b,
            role: "button",
            xstyle: i.root
        });
        else return h.jsx(c("IGDSButton.react"), {
            display: "block",
            isDisabled: d,
            label: a,
            onClick: e,
            role: "button",
            xstyle: i.root
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDEditThreadNameButton.react", ["fbt", "CometLazyDialogTrigger.react", "IGDBroadcastChannelQPL", "IGDThreadDetailRow.react", "IGDThreadDetailRowButton.react", "JSResourceForInteraction", "LSIntEnum", "LSThreadBitOffset", "MWCMThreadTypes.react", "react"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useRef;

    function k(a) {
        a = a.thread;
        var b = j(null),
            e = a.threadSubtype != null && d("MWCMThreadTypes.react").isIGBroadcastChannelThread(a.threadSubtype),
            f = e ? h._("__JHASH__1DiqVIBtBxU__JHASH__") : h._("__JHASH__tok86-WpKEl__JHASH__"),
            g = h._("__JHASH__YL5ViCCRwTj__JHASH__");
        return i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: {
                onClose: function() {},
                thread: a
            },
            dialogResource: c("JSResourceForInteraction")("IGDEditThreadNameDialog.react").__setRef("IGDEditThreadNameButton.react"),
            children: function(a) {
                return i.jsx(c("IGDThreadDetailRow.react"), {
                    addOnEnd: i.jsx(c("IGDThreadDetailRowButton.react"), {
                        buttonRef: b,
                        onClick: function() {
                            d("IGDBroadcastChannelQPL").logEditChannelStart(), a()
                        },
                        text: g
                    }),
                    text: f
                })
            }
        })
    }
    k.displayName = k.name + " [from " + f.id + "]";

    function a(a) {
        a = a.thread;
        var b = d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(60), a);
        if (b) return i.jsx(k, {
            thread: a
        });
        else return null
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDThreadInfoE2EEAttribution.react", ["fbt", "CometLink.react", "IGDSBox.react", "IGDSLockFilledIcon", "IGDSText.react", "XInstagramHelpDotComContentControllerRouteBuilder", "react", "useIGDDeviceType"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = {
            linkMargin: {
                marginStart: "xsgj6o6",
                $$css: !0
            },
            lockIcon: {
                paddingEnd: "x1sxyh0",
                $$css: !0
            },
            mobileRoot: {
                paddingStart: "x1swvt13",
                paddingEnd: "x1pi30zi",
                $$css: !0
            },
            root: {
                minHeight: "x879a55",
                paddingBottom: "xwxc41k",
                paddingStart: "x14gfdix",
                paddingEnd: "x14ya1hp",
                width: "xh8yej3",
                $$css: !0
            },
            text: {
                flexBasis: "x1r8uery",
                flexGrow: "x1iyjqo2",
                flexShrink: "xs83m0k",
                minWidth: "xeuugli",
                $$css: !0
            }
        },
        k = h._("__JHASH__drDwqj7Ttok__JHASH__"),
        l = h._("__JHASH__4Vv_6Y5N66l__JHASH__");

    function a() {
        var a, b = d("useIGDDeviceType").useIGDDeviceType().isMobile;
        a = (a = c("XInstagramHelpDotComContentControllerRouteBuilder").buildUri({
            cms_id: "491565145294150"
        }).setDomain("help.instagram.com")) == null ? void 0 : (a = a.setProtocol("https")) == null ? void 0 : a.toString();
        return i.jsxs(c("IGDSBox.react"), {
            alignItems: "center",
            direction: "row",
            justifyContent: "between",
            xstyle: [j.root, b && j.mobileRoot],
            children: [i.jsx(c("IGDSBox.react"), {
                height: "65%",
                xstyle: j.lockIcon,
                children: i.jsx(c("IGDSLockFilledIcon"), {
                    alt: k,
                    color: "ig-secondary-text",
                    "data-testid": void 0,
                    size: 8
                })
            }), i.jsx(c("IGDSBox.react"), {
                xstyle: j.text,
                children: i.jsxs(c("IGDSText.react"), {
                    color: "secondaryText",
                    size: b ? "body" : "footnote",
                    weight: "normal",
                    children: [k, i.jsx(c("CometLink.react"), {
                        href: a,
                        target: "_blank",
                        xstyle: j.linkMargin,
                        children: l
                    })]
                })
            })]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("ChatMuteStore.bs", [], (function(a, b, c, d, e, f) {
    "use strict";
    b = {
        FifteenMinutes: 9e5,
        OneHour: 36e5,
        EightHours: 288e5,
        OneDay: 864e5,
        Indefinitely: -1
    };
    c = {
        Message: "messageMuteScope",
        Call: "callMuteScope",
        Both: "bothMuteScope"
    };
    var g = {
        Duration: "setMuteDuration",
        Scope: "setMuteScope"
    };
    d = {
        type: c.Message
    };
    e = {
        type: c.Call
    };
    var h = {
            type: c.Both
        },
        i = {
            duration: b.FifteenMinutes,
            scope: d
        };

    function a(a, b) {
        return b.type === g.Scope ? {
            duration: a.duration,
            scope: b.scope
        } : {
            duration: b.duration,
            scope: a.scope
        }
    }
    f.ChatMuteOptions = b;
    f.ChatMuteScopeTypes = c;
    f.SetMuteActionTypes = g;
    f.message = d;
    f.call = e;
    f.both = h;
    f.initialState = i;
    f.reducer = a
}), 66);
__d("ChatMuteProvider.bs", ["ChatMuteStore.bs", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    c = d("react");
    e = c.createContext;
    var h = c.createElement,
        i = c.useMemo,
        j = c.useReducer;

    function a(a) {}
    f = [d("ChatMuteStore.bs").initialState, a];
    var k = e(f);

    function b(a) {
        a = a.children;
        var b = j(d("ChatMuteStore.bs").reducer, d("ChatMuteStore.bs").initialState),
            c = b[0],
            e = b[1];
        b = k.Provider;
        var f = i(function() {
            return [c, e]
        }, [c, e]);
        return h(b, {
            children: a,
            value: f
        })
    }
    c = b;
    g.context = k;
    g.ChatMuteOptions = d("ChatMuteStore.bs").ChatMuteOptions;
    g.make = c
}), 98);
__d("useMWChatMuteThread", ["ChatMuteStore.bs", "I64", "Int64Hooks", "LSFactory", "LSIntEnum", "LSMailboxType", "LSMuteCallsFromThread", "LSOptimisticMuteThread", "ServerTime", "promiseDone", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a(a) {
        var b = a.threadKey,
            e = c("useReStore")();
        return d("Int64Hooks").useCallbackInt64(function(a, f) {
            var g = a !== -1 ? d("I64").of_float(d("ServerTime").getMillis() + d("I64").to_float(d("I64").of_int32(a))) : d("I64").neg_one;
            a = function() {
                c("promiseDone")(e.runInTransaction(function(a) {
                    return c("LSOptimisticMuteThread")(b, d("LSIntEnum").ofNumber(c("LSMailboxType").MESSENGER), g, c("LSFactory")(a))
                }, "readwrite"))
            };
            var h = function() {
                c("promiseDone")(e.runInTransaction(function(a) {
                    return c("LSMuteCallsFromThread")(b, d("LSIntEnum").ofNumber(c("LSMailboxType").MESSENGER), g, void 0, c("LSFactory")(a))
                }, "readwrite"))
            };
            switch (f.type) {
                case d("ChatMuteStore.bs").ChatMuteScopeTypes.Message:
                    return a();
                case d("ChatMuteStore.bs").ChatMuteScopeTypes.Call:
                    return h();
                case d("ChatMuteStore.bs").ChatMuteScopeTypes.Both:
                    a();
                    return h()
            }
        }, [e, b])
    }
    g["default"] = a
}), 98);
__d("useMWChatUnmuteThread", ["I64", "LSFactory", "LSIntEnum", "LSMailboxType", "LSMuteCallsFromThread", "LSOptimisticMuteThread", "promiseDone", "react", "useReStore"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react").useCallback;

    function a() {
        var a = c("useReStore")(),
            b = d("I64").zero;
        return h(function(e) {
            var f = d("I64").to_string(e.threadKey);
            d("I64").equal(e.muteExpireTimeMs, b) || c("promiseDone")(a.runInTransaction(function(a) {
                return c("LSOptimisticMuteThread")(d("I64").of_string(f), d("LSIntEnum").ofNumber(c("LSMailboxType").MESSENGER), d("I64").zero, c("LSFactory")(a))
            }, "readwrite"));
            if (!d("I64").equal(e.muteCallsExpireTimeMs, b)) {
                c("promiseDone")(a.runInTransaction(function(a) {
                    return c("LSMuteCallsFromThread")(d("I64").of_string(f), d("LSIntEnum").ofNumber(c("LSMailboxType").MESSENGER), d("I64").zero, void 0, c("LSFactory")(a))
                }, "readwrite"));
                return
            }
        }, [a, b])
    }
    g["default"] = a
}), 98);
__d("IGDThreadInfoMutedSection.react", ["fbt", "ChatMuteProvider.bs", "I64", "IGDSBox.react", "IGDSGlimmer.react", "IGDSSwitch.react", "IGDThreadDetailRow.react", "LSAuthorityLevel", "LSContactBlockedByViewerStatus", "LSIntEnum", "LSMessagingThreadTypeUtil", "LSThreadBitOffset", "MWPActor.react", "MWPBumpEntityKey", "ReQL", "ReQLSuspense", "react", "useMWChatMuteThread", "useMWChatUnmuteThread", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useContext,
        k = {
            container: {
                paddingStart: "xbbxn1n",
                paddingEnd: "xxbr6pl",
                paddingTop: "xyinxu5",
                paddingBottom: "x1g2khh7",
                width: "xh8yej3",
                $$css: !0
            },
            "switch": {
                borderTopStartRadius: "xfh8nwu",
                borderTopEndRadius: "xoqspk4",
                borderBottomEndRadius: "x12v9rci",
                borderBottomStartRadius: "x138vmkv",
                height: "x10w6t97",
                marginStart: "x16n37ib",
                width: "x1ygkb0v",
                $$css: !0
            },
            text: {
                borderTopStartRadius: "x1lq5wgf",
                borderTopEndRadius: "xgqcy7u",
                borderBottomEndRadius: "x30kzoy",
                borderBottomStartRadius: "x9jhf4c",
                height: "xmix8c7",
                width: "x1m56yxe",
                $$css: !0
            }
        };

    function l(a) {
        var b = a.thread,
            e = c("useMWChatUnmuteThread")(),
            f = c("useMWChatMuteThread")(b);
        a = j(d("ChatMuteProvider.bs").context);
        var g = a[0],
            k = d("I64").equal(b.muteExpireTimeMs, d("I64").neg_one) || d("I64").gt(b.muteExpireTimeMs, d("I64").of_float(Date.now()));
        a = h._("__JHASH__XYF8EHiGLbM__JHASH__");
        return i.jsx(c("IGDThreadDetailRow.react"), {
            addOnEnd: i.jsx(c("IGDSSwitch.react"), {
                "aria-label": a,
                onValueChange: function() {
                    k ? e(b) : f(-1, g.scope), d("MWPBumpEntityKey").bumpEntityKeyWithAppId("igd.infobar", "quick_actions_mute." + (k ? "unmute" : "mute"))
                },
                testid: void 0,
                value: k
            }),
            text: a
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";

    function m() {
        return i.jsxs(c("IGDSBox.react"), {
            alignItems: "center",
            direction: "row",
            justifyContent: "between",
            xstyle: k.container,
            children: [i.jsx(c("IGDSGlimmer.react"), {
                index: 1,
                xstyle: k.text
            }), i.jsx(c("IGDSGlimmer.react"), {
                index: 1,
                xstyle: k["switch"]
            })]
        })
    }
    m.displayName = m.name + " [from " + f.id + "]";

    function a(a) {
        a = a.thread;
        var b = a.threadKey,
            e = a.threadType,
            g = c("useReStore")(),
            h = d("MWPActor.react").useActor(),
            j = d("LSMessagingThreadTypeUtil").isOneToOne(e);
        e = d("ReQLSuspense").useFirst(function() {
            return j ? d("ReQL").mergeJoin(d("ReQL").fromTableAscending(g.table("participants")).getKeyRange(b), d("ReQL").fromTableAscending(g.table("contacts"))).filter(function(a) {
                a[0];
                a = a[1];
                return !d("I64").equal(a.id, h)
            }).map(function(a) {
                a[0];
                a = a[1];
                return a
            }) : d("ReQL").empty()
        }, [h, g, j, b], f.id + ":114");
        e = e != null ? !d("I64").equal(e.blockedByViewerStatus, d("LSIntEnum").ofNumber(c("LSContactBlockedByViewerStatus").UNBLOCKED)) : !1;
        var k = d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(19), a),
            n = d("I64").lt(a.authorityLevel, d("LSIntEnum").ofNumber(c("LSAuthorityLevel").AUTHORITATIVE));
        if (n) return i.jsx(m, {});
        return k && !e ? i.jsx(l, {
            thread: a
        }) : null
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDThreadInfoSection.react", ["IGDEditThreadNameButton.react", "IGDSBox.react", "IGDThreadInfoE2EEAttribution.react", "IGDThreadInfoMutedSection.react", "LSIntEnum", "LSMessagingThreadTypeUtil", "LSThreadBitOffset", "MWCMThreadTypes.react", "MWLSFeatureLimitedStatus.bs", "PolarisReactRedux", "cr:1244", "cr:3252", "cr:5093", "polarisUserSelectors", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react"),
        i = {
            infoSection: {
                borderTopColor: "x5ur3kl",
                borderTopStyle: "x13fuv20",
                borderTopWidth: "x178xt8z",
                $$css: !0
            },
            paddingBottom: {
                paddingBottom: "xwib8y2",
                $$css: !0
            }
        };

    function a(a) {
        var e = a.isSecure;
        e = e === void 0 ? !1 : e;
        var f = a.setShowInfo;
        a = a.thread;
        var g = d("PolarisReactRedux").useSelector(d("polarisUserSelectors").getViewer);
        g = g == null ? !1 : g.isProfessionalAccount;
        var j = !e && d("LSMessagingThreadTypeUtil").isOneToOne(a.threadType),
            k = d("LSThreadBitOffset").has(d("LSIntEnum").ofNumber(108), a),
            l = a.threadSubtype != null && d("MWCMThreadTypes.react").isIGBroadcastChannelThread(a.threadSubtype);
        g = !e && g === !0 && a.igFolder != null && a.folderName === "inbox" && !l;
        l = d("MWLSFeatureLimitedStatus.bs").useIsReadOnlyFeatureLimited();
        return h.jsxs(h.Fragment, {
            children: [e ? h.jsx(c("IGDThreadInfoE2EEAttribution.react"), {}) : null, h.jsxs(c("IGDSBox.react"), {
                xstyle: e && i.infoSection,
                children: [l ? null : h.jsx(c("IGDEditThreadNameButton.react"), {
                    thread: a
                }), k && b("cr:1244") != null && h.jsx(b("cr:1244"), {
                    thread: a
                }), h.jsx(c("IGDThreadInfoMutedSection.react"), {
                    thread: a
                }), h.jsxs(c("IGDSBox.react"), {
                    xstyle: i.paddingBottom,
                    children: [j && b("cr:3252") != null ? h.jsx(b("cr:3252"), {
                        setShowInfo: f,
                        threadKey: a.threadKey
                    }) : null, g && b("cr:5093") != null ? h.jsx(b("cr:5093"), {
                        thread: a
                    }) : null]
                })]
            })]
        })
    }
    g["default"] = a
}), 98);
__d("IGDGroupMemberListItem.react", ["fbt", "CometLazyDialogTrigger.react", "CometMiddot.react", "CometPlaceholder.react", "I64", "IGDListCell.react", "IGDSBox.react", "IGDSIconButton.react", "IGDSText.react", "IGDSVerifiedBadge.react", "IGDSingleAvatar.react", "JSResourceForInteraction", "LSContactBlockedByViewerStatus", "LSContactGenderToGenderConst", "LSContactVerificationBadge.react", "LSGroupParticipantJoinState", "LSIntEnum", "LSMediaUrl.bs", "LSWhatsAppConnectStatus", "MWPActor.react", "PolarisIGCoreMoreVerticalPanoOutline24Icon", "getFBTSafeGenderFromGenderConst", "react", "useIGDDeviceType"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useMemo;

    function k(a) {
        return j(function() {
            var b = a.filter(function(a) {
                return a !== null
            });
            if (b.length === 0) return;
            else return b.map(function(a, b) {
                return i.jsxs(i.Fragment, {
                    children: [b !== 0 ? i.jsx(c("CometMiddot.react"), {}) : null, a]
                }, String(b))
            })
        }, [a])
    }

    function a(a) {
        var b, e = a.contact,
            f = a.isGroup,
            g = a.isSecure,
            j = a.onClose,
            l = a.participant;
        a = a.thread;
        var m = e.secondaryName;
        m = m != null ? {
            target: "_blank",
            url: "https://www.instagram.com/" + m
        } : void 0;
        b = (b = l.isAdmin) != null ? b : !1;
        var n = d("useIGDDeviceType").useIGDDeviceType().isMobile,
            o = !d("I64").equal(e.blockedByViewerStatus, d("LSIntEnum").ofNumber(c("LSContactBlockedByViewerStatus").UNBLOCKED)),
            p = d("I64").equal(e.waConnectStatus, d("LSIntEnum").ofNumber(c("LSWhatsAppConnectStatus").WHATSAPP_NOT_ADDRESSABLE)),
            q = d("LSContactGenderToGenderConst").make(e.gender),
            r = d("MWPActor.react").useActor(),
            s = d("I64").equal(l.groupParticipantJoinState, d("LSIntEnum").ofNumber(c("LSGroupParticipantJoinState").INVITED));
        b = b ? h._("__JHASH__1au-Sy6zjdP__JHASH__") : null;
        g && (p && !s ? b = h._("__JHASH__NR_W3PERa64__JHASH__") : !p && s && (b = h._("__JHASH__-vdu5ZsYoKx__JHASH__")));
        p = k([b, o ? h._("__JHASH__99hPFP9eCrN__JHASH__") : null, e.secondaryName != null && e.name !== e.secondaryName ? e.name : null]);
        b = c("JSResourceForInteraction")("IGDGroupMembershipDialog.react").__setRef("IGDGroupMemberListItem.react");
        var t = h._("__JHASH__dIvMDAQD3KH__JHASH__", [h._name("name", e.name, c("getFBTSafeGenderFromGenderConst")(q))]);
        o = !d("I64").equal(e.id, r) && f === !0 ? i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: {
                contact: e,
                onClose: j,
                onCloseDialog: j,
                participant: l,
                threadKey: a.threadKey
            },
            dialogResource: b,
            children: function(a) {
                return i.jsx(c("IGDSIconButton.react"), {
                    onClick: a,
                    padding: 0,
                    children: i.jsx(c("PolarisIGCoreMoreVerticalPanoOutline24Icon"), {
                        alt: t,
                        color: "ig-secondary-text",
                        size: 24
                    })
                })
            }
        }) : void 0;
        q = e.secondaryName != null ? i.jsxs(c("IGDSBox.react"), {
            direction: "row",
            children: [i.jsx(c("IGDSText.react"), {
                color: g && s ? "tertiaryText" : "primaryText",
                size: "body",
                weight: "semibold",
                children: e.secondaryName
            }), i.jsx(c("CometPlaceholder.react"), {
                fallback: null,
                children: i.jsx(c("LSContactVerificationBadge.react"), {
                    contact: e,
                    icon: i.jsx(c("IGDSVerifiedBadge.react"), {
                        size: "small"
                    })
                })
            })]
        }) : void 0;
        r = i.jsx(c("IGDSingleAvatar.react"), {
            isActive: !1,
            isMobile: n,
            size: "large",
            src: d("LSMediaUrl.bs").Contact.profilePictureUrl(e)
        });
        f = p != null ? i.jsxs("div", {
            children: [q, i.jsx("div", {
                className: "x889kno",
                children: i.jsx(c("IGDSText.react"), {
                    color: g && s ? "tertiaryText" : "secondaryText",
                    size: "body",
                    textAlign: "start",
                    children: p
                })
            })]
        }) : q;
        return i.jsx(c("IGDListCell.react"), {
            addOnEnd: o,
            addOnStart: r,
            content: f,
            linkProps: m,
            size: n ? "small" : "large"
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDGroupMemberList.react", ["I64", "IGDGroupMemberListItem.react", "IGDListCellPlaceholder.react", "LSMessagingThreadTypeUtil", "react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    var h = d("react");

    function a(a) {
        var b = a.isGroup,
            e = a.onClose,
            f = a.participantsAndContacts,
            g = a.thread,
            i = (a = e) != null ? a : function() {};
        e = f.slice(0).sort(function(a, b) {
            return b[1].rank - a[1].rank
        });
        var j = d("LSMessagingThreadTypeUtil").isSecure(g.threadType);
        if (e.length === 0) return h.jsx(c("IGDListCellPlaceholder.react"), {});
        else return e.map(function(a) {
            var e = a[1];
            return h.jsx(c("IGDGroupMemberListItem.react"), {
                contact: e,
                isGroup: b,
                isSecure: j,
                onClose: i,
                participant: a[0],
                thread: g
            }, d("I64").to_string(e.id))
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWGroupLimitConfig.bs", ["cr:1217"], (function(a, b, c, d, e, f, g) {
    "use strict";
    g.nonGxac = b("cr:1217").nonGxac, g.armadillo = b("cr:1217").armadillo, g.gxac = b("cr:1217").gxac
}), 98);
__d("IGDThreadMembersSection.react", ["fbt", "CometLazyDialogTrigger.react", "I64", "IGDGroupMemberList.react", "IGDSBox.react", "IGDSButton.react", "IGDSText.react", "JSResourceForInteraction", "LSMessagingThreadTypeUtil", "MWCMThreadTypes.react", "MWGroupLimitConfig.bs", "MWLSFeatureLimitedStatus.bs", "MWPActor.react", "MWPBumpEntityKey", "MWPParticipantsAndContactsForThread_DO_NOT_USE_THIS_WILL_KILL_PERFORMANCE.bs", "emptyFunction", "react", "useIGDIsViewerAdmin"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useMemo,
        k = {
            membersHeader: {
                paddingBottom: "x1g2khh7",
                paddingStart: "xbbxn1n",
                paddingEnd: "xxbr6pl",
                paddingTop: "x1p5oq8j",
                $$css: !0
            },
            membersHeaderMobile: {
                paddingStart: "x1swvt13",
                paddingEnd: "x1pi30zi",
                $$css: !0
            },
            membersSection: {
                borderBottom: "x13zqm9e",
                borderTop: "x1wzhzgj",
                paddingBottom: "xwib8y2",
                $$css: !0
            }
        };

    function a(a) {
        var b = a.isMobile,
            e = a.isViewerInGroup,
            f = a.thread,
            g = d("LSMessagingThreadTypeUtil").isOneToOne(f.threadType);
        a = d("LSMessagingThreadTypeUtil").isGroup(f.threadType);
        var l = d("LSMessagingThreadTypeUtil").isIGDMessageRequest(f),
            m = d("MWPParticipantsAndContactsForThread_DO_NOT_USE_THIS_WILL_KILL_PERFORMANCE.bs").useValue(f),
            n = d("MWPActor.react").useActor(),
            o = j(function() {
                if (!(g && m.length > 1)) return i.jsx(c("IGDGroupMemberList.react"), {
                    isGroup: !0,
                    participantsAndContacts: m,
                    thread: f
                });
                var a = m.filter(function(a) {
                    var b = a[0];
                    a[1];
                    return !d("I64").equal(b.contactId, n)
                });
                return i.jsx(c("IGDGroupMemberList.react"), {
                    isGroup: !1,
                    participantsAndContacts: a,
                    thread: f
                })
            }, [m, g, n, f]),
            p = d("LSMessagingThreadTypeUtil").isSecure(f.threadType),
            q = p ? d("MWGroupLimitConfig.bs").armadillo() : d("MWGroupLimitConfig.bs").gxac;
        q = q - m.length | 0;
        var r = q > 0,
            s = c("useIGDIsViewerAdmin")(f),
            t = f.threadSubtype != null && d("MWCMThreadTypes.react").isIGBroadcastChannelThread(f.threadSubtype),
            u = d("MWLSFeatureLimitedStatus.bs").useIsReadOnlyFeatureLimited();
        a = a && !l && (s || !p) && e && !t && !u;
        l = m.map(function(a) {
            var b = a[0];
            a[1];
            return d("I64").to_string(b.contactId)
        });
        s = t ? h._("__JHASH__jCyCwcUSatZ__JHASH__") : h._("__JHASH__LccyHdpuGSr__JHASH__");
        var v = h._("__JHASH__1UsgFiP-Gbr__JHASH__");
        p = c("emptyFunction");
        return i.jsxs(c("IGDSBox.react"), {
            direction: "column",
            xstyle: k.membersSection,
            children: [i.jsxs(c("IGDSBox.react"), {
                alignItems: "center",
                direction: "row",
                justifyContent: "between",
                xstyle: [k.membersHeader, b && k.membersHeaderMobile],
                children: [i.jsx(c("IGDSText.react"), {
                    size: "label",
                    weight: "semibold",
                    children: s
                }), a ? r ? i.jsx(c("CometLazyDialogTrigger.react"), {
                    dialogProps: {
                        filteredCandidates: l,
                        maxRecipientsToAdd: q,
                        onClose: p,
                        thread: f
                    },
                    dialogResource: c("JSResourceForInteraction")("IGDAddParticipantDialog.react").__setRef("IGDThreadMembersSection.react"),
                    children: function(a) {
                        return i.jsx(c("IGDSButton.react"), {
                            "data-testid": void 0,
                            display: "block",
                            label: v,
                            onClick: function() {
                                a();
                                return d("MWPBumpEntityKey").bumpEntityKeyWithAppId("igd.infobar", "add_member")
                            },
                            variant: "primary_link"
                        })
                    }
                }) : i.jsx(c("CometLazyDialogTrigger.react"), {
                    dialogProps: {
                        body: h._("__JHASH__i4s0QIHEC_L__JHASH__"),
                        close: h._("__JHASH__FI1tkByyuGt__JHASH__"),
                        onClose: function() {},
                        title: h._("__JHASH__qc01BI1fkNA__JHASH__")
                    },
                    dialogResource: c("JSResourceForInteraction")("IGDAlertDialog.react").__setRef("IGDThreadMembersSection.react"),
                    children: function(a) {
                        return i.jsx(c("IGDSButton.react"), {
                            display: "block",
                            label: v,
                            onClick: function() {
                                return a()
                            },
                            variant: "primary_link"
                        })
                    }
                }) : null]
            }), o]
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDInboxInfo.react", ["fbt", "CometScrollableArea.react", "IGDMobileNavigationButton.react", "IGDSBox.react", "IGDSText.react", "IGDSectionHeader.react", "IGDThreadActionSection.react", "IGDThreadInfoSection.react", "IGDThreadMembersSection.react", "LSMessagingThreadTypeUtil", "MWPActor.react", "PolarisUA", "ReQL", "ReQLSuspense", "react", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react");
    b = d("react").memo;
    var j = {
        container: {
            maxHeight: "xpaleoy",
            $$css: !0
        },
        headerTextContainer: {
            display: "x78zum5",
            flexGrow: "x1iyjqo2",
            $$css: !0
        },
        headerTextContainerDesktop: {
            paddingStart: "xurb0ha",
            paddingEnd: "x1sxyh0",
            $$css: !0
        }
    };

    function k(a) {
        var b = c("useReStore")(),
            e = d("MWPActor.react").useActor(),
            g = a.threadKey;
        return d("ReQLSuspense").useFirst(function() {
            return d("ReQL").fromTableAscending(b.table("participants")).getKeyRange(g, e).map(function(a) {
                return a.contactId
            })
        }, [b, e, g], f.id + ":53") != null
    }

    function l(a) {
        var b = a.isMobile,
            e = a.setShowInfo;
        a = a.thread;
        var f = d("LSMessagingThreadTypeUtil").isSecure(a.threadType),
            g = k(a);
        return i.jsxs(c("CometScrollableArea.react"), {
            horizontal: !1,
            xstyle: j.container,
            children: [g ? i.jsx(c("IGDThreadInfoSection.react"), {
                isMobile: b,
                isSecure: f,
                setShowInfo: e,
                thread: a
            }) : null, i.jsx(c("IGDThreadMembersSection.react"), {
                isMobile: b,
                isViewerInGroup: g,
                thread: a
            }), i.jsx(c("IGDThreadActionSection.react"), {
                isMobile: b,
                isSecure: f,
                isViewerInGroup: g,
                thread: a
            })]
        })
    }
    l.displayName = l.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.setShowInfo;
        a = a.thread;
        var e = d("PolarisUA").isMobile(),
            f = h._("__JHASH__GUGB22aK56B__JHASH__");
        return i.jsxs(i.Fragment, {
            children: [i.jsx(c("IGDSectionHeader.react"), {
                endAdornment: e ? i.jsx("div", {}) : void 0,
                isMobile: e,
                noBottomBorder: !0,
                startAdornment: e ? i.jsx(c("IGDMobileNavigationButton.react"), {
                    onClick: function() {
                        return b(!1)
                    }
                }) : void 0,
                children: i.jsx(c("IGDSBox.react"), {
                    xstyle: [j.headerTextContainer, !e && j.headerTextContainerDesktop],
                    children: i.jsx(c("IGDSText.react"), {
                        size: "title",
                        textAlign: "start",
                        weight: "semibold",
                        children: f
                    })
                })
            }), i.jsx(l, {
                isMobile: e,
                setShowInfo: b,
                thread: a
            })]
        })
    }
    e = b(a);
    g["default"] = e
}), 98);
__d("IGDProMoveFolderThreadListButton.react", ["fbt", "I64", "IGDProLogging", "IGDThreadDetailRow.react", "IGDThreadDetailRowButton.react", "IgTags_InboxFolder", "LSFactory", "LSIntEnum", "LSMoveIgFolder", "promiseDone", "react", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = h._("__JHASH__usCur3ATc80__JHASH__"),
        k = h._("__JHASH__oo4gEmN8sHM__JHASH__"),
        l = h._("__JHASH__rGkZOURlzX8__JHASH__");

    function a(a) {
        var b = a.thread;
        a = b.igFolder;
        var e = b.threadKey,
            f = a != null && d("I64").equal(a, d("LSIntEnum").ofNumber(c("IgTags_InboxFolder").GENERAL)) ? d("LSIntEnum").ofNumber(c("IgTags_InboxFolder").PRIMARY) : a != null && d("I64").equal(a, d("LSIntEnum").ofNumber(c("IgTags_InboxFolder").PRIMARY)) ? d("LSIntEnum").ofNumber(c("IgTags_InboxFolder").GENERAL) : void 0,
            g = c("useReStore")(),
            h = function() {
                c("promiseDone")(g.runInTransaction(function(a) {
                    var d;
                    return c("LSMoveIgFolder")(e, (d = b.igFolder) != null ? d : void 0, (d = f) != null ? d : void 0, c("LSFactory")(a))
                }, "readwrite"), function() {
                    if (f != null)
                        if (d("I64").equal(f, d("LSIntEnum").ofNumber(c("IgTags_InboxFolder").PRIMARY))) return d("IGDProLogging").ODSBumpMoveThreadPrimary();
                        else if (d("I64").equal(f, d("LSIntEnum").ofNumber(c("IgTags_InboxFolder").GENERAL))) return d("IGDProLogging").ODSBumpMoveThreadGeneral();
                    else return
                })
            };
        return i.jsx(c("IGDThreadDetailRow.react"), {
            addOnEnd: i.jsx(c("IGDThreadDetailRowButton.react"), {
                buttonRef: void 0,
                onClick: h,
                text: j
            }),
            text: a != null && d("I64").equal(a, d("LSIntEnum").ofNumber(c("IgTags_InboxFolder").GENERAL)) ? k : a != null && d("I64").equal(a, d("LSIntEnum").ofNumber(c("IgTags_InboxFolder").PRIMARY)) ? l : ""
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("IGDReportProfileInboxInfoButton.react", ["fbt", "CometLazyDialogTrigger.react", "I64", "IGDBaseButton.react", "IGDSBox.react", "IGDSText.react", "JSResourceForInteraction", "LSMediaUrl.bs", "LSMessagingThreadTypeUtil", "MWPBumpEntityKey", "ReQL", "ReQLSuspense", "emptyFunction", "react", "usePolarisAnalyticsContext", "useReStore"], (function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = d("react"),
        j = d("react").useRef,
        k = h._("__JHASH__mGRaYa2FhYE__JHASH__"),
        l = {
            buttonContainer: {
                paddingTop: "xyamay9",
                paddingBottom: "x1l90r2v",
                $$css: !0
            }
        };

    function m(a) {
        var b = a.onTrigger;
        a = j(null);
        return i.jsx(c("IGDSBox.react"), {
            direction: "column",
            xstyle: l.buttonContainer,
            children: i.jsx(c("IGDBaseButton.react"), {
                onClick: function() {
                    b();
                    return d("MWPBumpEntityKey").bumpEntityKeyWithAppId("igd.infobar", "report")
                },
                ref: a,
                children: i.jsx(c("IGDSText.react"), {
                    color: "errorOrDestructive",
                    size: "label",
                    textAlign: "start",
                    children: k
                })
            })
        })
    }
    m.displayName = m.name + " [from " + f.id + "]";

    function a(a) {
        var b = a.contact,
            e = a.thread,
            g = c("useReStore")();
        a = d("ReQLSuspense").useFirst(function() {
            return d("ReQL").fromTableAscending(g.table("ig_thread_info")).getKeyRange(e.threadKey)
        }, [g, e.threadKey], f.id + ":88");
        var h = d("LSMessagingThreadTypeUtil").isSecure(e.threadType),
            j = d("LSMessagingThreadTypeUtil").isGroup(e.threadType),
            k = c("usePolarisAnalyticsContext")() + "WWW";
        if (h) return i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: {
                onClose: c("emptyFunction"),
                profilePicUrl: d("LSMediaUrl.bs").Contact.profilePictureUrl(b),
                senderId: d("I64").to_string(b.id),
                threadId: d("I64").to_string(e.threadKey),
                username: b.secondaryName,
                threadKey: e.threadKey,
                isGroup: j
            },
            dialogResource: c("JSResourceForInteraction")("PolarisDirectReportingEncryptedThreadModal").__setRef("IGDReportProfileInboxInfoButton.react"),
            children: function(a) {
                return i.jsx(m, {
                    onTrigger: a
                })
            }
        });
        else return i.jsx(c("CometLazyDialogTrigger.react"), {
            dialogProps: {
                onClose: void 0,
                profilePicUrl: d("LSMediaUrl.bs").Contact.profilePictureUrl(b),
                senderId: d("I64").to_string(b.id),
                threadId: a == null ? void 0 : a.igThreadId,
                username: b.secondaryName,
                containerModule: k,
                threadKey: e.threadKey,
                isGroup: j
            },
            dialogResource: c("JSResourceForInteraction")("PolarisDirectReportingThreadModal").__setRef("IGDReportProfileInboxInfoButton.react"),
            children: function(a) {
                return i.jsx(m, {
                    onTrigger: a
                })
            }
        })
    }
    a.displayName = a.name + " [from " + f.id + "]";
    g["default"] = a
}), 98);
__d("MWGroupLimitConfigForProd.bs", ["MAWAbPropsClient"], (function(a, b, c, d, e, f, g) {
    "use strict";

    function a() {
        return d("MAWAbPropsClient").getAbProps().client_group_participants_limit
    }
    b = 32;
    c = 256;
    g.armadillo = a;
    g.gxac = b;
    g.nonGxac = c
}), 98);
