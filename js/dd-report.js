import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

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
          ticks: {
            callback: (v) => `${v}%`,
          },
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
  if (el && value !== undefined && value !== null && value !== "") el.textContent = String(value);
}

function clearReportFields() {
  setText("dd-title", "실사보고서 데이터 없음");
  setText("dd-updated-at", "-");
  setText("dd-land-rights", "-");
  setText("dd-investment-period", "-");
  setText("dd-target-roi", "-");
  setText("dd-investment-period-metric", "-");
  setText("dd-land-rights-metric", "-");
  setText("dd-legal-sertifikat", "-");
  setText("dd-legal-zoning", "-");
  setText("dd-legal-pbg", "-");
  setText("dd-loc-beach", "-");
  setText("dd-loc-school", "-");
  setText("dd-loc-hospital", "-");
  setText("dd-loc-airport", "-");
  setText("dd-exit-multiple", "-");
  setText("dd-risk-level", "-");
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
  if (!v) return "";
  return String(v).slice(0, 10).replaceAll("-", ".");
}

async function bindDdReportData() {
  clearReportFields();

  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    showNotice("로그인이 필요한 실사보고서입니다. 로그인 후 다시 열어주세요.");
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const propertyId = Number(params.get("propertyId") || 1);

  const { data: propertyData } = await supabase
    .from("properties")
    .select("id,title,location")
    .eq("id", propertyId)
    .maybeSingle();

  const { data, error } = await supabase.from("dd_reports").select("*").eq("property_id", propertyId).maybeSingle();
  if (error) {
    console.error("dd_reports 조회 에러:", error);
    showNotice("실사보고서 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return null;
  }
  if (!data) {
    showNotice(`propertyId=${propertyId}에 해당하는 실사보고서가 아직 등록되지 않았습니다.`);
    return null;
  }

  if (propertyData?.title) {
    setText("dd-title", propertyData.title);
  }

  setText("dd-updated-at", toDateText(data.updated_at));
  setText("dd-land-rights", data.land_rights || "-");
  setText("dd-investment-period", data.investment_period || "-");
  setText("dd-target-roi", data.target_roi != null ? `${data.target_roi}%` : "-");
  setText("dd-investment-period-metric", data.investment_period || "-");
  setText("dd-land-rights-metric", data.land_rights || "-");

  setText("dd-legal-sertifikat", data.legal_status?.sertifikat || "-");
  setText("dd-legal-zoning", data.legal_status?.zoning || "-");
  setText("dd-legal-pbg", data.legal_status?.pbg || "-");

  setText("dd-loc-beach", data.location_data?.beach_min != null ? `${data.location_data.beach_min}분` : "-");
  setText("dd-loc-school", data.location_data?.school_min != null ? `${data.location_data.school_min}분` : "-");
  setText("dd-loc-hospital", data.location_data?.hospital_min != null ? `${data.location_data.hospital_min}분` : "-");
  setText("dd-loc-airport", data.location_data?.airport_min != null ? `${data.location_data.airport_min}분` : "-");

  const exitMultiple = data.financial_data?.exit_multiple;
  if (exitMultiple) setText("dd-exit-multiple", `예상 매각가 ${exitMultiple}×`);
  if (data.financial_data?.risk_level) setText("dd-risk-level", data.financial_data.risk_level);

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

