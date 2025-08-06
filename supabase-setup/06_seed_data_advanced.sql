-- =====================================================
-- 06_seed_data_advanced.sql
-- 고급 초기 데이터 삽입
-- =====================================================

-- =====================================================
-- 1. 카테고리 데이터 (계층 구조)
-- =====================================================

-- 1.1 대분류 카테고리
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('음료', 'beverages', '다양한 음료 제품', 1, true),
('식품', 'food', '신선한 식품', 2, true),
('간식', 'snacks', '맛있는 간식', 3, true),
('생활용품', 'household', '일상 생활용품', 4, true),
('담배/주류', 'tobacco-alcohol', '담배 및 주류', 5, true);

-- 1.2 음료 하위 카테고리
INSERT INTO categories (name, slug, parent_id, description, display_order, is_active) VALUES
('탄산음료', 'carbonated-drinks', (SELECT id FROM categories WHERE slug = 'beverages'), '시원한 탄산음료', 1, true),
('커피/차', 'coffee-tea', (SELECT id FROM categories WHERE slug = 'beverages'), '따뜻한 커피와 차', 2, true),
('주스/이온음료', 'juice-sports-drinks', (SELECT id FROM categories WHERE slug = 'beverages'), '건강한 주스와 이온음료', 3, true),
('우유/유제품', 'milk-dairy', (SELECT id FROM categories WHERE slug = 'beverages'), '신선한 우유와 유제품', 4, true);

-- 1.3 식품 하위 카테고리
INSERT INTO categories (name, slug, parent_id, description, display_order, is_active) VALUES
('즉석식품', 'instant-food', (SELECT id FROM categories WHERE slug = 'food'), '빠르고 간편한 즉석식품', 1, true),
('냉동식품', 'frozen-food', (SELECT id FROM categories WHERE slug = 'food'), '신선한 냉동식품', 2, true),
('신선식품', 'fresh-food', (SELECT id FROM categories WHERE slug = 'food'), '매일 신선한 식품', 3, true);

-- 1.4 간식 하위 카테고리
INSERT INTO categories (name, slug, parent_id, description, display_order, is_active) VALUES
('과자/쿠키', 'cookies-snacks', (SELECT id FROM categories WHERE slug = 'snacks'), '달콤한 과자와 쿠키', 1, true),
('초콜릿/캔디', 'chocolate-candy', (SELECT id FROM categories WHERE slug = 'snacks'), '달콤한 초콜릿과 캔디', 2, true),
('견과류', 'nuts', (SELECT id FROM categories WHERE slug = 'snacks'), '건강한 견과류', 3, true);

-- 1.5 생활용품 하위 카테고리
INSERT INTO categories (name, slug, parent_id, description, display_order, is_active) VALUES
('세제/청소용품', 'cleaning-supplies', (SELECT id FROM categories WHERE slug = 'household'), '깨끗한 생활을 위한 세제', 1, true),
('화장지/휴대용품', 'tissue-personal-care', (SELECT id FROM categories WHERE slug = 'household'), '일상 생활 필수품', 2, true),
('문구/오피스', 'stationery-office', (SELECT id FROM categories WHERE slug = 'household'), '업무와 학습을 위한 문구', 3, true);

-- =====================================================
-- 2. 상품 데이터 (고급 정보 포함)
-- =====================================================

-- 2.1 탄산음료
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('코카콜라 500ml', '세계적으로 사랑받는 탄산음료', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '코카콜라', '코카콜라 컴퍼니', '개', 2000, 1200, 0.10, false, 0, '{"칼로리": 210, "탄수화물": 53, "단백질": 0, "지방": 0}', ARRAY['없음']),
('펩시콜라 500ml', '청량감이 특징인 탄산음료', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '펩시', '펩시코', '개', 2000, 1200, 0.10, false, 0, '{"칼로리": 210, "탄수화물": 53, "단백질": 0, "지방": 0}', ARRAY['없음']),
('스프라이트 500ml', '레몬라임 맛의 상쾌한 탄산음료', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '스프라이트', '코카콜라 컴퍼니', '개', 2000, 1200, 0.10, false, 0, '{"칼로리": 200, "탄수화물": 51, "단백질": 0, "지방": 0}', ARRAY['없음']);

