import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { useDashboard } from '../lib/useDashboard';
import { useDashboardWidgets } from '../lib/useDashboardWidgets';
import { useAdmin } from '../lib/useAdmin';

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const { stats, loading: statsLoading } = useDashboard();
  const { timeline, marketData, loading: widgetsLoading } = useDashboardWidgets();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const getDotColor = (status: string) => {
    if (status === 'completed') return '#10B981';
    if (status === 'in_progress') return '#3B82F6';
    return '#F59E0B';
  };

  if (!user) return null;

  if (statsLoading || widgetsLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        데이터를 동기화 중입니다... 🔄
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Pretendard', sans-serif",
      }}
    >
      {/* 사이드바 */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#111827',
          color: '#fff',
          padding: '48px 24px',
          position: 'relative',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#059669', marginBottom: '48px' }}>
          BALI BRIDGE
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(5, 150, 105, 0.15)',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: '600',
            }}
          >
            📊 대시보드 홈
          </li>
          <li style={{ padding: '16px 20px', color: '#9CA3AF' }}>💼 나의 투자 자산</li>
        </ul>

        {isAdmin && !adminLoading && (
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/admin';
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0EA5E9',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              👑 관리자 페이지로 이동
            </button>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: '40px', left: '24px' }}>
          <button
            onClick={() => void handleLogout()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 화면 */}
      <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>
              환영합니다, <span style={{ color: '#059669' }}>{stats.userName}</span>님! 👋
            </h1>
            <p style={{ color: '#6B7280', fontSize: '15px' }}>
              로그인한 계정의 실제 DB 데이터가 연동된 화면입니다. ({profile?.name ? '프로필 연동' : '기본 프로필'})
            </p>
          </div>
          {isAdmin && !adminLoading && (
            <button
              type="button"
              onClick={() => {
                window.location.href = '/admin';
              }}
              style={{
                padding: '10px 18px',
                backgroundColor: '#0F172A',
                color: '#38BDF8',
                border: '1px solid #334155',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              👑 관리자 페이지
            </button>
          )}
        </header>

        {/* ⭐ DB에서 가져온 진짜 수치가 들어가는 곳 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' }}>
          <div
            style={{
              backgroundColor: '#fff',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '12px' }}>
              총 투자 자산 (예정)
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>${stats.totalAsset.toLocaleString()}</div>
          </div>
          <div
            style={{
              backgroundColor: '#fff',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '12px' }}>
              참여 중인 프로젝트
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{stats.activeProjects}건</div>
          </div>
          <div
            style={{
              backgroundColor: '#fff',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '12px' }}>보유 매물 수</div>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{stats.totalProperties}개</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', marginTop: '30px' }}>
          <div
            style={{
              flex: 2,
              backgroundColor: '#fff',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>📈 수익성 시뮬레이션</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
              지역별 지가 상승률과 월별 예상 수익을 확인합니다.
            </p>

            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                  지역별 지가 상승률 비교
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '16px',
                    height: '200px',
                    borderBottom: '1px solid #E5E7EB',
                    paddingBottom: '10px',
                  }}
                >
                  {marketData?.regional_growth?.map((item: any, index: number) => (
                    <div
                      key={`${item.region}-${index}`}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                    >
                      <div
                        style={{
                          width: '100%',
                          backgroundColor: index === 0 ? '#A7F3D0' : '#E5E7EB',
                          height: `${item.rate * 8}px`,
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.5s ease',
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>{item.region}</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: '#fff',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>⏳ 실사 보고서(DD) 타임라인</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
              최근 업데이트된 실사 상태를 확인하세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {timeline.map((event: any, index: number) => (
                <div key={event.id ?? `${event.title}-${index}`} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  {index !== timeline.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '5px',
                        top: '24px',
                        bottom: '-20px',
                        width: '2px',
                        backgroundColor: '#E5E7EB',
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getDotColor(event.status),
                      marginTop: '6px',
                      zIndex: 1,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '15px' }}>{event.title}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{event.event_date}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{event.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#111827',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                marginTop: '24px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              실사 대시보드 열기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

