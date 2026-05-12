import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

const PLACEHOLDER_IMG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect fill="#E5E7EB" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9CA3AF" font-size="18" font-family="system-ui,sans-serif">이미지 URL 미등록</text></svg>'
  );

let roiChartInstance = null;
let vacancyChartInstance = null;

function destroyCharts() {
  if (roiChartInstance) {
    roiChartInstance.destroy();
    roiChartInstance = null;
  }
  if (vacancyChartInstance) {
    vacancyChartInstance.destroy();
    vacancyChartInstance = null;
  }
}

function initDdRoiChart(series = null) {
  const el = document.getElementById("roiChart");
  if (!el || typeof Chart === "undefined") return null;

  const labels = Array.isArray(series) && series.length ? series.map((s) => s.label || "") : [];
  const conservative = Array.isArray(series) && series.length ? series.map((s) => Number(s.conservative) || 0) : [];
  const average = Array.isArray(series) && series.length ? series.map((s) => Number(s.average) || 0) : [];
  const aggressive = Array.isArray(series) && series.length ? series.map((s) => Number(s.aggressive) || 0) : [];

  const ctx = el.getContext("2d");
  roiChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "보수적",
          data: conservative,
          borderColor: "rgba(99, 110, 114, 0.95)",
          backgroundColor: "rgba(99, 110, 114, 0.18)",
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: "평균적",
          data: average,
          borderColor: "rgba(9, 132, 227, 0.95)",
          backgroundColor: "rgba(9, 132, 227, 0.18)",
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: "공격적",
          data: aggressive,
          borderColor: "rgba(0, 184, 148, 0.95)",
          backgroundColor: "rgba(0, 184, 148, 0.18)",
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { mode: "index", intersect: false },
      },
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          suggestedMin: 0,
          suggestedMax: 20,
          ticks: {
            callback: (v) => `${v}%`,
          },
          grid: { color: "rgba(45, 52, 54, 0.08)" },
        },
        x: { grid: { display: false } },
      },
    },
  });
  return roiChartInstance;
}

function initDdVacancyChart(vacancyTrend = null) {
  const el = document.getElementById("vacancyChart");
  if (!el || typeof Chart === "undefined") return null;

  const labels = Array.isArray(vacancyTrend) && vacancyTrend.length ? vacancyTrend.map((v) => v.label || "") : [];
  const values = Array.isArray(vacancyTrend) && vacancyTrend.length ? vacancyTrend.map((v) => Number(v.rate) || 0) : [];

  const ctx = el.getContext("2d");
  vacancyChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "평균 공실률",
          data: values,
          backgroundColor: [
            "rgba(45, 52, 54, 0.25)",
            "rgba(9, 132, 227, 0.25)",
            "rgba(0, 184, 148, 0.25)",
          ],
          borderColor: ["#2d3436", "#0984e3", "#00b894"],
          borderWidth: 1.5,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx2) => `${ctx2.parsed.y}%`,
          },
        },
      },
      scales: {
        y: {
          suggestedMin: 0,
          suggestedMax: 30,
          ticks: { callback: (v) => `${v}%` },
          grid: { color: "rgba(45, 52, 54, 0.08)" },
        },
        x: { grid: { display: false } },
      },
    },
  });
  return vacancyChartInstance;
}

function bindDdPdfDownload() {
  const btn = document.getElementById("download-pdf");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const pdfUrl = btn.getAttribute("data-pdf-url");
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    window.print();
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (value === undefined || value === null || value === "") {
    el.textContent = "—";
    return;
  }
  el.textContent = String(value);
}

function setImgSrc(id, url) {
  const el = document.getElementById(id);
  if (!el || el.tagName !== "IMG") return;
  const u = url && String(url).trim();
  el.src = u || PLACEHOLDER_IMG;
  el.alt = u ? "" : "이미지 없음";
}

