# 편의점 종합 솔루션 Supabase 설정 가이드

## 📋 개요

이 가이드는 편의점 종합 솔루션의 데이터베이스를 Supabase에 설정하는 방법을 단계별로 설명합니다.

## 🚀 1단계: Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성
1. [Supabase](https://supabase.com)에 접속
2. GitHub 계정으로 로그인
3. 새 프로젝트 생성

### 1.2 프로젝트 설정
- **프로젝트 이름**: `convenience-store-v2` (또는 원하는 이름)
- **데이터베이스 비밀번호**: 안전한 비밀번호 설정
- **지역**: `Asia Pacific (Singapore)` 또는 가까운 지역 선택

## 🗄️ 2단계: 데이터베이스 스키마 설정

### 2.1 SQL Editor 접속
1. Supabase 대시보드에서 **SQL Editor** 메뉴 클릭
2. **New query** 버튼 클릭

### 2.2 스키마 실행
1. `supabase_setup.sql` 파일의 전체 내용을 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭하여 실행

### 2.3 실행 확인
다음 테이블들이 성공적으로 생성되었는지 확인:
- `profiles` - 사용자 프로필
- `stores` - 편의점 지점
- `categories` - 상품 카테고리
- `products` - 상품 마스터
- `store_products` - 지점별 상품
- `orders` - 주문
- `order_items` - 주문 상품
- `supply_requests` - 재고 요청
- 기타 모든 테이블들

## 🔐 3단계: 인증 설정

### 3.1 Authentication 설정
1. **Authentication** → **Settings** 메뉴 접속
2. **Site URL** 설정: `http://localhost:5173` (개발용)
3. **Redirect URLs** 추가: `http://localhost:5173/**`

### 3.2 이메일 템플릿 설정 (선택사항)
1. **Authentication** → **Email Templates**
2. 필요한 경우 이메일 템플릿 커스터마이징

## 🔑 4단계: API 키 설정

### 4.1 프로젝트 설정에서 API 키 확인
1. **Settings** → **API** 메뉴 접속
2. 다음 정보를 복사하여 저장:
   - **Project URL**
   - **anon public** (클라이언트용)
   - **service_role** (서버용, 보안 주의)

### 4.2 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🧪 5단계: 테스트 데이터 생성

### 5.1 테스트 사용자 생성
SQL Editor에서 다음 쿼리 실행:

```sql
-- 테스트용 본사 관리자 계정 생성 (실제 사용 시 이메일 변경 필요)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@convenience.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 프로필 생성
INSERT INTO public.profiles (id, role, full_name, phone)
SELECT 
  id,
  'headquarters',
  '본사 관리자',
  '010-1234-5678'
FROM auth.users 
WHERE email = 'admin@convenience.com';
```

### 5.2 지점별 상품 및 재고 데이터 생성
`setup_store_products.sql` 파일의 내용을 Supabase SQL Editor에 복사하여 실행하세요.

이 스크립트는 다음과 같은 설정을 제공합니다:

#### 지점별 상품 구성:
- **강남점**: 모든 상품 보유, 높은 재고 (19개 상품)
- **홍대점**: 음료, 과자 위주, 중간 재고 (15개 상품)
- **신촌점**: 학생 위주, 저렴한 가격, 낮은 재고 (12개 상품)
- **강북점**: 주민 위주, 기본 상품 (16개 상품)
- **마포점**: 직장인 위주, 커피, 간식 위주 (14개 상품)

#### 재고 상태 테스트:
- 재고 부족 상품 (안전 재고 이하)
- 품절 상품 (재고 0개)
- 판매 중단 상품 (is_available = false)

#### 가격 정책:
- 강남점: 기본 가격 (할인 없음)
- 홍대점: 5% 할인 (음료, 과자)
- 신촌점: 10% 할인 (학생 할인)
- 강북점, 마포점: 기본 가격

## 🔧 6단계: 애플리케이션 연동

### 6.1 Supabase 클라이언트 설정
`src/lib/supabase/client.ts` 파일에서 URL과 키 확인:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 6.2 타입 생성
1. **Settings** → **API** → **Generate types** 클릭
2. 생성된 타입을 `src/lib/supabase/types.ts`에 복사

## 🚨 7단계: 보안 설정 확인

### 7.1 RLS 정책 확인
모든 테이블에 RLS가 활성화되어 있는지 확인:
- **Table Editor**에서 각 테이블의 **RLS** 상태 확인
- **Policies** 탭에서 정책들이 올바르게 설정되었는지 확인

### 7.2 API 보안 설정
1. **Settings** → **API** → **API Settings**
2. **Enable Row Level Security (RLS)** 확인
3. **JWT Expiry** 설정 (기본값: 3600초)

## 📊 8단계: 모니터링 설정

### 8.1 로그 확인
1. **Logs** 메뉴에서 실시간 로그 확인
2. **Database** 로그로 쿼리 성능 모니터링

### 8.2 대시보드 확인
1. **Table Editor**에서 데이터 확인
2. **Authentication** → **Users**에서 사용자 관리

## 🔄 9단계: 개발 워크플로우

### 9.1 로컬 개발
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 9.2 데이터베이스 변경사항
1. `supabase_setup.sql` 파일 수정
2. SQL Editor에서 변경사항 실행
3. 타입 재생성

## 🚀 10단계: 배포 준비

### 10.1 프로덕션 환경 변수
```env
VITE_SUPABASE_URL=your_production_project_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### 10.2 도메인 설정
1. **Authentication** → **Settings**
2. **Site URL**을 실제 도메인으로 변경
3. **Redirect URLs**에 실제 도메인 추가

## 🛠️ 문제 해결

### 일반적인 문제들

#### 1. RLS 정책 오류
```sql
-- 특정 테이블의 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### 2. 인증 오류
- API 키가 올바른지 확인
- 환경 변수가 제대로 설정되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

#### 3. 타입 오류
- Supabase에서 타입을 재생성
- `npm run build`로 타입 체크

### 지원 및 문의
- Supabase 문서: https://supabase.com/docs
- GitHub Issues: 프로젝트 저장소에서 이슈 등록

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 실행
- [ ] 인증 설정 완료
- [ ] API 키 설정
- [ ] 테스트 데이터 생성
- [ ] 애플리케이션 연동
- [ ] 보안 설정 확인
- [ ] 로컬 개발 환경 구축
- [ ] 배포 준비 완료

---

이제 편의점 종합 솔루션을 사용할 준비가 완료되었습니다! 🎉 