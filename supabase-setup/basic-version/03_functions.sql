-- =====================================================
-- 03_functions.sql
-- 데이터베이스 함수 생성
-- =====================================================

-- =====================================================
-- 1. updated_at 자동 업데이트 함수
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 2. 주문 번호 자동 생성 함수 (트리거용)
-- =====================================================
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

-- =====================================================
-- 3. 재고 자동 차감 함수
-- =====================================================
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

-- =====================================================
-- 4. 주문 취소 시 재고 복구 함수
-- =====================================================
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

-- =====================================================
-- 5. 사용자 프로필 자동 생성 함수
-- =====================================================
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

-- =====================================================
-- 6. 지점별 상품 자동 생성 함수
-- =====================================================
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

-- =====================================================
-- 7. 통계 계산 함수들
-- =====================================================

-- 일일 매출 계산 함수
CREATE OR REPLACE FUNCTION get_daily_sales(store_id_param UUID DEFAULT NULL, date_param DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_sales BIGINT,
    total_orders BIGINT,
    avg_order_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COALESCE(COUNT(o.id), 0) as total_orders,
        CASE 
            WHEN COUNT(o.id) > 0 THEN ROUND(AVG(o.total_amount), 0)
            ELSE 0 
        END as avg_order_value
    FROM orders o
    WHERE o.status = 'completed'
        AND DATE(o.created_at) = date_param
        AND (store_id_param IS NULL OR o.store_id = store_id_param);
END;
$$ LANGUAGE plpgsql;

-- 주간 매출 계산 함수
CREATE OR REPLACE FUNCTION get_weekly_sales(store_id_param UUID DEFAULT NULL, week_start DATE DEFAULT NULL)
RETURNS TABLE (
    week_start_date DATE,
    total_sales BIGINT,
    total_orders BIGINT,
    daily_avg NUMERIC
) AS $$
DECLARE
    start_date DATE;
BEGIN
    -- 주의 시작일 계산 (월요일)
    IF week_start IS NULL THEN
        start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    ELSE
        start_date := DATE_TRUNC('week', week_start)::DATE;
    END IF;
    
    RETURN QUERY
    SELECT 
        start_date as week_start_date,
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COALESCE(COUNT(o.id), 0) as total_orders,
        CASE 
            WHEN COUNT(o.id) > 0 THEN ROUND(AVG(o.total_amount), 0)
            ELSE 0 
        END as daily_avg
    FROM orders o
    WHERE o.status = 'completed'
        AND DATE(o.created_at) >= start_date
        AND DATE(o.created_at) < start_date + INTERVAL '7 days'
        AND (store_id_param IS NULL OR o.store_id = store_id_param);
END;
$$ LANGUAGE plpgsql;

-- 재고 부족 상품 조회 함수
CREATE OR REPLACE FUNCTION get_low_stock_products(store_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    product_name TEXT,
    category_name TEXT,
    current_stock INTEGER,
    safety_stock INTEGER,
    store_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name as product_name,
        c.name as category_name,
        sp.stock_quantity as current_stock,
        sp.safety_stock as safety_stock,
        s.name as store_name
    FROM store_products sp
    JOIN products p ON sp.product_id = p.id
    JOIN stores s ON sp.store_id = s.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE sp.stock_quantity <= sp.safety_stock
        AND sp.status = 'active'
        AND p.status = 'active'
        AND (store_id_param IS NULL OR sp.store_id = store_id_param)
    ORDER BY sp.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 함수 생성 확인
-- =====================================================
SELECT 
    routine_name as "함수명",
    routine_type as "타입"
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN (
        'update_updated_at_column',
        'generate_order_number',
        'update_stock_quantity',
        'restore_stock_on_cancel',
        'handle_new_user',
        'create_store_products_for_new_store',
        'get_daily_sales',
        'get_weekly_sales',
        'get_low_stock_products'
    )
ORDER BY routine_name; 