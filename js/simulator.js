document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.bbSupabase;
  const titleInput = document.getElementById("sim-title");
  const investmentInput = document.getElementById("sim-investment");
  const rentInput = document.getElementById("sim-rent");
  const occupancyInput = document.getElementById("sim-occupancy");
  const roiDisplay = document.getElementById("sim-roi");
  const saveBtn = document.getElementById("save-btn");

  if (!titleInput || !investmentInput || !rentInput || !occupancyInput || !roiDisplay || !saveBtn) {
    console.error("[simulator] 필수 입력 요소를 찾을 수 없습니다.");
    return;
  }

  const saveBtnDefaultHtml = saveBtn.innerHTML;

  if (!supabase) {
    alert("Supabase 클라이언트를 불러올 수 없습니다. supabase-browser-env.js와 CDN을 확인해 주세요.");
    return;
  }

  let currentRoi = 0;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    alert("로그인이 필요합니다.");
    window.location.href = "./index.html";
    return;
  }

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
    roiDisplay.textContent = currentRoi + "%";
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

    if (!title || inv <= 0 || rent <= 0 || occ <= 0) {
      alert("모든 항목을 올바르게 입력해주세요.");
      return;
    }

    try {
      saveBtn.disabled = true;
      saveBtn.textContent = "저장 중... 🔄";

      const { error } = await supabase.from("profit_simulations").insert({
        user_id: user.id,
        title: title,
        investment_amount: inv,
        monthly_rent: rent,
        occupancy_rate: occ,
        calculated_roi: currentRoi,
      });

      if (error) throw error;

      alert("🎉 시뮬레이션 결과가 성공적으로 저장되었습니다!");
      window.location.href = "./vault.html";
    } catch (error) {
      console.error("저장 에러:", error);
      alert("저장 중 문제가 발생했습니다. 다시 시도해주세요.");
      saveBtn.disabled = false;
      saveBtn.innerHTML = saveBtnDefaultHtml;
    }
  });
});
