import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useDashboardWidgets() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWidgets() {
      try {
        // 1. 타임라인 데이터 가져오기 (최신 날짜순으로 5개만)
        const { data: timelineData } = await supabase
          .from('dd_timeline')
          .select('*')
          .order('event_date', { ascending: false })
          .limit(5);

        // 2. 차트 데이터 가져오기
        const { data: metricsData } = await supabase
          .from('market_metrics')
          .select('*')
          .eq('id', 1)
          .single();

        if (timelineData) setTimeline(timelineData);
        if (metricsData) setMarketData(metricsData);
      } catch (error) {
        console.error('위젯 데이터 로딩 에러:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchWidgets();
  }, []);

  return { timeline, marketData, loading };
}
