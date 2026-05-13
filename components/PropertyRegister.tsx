'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export default function PropertyRegister() {
  const { user } = useAuth();

  // 💡 기존 상태에 법률/상세 정보 항목 추가
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price_usd: '',
    roi: '',
    image_url: '',
    land_rights: 'Leasehold', // 기본값
    zoning: 'Pink (관광/상업)', // 기본값
    pbg_status: '진행 중', // 기본값
    description: '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>🔒 매물 등록은 로그인 후 이용 가능합니다.</div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 💡 DB에 새롭게 추가된 데이터까지 모두 밀어넣기
      const { error } = await supabase.from('properties').insert({
        owner_id: user.id,
        title: formData.title,
        location: formData.location,
        price_usd: Number(formData.price_usd),
        roi: Number(formData.roi),
        image_url:
          formData.image_url ||
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        land_rights: formData.land_rights,
        zoning: formData.zoning,
        pbg_status: formData.pbg_status,
        description: formData.description,
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
          maxWidth: '650px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>🏠 신규 매물 등록</h1>
        <p style={{ color: '#6B7280', marginBottom: '32px' }}>에이전트 및 호스트 신규 매물 등록 페이지입니다.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. 기본 정보 섹션 */}
          <div
            style={{
              padding: '20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#1F2937' }}>기본 정보</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
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

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
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
            </div>
          </div>

          {/* 2. 법률 및 검토 정보 섹션 (새로 추가됨) */}
          <div
            style={{
              padding: '20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#1F2937' }}>
              법률 및 상세 검토 (Legal & Details)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    토지 권리 (Land Rights)
                  </label>
                  <select
                    name="land_rights"
                    value={formData.land_rights}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#fff',
                    }}
                  >
                    <option value="Leasehold">Leasehold (임대차)</option>
                    <option value="Freehold (Hak Milik)">Freehold (Hak Milik)</option>
                    <option value="HGB (Hak Guna Bangunan)">HGB (법인 소유권)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    용도 지역 (Zoning)
                  </label>
                  <select
                    name="zoning"
                    value={formData.zoning}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#fff',
                    }}
                  >
                    <option value="Pink (관광/상업)">Pink (관광/상업 지역)</option>
                    <option value="Yellow (주거)">Yellow (주거 지역)</option>
                    <option value="Green (농업/건축불가)">Green (농업/건축불가)</option>
                    <option value="확인 중">아직 모름 (확인 중)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  건축 허가 (PBG Status)
                </label>
                <select
                  name="pbg_status"
                  value={formData.pbg_status}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="승인 완료">승인 완료 (Approved)</option>
                  <option value="진행 중">진행 중 (In Progress)</option>
                  <option value="미신청">미신청 (Not Applied)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  상세 설명 및 특이사항
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="매물의 장점이나 법률적 특이사항, 주변 인프라 등을 자유롭게 적어주세요."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3. 미디어 및 등록 버튼 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
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
              marginTop: '10px',
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
            {loading ? '검토 및 등록 중...' : '🚀 매물 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
