# 추가 필요한 DB 테이블 목록

CustomerProfile.tsx에서 현재 목업 데이터로만 구현되어 있어 실제 DB 테이블이 필요한 기능들을 정리했습니다.

## 1. wishlists (찜 목록)

**목적**: 사용자별 찜한 상품 관리

```sql
CREATE TABLE wishlists (
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
```

**현재 상태**: 하드코딩된 목업 데이터 사용
**필요 기능**: 찜하기/해제, 찜 목록 조회

## 2. user_addresses (배송지 관리)

**목적**: 사용자별 배송지 정보 관리

```sql
CREATE TABLE user_addresses (
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
```

**현재 상태**: 하드코딩된 목업 데이터 (집, 회사 주소)
**필요 기능**: 배송지 추가/수정/삭제, 기본 배송지 설정

## 3. coupons (쿠폰 마스터)

**목적**: 쿠폰 정보 관리

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
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
```

**현재 상태**: 하드코딩된 목업 데이터 (신규가입 쿠폰, 할인 쿠폰)
**필요 기능**: 쿠폰 생성/수정/삭제, 쿠폰 발급 관리

## 4. user_coupons (사용자별 쿠폰 보유)

**목적**: 사용자가 보유한 쿠폰 관리

```sql
CREATE TABLE user_coupons (
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
```

**현재 상태**: 하드코딩된 목업 데이터 (신규가입 쿠폰, 할인 쿠폰)
**필요 기능**: 쿠폰 발급, 사용, 만료 처리

## 5. payment_methods (결제수단)

**목적**: 사용자별 등록된 결제수단 관리

```sql
CREATE TABLE payment_methods (
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
```

**현재 상태**: 하드코딩된 목업 데이터 (신한카드, 카카오페이)
**필요 기능**: 결제수단 등록/삭제, 기본 결제수단 설정

## 6. point_transactions (포인트 거래내역)

**목적**: 포인트 적립/사용 내역 관리

```sql
CREATE TABLE point_transactions (
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
```

**현재 상태**: 코드에서 사용하려고 하지만 실제 데이터 없음
**필요 기능**: 포인트 적립/사용 내역 조회, 만료 처리

## 7. loyalty_tiers (멤버십 등급)

**목적**: 멤버십 등급 시스템 관리

```sql
CREATE TABLE loyalty_tiers (
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
```

**현재 상태**: 코드에서 사용하려고 하지만 실제 데이터 없음
**필요 기능**: 등급별 혜택 관리, 등급 승급 처리

## 8. user_reviews (리뷰 시스템)

**목적**: 주문 완료 후 리뷰 작성 관리

```sql
CREATE TABLE user_reviews (
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
```

**현재 상태**: UI에 리뷰작성 버튼만 있고 실제 기능 없음
**필요 기능**: 리뷰 작성/수정/삭제, 리뷰 조회

## 9. user_settings (사용자 설정)

**목적**: 알림 설정, 개인정보 설정 등 관리

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    UNIQUE(user_id, setting_key)
);
```

**현재 상태**: 체크박스만 있고 실제 저장/로드 기능 없음
**필요 기능**: 알림 설정 저장/로드, 개인정보 설정 관리

## 10. frequent_orders (자주 주문한 상품)

**목적**: 사용자별 자주 주문한 상품 통계 (뷰 또는 집계 테이블)

```sql
-- 뷰로 구현하는 경우
CREATE VIEW frequent_orders AS
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
```

**현재 상태**: 하드코딩된 목업 데이터 (아메리카노, 삼각김밥, 바나나우유)
**필요 기능**: 자주 주문한 상품 통계, 재주문 기능

## profiles 테이블 수정 필요사항

기존 profiles 테이블에 포인트 관련 컬럼 추가 필요:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'Bronze';
```

## 인덱스 추가 권장사항

성능 최적화를 위한 인덱스:

```sql
-- wishlists 테이블
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- user_addresses 테이블
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_is_default ON user_addresses(is_default);

-- user_coupons 테이블
CREATE INDEX idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_is_used ON user_coupons(is_used);

-- payment_methods 테이블
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);

-- point_transactions 테이블
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);

-- user_reviews 테이블
CREATE INDEX idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX idx_user_reviews_store_id ON user_reviews(store_id);
CREATE INDEX idx_user_reviews_product_id ON user_reviews(product_id);

-- user_settings 테이블
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

## 우선순위

1. **높음**: wishlists, user_addresses, point_transactions, loyalty_tiers
2. **중간**: coupons, user_coupons, payment_methods
3. **낮음**: user_reviews, user_settings, frequent_orders (뷰)

이 테이블들을 생성하면 CustomerProfile.tsx의 모든 기능이 실제 데이터베이스와 연동되어 동작할 수 있습니다.
## 필
요한 함수들

### 1. 포인트 업데이트 함수

```sql
CREATE OR REPLACE FUNCTION update_user_points(
    p_user_id UUID,
    p_points INTEGER,
    p_transaction_type TEXT,
    p_description TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $
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
$ LANGUAGE plpgsql;
```

### 2. 멤버십 등급 업데이트 함수

```sql
CREATE OR REPLACE FUNCTION update_loyalty_tier(p_user_id UUID)
RETURNS TEXT AS $
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
$ LANGUAGE plpgsql;
```

### 3. 쿠폰 사용 함수

```sql
CREATE OR REPLACE FUNCTION use_coupon(
    p_user_coupon_id UUID,
    p_order_id UUID
)
RETURNS BOOLEAN AS $
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
$ LANGUAGE plpgsql;
```

## 트리거 추가 권장사항

### 1. updated_at 자동 업데이트 트리거

```sql
-- 추가 테이블들에 대한 updated_at 트리거
CREATE TRIGGER update_user_addresses_updated_at 
    BEFORE UPDATE ON user_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON coupons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_tiers_updated_at 
    BEFORE UPDATE ON loyalty_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reviews_updated_at 
    BEFORE UPDATE ON user_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. 포인트 적립 시 등급 업데이트 트리거

```sql
CREATE OR REPLACE FUNCTION trigger_update_loyalty_tier()
RETURNS TRIGGER AS $
BEGIN
    -- 포인트가 증가했을 때만 등급 체크
    IF NEW.total_earned_points > OLD.total_earned_points THEN
        PERFORM update_loyalty_tier(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_loyalty_tier_on_points_change
    AFTER UPDATE OF total_earned_points ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_update_loyalty_tier();
```

## 초기 데이터 삽입 권장사항

### 1. 기본 멤버십 등급 데이터

```sql
INSERT INTO loyalty_tiers (tier_name, min_points, max_points, point_earn_rate, benefits, tier_color, display_order) VALUES
('Bronze', 0, 999, 1.0, '{"description": "기본 등급", "benefits": ["기본 포인트 적립"]}', '#CD7F32', 1),
('Silver', 1000, 4999, 1.2, '{"description": "실버 등급", "benefits": ["1.2배 포인트 적립", "생일 쿠폰"]}', '#C0C0C0', 2),
('Gold', 5000, 19999, 1.5, '{"description": "골드 등급", "benefits": ["1.5배 포인트 적립", "무료 배송", "우선 고객센터"]}', '#FFD700', 3),
('Platinum', 20000, NULL, 2.0, '{"description": "플래티넘 등급", "benefits": ["2배 포인트 적립", "무료 배송", "전용 상담사", "특별 할인"]}', '#E5E4E2', 4);
```

### 2. 기본 쿠폰 데이터

```sql
INSERT INTO coupons (name, description, discount_type, discount_value, min_order_amount, usage_limit, expires_at) VALUES
('신규 가입 축하 쿠폰', '신규 가입을 축하합니다!', 'percentage', 10, 10000, 1, NOW() + INTERVAL '30 days'),
('첫 주문 할인', '첫 주문 시 사용 가능', 'fixed', 3000, 15000, 1, NOW() + INTERVAL '7 days'),
('주말 특가 쿠폰', '주말에만 사용 가능한 특가 쿠폰', 'percentage', 15, 20000, NULL, NOW() + INTERVAL '90 days');
```

## RLS (Row Level Security) 정책 권장사항

보안을 위해 각 테이블에 RLS 정책을 설정하는 것을 권장합니다:

```sql
-- wishlists 테이블 RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own wishlists" ON wishlists
    FOR ALL USING (auth.uid() = user_id);

-- user_addresses 테이블 RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- user_coupons 테이블 RLS
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own coupons" ON user_coupons
    FOR ALL USING (auth.uid() = user_id);

-- payment_methods 테이블 RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- point_transactions 테이블 RLS
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own point transactions" ON point_transactions
    FOR ALL USING (auth.uid() = user_id);

-- user_reviews 테이블 RLS
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own reviews" ON user_reviews
    FOR ALL USING (auth.uid() = user_id);

-- user_settings 테이블 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);
```

## 구현 순서 권장사항

1. **1단계 (핵심 기능)**: profiles 테이블 수정, wishlists, user_addresses, point_transactions
2. **2단계 (포인트 시스템)**: loyalty_tiers, 포인트 관련 함수들
3. **3단계 (쿠폰 시스템)**: coupons, user_coupons, 쿠폰 관련 함수들
4. **4단계 (부가 기능)**: payment_methods, user_reviews, user_settings
5. **5단계 (최적화)**: frequent_orders 뷰, 인덱스 최적화, RLS 정책

이 순서로 구현하면 CustomerProfile.tsx의 기능들을 단계적으로 실제 데이터베이스와 연동할 수 있습니다.