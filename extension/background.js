// LockIn — reports current tab domain to app.
// When linked: pass user_id and optional room_id so the app can use DB rules.
// See README in extension folder for device-linking flow.

const API_BASE = "http://localhost:3000";
const ALARM_NAME = "lockin-monitor";

chrome.alarms.create(ALARM_NAME, { periodInMinutes: 5 / 60 });

async function getStoredContext() {
  const out = await chrome.storage.local.get(["user_id", "room_id"]);
  return { user_id: out.user_id || null, room_id: out.room_id || null };
}

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
    const { user_id, room_id } = await getStoredContext();
    const body = {
      domain,
      url: tab.url,
      timestamp: new Date().toISOString(),
    };
    if (user_id) body.user_id = user_id;
    if (room_id) body.room_id = room_id;

    const response = await fetch(`${API_BASE}/api/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
        const { user_id, room_id } = await getStoredContext();
        const body = { domain: hostname };
        if (user_id) body.user_id = user_id;
        if (room_id) body.room_id = room_id;
        const response = await fetch(`${API_BASE}/api/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
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
        const { room_id } = await getStoredContext();
        let url = `${API_BASE}/api/activity/domains`;
        if (room_id) url += `?room_id=${encodeURIComponent(room_id)}`;
        const response = await fetch(url);
        if (!response.ok) return { allowed: [], blocked: [] };
        return await response.json();
      } catch (e) {
        return { allowed: [], blocked: [] };
      }
    })().then(sendResponse);
    return true;
  }
  if (message.type === "FOCUS_EVENT") {
    (async () => {
      try {
        const payload = message.payload || {};
        await fetch(`${API_BASE}/api/focus-events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: payload.event_type,
            domain: payload.domain,
            url: payload.url,
          }),
        });
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })().then(sendResponse);
    return true;
  }
  if (message.type === "SET_LINK_CONTEXT") {
    (async () => {
      try {
        const { user_id, room_id } = message;
        await chrome.storage.local.set({
          ...(user_id != null && { user_id }),
          ...(room_id != null && { room_id }),
        });
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })().then(sendResponse);
    return true;
  }
});
