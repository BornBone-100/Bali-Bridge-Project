/** dashboard.html에서 `@supabase/supabase-js` CDN을 먼저 로드합니다. (esm.sh 의존 제거 — Vercel/기업망에서 모듈 전체 실패 방지) */
function resolveSupabaseCreateClient() {
  const mod = window.supabase;
  if (mod && typeof mod.createClient === "function") return mod.createClient;
  if (mod && mod.default && typeof mod.default.createClient === "function") return mod.default.createClient;
  return null;
}

let currentLang =
  localStorage.getItem("preferred_language") || localStorage.getItem("bbLang") || "ko";
const dashboardState = {
  userName: "고객",
  totalAsset: 0,
  avgRoi: null,
  activeProjects: 0,
  totalProperties: 0,
  timeline: [],
  marketData: null,
  recommended: [],
  sims: [],
};
let regionGrowthChartInstance = null;
let monthlyDividendChartInstance = null;

function parseRoi(value) {
  if (value == null) return 0;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatAvgRoi(avgRoi) {
  if (avgRoi == null || !Number.isFinite(avgRoi) || avgRoi <= 0) return "-";
  return `${Number(avgRoi.toFixed(1))}%`;
}

function renderUserProfile(user) {
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    (currentLang === "en" ? "Investor" : "투자자");
  setTextById("dash-profile-name", name);
  const avatar = document.getElementById("dash-profile-avatar");
  if (avatar) avatar.textContent = initialsFromName(name);
}

function buildRegionalFromProperties(properties) {
  if (!Array.isArray(properties) || !properties.length) return [];
  return properties
    .slice(0, 6)
    .map((p) => ({
      region: String(p.location || p.title || "-")
        .split(",")[0]
        .trim(),
      rate: parseRoi(p.roi),
    }))
    .filter((g) => g.rate > 0);
}

function buildMonthlyFromSimulations(sims) {
  if (!Array.isArray(sims) || !sims.length) return [];
  const locale = currentLang === "en" ? "en-US" : "ko-KR";
  return [...sims]
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    .map((s) => ({
      month: s.created_at
        ? new Date(s.created_at).toLocaleDateString(locale, { month: "short", day: "numeric" })
        : "-",
      value: Number(s.investment_amount) || 0,
    }));
}

function normalizeMonthlySeries(marketRow, sims) {
  const raw = marketRow?.monthly_dividend ?? marketRow?.monthly_revenue;
  if (Array.isArray(raw) && raw.length) {
    return raw.map((value, i) => ({
      month: currentLang === "en" ? `M${i + 1}` : `${i + 1}월`,
      value: Number(value) || 0,
    }));
  }
  return buildMonthlyFromSimulations(sims);
}

function buildChartMarketData(userMetrics, ownedProperties, sims) {
  const regionalFromDb = userMetrics?.regional_growth;
  const regional_growth =
    Array.isArray(regionalFromDb) && regionalFromDb.length
      ? regionalFromDb
      : buildRegionalFromProperties(ownedProperties);
  const monthly_dividend = normalizeMonthlySeries(userMetrics, sims);
  if (!regional_growth.length && !monthly_dividend.length) return null;
  return { regional_growth, monthly_dividend };
}

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
    if (el.id === "dash-title" || el.id === "dash-profile-name") return;
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
  setTextById("stat-avg-roi", formatAvgRoi(dashboardState.avgRoi));
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
      <div class="bbdash-timeline-empty" role="status">
        <span class="bbdash-timeline-empty-title">${t("dash_timeline_empty_title")}</span>
        <span class="bbdash-timeline-empty-sep" aria-hidden="true">·</span>
        <span class="bbdash-timeline-empty-desc">${t("dash_timeline_empty_desc")}</span>
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

/** index/script.js 가 보는 레거시 로그인 플래그 — Supabase signOut 만으로는 지워지지 않아 루프 유발 방지 */
function clearLegacyClientAuth() {
  try {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("baliBridgeAuth");
    sessionStorage.removeItem("baliInvestorName");
  } catch (_) {}
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
    } catch (error) {
      console.error("로그아웃 에러:", error);
      alert(currentLang === "en" ? "A problem occurred while signing out." : "로그아웃 중 문제가 발생했습니다.");
      return;
    }
    try {
      sessionStorage.removeItem("bb_guest_dashboard");
    } catch (_) {}
    clearLegacyClientAuth();
    window.location.href = "./index.html#login";
  });
}

