'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translations } from '../lib/translations';

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
  // 🌐 현재 언어 상태 관리 (기본값: 한국어)
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  // 🌐 번역 도우미 함수: t('키워드') 형태로 사용
  const t = (key: keyof typeof translations.ko) => translations[lang][key];

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
      alert(t('alert_report_not_ready'));
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
      alert(t('alert_consult_error'));
      console.error(error);
      return;
    }

    alert(t('alert_consult_success'));
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
      <div style={{ padding: '50px', textAlign: 'center' }}>{t('loading')}</div>
    );
  }

  return (
    <div style={{ padding: '48px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '40px',
          gap: '16px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1F2937' }}>
          {t('search_title')}
        </h1>

        <div style={{ display: 'flex', backgroundColor: '#E5E7EB', borderRadius: '30px', padding: '4px' }}>
          <button
            onClick={() => setLang('ko')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '26px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: lang === 'ko' ? '#fff' : 'transparent',
              color: lang === 'ko' ? '#111827' : '#6B7280',
              boxShadow: lang === 'ko' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            KOR
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '26px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: lang === 'en' ? '#fff' : 'transparent',
              color: lang === 'en' ? '#111827' : '#6B7280',
              boxShadow: lang === 'en' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            ENG
          </button>
        </div>
      </div>

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
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('card_roi')}</div>
                  <div style={{ fontWeight: '800', color: '#059669' }}>{prop.roi}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('card_price')}</div>
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
                  {t('btn_report')}
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
                  {t('btn_consult')}
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
                {t('modal_consult_title')}
              </span>
            </h2>

            <form
              onSubmit={handleSubmitConsultation}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <input
                type="text"
                placeholder={t('form_name')}
                required autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              <input
                type="tel"
                placeholder={t('form_phone_placeholder')}
                required
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              <textarea
                placeholder={t('form_message_placeholder')}
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
                  {t('btn_cancel')}
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
                  {submitting ? t('btn_submitting') : t('btn_submit_success')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