function clearReportFields() {
  const ids = [
    "dd-title",
    "dd-updated-at",
    "dd-land-rights",
    "dd-investment-period",
    "dd-trust-grade",
    "dd-trust-note",
    "dd-target-roi",
    "dd-investment-period-metric",
    "dd-land-rights-metric",
    "dd-metric-sub-roi",
    "dd-metric-sub-period",
    "dd-metric-sub-land",
    "dd-legal-chip",
    "dd-financial-chip",
    "dd-location-chip",
    "dd-legal-sertifikat",
    "dd-legal-zoning",
    "dd-legal-pbg",
    "dd-legal-footnote",
    "dd-loc-beach",
    "dd-loc-school",
    "dd-loc-hospital",
    "dd-loc-airport",
    "dd-exit-multiple",
    "dd-exit-sub",
    "dd-risk-level",
    "dd-risk-sub",
    "dd-loc-bullet-1",
    "dd-loc-bullet-2",
    "dd-expert-quote",
    "dd-expert-footer",
    "dd-cap-drone",
    "dd-cap-site",
    "dd-cap-boundary",
  ];
  for (const id of ids) setText(id, "");
  setImgSrc("dd-img-drone", "");
  setImgSrc("dd-img-site", "");
  setImgSrc("dd-img-boundary", "");
  const dl = document.getElementById("download-pdf");
  if (dl) dl.removeAttribute("data-pdf-url");
}

function showNotice(message) {
  const container = document.querySelector(".dd-report-container");
  if (!container) return;
  let el = document.getElementById("dd-runtime-notice");
  if (!el) {
    el = document.createElement("div");
    el.id = "dd-runtime-notice";
    el.style.marginBottom = "16px";
    el.style.padding = "12px 14px";
    el.style.borderRadius = "10px";
    el.style.backgroundColor = "#FEF3C7";
    el.style.color = "#92400E";
    el.style.fontSize = "14px";
    el.style.fontWeight = "600";
    container.insertBefore(el, container.firstChild);
  }
  el.textContent = message;
}

function hideNotice() {
  const el = document.getElementById("dd-runtime-notice");
  if (el) el.remove();
}

function toDateText(v) {
  if (!v) return "";
  return String(v).slice(0, 10).replaceAll("-", ".");
}

function parsePropertyId() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("propertyId") ?? params.get("property");
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function formatLocMin(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isFinite(n)) return `${n}분`;
  return String(v);
}

