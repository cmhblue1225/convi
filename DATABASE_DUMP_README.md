# 편의점 관리 시스템 데이터베이스 덤프

## 📋 개요
이 덤프는 **mainConvi** Supabase 프로젝트 (ID: `esbjgvnlqzseomhbsimz`)의 완전한 데이터베이스 백업입니다.

## 📁 파일 목록
- `convi_complete_dump.sql` - 원본 SQL 덤프 파일 (760KB)
- `convi_complete_dump.sql.gz` - 압축된 덤프 파일 (81KB) **← 공유 권장**

## 🚀 사용 방법

### 1. 새로운 Supabase 프로젝트 생성
1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 새 프로젝트 생성
3. 데이터베이스 비밀번호 설정

### 2. 덤프 파일 복원

#### 방법 1: 압축 파일 사용 (권장)
```bash
# 압축 해제하면서 직접 복원
gunzip -c convi_complete_dump.sql.gz | psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

#### 방법 2: 원본 파일 사용
```bash
# 원본 SQL 파일로 복원
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < convi_complete_dump.sql
```

#### 방법 3: Supabase CLI 사용
```bash
# Supabase CLI로 복원
supabase db reset --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

### 3. 연결 정보 확인
복원 후 다음 정보를 확인하세요:
- 프로젝트 URL: `https://[PROJECT_ID].supabase.co`
- Anon Key: Supabase Dashboard > Settings > API에서 확인
- Service Role Key: 필요시 동일 위치에서 확인

## 📊 포함된 데이터

### 🗂️ 핵심 테이블 (17개)
- **사용자 관리**: `profiles` (고객/점주/본사)
- **상품 관리**: `categories`, `products`, `store_products`
- **주문 시스템**: `orders`, `order_items`, `order_status_history`
- **매장 관리**: `stores`
- **물류 시스템**: `supply_requests`, `supply_request_items`, `shipments`
- **재고 관리**: `inventory_transactions`
- **매출 분석**: `daily_sales_summary`, `product_sales_summary`
- **기타**: `notifications`, `system_settings`, `wishlists`

### 🔧 포함된 기능
- ✅ 완전한 테이블 스키마
- ✅ RLS (Row Level Security) 정책
- ✅ 데이터베이스 함수 및 트리거
- ✅ 초기 시드 데이터
- ✅ 분석용 뷰 (VIEW)
- ✅ 인덱스 및 제약조건

### 🚫 제외된 데이터
- Auth 시스템 내부 데이터 (보안상 제외)
- Storage 파일 데이터
- Realtime 시스템 데이터
- 확장 기능 내부 데이터

## ⚠️ 주의사항

1. **비밀번호 보안**: 데이터베이스 비밀번호는 절대 코드에 노출하지 마세요
2. **환경 변수**: `.env` 파일을 사용하여 설정 정보를 관리하세요
3. **RLS 정책**: 복원 후 RLS 정책이 올바르게 적용되었는지 확인하세요
4. **초기 데이터**: 테스트용 계정 정보는 프로덕션에서 변경하세요

## 🔄 업데이트 히스토리
- **2025-08-08**: 초기 덤프 생성 (mainConvi 프로젝트)

## 🆘 문제 해결

### 연결 오류 시
```bash
# PostgreSQL 버전 확인
psql --version

# PostgreSQL 17이 아닌 경우 업그레이드
brew install postgresql@17
```

### RLS 정책 문제 시
```sql
-- RLS 상태 확인
SELECT schemaname, tablename, rowsecurity, rowsecurity_enforced 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 📞 지원
문제가 발생하면 프로젝트 관리자에게 연락하세요.