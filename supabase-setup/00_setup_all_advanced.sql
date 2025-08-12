-- =====================================================
-- 00_setup_all_advanced.sql
-- 고급 편의점 관리 시스템 전체 설정 (22개 테이블)
-- =====================================================

-- 이 스크립트는 모든 고급 기능을 포함한 완전한 데이터베이스를 구축합니다.
-- 실행 시간: 약 2-3분 소요
-- 최종 업데이트: 2025-08-11 (쿠폰/포인트/위시리스트 시스템 추가 - 총 22개 테이블)

-- =====================================================
-- 1. 확장 기능 활성화
-- =====================================================

-- UUID 생성 함수 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- =====================================================
-- 2. 테이블 생성 (22개 테이블)
-- =====================================================

-- 기존 테이블 삭제 (확장된 목록)
DROP TABLE IF EXISTS product_wishlists CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS user_coupons CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS points CASCADE;
DROP TABLE IF EXISTS point_settings CASCADE;
DROP TABLE IF EXISTS daily_sales_summary CASCADE;
DROP TABLE IF EXISTS product_sales_summary CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS supply_request_items CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS supply_requests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS store_products CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 핵심 테이블 생성
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('customer', 'store_owner', 'headquarters')),
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    address JSONB,
    preferences JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 새로 추가된 컬럼들 (사용자 프로필 확장)
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    notification_settings JSONB DEFAULT '{"newsletter": false, "promotions": true, "order_updates": true, "push_notifications": true, "email_notifications": true}'::jsonb
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID,
    icon_url TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    barcode TEXT UNIQUE,
    category_id UUID,
    brand TEXT,
    manufacturer TEXT,
    unit TEXT NOT NULL DEFAULT '개',
    image_urls TEXT[] DEFAULT '{}',
    base_price NUMERIC NOT NULL,
    cost_price NUMERIC,
    tax_rate NUMERIC DEFAULT 0.10,
    is_active BOOLEAN DEFAULT true,
    requires_preparation BOOLEAN DEFAULT false,
    preparation_time INTEGER DEFAULT 0,
    nutritional_info JSONB DEFAULT '{}'::jsonb,
    allergen_info TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 새로 추가된 위시리스트 관련 컬럼들
    is_wishlisted BOOLEAN DEFAULT false,
    wishlist_count INTEGER DEFAULT 0,
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    location GEOGRAPHY(POINT),
    delivery_available BOOLEAN DEFAULT true,
    pickup_available BOOLEAN DEFAULT true,
    delivery_radius INTEGER DEFAULT 3000,
    min_order_amount NUMERIC DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id)
);

CREATE TABLE store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID,
    product_id UUID,
    price NUMERIC NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    safety_stock INTEGER DEFAULT 10,
    max_stock INTEGER DEFAULT 100,
    is_available BOOLEAN DEFAULT true,
    discount_rate NUMERIC DEFAULT 0,
    promotion_start_date TIMESTAMP WITH TIME ZONE,
    promotion_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT store_products_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT store_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID,
    store_id UUID,
    type TEXT NOT NULL CHECK (type IN ('pickup', 'delivery')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    delivery_address JSONB,
    delivery_notes TEXT,
    payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'kakao_pay', 'toss_pay', 'naver_pay')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_data JSONB DEFAULT '{}'::jsonb,
    pickup_time TIMESTAMP WITH TIME ZONE,
    estimated_preparation_time INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 새로 추가된 쿠폰/포인트 관련 컬럼들
    coupon_discount_amount NUMERIC DEFAULT 0,
    points_used INTEGER DEFAULT 0,
    points_discount_amount NUMERIC DEFAULT 0,
    applied_coupon_id UUID REFERENCES coupons(id),
    CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES profiles(id),
    CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID,
    product_id UUID,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    subtotal NUMERIC NOT NULL,
    options JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 고급 기능 테이블 생성
CREATE TABLE daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    pickup_orders INTEGER DEFAULT 0,
    delivery_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    avg_order_value NUMERIC DEFAULT 0,
    hourly_stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT daily_sales_summary_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE product_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID,
    product_id UUID,
    date DATE NOT NULL,
    quantity_sold INTEGER DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    avg_price NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT product_sales_summary_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT product_sales_summary_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID,
    status TEXT NOT NULL,
    changed_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profiles(id)
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id UUID,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'expired', 'damaged', 'returned')),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    unit_cost NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    reason TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT inventory_transactions_store_product_id_fkey FOREIGN KEY (store_product_id) REFERENCES store_products(id),
    CONSTRAINT inventory_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id)
);

CREATE TABLE supply_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT NOT NULL UNIQUE,
    store_id UUID,
    requested_by UUID,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    total_amount NUMERIC DEFAULT 0,
    approved_amount NUMERIC DEFAULT 0,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT supply_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT supply_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES profiles(id),
    CONSTRAINT supply_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES profiles(id)
);

CREATE TABLE supply_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supply_request_id UUID,
    product_id UUID,
    product_name TEXT NOT NULL,
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    approved_quantity INTEGER DEFAULT 0 CHECK (approved_quantity >= 0),
    unit_cost NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    reason TEXT,
    current_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT supply_request_items_supply_request_id_fkey FOREIGN KEY (supply_request_id) REFERENCES supply_requests(id),
    CONSTRAINT supply_request_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_number TEXT NOT NULL UNIQUE,
    supply_request_id UUID,
    status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'failed')),
    carrier TEXT,
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT shipments_supply_request_id_fkey FOREIGN KEY (supply_request_id) REFERENCES supply_requests(id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 새로 추가된 테이블들 (쿠폰/포인트/위시리스트 시스템)
-- =====================================================

-- 쿠폰 시스템
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 쿠폰 보유/사용 내역
CREATE TABLE user_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    used_order_id UUID REFERENCES orders(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포인트 시스템
CREATE TABLE points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'used', 'expired', 'bonus')),
    description TEXT,
    order_id UUID REFERENCES orders(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포인트 정책 설정
CREATE TABLE point_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 위시리스트 시스템
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    product_id UUID NOT NULL REFERENCES products(id)
);

-- 상품별 위시리스트 매핑 (추가 기능용)
CREATE TABLE product_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. 인덱스 생성
-- =====================================================

-- 기본 인덱스들
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_store_products_store_id ON store_products(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 새로 추가된 테이블들의 인덱스들
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_coupon_id ON user_coupons(coupon_id);
CREATE INDEX idx_user_coupons_is_used ON user_coupons(is_used);
CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_points_type ON points(type);
CREATE INDEX idx_points_order_id ON points(order_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX idx_product_wishlists_product_id ON product_wishlists(product_id);
CREATE INDEX idx_product_wishlists_user_id ON product_wishlists(user_id);

-- 고급 기능 인덱스들
CREATE INDEX idx_daily_sales_summary_store_date ON daily_sales_summary(store_id, date);
CREATE INDEX idx_product_sales_summary_store_product_date ON product_sales_summary(store_id, product_id, date);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_inventory_transactions_store_product_id ON inventory_transactions(store_product_id);
CREATE INDEX idx_supply_requests_store_id ON supply_requests(store_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- 중복 주문 방지를 위한 인덱스들 (2025-08-05 추가)
CREATE INDEX idx_orders_payment_key ON orders ((payment_data->>'paymentKey'));
CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at);

-- =====================================================
-- 4. 함수 생성 (완전한 버전)
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'ORD-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
                NEW.order_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '주문 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 물류 요청 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_supply_request_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'SUP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM supply_requests WHERE request_number = new_number) THEN
                NEW.request_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '물류 요청 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 배송 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.shipment_number IS NULL OR NEW.shipment_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'SHIP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM shipments WHERE shipment_number = new_number) THEN
                NEW.shipment_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '배송 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 상태 변경 로깅 함수
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, status, changed_by, notes)
        VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 지점 생성 시 상품 초기화 함수
