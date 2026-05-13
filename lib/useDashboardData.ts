import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

function parseRoi(value: unknown) {
  if (value == null) return 0;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: { totalInvestment: 0, avgRoi: null as number | null, ongoingDd: 0, ownedProperties: 0 },
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
        const { data: sims } = await supabase
          .from('profit_simulations')
          .select('investment_amount, calculated_roi, created_at')
          .eq('user_id', user.id);

        let totalInv = 0;
        let roiSum = 0;
        let roiCount = 0;
        (sims || []).forEach((s) => {
          totalInv += Number(s.investment_amount) || 0;
          const r = parseRoi(s.calculated_roi);
          if (r > 0) {
            roiSum += r;
            roiCount += 1;
          }
        });
        const avgRoi = roiCount > 0 ? Number((roiSum / roiCount).toFixed(1)) : null;

        const { data: ownedProps } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        const props = ownedProps || [];
        const propertyIds = props.map((p) => p.id).filter(Boolean);

        let timeline: any[] = [];
        if (propertyIds.length) {
          const { data: dds } = await supabase
            .from('dd_timeline')
            .select('*')
            .in('property_id', propertyIds)
            .order('event_date', { ascending: false })
            .limit(5);
          timeline = dds || [];
        }

        const ongoingCount = timeline.filter((dd) => dd.status !== 'completed').length;

        let metrics = null;
        const { data: userMetrics } = await supabase
          .from('market_metrics')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (userMetrics) metrics = userMetrics;

        setData({
          stats: {
            totalInvestment: totalInv,
            avgRoi,
            ongoingDd: ongoingCount,
            ownedProperties: props.length,
          },
          timeline,
          marketMetrics: metrics,
          recommendedProperties: props.slice(0, 3),
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
