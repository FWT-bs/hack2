// LockIn — reports current tab domain to app.
// app_origin is set when you open the web app (content.js); loaded fetches use it + session cookies.

const DEFAULT_APP_ORIGIN = "http://localhost:3000";
const POLL_ALARM = "lockin-monitor-tick";
/** ~15s cadence (fractional minutes; Chrome may clamp — still better than 1m repeat alarms). */
const POLL_DELAY_MINUTES = 15 / 60;

async function getApiBase() {
  const { app_origin } = await chrome.storage.local.get(["app_origin"]);
  const o = typeof app_origin === "string" ? app_origin.trim().replace(/\/$/, "") : "";
  if (o && /^https?:\/\//i.test(o)) return o;
  return DEFAULT_APP_ORIGIN;
}

function scheduleNextPoll() {
  chrome.alarms.create(POLL_ALARM, { delayInMinutes: POLL_DELAY_MINUTES });
}

async function runActivityPoll() {
  try {
    const apiBase = await getApiBase();
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

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

    const response = await fetch(`${apiBase}/api/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const result = await response.json();
      await chrome.storage.local.set({
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
}

async function getStoredContext() {
  const out = await chrome.storage.local.get(["user_id", "room_id"]);
  return { user_id: out.user_id || null, room_id: out.room_id || null };
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== POLL_ALARM) return;
  await runActivityPoll();
  scheduleNextPoll();
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ active: false, focusState: "on-task" });
  scheduleNextPoll();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleNextPoll();
});

// First run after SW wakes
scheduleNextPoll();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SET_APP_ORIGIN") {
    (async () => {
      try {
        const raw = message.origin;
        if (typeof raw !== "string") return { ok: false, error: "missing origin" };
        const origin = raw.trim().replace(/\/$/, "");
        if (!/^https?:\/\//i.test(origin)) return { ok: false, error: "invalid origin" };
        await chrome.storage.local.set({ app_origin: origin });
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })().then(sendResponse);
    return true;
  }

  if (message.type === "GET_APP_ORIGIN") {
    getApiBase().then((origin) => sendResponse({ origin }));
    return true;
  }

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
        const apiBase = await getApiBase();
        const hostname = message.hostname || "";
        if (!hostname) return { focusState: "on-task", status: "unlisted" };
        const { user_id, room_id } = await getStoredContext();
        const body = { domain: hostname };
        if (user_id) body.user_id = user_id;
        if (room_id) body.room_id = room_id;
        const response = await fetch(`${apiBase}/api/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
        const apiBase = await getApiBase();
        const { room_id } = await getStoredContext();
        let url = `${apiBase}/api/activity/domains`;
        if (room_id) url += `?room_id=${encodeURIComponent(room_id)}`;
        const response = await fetch(url, { credentials: "include" });
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
        const apiBase = await getApiBase();
        const payload = message.payload || {};
        await fetch(`${apiBase}/api/focus-events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
