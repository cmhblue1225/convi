# 시스템 아키텍처

## 🏗️ 전체 시스템 구조

### 아키텍처 개요
편의점 종합 솔루션은 **3-Tier Architecture**를 기반으로 하며, **마이크로서비스 지향적 설계**를 채택하고 있습니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Customer   │  │Store Owner  │  │   Headquarters      │  │
│  │     App     │  │     App     │  │       App           │  │
│  │ (React 19)  │  │ (React 19)  │  │    (React 19)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│              ┌─────────────────────────────────┐            │
│              │        Supabase Backend         │            │
│              │  - PostgreSQL Database          │            │
│              │  - Authentication Service       │            │
│              │  - Real-time Subscriptions      │            │
│              │  - Storage Service              │            │
│              │  - Edge Functions               │            │
│              └─────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ TossPay API │  │ Naver Maps  │  │   File Storage      │  │
│  │  (Payment)  │  │    API      │  │   (Supabase)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 아키텍처 설계 원칙

### 1. 단일 책임 원칙 (Single Responsibility)
- 각 컴포넌트는 하나의 명확한 책임을 가짐
- 고객/점주/본사 앱이 완전히 분리된 모듈로 구성

### 2. 느슨한 결합 (Loose Coupling)
- 프론트엔드와 백엔드 독립적 개발/배포
- API 기반 통신으로 의존성 최소화

### 3. 높은 응집도 (High Cohesion)
- 관련 기능들을 논리적 그룹으로 묶음
- 도메인별 명확한 경계 설정

### 4. 확장성 (Scalability)
- 수평적 확장 가능한 설계
- 모듈식 구조로 기능 추가 용이

### 5. 보안 우선 (Security First)
- 인증/인가를 통한 접근 제어
- 데이터 암호화 및 보안 정책 적용

## 📱 프론트엔드 아키텍처

### 컴포넌트 구조
```
src/
├── components/              # 재사용 가능한 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   │   ├── Button.tsx      # 기본 버튼
│   │   ├── Modal.tsx       # 모달 창
│   │   ├── Loading.tsx     # 로딩 스피너
│   │   └── Layout.tsx      # 기본 레이아웃
│   ├── customer/           # 고객용 컴포넌트
│   │   ├── ProductCard.tsx # 상품 카드
│   │   ├── Cart.tsx        # 장바구니
│   │   └── OrderTracker.tsx# 주문 추적
│   ├── store/              # 점주용 컴포넌트
│   │   ├── OrderQueue.tsx  # 주문 대기열
│   │   ├── Inventory.tsx   # 재고 관리
│   │   └── Analytics.tsx   # 분석 차트
│   └── hq/                 # 본사용 컴포넌트
│       ├── StoreMap.tsx    # 점포 지도
│       ├── ApprovalList.tsx# 승인 목록
│       └── Dashboard.tsx   # 통합 대시보드
├── pages/                  # 페이지 컴포넌트
│   ├── customer/          # 고객 페이지
│   ├── store/             # 점주 페이지
│   └── hq/                # 본사 페이지
├── stores/                # 상태 관리 (Zustand)
│   ├── authStore.ts       # 인증 상태
│   ├── cartStore.ts       # 장바구니 상태
│   └── orderStore.ts      # 주문 상태
├── hooks/                 # 커스텀 훅
│   ├── useAuth.ts         # 인증 훅
│   ├── useOrder.ts        # 주문 훅
│   └── useRealtime.ts     # 실시간 훅
└── lib/                   # 유틸리티 라이브러리
    ├── supabase/          # Supabase 클라이언트
    ├── payment/           # 결제 처리
    └── utils/             # 공통 유틸
```

### 상태 관리 패턴
```typescript
// Zustand + React Query 조합
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {
    const { data } = await supabase.auth.signInWithPassword(credentials);
    set({ user: data.user, isAuthenticated: true });
  },
}));

// React Query로 서버 상태 관리
const useProducts = (storeId: string) => {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: () => fetchProducts(storeId),
    staleTime: 5 * 60 * 1000, // 5분
  });
};
```

## 🗄️ 백엔드 아키텍처 (Supabase)

### 데이터베이스 구조
```sql
-- 핵심 테이블 구조
profiles (사용자)
├── stores (점포) 
│   ├── store_products (점포별 상품)
│   └── orders (주문)
│       └── order_items (주문 상품)
├── products (상품 마스터)
│   └── categories (카테고리)
└── supply_requests (물류 요청)
    └── supply_request_items (요청 상품)
```

### 실시간 구독 패턴
```typescript
// 주문 상태 실시간 구독
useEffect(() => {
  const subscription = supabase
    .channel('orders')
    .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          // 주문 상태 업데이트 처리
          updateOrderStatus(payload.new);
        }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, []);
```

