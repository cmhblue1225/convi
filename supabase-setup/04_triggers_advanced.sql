-- =====================================================
-- 04_triggers_advanced.sql
-- 고급 데이터베이스 트리거 생성
-- =====================================================

-- =====================================================
-- 1. 기본 업데이트 트리거
-- =====================================================

-- 1.1 프로필 테이블 updated_at 트리거
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.2 카테고리 테이블 updated_at 트리거
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.3 상품 테이블 updated_at 트리거
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.4 지점 테이블 updated_at 트리거
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.5 지점별 상품 테이블 updated_at 트리거
CREATE TRIGGER update_store_products_updated_at
    BEFORE UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.6 주문 테이블 updated_at 트리거
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.7 일일 매출 요약 테이블 updated_at 트리거
CREATE TRIGGER update_daily_sales_summary_updated_at
    BEFORE UPDATE ON daily_sales_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.8 공급 요청 테이블 updated_at 트리거
CREATE TRIGGER update_supply_requests_updated_at
    BEFORE UPDATE ON supply_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.9 배송 테이블 updated_at 트리거
CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.10 시스템 설정 테이블 updated_at 트리거
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. 자동 번호 생성 트리거
-- =====================================================

-- 2.1 주문 번호 자동 생성 트리거
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- 2.2 공급 요청 번호 자동 생성 트리거
CREATE TRIGGER generate_supply_request_number_trigger
    BEFORE INSERT ON supply_requests
    FOR EACH ROW
    EXECUTE FUNCTION generate_supply_request_number();

-- 2.3 배송 번호 자동 생성 트리거
CREATE TRIGGER generate_shipment_number_trigger
    BEFORE INSERT ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION generate_shipment_number();

-- =====================================================
-- 3. 재고 관리 트리거
-- =====================================================

-- 3.1 주문 상태 변경 시 재고 차감/복원 트리거
CREATE TRIGGER update_stock_on_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_quantity();

-- 3.2 재고 변경 시 안전 재고 확인 트리거
CREATE TRIGGER check_safety_stock_trigger
    AFTER UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION check_safety_stock();

-- =====================================================
-- 4. 매출 분석 트리거
-- =====================================================

-- 4.1 주문 완료 시 일일 매출 요약 업데이트 트리거
CREATE TRIGGER update_daily_sales_summary_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_sales_summary();

-- 4.2 주문 완료 시 상품별 매출 요약 업데이트 트리거
CREATE TRIGGER update_product_sales_summary_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_product_sales_summary();

-- =====================================================
-- 5. 주문 관리 트리거
-- =====================================================

-- 5.1 주문 상태 변경 이력 기록 트리거
CREATE TRIGGER log_order_status_change_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- 5.2 주문 상품 추가/수정 시 총액 계산 트리거
CREATE TRIGGER calculate_order_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

-- 5.3 주문 상품 검증 트리거
CREATE TRIGGER validate_order_item_trigger
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_item();

-- =====================================================
-- 6. 공급망 관리 트리거
-- =====================================================

-- 6.1 공급 요청 상품 추가/수정 시 총액 계산 트리거
CREATE TRIGGER calculate_supply_request_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON supply_request_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_supply_request_total();

-- 6.2 공급 요청 승인 시 배송 정보 생성 트리거
CREATE TRIGGER process_supply_request_approval_trigger
    AFTER UPDATE ON supply_requests
    FOR EACH ROW
    EXECUTE FUNCTION process_supply_request_approval();

-- =====================================================
-- 7. 알림 관리 트리거
-- =====================================================

-- 7.1 주문 상태 변경 시 알림 생성 트리거
CREATE TRIGGER notify_order_status_change_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_order_status_change();

-- =====================================================
-- 8. 사용자 관리 트리거
-- =====================================================

-- 8.1 새 사용자 생성 시 프로필 생성 트리거
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 8.2 새 지점 생성 시 상품 등록 트리거
CREATE TRIGGER create_store_products_on_store_creation
    AFTER INSERT ON stores
    FOR EACH ROW
    EXECUTE FUNCTION create_store_products_for_new_store();

-- =====================================================
-- 9. 고급 기능 트리거
-- =====================================================

