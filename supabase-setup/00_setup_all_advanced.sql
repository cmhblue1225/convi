-- =====================================================
-- 00_setup_all_advanced.sql
-- 고급 편의점 관리 시스템 전체 설정 (17개 테이블)
-- =====================================================

-- 이 스크립트는 모든 고급 기능을 포함한 완전한 데이터베이스를 구축합니다.
-- 실행 시간: 약 2-3분 소요
-- 최종 업데이트: 2025-08-05 (중복 주문 방지 기능 추가)

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
-- 2. 테이블 생성 (17개 테이블)
-- =====================================================

-- 기존 테이블 삭제
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id),
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
    CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id),
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
-- 8. 초기 데이터 삽입
-- =====================================================

-- 카테고리 데이터
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('음료', 'beverages', '다양한 음료 제품', 1, true),
('식품', 'food', '신선한 식품', 2, true),
('간식', 'snacks', '맛있는 간식', 3, true),
('생활용품', 'household', '일상 생활용품', 4, true);

-- 상품 데이터 (주요 상품들만)
INSERT INTO products (name, description, category_id, brand, manufacturer, unit, base_price, cost_price, tax_rate, requires_preparation, preparation_time, nutritional_info, allergen_info) VALUES
('코카콜라 500ml', '세계적으로 사랑받는 탄산음료', (SELECT id FROM categories WHERE slug = 'beverages'), '코카콜라', '코카콜라 컴퍼니', '개', 2000, 1200, 0.10, false, 0, '{"칼로리": 210, "탄수화물": 53, "단백질": 0, "지방": 0}', ARRAY['없음']),
('농심 신라면 120g', '한국의 대표적인 라면', (SELECT id FROM categories WHERE slug = 'food'), '농심', '농심', '개', 1200, 720, 0.10, true, 3, '{"칼로리": 500, "탄수화물": 65, "단백질": 10, "지방": 20}', ARRAY['밀', '대두']),
('농심 새우깡 90g', '바삭하고 고소한 새우깡', (SELECT id FROM categories WHERE slug = 'snacks'), '농심', '농심', '개', 1500, 900, 0.10, false, 0, '{"칼로리": 450, "탄수화물": 55, "단백질": 8, "지방": 22}', ARRAY['새우', '밀']);

-- 시스템 설정
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('app_name', '"편의점 관리 시스템"', '애플리케이션 이름', 'general', true),
('app_version', '"2.0.0"', '애플리케이션 버전', 'general', true),
('default_tax_rate', '0.1', '기본 부가세율', 'business', false),
('min_order_amount', '1000', '최소 주문 금액', 'business', true),
('delivery_fee', '2000', '기본 배송비', 'business', true);

-- =====================================================
-- 9. 설정 완료 확인
-- =====================================================

SELECT 
    '✅ 고급 편의점 관리 시스템 설정 완료!' as "상태",
    COUNT(*) as "생성된 테이블 수"
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
        'profiles', 'categories', 'products', 'stores', 'store_products', 
        'orders', 'order_items', 'daily_sales_summary', 'product_sales_summary',
        'order_status_history', 'inventory_transactions', 'supply_requests',
        'supply_request_items', 'shipments', 'notifications', 'system_settings'
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