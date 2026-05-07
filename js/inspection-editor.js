const MAX_MEDIA = 10;

function getEditorParams() {
  const p = new URLSearchParams(location.search);
  const requestIdRaw = p.get("requestId");
  const agentId = p.get("id") != null && p.get("id") !== "" ? String(p.get("id")) : "1";
  const requestId = requestIdRaw != null ? Number(requestIdRaw) : NaN;
  return { requestId, agentId };
}

function draftStorageKey(requestId) {
  return `baliReportDraft_${requestId}`;
}

function normalizeStatus(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function findRequest(requestId) {
  if (typeof inspectionRequests === "undefined" || !Array.isArray(inspectionRequests)) {
    return null;
  }
  return inspectionRequests.find((r) => Number(r.requestId) === Number(requestId)) || null;
}

function triggerCamera() {
  const input = document.getElementById("media-input");
  input?.click();
}

/** 선택된 파일 (데모: 이름만 서버 연동 시 multipart 전송) */
let selectedFiles = [];

function updateMediaUI() {
  const summary = document.getElementById("media-summary");
  const list = document.getElementById("media-preview");
  if (summary) {
    summary.textContent =
      selectedFiles.length === 0 ?
        "선택된 파일이 없습니다."
      : `${selectedFiles.length}개 파일 선택됨 (실서비스에서는 CDN/API로 업로드)`;
  }
  if (!list) return;
  list.innerHTML = selectedFiles
    .map(
      (f, i) =>
        `<li class="media-preview-item">${i + 1}. ${escapeEditorAttr(f.name)} <span class="media-size">${Math.round(f.size / 1024)} KB</span></li>`
    )
    .join("");
}

function escapeEditorAttr(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function onMediaChange(e) {
  const input = e.target;
  const incoming = Array.from(input.files || []);
  selectedFiles = [...selectedFiles, ...incoming].slice(0, MAX_MEDIA);
  try {
    input.value = "";
  } catch (_) {}
  updateMediaUI();
}

function collectFormPayload() {
  const functional = document.getElementById("field-functional")?.value?.trim() ?? "";
  const comment = document.getElementById("field-comment")?.value?.trim() ?? "";

  const inspection_standard =
    typeof buildInspectionStandard === "function" ? buildInspectionStandard() : {};
  const checklist =
    typeof deriveQualitativeChecklist === "function" ?
      deriveQualitativeChecklist(inspection_standard)
    : { waterPressure: "normal", hvac: "normal" };

  return {
    submittedAt: new Date().toISOString(),
    inspection_standard,
    checklist,
    functionalDiagnosis: functional,
    agentComment: comment,
    media: {
      count: selectedFiles.length,
      fileNames: selectedFiles.map((f) => f.name),
    },
  };
}

function saveDraft() {
  const { requestId } = getEditorParams();
  if (!Number.isFinite(requestId)) return;

  try {
    const payload = collectFormPayload();
    localStorage.setItem(draftStorageKey(requestId), JSON.stringify(payload));
    alert("임시 저장되었습니다. (이 브라우저 localStorage)");
  } catch (_) {
    alert("임시 저장에 실패했습니다.");
  }
}

function loadDraft(requestId) {
  try {
    const raw = localStorage.getItem(draftStorageKey(requestId));
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.inspection_standard && typeof applyInspectionStandardToForm === "function") {
      applyInspectionStandardToForm(d.inspection_standard);
    }
    if (d.functionalDiagnosis && document.getElementById("field-functional")) {
      document.getElementById("field-functional").value = d.functionalDiagnosis;
    }
    if (d.agentComment && document.getElementById("field-comment")) {
      document.getElementById("field-comment").value = d.agentComment;
    }
  } catch (_) {}
}

function setFormDisabled(disabled) {
  const form = document.getElementById("report-form");
  if (!form) return;
  form.querySelectorAll("input, select, textarea, button").forEach((el) => {
    if (el.id === "editor-back" || el.classList.contains("back-btn")) return;
    el.disabled = disabled;
  });
}

function initInspectionEditor() {
  const { requestId, agentId } = getEditorParams();
  const backHref = `./agent-dashboard.html?id=${encodeURIComponent(agentId)}`;

  document.getElementById("editor-back")?.addEventListener("click", () => {
    window.location.href = backHref;
  });

  document.getElementById("editor-draft-btn")?.addEventListener("click", saveDraft);

  const zone = document.getElementById("upload-zone-trigger");
  zone?.addEventListener("click", triggerCamera);

  const mediaInput = document.getElementById("media-input");
  mediaInput?.addEventListener("change", onMediaChange);

  const ctx = document.getElementById("editor-context");
  const errBox = document.getElementById("editor-error");

  if (!Number.isFinite(requestId)) {
    if (errBox) {
      errBox.hidden = false;
      errBox.textContent = "유효하지 않은 요청입니다. 대시보드에서 다시 열어 주세요.";
    }
    setFormDisabled(true);
    return;
  }

  const req = findRequest(requestId);
  if (!req) {
    if (errBox) {
      errBox.hidden = false;
      errBox.textContent = "해당 실사 요청을 찾을 수 없습니다.";
    }
    setFormDisabled(true);
    return;
  }

  if (String(req.agentId) !== String(agentId)) {
    if (errBox) {
      errBox.hidden = false;
      errBox.textContent = "이 요청을 처리할 권한이 없습니다.";
    }
    setFormDisabled(true);
    return;
  }

  const st = normalizeStatus(req.status);
  if (ctx) {
    ctx.textContent = `매물: ${req.villaName || "(미입력)"} · 요청 ID ${requestId}`;
  }

  if (st === "completed") {
    if (errBox) {
      errBox.hidden = false;
      errBox.classList.add("editor-error--info");
      errBox.textContent = "이미 제출된 보고서입니다. 내용만 확인할 수 있습니다.";
    }
    loadDraft(requestId);
    if (req.agentUpload && typeof req.agentUpload === "object") {
      const u = req.agentUpload;
      if (u.inspection_standard && typeof applyInspectionStandardToForm === "function") {
        applyInspectionStandardToForm(u.inspection_standard);
      }
      if (u.functionalDiagnosis) document.getElementById("field-functional").value = u.functionalDiagnosis;
      if (u.agentComment) document.getElementById("field-comment").value = u.agentComment;
    }
    setFormDisabled(true);
    updateMediaUI();
    return;
  }

  if (st === "pending" && typeof markInspectionInProgress === "function") {
    markInspectionInProgress(requestId);
  }

  loadDraft(requestId);
  updateMediaUI();

  document.getElementById("report-form")?.addEventListener("submit", (e) => {
    if (typeof submitReport !== "function") {
      e.preventDefault();
      alert("보고서 전송 모듈을 불러오지 못했습니다.");
      return;
    }

    submitReport(e, {
      requestId,
      req,
      payload: collectFormPayload(),
      backHref,
      draftStorageKey: draftStorageKey(requestId),
    });
  });
}

window.triggerCamera = triggerCamera;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initInspectionEditor);
} else {
  initInspectionEditor();
}
