-- =====================================================
-- 07_test_accounts.sql
-- 테스트 계정 및 샘플 데이터 생성
-- =====================================================

-- =====================================================
-- 1. 테스트 사용자 계정 생성 (Supabase Auth)
-- =====================================================

-- 주의: 이 스크립트는 Supabase Auth에서 수동으로 사용자를 생성한 후 실행해야 합니다.
-- Supabase 대시보드 > Authentication > Users에서 다음 계정들을 생성하세요:

/*
테스트 계정 목록:

고객 계정:
- Email: customer1@test.com / Password: password123
- Email: customer2@test.com / Password: password123

점주 계정:
- Email: shopowner1@test.com / Password: password123
- Email: shopowner2@test.com / Password: password123

본사 계정:
- Email: hq@test.com / Password: password123
*/

-- =====================================================
-- 2. 프로필 데이터 업데이트 (사용자 생성 후 실행)
-- =====================================================

-- 고객 프로필 업데이트
UPDATE profiles 
SET 
    name = '테스트 고객1',
    phone = '010-1234-5678',
    address = '서울시 강남구 테헤란로 123',
    role = 'customer'
WHERE email = 'customer1@test.com';

UPDATE profiles 
SET 
    name = '테스트 고객2',
    phone = '010-2345-6789',
    address = '서울시 서초구 서초대로 456',
    role = 'customer'
WHERE email = 'customer2@test.com';

-- 점주 프로필 업데이트
UPDATE profiles 
SET 
    name = '테스트 점주1',
    phone = '010-3456-7890',
    address = '서울시 강남구 역삼동 789',
    role = 'store_owner'
WHERE email = 'shopowner1@test.com';

UPDATE profiles 
SET 
    name = '테스트 점주2',
    phone = '010-4567-8901',
    address = '서울시 서초구 서초동 012',
    role = 'store_owner'
WHERE email = 'shopowner2@test.com';

-- 본사 프로필 업데이트
UPDATE profiles 
SET 
    name = '본사 관리자',
    phone = '010-5678-9012',
    address = '서울시 강남구 삼성동 345',
    role = 'hq'
WHERE email = 'hq@test.com';

-- =====================================================
-- 3. 테스트 지점 생성
-- =====================================================

-- 지점 1 (테스트 점주1)
INSERT INTO stores (name, owner_id, address, phone, status, latitude, longitude)
SELECT 
    '강남역점',
    p.id,
    '서울시 강남구 강남대로 123',
    '02-1234-5678',
    'active',
    37.498095,
    127.027610
FROM profiles p 
WHERE p.email = 'shopowner1@test.com'
ON CONFLICT DO NOTHING;

-- 지점 2 (테스트 점주2)
INSERT INTO stores (name, owner_id, address, phone, status, latitude, longitude)
SELECT 
    '서초역점',
    p.id,
    '서울시 서초구 서초대로 456',
    '02-2345-6789',
    'active',
    37.491910,
    127.007940
FROM profiles p 
WHERE p.email = 'shopowner2@test.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. 지점별 상품 재고 설정
-- =====================================================

-- 강남역점 재고 설정
INSERT INTO store_products (store_id, product_id, stock_quantity, safety_stock, price, status)
SELECT 
    s.id,
    p.id,
    CASE 
        WHEN p.name LIKE '%음료%' THEN 50
        WHEN p.name LIKE '%라면%' THEN 30
        WHEN p.name LIKE '%간식%' THEN 40
        WHEN p.name LIKE '%생활용품%' THEN 20
        WHEN p.name LIKE '%주류%' THEN 25
        WHEN p.name LIKE '%아이스크림%' THEN 15
        WHEN p.name LIKE '%도시락%' THEN 10
        ELSE 20
    END as stock_quantity,
    10 as safety_stock,
    p.price as price,
    'active' as status
FROM stores s
CROSS JOIN products p
WHERE s.name = '강남역점' AND p.status = 'active'
ON CONFLICT (store_id, product_id) DO UPDATE SET
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price;

-- 서초역점 재고 설정
INSERT INTO store_products (store_id, product_id, stock_quantity, safety_stock, price, status)
SELECT 
    s.id,
    p.id,
    CASE 
        WHEN p.name LIKE '%음료%' THEN 45
        WHEN p.name LIKE '%라면%' THEN 35
        WHEN p.name LIKE '%간식%' THEN 35
        WHEN p.name LIKE '%생활용품%' THEN 25
        WHEN p.name LIKE '%주류%' THEN 20
        WHEN p.name LIKE '%아이스크림%' THEN 20
        WHEN p.name LIKE '%도시락%' THEN 15
        ELSE 25
    END as stock_quantity,
    10 as safety_stock,
    p.price as price,
    'active' as status
FROM stores s
CROSS JOIN products p
WHERE s.name = '서초역점' AND p.status = 'active'
ON CONFLICT (store_id, product_id) DO UPDATE SET
    stock_quantity = EXCLUDED.stock_quantity,
    price = EXCLUDED.price;

-- =====================================================
-- 5. 샘플 주문 생성
-- =====================================================

-- 고객1의 주문 (강남역점)
INSERT INTO orders (customer_id, store_id, order_number, status, total_amount, payment_method, payment_status, notes)
SELECT 
    c.id,
    s.id,
    '202412010001',
    'completed',
    4500,
    'card',
    'paid',
    '테스트 주문입니다.'
