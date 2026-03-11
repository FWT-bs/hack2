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
      ".lockin-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.90); backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; padding: 28px; }",
      ".lockin-card { background: #18181b; color: #e5e5e5; border-radius: 24px; border: 1px solid rgba(255,255,255,0.10); padding: 48px 44px; max-width: 820px; width: min(92vw, 820px); text-align: center; box-shadow: 0 35px 90px rgba(0,0,0,0.70); }",
      ".lockin-icon { width: 92px; height: 92px; margin: 0 auto 26px; border-radius: 28px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); }",
      ".lockin-icon-lock { background: rgba(239, 68, 68, 0.15); }",
      ".lockin-icon-warn { background: rgba(234, 179, 8, 0.15); }",
      ".lockin-title { font-size: 2.1rem; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 10px 0; color: #fafafa; }",
      ".lockin-subtitle { font-size: 1.05rem; color: rgba(229,229,229,0.68); margin: 0 0 26px 0; line-height: 1.65; }",
      ".lockin-domain { display: inline-block; background: rgba(255,255,255,0.06); color: rgba(229,229,229,0.78); border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; padding: 8px 14px; font-size: 0.95rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-bottom: 22px; }",
      ".lockin-btn { display: inline-flex; width: 100%; align-items: center; justify-content: center; gap: 10px; background: #3b82f6; color: #fff; border: none; padding: 14px 18px; border-radius: 16px; font-size: 1rem; font-weight: 700; cursor: pointer; text-decoration: none; transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease; box-shadow: 0 16px 35px rgba(59,130,246,0.22); }",
      ".lockin-btn:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 20px 45px rgba(59,130,246,0.26); }",
      ".lockin-btn:active { transform: translateY(0px); }",
      ".lockin-stack { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }",
      ".lockin-btn-subtle { background: rgba(255,255,255,0.06); color: rgba(229,229,229,0.86); box-shadow: none; border: 1px solid rgba(255,255,255,0.10); }",
      ".lockin-btn-subtle:hover { background: rgba(255,255,255,0.10); transform: translateY(-1px); box-shadow: none; }",
      ".lockin-warn-box { background: rgba(234,179,8,0.10); border: 1px solid rgba(234,179,8,0.38); border-radius: 18px; padding: 18px 20px; margin: 0 0 18px 0; font-size: 1.02rem; color: rgba(254,243,199,0.92); line-height: 1.55; text-align: left; }",
      ".lockin-serious-box { background: rgba(239,68,68,0.10); border: 1px solid rgba(239,68,68,0.35); border-radius: 18px; padding: 18px 20px; margin: 0 0 18px 0; font-size: 1.02rem; color: rgba(254,226,226,0.92); line-height: 1.55; text-align: left; }",
    ].join("\n");
    (document.head || document.documentElement).appendChild(style);
  }

  function removeOverlay() {
    var el = document.getElementById("lockin-overlay-root");
    if (el) el.remove();
  }

  function postFocusEvent(type, hostname) {
    if (!runtime) return;
    runtime.sendMessage(
      {
        type: "FOCUS_EVENT",
        payload: {
          event_type: type,
          domain: hostname,
          url: window.location.href,
        },
      },
      function () {}
    );
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
      '      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' +
      "    </div>" +
      '    <h2 class="lockin-title">Blocked — check back in</h2>' +
      '    <div class="lockin-domain">' + hostname + "</div>" +
      '    <div class="lockin-serious-box">This page is blocked during your study session. The fastest way forward is to report back to your room — it’s a quick accountability reset.</div>' +
      '    <p class="lockin-subtitle">You can come right back after you’ve checked in.</p>' +
      '    <button type="button" class="lockin-btn" id="lockin-report-btn">Report back to group chat</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(root);

    var btn = document.getElementById("lockin-report-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        postFocusEvent("blocked_report_back", hostname);
        window.open(APP_BASE + "/rooms", "_blank", "noopener");
      });
    }
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
      '      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
      "    </div>" +
      '    <h2 class="lockin-title">Check in with yourself</h2>' +
      '    <div class="lockin-domain">' + hostname + "</div>" +
      '    <div class="lockin-warn-box">This site isn&apos;t on your allowed or blocked list yet. Take a second to decide what you want this tab to be for this session.</div>' +
      '    <div class="lockin-stack">' +
      '      <button type="button" class="lockin-btn" id="lockin-return-btn">Return to LockIn</button>' +
      '      <button type="button" class="lockin-btn lockin-btn-subtle" id="lockin-on-task-btn">I&apos;m on task</button>' +
      '      <button type="button" class="lockin-btn lockin-btn-subtle" id="lockin-break-btn">I&apos;m taking a break</button>' +
      "    </div>" +
      "  </div>" +
      "</div>";
    document.body.appendChild(root);

    var returnBtn = document.getElementById("lockin-return-btn");
    var onTaskBtn = document.getElementById("lockin-on-task-btn");
    var breakBtn = document.getElementById("lockin-break-btn");

    if (returnBtn) {
      returnBtn.addEventListener("click", function () {
        postFocusEvent("warning_return_lockin", hostname);
        window.open(APP_BASE + "/rooms", "_blank", "noopener");
      });
    }
    if (onTaskBtn) {
      onTaskBtn.addEventListener("click", function () {
        postFocusEvent("warning_on_task", hostname);
        removeOverlay();
      });
    }
    if (breakBtn) {
      breakBtn.addEventListener("click", function () {
        postFocusEvent("warning_break", hostname);
        removeOverlay();
      });
    }
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
