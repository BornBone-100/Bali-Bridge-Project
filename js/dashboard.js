let currentLang = localStorage.getItem("bbLang") || "ko";

function t(key) {
  const dict = window.translations || {};
  return dict[currentLang]?.[key] ?? dict.ko?.[key] ?? key;
}

function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function applyDashboardTranslations() {
  setTextById("dash-nav-home", t("nav_home"));
  setTextById("dash-nav-assets", t("nav_assets"));
  setTextById("dash-nav-reports", t("nav_reports"));
  setTextById("dash-nav-search", t("nav_search"));
  setTextById("dash-title", t("dash_title"));
  setTextById("dash-subtitle", t("dash_subtitle"));
  setTextById("dash-stat1-label", t("dash_stat1_label"));
  setTextById("dash-stat1-sub", t("dash_stat1_sub"));
  setTextById("dash-stat2-label", t("dash_stat2_label"));
  setTextById("dash-stat2-sub", t("dash_stat2_sub"));
  setTextById("dash-stat3-label", t("dash_stat3_label"));
  setTextById("dash-stat3-sub", t("dash_stat3_sub"));
  setTextById("dash-stat4-label", t("dash_stat4_label"));
  setTextById("dash-stat4-sub", t("dash_stat4_sub"));
  setTextById("dash-chart-title", t("dash_chart_title"));
  setTextById("dash-chart-desc", t("dash_chart_desc"));
  setTextById("dash-dd-link", t("dash_dd_link"));
  setTextById("dash-chart-region-title", t("dash_chart_region_title"));
  setTextById("dash-chart-monthly-title", t("dash_chart_monthly_title"));
  setTextById("dash-timeline-title", t("dash_timeline_title"));
  setTextById("dash-timeline-desc", t("dash_timeline_desc"));
  setTextById("dash-open-dd-btn", t("dash_open_dd_btn"));
  setTextById("dd-download", t("dash_pdf_download"));
  setTextById("dash-reco-title", t("dash_reco_title"));
  setTextById("dash-reco-desc", t("dash_reco_desc"));
  setTextById("dash-more-props-link", t("dash_more_props"));
}

function applyLangButtonState() {
  const koBtn = document.getElementById("dash-lang-ko");
  const enBtn = document.getElementById("dash-lang-en");
  if (koBtn) {
    koBtn.style.backgroundColor = currentLang === "ko" ? "#fff" : "transparent";
    koBtn.style.color = currentLang === "ko" ? "#111827" : "#6B7280";
    koBtn.setAttribute("aria-pressed", currentLang === "ko" ? "true" : "false");
  }
  if (enBtn) {
    enBtn.style.backgroundColor = currentLang === "en" ? "#fff" : "transparent";
    enBtn.style.color = currentLang === "en" ? "#111827" : "#6B7280";
    enBtn.setAttribute("aria-pressed", currentLang === "en" ? "true" : "false");
  }
}

function bindDashboardLanguageToggle() {
  const koBtn = document.getElementById("dash-lang-ko");
  const enBtn = document.getElementById("dash-lang-en");
  if (koBtn) {
    koBtn.addEventListener("click", () => {
      currentLang = "ko";
      localStorage.setItem("bbLang", currentLang);
      applyDashboardTranslations();
      applyLangButtonState();
    });
  }
  if (enBtn) {
    enBtn.addEventListener("click", () => {
      currentLang = "en";
      localStorage.setItem("bbLang", currentLang);
      applyDashboardTranslations();
      applyLangButtonState();
    });
  }
}

function currencyUsd(v) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);
  } catch (_) {
    return `$${v}`;
  }
}

function initRegionGrowthChart() {
  const el = document.getElementById("regionGrowthChart");
  if (!el || typeof Chart === "undefined") return null;

  const ctx = el.getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["짱구", "울루와투", "우붓", "세미냑"],
      datasets: [
        {
          label: "연간 지가 상승률(추정)",
          data: [14.2, 11.1, 8.6, 9.4],
          backgroundColor: [
            "rgba(0, 184, 148, 0.25)",
            "rgba(9, 132, 227, 0.22)",
            "rgba(45, 52, 54, 0.18)",
            "rgba(30, 58, 95, 0.18)",
          ],
          borderColor: ["#00b894", "#0984e3", "#2d3436", "#1e3a5f"],
          borderWidth: 1.5,
          borderRadius: 10,
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
            label: (c) => `${c.parsed.y}%`,
          },
        },
      },
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

