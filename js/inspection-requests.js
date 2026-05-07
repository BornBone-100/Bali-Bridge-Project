/**
 * 실사 보고서 요청 — 프런트 데모용 인메모리 저장소 + 상태 흐름 개념
 *
 * 실제 서비스에서는:
 * - submit 시 서버 API(fetch/axios)로 영속화
 * - 에이전트 앱: 푸시(FCM/APNs)·WebSocket으로 새 요청 알림
 * - 에이전트 업로드 완료 시 동일 requestId로 투자자(userId)에게 매칭·알림
 */

const inspectionRequests = [];

const INSPECTION_STORAGE_KEY = "baliInspectionRequests";

function persistInspectionRequests() {
  try {
    localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(inspectionRequests));
  } catch (_) {}
}

function loadInspectionRequestsFromStorage() {
  try {
    const raw = localStorage.getItem(INSPECTION_STORAGE_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    inspectionRequests.length = 0;
    for (const row of arr) {
      inspectionRequests.push(row);
    }
  } catch (_) {}
}

function getOrCreateInvestorId() {
  try {
    let id = sessionStorage.getItem("baliInvestorId");
    if (!id) {
      id = "inv_" + Date.now();
      sessionStorage.setItem("baliInvestorId", id);
    }
    return id;
  } catch (_) {
    return "guest_" + Date.now();
  }
}

function getInvestorDisplayNameForRequest() {
  try {
    return sessionStorage.getItem("baliInvestorName") || "";
  } catch (_) {
    return "";
  }
}

/** 에이전트 전용 앱 알림 자리 (실제: FCM, APNs, 사내 실시간 채널) */
function notifyAgentApp(request) {
  console.info("[agent-app] 새 실사 요청", {
    requestId: request.requestId,
    agentId: request.agentId,
    villaName: request.villaName,
  });
}

/** 투자자 앱 알림 자리 (실제: 인앱 알림, 이메일, 푸시) */
function notifyInvestorReportReady(request) {
  console.info("[investor-app] 보고서 준비됨", {
    requestId: request.requestId,
    userId: request.userId,
    hasUpload: Boolean(request.agentUpload),
  });
}

/**
 * 투자자가 실사를 요청할 때 호출 (개념 코드)
 * @param {string|number} agentId
 * @param {string} villaName
 * @returns {object} 생성된 요청 객체
 */
function submitInspectionRequest(agentId, villaName) {
  const newRequest = {
    requestId: Date.now(),
    userId: getOrCreateInvestorId(),
    investorName: getInvestorDisplayNameForRequest(),
    agentId: agentId,
    villaName: villaName || "",
    status: "Pending",
    requestDate: new Date().toLocaleDateString("ko-KR"),
    agentUpload: null,
  };

  inspectionRequests.push(newRequest);
  persistInspectionRequests();
  notifyAgentApp(newRequest);

  alert(
    "실사 요청이 에이전트에게 전달되었습니다. 평균 48시간 이내에 보고서가 도착합니다."
  );

  /*
  // 실제 서비스 예시:
  await fetch("/api/inspection-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRequest),
  });
  */

  return newRequest;
}

/** 에이전트가 현장에 나갔을 때 (백오피스·에이전트 앱에서 호출 가정) */
function markInspectionInProgress(requestId) {
  const r = inspectionRequests.find(
    (x) => Number(x.requestId) === Number(requestId)
  );
  if (r) r.status = "In Progress";
  persistInspectionRequests();
  return r || null;
}

/**
 * 에이전트가 업로드한 데이터를 해당 요청에 붙이고 완료 처리 → 투자자에게 매칭 알림
 * @param {number} requestId
 * @param {object} payload 비디오 URL, 체크리스트 결과 등
 */
function attachAgentUploadAndComplete(requestId, payload) {
  const r = inspectionRequests.find(
    (x) => Number(x.requestId) === Number(requestId)
  );
  if (!r) return null;

  r.agentUpload = payload && typeof payload === "object" ? payload : { raw: payload };
  r.status = "Completed";
  persistInspectionRequests();
  notifyInvestorReportReady(r);
  return r;
}

loadInspectionRequestsFromStorage();

/** 투자자 앱의 결과 화면에 넘길 뷰 모델 (완료 건만) */
function getInvestorMatchedReport(requestId) {
  const r = inspectionRequests.find(
    (x) => Number(x.requestId) === Number(requestId)
  );
  if (!r || r.status !== "Completed") return null;

  return {
    requestId: r.requestId,
    userId: r.userId,
    agentId: r.agentId,
    villaName: r.villaName,
    status: r.status,
    requestDate: r.requestDate,
    report: r.agentUpload,
  };
}
