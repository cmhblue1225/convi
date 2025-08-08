-- =====================================================
-- 프로필 테이블 개선 스크립트
-- CustomerProfile 페이지 구현을 위한 데이터베이스 변경사항
-- =====================================================

-- 1. 프로필 테이블에 이름 필드 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. 기존 full_name 데이터를 first_name과 last_name으로 분리
UPDATE profiles 
SET 
  first_name = CASE 
    WHEN full_name LIKE '% %' THEN 
      SPLIT_PART(full_name, ' ', 1)
    ELSE 
      full_name
  END,
  last_name = CASE 
    WHEN full_name LIKE '% %' THEN 
      SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE 
      NULL
  END
WHERE (first_name IS NULL OR last_name IS NULL) AND full_name IS NOT NULL;

-- 3. first_name을 NOT NULL로 설정 (기본값 제공)
UPDATE profiles 
SET first_name = full_name 
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- 4. 이메일 필드 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 5. 생년월일과 성별 필드 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- 6. 성별 제약조건 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_gender_check'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_gender_check 
        CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
    END IF;
END $$;

-- 7. 성별 기본값 설정
UPDATE profiles 
SET gender = 'prefer_not_to_say' 
WHERE gender IS NULL;

-- 8. 알림 설정 필드 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "email_notifications": true,
  "push_notifications": true,
  "order_updates": true,
  "promotions": true,
  "newsletter": false
}'::jsonb;

-- 9. 기존 preferences에 알림 설정이 없다면 추가
UPDATE profiles 
SET notification_settings = COALESCE(
  notification_settings,
  '{
    "email_notifications": true,
    "push_notifications": true,
    "order_updates": true,
    "promotions": true,
    "newsletter": false
  }'::jsonb
)
WHERE notification_settings IS NULL;

-- 10. 이메일 유효성 검사 함수 생성
CREATE OR REPLACE FUNCTION validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- 11. 프로필 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. 프로필 업데이트 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_profile_updated_at ON profiles;
CREATE TRIGGER trigger_update_profile_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

-- 13. 프로필 조회 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW customer_profiles AS
SELECT 
  id,
  role,
  full_name,
  first_name,
  last_name,
  email,
  phone,
  avatar_url,
  address,
  birth_date,
  gender,
  preferences,
  notification_settings,
  is_active,
  created_at,
  updated_at
FROM profiles
WHERE role = 'customer';

-- 14. 프로필 통계 함수 생성
CREATE OR REPLACE FUNCTION get_customer_stats(customer_id UUID)
RETURNS TABLE(
  total_orders BIGINT,
  completed_orders BIGINT,
  total_spent NUMERIC,
  avg_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(o.id)::BIGINT as total_orders,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::BIGINT as completed_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value
  FROM orders o
  WHERE o.customer_id = get_customer_stats.customer_id;
END;
$$ LANGUAGE plpgsql;

-- 15. 샘플 데이터 업데이트 (테스트용)
-- 기존 테스트 고객들의 정보를 더 상세하게 업데이트
UPDATE profiles 
SET 
  first_name = '테스트',
  last_name = '고객1',
  email = 'test1@example.com',
  phone = '010-1234-5678',
  birth_date = '1990-01-01',
  gender = 'male',
  notification_settings = '{
    "email_notifications": true,
    "push_notifications": true,
    "order_updates": true,
    "promotions": true,
    "newsletter": false
  }'::jsonb
WHERE id = '3a40a11e-6a63-4259-b387-a33948e9d91a';

UPDATE profiles 
SET 
  first_name = '테스트',
  last_name = '고객2',
  email = 'test2@example.com',
  phone = '010-2345-6789',
  birth_date = '1995-05-15',
  gender = 'female',
  notification_settings = '{
    "email_notifications": false,
    "push_notifications": true,
    "order_updates": true,
    "promotions": false,
    "newsletter": true
  }'::jsonb
WHERE id = '49761aab-c140-4ec0-8792-ff716f69ff07';

-- 16. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- 17. RLS 정책 업데이트 (필요시)
-- 고객은 자신의 프로필만 조회/수정 가능
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 18. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '프로필 테이블 개선이 완료되었습니다!';
  RAISE NOTICE '추가된 필드: first_name, last_name, email, birth_date, gender, notification_settings';
  RAISE NOTICE '생성된 함수: validate_email(), get_customer_stats()';
  RAISE NOTICE '생성된 뷰: customer_profiles';
  RAISE NOTICE '생성된 트리거: trigger_update_profile_updated_at';
END $$; 