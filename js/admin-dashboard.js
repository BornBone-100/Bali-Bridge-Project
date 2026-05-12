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

const DEFAULT_ROI_JSON = `[
  {"label":"1년차","conservative":6,"average":8,"aggressive":10},
  {"label":"2년차","conservative":7,"average":10,"aggressive":12},
  {"label":"3년차","conservative":8,"average":12,"aggressive":14}
]`;

const DEFAULT_VACANCY_JSON = `[
  {"label":"2023","rate":12},
  {"label":"2024","rate":10},
  {"label":"2025","rate":8}
]`;

function parseJsonField(text, fallback, label) {
  const t = String(text ?? '').trim();
  if (!t) return fallback;
  try {
    return JSON.parse(t);
  } catch {
    throw new Error(`${label} JSON 파싱 실패`);
  }
}

async function openDdEditor(supabase, propertyId, listP) {
  const slot = document.getElementById('dd-editor-slot');
  if (!slot) return;

  const prop = listP.find((p) => Number(p.id) === Number(propertyId));
  const propTitle = prop?.title ?? `매물 #${propertyId}`;

  slot.innerHTML =
    '<p style="color:#94A3B8;padding:16px">실사보고서 불러오는 중…</p>';

  const { data: row, error } = await supabase
    .from('dd_reports')
    .select('*')
    .eq('property_id', propertyId)
    .maybeSingle();

  if (error) {
    slot.innerHTML = `<p style="color:#FCA5A5">조회 오류: ${escapeHtml(error.message)}</p>`;
    return;
  }

  const legal = row?.legal_status && typeof row.legal_status === 'object' ? row.legal_status : {};
  const loc = row?.location_data && typeof row.location_data === 'object' ? row.location_data : {};
  const fin = row?.financial_data && typeof row.financial_data === 'object' ? row.financial_data : {};

  const roiText =
    fin.roi_projection && Array.isArray(fin.roi_projection) && fin.roi_projection.length
      ? JSON.stringify(fin.roi_projection, null, 2)
      : DEFAULT_ROI_JSON;
  const vacText =
    fin.vacancy_trend && Array.isArray(fin.vacancy_trend) && fin.vacancy_trend.length
      ? JSON.stringify(fin.vacancy_trend, null, 2)
      : DEFAULT_VACANCY_JSON;

  const v = (x) => (x == null ? '' : escapeHtml(String(x)));
  const checked = row?.is_public ? 'checked' : '';

  slot.innerHTML = `
    <div style="background-color:#1E293B;padding:28px;border-radius:16px;border:1px solid #334155">
      <h2 style="font-size:22px;margin:0 0 8px;color:#38BDF8">📋 투자 실사보고서 — ${escapeHtml(propTitle)}</h2>
      <p style="color:#94A3B8;margin:0 0 20px;font-size:14px">
        저장 후 「투자자에게 공개」를 켜야 <a href="./dd-report.html?propertyId=${propertyId}" target="_blank" rel="noopener" style="color:#38BDF8">dd-report.html?propertyId=${propertyId}</a> 에서 열람됩니다.
      </p>
      <form id="dd-admin-form" style="display:grid;gap:14px">
        <input type="hidden" name="property_id" value="${propertyId}" />

        <label style="display:flex;align-items:center;gap:10px;color:#E2E8F0">
          <input type="checkbox" name="is_public" ${checked} />
          투자자에게 공개 (is_public)
        </label>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">예상 ROI (숫자, %값)<input name="target_roi" type="number" step="0.1" value="${v(row?.target_roi ?? '')}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">투자 기간<input name="investment_period" value="${v(row?.investment_period)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">토지 권리 형태<input name="land_rights" value="${v(row?.land_rights)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">Trust 등급<input name="trust_grade" value="${v(row?.trust_grade)}" placeholder="AAA" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">Trust 설명<input name="trust_note" value="${v(row?.trust_note)}" placeholder="안전함" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">PDF URL<input name="pdf_url" value="${v(row?.pdf_url)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">법률 칩 문구<input name="legal_chip" value="${v(row?.legal_chip)}" placeholder="완료" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">재무 칩 문구<input name="financial_chip" value="${v(row?.financial_chip)}" placeholder="시뮬레이션" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">입지 칩 문구<input name="location_chip" value="${v(row?.location_chip)}" placeholder="우수" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        </div>

        <p style="color:#94A3B8;font-size:13px;margin:0">법률 항목</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">Sertifikat<input name="legal_sertifikat" value="${v(legal.sertifikat)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">Zoning<input name="legal_zoning" value="${v(legal.zoning)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">PBG<input name="legal_pbg" value="${v(legal.pbg)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        </div>
        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">법률 각주<input name="legal_footnote" value="${v(row?.legal_footnote)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>

        <p style="color:#94A3B8;font-size:13px;margin:0">입지(분 단위 숫자)</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">비치<input name="beach_min" type="number" value="${v(loc.beach_min)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">국제학교<input name="school_min" type="number" value="${v(loc.school_min)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">병원<input name="hospital_min" type="number" value="${v(loc.hospital_min)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">공항<input name="airport_min" type="number" value="${v(loc.airport_min)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        </div>
        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">인근 개발 호재(본문만)<textarea name="location_bullet_1" rows="2" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC">${v(row?.location_bullet_1)}</textarea></label>
        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">소음/환경(본문만)<textarea name="location_bullet_2" rows="2" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC">${v(row?.location_bullet_2)}</textarea></label>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">Exit 배수 (숫자, 화면에 ×로 표시)<input name="exit_multiple" type="number" step="0.01" value="${v(fin.exit_multiple)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">리스크 메모(굵은 제목)<input name="risk_level" value="${v(fin.risk_level)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        </div>
        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">Exit 부가 설명 (small)<input name="exit_strategy_sub" value="${v(row?.exit_strategy_sub)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">리스크 부가 설명 (small)<input name="risk_memo_sub" value="${v(row?.risk_memo_sub)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>

        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">수익률 시뮬 JSON (roi_projection)<textarea name="roi_projection_json" rows="8" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC;font-family:ui-monospace,monospace;font-size:12px">${escapeHtml(roiText)}</textarea></label>
        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">공실률 추이 JSON (vacancy_trend)<textarea name="vacancy_json" rows="6" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC;font-family:ui-monospace,monospace;font-size:12px">${escapeHtml(vacText)}</textarea></label>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">ROI 지표 보조문구<input name="metric_sub_roi" value="${v(row?.metric_sub_roi)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">기간 지표 보조문구<input name="metric_sub_period" value="${v(row?.metric_sub_period)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">권리 지표 보조문구<input name="metric_sub_land" value="${v(row?.metric_sub_land)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        </div>

        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">전문가 코멘트 (따옴표 없이 본문만)<textarea name="expert_quote" rows="3" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC">${v(row?.expert_quote)}</textarea></label>
        <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">코멘트 출처(footer)<input name="expert_footer" value="${v(row?.expert_footer)}" placeholder="— 현지 실사 에이전트 코멘트" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>

        <p style="color:#94A3B8;font-size:13px;margin:0">현장 사진 URL (Supabase Storage public URL 등)</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">드론<input name="image_drone_url" value="${v(row?.image_drone_url)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">현장<input name="image_site_url" value="${v(row?.image_site_url)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
          <label style="display:flex;flex-direction:column;gap:4px;color:#CBD5E1;font-size:13px">경계<input name="image_boundary_url" value="${v(row?.image_boundary_url)}" style="padding:10px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#F8FAFC" /></label>
        </div>

        <div style="display:flex;gap:12px;margin-top:8px">
          <button type="submit" style="padding:12px 24px;background:#10B981;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">저장 (upsert)</button>
          <button type="button" id="dd-form-close" style="padding:12px 20px;background:#475569;color:#fff;border:none;border-radius:8px;cursor:pointer">닫기</button>
        </div>
        <p id="dd-form-msg" style="min-height:20px;font-size:14px;margin:0"></p>
      </form>
    </div>
  `;

  slot.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('dd-form-close')?.addEventListener('click', () => {
    slot.innerHTML = '';
  });

  document.getElementById('dd-admin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('dd-form-msg');
    const fd = new FormData(e.target);
    const pid = Number(fd.get('property_id'));
    try {
      const roiProjection = parseJsonField(fd.get('roi_projection_json'), [], '수익률 시뮬');
      const vacancyTrend = parseJsonField(fd.get('vacancy_json'), [], '공실률');

      const exitMultipleRaw = fd.get('exit_multiple');
      const exitNum =
        exitMultipleRaw != null && String(exitMultipleRaw).trim() !== ''
          ? Number(exitMultipleRaw)
          : null;

      const payload = {
        property_id: pid,
        is_public: fd.get('is_public') === 'on',
        target_roi: fd.get('target_roi') != null && String(fd.get('target_roi')).trim() !== '' ? Number(fd.get('target_roi')) : 0,
        investment_period: String(fd.get('investment_period') || '').trim() || null,
        land_rights: String(fd.get('land_rights') || '').trim() || null,
        trust_grade: String(fd.get('trust_grade') || '').trim() || null,
        trust_note: String(fd.get('trust_note') || '').trim() || null,
        legal_chip: String(fd.get('legal_chip') || '').trim() || null,
        financial_chip: String(fd.get('financial_chip') || '').trim() || null,
        location_chip: String(fd.get('location_chip') || '').trim() || null,
        legal_status: {
          sertifikat: String(fd.get('legal_sertifikat') || '').trim() || null,
          zoning: String(fd.get('legal_zoning') || '').trim() || null,
          pbg: String(fd.get('legal_pbg') || '').trim() || null,
        },
        location_data: {
          beach_min: fd.get('beach_min') ? Number(fd.get('beach_min')) : null,
          school_min: fd.get('school_min') ? Number(fd.get('school_min')) : null,
          hospital_min: fd.get('hospital_min') ? Number(fd.get('hospital_min')) : null,
          airport_min: fd.get('airport_min') ? Number(fd.get('airport_min')) : null,
        },
        financial_data: {
          exit_multiple: exitNum != null && Number.isFinite(exitNum) ? exitNum : null,
          risk_level: String(fd.get('risk_level') || '').trim() || null,
          roi_projection: roiProjection,
          vacancy_trend: vacancyTrend,
        },
        pdf_url: String(fd.get('pdf_url') || '').trim() || null,
        location_bullet_1: String(fd.get('location_bullet_1') || '').trim() || null,
        location_bullet_2: String(fd.get('location_bullet_2') || '').trim() || null,
        expert_quote: String(fd.get('expert_quote') || '').trim() || null,
        expert_footer: String(fd.get('expert_footer') || '').trim() || null,
        image_drone_url: String(fd.get('image_drone_url') || '').trim() || null,
        image_site_url: String(fd.get('image_site_url') || '').trim() || null,
        image_boundary_url: String(fd.get('image_boundary_url') || '').trim() || null,
        metric_sub_roi: String(fd.get('metric_sub_roi') || '').trim() || null,
        metric_sub_period: String(fd.get('metric_sub_period') || '').trim() || null,
        metric_sub_land: String(fd.get('metric_sub_land') || '').trim() || null,
        legal_footnote: String(fd.get('legal_footnote') || '').trim() || null,
        exit_strategy_sub: String(fd.get('exit_strategy_sub') || '').trim() || null,
        risk_memo_sub: String(fd.get('risk_memo_sub') || '').trim() || null,
      };

      const { error: upErr } = await supabase.from('dd_reports').upsert(payload, { onConflict: 'property_id' });
      if (upErr) {
        if (msg) msg.innerHTML = `<span style="color:#FCA5A5">저장 실패: ${escapeHtml(upErr.message)}</span>`;
        return;
      }
      if (msg) msg.innerHTML = '<span style="color:#6EE7B7">저장되었습니다.</span>';
    } catch (err) {
      if (msg) msg.innerHTML = `<span style="color:#FCA5A5">${escapeHtml(err?.message || String(err))}</span>`;
    }
  });
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
                const pid = escapeHtml(String(prop.id));
                return `
              <div style="background-color:#334155;padding:16px;border-radius:8px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                <img src="${escapeHtml(img)}" alt="" style="width:80px;height:60px;object-fit:cover;border-radius:4px" />
                <div style="flex:1;min-width:160px">
                  <div style="font-weight:bold;color:#F1F5F9">${escapeHtml(prop.title ?? '—')}</div>
                  <div style="font-size:14px;color:#10B981">${formatPrice(prop)} | ROI: ${roi}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;align-items:stretch">
                  <button type="button" class="js-dd-open" data-property-id="${pid}" style="padding:8px 14px;background-color:#0EA5E9;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600">
                    실사보고서 입력
                  </button>
                  <a href="./dd-report.html?propertyId=${pid}" target="_blank" rel="noopener" style="text-align:center;color:#38BDF8;font-size:13px">미리보기 ↗</a>
                </div>
              </div>
            `;
              })
              .join('')}
          </div>
        </div>
      </div>
      <div id="dd-editor-slot" style="margin-top:32px"></div>
    </div>
  `;

  root.querySelectorAll('.js-dd-open').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-property-id'));
      if (!Number.isFinite(id)) return;
      void openDdEditor(supabase, id, listP);
    });
  });

  const deepPid = Number(new URLSearchParams(window.location.search).get('propertyId'));
  if (Number.isFinite(deepPid) && deepPid > 0 && listP.some((p) => Number(p.id) === deepPid)) {
    void openDdEditor(supabase, deepPid, listP);
  }
}

void init();
