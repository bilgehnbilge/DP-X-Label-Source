// DP | X Source Label — sayfa dünyasında (MAIN world) çalışır.
// Sayfanın zaten yaptığı fetch/XHR cevaplarını pasif olarak dinler; X'e ek istek atmaz.
// Cevap JSON'unda tweet nesnesinin "source" alanı varsa { tweetId: "Twitter for iPhone" }
// eşlemesini çıkarıp content script'e postMessage ile iletir.

(function () {
  "use strict";

  var MSG_TYPE = "XSL_SOURCES";

  // '<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>' -> "Twitter Web Client"
  function parseSource(html) {
    if (typeof html !== "string") return null;
    var text = html
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    return text || null;
  }

  // JSON ağacını gezer; hem "rest_id" + "source" taşıyan tweet nesnelerini
  // hem de legacy içinde "id_str" + "source" taşıyanları yakalar.
  function extractSources(root) {
    var found = {};
    var seen = typeof WeakSet === "function" ? new WeakSet() : null;

    function walk(node, depth) {
      if (!node || typeof node !== "object" || depth > 60) return;
      if (seen) {
        if (seen.has(node)) return;
        seen.add(node);
      }

      if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) walk(node[i], depth + 1);
        return;
      }

      var id = null;
      if (typeof node.rest_id === "string" && /^\d+$/.test(node.rest_id)) {
        id = node.rest_id;
      } else if (node.legacy && typeof node.legacy.id_str === "string" && /^\d+$/.test(node.legacy.id_str)) {
        id = node.legacy.id_str;
      }

      if (id) {
        var raw =
          typeof node.source === "string"
            ? node.source
            : node.legacy && typeof node.legacy.source === "string"
            ? node.legacy.source
            : null;
        var label = parseSource(raw);
        if (label) found[id] = label;
      }

      for (var key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          var v = node[key];
          if (v && typeof v === "object") walk(v, depth + 1);
        }
      }
    }

    walk(root, 0);
    return found;
  }

  function isInteresting(url) {
    return typeof url === "string" && /\/i\/api\/|graphql/.test(url);
  }

  function publish(json) {
    var map = extractSources(json);
    var keys = Object.keys(map);
    if (!keys.length) return;
    window.postMessage({ type: MSG_TYPE, data: map }, window.location.origin);
  }

  // Test ortamı (node): saf fonksiyonları dışa aktar, kancaları kurma.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { parseSource: parseSource, extractSources: extractSources };
    return;
  }

  // fetch kancası
  var origFetch = window.fetch;
  if (typeof origFetch === "function") {
    window.fetch = function () {
      var args = arguments;
      var p = origFetch.apply(this, args);
      try {
        var req = args[0];
        var url = typeof req === "string" ? req : req && req.url;
        if (isInteresting(url)) {
          p.then(function (res) {
            try {
              res.clone().json().then(publish).catch(function () {});
            } catch (e) {}
          }).catch(function () {});
        }
      } catch (e) {}
      return p;
    };
  }

  // XHR kancası
  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    try {
      if (isInteresting(String(url))) {
        this.addEventListener("load", function () {
          try {
            if (this.responseType === "" || this.responseType === "text") {
              publish(JSON.parse(this.responseText));
            } else if (this.responseType === "json" && this.response) {
              publish(this.response);
            }
          } catch (e) {}
        });
      }
    } catch (e) {}
    return origOpen.apply(this, arguments);
  };
})();
