'use client';

import React from 'react';
import { supabase } from '../lib/supabaseClient';

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const LoginPage = () => {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin.replace(/\/$/, '')}/dashboard.html`
            : undefined,
      },
    });

    if (error) {
      console.error('구글 로그인 에러:', error.message);
      alert('로그인 중 문제가 발생했습니다.');
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
      }}
    >
      <div
        style={{
          width: '400px',
          maxWidth: 'calc(100% - 32px)',
          padding: '48px',
          backgroundColor: '#fff',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#059669',
            borderRadius: '12px',
            margin: '0 auto 24px',
          }}
        />
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#111827',
            margin: '0 0 8px 0',
          }}
        >
          Bali Bridge Partners
        </h2>
        <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 32px 0' }}>
          발리 부동산 투자의 시작
        </p>

        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#fff',
            color: '#374151',
            border: '1px solid #D1D5DB',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            fontFamily: 'inherit',
          }}
        >
          <GoogleMark />
          구글 계정으로 시작하기
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
