/**
 * 매물 비교 — 보관함 체크로 목록 구성, 저장(sessionStorage), 표 렌더 + 승자(winner) 표시
 */

const COMPARE_STORAGE_KEY = "baliCompareList";

/** 관심 에이전트 id(숫자)와 매칭되는 데모 매물 카탈로그 (property_${id}) */
const COMPARE_CATALOG = {
  property_1: {
    id: "property_1",
    name: "Canggu Oasis",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=320&q=80",
    roi: 12.5,
    nightlyPrice: 25,
    waterLMin: 12.5,
    noiseDb: 52,
    leaseMonths: 288,
    locationScore: 88,
  },
  property_2: {
    id: "property_2",
    name: "Ubud Jungle View",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=320&q=80",
    roi: 10.2,
    nightlyPrice: 18,
    waterLMin: 9,
    noiseDb: 38,
    leaseMonths: 320,
    locationScore: 81,
  },
  property_3: {
    id: "property_3",
    name: "Uluwatu Cliff Suite",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=320&q=80",
    roi: 11.0,
    nightlyPrice: 30,
    waterLMin: 11,
    noiseDb: 45,
    leaseMonths: 240,
    locationScore: 85,
  },
};

const COMPARE_ROW_SECTIONS = [
  {
    title: "💰 수익성 지표",
    rows: [
      {
        label: "예상 ROI",
        key: "roi",
        higherBetter: true,
        format: (p) => `${p.roi}%`,
      },
      {
        label: "1박 평균 단가",
        key: "nightlyPrice",
        higherBetter: false,
        format: (p) => `${p.nightlyPrice}만 원`,
        winnerExtra: "(가성비)",
      },
    ],
  },
  {
    title: "🛠️ 시설 진단 데이터",
    rows: [
      {
        label: "수압 상태",
        key: "waterLMin",
        higherBetter: true,
        format: (p) => `${p.waterLMin} L/min`,
      },
      {
        label: "평균 소음",
        key: "noiseDb",
        higherBetter: false,
        format: (p) => {
          const tag =
            p.noiseDb >= 50 ? "(주의)" : p.noiseDb <= 40 ? "(우수)" : "";
          return `${p.noiseDb} dB${tag ? ` ${tag}` : ""}`;
        },
      },
    ],
  },
  {
    title: "⚖️ 법적 안전성",
    rows: [
      {
        label: "임대 잔여 기간",
        key: "leaseMonths",
        higherBetter: true,
        format: (p) => `${p.leaseMonths}개월`,
      },
      {
        label: "입지 종합 점수",
        key: "locationScore",
        higherBetter: true,
        format: (p) => `${p.locationScore} / 100`,
      },
    ],
  },
];

let compareList = [];

function escapeCompareHtml(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

function loadCompareList() {
  try {
    const raw = sessionStorage.getItem(COMPARE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    compareList = Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch (_) {
    compareList = [];
  }
}

function saveCompareList() {
  try {
    sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList));
  } catch (_) {}
}

function sanitizeCompareList() {
  loadCompareList();
  compareList = compareList.filter((id) => COMPARE_CATALOG[id]);
  saveCompareList();
}

function compareListIncludes(propertyId) {
  loadCompareList();
  return compareList.includes(propertyId);
}

function addToCompare(propertyId) {
  loadCompareList();
  if (!COMPARE_CATALOG[propertyId]) {
    alert("이 매물은 비교 카탈로그에 없습니다. (데모: 관심 에이전트 1~3번)");
    return false;
  }
  if (compareList.includes(propertyId)) return true;
  if (compareList.length >= 3) {
    alert("최대 3개 매물까지 비교 가능합니다.");
    return false;
  }
  compareList.push(propertyId);
  saveCompareList();
  renderComparison();
  refreshCompareStrip();
  return true;
}

function removeFromCompare(propertyId) {
  loadCompareList();
  compareList = compareList.filter((id) => id !== propertyId);
  saveCompareList();
  renderComparison();
  refreshCompareStrip();
}

function toggleCompareFromCheckbox(propertyId, checked) {
  if (checked) return addToCompare(propertyId);
  removeFromCompare(propertyId);
  return true;
}

/** 동일 최댓값·최솟값이 2개 이상이면 승자 없음(모두 winner 미표시) */
function computeWinnerMask(values, higherBetter) {
  const nums = values.map((v) => Number(v));
  if (nums.some((n) => Number.isNaN(n))) return nums.map(() => false);
  const boundary = higherBetter ? Math.max(...nums) : Math.min(...nums);
  const hits = nums.map((n) => n === boundary);
  const hitCount = hits.filter(Boolean).length;
  if (hitCount !== 1) return nums.map(() => false);
  return hits;
}

function renderComparison() {
  sanitizeCompareList();
  const root = document.getElementById("comparison-root");
  const lead = document.getElementById("comp-lead-text");
  if (!root) return;
  const props = compareList.map((id) => COMPARE_CATALOG[id]).filter(Boolean);
  const n = props.length;

  if (lead) {
    lead.textContent =
      n === 0 ?
        "보관함 관심 목록에서 매물을 체크하면 여기서 비교합니다. (최대 3개)"
      : `선택하신 ${n}개 매물의 진단 데이터를 비교합니다.`;
  }

  if (n === 0) {
    root.innerHTML = `
      <div class="comp-empty-panel">
        <p class="comp-empty-text">
          보관함 <strong>관심 목록</strong>에서 비교할 매물을 체크해 주세요. 최대 3개까지 담을 수 있습니다.
        </p>
        <a class="btn btn--secondary comp-empty-cta" href="./vault.html">보관함으로 이동</a>
      </div>`;
    return;
  }

  const headCols = props
    .map(
      (p) => `
        <th scope="col">
          <img src="${p.image}" alt="" class="comp-img" width="100" height="100" loading="lazy" />
          <p class="comp-property-name">${escapeCompareHtml(p.name)}</p>
        </th>`
    )
    .join("");

  const tbodyParts = [];
  for (const sec of COMPARE_ROW_SECTIONS) {
    tbodyParts.push(
      `<tr class="section-title"><td colspan="${n + 1}">${escapeCompareHtml(sec.title)}</td></tr>`
    );
    for (const row of sec.rows) {
      const vals = props.map((p) => p[row.key]);
      const winners = computeWinnerMask(vals, row.higherBetter);
      const cells = props.map((p, i) => {
        let text = row.format(p);
        if (winners[i] && row.winnerExtra) text += ` ${row.winnerExtra}`;
        const cls = winners[i] ? ' class="winner"' : "";
        return `<td${cls}>${escapeCompareHtml(text)}</td>`;
      });
      tbodyParts.push(
        `<tr>
          <th scope="row">${escapeCompareHtml(row.label)}</th>
          ${cells.join("")}
        </tr>`
      );
    }
  }

  root.innerHTML = `
    <div class="comp-table-wrapper">
      <table class="comp-table">
        <thead>
          <tr>
            <th scope="col">항목</th>
            ${headCols}
          </tr>
        </thead>
        <tbody>${tbodyParts.join("")}</tbody>
      </table>
    </div>`;
}

function refreshCompareStrip() {
  const strip = document.getElementById("vault-compare-strip");
  const countEl = document.getElementById("vault-compare-count");
  if (!strip || !countEl) return;
  loadCompareList();
  const n = compareList.length;
  strip.hidden = n === 0;
  countEl.textContent = `비교함 ${n}/3`;
}

loadCompareList();
