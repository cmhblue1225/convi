-- =====================================================
-- 05_rls_policies_advanced.sql
-- 고급 Row Level Security (RLS) 정책 설정
-- =====================================================

-- =====================================================
-- 1. RLS 활성화
-- =====================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. 프로필 테이블 RLS 정책
-- =====================================================

-- 2.1 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "사용자는 자신의 프로필만 조회/수정" ON profiles
    FOR ALL USING (auth.uid()::text = id::text);

-- 2.2 본사는 모든 프로필 조회/수정 가능
CREATE POLICY "본사는 모든 프로필 조회/수정" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 3. 카테고리 테이블 RLS 정책
-- =====================================================

-- 3.1 모든 사용자가 활성 카테고리 조회 가능
CREATE POLICY "모든 사용자가 활성 카테고리 조회" ON categories
    FOR SELECT USING (is_active = true);

-- 3.2 본사만 카테고리 생성/수정/삭제 가능
CREATE POLICY "본사만 카테고리 관리" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 4. 상품 테이블 RLS 정책
-- =====================================================

-- 4.1 모든 사용자가 활성 상품 조회 가능
CREATE POLICY "모든 사용자가 활성 상품 조회" ON products
    FOR SELECT USING (is_active = true);

-- 4.2 본사만 상품 생성/수정/삭제 가능
CREATE POLICY "본사만 상품 관리" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 5. 지점 테이블 RLS 정책
-- =====================================================

-- 5.1 모든 사용자가 활성 지점 조회 가능
CREATE POLICY "모든 사용자가 활성 지점 조회" ON stores
    FOR SELECT USING (is_active = true);

-- 5.2 점주는 자신의 지점만 조회/수정 가능
CREATE POLICY "점주는 자신의 지점만 관리" ON stores
    FOR ALL USING (
        owner_id = auth.uid()::text AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 5.3 본사는 모든 지점 관리 가능
CREATE POLICY "본사는 모든 지점 관리" ON stores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 6. 지점별 상품 테이블 RLS 정책
-- =====================================================

-- 6.1 모든 사용자가 활성 지점 상품 조회 가능
CREATE POLICY "모든 사용자가 활성 지점 상품 조회" ON store_products
    FOR SELECT USING (is_available = true);

-- 6.2 점주는 자신의 지점 상품만 관리 가능
CREATE POLICY "점주는 자신의 지점 상품만 관리" ON store_products
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 6.3 본사는 모든 지점 상품 관리 가능
CREATE POLICY "본사는 모든 지점 상품 관리" ON store_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 7. 주문 테이블 RLS 정책
-- =====================================================

-- 7.1 고객은 자신의 주문만 조회/수정 가능
CREATE POLICY "고객은 자신의 주문만 관리" ON orders
    FOR ALL USING (
        customer_id = auth.uid()::text AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'customer'
        )
    );

-- 7.2 점주는 자신의 지점 주문만 조회/수정 가능
CREATE POLICY "점주는 자신의 지점 주문만 관리" ON orders
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 7.3 본사는 모든 주문 관리 가능
CREATE POLICY "본사는 모든 주문 관리" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 8. 주문 상세 테이블 RLS 정책
-- =====================================================

-- 8.1 고객은 자신의 주문 상세만 조회 가능
CREATE POLICY "고객은 자신의 주문 상세만 조회" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE customer_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'customer'
        )
    );

-- 8.2 점주는 자신의 지점 주문 상세만 조회/수정 가능
CREATE POLICY "점주는 자신의 지점 주문 상세만 관리" ON order_items
    FOR ALL USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE s.owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 8.3 본사는 모든 주문 상세 관리 가능
CREATE POLICY "본사는 모든 주문 상세 관리" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 9. 일일 매출 요약 테이블 RLS 정책
-- =====================================================

-- 9.1 점주는 자신의 지점 매출 요약만 조회 가능
CREATE POLICY "점주는 자신의 지점 매출 요약만 조회" ON daily_sales_summary
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 9.2 본사는 모든 매출 요약 관리 가능
CREATE POLICY "본사는 모든 매출 요약 관리" ON daily_sales_summary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 10. 상품별 매출 요약 테이블 RLS 정책
-- =====================================================