-- 2.2 커피/차
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('맥심 커피 100개입', '깊고 진한 맛의 인스턴트 커피', (SELECT id FROM categories WHERE slug = 'coffee-tea'), '맥심', '동서식품', '개', 15000, 9000, 0.10, true, 2, '{"칼로리": 5, "탄수화물": 1, "단백질": 0, "지방": 0}', ARRAY['없음']),
('립톤 홍차 500ml', '클래식한 홍차의 맛', (SELECT id FROM categories WHERE slug = 'coffee-tea'), '립톤', '유니레버', '개', 1500, 900, 0.10, false, 0, '{"칼로리": 0, "탄수화물": 0, "단백질": 0, "지방": 0}', ARRAY['없음']),
('스타벅스 아메리카노 355ml', '프리미엄 원두로 만든 아메리카노', (SELECT id FROM categories WHERE slug = 'coffee-tea'), '스타벅스', '스타벅스 코리아', '개', 4500, 2700, 0.10, false, 0, '{"칼로리": 5, "탄수화물": 1, "단백질": 0, "지방": 0}', ARRAY['없음']);

-- 2.3 주스/이온음료
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('델몬트 오렌지주스 1L', '신선한 오렌지로 만든 주스', (SELECT id FROM categories WHERE slug = 'juice-sports-drinks'), '델몬트', '델몬트 코리아', '개', 3500, 2100, 0.10, false, 0, '{"칼로리": 110, "탄수화물": 26, "단백질": 2, "지방": 0}', ARRAY['없음']),
('포카리스웨트 500ml', '스포츠 음료의 대표 브랜드', (SELECT id FROM categories WHERE slug = 'juice-sports-drinks'), '포카리', '오츠카제약', '개', 1200, 720, 0.10, false, 0, '{"칼로리": 25, "탄수화물": 6, "단백질": 0, "지방": 0}', ARRAY['없음']),
('게토레이 500ml', '운동 후 수분 보충을 위한 이온음료', (SELECT id FROM categories WHERE slug = 'juice-sports-drinks'), '게토레이', '펩시코', '개', 1200, 720, 0.10, false, 0, '{"칼로리": 30, "탄수화물": 7, "단백질": 0, "지방": 0}', ARRAY['없음']);

-- 2.4 즉석식품
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('농심 신라면 120g', '한국의 대표적인 라면', (SELECT id FROM categories WHERE slug = 'instant-food'), '농심', '농심', '개', 1200, 720, 0.10, true, 3, '{"칼로리": 500, "탄수화물": 65, "단백질": 10, "지방": 20}', ARRAY['밀', '대두']),
('오뚜기 진라면 120g', '매콤달콤한 맛의 라면', (SELECT id FROM categories WHERE slug = 'instant-food'), '오뚜기', '오뚜기', '개', 1200, 720, 0.10, true, 3, '{"칼로리": 480, "탄수화물": 63, "단백질": 9, "지방": 18}', ARRAY['밀', '대두']),
('삼양 불닭볶음면 140g', '매운맛으로 유명한 볶음면', (SELECT id FROM categories WHERE slug = 'instant-food'), '삼양', '삼양식품', '개', 1500, 900, 0.10, true, 4, '{"칼로리": 520, "탄수화물": 68, "단백질": 12, "지방": 22}', ARRAY['밀', '대두']);

-- 2.5 과자/쿠키
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('농심 새우깡 90g', '바삭하고 고소한 새우깡', (SELECT id FROM categories WHERE slug = 'cookies-snacks'), '농심', '농심', '개', 1500, 900, 0.10, false, 0, '{"칼로리": 450, "탄수화물": 55, "단백질": 8, "지방": 22}', ARRAY['새우', '밀']),
('오리온 초코파이 12개입', '달콤한 초콜릿과 마시멜로', (SELECT id FROM categories WHERE slug = 'cookies-snacks'), '오리온', '오리온', '개', 3500, 2100, 0.10, false, 0, '{"칼로리": 120, "탄수화물": 18, "단백질": 2, "지방": 5}', ARRAY['밀', '우유', '계란']),
('롯데 빼빼로 50g', '바삭한 비스킷과 초콜릿', (SELECT id FROM categories WHERE slug = 'cookies-snacks'), '롯데', '롯데제과', '개', 1200, 720, 0.10, false, 0, '{"칼로리": 250, "탄수화물": 35, "단백질": 4, "지방": 12}', ARRAY['밀', '우유']);

-- 2.6 초콜릿/캔디
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('허쉬 다크초콜릿 100g', '진한 다크초콜릿의 맛', (SELECT id FROM categories WHERE slug = 'chocolate-candy'), '허쉬', '허쉬', '개', 2500, 1500, 0.10, false, 0, '{"칼로리": 546, "탄수화물": 61, "단백질": 4, "지방": 31}', ARRAY['우유', '대두']),
('스키틀즈 60g', '다양한 과일맛의 캔디', (SELECT id FROM categories WHERE slug = 'chocolate-candy'), '스키틀즈', '마스', '개', 1500, 900, 0.10, false, 0, '{"칼로리": 240, "탄수화물": 60, "단백질": 0, "지방": 0}', ARRAY['없음']),
('M&M 초콜릿 45g', '알맹이 초콜릿의 재미', (SELECT id FROM categories WHERE slug = 'chocolate-candy'), 'M&M', '마스', '개', 2000, 1200, 0.10, false, 0, '{"칼로리": 220, "탄수화물": 30, "단백질": 3, "지방": 10}', ARRAY['우유', '대두']);

