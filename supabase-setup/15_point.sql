-- 포인트 시스템 추가를 위한 SQL 스크립트

-- 1. profiles 테이블에 포인트 관련 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN points INTEGER DEFAULT 0 CHECK (points >= 0),
ADD COLUMN loyalty_tier TEXT DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
ADD COLUMN total_earned_points INTEGER DEFAULT 0 CHECK (total_earned_points >= 0),
ADD COLUMN points_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. 포인트 거래 내역 테이블 생성
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'expire', 'bonus', 'refund')),
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  
  -- 거래 관련 정보
  reference_type TEXT, -- 'order', 'review', 'signup', 'event' 등
  reference_id UUID,
  description TEXT NOT NULL,
  
  -- 만료 관련 (적립 포인트의 경우)
  expires_at TIMESTAMPTZ,
  is_expired BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 포인트 거래 내역 인덱스 생성
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);
CREATE INDEX idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX idx_point_transactions_expires_at ON point_transactions(expires_at) WHERE expires_at IS NOT NULL;

-- 4. 멤버십 등급 설정 테이블 생성
CREATE TABLE loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT UNIQUE NOT NULL,
  min_points INTEGER NOT NULL CHECK (min_points >= 0),
  max_points INTEGER CHECK (max_points > min_points OR max_points IS NULL),
  benefits JSONB DEFAULT '{}',
  point_earn_rate DECIMAL(3,2) DEFAULT 1.00 CHECK (point_earn_rate >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 기본 멤버십 등급 데이터 삽입
INSERT INTO loyalty_tiers (tier_name, min_points, max_points, benefits, point_earn_rate) VALUES
('Bronze', 0, 4999, '{"description": "기본 등급", "benefits": ["기본 포인트 적립"]}', 1.00),
('Silver', 5000, 14999, '{"description": "실버 등급", "benefits": ["1.2배 포인트 적립", "생일 쿠폰"]}', 1.20),
('Gold', 15000, 29999, '{"description": "골드 등급", "benefits": ["1.5배 포인트 적립", "무료배송", "우선 고객지원"]}', 1.50),
('Platinum', 30000, 49999, '{"description": "플래티넘 등급", "benefits": ["2배 포인트 적립", "무료배송", "전용 할인쿠폰"]}', 2.00),
('Diamond', 50000, NULL, '{"description": "다이아몬드 등급", "benefits": ["3배 포인트 적립", "무료배송", "VIP 혜택"]}', 3.00);

-- 6. 포인트 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type TEXT,
  p_description TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  current_points INTEGER;
  new_balance INTEGER;
  expires_date TIMESTAMPTZ;
BEGIN
  -- 현재 포인트 조회
  SELECT points INTO current_points FROM profiles WHERE id = p_user_id;
  
  IF current_points IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- 새로운 잔액 계산
  new_balance := current_points + p_points;
  
  -- 잔액이 음수가 되는지 확인 (포인트 사용 시)
  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- 적립 포인트의 경우 1년 후 만료
  IF p_transaction_type = 'earn' THEN
    expires_date := NOW() + INTERVAL '1 year';
  END IF;
  
  -- 포인트 거래 내역 삽입
  INSERT INTO point_transactions (
    user_id, transaction_type, points, balance_after, 
    reference_type, reference_id, description, expires_at
  ) VALUES (
    p_user_id, p_transaction_type, p_points, new_balance,
    p_reference_type, p_reference_id, p_description, expires_date
  );
  
  -- 프로필 테이블 업데이트
  UPDATE profiles 
  SET 
    points = new_balance,
    total_earned_points = CASE 
      WHEN p_transaction_type = 'earn' THEN total_earned_points + p_points
      ELSE total_earned_points
    END,
    points_updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. 멤버십 등급 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_loyalty_tier(p_user_id UUID) RETURNS TEXT AS $$
DECLARE
  user_total_points INTEGER;
  new_tier TEXT;
BEGIN
  -- 사용자의 총 적립 포인트 조회
  SELECT total_earned_points INTO user_total_points 
  FROM profiles WHERE id = p_user_id;
  
  -- 해당하는 등급 찾기
  SELECT tier_name INTO new_tier
  FROM loyalty_tiers
  WHERE user_total_points >= min_points 
    AND (max_points IS NULL OR user_total_points <= max_points)
  ORDER BY min_points DESC
  LIMIT 1;
  
  -- 등급 업데이트
  UPDATE profiles 
  SET loyalty_tier = new_tier
  WHERE id = p_user_id;
  
  RETURN new_tier;
END;
$$ LANGUAGE plpgsql;

-- 8. 포인트 거래 후 등급 자동 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION trigger_update_loyalty_tier() RETURNS TRIGGER AS $$
BEGIN
  -- 포인트 적립 시에만 등급 업데이트
  IF NEW.transaction_type = 'earn' THEN
    PERFORM update_loyalty_tier(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_point_transaction
  AFTER INSERT ON point_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_loyalty_tier();

-- 9. 만료된 포인트 처리 함수 생성
CREATE OR REPLACE FUNCTION expire_old_points() RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  rec RECORD;
BEGIN
  -- 만료된 포인트 찾기
  FOR rec IN 
    SELECT user_id, SUM(points) as expired_points
    FROM point_transactions 
    WHERE transaction_type = 'earn' 
      AND expires_at < NOW() 
      AND NOT is_expired
    GROUP BY user_id
  LOOP
    -- 만료 처리
    UPDATE point_transactions 
    SET is_expired = true 
    WHERE user_id = rec.user_id 
      AND transaction_type = 'earn' 
      AND expires_at < NOW() 
      AND NOT is_expired;
    
    -- 만료 포인트 차감 거래 생성
    PERFORM update_user_points(
      rec.user_id, 
      -rec.expired_points, 
      'expire', 
      '포인트 만료',
      'system',
      NULL
    );
    
    expired_count := expired_count + 1;
  END LOOP;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 10. RLS 정책 추가
-- 포인트 거래 내역은 본인만 조회 가능
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own point transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert point transactions" ON point_transactions
  FOR INSERT WITH CHECK (true);

-- 멤버십 등급 정보는 모든 사용자가 조회 가능
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loyalty tiers" ON loyalty_tiers
  FOR SELECT USING (true);

-- 11. 기존 사용자들에게 기본 포인트 설정 (선택사항)
UPDATE profiles 
SET 
  points = 0,
  loyalty_tier = 'Bronze',
  total_earned_points = 0,
  points_updated_at = NOW()
WHERE points IS NULL;

-- 12. 샘플 포인트 거래 데이터 생성 (테스트용)
-- 고객 사용자에게만 포인트 지급
DO $$
DECLARE
  customer_id UUID;
BEGIN
  -- 고객 역할의 사용자 찾기
  FOR customer_id IN 
    SELECT id FROM profiles WHERE role = 'customer' LIMIT 5
  LOOP
    -- 가입 축하 포인트 지급
    PERFORM update_user_points(
      customer_id,
      1000,
      'earn',
      '가입 축하 포인트',
      'signup',
      customer_id
    );
    
    -- 주문 적립 포인트 (예시)
    PERFORM update_user_points(
      customer_id,
      150,
      'earn',
      '주문 적립 포인트',
      'order',
      gen_random_uuid()
    );
    
    -- 리뷰 작성 포인트 (예시)
    PERFORM update_user_points(
      customer_id,
      100,
      'earn',
      '리뷰 작성 포인트',
      'review',
      gen_random_uuid()
    );
  END LOOP;
END $$;

-- 완료 메시지
SELECT 'Point system setup completed successfully!' as status;