# 데이터베이스 ERD (Entity Relationship Diagram)

## 📊 전체 ERD 개요

편의점 종합 솔루션은 **22개의 핵심 테이블**로 구성된 완전한 관계형 데이터베이스를 사용합니다.

### 🎯 ERD 다이어그램 (텍스트 표현)

```
                    편의점 종합 솔루션 ERD (22 Tables)
                                   
    ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
    │  profiles   │────│   stores    │────│ store_products  │
    │             │    │             │    │                 │
    │ - id (PK)   │    │ - id (PK)   │    │ - id (PK)       │
    │ - role      │    │ - owner_id  │    │ - store_id (FK) │
    │ - full_name │    │ - name      │    │ - product_id(FK)│
    │ - phone     │    │ - address   │    │ - price         │
    │ - email     │    │ - location  │    │ - stock         │
    │ - ...       │    │ - ...       │    │ - discount_rate │
    └─────────────┘    └─────────────┘    └─────────────────┘
           │                                        │
           │            ┌─────────────┐             │
           └────────────│  products   │─────────────┘
                        │             │
                        │ - id (PK)   │
                        │ - name      │
                        │ - category  │
                        │ - barcode   │
                        │ - base_price│
                        └─────────────┘
                               │
                    ┌─────────────┐
                    │ categories  │
                    │             │
                    │ - id (PK)   │
                    │ - name      │
                    │ - parent_id │
                    └─────────────┘

    ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
    │   orders    │────│ order_items │    │ order_status_   │
    │             │    │             │    │   history       │
    │ - id (PK)   │    │ - id (PK)   │    │                 │
    │ - customer  │    │ - order_id  │    │ - order_id (FK) │
    │ - store_id  │    │ - product   │    │ - status        │
    │ - status    │    │ - quantity  │    │ - changed_at    │
    │ - total     │    │ - price     │    │ - changed_by    │
    └─────────────┘    └─────────────┘    └─────────────────┘

    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
    │supply_req.. │────│supply_request_  │    │ shipments   │
    │             │    │   items         │    │             │
    │ - id (PK)   │    │                 │    │ - id (PK)   │
    │ - store_id  │    │ - request_id(FK)│    │ - request_id│
    │ - status    │    │ - product_id(FK)│    │ - status    │
    │ - requested │    │ - quantity      │    │ - shipped_at│
    └─────────────┘    └─────────────────┘    └─────────────┘

    ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
    │   points    │    │  coupons    │────│  user_coupons   │
    │             │    │             │    │                 │
    │ - id (PK)   │    │ - id (PK)   │    │ - id (PK)       │
    │ - user_id   │    │ - name      │    │ - user_id (FK)  │
    │ - amount    │    │ - type      │    │ - coupon_id(FK) │
    │ - type      │    │ - discount  │    │ - status        │
    │ - created_at│    │ - valid_until│    │ - used_at      │
    └─────────────┘    └─────────────┘    └─────────────────┘

    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
    │ wishlists   │────│product_wishlists│    │notifications│
    │             │    │                 │    │             │
    │ - id (PK)   │    │ - wishlist_id   │    │ - id (PK)   │
    │ - user_id   │    │ - product_id    │    │ - user_id   │
    │ - name      │    │ - added_at      │    │ - type      │
    │ - created_at│    │                 │    │ - message   │
    └─────────────┘    └─────────────────┘    └─────────────┘

    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐
    │inventory_trans..│    │daily_sales_sum..│    │product_sales│
    │                 │    │                 │    │ _summary    │
    │ - id (PK)       │    │ - id (PK)       │    │             │
    │ - store_id      │    │ - store_id      │    │ - id (PK)   │
    │ - product_id    │    │ - date          │    │ - store_id  │
    │ - type          │    │ - total_sales   │    │ - product_id│
    │ - quantity      │    │ - total_orders  │    │ - quantity  │
    │ - transaction_at│    │ - created_at    │    │ - revenue   │
    └─────────────────┘    └─────────────────┘    └─────────────┘

    ┌─────────────────┐
    │ system_settings │
    │                 │
    │ - id (PK)       │
    │ - key           │
    │ - value         │
    │ - description   │
    │ - updated_at    │
    └─────────────────┘
```

## 🔗 주요 관계 (Relationships)

### 1. 사용자 중심 관계
```
profiles (1) ──── (1) stores (점주의 경우)
profiles (1) ──── (M) orders (고객 주문)
profiles (1) ──── (M) points (포인트 내역)
profiles (1) ──── (M) user_coupons (쿠폰 소유)
profiles (1) ──── (M) wishlists (위시리스트)
```

### 2. 상품 관계
```
categories (1) ──── (M) products
products (1) ──── (M) store_products (점포별 상품)
products (1) ──── (M) order_items (주문 상품)
products (1) ──── (M) supply_request_items
products (1) ──── (M) inventory_transactions
```

### 3. 주문 관계
```
orders (1) ──── (M) order_items
orders (1) ──── (M) order_status_history
```

### 4. 물류 관계
```
supply_requests (1) ──── (M) supply_request_items
supply_requests (1) ──── (1) shipments
```

### 5. 쿠폰 관계
```
coupons (1) ──── (M) user_coupons
```

### 6. 위시리스트 관계
```
wishlists (1) ──── (M) product_wishlists
```

## 📋 테이블별 상세 정보

### 핵심 테이블 (Core Tables)

#### 1. profiles - 사용자 프로필
- **용도**: 모든 사용자(고객, 점주, 본사) 기본 정보
- **관계**: 
  - stores (1:1, 점주의 경우)
  - orders (1:M, 고객 주문)
  - points (1:M)
  - user_coupons (1:M)

