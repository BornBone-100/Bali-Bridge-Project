import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

const rootEl = document.getElementById("register-root");
const lockEl = document.getElementById("register-lock");
const formEl = document.getElementById("property-register-form");
const submitBtn = document.getElementById("register-submit-btn");

function setLoading(loading) {
  if (!submitBtn) return;
  submitBtn.disabled = loading;
  submitBtn.textContent = loading ? "등록 중..." : "🚀 매물 등록하기";
  submitBtn.style.cursor = loading ? "not-allowed" : "pointer";
}

async function insertProperty(supabase, payload) {
  // 1차: owner_id / price_usd 포함 시도
  let result = await supabase.from("properties").insert(payload);
  if (!result.error) return result;

  // 2차: 스키마가 다를 경우 최소 컬럼으로 재시도
  if (result.error.code === "42703") {
    const fallbackPayload = {
      title: payload.title,
      location: payload.location,
      price: payload.price,
      roi: payload.roi,
      image_url: payload.image_url,
      status: payload.status,
    };
    result = await supabase.from("properties").insert(fallbackPayload);
  }
  return result;
}

async function init() {
  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) {
    alert("Supabase 설정이 비어 있습니다. js/supabase-browser-env.js를 확인해 주세요.");
    return;
  }

  const supabase = createClient(url, key);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    if (rootEl) rootEl.style.display = "none";
    if (lockEl) lockEl.style.display = "block";
    return;
  }

  if (!formEl) return;
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formEl);
    const title = String(formData.get("title") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const priceUsd = Number(formData.get("price_usd") || 0);
    const roi = Number(formData.get("roi") || 0);
    const imageUrl = String(formData.get("image_url") || "").trim();

    if (!title || !location || !priceUsd || !roi) {
      alert("필수 입력값을 확인해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        owner_id: session.user.id,
        title,
        location,
        price_usd: priceUsd,
        price: priceUsd,
        roi,
        image_url:
          imageUrl ||
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        status: "모집중",
      };

      const { error } = await insertProperty(supabase, payload);
      if (error) throw error;

      alert("🎉 매물이 성공적으로 등록되었습니다!");
      window.location.href = "./property-explorer.html";
    } catch (error) {
      console.error("등록 에러:", error);
      alert("매물 등록에 실패했습니다. 빈 칸이 없는지 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  });
}

void init();
