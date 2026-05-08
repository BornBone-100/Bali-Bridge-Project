import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // (경로는 프로젝트에 맞게 확인해주세요)

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);

  // 📊 유저 이름과 DB에서 가져올 실제 수치 상태 관리
  const [dashboardData, setDashboardData] = useState({
    userName: '고객',
    totalAsset: 0, // 총 투자 금액
    activeProjects: 0, // 진행 중인 실사
    totalProperties: 0, // 보유 매물 수
  });

  useEffect(() => {
    void fetchRealUserData();
  }, []);

  const fetchRealUserData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const user = session.user;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || '고객';

      // DB에서 데이터 가져오기
      const { data: assetData } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (assetData) {
        setDashboardData({
          userName: name,
          totalAsset: assetData.total_asset || 0,
          activeProjects: assetData.active_projects || 0,
          totalProperties: assetData.total_properties || 0,
        });
      } else {
        // ⭐ 핵심: 처음 가입해서 DB에 데이터가 아예 없으면 전부 0으로 세팅!
        setDashboardData({ userName: name, totalAsset: 0, activeProjects: 0, totalProperties: 0 });
      }
    } catch (error) {
      console.error('DB 연동 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        데이터를 불러오는 중입니다... ⏳
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
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>
            환영합니다, <span style={{ color: '#059669' }}>{dashboardData.userName}</span>님! 👋
          </h1>
          <p style={{ color: '#6B7280', fontSize: '15px' }}>
            로그인한 계정의 실제 DB 데이터가 연동된 화면입니다.
          </p>
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
            <div style={{ fontSize: '32px', fontWeight: '800' }}>${dashboardData.totalAsset.toLocaleString()}</div>
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
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{dashboardData.activeProjects}건</div>
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
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{dashboardData.totalProperties}개</div>
          </div>
        </div>
      </main>
    </div>
  );
}

