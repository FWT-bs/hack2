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

  const dot = document.getElementById("statusDot");
  const content = document.getElementById("content");

  if (!data.active) {
    dot.className = "status-dot inactive";
    content.innerHTML = `
      <div class="inactive-msg">
        <div style="font-size:24px">📚</div>
        <p>No active session</p>
        <p style="font-size:12px;margin-top:4px">Start a session on the LockIn web app to begin monitoring.</p>
      </div>
    `;
    return;
  }

  dot.className = "status-dot active";

  const focusState = data.focusState || "on-task";
  const focusLabel = {
    "on-task": "On Task",
    warning: "Warning",
    locked: "Locked",
    "approved-break": "On Break",
  }[focusState] || focusState;

  let domainHtml = "";
  if (data.lastDomain) {
    const statusClass = data.lastDomainStatus || "unlisted";
    const statusLabel = statusClass.charAt(0).toUpperCase() + statusClass.slice(1);
    domainHtml = `
      <div class="card">
        <div class="card-title">Current Domain</div>
        <div class="card-value">${data.lastDomain}</div>
        <div class="domain-status ${statusClass}">${statusLabel}</div>
      </div>
    `;
  }

  content.innerHTML = `
    <div class="card">
      <div class="card-title">Focus Status</div>
      <span class="focus-state ${focusState}">${focusLabel}</span>
    </div>
    ${domainHtml}
    ${
      data.roomUrl
        ? `<a href="${data.roomUrl}" target="_blank" class="btn">Open Study Room</a>`
        : ""
    }
  `;
}

document.addEventListener("DOMContentLoaded", render);

chrome.storage.onChanged.addListener(() => {
  render();
});
