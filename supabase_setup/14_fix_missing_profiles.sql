-- =====================================================
-- 누락된 프로필 자동 생성 스크립트
-- auth.users에 있지만 profiles 테이블에 없는 사용자들을 위한 프로필 생성
-- =====================================================

-- 1. 누락된 프로필 확인
SELECT 
  '누락된 프로필 확인' as "단계",
  COUNT(*) as "누락된 프로필 수"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. 누락된 프로필 자동 생성
INSERT INTO profiles (
  id,
  role,
  full_name,
  first_name,
  last_name,
  email,
  phone,
  avatar_url,
  birth_date,
  gender,
  notification_settings,
  is_active,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'customer' as role, -- 기본값으로 customer 설정
  '고객' as full_name,
  '고객' as first_name,
  NULL as last_name,
  u.email,
  NULL as phone,
  NULL as avatar_url,
  NULL as birth_date,
  'prefer_not_to_say' as gender,
  '{
    "email_notifications": true,
    "push_notifications": true,
    "order_updates": true,
    "promotions": true,
    "newsletter": false
  }'::jsonb as notification_settings,
  true as is_active,
  u.created_at,
  u.updated_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. 생성된 프로필 확인
SELECT 
  '생성된 프로필 확인' as "단계",
  COUNT(*) as "생성된 프로필 수"
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '1 hour';

-- 4. 최근 생성된 프로필 목록
SELECT 
  id,
  role,
  full_name,
  first_name,
  last_name,
  email,
  created_at
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 5. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '누락된 프로필 자동 생성이 완료되었습니다!';
  RAISE NOTICE '새로 생성된 프로필들은 기본값으로 설정되었습니다.';
  RAISE NOTICE '사용자가 로그인 후 프로필 페이지에서 정보를 수정할 수 있습니다.';
END $$; 