function initMonthlyDividendChart() {
  const el = document.getElementById("monthlyDividendChart");
  if (!el || typeof Chart === "undefined") return null;

  const ctx = el.getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
      datasets: [
        {
          label: "월별 예상 배당(순수익)",
          data: [5200, 5000, 5600, 6100, 6400, 6800, 7200, 7600, 6900, 6300, 5800, 5400],
          borderColor: "rgba(0, 184, 148, 0.95)",
          backgroundColor: "rgba(0, 184, 148, 0.18)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
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
            label: (c) => currencyUsd(c.parsed.y),
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => (Number(v) >= 1000 ? `$${Math.round(Number(v) / 1000)}k` : `$${v}`),
          },
          grid: { color: "rgba(45, 52, 54, 0.08)" },
        },
        x: { grid: { display: false } },
      },
    },
  });
}

function renderDdTimeline() {
  const root = document.getElementById("dd-timeline");
  if (!root) return;

  const items = [
    {
      date: "2026.05.07",
      title: "Canggu A-1 법률 검토 완료",
      detail: "Sertifikat 유효성/분쟁 여부 확인 완료",
      status: "good",
    },
    {
      date: "2026.05.06",
      title: "Uluwatu B-3 현장 소음 측정 업데이트",
      detail: "평균 48dB (야간), 주변 공사 1곳",
      status: "info",
    },
    {
      date: "2026.05.05",
      title: "Canggu A-1 PBG 승인 대기",
      detail: "예상 소요 2~3주(변동 가능)",
      status: "warn",
    },
  ];

  root.innerHTML = items
    .map((it) => {
      const tone =
        it.status === "good" ? "bbdash-dot--good" : it.status === "warn" ? "bbdash-dot--warn" : "bbdash-dot--info";
      return `
        <div class="bbdash-timeline-item">
          <div class="bbdash-dot ${tone}" aria-hidden="true"></div>
          <div class="bbdash-timeline-body">
            <div class="bbdash-timeline-top">
              <strong>${it.title}</strong>
              <span>${it.date}</span>
            </div>
            <p>${it.detail}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRecommendedProperties() {
  const root = document.getElementById("property-grid");
  if (!root) return;

  const list = [
    {
      name: "Canggu Luxury Villa A-1",
      location: "📍 Canggu · Batu Bolong",
      pricePerPyeong: "$4,800 /m²",
      tag: "고수요",
    },
    {
      name: "Uluwatu Cliffside Retreat B-3",
      location: "📍 Uluwatu · Pecatu",
      pricePerPyeong: "$4,100 /m²",
      tag: "뷰 프리미엄",
    },
    {
      name: "Ubud Eco Boutique C-2",
      location: "📍 Ubud · Tegallalang",
      pricePerPyeong: "$3,200 /m²",
      tag: "장기수요",
    },
  ];

  root.innerHTML = list
    .map((p) => {
      const initials = p.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return `
        <article class="bbdash-prop">
          <div class="bbdash-prop-media" aria-hidden="true">
            <span>${initials}</span>
          </div>
          <div class="bbdash-prop-body">
            <div class="bbdash-prop-top">
              <h3>${p.name}</h3>
              <span class="bbdash-prop-tag">${p.tag}</span>
            </div>
            <p class="bbdash-prop-loc">${p.location}</p>
            <div class="bbdash-prop-meta">
              <span>평단가</span>
              <strong>${p.pricePerPyeong}</strong>
            </div>
            <div class="bbdash-prop-actions">
              <a class="bbdash-mini-btn" href="./dd-report.html">DD 보기</a>
              <a class="bbdash-mini-btn bbdash-mini-btn--primary" href="./index.html">매물 상세</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function bindPdfDownload() {
  const btn = document.getElementById("dd-download");
  if (!btn) return;
  btn.addEventListener("click", () => window.print());
}

function initDashboard() {
  applyDashboardTranslations();
  bindDashboardLanguageToggle();
  applyLangButtonState();
  initRegionGrowthChart();
  initMonthlyDividendChart();
  renderDdTimeline();
  renderRecommendedProperties();
  bindPdfDownload();
}

document.addEventListener("DOMContentLoaded", initDashboard);

