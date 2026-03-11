// LockIn Popup Script

async function render() {
  const data = await chrome.storage.local.get([
    "active",
    "focusState",
    "lastDomain",
    "lastDomainStatus",
    "roomUrl",
    "sessionId",
  ]);

  const dot     = document.getElementById("statusDot");
  const content = document.getElementById("content");

  if (!data.active) {
    dot.className = "status-dot inactive";
    content.innerHTML = `
      <div class="inactive-msg">
        <span class="inactive-emoji">📚</span>
        <p class="inactive-title">No active session</p>
        <p class="inactive-sub">Start a session on the LockIn web app<br>to begin monitoring your focus.</p>
      </div>
    `;
    return;
  }

  dot.className = "status-dot active";

  const focusState = data.focusState || "on-task";
  const focusLabel = {
    "on-task":        "On Task",
    "warning":        "Warning",
    "locked":         "Locked",
    "approved-break": "On Break",
  }[focusState] || focusState;

  // Build domain section (text floats directly — no card box)
  let domainSection = "";
  if (data.lastDomain) {
    const statusClass = data.lastDomainStatus || "unlisted";
    const statusLabel = { allowed: "Allowed", blocked: "Blocked", unlisted: "Unlisted" }[statusClass] || statusClass;
    domainSection = `
      <div class="divider"></div>
      <div class="section">
        <div class="section-label">Current domain</div>
        <div class="domain-row">
          <span class="domain-name">${data.lastDomain}</span>
          <span class="domain-badge ${statusClass}">${statusLabel}</span>
        </div>
      </div>
    `;
  }

  // Build room CTA
  const ctaSection = data.roomUrl
    ? `<a href="${data.roomUrl}" target="_blank" class="cta">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Open Study Room
      </a>`
    : "";

  content.innerHTML = `
    <div class="section">
      <div class="section-label">Focus status</div>
      <div class="focus-pill ${focusState}">
        <span class="pill-dot"></span>
        ${focusLabel}
      </div>
    </div>
    ${domainSection}
    ${ctaSection}
  `;
}

document.addEventListener("DOMContentLoaded", render);

chrome.storage.onChanged.addListener(() => {
  render();
});
