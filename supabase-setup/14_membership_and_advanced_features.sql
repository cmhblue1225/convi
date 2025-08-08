-- =====================================================
-- 14. 멤버십 구독 및 고급 결제 기능 (포인트, 쿠폰, 구독)
-- =====================================================
-- 작성일: 2025-01-08
-- 설명: 포인트 시스템, 쿠폰 시스템, 멤버십 구독 서비스를 위한 테이블 및 기능

-- =====================================================
-- 1. 포인트 시스템
-- =====================================================

-- 사용자 포인트 테이블
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  available_points INTEGER DEFAULT 0 CHECK (available_points >= 0),
  total_earned INTEGER DEFAULT 0 CHECK (total_earned >= 0),
  total_used INTEGER DEFAULT 0 CHECK (total_used >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_points_balance_check CHECK (available_points = total_earned - total_used)
);

-- 포인트 거래 내역 테이블
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'use', 'expire', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT point_amount_check CHECK (
    (type IN ('earn', 'refund', 'bonus') AND amount > 0) OR
    (type IN ('use', 'expire') AND amount < 0)
  )
);

-- =====================================================
-- 2. 쿠폰 시스템
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
  max_discount INTEGER NULL CHECK (max_discount IS NULL OR max_discount > 0),
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

-- =====================================================
-- 3. 멤버십 구독 시스템
-- =====================================================

-- 구독 플랜 테이블
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price > 0), -- 월 구독료 (원)
  billing_period VARCHAR(20) DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  benefits JSONB DEFAULT '[]'::jsonb, -- 혜택 정보 JSON 배열
  monthly_shipping_tokens INTEGER DEFAULT 0 CHECK (monthly_shipping_tokens >= 0),
  point_multiplier DECIMAL(3,2) DEFAULT 1.0 CHECK (point_multiplier >= 1.0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 구독 테이블
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused', 'expired', 'pending')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  billing_customer_key VARCHAR(100), -- 토스페이먼츠 고객키
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT subscription_period_check CHECK (current_period_end > current_period_start),
  CONSTRAINT subscription_cancel_check CHECK (
    (status != 'cancelled' AND cancelled_at IS NULL) OR
    (status = 'cancelled' AND cancelled_at IS NOT NULL)
  ),
  
  -- 사용자당 하나의 활성 구독만 허용
  
);

-- 구독 결제 내역 테이블
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  payment_key VARCHAR(200), -- 토스페이먼츠 결제키
  order_id VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status VARCHAR(30) NOT NULL DEFAULT 'ready' CHECK (status IN (
    'ready', 'in_progress', 'waiting_for_deposit', 'done', 
    'canceled', 'partial_canceled', 'aborted', 'expired'
  )),
  payment_method VARCHAR(20),
  paid_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT payment_status_check CHECK (
    (status = 'done' AND paid_at IS NOT NULL) OR
    (status != 'done' AND paid_at IS NULL)
  )
);

-- =====================================================
-- 4. 무료배송 토큰 시스템
-- =====================================================

-- 사용자 무료배송 토큰 테이블
CREATE TABLE IF NOT EXISTS user_shipping_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token_count INTEGER DEFAULT 0 CHECK (token_count >= 0),
  monthly_tokens INTEGER DEFAULT 0 CHECK (monthly_tokens >= 0),
  last_token_issued_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id)
);

-- 배송비 토큰 사용 내역 테이블
CREATE TABLE IF NOT EXISTS shipping_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  tokens_used INTEGER DEFAULT 1 CHECK (tokens_used > 0),
  saved_amount INTEGER NOT NULL CHECK (saved_amount > 0), -- 절약한 배송비
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. 기존 테이블 확장
-- =====================================================

-- orders 테이블에 고급 결제 기능 컬럼 추가
DO $$ 
BEGIN
  -- 포인트 관련 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'applied_points') THEN
    ALTER TABLE orders ADD COLUMN applied_points INTEGER DEFAULT 0 CHECK (applied_points >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'point_discount') THEN
    ALTER TABLE orders ADD COLUMN point_discount INTEGER DEFAULT 0 CHECK (point_discount >= 0);
  END IF;
  
  -- 쿠폰 관련 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'applied_coupon_id') THEN
    ALTER TABLE orders ADD COLUMN applied_coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'coupon_discount') THEN
    ALTER TABLE orders ADD COLUMN coupon_discount INTEGER DEFAULT 0 CHECK (coupon_discount >= 0);
  END IF;
  
  -- 배송 토큰 관련 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_tokens_used') THEN
    ALTER TABLE orders ADD COLUMN shipping_tokens_used INTEGER DEFAULT 0 CHECK (shipping_tokens_used >= 0);
  END IF;
  
  -- 멤버십 관련 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'is_membership_order') THEN
    ALTER TABLE orders ADD COLUMN is_membership_order BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- 할인 검증 제약조건
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'orders' AND constraint_name = 'orders_discount_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_discount_check CHECK (
      point_discount + coupon_discount <= subtotal + tax_amount + delivery_fee
    );
  END IF;
