;/*FB_PKG_DELIM*/

__d("LSBumpThread", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = [];
        return b.seq([function(c) {
            return b.i64.eq(a[1], b.i64.cast([0, 1])) ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function(b) {
                var c = b.update;
                b.item;
                return c({
                    lastReadWatermarkTimestampMs: a[0],
                    lastActivityTimestampMs: a[0]
                })
            }) : b.i64.eq(a[1], b.i64.cast([0, 2])) ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function(b) {
                var c = b.update;
                b.item;
                return c({
                    lastActivityTimestampMs: a[0]
                })
            }) : b.i64.eq(a[1], b.i64.cast([0, 3])) ? b.db.table(9).fetch([[[a[2]]]]).next().then(function(c, d) {
                var e = c.done;
                c = c.value;
                return e ? 0 : (d = c.item,
                b.i64.le(d.lastActivityTimestampMs, d.lastReadWatermarkTimestampMs) ? b.fe(b.db.table(9).fetch([[[a[2]]]]), function(b) {
                    var c = b.update;
                    b.item;
                    return c({
                        lastReadWatermarkTimestampMs: a[0],
                        lastActivityTimestampMs: a[0]
                    })
                }) : b.fe(b.db.table(9).fetch([[[a[2]]]]), function(b) {
                    var c = b.update;
                    b.item;
                    return c({
                        lastActivityTimestampMs: a[0]
                    })
                }))
            }) : b.resolve(0)
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
__d("LSCheckAuthoritativeMessageExists", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = []
          , d = [];
        return b.seq([function(e) {
            return b.seq([function(d) {
                return b.ftr(b.db.table(12).fetch([[[a[0]]]]), function(c) {
                    return b.i64.eq(c.threadKey, a[0]) && c.offlineThreadingId === a[1] && b.i64.eq(c.authorityLevel, b.i64.cast([0, 80]))
                }).next().then(function(a, b) {
                    b = a.done;
                    a = a.value;
                    return b ? c[0] = !1 : (a.item,
                    c[0] = !0)
                })
            }
            , function(a) {
                return d[0] = c[0]
            }
            ])
        }
        , function(a) {
            return b.resolve(d)
        }
        ])
    }
    b = a;
    f["default"] = b
}
), 66);
__d("LSInsertMessage", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = [], d = [], e;
        return b.seq([function(d) {
            return b.i64.eq(a[2], b.i64.cast([0, 20])) ? b.db.table(12).add({
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
                subthreadKey: a[62]
            }) : b.seq([function(d) {
                return b.db.table(12).fetch([[[a[9]]], "optimistic"]).next().then(function(b, d) {
                    var f = b.done;
                    b = b.value;
                    return f ? (f = [a[6], a[7], e],
                    c[0] = f[0],
                    c[1] = f[1],
                    c[2] = f[2],
                    f) : (d = b.item,
                    f = [d.primarySortKey, d.secondarySortKey, d.localDataId],
                    c[0] = f[0],
                    c[1] = f[1],
                    c[2] = f[2],
                    f)
                })
            }
            , function(c) {
                return b.fe(b.ftr(b.db.table(12).fetch([[[a[9]]], "optimistic"]), function(c) {
                    return c.offlineThreadingId === a[9] && b.i64.lt(c.authorityLevel, a[2])
                }), function(a) {
                    return a["delete"]()
                })
            }
            , function(d) {
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
                    localDataId: c[2]
                })
            }
            ])
        }
        , function(a) {
            return b.resolve(d)
        }
        ])
    }
    b = a;
    f["default"] = b
}
), 66);
__d("LSMoveThreadToInboxAndUpdateParent", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = [];
        return b.seq([function(c) {
            return b.fe(b.db.table(9).fetch([[[a[0]]]]), function(b) {
                var c = b.update;
                b.item;
                return c({
                    folderName: "inbox",
                    parentThreadKey: a[1]
                })
            })
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
__d("LSUpdateParticipantLastMessageSendTimestamp", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = [];
        return b.resolve(c)
    }
    b = a;
    f["default"] = b
}
), 66);
__d("LSUpdateThreadSnippet", ["LSGetThreadParticipantDisplayName"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , c = a[a.length - 1];
        c.n;
        var d = [], e = [], f;
        return c.seq([function(e) {
            return c.seq([function(a) {
                return c.resolve((d[1] = "",
                d[0] = d[1] === "" ? f : d[1]))
            }
            , function(e) {
                return d[0] !== f ? c.fe(c.db.table(9).fetch([[[a[0]]]]), function(b) {
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
                }) : a[7] ? c.seq([function(e) {
                    return c.i64.neq(a[3], f) ? c.seq([function(e) {
                        return c.sp(b("LSGetThreadParticipantDisplayName"), a[0], a[3]).then(function(a) {
                            return a = a,
                            d[2] = a[0],
                            a
                        })
                    }
                    , function(b) {
                        return a[1] !== f ? d[3] = [d[2], ": ", a[1]].join("") : d[3] = f,
                        d[1] = d[3]
                    }
                    ]) : c.resolve(d[1] = a[1])
                }
                , function(b) {
                    return c.fe(c.db.table(9).fetch([[[a[0]]]]), function(b) {
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
                }
                ]) : c.fe(c.db.table(9).fetch([[[a[0]]]]), function(b) {
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
            }
            ])
        }
        , function(a) {
            return c.resolve(e)
        }
        ])
    }
    c = a;
    f["default"] = c
}
), 66);
__d("LSUpdateTypingIndicator", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = []
          , d = [];
        return b.seq([function(d) {
            return b.seq([function(d) {
                return a[2] ? (c[0] = b.i64.of_float(Date.now()),
                b.db.table(52).put({
                    threadKey: a[0],
                    senderId: a[1],
                    expirationTimestampMs: b.i64.add(c[0], b.i64.cast([0, 5e3]))
                })) : b.resolve()
            }
            , function(c) {
                return a[2] ? b.resolve() : b.fe(b.ftr(b.db.table(52).fetch([[[a[0], a[1]]]]), function(c) {
                    return b.i64.eq(c.threadKey, a[0]) && b.i64.eq(b.i64.cast([0, 0]), b.i64.cast([0, 0])) && b.i64.eq(c.senderId, a[1])
                }), function(a) {
                    return a["delete"]()
                })
            }
            ])
        }
        , function(a) {
            return b.resolve(d)
        }
        ])
    }
    b = a;
    f["default"] = b
}
), 66);
__d("PolarisDataControlsSupportRoot.entrypoint", ["JSResourceForInteraction"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            return {
                queries: {}
            }
        },
        root: c("JSResourceForInteraction")("PolarisDataControlsSupportRoot.react").__setRef("PolarisDataControlsSupportRoot.entrypoint")
    };
    g["default"] = a
}
), 98);
__d("PolarisCreateStyleRoot.entrypoint", ["JSResourceForInteraction"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            return {
                queries: {}
            }
        },
        root: c("JSResourceForInteraction")("PolarisCreateStyleRoot.react").__setRef("PolarisCreateStyleRoot.entrypoint")
    };
    g["default"] = a
}
), 98);
__d("PolarisDataDownloadRequestRoot.entrypoint", ["JSResourceForInteraction"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = {
        getPreloadProps: function(a) {
            return {
                queries: {}
            }
        },
        root: c("JSResourceForInteraction")("PolarisDataDownloadRequestRoot.react").__setRef("PolarisDataDownloadRequestRoot.entrypoint")
    };
    g["default"] = a
}
), 98);

