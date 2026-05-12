-- 투자 실사보고서(dd_reports) 확장 + RLS (Supabase SQL Editor에서 실행)
-- 기존에 dd_reports_setup.sql 만 적용했다면 이 파일을 이어서 실행하세요.

-- 1) 컬럼 확장 (입력값으로 화면 전체를 채우기 위함)
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS trust_grade text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS trust_note text;

ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS legal_chip text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS financial_chip text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS location_chip text;

ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS location_bullet_1 text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS location_bullet_2 text;

ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS expert_quote text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS expert_footer text;

ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS image_drone_url text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS image_site_url text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS image_boundary_url text;

ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS metric_sub_roi text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS metric_sub_period text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS metric_sub_land text;

ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS legal_footnote text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS exit_strategy_sub text;
ALTER TABLE dd_reports ADD COLUMN IF NOT EXISTS risk_memo_sub text;

-- ROI는 비워 둔 초안을 허용 (관리자 입력 전)
ALTER TABLE dd_reports ALTER COLUMN target_roi DROP NOT NULL;
ALTER TABLE dd_reports ALTER COLUMN target_roi SET DEFAULT 0;

-- 2) RLS 정책 재정의
ALTER TABLE dd_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "로그인한 유저만 보고서 열람 가능" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_read_published" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_admin_read" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_admin_insert" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_admin_update" ON dd_reports;
DROP POLICY IF EXISTS "dd_reports_admin_delete" ON dd_reports;

-- 공개된 보고서: 비로그인 포함 누구나 SELECT
CREATE POLICY "dd_reports_read_published"
ON dd_reports
FOR SELECT
USING (is_public = true);

-- 관리자: 비공개 포함 전체 열람
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

-- (선택) 로그인 일반 회원이 "비공개" 보고서를 볼 수 있게 하려면 별도 정책을 추가하세요.
