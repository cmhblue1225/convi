# API 개요 및 설계 원칙

## 🎯 API 설계 철학

### 핵심 원칙
1. **RESTful 설계**: HTTP 메서드와 상태 코드를 표준에 맞게 활용
2. **Supabase 네이티브**: PostgreSQL과 RLS(Row Level Security) 활용
3. **실시간 우선**: Real-time subscription 기반 즉시 반영
4. **보안 중심**: JWT 토큰 기반 인증과 역할별 권한 제어
5. **타입 안전성**: TypeScript 기반 완전한 타입 정의

## 🔗 API 구조 개요

### Supabase 클라이언트 기반 아키텍처
```typescript
// 클라이언트 초기화
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

### API 카테고리
```
Supabase API 구조
├── Authentication API       # 사용자 인증 관리
├── Customer API            # 고객 기능 (주문, 결제, 추적)
├── Store API              # 점주 기능 (재고, 주문 관리)
├── Headquarters API       # 본사 기능 (승인, 분석)
├── Real-time API         # 실시간 구독 및 알림
└── File Storage API      # 파일 업로드 및 관리
```

## 📊 데이터베이스 접근 패턴

### 직접 쿼리 (Direct Query)
```typescript
// 기본 CRUD 작업
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .order('name', { ascending: true });
```

### 관계형 쿼리 (Relational Query)
```typescript
// JOIN을 통한 관계형 데이터 조회
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    customer:profiles!customer_id(*),
    store:stores(*),
    order_items(
      *,
      product:products(*)
    )
  `)
  .eq('store_id', storeId);
```

### 실시간 구독 (Real-time Subscription)
```typescript
// 데이터 변경사항 실시간 구독
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        // 주문 상태 변경 처리
        handleOrderUpdate(payload.new);
      }
  )
  .subscribe();
```

## 🔒 인증 및 권한 시스템

### JWT 토큰 기반 인증
```typescript
// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// 자동 토큰 갱신
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // 사용자 정보 업데이트
    setUser(session?.user);
  }
});
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

-- 본사는 모든 데이터 접근 가능
CREATE POLICY hq_all_access ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'headquarters'
        )
    );
```

## 📝 API 응답 형식

### 표준 응답 구조
```typescript
interface ApiResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
  count?: number; // 전체 개수 (페이지네이션)
  status: number;  // HTTP 상태 코드
}
```

### 성공 응답 예시
```json
{
  "data": [
    {
      "id": "uuid-here",
      "name": "상품명",
      "price": 1500,
      "created_at": "2025-08-12T10:00:00Z"
    }
  ],
  "error": null,
  "count": 1,
  "status": 200
}
```

### 에러 응답 예시
```json
{
  "data": null,
  "error": {
    "message": "새 행이 테이블 \"orders\"에 대한 행 보안 정책을 위반했습니다",
    "details": "Failing row contains (...)",
    "hint": "권한이 없는 리소스에 접근하려고 시도했습니다",
    "code": "42501"
  },
  "status": 403
}
```

## 🔄 실시간 기능

### Channel 기반 실시간 통신
```typescript
// 주문 상태 실시간 업데이트
const orderChannel = supabase
  .channel(`order-${orderId}`)
  .on('postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      (payload) => {
        setOrder(payload.new);
      }
  )
  .subscribe();

// 점포별 새 주문 알림
const storeOrdersChannel = supabase
  .channel(`store-orders-${storeId}`)
  .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `store_id=eq.${storeId}`
      },
      (payload) => {
        showNewOrderNotification(payload.new);
      }
  )
  .subscribe();
```

### Presence (온라인 상태)
```typescript
// 점주 온라인 상태 관리
const presenceChannel = supabase.channel('store-owners');

// 온라인 상태 설정
presenceChannel.on('presence', { event: 'sync' }, () => {
  const onlineStoreOwners = presenceChannel.presenceState();
  updateOnlineStatus(onlineStoreOwners);
});

// 온라인 상태 전송
presenceChannel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await presenceChannel.track({
      store_id: storeId,
      online_at: new Date().toISOString(),
    });
  }
});
```

## 📊 페이지네이션 및 필터링

### 페이지네이션
```typescript
// 페이지네이션 구현
const fetchProducts = async (page: number, limit: number = 20) => {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  return {
    products: data,
    totalCount: count,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  };
};
```

### 필터링 및 검색
```typescript
// 복합 필터링
const searchProducts = async (filters: {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  searchTerm?: string;
}) => {
  let query = supabase
    .from('store_products')
    .select(`
      *,
      product:products(*),
      store:stores(*)
    `);

  if (filters.category) {
    query = query.eq('product.category_id', filters.category);
  }

  if (filters.priceMin) {
    query = query.gte('price', filters.priceMin);
  }

  if (filters.priceMax) {
    query = query.lte('price', filters.priceMax);
  }

  if (filters.searchTerm) {
    query = query.ilike('product.name', `%${filters.searchTerm}%`);
  }

  return query.eq('is_available', true);
};
```

## 🚀 성능 최적화

### 쿼리 최적화
```typescript
// 필요한 컬럼만 선택
const { data } = await supabase
  .from('orders')
  .select('id, status, total_amount, created_at')
  .eq('customer_id', userId)
  .limit(10);

// 인덱스 활용을 위한 쿼리 작성
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('store_id', storeId)  // 인덱스 컬럼 우선
  .eq('status', 'pending')   // 선택성 높은 조건
  .order('created_at', { ascending: false });
```

### 캐싱 전략
```typescript
// React Query와 함께 사용
const useProducts = (storeId: string) => {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: () => fetchStoreProducts(storeId),
    staleTime: 5 * 60 * 1000, // 5분 캐시
    cacheTime: 10 * 60 * 1000, // 10분 보관
  });
};
```

## 🔧 에러 처리

### 에러 카테고리
1. **인증 에러**: 401 Unauthorized
2. **권한 에러**: 403 Forbidden  
3. **데이터 에러**: 400 Bad Request
4. **서버 에러**: 500 Internal Server Error

### 에러 처리 패턴
```typescript
const handleApiError = (error: any) => {
  if (error?.code === '42501') {
    // RLS 정책 위반
    toast.error('접근 권한이 없습니다.');
    return;
  }

  if (error?.code === '23505') {
    // 고유 제약 조건 위반
    toast.error('이미 존재하는 데이터입니다.');
    return;
  }

  if (error?.message?.includes('JWT')) {
    // JWT 토큰 문제
    signOut();
    return;
  }

  // 일반적인 에러
  toast.error(error?.message || '알 수 없는 오류가 발생했습니다.');
};
```

## 📈 API 모니터링

### 성능 지표
- **응답 시간**: 평균 200ms 이하
- **성공률**: 99.9% 이상
- **동시 접속**: 1,000명 지원
- **실시간 지연**: 100ms 이하

### 로깅 및 디버깅
```typescript
// 개발 환경에서 쿼리 로깅
if (process.env.NODE_ENV === 'development') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session?.user?.email);
  });
}

// API 호출 로깅
const logQuery = (table: string, operation: string, params: any) => {
  console.log(`[API] ${operation} ${table}:`, params);
};
```

## 🔄 API 버전 관리

### 스키마 진화
- **하위 호환성**: 기존 API 유지
- **점진적 마이그레이션**: 단계적 업데이트
- **명확한 문서화**: 변경 사항 상세 기록

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-17