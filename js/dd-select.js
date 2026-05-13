import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

async function init() {
  const root = document.getElementById("dd-select-list");
  if (!root) return;

  const url = String(window.BB_SUPABASE_URL || "").trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) {
    root.innerHTML = "<p style='color:#DC2626'>Supabase 설정을 확인해 주세요.</p>";
    return;
  }

  const supabase = createClient(url, key);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    root.innerHTML =
      "<p style='color:#DC2626'>로그인이 필요합니다. <a href='./index.html#login' style='color:#059669'>로그인하기</a></p>";
    return;
  }

  const { data: properties, error: propErr } = await supabase
    .from("properties")
    .select("id,title,location,roi,is_verified")
    .order("created_at", { ascending: false });

  if (propErr) {
    root.innerHTML = `<p style='color:#DC2626'>매물 목록을 불러오지 못했습니다.</p>`;
    console.error(propErr);
    return;
  }

  if (!properties || properties.length === 0) {
    root.innerHTML =
      "<p style='color:#6B7280'>등록된 매물이 없습니다. 관리자에게 매물 등록을 요청하거나 <a href='./property-register.html' style='color:#059669'>매물 등록</a>을 진행해 주세요.</p>";
    return;
  }

  const ids = properties.map((p) => p.id);
  const { data: reports } = await supabase.from("dd_reports").select("property_id,is_public").in("property_id", ids);
  const reportMap = new Map((reports || []).map((r) => [r.property_id, r]));

  let html = '<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px">';
  properties.forEach((p) => {
    const rep = reportMap.get(p.id);
    const hasReport = Boolean(rep);
    const badge = hasReport
      ? "<span style='font-size:12px;background:#ECFDF5;color:#059669;padding:2px 8px;border-radius:6px'>보고서 있음</span>"
      : "<span style='font-size:12px;background:#F3F4F6;color:#6B7280;padding:2px 8px;border-radius:6px'>보고서 미등록</span>";
    const title = escapeHtml(p.title || `매물 #${p.id}`);
    const loc = escapeHtml(p.location || "-");
    const roi = p.roi != null ? escapeHtml(String(p.roi).replace(/%$/, "")) + "%" : "-";
    html += `
      <li>
        <a href="./dd-report.html?propertyId=${encodeURIComponent(p.id)}"
           style="display:block;padding:16px 18px;border:1px solid #E5E7EB;border-radius:12px;text-decoration:none;color:inherit;background:#fff">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
            <div>
              <strong style="font-size:17px;color:#111827">${title}</strong>
              <p style="margin:6px 0 0;font-size:14px;color:#6B7280">${loc} · 예상 ROI ${roi}</p>
            </div>
            ${badge}
          </div>
        </a>
      </li>`;
  });
  html += "</ul>";
  root.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  void init();
});
