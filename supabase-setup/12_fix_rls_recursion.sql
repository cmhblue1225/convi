-- =====================================================
-- 12_fix_rls_recursion.sql
-- RLS 무한 재귀 문제 해결 스크립트
-- =====================================================

-- 이 스크립트는 RLS 정책의 무한 재귀 문제를 해결합니다.
-- 기존 정책을 삭제하고 새로운 정책으로 교체합니다.

-- =====================================================
-- 1. 기존 RLS 정책 삭제
-- =====================================================

-- 모든 테이블의 기존 정책 삭제
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 조회/수정" ON profiles;
DROP POLICY IF EXISTS "본사는 모든 프로필 조회/수정" ON profiles;
DROP POLICY IF EXISTS "모든 사용자가 활성 카테고리 조회" ON categories;
DROP POLICY IF EXISTS "본사는 카테고리 관리" ON categories;
DROP POLICY IF EXISTS "모든 사용자가 활성 상품 조회" ON products;
DROP POLICY IF EXISTS "본사는 상품 관리" ON products;
DROP POLICY IF EXISTS "모든 사용자가 활성 지점 조회" ON stores;
DROP POLICY IF EXISTS "점주는 자신의 지점 관리" ON stores;
DROP POLICY IF EXISTS "본사는 모든 지점 관리" ON stores;
DROP POLICY IF EXISTS "모든 사용자가 활성 지점 상품 조회" ON store_products;
DROP POLICY IF EXISTS "점주는 자신의 지점 상품 관리" ON store_products;
DROP POLICY IF EXISTS "본사는 모든 지점 상품 관리" ON store_products;
DROP POLICY IF EXISTS "고객은 자신의 주문만 조회" ON orders;
DROP POLICY IF EXISTS "점주는 자신의 지점 주문 관리" ON orders;
DROP POLICY IF EXISTS "본사는 모든 주문 관리" ON orders;
DROP POLICY IF EXISTS "주문과 관련된 아이템 조회" ON order_items;
DROP POLICY IF EXISTS "점주는 자신의 지점 주문 아이템 관리" ON order_items;
DROP POLICY IF EXISTS "본사는 모든 주문 아이템 관리" ON order_items;
DROP POLICY IF EXISTS "점주는 자신의 지점 매출 조회" ON daily_sales_summary;
DROP POLICY IF EXISTS "본사는 모든 매출 조회" ON daily_sales_summary;
DROP POLICY IF EXISTS "점주는 자신의 지점 상품 매출 조회" ON product_sales_summary;
DROP POLICY IF EXISTS "본사는 모든 상품 매출 조회" ON product_sales_summary;
DROP POLICY IF EXISTS "주문과 관련된 상태 이력 조회" ON order_status_history;
DROP POLICY IF EXISTS "점주는 자신의 지점 주문 상태 이력 관리" ON order_status_history;
DROP POLICY IF EXISTS "본사는 모든 주문 상태 이력 관리" ON order_status_history;
DROP POLICY IF EXISTS "점주는 자신의 지점 재고 거래 조회" ON inventory_transactions;
DROP POLICY IF EXISTS "본사는 모든 재고 거래 관리" ON inventory_transactions;
DROP POLICY IF EXISTS "점주는 자신의 지점 공급 요청 관리" ON supply_requests;
DROP POLICY IF EXISTS "본사는 모든 공급 요청 관리" ON supply_requests;
DROP POLICY IF EXISTS "공급 요청과 관련된 아이템 조회" ON supply_request_items;
DROP POLICY IF EXISTS "본사는 모든 공급 요청 아이템 관리" ON supply_request_items;
DROP POLICY IF EXISTS "점주는 자신의 지점 배송 조회" ON shipments;
DROP POLICY IF EXISTS "본사는 모든 배송 관리" ON shipments;
DROP POLICY IF EXISTS "사용자는 자신의 알림만 조회" ON notifications;
DROP POLICY IF EXISTS "사용자는 자신의 알림 관리" ON notifications;
DROP POLICY IF EXISTS "모든 사용자가 공개 설정 조회" ON system_settings;
DROP POLICY IF EXISTS "본사는 모든 설정 관리" ON system_settings;

-- =====================================================
-- 2. 새로운 RLS 정책 생성 (무한 재귀 방지)
-- =====================================================

-- profiles 테이블 정책
CREATE POLICY "사용자는 자신의 프로필만 조회/수정" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "본사는 모든 프로필 조회/수정" ON profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- categories 테이블 정책
CREATE POLICY "모든 사용자가 활성 카테고리 조회" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "본사는 카테고리 관리" ON categories
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- products 테이블 정책
CREATE POLICY "모든 사용자가 활성 상품 조회" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "본사는 상품 관리" ON products
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- stores 테이블 정책
CREATE POLICY "모든 사용자가 활성 지점 조회" ON stores
    FOR SELECT USING (is_active = true);

