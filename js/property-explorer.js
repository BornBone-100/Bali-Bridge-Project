let PROPERTY_DATA = [];
let dataSource = "supabase";

function resolveSupabaseCreateClient() {
  const mod = window.supabase;
  if (mod && typeof mod.createClient === "function") return mod.createClient;
  if (mod && mod.default && typeof mod.default.createClient === "function") return mod.default.createClient;
  return null;
}
function getSavedLang() {
  const saved =
    localStorage.getItem("preferred_language") || localStorage.getItem("bbLang") || "ko";
  return saved === "en" ? "en" : "ko";
}

let currentLang = getSavedLang();

const i18n = window.translations || {
  ko: {
    nav_dashboard: "대시보드 홈",
    nav_vault: "나의 투자 자산",
    nav_dd: "실사 보고서(DD)",
    nav_explore: "신규 매물 탐색",
    nav_settings: "설정(에이전트)",
    search_title: "신규 매물 탐색",
    title_explore: "신규 매물 탐색",
    search_desc:
      "Bali Bridge의 엄격한 실사(DD)를 거친 프리미엄 투자 자산을 확인하세요.",
    desc_explore:
      "Bali Bridge의 엄격한 실사(DD)를 거친 프리미엄 투자 자산을 확인하세요.",
    explore_doc_title: "[Bali Bridge] 신규 매물 탐색",
    filter_all: "모든 지역",
    filter_roi: "예상 수익률(ROI)",
    filter_price: "투자 금액대",
    filter_dd: "실사 상태",
    btn_apply: "검색 적용",
    card_roi: "예상 ROI",
    card_price: "최소 투자 금액",
    loading: "데이터 로딩 중...",
    empty_results: "조건에 맞는 매물이 없습니다. 필터를 조정해 주세요.",
    dd_done: "실사 완료/법률 검토 완료",
    dd_progress: "진행 중",
    dd_scheduled: "실사 예정",
    dd_badge_done: "법률 검토 완료 (AAA)",
    dd_badge_progress: "건축 허가 진행 중",
    dd_badge_scheduled: "실사 예정",
    source_supabase: "연동: Supabase `properties` 테이블 (실시간)",
    source_demo: "데이터 연결이 비활성화되었습니다. Supabase 환경값을 확인해 주세요.",
    dash_sideback: "← 홈으로",
  },
  en: {
    nav_dashboard: "Dashboard Home",
    nav_vault: "My Investment Vault",
    nav_dd: "DD Reports",
    nav_explore: "Property Explorer",
    nav_settings: "Settings (Agent)",
    search_title: "Property Explorer",
    title_explore: "Property Explorer",
    search_desc:
      "Explore premium investment assets with strict due diligence by Bali Bridge.",
    desc_explore:
      "Discover premium investment assets vetted by Bali Bridge's strict DD.",
    explore_doc_title: "[Bali Bridge] Property Explorer",
    filter_all: "All Locations",
    filter_roi: "Expected ROI",
    filter_price: "Investment Range",
    filter_dd: "DD Status",
    btn_apply: "Apply Filter",
    card_roi: "Expected ROI",
    card_price: "Min. Investment",
    loading: "Loading data...",
    empty_results: "No properties match your filters. Please adjust your criteria.",
    dd_done: "DD Complete / Legal Review Done",
    dd_progress: "In Progress",
    dd_scheduled: "Scheduled",
    dd_badge_done: "Legal review completed (AAA)",
    dd_badge_progress: "Building permit in progress",
    dd_badge_scheduled: "DD scheduled",
    source_supabase: "Source: Supabase `properties` table (live)",
    source_demo: "Data connection is disabled. Please check Supabase env values.",
    dash_sideback: "← Home",
  },
};

function t(key) {
  return i18n[currentLang]?.[key] ?? i18n.ko?.[key] ?? key;
}

function getBrowserSupabaseConfig() {
  const url = typeof window !== "undefined" ? window.BB_SUPABASE_URL : "";
  const key = typeof window !== "undefined" ? window.BB_SUPABASE_ANON_KEY : "";
  return url && key ? { url: String(url), key: String(key) } : null;
}