END $$;

-- =====================================================
-- 6. 인덱스 생성
-- =====================================================

-- 포인트 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_user_points_customer_id ON user_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_customer_id ON point_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_order_id ON point_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- 쿠폰 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupons_membership ON coupons(is_membership_only);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_period ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_user_coupons_customer_id ON user_coupons(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon_id ON user_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_unused ON user_coupons(customer_id, is_used) WHERE is_used = FALSE;

-- 구독 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_customer_id ON user_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_billing_date ON user_subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);

-- 사용자당 하나의 활성 구독만 허용 (부분 유니크 인덱스)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_active_unique ON user_subscriptions (customer_id) WHERE status = 'active';

-- 배송 토큰 인덱스
CREATE INDEX IF NOT EXISTS idx_user_shipping_tokens_customer_id ON user_shipping_tokens(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipping_token_usage_customer_id ON shipping_token_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipping_token_usage_order_id ON shipping_token_usage(order_id);

-- 주문 테이블 확장 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_applied_coupon_id ON orders(applied_coupon_id);
CREATE INDEX IF NOT EXISTS idx_orders_membership ON orders(is_membership_order) WHERE is_membership_order = TRUE;

-- =====================================================
-- 7. RLS (Row Level Security) 정책
-- =====================================================

-- 포인트 시스템 RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can view own point transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = customer_id);

-- 쿠폰 시스템 RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view own coupons" ON user_coupons
  FOR SELECT USING (auth.uid() = customer_id);

-- 구독 시스템 RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can view own subscription payments" ON subscription_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions 
      WHERE user_subscriptions.id = subscription_payments.subscription_id 
      AND user_subscriptions.customer_id = auth.uid()
    )
  );

-- 배송 토큰 RLS
ALTER TABLE user_shipping_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shipping tokens" ON user_shipping_tokens
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can view own token usage" ON shipping_token_usage
  FOR SELECT USING (auth.uid() = customer_id);

-- =====================================================
-- 8. 트리거 함수들
-- =====================================================

-- 포인트 잔액 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_user_points_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- 포인트 거래 발생 시 사용자 포인트 잔액 업데이트
  INSERT INTO user_points (customer_id, available_points, total_earned, total_used)
  VALUES (NEW.customer_id, 0, 0, 0)
  ON CONFLICT (customer_id) DO NOTHING;
  
  UPDATE user_points 
  SET 
    total_earned = CASE 
      WHEN NEW.amount > 0 THEN total_earned + NEW.amount 
      ELSE total_earned 
    END,
    total_used = CASE 
      WHEN NEW.amount < 0 THEN total_used + ABS(NEW.amount) 
      ELSE total_used 
    END,
    available_points = total_earned - total_used,
    updated_at = NOW()
  WHERE customer_id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 포인트 거래 트리거
DROP TRIGGER IF EXISTS trigger_update_points_balance ON point_transactions;
CREATE TRIGGER trigger_update_points_balance
  AFTER INSERT ON point_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points_balance();

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

-- 월별 배송 토큰 지급 함수
CREATE OR REPLACE FUNCTION issue_monthly_shipping_tokens()
RETURNS void AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- 활성 구독자들에게 월별 토큰 지급
  FOR subscription_record IN 
    SELECT us.customer_id, sp.monthly_shipping_tokens
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.status = 'active'
  LOOP
    INSERT INTO user_shipping_tokens (customer_id, token_count, monthly_tokens, last_token_issued_at)
    VALUES (
      subscription_record.customer_id, 
      subscription_record.monthly_shipping_tokens,
      subscription_record.monthly_shipping_tokens,
      NOW()
    )
    ON CONFLICT (customer_id) DO UPDATE SET
      token_count = user_shipping_tokens.token_count + subscription_record.monthly_shipping_tokens,
      monthly_tokens = subscription_record.monthly_shipping_tokens,
      last_token_issued_at = NOW(),
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. 기본 데이터 삽입
-- =====================================================

