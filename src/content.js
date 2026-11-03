// DP | X Source Label — content script (izole dünya).
// injected.js'ten gelen { tweetId: kaynak } eşlemesini saklar ve tweet zaman
// damgasının yanına etiket yerleştirir.

(function () {
  "use strict";

  var MSG_TYPE = "XSL_SOURCES";
  var sources = Object.create(null); // tweetId -> "Twitter for iPhone"
  var settings = { enabled: true, showMissing: false };
  var scheduled = false;

  function loadSettings() {
    try {
      chrome.storage.sync.get(settings, function (s) {
        if (s) settings = { enabled: s.enabled !== false, showMissing: !!s.showMissing };
        schedule();
      });
    } catch (e) {}
  }

  try {
    chrome.storage.onChanged.addListener(function () {
      loadSettings();
    });
  } catch (e) {}

  window.addEventListener("message", function (event) {
    if (event.source !== window) return;
    var msg = event.data;
    if (!msg || msg.type !== MSG_TYPE || !msg.data || typeof msg.data !== "object") return;
    var changed = false;
    for (var id in msg.data) {
      if (/^\d+$/.test(id) && typeof msg.data[id] === "string" && sources[id] !== msg.data[id]) {
        sources[id] = msg.data[id];
        changed = true;
      }
    }
    if (changed) schedule();
  });

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      render();
    });
  }

  function clearAll() {
    var nodes = document.querySelectorAll(".xsl-label");
    for (var i = 0; i < nodes.length; i++) nodes[i].remove();
  }

  function render() {
    if (!settings.enabled) {
      clearAll();
      return;
    }

    var articles = document.querySelectorAll('article[data-testid="tweet"]');
    for (var i = 0; i < articles.length; i++) {
      var article = articles[i];
      var timeEls = article.querySelectorAll("time");

      for (var j = 0; j < timeEls.length; j++) {
        var link = timeEls[j].closest('a[href*="/status/"]');
        if (!link) continue;

        var m = (link.getAttribute("href") || "").match(/\/status\/(\d+)/);
        if (!m) continue;
        var id = m[1];
        var label = sources[id];

        var existing = link.parentElement && link.parentElement.querySelector('.xsl-label[data-xsl-id="' + id + '"]');

        if (!label && !settings.showMissing) {
          if (existing) existing.remove();
          continue;
        }

        var text = label ? "· " + label : "· kaynak yok";
        if (existing) {
          if (existing.textContent !== text) existing.textContent = text;
          existing.classList.toggle("xsl-missing", !label);
          continue;
        }

        var span = document.createElement("span");
        span.className = "xsl-label" + (label ? "" : " xsl-missing");
        span.setAttribute("data-xsl-id", id);
        span.title = label
          ? "Bu gönderinin X kaydındaki kaynak alanı. Linkteki s= değeri değil."
          : "X bu gönderi için kaynak alanı döndürmedi.";
        span.textContent = text;
        link.after(span);
      }
    }
  }

  var observer = new MutationObserver(schedule);
  function start() {
    if (!document.documentElement) return;
    observer.observe(document.documentElement, { childList: true, subtree: true });
    schedule();
  }

  loadSettings();
  // document_start'ta documentElement zaten vardır; gözlem hemen başlar.
  start();
})();
