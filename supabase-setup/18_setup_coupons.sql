-- =====================================================
-- 18. 쿠폰 시스템 전체 설정 (테이블, 데이터, 로직 통합)
-- =====================================================

-- 쿠폰 마스터 테이블
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_amount INTEGER DEFAULT 0 CHECK (min_amount >= 0),
  max_discount INTEGER NULL CHECK (max_discount > 0),
  is_membership_only BOOLEAN DEFAULT FALSE,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER NULL CHECK (usage_limit IS NULL OR usage_limit > 0),
  usage_limit_per_user INTEGER DEFAULT 1 CHECK (usage_limit_per_user > 0),
  current_usage_count INTEGER DEFAULT 0 CHECK (current_usage_count >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT coupon_dates_check CHECK (valid_until IS NULL OR valid_until > valid_from),
  CONSTRAINT coupon_usage_check CHECK (usage_limit IS NULL OR current_usage_count <= usage_limit)
);

-- 사용자 쿠폰 보유 테이블
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT user_coupon_usage_check CHECK (
    (is_used = FALSE AND used_at IS NULL AND order_id IS NULL) OR
    (is_used = TRUE AND used_at IS NOT NULL)
  )
);

-- orders 테이블에 쿠폰 관련 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'applied_coupon_id') THEN
    ALTER TABLE orders ADD COLUMN applied_coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'coupon_discount') THEN
    ALTER TABLE orders ADD COLUMN coupon_discount INTEGER DEFAULT 0 CHECK (coupon_discount >= 0);
  END IF;
END $$;

-- 쿠폰 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupons_membership ON coupons(is_membership_only);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_period ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_user_coupons_customer_id ON user_coupons(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon_id ON user_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_unused ON user_coupons(customer_id, is_used) WHERE is_used = FALSE;
CREATE INDEX IF NOT EXISTS idx_orders_applied_coupon_id ON orders(applied_coupon_id);

-- 쿠폰 시스템 RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view own coupons" ON user_coupons
  FOR SELECT USING (auth.uid() = customer_id);

-- 쿠폰 사용 횟수 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_used = TRUE AND OLD.is_used = FALSE THEN
    UPDATE coupons 
    SET current_usage_count = current_usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.coupon_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 쿠폰 사용 트리거
DROP TRIGGER IF EXISTS trigger_update_coupon_usage ON user_coupons;
CREATE TRIGGER trigger_update_coupon_usage
  AFTER UPDATE ON user_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_usage_count();

-- 기본 쿠폰들 생성 (ON CONFLICT로 중복 방지)
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_amount, is_membership_only, valid_until)
VALUES 
  ('WELCOME10', '신규 회원 10% 할인', '1만원 이상 주문 시', 'percentage', 0.10, 10000, FALSE, NOW() + INTERVAL '1 year'),
  ('FREEDELIVERY', '무료배송 쿠폰', '배송비 3,000원 할인', 'fixed', 3000, 0, FALSE, NOW() + INTERVAL '1 year'),
  ('FIRSTORDER5000', '첫 주문 5천원 할인', '2만원 이상 주문 시', 'fixed', 5000, 20000, FALSE, NOW() + INTERVAL '1 year'),
  ('MEMBER_WEEKLY', '멤버십 주간 쿠폰', '멤버십 회원 전용 15% 할인', 'percentage', 0.15, 5000, TRUE, NOW() + INTERVAL '1 week'),
  ('MEMBER_SPECIAL', '멤버십 특별 쿠폰', '멤버십 회원 전용 7,000원 할인', 'fixed', 7000, 30000, TRUE, NOW() + INTERVAL '1 month')
ON CONFLICT (code) DO NOTHING;

-- 완료 메시지
SELECT 'Coupon system setup completed successfully!' as status;