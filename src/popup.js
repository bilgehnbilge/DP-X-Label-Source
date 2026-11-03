(function () {
  "use strict";
  var defaults = { enabled: true, showMissing: false };
  var enabled = document.getElementById("enabled");
  var showMissing = document.getElementById("showMissing");

  chrome.storage.sync.get(defaults, function (s) {
    enabled.checked = s.enabled !== false;
    showMissing.checked = !!s.showMissing;
  });

  function save() {
    chrome.storage.sync.set({ enabled: enabled.checked, showMissing: showMissing.checked });
  }
  enabled.addEventListener("change", save);
  showMissing.addEventListener("change", save);
})();
