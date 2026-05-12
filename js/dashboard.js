let cachedCreateClient = null;
async function getCreateClient() {
  if (!cachedCreateClient) {
    const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.3/+esm");
    cachedCreateClient = mod.createClient;
  }
  return cachedCreateClient;
}

let currentLang = localStorage.getItem("bbLang") || "ko";
let dashboardLangToggleBound = false;
let dashboardLogoutBound = false;
const dashboardState = {
  userName: "고객",
  totalAsset: 0,
  activeProjects: 0,
  totalProperties: 0,
  timeline: [],
  marketData: null,
  recommended: [],
};
let regionGrowthChartInstance = null;
let monthlyDividendChartInstance = null;

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
  setTextById("dash-nav-agent", t("nav_agent"));
  setTextById("dash-title", getWelcomeTitle(dashboardState.userName));
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
  setTextById("dash-register-btn", t("dash_register_btn"));
  setTextById("dashboard-logout-btn", t("dash_logout"));
  setTextById("dash-sideback", t("dash_sideback"));
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
  if (dashboardLangToggleBound) return;
  dashboardLangToggleBound = true;
  const koBtn = document.getElementById("dash-lang-ko");
  const enBtn = document.getElementById("dash-lang-en");
  if (koBtn) {
    koBtn.addEventListener("click", () => {
      currentLang = "ko";
      localStorage.setItem("bbLang", currentLang);
      applyDashboardTranslations();
      renderLocalizedSections();
      applyLangButtonState();
    });
  }
  if (enBtn) {
    enBtn.addEventListener("click", () => {
      currentLang = "en";
      localStorage.setItem("bbLang", currentLang);
      applyDashboardTranslations();
      renderLocalizedSections();
      applyLangButtonState();
    });
  }
}

function getWelcomeTitle(name) {
  return currentLang === "en" ? `Welcome back, ${name}` : `환영합니다, ${name}님`;
}

function formatCount(value, suffixKey) {
  return `${value}${t(suffixKey)}`;
}

