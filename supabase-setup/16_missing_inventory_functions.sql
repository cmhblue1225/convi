-- =====================================================
-- 16_missing_inventory_functions.sql
-- 누락된 재고 관리 및 환불 처리 함수들 생성
-- =====================================================

-- =====================================================
-- 1. 원자적 재고 차감 함수
-- =====================================================
CREATE OR REPLACE FUNCTION atomic_inventory_deduction(
    p_store_id UUID,
    p_items JSONB,
    p_reference_type TEXT,
    p_reference_id UUID,
    p_order_number TEXT,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    item JSONB;
    current_stock INTEGER;
    transaction_ids UUID[] := '{}';
    transaction_id UUID;
    store_product_rec RECORD;
BEGIN
    -- 트랜잭션 시작
    BEGIN
        -- 각 상품에 대해 처리
        FOR item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            -- 현재 재고 확인 및 잠금
            SELECT sp.id, sp.stock_quantity, sp.product_id, p.name
            INTO store_product_rec
            FROM store_products sp
            JOIN products p ON p.id = sp.product_id
            WHERE sp.store_id = p_store_id 
                AND sp.product_id = (item->>'product_id')::UUID
                AND sp.is_available = true
            FOR UPDATE; -- 행 수준 잠금으로 Race Condition 방지
            
            IF NOT FOUND THEN
                RAISE EXCEPTION '상품을 찾을 수 없습니다: %', item->>'product_name';
            END IF;
            
            current_stock := store_product_rec.stock_quantity;
            
            -- 재고 부족 확인
            IF current_stock < (item->>'quantity')::INTEGER THEN
                RAISE EXCEPTION '재고 부족: % (요청: %개, 재고: %개)', 
                    store_product_rec.name, 
                    (item->>'quantity')::INTEGER, 
                    current_stock;
            END IF;
            
            -- 재고 차감
            UPDATE store_products 
            SET stock_quantity = stock_quantity - (item->>'quantity')::INTEGER,
                updated_at = NOW()
            WHERE id = store_product_rec.id;
            
            -- 재고 거래 이력 기록
            INSERT INTO inventory_transactions (
                store_product_id, transaction_type, quantity,
                previous_quantity, new_quantity, reference_type, reference_id,
                reason, created_by, notes
            ) VALUES (
                store_product_rec.id, 'out', (item->>'quantity')::INTEGER,
                current_stock, current_stock - (item->>'quantity')::INTEGER,
                p_reference_type, p_reference_id,
                '주문 처리로 인한 재고 차감', p_user_id,
                format('주문번호: %s, 상품: %s', p_order_number, item->>'product_name')
            ) RETURNING id INTO transaction_id;
            
            transaction_ids := transaction_ids || transaction_id;
        END LOOP;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', format('%s개 상품의 재고가 성공적으로 차감되었습니다.', jsonb_array_length(p_items)),
            'transaction_ids', to_jsonb(transaction_ids)
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- 오류 발생 시 롤백
        RAISE EXCEPTION '재고 차감 실패: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. 원자적 재고 복구 함수 (주문 취소용)
-- =====================================================
CREATE OR REPLACE FUNCTION atomic_inventory_restoration(
    p_order_id UUID,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    order_rec RECORD;
    item_rec RECORD;
    transaction_ids UUID[] := '{}';
    transaction_id UUID;
    store_product_rec RECORD;
BEGIN
    -- 주문 정보 확인
    SELECT id, store_id, order_number, status
    INTO order_rec
    FROM orders
    WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION '주문을 찾을 수 없습니다: %', p_order_id;
    END IF;
    
    -- 이미 취소된 주문인지 확인
    IF order_rec.status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '이미 취소된 주문입니다.',
            'transaction_ids', '[]'::jsonb
        );
    END IF;
    
    -- 트랜잭션 시작
    BEGIN
        -- 주문 상품들의 재고 복구
        FOR item_rec IN 
            SELECT oi.product_id, oi.quantity, oi.product_name
            FROM order_items oi
            WHERE oi.order_id = p_order_id
        LOOP
            -- 상품 정보 확인 및 잠금
            SELECT sp.id, sp.stock_quantity
            INTO store_product_rec
            FROM store_products sp
            WHERE sp.store_id = order_rec.store_id 
                AND sp.product_id = item_rec.product_id
            FOR UPDATE; -- 행 수준 잠금
            
            IF NOT FOUND THEN
                RAISE EXCEPTION '지점 상품을 찾을 수 없습니다: %', item_rec.product_name;
            END IF;
            
            -- 재고 복구
            UPDATE store_products 
            SET stock_quantity = stock_quantity + item_rec.quantity,
                updated_at = NOW()
            WHERE id = store_product_rec.id;
            
            -- 재고 거래 이력 기록
            INSERT INTO inventory_transactions (
                store_product_id, transaction_type, quantity,
                previous_quantity, new_quantity, reference_type, reference_id,
                reason, created_by, notes
            ) VALUES (
                store_product_rec.id, 'returned', item_rec.quantity,
                store_product_rec.stock_quantity, store_product_rec.stock_quantity + item_rec.quantity,
                'order_cancellation', p_order_id,
                '주문 취소로 인한 재고 복구', p_user_id,
                format('주문번호: %s, 상품: %s', order_rec.order_number, item_rec.product_name)
            ) RETURNING id INTO transaction_id;
            
            transaction_ids := transaction_ids || transaction_id;
        END LOOP;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', '재고가 성공적으로 복구되었습니다.',
            'transaction_ids', to_jsonb(transaction_ids)
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- 오류 발생 시 롤백
        RAISE EXCEPTION '재고 복구 실패: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. 환불 요청 처리 함수 (재고 복구 포함)
-- =====================================================
CREATE OR REPLACE FUNCTION process_refund_request(
    p_refund_request_id UUID,
    p_new_status TEXT,
    p_processed_by UUID,
    p_notes TEXT DEFAULT '',
    p_rejection_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    refund_rec RECORD;
    order_rec RECORD;
    item_rec RECORD;
    transaction_ids UUID[] := '{}';
    transaction_id UUID;
    store_product_rec RECORD;
    refund_items JSONB;
    refund_item JSONB;
BEGIN
    -- 환불 요청 정보 확인
    SELECT rr.id, rr.order_id, rr.status, rr.refund_items, rr.requested_refund_amount
    INTO refund_rec
    FROM refund_requests rr
    WHERE rr.id = p_refund_request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION '환불 요청을 찾을 수 없습니다: %', p_refund_request_id;
    END IF;
    
    -- 주문 정보 확인
    SELECT o.id, o.store_id, o.order_number
    INTO order_rec
    FROM orders o
    WHERE o.id = refund_rec.order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION '주문을 찾을 수 없습니다: %', refund_rec.order_id;
    END IF;
    
    -- 트랜잭션 시작
    BEGIN
        -- 환불 요청 상태 업데이트
        UPDATE refund_requests
        SET status = p_new_status,
            processed_at = NOW(),
            processed_by = p_processed_by,
            admin_notes = p_notes,
            rejection_reason = CASE WHEN p_new_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
            approved_refund_amount = CASE 
                WHEN p_new_status = 'approved' THEN requested_refund_amount 
                ELSE NULL 
            END,
            updated_at = NOW()
        WHERE id = p_refund_request_id;
        
        -- 환불이 승인된 경우 재고 복구 처리
        IF p_new_status = 'approved' THEN
            -- 환불 상품 목록 가져오기
            refund_items := refund_rec.refund_items;
            
            -- refund_items가 배열인지 확인
            IF jsonb_typeof(refund_items) = 'array' THEN
                -- 각 환불 상품에 대해 재고 복구
                FOR refund_item IN SELECT * FROM jsonb_array_elements(refund_items)
                LOOP
                    -- 상품 정보 확인 및 잠금
                    SELECT sp.id, sp.stock_quantity, p.name
                    INTO store_product_rec
                    FROM store_products sp
                    JOIN products p ON p.id = sp.product_id
                    WHERE sp.store_id = order_rec.store_id 
                        AND sp.product_id = (refund_item->>'productId')::UUID
                    FOR UPDATE; -- 행 수준 잠금
                    
                    IF FOUND THEN
                        -- 재고 복구
                        UPDATE store_products 
                        SET stock_quantity = stock_quantity + (refund_item->>'quantity')::INTEGER,
                            updated_at = NOW()
                        WHERE id = store_product_rec.id;
                        
                        -- 재고 거래 이력 기록
                        INSERT INTO inventory_transactions (
                            store_product_id, transaction_type, quantity,
                            previous_quantity, new_quantity, reference_type, reference_id,
                            reason, created_by, notes
                        ) VALUES (
                            store_product_rec.id, 'refund_return', (refund_item->>'quantity')::INTEGER,
                            store_product_rec.stock_quantity, 
                            store_product_rec.stock_quantity + (refund_item->>'quantity')::INTEGER,
                            'refund_approval', refund_rec.id,
                            '환불 승인으로 인한 재고 복구', p_processed_by,
                            format('주문번호: %s, 상품: %s, 환불승인', 
                                order_rec.order_number, 
                                COALESCE(refund_item->>'productName', store_product_rec.name))
                        ) RETURNING id INTO transaction_id;
                        
                        transaction_ids := transaction_ids || transaction_id;
                    END IF;
                END LOOP;
            END IF;
        END IF;
        
        -- 환불 처리 이력 기록
        INSERT INTO refund_history (
            refund_request_id, status, notes, processed_by, action_type, metadata
        ) VALUES (
            p_refund_request_id, p_new_status, p_notes, p_processed_by, 'status_change',
            jsonb_build_object(
                'previous_status', refund_rec.status,
                'inventory_restored', CASE WHEN p_new_status = 'approved' THEN true ELSE false END,
                'transaction_count', array_length(transaction_ids, 1)
            )
        );
        
        RETURN jsonb_build_object(
            'success', true,
            'message', format('환불 요청이 %s 처리되었습니다.', 
                CASE p_new_status 
                    WHEN 'approved' THEN '승인'
                    WHEN 'rejected' THEN '거절'
                    ELSE p_new_status
                END),
            'status', p_new_status,
            'inventory_restored', CASE WHEN p_new_status = 'approved' THEN true ELSE false END,
            'transaction_ids', to_jsonb(transaction_ids)
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- 오류 발생 시 롤백
        RAISE EXCEPTION '환불 처리 실패: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. 함수 권한 설정
-- =====================================================

-- 인증된 사용자가 함수 실행 가능하도록 권한 부여
GRANT EXECUTE ON FUNCTION atomic_inventory_deduction TO authenticated;
GRANT EXECUTE ON FUNCTION atomic_inventory_restoration TO authenticated; 
GRANT EXECUTE ON FUNCTION process_refund_request TO authenticated;

-- =====================================================
-- 5. 함수 생성 확인
-- =====================================================
SELECT 
    routine_name as "새로 생성된 함수",
    routine_type as "타입",
    data_type as "반환타입"
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
        'atomic_inventory_deduction', 
        'atomic_inventory_restoration', 
        'process_refund_request'
    )
ORDER BY routine_name;