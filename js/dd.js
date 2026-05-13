// js/dd.js — DD 페이지: 최신 매물 1건 조회 + ROI 막대 차트
// dd-report.html · dd.html: head에 Chart.js·@supabase/supabase-js, 본문에 supabase-browser-env.js → supabaseClient.js → i18n.js → 본 스크립트

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

  function renderChart(baseRoi) {
    const canvas = document.getElementById("roiChart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    const roi = Number(baseRoi) || 0;

    if (window.myRoiChart) {
      window.myRoiChart.destroy();
      window.myRoiChart = null;
    }

    window.myRoiChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["보수적 시나리오", "평균적 (기본)", "공격적 시나리오"],
        datasets: [
          {
            label: "예상 연간 수익률 (ROI %)",
            data: [roi - 3, roi, roi + 4],
            backgroundColor: [
              "rgba(156, 163, 175, 0.6)",
              "rgba(5, 150, 105, 0.8)",
              "rgba(59, 130, 246, 0.6)",
            ],
            borderColor: ["rgb(107, 114, 128)", "rgb(4, 120, 87)", "rgb(37, 99, 235)"],
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const setTitle = (msg) => {
      const el = document.getElementById("dd-title");
      if (el) el.textContent = msg;
    };

    let supabase = window.bbSupabase;
    if (!supabase) {
      const createClient = resolveCreateClient();
      const url = String(window.BB_SUPABASE_URL || "").trim();
      const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
      if (!createClient || !url || !key) {
        console.error("Supabase 클라이언트가 없습니다. head의 CDN과 /js/supabaseClient.js(또는 env+키)를 확인하세요.");
        setTitle("Supabase 설정을 확인해 주세요.");
        return;
      }
      supabase = createClient(url, key);
    }

    try {
      await supabase.auth.getUser();

      const { data: properties, error } = await supabase
        .from("properties")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (properties && properties.length > 0) {
        const prop = properties[0];
        const roiNum = parseRoi(prop.roi);

        const titleEl = document.getElementById("dd-title");
        if (titleEl) titleEl.textContent = prop.title || "—";

        const roiEl = document.getElementById("dd-roi");
        if (roiEl) roiEl.textContent = roiNum ? `${roiNum}%` : "—";

        const landEl = document.getElementById("dd-land-rights");
        if (landEl) landEl.textContent = prop.land_rights || "Leasehold";

        const landMetric = document.getElementById("dd-land-rights-metric");
        if (landMetric) landMetric.textContent = prop.land_rights || "Leasehold";

        const zoningEl = document.getElementById("dd-zoning");
        if (zoningEl) {
          const z = prop.zoning != null && String(prop.zoning).trim() !== "" ? String(prop.zoning) : "-";
          zoningEl.textContent = z === "-" ? "-" : `${z} 확인 완료`;
        }

        const pbgEl = document.getElementById("dd-pbg");
        if (pbgEl) pbgEl.textContent = prop.pbg_status != null ? String(prop.pbg_status) : "-";

        const verified = Boolean(prop.is_verified);
        const certElement = document.getElementById("dd-cert-status");
        if (certElement) {
          if (verified) {
            certElement.textContent = "확인 완료 (Bali Bridge 인증)";
            certElement.style.color = "#059669";
          } else {
            certElement.textContent = "검토 중";
            certElement.style.color = "#dc2626";
          }
        }

        const downloadBtn = document.querySelector('[data-i18n="btn_download"]');
        if (downloadBtn && !downloadBtn.dataset.ddDownloadBound) {
          downloadBtn.dataset.ddDownloadBound = "1";
          downloadBtn.addEventListener("click", () => {
            const docUrl = prop.document_url != null ? String(prop.document_url).trim() : "";
            if (!docUrl) {
              alert("현재 등록된 실사 보고서 파일이 없습니다.");
              return;
            }
            if (!verified) {
              alert("아직 법률 실사가 완료되지 않은 매물입니다.");
              return;
            }
            if (!/^https?:\/\//i.test(docUrl)) {
              alert("문서 링크를 열 수 없습니다.");
              return;
            }
            window.open(docUrl, "_blank", "noopener,noreferrer");
          });
        }

        const imgUrl = prop.image_url || prop.image || "";
        const imgElement = document.getElementById("dd-image");
        if (imgElement && imgUrl) {
          imgElement.src = String(imgUrl);
          imgElement.removeAttribute("hidden");
        }

        renderChart(roiNum);
      } else {
        setTitle("등록된 매물이 없습니다.");
      }
    } catch (err) {
      console.error("DD 데이터 로딩 실패:", err);
      setTitle("데이터를 불러오는 중 오류가 발생했습니다.");
    }
  });
})();
