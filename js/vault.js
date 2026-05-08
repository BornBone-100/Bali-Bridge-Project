function escapeVaultHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

function getInvestorDisplayName() {
  try {
    return sessionStorage.getItem("baliInvestorName") || "김성준";
  } catch (_) {
    return "김성준";
  }
}

function getProfileSummary() {
  try {
    const raw = sessionStorage.getItem("baliUserScore");
    if (!raw) {
      return {
        badge: "미설정",
        desc: "메인에서 투자 성향 설문을 완료하면 여기에 요약이 표시됩니다.",
      };
    }
    const o = JSON.parse(raw);
    if (o.type === "Income-Focused") {
      return {
        badge: "안정형 투자자",
        desc: "짱구·세미냑 중심 월세 현금흐름을 중시하는 전략",
      };
    }
    if (o.type === "Growth-Focused") {
      return {
        badge: "성장형 투자자",
        desc: "울루와투 지역의 지가 상승을 기대하는 전략",
      };
    }
  } catch (_) {}
  return {
    badge: "미설정",
    desc: "설문을 완료하면 성향이 표시됩니다.",
  };
}

function hydrateVaultHeader() {
  const name = getInvestorDisplayName();
  const sub = document.querySelector(".vault-header p");
  if (sub) sub.textContent = `${name} 님의 발리 투자 여정입니다.`;

  const { badge, desc } = getProfileSummary();
  const badgeEl = document.querySelector(".profile-mini-info .badge");
  const descEl = document.querySelector(".profile-mini-info p");
  if (badgeEl) badgeEl.textContent = badge;
  if (descEl) descEl.textContent = desc;
}

function updateReportsTabCount() {
  const n =
    typeof inspectionRequests !== "undefined" ? inspectionRequests.length : 0;
  const el = document.getElementById("reports-tab-count");
  if (el) el.textContent = String(n);
}

/** 실사 상태 → CSS 접미사 (status-pending | status-progress | status-completed) */
function inspectionVaultStatusKey(status) {
  const compact = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "");
  if (compact === "completed") return "completed";
  if (compact === "inprogress") return "progress";
  return "pending";
}

function inspectionVaultStatusLabel(status) {
  const compact = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "");
  if (compact === "completed") return "보고서 도착";
  if (compact === "inprogress") return "현지 실사 중";
  return "접수 완료";
}

function resolveVaultAgent(agentId) {
  if (typeof agentData === "undefined" || typeof hydrateAgent !== "function") {
    return null;
  }
  const agents = agentData.map(hydrateAgent);
  return agents.find((a) => String(a.id) === String(agentId)) || null;
}

const VAULT_DEFAULT_REPORT_ROWS = [
  {
    label: "수압",
    valueMain: "12.5",
    valueUnit: "L/min",
    statusClass: "status-good",
    statusText: "우수",
  },
  {
    label: "소음(평균)",
    valueMain: "52",
    valueUnit: "dB",
    statusClass: "status-warn",
    statusText: "주의",
  },
  {
    label: "인터넷",
    valueMain: "65",
    valueUnit: "Mbps",
    statusClass: "status-good",
    statusText: "안정",
  },
  {
    label: "잔여임대",
    valueMain: "288",
    valueUnit: "개월",
    statusClass: "status-good",
    statusText: "안전",
  },
];

function renderVaultCompletedReportMain(completedRequest) {
  if (typeof buildReportMainHTML !== "function") return "";
  const agent = resolveVaultAgent(completedRequest.agentId);
  const wa =
    agent ?
      `https://wa.me/${encodeURIComponent(agent.whatsapp)}`
    : "./index.html";
  const img = agent?.image || "";
  const byLine =
    agent ? `By ${agent.name}` : "By 에이전트";
  const title =
    String(completedRequest.villaName || "").trim() ||
    "Canggu Private Oasis Villa";
  const dateLine = `실사 완료: ${completedRequest.requestDate || "—"}`;

  return buildReportMainHTML({
    reportDateLabel: dateLine,
    propertyTitle: title,
    locationTag: "📍 Jl. Pantai Batu Bolong, Canggu",
    agentImgSrcTrusted: img,
    agentImgAlt: agent?.name || "Agent",
    agentByLine: byLine,
    headline: '"수익과 안전의 완벽한 밸런스"',
    analysisParagraph:
      "이 매물은 법적 안전성과 수익성에서 압도적인 점수를 받았습니다. 환경 소음 수치가 다소 높으나, 이는 짱구 중심가라는 입지적 장점의 반작용입니다.",
    scoreDisplay: "85",
    scoreLabel: "Score",
    dataRows: VAULT_DEFAULT_REPORT_ROWS,
    contractHrefTrusted: wa,
    contractTargetBlank: Boolean(agent),
    pdfOnclickAttr: "window.print()",
  });
}