FROM profiles c, stores s
WHERE c.email = 'customer1@test.com' AND s.name = '강남역점'
ON CONFLICT (order_number) DO NOTHING;

-- 고객2의 주문 (서초역점)
INSERT INTO orders (customer_id, store_id, order_number, status, total_amount, payment_method, payment_status, notes)
SELECT 
    c.id,
    s.id,
    '202412010002',
    'preparing',
    3200,
    'mobile',
    'paid',
    '매운 라면 주세요.'
FROM profiles c, stores s
WHERE c.email = 'customer2@test.com' AND s.name = '서초역점'
ON CONFLICT (order_number) DO NOTHING;

-- 고객1의 추가 주문 (강남역점)
INSERT INTO orders (customer_id, store_id, order_number, status, total_amount, payment_method, payment_status, notes)
SELECT 
    c.id,
    s.id,
    '202412010003',
    'pending',
    1800,
    'cash',
    'pending',
    '간식만 주세요.'
FROM profiles c, stores s
WHERE c.email = 'customer1@test.com' AND s.name = '강남역점'
ON CONFLICT (order_number) DO NOTHING;

-- =====================================================
-- 6. 주문 상세 생성
-- =====================================================

-- 주문 1 상세 (코카콜라 2개, 프링글스 1개)
INSERT INTO order_items (order_id, product_id, store_product_id, quantity, unit_price, total_price)
SELECT 
    o.id,
    p.id,
    sp.id,
    2,
    sp.price,
    sp.price * 2
FROM orders o
JOIN stores s ON o.store_id = s.id
JOIN products p ON p.name = '코카콜라 355ml'
JOIN store_products sp ON sp.store_id = s.id AND sp.product_id = p.id
WHERE o.order_number = '202412010001'
ON CONFLICT DO NOTHING;

INSERT INTO order_items (order_id, product_id, store_product_id, quantity, unit_price, total_price)
SELECT 
    o.id,
    p.id,
    sp.id,
    1,
    sp.price,
    sp.price * 1
FROM orders o
JOIN stores s ON o.store_id = s.id
JOIN products p ON p.name = '오리지널 프링글스'
JOIN store_products sp ON sp.store_id = s.id AND sp.product_id = p.id
WHERE o.order_number = '202412010001'
ON CONFLICT DO NOTHING;

-- 주문 2 상세 (신라면 2개, 물 1개)
INSERT INTO order_items (order_id, product_id, store_product_id, quantity, unit_price, total_price)
SELECT 
    o.id,
    p.id,
    sp.id,
    2,
    sp.price,
    sp.price * 2
FROM orders o
JOIN stores s ON o.store_id = s.id
JOIN products p ON p.name = '신라면'
JOIN store_products sp ON sp.store_id = s.id AND sp.product_id = p.id
WHERE o.order_number = '202412010002'
ON CONFLICT DO NOTHING;

INSERT INTO order_items (order_id, product_id, store_product_id, quantity, unit_price, total_price)
SELECT 
    o.id,
    p.id,
    sp.id,
    1,
    sp.price,
    sp.price * 1
FROM orders o
JOIN stores s ON o.store_id = s.id
JOIN products p ON p.name = '물 500ml'
JOIN store_products sp ON sp.store_id = s.id AND sp.product_id = p.id
WHERE o.order_number = '202412010002'
ON CONFLICT DO NOTHING;

-- 주문 3 상세 (맥앤치즈 1개)
INSERT INTO order_items (order_id, product_id, store_product_id, quantity, unit_price, total_price)
SELECT 
    o.id,
    p.id,
    sp.id,
    1,
    sp.price,
    sp.price * 1
FROM orders o
JOIN stores s ON o.store_id = s.id
JOIN products p ON p.name = '맥앤치즈'
JOIN store_products sp ON sp.store_id = s.id AND sp.product_id = p.id
WHERE o.order_number = '202412010003'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. 데이터 확인
-- =====================================================

-- 사용자 프로필 확인
SELECT 
    email as "이메일",
    name as "이름",
    role as "역할",
    status as "상태"
FROM profiles
WHERE email IN ('customer1@test.com', 'customer2@test.com', 'shopowner1@test.com', 'shopowner2@test.com', 'hq@test.com')
ORDER BY role, email;

-- 지점 정보 확인
SELECT 
    s.name as "지점명",
    p.name as "점주명",
    s.address as "주소",
    s.status as "상태"
FROM stores s
JOIN profiles p ON s.owner_id = p.id
ORDER BY s.name;

-- 주문 정보 확인
SELECT 
    o.order_number as "주문번호",
    c.name as "고객명",
    s.name as "지점명",
    o.status as "주문상태",
    o.total_amount as "총액",
    o.payment_status as "결제상태"
FROM orders o
JOIN profiles c ON o.customer_id = c.id
JOIN stores s ON o.store_id = s.id
ORDER BY o.created_at DESC;

-- 재고 현황 확인 (상위 10개)
SELECT 
    s.name as "지점명",
    p.name as "상품명",
    sp.stock_quantity as "현재재고",
    sp.safety_stock as "안전재고",
    CASE 
        WHEN sp.stock_quantity <= sp.safety_stock THEN '⚠️ 부족'
        ELSE '✅ 충분'
    END as "재고상태"
FROM store_products sp
JOIN stores s ON sp.store_id = s.id
JOIN products p ON sp.product_id = p.id
WHERE sp.status = 'active'
ORDER BY sp.stock_quantity ASC
LIMIT 10; 