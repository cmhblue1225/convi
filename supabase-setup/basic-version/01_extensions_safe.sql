-- =====================================================
-- 01_extensions_safe.sql
-- Supabase에서 안전하게 사용할 수 있는 PostgreSQL 확장 기능 활성화
-- =====================================================

-- UUID 생성 함수 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 실시간 기능 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- JSON 처리 기능 활성화 (선택사항)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- 주의사항:
-- =====================================================

-- ❌ timezone 확장: Supabase에서 지원하지 않음
-- CREATE EXTENSION IF NOT EXISTS "timezone";

-- ❌ unaccent 확장: 일부 Supabase 프로젝트에서 지원하지 않을 수 있음
-- CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =====================================================
-- PostgreSQL 내장 타임존 기능 사용
-- =====================================================

-- 타임존 설정 확인
SELECT 
    name as "타임존",
    abbrev as "약어",
    utc_offset as "UTC 오프셋"
FROM pg_timezone_names 
WHERE name IN ('Asia/Seoul', 'UTC', 'Asia/Tokyo')
ORDER BY name;

-- 현재 타임존 설정
SHOW timezone;

-- =====================================================
-- 확장 기능 확인
-- =====================================================
SELECT 
    extname as "확장 기능",
    extversion as "버전",
    CASE 
        WHEN extname = 'uuid-ossp' THEN '✅ UUID 생성'
        WHEN extname = 'pgcrypto' THEN '✅ 암호화'
        WHEN extname = 'pg_stat_statements' THEN '✅ 성능 모니터링'
        ELSE '기타'
    END as "용도"
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements')
ORDER BY extname; 