-- =====================================================
-- 13_shelf_life_and_expiration.sql
-- 목적: 제품 기본 유통기한(shelf_life_days) 및 재고 트랜잭션 만료일(expires_at) 도입
-- 참고: 기존 스키마 파일은 수정하지 않고, 안전한 ALTER/CREATE로 확장
-- =====================================================

-- 1) products: 기본 유통기한 일수 컬럼 추가
ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER;

COMMENT ON COLUMN products.shelf_life_days IS '기본 유통기한(일). NULL이면 유통기한 없음';

-- 2) inventory_transactions: 만료일 컬럼 및 인덱스 추가
ALTER TABLE IF EXISTS inventory_transactions
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_inventory_transactions_expires_at'
  ) THEN
    CREATE INDEX idx_inventory_transactions_expires_at ON inventory_transactions(expires_at);
  END IF;
END $$;

COMMENT ON COLUMN inventory_transactions.expires_at IS '해당 입고분의 유통기한 만료 시각(가장 빠른 배치 기준).';

-- 3) BEFORE INSERT/UPDATE 트리거: 입고(in) 트랜잭션의 expires_at 자동 계산
--    - 기준 시각: reference_type='shipment' 이고 연결된 배송(delivered_at)이 있으면 그 시간, 없으면 NOW()
--    - 일수: 연결된 product.shelf_life_days

CREATE OR REPLACE FUNCTION set_inventory_tx_expires_at()
RETURNS TRIGGER AS $$
DECLARE
  v_store_product_id UUID;
  v_product_id UUID;
  v_shelf_life_days INTEGER;
  v_base_time TIMESTAMPTZ;
  v_delivered_at TIMESTAMPTZ;
BEGIN
  -- 입고 트랜잭션만 대상
  IF (NEW.transaction_type <> 'in') THEN
    RETURN NEW;
  END IF;

  -- 이미 expires_at이 지정된 경우는 유지
  IF NEW.expires_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_store_product_id := NEW.store_product_id;
  IF v_store_product_id IS NULL THEN
    RETURN NEW; -- 방어 코드
  END IF;

  -- 연결된 product의 shelf_life_days 조회
  SELECT p.id, p.shelf_life_days
  INTO v_product_id, v_shelf_life_days
  FROM store_products sp
  JOIN products p ON p.id = sp.product_id
  WHERE sp.id = v_store_product_id;

  -- 유통기한이 없는 제품(NULL)인 경우 계산하지 않음
  IF v_shelf_life_days IS NULL THEN
    RETURN NEW;
  END IF;

  -- 기준 시각 계산
  v_base_time := NOW();
  IF NEW.reference_type = 'shipment' AND NEW.reference_id IS NOT NULL THEN
    SELECT delivered_at INTO v_delivered_at FROM shipments WHERE id = NEW.reference_id;
    IF v_delivered_at IS NOT NULL THEN
      v_base_time := v_delivered_at;
    END IF;
  END IF;

  NEW.expires_at := v_base_time + make_interval(days => v_shelf_life_days);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_inventory_tx_expires_at_ins ON inventory_transactions;
CREATE TRIGGER trg_set_inventory_tx_expires_at_ins
BEFORE INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION set_inventory_tx_expires_at();

DROP TRIGGER IF EXISTS trg_set_inventory_tx_expires_at_upd ON inventory_transactions;
CREATE TRIGGER trg_set_inventory_tx_expires_at_upd
BEFORE UPDATE ON inventory_transactions
FOR EACH ROW
WHEN (NEW.transaction_type = 'in' AND NEW.expires_at IS NULL)
EXECUTE FUNCTION set_inventory_tx_expires_at();

-- 4) 배송 상태가 delivered로 바뀔 때, 관련 입고 트랜잭션의 expires_at 보정
--    (입고 트랜잭션이 선 생성되어 expires_at이 비어있는 경우에 대비)

