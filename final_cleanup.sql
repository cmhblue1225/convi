-- =====================================================
-- 마지막 정리: return_status_history 테이블 삭제
-- =====================================================

-- return_status_history 테이블 삭제 (우리가 실수로 만든 것)
DROP TABLE IF EXISTS return_status_history CASCADE;

-- 정리 완료 확인
SELECT 
    'final_cleanup_completed' as status,
    'All unnecessary return-related tables removed' as message;

-- return 관련 테이블이 모두 사라졌는지 확인
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%return%'
ORDER BY table_name;



