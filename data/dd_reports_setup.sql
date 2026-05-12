-- 투자 실사보고서 테이블 (최초 1회) + RLS
-- 시드 INSERT는 넣지 않습니다. 관리자 화면에서 입력 후 is_public=true 로 공개하세요.

CREATE TABLE IF NOT EXISTS dd_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id bigint REFERENCES properties(id) UNIQUE NOT NULL,

  target_roi numeric DEFAULT 0,
  investment_period text,
  land_rights text,

  legal_status jsonb DEFAULT '{}'::jsonb,
  location_data jsonb DEFAULT '{}'::jsonb,
  financial_data jsonb DEFAULT '{}'::jsonb,

  pdf_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  is_public boolean NOT NULL DEFAULT false,

  trust_grade text,
  trust_note text,
  legal_chip text,
  financial_chip text,
  location_chip text,
  location_bullet_1 text,
  location_bullet_2 text,
  expert_quote text,
  expert_footer text,
  image_drone_url text,
  image_site_url text,
  image_boundary_url text,
  metric_sub_roi text,
  metric_sub_period text,
  metric_sub_land text,
  legal_footnote text,
  exit_strategy_sub text,
  risk_memo_sub text
);

-- 이미 예전 DDL로 테이블만 만든 경우: dd_reports_upgrade.sql 실행

ALTER TABLE dd_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "로그인한 유저만 보고서 열람 가능" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_read_published" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_admin_read" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_admin_insert" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_admin_update" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_admin_delete" ON dd_reports;

CREATE POLICY "dd_reports_read_published"
ON dd_reports
FOR SELECT
USING (is_public = true);

CREATE POLICY "dd_reports_admin_read"
ON dd_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
);

CREATE POLICY "dd_reports_admin_insert"
ON dd_reports
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
);

CREATE POLICY "dd_reports_admin_update"
ON dd_reports
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
);

CREATE POLICY "dd_reports_admin_delete"
ON dd_reports
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
);
