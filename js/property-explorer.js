const PROPERTY_DATA = [
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
  if (budgetFilter === "700to1000") return item.price >= 700000 && item.price <= 1000000;
  if (budgetFilter === "gt1000") return item.price > 1000000;
  return true;
}

function renderProperties(list) {
  const root = document.getElementById("property-list");
  if (!root) return;

  if (!list.length) {
    root.innerHTML = '<p class="ppex-empty">조건에 맞는 매물이 없습니다. 필터를 조정해 주세요.</p>';
    return;
  }

  root.innerHTML = list
    .map(
      (prop) => `
      <article class="ppex-card">
        <div class="ppex-image" style="background-image:url('${prop.image}')">
          <span class="ppex-badge">${prop.ddStatus}</span>
        </div>
        <div class="ppex-body">
          <div class="ppex-tags">
            ${prop.tags.map((tag) => `<span>#${tag}</span>`).join("")}
          </div>
          <h3>${prop.title}</h3>
          <p class="ppex-location">📍 ${prop.location}</p>
          <div class="ppex-metrics">
            <div>
              <small>예상 ROI</small>
              <strong>${prop.roiLabel}</strong>
            </div>
            <div>
              <small>최소 투자 금액</small>
              <strong>${prop.priceLabel}</strong>
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

function initPropertyExplorer() {
  renderProperties(PROPERTY_DATA);
  const btn = document.getElementById("apply-filter");
  if (btn) btn.addEventListener("click", applyFilters);
}

document.addEventListener("DOMContentLoaded", initPropertyExplorer);