CREATE OR REPLACE FUNCTION initialize_store_products()
RETURNS TRIGGER AS $$
BEGIN
    -- 새로 생성된 지점에 대해 모든 활성 상품에 대한 초기 재고 레코드 생성
    INSERT INTO store_products (store_id, product_id, price, stock_quantity, is_available)
    SELECT 
        NEW.id as store_id,
        p.id as product_id,
        p.base_price as price,
        0 as stock_quantity,  -- 초기 재고는 0개
        true as is_available
    FROM products p
    WHERE p.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM store_products sp 
        WHERE sp.store_id = NEW.id AND sp.product_id = p.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 재고 부족 체크 함수
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- 재고가 안전재고 이하로 떨어졌을 때 알림 생성
    IF NEW.stock_quantity <= NEW.safety_stock AND OLD.stock_quantity > OLD.safety_stock THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority
        ) VALUES (
            (SELECT owner_id FROM stores WHERE id = NEW.store_id),
            'low_stock',
            '재고 부족 알림',
            '상품 "' || (SELECT name FROM products WHERE id = NEW.product_id) || '"의 재고가 부족합니다.',
            jsonb_build_object(
                'store_id', NEW.store_id,
                'product_id', NEW.product_id,
                'current_stock', NEW.stock_quantity,
                'safety_stock', NEW.safety_stock
            ),
            'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 완료 처리 함수 (고객 알림 추가)
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    order_item RECORD;
    store_name TEXT;
BEGIN
    -- 주문이 완료 상태로 변경될 때만 실행
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- 지점명 조회
        SELECT name INTO store_name FROM stores WHERE id = NEW.store_id;
        
        -- 고객에게 주문 완료 알림 생성
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority
        ) VALUES (
            NEW.customer_id,
            'order_completed',
            '주문이 완료되었습니다',
            '주문번호 ' || NEW.order_number || '의 준비가 완료되었습니다. ' || COALESCE(store_name, '지점') || '에서 픽업 가능합니다.',
            jsonb_build_object(
                'order_id', NEW.id,
                'order_number', NEW.order_number,
                'store_id', NEW.store_id,
                'store_name', COALESCE(store_name, '지점')
            ),
            'high'
        );
        
        -- 주문 아이템들을 순회하며 재고 차감
        FOR order_item IN 
            SELECT oi.product_id, oi.quantity, sp.id as store_product_id
            FROM order_items oi
            LEFT JOIN store_products sp ON sp.store_id = NEW.store_id AND sp.product_id = oi.product_id
            WHERE oi.order_id = NEW.id
        LOOP
            -- 재고가 있는 경우에만 차감
            IF order_item.store_product_id IS NOT NULL THEN
                -- 재고 차감
                UPDATE store_products 
                SET stock_quantity = GREATEST(0, stock_quantity - order_item.quantity),
                    updated_at = NOW()
                WHERE id = order_item.store_product_id;
                
                -- 재고 이력 기록
                INSERT INTO inventory_transactions (
                    store_product_id,
                    transaction_type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference_type,
                    reference_id,
                    reason,
                    created_by
                ) VALUES (
                    order_item.store_product_id,
                    'out',
                    order_item.quantity,
                    (SELECT stock_quantity + order_item.quantity FROM store_products WHERE id = order_item.store_product_id),
                    (SELECT stock_quantity FROM store_products WHERE id = order_item.store_product_id),
                    'order',
                    NEW.id,
                    '주문 완료로 인한 재고 차감',
                    NEW.customer_id
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 배송 완료 처리 함수
CREATE OR REPLACE FUNCTION handle_shipment_delivery()
RETURNS TRIGGER AS $$
DECLARE
    request_item RECORD;
    store_product_id UUID;
BEGIN
    -- 배송이 완료 상태로 변경될 때만 실행
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- 물류 요청 아이템들을 순회하며 재고 증가
        FOR request_item IN 
            SELECT sri.product_id, sri.approved_quantity, sr.store_id
            FROM supply_request_items sri
            JOIN supply_requests sr ON sr.id = sri.supply_request_id
            WHERE sr.id = NEW.supply_request_id AND sri.approved_quantity > 0
        LOOP
            -- store_products에서 해당 상품의 ID 조회
            SELECT id INTO store_product_id 
            FROM store_products 
            WHERE store_id = request_item.store_id AND product_id = request_item.product_id;
            
            IF store_product_id IS NOT NULL THEN
                -- 재고 증가
                UPDATE store_products 
                SET stock_quantity = stock_quantity + request_item.approved_quantity,
                    updated_at = NOW()
                WHERE id = store_product_id;
                
                -- 재고 이력 기록
                INSERT INTO inventory_transactions (
                    store_product_id,
                    transaction_type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference_type,
                    reference_id,
                    reason,
                    created_by
                ) VALUES (
                    store_product_id,
                    'in',
                    request_item.approved_quantity,
                    (SELECT stock_quantity - request_item.approved_quantity FROM store_products WHERE id = store_product_id),
                    (SELECT stock_quantity FROM store_products WHERE id = store_product_id),
                    'supply_request',
                    NEW.supply_request_id,
                    '물류 배송 완료로 인한 재고 증가',
                    NEW.id
                );
            END IF;
        END LOOP;
        
        -- 물류 요청 상태를 delivered로 업데이트
        UPDATE supply_requests 
        SET status = 'delivered',
            actual_delivery_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = NEW.supply_request_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 물류 요청 배송 완료 시 재고 업데이트 함수
CREATE OR REPLACE FUNCTION update_inventory_on_supply_delivery()
RETURNS TRIGGER AS $$
DECLARE
    supply_item RECORD;
BEGIN
    -- 물류 요청이 배송 완료 상태로 변경되었을 때만 실행
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- 물류 요청 상품들의 재고를 증가
        FOR supply_item IN 
            SELECT sri.product_id, sri.approved_quantity, sr.store_id
            FROM public.supply_request_items sri
            JOIN public.supply_requests sr ON sri.supply_request_id = sr.id
            WHERE sri.supply_request_id = NEW.id
                AND sri.approved_quantity > 0
        LOOP
            -- store_products 테이블의 재고 증가 (RLS 우회)
            UPDATE public.store_products 
            SET stock_quantity = stock_quantity + supply_item.approved_quantity,
                updated_at = NOW()
            WHERE store_id = supply_item.store_id 
                AND product_id = supply_item.product_id;
            
            -- 재고 거래 이력 기록 (RLS 우회)
            INSERT INTO public.inventory_transactions (
                store_product_id,
                transaction_type,
                quantity,
                previous_quantity,
                new_quantity,
                reference_type,
                reference_id,
                reason,
                created_by
            )
            SELECT 
                sp.id,
                'in',
                supply_item.approved_quantity,
                sp.stock_quantity - supply_item.approved_quantity,
                sp.stock_quantity,
                'supply_request',
                NEW.id,
                '물류 요청 배송 완료로 인한 재고 증가',
                NEW.requested_by
            FROM public.store_products sp
            WHERE sp.store_id = supply_item.store_id 
                AND sp.product_id = supply_item.product_id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 재고 거래 시 store_products 업데이트 함수
CREATE OR REPLACE FUNCTION update_store_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE store_products 
    SET stock_quantity = NEW.new_quantity,
        updated_at = NOW()
    WHERE id = NEW.store_product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 중복 주문 방지 함수 (2025-08-05 추가)
CREATE OR REPLACE FUNCTION prevent_duplicate_orders()
RETURNS TRIGGER AS $$
DECLARE
    existing_order_id UUID;
    payment_key TEXT;
BEGIN
    -- payment_data에서 paymentKey 추출
    payment_key := NEW.payment_data->>'paymentKey';
    
    -- paymentKey가 있는 경우에만 중복 검사
    IF payment_key IS NOT NULL AND payment_key != '' THEN
        -- 같은 paymentKey를 가진 주문이 이미 있는지 확인
        SELECT id INTO existing_order_id
        FROM orders 
        WHERE payment_data->>'paymentKey' = payment_key
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        LIMIT 1;
        
        -- 중복 주문이 발견되면 에러 발생
        IF existing_order_id IS NOT NULL THEN
            RAISE EXCEPTION '중복 주문이 감지되었습니다. PaymentKey: %', payment_key;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 지점의 서비스 가능 여부를 검증하는 함수
CREATE OR REPLACE FUNCTION validate_store_service(
    p_store_id UUID,
    p_service_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    store_record RECORD;
BEGIN
    -- 지점 정보 조회
    SELECT 
        is_active,
        delivery_available,
        pickup_available
    INTO store_record
    FROM stores
    WHERE id = p_store_id;
    
    -- 지점이 존재하지 않거나 비활성화된 경우
    IF NOT FOUND OR NOT store_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- 서비스 타입에 따른 검증
    CASE p_service_type
        WHEN 'delivery' THEN
            RETURN store_record.delivery_available;
        WHEN 'pickup' THEN
            RETURN store_record.pickup_available;
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 주문 생성 시 서비스 가능 여부를 검증하는 함수
CREATE OR REPLACE FUNCTION validate_order_service()
RETURNS TRIGGER AS $$
BEGIN
    -- 지점의 서비스 가능 여부 검증
    IF NOT validate_store_service(NEW.store_id, NEW.type) THEN
        RAISE EXCEPTION '선택한 지점에서 % 서비스를 이용할 수 없습니다.', 
            CASE NEW.type 
                WHEN 'delivery' THEN '배송'
                WHEN 'pickup' THEN '픽업'
                ELSE NEW.type
            END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. 트리거 생성 (완전한 버전)
-- =====================================================

-- updated_at 트리거들
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_products_updated_at BEFORE UPDATE ON store_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supply_requests_updated_at BEFORE UPDATE ON supply_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_sales_summary_updated_at BEFORE UPDATE ON daily_sales_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 번호 자동 생성 트리거들
CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();
CREATE TRIGGER set_supply_request_number_trigger BEFORE INSERT ON supply_requests FOR EACH ROW EXECUTE FUNCTION generate_supply_request_number();
CREATE TRIGGER set_shipment_number_trigger BEFORE INSERT ON shipments FOR EACH ROW EXECUTE FUNCTION generate_shipment_number();

-- 주문 상태 변경 로깅 트리거
CREATE TRIGGER log_order_status_change_trigger AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- 지점 생성 시 상품 초기화 트리거
CREATE TRIGGER trigger_initialize_store_products AFTER INSERT ON stores FOR EACH ROW EXECUTE FUNCTION initialize_store_products();

-- 재고 부족 체크 트리거
CREATE TRIGGER trigger_low_stock_check AFTER UPDATE ON store_products FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- 주문 완료 처리 트리거
CREATE TRIGGER trigger_order_completion AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION handle_order_completion();

-- 배송 완료 처리 트리거
CREATE TRIGGER trigger_shipment_delivery AFTER UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION handle_shipment_delivery();

-- 물류 요청 배송 완료 시 재고 업데이트 트리거
CREATE TRIGGER trigger_update_inventory_on_supply_delivery AFTER UPDATE ON supply_requests FOR EACH ROW EXECUTE FUNCTION update_inventory_on_supply_delivery();

-- 재고 거래 시 store_products 업데이트 트리거
CREATE TRIGGER update_store_product_stock_trigger AFTER INSERT ON inventory_transactions FOR EACH ROW EXECUTE FUNCTION update_store_product_stock();

-- 중복 주문 방지 트리거 (2025-08-05 추가)
CREATE TRIGGER trigger_prevent_duplicate_orders
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_orders();

-- 주문 생성 시 서비스 검증 트리거
CREATE TRIGGER trigger_validate_order_service
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_service();

-- =====================================================
-- 6. RLS 활성화 및 정책 생성 (무한 재귀 방지)
-- =====================================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 새로 추가된 테이블들의 RLS 활성화
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_wishlists ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. RLS 정책 생성 (무한 재귀 방지 버전)
-- =====================================================

-- profiles 테이블 정책 (무한 재귀 방지)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- categories 테이블 정책
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only HQ can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- products 테이블 정책
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Only HQ can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- stores 테이블 정책
CREATE POLICY "Anyone can view active stores" ON stores
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can create own store" ON stores
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Store owners can update own store" ON stores
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Store owners can view own store" ON stores
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('headquarters', 'customer')
        )
    );

