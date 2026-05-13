'use client';

import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { useDashboardData } from '../lib/useDashboardData';

export default function DashboardHome() {
  const { user } = useAuth();

  // 💡 여기서 백엔드 데이터를 모두 가져옵니다!
  const { stats, timeline, marketMetrics, recommendedProperties, loading } = useDashboardData();

  if (!user) return <div style={{ padding: '50px' }}>로그인이 필요합니다.</div>;
  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>데이터 동기화 중... 🔄</div>;

  const chartHint =
    marketMetrics != null
      ? '차트 데이터 준비 중... (market_metrics 연동됨)'
      : '시뮬레이션·내 매물 데이터가 있으면 차트가 표시됩니다.';

  const displayName =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '투자자';
  const avgRoiLabel = stats.avgRoi != null && stats.avgRoi > 0 ? `${stats.avgRoi}%` : '-';

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        padding: '32px',
        minHeight: '100vh',
        fontFamily: "'Pretendard', sans-serif",
      }}
    >
      {/* 1. 상단 환영 메시지 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1F2937' }}>환영합니다, {displayName}님 👋</h1>
        <p style={{ color: '#6B7280' }}>오늘의 핵심 지표와 실사 진행 상황을 한 화면에서 확인하세요.</p>
      </div>

      {/* 2. 상단 요약 카드 4개 (백엔드 데이터 자동 계산) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {[
          { title: '총 투자 금액', value: `$${stats.totalInvestment.toLocaleString()}`, sub: '누적 투자' },
          { title: '평균 예상 수익률(ROI)', value: avgRoiLabel, sub: '내 시뮬레이션 평균' },
          { title: '진행 중인 실사', value: `${stats.ongoingDd}건`, sub: '전체 진행 중' },
          { title: '보유 매물 수', value: `${stats.ownedProperties}개`, sub: '현재 호스트/에이전트' },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{card.title}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#059669',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 'bold',
          border: 'none',
          marginBottom: '24px',
          cursor: 'pointer',
        }}
        onClick={() => {
          window.location.href = '/property-register';
        }}
      >
        + 신규 매물 등록하기
      </button>

      {/* 3. 중간 영역: 차트(왼쪽) & 실사 타임라인(오른쪽) */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* 왼쪽 차트 (임시 UI 처리 - 추후 실제 차트 라이브러리 연동 가능) */}
        <div style={{ flex: 2, backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>📈 수익성 시뮬레이션</h3>
            <button
              type="button"
              style={{ fontSize: '12px', color: '#3B82F6', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              onClick={() => {
                window.location.href = '/dd-select';
              }}
            >
              DD 보고서 보기
            </button>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
            지역별 지가 상승률과 월별 예상 배당 수익을 확인합니다.
          </p>
          <div
            style={{
              height: '200px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9CA3AF',
            }}
          >
            {chartHint}
          </div>
        </div>

        {/* 오른쪽 실사 타임라인 */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>⏳ 실사 보고서(DD) 타임라인</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {timeline.length === 0 ? (
              <div style={{ color: '#9CA3AF', fontSize: '14px' }}>진행 중인 실사가 없습니다.</div>
            ) : (
              timeline.map((event: any, i: number) => (
                <div key={event.id ?? i} style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: event.status === 'completed' ? '#10B981' : '#3B82F6',
                      marginTop: '4px',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1F2937' }}>{event.title}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{event.description}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{event.event_date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. 하단 추천 매물 영역 */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>💡 내 등록 매물</h3>
          <button
            type="button"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '20px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => {
              window.location.href = '/property-explorer';
            }}
          >
            매물 더보기
          </button>
        </div>

        {/* DB에서 가져온 매물 리스트를 카드 형태로 출력 */}
        {recommendedProperties.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#9CA3AF',
              backgroundColor: '#F9FAFB',
              borderRadius: '12px',
            }}
          >
            현재 등록한 매물이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {recommendedProperties.map((prop: any) => (
              <div key={prop.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <img
                  src={
                    prop.image_url ||
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
                  }
                  alt={prop.title}
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                />
                <div style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>{prop.title}</div>
                  <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '12px' }}>{prop.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#059669' }}>${prop.price_usd?.toLocaleString?.() ?? prop.price_usd}</span>
                    <span
                      style={{
                        fontSize: '12px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      ROI {prop.roi}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
