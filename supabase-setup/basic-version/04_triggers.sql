-- =====================================================
-- 04_triggers.sql
-- 데이터베이스 트리거 설정
-- =====================================================

-- =====================================================
-- 1. updated_at 자동 업데이트 트리거
-- =====================================================

-- profiles 테이블
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- stores 테이블
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- categories 테이블
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- products 테이블
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- store_products 테이블
DROP TRIGGER IF EXISTS update_store_products_updated_at ON store_products;
CREATE TRIGGER update_store_products_updated_at
    BEFORE UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- orders 테이블
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. 주문 번호 자동 생성 트리거
-- =====================================================
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- 3. 재고 관리 트리거
-- =====================================================

-- 주문 상태 변경 시 재고 차감
DROP TRIGGER IF EXISTS update_stock_on_order_status_change ON orders;
CREATE TRIGGER update_stock_on_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_quantity();

-- 주문 취소 시 재고 복구
DROP TRIGGER IF EXISTS restore_stock_on_order_cancel ON orders;
CREATE TRIGGER restore_stock_on_order_cancel
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION restore_stock_on_cancel();

-- =====================================================
-- 4. 사용자 자동 프로필 생성 트리거
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 5. 지점별 상품 자동 생성 트리거
-- =====================================================
DROP TRIGGER IF EXISTS create_store_products_on_store_creation ON stores;
CREATE TRIGGER create_store_products_on_store_creation
    AFTER INSERT ON stores
    FOR EACH ROW
    EXECUTE FUNCTION create_store_products_for_new_store();

-- =====================================================
-- 6. 주문 상품 유효성 검사 트리거
-- =====================================================
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

DROP TRIGGER IF EXISTS validate_order_item_trigger ON order_items;
CREATE TRIGGER validate_order_item_trigger
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_item();

-- =====================================================
-- 7. 주문 총액 자동 계산 트리거
-- =====================================================
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

DROP TRIGGER IF EXISTS update_order_total_trigger ON order_items;
CREATE TRIGGER update_order_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();

-- =====================================================
-- 8. 재고 부족 알림 트리거
-- =====================================================
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

DROP TRIGGER IF EXISTS notify_low_stock_trigger ON store_products;
CREATE TRIGGER notify_low_stock_trigger
    AFTER UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION notify_low_stock();

-- =====================================================
-- 트리거 생성 확인
-- =====================================================
SELECT 
    trigger_name as "트리거명",
    event_manipulation as "이벤트",
    event_object_table as "테이블명",
    action_timing as "실행시점"
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
        'create_store_products_on_store_creation',
        'validate_order_item_trigger',
        'update_order_total_trigger',
        'notify_low_stock_trigger'
    )
ORDER BY event_object_table, trigger_name; 