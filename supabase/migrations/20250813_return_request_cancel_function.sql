-- =====================================================
-- 반품 요청 취소 기능 추가
-- =====================================================

-- 반품 요청 취소 시 재고 복원 함수
CREATE OR REPLACE FUNCTION handle_return_request_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    return_item RECORD;
BEGIN
    -- 반품 요청이 취소 상태로 변경되었을 때만 실행
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        RAISE NOTICE '반품 요청 취소 처리 시작: %', NEW.request_number;
        
        -- 이미 승인되어 재고가 차감된 반품 요청인 경우 재고 복원
        IF OLD.status = 'approved' THEN
            RAISE NOTICE '승인된 반품 요청 취소 - 재고 복원 시작';
            
            -- 반품 요청 상품들의 재고를 복원
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
                RAISE NOTICE '상품 재고 복원: % (ID: %), 수량: %', 
                    return_item.product_name, return_item.product_id, return_item.approved_quantity;
                
                -- store_products 테이블의 재고 복원 (RLS 우회)
                UPDATE public.store_products 
                SET stock_quantity = stock_quantity + return_item.approved_quantity,
                    updated_at = NOW()
                WHERE store_id = return_item.store_id 
                    AND product_id = return_item.product_id;
                
                -- 영향받은 행이 있는지 확인
                IF FOUND THEN
                    RAISE NOTICE '재고 복원 완료: % (수량: %)', 
                        return_item.product_name, return_item.approved_quantity;
                ELSE
                    RAISE WARNING '재고 복원 실패: 해당 상품을 찾을 수 없음 (store_id: %, product_id: %)', 
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
                    'in',
                    return_item.approved_quantity,
                    sp.stock_quantity - return_item.approved_quantity,
                    sp.stock_quantity,
                    'return_request_cancel',
                    NEW.id,
                    '반품 요청 취소로 인한 재고 복원: ' || return_item.product_name,
                    NEW.updated_by -- 취소한 사용자
                FROM public.store_products sp
                WHERE sp.store_id = return_item.store_id 
                    AND sp.product_id = return_item.product_id;
                    
                RAISE NOTICE '재고 거래 이력 기록 완료';
            END LOOP;
            
            RAISE NOTICE '승인된 반품 요청 취소 - 재고 복원 완료: %', NEW.request_number;
        ELSE
            RAISE NOTICE '미승인 반품 요청 취소 - 재고 복원 불필요: %', NEW.request_number;
        END IF;
        
        -- 취소 시간 업데이트
        NEW.updated_at = NOW();
        
        RAISE NOTICE '반품 요청 취소 처리 완료: %', NEW.request_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 취소 트리거가 있다면 삭제
DROP TRIGGER IF EXISTS trigger_handle_return_request_cancellation ON return_requests;

-- 반품 요청 취소 시 재고 복원 트리거 생성
CREATE TRIGGER trigger_handle_return_request_cancellation
    BEFORE UPDATE ON return_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_return_request_cancellation();

-- return_requests 테이블에 updated_by 컬럼 추가 (취소한 사용자 추적용)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'return_requests' 
        AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE return_requests 
        ADD COLUMN updated_by UUID REFERENCES profiles(id);
    END IF;
END $$;

-- 반품 요청 취소 함수 (API 호출용)
CREATE OR REPLACE FUNCTION cancel_return_request(
    request_id UUID,
    cancelled_by_user_id UUID,
    cancel_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    request_record RECORD;
    result JSON;
BEGIN
    -- 반품 요청 존재 확인
    SELECT * INTO request_record 
    FROM return_requests 
    WHERE id = request_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', '반품 요청을 찾을 수 없습니다.'
        );
    END IF;
    
    -- 취소 가능한 상태인지 확인
    IF request_record.status NOT IN ('submitted', 'approved') THEN
        RETURN json_build_object(
            'success', false,
            'error', '취소할 수 없는 상태입니다. 현재 상태: ' || request_record.status
        );
    END IF;
    
    -- 반품 요청 취소 처리
    UPDATE return_requests 
    SET 
        status = 'cancelled',
        updated_by = cancelled_by_user_id,
        updated_at = NOW(),
        rejection_reason = CASE 
            WHEN cancel_reason IS NOT NULL THEN '취소 사유: ' || cancel_reason
            ELSE '사용자 요청에 의한 취소'
        END
    WHERE id = request_id;
    
    RETURN json_build_object(
        'success', true,
        'message', '반품 요청이 성공적으로 취소되었습니다.',
        'request_number', request_record.request_number,
        'previous_status', request_record.status
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', '취소 처리 중 오류가 발생했습니다: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수에 대한 권한 설정
REVOKE ALL ON FUNCTION cancel_return_request(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cancel_return_request(UUID, UUID, TEXT) TO authenticated;

-- 코멘트 추가
COMMENT ON FUNCTION handle_return_request_cancellation() IS '반품 요청 취소 시 재고를 자동으로 복원하고 거래 이력을 기록';
COMMENT ON TRIGGER trigger_handle_return_request_cancellation ON return_requests IS '반품 요청 취소 시 재고 복원을 자동으로 처리하는 트리거';
COMMENT ON FUNCTION cancel_return_request(UUID, UUID, TEXT) IS '반품 요청을 취소하는 함수 (API 호출용)';

