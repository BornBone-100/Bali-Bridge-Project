-- Supabase SQL Editor에서 실행 (postgres / service role — RLS 우회)
-- 개발용 시드·테스트 데이터 일괄 정리

-- 1) 실사 보고서 (FK: properties)
DELETE FROM dd_reports WHERE property_id IN (1, 2, 3, 4);

-- 2) 대시보드 DD 타임라인 시드 (전역 — 본인 매물과 무관하게 노출되던 데이터)
DELETE FROM dd_timeline;

-- 3) 대시보드 차트 시드 (id=1 전역 행)
DELETE FROM market_metrics WHERE id = 1;

-- 4) 테스트 매물
DELETE FROM properties WHERE id IN (1, 2, 3, 4);

-- 확인용 (선택)
-- SELECT COUNT(*) FROM properties;
-- SELECT COUNT(*) FROM dd_timeline;
-- SELECT COUNT(*) FROM market_metrics;
