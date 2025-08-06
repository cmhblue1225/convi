-- =====================================================
-- 07_test_accounts_advanced.sql
-- 고급 테스트 계정 및 샘플 데이터 생성
-- =====================================================

-- =====================================================
-- 1. 테스트 프로필 생성
-- =====================================================

-- 1.1 고객 계정들
INSERT INTO profiles (id, role, full_name, phone, address, preferences, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'customer', '테스트 고객1', '010-1111-1111', '{"address": "서울시 강남구 테헤란로 123", "postal_code": "06123"}', '{"favorite_categories": ["beverages", "snacks"], "notification_preferences": {"email": true, "sms": false}}', true),
('22222222-2222-2222-2222-222222222222', 'customer', '테스트 고객2', '010-2222-2222', '{"address": "서울시 서초구 서초대로 456", "postal_code": "06611"}', '{"favorite_categories": ["food", "household"], "notification_preferences": {"email": true, "sms": true}}', true),
('33333333-3333-3333-3333-333333333333', 'customer', '테스트 고객3', '010-3333-3333', '{"address": "서울시 마포구 와우산로 789", "postal_code": "04040"}', '{"favorite_categories": ["snacks"], "notification_preferences": {"email": false, "sms": true}}', true);

-- 1.2 점주 계정들
INSERT INTO profiles (id, role, full_name, phone, address, preferences, is_active) VALUES
('44444444-4444-4444-4444-444444444444', 'store_owner', '테스트 점주1', '010-4444-4444', '{"address": "서울시 강남구 역삼동 123-45", "postal_code": "06123"}', '{"store_management": {"auto_order": true, "low_stock_alerts": true}, "notification_preferences": {"email": true, "sms": true}}', true),
('55555555-5555-5555-5555-555555555555', 'store_owner', '테스트 점주2', '010-5555-5555', '{"address": "서울시 서초구 서초동 456-78", "postal_code": "06611"}', '{"store_management": {"auto_order": false, "low_stock_alerts": true}, "notification_preferences": {"email": true, "sms": false}}', true),
('66666666-6666-6666-6666-666666666666', 'store_owner', '테스트 점주3', '010-6666-6666', '{"address": "서울시 마포구 합정동 789-12", "postal_code": "04040"}', '{"store_management": {"auto_order": true, "low_stock_alerts": false}, "notification_preferences": {"email": false, "sms": true}}', true);

-- 1.3 본사 계정들
INSERT INTO profiles (id, role, full_name, phone, address, preferences, is_active) VALUES
('77777777-7777-7777-7777-777777777777', 'headquarters', '테스트 본사1', '010-7777-7777', '{"address": "서울시 강남구 삼성동 123-45", "postal_code": "06123"}', '{"system_management": {"data_analytics": true, "inventory_control": true}, "notification_preferences": {"email": true, "sms": true}}', true),
('88888888-8888-8888-8888-888888888888', 'headquarters', '테스트 본사2', '010-8888-8888', '{"address": "서울시 서초구 반포동 456-78", "postal_code": "06611"}', '{"system_management": {"data_analytics": true, "inventory_control": false}, "notification_preferences": {"email": true, "sms": false}}', true);

-- =====================================================
-- 2. 테스트 지점 생성 (지리 정보 포함)
-- =====================================================

-- 2.1 강남점
INSERT INTO stores (name, owner_id, address, phone, business_hours, location, delivery_available, pickup_available, delivery_radius, min_order_amount, delivery_fee, is_active) VALUES
('강남역점', '44444444-4444-4444-4444-444444444444', '서울시 강남구 역삼동 123-45', '02-1234-5678', 
'{"monday": {"open": "07:00", "close": "23:00"}, "tuesday": {"open": "07:00", "close": "23:00"}, "wednesday": {"open": "07:00", "close": "23:00"}, "thursday": {"open": "07:00", "close": "23:00"}, "friday": {"open": "07:00", "close": "23:00"}, "saturday": {"open": "07:00", "close": "23:00"}, "sunday": {"open": "07:00", "close": "23:00"}}',
ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326), true, true, 3000, 1000, 2000, true);

