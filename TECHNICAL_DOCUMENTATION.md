# 편의점 솔루션 - 종합 기술 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [기술 스택](#기술-스택)
4. [데이터베이스 설계](#데이터베이스-설계)
5. [사용자 역할 및 권한](#사용자-역할-및-권한)
6. [메뉴 구조](#메뉴-구조)
7. [구현된 기능](#구현된-기능)
8. [미구현 기능](#미구현-기능)
9. [추후 확장 가능 기능](#추후-확장-가능-기능)
10. [API 구조](#api-구조)
11. [보안 및 인증](#보안-및-인증)
12. [배포 및 운영](#배포-및-운영)
13. [개발 가이드](#개발-가이드)

---

## 🎯 프로젝트 개요

### 프로젝트명
**편의점 솔루션 (Convenience Store Solution)**

### 프로젝트 목적
고객, 점주, 본사가 모두 만족하는 통합 편의점 플랫폼으로, 디지털 혁신을 통해 편의점 비즈니스를 스마트하게 만드는 것을 목표로 합니다.

### 핵심 가치
- **실시간 데이터 동기화**: 모든 사용자가 실시간으로 데이터를 공유
- **데이터 일관성**: 지점 가입부터 주문 처리까지 완전한 데이터 흐름
- **사용자 경험**: 직관적인 UI/UX와 빠른 응답 속도
- **확장성**: 새로운 지점과 상품 추가가 용이한 구조
- **안정성**: 에러 처리와 재시도 로직으로 안정적인 운영

---

## 🏗️ 시스템 아키텍처

### 전체 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React + TS)  │◄──►│   (Supabase)    │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Real-time     │◄─────────────┘
                        │   Subscriptions │
                        └─────────────────┘
```

### 컴포넌트 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── customer/       # 고객 전용 컴포넌트
│   ├── store/          # 점주 전용 컴포넌트
│   ├── hq/             # 본사 전용 컴포넌트
│   └── payment/        # 결제 관련 컴포넌트
├── pages/              # 페이지 컴포넌트
├── stores/             # 상태 관리 (Zustand)
├── lib/                # 유틸리티 및 설정
├── types/              # TypeScript 타입 정의
└── utils/              # 헬퍼 함수
```

---

## 🛠️ 기술 스택

### Frontend
- **React 18**: 사용자 인터페이스 구축
- **TypeScript**: 타입 안전성 보장
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **React Router**: 클라이언트 사이드 라우팅
- **Zustand**: 상태 관리
- **React Query**: 서버 상태 관리

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL 데이터베이스
  - 실시간 구독 (Realtime)
  - Row Level Security (RLS)
  - 인증 시스템
  - Edge Functions

### Payment Integration
- **Toss Payments**: 결제 게이트웨이
- **Kakao Pay**: 결제 게이트웨이 (준비 중)

### Development Tools
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Git**: 버전 관리

---

## 🗄️ 데이터베이스 설계

### 핵심 테이블 구조

#### 1. 사용자 관리
```sql
-- 사용자 프로필
profiles (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL,           -- 'customer', 'store_owner', 'headquarters'
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 지점 정보
stores (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id),
  address TEXT,
  phone TEXT,
  business_hours JSONB,
  location GEOGRAPHY(POINT),
  delivery_available BOOLEAN,
  pickup_available BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 2. 상품 관리
```sql
-- 상품 카테고리
categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP
)

-- 상품 정보
products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  base_price DECIMAL(10,2),
  unit TEXT,
  image_url TEXT,
  is_active BOOLEAN,
  safety_stock INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 지점별 상품 재고
store_products (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  product_id UUID REFERENCES products(id),
  price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  safety_stock INTEGER,
  max_stock INTEGER,
  is_available BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(store_id, product_id)
)
```

#### 3. 주문 시스템
```sql
-- 주문 정보
orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_id UUID REFERENCES profiles(id),
  store_id UUID REFERENCES stores(id),
  total_amount DECIMAL(10,2),
  delivery_address JSONB,
  pickup_location TEXT,
  delivery_fee DECIMAL(10,2),
  payment_method TEXT,
  payment_status TEXT,          -- 'pending', 'paid', 'failed', 'refunded'
  payment_data JSONB,
  order_status TEXT,            -- 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
  delivery_type TEXT,           -- 'delivery', 'pickup'
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 주문 아이템
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  created_at TIMESTAMP
)
```

#### 4. 물류 관리
```sql
-- 물류 요청
supply_requests (
  id UUID PRIMARY KEY,
  request_number TEXT UNIQUE,
  store_id UUID REFERENCES stores(id),
  requested_by UUID REFERENCES profiles(id),
  status TEXT,                  -- 'draft', 'submitted', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled'
  priority TEXT,                -- 'low', 'normal', 'high', 'urgent'
  total_amount DECIMAL(10,2),
  approved_amount DECIMAL(10,2),
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP,
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 물류 요청 아이템
supply_request_items (
  id UUID PRIMARY KEY,
  supply_request_id UUID REFERENCES supply_requests(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  requested_quantity INTEGER,
  approved_quantity INTEGER,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reason TEXT,
  current_stock INTEGER,
  created_at TIMESTAMP
)
```

### 데이터베이스 트리거 및 함수

#### 1. 지점 초기화 트리거
```sql
-- 새 지점 생성 시 모든 상품에 대한 초기 재고(0개) 자동 생성
CREATE OR REPLACE FUNCTION initialize_store_products()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO store_products (store_id, product_id, price, stock_quantity, is_available)
  SELECT
    NEW.id as store_id,
    p.id as product_id,
    p.base_price as price,
    0 as stock_quantity,
    true as is_available
  FROM products p
  WHERE p.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM store_products sp
    WHERE sp.store_id = NEW.id AND sp.product_id = p.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 2. 물류 배송 완료 트리거
```sql
-- 물류 요청이 'delivered' 상태로 변경될 때 자동으로 지점 재고 업데이트
CREATE OR REPLACE FUNCTION handle_supply_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    INSERT INTO store_products (store_id, product_id, stock_quantity, price, is_available)
    SELECT 
      NEW.store_id,
      sri.product_id,
      COALESCE(sp.stock_quantity, 0) + sri.approved_quantity,
      sri.unit_cost,
      true
    FROM supply_request_items sri
    LEFT JOIN store_products sp ON sp.store_id = NEW.store_id AND sp.product_id = sri.product_id
    WHERE sri.supply_request_id = NEW.id
    AND sri.approved_quantity > 0
    ON CONFLICT (store_id, product_id) 
    DO UPDATE SET
      stock_quantity = store_products.stock_quantity + EXCLUDED.stock_quantity - COALESCE(
        (SELECT sp2.stock_quantity FROM store_products sp2 WHERE sp2.store_id = EXCLUDED.store_id AND sp2.product_id = EXCLUDED.product_id), 
        0
      ),
      price = EXCLUDED.price,
      is_available = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 👥 사용자 역할 및 권한

### 1. 고객 (Customer)
- **역할**: `customer`
- **권한**:
  - 지점 선택 및 상품 조회
  - 장바구니 관리
  - 주문 생성 및 결제
  - 주문 내역 조회
  - 주문 상태 추적
  - 프로필 관리

### 2. 점주 (Store Owner)
- **역할**: `store_owner`
- **권한**:
  - 자신의 지점 관리
  - 주문 처리 및 상태 업데이트
  - 재고 관리
  - 물류 요청
  - 매출 통계 조회
  - 지점 정보 수정

### 3. 본사 관리자 (Headquarters)
- **역할**: `headquarters`
- **권한**:
  - 전체 지점 관리 (CRUD)
  - 상품 관리 (CRUD)
  - 물류 요청 처리
  - 전체 매출 분석
  - 시스템 설정 관리

---

## 📱 메뉴 구조

### 1. 고객 메뉴
```
고객 앱
├── 홈 (랜딩페이지)
├── 지점 선택
├── 상품 카탈로그
│   ├── 카테고리별 상품
│   ├── 상품 상세
│   └── 장바구니
├── 주문
│   ├── 주문 생성
│   ├── 결제
│   ├── 주문 내역
│   └── 주문 추적
└── 프로필
    ├── 개인정보
    ├── 주문 히스토리
    └── 설정
```

### 2. 점주 메뉴
```
점주 대시보드
├── 대시보드
│   ├── 오늘 매출
│   ├── 주문 현황
│   ├── 재고 부족 알림
│   └── 성장률
├── 주문 관리
│   ├── 신규 주문
│   ├── 처리 중 주문
│   ├── 완료된 주문
│   └── 주문 상세
├── 재고 관리
│   ├── 재고 현황
│   ├── 재고 수정
│   └── 안전 재고 설정
├── 물류 관리
│   ├── 재고 현황
│   ├── 물류 요청
│   └── 요청 내역
└── 지점 정보
    ├── 기본 정보
    ├── 영업 시간
    └── 배송 설정
```

### 3. 본사 메뉴
```
본사 관리 시스템
├── 대시보드
│   ├── 전체 매출
│   ├── 지점별 현황
│   ├── 상품별 매출
│   └── 물류 요청 현황
├── 지점 관리
│   ├── 지점 목록
│   ├── 지점 추가
│   ├── 지점 수정
│   └── 지점 삭제
├── 상품 관리
│   ├── 상품 목록
│   ├── 상품 추가
│   ├── 상품 수정
│   └── 상품 삭제
├── 물류 관리
│   ├── 물류 요청 목록
│   ├── 요청 승인/거절
│   ├── 배송 관리
│   └── 배송 완료 처리
└── 분석
    ├── 매출 분석
    ├── 지점별 분석
    └── 상품별 분석
```

---

## ✅ 구현된 기능

### 1. 인증 시스템 (100%)
- [x] 사용자 회원가입 (고객, 점주, 본사)
- [x] 로그인/로그아웃
- [x] 세션 관리 및 지속성
- [x] 역할 기반 접근 제어 (RBAC)
- [x] Row Level Security (RLS) 정책

### 2. 고객 기능 (100%)
- [x] 지점 선택 및 상품 조회
- [x] 장바구니 기능
- [x] 주문 생성 및 결제 처리
- [x] 주문 상태 추적
- [x] 주문 내역 조회
- [x] 픽업/배송 옵션

### 3. 결제 시스템 (100%)
- [x] 토스페이먼츠 연동
- [x] 결제 성공/실패 처리
- [x] 주문 생성 및 재고 차감
- [x] 결제 데이터 저장
- [x] 중복 주문 번호 방지
- [x] 결제 실패 시 재시도 로직

### 4. 점주 기능 (100%)
- [x] 지점별 주문 처리
- [x] 지점 대시보드 (실시간 데이터 반영)
- [x] 지점별 매출 통계
- [x] 지점별 재고 현황 실시간 모니터링
- [x] 물류 요청 시스템

### 5. 본사 기능 (100%)
- [x] 본사 대시보드
- [x] 지점 관리 (CRUD)
- [x] 상품 관리 (CRUD)
- [x] 물류 요청 처리
- [x] 매출 분석
- [x] 실시간 데이터 동기화

### 6. 물류 관리 (100%)
- [x] 지점별 재고 관리
- [x] 물류 요청 시스템
- [x] 본사 승인 프로세스
- [x] 배송 관리
- [x] 재고 부족 알림
- [x] 지점 초기 재고 자동 생성
- [x] 재고 0개 상품도 물류 요청 가능
- [x] 배송 완료 시 자동 재고 업데이트

### 7. 실시간 데이터 동기화 (100%)
- [x] Supabase Realtime 구독
- [x] 주문 상태 실시간 업데이트
- [x] 재고 변경 실시간 반영
- [x] 물류 요청 상태 실시간 업데이트
- [x] 지점 대시보드 실시간 통계

### 8. 데이터 일관성 (100%)
- [x] 지점 가입 시 초기 재고 자동 생성
- [x] 주문 시 재고 자동 차감
- [x] 물류 배송 시 재고 자동 증가
- [x] 재고 부족 시 안전 재고 기준 적용
- [x] 데이터 무결성 검증

---

## 🚧 미구현 기능

### 1. 고급 분석 기능
- [ ] 고급 매출 분석 (기간별, 카테고리별)
- [ ] 예측 분석 (재고 예측, 매출 예측)
- [ ] 고객 행동 분석
- [ ] 상품 추천 시스템

### 2. 알림 시스템
- [ ] 이메일 알림
- [ ] SMS 알림
- [ ] 푸시 알림
- [ ] 실시간 알림

### 3. 고급 결제 기능
- [ ] 카카오페이 연동
- [ ] 포인트 시스템
- [ ] 쿠폰 시스템
- [ ] 정기 결제

### 4. 고객 관리
- [ ] 고객 등급 시스템
- [ ] 고객 리뷰 시스템
- [ ] 고객 문의 시스템
- [ ] 개인화 추천

### 5. 운영 관리
- [ ] 직원 관리 시스템
- [ ] 근무 시간 관리
- [ ] 급여 관리
- [ ] 휴가 관리

---

## 🔮 추후 확장 가능 기능

### 1. 모바일 앱
- **React Native** 또는 **Flutter** 기반 모바일 앱
- **PWA (Progressive Web App)** 구현
- **오프라인 모드** 지원

### 2. AI/ML 기능
- **재고 예측**: 머신러닝을 통한 재고 최적화
- **수요 예측**: 계절성, 이벤트 등을 고려한 수요 예측
- **가격 최적화**: 동적 가격 책정
- **고객 세분화**: 고객 행동 분석을 통한 세분화

### 3. 고급 분석
- **BI 도구 연동**: Tableau, Power BI 등과 연동
- **데이터 웨어하우스**: 대용량 데이터 처리
- **실시간 대시보드**: 고급 시각화

### 4. 외부 시스템 연동
- **ERP 시스템 연동**: SAP, Oracle 등
- **회계 시스템 연동**: 세무, 회계 프로그램
- **배송 시스템 연동**: 택배사 API 연동
- **공급업체 시스템**: 자동 발주 시스템

### 5. 고급 보안
- **2FA (이중 인증)**: SMS, 이메일, 앱 기반
- **SSO (Single Sign-On)**: 기업 계정 연동
- **감사 로그**: 모든 작업 기록
- **데이터 암호화**: 민감 데이터 암호화

### 6. 멀티 테넌트
- **프랜차이즈 지원**: 여러 브랜드 지원
- **독립 운영**: 각 지점별 독립 운영
- **중앙 관리**: 본사 통합 관리

---

## 🔌 API 구조

### RESTful API 엔드포인트

#### 인증 API
```
POST   /auth/signup          # 회원가입
POST   /auth/signin          # 로그인
POST   /auth/signout         # 로그아웃
GET    /auth/profile         # 프로필 조회
PUT    /auth/profile         # 프로필 수정
```

#### 지점 API
```
GET    /stores               # 지점 목록 조회
GET    /stores/:id           # 지점 상세 조회
POST   /stores               # 지점 생성
PUT    /stores/:id           # 지점 수정
DELETE /stores/:id           # 지점 삭제
```

#### 상품 API
```
GET    /products             # 상품 목록 조회
GET    /products/:id         # 상품 상세 조회
POST   /products             # 상품 생성
PUT    /products/:id         # 상품 수정
DELETE /products/:id         # 상품 삭제
```

#### 주문 API
```
GET    /orders               # 주문 목록 조회
GET    /orders/:id           # 주문 상세 조회
POST   /orders               # 주문 생성
PUT    /orders/:id/status    # 주문 상태 수정
```

#### 물류 API
```
GET    /supply-requests      # 물류 요청 목록
GET    /supply-requests/:id  # 물류 요청 상세
POST   /supply-requests      # 물류 요청 생성
PUT    /supply-requests/:id  # 물류 요청 수정
```

### 실시간 구독
```javascript
// 주문 상태 변경 구독
supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' }, 
    (payload) => {
      // 주문 상태 변경 처리
    }
  )
  .subscribe()

// 재고 변경 구독
supabase
  .channel('store_products')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'store_products' }, 
    (payload) => {
      // 재고 변경 처리
    }
  )
  .subscribe()
```

---

## 🔒 보안 및 인증

### 1. 인증 시스템
- **Supabase Auth**: JWT 기반 인증
- **세션 관리**: 자동 토큰 갱신
- **로그인 지속성**: 브라우저 세션 유지

### 2. 권한 관리
- **Row Level Security (RLS)**: 데이터베이스 레벨 권한 제어
- **역할 기반 접근 제어 (RBAC)**: 사용자 역할별 권한
- **API 권한**: 엔드포인트별 접근 제어

### 3. 데이터 보안
- **HTTPS**: 모든 통신 암호화
- **SQL Injection 방지**: 파라미터화된 쿼리
- **XSS 방지**: 입력 데이터 검증
- **CSRF 방지**: 토큰 기반 보호

### 4. 보안 정책
```sql
-- 예시: 점주는 자신의 지점 데이터만 접근 가능
CREATE POLICY "Store owners can manage own store data" ON stores
FOR ALL USING (owner_id = auth.uid());

-- 예시: 본사는 모든 데이터 접근 가능
CREATE POLICY "HQ can manage all data" ON stores
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'headquarters'
  )
);
```

---

## 🚀 배포 및 운영

### 1. 개발 환경
```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트 체크
npm run lint
```

### 2. 환경 변수
```env
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 토스페이먼츠 설정
VITE_TOSS_PAYMENTS_CLIENT_KEY=your_toss_client_key
VITE_TOSS_PAYMENTS_SECRET_KEY=your_toss_secret_key
```

### 3. 배포 옵션
- **Vercel**: 정적 사이트 호스팅
- **Netlify**: 정적 사이트 호스팅
- **AWS S3 + CloudFront**: CDN 기반 배포
- **Docker**: 컨테이너 기반 배포

### 4. 모니터링
- **Supabase Dashboard**: 데이터베이스 모니터링
- **Vercel Analytics**: 성능 모니터링
- **Sentry**: 에러 추적

---

## 👨‍💻 개발 가이드

### 1. 프로젝트 설정

#### 1.1 Supabase 데이터베이스 설정
먼저 `SETUP_GUIDE.md` 파일을 참조하여 Supabase 프로젝트를 설정하세요.

#### 1.2 로컬 개발 환경 설정
```bash
# 저장소 클론
git clone [repository-url]
cd convenience-store-v2

# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env.local
# .env.local 파일에 실제 Supabase 값 입력

# 개발 서버 실행
npm run dev
```

#### 1.3 데이터베이스 스키마 적용
1. `supabase_setup.sql` 파일의 내용을 Supabase SQL Editor에 복사
2. 실행하여 모든 테이블, 인덱스, RLS 정책 생성
3. `setup_store_products.sql` 파일을 실행하여 지점별 상품 및 재고 설정
4. Supabase에서 타입 생성 후 `src/lib/supabase/types.ts`에 복사

### 2. 코드 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Button, Modal 등)
│   ├── customer/       # 고객 전용 컴포넌트
│   ├── store/          # 점주 전용 컴포넌트
│   ├── hq/             # 본사 전용 컴포넌트
│   └── payment/        # 결제 관련 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── customer/       # 고객 페이지
│   ├── store/          # 점주 페이지
│   ├── hq/             # 본사 페이지
│   └── payment/        # 결제 페이지
├── stores/             # 상태 관리 (Zustand)
│   ├── common/         # 공통 상태
│   ├── customer/       # 고객 상태
│   ├── store/          # 점주 상태
│   └── hq/             # 본사 상태
├── lib/                # 유틸리티 및 설정
│   ├── supabase/       # Supabase 설정
│   ├── payment/        # 결제 관련 유틸리티
│   └── utils/          # 공통 유틸리티
├── types/              # TypeScript 타입 정의
└── utils/              # 헬퍼 함수
```

### 3. 개발 규칙
- **컴포넌트 명명**: PascalCase (예: `CustomerHeader`)
- **파일 명명**: kebab-case (예: `customer-header.tsx`)
- **함수 명명**: camelCase (예: `handleSignOut`)
- **상수 명명**: UPPER_SNAKE_CASE (예: `MAX_RETRY_COUNT`)

### 4. 상태 관리 패턴
```typescript
// Zustand 스토어 예시
interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  // State
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  
  // Actions
  signIn: async (email, password) => {
    // 로그인 로직
  },
  signOut: async () => {
    // 로그아웃 로직
  },
  clearAuth: () => {
    // 인증 정보 초기화
  }
}));
```

### 5. 에러 처리
```typescript
// 에러 처리 패턴
try {
  const result = await someAsyncOperation();
  // 성공 처리
} catch (error) {
  console.error('Operation failed:', error);
  
  if (error instanceof NetworkError) {
    // 네트워크 에러 처리
  } else if (error instanceof ValidationError) {
    // 검증 에러 처리
  } else {
    // 일반 에러 처리
  }
}
```

### 6. 테스트
```bash
# 단위 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e

# 테스트 커버리지 확인
npm run test:coverage
```

---

## 📊 성능 최적화

### 1. 프론트엔드 최적화
- **코드 스플리팅**: React.lazy() 사용
- **이미지 최적화**: WebP 포맷, lazy loading
- **번들 최적화**: Tree shaking, minification
- **캐싱**: 브라우저 캐시, Service Worker

### 2. 데이터베이스 최적화
- **인덱스**: 자주 조회되는 컬럼에 인덱스 생성
- **쿼리 최적화**: N+1 문제 방지
- **페이지네이션**: 대용량 데이터 처리
- **실시간 구독 최적화**: 필요한 테이블만 구독

### 3. API 최적화
- **캐싱**: Redis 캐싱 (추후 구현)
- **Rate Limiting**: API 호출 제한
- **압축**: Gzip 압축
- **CDN**: 정적 자원 CDN 배포

---

## 🔄 마이그레이션 및 업데이트

### 1. 데이터베이스 마이그레이션
```sql
-- 마이그레이션 예시
-- 2025-08-05_add_supply_delivery_trigger.sql

-- 물류 배송 완료 시 자동으로 지점 재고 업데이트하는 트리거 함수
CREATE OR REPLACE FUNCTION handle_supply_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- 트리거 로직
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_supply_delivery
  AFTER UPDATE ON supply_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_supply_delivery();
```

### 2. 버전 관리
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Changelog**: 변경 사항 문서화
- **Rollback**: 이전 버전으로 복구 가능

---

## 📞 지원 및 문의

### 개발팀 연락처
- **프로젝트 매니저**: [이메일]
- **프론트엔드 개발자**: [이메일]
- **백엔드 개발자**: [이메일]
- **DevOps 엔지니어**: [이메일]

### 문서 및 리소스
- **API 문서**: [링크]
- **디자인 시스템**: [링크]
- **개발 가이드**: [링크]
- **트러블슈팅**: [링크]

---

## 📝 변경 이력

### v2.0.0 (2025-08-05)
- **추가**: 물류 배송 완료 자동화
- **추가**: 고객 네비게이션 개선
- **수정**: 본사 물류 요청 조회 문제 해결
- **수정**: 인증 시스템 개선

### v1.0.0 (2025-08-01)
- **초기 릴리즈**: 기본 기능 구현
- **추가**: 고객, 점주, 본사 기능
- **추가**: 결제 시스템
- **추가**: 실시간 데이터 동기화

---

**마지막 업데이트**: 2025-08-05  
**문서 버전**: v2.0.0  
**작성자**: Claude Assistant  
**검토자**: [검토자명] 