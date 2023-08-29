__d(
  "getAsyncHeaders",
  ["BDHeaderConfig", "LSD", "ZeroCategoryHeader", "isFacebookURI"],
  function (a, b, c, d, e, f, g) {
    function a(a) {
      var b = {},
        d = c("isFacebookURI")(a);
      d &&
      c("ZeroCategoryHeader").value &&
      (b[c("ZeroCategoryHeader").header] = c("ZeroCategoryHeader").value);
      d = h(a);
      d && (b["X-FB-LSD"] = d);
      d = i(a);
      d && (b["X-ASBD-ID"] = d);
      return b;
    }
    function h(a) {
      return j(a) ? null : c("LSD").token;
    }
    function i(a) {
      return j(a) ? null : d("BDHeaderConfig").ASBD_ID;
    }
    function j(a) {
      return (
        !a.toString().startsWith("/") &&
        a.getOrigin() !== document.location.origin
      );
    }
    g["default"] = a;
  },
  98
);
