-- =====================================================
-- 05_rls_policies.sql
-- Row Level Security (RLS) 정책 설정
-- =====================================================

-- =====================================================
-- 1. RLS 활성화
-- =====================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. 프로필 테이블 정책
-- =====================================================

-- 사용자는 자신의 프로필만 조회/수정 가능
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 본사는 모든 프로필 조회 가능
DROP POLICY IF EXISTS "HQ can view all profiles" ON profiles;
CREATE POLICY "HQ can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- 본사는 모든 프로필 수정 가능
DROP POLICY IF EXISTS "HQ can update all profiles" ON profiles;
CREATE POLICY "HQ can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- =====================================================
-- 3. 지점 테이블 정책
-- =====================================================

-- 모든 사용자는 활성 지점 조회 가능
DROP POLICY IF EXISTS "Anyone can view active stores" ON stores;
CREATE POLICY "Anyone can view active stores" ON stores
    FOR SELECT USING (status = 'active');

-- 점주는 자신의 지점만 조회/수정 가능
DROP POLICY IF EXISTS "Store owners can manage own stores" ON stores;
CREATE POLICY "Store owners can manage own stores" ON stores
    FOR ALL USING (
        owner_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'store_owner'
        )
    );

-- 본사는 모든 지점 조회/수정 가능
DROP POLICY IF EXISTS "HQ can manage all stores" ON stores;
CREATE POLICY "HQ can manage all stores" ON stores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- =====================================================
-- 4. 카테고리 테이블 정책
-- =====================================================

-- 모든 사용자는 활성 카테고리 조회 가능
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (status = 'active');

-- 본사만 카테고리 관리 가능
DROP POLICY IF EXISTS "HQ can manage categories" ON categories;
CREATE POLICY "HQ can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- =====================================================
-- 5. 상품 테이블 정책
-- =====================================================

-- 모든 사용자는 활성 상품 조회 가능
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (status = 'active');

-- 본사만 상품 관리 가능
DROP POLICY IF EXISTS "HQ can manage products" ON products;
CREATE POLICY "HQ can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- =====================================================
-- 6. 지점별 상품 테이블 정책
-- =====================================================

-- 고객은 모든 지점의 상품 재고 조회 가능
DROP POLICY IF EXISTS "Customers can view store products" ON store_products;
CREATE POLICY "Customers can view store products" ON store_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'customer'
        )
    );

-- 점주는 자신의 지점 상품만 조회/수정 가능
DROP POLICY IF EXISTS "Store owners can manage own store products" ON store_products;
CREATE POLICY "Store owners can manage own store products" ON store_products
    FOR ALL USING (
        store_id IN (
            SELECT s.id FROM stores s
            JOIN profiles p ON s.owner_id = p.id
            WHERE p.user_id = auth.uid() AND p.role = 'store_owner'
        )
    );

-- 본사는 모든 지점 상품 조회/수정 가능
DROP POLICY IF EXISTS "HQ can manage all store products" ON store_products;
CREATE POLICY "HQ can manage all store products" ON store_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- =====================================================
-- 7. 주문 테이블 정책
-- =====================================================

-- 고객은 자신의 주문만 조회/수정 가능
DROP POLICY IF EXISTS "Customers can manage own orders" ON orders;
CREATE POLICY "Customers can manage own orders" ON orders
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND role = 'customer'
        )
    );

-- 점주는 자신의 지점 주문만 조회/수정 가능
DROP POLICY IF EXISTS "Store owners can manage own store orders" ON orders;
CREATE POLICY "Store owners can manage own store orders" ON orders
    FOR ALL USING (
        store_id IN (
            SELECT s.id FROM stores s
            JOIN profiles p ON s.owner_id = p.id
            WHERE p.user_id = auth.uid() AND p.role = 'store_owner'
        )
    );

-- 본사는 모든 주문 조회/수정 가능
DROP POLICY IF EXISTS "HQ can manage all orders" ON orders;
CREATE POLICY "HQ can manage all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- =====================================================
-- 8. 주문 상세 테이블 정책
-- =====================================================

-- 고객은 자신의 주문 상세만 조회 가능
DROP POLICY IF EXISTS "Customers can view own order items" ON order_items;
CREATE POLICY "Customers can view own order items" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN profiles p ON o.customer_id = p.id
            WHERE p.user_id = auth.uid() AND p.role = 'customer'
        )
    );

-- 점주는 자신의 지점 주문 상세만 조회/수정 가능
DROP POLICY IF EXISTS "Store owners can manage own store order items" ON order_items;
CREATE POLICY "Store owners can manage own store order items" ON order_items
    FOR ALL USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN stores s ON o.store_id = s.id
            JOIN profiles p ON s.owner_id = p.id
            WHERE p.user_id = auth.uid() AND p.role = 'store_owner'
        )
    );

-- 본사는 모든 주문 상세 조회/수정 가능
DROP POLICY IF EXISTS "HQ can manage all order items" ON order_items;
CREATE POLICY "HQ can manage all order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'hq'
        )
    );

-- =====================================================
-- 9. 특별 정책 (시스템 관리용)
-- =====================================================

-- 인증된 사용자는 자신의 프로필 생성 가능 (트리거로 자동 생성)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 인증된 사용자는 주문 생성 가능
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders" ON orders
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        customer_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 인증된 사용자는 주문 상세 생성 가능
DROP POLICY IF EXISTS "Authenticated users can create order items" ON order_items;
CREATE POLICY "Authenticated users can create order items" ON order_items
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        order_id IN (
            SELECT o.id FROM orders o
            JOIN profiles p ON o.customer_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- =====================================================
-- RLS 정책 확인
-- =====================================================
SELECT 
    schemaname as "스키마",
    tablename as "테이블명",
    policyname as "정책명",
    permissive as "허용",
    roles as "역할",
    cmd as "명령",
    qual as "조건"
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'stores', 'categories', 'products', 'store_products', 'orders', 'order_items')
ORDER BY tablename, policyname; 