CREATE POLICY "HQ can manage all stores" ON stores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- store_products 테이블 정책
CREATE POLICY "Customers can view available store products" ON store_products
    FOR SELECT USING (
        is_available = true AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'customer'
        )
    );

CREATE POLICY "Store owners can manage own store products" ON store_products
    FOR ALL USING (
        store_id IN (
            SELECT stores.id FROM stores WHERE stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "HQ can manage all store products" ON store_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- orders 테이블 정책
CREATE POLICY "Customers can create own orders" ON orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can delete own orders" ON orders
    FOR DELETE USING (customer_id = auth.uid());

CREATE POLICY "Store owners can manage store orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores s
            WHERE s.id = orders.store_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "HQ can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- order_items 테이블 정책
CREATE POLICY "Customers can create order items for own orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id AND o.customer_id = auth.uid()
        )
    );

CREATE POLICY "Customers can delete own order items" ON order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id AND o.customer_id = auth.uid()
        )
    );

CREATE POLICY "Users can view order items based on order access" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id AND (
                o.customer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM stores s
                    WHERE s.id = o.store_id AND s.owner_id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.id = auth.uid() AND p.role = 'headquarters'
                )
            )
        )
    );

-- daily_sales_summary 테이블 정책
CREATE POLICY "Store owners can view own sales summary" ON daily_sales_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores s
            WHERE s.id = daily_sales_summary.store_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "HQ can view all sales summary" ON daily_sales_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- product_sales_summary 테이블 정책
