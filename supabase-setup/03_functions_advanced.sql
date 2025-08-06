-- =====================================================
-- 03_functions_advanced.sql
-- 고급 데이터베이스 함수 생성
-- =====================================================

-- =====================================================
-- 1. 기본 유틸리티 함수
-- =====================================================

-- 1.1 updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.2 주문 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_order_number TEXT;
    counter INTEGER := 1;
BEGIN
    -- 주문 번호가 이미 있으면 그대로 사용
    IF NEW.order_number IS NOT NULL AND NEW.order_number != '' THEN
        RETURN NEW;
    END IF;
    
    -- 날짜 기반 주문 번호 생성 (YYYYMMDD-XXXX 형식)
    LOOP
        new_order_number := TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- 중복 확인
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
            NEW.order_number := new_order_number;
            EXIT;
        END IF;
        
        counter := counter + 1;
        
        -- 무한 루프 방지
        IF counter > 9999 THEN
            RAISE EXCEPTION '주문 번호 생성 실패: 최대 시도 횟수 초과';
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.3 공급 요청 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_supply_request_number()
RETURNS TRIGGER AS $$
DECLARE
    new_request_number TEXT;
    counter INTEGER := 1;
BEGIN
    -- 요청 번호가 이미 있으면 그대로 사용
    IF NEW.request_number IS NOT NULL AND NEW.request_number != '' THEN
        RETURN NEW;
    END IF;
    
    -- 날짜 기반 요청 번호 생성 (SR-YYYYMMDD-XXXX 형식)
    LOOP
        new_request_number := 'SR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- 중복 확인
        IF NOT EXISTS (SELECT 1 FROM supply_requests WHERE request_number = new_request_number) THEN
            NEW.request_number := new_request_number;
            EXIT;
        END IF;
        
        counter := counter + 1;
        
        -- 무한 루프 방지
        IF counter > 9999 THEN
            RAISE EXCEPTION '공급 요청 번호 생성 실패: 최대 시도 횟수 초과';
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.4 배송 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TRIGGER AS $$
DECLARE
    new_shipment_number TEXT;
    counter INTEGER := 1;
BEGIN
    -- 배송 번호가 이미 있으면 그대로 사용
    IF NEW.shipment_number IS NOT NULL AND NEW.shipment_number != '' THEN
        RETURN NEW;
    END IF;
    
    -- 날짜 기반 배송 번호 생성 (SH-YYYYMMDD-XXXX 형식)
    LOOP
        new_shipment_number := 'SH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- 중복 확인
        IF NOT EXISTS (SELECT 1 FROM shipments WHERE shipment_number = new_shipment_number) THEN
            NEW.shipment_number := new_shipment_number;
            EXIT;
        END IF;
        
        counter := counter + 1;
        
        -- 무한 루프 방지
        IF counter > 9999 THEN
            RAISE EXCEPTION '배송 번호 생성 실패: 최대 시도 횟수 초과';
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. 재고 관리 함수
-- =====================================================

-- 2.1 재고 차감 함수
CREATE OR REPLACE FUNCTION update_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문 상태가 변경될 때만 처리
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- 주문이 확정되거나 준비 중일 때 재고 차감
    IF NEW.status IN ('confirmed', 'preparing') AND OLD.status = 'pending' THEN
        -- 주문 상품들의 재고 차감
        UPDATE store_products sp
        SET stock_quantity = sp.stock_quantity - oi.quantity
        FROM order_items oi
        WHERE sp.store_id = NEW.store_id 
            AND sp.product_id = oi.product_id 
            AND oi.order_id = NEW.id;
            
        -- 재고 거래 이력 기록
        INSERT INTO inventory_transactions (
            store_product_id, transaction_type, quantity, 
            previous_quantity, new_quantity, reference_type, reference_id, 
            reason, created_by
        )
        SELECT 
            sp.id, 'out', oi.quantity,
            sp.stock_quantity + oi.quantity, sp.stock_quantity,
            'order', NEW.id,
            '주문 처리로 인한 재고 차감', NEW.customer_id
        FROM order_items oi
        JOIN store_products sp ON sp.store_id = NEW.store_id AND sp.product_id = oi.product_id
        WHERE oi.order_id = NEW.id;
    END IF;
    
    -- 주문이 취소되면 재고 복원
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- 주문 상품들의 재고 복원
        UPDATE store_products sp
        SET stock_quantity = sp.stock_quantity + oi.quantity
        FROM order_items oi
        WHERE sp.store_id = NEW.store_id 
            AND sp.product_id = oi.product_id 
            AND oi.order_id = NEW.id;
            
        -- 재고 거래 이력 기록
        INSERT INTO inventory_transactions (
            store_product_id, transaction_type, quantity, 
            previous_quantity, new_quantity, reference_type, reference_id, 
            reason, created_by
        )
        SELECT 
            sp.id, 'returned', oi.quantity,
            sp.stock_quantity - oi.quantity, sp.stock_quantity,
            'order_cancellation', NEW.id,
            '주문 취소로 인한 재고 복원', NEW.customer_id
        FROM order_items oi
        JOIN store_products sp ON sp.store_id = NEW.store_id AND sp.product_id = oi.product_id
        WHERE oi.order_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.2 안전 재고 확인 함수
