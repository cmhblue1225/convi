# 데이터베이스 스키마 명세서

## 📊 테이블 개요

편의점 종합 솔루션은 **36개의 테이블**로 구성된 완전한 관계형 데이터베이스를 사용합니다.

### 테이블 분류
- **핵심 테이블 (4개)**: profiles, stores, products, categories
- **운영 테이블 (4개)**: store_products, orders, order_items, order_status_history  
- **물류 테이블 (4개)**: supply_requests, supply_request_items, shipments, inventory_transactions
- **마케팅 테이블 (6개)**: points, point_transactions, coupons, user_coupons, wishlists, product_wishlists
- **분석 테이블 (2개)**: daily_sales_summary, product_sales_summary
- **환불 시스템 (7개)**: refund_requests, refund_history, refund_attachments, refund_notifications, refund_policies, refund_templates, refund_settlements
- **반품 시스템 (2개)**: return_requests, return_request_items
- **프로모션 시스템 (2개)**: promotions, promotion_products
- **기타 시스템 (5개)**: notifications, system_settings, point_settings, product_images, spatial_ref_sys

## 📋 핵심 테이블 상세

### 1. profiles - 사용자 프로필
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('customer', 'store_owner', 'headquarters')),
    full_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    address JSONB,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    preferences JSONB DEFAULT '{}'::jsonb,
    notification_settings JSONB DEFAULT '{
        "newsletter": false, 
        "promotions": true, 
        "order_updates": true, 
        "push_notifications": true, 
        "email_notifications": true
    }'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**필드 설명:**
- `id`: Supabase Auth와 연동되는 사용자 고유 ID
- `role`: 사용자 역할 (customer, store_owner, headquarters)
- `notification_settings`: 알림 설정 (JSON 형태)
- `address`: 주소 정보 (JSON 형태로 유연한 구조)

### 2. stores - 점포 정보
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    location POINT,
    phone TEXT,
    email TEXT,
    business_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "22:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "22:00", "closed": false},
        "thursday": {"open": "09:00", "close": "22:00", "closed": false},
        "friday": {"open": "09:00", "close": "22:00", "closed": false},
        "saturday": {"open": "09:00", "close": "22:00", "closed": false},
        "sunday": {"open": "10:00", "close": "21:00", "closed": false}
    }'::jsonb,
    delivery_radius NUMERIC DEFAULT 3.0,
    minimum_order_amount NUMERIC DEFAULT 10000,
    delivery_fee NUMERIC DEFAULT 2000,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id)
);
```

**필드 설명:**
- `location`: PostGIS POINT 타입으로 정확한 위치 저장
- `business_hours`: 요일별 운영시간 (JSON 형태)
- `delivery_radius`: 배송 가능 반경 (km)
- `status`: 점포 승인 상태

### 3. products - 상품 마스터
```sql
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
    nutritional_info JSONB DEFAULT '{}'::jsonb,
    allergen_info TEXT[],
    storage_instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_preparation BOOLEAN DEFAULT false,
    preparation_time INTEGER DEFAULT 0,
    weight NUMERIC,
    dimensions JSONB,
    expiry_days INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

**필드 설명:**
- `barcode`: 상품 바코드 (고유값)
- `nutritional_info`: 영양 정보 (JSON 형태)
- `allergen_info`: 알레르기 정보 (배열)
- `requires_preparation`: 조리가 필요한 상품 여부

### 4. categories - 상품 카테고리
```sql
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
```

**필드 설명:**
- `slug`: URL 친화적인 카테고리 식별자
- `parent_id`: 상위 카테고리 (계층 구조 지원)
- `display_order`: 표시 순서

## 🛍️ 운영 테이블 상세

### 5. store_products - 점포별 상품
```sql
CREATE TABLE store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    product_id UUID NOT NULL,
    price NUMERIC NOT NULL,
    discount_rate NUMERIC DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 1),
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 5,
    maximum_stock INTEGER DEFAULT 100,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT store_products_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT store_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT store_products_unique UNIQUE (store_id, product_id)
);
```

**필드 설명:**
- `discount_rate`: 할인율 (0~1 사이 값)
- `minimum_stock`: 최소 재고량 (알림 기준)
- `maximum_stock`: 최대 재고량

### 6. orders - 주문
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    store_id UUID NOT NULL,
    order_type TEXT NOT NULL DEFAULT 'pickup' CHECK (order_type IN ('pickup', 'delivery')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
    )),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile', 'point')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded'
    )),
    delivery_address JSONB,
    delivery_instructions TEXT,
    estimated_ready_time TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES profiles(id),
    CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id)
);
```

**필드 설명:**
- `order_number`: 사용자에게 표시되는 주문번호
- `order_type`: 픽업/배송 구분
- `estimated_ready_time`: 예상 완료 시간
- `delivery_address`: 배송 주소 (JSON 형태)

### 7. order_items - 주문 상품
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    store_product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL,
    discount_rate NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    subtotal NUMERIC NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT order_items_store_product_id_fkey FOREIGN KEY (store_product_id) REFERENCES store_products(id)
);
```

### 8. order_status_history - 주문 상태 이력
```sql
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    status TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID,
    notes TEXT,
    CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profiles(id)
);
```

## 🚚 물류 테이블 상세

