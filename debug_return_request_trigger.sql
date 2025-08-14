-- =====================================================
-- 반품 요청 트리거 디버깅 SQL
-- =====================================================

-- 1. 트리거가 존재하는지 확인
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name,
    tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'trigger_handle_return_request_approval';

-- 2. return_requests 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'return_requests'
ORDER BY ordinal_position;

-- 3. return_request_items 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'return_request_items'
ORDER BY ordinal_position;

-- 4. 최근 반품 요청 상태 확인
SELECT 
    id,
    request_number,
    status,
    store_id,
    approved_by,
    approved_at,
    created_at,
    updated_at
FROM return_requests
ORDER BY created_at DESC
LIMIT 5;

-- 5. 최근 반품 요청 아이템 확인
SELECT 
    rri.id,
    rri.return_request_id,
    rri.product_id,
    rri.product_name,
    rri.requested_quantity,
    rri.approved_quantity,
    rr.request_number,
    rr.status
FROM return_request_items rri
JOIN return_requests rr ON rri.return_request_id = rr.id
ORDER BY rr.created_at DESC
LIMIT 10;

-- 6. 조민혁 관련 반품 요청 찾기 (사용자명으로 검색)
SELECT 
    rr.id,
    rr.request_number,
    rr.status,
    rr.store_id,
    s.name as store_name,
    p.full_name as requester_name,
    rr.created_at,
    rr.approved_at
FROM return_requests rr
LEFT JOIN stores s ON rr.store_id = s.id
LEFT JOIN profiles p ON rr.requested_by = p.id
WHERE p.full_name LIKE '%조민혁%' OR p.full_name LIKE '%민혁%'
ORDER BY rr.created_at DESC;

-- 7. 최근 재고 거래 이력 확인 (반품 관련)
SELECT 
    it.id,
    it.transaction_type,
    it.quantity,
    it.previous_quantity,
    it.new_quantity,
    it.reference_type,
    it.reference_id,
    it.reason,
    it.created_at,
    sp.product_id,
    p.name as product_name,
    s.name as store_name
FROM inventory_transactions it
LEFT JOIN store_products sp ON it.store_product_id = sp.id
LEFT JOIN products p ON sp.product_id = p.id
LEFT JOIN stores s ON sp.store_id = s.id
WHERE it.reference_type = 'return_request'
ORDER BY it.created_at DESC
LIMIT 10;

-- 8. 함수가 존재하는지 확인
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_return_request_approval';


