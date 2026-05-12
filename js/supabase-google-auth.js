let cachedCreateClient = null;

async function getCreateClient() {
  if (!cachedCreateClient) {
    const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.3/+esm");
    cachedCreateClient = mod.createClient;
  }
  return cachedCreateClient;
}

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

  try {
    const createClient = await getCreateClient();
    const supabase = createClient(url, key);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      console.error("구글 로그인 에러:", error.message);
      alert(`로그인 중 문제가 발생했습니다.\n${error.message}`);
    }
  } catch (err) {
    console.error("구글 로그인 모듈/네트워크 오류:", err);
    alert(
      "로그인을 시작할 수 없습니다. 브라우저 콘솔을 확인하거나, Supabase 대시보드에 이 사이트 URL을 Redirect URLs에 등록했는지 확인해 주세요."
    );
  }
}