-- 10.1 점주는 자신의 지점 상품 매출 요약만 조회 가능
CREATE POLICY "점주는 자신의 지점 상품 매출 요약만 조회" ON product_sales_summary
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 10.2 본사는 모든 상품 매출 요약 관리 가능
CREATE POLICY "본사는 모든 상품 매출 요약 관리" ON product_sales_summary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 11. 주문 상태 이력 테이블 RLS 정책
-- =====================================================

-- 11.1 고객은 자신의 주문 상태 이력만 조회 가능
CREATE POLICY "고객은 자신의 주문 상태 이력만 조회" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE customer_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'customer'
        )
    );

-- 11.2 점주는 자신의 지점 주문 상태 이력만 조회 가능
CREATE POLICY "점주는 자신의 지점 주문 상태 이력만 조회" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE s.owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 11.3 본사는 모든 주문 상태 이력 관리 가능
CREATE POLICY "본사는 모든 주문 상태 이력 관리" ON order_status_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 12. 재고 거래 이력 테이블 RLS 정책
-- =====================================================

-- 12.1 점주는 자신의 지점 재고 거래 이력만 조회 가능
CREATE POLICY "점주는 자신의 지점 재고 거래 이력만 조회" ON inventory_transactions
    FOR SELECT USING (
        store_product_id IN (
            SELECT sp.id FROM store_products sp
            JOIN stores s ON s.id = sp.store_id
            WHERE s.owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 12.2 본사는 모든 재고 거래 이력 관리 가능
CREATE POLICY "본사는 모든 재고 거래 이력 관리" ON inventory_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 13. 공급 요청 테이블 RLS 정책
-- =====================================================

-- 13.1 점주는 자신의 지점 공급 요청만 관리 가능
CREATE POLICY "점주는 자신의 지점 공급 요청만 관리" ON supply_requests
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 13.2 본사는 모든 공급 요청 관리 가능
CREATE POLICY "본사는 모든 공급 요청 관리" ON supply_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 14. 공급 요청 상세 테이블 RLS 정책
-- =====================================================

-- 14.1 점주는 자신의 지점 공급 요청 상세만 조회 가능
CREATE POLICY "점주는 자신의 지점 공급 요청 상세만 조회" ON supply_request_items
    FOR SELECT USING (
        supply_request_id IN (
            SELECT sr.id FROM supply_requests sr
            JOIN stores s ON s.id = sr.store_id
            WHERE s.owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 14.2 본사는 모든 공급 요청 상세 관리 가능
CREATE POLICY "본사는 모든 공급 요청 상세 관리" ON supply_request_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 15. 배송 테이블 RLS 정책
-- =====================================================

-- 15.1 점주는 자신의 지점 배송만 조회 가능
CREATE POLICY "점주는 자신의 지점 배송만 조회" ON shipments
    FOR SELECT USING (
        supply_request_id IN (
            SELECT sr.id FROM supply_requests sr
            JOIN stores s ON s.id = sr.store_id
            WHERE s.owner_id = auth.uid()::text
        ) AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'store_owner'
        )
    );

-- 15.2 본사는 모든 배송 관리 가능
CREATE POLICY "본사는 모든 배송 관리" ON shipments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 16. 알림 테이블 RLS 정책
-- =====================================================

-- 16.1 사용자는 자신의 알림만 조회/수정 가능
CREATE POLICY "사용자는 자신의 알림만 관리" ON notifications
    FOR ALL USING (
        user_id = auth.uid()::text
    );

-- 16.2 본사는 모든 알림 관리 가능
CREATE POLICY "본사는 모든 알림 관리" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 17. 시스템 설정 테이블 RLS 정책
-- =====================================================

-- 17.1 모든 사용자가 공개 설정 조회 가능
CREATE POLICY "모든 사용자가 공개 설정 조회" ON system_settings
    FOR SELECT USING (is_public = true);

-- 17.2 본사만 시스템 설정 관리 가능
CREATE POLICY "본사만 시스템 설정 관리" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'headquarters'
        )
    );

-- =====================================================
-- 18. RLS 정책 확인
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
    AND tablename IN (
        'profiles', 'categories', 'products', 'stores', 'store_products',
        'orders', 'order_items', 'daily_sales_summary', 'product_sales_summary',
        'order_status_history', 'inventory_transactions', 'supply_requests',
        'supply_request_items', 'shipments', 'notifications', 'system_settings'
    )
ORDER BY tablename, policyname; 