function initVaultReportRadar() {
  requestAnimationFrame(() => {
    if (typeof initPropertyRadarChart !== "function") return;
    const canvas = document.getElementById("propertyRadarChart");
    if (!canvas) return;
    initPropertyRadarChart({
      scores: [88, 82, 85, 92, 78],
    });
  });
}

function renderVaultSimulation() {
  const vault =
    typeof loadUserVault === "function" ? loadUserVault() : { simulations: [] };
  const sims = vault.simulations || [];
  const reversed = sims.slice().reverse();

  const cards =
    reversed.length === 0 ?
      `<p class="vault-empty-inline">저장된 시뮬레이션 기록이 없습니다. 메인에서 슬라이더를 조정하면 자동으로 쌓입니다.</p>`
    : reversed
        .map(
          (sim) => `
    <div class="vault-card vault-sim-card">
      <div class="sim-header">
        <strong>${escapeVaultHtml(sim.region)} 투자 시나리오</strong>
        <span>${escapeVaultHtml(sim.date)}</span>
      </div>
      <p class="vault-sim-detail">예산: ${escapeVaultHtml(sim.budget)} / 예상 ROI: <span class="vault-highlight">${escapeVaultHtml(sim.expectedROI)}</span></p>
    </div>`
        )
        .join("");

  return `
    <section class="vault-panel vault-sim-panel" aria-labelledby="vault-sim-title">
      <h2 id="vault-sim-title" class="vault-panel-title">수익 시뮬레이션 기록</h2>
      <p class="vault-panel-lead">
        메인 화면 시뮬레이터에서 조건을 바꿀 때마다 최근 결과가 localStorage에 저장됩니다.
      </p>
      <a class="btn btn--secondary vault-panel-cta vault-panel-cta--inline" href="./index.html#simulator">시뮬레이터 열기</a>
      <div class="vault-sim-stack">${cards}</div>
    </section>
  `;
}

function renderVaultReports() {
  const list =
    typeof inspectionRequests !== "undefined" ? inspectionRequests : [];
  if (list.length === 0) {
    return `
      <section class="vault-panel vault-empty" aria-labelledby="vault-rep-empty">
        <h2 id="vault-rep-empty" class="vault-panel-title">실사 보고서</h2>
        <p class="vault-empty-text">등록된 실사 요청이 없습니다.</p>
        <a class="btn btn--secondary vault-panel-cta" href="./index.html">에이전트 찾기</a>
      </section>
    `;
  }

  const rows = list
    .slice()
    .reverse()
    .map((r) => {
      const title = escapeVaultHtml(String(r.villaName || "매물 미입력"));
      const date = escapeVaultHtml(r.requestDate);
      const sk = inspectionVaultStatusKey(r.status);
      const label = escapeVaultHtml(inspectionVaultStatusLabel(r.status));
      return `
      <article class="report-status-item">
        <div>
          <strong>${title}</strong>
          <p class="vault-report-subdate">${date}</p>
        </div>
        <span class="status-label status-${sk}">${label}</span>
      </article>`;
    })
    .join("");

  const completed = list.filter(
    (r) => inspectionVaultStatusKey(r.status) === "completed"
  );
  const latestCompleted =
    completed.length === 0 ?
      null
    : completed.reduce((a, b) =>
        Number(a.requestId) >= Number(b.requestId) ? a : b
      );
  const completedMain =
    latestCompleted ? renderVaultCompletedReportMain(latestCompleted) : "";

  const completedHint =
    completed.length === 0 ?
      `<p class="vault-report-hint">보고서가 도착한 요청이 있으면 아래에 진단서 형태로 표시됩니다. (데모: 에이전트 앱에서 해당 요청을 완료 처리해 보세요.)</p>`
    : "";

  return `
    <section class="vault-panel" aria-labelledby="vault-rep-title">
      <h2 id="vault-rep-title" class="vault-panel-title">실사 요청 현황</h2>
      <div class="vault-report-list">${rows}</div>
      ${completedHint}
    </section>
    ${completedMain}
  `;
}

