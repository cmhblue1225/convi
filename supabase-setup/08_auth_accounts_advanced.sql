-- =====================================================
-- 08_auth_accounts_advanced.sql
-- Supabase Authentication 테스트 계정 생성
-- =====================================================

-- =====================================================
-- ⚠️  주의사항:
-- =====================================================
-- 이 스크립트는 Supabase Dashboard에서 직접 실행해야 합니다.
-- SQL Editor에서는 auth.users 테이블에 직접 INSERT할 수 없습니다.
-- 
-- 대신 Supabase Dashboard > Authentication > Users에서
-- 수동으로 계정을 생성하거나, 아래의 가이드를 따라주세요.

-- =====================================================
-- 1. Supabase Dashboard에서 계정 생성 방법
-- =====================================================

/*
1. Supabase Dashboard 접속
2. Authentication > Users 메뉴 클릭
3. "Add User" 버튼 클릭
4. 다음 정보로 계정 생성:

=== 고객 계정들 ===
Email: customer1@test.com
Password: password123
User Metadata: {"role": "customer", "full_name": "테스트 고객1"}

Email: customer2@test.com
Password: password123
User Metadata: {"role": "customer", "full_name": "테스트 고객2"}

Email: customer3@test.com
Password: password123
User Metadata: {"role": "customer", "full_name": "테스트 고객3"}

=== 점주 계정들 ===
Email: shopowner1@test.com
Password: password123
User Metadata: {"role": "store_owner", "full_name": "테스트 점주1"}

Email: shopowner2@test.com
Password: password123
User Metadata: {"role": "store_owner", "full_name": "테스트 점주2"}

Email: shopowner3@test.com
Password: password123
User Metadata: {"role": "store_owner", "full_name": "테스트 점주3"}

=== 본사 계정들 ===
Email: hq@test.com
Password: password123
User Metadata: {"role": "headquarters", "full_name": "테스트 본사1"}

Email: hq2@test.com
Password: password123
User Metadata: {"role": "headquarters", "full_name": "테스트 본사2"}
*/

-- =====================================================
-- 2. Auth 계정 생성 후 profiles 테이블 업데이트
-- =====================================================

-- Auth 계정을 생성한 후, 해당 사용자의 UUID를 가져와서
-- profiles 테이블의 id를 업데이트해야 합니다.

-- 예시: customer1@test.com 계정의 UUID를 확인
SELECT id, email FROM auth.users WHERE email = 'customer1@test.com';

-- 확인된 UUID로 profiles 테이블 업데이트
UPDATE profiles 
SET id = '확인된_UUID_여기에_입력'
WHERE full_name = '테스트 고객1';

-- =====================================================
-- 3. 자동화된 방법 (Edge Function 사용)
-- =====================================================

-- 더 자동화된 방법을 원한다면, Edge Function을 사용할 수 있습니다.
-- 이는 고급 사용자를 위한 방법입니다.

-- =====================================================
-- 4. 테스트 계정 생성 확인
-- =====================================================

-- Auth 계정 생성 후 다음 쿼리로 확인
SELECT 
    au.id as "Auth ID",
    au.email as "이메일",
    au.raw_user_meta_data->>'role' as "역할",
    au.raw_user_meta_data->>'full_name' as "이름",
    au.created_at as "생성일",
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ 프로필 연결됨'
        ELSE '❌ 프로필 미연결'
    END as "프로필 상태"
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email LIKE '%@test.com'
ORDER BY au.raw_user_meta_data->>'role', au.email;

-- =====================================================
-- 5. 프로필 연결 상태 확인
-- =====================================================

-- 모든 테스트 계정의 연결 상태 확인
SELECT 
    p.full_name as "이름",
    p.role as "역할",
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ Auth 연결됨'
        ELSE '❌ Auth 미연결'
    END as "Auth 상태"
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.full_name LIKE '테스트%'
ORDER BY p.role, p.full_name;

-- =====================================================
-- 6. 문제 해결 가이드
-- =====================================================

/*
문제: Auth 계정은 생성했는데 profiles 테이블과 연결이 안됨

해결 방법:
1. Auth 계정의 UUID 확인
   SELECT id, email FROM auth.users WHERE email = 'customer1@test.com';

2. profiles 테이블 업데이트
   UPDATE profiles 
   SET id = '확인된_UUID'
   WHERE full_name = '테스트 고객1';

3. 연결 확인
   SELECT * FROM profiles WHERE full_name = '테스트 고객1';
*/

-- =====================================================
-- 7. 완전한 테스트 환경 설정
-- =====================================================

-- 모든 계정이 올바르게 연결된 후, 다음을 확인하세요:

-- 7.1 로그인 테스트
-- 각 테스트 계정으로 로그인 시도

-- 7.2 권한 테스트
-- 각 역할별로 적절한 권한이 있는지 확인

-- 7.3 기능 테스트
-- 각 역할별 주요 기능들이 정상 작동하는지 확인

-- =====================================================
-- 8. 추가 설정 (선택사항)
-- =====================================================

-- 8.1 이메일 확인 비활성화 (개발 환경용)
-- Supabase Dashboard > Authentication > Settings > Email Auth
-- "Enable email confirmations" 체크 해제

-- 8.2 소셜 로그인 설정 (선택사항)
-- Google, GitHub 등 소셜 로그인 설정

-- 8.3 비밀번호 정책 설정
-- Supabase Dashboard > Authentication > Settings > Password Auth
-- 개발 환경에서는 간단한 정책 사용 