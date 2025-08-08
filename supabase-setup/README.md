# 편의점 관리 시스템 - Supabase 설정 가이드

## 📋 개요

이 프로젝트는 편의점 관리 시스템의 데이터베이스 설정을 위한 Supabase 스크립트 모음입니다.

## 🚀 빠른 시작

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인
2. 새 프로젝트 생성
3. 프로젝트 URL과 API 키 복사

### 2. 환경 변수 설정
```bash
cp env.example .env
```

`.env` 파일에 다음 정보를 입력:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 데이터베이스 설정
Supabase SQL Editor에서 다음 순서로 스크립트를 실행:

1. `00_setup_all_advanced.sql` - 전체 시스템 설정
2. `01_extensions_advanced.sql` - 확장 기능
3. `02_schema_advanced.sql` - 스키마 정의
4. `03_functions_advanced.sql` - 함수들
5. `04_triggers_advanced.sql` - 트리거들
6. `05_rls_policies_advanced.sql` - RLS 정책
7. `06_seed_data_advanced.sql` - 초기 데이터
8. `07_test_accounts_advanced.sql` - 테스트 계정
9. `08_auth_accounts_advanced.sql` - 인증 설정

## 📊 시스템 구성

### 주요 테이블
- **profiles** - 사용자 프로필 (고객, 점주, 본사)
- **stores** - 편의점 정보
- **products** - 상품 정보
- **categories** - 상품 카테고리
- **orders** - 주문 정보
- **order_items** - 주문 상품
- **store_products** - 매장별 상품 재고
- **supply_requests** - 물류 요청
- **notifications** - 알림

### 주요 기능
- 실시간 주문 관리
- 재고 관리
- 매출 분석
- 알림 시스템
- 사용자 권한 관리

## 🔧 최근 업데이트 (2025-08-08)

### CustomerProfile 페이지 구현
- **새로운 필드 추가:**
  - `first_name`, `last_name` - 이름 분리
  - `email` - 이메일 주소
  - `birth_date` - 생년월일
  - `gender` - 성별 (male/female/other/prefer_not_to_say)
  - `notification_settings` - 알림 설정 (JSONB)

- **새로운 기능:**
  - 프로필 정보 수정
  - 알림 설정 관리
  - 주문 통계 표시
  - 계정 정보 조회

### 데이터베이스 변경사항
```sql
-- 프로필 테이블 개선
ALTER TABLE profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN birth_date DATE,
ADD COLUMN gender TEXT,
ADD COLUMN notification_settings JSONB;

-- 성별 제약조건
ALTER TABLE profiles 
ADD CONSTRAINT profiles_gender_check 
CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- 프로필 통계 함수
CREATE OR REPLACE FUNCTION get_customer_stats(customer_id UUID)
RETURNS TABLE(
  total_orders BIGINT,
  completed_orders BIGINT,
  total_spent NUMERIC,
  avg_order_value NUMERIC
);
```

### 팀원 동기화 방법
1. `00_setup_all_advanced.sql` 스크립트를 실행하여 최신 변경사항 적용
2. 또는 `13_profile_enhancements.sql` 스크립트만 실행하여 프로필 관련 변경사항만 적용
3. 누락된 프로필이 있는 경우 `14_fix_missing_profiles.sql` 스크립트 실행

## 🛠️ 개발 환경 설정

### 필수 도구
- Node.js 18+
- npm 또는 yarn
- Git

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📱 테스트 계정

### 고객 계정
- 이메일: `customer1@test.com`
- 비밀번호: `password123`

### 점주 계정
- 이메일: `store1@test.com`
- 비밀번호: `password123`

### 본사 계정
- 이메일: `hq@test.com`
- 비밀번호: `password123`

## 🔐 권한 관리

### RLS (Row Level Security) 정책
- 고객: 자신의 주문과 프로필만 접근
- 점주: 자신의 매장 정보만 접근
- 본사: 모든 데이터 접근 가능

### 역할별 권한
- `customer`: 주문, 프로필 관리
- `store_owner`: 매장 관리, 주문 처리
- `headquarters`: 전체 시스템 관리

## 📈 성능 최적화

### 인덱스
- 주문 조회 성능 향상을 위한 복합 인덱스
- 사용자별 데이터 접근 최적화
- 날짜 기반 조회 최적화

### 캐싱
- 자주 조회되는 데이터 캐싱
- 실시간 업데이트를 위한 구독 시스템

## 🚨 주의사항

### 데이터 마이그레이션
- 기존 데이터가 있는 경우 백업 필수
- 스크립트 실행 전 테스트 환경에서 검증
- 순서대로 실행하여 의존성 문제 방지

### 문제 해결

#### 프로필 생성 오류
```
ERROR: null value in column "first_name" of relation "profiles" violates not-null constraint
```
**해결 방법:**
1. `14_fix_missing_profiles.sql` 스크립트 실행
2. 또는 수동으로 누락된 프로필 생성

#### 프로필 조회 오류 (406 Not Acceptable)
```
GET /rest/v1/profiles?select=*&id=eq.xxx 406 (Not Acceptable)
```
**해결 방법:**
1. RLS 정책 확인
2. 사용자 인증 상태 확인
3. 프로필이 존재하는지 확인

### 보안
- API 키는 절대 공개하지 마세요
- 프로덕션 환경에서는 강력한 비밀번호 사용
- 정기적인 보안 업데이트

## 📞 지원

### 문제 해결
1. Supabase 로그 확인
2. 브라우저 개발자 도구 확인
3. 네트워크 탭에서 API 호출 확인

### 추가 도움
- Supabase 문서: https://supabase.com/docs
- 프로젝트 이슈 트래커 활용

## 📝 변경 이력

### 2025-08-08
- CustomerProfile 페이지 구현
- 프로필 테이블 스키마 개선
- 알림 설정 기능 추가
- 주문 통계 기능 추가

### 2025-08-07
- 초기 시스템 설정
- 기본 테이블 및 함수 생성
- 테스트 데이터 추가

---

**⚠️ 중요:** 이 스크립트들은 프로덕션 환경에서 실행하기 전에 반드시 테스트 환경에서 검증하세요. 