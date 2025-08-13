-- =====================================================
-- 반품 요청 승인 시 재고 차감 트리거
-- =====================================================

-- 반품 요청 승인 시 재고 차감 함수
CREATE OR REPLACE FUNCTION handle_return_request_approval()
RETURNS TRIGGER AS $$
DECLARE
    return_item RECORD;
BEGIN
    -- 반품 요청이 승인 상태로 변경되었을 때만 실행
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        RAISE NOTICE '반품 요청 승인 처리 시작: %', NEW.request_number;
        
        -- 반품 요청 상품들의 재고를 차감
        FOR return_item IN 
            SELECT 
                rri.product_id, 
                rri.approved_quantity, 
                rr.store_id,
                rri.product_name
            FROM public.return_request_items rri
            JOIN public.return_requests rr ON rri.return_request_id = rr.id
            WHERE rri.return_request_id = NEW.id
                AND rri.approved_quantity > 0
        LOOP
            RAISE NOTICE '상품 재고 차감: % (ID: %), 수량: %', 
                return_item.product_name, return_item.product_id, return_item.approved_quantity;
            
            -- store_products 테이블의 재고 차감 (RLS 우회)
            UPDATE public.store_products 
            SET stock_quantity = GREATEST(0, stock_quantity - return_item.approved_quantity),
                updated_at = NOW()
            WHERE store_id = return_item.store_id 
                AND product_id = return_item.product_id;
            
            -- 영향받은 행이 있는지 확인
            IF FOUND THEN
                RAISE NOTICE '재고 차감 완료: % (수량: %)', 
                    return_item.product_name, return_item.approved_quantity;
            ELSE
                RAISE WARNING '재고 차감 실패: 해당 상품을 찾을 수 없음 (store_id: %, product_id: %)', 
                    return_item.store_id, return_item.product_id;
            END IF;
            
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
                'out',
                return_item.approved_quantity,
                sp.stock_quantity + return_item.approved_quantity,
                sp.stock_quantity,
                'return_request',
                NEW.id,
                '반품 요청 승인으로 인한 재고 차감: ' || return_item.product_name,
                NEW.approved_by
            FROM public.store_products sp
            WHERE sp.store_id = return_item.store_id 
                AND sp.product_id = return_item.product_id;
                
            RAISE NOTICE '재고 거래 이력 기록 완료';
        END LOOP;
        
        RAISE NOTICE '반품 요청 승인 처리 완료: %', NEW.request_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거가 있다면 삭제
DROP TRIGGER IF EXISTS trigger_handle_return_request_approval ON return_requests;

-- 반품 요청 승인 시 재고 차감 트리거 생성
CREATE TRIGGER trigger_handle_return_request_approval
    AFTER UPDATE ON return_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_return_request_approval();

COMMENT ON FUNCTION handle_return_request_approval() IS '반품 요청 승인 시 지점 재고를 자동으로 차감하고 거래 이력을 기록';
COMMENT ON TRIGGER trigger_handle_return_request_approval ON return_requests IS '반품 요청 승인 시 재고 차감을 자동으로 처리하는 트리거';

