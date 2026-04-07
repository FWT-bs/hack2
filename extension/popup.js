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
        <div class="inactive-glyph">
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="animation: float 7s ease-in-out infinite;">
            <path d="M11.5 19V13.5a6.5 6.5 0 0113 0V19" stroke="#fafafa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="4" y="19" width="28" height="21" rx="3" fill="#fafafa"/>
            <rect x="8.5" y="24.5" width="5.5" height="0.8" rx="0.8" fill="#0a0a0a"/>
            <rect x="22" y="24.5" width="5.5" height="0.8" rx="0.8" fill="#0a0a0a"/>
            <circle cx="18" cy="34.5" r="2.4" fill="#0a0a0a"/>
            <rect x="16.7" y="33" width="2.6" height="4" rx="0" fill="#0a0a0a"/>
          </svg>
        </div>
        <p class="inactive-title">No active session</p>
        <p class="inactive-sub">Join a focus room on grouplock<br>to start monitoring your focus.</p>
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
        <div class="label">Current domain</div>
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Open Study Room
      </a>`
    : "";

  content.innerHTML = `
    <div class="section">
      <div class="label">Focus status</div>
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
