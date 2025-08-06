-- =====================================================
-- 00_setup_all.sql
-- 편의점 관리 시스템 - 전체 설정 마스터 스크립트
-- =====================================================

-- 주의사항:
-- 1. 이 스크립트는 Supabase 프로젝트에서 실행하세요
-- 2. 실행 전에 Supabase 프로젝트가 생성되어 있어야 합니다
-- 3. 실행 후 테스트 계정을 수동으로 생성해야 합니다

-- =====================================================
-- 1. 확장 기능 활성화 (안전한 버전)
-- =====================================================

-- UUID 생성 함수 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 실시간 기능 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- JSON 처리 기능 활성화 (선택사항)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- 2. 기존 테이블 삭제 (주의: 모든 데이터가 삭제됩니다)
-- =====================================================

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS store_products CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- 3. 테이블 스키마 생성
-- =====================================================

-- 프로필 테이블 (사용자 정보)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'store_owner', 'hq')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    name TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 지점 테이블
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 테이블
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 상품 테이블
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    image_url TEXT,
    barcode TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 지점별 상품 재고 테이블
CREATE TABLE store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    safety_stock INTEGER NOT NULL DEFAULT 10 CHECK (safety_stock >= 0),
    price INTEGER CHECK (price >= 0), -- 지점별 가격 (NULL이면 기본 가격 사용)
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, product_id)
);

-- 주문 테이블
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'mobile')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    pickup_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주문 상세 테이블
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_product_id UUID REFERENCES store_products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. 인덱스 생성 (성능 최적화)
-- =====================================================

-- 프로필 테이블 인덱스
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- 지점 테이블 인덱스
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_status ON stores(status);

-- 상품 테이블 인덱스
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_barcode ON products(barcode);

-- 지점별 상품 테이블 인덱스
CREATE INDEX idx_store_products_store_id ON store_products(store_id);
CREATE INDEX idx_store_products_product_id ON store_products(product_id);
CREATE INDEX idx_store_products_stock ON store_products(stock_quantity);

-- 주문 테이블 인덱스
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- 주문 상세 테이블 인덱스
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- 5. 함수 생성
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 주문 번호 자동 생성 함수 (트리거용)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    order_number TEXT;
    counter INTEGER;
BEGIN
    -- 주문 번호가 비어있을 때만 생성
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        -- 오늘 날짜를 YYYYMMDD 형식으로
        order_number := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 오늘 생성된 주문 수 확인
        SELECT COALESCE(COUNT(*), 0) + 1
        INTO counter
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE;
        
        -- 4자리 순번 추가 (0001, 0002, ...)
        order_number := order_number || LPAD(counter::TEXT, 4, '0');
        
        -- NEW 레코드에 주문 번호 설정
        NEW.order_number := order_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 재고 자동 차감 함수
