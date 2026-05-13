-- Supabase SQL Editor에서 실행 (service role / postgres — RLS 우회)
-- anon 키 REST DELETE는 RLS 때문에 dd_reports 행이 남을 수 있습니다.

DELETE FROM dd_reports WHERE property_id IN (1, 2, 3, 4);

DELETE FROM properties WHERE id IN (1, 2, 3, 4);

-- 삭제 확인
-- SELECT id, title FROM properties ORDER BY id;
