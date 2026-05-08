import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

function getRedirectUrl() {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}`.replace(/#.*$/, "");
}

export async function signInWithGoogle() {
  const url = (window.BB_SUPABASE_URL || "").trim();
  const key = (window.BB_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) {
    alert(
      "Supabase URL/키가 없습니다. js/supabase-browser-env.js 에 NEXT_PUBLIC 과 동일한 값을 넣어 주세요."
    );
    return;
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getRedirectUrl(),
    },
  });

  if (error) {
    console.error("구글 로그인 에러:", error.message);
    alert("로그인 중 문제가 발생했습니다.");
  }
}
