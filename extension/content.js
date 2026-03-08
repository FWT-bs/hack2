// Runs on the LockIn app origin. Listens for page requests (current tab, all tabs); forwards to background and posts result back.
// Only runs when loaded as an extension content script (chrome.runtime or browser.runtime available).

const LOCKIN_GET_TAB = "LOCKIN_GET_TAB";
const LOCKIN_TAB_RESULT = "LOCKIN_TAB_RESULT";
const LOCKIN_GET_ALL_TABS = "LOCKIN_GET_ALL_TABS";
const LOCKIN_ALL_TABS_RESULT = "LOCKIN_ALL_TABS_RESULT";
const PAGE_SOURCE = "lockin-page";

var runtime = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage)
  ? chrome.runtime
  : (typeof browser !== "undefined" && browser.runtime && browser.runtime.sendMessage)
    ? browser.runtime
    : null;

function postResult(type, payload) {
  try {
    window.postMessage({ type: type, source: "lockin-content", payload: payload || { error: "No response from extension" } }, "*");
  } catch (_) {}
}

function handleMessage(event) {
  if (event.source !== window || event.data?.source !== PAGE_SOURCE) return;
  if (!runtime) {
    if (event.data?.type === LOCKIN_GET_TAB) postResult(LOCKIN_TAB_RESULT, { error: "Extension not installed or not on this page" });
    if (event.data?.type === LOCKIN_GET_ALL_TABS) postResult(LOCKIN_ALL_TABS_RESULT, { error: "Extension not installed or not on this page" });
    return;
  }

  if (event.data?.type === LOCKIN_GET_TAB) {
    runtime.sendMessage({ type: "GET_CURRENT_TAB" }, function (response) {
      postResult(LOCKIN_TAB_RESULT, response);
    });
    return;
  }

  if (event.data?.type === LOCKIN_GET_ALL_TABS) {
    runtime.sendMessage({ type: "GET_ALL_TABS" }, function (response) {
      postResult(LOCKIN_ALL_TABS_RESULT, response);
    });
  }
}

window.addEventListener("message", handleMessage);
