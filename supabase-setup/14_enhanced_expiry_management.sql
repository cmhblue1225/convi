-- =====================================================
-- 14_enhanced_expiry_management.sql
-- 목적: 물류 요청 상태가 'delivered'로 변경될 때 유통기한을 정확하게 설정
-- 배송 완료 시간을 기준으로 유통기한 계산
-- =====================================================

-- 1) supply_requests 테이블에 delivered_at 컬럼 추가 (배송 완료 시간)
ALTER TABLE IF EXISTS supply_requests
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

COMMENT ON COLUMN supply_requests.delivered_at IS '배송 완료 시간 (상태가 delivered로 변경된 시점)';

-- 2) supply_requests 테이블에 delivered_by 컬럼 추가 (배송 완료 처리자)
ALTER TABLE IF EXISTS supply_requests
ADD COLUMN IF NOT EXISTS delivered_by UUID REFERENCES profiles(id);

COMMENT ON COLUMN supply_requests.delivered_by IS '배송 완료 처리자 ID';

-- 3) supply_requests 상태 변경 시 delivered_at 자동 설정 함수
CREATE OR REPLACE FUNCTION set_supply_request_delivered_at()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 'delivered'로 변경되고 delivered_at이 NULL인 경우
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.delivered_at IS NULL THEN
    NEW.delivered_at := NOW();
    NEW.delivered_by := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trg_set_supply_request_delivered_at ON supply_requests;
CREATE TRIGGER trg_set_supply_request_delivered_at
BEFORE UPDATE ON supply_requests
FOR EACH ROW
EXECUTE FUNCTION set_supply_request_delivered_at();

-- 4) 배송 완료 시 관련 입고 트랜잭션의 expires_at을 정확한 배송 완료 시간 기준으로 설정
CREATE OR REPLACE FUNCTION set_expiry_from_supply_request_delivered()
RETURNS TRIGGER AS $$
DECLARE
  v_shelf_life_days INTEGER;
  v_product_id UUID;
  v_store_product_id UUID;
BEGIN
  -- 상태가 'delivered'로 변경된 경우만 처리
  IF NEW.status <> 'delivered' OR OLD.status = 'delivered' THEN
    RETURN NEW;
  END IF;

  -- 배송 완료 시간이 설정되지 않은 경우 처리하지 않음
  IF NEW.delivered_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- 해당 물류 요청의 모든 아이템에 대해 유통기한 설정
  FOR v_store_product_id, v_product_id IN
    SELECT DISTINCT sp.id, sp.product_id
    FROM supply_request_items sri
    JOIN store_products sp ON sp.product_id = sri.product_id AND sp.store_id = NEW.store_id
    WHERE sri.supply_request_id = NEW.id
  LOOP
    -- 상품의 기본 유통기한 조회
    SELECT shelf_life_days INTO v_shelf_life_days
    FROM products
    WHERE id = v_product_id;

    -- 유통기한이 설정된 상품인 경우에만 처리
    IF v_shelf_life_days IS NOT NULL THEN
      -- 해당 store_product_id의 입고 트랜잭션 중 가장 최근 것을 찾아 expires_at 업데이트
      UPDATE inventory_transactions
      SET expires_at = NEW.delivered_at + make_interval(days => v_shelf_life_days)
      WHERE store_product_id = v_store_product_id
        AND transaction_type = 'in'
        AND reference_type = 'supply_request'
        AND reference_id = NEW.id
        AND expires_at IS NULL;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trg_set_expiry_from_supply_request_delivered ON supply_requests;
CREATE TRIGGER trg_set_expiry_from_supply_request_delivered
AFTER UPDATE ON supply_requests
FOR EACH ROW
EXECUTE FUNCTION set_expiry_from_supply_request_delivered();

-- 5) 기존 배송 완료된 물류 요청들의 delivered_at 설정 (데이터 마이그레이션)
UPDATE supply_requests 
SET delivered_at = updated_at
WHERE status = 'delivered' AND delivered_at IS NULL;