-- 2.2 서초점
INSERT INTO stores (name, owner_id, address, phone, business_hours, location, delivery_available, pickup_available, delivery_radius, min_order_amount, delivery_fee, is_active) VALUES
('서초점', '55555555-5555-5555-5555-555555555555', '서울시 서초구 서초동 456-78', '02-2345-6789',
'{"monday": {"open": "06:00", "close": "24:00"}, "tuesday": {"open": "06:00", "close": "24:00"}, "wednesday": {"open": "06:00", "close": "24:00"}, "thursday": {"open": "06:00", "close": "24:00"}, "friday": {"open": "06:00", "close": "24:00"}, "saturday": {"open": "06:00", "close": "24:00"}, "sunday": {"open": "06:00", "close": "24:00"}}',
ST_SetSRID(ST_MakePoint(127.0234, 37.4837), 4326), true, true, 2500, 1500, 1500, true);

-- 2.3 마포점
INSERT INTO stores (name, owner_id, address, phone, business_hours, location, delivery_available, pickup_available, delivery_radius, min_order_amount, delivery_fee, is_active) VALUES
('합정점', '66666666-6666-6666-6666-666666666666', '서울시 마포구 합정동 789-12', '02-3456-7890',
'{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "22:00"}, "sunday": {"open": "08:00", "close": "22:00"}}',
ST_SetSRID(ST_MakePoint(126.9147, 37.5495), 4326), true, true, 2000, 2000, 1000, true);

-- =====================================================
-- 3. 지점별 상품 재고 설정
-- =====================================================

-- 3.1 강남점 상품 재고
INSERT INTO store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
-- 탄산음료
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '코카콜라 500ml'), 2200, 50, 10, 100, true, 0),
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '펩시콜라 500ml'), 2200, 45, 10, 100, true, 0),
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '스프라이트 500ml'), 2200, 40, 10, 100, true, 0),
-- 커피/차
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '맥심 커피 100개입'), 16000, 20, 5, 50, true, 0.05),
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '립톤 홍차 500ml'), 1600, 30, 5, 80, true, 0),
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '스타벅스 아메리카노 355ml'), 4800, 25, 5, 60, true, 0),
-- 즉석식품
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '농심 신라면 120g'), 1300, 60, 15, 120, true, 0),
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '오뚜기 진라면 120g'), 1300, 55, 15, 120, true, 0),
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '삼양 불닭볶음면 140g'), 1600, 40, 10, 80, true, 0);

-- 3.2 서초점 상품 재고
INSERT INTO store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
-- 탄산음료
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '코카콜라 500ml'), 2100, 60, 15, 120, true, 0.05),
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '펩시콜라 500ml'), 2100, 55, 15, 120, true, 0.05),
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '스프라이트 500ml'), 2100, 50, 15, 120, true, 0.05),
-- 주스/이온음료
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '델몬트 오렌지주스 1L'), 3700, 25, 8, 60, true, 0),
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '포카리스웨트 500ml'), 1300, 35, 10, 80, true, 0),
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '게토레이 500ml'), 1300, 35, 10, 80, true, 0),
-- 과자/쿠키
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '농심 새우깡 90g'), 1600, 40, 12, 100, true, 0),
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '오리온 초코파이 12개입'), 3700, 20, 8, 50, true, 0),
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '롯데 빼빼로 50g'), 1300, 45, 15, 100, true, 0);

-- 3.3 마포점 상품 재고
INSERT INTO store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
-- 커피/차
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = '맥심 커피 100개입'), 15500, 15, 5, 40, true, 0),
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = '립톤 홍차 500ml'), 1550, 25, 8, 60, true, 0),
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = '스타벅스 아메리카노 355ml'), 4700, 20, 5, 50, true, 0),
-- 초콜릿/캔디
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = '허쉬 다크초콜릿 100g'), 2600, 30, 10, 80, true, 0),
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = '스키틀즈 60g'), 1600, 35, 12, 90, true, 0),
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = 'M&M 초콜릿 45g'), 2100, 40, 15, 100, true, 0),
-- 생활용품
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = '다우니 섬유유연제 1.5L'), 8200, 15, 5, 40, true, 0),
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = '페브리즈 공기청정제 500ml'), 3600, 20, 8, 50, true, 0),
((SELECT id FROM stores WHERE name = '합정점'), (SELECT id FROM products WHERE name = '크리넥스 화장지 3겹 30롤'), 12500, 10, 5, 30, true, 0);

-- =====================================================
-- 4. 샘플 주문 생성
-- =====================================================

-- 4.1 고객1의 주문 (강남점)
INSERT INTO orders (customer_id, store_id, type, status, subtotal, tax_amount, delivery_fee, total_amount, payment_method, payment_status, pickup_time, notes) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM stores WHERE name = '강남역점'), 'pickup', 'completed', 6600, 660, 0, 7260, 'card', 'paid', NOW() - INTERVAL '2 hours', '테스트 주문입니다.');