CREATE POLICY "Store owners can view own product sales" ON product_sales_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores s
            WHERE s.id = product_sales_summary.store_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "HQ can view all product sales" ON product_sales_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- order_status_history 테이블 정책
CREATE POLICY "Store owners can create order status history" ON order_status_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE o.id = order_status_history.order_id AND s.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'headquarters'
        )
    );

CREATE POLICY "Users can view order status history based on order access" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_status_history.order_id AND (
                o.customer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM stores s
                    WHERE s.id = o.store_id AND s.owner_id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.id = auth.uid() AND p.role = 'headquarters'
                )
            )
        )
    );

-- inventory_transactions 테이블 정책
CREATE POLICY "Store owners can manage own inventory transactions" ON inventory_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM store_products sp
            JOIN stores s ON s.id = sp.store_id
            WHERE sp.id = inventory_transactions.store_product_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "HQ can manage all inventory transactions" ON inventory_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

CREATE POLICY "Customers can create inventory transactions for own orders" ON inventory_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = inventory_transactions.reference_id 
                AND o.customer_id = auth.uid()
                AND inventory_transactions.reference_type = 'order'
        )
    );

-- supply_requests 테이블 정책
CREATE POLICY "Store owners can manage own supply requests" ON supply_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores s
            WHERE s.id = supply_requests.store_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "HQ can manage all supply requests" ON supply_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- supply_request_items 테이블 정책
CREATE POLICY "Users can manage supply request items based on request access" ON supply_request_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM supply_requests sr
            WHERE sr.id = supply_request_items.supply_request_id AND (
                EXISTS (
                    SELECT 1 FROM stores s
                    WHERE s.id = sr.store_id AND s.owner_id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.id = auth.uid() AND p.role = 'headquarters'
                )
            )
        )
    );

-- shipments 테이블 정책
CREATE POLICY "Store owners can view own shipments" ON shipments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM supply_requests sr
            JOIN stores s ON s.id = sr.store_id
            WHERE sr.id = shipments.supply_request_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Only HQ can manage shipments" ON shipments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- notifications 테이블 정책
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Allow creating notifications for users" ON notifications
    FOR INSERT WITH CHECK (
        -- 점주가 자신의 지점 고객에게 알림 생성 가능
        EXISTS (
            SELECT 1 FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE o.customer_id = notifications.user_id 
            AND s.owner_id = auth.uid()
        ) OR
        -- 본사가 모든 사용자에게 알림 생성 가능
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'headquarters'
        ) OR
        -- 시스템 함수/트리거에서 알림 생성 가능 (auth.uid()가 null인 경우)
        auth.uid() IS NULL
    );

-- system_settings 테이블 정책
CREATE POLICY "Anyone can view public settings" ON system_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "HQ can manage all settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- =====================================================
-- 새로 추가된 테이블들의 RLS 정책
-- =====================================================

-- coupons 테이블 정책
CREATE POLICY "Anyone can view active coupons" ON coupons
    FOR SELECT USING (is_active = true);

CREATE POLICY "HQ can manage all coupons" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- user_coupons 테이블 정책
CREATE POLICY "Users can view own coupons" ON user_coupons
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can use own coupons" ON user_coupons
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert user coupons" ON user_coupons
    FOR INSERT WITH CHECK (true);

-- points 테이블 정책
CREATE POLICY "Users can view own points" ON points
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage points" ON points
    FOR ALL USING (true);

-- point_settings 테이블 정책
CREATE POLICY "Anyone can view point settings" ON point_settings
    FOR SELECT USING (true);

CREATE POLICY "HQ can manage point settings" ON point_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
        )
    );

-- wishlists 테이블 정책
CREATE POLICY "Users can view own wishlists" ON wishlists
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own wishlists" ON wishlists
    FOR ALL USING (user_id = auth.uid());

-- product_wishlists 테이블 정책
CREATE POLICY "Users can view own product wishlists" ON product_wishlists
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own product wishlists" ON product_wishlists
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 8. 초기 데이터 삽입 (대폭 확장된 테스트 데이터)
-- =====================================================

-- 카테고리 데이터 (29개 카테고리)
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
-- 기본 대분류 카테고리
('음료', 'beverages', '다양한 음료 제품', 1, true),
('식품', 'food', '신선한 식품', 2, true),
('간식', 'snacks', '맛있는 간식', 3, true),
('생활용품', 'household', '일상 생활용품', 4, true),

-- 음료 세부 카테고리
('탄산음료', 'carbonated-drinks', '시원하고 톡 쏘는 탄산음료', 11, true),
('커피/차', 'coffee-tea', '따뜻하고 향긋한 커피와 차', 12, true),
('우유/유제품', 'milk-dairy', '신선한 우유와 유제품', 13, true),
('주스/음료', 'juice-drinks', '과일 주스와 건강 음료', 14, true),
('에너지음료', 'energy-drinks', '활력을 주는 에너지 드링크', 15, true),

-- 식품 세부 카테고리
('즉석식품', 'instant-food', '간편하게 먹을 수 있는 즉석식품', 21, true),
('라면/면류', 'noodles-ramen', '다양한 라면과 면류 제품', 22, true),
('냉동식품', 'frozen-food', '신선하게 보관된 냉동식품', 23, true),
('빵/베이커리', 'bread-bakery', '갓 구운 빵과 베이커리 제품', 24, true),
('유제품/계란', 'dairy-eggs', '신선한 유제품과 계란', 25, true),

-- 간식 세부 카테고리
('과자/스낵', 'snacks-crackers', '바삭하고 맛있는 과자류', 31, true),
('초콜릿/사탕', 'chocolate-candy', '달콤한 초콜릿과 사탕', 32, true),
('아이스크림', 'ice-cream', '시원하고 달콤한 아이스크림', 33, true),
('견과류', 'nuts', '건강한 견과류와 건과일', 34, true),
('껌/젤리', 'gum-jelly', '쫄깃한 껌과 젤리류', 35, true),

-- 생활용품 세부 카테고리
('세제/청소용품', 'cleaning-supplies', '깨끗한 생활을 위한 세제', 41, true),
('화장지/휴지', 'tissue-paper', '부드러운 화장지와 휴지', 42, true),
('개인위생용품', 'personal-hygiene', '개인 위생을 위한 필수품', 43, true),
('화장품/미용', 'cosmetics-beauty', '아름다운 생활을 위한 화장품', 44, true),
('의약품/건강', 'medicine-health', '건강 관리를 위한 의약품', 45, true),

