-- =====================================================
-- 01_extensions_advanced.sql
-- 고급 스키마를 위한 PostgreSQL 확장 기능 활성화
-- =====================================================

-- =====================================================
-- 1. 필수 확장 기능
-- =====================================================

-- UUID 생성 함수 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 실시간 기능 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- JSON 처리 기능 활성화 (필수 - 고급 기능용)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- 2. 고급 기능 확장
-- =====================================================

-- PostGIS 지리 정보 시스템 (지점 위치 관리용)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- PostGIS Topology (고급 지리 기능)
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- =====================================================
-- 3. 성능 및 모니터링 확장
-- =====================================================

-- 성능 모니터링 (선택사항)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- 주의사항:
-- =====================================================

-- ❌ timezone 확장: Supabase에서 지원하지 않음
-- CREATE EXTENSION IF NOT EXISTS "timezone";

-- ❌ unaccent 확장: 일부 Supabase 프로젝트에서 지원하지 않을 수 있음
-- CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =====================================================
-- 4. PostgreSQL 내장 타임존 기능 사용
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
-- 5. 확장 기능 확인
-- =====================================================
SELECT 
    extname as "확장 기능",
    extversion as "버전",
    CASE 
        WHEN extname = 'uuid-ossp' THEN '✅ UUID 생성'
        WHEN extname = 'pgcrypto' THEN '✅ 암호화'
        WHEN extname = 'pg_stat_statements' THEN '✅ 성능 모니터링'
        WHEN extname = 'postgis' THEN '✅ 지리 정보 시스템'
        WHEN extname = 'postgis_topology' THEN '✅ 지리 토폴로지'
        ELSE '기타'
    END as "용도"
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements', 'postgis', 'postgis_topology')
ORDER BY extname;

-- =====================================================
-- 6. PostGIS 버전 확인
-- =====================================================
SELECT 
    PostGIS_Version() as "PostGIS 버전",
    PostGIS_GEOS_Version() as "GEOS 버전",
    PostGIS_Proj_Version() as "Proj 버전";

-- =====================================================
-- 7. 공간 참조 시스템 확인
-- =====================================================
SELECT 
    srid as "SRID",
    auth_name as "권한명",
    srtext as "공간 참조 텍스트"
FROM spatial_ref_sys 
WHERE srid IN (4326, 3857, 5181)  -- WGS84, Web Mercator, Korea 2000
ORDER BY srid; 