-- 9.1 재고 거래 이력 자동 생성 트리거 (수동 재고 조정 시)
CREATE OR REPLACE FUNCTION create_inventory_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- 재고가 변경되었을 때만 이력 생성
    IF OLD.stock_quantity != NEW.stock_quantity THEN
        INSERT INTO inventory_transactions (
            store_product_id, transaction_type, quantity,
            previous_quantity, new_quantity, reference_type, reference_id,
            reason, created_by
        ) VALUES (
            NEW.id, 'adjustment', ABS(NEW.stock_quantity - OLD.stock_quantity),
            OLD.stock_quantity, NEW.stock_quantity,
            'manual_adjustment', NULL,
            '수동 재고 조정', NULL
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_inventory_transaction_trigger
    AFTER UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION create_inventory_transaction();

-- 9.2 상품 비활성화 시 지점별 상품도 비활성화 트리거
CREATE OR REPLACE FUNCTION deactivate_store_products_on_product_deactivation()
RETURNS TRIGGER AS $$
BEGIN
    -- 상품이 비활성화되면 모든 지점의 해당 상품도 비활성화
    IF OLD.is_active = true AND NEW.is_active = false THEN
        UPDATE store_products
        SET is_available = false, updated_at = NOW()
        WHERE product_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deactivate_store_products_on_product_deactivation_trigger
    AFTER UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION deactivate_store_products_on_product_deactivation();

-- 9.3 지점 비활성화 시 해당 지점 상품도 비활성화 트리거
CREATE OR REPLACE FUNCTION deactivate_products_on_store_deactivation()
RETURNS TRIGGER AS $$
BEGIN
    -- 지점이 비활성화되면 해당 지점의 모든 상품도 비활성화
    IF OLD.is_active = true AND NEW.is_active = false THEN
        UPDATE store_products
        SET is_available = false, updated_at = NOW()
        WHERE store_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deactivate_products_on_store_deactivation_trigger
    AFTER UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION deactivate_products_on_store_deactivation();

-- 9.4 카테고리 비활성화 시 하위 카테고리도 비활성화 트리거
CREATE OR REPLACE FUNCTION deactivate_child_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- 카테고리가 비활성화되면 하위 카테고리들도 비활성화
    IF OLD.is_active = true AND NEW.is_active = false THEN
        UPDATE categories
        SET is_active = false, updated_at = NOW()
        WHERE parent_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deactivate_child_categories_trigger
    AFTER UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION deactivate_child_categories();

-- 9.5 주문 완료 시 완료 시간 자동 설정 트리거
CREATE OR REPLACE FUNCTION set_order_completion_time()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문이 완료되면 완료 시간 설정
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- 주문이 취소되면 취소 시간 설정
    IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
        NEW.cancelled_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_completion_time_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_completion_time();

-- =====================================================
-- 10. 성능 최적화 트리거
-- =====================================================

-- 10.1 주문 상품 삭제 시 주문 총액 재계산 트리거
CREATE OR REPLACE FUNCTION recalculate_order_total_on_item_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문 상품이 삭제되면 주문 총액 재계산
    PERFORM calculate_order_total() FROM orders WHERE id = OLD.order_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_order_total_on_item_delete_trigger
    AFTER DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_order_total_on_item_delete();

-- 10.2 공급 요청 상품 삭제 시 총액 재계산 트리거
CREATE OR REPLACE FUNCTION recalculate_supply_request_total_on_item_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- 공급 요청 상품이 삭제되면 총액 재계산
    PERFORM calculate_supply_request_total() FROM supply_requests WHERE id = OLD.supply_request_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_supply_request_total_on_item_delete_trigger
    AFTER DELETE ON supply_request_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_supply_request_total_on_item_delete();

-- =====================================================
-- 11. 트리거 생성 확인
-- =====================================================
SELECT 
    trigger_name as "트리거명",
    event_manipulation as "이벤트",
    action_timing as "타이밍",
    event_object_table as "테이블명"
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND event_object_table IN (
        'profiles', 'categories', 'products', 'stores', 'store_products',
        'orders', 'order_items', 'daily_sales_summary', 'product_sales_summary',
        'order_status_history', 'inventory_transactions', 'supply_requests',
        'supply_request_items', 'shipments', 'notifications', 'system_settings'
    )
ORDER BY event_object_table, trigger_name; 