-- 새로운 대분류 추가
('문구/사무용품', 'stationery-office', '학습과 업무를 위한 문구류', 50, true),
('전자제품/배터리', 'electronics-battery', '편리한 전자제품과 배터리', 60, true),
('담배/주류', 'tobacco-alcohol', '성인용 담배와 주류 제품', 70, true),
('반려동물용품', 'pet-supplies', '사랑하는 반려동물을 위한 용품', 80, true),
('자동차용품', 'car-supplies', '자동차 관리를 위한 용품', 90, true);

-- 상품 데이터 (52개 다양한 상품)
INSERT INTO products (name, description, barcode, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, is_active, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES

-- 기존 3개 상품 (호환성 유지)
('코카콜라 500ml', '세계적으로 사랑받는 탄산음료', '8801094000001', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '코카콜라', '한국 코카콜라', '개', 2000, 1200, 0.10, true, false, 0, '{"칼로리": 210, "탄수화물": 53, "단백질": 0, "지방": 0}', ARRAY['없음']),
('농심 신라면 120g', '한국의 대표적인 라면', '8801043001010', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '농심', '농심', '개', 1200, 750, 0.10, true, true, 4, '{"칼로리": 520, "탄수화물": 77, "단백질": 11, "지방": 19}', ARRAY['글루텐', '대두']),
('농심 새우깡 90g', '바삭하고 고소한 새우깡', '8801043011010', (SELECT id FROM categories WHERE slug = 'snacks-crackers'), '농심', '농심', '개', 1500, 900, 0.10, true, false, 0, '{"칼로리": 320, "탄수화물": 32, "단백질": 4, "지방": 20}', ARRAY['갑각류']),

-- 탄산음료 카테고리 추가 상품들
('코카콜라 350ml', '세계적으로 사랑받는 탄산음료', '8801094000011', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '코카콜라', '한국 코카콜라', '개', 1800, 1100, 0.10, true, false, 0, '{"칼로리": 140, "탄수화물": 37, "단백질": 0, "지방": 0}', ARRAY['없음']),
('펩시콜라 500ml', '상쾌한 콜라의 진정한 맛', '8801094000012', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '펩시', '롯데칠성음료', '개', 2000, 1200, 0.10, true, false, 0, '{"칼로리": 210, "탄수화물": 53, "단백질": 0, "지방": 0}', ARRAY['없음']),
('칠성사이다 500ml', '청량한 사이다의 대명사', '8801094000013', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '칠성사이다', '롯데칠성음료', '개', 1800, 1100, 0.10, true, false, 0, '{"칼로리": 190, "탄수화물": 48, "단백질": 0, "지방": 0}', ARRAY['없음']),
('스프라이트 500ml', '레몬라임의 상쾌한 맛', '8801094000014', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '스프라이트', '한국 코카콜라', '개', 1800, 1100, 0.10, true, false, 0, '{"칼로리": 180, "탄수화물": 45, "단백질": 0, "지방": 0}', ARRAY['없음']),
('환타 오렌지 500ml', '달콤한 오렌지 맛 탄산음료', '8801094000015', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '환타', '한국 코카콜라', '개', 1800, 1100, 0.10, true, false, 0, '{"칼로리": 200, "탄수화물": 50, "단백질": 0, "지방": 0}', ARRAY['없음']),
('마운틴듀 500ml', '시트러스 맛의 에너지 넘치는 탄산음료', '8801094000016', (SELECT id FROM categories WHERE slug = 'carbonated-drinks'), '마운틴듀', '롯데칠성음료', '개', 2000, 1200, 0.10, true, false, 0, '{"칼로리": 220, "탄수화물": 55, "단백질": 0, "지방": 0}', ARRAY['없음']),

-- 커피/차 카테고리 상품들
('맥심 오리지널 커피믹스', '달콤하고 부드러운 커피믹스', '8801094001011', (SELECT id FROM categories WHERE slug = 'coffee-tea'), '맥심', '동서식품', '개', 12000, 8000, 0.10, true, false, 0, '{"칼로리": 60, "탄수화물": 10, "단백질": 1, "지방": 2}', ARRAY['유제품']),
('스타벅스 아메리카노 RTD', '진짜 스타벅스 원두로 만든 아메리카노', '8801094001012', (SELECT id FROM categories WHERE slug = 'coffee-tea'), '스타벅스', '롯데칠성음료', '개', 3000, 1800, 0.10, true, false, 0, '{"칼로리": 10, "탄수화물": 2, "단백질": 1, "지방": 0}', ARRAY['없음']),
('TOP 아메리카노 275ml', '원두의 깊은 맛이 살아있는 아메리카노', '8801094001013', (SELECT id FROM categories WHERE slug = 'coffee-tea'), 'TOP', '롯데칠성음료', '개', 1500, 900, 0.10, true, false, 0, '{"칼로리": 5, "탄수화물": 1, "단백질": 0, "지방": 0}', ARRAY['없음']),
('컨트리타임 아이스티', '상큼한 레몬 아이스티', '8801094001014', (SELECT id FROM categories WHERE slug = 'coffee-tea'), '컨트리타임', '롯데칠성음료', '개', 1800, 1100, 0.10, true, false, 0, '{"칼로리": 80, "탄수화물": 20, "단백질": 0, "지방": 0}', ARRAY['없음']),
('립톤 아이스티 레몬', '세계 1위 티 브랜드의 아이스티', '8801094001015', (SELECT id FROM categories WHERE slug = 'coffee-tea'), '립톤', '유니레버코리아', '개', 1900, 1150, 0.10, true, false, 0, '{"칼로리": 90, "탄수화물": 22, "단백질": 0, "지방": 0}', ARRAY['없음']),

-- 라면/면류 카테고리 상품들
('농심 짜파게티 140g', '달콤짭짤한 짜장면의 맛', '8801043001001', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '농심', '농심', '개', 1300, 800, 0.10, true, true, 4, '{"칼로리": 570, "탄수화물": 80, "단백질": 12, "지방": 22}', ARRAY['글루텐', '대두']),
('농심 너구리 120g', '진한 다시마 육수의 우동', '8801043001002', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '농심', '농심', '개', 1200, 750, 0.10, true, true, 4, '{"칼로리": 500, "탄수화물": 75, "단백질": 10, "지방": 18}', ARRAY['글루텐', '대두']),
('농심 안성탕면 125g', '얼큰한 국물의 전통 라면', '8801043001003', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '농심', '농심', '개', 1200, 750, 0.10, true, true, 4, '{"칼로리": 520, "탄수화물": 77, "단백질": 11, "지방": 19}', ARRAY['글루텐', '대두']),
('오뚜기 진라면 순한맛 120g', '깔끔하고 순한 맛의 라면', '8801043002001', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '진라면', '오뚜기', '개', 1200, 750, 0.10, true, true, 4, '{"칼로리": 510, "탄수화물": 76, "단백질": 10, "지방": 18}', ARRAY['글루텐', '대두']),
('오뚜기 진라면 매운맛 120g', '매콤한 맛이 일품인 라면', '8801043002002', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '진라면', '오뚜기', '개', 1200, 750, 0.10, true, true, 4, '{"칼로리": 515, "탄수화물": 77, "단백질": 10, "지방": 18}', ARRAY['글루텐', '대두']),
('삼양 불닭볶음면 140g', '매운 맛의 대명사 볶음면', '8801043003001', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '불닭볶음면', '삼양식품', '개', 1500, 900, 0.10, true, true, 4, '{"칼로리": 530, "탄수화물": 80, "단백질": 11, "지방": 17}', ARRAY['글루텐', '대두']),
('팔도 비빔면 130g', '새콤달콤 비빔면의 원조', '8801043004001', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '팔도비빔면', '팔도', '개', 1300, 800, 0.10, true, true, 4, '{"칼로리": 490, "탄수화물": 85, "단백질": 9, "지방": 12}', ARRAY['글루텐', '대두']),
('농심 육개장사발면 86g', '얼큰한 육개장 맛 컵라면', '8801043001004', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '농심', '농심', '개', 1400, 850, 0.10, true, true, 3, '{"칼로리": 350, "탄수화물": 50, "단백질": 7, "지방": 13}', ARRAY['글루텐', '대두']),
('농심 새우탕면 75g', '시원한 새우 국물 컵라면', '8801043001005', (SELECT id FROM categories WHERE slug = 'noodles-ramen'), '농심', '농심', '개', 1400, 850, 0.10, true, true, 3, '{"칼로리": 320, "탄수화물": 45, "단백질": 6, "지방": 12}', ARRAY['글루텐', '대두', '갑각류']),

-- 과자/스낵 카테고리 상품들
('농심 포테토칩 오리지널 60g', '바삭한 감자칩의 정석', '8801043011001', (SELECT id FROM categories WHERE slug = 'snacks-crackers'), '농심', '농심', '개', 1800, 1100, 0.10, true, false, 0, '{"칼로리": 320, "탄수화물": 32, "단백질": 4, "지방": 20}', ARRAY['없음']),
('오리온 초코파이 360g', '부드러운 마시멜로와 초콜릿의 조화', '8801043012001', (SELECT id FROM categories WHERE slug = 'snacks-crackers'), '초코파이', '오리온', '개', 3500, 2200, 0.10, true, false, 0, '{"칼로리": 480, "탄수화물": 65, "단백질": 5, "지방": 22}', ARRAY['글루텐', '계란', '유제품']),
('롯데 빼빼로 오리지널 47g', '아삭한 비스킷과 달콤한 초콜릿', '8801043013001', (SELECT id FROM categories WHERE slug = 'snacks-crackers'), '빼빼로', '롯데제과', '개', 1200, 750, 0.10, true, false, 0, '{"칼로리": 240, "탄수화물": 32, "단백질": 3, "지방": 11}', ARRAY['글루텐', '유제품']),
('오리온 꼬깔콘 초코첵스 77g', '바삭한 콘과 달콤한 초콜릿', '8801043014001', (SELECT id FROM categories WHERE slug = 'snacks-crackers'), '꼬깔콘', '오리온', '개', 1500, 900, 0.10, true, false, 0, '{"칼로리": 380, "탄수화물": 58, "단백질": 5, "지방": 15}', ARRAY['유제품']),
('크라운 산도 오리지널 80g', '바삭하고 고소한 크래커', '8801043015001', (SELECT id FROM categories WHERE slug = 'snacks-crackers'), '산도', '크라운제과', '개', 1400, 850, 0.10, true, false, 0, '{"칼로리": 420, "탄수화물": 55, "단백질": 7, "지방": 20}', ARRAY['글루텐']),
('해태 허니버터칩 60g', '달콤짭짤한 허니버터 맛', '8801043016001', (SELECT id FROM categories WHERE slug = 'snacks-crackers'), '허니버터칩', '해태제과', '개', 1800, 1100, 0.10, true, false, 0, '{"칼로리": 320, "탄수화물": 34, "단백질": 4, "지방": 19}', ARRAY['유제품']),
('농심 양파링 50g', '바삭한 양파 맛 스낵', '8801043017001', (SELECT id FROM categories WHERE slug = 'snacks-crackers'), '농심', '농심', '개', 1500, 900, 0.10, true, false, 0, '{"칼로리": 260, "탄수화물": 30, "단백질": 4, "지방": 14}', ARRAY['없음']),

-- 우유/유제품 카테고리 상품들
('서울우유 1000ml', '신선한 목장 우유', '8801043021001', (SELECT id FROM categories WHERE slug = 'milk-dairy'), '서울우유', '서울우유협동조합', '개', 2800, 1800, 0.08, true, false, 0, '{"칼로리": 650, "탄수화물": 48, "단백질": 32, "지방": 36}', ARRAY['유제품']),
('매일우유 고칼슘 1000ml', '칼슘이 풍부한 영양 우유', '8801043021002', (SELECT id FROM categories WHERE slug = 'milk-dairy'), '매일우유', '매일유업', '개', 2900, 1850, 0.08, true, false, 0, '{"칼로리": 660, "탄수화물": 50, "단백질": 33, "지방": 36}', ARRAY['유제품']),
('빙그레 바나나맛우유 240ml', '달콤한 바나나 맛 우유', '8801043021003', (SELECT id FROM categories WHERE slug = 'milk-dairy'), '바나나맛우유', '빙그레', '개', 1500, 950, 0.08, true, false, 0, '{"칼로리": 190, "탄수화물": 32, "단백질": 6, "지방": 5}', ARRAY['유제품']),
('빙그레 딸기맛우유 240ml', '상큼한 딸기 맛 우유', '8801043021004', (SELECT id FROM categories WHERE slug = 'milk-dairy'), '딸기맛우유', '빙그레', '개', 1500, 950, 0.08, true, false, 0, '{"칼로리": 185, "탄수화물": 30, "단백질": 6, "지방": 5}', ARRAY['유제품']),
('남양 GT 요구르트 65ml', '유산균이 살아있는 요구르트', '8801043021005', (SELECT id FROM categories WHERE slug = 'milk-dairy'), 'GT', '남양유업', '개', 400, 250, 0.08, true, false, 0, '{"칼로리": 50, "탄수화물": 10, "단백질": 2, "지방": 1}', ARRAY['유제품']),

-- 즉석식품 카테고리 상품들
('CU 삼각김밥 참치마요', '고소한 참치마요 삼각김밥', '8801043031001', (SELECT id FROM categories WHERE slug = 'instant-food'), 'CU', 'CU', '개', 1500, 900, 0.08, true, false, 0, '{"칼로리": 280, "탄수화물": 45, "단백질": 8, "지방": 8}', ARRAY['계란', '대두']),
('CU 삼각김밥 스팸', '진짜 스팸이 들어간 삼각김밥', '8801043031002', (SELECT id FROM categories WHERE slug = 'instant-food'), 'CU', 'CU', '개', 1800, 1100, 0.08, true, false, 0, '{"칼로리": 320, "탄수화물": 48, "단백질": 10, "지방": 11}', ARRAY['대두']),
('CU 주먹밥 불고기', '달짝지근한 불고기 주먹밥', '8801043031003', (SELECT id FROM categories WHERE slug = 'instant-food'), 'CU', 'CU', '개', 2000, 1200, 0.08, true, false, 0, '{"칼로리": 350, "탄수화물": 55, "단백질": 12, "지방": 10}', ARRAY['대두']),
('오뚜기 컵밥 제육덮밥', '매콤한 제육이 올라간 덮밥', '8801043031004', (SELECT id FROM categories WHERE slug = 'instant-food'), '오뚜기', '오뚜기', '개', 3500, 2200, 0.08, true, true, 3, '{"칼로리": 480, "탄수화물": 70, "단백질": 15, "지방": 16}', ARRAY['대두']),
('오뚜기 컵밥 김치볶음밥', '얼큰한 김치볶음밥', '8801043031005', (SELECT id FROM categories WHERE slug = 'instant-food'), '오뚜기', '오뚜기', '개', 3000, 1900, 0.08, true, true, 3, '{"칼로리": 420, "탄수화물": 65, "단백질": 12, "지방": 14}', ARRAY['대두']),

-- 생활용품 카테고리들
('샤프란 주방세제 500ml', '기름때까지 깔끔하게', '8801043041001', (SELECT id FROM categories WHERE slug = 'cleaning-supplies'), '샤프란', 'LG생활건강', '개', 3000, 1900, 0.10, true, false, 0, '{}', ARRAY['없음']),
('크린랩 만능세정제 500ml', '99.9% 세균 제거', '8801043041002', (SELECT id FROM categories WHERE slug = 'cleaning-supplies'), '크린랩', '유한킴벌리', '개', 4000, 2500, 0.10, true, false, 0, '{}', ARRAY['없음']),
('깨끗한나라 화장지 30m 12롤', '부드럽고 질긴 화장지', '8801043042001', (SELECT id FROM categories WHERE slug = 'tissue-paper'), '깨끗한나라', '깨끗한나라', '개', 8000, 5200, 0.08, true, false, 0, '{}', ARRAY['없음']),
('크리넥스 티슈 180매', '부드러운 프리미엄 티슈', '8801043042002', (SELECT id FROM categories WHERE slug = 'tissue-paper'), '크리넥스', '유한킴벌리', '개', 3500, 2300, 0.08, true, false, 0, '{}', ARRAY['없음']),
('2080 치약 120g', '불소로 충치 예방', '8801043043001', (SELECT id FROM categories WHERE slug = 'personal-hygiene'), '2080', '애경산업', '개', 2500, 1600, 0.08, true, false, 0, '{}', ARRAY['없음']),
('닥터베스트 칫솔 중모', '잇몸 건강까지 생각한 칫솔', '8801043043002', (SELECT id FROM categories WHERE slug = 'personal-hygiene'), '닥터베스트', 'LG생활건강', '개', 2000, 1300, 0.08, true, false, 0, '{}', ARRAY['없음']),

-- 문구/사무용품
('모나미 153 볼펜 검정', '부드러운 필기감의 볼펜', '8801043051001', (SELECT id FROM categories WHERE slug = 'stationery-office'), '모나미', '모나미', '개', 500, 300, 0.10, true, false, 0, '{}', ARRAY['없음']),
('포스트잇 3x3 노랑 100매', '메모의 필수품', '8801043051002', (SELECT id FROM categories WHERE slug = 'stationery-office'), '포스트잇', '3M', '개', 2000, 1300, 0.10, true, false, 0, '{}', ARRAY['없음']),

-- 전자제품/배터리
('듀라셀 AA 배터리 4개', '오래가는 알카라인 배터리', '8801043061001', (SELECT id FROM categories WHERE slug = 'electronics-battery'), '듀라셀', '듀라셀', '개', 8000, 5200, 0.10, true, false, 0, '{}', ARRAY['없음']),
('에너자이저 AAA 배터리 4개', '고성능 알카라인 배터리', '8801043061002', (SELECT id FROM categories WHERE slug = 'electronics-battery'), '에너자이저', '에너자이저', '개', 7000, 4500, 0.10, true, false, 0, '{}', ARRAY['없음']);

-- 시스템 설정 (확장된 설정)
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('app_name', '"편의점 관리 시스템"', '애플리케이션 이름', 'general', true),
('app_version', '"2.0.0"', '애플리케이션 버전', 'general', true),
('default_tax_rate', '0.1', '기본 부가세율', 'business', false),
('min_order_amount', '1000', '최소 주문 금액', 'business', true),
('delivery_fee', '2000', '기본 배송비', 'business', true),
('auto_add_products_to_store', 'true', '새 지점 생성 시 모든 상품 자동 추가 여부', 'store', false),
('default_store_stock_quantity', '50', '새 지점 생성 시 기본 재고 수량', 'store', false),
('hq_can_manage_all_products', 'true', '본사에서 모든 상품 관리 가능 여부', 'hq', false),
('support_email', '"support@convistore.com"', '고객지원 이메일', 'general', true),
('support_phone', '"1588-1234"', '고객지원 전화번호', 'general', true),
('pickup_preparation_time', '15', '픽업 준비 시간(분)', 'order', true),
('store_approval_required', 'true', '점포 승인 필요 여부', 'store', false),
('max_products_per_store', '1000', '점포당 최대 상품 수', 'store', false),
('notification_enabled', 'true', '알림 기능 활성화', 'notification', true);

-- =====================================================
-- 9. 매출 분석 뷰 및 함수 생성
-- =====================================================

-- 1. 일별 매출 요약 뷰
CREATE OR REPLACE VIEW daily_sales_analytics AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders,
    SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END) as avg_order_value,
    COUNT(CASE WHEN o.type = 'pickup' THEN 1 END) as pickup_orders,
    COUNT(CASE WHEN o.type = 'delivery' THEN 1 END) as delivery_orders
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- 2. 지점별 매출 분석 뷰
CREATE OR REPLACE VIEW store_sales_analytics AS
SELECT 
    s.id as store_id,
    s.name as store_name,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
    SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END) as avg_order_value,
    COUNT(CASE WHEN o.type = 'pickup' THEN 1 END) as pickup_orders,
    COUNT(CASE WHEN o.type = 'delivery' THEN 1 END) as delivery_orders,
    MAX(o.created_at) as last_order_date