; /*FB_PKG_DELIM*/

__d("LSUpdateOrInsertThread", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments,
            b = a[a.length - 1];
        b.n;
        var c = [],
            d = [],
            e;
        return b.seq([function(d) {
            return b.db.table(9).fetch([
                [
                    [a[7]]
                ]
            ]).next().then(function(d, f) {
                var g = d.done;
                d = d.value;
                return g ? b.db.table(9).add({
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
                    pauseThreadTimestamp: a[102]
                }) : (f = d.item, c[1] = f.lastActivityTimestampMs, c[3] = f.parentThreadKey, c[2] = f.disappearingThreadKey, c[4] = f.isDisappearingMode, b.i64.le(f.authorityLevel, a[6]) ? b.i64.gt(c[1], a[0]) && b.i64.neq(c[2], e) ? (b.i64.eq(a[38], b.i64.cast([-1, 4294967286])) && b.i64.eq(c[3], b.i64.cast([0, 0])) ? (g = [c[3], f.folderName], c[5] = g[0], c[6] = g[1], g) : (d = [a[38], a[10]], c[5] = d[0], c[6] = d[1], d), b.fe(b.db.table(9).fetch([
                    [
                        [a[7]]
                    ]
                ]), function(b) {
                    var d = b.update;
                    b.item;
                    return d({
                        lastReadWatermarkTimestampMs: f.lastReadWatermarkTimestampMs,
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
                        memberCount: e
                    })
                })) : b.fe(b.db.table(9).fetch([
                    [
                        [a[7]]
                    ]
                ]), function(b) {
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
                        memberCount: e
                    })
                }) : b.resolve())
            })
        }, function(a) {
            return b.resolve(d)
        }])
    }
    b = a;
    f["default"] = b
}), 66);
__d("BillingWrapperContext", ["react"], (function(a, b, c, d, e, f, g) {
    "use strict";
    a = d("react");
    b = a.createContext();
    c = b;
    g["default"] = c
}), 98);

