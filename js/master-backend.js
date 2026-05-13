/**
 * 앱 공통 백엔드 바인딩: Supabase properties / profit_simulations 를
 * HTML id 가 있으면 해당 DOM에 주입합니다.
 * (DD: 기존 dd.js 로직 통합 · Vault: 사용자별 시뮬 · Explore: 단순 카드 그리드)
 */
(function () {
  function resolveCreateClient() {
    const mod = window.supabase;
    if (mod && typeof mod.createClient === "function") return mod.createClient;
    if (mod && mod.default && typeof mod.default.createClient === "function") return mod.default.createClient;
    return null;
  }

  function parseRoi(value) {
    if (value == null) return 0;
    const n = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
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

  /** @param {string|number} baseRoi */
  function renderRoiChart(baseRoi) {
    const canvas = document.getElementById("roiChart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    const roi = parseRoi(baseRoi);

    if (window.myChart) {
      window.myChart.destroy();
      window.myChart = null;
    }
    if (window.myRoiChart) {
      window.myRoiChart.destroy();
      window.myRoiChart = null;
    }

    window.myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["보수적", "평균적(기준)", "공격적"],
        datasets: [
          {
            label: "예상 ROI (%)",
            data: [roi - 3.5, roi, roi + 4.2],
            backgroundColor: ["#E5E7EB", "#10B981", "#3B82F6"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
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
    if (!supabase) {
      const t = document.getElementById("dd-title");
      if (t) t.textContent = "Supabase 설정을 확인해 주세요.";
      return;
    }

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
      const t = document.getElementById("dd-title");
      if (t) t.textContent = "데이터를 불러오는 중 오류가 발생했습니다.";
      return;
    }

    // --- DD (실사 보고서) ---
    if (document.getElementById("dd-roi")) {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authError || !user) {
        alert("로그인이 필요합니다.");
        window.location.href = "./index.html#login";
        return;
      }

      try {
        let res = await supabase.from("properties").select("*").order("created_at", { ascending: false }).limit(1);
        if (res.error) {
          res = await supabase.from("properties").select("*").order("id", { ascending: false }).limit(1);
        }
        if (res.error) throw res.error;
        const latest = res.data;

        if (latest && latest.length > 0) {
          const prop = latest[0];
          const roiNum = parseRoi(prop.roi);

          setText("dd-title", prop.title || "이름 없는 매물");
          setText("dd-location", prop.location || "위치 미상");
          setText("dd-roi", roiNum ? `${roiNum}%` : "0%");
          setText("dd-land-rights", prop.land_rights || "확인 중");
          setText("dd-land-rights-metric", prop.land_rights || "확인 중");

          const inv =
            prop.investment_period != null && String(prop.investment_period).trim() !== ""
              ? String(prop.investment_period).trim()
              : "5년";
          setText("dd-investment-period", inv);
          setText("dd-investment-period-metric", inv);

          const zoningEl = document.getElementById("dd-zoning");
          if (zoningEl) {
            const z = prop.zoning != null && String(prop.zoning).trim() !== "" ? String(prop.zoning).trim() : "";
            zoningEl.textContent = z ? `${z} 확인 완료` : "확인 중";
          }

          setText(
            "dd-pbg",
            prop.pbg_status != null && String(prop.pbg_status).trim() !== "" ? String(prop.pbg_status) : "확인 중"
          );

          const certStatus = document.getElementById("dd-cert") || document.getElementById("dd-cert-status");
          const certBadge = document.getElementById("dd-cert-badge");
          const downloadBtn =
            document.getElementById("btn-download-pdf") ||
            document.getElementById("download-pdf") ||
            document.querySelector('[data-i18n="btn_download"]');

          const verified = Boolean(prop.is_verified);

          if (verified) {
            if (certStatus) {
              certStatus.textContent = "유효성 확인 완료 (Bali Bridge 인증)";
              certStatus.style.color = "#059669";
            }
            if (certBadge) {
              certBadge.textContent = "인증 완료";
              certBadge.style.backgroundColor = "#DEF7EC";
              certBadge.style.color = "#03543F";
            }
            if (downloadBtn && !downloadBtn.dataset.ddDownloadBound) {
              downloadBtn.dataset.ddDownloadBound = "1";
              downloadBtn.style.backgroundColor = "";
              downloadBtn.style.opacity = "";
              downloadBtn.addEventListener("click", () => {
                const docUrl = prop.document_url != null ? String(prop.document_url).trim() : "";
                if (docUrl && /^https?:\/\//i.test(docUrl)) {
                  window.open(docUrl, "_blank", "noopener,noreferrer");
                } else {
                  alert("첨부된 실사 파일이 없습니다.");
                }
              });
            }
          } else {
            if (certStatus) {
              certStatus.textContent = "서류 검토 및 마스터 승인 대기중";
              certStatus.style.color = "#DC2626";
            }
            if (certBadge) {
              certBadge.textContent = "검토 중";
              certBadge.style.backgroundColor = "#FEF2F2";
              certBadge.style.color = "#DC2626";
            }
            if (downloadBtn && !downloadBtn.dataset.ddDownloadBound) {
              downloadBtn.dataset.ddDownloadBound = "1";
              downloadBtn.style.backgroundColor = "#4B5563";
              downloadBtn.addEventListener("click", () => {
                alert("마스터(Bali Bridge)의 법률 인증이 완료된 후에 다운로드할 수 있습니다.");
              });
            }
          }

          const imgUrl = prop.image_url || prop.image || "";
          const imgElement = document.getElementById("dd-image");
          if (imgElement && imgUrl) {
            imgElement.src = String(imgUrl);
            imgElement.removeAttribute("hidden");
          }

          renderRoiChart(roiNum);
        } else {
          setText("dd-title", "등록된 매물이 없습니다.");
        }
      } catch (err) {
        console.error("DD 로딩 에러:", err);
        setText("dd-title", "데이터를 불러오는 중 오류가 발생했습니다.");
      }
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