CREATE POLICY "점주는 자신의 지점 관리" ON stores
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "본사는 모든 지점 관리" ON stores
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- store_products 테이블 정책
CREATE POLICY "모든 사용자가 활성 지점 상품 조회" ON store_products
    FOR SELECT USING (is_available = true);

CREATE POLICY "점주는 자신의 지점 상품 관리" ON store_products
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM stores WHERE id = store_products.store_id
        )
    );

CREATE POLICY "본사는 모든 지점 상품 관리" ON store_products
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- orders 테이블 정책
CREATE POLICY "고객은 자신의 주문만 조회" ON orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "점주는 자신의 지점 주문 관리" ON orders
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM stores WHERE id = orders.store_id
        )
    );

CREATE POLICY "본사는 모든 주문 관리" ON orders
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- order_items 테이블 정책
CREATE POLICY "주문과 관련된 아이템 조회" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE 
                customer_id = auth.uid() OR
                store_id IN (
                    SELECT id FROM stores WHERE owner_id = auth.uid()
                ) OR
                auth.uid() IN (
                    SELECT id FROM profiles WHERE role = 'headquarters'
                )
        )
    );

CREATE POLICY "점주는 자신의 지점 주문 아이템 관리" ON order_items
    FOR ALL USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 주문 아이템 관리" ON order_items
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- daily_sales_summary 테이블 정책
CREATE POLICY "점주는 자신의 지점 매출 조회" ON daily_sales_summary
    FOR SELECT USING (
        auth.uid() IN (
            SELECT owner_id FROM stores WHERE id = daily_sales_summary.store_id
        )
    );

CREATE POLICY "본사는 모든 매출 조회" ON daily_sales_summary
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- product_sales_summary 테이블 정책
CREATE POLICY "점주는 자신의 지점 상품 매출 조회" ON product_sales_summary
    FOR SELECT USING (
        auth.uid() IN (
            SELECT owner_id FROM stores WHERE id = product_sales_summary.store_id
        )
    );

CREATE POLICY "본사는 모든 상품 매출 조회" ON product_sales_summary
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- order_status_history 테이블 정책
CREATE POLICY "주문과 관련된 상태 이력 조회" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE 
                customer_id = auth.uid() OR
                store_id IN (
                    SELECT id FROM stores WHERE owner_id = auth.uid()
                ) OR
                auth.uid() IN (
                    SELECT id FROM profiles WHERE role = 'headquarters'
                )
        )
    );

CREATE POLICY "점주는 자신의 지점 주문 상태 이력 관리" ON order_status_history
    FOR ALL USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 주문 상태 이력 관리" ON order_status_history
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- inventory_transactions 테이블 정책
CREATE POLICY "점주는 자신의 지점 재고 거래 조회" ON inventory_transactions
    FOR SELECT USING (
        store_product_id IN (
            SELECT sp.id FROM store_products sp
            JOIN stores s ON s.id = sp.store_id
            WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 재고 거래 관리" ON inventory_transactions
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- supply_requests 테이블 정책
CREATE POLICY "점주는 자신의 지점 공급 요청 관리" ON supply_requests
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM stores WHERE id = supply_requests.store_id
        )
    );

CREATE POLICY "본사는 모든 공급 요청 관리" ON supply_requests
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- supply_request_items 테이블 정책
CREATE POLICY "공급 요청과 관련된 아이템 조회" ON supply_request_items
    FOR SELECT USING (
        supply_request_id IN (
            SELECT sr.id FROM supply_requests sr
            WHERE 
                auth.uid() IN (
                    SELECT owner_id FROM stores WHERE id = sr.store_id
                ) OR
                auth.uid() IN (
                    SELECT id FROM profiles WHERE role = 'headquarters'
                )
        )
    );

CREATE POLICY "본사는 모든 공급 요청 아이템 관리" ON supply_request_items
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- shipments 테이블 정책
CREATE POLICY "점주는 자신의 지점 배송 조회" ON shipments
    FOR SELECT USING (
        supply_request_id IN (
            SELECT sr.id FROM supply_requests sr
            JOIN stores s ON s.id = sr.store_id
            WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 배송 관리" ON shipments
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- notifications 테이블 정책
CREATE POLICY "사용자는 자신의 알림만 조회" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "사용자는 자신의 알림 관리" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- system_settings 테이블 정책
CREATE POLICY "모든 사용자가 공개 설정 조회" ON system_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "본사는 모든 설정 관리" ON system_settings
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'headquarters'
        )
    );

-- =====================================================
-- 3. 설정 완료 확인
-- =====================================================

SELECT 
    '✅ RLS 무한 재귀 문제 해결 완료!' as "상태",
    COUNT(*) as "생성된 정책 수"
FROM pg_policies 
WHERE schemaname = 'public';

-- 정책 목록 확인
SELECT 
    tablename as "테이블명",
    policyname as "정책명",
    permissive as "허용",
    roles as "역할",
    cmd as "명령"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 