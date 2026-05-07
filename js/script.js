const REGION_LABELS = {
  canggu: "짱구",
  ubud: "우붓",
  uluwatu: "울루와투",
  seminyak: "세미냑",
};

/** 카드 태그 영역은 템플릿처럼 영문 라벨이 일반적입니다. */
const REGION_TAG_EN = {
  canggu: "Canggu",
  ubud: "Ubud",
  uluwatu: "Uluwatu",
  seminyak: "Seminyak",
  jimbaran: "Jimbaran",
};

let allAgents = [];
/** null이면 전체, 아니면 선택된 `.cat-btn`의 라벨 텍스트 (예: "짱구 (Canggu)") */
let selectedRegionLabel = null;
const KAKAO_JAVASCRIPT_KEY = "8a83bbb04eb282c6c694e95c969bbd36";

function initKakaoSdk() {
  if (typeof Kakao === "undefined") return false;
  if (KAKAO_JAVASCRIPT_KEY === "YOUR_JAVASCRIPT_KEY") return false;
  if (!Kakao.isInitialized()) {
    Kakao.init(KAKAO_JAVASCRIPT_KEY);
  }
  console.log("Kakao initialized:", Kakao.isInitialized());
  return true;
}

function showAppAfterAuth() {
  const landing = document.getElementById("landingHero");
  const app = document.getElementById("appRoot");
  if (landing) landing.hidden = true;
  if (app) app.hidden = false;
}

function persistLoggedInUser(user) {
  const userData = {
    id: user.id,
    name: user.name || "발리 투자자",
    email: user.email || "",
  };
  try {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
    sessionStorage.setItem("baliBridgeAuth", "kakao");
    sessionStorage.setItem("baliInvestorName", userData.name);
  } catch (_) {}
}

function loginWithKakao() {
  if (!initKakaoSdk()) {
    alert(
      "카카오 JavaScript 키가 설정되지 않았습니다. js/script.js의 KAKAO_JAVASCRIPT_KEY를 실제 키로 교체해 주세요."
    );
    return;
  }

  Kakao.Auth.login({
    success: function () {
      Kakao.API.request({
        url: "/v2/user/me",
        success: function (res) {
          const userId = res.id;
          const userName = res.properties?.nickname || "발리 투자자";
          const email = res.kakao_account?.email || "";

          console.log(`${userName}님 환영합니다! (ID: ${userId})`);

          persistLoggedInUser({
            id: userId,
            name: userName,
            email,
          });

          showAppAfterAuth();
        },
        fail: function (error) {
          console.error(error);
          alert("사용자 정보를 가져오는 데 실패했습니다.");
        },
      });
    },
    fail: function (err) {
      console.error(err);
      alert("카카오 로그인에 실패했습니다.");
    },
  });
}

/** regions 코드 배열 기준 정규화 (hydrateAgent 이후) */
function normalizeAgent(agent) {
  const region = agent.regions ?? agent.region ?? [];
  let experience = agent.experience;
  if (experience == null && agent.experienceYears != null) {
    experience = `${agent.experienceYears}년`;
  }
  if (experience == null) experience = "";
  return { ...agent, region, experience };
}

function agentMatchesSearch(agent, q) {
  if (!q) return true;
  const a = normalizeAgent(agent);
  const needle = q.toLowerCase();
  if (a.name.toLowerCase().includes(needle)) return true;
  if (String(a.company).toLowerCase().includes(needle)) return true;
  if (a.specialty && a.specialty.toLowerCase().includes(needle)) return true;
  const codes = Array.isArray(a.region) ? a.region : [];
  for (const code of codes) {
    const ko = String(REGION_LABELS[code] ?? "").toLowerCase();
    const en = String(REGION_TAG_EN[code] ?? "").toLowerCase();
    if (ko.includes(needle) || en.includes(needle)) return true;
    if (String(code).toLowerCase().includes(needle)) return true;
  }
  return false;
}

function getFilteredAgents() {
  let list = [...allAgents];
  if (selectedRegionLabel != null) {
    list = list.filter((a) =>
      (a.regionsKo ?? []).some((r) => selectedRegionLabel.includes(r))
    );
  }
  const searchEl = document.getElementById("agent-search");
  const q = searchEl ? searchEl.value.trim() : "";
  if (q) {
    list = list.filter((a) => agentMatchesSearch(a, q));
  }
  list.sort((a, b) => b.rating - a.rating);
  return list;
}

function renderGrid() {
  const grid = document.getElementById("agentGrid");
  const meta = document.getElementById("results-count");
  const list = getFilteredAgents();
  meta.innerHTML = `<strong>${list.length}</strong>명의 에이전트`;

  if (list.length === 0) {
    grid.innerHTML =
      '<p class="empty-state">조건에 맞는 에이전트가 없습니다.<br />검색어를 바꾸거나 &quot;전체&quot; 지역을 선택해 보세요.</p>';
    return;
  }

  if (typeof renderAgents !== "function") {
    grid.innerHTML =
      '<p class="empty-state"><code>render.js</code>가 로드되지 않았습니다.</p>';
    return;
  }

  renderAgents(list);
}

function init() {
  initKakaoSdk();
  try {
    if (
      localStorage.getItem("isLoggedIn") === "true" ||
      sessionStorage.getItem("baliBridgeAuth")
    ) {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.name) sessionStorage.setItem("baliInvestorName", user.name);
      }
      showAppAfterAuth();
    }
  } catch (_) {}

  if (
    typeof agentData === "undefined" ||
    typeof hydrateAgent !== "function" ||
    typeof renderAgents !== "function"
  ) {
    document.getElementById("agentGrid").innerHTML =
      '<p class="empty-state"><code>data.js</code>와 <code>render.js</code>가 로드되었는지 확인해 주세요.<br />순서: <code>data.js</code> → <code>render.js</code> → <code>script.js</code></p>';
    return;
  }

  allAgents = agentData.map(hydrateAgent);

  document
    .getElementById("agent-search")
    .addEventListener("input", renderGrid);

  // 카테고리 버튼 클릭 — 버튼 라벨에 에이전트의 한글 지역명이 포함되는지로 필터 (가이드와 동일한 방식)
  document.querySelectorAll(".category-scroll .cat-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      document
        .querySelectorAll(".category-scroll .cat-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const label = btn.textContent.trim();

      if (label === "전체") {
        selectedRegionLabel = null;
      } else {
        selectedRegionLabel = label;
      }

      renderGrid();
    });
  });

  renderGrid();
}

init();
