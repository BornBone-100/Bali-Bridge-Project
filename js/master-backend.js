/**
 * 앱 공통 백엔드 바인딩: Supabase properties / profit_simulations 를
 * HTML id 가 있으면 해당 DOM에 주입합니다. (Vault · Explore — DD는 dd-report.js)
 */
(function () {
  function resolveCreateClient() {
    const mod = window.supabase;
    if (mod && typeof mod.createClient === "function") return mod.createClient;
    if (mod && mod.default && typeof mod.default.createClient === "function") return mod.default.createClient;
    return null;
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s == null ? "" : String(s);
    return div.innerHTML;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  async function getSupabase() {
    let supabase = window.bbSupabase;
    if (supabase) return supabase;
    const createClient = resolveCreateClient();
    const url = String(window.BB_SUPABASE_URL || "").trim();
    const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
    if (!createClient || !url || !key) return null;
    return createClient(url, key);
  }

  async function fetchAllProperties(supabase) {
    let res = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (res.error) {
      res = await supabase.from("properties").select("*").order("id", { ascending: false });
    }
    if (res.error) throw res.error;
    return res.data || [];
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const supabase = await getSupabase();
    if (!supabase) return;

    let properties = [];
    let sims = [];

    try {
      const exploreRoot =
        document.getElementById("explore-list") || document.getElementById("property-list");
      if (exploreRoot) {
        properties = await fetchAllProperties(supabase);
      }

      const needSims = document.getElementById("vault-total") || document.getElementById("vault-sim-list");
      if (needSims) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (user) {
          const { data, error } = await supabase
            .from("profit_simulations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (!error) sims = data || [];
        }
      }
    } catch (err) {
      console.error("데이터 연동 실패:", err);
      return;
    }

    // --- Vault ---
    const vaultTotalEl = document.getElementById("vault-total");
    const vaultListEl = document.getElementById("vault-sim-list");
    if (vaultTotalEl || vaultListEl) {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (authError || !user) {
        alert("로그인이 필요합니다.");
        window.location.href = "/index.html";
        return;
      }

      let totalInvested = 0;
      let simHtml = "";

      if (sims.length > 0) {
        sims.forEach((sim) => {
          const amt = Number(sim.investment_amount) || 0;
          totalInvested += amt;
          const title = escapeHtml(sim.title || "시뮬레이션");
          const roiStr =
            sim.calculated_roi != null
              ? escapeHtml(String(sim.calculated_roi).replace(/%+\s*$/, ""))
              : "—";
          simHtml += `
            <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #E5E7EB; margin-bottom:12px; display:flex; justify-content:space-between;">
              <div>
                <h4 style="margin:0 0 8px 0; color:#111827;">${title}</h4>
                <div style="color:#6B7280; font-size:14px;">투자금: $${amt.toLocaleString()}</div>
              </div>
              <div style="text-align:right;">
                <div style="color:#6B7280; font-size:12px;">예상 ROI</div>
                <div style="color:#059669; font-size:20px; font-weight:bold;">${roiStr}%</div>
              </div>
            </div>
          `;
        });
      }

      const loadingMsg = document.getElementById("loading-msg");
      if (loadingMsg) loadingMsg.style.display = "none";

      if (vaultListEl) {
        vaultListEl.innerHTML =
          simHtml ||
          "<p style='color:#9CA3AF;'>저장된 시뮬레이션이 없습니다.</p>";
      }

      if (vaultTotalEl) {
        vaultTotalEl.textContent = "$" + totalInvested.toLocaleString();
      }
    }

    // --- Explore (단순 카드; property-explorer 모듈이 이어서 덮어쓸 수 있음) ---
    const exploreEl = document.getElementById("explore-list") || document.getElementById("property-list");
    if (exploreEl && properties.length > 0) {
      let exploreHtml = "";
      properties.forEach((prop) => {
        const title = escapeHtml(prop.title);
        const loc = escapeHtml(prop.location);
        const price = Number(prop.price_usd) || 0;
        const roi = escapeHtml(String(prop.roi ?? ""));
        const img = escapeHtml(prop.image_url || "") || "https://via.placeholder.com/400x200";
        exploreHtml += `
          <div style="border:1px solid #E5E7EB; border-radius:12px; overflow:hidden; background:#fff;">
            <img src="${img}" alt="" style="width:100%; height:180px; object-fit:cover;">
            <div style="padding:16px;">
              <h3 style="margin:0 0 4px 0; font-size:18px;">${title}</h3>
              <p style="color:#6B7280; font-size:13px; margin:0 0 12px 0;">${loc}</p>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold; color:#111827;">$${price.toLocaleString()}</span>
                <span style="background:#ECFDF5; color:#059669; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">ROI ${roi}%</span>
              </div>
            </div>
          </div>
        `;
      });
      exploreEl.innerHTML = exploreHtml;
    }
  });
})();
