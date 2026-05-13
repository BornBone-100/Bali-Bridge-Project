import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export default function ProfitSimulator() {
  const { user } = useAuth();

  // 💡 사용자가 조작할 입력값 상태
  const [title, setTitle] = useState('짱구 풀빌라 투자 시나리오');
  const [investment, setInvestment] = useState<number>(500000); // 50만 불
  const [monthlyRent, setMonthlyRent] = useState<number>(6500); // 월 6천5백 불
  const [occupancy, setOccupancy] = useState<number>(75); // 가동률 75%

  // 💡 실시간 계산 결과 상태
  const [calculatedRoi, setCalculatedRoi] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // 입력값이 바뀔 때마다 자동으로 ROI 계산!
  useEffect(() => {
    // 1년 총수익 = (월세 * 12개월) * (가동률 / 100)
    const annualRevenue = monthlyRent * 12 * (occupancy / 100);
    // ROI = (1년 총수익 / 총 투자금) * 100
    const roi = investment > 0 ? (annualRevenue / investment) * 100 : 0;

    // 소수점 1자리까지 잘라서 세팅
    setCalculatedRoi(Number(roi.toFixed(1)));
  }, [investment, monthlyRent, occupancy]);

  // 💾 결과를 내 보관함(DB)에 저장하는 함수
  const handleSaveToLocker = async () => {
    if (!user) {
      alert('로그인이 필요합니다!');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profit_simulations').insert({
        user_id: user.id,
        title: title,
        investment_amount: investment,
        monthly_rent: monthlyRent,
        occupancy_rate: occupancy,
        calculated_roi: calculatedRoi,
      });

      if (error) throw error;

      alert('✅ 시뮬레이션 결과가 나의 투자 보관함에 저장되었습니다!');
      window.location.href = '/locker'; // 저장 후 보관함 화면으로 자동 이동
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user)
    return <div style={{ padding: '50px', textAlign: 'center' }}>로그인 후 이용할 수 있습니다.</div>;

  return (
    <div style={{ padding: '48px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <button
        type="button"
        onClick={() => window.history.back()}
        style={{
          marginBottom: '24px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #D1D5DB',
          backgroundColor: '#fff',
          cursor: 'pointer',
        }}
      >
        ⬅️ 돌아가기
      </button>

      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>📈 수익성 시뮬레이터</h1>
        <p style={{ color: '#6B7280', marginBottom: '32px' }}>
          투자금과 운영 조건을 조절하여 예상 수익률을 확인하세요.
        </p>

        {/* 1. 입력 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              시나리오 이름
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              총 투자 금액 (USD)
            </label>
            <input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
            <input
              type="range"
              min={10000}
              max={2000000}
              step={10000}
              value={Math.min(Math.max(investment || 10000, 10000), 2000000)}
              onChange={(e) => setInvestment(Number(e.target.value))}
              style={{ width: '100%', marginTop: '8px', accentColor: '#059669' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                예상 월 임대료 ($)
              </label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
              <input
                type="range"
                min={500}
                max={25000}
                step={100}
                value={Math.min(Math.max(monthlyRent, 500), 25000)}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                style={{ width: '100%', marginTop: '8px', accentColor: '#059669' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                예상 객실 가동률 (%)
              </label>
              <input
                type="number"
                value={occupancy}
                onChange={(e) => setOccupancy(Number(e.target.value))}
                max={100}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.min(Math.max(occupancy, 0), 100)}
                onChange={(e) => setOccupancy(Number(e.target.value))}
                style={{ width: '100%', marginTop: '8px', accentColor: '#059669' }}
              />
            </div>
          </div>
        </div>

        {/* 2. 결과 출력 영역 */}
        <div
          style={{
            marginTop: '40px',
            padding: '24px',
            backgroundColor: '#F0FDF4',
            borderRadius: '12px',
            border: '1px solid #BBF7D0',
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#166534', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            예상 연간 투자 수익률 (ROI)
          </div>
          <div style={{ color: '#15803D', fontSize: '48px', fontWeight: '900' }}>{calculatedRoi}%</div>
        </div>

        <button
          type="button"
          onClick={() => void handleSaveToLocker()}
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '32px',
            backgroundColor: '#059669',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? '저장 중...' : '💾 내 보관함에 시나리오 저장하기'}
        </button>
      </div>
    </div>
  );
}
