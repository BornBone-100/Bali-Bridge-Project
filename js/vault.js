// js/vault.js — Supabase profit_simulations → 보관함 UI

function escapeVaultText(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.bbSupabase;
  const loadingMsg = document.getElementById("loading-msg");
  const simulationList = document.getElementById("simulation-list");
  const totalAmountDisplay = document.getElementById("total-amount");

  function showFatal(message) {
    if (loadingMsg) loadingMsg.innerHTML = `<span style="color:red">${escapeVaultText(message)}</span>`;
    else if (simulationList) simulationList.innerHTML = `<p style="color:red">${escapeVaultText(message)}</p>`;
  }

  if (!supabase) {
    showFatal("Supabase 클라이언트를 초기화할 수 없습니다. CDN과 supabase-browser-env.js·supabaseClient.js를 확인하세요.");
    return;
  }
  if (!loadingMsg || !simulationList) {
    console.error("[vault] #loading-msg 또는 #simulation-list가 없습니다.");
    return;
  }

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    const user = userData && userData.user;

    if (authError || !user) {
      alert("로그인이 필요합니다.");
      window.location.href = "/index.html";
      return;
    }

    const { data: simulations, error } = await supabase
      .from("profit_simulations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!simulations || simulations.length === 0) {
      loadingMsg.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6B7280;">
          아직 저장된 시뮬레이션 기록이 없습니다.<br>
          <a href="/simulator" style="color: #059669; font-weight: bold; text-decoration: underline;">새로운 시나리오 만들기</a>
        </div>
      `;
      return;
    }

    loadingMsg.style.display = "none";

    let htmlContent = "";
    let totalInvested = 0;

    simulations.forEach((sim) => {
      const amt = Number(sim.investment_amount) || 0;
      totalInvested += amt;
      const title = escapeVaultText(sim.title || "시뮬레이션");
      const roi = sim.calculated_roi != null ? escapeVaultText(String(sim.calculated_roi)) : "—";
      const dateStr = sim.created_at
        ? new Date(sim.created_at).toLocaleDateString("ko-KR")
        : "—";
      const amtStr = amt.toLocaleString();

      htmlContent += `
        <div style="background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 18px; color: #1F2937;">${title}</h3>
            <span style="font-size: 12px; color: #9CA3AF;">${escapeVaultText(dateStr)}</span>
          </div>
          <div style="display: flex; gap: 24px;">
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">총 투자금</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111827;">$${amtStr}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">예상 ROI</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #059669;">${roi}%</p>
            </div>
          </div>
        </div>
      `;
    });

    simulationList.innerHTML = htmlContent;

    if (totalAmountDisplay) {
      totalAmountDisplay.textContent = `$${totalInvested.toLocaleString()}`;
    }
  } catch (err) {
    console.error("데이터 로딩 실패:", err);
    loadingMsg.innerHTML = "<span style='color: red;'>데이터를 불러오는 중 오류가 발생했습니다.</span>";
  }
});
