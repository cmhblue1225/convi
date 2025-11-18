-- =====================================================
-- add.sql
-- CustomerProfile.tsx 지원을 위한 추가 테이블 및 함수
-- =====================================================

-- =====================================================
-- 0. 유틸리티 함수 생성
-- =====================================================

-- updated_at 컬럼 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 1. profiles 테이블 수정 (포인트 관련 컬럼 추가)
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'Bronze';

-- =====================================================
-- 2. 추가 테이블 생성
-- =====================================================

-- 찜 목록 테이블
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    store_id UUID,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT wishlists_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    UNIQUE(user_id, product_id, store_id)
);

-- 사용자 배송지 테이블
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    detail_address TEXT,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- 쿠폰 마스터 테이블
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자별 쿠폰 보유 테이블
CREATE TABLE IF NOT EXISTS user_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    coupon_id UUID NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    used_order_id UUID,
    is_used BOOLEAN DEFAULT false,
    CONSTRAINT user_coupons_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT user_coupons_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    CONSTRAINT user_coupons_used_order_id_fkey FOREIGN KEY (used_order_id) REFERENCES orders(id)
);

-- 결제수단 테이블
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('card', 'bank', 'digital')),
    name TEXT NOT NULL,
    last_digits TEXT,
    provider TEXT,
    token TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- 포인트 거래내역 테이블
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'expire', 'bonus', 'refund')),
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT point_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- 멤버십 등급 테이블
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name TEXT NOT NULL UNIQUE,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    point_earn_rate NUMERIC DEFAULT 1.0,
    benefits JSONB DEFAULT '{}'::jsonb,
    tier_color TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 리뷰 테이블
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    order_id UUID NOT NULL,
    product_id UUID,
    store_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    images TEXT[],
    is_anonymous BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT user_reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT user_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT user_reviews_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id),
    UNIQUE(user_id, order_id, product_id)
);

-- 사용자 설정 테이블
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    UNIQUE(user_id, setting_key)
);

-- =====================================================
-- 3. 뷰 생성 (구매/이용 내역 지원)
-- =====================================================

-- 자주 주문한 상품 뷰
CREATE OR REPLACE VIEW frequent_orders AS
SELECT 
    o.customer_id as user_id,
    oi.product_id,
    p.name as product_name,
    p.image_urls,
    COUNT(*) as order_count,
    MAX(o.created_at) as last_order_date,
    AVG(oi.unit_price) as avg_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'completed'
GROUP BY o.customer_id, oi.product_id, p.name, p.image_urls
HAVING COUNT(*) >= 2
ORDER BY order_count DESC;

-- 월별 통계 뷰
CREATE OR REPLACE VIEW monthly_order_stats AS
SELECT 
    customer_id,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_order_amount,
    SUM(CASE WHEN status = 'completed' THEN total_amount * 0.01 ELSE 0 END) as earned_points,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM orders
WHERE status IN ('completed', 'ready', 'preparing', 'cancelled')
GROUP BY customer_id, DATE_TRUNC('month', created_at);

-- 주문 차트 데이터 뷰
CREATE OR REPLACE VIEW order_chart_data AS
SELECT 
    customer_id,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as order_count,
    SUM(total_amount) as total_amount
FROM orders
WHERE created_at >= NOW() - INTERVAL '6 months'
    AND status IN ('completed', 'ready', 'preparing')
GROUP BY customer_id, DATE_TRUNC('month', created_at)
ORDER BY month;

-- =====================================================
-- 4. 인덱스 생성
-- =====================================================

-- wishlists 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- user_addresses 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(is_default);

-- coupons 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);

-- user_coupons 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_is_used ON user_coupons(is_used);

-- payment_methods 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

-- point_transactions 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at);

-- loyalty_tiers 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_display_order ON loyalty_tiers(display_order);

-- user_reviews 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_store_id ON user_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_product_id ON user_reviews(product_id);

-- user_settings 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- =====================================================
-- 5. 함수 생성
-- =====================================================

