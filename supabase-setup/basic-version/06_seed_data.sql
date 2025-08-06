-- =====================================================
-- 06_seed_data.sql
-- 초기 데이터 삽입
-- =====================================================

-- =====================================================
-- 1. 카테고리 데이터 삽입
-- =====================================================
INSERT INTO categories (name, description, image_url, sort_order, status) VALUES
('음료', '다양한 음료 제품', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', 1, 'active'),
('간식', '과자, 초콜릿, 젤리 등', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', 2, 'active'),
('라면/즉석식품', '라면, 컵라면, 즉석밥 등', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', 3, 'active'),
('생활용품', '세제, 휴지, 화장지 등', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 4, 'active'),
('담배/주류', '담배, 맥주, 소주 등', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', 5, 'active'),
('아이스크림', '아이스크림, 빙수 등', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 6, 'active'),
('도시락/반찬', '도시락, 김밥, 반찬 등', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 7, 'active'),
('기타', '기타 상품들', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', 8, 'active')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. 상품 데이터 삽입
-- =====================================================

-- 음료 카테고리 상품들
INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '코카콜라 355ml',
    '시원한 탄산음료',
    c.id,
    1500,
    'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    '8801094001234',
    'active'
FROM categories c WHERE c.name = '음료'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '펩시콜라 355ml',
    '청량감 있는 탄산음료',
    c.id,
    1500,
    'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    '8801094001235',
    'active'
FROM categories c WHERE c.name = '음료'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '스프라이트 355ml',
    '레몬라임 탄산음료',
    c.id,
    1500,
    'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    '8801094001236',
    'active'
FROM categories c WHERE c.name = '음료'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '물 500ml',
    '깨끗한 생수',
    c.id,
    800,
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    '8801094001237',
    'active'
FROM categories c WHERE c.name = '음료'
ON CONFLICT (barcode) DO NOTHING;

-- 간식 카테고리 상품들
INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '오리지널 프링글스',
    '바삭한 감자칩',
    c.id,
    2500,
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    '8801094001238',
    'active'
FROM categories c WHERE c.name = '간식'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '스니커즈 초콜릿',
    '달콤한 초콜릿',
    c.id,
    1200,
    'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400',
    '8801094001239',
    'active'
FROM categories c WHERE c.name = '간식'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '맥앤치즈',
    '치즈맛 스낵',
    c.id,
    1800,
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    '8801094001240',
    'active'
FROM categories c WHERE c.name = '간식'
ON CONFLICT (barcode) DO NOTHING;

-- 라면/즉석식품 카테고리 상품들
INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '신라면',
    '매운 라면',
    c.id,
    1200,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    '8801094001241',
    'active'
FROM categories c WHERE c.name = '라면/즉석식품'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '진라면 순한맛',
    '순한맛 라면',
    c.id,
    1200,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    '8801094001242',
    'active'
FROM categories c WHERE c.name = '라면/즉석식품'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '컵라면',
    '간편한 컵라면',
    c.id,
    800,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    '8801094001243',
    'active'
FROM categories c WHERE c.name = '라면/즉석식품'
ON CONFLICT (barcode) DO NOTHING;

-- 생활용품 카테고리 상품들
INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '휴지 3겹',
    '부드러운 휴지',
    c.id,
    2000,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    '8801094001244',
    'active'
FROM categories c WHERE c.name = '생활용품'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '물티슈',
    '깨끗한 물티슈',
    c.id,
    1500,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    '8801094001245',
    'active'
FROM categories c WHERE c.name = '생활용품'
ON CONFLICT (barcode) DO NOTHING;

-- 담배/주류 카테고리 상품들
INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '맥주 500ml',
    '시원한 맥주',
    c.id,
    3000,
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    '8801094001246',
    'active'
FROM categories c WHERE c.name = '담배/주류'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '소주 360ml',
    '깔끔한 소주',
    c.id,
    1500,
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    '8801094001247',
    'active'
FROM categories c WHERE c.name = '담배/주류'
ON CONFLICT (barcode) DO NOTHING;

-- 아이스크림 카테고리 상품들
INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '바닐라 아이스크림',
    '부드러운 바닐라 아이스크림',
    c.id,
    2500,
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    '8801094001248',
    'active'
FROM categories c WHERE c.name = '아이스크림'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '초콜릿 아이스크림',
    '달콤한 초콜릿 아이스크림',
    c.id,
    2500,
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    '8801094001249',
    'active'
FROM categories c WHERE c.name = '아이스크림'
ON CONFLICT (barcode) DO NOTHING;

-- 도시락/반찬 카테고리 상품들
INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '김밥',
    '신선한 김밥',
    c.id,
    3000,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    '8801094001250',
    'active'
FROM categories c WHERE c.name = '도시락/반찬'
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO products (name, description, category_id, price, image_url, barcode, status) 
SELECT 
    '삼각김밥',
    '간편한 삼각김밥',
    c.id,
    1200,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    '8801094001251',
    'active'
FROM categories c WHERE c.name = '도시락/반찬'
ON CONFLICT (barcode) DO NOTHING;

-- =====================================================
-- 데이터 삽입 확인
-- =====================================================

-- 카테고리 확인
SELECT 
    '카테고리' as "테이블명",
    COUNT(*) as "레코드 수"
FROM categories
UNION ALL
SELECT 
    '상품' as "테이블명",
    COUNT(*) as "레코드 수"
FROM products;

-- 카테고리별 상품 수 확인
SELECT 
    c.name as "카테고리명",
    COUNT(p.id) as "상품 수"
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
WHERE c.status = 'active'
GROUP BY c.id, c.name
ORDER BY c.sort_order; 