CREATE OR REPLACE FUNCTION check_safety_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- 재고가 안전 재고 수준 이하로 떨어지면 알림 생성
    IF NEW.stock_quantity <= NEW.safety_stock THEN
        INSERT INTO notifications (
            user_id, type, title, message, priority, data
        )
        SELECT 
            s.owner_id, 'low_stock', '재고 부족 알림',
            p.name || ' 상품의 재고가 부족합니다. (현재: ' || NEW.stock_quantity || ', 안전재고: ' || NEW.safety_stock || ')',
            'high',
            jsonb_build_object(
                'store_id', NEW.store_id,
                'product_id', NEW.product_id,
                'current_stock', NEW.stock_quantity,
                'safety_stock', NEW.safety_stock
            )
        FROM stores s
        JOIN products p ON p.id = NEW.product_id
        WHERE s.id = NEW.store_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. 매출 분석 함수
-- =====================================================

-- 3.1 일일 매출 요약 생성 함수
CREATE OR REPLACE FUNCTION update_daily_sales_summary()
RETURNS TRIGGER AS $$
DECLARE
    order_date DATE;
    existing_summary_id UUID;
BEGIN
    -- 주문 완료 시에만 처리
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        order_date := DATE(NEW.completed_at);
        
        -- 기존 요약 데이터 확인
        SELECT id INTO existing_summary_id
        FROM daily_sales_summary
        WHERE store_id = NEW.store_id AND date = order_date;
        
        IF existing_summary_id IS NULL THEN
            -- 새로운 일일 요약 생성
            INSERT INTO daily_sales_summary (
                store_id, date, total_orders, pickup_orders, delivery_orders,
                total_revenue, total_items_sold, avg_order_value
            )
            SELECT 
                NEW.store_id, order_date,
                COUNT(*), 
                COUNT(*) FILTER (WHERE type = 'pickup'),
                COUNT(*) FILTER (WHERE type = 'delivery'),
                SUM(total_amount),
                SUM(oi.quantity),
                AVG(total_amount)
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.store_id = NEW.store_id 
                AND o.status = 'completed'
                AND DATE(o.completed_at) = order_date;
        ELSE
            -- 기존 요약 업데이트
            UPDATE daily_sales_summary
            SET 
                total_orders = sub.total_orders,
                pickup_orders = sub.pickup_orders,
                delivery_orders = sub.delivery_orders,
                total_revenue = sub.total_revenue,
                total_items_sold = sub.total_items_sold,
                avg_order_value = sub.avg_order_value,
                updated_at = NOW()
            FROM (
                SELECT 
                    COUNT(*) as total_orders,
                    COUNT(*) FILTER (WHERE type = 'pickup') as pickup_orders,
                    COUNT(*) FILTER (WHERE type = 'delivery') as delivery_orders,
                    SUM(total_amount) as total_revenue,
                    SUM(oi.quantity) as total_items_sold,
                    AVG(total_amount) as avg_order_value
                FROM orders o
                LEFT JOIN order_items oi ON oi.order_id = o.id
                WHERE o.store_id = NEW.store_id 
                    AND o.status = 'completed'
                    AND DATE(o.completed_at) = order_date
            ) sub
            WHERE id = existing_summary_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 상품별 매출 요약 생성 함수
CREATE OR REPLACE FUNCTION update_product_sales_summary()
RETURNS TRIGGER AS $$
DECLARE
    order_date DATE;
    existing_summary_id UUID;