### Row Level Security (RLS) 정책
```sql
-- 고객은 자신의 주문만 조회 가능
CREATE POLICY customer_orders_policy ON orders
    FOR SELECT USING (
        auth.uid() = customer_id
    );

-- 점주는 자신의 점포 주문만 조회 가능  
CREATE POLICY store_orders_policy ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = orders.store_id 
            AND stores.owner_id = auth.uid()
        )
    );
```

## 🔄 데이터 플로우

### 주문 처리 플로우
```
1. 고객 주문 생성
   │
   ├── Frontend: 장바구니 → 주문 생성
   │
   ├── Backend: orders 테이블 INSERT
   │              ├── 재고 차감 (트리거)
   │              └── 점주 알림 전송
   │
   ├── Real-time: 점주 화면 업데이트
   │
   └── 점주 주문 처리
       │
       ├── 상태 변경 (준비중 → 완료)
       │
       ├── Backend: orders 테이블 UPDATE
       │
       └── Real-time: 고객 화면 업데이트
```

### 인증 플로우
```
1. 사용자 로그인
   │
   ├── Frontend: 로그인 폼 제출
   │
   ├── Supabase Auth: 인증 처리
   │              ├── JWT 토큰 발급
   │              └── 사용자 정보 반환
   │
   ├── Frontend: 상태 업데이트
   │
   └── Protected Route: 권한 확인 후 페이지 접근
```

## 🌐 배포 아키텍처

### 호스팅 구조
```
┌───────────────────────────────────────-──┐
│              Render.com                  │
│  ┌─────────────────────────────────────┐ │
│  │        Static Site Hosting          │ │
│  │  - React App Build (dist/)          │ │
│  │  - CDN 캐시 최적화                     │ │
│  │  - HTTPS 자동 설정                    │ │
│  │  - 자동 재배포 (Git 연동)               │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────-────┘
                    │
                    │ API Calls
                    ▼
┌────────────────────────────────────────-─┐
│            Supabase Cloud                │
│  ┌─────────────────────────────────────┐ │
│  │        Backend Services             │ │
│  │  - PostgreSQL Database              │ │
│  │  - Authentication                   │ │
│  │  - Real-time Engine                 │ │
│  │  - File Storage                     │ │
│  │  - Edge Functions                   │ │
│  └─────────────────────────────────────┘ │
└───────────────────────────────────-──────┘
```

### CI/CD 파이프라인
```
GitHub Repository
        │
        ├── Git Push to main branch
        │
        ├── Render.com Auto Deploy
        │     ├── npm install
        │     ├── npm run build
        │     └── Static Site Deploy
        │
        └── Production Ready
```

## 🔒 보안 아키텍처

### 인증 & 인가 체계
```
Client Request
     │
     ├── JWT Token 검증 (Supabase Auth)
     │     ├── 토큰 유효성 확인
     │     ├── 사용자 권한 확인
     │     └── 세션 상태 검증
     │
     ├── RLS Policy 적용
     │     ├── 테이블별 접근 권한 확인
     │     ├── 행별 데이터 필터링
     │     └── 작업별 권한 검증
     │
     └── API Response
```

### 데이터 보안
- **암호화**: 비밀번호 bcrypt 해싱
- **HTTPS**: 모든 통신 SSL/TLS 암호화
- **환경변수**: 민감 정보 환경변수 관리
- **API 키**: 클라이언트별 제한된 권한

## 📊 성능 최적화

### 프론트엔드 최적화
- **Code Splitting**: 역할별 번들 분할
- **Lazy Loading**: 컴포넌트 지연 로딩
- **Memoization**: React.memo, useMemo 활용
- **Virtual Scrolling**: 대용량 리스트 최적화

### 백엔드 최적화
- **Connection Pooling**: 데이터베이스 연결 풀링
- **Indexing**: 자주 조회하는 컬럼 인덱싱
- **Caching**: Query 결과 캐싱
- **Real-time Filtering**: 구독 필터링으로 네트워크 최적화

## 🔄 확장성 고려사항

### 수평적 확장
- **마이크로서비스**: 기능별 서비스 분리 가능
- **CDN**: 정적 자산 글로벌 배포
- **Load Balancing**: 트래픽 분산
- **Database Sharding**: 데이터 분할

### 기능 확장
- **Plugin Architecture**: 새로운 기능 모듈 추가
- **API Versioning**: 하위 호환성 유지
- **Event-Driven**: 이벤트 기반 시스템 확장
- **Third-party Integration**: 외부 서비스 연동 확장

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-17