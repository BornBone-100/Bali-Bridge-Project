/**
 * 발리 빌라 수익 시뮬레이터 — 슬라이더 변경 시 즉시 반영
 *
 * 월 총 매출 = 1박(원) × 30 × 점유율
 * 에이전트 수수료 20%, 운영비 15% (매출 대비)
 * 월 순매출 = 총 매출 − 수수료 − 운영비
 * 연 ROI = (월 순매출 × 12 / 투자금) × 100
 */

/** 설문 없을 때만 쓰는 기본 매칭 — invest: 원, roi: %, occupancy: 0~1 */
function getLegacyRecommendation(invest, roi, occupancy) {
  const recommendation = {
    primary: null,
    reason: "",
  };

  if (typeof agentData === "undefined" || !Array.isArray(agentData)) {
    return recommendation;
  }

  const investLevel = invest / 100000000;

  if (investLevel >= 5) {
    recommendation.primary = agentData.find((a) =>
      String(a.specialty ?? "").includes("럭셔리")
    );
    recommendation.reason =
      "높은 자본력에 걸맞은 하이엔드 시장 전문가를 추천합니다.";
  } else if (roi >= 12 && occupancy >= 0.8) {
    recommendation.primary = agentData.find((a) => a.rating >= 4.8);
    recommendation.reason =
      "높은 가동률과 수익 극대화에 특화된 운영사를 추천합니다.";
  } else if (investLevel < 2) {
    recommendation.primary = agentData.find((a) =>
      (a.regions ?? []).includes("우붓")
    );
    recommendation.reason =
      "소자본으로 시작 가능한 틈새시장 전문가를 추천합니다.";
  } else {
    recommendation.primary =
      agentData.find((a) => (a.languages ?? []).includes("KR")) ||
      agentData[0];
    recommendation.reason =
      "원활한 소통과 안정적인 관리가 가능한 파트너를 추천합니다.";
  }

  return recommendation;
}

/** 에이전트별 성향 가중 점수 (높을수록 해당 성향에 적합) */
function scoreAgentForProfile(agent) {
  if (typeof userScore === "undefined" || !userScore.type) return 0;

  const regs = agent.regions ?? [];
  const spec = String(agent.specialty ?? "");
  let score = 0;

  if (userScore.type === "Income-Focused") {
    if (regs.includes("짱구")) score += 4;
    if (regs.includes("세미냑")) score += 4;
    if (agent.rating >= 4.8) score += 3;
    else if (agent.rating >= 4.6) score += 1;
    if (spec.includes("럭셔리")) score += 2;
  } else if (userScore.type === "Growth-Focused") {
    if (regs.includes("울루와투")) score += 5;
    if (spec.includes("토지") || spec.includes("개발")) score += 5;
    if (agent.rating >= 4.5) score += 1;
  }

  return score;
}

/** invest: 원 단위, roi: 연 ROI (%), occupancy: 0~1 비율 */
function getRecommendedAgent(invest, roi, occupancy) {
  if (typeof agentData === "undefined" || !Array.isArray(agentData)) {
    return { primary: null, reason: "" };
  }

  const legacy = getLegacyRecommendation(invest, roi, occupancy);

  if (typeof userScore === "undefined" || !userScore.type) {
    return legacy;
  }

  let best = null;
  let bestScore = -1;
  let bestRating = -1;
  for (const a of agentData) {
    const s = scoreAgentForProfile(a);
    const r = a.rating ?? 0;
    if (s > bestScore || (s === bestScore && r > bestRating)) {
      bestScore = s;
      bestRating = r;
      best = a;
    }
  }

  const profileNote =
    userScore.type === "Income-Focused" ?
      "[성향: 현금 흐름형] 짱구·세미냑·고평점 가중. "
    : "[성향: 성장형] 울루와투·토지/개발 가중. ";

  if (best && bestScore > 0) {
    return {
      primary: best,
      reason:
        profileNote +
        (legacy.reason ?
          `시뮬레이터 조건 반영: ${legacy.reason}`
        : ""),
    };
  }

  return {
    primary: legacy.primary,
    reason:
      profileNote +
      (legacy.reason || "조건에 맞는 파트너를 찾는 중입니다."),
  };
}

function escapeCalcHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

function updateUIWithRecommendation(invest, roi, occupancy) {
  const area = document.getElementById("match-result-area");
  if (!area) return;

  const result = getRecommendedAgent(invest, roi, occupancy);
  const agent = result.primary;

  if (!agent) {
    area.innerHTML = `
        <div class="match-container match-container--empty">
            <p class="match-label">✨ AI 맞춤 추천 파트너</p>
            <p class="match-empty">${escapeCalcHtml(
              result.reason || "조건에 맞는 파트너를 찾지 못했습니다."
            )}</p>
        </div>`;
    return;
  }

  const recommendationHTML = `
        <div class="match-container match-container--animate">
            <p class="match-label">✨ AI 맞춤 추천 파트너</p>
            <div class="match-card">
                <img src="${escapeCalcHtml(agent.image)}" class="match-img" alt="${escapeCalcHtml(agent.name)}">
                <div class="match-info">
                    <h4>${escapeCalcHtml(agent.name)} <span class="match-reason">${escapeCalcHtml(result.reason)}</span></h4>
                    <p class="match-meta">${escapeCalcHtml(agent.company)} | ⭐ ${escapeCalcHtml(String(agent.rating))}</p>
                    <button type="button" onclick="openModal(${agent.id})" class="view-detail-btn">전문가 리포트 보기</button>
                </div>
            </div>
        </div>
    `;

  area.innerHTML = recommendationHTML;
}

function updateCalc() {
  const investEl = document.getElementById("invest");
  const priceEl = document.getElementById("price");
  const occEl = document.getElementById("occupancy");
  const investValEl = document.getElementById("invest-val");
  const priceValEl = document.getElementById("price-val");
  const occValEl = document.getElementById("occ-val");
  const monthlyProfitEl = document.getElementById("monthly-profit");
  const annualRoiEl = document.getElementById("annual-roi");
  if (
    !investEl ||
    !priceEl ||
    !occEl ||
    !investValEl ||
    !priceValEl ||
    !occValEl ||
    !monthlyProfitEl ||
    !annualRoiEl
  ) {
    return;
  }

  // 1. 값 가져오기
  const invest = parseFloat(investEl.value) * 100000000;
  const price = parseFloat(priceEl.value) * 10000;
  const occupancy = parseFloat(occEl.value) / 100;

  if (!Number.isFinite(invest) || !Number.isFinite(price) || !Number.isFinite(occupancy)) {
    return;
  }

  // 2. 텍스트 업데이트
  investValEl.innerText =
    invest / 100000000 + "억";
  priceValEl.innerText = price / 10000 + "만";
  occValEl.innerText = occupancy * 100 + "%";

  // 3. 계산 (발리 현지 비용 평균 적용)
  const monthlyGross = price * 30 * occupancy;
  const managementFee = monthlyGross * 0.2;
  const opEx = monthlyGross * 0.15;

  const monthlyNet = monthlyGross - managementFee - opEx;
  const annualNet = monthlyNet * 12;
  const roi = invest > 0 ? (annualNet / invest) * 100 : 0;

  // 4. 결과 출력
  monthlyProfitEl.innerText =
    Math.floor(monthlyNet / 10000).toLocaleString() + "만 원";
  annualRoiEl.innerText = roi.toFixed(1) + "%";

  updateUIWithRecommendation(invest, roi, occupancy);

  if (typeof scheduleVaultSimulationSave === "function") {
    const rec = getRecommendedAgent(invest, roi, occupancy);
    const region =
      typeof regionKoFromAgent === "function" ?
        regionKoFromAgent(rec.primary)
      : "발리";
    scheduleVaultSimulationSave({
      budget: investValEl.innerText,
      expectedROI: roi.toFixed(1) + "%",
      region,
    });
  }
}

updateCalc();