CREATE OR REPLACE FUNCTION update_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문 상태가 'pending'에서 다른 상태로 변경될 때
    IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
        -- 주문 상품들의 재고 차감
        UPDATE store_products
        SET stock_quantity = stock_quantity - (
            SELECT quantity 
            FROM order_items 
            WHERE order_id = NEW.id AND store_product_id = store_products.id
        )
        WHERE id IN (
            SELECT store_product_id 
            FROM order_items 
            WHERE order_id = NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 취소 시 재고 복구 함수
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문이 취소될 때 재고 복구
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE store_products
        SET stock_quantity = stock_quantity + (
            SELECT quantity 
            FROM order_items 
            WHERE order_id = NEW.id AND store_product_id = store_products.id
        )
        WHERE id IN (
            SELECT store_product_id 
            FROM order_items 
            WHERE order_id = NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, email, role, name)
    VALUES (
        NEW.id,
        NEW.email,
        'customer', -- 기본 역할은 고객
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 지점별 상품 자동 생성 함수
CREATE OR REPLACE FUNCTION create_store_products_for_new_store()
RETURNS TRIGGER AS $$
BEGIN
    -- 새 지점이 생성되면 모든 활성 상품에 대해 재고 레코드 생성
    INSERT INTO store_products (store_id, product_id, stock_quantity, safety_stock)
    SELECT 
        NEW.id,
        id,
        0, -- 초기 재고는 0
        10 -- 기본 안전 재고
    FROM products
    WHERE status = 'active';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 상품 유효성 검사 함수
CREATE OR REPLACE FUNCTION validate_order_item()
RETURNS TRIGGER AS $$
DECLARE
    available_stock INTEGER;
    product_price INTEGER;
BEGIN
    -- 재고 확인
    SELECT stock_quantity INTO available_stock
    FROM store_products
    WHERE id = NEW.store_product_id;
    
    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION '재고 부족: 요청 수량 %개, 사용 가능 수량 %개', NEW.quantity, available_stock;
    END IF;
    
    -- 가격 확인
    SELECT COALESCE(sp.price, p.price) INTO product_price
    FROM store_products sp
    JOIN products p ON sp.product_id = p.id
    WHERE sp.id = NEW.store_product_id;
    
    -- 가격이 일치하는지 확인
    IF NEW.unit_price != product_price THEN
        RAISE EXCEPTION '가격 불일치: 입력 가격 %원, 실제 가격 %원', NEW.unit_price, product_price;
    END IF;
    
    -- 총 가격 계산 확인
    IF NEW.total_price != (NEW.unit_price * NEW.quantity) THEN
        RAISE EXCEPTION '총 가격 계산 오류: 입력 총 가격 %원, 계산된 총 가격 %원', 
            NEW.total_price, (NEW.unit_price * NEW.quantity);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 총액 자동 계산 함수
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문 상품이 추가/수정/삭제될 때 주문 총액 업데이트
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM order_items
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 재고 부족 알림 함수
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- 재고가 안전 재고 이하로 떨어질 때 알림 (실제로는 웹훅이나 이메일 발송)
    IF NEW.stock_quantity <= NEW.safety_stock AND OLD.stock_quantity > NEW.safety_stock THEN
        -- 여기에 알림 로직 추가 (예: 로그 테이블에 기록)
        RAISE NOTICE '재고 부족 알림: 상품 ID %, 현재 재고 %, 안전 재고 %', 
            NEW.product_id, NEW.stock_quantity, NEW.safety_stock;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. 트리거 설정
-- =====================================================

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_products_updated_at
    BEFORE UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 주문 번호 자동 생성 트리거
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- 재고 관리 트리거
CREATE TRIGGER update_stock_on_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_quantity();

CREATE TRIGGER restore_stock_on_order_cancel
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION restore_stock_on_cancel();

-- 사용자 자동 프로필 생성 트리거
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 지점별 상품 자동 생성 트리거
CREATE TRIGGER create_store_products_on_store_creation
    AFTER INSERT ON stores
    FOR EACH ROW
    EXECUTE FUNCTION create_store_products_for_new_store();

-- 주문 상품 유효성 검사 트리거
CREATE TRIGGER validate_order_item_trigger
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_item();

-- 주문 총액 자동 계산 트리거
CREATE TRIGGER update_order_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();

-- 재고 부족 알림 트리거
CREATE TRIGGER notify_low_stock_trigger
    AFTER UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION notify_low_stock();

-- =====================================================
-- 7. RLS (Row Level Security) 활성화 및 정책 설정
-- =====================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 프로필 테이블 정책
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "HQ can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

CREATE POLICY "HQ can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- 지점 테이블 정책
CREATE POLICY "Anyone can view active stores" ON stores
    FOR SELECT USING (status = 'active');

CREATE POLICY "Store owners can manage own stores" ON stores
    FOR ALL USING (
        owner_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'store_owner'
        )
    );

CREATE POLICY "HQ can manage all stores" ON stores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- 카테고리 테이블 정책
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (status = 'active');

CREATE POLICY "HQ can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- 상품 테이블 정책
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "HQ can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- 지점별 상품 테이블 정책
CREATE POLICY "Customers can view store products" ON store_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'customer'
        )
    );

CREATE POLICY "Store owners can manage own store products" ON store_products
    FOR ALL USING (
        store_id IN (
            SELECT s.id FROM stores s
            JOIN profiles p ON s.owner_id = p.id
            WHERE p.user_id = auth.uid() AND p.role = 'store_owner'
        )
    );

CREATE POLICY "HQ can manage all store products" ON store_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- 주문 테이블 정책
CREATE POLICY "Customers can manage own orders" ON orders
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'customer'
        )
    );