-- 포인트 업데이트 함수
CREATE OR REPLACE FUNCTION update_user_points(
    p_user_id UUID,
    p_points INTEGER,
    p_transaction_type TEXT,
    p_description TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_points INTEGER;
    new_balance INTEGER;
BEGIN
    -- 현재 포인트 조회
    SELECT points INTO current_points FROM profiles WHERE id = p_user_id;
    
    IF current_points IS NULL THEN
        RAISE EXCEPTION '사용자를 찾을 수 없습니다: %', p_user_id;
    END IF;
    
    -- 새로운 잔액 계산
    new_balance := current_points + p_points;
    
    -- 포인트가 음수가 되지 않도록 체크
    IF new_balance < 0 THEN
        RAISE EXCEPTION '포인트가 부족합니다. 현재: %, 요청: %', current_points, p_points;
    END IF;
    
    -- 프로필 테이블 업데이트
    UPDATE profiles 
    SET points = new_balance,
        total_earned_points = CASE 
            WHEN p_transaction_type = 'earn' THEN total_earned_points + p_points
            ELSE total_earned_points
        END,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- 포인트 거래 내역 기록
    INSERT INTO point_transactions (
        user_id,
        transaction_type,
        points,
        balance_after,
        description,
        reference_type,
        reference_id
    ) VALUES (
        p_user_id,
        p_transaction_type,
        p_points,
        new_balance,
        p_description,
        p_reference_type,
        p_reference_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 멤버십 등급 업데이트 함수
CREATE OR REPLACE FUNCTION update_loyalty_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_total_points INTEGER;
    new_tier TEXT;
BEGIN
    -- 사용자의 총 적립 포인트 조회
    SELECT total_earned_points INTO user_total_points 
    FROM profiles WHERE id = p_user_id;
    
    -- 적절한 등급 찾기
    SELECT tier_name INTO new_tier
    FROM loyalty_tiers
    WHERE user_total_points >= min_points 
        AND (max_points IS NULL OR user_total_points <= max_points)
        AND is_active = true
    ORDER BY min_points DESC
    LIMIT 1;
    
    -- 등급이 없으면 기본 등급 설정
    IF new_tier IS NULL THEN
        new_tier := 'Bronze';
    END IF;
    
    -- 프로필 업데이트
    UPDATE profiles 
    SET loyalty_tier = new_tier,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN new_tier;
END;
$$ LANGUAGE plpgsql;

-- 쿠폰 사용 함수
CREATE OR REPLACE FUNCTION use_coupon(
    p_user_coupon_id UUID,
    p_order_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    coupon_record RECORD;
BEGIN
    -- 쿠폰 정보 조회
    SELECT uc.*, c.expires_at, c.min_order_amount, c.discount_type, c.discount_value
    INTO coupon_record
    FROM user_coupons uc
    JOIN coupons c ON uc.coupon_id = c.id
    WHERE uc.id = p_user_coupon_id AND uc.is_used = false;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION '사용 가능한 쿠폰을 찾을 수 없습니다.';
    END IF;
    
    -- 만료일 체크
    IF coupon_record.expires_at < NOW() THEN
        RAISE EXCEPTION '만료된 쿠폰입니다.';
    END IF;
    
    -- 쿠폰 사용 처리
    UPDATE user_coupons 
    SET is_used = true,
        used_at = NOW(),
        used_order_id = p_order_id
    WHERE id = p_user_coupon_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 자주 주문한 상품 조회 함수
CREATE OR REPLACE FUNCTION get_frequent_orders(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_image TEXT,
    order_count BIGINT,
    last_order_date TIMESTAMP WITH TIME ZONE,
    avg_price NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fo.product_id,
        fo.product_name,
        CASE 
            WHEN fo.image_urls IS NOT NULL AND array_length(fo.image_urls, 1) > 0 
            THEN fo.image_urls[1] 
            ELSE NULL 
        END as product_image,
        fo.order_count,
        fo.last_order_date,
        fo.avg_price
    FROM frequent_orders fo
    WHERE fo.user_id = p_user_id
    ORDER BY fo.order_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 월별 통계 조회 함수
CREATE OR REPLACE FUNCTION get_monthly_stats(p_user_id UUID, p_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_orders BIGINT,
    total_amount NUMERIC,
    avg_order_amount NUMERIC,
    earned_points NUMERIC,
    completed_orders BIGINT,
    cancelled_orders BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mos.total_orders,
        mos.total_amount,
        mos.avg_order_amount,
        mos.earned_points,
        mos.completed_orders,
        mos.cancelled_orders
    FROM monthly_order_stats mos
    WHERE mos.customer_id = p_user_id 
        AND mos.month = DATE_TRUNC('month', p_month);
END;
$$ LANGUAGE plpgsql;

-- 주문 차트 데이터 조회 함수
CREATE OR REPLACE FUNCTION get_order_chart_data(p_user_id UUID, p_months INTEGER DEFAULT 6)
RETURNS TABLE (
    month_name TEXT,
    order_count BIGINT,
    total_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH month_series AS (
        SELECT generate_series(
            DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * (p_months - 1),
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
        ) as month
    )
    SELECT 
        TO_CHAR(ms.month, 'MM월') as month_name,
        COALESCE(ocd.order_count, 0) as order_count,
        COALESCE(ocd.total_amount, 0) as total_amount
    FROM month_series ms
    LEFT JOIN order_chart_data ocd ON ocd.month = ms.month AND ocd.customer_id = p_user_id
    ORDER BY ms.month;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. 트리거 생성
-- =====================================================

-- updated_at 자동 업데이트 트리거들
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at 
    BEFORE UPDATE ON user_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON coupons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loyalty_tiers_updated_at ON loyalty_tiers;
CREATE TRIGGER update_loyalty_tiers_updated_at 
    BEFORE UPDATE ON loyalty_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_reviews_updated_at ON user_reviews;
CREATE TRIGGER update_user_reviews_updated_at 
    BEFORE UPDATE ON user_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 포인트 적립 시 등급 업데이트 트리거
CREATE OR REPLACE FUNCTION trigger_update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- 포인트가 증가했을 때만 등급 체크
    IF NEW.total_earned_points > OLD.total_earned_points THEN
        PERFORM update_loyalty_tier(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_loyalty_tier_on_points_change ON profiles;
CREATE TRIGGER update_loyalty_tier_on_points_change
    AFTER UPDATE OF total_earned_points ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_update_loyalty_tier();

-- =====================================================
-- 7. 초기 데이터 삽입
-- =====================================================

-- 기본 멤버십 등급 데이터
INSERT INTO loyalty_tiers (tier_name, min_points, max_points, point_earn_rate, benefits, tier_color, display_order) 
VALUES
('Bronze', 0, 999, 1.0, '{"description": "기본 등급", "benefits": ["기본 포인트 적립"]}', '#CD7F32', 1),
('Silver', 1000, 4999, 1.2, '{"description": "실버 등급", "benefits": ["1.2배 포인트 적립", "생일 쿠폰"]}', '#C0C0C0', 2),
('Gold', 5000, 19999, 1.5, '{"description": "골드 등급", "benefits": ["1.5배 포인트 적립", "무료 배송", "우선 고객센터"]}', '#FFD700', 3),
('Platinum', 20000, NULL, 2.0, '{"description": "플래티넘 등급", "benefits": ["2배 포인트 적립", "무료 배송", "전용 상담사", "특별 할인"]}', '#E5E4E2', 4)
ON CONFLICT (tier_name) DO NOTHING;

-- 기본 쿠폰 데이터
INSERT INTO coupons (name, description, discount_type, discount_value, min_order_amount, usage_limit, expires_at) 
VALUES
('신규 가입 축하 쿠폰', '신규 가입을 축하합니다!', 'percentage', 10, 10000, 1, NOW() + INTERVAL '30 days'),
('첫 주문 할인', '첫 주문 시 사용 가능', 'fixed', 3000, 15000, 1, NOW() + INTERVAL '7 days'),
('주말 특가 쿠폰', '주말에만 사용 가능한 특가 쿠폰', 'percentage', 15, 20000, NULL, NOW() + INTERVAL '90 days')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 8. RLS (Row Level Security) 정책
-- =====================================================

-- wishlists 테이블 RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own wishlists" ON wishlists;
CREATE POLICY "Users can only access their own wishlists" ON wishlists
    FOR ALL USING (auth.uid() = user_id);

-- user_addresses 테이블 RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own addresses" ON user_addresses;
CREATE POLICY "Users can only access their own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- user_coupons 테이블 RLS
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own coupons" ON user_coupons;
CREATE POLICY "Users can only access their own coupons" ON user_coupons
    FOR ALL USING (auth.uid() = user_id);

-- payment_methods 테이블 RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own payment methods" ON payment_methods;
CREATE POLICY "Users can only access their own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- point_transactions 테이블 RLS
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own point transactions" ON point_transactions;
CREATE POLICY "Users can only access their own point transactions" ON point_transactions
    FOR ALL USING (auth.uid() = user_id);

-- user_reviews 테이블 RLS
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own reviews" ON user_reviews;
CREATE POLICY "Users can only access their own reviews" ON user_reviews
    FOR ALL USING (auth.uid() = user_id);

-- user_settings 테이블 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own settings" ON user_settings;
CREATE POLICY "Users can only access their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 완료 메시지
-- =====================================================
SELECT 'CustomerProfile.tsx 지원을 위한 추가 테이블 및 함수 생성이 완료되었습니다.' as message;
