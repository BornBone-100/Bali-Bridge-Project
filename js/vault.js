// js/vault.js — 수익 시뮬레이션 기록(입력·저장) + 목록 표시

function escapeVaultText(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

function bindVaultRecorder(supabase, user, onSaved) {
  const titleInput = document.getElementById("sim-title");
  const investmentInput = document.getElementById("sim-investment");
  const rentInput = document.getElementById("sim-rent");
  const occupancyInput = document.getElementById("sim-occupancy");
  const roiDisplay = document.getElementById("sim-roi");
  const saveBtn = document.getElementById("vault-save-btn");

  if (!titleInput || !investmentInput || !rentInput || !occupancyInput || !roiDisplay || !saveBtn) {
    return;
  }

  let currentRoi = 0;
  const saveBtnDefaultHtml = saveBtn.innerHTML;

  function calculateROI() {
    const inv = Number(investmentInput.value) || 0;
    const rent = Number(rentInput.value) || 0;
    const occ = Number(occupancyInput.value) || 0;

    if (inv === 0) {
      roiDisplay.textContent = "0.0%";
      currentRoi = 0;
      return;
    }

    const annualRevenue = rent * 12 * (occ / 100);
    const roi = (annualRevenue / inv) * 100;
    currentRoi = Number(roi.toFixed(1));
    roiDisplay.textContent = `${currentRoi}%`;
  }

  investmentInput.addEventListener("input", calculateROI);
  rentInput.addEventListener("input", calculateROI);
  occupancyInput.addEventListener("input", calculateROI);
  calculateROI();

  saveBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const inv = Number(investmentInput.value);
    const rent = Number(rentInput.value);
    const occ = Number(occupancyInput.value);

    if (!title || inv <= 0 || rent <= 0 || occ <= 0 || occ > 100) {
      alert("모든 항목을 올바르게 입력해 주세요. (가동률은 1~100%)");
      return;
    }

    try {
      saveBtn.disabled = true;
      saveBtn.textContent = "저장 중...";

      const { error } = await supabase.from("profit_simulations").insert({
        user_id: user.id,
        title,
        investment_amount: inv,
        monthly_rent: rent,
        occupancy_rate: occ,
        calculated_roi: currentRoi,
      });

      if (error) throw error;

      titleInput.value = "";
      investmentInput.value = "";
      rentInput.value = "";
      occupancyInput.value = "";
      calculateROI();

      if (typeof onSaved === "function") await onSaved();
      alert("시뮬레이션이 보관함에 저장되었습니다.");
    } catch (err) {
      console.error("시뮬레이션 저장 에러:", err);
      alert("저장 중 문제가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = saveBtnDefaultHtml;
    }
  });
}

function bindVaultSimDelete(supabase, user, onDeleted) {
  const listRoot = document.getElementById("vault-sim-list");
  if (!listRoot || listRoot.dataset.deleteBound === "1") return;
  listRoot.dataset.deleteBound = "1";

  listRoot.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-vault-delete-id]");
    if (!btn) return;

    const simId = btn.getAttribute("data-vault-delete-id");
    if (!simId) return;

    const title = btn.getAttribute("data-vault-delete-title") || "이 시나리오";
    if (!window.confirm(`「${title}」 기록을 삭제할까요?\n대시보드 총 투자액·ROI에도 반영됩니다.`)) return;

    try {
      btn.disabled = true;
      const { error } = await supabase
        .from("profit_simulations")
        .delete()
        .eq("id", simId)
        .eq("user_id", user.id);

      if (error) throw error;
      if (typeof onDeleted === "function") await onDeleted();
    } catch (err) {
      console.error("시뮬레이션 삭제 에러:", err);
      alert("삭제 중 문제가 발생했습니다. 다시 시도해 주세요.");
      btn.disabled = false;
    }
  });
}

async function renderVaultSimulations(supabase, user) {
  const listRoot = document.getElementById("vault-sim-list");
  const totalEl = document.getElementById("vault-total");
  if (!listRoot) return;

  listRoot.innerHTML = `<p style="color:#6B7280;margin:16px 0 0">데이터를 불러오는 중입니다...</p>`;

  const { data: simulations, error } = await supabase
    .from("profit_simulations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!simulations || simulations.length === 0) {
    listRoot.innerHTML = `
      <p class="vault-empty-inline" style="margin:16px 0 0">
        아직 저장된 시뮬레이션이 없습니다. 위 양식으로 첫 시나리오를 기록해 보세요.
        <a href="./simulator.html" style="color:#059669;font-weight:700;margin-left:6px">상세 시뮬레이터 열기</a>
      </p>
    `;
    if (totalEl) totalEl.textContent = "$0";
    return;
  }

  let htmlContent = "";
  let totalInvested = 0;

  simulations.forEach((sim) => {
    const amt = Number(sim.investment_amount) || 0;
    totalInvested += amt;
    const title = escapeVaultText(sim.title || "시뮬레이션");
    const roi = sim.calculated_roi != null ? escapeVaultText(String(sim.calculated_roi).replace(/%$/, "")) : "—";
    const dateStr = sim.created_at ? new Date(sim.created_at).toLocaleDateString("ko-KR") : "—";
    const rent = sim.monthly_rent != null ? `$${Number(sim.monthly_rent).toLocaleString()}` : "—";
    const occRaw = sim.occupancy_rate != null ? Number(sim.occupancy_rate) : null;
    const occ = occRaw != null ? `${Math.min(occRaw, 100)}%` : "—";
    const simId = sim.id != null ? escapeVaultText(String(sim.id)) : "";

    htmlContent += `
      <article class="vault-panel vault-sim-card" data-sim-id="${simId}">
        <div class="sim-header">
          <strong>${title}</strong>
          <div class="sim-header-actions">
            <span>${escapeVaultText(dateStr)}</span>
            <button type="button" class="vault-sim-delete-btn" data-vault-delete-id="${simId}" data-vault-delete-title="${title}" aria-label="${title} 삭제">삭제</button>
          </div>
        </div>
        <p class="vault-sim-detail">
          투자금 <span class="vault-highlight">$${amt.toLocaleString()}</span>
          · 월 임대료 ${escapeVaultText(rent)} · 가동률 ${escapeVaultText(occ)}
          · 예상 ROI <span class="vault-highlight">${roi}%</span>
        </p>
      </article>
    `;
  });

  listRoot.innerHTML = `<div class="vault-sim-stack">${htmlContent}</div>`;
  if (totalEl) totalEl.textContent = `$${totalInvested.toLocaleString()}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.bbSupabase;

  if (!supabase) {
    const listRoot = document.getElementById("vault-sim-list");
    if (listRoot) {
      listRoot.innerHTML = "<p style='color:red'>Supabase 클라이언트를 초기화할 수 없습니다.</p>";
    }
    return;
  }

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    const user = userData?.user;

    if (authError || !user) {
      alert("로그인이 필요합니다.");
      window.location.href = "./index.html#login";
      return;
    }

    const refreshList = () => renderVaultSimulations(supabase, user);
    bindVaultRecorder(supabase, user, refreshList);
    bindVaultSimDelete(supabase, user, refreshList);
    await refreshList();
  } catch (err) {
    console.error("보관함 로딩 실패:", err);
    const listRoot = document.getElementById("vault-sim-list");
    if (listRoot) {
      listRoot.innerHTML = "<p style='color:red'>데이터를 불러오는 중 오류가 발생했습니다.</p>";
    }
  }
});
