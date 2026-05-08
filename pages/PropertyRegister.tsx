import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export default function PropertyRegister() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price_usd: '',
    roi: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        🔒 매물 등록은 로그인(에이전트/집주인) 후 이용 가능합니다.
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('properties').insert({
        owner_id: user.id,
        title: formData.title,
        location: formData.location,
        price_usd: Number(formData.price_usd),
        roi: Number(formData.roi),
        image_url:
          formData.image_url ||
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        status: '모집중',
      });

      if (error) throw error;

      alert('🎉 매물이 성공적으로 등록되었습니다!');
      window.location.href = '/';
    } catch (error) {
      console.error('등록 에러:', error);
      alert('매물 등록에 실패했습니다. 빈 칸이 없는지 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        padding: '48px',
        fontFamily: "'Pretendard', sans-serif",
      }}
    >
      <button
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
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>🏠 신규 매물 등록</h1>
        <p style={{ color: '#6B7280', marginBottom: '32px' }}>에이전트 및 호스트 전용 매물 등록 페이지입니다.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              매물 이름 (Title)
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="예: Canggu Luxury Pool Villa"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              지역 (Location)
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="예: Canggu, Bali"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                투자 금액 (USD)
              </label>
              <input
                type="number"
                name="price_usd"
                required
                value={formData.price_usd}
                onChange={handleChange}
                placeholder="예: 500000"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                예상 수익률 (ROI %)
              </label>
              <input
                type="number"
                step="0.1"
                name="roi"
                required
                value={formData.roi}
                onChange={handleChange}
                placeholder="예: 15.2"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              대표 이미지 URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '16px',
              backgroundColor: '#059669',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '등록 중...' : '🚀 매물 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
