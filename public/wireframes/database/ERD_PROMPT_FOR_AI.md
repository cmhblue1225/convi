# 편의점 종합 솔루션 ERD 생성 프롬프트

## AI 도구에 입력할 프롬프트

**다음 내용을 AI 다이어그램 도구(예: Claude, ChatGPT, Mermaid, Draw.io AI 등)에 복사해서 붙여넣으세요:**

---

**편의점 종합 솔루션 데이터베이스 ERD를 생성해주세요. 다음 테이블 구조와 관계를 기반으로 Entity Relationship Diagram을 만들어주세요:**

## 데이터베이스 테이블 구조

### 1. 사용자 관리 (User Management)

**profiles** (사용자 프로필)
- id: UUID (PK)
- role: TEXT (customer, store_owner, headquarters)
- full_name: TEXT
- first_name: TEXT 
- last_name: TEXT
- email: TEXT
- phone: TEXT
- birth_date: DATE
- gender: TEXT
- avatar_url: TEXT
- address: JSONB
- preferences: JSONB
- notification_settings: JSONB
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 2. 상품 관리 (Product Management)

**categories** (카테고리)
- id: UUID (PK)
- name: TEXT (UNIQUE)
- slug: TEXT (UNIQUE)
- parent_id: UUID (FK → categories.id) [Self-referencing]
- icon_url: TEXT
- description: TEXT
- display_order: INTEGER
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**products** (상품 마스터)
- id: UUID (PK)
- name: TEXT
- description: TEXT
- barcode: TEXT (UNIQUE)
- category_id: UUID (FK → categories.id)
- brand: TEXT
- manufacturer: TEXT
- unit: TEXT
- image_urls: TEXT[]
- base_price: NUMERIC
- cost_price: NUMERIC
- tax_rate: NUMERIC
- is_active: BOOLEAN
- requires_preparation: BOOLEAN
- preparation_time: INTEGER
- nutritional_info: JSONB
- allergen_info: TEXT[]
- is_wishlisted: BOOLEAN
- wishlist_count: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 3. 매장 관리 (Store Management)

**stores** (매장)
- id: UUID (PK)
- name: TEXT
- owner_id: UUID (FK → profiles.id)
- address: TEXT
- phone: TEXT
- business_hours: JSONB
- location: GEOGRAPHY
- delivery_available: BOOLEAN
- pickup_available: BOOLEAN
- delivery_radius: INTEGER
- min_order_amount: NUMERIC
- delivery_fee: NUMERIC
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**store_products** (매장별 상품)
- id: UUID (PK)
- store_id: UUID (FK → stores.id)
- product_id: UUID (FK → products.id)
- price: NUMERIC
- stock_quantity: INTEGER
- safety_stock: INTEGER
- max_stock: INTEGER
- is_available: BOOLEAN
- discount_rate: NUMERIC
- promotion_start_date: TIMESTAMP
- promotion_end_date: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 4. 주문 관리 (Order Management)

**orders** (주문)
- id: UUID (PK)
- order_number: TEXT (UNIQUE)
- customer_id: UUID (FK → profiles.id)
- store_id: UUID (FK → stores.id)
- type: TEXT (pickup, delivery)
- status: TEXT (pending, confirmed, preparing, ready, completed, cancelled)
- subtotal: NUMERIC
- tax_amount: NUMERIC
- delivery_fee: NUMERIC
- discount_amount: NUMERIC
- coupon_discount_amount: NUMERIC
- points_used: INTEGER
- points_discount_amount: NUMERIC
- total_amount: NUMERIC
- delivery_address: JSONB
- delivery_notes: TEXT
- payment_method: TEXT
- payment_status: TEXT
- payment_data: JSONB
- pickup_time: TIMESTAMP
- estimated_preparation_time: INTEGER
- completed_at: TIMESTAMP
- cancelled_at: TIMESTAMP
- cancel_reason: TEXT
- notes: TEXT
- applied_coupon_id: UUID (FK → coupons.id)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**order_items** (주문 상품)
- id: UUID (PK)
- order_id: UUID (FK → orders.id) [CASCADE DELETE]
- product_id: UUID (FK → products.id)
- product_name: TEXT
- quantity: INTEGER
- unit_price: NUMERIC
- discount_amount: NUMERIC
- subtotal: NUMERIC
- options: JSONB
- created_at: TIMESTAMP