function applyLocationBullet(elId, prefixHtml, bodyText) {
  const el = document.getElementById(elId);
  if (!el) return;
  const body = bodyText && String(bodyText).trim() ? String(bodyText).trim() : "—";
  el.innerHTML = `<strong>${prefixHtml}</strong>: ${escapeHtml(body)}`;
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

async function bindDdReportData() {
  clearReportFields();
  hideNotice();

  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) {
    showNotice("Supabase 환경 변수(BB_SUPABASE_URL / BB_SUPABASE_ANON_KEY)가 설정되지 않았습니다.");
    return null;
  }

  const propertyId = parsePropertyId();
  if (propertyId == null) {
    showNotice("URL에 매물 번호를 지정해 주세요. 예: dd-report.html?propertyId=1");
    setText("dd-title", "실사보고서");
    return null;
  }

  const supabase = createClient(url, key);

  const { data: propertyData } = await supabase
    .from("properties")
    .select("id,title,location")
    .eq("id", propertyId)
    .maybeSingle();

  const { data, error } = await supabase.from("dd_reports").select("*").eq("property_id", propertyId).maybeSingle();

  if (error) {
    console.error("dd_reports 조회 에러:", error);
    showNotice("실사보고서 데이터를 불러오지 못했습니다. 테이블·RLS·업그레이드 SQL 적용 여부를 확인해 주세요.");
    return null;
  }

  if (!data) {
    showNotice(
      `매물 ID ${propertyId}에 등록된 실사보고서가 없거나, 아직 공개(is_public)되지 않았습니다. 관리자 페이지에서 내용을 입력·저장한 뒤 「공개」를 켜 주세요.`
    );
    setText("dd-title", propertyData?.title || `매물 #${propertyId}`);
    return null;
  }

  const title = propertyData?.title || `매물 #${propertyId}`;
  setText("dd-title", title);

  setText("dd-updated-at", toDateText(data.updated_at));
  setText("dd-land-rights", data.land_rights);
  setText("dd-investment-period", data.investment_period);

  setText("dd-trust-grade", data.trust_grade);
  setText("dd-trust-note", data.trust_note);

  const roiNum = data.target_roi != null ? Number(data.target_roi) : null;
  setText("dd-target-roi", roiNum != null && Number.isFinite(roiNum) ? `${roiNum}%` : "—");
  setText("dd-investment-period-metric", data.investment_period);
  setText("dd-land-rights-metric", data.land_rights);

  setText("dd-metric-sub-roi", data.metric_sub_roi);
  setText("dd-metric-sub-period", data.metric_sub_period);
  setText("dd-metric-sub-land", data.metric_sub_land);

  setText("dd-legal-chip", data.legal_chip);
  setText("dd-financial-chip", data.financial_chip);
  setText("dd-location-chip", data.location_chip);

  const legal = data.legal_status && typeof data.legal_status === "object" ? data.legal_status : {};
  setText("dd-legal-sertifikat", legal.sertifikat);
  setText("dd-legal-zoning", legal.zoning);
  setText("dd-legal-pbg", legal.pbg);
  setText("dd-legal-footnote", data.legal_footnote || "* 발리 투자 리스크의 핵심(소유권/용도/허가)을 우선 검토합니다.");

  const loc = data.location_data && typeof data.location_data === "object" ? data.location_data : {};
  setText("dd-loc-beach", formatLocMin(loc.beach_min));
  setText("dd-loc-school", formatLocMin(loc.school_min));
  setText("dd-loc-hospital", formatLocMin(loc.hospital_min));
  setText("dd-loc-airport", formatLocMin(loc.airport_min));

  const fin = data.financial_data && typeof data.financial_data === "object" ? data.financial_data : {};
  const exitMultiple = fin.exit_multiple;
  if (exitMultiple != null && exitMultiple !== "") {
    setText("dd-exit-multiple", `예상 매각가 ${exitMultiple}×`);
  } else {
    setText("dd-exit-multiple", "—");
  }
  setText("dd-exit-sub", data.exit_strategy_sub || fin.exit_strategy_sub);
  setText("dd-risk-level", fin.risk_level);
  setText("dd-risk-sub", data.risk_memo_sub || fin.risk_memo_sub);

  applyLocationBullet("dd-loc-bullet-1", "인근 개발 호재", data.location_bullet_1);
  applyLocationBullet("dd-loc-bullet-2", "소음/환경", data.location_bullet_2);

  const quote = data.expert_quote;
  const qEl = document.getElementById("dd-expert-quote");
  if (qEl) {
    qEl.textContent = quote && String(quote).trim() ? `“${String(quote).trim()}”` : "—";
  }
  setText("dd-expert-footer", data.expert_footer || "— 현지 실사 에이전트 코멘트");

  setImgSrc("dd-img-drone", data.image_drone_url);
  setImgSrc("dd-img-site", data.image_site_url);
  setImgSrc("dd-img-boundary", data.image_boundary_url);

  const downloadBtn = document.getElementById("download-pdf");
  if (downloadBtn && data.pdf_url) {
    downloadBtn.setAttribute("data-pdf-url", data.pdf_url);
  }

  return data;
}

async function initDdReport() {
  bindDdPdfDownload();
  destroyCharts();
  const report = await bindDdReportData();
  initDdRoiChart(report?.financial_data?.roi_projection || []);
  initDdVacancyChart(report?.financial_data?.vacancy_trend || []);
}

document.addEventListener("DOMContentLoaded", () => {
  void initDdReport();
});