BEGIN
    -- 주문 완료 시에만 처리
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        order_date := DATE(NEW.completed_at);
        
        -- 주문 상품별로 매출 요약 업데이트
        INSERT INTO product_sales_summary (
            store_id, product_id, date, quantity_sold, revenue, avg_price
        )
        SELECT 
            NEW.store_id, oi.product_id, order_date,
            SUM(oi.quantity), SUM(oi.subtotal), AVG(oi.unit_price)
        FROM order_items oi
        WHERE oi.order_id = NEW.id
        GROUP BY oi.product_id
        ON CONFLICT (store_id, product_id, date) DO UPDATE SET
            quantity_sold = product_sales_summary.quantity_sold + EXCLUDED.quantity_sold,
            revenue = product_sales_summary.revenue + EXCLUDED.revenue,
            avg_price = (product_sales_summary.revenue + EXCLUDED.revenue) / 
                       (product_sales_summary.quantity_sold + EXCLUDED.quantity_sold);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. 주문 관리 함수
-- =====================================================

-- 4.1 주문 상태 이력 기록 함수
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 변경되었을 때만 이력 기록
    IF OLD.status IS NULL OR OLD.status != NEW.status THEN
        INSERT INTO order_status_history (
            order_id, status, changed_by, notes
        ) VALUES (
            NEW.id, NEW.status, NEW.customer_id, 
            CASE 
                WHEN NEW.status = 'cancelled' THEN NEW.cancel_reason
                ELSE '주문 상태 변경: ' || OLD.status || ' → ' || NEW.status
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 주문 총액 계산 함수
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
    order_subtotal NUMERIC := 0;
    order_tax_amount NUMERIC := 0;
    order_total_amount NUMERIC := 0;
BEGIN
    -- 주문 상품들의 소계 계산
    SELECT 
        COALESCE(SUM(subtotal), 0),
        COALESCE(SUM(subtotal * 0.1), 0)  -- 10% 부가세
    INTO order_subtotal, order_tax_amount
    FROM order_items
    WHERE order_id = NEW.id;
    
    -- 총액 계산 (소계 + 부가세 + 배송비 - 할인)
    order_total_amount := order_subtotal + order_tax_amount + 
                         COALESCE(NEW.delivery_fee, 0) - 
                         COALESCE(NEW.discount_amount, 0);
    
    -- 주문 정보 업데이트
    UPDATE orders
    SET 
        subtotal = order_subtotal,
        tax_amount = order_tax_amount,
        total_amount = order_total_amount,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. 공급망 관리 함수
-- =====================================================

-- 5.1 공급 요청 총액 계산 함수
CREATE OR REPLACE FUNCTION calculate_supply_request_total()
RETURNS TRIGGER AS $$
DECLARE
    request_total NUMERIC := 0;
BEGIN
    -- 공급 요청 상품들의 총액 계산
    SELECT COALESCE(SUM(total_cost), 0)
    INTO request_total
    FROM supply_request_items
    WHERE supply_request_id = NEW.id;
    
    -- 공급 요청 정보 업데이트
    UPDATE supply_requests
    SET 
        total_amount = request_total,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.2 공급 요청 승인 처리 함수
CREATE OR REPLACE FUNCTION process_supply_request_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- 공급 요청이 승인되면 배송 정보 생성
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO shipments (
            supply_request_id, status, notes
        ) VALUES (
            NEW.id, 'preparing', '공급 요청 승인으로 인한 배송 준비'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. 알림 관리 함수
-- =====================================================

-- 6.1 주문 상태 변경 알림 함수
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문 상태가 변경되었을 때 고객에게 알림
    IF OLD.status IS NULL OR OLD.status != NEW.status THEN
        INSERT INTO notifications (
            user_id, type, title, message, priority, data
        ) VALUES (
            NEW.customer_id, 'order_status', '주문 상태 변경',
            '주문 #' || NEW.order_number || '의 상태가 "' || 
            CASE NEW.status
                WHEN 'confirmed' THEN '확인됨'
                WHEN 'preparing' THEN '준비 중'
                WHEN 'ready' THEN '준비 완료'
                WHEN 'completed' THEN '완료'
                WHEN 'cancelled' THEN '취소됨'
                ELSE NEW.status
            END || '"으로 변경되었습니다.',
            'normal',
            jsonb_build_object(
                'order_id', NEW.id,
                'order_number', NEW.order_number,
                'status', NEW.status,
                'store_id', NEW.store_id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. 사용자 관리 함수
-- =====================================================

-- 7.1 새 사용자 생성 시 프로필 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, role, full_name, is_active)
    VALUES (NEW.id, 'customer', COALESCE(NEW.raw_user_meta_data->>'full_name', '사용자'), true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7.2 새 지점 생성 시 상품 등록 함수
CREATE OR REPLACE FUNCTION create_store_products_for_new_store()
RETURNS TRIGGER AS $$
BEGIN
    -- 모든 활성 상품을 새 지점에 등록
    INSERT INTO store_products (store_id, product_id, price, stock_quantity)
    SELECT 
        NEW.id, p.id, p.base_price, 0
    FROM products p
    WHERE p.is_active = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. 통계 및 분석 함수
-- =====================================================

-- 8.1 일일 매출 통계 함수
CREATE OR REPLACE FUNCTION get_daily_sales(store_id_param UUID, date_param DATE)
RETURNS TABLE (
    total_orders INTEGER,
    total_revenue NUMERIC,
    avg_order_value NUMERIC,
    pickup_orders INTEGER,
    delivery_orders INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(dss.total_orders, 0),
        COALESCE(dss.total_revenue, 0),
        COALESCE(dss.avg_order_value, 0),
        COALESCE(dss.pickup_orders, 0),
        COALESCE(dss.delivery_orders, 0)
    FROM daily_sales_summary dss
    WHERE dss.store_id = store_id_param AND dss.date = date_param;
END;
$$ LANGUAGE plpgsql;

-- 8.2 주간 매출 통계 함수
CREATE OR REPLACE FUNCTION get_weekly_sales(store_id_param UUID, start_date DATE)
RETURNS TABLE (
    week_start DATE,
    total_orders INTEGER,
    total_revenue NUMERIC,
    avg_order_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dss.date as week_start,
        SUM(dss.total_orders) as total_orders,
        SUM(dss.total_revenue) as total_revenue,
        AVG(dss.avg_order_value) as avg_order_value
    FROM daily_sales_summary dss
    WHERE dss.store_id = store_id_param 
        AND dss.date >= start_date 
        AND dss.date < start_date + INTERVAL '7 days'
    GROUP BY dss.date
    ORDER BY dss.date;
END;
$$ LANGUAGE plpgsql;

-- 8.3 재고 부족 상품 조회 함수
CREATE OR REPLACE FUNCTION get_low_stock_products(store_id_param UUID)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    current_stock INTEGER,
    safety_stock INTEGER,
    max_stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.product_id,
        p.name as product_name,
        sp.stock_quantity as current_stock,
        sp.safety_stock,
        sp.max_stock
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id
    WHERE sp.store_id = store_id_param 
        AND sp.stock_quantity <= sp.safety_stock
        AND sp.is_available = true
    ORDER BY sp.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. 검증 함수
-- =====================================================

-- 9.1 주문 상품 검증 함수
CREATE OR REPLACE FUNCTION validate_order_item()
RETURNS TRIGGER AS $$
DECLARE
    product_exists BOOLEAN;
    stock_available INTEGER;
BEGIN
    -- 상품이 지점에서 판매되는지 확인
    SELECT EXISTS(
        SELECT 1 FROM store_products sp
        WHERE sp.store_id = (
            SELECT store_id FROM orders WHERE id = NEW.order_id
        ) AND sp.product_id = NEW.product_id AND sp.is_available = true
    ) INTO product_exists;
    
    IF NOT product_exists THEN
        RAISE EXCEPTION '상품이 해당 지점에서 판매되지 않습니다.';
    END IF;
    
    -- 재고 확인
    SELECT sp.stock_quantity
    INTO stock_available
    FROM store_products sp
    WHERE sp.store_id = (
        SELECT store_id FROM orders WHERE id = NEW.order_id
    ) AND sp.product_id = NEW.product_id;
    
    IF stock_available < NEW.quantity THEN
        RAISE EXCEPTION '재고가 부족합니다. (요청: %, 사용가능: %)', NEW.quantity, stock_available;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. 함수 생성 확인
-- =====================================================
SELECT 
    routine_name as "함수명",
    routine_type as "타입",
    data_type as "반환타입"
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
        'update_updated_at_column', 'generate_order_number', 'generate_supply_request_number',
        'generate_shipment_number', 'update_stock_quantity', 'check_safety_stock',
        'update_daily_sales_summary', 'update_product_sales_summary', 'log_order_status_change',
        'calculate_order_total', 'calculate_supply_request_total', 'process_supply_request_approval',
        'notify_order_status_change', 'handle_new_user', 'create_store_products_for_new_store',
        'get_daily_sales', 'get_weekly_sales', 'get_low_stock_products', 'validate_order_item'
    )
ORDER BY routine_name; 