-- 주문 상세
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
((SELECT id FROM orders WHERE customer_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), 
 (SELECT id FROM products WHERE name = '코카콜라 500ml'), '코카콜라 500ml', 2, 2200, 4400),
((SELECT id FROM orders WHERE customer_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), 
 (SELECT id FROM products WHERE name = '농심 신라면 120g'), '농심 신라면 120g', 1, 1300, 1300);

-- 4.2 고객2의 주문 (서초점)
INSERT INTO orders (customer_id, store_id, type, status, subtotal, tax_amount, delivery_fee, total_amount, payment_method, payment_status, delivery_address, notes) VALUES
('22222222-2222-2222-2222-222222222222', (SELECT id FROM stores WHERE name = '서초점'), 'delivery', 'preparing', 7400, 740, 1500, 9640, 'kakao_pay', 'paid', '{"address": "서울시 서초구 서초대로 456", "postal_code": "06611"}', '배송 시 문 앞에 놓아주세요.');

-- 주문 상세
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
((SELECT id FROM orders WHERE customer_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 (SELECT id FROM products WHERE name = '델몬트 오렌지주스 1L'), '델몬트 오렌지주스 1L', 1, 3700, 3700),
((SELECT id FROM orders WHERE customer_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 (SELECT id FROM products WHERE name = '농심 새우깡 90g'), '농심 새우깡 90g', 2, 1600, 3200),
((SELECT id FROM orders WHERE customer_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 (SELECT id FROM products WHERE name = '오리온 초코파이 12개입'), '오리온 초코파이 12개입', 1, 3700, 3700);

-- 4.3 고객3의 주문 (마포점)
INSERT INTO orders (customer_id, store_id, type, status, subtotal, tax_amount, delivery_fee, total_amount, payment_method, payment_status, pickup_time, notes) VALUES
('33333333-3333-3333-3333-333333333333', (SELECT id FROM stores WHERE name = '합정점'), 'pickup', 'ready', 4200, 420, 0, 4620, 'cash', 'paid', NOW() + INTERVAL '30 minutes', '따뜻하게 해주세요.');

-- 주문 상세
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
((SELECT id FROM orders WHERE customer_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 
 (SELECT id FROM products WHERE name = '맥심 커피 100개입'), '맥심 커피 100개입', 1, 15500, 15500),
((SELECT id FROM orders WHERE customer_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 
 (SELECT id FROM products WHERE name = '허쉬 다크초콜릿 100g'), '허쉬 다크초콜릿 100g', 1, 2600, 2600);

-- =====================================================
-- 5. 샘플 공급 요청 생성
-- =====================================================

-- 5.1 강남점 공급 요청
INSERT INTO supply_requests (store_id, requested_by, status, priority, total_amount, expected_delivery_date, notes) VALUES
((SELECT id FROM stores WHERE name = '강남역점'), '44444444-4444-4444-4444-444444444444', 'submitted', 'high', 50000, CURRENT_DATE + INTERVAL '3 days', '재고 부족으로 인한 긴급 공급 요청');

-- 공급 요청 상세
INSERT INTO supply_request_items (supply_request_id, product_id, product_name, requested_quantity, unit_cost, total_cost, reason, current_stock) VALUES
((SELECT id FROM supply_requests WHERE store_id = (SELECT id FROM stores WHERE name = '강남역점') LIMIT 1), 
 (SELECT id FROM products WHERE name = '코카콜라 500ml'), '코카콜라 500ml', 50, 1200, 60000, '재고 부족', 5),
((SELECT id FROM supply_requests WHERE store_id = (SELECT id FROM stores WHERE name = '강남역점') LIMIT 1), 
 (SELECT id FROM products WHERE name = '농심 신라면 120g'), '농심 신라면 120g', 30, 720, 21600, '재고 부족', 8);

-- 5.2 서초점 공급 요청
INSERT INTO supply_requests (store_id, requested_by, status, priority, total_amount, expected_delivery_date, notes) VALUES
((SELECT id FROM stores WHERE name = '서초점'), '55555555-5555-5555-5555-555555555555', 'approved', 'normal', 35000, CURRENT_DATE + INTERVAL '5 days', '정기 공급 요청');

-- 공급 요청 상세
INSERT INTO supply_request_items (supply_request_id, product_id, product_name, requested_quantity, unit_cost, total_cost, reason, current_stock) VALUES
((SELECT id FROM supply_requests WHERE store_id = (SELECT id FROM stores WHERE name = '서초점') LIMIT 1), 
 (SELECT id FROM products WHERE name = '델몬트 오렌지주스 1L'), '델몬트 오렌지주스 1L', 20, 2100, 42000, '정기 보충', 12),
((SELECT id FROM supply_requests WHERE store_id = (SELECT id FROM stores WHERE name = '서초점') LIMIT 1), 
 (SELECT id FROM products WHERE name = '농심 새우깡 90g'), '농심 새우깡 90g', 25, 900, 22500, '정기 보충', 15);

-- =====================================================
-- 6. 샘플 알림 생성
-- =====================================================

-- 6.1 재고 부족 알림
INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES
('44444444-4444-4444-4444-444444444444', 'low_stock', '재고 부족 알림', '코카콜라 500ml 상품의 재고가 부족합니다. (현재: 5, 안전재고: 10)', 'high', '{"store_id": "강남역점", "product_id": "코카콜라 500ml", "current_stock": 5, "safety_stock": 10}'),
('55555555-5555-5555-5555-555555555555', 'low_stock', '재고 부족 알림', '델몬트 오렌지주스 1L 상품의 재고가 부족합니다. (현재: 12, 안전재고: 8)', 'medium', '{"store_id": "서초점", "product_id": "델몬트 오렌지주스 1L", "current_stock": 12, "safety_stock": 8}');

-- 6.2 주문 상태 변경 알림
INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES
('11111111-1111-1111-1111-111111111111', 'order_status', '주문 상태 변경', '주문 #20241205-0001의 상태가 "완료"로 변경되었습니다.', 'normal', '{"order_id": "주문ID", "order_number": "20241205-0001", "status": "completed", "store_id": "강남역점"}'),
('22222222-2222-2222-2222-222222222222', 'order_status', '주문 상태 변경', '주문 #20241205-0002의 상태가 "준비 중"으로 변경되었습니다.', 'normal', '{"order_id": "주문ID", "order_number": "20241205-0002", "status": "preparing", "store_id": "서초점"}');

-- =====================================================
-- 7. 샘플 매출 데이터 생성
-- =====================================================

-- 7.1 일일 매출 요약 (오늘)
INSERT INTO daily_sales_summary (store_id, date, total_orders, pickup_orders, delivery_orders, cancelled_orders, total_revenue, total_items_sold, avg_order_value) VALUES
((SELECT id FROM stores WHERE name = '강남역점'), CURRENT_DATE, 15, 10, 5, 0, 125000, 45, 8333),
((SELECT id FROM stores WHERE name = '서초점'), CURRENT_DATE, 12, 8, 4, 1, 98000, 38, 8167),
((SELECT id FROM stores WHERE name = '합정점'), CURRENT_DATE, 8, 6, 2, 0, 65000, 25, 8125);

-- 7.2 상품별 매출 요약 (오늘)
INSERT INTO product_sales_summary (store_id, product_id, date, quantity_sold, revenue, avg_price) VALUES
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '코카콜라 500ml'), CURRENT_DATE, 25, 55000, 2200),
((SELECT id FROM stores WHERE name = '강남역점'), (SELECT id FROM products WHERE name = '농심 신라면 120g'), CURRENT_DATE, 15, 19500, 1300),
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '델몬트 오렌지주스 1L'), CURRENT_DATE, 12, 44400, 3700),
((SELECT id FROM stores WHERE name = '서초점'), (SELECT id FROM products WHERE name = '농심 새우깡 90g'), CURRENT_DATE, 18, 28800, 1600);

-- =====================================================
-- 8. 테스트 계정 정보 출력
-- =====================================================

-- 8.1 테스트 계정 목록
SELECT 
    role as "역할",
    full_name as "이름",
    phone as "전화번호",
    is_active as "활성화"
FROM profiles
WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888'
)
ORDER BY role, full_name;

-- 8.2 지점 정보
SELECT 
    s.name as "지점명",
    p.full_name as "점주명",
    s.address as "주소",
    s.phone as "전화번호",
    s.delivery_available as "배송가능",
    s.pickup_available as "픽업가능"
FROM stores s
JOIN profiles p ON p.id = s.owner_id
ORDER BY s.name;

-- 8.3 샘플 주문 정보
SELECT 
    o.order_number as "주문번호",
    p.full_name as "고객명",
    s.name as "지점명",
    o.type as "주문타입",
    o.status as "상태",
    o.total_amount as "총액",
    o.payment_method as "결제방법"
FROM orders o
JOIN profiles p ON p.id = o.customer_id
JOIN stores s ON s.id = o.store_id
ORDER BY o.created_at DESC; 