-- 2.7 세제/청소용품
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('다우니 섬유유연제 1.5L', '부드럽고 향기로운 섬유유연제', (SELECT id FROM categories WHERE slug = 'cleaning-supplies'), '다우니', 'P&G', '개', 8000, 4800, 0.10, false, 0, '{}', ARRAY['없음']),
('페브리즈 공기청정제 500ml', '상쾌한 공기청정제', (SELECT id FROM categories WHERE slug = 'cleaning-supplies'), '페브리즈', 'P&G', '개', 3500, 2100, 0.10, false, 0, '{}', ARRAY['없음']),
('클로렉스 표백제 1L', '강력한 표백 효과', (SELECT id FROM categories WHERE slug = 'cleaning-supplies'), '클로렉스', '클로렉스', '개', 4500, 2700, 0.10, false, 0, '{}', ARRAY['없음']);

-- 2.8 화장지/휴대용품
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('크리넥스 화장지 3겹 30롤', '부드럽고 튼튼한 화장지', (SELECT id FROM categories WHERE slug = 'tissue-personal-care'), '크리넥스', '킴벌리클라크', '개', 12000, 7200, 0.10, false, 0, '{}', ARRAY['없음']),
('코리아나 치약 100g', '깨끗한 치아 관리를 위한 치약', (SELECT id FROM categories WHERE slug = 'tissue-personal-care'), '코리아나', '코리아나', '개', 2500, 1500, 0.10, false, 0, '{}', ARRAY['없음']),
('다우니 샤워겔 500ml', '부드럽고 향기로운 샤워겔', (SELECT id FROM categories WHERE slug = 'tissue-personal-care'), '다우니', 'P&G', '개', 4500, 2700, 0.10, false, 0, '{}', ARRAY['없음']);

-- =====================================================
-- 3. 시스템 설정 데이터
-- =====================================================

INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('app_name', '"편의점 관리 시스템"', '애플리케이션 이름', 'general', true),
('app_version', '"2.0.0"', '애플리케이션 버전', 'general', true),
('default_tax_rate', '0.1', '기본 부가세율', 'business', false),
('min_order_amount', '1000', '최소 주문 금액', 'business', true),
('delivery_fee', '2000', '기본 배송비', 'business', true),
('delivery_radius', '3000', '기본 배송 반경 (미터)', 'business', false),
('business_hours', '{"monday": {"open": "07:00", "close": "23:00"}, "tuesday": {"open": "07:00", "close": "23:00"}, "wednesday": {"open": "07:00", "close": "23:00"}, "thursday": {"open": "07:00", "close": "23:00"}, "friday": {"open": "07:00", "close": "23:00"}, "saturday": {"open": "07:00", "close": "23:00"}, "sunday": {"open": "07:00", "close": "23:00"}}', '기본 영업시간', 'business', true),
('notification_settings', '{"email": true, "sms": false, "push": true}', '알림 설정', 'system', false),
('payment_methods', '["card", "cash", "kakao_pay", "toss_pay", "naver_pay"]', '결제 방법', 'business', true),
('order_status_flow', '["pending", "confirmed", "preparing", "ready", "completed"]', '주문 상태 흐름', 'business', false),
('safety_stock_threshold', '10', '안전 재고 임계값', 'inventory', false),
('max_stock_threshold', '100', '최대 재고 임계값', 'inventory', false),
('auto_order_enabled', 'true', '자동 주문 활성화', 'inventory', false),
('sales_report_frequency', 'daily', '매출 보고서 빈도', 'reports', false),
('data_retention_days', '365', '데이터 보관 기간 (일)', 'system', false);

-- =====================================================
-- 4. 데이터 삽입 확인
-- =====================================================

-- 4.1 카테고리 확인
SELECT 
    c1.name as "대분류",
    c2.name as "소분류",
    c2.description as "설명"
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
WHERE c1.parent_id IS NULL
ORDER BY c1.display_order, c2.display_order;

-- 4.2 상품 확인
SELECT 
    p.name as "상품명",
    c.name as "카테고리",
    p.brand as "브랜드",
    p.base_price as "가격",
    p.requires_preparation as "조리필요"
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.is_active = true
ORDER BY c.display_order, p.name;

-- 4.3 시스템 설정 확인
SELECT 
    key as "설정키",
    value as "설정값",
    description as "설명",
    category as "카테고리",
    is_public as "공개여부"
FROM system_settings
ORDER BY category, key; 