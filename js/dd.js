// dd.html · dd-report.html — Supabase 최신 매물 1건 + 인증·PDF + ROI 막대 차트
// head: Chart.js UMD, @supabase/supabase-js | 본문: supabase-browser-env → supabaseClient → i18n → 본 스크립트

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

  document.addEventListener("DOMContentLoaded", async () => {
    let supabase = window.bbSupabase;
    if (!supabase) {
      const createClient = resolveCreateClient();
      const url = String(window.BB_SUPABASE_URL || "").trim();
      const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
      if (!createClient || !url || !key) {
        const t = document.getElementById("dd-title");
        if (t) t.textContent = "Supabase 설정을 확인해 주세요.";
        return;
      }
      supabase = createClient(url, key);
    }

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
      const properties = res.data;

      if (properties && properties.length > 0) {
        const prop = properties[0];
        const roiNum = parseRoi(prop.roi);

        const titleEl = document.getElementById("dd-title");
        if (titleEl) titleEl.textContent = prop.title || "이름 없는 매물";

        const locEl = document.getElementById("dd-location");
        if (locEl) locEl.textContent = prop.location || "위치 미상";

        const roiEl = document.getElementById("dd-roi");
        if (roiEl) roiEl.textContent = roiNum ? `${roiNum}%` : "0%";

        const landEl = document.getElementById("dd-land-rights");
        if (landEl) landEl.textContent = prop.land_rights || "확인 중";

        const zoningEl = document.getElementById("dd-zoning");
        if (zoningEl) {
          const z = prop.zoning != null && String(prop.zoning).trim() !== "" ? String(prop.zoning) : "";
          zoningEl.textContent = z || "확인 중";
        }

        const pbgEl = document.getElementById("dd-pbg");
        if (pbgEl) pbgEl.textContent = prop.pbg_status != null && String(prop.pbg_status).trim() !== "" ? String(prop.pbg_status) : "확인 중";

        const certStatus = document.getElementById("dd-cert-status");
        const certBadge = document.getElementById("dd-cert-badge");
        const downloadBtn = document.getElementById("btn-download-pdf") || document.querySelector('[data-i18n="btn_download"]');

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
          if (downloadBtn) {
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
          if (downloadBtn) {
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
        const t = document.getElementById("dd-title");
        if (t) t.textContent = "등록된 매물이 없습니다.";
      }
    } catch (err) {
      console.error("DD 로딩 에러:", err);
      const t = document.getElementById("dd-title");
      if (t) t.textContent = "데이터를 불러오는 중 오류가 발생했습니다.";
    }
  });
})();
