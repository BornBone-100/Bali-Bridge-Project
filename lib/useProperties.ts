import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // 프로젝트 경로에 맞게 수정

export function useProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        // Supabase의 'properties' 테이블에서 모든 데이터를 가져와라!
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false }); // 최신 등록순 정렬

        if (error) throw error;
        if (data) setProperties(data);
      } catch (error) {
        console.error('매물 데이터를 불러오지 못했습니다:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchProperties();
  }, []);

  return { properties, loading };
}

