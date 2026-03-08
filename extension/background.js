// LockIn Demo — reports current tab domain to app; no auth.

const API_BASE = "http://localhost:3000";
const ALARM_NAME = "lockin-monitor";

// Always monitor (demo: no session required)
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 5 / 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.url) return;

    const url = new URL(tab.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    const domain = url.hostname;

    const response = await fetch(`${API_BASE}/api/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain,
        url: tab.url,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const result = await response.json();
      chrome.storage.local.set({
        focusState: result.focusState,
        lastDomain: domain,
        lastDomainStatus: result.status,
        active: true,
      });
      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.id) {
          chrome.tabs.sendMessage(activeTab.id, { type: "LOCKIN_UPDATE_OVERLAY", focusState: result.focusState }).catch(() => {});
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error("LockIn monitor error:", err);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ active: false, focusState: "on-task" });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_CURRENT_TAB") {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) {
          return { error: "No active tab" };
        }
        const url = new URL(tab.url);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          return { error: "Not a web page" };
        }
        return { domain: url.hostname, url: tab.url };
      } catch (e) {
        return { error: String(e) };
      }
    })().then(sendResponse);
    return true;
  }
  if (message.type === "GET_ALL_TABS") {
    (async () => {
      try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        return tabs
          .filter((t) => t.url && (t.url.startsWith("http:") || t.url.startsWith("https:")))
          .map((t) => {
            let domain = "";
            try {
              domain = new URL(t.url).hostname;
            } catch (_) {}
            return {
              id: t.id,
              title: t.title || t.url || "Untitled",
              url: t.url,
              domain,
              active: t.active,
            };
          });
      } catch (e) {
        return { error: String(e) };
      }
    })().then(sendResponse);
    return true;
  }
  if (message.type === "GET_FOCUS_STATE") {
    (async () => {
      try {
        const hostname = message.hostname || "";
        if (!hostname) return { focusState: "on-task", status: "unlisted" };
        const response = await fetch(`${API_BASE}/api/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: hostname }),
        });
        if (!response.ok) return { focusState: "on-task", status: "unlisted" };
        return await response.json();
      } catch (e) {
        return { focusState: "on-task", status: "unlisted" };
      }
    })().then(sendResponse);
    return true;
  }
  if (message.type === "GET_DOMAIN_LISTS") {
    (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/activity/domains`);
        if (!response.ok) return { allowed: [], blocked: [] };
        return await response.json();
      } catch (e) {
        return { allowed: [], blocked: [] };
      }
    })().then(sendResponse);
    return true;
  }
});
