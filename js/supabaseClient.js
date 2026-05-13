/**
 * 브라우저 전역 Supabase 클라이언트 (CDN @supabase/supabase-js 로드 후 실행).
 * vault.html 등에서 `supabase-browser-env.js` 다음에 로드하세요.
 *
 * 정적 배포(Vercel 등) 브라우저에는 process.env가 없습니다. Supabase anon 키는
 * 공개용이므로 아래 기본값을 두고, `supabase-browser-env.js`가 있으면 window 값이 우선합니다.
 * (키 교체 시 supabase-browser-env.js와 여기를 같이 맞추세요.)
 */
(function () {
  var defaultUrl = "https://vegpkektulmmsnkldonf.supabase.co";
  var defaultKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3BrZWt0dWxtbXNua2xkb25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzE3NDEsImV4cCI6MjA5MzcwNzc0MX0.Sg1BZWsstGiMfwmNXda0_FJCvTQxseW1vg0bHUQaxSU";

  var url = String(window.BB_SUPABASE_URL || defaultUrl).trim();
  var key = String(window.BB_SUPABASE_ANON_KEY || defaultKey).trim();
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
    console.warn("[supabaseClient] Supabase URL / anon key가 비어 있습니다.");
    window.bbSupabase = null;
    return;
  }
  window.bbSupabase = createClient(url, key);
})();