#### 2. stores - 점포 정보
- **용도**: 편의점 점포 기본 정보 및 운영 상태
- **관계**:
  - profiles (1:1, 점주)
  - store_products (1:M)
  - orders (1:M)
  - supply_requests (1:M)

#### 3. products - 상품 마스터
- **용도**: 전체 상품 카탈로그 관리
- **관계**:
  - categories (M:1)
  - store_products (1:M)
  - order_items (1:M)

#### 4. categories - 상품 카테고리
- **용도**: 계층적 상품 분류 시스템
- **관계**:
  - products (1:M)
  - categories (self-reference, 계층 구조)

### 운영 테이블 (Operational Tables)

#### 5. store_products - 점포별 상품
- **용도**: 점포별 상품 가격, 재고, 할인 정보
- **관계**:
  - stores (M:1)
  - products (M:1)

#### 6. orders - 주문
- **용도**: 고객 주문 정보
- **관계**:
  - profiles (M:1, 고객)
  - stores (M:1)
  - order_items (1:M)
  - order_status_history (1:M)

#### 7. order_items - 주문 상품
- **용도**: 주문에 포함된 개별 상품 정보
- **관계**:
  - orders (M:1)
  - products (M:1)

#### 8. order_status_history - 주문 상태 이력
- **용도**: 주문 상태 변경 추적
- **관계**:
  - orders (M:1)

### 물류 테이블 (Supply Chain Tables)

#### 9. supply_requests - 물류 요청
- **용도**: 점포의 상품 공급 요청
- **관계**:
  - stores (M:1)
  - supply_request_items (1:M)
  - shipments (1:1)

#### 10. supply_request_items - 물류 요청 상품
- **용도**: 물류 요청에 포함된 개별 상품
- **관계**:
  - supply_requests (M:1)
  - products (M:1)

#### 11. shipments - 배송
- **용도**: 물류 요청에 대한 배송 정보
- **관계**:
  - supply_requests (1:1)

#### 12. inventory_transactions - 재고 거래
- **용도**: 모든 재고 변동 이력 추적
- **관계**:
  - stores (M:1)
  - products (M:1)

### 마케팅 테이블 (Marketing Tables)

#### 13. points - 포인트
- **용도**: 사용자 포인트 적립/사용 내역
- **관계**:
  - profiles (M:1)

#### 14. coupons - 쿠폰
- **용도**: 쿠폰 마스터 정보
- **관계**:
  - user_coupons (1:M)

#### 15. user_coupons - 사용자 쿠폰
- **용도**: 사용자별 쿠폰 소유 및 사용 상태
- **관계**:
  - profiles (M:1)
  - coupons (M:1)

#### 16. wishlists - 위시리스트
- **용도**: 사용자 위시리스트 컬렉션
- **관계**:
  - profiles (M:1)
  - product_wishlists (1:M)

#### 17. product_wishlists - 위시리스트 상품
- **용도**: 위시리스트에 포함된 개별 상품
- **관계**:
  - wishlists (M:1)
  - products (M:1)

### 분석 테이블 (Analytics Tables)

#### 18. daily_sales_summary - 일별 매출 요약
- **용도**: 점포별 일별 매출 집계 데이터
- **관계**:
  - stores (M:1)

#### 19. product_sales_summary - 상품별 매출 요약
- **용도**: 점포별 상품별 매출 집계 데이터
- **관계**:
  - stores (M:1)
  - products (M:1)

### 시스템 테이블 (System Tables)

#### 20. notifications - 알림
- **용도**: 사용자별 시스템 알림
- **관계**:
  - profiles (M:1)

#### 21. system_settings - 시스템 설정
- **용도**: 전역 시스템 설정 값
- **관계**: 독립 테이블

#### 22. point_settings - 포인트 설정
- **용도**: 포인트 적립/사용 정책 설정
- **관계**: 독립 테이블

## 🔒 보안 및 권한 (RLS Policies)

### Row Level Security 정책
```sql
-- 고객은 자신의 데이터만 조회
CREATE POLICY customer_own_data ON profiles
    FOR ALL USING (auth.uid() = id AND role = 'customer');

-- 점주는 자신의 점포 데이터만 조회
CREATE POLICY store_owner_data ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = orders.store_id 
            AND stores.owner_id = auth.uid()
        )
    );

-- 본사는 모든 데이터 조회 가능 (역할 기반)
CREATE POLICY headquarters_all_data ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'headquarters'
        )
    );
```

## 📊 인덱스 최적화

### 주요 인덱스
```sql
-- 자주 검색되는 컬럼들
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_store_products_store_id ON store_products(store_id);
CREATE INDEX idx_store_products_product_id ON store_products(product_id);

-- 복합 인덱스 (성능 최적화)
CREATE INDEX idx_orders_store_status ON orders(store_id, status);
CREATE INDEX idx_inventory_store_product ON inventory_transactions(store_id, product_id);
```

## 🔄 데이터 무결성

### 외래 키 제약조건
- **CASCADE 삭제**: 상위 데이터 삭제 시 하위 데이터 자동 삭제
- **RESTRICT 삭제**: 하위 데이터 존재 시 상위 데이터 삭제 방지
- **NULL 허용**: 선택적 관계에서 NULL 값 허용

### CHECK 제약조건
- **역할 검증**: profiles.role의 유효한 값만 허용
- **상태 검증**: orders.status의 정의된 상태만 허용
- **가격 검증**: 음수 가격 방지

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-12