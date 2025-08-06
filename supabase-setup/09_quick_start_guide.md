# 🚀 빠른 시작 가이드 - 다른 개발자용

## 📋 **단계별 설정**

### **1단계: Supabase 프로젝트 생성**
1. [Supabase](https://supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 설정 완료

### **2단계: 데이터베이스 설정**
1. SQL Editor에서 `00_setup_all_advanced.sql` 실행
2. 완료 메시지 확인

### **3단계: 환경 변수 설정**
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **4단계: 테스트 계정 생성 (선택사항)**

#### **방법 1: 자유롭게 계정 생성**
1. Supabase Dashboard > Authentication > Users
2. "Add User" 클릭
3. 원하는 이메일/비밀번호로 계정 생성
4. User Metadata 설정:

**고객 계정:**
```json
{
  "role": "customer",
  "full_name": "테스트 고객"
}
```

**점주 계정:**
```json
{
  "role": "store_owner", 
  "full_name": "테스트 점주"
}
```

**본사 계정:**
```json
{
  "role": "headquarters",
  "full_name": "테스트 관리자"
}
```

#### **방법 2: 제공된 테스트 계정 사용**
- `08_auth_accounts_advanced.sql` 가이드 참조

### **5단계: 애플리케이션 실행**
```bash
npm run dev
```

## ✅ **확인 사항**

### **1. 자동 프로필 생성 확인**
```sql
-- Auth 계정 생성 후 자동으로 프로필이 생성되었는지 확인
SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    p.role as profile_role,
    p.full_name
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email LIKE '%@%';
```

### **2. 권한 확인**
- 고객: 주문 생성/조회
- 점주: 지점 관리, 주문 처리
- 본사: 전체 관리 권한

## 🔧 **문제 해결**

### **문제 1: 프로필이 생성되지 않음**
```sql
-- 트리거 확인
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### **문제 2: 역할이 제대로 설정되지 않음**
```sql
-- User Metadata 확인
SELECT 
    email,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'your_email@example.com';
```

### **문제 3: 권한 오류**
```sql
-- RLS 정책 확인
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🎯 **테스트 시나리오**

### **고객 테스트**
1. 고객 계정으로 로그인
2. 상품 목록 조회
3. 주문 생성
4. 주문 상태 확인

### **점주 테스트**
1. 점주 계정으로 로그인
2. 지점 정보 확인
3. 주문 목록 조회
4. 주문 상태 변경

### **본사 테스트**
1. 본사 계정으로 로그인
2. 전체 통계 확인
3. 상품 관리
4. 사용자 관리

## 📞 **지원**

문제가 발생하면:
1. 브라우저 콘솔 확인
2. Supabase 로그 확인
3. SQL 쿼리로 데이터 상태 확인
4. README.md의 문제 해결 섹션 참조

---

**🎉 이제 완전한 편의점 관리 시스템을 사용할 수 있습니다!** 