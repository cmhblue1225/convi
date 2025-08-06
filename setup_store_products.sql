-- =====================================================
-- 편의점 지점별 상품 및 재고 설정
-- 각 지점마다 다른 상품 구성과 재고 수량 설정
-- =====================================================

-- 먼저 기존 store_products 데이터 삭제 (테스트용)
DELETE FROM public.store_products;

-- =====================================================
-- 1. 상품 마스터 데이터 생성
-- =====================================================

-- 기존 상품 데이터 삭제 (테스트용)
DELETE FROM public.products;

-- 상품 마스터 데이터 삽입
INSERT INTO public.products (id, name, description, category_id, brand, base_price, unit, barcode, is_active) VALUES
-- 음료 카테고리
('prod-001', '코카콜라 500ml', '시원한 탄산음료', (SELECT id FROM public.categories WHERE slug = 'carbonated-drinks'), '코카콜라', 1500, '개', '8801094010123', true),
('prod-002', '스프라이트 355ml', '레몬라임 사이다', (SELECT id FROM public.categories WHERE slug = 'carbonated-drinks'), '코카콜라', 1200, '개', '8801094010130', true),
('prod-003', '펩시 500ml', '청량한 탄산음료', (SELECT id FROM public.categories WHERE slug = 'carbonated-drinks'), '펩시', 1400, '개', '8801094010147', true),
('prod-004', '맥심 원두커피', '부드러운 원두커피', (SELECT id FROM public.categories WHERE slug = 'coffee'), '동서식품', 1200, '개', '8801047501234', true),
('prod-005', '네스카페 골드', '프리미엄 인스턴트 커피', (SELECT id FROM public.categories WHERE slug = 'coffee'), '네슬레', 1800, '개', '8801047501241', true),
('prod-006', '립톤 홍차', '클래식 홍차', (SELECT id FROM public.categories WHERE slug = 'tea'), '립톤', 1000, '개', '8801047501258', true),
('prod-007', '오렌지 주스 1L', '신선한 오렌지 주스', (SELECT id FROM public.categories WHERE slug = 'juice'), '델몬트', 2500, '개', '8801047501265', true),

-- 식품 카테고리
('prod-008', '신라면', '매운 라면', (SELECT id FROM public.categories WHERE slug = 'ramen'), '농심', 1200, '개', '8801043010757', true),
('prod-009', '짜파게티', '짜장 라면', (SELECT id FROM public.categories WHERE slug = 'ramen'), '농심', 1300, '개', '8801043010764', true),
('prod-010', '불고기김밥', '맛있는 불고기김밥', (SELECT id FROM public.categories WHERE slug = 'bread'), '편의점', 4000, '개', '8801234567890', true),
('prod-011', '치킨마요김밥', '치킨마요 김밥', (SELECT id FROM public.categories WHERE slug = 'bread'), '편의점', 4500, '개', '8801234567891', true),
('prod-012', '샌드위치', '신선한 샌드위치', (SELECT id FROM public.categories WHERE slug = 'bread'), '편의점', 3500, '개', '8801234567892', true),
('prod-013', '아이스크림 바', '시원한 아이스크림', (SELECT id FROM public.categories WHERE slug = 'ice-cream'), '빙그레', 1500, '개', '8801234567893', true),

-- 과자 카테고리
('prod-014', '감자칩', '바삭한 감자칩', (SELECT id FROM public.categories WHERE slug = 'snacks'), '농심', 2000, '개', '8801043010771', true),
('prod-015', '새우깡', '바삭한 새우맛 과자', (SELECT id FROM public.categories WHERE slug = 'snacks'), '농심', 1800, '개', '8801043010788', true),
('prod-016', '오리지널 과자', '바삭한 과자', (SELECT id FROM public.categories WHERE slug = 'snacks'), '오리온', 1600, '개', '8801043010795', true),
('prod-017', '초코파이', '달콤한 초코파이', (SELECT id FROM public.categories WHERE slug = 'snacks'), '오리온', 1200, '개', '8801043010801', true),
('prod-018', '맥주', '시원한 맥주', (SELECT id FROM public.categories WHERE slug = 'alcohol'), '하이트진로', 3000, '개', '8801043010818', true),
('prod-019', '소주', '깔끔한 소주', (SELECT id FROM public.categories WHERE slug = 'alcohol'), '하이트진로', 4000, '개', '8801043010825', true);

-- =====================================================
-- 2. 지점별 상품 및 재고 설정
-- =====================================================

-- 강남점 상품 설정 (고급 상품 위주, 높은 재고)
INSERT INTO public.store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
-- 강남점은 모든 상품 보유, 높은 재고
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-001', 1600, 85, 20, 100, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-002', 1300, 92, 25, 120, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-003', 1500, 78, 20, 100, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-004', 1300, 65, 15, 80, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-005', 1900, 45, 10, 60, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-006', 1100, 58, 15, 80, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-007', 2700, 32, 8, 50, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-008', 1300, 95, 25, 120, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-009', 1400, 88, 20, 100, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-010', 4200, 25, 8, 40, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-011', 4700, 22, 6, 35, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-012', 3700, 18, 5, 30, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-013', 1600, 42, 10, 60, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-014', 2100, 75, 20, 100, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-015', 1900, 68, 15, 80, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-016', 1700, 82, 20, 100, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-017', 1300, 95, 25, 120, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-018', 3200, 35, 10, 50, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-019', 4200, 28, 8, 40, true, 0);