**order_status_history** (주문 상태 이력)
- id: UUID (PK)
- order_id: UUID (FK → orders.id) [CASCADE DELETE]
- status: TEXT
- changed_by: UUID (FK → profiles.id)
- notes: TEXT
- created_at: TIMESTAMP

### 5. 재고 관리 (Inventory Management)

**inventory_transactions** (재고 거래)
- id: UUID (PK)
- store_product_id: UUID (FK → store_products.id)
- transaction_type: TEXT (in, out, adjustment, expired, damaged, returned)
- quantity: INTEGER
- previous_quantity: INTEGER
- new_quantity: INTEGER
- reference_type: TEXT
- reference_id: UUID
- unit_cost: NUMERIC
- total_cost: NUMERIC
- reason: TEXT
- notes: TEXT
- created_by: UUID (FK → profiles.id)
- created_at: TIMESTAMP

### 6. 물류 관리 (Supply Chain Management)

**supply_requests** (물류 요청)
- id: UUID (PK)
- request_number: TEXT (UNIQUE)
- store_id: UUID (FK → stores.id)
- requested_by: UUID (FK → profiles.id)
- status: TEXT (draft, submitted, approved, rejected, shipped, delivered, cancelled)
- priority: TEXT (low, normal, high, urgent)
- total_amount: NUMERIC
- approved_amount: NUMERIC
- expected_delivery_date: DATE
- actual_delivery_date: DATE
- approved_by: UUID (FK → profiles.id)
- approved_at: TIMESTAMP
- notes: TEXT
- rejection_reason: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**supply_request_items** (물류 요청 상품)
- id: UUID (PK)
- supply_request_id: UUID (FK → supply_requests.id)
- product_id: UUID (FK → products.id)
- product_name: TEXT
- requested_quantity: INTEGER
- approved_quantity: INTEGER
- unit_cost: NUMERIC
- total_cost: NUMERIC
- reason: TEXT
- current_stock: INTEGER
- created_at: TIMESTAMP

**shipments** (배송)
- id: UUID (PK)
- shipment_number: TEXT (UNIQUE)
- supply_request_id: UUID (FK → supply_requests.id)
- status: TEXT (preparing, shipped, in_transit, delivered, failed)
- carrier: TEXT
- tracking_number: TEXT
- shipped_at: TIMESTAMP
- estimated_delivery: TIMESTAMP
- delivered_at: TIMESTAMP
- notes: TEXT
- failure_reason: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 7. 프로모션 및 혜택 (Promotions & Benefits)

**coupons** (쿠폰)
- id: UUID (PK)
- code: TEXT (UNIQUE)
- name: TEXT
- description: TEXT
- discount_type: TEXT (percentage, fixed_amount)
- discount_value: NUMERIC
- min_order_amount: NUMERIC
- max_discount_amount: NUMERIC
- usage_limit: INTEGER
- used_count: INTEGER
- is_active: BOOLEAN
- valid_from: TIMESTAMP
- valid_until: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**user_coupons** (사용자 쿠폰)
- id: UUID (PK)
- user_id: UUID (FK → profiles.id)
- coupon_id: UUID (FK → coupons.id)
- is_used: BOOLEAN
- used_at: TIMESTAMP
- used_order_id: UUID (FK → orders.id)
- expires_at: TIMESTAMP
- created_at: TIMESTAMP

**points** (포인트)
- id: UUID (PK)
- user_id: UUID (FK → profiles.id)
- amount: INTEGER
- type: TEXT (earned, used, expired, bonus)
- description: TEXT
- order_id: UUID (FK → orders.id)
- expires_at: TIMESTAMP
- created_at: TIMESTAMP

**point_settings** (포인트 정책)
- id: UUID (PK)
- key: TEXT (UNIQUE)
- value: JSONB
- description: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 8. 위시리스트 (Wishlist)

**wishlists** (위시리스트)
- id: UUID (PK)
- user_id: UUID (FK → auth.users.id)
- product_id: UUID (FK → products.id)
- created_at: TIMESTAMP

**product_wishlists** (상품별 위시리스트 매핑)
- id: UUID (PK)
- product_id: UUID (FK → products.id)
- user_id: UUID (FK → auth.users.id)
- created_at: TIMESTAMP

### 9. 분석 및 리포팅 (Analytics & Reporting)

