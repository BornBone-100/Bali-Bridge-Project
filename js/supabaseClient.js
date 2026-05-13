/**
 * 브라우저 전역 Supabase 클라이언트 (CDN @supabase/supabase-js 로드 후 실행).
 * vault.html 등에서 `supabase-browser-env.js` 다음에 로드하세요.
 */
(function () {
  var url = window.BB_SUPABASE_URL || "";
  var key = window.BB_SUPABASE_ANON_KEY || "";
  var mod = window.supabase;
  var createClient =
    mod && typeof mod.createClient === "function"
      ? mod.createClient
      : mod && mod.default && typeof mod.default.createClient === "function"
        ? mod.default.createClient
        : null;

  if (!createClient) {
    console.warn("[supabaseClient] @supabase/supabase-js CDN이 head에 없거나 createClient를 찾을 수 없습니다.");
    window.bbSupabase = null;
    return;
  }
  if (!url || !key) {
    console.warn("[supabaseClient] BB_SUPABASE_URL / BB_SUPABASE_ANON_KEY를 supabase-browser-env.js에 설정하세요.");
    window.bbSupabase = null;
    return;
  }
  window.bbSupabase = createClient(url, key);
})();
