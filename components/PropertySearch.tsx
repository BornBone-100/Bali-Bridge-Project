'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translations } from '../lib/translations';
import { useProperties } from '../lib/useProperties';
import { useAuth } from '../lib/AuthContext';

export type PropertyRow = {
  id: string | number;
  title: string;
  location: string;
  image_url: string | null;
  roi: string | number | null;
  price: string | number | null;
  dd_report_url?: string | null;
};

export default function PropertySearch() {
  // 🌐 현재 언어 상태 관리 (기본값: 한국어)
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const { user } = useAuth();

  // 🌐 번역 도우미 함수: t('키워드') 형태로 사용
  const t = (key: keyof typeof translations.ko) => translations[lang][key];

  const { properties, loading } = useProperties();

  const typedProperties = (properties as PropertyRow[]) || [];

  function formatRoi(value: PropertyRow['roi']) {
    if (value == null) return '-';
    const raw = String(value).trim();
    if (!raw) return '-';
    return raw.includes('%') ? raw : `${raw}%`;
  }

  function formatPrice(value: PropertyRow['price']) {
    if (value == null) return '-';
    if (typeof value === 'number') return `$${value.toLocaleString()}`;
    const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
    if (Number.isFinite(numeric) && numeric > 0) return `$${numeric.toLocaleString()}`;
    return String(value);
  }

  function handleDownload(url: string | null | undefined) {
    const u = url?.trim();
    if (!u) {
      alert(t('alert_report_not_ready'));
      return;
    }
    window.open(u, '_blank', 'noopener,noreferrer');
  }

  // 🎯 상담 요청 버튼 클릭 시 실행되는 마스터 함수
  const handleConsultRequest = async (propertyId: string | number, propertyTitle: string) => {
    // 1. 로그인 확인
    if (!user) {
      alert('상담을 요청하려면 로그인이 필요합니다. 🔒');
      window.location.href = '/login';
      return;
    }

    try {
      // 2. DB의 consultation_requests 테이블에 데이터 저장
      const { error } = await supabase.from('consultation_requests').insert({
        user_id: user.id,
        property_id: String(propertyId),
      });

      // 3. 결과에 따른 메시지 처리
      if (error) {
        if (error.code === '23505') {
          alert('이미 상담이 접수된 매물입니다. 담당자의 연락을 기다려주세요! ⏳');
        } else {
          throw error;
        }
      } else {
        alert(
          `✅ [${propertyTitle}] 상담 요청이 성공적으로 접수되었습니다!\n빠른 시일 내에 이메일로 연락드리겠습니다.`
        );
      }
    } catch (error) {
      console.error('요청 실패:', error);
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>{t('loading')}</div>
    );
  }

  return (
    <div style={{ padding: '48px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '40px',
          gap: '16px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1F2937' }}>
          {t('search_title')}
        </h1>

        <div style={{ display: 'flex', backgroundColor: '#E5E7EB', borderRadius: '30px', padding: '4px' }}>
          <button
            onClick={() => setLang('ko')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '26px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: lang === 'ko' ? '#fff' : 'transparent',
              color: lang === 'ko' ? '#111827' : '#6B7280',
              boxShadow: lang === 'ko' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            KOR
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '26px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: lang === 'en' ? '#fff' : 'transparent',
              color: lang === 'en' ? '#111827' : '#6B7280',
              boxShadow: lang === 'en' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            ENG
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px',
        }}
      >
        {typedProperties.map((prop) => (
          <div
            key={String(prop.id)}
            style={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                height: '200px',
                backgroundImage: `url(${prop.image_url || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>
                {prop.title}
              </h3>
              <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
                📍 {prop.location}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #eee',
                  paddingTop: '15px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('card_roi')}</div>
                  <div style={{ fontWeight: '800', color: '#059669' }}>{formatRoi(prop.roi)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('card_price')}</div>
                  <div style={{ fontWeight: '800' }}>{formatPrice(prop.price)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => handleDownload(prop.dd_report_url)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#F1F5F9',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {t('btn_report')}
                </button>
                <button
                  type="button"
                  onClick={() => void handleConsultRequest(prop.id, prop.title)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {t('btn_consult')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