CREATE OR REPLACE FUNCTION backfill_expires_at_on_shipment_delivered()
RETURNS TRIGGER AS $$
DECLARE
  v_shelf_life_days INTEGER;
  v_sp_id UUID;
BEGIN
  IF NEW.status <> 'delivered' THEN
    RETURN NEW;
  END IF;

  -- reference_type='shipment' & 해당 shipment를 참조하는 입고 트랜잭션에 대해 계산
  -- store_product_id별로 product.shelf_life_days를 적용
  UPDATE inventory_transactions it
  SET expires_at = (
    CASE 
      WHEN p.shelf_life_days IS NULL THEN NULL
      ELSE COALESCE(NEW.delivered_at, NOW()) + make_interval(days => p.shelf_life_days)
    END
  )
  FROM store_products sp
  JOIN products p ON p.id = sp.product_id
  WHERE it.reference_type = 'shipment'
    AND it.reference_id = NEW.id
    AND it.store_product_id = sp.id
    AND it.transaction_type = 'in'
    AND it.expires_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_backfill_expires_at_on_shipment_delivered ON shipments;
CREATE TRIGGER trg_backfill_expires_at_on_shipment_delivered
AFTER UPDATE OF status ON shipments
FOR EACH ROW
EXECUTE FUNCTION backfill_expires_at_on_shipment_delivered();

-- 5) 샘플 데이터 업데이트: 제품별 기본 유통기한 설정 (존재하는 경우에만 업데이트됨)
--    비치명적으로 동작: 이름 매칭 실패시 영향 없음

-- 180일 카테고리
UPDATE products SET shelf_life_days = 180 WHERE name IN (
  '농심 새우깡 90g','농심 양파링 50g','농심 포테토칩 오리지널 60g','해태 허니버터칩 60g','오리온 초코파이 360g',
  '롯데 빼빼로 오리지널 47g','크라운산도 오리지널 80g','오리온 꼬깔콘 초코첵스 77g','삼양 불닭볶음면 140g',
  '농심 신라면 120g','농심 짜파게티 140g','오뚜기 진라면 매운맛 120g','오뚜기 진라면 순한맛 120g',
  '농심 너구리 120g','농심 안성탕면 125g','팔도 비빔면 130g','농심 육개장사발면 86g','농심 새우탕면 75g',
  '오뚜기 컵밥 김치볶음밥','오뚜기 컵밥 제육덮밥','스타벅스 아메리카노 RTD','TOP 아메리카노 275ml'
);

-- 14일
UPDATE products SET shelf_life_days = 14 WHERE name IN ('빙그레 딸기맛우유 240ml','빙그레 바나나맛우유 240ml');

-- 11~15일
UPDATE products SET shelf_life_days = 11 WHERE name IN ('서울우유 1000ml');
UPDATE products SET shelf_life_days = 15 WHERE name IN ('매일우유 고칼슘 1000ml');

-- 30일
UPDATE products SET shelf_life_days = 30 WHERE name IN ('남양 GT 요구르트 65ml');

-- 270~365일
UPDATE products SET shelf_life_days = 270 WHERE name IN ('립톤 아이스티 레몬');
UPDATE products SET shelf_life_days = 365 WHERE name IN (
  '컨트리타임 아이스티','코카콜라 500ml','코카콜라 350ml','펩시콜라 500ml','칠성사이다 500ml','환타 오렌지 500ml',
  '마운틴듀 500ml','스프라이트 500ml'
);

-- 540일
UPDATE products SET shelf_life_days = 540 WHERE name IN ('맥심 오리지널 커피믹스');

-- 유통기한 없음 (NULL 유지)
-- 'X' 표시된 품목들은 별도 설정하지 않음

-- 6) 권장 방침: 만료/임박 자동 알림 등을 위한 추가 인덱스 (옵션)
-- 이미 expires_at 인덱스를 생성하였으므로 여기서는 생략

-- 끝