**daily_sales_summary** (일별 매출 요약)
- id: UUID (PK)
- store_id: UUID (FK → stores.id)
- date: DATE
- total_orders: INTEGER
- pickup_orders: INTEGER
- delivery_orders: INTEGER
- cancelled_orders: INTEGER
- total_revenue: NUMERIC
- total_items_sold: INTEGER
- avg_order_value: NUMERIC
- hourly_stats: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**product_sales_summary** (상품별 매출 요약)
- id: UUID (PK)
- store_id: UUID (FK → stores.id)
- product_id: UUID (FK → products.id)
- date: DATE
- quantity_sold: INTEGER
- revenue: NUMERIC
- avg_price: NUMERIC
- created_at: TIMESTAMP

### 10. 시스템 관리 (System Management)

**notifications** (알림)
- id: UUID (PK)
- user_id: UUID (FK → profiles.id)
- type: TEXT
- title: TEXT
- message: TEXT
- data: JSONB
- priority: TEXT (low, normal, high, urgent)
- is_read: BOOLEAN
- read_at: TIMESTAMP
- expires_at: TIMESTAMP
- created_at: TIMESTAMP

**system_settings** (시스템 설정)
- id: UUID (PK)
- key: TEXT (UNIQUE)
- value: JSONB
- description: TEXT
- category: TEXT
- is_public: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

## ERD 생성 요구사항

1. **레이아웃**: 논리적으로 연관된 테이블들을 그룹화하여 배치
2. **관계선**: Foreign Key 관계를 명확한 선으로 표시 (1:1, 1:N, N:M)
3. **Primary Key**: 각 테이블의 PK를 명확히 표시
4. **Foreign Key**: FK를 화살표나 연결선으로 표시
5. **색상 코딩**: 기능별로 다른 색상 사용 (사용자 관리-파란색, 상품 관리-초록색, 주문 관리-주황색 등)
6. **주요 관계 표시**:
   - profiles → stores (1:N, owner_id)
   - categories → categories (1:N, parent_id, 자기참조)
   - categories → products (1:N)
   - stores → store_products (1:N)
   - products → store_products (1:N)
   - profiles → orders (1:N, customer_id)
   - stores → orders (1:N)
   - orders → order_items (1:N)
   - products → order_items (1:N)
   - profiles → supply_requests (1:N, requested_by)
   - stores → supply_requests (1:N)
   - supply_requests → supply_request_items (1:N)
   - supply_requests → shipments (1:1)
   - profiles → user_coupons (1:N)
   - coupons → user_coupons (1:N)
   - profiles → points (1:N)
   - profiles → wishlists (1:N)
   - products → wishlists (1:N)

7. **테이블 그룹핑**: 
   - 사용자 관리: profiles
   - 상품 관리: categories, products
   - 매장 관리: stores, store_products  
   - 주문 관리: orders, order_items, order_status_history
   - 재고 관리: inventory_transactions
   - 물류 관리: supply_requests, supply_request_items, shipments
   - 프로모션: coupons, user_coupons, points, point_settings
   - 위시리스트: wishlists, product_wishlists
   - 분석: daily_sales_summary, product_sales_summary
   - 시스템: notifications, system_settings

**결과물**: 편의점 종합 솔루션의 완전한 ERD 다이어그램을 생성해주세요. 가독성이 좋고 전문적인 데이터베이스 설계 문서로 사용할 수 있는 수준의 다이어그램을 만들어주세요.

---

## 사용 방법

1. 위 프롬프트를 복사합니다
2. AI 다이어그램 도구에 붙여넣습니다 (추천 도구):
   - **Claude 3.5**: "위 내용으로 ERD를 그려주세요"
   - **ChatGPT**: "mermaid 문법으로 ERD를 생성해주세요"
   - **Draw.io**: AI 기능 사용
   - **Lucidchart**: AI 다이어그램 생성
   - **Mermaid Live Editor**: 직접 mermaid 코드 작성

3. 생성된 ERD를 검토하고 필요시 수정 요청
4. 최종 다이어그램을 이미지나 SVG로 내보내기

## 추가 요청사항 예시

ERD 생성 후 다음과 같은 추가 요청을 할 수 있습니다:

- "테이블 간 관계를 더 명확하게 표시해주세요"
- "색상을 기능별로 다르게 적용해주세요"
- "테이블 배치를 더 논리적으로 정리해주세요"
- "주요 비즈니스 플로우를 강조해주세요"
- "mermaid 코드도 함께 제공해주세요"