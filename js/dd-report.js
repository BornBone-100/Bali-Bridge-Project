import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

const FIELD_IDS = [
  "dd-title",
  "dd-location",
  "dd-updated-at",
  "dd-land-rights",
  "dd-investment-period",
  "dd-roi",
  "dd-investment-period-metric",
  "dd-land-rights-metric",
  "dd-metric-sub-roi",
  "dd-metric-sub-period",
  "dd-metric-sub-rights",
  "dd-trust-grade",
  "dd-trust-note",
  "dd-cert-badge",
  "dd-cert",
  "dd-legal-sertifikat",
  "dd-zoning",
  "dd-pbg",
  "dd-legal-footnote",
  "dd-chip-financial",
  "dd-chip-location",
  "dd-loc-beach",
  "dd-loc-school",
  "dd-loc-hospital",
  "dd-loc-airport",
  "dd-loc-catalyst",
  "dd-loc-environment",
  "dd-exit-multiple",
  "dd-risk-level",
  "dd-mini-exit-sub",
  "dd-mini-risk-sub",
  "dd-expert-quote",
  "dd-expert-quote-footer",
  "dd-media-cap-1",
  "dd-media-cap-2",
  "dd-media-cap-3",
];

function initDdRoiChart(series = null) {
  const el = document.getElementById("roiChart");
  if (!el || typeof Chart === "undefined") return null;

  const labels = Array.isArray(series) && series.length ? series.map((s) => s.label || "") : [];
  const conservative = Array.isArray(series) && series.length ? series.map((s) => Number(s.conservative) || 0) : [];
  const average = Array.isArray(series) && series.length ? series.map((s) => Number(s.average) || 0) : [];
  const aggressive = Array.isArray(series) && series.length ? series.map((s) => Number(s.aggressive) || 0) : [];

  const ctx = el.getContext("2d");
  return new Chart(ctx, {
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
          ticks: { callback: (v) => `${v}%` },
          grid: { color: "rgba(45, 52, 54, 0.08)" },
        },
        x: { grid: { display: false } },
      },
    },
  });
}

function initDdVacancyChart(vacancyTrend = null) {
  const el = document.getElementById("vacancyChart");
  if (!el || typeof Chart === "undefined") return null;

  const labels = Array.isArray(vacancyTrend) && vacancyTrend.length ? vacancyTrend.map((v) => v.label || "") : [];
  const values = Array.isArray(vacancyTrend) && vacancyTrend.length ? vacancyTrend.map((v) => Number(v.rate) || 0) : [];

  const ctx = el.getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "평균 공실률",
          data: values,
          backgroundColor: ["rgba(45, 52, 54, 0.25)", "rgba(9, 132, 227, 0.25)", "rgba(0, 184, 148, 0.25)"],
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
        tooltip: { callbacks: { label: (ctx2) => `${ctx2.parsed.y}%` } },
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
    alert("등록된 PDF 실사 보고서가 없습니다.");
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value === undefined || value === null || value === "" ? "-" : String(value);
}

function setMediaFigure(index, url, caption) {
  const fig = document.querySelector(`.dd-media-item[data-dd-media="${index}"]`);
  if (!fig) return;
  const img = fig.querySelector("img");
  const cap = fig.querySelector("figcaption");
  if (url && img) {
    img.src = String(url);
    img.removeAttribute("hidden");
    fig.removeAttribute("hidden");
  } else if (fig) {
    fig.setAttribute("hidden", "");
  }
  if (cap) cap.textContent = caption || "-";
}

