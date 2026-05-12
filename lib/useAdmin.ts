// lib/useAdmin.ts
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    async function checkAdmin() {
      try {
        // 내 아이디가 admin_users 테이블에 존재하는지 확인
        const { data, error } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          setIsAdmin(false);
          return;
        }

        if (data) {
          setIsAdmin(true); // 명단에 있으면 관리자 모드 ON!
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    void checkAdmin();
  }, [user]);

  return { isAdmin, loading };
}
