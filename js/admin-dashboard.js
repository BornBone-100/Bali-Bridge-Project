import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.3';

const root = document.getElementById('admin-root');

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function formatPrice(prop) {
  const raw = prop.price_usd ?? prop.price;
  if (raw == null) return '—';
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n)) return escapeHtml(String(raw));
  return `$${n.toLocaleString('en-US')}`;
}

async function init() {
  const url = String(window.BB_SUPABASE_URL || '').trim();
  const key = String(window.BB_SUPABASE_ANON_KEY || '').trim();
  if (!url || !key || !root) {
    root.innerHTML = '<p style="padding:48px">Supabase 설정을 확인해 주세요.</p>';
    return;
  }

  const supabase = createClient(url, key);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    root.innerHTML =
      '<p style="padding:48px;text-align:center">로그인이 필요합니다. <a href="./index.html">로그인</a></p>';
    return;
  }

  root.innerHTML = '<p style="padding:48px;text-align:center">관리자 권한 확인 중... 🛡️</p>';

  const { data: adminRow, error: adminErr } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (adminErr || !adminRow) {
    root.innerHTML =
      '<p style="padding:50px;text-align:center;color:red">🚨 접근 권한이 없습니다. (관리자 전용)</p>';
    return;
  }

  const { data: consults } = await supabase
    .from('consultation_requests')
    .select('*, properties(title)')
    .order('created_at', { ascending: false });

  const { data: props } = await supabase.from('properties').select('*').order('created_at', { ascending: false });

  const listC = consults || [];
  const listP = props || [];

  root.innerHTML = `
    <div style="padding:48px;background-color:#0F172A;min-height:100vh;color:#F8FAFC;font-family:'Pretendard',sans-serif">
      <header style="border-bottom:1px solid #334155;padding-bottom:20px;margin-bottom:40px">
        <h1 style="font-size:28px;font-weight:800;color:#38BDF8">👑 마스터 컨트롤 타워 (Admin Only)</h1>
        <p style="color:#94A3B8">플랫폼 전체 거래 및 매물 현황을 실시간으로 관리합니다.</p>
        <p style="margin-top:12px"><a href="./dashboard.html" style="color:#38BDF8">← 대시보드로</a></p>
      </header>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
        <div style="background-color:#1E293B;padding:24px;border-radius:16px">
          <h2 style="font-size:20px;margin-bottom:20px;border-bottom:1px solid #334155;padding-bottom:10px">
            💬 실시간 상담 요청 내역 (${listC.length}건)
          </h2>
          <div style="display:flex;flex-direction:column;gap:16px">
            ${listC
              .map(
                (req) => `
              <div style="background-color:#334155;padding:16px;border-radius:8px">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                  <span style="font-weight:bold;color:#F1F5F9">매물: ${escapeHtml(req.properties?.title ?? '—')}</span>
                  <span style="color:#F59E0B;font-size:14px">${escapeHtml(req.status ?? '—')}</span>
                </div>
                <div style="font-size:14px;color:#CBD5E1">요청자: ${escapeHtml(req.user_id)}</div>
                <div style="font-size:12px;color:#94A3B8;margin-top:8px">${req.created_at ? escapeHtml(new Date(req.created_at).toLocaleString()) : ''}</div>
                <button type="button" disabled style="margin-top:12px;padding:8px;width:100%;background-color:#0EA5E9;color:#fff;border:none;border-radius:6px;cursor:not-allowed;opacity:0.85">
                  진행 상태 변경 (대기 → 진행중)
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
        <div style="background-color:#1E293B;padding:24px;border-radius:16px">
          <h2 style="font-size:20px;margin-bottom:20px;border-bottom:1px solid #334155;padding-bottom:10px">
            🏠 전체 등록 매물 관리 (${listP.length}개)
          </h2>
          <div style="display:flex;flex-direction:column;gap:16px">
            ${listP
              .map((prop) => {
                const img =
                  prop.image_url?.trim() ||
                  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80';
                const roi = prop.roi != null ? `${escapeHtml(String(prop.roi))}%` : '—';
                return `
              <div style="background-color:#334155;padding:16px;border-radius:8px;display:flex;align-items:center;gap:16px">
                <img src="${escapeHtml(img)}" alt="" style="width:80px;height:60px;object-fit:cover;border-radius:4px" />
                <div style="flex:1">
                  <div style="font-weight:bold;color:#F1F5F9">${escapeHtml(prop.title ?? '—')}</div>
                  <div style="font-size:14px;color:#10B981">${formatPrice(prop)} | ROI: ${roi}</div>
                </div>
                <button type="button" disabled style="padding:8px 16px;background-color:#EF4444;color:#fff;border:none;border-radius:6px;cursor:not-allowed;opacity:0.85">
                  수정/삭제
                </button>
              </div>
            `;
              })
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

void init();
