'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type PropertyRow = {
  id: string | number;
  title: string;
  location: string;
  image_url: string | null;
  roi: string | number | null;
  price: string | number | null;
  dd_report_url?: string | null;
};

type ConsultForm = {
  name: string;
  phone: string;
  message: string;
};

const emptyForm: ConsultForm = { name: '', phone: '', message: '' };

export default function PropertySearch() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRow | null>(null);
  const [formData, setFormData] = useState<ConsultForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase.from('properties').select('*');

      if (error) console.error('Error loading properties:', error);
      else setProperties((data as PropertyRow[]) || []);
      setLoading(false);
    }

    fetchProperties();
  }, []);

  function handleDownload(url: string | null | undefined) {
    const u = url?.trim();
    if (!u) {
      alert('현재 실사 보고서가 준비 중입니다.');
      return;
    }
    window.open(u, '_blank', 'noopener,noreferrer');
  }

  async function handleSubmitConsultation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProperty) return;

    setSubmitting(true);
    const { error } = await supabase.from('consultations').insert({
      property_id: selectedProperty.id,
      user_name: formData.name,
      user_phone: formData.phone,
      message: formData.message,
    });

    setSubmitting(false);

    if (error) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
      console.error(error);
      return;
    }

    alert('상담 요청이 성공적으로 접수되었습니다. 곧 연락드리겠습니다!');
    setIsModalOpen(false);
    setSelectedProperty(null);
    setFormData(emptyForm);
  }

  function openConsultModal(prop: PropertyRow) {
    setSelectedProperty(prop);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (submitting) return;
    setIsModalOpen(false);
    setSelectedProperty(null);
  }

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>데이터 로딩 중...</div>
    );
  }

  return (
    <div style={{ padding: '48px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '40px' }}>
        🌴 실시간 매물 탐색 (Supabase 연동)
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px',
        }}
      >
        {properties.map((prop) => (
          <div
            key={String(prop.id)}
            style={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                height: '200px',
                backgroundImage: `url(${prop.image_url || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>
                {prop.title}
              </h3>
              <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
                📍 {prop.location}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #eee',
                  paddingTop: '15px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>예상 ROI</div>
                  <div style={{ fontWeight: '800', color: '#059669' }}>{prop.roi}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>금액</div>
                  <div style={{ fontWeight: '800' }}>{prop.price}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => handleDownload(prop.dd_report_url)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#F1F5F9',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  📄 보고서 보기
                </button>
                <button
                  type="button"
                  onClick={() => openConsultModal(prop)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  💬 상담 요청
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div
          role="presentation"
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: '32px',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              boxSizing: 'border-box',
            }}
          >
            <h2 id="consult-modal-title" style={{ margin: '0 0 20px 0', fontSize: '18px' }}>
              {selectedProperty?.title}
              <br />
              <span style={{ fontSize: '16px', color: '#059669', fontWeight: '700' }}>
                상담 요청하기
              </span>
            </h2>

            <form
              onSubmit={handleSubmitConsultation}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <input
                type="text"
                placeholder="성함"
                required autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              <input
                type="tel"
                placeholder="연락처 (예: 010-1234-5678)"
                required
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              <textarea
                placeholder="궁금하신 점을 남겨주세요."
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  resize: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#eee',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    backgroundColor: '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.85 : 1,
                  }}
                >
                  {submitting ? '전송 중…' : '요청 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