function clearReportFields() {
  FIELD_IDS.forEach((id) => setText(id, "-"));
  setText("dd-title", "데이터 불러오는 중...");

  const heroImg = document.getElementById("dd-image");
  if (heroImg) {
    heroImg.src = "";
    heroImg.setAttribute("hidden", "");
  }

  [1, 2, 3].forEach((i) => setMediaFigure(i, null, "-"));

  const downloadBtn = document.getElementById("download-pdf");
  if (downloadBtn) downloadBtn.removeAttribute("data-pdf-url");
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

function toDateText(v) {
  if (!v) return "-";
  return String(v).slice(0, 10).replaceAll("-", ".");
}

function getPropertyIdFromUrl() {
  const raw = new URLSearchParams(window.location.search).get("propertyId");
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function bindDdReportData() {
  clearReportFields();

  const propertyId = getPropertyIdFromUrl();
  if (propertyId == null) {
    window.location.replace("./dd-select.html");
    return null;
  }

  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) {
    showNotice("Supabase 설정을 확인해 주세요.");
    return null;
  }

  const supabase = createClient(url, key);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    showNotice("로그인이 필요한 실사보고서입니다. 로그인 후 다시 열어주세요.");
    return null;
  }

  const { data: propertyData } = await supabase
    .from("properties")
    .select("id,title,location")
    .eq("id", propertyId)
    .maybeSingle();

  if (!propertyData) {
    showNotice(`propertyId=${propertyId}에 해당하는 매물을 찾을 수 없습니다.`);
    setText("dd-title", "매물 없음");
    return null;
  }

  const { data, error } = await supabase.from("dd_reports").select("*").eq("property_id", propertyId).maybeSingle();
  if (error) {
    console.error("dd_reports 조회 에러:", error);
    showNotice("실사보고서 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return null;
  }
  if (!data) {
    showNotice(
      `「${propertyData.title || "매물"}」에 대한 실사보고서가 아직 등록되지 않았습니다. 관리자에게 등록을 요청하거나 다른 매물을 선택해 주세요.`
    );
    setText("dd-title", propertyData.title || "-");
    setText("dd-location", propertyData.location || "-");
    return null;
  }

  setText("dd-title", propertyData.title || "-");
  setText("dd-location", propertyData.location || "-");
  setText("dd-updated-at", toDateText(data.updated_at));
  setText("dd-land-rights", data.land_rights);
  setText("dd-investment-period", data.investment_period);
  setText("dd-roi", data.target_roi != null ? `${data.target_roi}%` : "-");
  setText("dd-investment-period-metric", data.investment_period);
  setText("dd-land-rights-metric", data.land_rights);

  setText("dd-metric-sub-roi", data.metric_sub_roi);
  setText("dd-metric-sub-period", data.metric_sub_period);
  setText("dd-metric-sub-rights", data.metric_sub_land);

  setText("dd-trust-grade", data.trust_grade);
  setText("dd-trust-note", data.trust_note);

  setText("dd-cert-badge", data.legal_chip);
  setText("dd-chip-financial", data.financial_chip);
  setText("dd-chip-location", data.location_chip);

  const sertifikat = data.legal_status?.sertifikat;
  setText("dd-cert", sertifikat);
  setText("dd-legal-sertifikat", sertifikat);
  setText("dd-zoning", data.legal_status?.zoning);
  setText("dd-pbg", data.legal_status?.pbg);
  setText("dd-legal-footnote", data.legal_footnote);

  setText("dd-loc-beach", data.location_data?.beach_min != null ? `${data.location_data.beach_min}분` : "-");
  setText("dd-loc-school", data.location_data?.school_min != null ? `${data.location_data.school_min}분` : "-");
  setText("dd-loc-hospital", data.location_data?.hospital_min != null ? `${data.location_data.hospital_min}분` : "-");
  setText("dd-loc-airport", data.location_data?.airport_min != null ? `${data.location_data.airport_min}분` : "-");
  setText("dd-loc-catalyst", data.location_bullet_1);
  setText("dd-loc-environment", data.location_bullet_2);

  const exitMultiple = data.financial_data?.exit_multiple;
  setText("dd-exit-multiple", exitMultiple ? `예상 매각가 ${exitMultiple}×` : "-");
  setText("dd-risk-level", data.financial_data?.risk_level);
  setText("dd-mini-exit-sub", data.exit_strategy_sub);
  setText("dd-mini-risk-sub", data.risk_memo_sub);

  setText("dd-expert-quote", data.expert_quote);
  setText("dd-expert-quote-footer", data.expert_footer);

  const heroImg = document.getElementById("dd-image");
  const heroUrl = data.hero_image_url || data.cover_image_url || data.image_drone_url || null;
  if (heroImg && heroUrl) {
    heroImg.src = String(heroUrl);
    heroImg.removeAttribute("hidden");
  }

  setMediaFigure(1, data.image_drone_url, "드론 촬영");
  setMediaFigure(2, data.image_site_url, "현장 실사");
  setMediaFigure(3, data.image_boundary_url, "토지 경계");

  const downloadBtn = document.getElementById("download-pdf");
  if (downloadBtn && data.pdf_url) {
    downloadBtn.setAttribute("data-pdf-url", data.pdf_url);
  }

  return data;
}

async function initDdReport() {
  bindDdPdfDownload();
  const report = await bindDdReportData();
  initDdRoiChart(report?.financial_data?.roi_projection || []);
  initDdVacancyChart(report?.financial_data?.vacancy_trend || []);
}

document.addEventListener("DOMContentLoaded", () => {
  void initDdReport();
});
