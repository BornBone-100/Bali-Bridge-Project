'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAdmin } from '../lib/useAdmin';

type ConsultationRow = {
  id: string;
  user_id: string;
  property_id: string | number;
  status?: string | null;
  created_at?: string | null;
  properties?: { title: string | null } | null;
};

type PropertyRow = {
  id: string | number;
  title?: string | null;
  image_url?: string | null;
  price_usd?: number | null;
  price?: number | string | null;
  roi?: number | string | null;
};

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [allConsultations, setAllConsultations] = useState<ConsultationRow[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyRow[]>([]);

  useEffect(() => {
    if (isAdmin) {
      void fetchAdminData();
    }
  }, [isAdmin]);

  async function fetchAdminData() {
    const { data: consults, error: consultError } = await supabase
      .from('consultation_requests')
      .select('*, properties(title)')
      .order('created_at', { ascending: false });

    if (consultError) {
      console.error('consultation_requests:', consultError);
    }

    const { data: props, error: propsError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (propsError) {
      console.error('properties:', propsError);
    }

    if (consults) setAllConsultations(consults as ConsultationRow[]);
    if (props) setAllProperties(props as PropertyRow[]);
  }

  function formatPrice(prop: PropertyRow): string {
    const raw = prop.price_usd ?? prop.price;
    if (raw == null) return '—';
    const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(n)) return String(raw);
    return `$${n.toLocaleString('en-US')}`;
  }

  if (adminLoading) return <div>관리자 권한 확인 중... 🛡️</div>;
  if (!isAdmin)
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
        🚨 접근 권한이 없습니다. (관리자 전용)
      </div>
    );

  return (
    <div style={{ padding: '48px', backgroundColor: '#0F172A', minHeight: '100vh', color: '#F8FAFC' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#38BDF8' }}>👑 마스터 컨트롤 타워 (Admin Only)</h1>
        <p style={{ color: '#94A3B8' }}>플랫폼 전체 거래 및 매물 현황을 실시간으로 관리합니다.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '16px' }}>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '20px',
              borderBottom: '1px solid #334155',
              paddingBottom: '10px',
            }}
          >
            💬 실시간 상담 요청 내역 ({allConsultations.length}건)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allConsultations.map((req) => (
              <div key={String(req.id)} style={{ backgroundColor: '#334155', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#F1F5F9' }}>
                    매물: {req.properties?.title ?? '—'}
                  </span>
                  <span style={{ color: '#F59E0B', fontSize: '14px' }}>{req.status ?? '—'}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#CBD5E1' }}>요청자: {req.user_id}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                  {req.created_at ? new Date(req.created_at).toLocaleString() : ''}
                </div>
                <button
                  type="button"
                  style={{
                    marginTop: '12px',
                    padding: '8px',
                    width: '100%',
                    backgroundColor: '#0EA5E9',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  진행 상태 변경 (대기 → 진행중)
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '16px' }}>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '20px',
              borderBottom: '1px solid #334155',
              paddingBottom: '10px',
            }}
          >
            🏠 전체 등록 매물 관리 ({allProperties.length}개)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allProperties.map((prop) => (
              <div
                key={String(prop.id)}
                style={{
                  backgroundColor: '#334155',
                  padding: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <img
                  src={
                    prop.image_url?.trim() ||
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80'
                  }
                  alt="매물"
                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#F1F5F9' }}>{prop.title ?? '—'}</div>
                  <div style={{ fontSize: '14px', color: '#10B981' }}>
                    {formatPrice(prop)} | ROI: {prop.roi != null ? `${prop.roi}%` : '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                  <a
                    href={`/admin.html?propertyId=${encodeURIComponent(String(prop.id))}`}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#0EA5E9',
                      color: '#fff',
                      borderRadius: '6px',
                      fontWeight: 600,
                      textAlign: 'center',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                  >
                    실사보고서 입력 (관리자)
                  </a>
                  <a
                    href={`/dd-report.html?propertyId=${encodeURIComponent(String(prop.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textAlign: 'center', color: '#38BDF8', fontSize: '13px' }}
                  >
                    실사보고서 미리보기 ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