FROM stores s
LEFT JOIN orders o ON s.id = o.store_id
GROUP BY s.id, s.name
ORDER BY total_revenue DESC;

-- 3. 상품별 매출 분석 뷰
CREATE OR REPLACE VIEW product_sales_analytics AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    c.name as category_name,
    COUNT(oi.id) as total_sold,
    SUM(oi.subtotal) as total_revenue,
    AVG(oi.unit_price) as avg_price,
    COUNT(DISTINCT o.id) as order_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
GROUP BY p.id, p.name, c.name
ORDER BY total_revenue DESC;

-- 4. 시간대별 매출 분석 뷰
CREATE OR REPLACE VIEW hourly_sales_analytics AS
SELECT 
    EXTRACT(HOUR FROM o.created_at) as hour_of_day,
    COUNT(*) as total_orders,
    SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END) as avg_order_value
FROM orders o
GROUP BY EXTRACT(HOUR FROM o.created_at)
ORDER BY hour_of_day;

-- 5. 결제 방법별 매출 분석 뷰
CREATE OR REPLACE VIEW payment_method_analytics AS
SELECT 
    o.payment_method,
    COUNT(*) as total_orders,
    SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END) as avg_order_value,
    COUNT(CASE WHEN o.payment_status = 'paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN o.payment_status = 'failed' THEN 1 END) as failed_orders
FROM orders o
GROUP BY o.payment_method
ORDER BY total_revenue DESC;

-- 매출 분석 함수들
-- 1. 기간별 매출 통계 함수
CREATE OR REPLACE FUNCTION get_sales_summary(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_orders BIGINT,
    completed_orders BIGINT,
    cancelled_orders BIGINT,
    total_revenue NUMERIC,
    avg_order_value NUMERIC,
    pickup_orders BIGINT,
    delivery_orders BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::BIGINT as completed_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END)::BIGINT as cancelled_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,
        COUNT(CASE WHEN o.type = 'pickup' THEN 1 END)::BIGINT as pickup_orders,
        COUNT(CASE WHEN o.type = 'delivery' THEN 1 END)::BIGINT as delivery_orders
    FROM orders o
    WHERE DATE(o.created_at) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- 2. 지점별 매출 순위 함수
CREATE OR REPLACE FUNCTION get_store_rankings(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    store_id UUID,
    store_name TEXT,
    total_revenue NUMERIC,
    total_orders BIGINT,
    avg_order_value NUMERIC,
    rank_position BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as store_id,
        s.name as store_name,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(o.id)::BIGINT as total_orders,
        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,
        RANK() OVER (ORDER BY COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) DESC) as rank_position
    FROM stores s
    LEFT JOIN orders o ON s.id = o.store_id 
        AND DATE(o.created_at) BETWEEN start_date AND end_date
    GROUP BY s.id, s.name
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. 상품별 매출 순위 함수
CREATE OR REPLACE FUNCTION get_product_rankings(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    category_name TEXT,
    total_sold BIGINT,
    total_revenue NUMERIC,
    avg_price NUMERIC,
    rank_position BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        c.name as category_name,
        COUNT(oi.id)::BIGINT as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue,
        COALESCE(AVG(oi.unit_price), 0) as avg_price,
        RANK() OVER (ORDER BY COALESCE(SUM(oi.subtotal), 0) DESC) as rank_position
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.status = 'completed'
        AND DATE(o.created_at) BETWEEN start_date AND end_date
    GROUP BY p.id, p.name, c.name
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. 설정 완료 확인
-- =====================================================

SELECT 
    '✅ 고급 편의점 관리 시스템 설정 완료! (v2.0 - 쿠폰/포인트/위시리스트 포함)' as "상태",
    COUNT(*) as "생성된 테이블 수"
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
        'profiles', 'categories', 'products', 'stores', 'store_products', 
        'orders', 'order_items', 'daily_sales_summary', 'product_sales_summary',
        'order_status_history', 'inventory_transactions', 'supply_requests',
        'supply_request_items', 'shipments', 'notifications', 'system_settings',
        'coupons', 'user_coupons', 'points', 'point_settings', 'wishlists', 'product_wishlists'
    );

-- 테이블 목록 확인
SELECT 
    table_name as "테이블명",
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as "컬럼 수"
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
        'profiles', 'categories', 'products', 'stores', 'store_products', 
        'orders', 'order_items', 'daily_sales_summary', 'product_sales_summary',
        'order_status_history', 'inventory_transactions', 'supply_requests',
        'supply_request_items', 'shipments', 'notifications', 'system_settings'
    )
