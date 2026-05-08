import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

const DEMO_DATA = [
  {
    id: 1,
    title: "Canggu Luxury Pool Villa A-1",
    location: "Canggu, Bali",
    region: "canggu",
    price: 500000,
    priceLabel: "$500,000",
    roi: 15.2,
    roiLabel: "15.2%",
    ddStatus: "법률 검토 완료 (AAA)",
    ddType: "done",
    tags: ["관광특구", "HGB 확보", "수익형"],
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
  },
  {
    id: 2,
    title: "Uluwatu Cliff Resort Project",
    location: "Uluwatu, Bali",
    region: "uluwatu",
    price: 1200000,
    priceLabel: "$1,200,000",
    roi: 11.8,
    roiLabel: "11.8%",
    ddStatus: "건축 허가 진행 중",
    ddType: "progress",
    tags: ["오션뷰", "장기 투자", "PMA 추천"],
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  },
  {
    id: 3,
    title: "Seminyak Boutique Hotel",
    location: "Seminyak, Bali",
    region: "seminyak",
    price: 850000,
    priceLabel: "$850,000",
    roi: 13.5,
    roiLabel: "13.5%",
    ddStatus: "실사 예정",
    ddType: "scheduled",
    tags: ["리모델링", "상업지구", "급매"],
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
  },
];

let PROPERTY_DATA = [];
let dataSource = "demo";

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

function renderProperties(list) {
  const root = document.getElementById("property-list");
  if (!root) return;

  if (!list.length) {
    root.innerHTML =
      '<p class="ppex-empty">조건에 맞는 매물이 없습니다. 필터를 조정해 주세요.</p>';
    return;
  }

  root.innerHTML = list
    .map((prop) => {
      const bg = prop.image ? encodeURI(prop.image) : "";
      return `
      <article class="ppex-card">
        <div class="ppex-image" style="background-image:url('${bg.replace(/'/g, "%27")}')">
          <span class="ppex-badge">${escapeHtml(prop.ddStatus)}</span>
        </div>
        <div class="ppex-body">
          <div class="ppex-tags">
            ${prop.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
          </div>
          <h3>${escapeHtml(prop.title)}</h3>
          <p class="ppex-location">📍 ${escapeHtml(prop.location)}</p>
          <div class="ppex-metrics">
            <div>
              <small>예상 ROI</small>
              <strong>${escapeHtml(prop.roiLabel)}</strong>
            </div>
            <div>
              <small>최소 투자 금액</small>
              <strong>${escapeHtml(prop.priceLabel)}</strong>
            </div>
          </div>
        </div>
      </article>`
    )
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
    el.textContent = "연동: Supabase `properties` 테이블 (실시간)";
    el.hidden = false;
  } else {
    el.textContent =
      "데모 데이터 표시 중 — `js/supabase-browser-env.js` 에 URL/키를 넣으면 Supabase를 불러옵니다.";
    el.hidden = false;
  }
}

async function loadProperties() {
  const root = document.getElementById("property-list");
  if (root) {
    root.innerHTML = '<p class="ppex-loading">데이터 로딩 중...</p>';
  }

  const cfg = getBrowserSupabaseConfig();
  if (!cfg) {
    PROPERTY_DATA = DEMO_DATA;
    dataSource = "demo";
    return;
  }

  try {
    const supabase = createClient(cfg.url, cfg.key);
    const { data, error } = await supabase.from("properties").select("*");
    if (error) {
      console.error("Supabase:", error);
      PROPERTY_DATA = DEMO_DATA;
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

  PROPERTY_DATA = DEMO_DATA;
  dataSource = "demo";
}

async function initPropertyExplorer() {
  await loadProperties();
  setSourceNote();
  renderProperties(PROPERTY_DATA);
  const btn = document.getElementById("apply-filter");
  if (btn) btn.addEventListener("click", applyFilters);
}

document.addEventListener("DOMContentLoaded", initPropertyExplorer);
