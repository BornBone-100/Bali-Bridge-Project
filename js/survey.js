let userScore = { type: "", preference: "" };

function escapeSurveyHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

function setSurveyProgressDone() {
  const fill = document.getElementById("progress-fill");
  const bar = document.querySelector("#survey-section .progress-bar");
  if (fill) fill.style.width = "100%";
  if (bar) bar.setAttribute("aria-valuenow", "100");
}

function animateInfographic(container) {
  const root =
    container instanceof Element
      ? container
      : document.getElementById("infographic-result");
  if (!root) return;

  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (_) {}

  const bars = root.querySelectorAll(".bar-fill");
  bars.forEach((bar) => {
    const width = bar.style.width;
    bar.style.width = "0";
    setTimeout(() => {
      bar.style.width = width;
    }, 100);
  });
}

function nextStep(choice) {
  if (choice === "yield") userScore.type = "Income-Focused";
  if (choice === "capital") userScore.type = "Growth-Focused";

  try {
    sessionStorage.setItem("baliUserScore", JSON.stringify(userScore));
  } catch (_) {}

  setSurveyProgressDone();
  showSurveyResult();

  if (typeof updateCalc === "function") {
    updateCalc();
  }
}

function showSurveyResult() {
  const questionBox = document.getElementById("question-box");
  const infoCard = document.getElementById("infographic-result");
  if (!questionBox || !infoCard) return;

  questionBox.hidden = true;
  infoCard.hidden = false;

  const isIncome = userScore.type === "Income-Focused";

  const typeBadge = isIncome ? "Income-Focused" : "Growth-Focused";
  const badgeClass = isIncome ? "type-badge type-badge--income" : "type-badge type-badge--growth";
  const resultTitle = isIncome
    ? "현금 흐름 중심의 '안정형 투자자'"
    : "시세를 선점하는 '성장형 투자자'";
  const resultDesc = isIncome
    ? "공실률이 낮고 관리가 철저한 짱구, 세미냑 지역의 슈퍼호스트 에이전트를 추천합니다."
    : "현재 개발이 한창인 울루와투나 페레레난 지역의 토지 개발 전문가를 추천합니다.";

  const m1 = isIncome ? 92 : 70;
  const m2 = isIncome ? 45 : 95;
  const m3 = isIncome ? 88 : 40;

  const regionLabel = isIncome ? "짱구, 세미냑" : "울루와투, 페레레난";
  const horizonLabel = isIncome ? "3~7년 중기 보유" : "7년 이상 장기";

  infoCard.innerHTML = `
    <div class="info-header">
      <div class="${badgeClass}">${escapeSurveyHtml(typeBadge)}</div>
      <h2 class="info-title">${escapeSurveyHtml(resultTitle)}</h2>
      <p class="info-desc">${escapeSurveyHtml(resultDesc)}</p>
    </div>
    <div class="info-body">
      <div class="metrics-container" aria-label="투자 성향 지표">
        <div class="metric-item">
          <span class="metric-label">수익성</span>
          <div class="bar-bg"><div class="bar-fill" style="width:${m1}%"></div></div>
          <span class="metric-value">${m1}%</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">성장성</span>
          <div class="bar-bg"><div class="bar-fill bar-fill--accent" style="width:${m2}%"></div></div>
          <span class="metric-value">${m2}%</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">안정성</span>
          <div class="bar-bg"><div class="bar-fill bar-fill--muted" style="width:${m3}%"></div></div>
          <span class="metric-value">${m3}%</span>
        </div>
      </div>
      <div class="investment-summary">
        <div class="summary-box">
          <p class="summary-box__label"><span aria-hidden="true">📍</span> 추천 지역</p>
          <strong class="summary-box__value">${escapeSurveyHtml(regionLabel)}</strong>
        </div>
        <div class="summary-box">
          <p class="summary-box__label"><span aria-hidden="true">⏳</span> 보유 기간</p>
          <strong class="summary-box__value">${escapeSurveyHtml(horizonLabel)}</strong>
        </div>
      </div>
      <button type="button" class="main-btn info-card__cta" onclick="scrollToCalc()">시뮬레이션 시작하기</button>
    </div>
  `;

  animateInfographic(infoCard);
}

function scrollToCalc() {
  document
    .querySelector(".calculator-section")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (typeof updateCalc === "function") {
    updateCalc();
  }
}

function restoreSurveyState() {
  try {
    const raw = sessionStorage.getItem("baliUserScore");
    if (!raw) return;
    const o = JSON.parse(raw);
    if (o && (o.type === "Income-Focused" || o.type === "Growth-Focused")) {
      userScore = { type: o.type, preference: o.preference || "" };
      setSurveyProgressDone();
      showSurveyResult();
      if (typeof updateCalc === "function") updateCalc();
    }
  } catch (_) {}
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", restoreSurveyState);
} else {
  restoreSurveyState();
}