-- 6) 기존 배송 완료된 물류 요청들의 유통기한 재계산 (데이터 마이그레이션)
-- 이 부분은 배치로 실행하여 성능 문제 방지
DO $$
DECLARE
  v_request RECORD;
  v_shelf_life_days INTEGER;
  v_product_id UUID;
  v_store_product_id UUID;
BEGIN
  FOR v_request IN
    SELECT sr.id, sr.delivered_at, sr.store_id
    FROM supply_requests sr
    WHERE sr.status = 'delivered' AND sr.delivered_at IS NOT NULL
  LOOP
    -- 해당 물류 요청의 모든 아이템에 대해 유통기한 재계산
    FOR v_store_product_id, v_product_id IN
      SELECT DISTINCT sp.id, sp.product_id
      FROM supply_request_items sri
      JOIN store_products sp ON sp.product_id = sri.product_id AND sp.store_id = v_request.store_id
      WHERE sri.supply_request_id = v_request.id
    LOOP
      -- 상품의 기본 유통기한 조회
      SELECT shelf_life_days INTO v_shelf_life_days
      FROM products
      WHERE id = v_product_id;

      -- 유통기한이 설정된 상품인 경우에만 처리
      IF v_shelf_life_days IS NOT NULL THEN
        -- 해당 store_product_id의 입고 트랜잭션 중 가장 최근 것을 찾아 expires_at 업데이트
        UPDATE inventory_transactions
        SET expires_at = v_request.delivered_at + make_interval(days => v_shelf_life_days)
        WHERE store_product_id = v_store_product_id
          AND transaction_type = 'in'
          AND reference_type = 'supply_request'
          AND reference_id = v_request.id
          AND expires_at IS NULL;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 7) 유통기한 계산을 위한 헬퍼 함수
CREATE OR REPLACE FUNCTION calculate_expiry_remaining(
  p_expires_at TIMESTAMPTZ,
  p_current_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  days_remaining INTEGER,
  hours_remaining INTEGER,
  minutes_remaining INTEGER,
  total_minutes_remaining BIGINT,
  status TEXT
) AS $$
DECLARE
  v_diff_interval INTERVAL;
  v_total_minutes BIGINT;
  v_days INTEGER;
  v_hours INTEGER;
  v_minutes INTEGER;
  v_status TEXT;
BEGIN
  -- 만료 시간이 없는 경우
  IF p_expires_at IS NULL THEN
    RETURN QUERY SELECT NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, NULL::BIGINT, 'no_expiry'::TEXT;
    RETURN;
  END IF;

  -- 현재 시간과의 차이 계산
  v_diff_interval := p_expires_at - p_current_time;
  v_total_minutes := EXTRACT(EPOCH FROM v_diff_interval) / 60;

  -- 음수인 경우 (만료됨)
  IF v_total_minutes < 0 THEN
    v_days := 0;
    v_hours := 0;
    v_minutes := 0;
    v_status := 'expired';
  ELSE
    -- 일, 시간, 분으로 분해
    v_days := EXTRACT(DAY FROM v_diff_interval);
    v_hours := EXTRACT(HOUR FROM v_diff_interval);
    v_minutes := EXTRACT(MINUTE FROM v_diff_interval);
    
    -- 상태 결정
    IF v_total_minutes <= 0 THEN
      v_status := 'expired';
    ELSIF v_total_minutes <= 3 * 24 * 60 THEN -- 3일 이하
      v_status := 'danger';
    ELSIF v_total_minutes <= 7 * 24 * 60 THEN -- 7일 이하
      v_status := 'warning';
    ELSE
      v_status := 'normal';
    END IF;
  END IF;

  RETURN QUERY SELECT v_days, v_hours, v_minutes, v_total_minutes, v_status;
END;
$$ LANGUAGE plpgsql;

-- 8) 인덱스 추가로 성능 향상
CREATE INDEX IF NOT EXISTS idx_supply_requests_status_delivered_at 
ON supply_requests(status, delivered_at);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference_supply 
ON inventory_transactions(reference_type, reference_id) 
WHERE reference_type = 'supply_request';

-- 9) 권한 설정
GRANT EXECUTE ON FUNCTION calculate_expiry_remaining(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- 끝
