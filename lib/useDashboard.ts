import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

type DashboardStats = {
  userName: string;
  totalAsset: number;
  activeProjects: number;
  totalProperties: number;
};

export function useDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    userName: '고객',
    totalAsset: 0,
    activeProjects: 0,
    totalProperties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const name = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || '고객';
        const { data: assetData } = await supabase.from('user_assets').select('*').eq('user_id', user.id).single();

        if (assetData) {
          setStats({
            userName: name,
            totalAsset: assetData.total_asset || 0,
            activeProjects: assetData.active_projects || 0,
            totalProperties: assetData.total_properties || 0,
          });
        } else {
          setStats({ userName: name, totalAsset: 0, activeProjects: 0, totalProperties: 0 });
        }
      } catch (error) {
        console.error('대시보드 통계 로딩 에러:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchStats();
  }, [user, profile]);

  return { stats, loading };
}
