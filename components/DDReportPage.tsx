import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { useDDReport } from '../lib/useDDReport';

type DDReportPageProps = {
  propertyId?: string | number;
};

export default function DDReportPage({ propertyId = 1 }: DDReportPageProps) {
  const { user } = useAuth();
  const { report, loading, error } = useDDReport(propertyId);

  if (!user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        🔒 프리미엄 실사보고서는 로그인 후 열람할 수 있습니다.
      </div>
    );
  }

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>데이터를 분석 중입니다... 📊</div>;
  if (error || !report) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>아직 이 매물의 실사보고서가 등록되지 않았습니다.</div>;
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', padding: '48px', minHeight: '100vh' }}>
      <header>
        <h1>실사보고서 (Due Diligence)</h1>
      </header>

      <div style={{ display: 'flex', gap: '24px', marginTop: '30px' }}>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '16px' }}>
          <div style={{ color: '#6B7280' }}>예상 ROI</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#059669' }}>{report.target_roi}%</div>
        </div>

        <div style={{ flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '16px' }}>
          <div style={{ color: '#6B7280' }}>투자 기간</div>
          <div style={{ fontSize: '32px', fontWeight: '800' }}>{report.investment_period || '-'}</div>
        </div>
      </div>

      <div style={{ marginTop: '40px', backgroundColor: '#fff', padding: '32px', borderRadius: '16px' }}>
        <h3>⚖️ 법률 심사 (Legal Verification)</h3>
        <ul style={{ marginTop: '20px', lineHeight: '2' }}>
          <li>✅ 토지 증명서: {report.legal_status?.sertifikat || '확인 중'}</li>
          <li>✅ 용도 확인: {report.legal_status?.zoning || '확인 중'}</li>
          <li>⏳ 건축 허가: {report.legal_status?.pbg || '확인 중'}</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px', backgroundColor: '#fff', padding: '32px', borderRadius: '16px' }}>
        <h3>📍 입지 및 인프라 (Location Intelligence)</h3>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
            비치클럽까지: {report.location_data?.beach_min || 0}분
          </div>
          <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
            병원까지: {report.location_data?.hospital_min || 0}분
          </div>
        </div>
      </div>

      {report.pdf_url && (
        <button
          type="button"
          onClick={() => window.open(report.pdf_url || '', '_blank', 'noopener,noreferrer')}
          style={{
            marginTop: '40px',
            padding: '16px 32px',
            backgroundColor: '#111827',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          📄 원본 PDF 보고서 다운로드
        </button>
      )}
    </div>
  );
}
