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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindGoogleButtons);
} else {
  bindGoogleButtons();
}