-- 기본 구독 플랜 생성
INSERT INTO subscription_plans (id, name, description, price, benefits, monthly_shipping_tokens, point_multiplier)
VALUES (
  'premium-monthly',
  '프리미엄 멤버십',
  '편의점 쇼핑의 모든 혜택을 누리세요',
  4990,
  '["멤버십 전용 할인 쿠폰 매주 지급", "월 5회 무료배송 토큰 제공", "신상품 우선 알림", "포인트 2배 적립"]'::jsonb,
  5,
  2.0
) ON CONFLICT (id) DO NOTHING;

-- 기본 쿠폰들 생성
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_amount, is_membership_only, valid_until)
VALUES 
  ('WELCOME10', '신규 회원 10% 할인', '1만원 이상 주문 시 10% 할인', 'percentage', 0.10, 10000, FALSE, NOW() + INTERVAL '1 year'),
  ('FREEDELIVERY', '무료배송 쿠폰', '배송비 3,000원 할인', 'fixed', 3000, 0, FALSE, NOW() + INTERVAL '1 year'),
  ('FIRSTORDER5000', '첫 주문 5천원 할인', '2만원 이상 주문 시 5,000원 할인', 'fixed', 5000, 20000, FALSE, NOW() + INTERVAL '1 year'),
  ('MEMBER_WEEKLY', '멤버십 주간 쿠폰', '멤버십 회원 전용 15% 할인', 'percentage', 0.15, 5000, TRUE, NOW() + INTERVAL '1 week'),
  ('MEMBER_SPECIAL', '멤버십 특별 쿠폰', '멤버십 회원 전용 7,000원 할인', 'fixed', 7000, 30000, TRUE, NOW() + INTERVAL '1 month')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 10. 유용한 뷰 생성
-- =====================================================

-- 사용자 멤버십 상태 뷰
CREATE OR REPLACE VIEW user_membership_status AS
SELECT 
  u.id as customer_id,
  u.email,
  COALESCE(us.status, 'free') as membership_status,
  sp.name as plan_name,
  sp.price as monthly_price,
  us.current_period_start,
  us.current_period_end,
  us.next_billing_date,
  COALESCE(ust.token_count, 0) as shipping_tokens,
  COALESCE(up.available_points, 0) as available_points
FROM auth.users u
LEFT JOIN user_subscriptions us ON u.id = us.customer_id AND us.status = 'active'
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN user_shipping_tokens ust ON u.id = ust.customer_id
LEFT JOIN user_points up ON u.id = up.customer_id;

-- 쿠폰 사용 통계 뷰
CREATE OR REPLACE VIEW coupon_usage_stats AS
SELECT 
  c.id,
  c.code,
  c.name,
  c.current_usage_count,
  c.usage_limit,
  COUNT(uc.id) as total_issued,
  COUNT(CASE WHEN uc.is_used THEN 1 END) as total_used,
  ROUND(
    CASE 
      WHEN COUNT(uc.id) > 0 
      THEN (COUNT(CASE WHEN uc.is_used THEN 1 END)::DECIMAL / COUNT(uc.id)) * 100 
      ELSE 0 
    END, 2
  ) as usage_rate_percent
FROM coupons c
LEFT JOIN user_coupons uc ON c.id = uc.coupon_id
GROUP BY c.id, c.code, c.name, c.current_usage_count, c.usage_limit;

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 멤버십 구독 및 고급 결제 기능 설정이 완료되었습니다!';
  RAISE NOTICE '📊 생성된 테이블:';
  RAISE NOTICE '   - user_points (포인트 잔액)';
  RAISE NOTICE '   - point_transactions (포인트 거래내역)';
  RAISE NOTICE '   - coupons (쿠폰 마스터)';
  RAISE NOTICE '   - user_coupons (사용자 쿠폰)';
  RAISE NOTICE '   - subscription_plans (구독 플랜)';
  RAISE NOTICE '   - user_subscriptions (사용자 구독)';
  RAISE NOTICE '   - subscription_payments (구독 결제내역)';
  RAISE NOTICE '   - user_shipping_tokens (무료배송 토큰)';
  RAISE NOTICE '   - shipping_token_usage (토큰 사용내역)';
  RAISE NOTICE '🎯 기본 데이터: 프리미엄 멤버십 플랜 및 기본 쿠폰 생성됨';
  RAISE NOTICE '🔒 RLS 정책: 모든 테이블에 보안 정책 적용됨';
  RAISE NOTICE '⚡ 트리거: 포인트 잔액 자동 업데이트, 쿠폰 사용 횟수 관리';
  RAISE NOTICE '📈 뷰: user_membership_status, coupon_usage_stats 생성됨';
END $$;