ORDER BY table_name;

-- 중복 주문 방지 기능 확인 (2025-08-05 추가)
SELECT 
    '✅ 중복 주문 방지 시스템 활성화됨' as "상태",
    COUNT(*) as "관련 인덱스 수"
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename = 'orders'
    AND indexname IN ('idx_orders_payment_key', 'idx_orders_customer_created');

-- 중복 방지 트리거 확인
SELECT 
    trigger_name as "트리거명",
    event_manipulation as "이벤트",
    action_timing as "실행시점"
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND trigger_name = 'trigger_prevent_duplicate_orders';

-- =====================================================
-- 11. 프로필 테이블 개선 (CustomerProfile 페이지용)
-- =====================================================

-- 프로필 테이블에 추가 필드들
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "email_notifications": true,
  "push_notifications": true,
  "order_updates": true,
  "promotions": true,
  "newsletter": false
}'::jsonb;

-- 기존 full_name 데이터를 first_name과 last_name으로 분리
UPDATE profiles 
SET 
  first_name = CASE 
    WHEN full_name LIKE '% %' THEN 
      SPLIT_PART(full_name, ' ', 1)
    ELSE 
      full_name
  END,
  last_name = CASE 
    WHEN full_name LIKE '% %' THEN 
      SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE 
      NULL
  END
