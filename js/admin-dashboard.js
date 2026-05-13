import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

let supabase = null;

function adminLang() {
  const saved =
    localStorage.getItem("preferred_language") || localStorage.getItem("bbLang") || "ko";
  return saved === "en" ? "en" : "ko";
}

function t(key) {
  const dict = window.bbI18n?.translations?.[adminLang()];
  return dict?.[key] ?? window.bbI18n?.translations?.ko?.[key] ?? key;
}

function escapeAdminHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

/** 관리자가 '승인하기' 버튼을 눌렀을 때 실행되는 함수 */
async function approveProperty(propertyId) {
  if (!supabase) {
    alert(t("admin_conn_error"));
    return;
  }
  if (!confirm(t("admin_confirm_approve"))) return;

  try {
    const { error } = await supabase.from("properties").update({ is_verified: true }).eq("id", propertyId);

    if (error) throw error;

    alert(t("admin_success_approve"));
    location.reload();
  } catch (err) {
    console.error("승인 에러:", err);
    alert(err?.message || t("admin_fail_approve"));
  }
}

window.approveProperty = approveProperty;

async function loadAndRender() {
  const container = document.getElementById("admin-properties-list");
  if (!container || !supabase) return;

  container.innerHTML = `<p class="admin-empty">${escapeAdminHtml(t("admin_loading"))}</p>`;

  const { data: rows, error } = await supabase
    .from("properties")
    .select("id,title,document_url,is_verified")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = `<p class="admin-empty">${escapeAdminHtml(t("admin_load_error"))} ${escapeAdminHtml(error.message)}</p>`;
    return;
  }

  if (!rows || rows.length === 0) {
    container.innerHTML = `<p class="admin-empty">${escapeAdminHtml(t("admin_no_properties"))}</p>`;
    return;
  }

  container.innerHTML = rows
    .map((row) => {
      const id = row.id;
      const title = escapeAdminHtml(row.title || `${t("admin_property")} #${id}`);
      const verified = Boolean(row.is_verified);
      const docUrl = row.document_url ? String(row.document_url).trim() : "";
      const safeHref = /^https?:\/\//i.test(docUrl) ? docUrl.replace(/"/g, "&quot;") : "";
      const docLink = safeHref
        ? `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${escapeAdminHtml(t("admin_open_doc"))}</a>`
        : `<span style="color:#9ca3af">${escapeAdminHtml(t("admin_no_doc"))}</span>`;

      const approveBtn = verified
        ? `<button type="button" class="write-btn write-btn--done" disabled>${escapeAdminHtml(t("admin_verified"))}</button>`
        : `<button type="button" class="write-btn" data-approve-id="${escapeAdminHtml(String(id))}">${escapeAdminHtml(t("admin_approve"))}</button>`;

      return `
        <div class="request-item">
          <div class="req-info">
            <strong>${title}</strong>
            <p>ID: ${escapeAdminHtml(String(id))} · ${docLink}</p>
          </div>
          ${approveBtn}
        </div>`;
    })
    .join("");

  container.querySelectorAll("[data-approve-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.getAttribute("data-approve-id");
      const pid = raw != null && raw !== "" ? raw : null;
      if (pid != null) void approveProperty(pid);
    });
  });
}

async function init() {
  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) {
    const container = document.getElementById("admin-properties-list");
    if (container) {
      container.innerHTML = `<p class="admin-empty">${escapeAdminHtml(t("admin_env_missing"))}</p>`;
    }
    return;
  }

  supabase = createClient(url, key);
  await loadAndRender();
}

window.addEventListener("bb:languagechange", () => {
  void loadAndRender();
});

void init();
