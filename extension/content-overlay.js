// Runs on every http/https site except the LockIn app origin.
// Fetches allowed/blocked lists via background (uses stored app_origin), then classifies and injects overlay.

(function () {
  var runtime = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage)
    ? chrome.runtime
    : (typeof browser !== "undefined" && browser.runtime && browser.runtime.sendMessage)
      ? browser.runtime
      : null;

  var appBase = "http://localhost:3000";

  function getAppOrigin(cb) {
    if (!runtime) {
      cb("http://localhost:3000");
      return;
    }
    runtime.sendMessage({ type: "GET_APP_ORIGIN" }, function (r) {
      cb((r && r.origin) || "http://localhost:3000");
    });
  }

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
    /* Tokens aligned with app globals.css (:root dark) */
    style.textContent = [
      "#lockin-overlay-root { position: fixed; inset: 0; z-index: 2147483647; font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif; pointer-events: auto; }",
      "#lockin-overlay-root * { box-sizing: border-box; }",
      ".lockin-backdrop { position: absolute; inset: 0; background: rgba(10,10,10,0.94); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 24px; }",
      ".lockin-card { background: #111111; color: #fafafa; border-radius: 6px; border: 1px solid #262626; padding: 40px 36px; max-width: 640px; width: min(92vw, 640px); text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,0.55); }",
      ".lockin-icon { width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 1px solid #262626; background: rgba(250,250,250,0.06); }",
      ".lockin-title { font-size: 1.35rem; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 8px 0; color: #fafafa; }",
      ".lockin-subtitle { font-size: 0.875rem; color: #737373; margin: 0 0 22px 0; line-height: 1.55; }",
      ".lockin-domain { display: inline-block; background: #171717; color: #a3a3a3; border: 1px solid #262626; border-radius: 6px; padding: 6px 12px; font-size: 0.8125rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-bottom: 18px; max-width: 100%; word-break: break-all; }",
      ".lockin-btn { display: inline-flex; width: 100%; align-items: center; justify-content: center; gap: 8px; background: #fafafa; color: #0a0a0a; border: none; padding: 12px 16px; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.18s ease, transform 0.18s ease; }",
      ".lockin-btn:hover { opacity: 0.9; transform: translateY(-1px); }",
      ".lockin-btn:active { transform: translateY(0); }",
      ".lockin-stack { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }",
      ".lockin-btn-subtle { background: transparent; color: #fafafa; border: 1px solid #262626; }",
      ".lockin-btn-subtle:hover { background: rgba(250,250,250,0.06); border-color: #404040; }",
      ".lockin-callout { background: #171717; border: 1px solid #262626; border-radius: 6px; padding: 14px 16px; margin: 0 0 16px 0; font-size: 0.875rem; color: #a3a3a3; line-height: 1.5; text-align: left; }",
      ".lockin-kicker { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #737373; margin-bottom: 10px; font-family: ui-monospace, monospace; }",
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
      '    <p class="lockin-kicker">Focus session</p>' +
      '    <div class="lockin-icon">' +
      '      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fafafa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' +
      "    </div>" +
      '    <h2 class="lockin-title">Blocked — check back in</h2>' +
      '    <div class="lockin-domain">' + hostname + "</div>" +
      '    <div class="lockin-callout">This page is blocked during your study session. Check in with your room for a quick accountability reset.</div>' +
      '    <p class="lockin-subtitle">You can return here after you&apos;ve reported back.</p>' +
      '    <button type="button" class="lockin-btn" id="lockin-report-btn">Report back to group chat</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(root);

    var btn = document.getElementById("lockin-report-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        postFocusEvent("blocked_report_back", hostname);
        window.open(appBase + "/rooms", "_blank", "noopener");
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
      '    <p class="lockin-kicker">Focus session</p>' +
      '    <div class="lockin-icon">' +
      '      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
      "    </div>" +
      '    <h2 class="lockin-title">Pause and decide</h2>' +
      '    <div class="lockin-domain">' + hostname + "</div>" +
      '    <div class="lockin-callout">This site isn&apos;t on your room&apos;s allow or block list yet. Decide whether it belongs in this session.</div>' +
      '    <div class="lockin-stack">' +
      '      <button type="button" class="lockin-btn" id="lockin-return-btn">Return to Grouplock</button>' +
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
        window.open(appBase + "/rooms", "_blank", "noopener");
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

  function start() {
    getAppOrigin(function (origin) {
      appBase = origin.replace(/\/$/, "");
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
      } else {
        run();
      }
    });
  }

  start();

  if (runtime) {
    runtime.onMessage.addListener(function (msg) {
      if (msg.type === "LOCKIN_RECHECK") {
        getAppOrigin(function (origin) {
          appBase = origin.replace(/\/$/, "");
          run();
        });
      }
    });
  }
})();