-- 홍대점 상품 설정 (음료, 과자 위주, 중간 재고)
INSERT INTO public.store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
-- 홍대점은 음료, 과자 위주, 일부 상품만 보유
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-001', 1550, 45, 15, 60, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-002', 1250, 52, 15, 70, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-003', 1450, 38, 12, 50, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-004', 1250, 35, 10, 45, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-006', 1050, 42, 12, 55, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-008', 1250, 58, 15, 75, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-009', 1350, 48, 12, 60, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-010', 4100, 15, 5, 25, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-013', 1550, 28, 8, 40, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-014', 2050, 62, 15, 80, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-015', 1850, 55, 12, 70, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-016', 1650, 68, 15, 85, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-017', 1250, 72, 18, 90, true, 0.05),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-018', 3100, 22, 8, 35, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-019', 4100, 18, 6, 30, true, 0);

-- 신촌점 상품 설정 (학생 위주, 저렴한 가격, 낮은 재고)
INSERT INTO public.store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
-- 신촌점은 학생 위주, 저렴한 가격, 일부 상품만 보유
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-001', 1500, 25, 8, 40, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-002', 1200, 32, 10, 45, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-004', 1200, 18, 6, 25, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-006', 1000, 22, 8, 30, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-008', 1200, 35, 10, 50, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-009', 1300, 28, 8, 40, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-010', 4000, 8, 3, 15, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-013', 1500, 15, 5, 25, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-014', 2000, 42, 12, 60, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-015', 1800, 38, 10, 55, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-016', 1600, 45, 12, 65, true, 0.1),
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-017', 1200, 52, 15, 75, true, 0.1);

-- 강북점 상품 설정 (주민 위주, 기본 상품, 중간 재고)
INSERT INTO public.store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
-- 강북점은 주민 위주, 기본 상품 위주
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-001', 1550, 35, 12, 50, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-002', 1250, 42, 12, 55, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-004', 1250, 25, 8, 35, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-006', 1050, 28, 8, 40, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-007', 2500, 15, 5, 25, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-008', 1250, 48, 12, 65, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-009', 1350, 38, 10, 50, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-010', 4100, 12, 4, 20, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-011', 4600, 10, 3, 18, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-012', 3600, 8, 3, 15, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-014', 2050, 55, 15, 75, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-015', 1850, 48, 12, 65, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-016', 1650, 62, 15, 80, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-017', 1250, 68, 18, 90, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-018', 3100, 18, 6, 30, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%강북%' LIMIT 1), 'prod-019', 4100, 15, 5, 25, true, 0);

-- 마포점 상품 설정 (직장인 위주, 커피, 간식 위주)
INSERT INTO public.store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
-- 마포점은 직장인 위주, 커피, 간식 위주
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-001', 1600, 28, 10, 40, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-002', 1300, 35, 10, 45, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-004', 1300, 45, 12, 60, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-005', 1900, 32, 8, 45, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-006', 1100, 38, 10, 50, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-008', 1300, 42, 12, 55, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-009', 1400, 35, 10, 45, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-010', 4200, 18, 6, 25, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-011', 4700, 15, 5, 22, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-012', 3700, 12, 4, 18, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-014', 2100, 48, 12, 65, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-015', 1900, 42, 10, 55, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-016', 1700, 55, 15, 75, true, 0),
((SELECT id FROM public.stores WHERE name LIKE '%마포%' LIMIT 1), 'prod-017', 1300, 62, 15, 80, true, 0);

-- =====================================================
-- 3. 재고 부족 및 품절 상품 설정 (테스트용)
-- =====================================================

-- 강남점에 재고 부족 상품 추가
INSERT INTO public.store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
((SELECT id FROM public.stores WHERE name LIKE '%강남%' LIMIT 1), 'prod-007', 2500, 3, 8, 50, true, 0); -- 재고 부족

-- 홍대점에 품절 상품 추가
INSERT INTO public.store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
((SELECT id FROM public.stores WHERE name LIKE '%홍대%' LIMIT 1), 'prod-005', 1800, 0, 10, 60, true, 0); -- 품절

-- 신촌점에 판매 중단 상품 추가
INSERT INTO public.store_products (store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate) VALUES
((SELECT id FROM public.stores WHERE name LIKE '%신촌%' LIMIT 1), 'prod-018', 3000, 5, 8, 50, false, 0); -- 판매 중단

-- =====================================================
-- 4. 설정 완료 확인
-- =====================================================

-- 지점별 상품 수 확인
SELECT 
  s.name as store_name,
  COUNT(sp.id) as product_count,
  SUM(sp.stock_quantity) as total_stock,
  AVG(sp.price) as avg_price
FROM public.stores s
LEFT JOIN public.store_products sp ON s.id = sp.store_id
WHERE s.is_active = true
GROUP BY s.id, s.name
ORDER BY s.name;

-- 재고 부족 상품 확인
SELECT 
  s.name as store_name,
  p.name as product_name,
  sp.stock_quantity,
  sp.safety_stock,
  CASE 
    WHEN sp.stock_quantity = 0 THEN '품절'
    WHEN sp.stock_quantity <= sp.safety_stock THEN '재고 부족'
    ELSE '정상'
  END as stock_status
FROM public.store_products sp
JOIN public.stores s ON sp.store_id = s.id
JOIN public.products p ON sp.product_id = p.id
WHERE sp.stock_quantity <= sp.safety_stock OR sp.stock_quantity = 0
ORDER BY s.name, sp.stock_quantity;

-- =====================================================
-- 완료 메시지
-- =====================================================

-- 모든 지점에 다양한 상품과 재고가 설정되었습니다.
-- 각 지점마다 다른 상품 구성과 재고 수량을 가지게 됩니다. 