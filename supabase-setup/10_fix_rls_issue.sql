-- =====================================================
-- 10_fix_rls_issue.sql
-- RLS 정책 문제 해결 스크립트
-- =====================================================

-- 이 스크립트는 RLS 정책 문제를 해결합니다.
-- 점주 회원가입 시 지점 생성이 가능하도록 합니다.

-- =====================================================
-- 1. 기존 RLS 정책 삭제
-- =====================================================

-- 기존 정책들 삭제
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 조회/수정" ON profiles;
DROP POLICY IF EXISTS "모든 사용자가 활성 카테고리 조회" ON categories;
DROP POLICY IF EXISTS "모든 사용자가 활성 상품 조회" ON products;
DROP POLICY IF EXISTS "모든 사용자가 활성 지점 조회" ON stores;
DROP POLICY IF EXISTS "모든 사용자가 활성 지점 상품 조회" ON store_products;

-- =====================================================
-- 2. 완전한 RLS 정책 생성
-- =====================================================

-- profiles 테이블 정책
CREATE POLICY "사용자는 자신의 프로필만 조회/수정" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "본사는 모든 프로필 조회/수정" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- categories 테이블 정책
CREATE POLICY "모든 사용자가 활성 카테고리 조회" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "본사는 카테고리 관리" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- products 테이블 정책
CREATE POLICY "모든 사용자가 활성 상품 조회" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "본사는 상품 관리" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- stores 테이블 정책
CREATE POLICY "모든 사용자가 활성 지점 조회" ON stores
    FOR SELECT USING (is_active = true);

CREATE POLICY "점주는 자신의 지점 관리" ON stores
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "본사는 모든 지점 관리" ON stores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- store_products 테이블 정책
CREATE POLICY "모든 사용자가 활성 지점 상품 조회" ON store_products
    FOR SELECT USING (is_available = true);

CREATE POLICY "점주는 자신의 지점 상품 관리" ON store_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE id = store_products.store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 지점 상품 관리" ON store_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- orders 테이블 정책
CREATE POLICY "고객은 자신의 주문만 조회" ON orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "점주는 자신의 지점 주문 관리" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE id = orders.store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 주문 관리" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- order_items 테이블 정책
CREATE POLICY "주문과 관련된 아이템 조회" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_items.order_id AND (
                customer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM stores 
                    WHERE id = orders.store_id AND owner_id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'headquarters'
                )
            )
        )
    );

CREATE POLICY "점주는 자신의 지점 주문 아이템 관리" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE o.id = order_items.order_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 주문 아이템 관리" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- daily_sales_summary 테이블 정책
CREATE POLICY "점주는 자신의 지점 매출 조회" ON daily_sales_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE id = daily_sales_summary.store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 매출 조회" ON daily_sales_summary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- product_sales_summary 테이블 정책
CREATE POLICY "점주는 자신의 지점 상품 매출 조회" ON product_sales_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE id = product_sales_summary.store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 상품 매출 조회" ON product_sales_summary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- order_status_history 테이블 정책
CREATE POLICY "주문과 관련된 상태 이력 조회" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_status_history.order_id AND (
                customer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM stores 
                    WHERE id = orders.store_id AND owner_id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'headquarters'
                )
            )
        )
    );

CREATE POLICY "점주는 자신의 지점 주문 상태 이력 관리" ON order_status_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE o.id = order_status_history.order_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 주문 상태 이력 관리" ON order_status_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- inventory_transactions 테이블 정책
CREATE POLICY "점주는 자신의 지점 재고 거래 조회" ON inventory_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM store_products sp
            JOIN stores s ON s.id = sp.store_id
            WHERE sp.id = inventory_transactions.store_product_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 재고 거래 관리" ON inventory_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- supply_requests 테이블 정책
CREATE POLICY "점주는 자신의 지점 공급 요청 관리" ON supply_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE id = supply_requests.store_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 공급 요청 관리" ON supply_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- supply_request_items 테이블 정책
CREATE POLICY "공급 요청과 관련된 아이템 조회" ON supply_request_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM supply_requests sr
            WHERE sr.id = supply_request_items.supply_request_id AND (
                EXISTS (
                    SELECT 1 FROM stores 
                    WHERE id = sr.store_id AND owner_id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'headquarters'
                )
            )
        )
    );

CREATE POLICY "본사는 모든 공급 요청 아이템 관리" ON supply_request_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- shipments 테이블 정책
CREATE POLICY "점주는 자신의 지점 배송 조회" ON shipments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM supply_requests sr
            JOIN stores s ON s.id = sr.store_id
            WHERE sr.id = shipments.supply_request_id AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "본사는 모든 배송 관리" ON shipments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
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
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'headquarters'
        )
    );

-- =====================================================
-- 3. 설정 완료 확인
-- =====================================================

SELECT 
    '✅ RLS 정책 설정 완료!' as "상태",
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