function readVaultLikes() {
  try {
    const likes = JSON.parse(sessionStorage.getItem("baliVaultLikes") || "[]");
    return Array.isArray(likes) ? likes : [];
  } catch (_) {
    return [];
  }
}

function renderVaultLikes() {
  const likes = readVaultLikes();
  if (likes.length === 0) {
    return `
      <section class="vault-panel vault-empty" aria-labelledby="vault-like-empty">
        <h2 id="vault-like-empty" class="vault-panel-title">관심 목록</h2>
        <p class="vault-empty-text">
          관심 있는 에이전트를 저장하면 이곳에서 한눈에 볼 수 있습니다.
        </p>
        <a class="btn btn--secondary vault-panel-cta" href="./app.html#home">디렉토리 둘러보기</a>
      </section>
    `;
  }

  const items = likes
    .map((item) => {
      const id = escapeVaultHtml(item.id);
      const name = escapeVaultHtml(item.name || "에이전트");
      const rawId = String(item.id).trim();
      const propKey = `property_${rawId}`;
      const checked =
        typeof compareListIncludes === "function" &&
        compareListIncludes(propKey);
      return `
      <li class="vault-like-item">
        <label class="vault-like-compare">
          <input
            type="checkbox"
            class="vault-compare-cb"
            data-property-id="${escapeVaultHtml(propKey)}"
            ${checked ? "checked" : ""}
            aria-label="비교 목록에 넣기"
          />
        </label>
        <a href="./detail.html?id=${id}" class="vault-like-link">${name}</a>
      </li>`;
    })
    .join("");

  return `
    <section class="vault-panel" aria-labelledby="vault-like-title">
      <h2 id="vault-like-title" class="vault-panel-title">관심 에이전트</h2>
      <p class="vault-like-hint">비교할 매물을 체크한 뒤 상단의 비교함으로 이동하세요. (최대 3개)</p>
      <ul class="vault-like-list">${items}</ul>
    </section>
  `;
}

function setupVaultCompareDelegation() {
  const area = document.getElementById("vault-content");
  if (!area || area.dataset.compareDelegated === "1") return;
  area.dataset.compareDelegated = "1";
  area.addEventListener("change", (e) => {
    const t = e.target;
    if (!t || !t.matches || !t.matches(".vault-compare-cb")) return;
    const pid = t.getAttribute("data-property-id");
    if (!pid) return;
    if (typeof toggleCompareFromCheckbox !== "function") return;
    const ok = toggleCompareFromCheckbox(pid, t.checked);
    if (!ok) t.checked = false;
  });
}

function switchTab(tab) {
  const buttons = document.querySelectorAll(".vault-tabs .tab-btn");
  buttons.forEach((btn) => {
    const active = btn.getAttribute("data-tab") === tab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  const area = document.getElementById("vault-content");
  if (!area) return;

  if (tab === "simulation") area.innerHTML = renderVaultSimulation();
  else if (tab === "reports") {
    updateReportsTabCount();
    area.innerHTML = renderVaultReports();
    initVaultReportRadar();
  } else if (tab === "likes") {
    area.innerHTML = renderVaultLikes();
    if (typeof refreshCompareStrip === "function") refreshCompareStrip();
  }
}

function initVaultPage() {
  hydrateVaultHeader();
  updateReportsTabCount();
  setupVaultCompareDelegation();
  if (typeof refreshCompareStrip === "function") refreshCompareStrip();
  switchTab("simulation");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVaultPage);
} else {
  initVaultPage();
}
