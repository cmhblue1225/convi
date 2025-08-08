-- =====================================================
-- 17. 로컬에서 사용하던 쿠폰 데이터 추가
-- =====================================================

-- 참고: 이 스크립트는 `15_point.sql` 또는 `00_setup_all_advanced.sql`을 이미 실행하여
-- `coupons` 테이블이 존재한다고 가정합니다.

-- `ON CONFLICT (code) DO NOTHING`을 사용하여 이미 존재하는 쿠폰은 건너뛰고
-- 새로운 쿠폰만 안전하게 추가합니다.

INSERT INTO coupons (code, name, description, discount_type, discount_value, min_amount, is_membership_only, valid_until)
VALUES 
  ('WELCOME10', '신규 회원 10% 할인', '1만원 이상 주문 시', 'percentage', 0.10, 10000, FALSE, NOW() + INTERVAL '1 year'),
  ('FREEDELIVERY', '무료배송 쿠폰', '배송비 3,000원 할인', 'fixed', 3000, 0, FALSE, NOW() + INTERVAL '1 year'),
  ('FIRSTORDER5000', '첫 주문 5천원 할인', '2만원 이상 주문 시', 'fixed', 5000, 20000, FALSE, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

-- 완료 메시지
SELECT 'Safely added new coupons to the database.' as status;