### 9. supply_requests - 물류 요청
```sql
CREATE TABLE supply_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT NOT NULL UNIQUE,
    store_id UUID NOT NULL,
    requested_by UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'
    )),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    total_items INTEGER DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    requested_delivery_date DATE,
    notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT supply_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT supply_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES profiles(id),
    CONSTRAINT supply_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES profiles(id)
);
```

### 10. supply_request_items - 물류 요청 상품
```sql
CREATE TABLE supply_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supply_request_id UUID NOT NULL,
    product_id UUID NOT NULL,
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    approved_quantity INTEGER DEFAULT 0,
    unit_cost NUMERIC,
    total_cost NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT supply_request_items_supply_request_id_fkey FOREIGN KEY (supply_request_id) REFERENCES supply_requests(id) ON DELETE CASCADE,
    CONSTRAINT supply_request_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 11. shipments - 배송
```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supply_request_id UUID NOT NULL UNIQUE,
    shipment_number TEXT NOT NULL UNIQUE,
    carrier TEXT,
    tracking_number TEXT,
    status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN (
        'preparing', 'shipped', 'in_transit', 'delivered', 'failed'
    )),
    shipped_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT shipments_supply_request_id_fkey FOREIGN KEY (supply_request_id) REFERENCES supply_requests(id)
);
```

### 12. inventory_transactions - 재고 거래
```sql
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    product_id UUID NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage', 'expired'
    )),
    quantity_change INTEGER NOT NULL,
    unit_cost NUMERIC,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT inventory_transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT inventory_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id)
);
```

## 🎯 마케팅 테이블 상세

### 13. points - 포인트
```sql
CREATE TABLE points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'used', 'expired', 'adjusted')),
    source TEXT NOT NULL CHECK (source IN (
        'purchase', 'signup', 'referral', 'promotion', 'manual', 'cashback'
    )),
    reference_type TEXT,
    reference_id UUID,
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT points_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);
```

### 14. coupons - 쿠폰
```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_delivery', 'bogo')),
    discount_value NUMERIC NOT NULL,
    minimum_order_amount NUMERIC DEFAULT 0,
    maximum_discount_amount NUMERIC,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_stackable BOOLEAN DEFAULT false,
    applicable_categories UUID[],
    applicable_products UUID[],
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT coupons_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id)
);
```

### 15. user_coupons - 사용자 쿠폰
```sql
CREATE TABLE user_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    coupon_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    used_in_order_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT user_coupons_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT user_coupons_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    CONSTRAINT user_coupons_used_in_order_id_fkey FOREIGN KEY (used_in_order_id) REFERENCES orders(id),
    CONSTRAINT user_coupons_unique UNIQUE (user_id, coupon_id)
);
```

### 16. wishlists - 위시리스트
```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL DEFAULT '내 위시리스트',
    description TEXT,
    is_default BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);
```

### 17. product_wishlists - 위시리스트 상품
```sql
CREATE TABLE product_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL,
    product_id UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT product_wishlists_wishlist_id_fkey FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    CONSTRAINT product_wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT product_wishlists_unique UNIQUE (wishlist_id, product_id)
);
```

## 📊 분석 테이블 상세

### 18. daily_sales_summary - 일별 매출 요약
```sql
CREATE TABLE daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    sale_date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_sales NUMERIC DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    average_order_value NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT daily_sales_summary_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT daily_sales_summary_unique UNIQUE (store_id, sale_date)
);
```

### 19. product_sales_summary - 상품별 매출 요약
```sql
CREATE TABLE product_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    product_id UUID NOT NULL,
    sale_date DATE NOT NULL,
    quantity_sold INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT product_sales_summary_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    CONSTRAINT product_sales_summary_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT product_sales_summary_unique UNIQUE (store_id, product_id, sale_date)
);
```

## 🔔 시스템 테이블 상세

### 20. notifications - 알림
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'order', 'payment', 'delivery', 'promotion', 'system', 'marketing'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);
```

### 21. system_settings - 시스템 설정
```sql
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
```

### 22. point_settings - 포인트 설정
```sql
CREATE TABLE point_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_type TEXT NOT NULL CHECK (setting_type IN (
        'earning_rate', 'minimum_redemption', 'expiry_months', 'signup_bonus', 'referral_bonus'
    )),
    value NUMERIC NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT point_settings_unique UNIQUE (setting_type)
);
```

## 🔄 트리거 및 함수

### 자동 재고 차감 트리거
```sql
CREATE OR REPLACE FUNCTION update_inventory_after_order()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문 완료 시 재고 차감
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE store_products 
        SET stock_quantity = stock_quantity - order_items.quantity
        FROM order_items 
        WHERE order_items.order_id = NEW.id 
        AND store_products.id = order_items.store_product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_inventory_update
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_after_order();
```

### 매출 요약 자동 업데이트 트리거
```sql
CREATE OR REPLACE FUNCTION update_daily_sales_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_sales_summary (store_id, sale_date, total_orders, total_sales)
    VALUES (NEW.store_id, DATE(NEW.created_at), 1, NEW.total_amount)
    ON CONFLICT (store_id, sale_date)
    DO UPDATE SET
        total_orders = daily_sales_summary.total_orders + 1,
        total_sales = daily_sales_summary.total_sales + NEW.total_amount,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_sales_update
    AFTER INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_daily_sales_summary();
```

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-17