/**
 * 보관함 데이터 — localStorage 연동 (실서비스에서는 동일 스키마로 서버 DB와 교체 가능)
 *
 * userVault: { simulations: [...] }
 * 실사 요청은 inspection-requests.js + baliInspectionRequests 키로 별도 영속화
 */

const VAULT_STORAGE_KEY = "baliUserVault";
const MAX_SIMULATIONS = 40;

const REGION_KO = {
  canggu: "짱구",
  ubud: "우붓",
  uluwatu: "울루와투",
  seminyak: "세미냑",
  jimbaran: "짐바란",
};

/** @returns {{ simulations: Array<{date:string,budget:string,expectedROI:string,region:string,ts?:number}> }} */
function loadUserVault() {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return { simulations: [] };
    const o = JSON.parse(raw);
    return {
      simulations: Array.isArray(o.simulations) ? o.simulations : [],
    };
  } catch (_) {
    return { simulations: [] };
  }
}

function saveUserVault(vault) {
  try {
    const sims = vault.simulations.slice(-MAX_SIMULATIONS);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify({ simulations: sims }));
  } catch (_) {}
}

function regionKoFromAgent(agent) {
  if (!agent || !Array.isArray(agent.regions) || agent.regions.length === 0) {
    return "발리";
  }
  const code = agent.regions[0];
  return REGION_KO[code] || String(code);
}

let simulationSaveTimer = null;

/** 슬라이더 조정이 잦을 때 저장 폭주 방지 */
function scheduleVaultSimulationSave(payload) {
  clearTimeout(simulationSaveTimer);
  simulationSaveTimer = setTimeout(() => {
    recordSimulationSnapshot(payload);
  }, 1400);
}

function recordSimulationSnapshot({ budget, expectedROI, region }) {
  const vault = loadUserVault();
  const last = vault.simulations[vault.simulations.length - 1];
  if (
    last &&
    last.budget === budget &&
    last.expectedROI === expectedROI &&
    last.region === region
  ) {
    return;
  }

  const date = new Date().toLocaleDateString("ko-KR");
  vault.simulations.push({
    date,
    budget,
    expectedROI,
    region,
    ts: Date.now(),
  });
  saveUserVault(vault);
}