CREATE POLICY "Store owners can manage own store orders" ON orders
    FOR ALL USING (
        store_id IN (
            SELECT s.id FROM stores s
            JOIN profiles p ON s.owner_id = p.id
            WHERE p.user_id = auth.uid() AND p.role = 'store_owner'
        )
    );

CREATE POLICY "HQ can manage all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- 주문 상세 테이블 정책
CREATE POLICY "Customers can view own order items" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN profiles p ON o.customer_id = p.id
            WHERE p.user_id = auth.uid() AND p.role = 'customer'
        )
    );

CREATE POLICY "Store owners can manage own store order items" ON order_items
    FOR ALL USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN stores s ON o.store_id = s.id
            JOIN profiles p ON s.owner_id = p.id
            WHERE p.user_id = auth.uid() AND p.role = 'store_owner'
        )
    );

CREATE POLICY "HQ can manage all order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- 특별 정책 (시스템 관리용)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create orders" ON orders
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        customer_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create order items" ON order_items
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        order_id IN (
            SELECT o.id FROM orders o
            JOIN profiles p ON o.customer_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- =====================================================
-- 8. 초기 데이터 삽입
-- =====================================================

-- 카테고리 데이터 삽입
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

-- 상품 데이터 삽입 (주요 상품들만)
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
    '물 500ml',
    '깨끗한 생수',
    c.id,
    800,
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    '8801094001237',
    'active'
FROM categories c WHERE c.name = '음료'
ON CONFLICT (barcode) DO NOTHING;

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
    '신라면',
    '매운 라면',
    c.id,
    1200,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    '8801094001241',
    'active'
FROM categories c WHERE c.name = '라면/즉석식품'
ON CONFLICT (barcode) DO NOTHING;

-- =====================================================
-- 9. 설정 완료 확인
-- =====================================================

-- 테이블 생성 확인
SELECT 
    '테이블 생성 완료' as "확인 항목",
    COUNT(*) as "테이블 수"
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('profiles', 'stores', 'categories', 'products', 'store_products', 'orders', 'order_items');

-- 함수 생성 확인
SELECT 
    '함수 생성 완료' as "확인 항목",
    COUNT(*) as "함수 수"
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN (
        'update_updated_at_column',
        'generate_order_number',
        'update_stock_quantity',
        'restore_stock_on_cancel',
        'handle_new_user',
        'create_store_products_for_new_store',
        'validate_order_item',
        'update_order_total',
        'notify_low_stock'
    );

-- 트리거 생성 확인
SELECT 
    '트리거 생성 완료' as "확인 항목",
    COUNT(*) as "트리거 수"
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND trigger_name IN (
        'update_profiles_updated_at',
        'update_stores_updated_at',
        'update_categories_updated_at',
        'update_products_updated_at',
        'update_store_products_updated_at',
        'update_orders_updated_at',
        'generate_order_number_trigger',
        'update_stock_on_order_status_change',
        'restore_stock_on_order_cancel',
        'on_auth_user_created',
        'create_store_products_on_store_creation',
        'validate_order_item_trigger',
        'update_order_total_trigger',
        'notify_low_stock_trigger'
    );

-- RLS 정책 확인
SELECT 
    'RLS 정책 생성 완료' as "확인 항목",
    COUNT(*) as "정책 수"
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'stores', 'categories', 'products', 'store_products', 'orders', 'order_items');

-- 초기 데이터 확인
SELECT 
    '초기 데이터 삽입 완료' as "확인 항목",
    COUNT(*) as "카테고리 수"
FROM categories
UNION ALL
SELECT 
    '초기 데이터 삽입 완료' as "확인 항목",
    COUNT(*) as "상품 수"
FROM products;

-- =====================================================
-- 10. 다음 단계 안내
-- =====================================================

/*
✅ 설정 완료!

다음 단계:
1. Supabase 대시보드 > Authentication > Users에서 테스트 계정 생성:
   - customer1@test.com / password123
   - customer2@test.com / password123
   - shopowner1@test.com / password123
   - shopowner2@test.com / password123
   - hq@test.com / password123

2. 07_test_accounts.sql 실행하여 테스트 데이터 생성

3. 환경 변수 설정 (.env 파일):
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key

4. 애플리케이션 실행:
   npm run dev

5. 테스트 계정으로 로그인하여 기능 확인
*/ 