function bindGoogleButtons() {
  document.querySelectorAll("[data-google-signin]").forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const { signInWithGoogle } = await import("./supabase-google-auth.js");
        await signInWithGoogle();
      } catch (err) {
        console.error("구글 로그인 스크립트 로드 실패:", err);
        alert("로그인 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  });
}

/** 로그아웃 등으로 index.html#login 으로 온 경우 로그인 영역으로 스크롤 */
function focusLoginSectionFromHash() {
  const hash = (location.hash || "").toLowerCase();
  if (hash !== "#login" && hash !== "#reauth") return;
  const login = document.getElementById("login");
  if (!login) return;
  requestAnimationFrame(() => {
    login.scrollIntoView({ behavior: "smooth", block: "center" });
    const btn = login.querySelector("[data-google-signin]");
    if (btn && typeof btn.focus === "function") {
      try {
        btn.focus({ preventScroll: true });
      } catch {
        btn.focus();
      }
    }
  });
}

function initGoogleLoginUi() {
  bindGoogleButtons();
  focusLoginSectionFromHash();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGoogleLoginUi);
} else {
  initGoogleLoginUi();
}
