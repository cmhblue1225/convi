# 편의점 관리 시스템 - 고급 스키마 Supabase 설정 가이드

## 📋 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [데이터베이스 스키마 설정](#3-데이터베이스-스키마-설정)
4. [RLS (Row Level Security) 설정](#4-rls-row-level-security-설정)
5. [트리거 및 함수 설정](#5-트리거-및-함수-설정)
6. [초기 데이터 설정](#6-초기-데이터-설정)
7. [테스트](#7-테스트)

## 🚀 고급 스키마 특징

이 설정은 **엔터프라이즈급 편의점 관리 시스템**을 위한 고급 스키마입니다:

### 📊 **17개 테이블 구성**
- **핵심 테이블 (7개)**: 사용자, 지점, 상품, 주문 등
- **고급 기능 테이블 (10개)**: 매출 분석, 재고 추적, 공급망, 알림 등

### 🎯 **주요 기능**
- 📈 **매출 분석**: 일일/상품별 매출 요약
- 📦 **재고 관리**: 상세한 재고 거래 이력
- 🚚 **공급망 관리**: 공급 요청 및 배송 추적
- 🔔 **알림 시스템**: 실시간 알림 관리
- ⚙️ **시스템 설정**: 동적 설정 관리
- 🗺️ **지리 정보**: 위치 기반 서비스

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성
1. [Supabase](https://supabase.com)에 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

### 1.2 프로젝트 설정
- **Organization**: 개인 계정 또는 팀 조직 선택
- **Name**: `convenience-store-v2-advanced` (또는 원하는 이름)
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
1. **00_setup_all_advanced.sql** - 모든 설정을 한 번에 실행 (완전한 RLS 정책 포함)

**방법 2: 단계별 설정**
1. **01_extensions_advanced.sql** - 고급 확장 기능 활성화
2. **02_schema_advanced.sql** - 고급 테이블 스키마 생성
3. **03_functions_advanced.sql** - 고급 함수 생성
4. **04_triggers_advanced.sql** - 고급 트리거 설정
5. **05_rls_policies_advanced.sql** - 고급 RLS 정책 설정
6. **06_seed_data_advanced.sql** - 고급 초기 데이터 삽입

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
- 자신의 지점 매출 분석 조회

### 4.3 본사 (headquarters)
- 모든 데이터 조회/수정 권한
- 전체 통계 및 분석
- 공급망 관리
- 시스템 설정 관리

## 5. 트리거 및 함수 설정

### 5.1 자동 UUID 생성
- 모든 테이블의 ID는 자동으로 UUID 생성
- `gen_random_uuid()` 함수 사용

### 5.2 자동 타임스탬프
- `created_at`, `updated_at` 자동 설정
- `updated_at`은 레코드 수정 시 자동 업데이트

### 5.3 고급 기능
- 주문 상태 변경 시 자동 알림
- 재고 자동 차감 및 이력 기록
- 매출 데이터 자동 집계
- 공급 요청 자동 처리

## 6. 초기 데이터 설정

### 6.1 테스트 계정 설정

**중요:** 테스트 계정들은 Supabase Authentication에서 수동으로 생성해야 합니다.

#### 6.1.1 Supabase Dashboard에서 계정 생성

1. **Supabase Dashboard 접속**
2. **Authentication > Users** 메뉴 클릭
3. **"Add User"** 버튼 클릭
4. 다음 정보로 계정 생성:

**고객 계정들:**
- Email: `customer1@test.com` / Password: `password123`
- Email: `customer2@test.com` / Password: `password123`
- Email: `customer3@test.com` / Password: `password123`

**점주 계정들:**
- Email: `shopowner1@test.com` / Password: `password123`
- Email: `shopowner2@test.com` / Password: `password123`
- Email: `shopowner3@test.com` / Password: `password123`

**본사 계정들:**
- Email: `hq@test.com` / Password: `password123`
- Email: `hq2@test.com` / Password: `password123`

#### 6.1.2 User Metadata 설정

각 계정 생성 시 **User Metadata**에 다음 정보를 추가:

```json
{
  "role": "customer",
  "full_name": "테스트 고객1"
}
```

```json
{
  "role": "store_owner", 
  "full_name": "테스트 점주1"
}
```

```json
{
  "role": "headquarters",
  "full_name": "테스트 본사1"
}
```

#### 6.1.3 프로필 연결

Auth 계정 생성 후, `08_auth_accounts_advanced.sql` 스크립트를 실행하여 profiles 테이블과 연결하세요.

### 6.2 초기 데이터
- 상품 카테고리 (계층 구조)
- 기본 상품들 (고급 정보 포함)
- 테스트 지점들 (지리 정보 포함)
- 샘플 주문들 (상세 정보 포함)
- 시스템 설정

## 7. 테스트

### 7.1 데이터베이스 연결 테스트
```bash
npm run dev
```

### 7.2 로그인 테스트
1. 애플리케이션 접속
2. 테스트 계정으로 로그인
3. 각 역할별 기능 확인

### 7.3 고급 기능 테스트
- 고객: 주문 생성, 조회
- 점주: 지점 관리, 주문 처리, 매출 분석
- 본사: 전체 통계, 상품 관리, 공급망 관리

### 7.4 완전한 테스트 시나리오
- `11_complete_test_scenario.md` 파일을 참조하여 모든 기능을 체계적으로 테스트
- 10단계에 걸친 완전한 테스트 시나리오 제공
- 권한, 오류 처리, 성능 테스트 포함

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
  - **해결**: `01_extensions_advanced.sql` 사용 또는 `timezone` 확장 주석 처리
  - **대안**: PostgreSQL 내장 타임존 기능 사용 (`NOW()`, `CURRENT_TIMESTAMP` 등)

- **`unaccent` 확장 오류**: 
  ```
  ERROR: extension "unaccent" is not available
  ```
  - **원인**: 일부 Supabase 프로젝트에서 지원하지 않을 수 있습니다.
  - **해결**: `01_extensions_advanced.sql` 사용 또는 `unaccent` 확장 주석 처리
  - **대안**: 텍스트 검색 기능 없이 사용

- **권장 해결책**: `01_extensions_advanced.sql` 스크립트를 사용하세요.

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
- **점주 회원가입 시 지점 생성 오류**:
  ```
  ERROR: new row violates row-level security policy for table "stores"
  ```
  - **원인**: 이전 버전의 `00_setup_all_advanced.sql`에서 RLS가 활성화되었지만 완전한 정책이 설정되지 않음
  - **해결**: 최신 버전의 `00_setup_all_advanced.sql` 사용 또는 `10_fix_rls_issue.sql` 스크립트 실행
  - **방법**: SQL Editor에서 최신 `00_setup_all_advanced.sql` 실행 (권장) 또는 `10_fix_rls_issue.sql` 실행

- **UUID 타입 캐스팅 오류**:
  ```
  ERROR: 42883: operator does not exist: uuid = text
  ```
  - **원인**: PostgreSQL에서 UUID와 TEXT 타입 비교 시 명시적 캐스팅 필요
  - **해결**: 최신 버전의 `00_setup_all_advanced.sql` 또는 `10_fix_rls_issue.sql` 스크립트가 올바른 UUID 타입 비교 사용
  - **방법**: 최신 버전의 `00_setup_all_advanced.sql` 실행 (권장) 또는 `10_fix_rls_issue.sql` 실행

- **RLS 무한 재귀 오류**:
  ```
  ERROR: infinite recursion detected in policy for relation "profiles"
  ```
  - **원인**: RLS 정책에서 자기 참조로 인한 무한 재귀 발생
  - **해결**: `12_fix_rls_recursion.sql` 스크립트 실행
  - **방법**: SQL Editor에서 `12_fix_rls_recursion.sql` 실행

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
5. 성능 모니터링

## 📁 파일 구조

```
supabase-setup/
├── README.md                           # 이 파일
├── 00_setup_all_advanced.sql          # 전체 설정 (권장)
├── 01_extensions_advanced.sql         # 고급 확장 기능
├── 02_schema_advanced.sql             # 고급 스키마 (17개 테이블)
├── 03_functions_advanced.sql          # 고급 함수들
├── 04_triggers_advanced.sql           # 고급 트리거들
├── 05_rls_policies_advanced.sql       # 고급 RLS 정책
├── 06_seed_data_advanced.sql          # 고급 초기 데이터
├── 07_test_accounts_advanced.sql      # 고급 테스트 계정
├── 08_auth_accounts_advanced.sql      # Auth 테스트 계정 설정
├── 09_quick_start_guide.md            # 빠른 시작 가이드
├── 10_fix_rls_issue.sql              # RLS 문제 해결 스크립트
├── 11_complete_test_scenario.md      # 완전한 테스트 시나리오
├── 12_fix_rls_recursion.sql          # RLS 무한 재귀 문제 해결
├── env.example                        # 환경 변수 예제
└── basic-version/                     # 기본 버전 (참고용)
    ├── README.md
    ├── 00_setup_all.sql
    └── ...
```

## 🎯 버전 선택 가이드

- **고급 버전 (현재)**: 엔터프라이즈급 기능, 17개 테이블
- **기본 버전**: 학습용, 7개 테이블 (`basic-version/` 폴더 참조) 