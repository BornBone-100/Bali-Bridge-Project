import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

let currentLang =
  localStorage.getItem("preferred_language") || localStorage.getItem("bbLang") || "ko";
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
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    if (el.id === "dash-title") return;
    el.textContent = t(key);
  });
  setTextById("dash-title", getWelcomeTitle(dashboardState.userName));
}

function applyLangButtonState() {
  const koBtn = document.getElementById("btn-kor");
  const enBtn = document.getElementById("btn-eng");
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

/** preferred_language(마스터 스펙) ↔ bbLang(기존) 동기 */
function setLanguage(lang) {
  const normalized = lang === "en" ? "en" : "ko";
  localStorage.setItem("preferred_language", normalized);
  localStorage.setItem("bbLang", normalized);
  currentLang = normalized;
  applyDashboardTranslations();
  renderLocalizedSections();
  applyLangButtonState();
}

function bindDashboardLanguageToggle() {
  const koBtn = document.getElementById("btn-kor");
  const enBtn = document.getElementById("btn-eng");
  if (koBtn) koBtn.addEventListener("click", () => setLanguage("ko"));
  if (enBtn) enBtn.addEventListener("click", () => setLanguage("en"));
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

function bindPdfDownload() {
  const btn = document.getElementById("dd-download");
  if (!btn) return;
  btn.addEventListener("click", () => window.print());
}

function bindDashboardLogout(supabase) {
  const btn = document.getElementById("btn-logout");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      alert(currentLang === "en" ? "You have been signed out securely." : "안전하게 로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 에러:", error);
      alert(currentLang === "en" ? "A problem occurred while signing out." : "로그아웃 중 문제가 발생했습니다.");
      return;
    } finally {
      sessionStorage.removeItem("bb_guest_dashboard");
    }
    window.location.href = "./index.html";
  });
}

async function fetchDashboardSummary() {
  const totalAssetEl = document.getElementById("stat-total-asset");
  const activeProjectsEl = document.getElementById("stat-active-projects");
  const totalPropertiesEl = document.getElementById("stat-total-properties");

  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();

  if (!url || !key) {
    console.warn("Supabase browser env is missing.");
    return { supabase: null, session: null };
  }

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
    setTextById("dash-title", getWelcomeTitle(dashboardState.userName));
    if (totalAssetEl) totalAssetEl.textContent = currencyUsd(0);
    if (activeProjectsEl) activeProjectsEl.textContent = formatCount(0, "dash_cases_suffix");
    if (totalPropertiesEl) totalPropertiesEl.textContent = formatCount(0, "dash_props_suffix");
    return { supabase, session: null };
  }

  const user = session.user;
  sessionStorage.removeItem("bb_guest_dashboard");
  const name = user.user_metadata?.full_name || user.user_metadata?.name || "고객";
  dashboardState.userName = name;
  setTextById("dash-title", getWelcomeTitle(name));

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
  const { supabase } = await fetchDashboardSummary();
  const { timeline, marketData } = await fetchDashboardWidgets(supabase);
  const recommended = await fetchRecommendedProperties(supabase);
  dashboardState.timeline = timeline;
  dashboardState.marketData = marketData;
  dashboardState.recommended = recommended;
  applyDashboardTranslations();
  bindDashboardLanguageToggle();
  applyLangButtonState();
  renderLocalizedSections();
  bindPdfDownload();
  bindDashboardLogout(supabase);
}

document.addEventListener("DOMContentLoaded", () => {
  void initDashboard();
});

/*
 * 2단계 마스터(로그아웃·i18n) 통합 안내
 * - 별도 `const translations` / 두 번째 DOMContentLoaded는 넣지 않음(기존 translations.js·initDashboard와 충돌).
 * - 언어: setLanguage()가 preferred_language + bbLang을 동기화하고 applyDashboardTranslations·차트·타임라인을 갱신.
 * - 로그아웃: bindDashboardLogout(supabase)에서 signOut → 알림 → ./index.html (마스터의 /login.html 대신).
 * - 마스터 키 welcome, subtitle, total_investment, ongoing_dd, logout_btn 은 translations.js에 별칭으로 추가됨.
 */
