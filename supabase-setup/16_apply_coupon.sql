-- =====================================================
-- 16. 쿠폰 적용 로직 (함수 및 트리거)
-- =====================================================

-- 쿠폰 사용 횟수 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- user_coupons 테이블의 is_used가 TRUE로 변경될 때만 작동
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
-- 이 트리거는 user_coupons 테이블의 레코드가 업데이트될 때마다 실행됩니다.
DROP TRIGGER IF EXISTS trigger_update_coupon_usage ON user_coupons;
CREATE TRIGGER trigger_update_coupon_usage
  AFTER UPDATE ON user_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_usage_count();

-- 완료 메시지
SELECT 'Coupon application logic (function and trigger) setup completed successfully!' as status;