/**
 * Google OAuth 후 index(/)로 돌아온 경우 세션을 읽고 dashboard.html 로 이동합니다.
 * Supabase Redirect URLs 에 사이트/dashboard.html 이 등록되어 있어야 합니다.
 */
(function () {
  function resolveCreateClient() {
    const mod = window.supabase;
    if (mod && typeof mod.createClient === "function") return mod.createClient;
    if (mod && mod.default && typeof mod.default.createClient === "function") return mod.default.createClient;
    return null;
  }

  function isLandingPage() {
    const path = window.location.pathname || "/";
    return path === "/" || path.endsWith("/index.html");
  }

  function isLogoutHash() {
    const hash = (window.location.hash || "").toLowerCase();
    return hash === "#login" || hash === "#reauth";
  }

  function isAuthCallbackUrl() {
    const hash = window.location.hash || "";
    const params = new URLSearchParams(window.location.search);
    return (
      hash.includes("access_token=") ||
      hash.includes("refresh_token=") ||
      hash.includes("type=signup") ||
      params.has("code")
    );
  }

  function dashboardUrl() {
    const origin = String(window.location.origin || "").replace(/\/$/, "");
    return `${origin}/dashboard.html`;
  }

  async function maybeRedirectToDashboard() {
    if (!isLandingPage() || isLogoutHash()) return;

    const supabase = window.bbSupabase;
    const createClient = resolveCreateClient();
    const url = String(window.BB_SUPABASE_URL || "").trim();
    const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();

    let client = supabase;
    if (!client && createClient && url && key) {
      client = createClient(url, key);
    }
    if (!client) return;

    const {
      data: { session },
    } = await client.auth.getSession();

    if (session) {
      window.location.replace(dashboardUrl());
      return;
    }

    if (isAuthCallbackUrl()) {
      const {
        data: { session: retrySession },
      } = await client.auth.getSession();
      if (retrySession) {
        window.location.replace(dashboardUrl());
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      void maybeRedirectToDashboard();
    });
  } else {
    void maybeRedirectToDashboard();
  }
})();
