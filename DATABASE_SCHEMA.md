# 편의점 종합 솔루션 데이터베이스 스키마 설계

## 📋 개요

편의점 종합 솔루션의 실제 비즈니스 워크플로우를 반영한 완전한 데이터베이스 스키마입니다.

## 🎯 핵심 비즈니스 요구사항

### 1. 사용자 관리
- 고객, 점주, 본사 관리자 역할 구분
- 프로필 관리 및 권한 제어

### 2. 지점 관리
- 지점 정보 및 운영 시간
- 지점별 상품 재고 및 가격 관리
- 위치 기반 서비스

### 3. 상품 관리
- 상품 마스터 데이터
- 카테고리 계층 구조
- 지점별 재고 및 가격 차별화

### 4. 주문 시스템
- 픽업/배송 주문 처리
- 실시간 주문 상태 추적
- 결제 및 환불 관리

### 5. 공급망 관리
- 점주 → 본사 재고 요청
- 본사 승인 및 물류 발송
- 입고 및 재고 갱신

### 6. 분석 및 리포팅
- 매출 통계 및 분석
- 재고 이력 추적
- 성과 지표 관리

## 🗃️ 테이블 설계

### 1. 인증 및 사용자 관리

#### `profiles` - 사용자 프로필
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'store_owner', 'hq_admin')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  address JSONB, -- 고객 주소 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. 지점 관리

#### `stores` - 편의점 지점
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id),
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_hours JSONB NOT NULL, -- 요일별 운영시간
  location GEOGRAPHY(POINT, 4326) NOT NULL, -- 위치 정보
  delivery_available BOOLEAN DEFAULT true,
  pickup_available BOOLEAN DEFAULT true,
  delivery_radius INTEGER DEFAULT 3000, -- 배송 반경 (미터)
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. 상품 관리

#### `categories` - 상품 카테고리
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  icon_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `products` - 상품 마스터
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES categories(id),
  brand TEXT,
  manufacturer TEXT,
  unit TEXT NOT NULL, -- 개, 병, kg 등
  image_urls TEXT[],
  base_price DECIMAL(10,2) NOT NULL, -- 기본 가격
  cost_price DECIMAL(10,2), -- 원가
  tax_rate DECIMAL(5,2) DEFAULT 0.10, -- 세율
  is_active BOOLEAN DEFAULT true,
  requires_preparation BOOLEAN DEFAULT false, -- 제조 필요 여부
  preparation_time INTEGER DEFAULT 0, -- 제조 시간 (분)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `store_products` - 지점별 상품 정보
```sql
CREATE TABLE store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL, -- 지점별 판매가
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  safety_stock INTEGER DEFAULT 10, -- 안전 재고
  max_stock INTEGER DEFAULT 100, -- 최대 재고
  is_available BOOLEAN DEFAULT true,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  promotion_start_date TIMESTAMPTZ,
  promotion_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);
```

### 4. 주문 시스템

#### `orders` - 주문
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id),
  store_id UUID REFERENCES stores(id),
  type TEXT NOT NULL CHECK (type IN ('pickup', 'delivery')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  
  -- 금액 정보
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- 배송 정보
  delivery_address JSONB, -- 배송 주소
  delivery_notes TEXT,
  
  -- 결제 정보
  payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'kakao_pay', 'toss_pay')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  
  -- 시간 정보
  pickup_time TIMESTAMPTZ, -- 픽업 예정 시간
  estimated_preparation_time INTEGER, -- 예상 제조 시간 (분)
  completed_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `order_items` - 주문 상품
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  options JSONB, -- 상품 옵션 (온도, 추가 요청사항 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `order_status_history` - 주문 상태 이력
```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. 공급망 관리

#### `supply_requests` - 재고 요청
```sql
CREATE TABLE supply_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  store_id UUID REFERENCES stores(id),
  requested_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  total_amount DECIMAL(10,2),
  approved_amount DECIMAL(10,2),
  
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  notes TEXT,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `supply_request_items` - 재고 요청 상품
```sql
CREATE TABLE supply_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_request_id UUID REFERENCES supply_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
  approved_quantity INTEGER CHECK (approved_quantity >= 0),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reason TEXT, -- 요청 사유
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `shipments` - 물류 배송
```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  supply_request_id UUID REFERENCES supply_requests(id),
  status TEXT NOT NULL CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'failed')),
  
  carrier TEXT, -- 배송업체
  tracking_number TEXT,
  
  shipped_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. 재고 관리

#### `inventory_transactions` - 재고 거래 이력
```sql
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_product_id UUID REFERENCES store_products(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'expired', 'damaged')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  
  reference_type TEXT, -- 'order', 'supply_request', 'manual' 등
  reference_id UUID,
  
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  reason TEXT,
  notes TEXT,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. 분석 및 리포팅

#### `daily_sales_summary` - 일별 매출 요약
```sql
CREATE TABLE daily_sales_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  date DATE NOT NULL,
  
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_items_sold INTEGER DEFAULT 0,
  
  pickup_orders INTEGER DEFAULT 0,
  delivery_orders INTEGER DEFAULT 0,
  
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, date)
);
```

#### `product_sales_summary` - 상품별 매출 요약
```sql
CREATE TABLE product_sales_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  product_id UUID REFERENCES products(id),
  date DATE NOT NULL,
  
  quantity_sold INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id, date)
);
```

### 8. 알림 시스템

#### `notifications` - 알림
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- 'order_status', 'low_stock', 'supply_request' 등
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- 추가 데이터
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS) 정책

### 기본 정책
- **고객**: 자신의 주문과 프로필만 접근
- **점주**: 자신이 관리하는 지점의 데이터만 접근
- **본사**: 모든 데이터 접근 가능

### 주요 RLS 정책
1. `profiles`: 사용자는 자신의 프로필만 수정 가능
2. `orders`: 고객은 자신의 주문만, 점주는 자신 지점의 주문만 접근
3. `store_products`: 점주는 자신 지점의 상품만 관리
4. `supply_requests`: 점주는 자신 지점의 요청만, 본사는 모든 요청 접근

## 📊 인덱스 전략

### 성능 최적화를 위한 주요 인덱스
1. **위치 기반 검색**: `stores.location` (GiST 인덱스)
2. **주문 조회**: `orders.customer_id`, `orders.store_id`, `orders.created_at`
3. **재고 관리**: `store_products.store_id`, `inventory_transactions.store_product_id`
4. **분석 쿼리**: `daily_sales_summary.date`, `product_sales_summary.date`

## 🔄 트리거 및 함수

### 자동화된 비즈니스 로직
1. **재고 자동 갱신**: 주문 완료 시 재고 차감
2. **매출 요약 생성**: 일별/상품별 매출 데이터 자동 집계
3. **알림 발송**: 재고 부족, 주문 상태 변경 시 자동 알림
4. **주문 번호 생성**: 자동 주문 번호 생성

---

이 스키마는 편의점 종합 솔루션의 모든 비즈니스 요구사항을 포괄하며, 확장 가능하고 성능 최적화된 구조로 설계되었습니다.