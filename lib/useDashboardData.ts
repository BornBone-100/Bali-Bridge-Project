import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: { totalInvestment: 0, avgRoi: 0, ongoingDd: 0, ownedProperties: 0 },
    timeline: [] as any[],
    marketMetrics: null as any,
    recommendedProperties: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchAllData() {
      try {
        // 1. 시뮬레이션 보관함에서 총 투자금과 평균 ROI 계산
        const { data: sims } = await supabase
          .from('profit_simulations')
          .select('investment_amount, calculated_roi')
          .eq('user_id', user.id);
        let totalInv = 0;
        let avgRoi = 0;
        if (sims && sims.length > 0) {
          totalInv = sims.reduce((acc, curr) => acc + curr.investment_amount, 0);
          avgRoi = sims.reduce((acc, curr) => acc + curr.calculated_roi, 0) / sims.length;
        }

        // 2. 타임라인 및 진행 중인 실사 개수
        const { data: dds } = await supabase
          .from('dd_timeline')
          .select('*')
          .order('event_date', { ascending: false })
          .limit(5);
        const ongoingCount = dds?.filter((dd) => dd.status !== 'completed').length || 0;

        // 3. 내가 등록한 보유 매물 수
        const { count: propsCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        // 4. 차트용 마켓 데이터 가져오기 (테이블에 id=1인 데이터가 있다고 가정)
        const { data: metrics } = await supabase.from('market_metrics').select('*').eq('id', 1).single();

        // 5. 최신 등록 매물 3개를 '추천 매물'로 가져오기
        const { data: recProps } = await supabase
          .from('properties')
          .select('*')
          .eq('status', '모집중')
          .order('created_at', { ascending: false })
          .limit(3);

        // 6. 모든 데이터를 하나의 state에 담아 화면으로 던집니다.
        setData({
          stats: {
            totalInvestment: totalInv,
            avgRoi: Number(avgRoi.toFixed(1)),
            ongoingDd: ongoingCount,
            ownedProperties: propsCount || 0,
          },
          timeline: dds || [],
          marketMetrics: metrics,
          recommendedProperties: recProps || [],
        });
      } catch (error) {
        console.error('대시보드 데이터 로딩 에러:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchAllData();
  }, [user]);

  return { ...data, loading };
}