;/*FB_PKG_DELIM*/

__d("LSGetParentThreadKey", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = []
          , d = [];
        return b.seq([function(e) {
            return b.seq([function(d) {
                return b.db.table(9).fetch([[[a[0]]]]).next().then(function(a, d) {
                    var e = a.done;
                    a = a.value;
                    return e ? c[0] = b.i64.cast([0, 0]) : (d = a.item,
                    c[0] = d.parentThreadKey)
                })
            }
            , function(a) {
                return d[0] = c[0]
            }
            ])
        }
        , function(a) {
            return b.resolve(d)
        }
        ])
    }
    b = a;
    f["default"] = b
}
), 66);
__d("LSUpdateFolderThreadSnippet", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = [], d = [], e;
        return b.seq([function(d) {
            return b.seq([function(d) {
                return b.i64.neq(a[1], e) ? b.resolve(c[0] = a[1]) : b.seq([function(d) {
                    return b.ct(b.ftr(b.db.table(9).fetch([[[a[0]]], "parentThreadKeyLastActivityTimestampMs"]), function(c) {
                        return b.i64.eq(c.parentThreadKey, a[0]) && b.i64.lt(c.lastReadWatermarkTimestampMs, c.lastActivityTimestampMs)
                    })).then(function(a) {
                        return c[5] = a
                    })
                }
                , function(a) {
                    return c[0] = c[5]
                }
                ])
            }
            , function(d) {
                return c[1] = a[2].get("all_read"),
                a[2],
                c[2] = a[2].get("unread_singular"),
                a[2],
                c[3] = a[2].get("unread_plural"),
                a[2],
                b.i64.eq(c[0], b.i64.cast([0, 0])) ? c[4] = c[1] : (b.i64.eq(c[0], b.i64.cast([0, 1])) ? c[5] = [b.i64.to_string(c[0]), c[2]].join("") : c[5] = [b.i64.to_string(c[0]), c[3]].join(""),
                c[4] = c[5]),
                b.fe(b.db.table(9).fetch([[[a[0]]]]), function(a) {
                    var b = a.update;
                    a.item;
                    return b({
                        snippet: c[4],
                        snippetStringHash: e,
                        snippetStringArgument1: e,
                        snippetAttribution: e,
                        snippetAttributionStringHash: e
                    })
                })
            }
            ])
        }
        , function(a) {
            return b.resolve(d)
        }
        ])
    }
    b = a;
    f["default"] = b
}
), 66);
__d("LSUpdateParentFolderReadWatermark", ["LSGetParentThreadKey", "LSUpdateFolderThreadSnippet"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , c = a[a.length - 1];
        c.n;
        var d = [], e = [], f;
        return c.seq([function(e) {
            return c.seq([function(e) {
                return c.sp(b("LSGetParentThreadKey"), a[0]).then(function(a) {
                    return a = a,
                    d[0] = a[0],
                    a
                })
            }
            , function(e) {
                return c.i64.neq(d[0], c.i64.cast([0, 0])) ? c.seq([function(a) {
                    return c.sb(c.ftr(c.db.table(9).fetch([[[d[0]]], "parentThreadKeyLastActivityTimestampMs"]), function(a) {
                        return c.i64.eq(a.parentThreadKey, d[0]) && c.i64.lt(a.lastReadWatermarkTimestampMs, a.lastActivityTimestampMs)
                    }), [["lastReadWatermarkTimestampMs", "ASC"]]).next().then(function(a, b) {
                        var c = a.done;
                        a = a.value;
                        return c ? d[1] = f : (b = a.item,
                        d[1] = b.lastReadWatermarkTimestampMs)
                    })
                }
                , function(a) {
                    return c.i64.neq(d[1], f) ? c.fe(c.db.table(9).fetch([[[d[0]]]]), function(a) {
                        var b = a.update;
                        a.item;
                        return b({
                            lastReadWatermarkTimestampMs: d[1]
                        })
                    }) : c.seq([function(a) {
                        return c.db.table(9).fetch([[[d[0]]]]).next().then(function(a, b) {
                            var c = a.done;
                            a = a.value;
                            return c ? d[3] = f : (b = a.item,
                            d[3] = b.lastActivityTimestampMs)
                        })
                    }
                    , function(a) {
                        return c.i64.neq(d[3], f) ? c.fe(c.db.table(9).fetch([[[d[0]]]]), function(a) {
                            var b = a.update;
                            a.item;
                            return b({
                                lastReadWatermarkTimestampMs: d[3]
                            })
                        }) : c.resolve()
                    }
                    ])
                }
                , function(e) {
                    return c.sp(b("LSUpdateFolderThreadSnippet"), d[0], f, a[1])
                }
                ]) : c.resolve()
            }
            ])
        }
        , function(a) {
            return c.resolve(e)
        }
        ])
    }
    c = a;
    f["default"] = c
}
), 66);
__d("LSWriteCTAIdToThreadsTable", ["LSGetFirstAvailableAttachmentCTAID"], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , c = a[a.length - 1];
        c.n;
        var d = [], e = [], f;
        return c.seq([function(e) {
            return a[1] === f ? c.fe(c.ftr(c.db.table(9).fetch([[[a[0]]]]), function(b) {
                return c.i64.eq(b.threadKey, a[0]) && (c.i64.neq(b.lastMessageCtaId, f) || b.lastMessageCtaType !== f)
            }), function(b) {
                var c = b.update;
                b.item;
                return c({
                    lastMessageCtaId: f,
                    lastMessageCtaType: f,
                    lastMessageCtaTimestampMs: a[2]
                })
            }) : c.i64.neq(a[2], f) ? c.seq([function(b) {
                return c.db.table(9).fetch([[[a[0]]]]).next().then(function(a, b) {
                    var e = a.done;
                    a = a.value;
                    return e ? d[0] = c.i64.cast([0, 0]) : (b = a.item,
                    d[0] = b.lastActivityTimestampMs)
                })
            }
            , function(e) {
                return c.i64.ge(a[2], d[0]) ? c.seq([function(a) {
                    return c.sp(b("LSGetFirstAvailableAttachmentCTAID")).then(function(a) {
                        return a = a,
                        d[2] = a[0],
                        a
                    })
                }
                , function(b) {
                    return c.fe(c.db.table(9).fetch([[[a[0]]]]), function(b) {
                        var c = b.update;
                        b.item;
                        return c({
                            lastMessageCtaId: d[2],
                            lastMessageCtaType: a[1],
                            lastMessageCtaTimestampMs: a[2]
                        })
                    })
                }
                ]) : c.resolve(0)
            }
            ]) : c.resolve()
        }
        , function(a) {
            return c.resolve(e)
        }
        ])
    }
    c = a;
    f["default"] = c
}
), 66);

;/*FB_PKG_DELIM*/

__d("LSUpdateExistingMessageRange", [], (function(a, b, c, d, e, f) {
    function a() {
        var a = arguments
          , b = a[a.length - 1];
        b.n;
        var c = [];
        return b.seq([function(c) {
            return b.ftr(b.db.table(13).fetch([[[a[0]]]]), function(c) {
                return b.i64.eq(c.threadKey, a[0]) && (a[2] ? b.i64.eq(c.maxTimestampMs, a[1]) : b.i64.eq(c.minTimestampMs, a[1]))
            }).next().then(function(c, d) {
                var e = c.done;
                c = c.value;
                return e ? 0 : (d = c.item,
                b.db.table(13).put({
                    threadKey: d.threadKey,
                    minTimestampMs: d.minTimestampMs,
                    minMessageId: d.minMessageId,
                    maxTimestampMs: d.maxTimestampMs,
                    maxMessageId: d.maxMessageId,
                    isLoadingBefore: !1,
                    isLoadingAfter: !1,
                    hasMoreBefore: a[2] && !a[3] ? d.hasMoreBefore : !1,
                    hasMoreAfter: a[2] && !a[3] ? !1 : d.hasMoreAfter
                }))
            })
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