async function resolveDashboardSession(supabase) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (session && !sessionError) {
    return { session, error: null };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (user && !userError) {
    const {
      data: { session: refreshed },
    } = await supabase.auth.getSession();
    if (refreshed) return { session: refreshed, error: null };
  }

  return { session: null, error: sessionError || userError };
}

async function fetchDashboardSummary() {
  const totalAssetEl = document.getElementById("stat-total-asset");
  const avgRoiEl = document.getElementById("stat-avg-roi");
  const activeProjectsEl = document.getElementById("stat-active-projects");
  const totalPropertiesEl = document.getElementById("stat-total-properties");

  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();

  if (!url || !key) {
    console.warn("Supabase browser env is missing.");
    return { supabase: null, session: null, userId: null };
  }

  const createClient = resolveSupabaseCreateClient();
  if (!createClient) {
    console.warn("Supabase JS CDN이 로드되지 않았습니다. dashboard.html의 @supabase/supabase-js 스크립트 순서를 확인하세요.");
    return { supabase: null, session: null, userId: null };
  }

  const supabase = createClient(url, key);
  const { session, error: authError } = await resolveDashboardSession(supabase);

  if (authError || !session) {
    const allowGuest = sessionStorage.getItem("bb_guest_dashboard") === "1";
    if (!allowGuest) {
      window.location.href = "./index.html#login";
      return { supabase, session: null, userId: null };
    }
    dashboardState.userName = currentLang === "en" ? "Guest" : "고객";
    dashboardState.totalAsset = 0;
    dashboardState.avgRoi = null;
    dashboardState.activeProjects = 0;
    dashboardState.totalProperties = 0;
    setTextById("dash-title", getWelcomeTitle(dashboardState.userName));
    setTextById("dash-profile-name", dashboardState.userName);
    const avatar = document.getElementById("dash-profile-avatar");
    if (avatar) avatar.textContent = initialsFromName(dashboardState.userName);
    if (totalAssetEl) totalAssetEl.textContent = currencyUsd(0);
    if (avgRoiEl) avgRoiEl.textContent = "-";
    if (activeProjectsEl) activeProjectsEl.textContent = formatCount(0, "dash_cases_suffix");
    if (totalPropertiesEl) totalPropertiesEl.textContent = formatCount(0, "dash_props_suffix");
    return { supabase, session: null, userId: null };
  }

  const user = session.user;
  sessionStorage.removeItem("bb_guest_dashboard");
  const name = user.user_metadata?.full_name || user.user_metadata?.name || "고객";
  dashboardState.userName = name;
  setTextById("dash-title", getWelcomeTitle(name));
  renderUserProfile(user);

  const { data: sims, error: simsError } = await supabase
    .from("profit_simulations")
    .select("investment_amount,calculated_roi,created_at")
    .eq("user_id", user.id);

  if (simsError) console.error("profit_simulations 조회 에러:", simsError);

  const simRows = sims || [];
  dashboardState.sims = simRows;

  let totalFromSims = 0;
  let roiSum = 0;
  let roiCount = 0;
  simRows.forEach((s) => {
    totalFromSims += Number(s.investment_amount) || 0;
    const r = parseRoi(s.calculated_roi);
    if (r > 0) {
      roiSum += r;
      roiCount += 1;
    }
  });

  const { data: assetData, error: dbError } = await supabase
    .from("user_assets")
    .select("total_asset, active_projects, total_properties")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dbError && dbError.code !== "PGRST116") {
    console.error("user_assets 조회 에러:", dbError);
  }

  const totalAsset = totalFromSims > 0 ? totalFromSims : assetData?.total_asset || 0;
  const avgRoi = roiCount > 0 ? roiSum / roiCount : null;

  dashboardState.totalAsset = totalAsset;
  dashboardState.avgRoi = avgRoi;

  if (totalAssetEl) totalAssetEl.textContent = currencyUsd(totalAsset);
  if (avgRoiEl) avgRoiEl.textContent = formatAvgRoi(avgRoi);

  return { supabase, session, userId: user.id };
}

