__d(
  "PolarisRelayEnvironment",
  [
    "CometRootInitServerFlag",
    "CurrentUser",
    "PolarisConfig",
    "QuickPerformanceLogger",
    "RelayFBHandlerProvider",
    "RelayFBOperationLoader",
    "RelayFBResponseCache",
    "RelayFBScheduler",
    "RelayModern",
    "RelayRuntime",
    "URI",
    "createRelayFBConsoleLog",
    "createRelayFBNetwork",
    "createRelayFBNetworkFetch",
    "createRelayFBSubscribeFunction",
    "getCrossOriginTransport",
    "handlePolarisErrorSideEffect",
    "igWrapNetworkObservable",
    "polarisGetMissingFieldHandlers",
    "qpl",
    "relayPolarisGetDataID",
    "resolveImmediate",
  ],
  function (a, b, c, d, e, f, g) {
    "use strict";
    var h = c("createRelayFBNetworkFetch")({
        customHeaders: {
          "X-CSRFToken": d("PolarisConfig").getCSRFToken(),
          "X-IG-App-ID": d("PolarisConfig").getIGAppID(),
        },
        fetchTimeout: 1e3 * 60,
        graphURI: new (c("URI"))("/api/graphql"),
        queryResponseCache: c("RelayFBResponseCache"),
        transportBuilder: c("getCrossOriginTransport").withCredentials,
        useXController: !0,
        wrapObservableFn: c("igWrapNetworkObservable")(
          c("handlePolarisErrorSideEffect")
        ),
      }),
      i = 0,
      j = c("createRelayFBSubscribeFunction")({
        queryResponseCache: c("RelayFBResponseCache"),
      });
    function a() {
      var a = c("createRelayFBNetwork")(h, j),
        b = a.execute;
      a = function (a, d, e, f, g) {
        var h = i++;
        c("QuickPerformanceLogger").markerStart(c("qpl")._(27466514, "334"), h);
        c("QuickPerformanceLogger").markerAnnotate(
          c("qpl")._(27466514, "334"),
          { string: { api: a.name, method: "POST" } },
          { instanceKey: h }
        );
        return b(a, d, e, f, g)
          ["do"]({
          next: function () {
            c("QuickPerformanceLogger").markerEnd(
              c("qpl")._(27466514, "334"),
              2,
              h
            );
          },
        })
          ["catch"](function (a) {
          c("QuickPerformanceLogger").markerEnd(
            c("qpl")._(27466514, "334"),
            3,
            h
          );
          throw a;
        });
      };
      return { execute: a };
    }
    b = d("RelayModern").createEnvironment({
      actorID: c("CurrentUser").getPossiblyNonFacebookUserID(),
      configName: "PolarisRelayEnvironment",
      getDataID: c("relayPolarisGetDataID"),
      handlerProvider: c("RelayFBHandlerProvider"),
      isServer: d("CometRootInitServerFlag").isServerEnvironment(),
      log: c("createRelayFBConsoleLog")("xig"),
      missingFieldHandlers: c("polarisGetMissingFieldHandlers")(),
      network: a(),
      operationLoader: c("RelayFBOperationLoader"),
      scheduler: c("RelayFBScheduler"),
      store: new (d("RelayRuntime").Store)(
        new (d("RelayRuntime").RecordSource)(),
        {
          gcReleaseBufferSize: 10,
          gcScheduler: c("resolveImmediate"),
          getDataID: c("relayPolarisGetDataID"),
          operationLoader: c("RelayFBOperationLoader"),
          queryCacheExpirationTime: 1e3 * 60 * 5,
        }
      ),
    });
    e = b;
    g["default"] = e;
  },
  98
);