WHERE (first_name IS NULL OR last_name IS NULL) AND full_name IS NOT NULL;

-- first_name을 NOT NULL로 설정
UPDATE profiles 
SET first_name = full_name 
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- 성별 제약조건 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_gender_check'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_gender_check 
        CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
    END IF;
END $$;

-- 성별 기본값 설정
UPDATE profiles 
SET gender = 'prefer_not_to_say' 
WHERE gender IS NULL;

-- 기존 preferences에 알림 설정이 없다면 추가
UPDATE profiles 
SET notification_settings = COALESCE(
  notification_settings,
  '{
    "email_notifications": true,
    "push_notifications": true,
    "order_updates": true,
    "promotions": true,
    "newsletter": false
  }'::jsonb
)
WHERE notification_settings IS NULL;

-- 프로필 통계 함수 생성
CREATE OR REPLACE FUNCTION get_customer_stats(customer_id UUID)
RETURNS TABLE(
  total_orders BIGINT,
  completed_orders BIGINT,
  total_spent NUMERIC,
  avg_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(o.id)::BIGINT as total_orders,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::BIGINT as completed_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value
  FROM orders o
  WHERE o.customer_id = get_customer_stats.customer_id;
END;
$$ LANGUAGE plpgsql;

-- 프로필 조회 뷰 생성
CREATE OR REPLACE VIEW customer_profiles AS
SELECT 
  id,
  role,
  full_name,
  first_name,
  last_name,
  email,
  phone,
  avatar_url,
  address,
  birth_date,
  gender,
  preferences,
  notification_settings,
  is_active,
  created_at,
  updated_at
FROM profiles
WHERE role = 'customer';

-- 프로필 관련 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- 프로필 RLS 정책 업데이트
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 15_product_images_storage.sql 실행 (상품 이미지 스토리지)
\i 15_product_images_storage.sql

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 모든 고급 설정이 완료되었습니다!';
  RAISE NOTICE '📊 총 23개 테이블 생성됨 (product_images 추가)';
  RAISE NOTICE '🔧 고급 함수 및 트리거 설정됨';
  RAISE NOTICE '🔐 RLS 정책 적용됨';
  RAISE NOTICE '🎯 테스트 데이터 및 계정 생성됨';
  RAISE NOTICE '🖼️ 상품 이미지 스토리지 설정됨';
  RAISE NOTICE '🚀 시스템 사용 준비 완료!';
END $$; 