async function fetchDashboardWidgets(supabase, userId) {
  if (!supabase || !userId) return { timeline: [], marketData: null, ownedProperties: [] };

  const { data: ownedProperties, error: propsError } = await supabase
    .from("properties")
    .select("id,title,location,price,price_usd,roi,tags,created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (propsError) console.error("내 매물 조회 에러:", propsError);

  const props = ownedProperties || [];
  const propertyIds = props.map((p) => p.id).filter((id) => id != null);

  let timeline = [];
  if (propertyIds.length) {
    const { data: timelineData, error: timelineError } = await supabase
      .from("dd_timeline")
      .select("*")
      .in("property_id", propertyIds)
      .order("event_date", { ascending: false })
      .limit(5);
    if (timelineError) console.error("dd_timeline 조회 에러:", timelineError);
    timeline = timelineData || [];
  }

  let userMetrics = null;
  const { data: metricsByUser, error: metricsUserError } = await supabase
    .from("market_metrics")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!metricsUserError && metricsByUser) {
    userMetrics = metricsByUser;
  }

  const ongoingCount = timeline.filter((t) => t.status !== "completed").length;
  dashboardState.activeProjects = ongoingCount;
  dashboardState.totalProperties = props.length;

  const marketData = buildChartMarketData(userMetrics, props, dashboardState.sims);

  return { timeline, marketData, ownedProperties: props };
}

async function fetchRecommendedProperties(ownedProperties) {
  if (!Array.isArray(ownedProperties) || !ownedProperties.length) return [];

  return ownedProperties.slice(0, 3).map((row) => {
    const title = String(row.title || "");
    const location = `📍 ${String(row.location || "-")}`;
    const price = row.price_usd ?? row.price;
    const pricePerPyeong =
      price == null
        ? "-"
        : /^\$/.test(String(price))
          ? String(price)
          : `$${Number(String(price).replace(/[^0-9.]/g, "") || 0).toLocaleString("en-US")}`;
    const tag = Array.isArray(row.tags) && row.tags.length ? String(row.tags[0]) : t("dash_prop_tag_own");
    return { id: row.id, name: title, location, pricePerPyeong, tag };
  });
}

async function initDashboard() {
  // 데이터 로딩 전에 언어 UI를 먼저 바인딩 (await 중 예외·리다이렉트 지연 시에도 KOR/ENG 동작)
  bindDashboardLanguageToggle();
  applyLangButtonState();
  applyDashboardTranslations();

  const { supabase, userId } = await fetchDashboardSummary();
  const { timeline, marketData, ownedProperties } = await fetchDashboardWidgets(supabase, userId);
  const recommended = await fetchRecommendedProperties(ownedProperties);
  dashboardState.timeline = timeline;
  dashboardState.marketData = marketData;
  dashboardState.recommended = recommended;
  applyDashboardTranslations();
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
 * - 로그아웃·비로그인 진입: ./index.html#login (구글 로그인 영역으로 스크롤, bind-google-login.js)
 * - 마스터 키 welcome, subtitle, total_investment, ongoing_dd, logout_btn 은 translations.js에 별칭으로 추가됨.
 */
