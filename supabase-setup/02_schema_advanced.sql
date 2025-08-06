-- =====================================================
-- 02_schema_advanced.sql
-- 고급 데이터베이스 스키마 생성 (17개 테이블)
-- =====================================================

-- =====================================================
-- 1. 기존 테이블 삭제 (주의: 모든 데이터가 삭제됩니다)
-- =====================================================

-- 고급 기능 테이블들 먼저 삭제 (외래키 의존성)
DROP TABLE IF EXISTS daily_sales_summary CASCADE;
DROP TABLE IF EXISTS product_sales_summary CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS supply_request_items CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS supply_requests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- 핵심 테이블들 삭제
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS store_products CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- 2. 핵심 테이블 생성
-- =====================================================

-- 2.1 프로필 테이블 (사용자 정보)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 2.2 카테고리 테이블 (계층 구조 지원)
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

-- 2.3 상품 테이블 (고급 정보 포함)
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

-- 2.4 지점 테이블 (지리 정보 포함)
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

-- 2.5 지점별 상품 재고 테이블 (고급 재고 관리)
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

-- 2.6 주문 테이블 (고급 주문 정보)
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

-- 2.7 주문 상세 테이블
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

-- =====================================================
-- 3. 고급 기능 테이블 생성
-- =====================================================

-- 3.1 일일 매출 요약 테이블
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

-- 3.2 상품별 매출 요약 테이블
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

-- 3.3 주문 상태 이력 테이블
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

-- 3.4 재고 거래 이력 테이블
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

-- 3.5 공급 요청 테이블
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

-- 3.6 공급 요청 상세 테이블
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

-- 3.7 배송 테이블
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

-- 3.8 알림 테이블
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

-- 3.9 시스템 설정 테이블
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
-- 4. 인덱스 생성 (성능 최적화)
-- =====================================================

-- 프로필 테이블 인덱스
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- 카테고리 테이블 인덱스
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- 상품 테이블 인덱스
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_brand ON products(brand);

-- 지점 테이블 인덱스
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_is_active ON stores(is_active);
CREATE INDEX idx_stores_location ON stores USING GIST (location);

-- 지점별 상품 테이블 인덱스
CREATE INDEX idx_store_products_store_id ON store_products(store_id);
CREATE INDEX idx_store_products_product_id ON store_products(product_id);
CREATE INDEX idx_store_products_stock ON store_products(stock_quantity);
CREATE INDEX idx_store_products_is_available ON store_products(is_available);

-- 주문 테이블 인덱스
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_type ON orders(type);

-- 주문 상세 테이블 인덱스
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 고급 기능 테이블 인덱스
CREATE INDEX idx_daily_sales_summary_store_date ON daily_sales_summary(store_id, date);
CREATE INDEX idx_product_sales_summary_store_product_date ON product_sales_summary(store_id, product_id, date);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_inventory_transactions_store_product_id ON inventory_transactions(store_product_id);
CREATE INDEX idx_supply_requests_store_id ON supply_requests(store_id);
CREATE INDEX idx_supply_requests_status ON supply_requests(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- 5. 테이블 생성 확인
-- =====================================================
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