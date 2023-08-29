__d(
  "MWPComposerMediaUploadUtil",
  [
    "FBLogger",
    "I64",
    "LSIntEnum",
    "MessagingAttachmentType",
    "XComposerPhotoUploader",
    "cometIsMimeTypeForMedia",
    "emptyFunction",
    "unrecoverableViolation",
  ],
  function (a, b, c, d, e, f, g) {
    "use strict";
    function a(a, b, d, e, f, g, h, i, j, k) {
      a === void 0 && (a = c("emptyFunction"));
      d === void 0 && (d = c("emptyFunction"));
      e === void 0 && (e = !1);
      var l = "/ajax/mercury/upload.php";
      h === !0 && (l = "/ajax/mercury/chatsupportuser/upload.php");
      d = new (c("XComposerPhotoUploader"))({
        concurrentLimit: 3,
        onUploadFailure: d,
        onUploadProgress: a,
        onUploadStart: c("emptyFunction"),
        onUploadSuccess: function (a, d) {
          d = d.response.payload.metadata;
          var e;
          if (d == null)
            c("FBLogger")("messenger_browser_clients").warn("Empty payload"),
              (e = {});
          else {
            d = d[0];
            d != null
              ? (e = d)
              : (c("FBLogger")("messenger_browser_clients").warn(
                "Empty metadata isChatSupportUser: %s",
                h
              ),
                (e = {}));
          }
          d = e.fbid;
          var f = e.video_id,
            g = e.audio_id,
            i = e.gif_id;
          e = e.file_id;
          g =
            (d =
              (f = (d = (d = d) != null ? d : f) != null ? d : g) != null
                ? f
                : i) != null
              ? d
              : e;
          if (g != null) b(a, g);
          else
            throw c("unrecoverableViolation")(
              "Unrecognized file upload success payload",
              "messenger_comet"
            );
        },
        retryLimit: 1,
        uploadEndpoint: l,
      });
      a = {};
      a.data = {
        chat_support_user_id: h === !0 && i != null ? i : void 0,
        nonce: h === !0 && k != null ? k : void 0,
        voice_clip: e ? !0 : void 0,
        voice_clip_waveform_data: e ? JSON.stringify(j) : void 0,
      };
      d.getAsyncFileUploadRequest(f, g, a).send();
    }
    function b(a) {
      a = a.type;
      if (d("cometIsMimeTypeForMedia").isMimeTypeForPhoto(a))
        return d("LSIntEnum").ofNumber(c("MessagingAttachmentType").IMAGE);
      else if (a === "audio/wav")
        return d("LSIntEnum").ofNumber(c("MessagingAttachmentType").AUDIO);
      else if (a === "image/gif")
        return d("LSIntEnum").ofNumber(
          c("MessagingAttachmentType").ANIMATED_IMAGE
        );
      else if (d("cometIsMimeTypeForMedia").isMimeTypeForVideo(a))
        return d("LSIntEnum").ofNumber(c("MessagingAttachmentType").VIDEO);
      else return d("LSIntEnum").ofNumber(c("MessagingAttachmentType").FILE);
    }
    function e(a, b, e, f) {
      return {
        action_url: void 0,
        attachment_fbid: a,
        attachment_index: d("I64").zero,
        attachment_type: d("LSIntEnum").ofNumber(
          c("MessagingAttachmentType").AUDIO
        ),
        cta1_title: void 0,
        cta2_title: void 0,
        cta3_title: void 0,
        description_text: void 0,
        filename: void 0,
        filesize: void 0,
        has_media: !0,
        has_xma: !1,
        image_url: void 0,
        mini_preview: void 0,
        offline_attachment_id: a,
        original_file_hash: void 0,
        playable_duration_ms: d("I64").of_float(e * 1e3),
        playable_url: URL.createObjectURL(b),
        playable_url_mime_type: b.type,
        preview_height: void 0,
        preview_url: void 0,
        preview_url_mime_type: void 0,
        preview_width: void 0,
        sampling_frequency_hz: f == null ? void 0 : f.sampling_freq,
        source_text: void 0,
        subtitle_text: void 0,
        title_text: void 0,
        waveform_data:
          f == null
            ? void 0
            : (a = f.amplitudes) == null
              ? void 0
              : a.join(","),
        xma_layout_type: void 0,
        xmas_template_type: void 0,
      };
    }
    function f(a, b) {
      a = a.map(function (a) {
        return {
          action_url: void 0,
          attachment_fbid: a.offlineAttachmentId,
          attachment_index: d("I64").zero,
          attachment_type: a.attachmentType,
          cta1_title: void 0,
          cta2_title: void 0,
          cta3_title: void 0,
          description_text: void 0,
          filename: a.filename,
          filesize: void 0,
          has_media: !0,
          has_xma: !1,
          image_url: void 0,
          mini_preview: void 0,
          offline_attachment_id: a.offlineAttachmentId,
          original_file_hash: void 0,
          playable_duration_ms: void 0,
          playable_url: a.previewUrl,
          playable_url_mime_type: a.mimeType,
          preview_height: a.previewHeight,
          preview_url: a.previewUrl,
          preview_url_mime_type: void 0,
          preview_width: a.previewWidth,
          source_text: void 0,
          subtitle_text: void 0,
          title_text: void 0,
          xma_layout_type: void 0,
          xmas_template_type: void 0,
        };
      });
      var e = [],
        f = [];
      a.forEach(function (a) {
        d("I64").equal(
          a.attachment_type,
          d("LSIntEnum").ofNumber(c("MessagingAttachmentType").IMAGE)
        ) && !b
          ? f.push(a)
          : e.push([a]);
      });
      f.length > 0 && e.unshift(f);
      return e.map(function (a) {
        return a.map(function (a, b) {
          return babelHelpers["extends"]({}, a, {
            attachment_index: d("I64").of_int32(b),
          });
        });
      });
    }
    g.startUpload = a;
    g.getAttachmentType = b;
    g.getAudioAttachment = e;
    g.createPartitionedAttachments = f;
  },
  98
); /*FB_PKG_DELIM*/
