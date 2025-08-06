# 편의점 관리 시스템 - Supabase 설정 가이드

## 📋 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [데이터베이스 스키마 설정](#3-데이터베이스-스키마-설정)
4. [RLS (Row Level Security) 설정](#4-rls-row-level-security-설정)
5. [트리거 및 함수 설정](#5-트리거-및-함수-설정)
6. [초기 데이터 설정](#6-초기-데이터-설정)
7. [테스트](#7-테스트)

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성
1. [Supabase](https://supabase.com)에 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

### 1.2 프로젝트 설정
- **Organization**: 개인 계정 또는 팀 조직 선택
- **Name**: `convenience-store-v2` (또는 원하는 이름)
- **Database Password**: 안전한 비밀번호 설정 (기억해두세요!)
- **Region**: `Asia Pacific (Northeast) - Tokyo` (한국에서 가장 빠름)
- **Pricing Plan**: Free tier 선택

### 1.3 프로젝트 생성 완료 후
- 프로젝트가 생성되면 대시보드로 이동
- **Settings > API**에서 다음 정보를 확인:
  - Project URL
  - anon public key
  - service_role key (비밀번호 필요)

## 2. 환경 변수 설정

### 2.1 .env 파일 생성
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2.2 환경 변수 확인
- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: anon public key

## 3. 데이터베이스 스키마 설정

### 3.1 SQL 에디터 접속
1. Supabase 대시보드에서 **SQL Editor** 클릭
2. **New Query** 클릭

### 3.2 스키마 생성 순서
다음 순서대로 SQL 스크립트를 실행하세요:

**방법 1: 전체 설정 (권장)**
1. **00_setup_all.sql** - 모든 설정을 한 번에 실행

**방법 2: 단계별 설정**
1. **01_extensions_safe.sql** - 안전한 확장 기능 활성화
2. **02_schema.sql** - 테이블 스키마 생성
3. **03_functions.sql** - 함수 생성
4. **04_triggers.sql** - 트리거 설정
5. **05_rls_policies.sql** - RLS 정책 설정
6. **06_seed_data.sql** - 초기 데이터 삽입

## 4. RLS (Row Level Security) 설정

모든 테이블에 RLS가 활성화되어 있습니다. 각 역할별 접근 권한:

### 4.1 고객 (customer)
- 자신의 주문만 조회/수정
- 상품 카탈로그 조회
- 지점 목록 조회

### 4.2 점주 (store_owner)
- 자신의 지점 정보만 조회/수정
- 자신의 지점 주문만 조회/수정
- 자신의 지점 재고만 조회/수정

### 4.3 본사 (hq)
- 모든 데이터 조회/수정 권한
- 전체 통계 및 분석

## 5. 트리거 및 함수 설정

### 5.1 자동 UUID 생성
- 모든 테이블의 ID는 자동으로 UUID 생성
- `gen_random_uuid()` 함수 사용

### 5.2 자동 타임스탬프
- `created_at`, `updated_at` 자동 설정
- `updated_at`은 레코드 수정 시 자동 업데이트

### 5.3 주문 상태 관리
- 주문 상태 변경 시 자동 알림
- 재고 자동 차감

## 6. 초기 데이터 설정

### 6.1 테스트 계정
다음 테스트 계정들이 자동 생성됩니다:

**고객 계정:**
- Email: `customer1@test.com` / Password: `password123`
- Email: `customer2@test.com` / Password: `password123`

**점주 계정:**
- Email: `shopowner1@test.com` / Password: `password123`
- Email: `shopowner2@test.com` / Password: `password123`

**본사 계정:**
- Email: `hq@test.com` / Password: `password123`

### 6.2 초기 데이터
- 상품 카테고리
- 기본 상품들
- 테스트 지점들
- 샘플 주문들

## 7. 테스트

### 7.1 데이터베이스 연결 테스트
```bash
npm run dev
```

### 7.2 로그인 테스트
1. 애플리케이션 접속
2. 테스트 계정으로 로그인
3. 각 역할별 기능 확인

### 7.3 권한 테스트
- 고객: 주문 생성, 조회
- 점주: 지점 관리, 주문 처리
- 본사: 전체 통계, 상품 관리

## 🔧 문제 해결

### UUID 오류
- `uuid-ossp` 확장이 활성화되었는지 확인
- `gen_random_uuid()` 함수 사용

### 확장 기능 오류
- **`timezone` 확장 오류**: 
  ```
  ERROR: extension "timezone" is not available
  ```
  - **원인**: Supabase에서 지원하지 않는 확장입니다.
  - **해결**: `01_extensions_safe.sql` 사용 또는 `timezone` 확장 주석 처리
  - **대안**: PostgreSQL 내장 타임존 기능 사용 (`NOW()`, `CURRENT_TIMESTAMP` 등)

- **`unaccent` 확장 오류**: 
  ```
  ERROR: extension "unaccent" is not available
  ```
  - **원인**: 일부 Supabase 프로젝트에서 지원하지 않을 수 있습니다.
  - **해결**: `01_extensions_safe.sql` 사용 또는 `unaccent` 확장 주석 처리
  - **대안**: 텍스트 검색 기능 없이 사용

- **권장 해결책**: `01_extensions_safe.sql` 스크립트를 사용하세요.

### 트리거 오류
- **함수 반환 타입 오류**:
  ```
  ERROR: function generate_order_number must return type trigger
  ```
  - **원인**: 트리거에서 사용하는 함수는 `RETURNS TRIGGER`여야 합니다.
  - **해결**: 함수가 `RETURNS TRIGGER`로 정의되어 있는지 확인하세요.

- **함수가 먼저 생성되었는지 확인**
- **테이블 생성 후 트리거 설정**

### RLS 오류
- 정책이 올바르게 설정되었는지 확인
- 사용자 역할이 정확한지 확인

### 연결 오류
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성 상태인지 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. SQL 실행 순서 준수
2. 환경 변수 설정
3. Supabase 프로젝트 상태
4. 브라우저 콘솔 오류 메시지

## 🚀 배포 시 주의사항

프로덕션 환경에서는:
1. 강력한 비밀번호 사용
2. 환경 변수 보안
3. RLS 정책 검토
4. 백업 설정 