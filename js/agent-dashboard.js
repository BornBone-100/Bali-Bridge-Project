function escapeAdminHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

function getDashboardAgentId() {
  const id = new URLSearchParams(location.search).get("id");
  if (id != null && id !== "") return String(id);
  return "1";
}

function requestsForAgent(agentId) {
  if (typeof inspectionRequests === "undefined" || !Array.isArray(inspectionRequests)) {
    return [];
  }
  return inspectionRequests.filter((r) => String(r.agentId) === String(agentId));
}

function normalizeStatus(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function bucketCounts(list) {
  let pending = 0;
  let progress = 0;
  let completed = 0;
  for (const r of list) {
    const b = normalizeStatus(r.status);
    if (b === "completed") completed++;
    else if (b === "inprogress") progress++;
    else pending++;
  }
  return { pending, progress, completed };
}

/** requestId = 생성 시각(ms) 가정, 48시간 SLA */
function hoursRemainingMs(requestId) {
  const ts = Number(requestId);
  if (!Number.isFinite(ts)) return 0;
  const elapsedH = (Date.now() - ts) / 3600000;
  return Math.max(0, Math.floor(48 - elapsedH));
}

function openEditor(requestId) {
  const agentId = getDashboardAgentId();
  window.location.href = `./inspection-editor.html?requestId=${encodeURIComponent(requestId)}&id=${encodeURIComponent(agentId)}`;
}

function renderAgentDashboard() {
  const agentId = getDashboardAgentId();
  let agent = null;
  if (typeof agentData !== "undefined" && Array.isArray(agentData)) {
    agent = agentData.find((a) => String(a.id) === String(agentId));
  }

  const firstName = agent ? agent.name.split(/\s+/)[0] : "에이전트";
  const list = requestsForAgent(agentId);
  const { pending, progress, completed } = bucketCounts(list);
  const todoToday = pending + progress;

  const greet = document.getElementById("admin-greeting");
  if (greet) {
    greet.innerHTML = `안녕하세요, ${escapeAdminHtml(firstName)}님! 오늘 처리할 실사가 <strong>${todoToday}건</strong> 있습니다.`;
  }

  const elP = document.getElementById("task-pending-count");
  const elPr = document.getElementById("task-progress-count");
  const elC = document.getElementById("task-completed-count");
  if (elP) elP.textContent = String(pending);
  if (elPr) elPr.textContent = String(progress);
  if (elC) elC.textContent = String(completed);

  const container = document.getElementById("request-list");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML =
      '<p class="admin-empty">이 에이전트에게 할당된 실사 요청이 없습니다. 투자자가 상세 페이지에서 신청하면 여기에 표시됩니다.</p>';
    return;
  }

  const sorted = list.slice().sort((a, b) => b.requestId - a.requestId);

  container.innerHTML = sorted
    .map((r) => {
      const title = escapeAdminHtml(r.villaName || "실사 요청");
      const investorRaw = r.investorName || "투자자";
      const investor = escapeAdminHtml(investorRaw);
      const st = normalizeStatus(r.status);
      const deadline =
        st === "completed" ?
          "작성 완료"
        : `기한: 약 ${hoursRemainingMs(r.requestId)}시간 남음`;

      const btn =
        st === "completed" ?
          '<button type="button" class="write-btn write-btn--done" disabled>작성 완료</button>'
        : `<button type="button" class="write-btn" onclick="openEditor(${r.requestId})">보고서 작성</button>`;

      return `
        <div class="request-item">
          <div class="req-info">
            <strong>${title}</strong>
            <p>요청자: ${investor} | ${escapeAdminHtml(deadline)}</p>
          </div>
          ${btn}
        </div>`;
    })
    .join("");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderAgentDashboard);
} else {
  renderAgentDashboard();
}
