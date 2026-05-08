-- 1) DD 실사보고서 테이블 생성 (Master 구조)
CREATE TABLE IF NOT EXISTS dd_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id bigint REFERENCES properties(id) UNIQUE NOT NULL, -- 1개 매물당 1개 보고서

  -- 핵심 요약 데이터
  target_roi numeric NOT NULL,             -- 예상 ROI (예: 12.5)
  investment_period text,                  -- 투자 기간 (예: '5년')
  land_rights text,                        -- 토지 권리 형태 (예: 'HGB')

  -- 세부 심사 데이터 (jsonb로 유연 저장)
  legal_status jsonb DEFAULT '{}'::jsonb,  -- 법률 심사
  location_data jsonb DEFAULT '{}'::jsonb, -- 입지 정보
  financial_data jsonb DEFAULT '{}'::jsonb,-- 재무 정보

  pdf_url text,                            -- 원본 PDF 링크
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2) 보안 설정 (로그인 회원만 열람)
ALTER TABLE dd_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "로그인한 유저만 보고서 열람 가능" ON dd_reports;
CREATE POLICY "로그인한 유저만 보고서 열람 가능"
ON dd_reports
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3) 테스트용 데이터 1건
-- 주의: property_id 1은 실제 properties.id에 맞게 바꾸는 것이 안전합니다.
INSERT INTO dd_reports (
  property_id,
  target_roi,
  investment_period,
  land_rights,
  legal_status,
  location_data,
  financial_data
)
VALUES (
  1,
  12.5,
  '5년',
  'HGB (Hak Guna Bangunan)',
  '{"sertifikat": "유효성 확인 완료", "zoning": "관광 지구 (Pink Zone) 확인 완료", "pbg": "승인 대기중"}',
  '{"beach_min": 8, "hospital_min": 14, "airport_min": 45}',
  '{"exit_multiple": 1.45, "risk_level": "안정형"}'
)
ON CONFLICT (property_id) DO NOTHING;