function parsePriceRaw(priceRaw) {
  if (typeof priceRaw === "number" && Number.isFinite(priceRaw)) return priceRaw;
  const n = parseFloat(String(priceRaw || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function inferRegion(location, rowRegion) {
  if (rowRegion) return String(rowRegion).toLowerCase();
  const L = String(location || "").toLowerCase();
  if (L.includes("canggu")) return "canggu";
  if (L.includes("uluwatu")) return "uluwatu";
  if (L.includes("seminyak")) return "seminyak";
  return "canggu";
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === "string" && tags.trim()) {
    try {
      const j = JSON.parse(tags);
      if (Array.isArray(j)) return j.map(String);
    } catch (_) {
      /* ignore */
    }
    return tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function mapDbRow(row) {
  const roiStr = row.roi != null ? String(row.roi) : "";
  const roiNum = parseFloat(roiStr.replace(/[^0-9.]/g, "")) || 0;
  const priceRaw = row.price;
  const priceNum = parsePriceRaw(priceRaw);
  const priceLabel =
    typeof priceRaw === "string" && priceRaw.trim()
      ? priceRaw
      : priceNum
        ? `$${priceNum.toLocaleString("en-US")}`
        : "—";
  const roiLabel =
    roiStr.includes("%") ? roiStr : roiNum ? `${roiNum}%` : "—";

  return {
    id: row.id,
    title: String(row.title ?? ""),
    location: String(row.location ?? ""),
    region: inferRegion(row.location, row.region),
    price: priceNum,
    priceLabel,
    roi: roiNum,
    roiLabel,
    ddStatus: String(row.dd_status ?? row.ddStatus ?? "—"),
    ddType: String(row.dd_type ?? row.ddType ?? "done"),
    tags: normalizeTags(row.tags),
    image: String(row.image_url ?? row.image ?? ""),
  };
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

function filterByRoi(item, roiFilter) {
  if (roiFilter === "all") return true;
  if (roiFilter === "high") return item.roi >= 14;
  if (roiFilter === "mid") return item.roi >= 12 && item.roi < 14;
  if (roiFilter === "low") return item.roi < 12;
  return true;
}

function filterByBudget(item, budgetFilter) {
  if (budgetFilter === "all") return true;
  if (budgetFilter === "lt700") return item.price < 700000;
  if (budgetFilter === "700to1000")
    return item.price >= 700000 && item.price <= 1000000;
  if (budgetFilter === "gt1000") return item.price > 1000000;
  return true;
}

function getDdBadgeText(prop) {
  if (prop.ddType === "done") return t("dd_badge_done");
  if (prop.ddType === "progress") return t("dd_badge_progress");
  if (prop.ddType === "scheduled") return t("dd_badge_scheduled");
  return prop.ddStatus;
}

function renderProperties(list) {
  const root = document.getElementById("explore-list");
  if (!root) return;

  if (!list.length) {
    root.innerHTML = `<p class="ppex-empty">${escapeHtml(t("empty_results"))}</p>`;
    return;
  }

  root.innerHTML = list
    .map((prop) => {
      const bg = prop.image ? encodeURI(prop.image) : "";
      return `
      <article class="ppex-card">
        <div class="ppex-image" style="background-image:url('${bg.replace(/'/g, "%27")}')">
          <span class="ppex-badge">${escapeHtml(getDdBadgeText(prop))}</span>
        </div>
        <div class="ppex-body">
          <div class="ppex-tags">
            ${prop.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
          </div>
          <h3>${escapeHtml(prop.title)}</h3>
          <p class="ppex-location">📍 ${escapeHtml(prop.location)}</p>
          <div class="ppex-metrics">
            <div>
              <small>${escapeHtml(t("card_roi"))}</small>
              <strong>${escapeHtml(prop.roiLabel)}</strong>
            </div>
            <div>
              <small>${escapeHtml(t("card_price"))}</small>
              <strong>${escapeHtml(prop.priceLabel)}</strong>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function applyFilters() {
  const region = document.getElementById("filter-region")?.value ?? "all";
  const roi = document.getElementById("filter-roi")?.value ?? "all";
  const budget = document.getElementById("filter-budget")?.value ?? "all";
  const dd = document.getElementById("filter-dd")?.value ?? "all";

  const filtered = PROPERTY_DATA.filter((item) => {
    if (region !== "all" && item.region !== region) return false;
    if (!filterByRoi(item, roi)) return false;
    if (!filterByBudget(item, budget)) return false;
    if (dd !== "all" && item.ddType !== dd) return false;
    return true;
  });

  renderProperties(filtered);
}

function setSourceNote() {
  const el = document.getElementById("ppex-source-note");
  if (!el) return;
  if (dataSource === "supabase") {
    el.textContent = t("source_supabase");
    el.hidden = false;
  } else {
    el.textContent = t("source_demo");
    el.hidden = false;
  }
}

function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function syncLangFromStorage(lang) {
  currentLang = lang === "en" ? "en" : "ko";
  document.documentElement.lang = currentLang;
  applyTranslations();
  setSourceNote();
  applyFilters();
}

function applyTranslations() {
  setTextById("nav-home", t("nav_dashboard"));
  setTextById("nav-assets", t("nav_vault"));
  setTextById("nav-reports", t("nav_dd"));
  setTextById("nav-search", t("nav_explore"));
  setTextById("nav-settings", t("nav_settings"));
  setTextById("search-title", t("title_explore"));
  setTextById("search-desc", t("desc_explore"));
  setTextById("filter-all-label", t("filter_all"));
  setTextById("filter-roi-label", t("filter_roi"));
  setTextById("filter-price-label", t("filter_price"));
  setTextById("filter-dd-label", t("filter_dd"));
  setTextById("apply-filter", t("btn_apply"));
  setTextById("roi-high-label", t("roi_high"));
  setTextById("roi-mid-label", t("roi_mid"));
  setTextById("roi-low-label", t("roi_low"));
  setTextById("budget-lt700-label", t("budget_lt700"));
  setTextById("budget-700to1000-label", t("budget_700to1000"));
  setTextById("budget-gt1000-label", t("budget_gt1000"));
  setTextById("dd-done-label", t("dd_done"));
  setTextById("dd-progress-label", t("dd_progress"));
  setTextById("dd-scheduled-label", t("dd_scheduled"));
  setTextById("dash-sideback-label", t("dash_sideback"));

  const sideback = document.querySelector(".bbdash-sideback");
  if (sideback && !document.getElementById("dash-sideback-label")) {
    sideback.textContent = t("dash_sideback");
  }

  const titleKey = document.documentElement.getAttribute("data-i18n-title");
  if (titleKey) {
    const titleText = i18n[currentLang]?.[titleKey] ?? i18n.ko?.[titleKey];
    if (titleText) document.title = titleText;
  }
}

function bindLanguageSync() {
  if (window.__ppexLangSyncBound === "1") return;
  window.__ppexLangSyncBound = "1";
  window.addEventListener("bb:languagechange", (event) => {
    const lang = event.detail?.lang || getSavedLang();
    syncLangFromStorage(lang);
  });
}

async function loadProperties() {
  const root = document.getElementById("explore-list");
  if (root) {
    root.innerHTML = `<p class="ppex-loading">${escapeHtml(t("loading"))}</p>`;
  }

  const cfg = getBrowserSupabaseConfig();
  if (!cfg) {
    PROPERTY_DATA = [];
    dataSource = "demo";
    return;
  }

  try {
    const createClient = resolveSupabaseCreateClient();
    if (!createClient) {
      PROPERTY_DATA = [];
      dataSource = "demo";
      return;
    }
    const supabase = createClient(cfg.url, cfg.key);
    const { data, error } = await supabase.from("properties").select("*");
    if (error) {
      console.error("Supabase:", error);
      PROPERTY_DATA = [];
      dataSource = "demo";
      return;
    }
    if (data && data.length > 0) {
      PROPERTY_DATA = data.map(mapDbRow);
      dataSource = "supabase";
      return;
    }
  } catch (e) {
    console.error(e);
  }

  PROPERTY_DATA = [];
  dataSource = "demo";
}

async function initPropertyExplorer() {
  currentLang = getSavedLang();
  document.documentElement.lang = currentLang;
  bindLanguageSync();
  applyTranslations();
  await loadProperties();
  setSourceNote();
  renderProperties(PROPERTY_DATA);
  const btn = document.getElementById("apply-filter");
  if (btn && btn.dataset.ppexFilterBound !== "1") {
    btn.dataset.ppexFilterBound = "1";
    btn.addEventListener("click", applyFilters);
  }
}

function bootPropertyExplorer() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      void initPropertyExplorer();
    });
  } else {
    void initPropertyExplorer();
  }
}

bootPropertyExplorer();
