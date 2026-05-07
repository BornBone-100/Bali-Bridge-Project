/**
 * 에이전트 보고서 제출 → 투자자 보관함·알림 (데모)
 * 실서비스: attach 이후 서버가 투자자 푸시/Webhook을 발송하고 동일 스키마를 DB에 저장합니다.
 */

const SCORE_VALUE_EN = {
  good: "Good",
  normal: "Fair",
  repair: "NeedsRepair",
};

function mapScoreToEnglish(value) {
  if (value == null || value === "") return "Unknown";
  const key = String(value).toLowerCase();
  return SCORE_VALUE_EN[key] || String(value);
}

function acDeltaToScoreLabel(delta) {
  if (delta == null || typeof delta !== "number" || Number.isNaN(delta)) return "Unknown";
  if (delta >= 6) return "Good";
  if (delta >= 4) return "Fair";
  return "NeedsRepair";
}

/** 가상 푸시·인앱 알림 */
function sendPushToUser(userDisplayName, message) {
  console.log(`[push → ${userDisplayName}]`, message);
  try {
    const raw = localStorage.getItem("baliInvestorPushInbox");
    const inbox = Array.isArray(JSON.parse(raw || "[]")) ? JSON.parse(raw || "[]") : [];
    inbox.push({
      at: new Date().toISOString(),
      to: userDisplayName,
      message,
    });
    localStorage.setItem("baliInvestorPushInbox", JSON.stringify(inbox.slice(-40)));
  } catch (_) {}
}

function buildInvestorReportRecord(requestId, req, payload) {
  const std = payload?.inspection_standard;
  const waterStatus =
    std?.utility_metrics?.water_pressure?.status ||
    mapScoreToEnglish(payload?.checklist?.waterPressure);
  const acLabel = acDeltaToScoreLabel(std?.utility_metrics?.ac_efficiency?.delta_t);
  const electricStatus =
    acLabel !== "Unknown" ? acLabel : mapScoreToEnglish(payload?.checklist?.hvac);

  return {
    inspectionId: `INS-${requestId}`,
    villaName: req.villaName || "",
    status: "Completed",
    scores: {
      water: waterStatus,
      electric: electricStatus,
    },
    inspection_standard: std || null,
    comment: payload?.agentComment || "",
    functionalDiagnosis: payload?.functionalDiagnosis || "",
    timestamp: new Date().toISOString(),
    requestId,
    userId: req.userId,
    investorName: req.investorName || "",
  };
}

/** 투자자 보관함 연동용 로컬 큐 (실서비스에서는 서버가 vault API 갱신) */
function deliverReportToInvestorVault(record) {
  try {
    const raw = localStorage.getItem("baliInvestorVaultReports");
    const arr = Array.isArray(JSON.parse(raw || "[]")) ? JSON.parse(raw || "[]") : [];
    arr.push(record);
    localStorage.setItem("baliInvestorVaultReports", JSON.stringify(arr.slice(-50)));
  } catch (_) {}
}

/**
 * 보고서 저장 + 투자자 측 동기화 트리거
 */
function finalizeAgentReportSubmission(requestId, req, payload) {
  const record = buildInvestorReportRecord(requestId, req, payload);
  const mergedPayload = {
    ...payload,
    investorSummary: record,
  };

  if (typeof attachAgentUploadAndComplete === "function") {
    attachAgentUploadAndComplete(requestId, mergedPayload);
  }

  deliverReportToInvestorVault(record);

  const investorLabel = req.investorName || "투자자";
  sendPushToUser(
    investorLabel,
    "요청하신 실사 보고서가 도착했습니다! 보관함을 확인하세요."
  );

  console.log("보고서가 서버로 전송되었습니다.", record);
  return record;
}

/**
 * 폼 제출 핸들러 (개념 코드와 동일한 진입점)
 * @param {Event} event
 * @param {{ requestId: number, req: object, payload: object, backHref: string, draftStorageKey: string }} ctx
 */
function submitReport(event, ctx) {
  event.preventDefault();

  const { requestId, req, payload, backHref, draftStorageKey: draftKey } = ctx;

  if (typeof attachAgentUploadAndComplete !== "function") {
    alert("제출 처리 모듈을 불러오지 못했습니다.");
    return;
  }

  finalizeAgentReportSubmission(requestId, req, payload);

  try {
    if (draftKey) localStorage.removeItem(draftKey);
  } catch (_) {}

  alert("보고서 전송 완료!");
  window.location.href = backHref;
}
