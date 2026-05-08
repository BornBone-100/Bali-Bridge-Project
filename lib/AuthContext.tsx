import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // (경로는 성준님 파일 위치에 맞게 수정)

// 1. 데이터 주머니(Context) 생성
const AuthContext = createContext<any>(null);

// 2. 앱 전체를 감싸줄 마스터 컴포넌트
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 처음에 로그인한 사람 정보 가져오기
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        // 프로필 테이블에서 이름, 권한 등 추가 정보 가져오기
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };

    void fetchUser();

    // 로그인/로그아웃 상태가 변할 때마다 자동 감지
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 로딩 중일 때는 화면 깜빡임을 방지
  if (loading)
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        인증 정보를 확인 중입니다...
      </div>
    );

  // 자식 컴포넌트(기존 UI)들에게 user와 profile 정보를 뿌려줌
  return <AuthContext.Provider value={{ user, profile }}>{children}</AuthContext.Provider>;
};

// 3. 어디서든 쉽게 꺼내 쓸 수 있게 만드는 마스터 훅(Hook)
export const useAuth = () => {
  return useContext(AuthContext);
};

