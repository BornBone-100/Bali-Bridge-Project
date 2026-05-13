import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

let supabase = null;

function escapeAdminHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

/** 관리자가 '승인하기' 버튼을 눌렀을 때 실행되는 함수 */
async function approveProperty(propertyId) {
  if (!supabase) {
    alert("Supabase 연결을 확인해 주세요.");
    return;
  }
  if (!confirm("이 매물의 법률 서류를 검토하셨습니까? 인증 마크를 부여합니다.")) return;

  try {
    const { error } = await supabase.from("properties").update({ is_verified: true }).eq("id", propertyId);

    if (error) throw error;

    alert("법률 인증이 완료되었습니다!");
    location.reload();
  } catch (err) {
    console.error("승인 에러:", err);
    alert(err?.message || "승인 처리에 실패했습니다. RLS·관리자 권한을 확인해 주세요.");
  }
}

window.approveProperty = approveProperty;

async function loadAndRender() {
  const container = document.getElementById("admin-properties-list");
  if (!container || !supabase) return;

  container.innerHTML = '<p class="admin-empty">불러오는 중…</p>';

  const { data: rows, error } = await supabase
    .from("properties")
    .select("id,title,document_url,is_verified")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = `<p class="admin-empty">목록을 불러오지 못했습니다: ${escapeAdminHtml(error.message)}</p>`;
    return;
  }

  if (!rows || rows.length === 0) {
    container.innerHTML = '<p class="admin-empty">등록된 매물이 없습니다.</p>';
    return;
  }

  container.innerHTML = rows
    .map((row) => {
      const id = row.id;
      const title = escapeAdminHtml(row.title || `매물 #${id}`);
      const verified = Boolean(row.is_verified);
      const docUrl = row.document_url ? String(row.document_url).trim() : "";
      const safeHref = /^https?:\/\//i.test(docUrl) ? docUrl.replace(/"/g, "&quot;") : "";
      const docLink = safeHref
        ? `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">서류 열기</a>`
        : '<span style="color:#9ca3af">서류 없음</span>';

      const approveBtn = verified
        ? '<button type="button" class="write-btn write-btn--done" disabled>인증 완료</button>'
        : `<button type="button" class="write-btn" data-approve-id="${escapeAdminHtml(String(id))}">승인하기</button>`;

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
      container.innerHTML =
        '<p class="admin-empty">Supabase URL/키가 없습니다. js/supabase-browser-env.js를 확인하세요.</p>';
    }
    return;
  }

  supabase = createClient(url, key);
  await loadAndRender();
}

void init();
