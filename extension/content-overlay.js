// Runs on every http/https site except the LockIn app.
// Fetches allowed/blocked lists from the API via background, then classifies and injects overlay on this tab.

(function () {
  const APP_BASE = "http://localhost:3000";

  var runtime = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage)
    ? chrome.runtime
    : (typeof browser !== "undefined" && browser.runtime && browser.runtime.sendMessage)
      ? browser.runtime
      : null;

  function norm(d) {
    return d.replace(/^www\./, "").toLowerCase();
  }

  function classify(hostname, allowed, blocked) {
    var d = norm(hostname);
    var i;
    if (blocked && blocked.length) {
      for (i = 0; i < blocked.length; i++) {
        var b = norm(blocked[i]);
        if (d === b || d.endsWith("." + b)) return "blocked";
      }
    }
    if (allowed && allowed.length) {
      for (i = 0; i < allowed.length; i++) {
        var a = norm(allowed[i]);
        if (d === a || d.endsWith("." + a)) return "allowed";
      }
    }
    return "unlisted";
  }

  function getDomainLists(cb) {
    if (!runtime) {
      cb({ allowed: [], blocked: [] });
      return;
    }
    runtime.sendMessage({ type: "GET_DOMAIN_LISTS" }, function (response) {
      if (response && response.allowed && response.blocked) cb(response);
      else cb({ allowed: [], blocked: [] });
    });
  }

  function injectStyles() {
    if (document.getElementById("lockin-overlay-styles")) return;
    var style = document.createElement("style");
    style.id = "lockin-overlay-styles";
    style.textContent = [
      "#lockin-overlay-root { position: fixed; inset: 0; z-index: 2147483647; font-family: system-ui, -apple-system, sans-serif; pointer-events: auto; }",
      "#lockin-overlay-root * { box-sizing: border-box; }",
      ".lockin-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; }",
      ".lockin-card { background: #18181b; color: #e5e5e5; border-radius: 16px; border: 1px solid #27272a; padding: 32px 28px; max-width: 440px; width: 90vw; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.6); }",
      ".lockin-icon { width: 64px; height: 64px; margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }",
      ".lockin-icon-lock { background: rgba(239, 68, 68, 0.15); }",
      ".lockin-icon-warn { background: rgba(234, 179, 8, 0.15); }",
      ".lockin-title { font-size: 1.35rem; font-weight: 700; margin: 0 0 8px 0; color: #fafafa; }",
      ".lockin-subtitle { font-size: 0.85rem; color: #71717a; margin: 0 0 24px 0; line-height: 1.6; }",
      ".lockin-domain { display: inline-block; background: #27272a; color: #a1a1aa; border-radius: 6px; padding: 4px 10px; font-size: 0.8rem; font-family: monospace; margin-bottom: 20px; }",
      ".lockin-btn { display: inline-flex; align-items: center; gap: 6px; background: #3b82f6; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: background 0.15s; }",
      ".lockin-btn:hover { background: #2563eb; }",
      ".lockin-warn-box { background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.35); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; font-size: 0.9rem; color: #fef3c7; line-height: 1.5; text-align: left; }",
    ].join("\n");
    (document.head || document.documentElement).appendChild(style);
  }

  function removeOverlay() {
    var el = document.getElementById("lockin-overlay-root");
    if (el) el.remove();
  }

  function showLock(hostname) {
    removeOverlay();
    injectStyles();
    var root = document.createElement("div");
    root.id = "lockin-overlay-root";
    root.innerHTML =
      '<div class="lockin-backdrop">' +
      '  <div class="lockin-card">' +
      '    <div class="lockin-icon lockin-icon-lock">' +
      '      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' +
      "    </div>" +
      '    <h2 class="lockin-title">Session Locked</h2>' +
      '    <div class="lockin-domain">' + hostname + "</div>" +
      '    <p class="lockin-subtitle">This site is blocked during your LockIn session. Return to an allowed site or open LockIn to request a break.</p>' +
      '    <a href="' + APP_BASE + '/room" target="_blank" rel="noopener" class="lockin-btn">Open LockIn</a>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(root);
  }

  function showWarning(hostname) {
    removeOverlay();
    injectStyles();
    var root = document.createElement("div");
    root.id = "lockin-overlay-root";
    root.innerHTML =
      '<div class="lockin-backdrop">' +
      '  <div class="lockin-card">' +
      '    <div class="lockin-icon lockin-icon-warn">' +
      '      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
      "    </div>" +
      '    <h2 class="lockin-title">Off Task</h2>' +
      '    <div class="lockin-domain">' + hostname + "</div>" +
      '    <div class="lockin-warn-box">This site isn\'t on your allowed list. Return to an allowed site or you may be locked soon.</div>' +
      '    <a href="' + APP_BASE + '/room" target="_blank" rel="noopener" class="lockin-btn">Open LockIn</a>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(root);
  }

  function run() {
    var hostname = window.location.hostname;
    if (!hostname) return;
    getDomainLists(function (lists) {
      var status = classify(hostname, lists.allowed, lists.blocked);
      if (status === "blocked") showLock(hostname);
      else if (status === "unlisted") showWarning(hostname);
      else removeOverlay();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  if (runtime) {
    runtime.onMessage.addListener(function (msg) {
      if (msg.type === "LOCKIN_RECHECK") run();
    });
  }
})();