function renderLocalizedSections() {
  setTextById("stat-total-asset", currencyUsd(dashboardState.totalAsset));
  setTextById("stat-active-projects", formatCount(dashboardState.activeProjects, "dash_cases_suffix"));
  setTextById("stat-total-properties", formatCount(dashboardState.totalProperties, "dash_props_suffix"));
  initRegionGrowthChart(dashboardState.marketData?.regional_growth);
  initMonthlyDividendChart(dashboardState.marketData?.monthly_dividend);
  renderDdTimeline(dashboardState.timeline);
  renderRecommendedProperties(dashboardState.recommended);
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

function initRegionGrowthChart(regionalGrowth = null) {
  const el = document.getElementById("regionGrowthChart");
  if (!el || typeof Chart === "undefined") return null;

  const growth = Array.isArray(regionalGrowth) ? regionalGrowth : [];

  const ctx = el.getContext("2d");
  if (regionGrowthChartInstance) {
    regionGrowthChartInstance.destroy();
  }
  regionGrowthChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: growth.map((g) => g.region),
      datasets: [
        {
          label: t("dash_chart_label_growth"),
          data: growth.map((g) => Number(g.rate) || 0),
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
  return regionGrowthChartInstance;
}

function initMonthlyDividendChart(monthlyDividend = null) {
  const el = document.getElementById("monthlyDividendChart");
  if (!el || typeof Chart === "undefined") return null;

  const monthly = Array.isArray(monthlyDividend) ? monthlyDividend : [];

  const ctx = el.getContext("2d");
  if (monthlyDividendChartInstance) {
    monthlyDividendChartInstance.destroy();
  }
  monthlyDividendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: monthly.map((m) => m.month),
      datasets: [
        {
          label: t("dash_chart_label_dividend"),
          data: monthly.map((m) => Number(m.value) || 0),
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
  return monthlyDividendChartInstance;
}

function renderDdTimeline(timelineData = null) {
  const root = document.getElementById("dd-timeline");
  if (!root) return;

  const items = Array.isArray(timelineData)
    ? timelineData.map((it) => ({
        date: String(it.event_date || "").replaceAll("-", "."),
        title: it.title || "업데이트",
        detail: it.description || "",
        status: it.status || "pending",
      }))
    : [];

  if (!items.length) {
    root.innerHTML = `
      <div class="bbdash-timeline-item">
        <div class="bbdash-timeline-body">
          <div class="bbdash-timeline-top">
            <strong>${t("dash_timeline_empty_title")}</strong>
          </div>
          <p>${t("dash_timeline_empty_desc")}</p>
        </div>
      </div>
    `;
    return;
  }

  root.innerHTML = items
    .map((it) => {
      const tone =
        it.status === "completed"
          ? "bbdash-dot--good"
          : it.status === "in_progress"
          ? "bbdash-dot--info"
          : "bbdash-dot--warn";
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

function renderRecommendedProperties(list = []) {
  const root = document.getElementById("property-grid");
  if (!root) return;
  if (!Array.isArray(list) || !list.length) {
    root.innerHTML = `
      <article class="bbdash-prop">
        <div class="bbdash-prop-body">
          <div class="bbdash-prop-top">
            <h3>${t("dash_reco_empty_title")}</h3>
          </div>
          <p class="bbdash-prop-loc">${t("dash_reco_empty_desc")}</p>
        </div>
      </article>
    `;
    return;
  }

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
              <span>${t("dash_prop_avg_price")}</span>
              <strong>${p.pricePerPyeong}</strong>
            </div>
            <div class="bbdash-prop-actions">
              <a class="bbdash-mini-btn" href="./dd-report.html?propertyId=${encodeURIComponent(p.id)}">${t("dash_prop_dd_view")}</a>
              <a class="bbdash-mini-btn bbdash-mini-btn--primary" href="./index.html">${t("dash_prop_detail")}</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

let pdfDownloadBound = false;

function bindPdfDownload() {
  const btn = document.getElementById("dd-download");
  if (!btn || pdfDownloadBound) return;
  pdfDownloadBound = true;
  btn.addEventListener("click", () => window.print());
}

function bindDashboardLogout(supabase) {
  const btn = document.getElementById("dashboard-logout-btn");
  if (!btn || dashboardLogoutBound) return;
  dashboardLogoutBound = true;
  btn.addEventListener("click", async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("로그아웃 에러:", error);
    } finally {
      sessionStorage.removeItem("bb_guest_dashboard");
      window.location.href = "./index.html";
    }
  });
}

async function fetchDashboardSummary() {
  const titleEl = document.getElementById("dashboard-user-title");
  const totalAssetEl = document.getElementById("stat-total-asset");
  const activeProjectsEl = document.getElementById("stat-active-projects");
  const totalPropertiesEl = document.getElementById("stat-total-properties");

  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();

  if (!url || !key) {
    console.warn("Supabase browser env is missing.");
    return { supabase: null, session: null };
  }

  const createClient = await getCreateClient();
  const supabase = createClient(url, key);
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    // "서비스 대시보드 바로가기(임시)" 버튼으로 온 경우에만 비로그인 진입 허용
    const allowGuest = sessionStorage.getItem("bb_guest_dashboard") === "1";
    if (!allowGuest) {
      window.location.href = "./index.html";
      return { supabase, session: null };
    }
    dashboardState.userName = currentLang === "en" ? "Guest" : "고객";
    dashboardState.totalAsset = 0;
    dashboardState.activeProjects = 0;
    dashboardState.totalProperties = 0;
    if (titleEl) titleEl.textContent = getWelcomeTitle(dashboardState.userName);
    if (totalAssetEl) totalAssetEl.textContent = currencyUsd(0);
    if (activeProjectsEl) activeProjectsEl.textContent = formatCount(0, "dash_cases_suffix");
    if (totalPropertiesEl) totalPropertiesEl.textContent = formatCount(0, "dash_props_suffix");
    return { supabase, session: null };
  }

  const user = session.user;
  sessionStorage.removeItem("bb_guest_dashboard");
  const name = user.user_metadata?.full_name || user.user_metadata?.name || "고객";
  dashboardState.userName = name;
  if (titleEl) titleEl.textContent = getWelcomeTitle(name);

  const { data: assetData, error: dbError } = await supabase
    .from("user_assets")
    .select("total_asset, active_projects, total_properties")
    .eq("user_id", user.id)
    .single();

  if (dbError && dbError.code !== "PGRST116") {
    console.error("user_assets 조회 에러:", dbError);
  }

  const totalAsset = assetData?.total_asset || 0;
  const activeProjects = assetData?.active_projects || 0;
  const totalProperties = assetData?.total_properties || 0;
  dashboardState.totalAsset = totalAsset;
  dashboardState.activeProjects = activeProjects;
  dashboardState.totalProperties = totalProperties;

  if (totalAssetEl) totalAssetEl.textContent = currencyUsd(totalAsset);
  if (activeProjectsEl) activeProjectsEl.textContent = formatCount(activeProjects, "dash_cases_suffix");
  if (totalPropertiesEl) totalPropertiesEl.textContent = formatCount(totalProperties, "dash_props_suffix");
  return { supabase, session };
}

async function fetchDashboardWidgets(supabase) {
  if (!supabase) return { timeline: [], marketData: null };
  try {
    const { data: timelineData } = await supabase
      .from("dd_timeline")
      .select("*")
      .order("event_date", { ascending: false })
      .limit(5);

    const { data: metricsData } = await supabase.from("market_metrics").select("*").eq("id", 1).maybeSingle();

    return { timeline: timelineData || [], marketData: metricsData || null };
  } catch (error) {
    console.error("위젯 데이터 로딩 에러:", error);
    return { timeline: [], marketData: null };
  }
}

async function fetchRecommendedProperties(supabase) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("id,title,location,price,roi,tags")
      .order("roi", { ascending: false })
      .limit(3);
    if (error) {
      console.error("추천 매물 조회 에러:", error);
      return [];
    }

    return (data || []).map((row) => {
      const title = String(row.title || "");
      const location = `📍 ${String(row.location || "-")}`;
      const price = row.price == null ? "-" : String(row.price);
      const pricePerPyeong = /^\$/.test(price) ? price : `$${Number(String(price).replace(/[^0-9.]/g, "") || 0).toLocaleString("en-US")}`;
      const tag = Array.isArray(row.tags) && row.tags.length ? String(row.tags[0]) : "매물";
      return { id: row.id, name: title, location, pricePerPyeong, tag };
    });
  } catch (error) {
    console.error("추천 매물 조회 에러:", error);
    return [];
  }
}

async function initDashboard() {
  currentLang = localStorage.getItem("bbLang") || "ko";
  bindDashboardLanguageToggle();
  applyLangButtonState();
  applyDashboardTranslations();

  let supabase = null;
  try {
    const summary = await fetchDashboardSummary();
    supabase = summary?.supabase ?? null;
    const { timeline, marketData } = await fetchDashboardWidgets(supabase);
    const recommended = await fetchRecommendedProperties(supabase);
    dashboardState.timeline = timeline;
    dashboardState.marketData = marketData;
    dashboardState.recommended = recommended;
    applyDashboardTranslations();
    applyLangButtonState();
    renderLocalizedSections();
    bindPdfDownload();
    bindDashboardLogout(supabase);
  } catch (err) {
    console.error("대시보드 초기화 오류:", err);
    applyDashboardTranslations();
    applyLangButtonState();
    bindPdfDownload();
    bindDashboardLogout(supabase);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  void initDashboard();
});

