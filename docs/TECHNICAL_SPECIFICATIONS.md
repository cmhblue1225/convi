# 편의점 종합 솔루션 v2.0 기술명세서

## 📋 문서 정보
- **작성일**: 2025년 1월 18일
- **작성자**: 개발팀
- **문서 버전**: 2.0
- **프로젝트**: 편의점 종합 솔루션
- **검토**: 기술리더, PM

---

## 🎯 개요

본 문서는 편의점 종합 솔루션 v2.0의 기술적 구현 방식과 시스템 아키텍처를 상세히 기술한다. React 18 기반의 프론트엔드와 Supabase를 활용한 백엔드 인프라를 통해 고객, 점주, 본사 관리자를 위한 통합 플랫폼을 구현하였다.

## 🏗️ 시스템 아키텍처

### 전체 시스템 구성

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React 18)    │◄──►│   (Supabase)    │◄──►│   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React Router  │    │ • PostgreSQL    │    │ • Toss Payments │
│ • Zustand       │    │ • Auth Service  │    │ • Google Maps   │
│ • React Query   │    │ • Realtime DB   │    │ • Email Service │
│ • Tailwind CSS  │    │ • Edge Functions│    │ • Push Notif.   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 기술 스택 선정 근거

**Frontend 기술 선택**
- **React 18**: 최신 Concurrent Features와 Automatic Batching을 활용한 성능 최적화
- **TypeScript**: 타입 안전성을 통한 런타임 오류 방지 및 개발 생산성 향상
- **Vite**: 빠른 개발 서버 및 번들링으로 개발 경험 개선
- **Tailwind CSS**: 유틸리티 퍼스트 접근으로 일관된 디자인 시스템 구축

**Backend 기술 선택**
- **Supabase**: PostgreSQL 기반으로 완전 관리형 백엔드 서비스 제공
- **Row Level Security**: 데이터베이스 레벨에서의 권한 제어로 보안 강화
- **Edge Functions**: 서버리스 환경에서 비즈니스 로직 실행

## 🔧 기술 구현 세부사항

### 1. 인증 및 권한 관리 시스템

#### 1.1 사용자 인증 구현

**JWT 기반 인증 시스템**
```typescript
// 인증 상태 관리 (Zustand)
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// 실제 구현에서 사용하는 인증 로직
const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // 프로필 정보 가져오기 및 역할 확인
    const profile = await getUserProfile(data.user.id);
    set({ user: data.user, session: data.session, profile });
  },
  
  // ... 기타 메서드들
}));
```

**역할 기반 접근 제어 (RBAC)**
```typescript
// 라우트 보호 컴포넌트
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallback = <Navigate to="/auth" />
}) => {
  const { user, profile } = useAuthStore();
  const isAuthorized = profile?.role === requiredRole || 
                      (Array.isArray(requiredRole) && requiredRole.includes(profile?.role));
  
  if (!user || !isAuthorized) {
    return fallback;
  }
  
  return <>{children}</>;
};

// 사용 예시
<ProtectedRoute requiredRole="store_owner">
  <StoreDashboard />
</ProtectedRoute>
```

#### 1.2 데이터베이스 보안 정책

**Row Level Security (RLS) 정책**
```sql
-- 고객 주문 접근 정책
CREATE POLICY "고객은 자신의 주문만 조회 가능" ON orders
FOR SELECT USING (
  auth.uid() = customer_id
);

-- 점주 매장 데이터 접근 정책  
CREATE POLICY "점주는 자신의 매장 데이터만 접근" ON orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN stores s ON s.owner_id = p.id
    WHERE p.id = auth.uid() 
    AND s.id = orders.store_id
    AND p.role = 'store_owner'
  )
);

-- 본사 전체 접근 정책
CREATE POLICY "본사는 모든 데이터 접근 가능" ON orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'headquarters'
  )
);
```

### 2. 실시간 데이터 처리

#### 2.1 Supabase Realtime 활용

**실시간 주문 상태 업데이트**
```typescript
// 실시간 구독 설정
const useRealtimeOrders = (storeId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    let subscription: RealtimeChannel;
    
    if (storeId) {
      // 특정 매장의 주문만 구독 (점주용)
      subscription = supabase
        .channel(`store-orders:${storeId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders',
            filter: `store_id=eq.${storeId}`
          },
          handleOrderChange
        )
        .subscribe();
    } else {
      // 모든 주문 구독 (본사용)
      subscription = supabase
        .channel('all-orders')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          handleOrderChange
        )
        .subscribe();
    }
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [storeId]);
  
  const handleOrderChange = (payload: any) => {
    switch (payload.eventType) {
      case 'INSERT':
        setOrders(prev => [...prev, payload.new]);
        // 새 주문 알림 표시
        showNotification('새로운 주문이 접수되었습니다!');
        break;
      case 'UPDATE':
        setOrders(prev => 
          prev.map(order => 
            order.id === payload.new.id ? payload.new : order
          )
        );
        break;
      case 'DELETE':
        setOrders(prev => prev.filter(order => order.id !== payload.old.id));
        break;
    }
  };
  
  return orders;
};
```

#### 2.2 상태 관리 최적화

**React Query를 활용한 서버 상태 관리**
```typescript
// 주문 데이터 캐싱 및 실시간 업데이트
const useOrders = (storeId?: string) => {
  const queryKey = storeId ? ['orders', storeId] : ['orders'];
  
  return useQuery({
    queryKey,
    queryFn: () => fetchOrders(storeId),
    staleTime: 30 * 1000, // 30초
    cacheTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // 1분마다 폴링
  });
};

// 주문 상태 업데이트 뮤테이션
const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusParams) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedOrder) => {
      // 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', updatedOrder.store_id] });
      
      // 옵티미스틱 업데이트
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
    },
  });
};
```

### 3. 결제 시스템 통합

#### 3.1 토스페이먼츠 연동

**결제 위젯 구현**
```typescript
// 토스페이먼츠 결제 위젯 컴포넌트
const TossPaymentWidget: React.FC<PaymentWidgetProps> = ({
  amount,
  orderId,
  customerName,
  onSuccess,
  onFail
}) => {
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  
  useEffect(() => {
    // 결제 위젯 초기화
    const loadPaymentWidget = async () => {
      const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk');
      
      const widget = await loadPaymentWidget(
        process.env.REACT_APP_TOSS_CLIENT_KEY!,
        PaymentWidget.WIDGET_TYPE.PAYMENT
      );
      
      widget.renderPaymentMethods({
        selector: '#payment-widget',
        variantKey: 'DEFAULT',
        amount: {
          currency: 'KRW',
          value: amount,
        },
      });
      
      widgetRef.current = widget;
    };
    
    loadPaymentWidget();
  }, [amount]);
  
  const handlePayment = async () => {
    try {
      await widgetRef.current?.requestPayment({
        orderId,
        orderName: `편의점 주문 #${orderId}`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: 'customer@example.com',
        customerName,
      });
    } catch (error) {
      console.error('결제 요청 실패:', error);
      onFail?.(error);
    }
  };
  
  return (
    <div className="payment-container">
      <div id="payment-widget" />
      <button 
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {amount.toLocaleString()}원 결제하기
      </button>
    </div>
  );
};
```

**결제 검증 시스템**
```typescript
// Edge Function을 활용한 결제 검증
export const verifyPayment = async (paymentKey: string, orderId: string, amount: number) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });
  
  if (!response.ok) {
    throw new Error('결제 검증 실패');
  }
  
  return response.json();
};

// Supabase Edge Function (verify-payment.ts)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { paymentKey, orderId, amount } = await req.json();
  
  // 토스페이먼츠 API로 결제 정보 확인
  const verificationResponse = await fetch(
    `https://api.tosspayments.com/v1/payments/${paymentKey}`,
    {
      headers: {
        'Authorization': `Basic ${btoa(TOSS_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const paymentData = await verificationResponse.json();
  
  // 결제 금액 및 주문 ID 검증
  if (paymentData.orderId === orderId && paymentData.totalAmount === amount) {
    // 주문 상태 업데이트
    await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        payment_key: paymentKey,
        status: 'confirmed' 
      })
      .eq('id', orderId);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ success: false, error: '결제 검증 실패' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### 4. 재고 관리 시스템

#### 4.1 실시간 재고 추적

**재고 트랜잭션 처리**
```typescript
// 재고 변동 처리 시스템
interface InventoryManager {
  // 재고 차감 (주문 시)
  deductStock: (storeProductId: string, quantity: number, orderId: string) => Promise<void>;
  
  // 재고 증가 (입고 시)
  addStock: (storeProductId: string, quantity: number, supplyRequestId: string) => Promise<void>;
  
  // 재고 조정 (실사 등)
  adjustStock: (storeProductId: string, newQuantity: number, reason: string) => Promise<void>;
}

const inventoryManager: InventoryManager = {
  deductStock: async (storeProductId, quantity, orderId) => {
    const { data, error } = await supabase.rpc('deduct_stock', {
      p_store_product_id: storeProductId,
      p_quantity: quantity,
      p_order_id: orderId,
    });
    
    if (error) throw error;
    
    // 재고 부족 시 알림
    if (data.new_stock_level <= data.minimum_stock) {
      await sendStockAlert(storeProductId, data.new_stock_level);
    }
  },
  
  addStock: async (storeProductId, quantity, supplyRequestId) => {
    await supabase.rpc('add_stock', {
      p_store_product_id: storeProductId,
      p_quantity: quantity,
      p_supply_request_id: supplyRequestId,
    });
  },
  
  adjustStock: async (storeProductId, newQuantity, reason) => {
    await supabase.rpc('adjust_stock', {
      p_store_product_id: storeProductId,
      p_new_quantity: newQuantity,
      p_reason: reason,
    });
  },
};
```

**PostgreSQL 함수를 활용한 원자적 재고 처리**
```sql
-- 재고 차감 함수 (동시성 제어 포함)
CREATE OR REPLACE FUNCTION deduct_stock(
  p_store_product_id UUID,
  p_quantity INTEGER,
  p_order_id UUID
) RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
  minimum_stock INTEGER;
  result JSON;
BEGIN
  -- 행 잠금을 통한 동시성 제어
  SELECT stock_quantity, minimum_stock_level
  INTO current_stock, minimum_stock
  FROM store_products 
  WHERE id = p_store_product_id
  FOR UPDATE;
  
  -- 재고 부족 검사
  IF current_stock < p_quantity THEN
    RAISE EXCEPTION '재고가 부족합니다. 현재 재고: %, 요청 수량: %', current_stock, p_quantity;
  END IF;
  
  -- 재고 차감
  new_stock := current_stock - p_quantity;
  
  UPDATE store_products 
  SET stock_quantity = new_stock,
      updated_at = NOW()
  WHERE id = p_store_product_id;
  
  -- 재고 이력 기록
  INSERT INTO inventory_transactions (
    store_product_id,
    transaction_type,
    quantity_change,
    reason,
    order_id,
    created_at
  ) VALUES (
    p_store_product_id,
    'out',
    -p_quantity,
    '주문 차감',
    p_order_id,
    NOW()
  );
  
  -- 결과 반환
  result := json_build_object(
    'success', true,
    'new_stock_level', new_stock,
    'minimum_stock', minimum_stock
  );
  
  RETURN result;
END;
$$;
```

#### 4.2 자동 발주 시스템

**AI 기반 수요 예측**
```typescript
// 판매 패턴 분석 및 발주 제안
interface DemandForecast {
  calculateReorderPoint: (productId: string, storeId: string) => Promise<ReorderSuggestion>;
  analyzeSalesPattern: (productId: string, days: number) => Promise<SalesPattern>;
  generateAutoOrders: (storeId: string) => Promise<AutoOrderSuggestion[]>;
}

const demandForecast: DemandForecast = {
  calculateReorderPoint: async (productId, storeId) => {
    // 과거 판매 데이터 분석
    const salesData = await supabase
      .from('order_items')
      .select(`
        quantity,
        orders!inner(created_at, store_id)
      `)
      .eq('orders.store_id', storeId)
      .eq('product_id', productId)
      .gte('orders.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('orders.created_at', { ascending: false });
    
    // 일평균 판매량 계산
    const dailySales = calculateDailySales(salesData.data || []);
    const averageDailySales = dailySales.reduce((sum, day) => sum + day.quantity, 0) / dailySales.length;
    
    // 리드타임 고려 (기본 2일)
    const leadTime = 2;
    const safetyStock = Math.ceil(averageDailySales * 0.5); // 안전재고 50%
    const reorderPoint = Math.ceil(averageDailySales * leadTime + safetyStock);
    
    return {
      productId,
      currentStock: await getCurrentStock(productId, storeId),
      reorderPoint,
      suggestedOrderQuantity: Math.ceil(averageDailySales * 7), // 일주일치
      confidence: calculateConfidence(salesData.data || []),
    };
  },
  
  // ... 기타 메서드들
};

// 자동 발주 배치 작업 (Supabase Edge Function)
const autoReorderJob = async () => {
  const stores = await supabase.from('stores').select('id');
  
  for (const store of stores.data || []) {
    const suggestions = await demandForecast.generateAutoOrders(store.id);
    
    // 임계값 이하 상품들에 대해 발주 요청 생성
    const urgentSuggestions = suggestions.filter(s => s.urgency === 'high' || s.urgency === 'critical');
    
    if (urgentSuggestions.length > 0) {
      await createSupplyRequest(store.id, urgentSuggestions);
      await sendStoreNotification(store.id, `${urgentSuggestions.length}개 상품의 발주가 필요합니다.`);
    }
  }
};
```

### 5. 성능 최적화

#### 5.1 프론트엔드 최적화

**코드 분할 및 지연 로딩**
```typescript
// 라우트 기반 코드 분할
const CustomerLayout = lazy(() => import('../pages/customer/CustomerLayout'));
const StoreLayout = lazy(() => import('../pages/store/StoreLayout'));
const HQLayout = lazy(() => import('../pages/hq/HQLayout'));

// 컴포넌트 지연 로딩
const ProductCatalog = lazy(() => import('../pages/customer/ProductCatalog'));
const StoreAnalytics = lazy(() => import('../pages/store/StoreAnalytics'));

// 이미지 지연 로딩 컴포넌트
const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
```

**메모이제이션 최적화**
```typescript
// React.memo를 활용한 불필요한 리렌더링 방지
const ProductCard = React.memo<ProductCardProps>(({ product, onAddToCart }) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(product.id);
  }, [product.id, onAddToCart]);
  
  return (
    <div className="product-card">
      <LazyImage src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price.toLocaleString()}원</p>
      <button onClick={handleAddToCart}>장바구니 담기</button>
    </div>
  );
});

// useMemo를 활용한 계산 최적화
const OrderSummary: React.FC<OrderSummaryProps> = ({ items }) => {
  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = Math.floor(subtotal * 0.1);
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  }, [items]);
  
  return (
    <div className="order-summary">
      <div>소계: {summary.subtotal.toLocaleString()}원</div>
      <div>부가세: {summary.taxAmount.toLocaleString()}원</div>
      <div>총계: {summary.total.toLocaleString()}원</div>
    </div>
  );
};
```

#### 5.2 백엔드 최적화

**데이터베이스 인덱스 최적화**
```sql
-- 주요 쿼리 성능을 위한 인덱스
CREATE INDEX CONCURRENTLY idx_orders_store_id_status 
ON orders(store_id, status) 
WHERE status IN ('pending', 'confirmed', 'preparing');

CREATE INDEX CONCURRENTLY idx_orders_customer_id_created_at 
ON orders(customer_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_store_products_store_id_available 
ON store_products(store_id) 
WHERE is_available = true;

CREATE INDEX CONCURRENTLY idx_inventory_transactions_store_product_id_created_at 
ON inventory_transactions(store_product_id, created_at DESC);

-- 복합 인덱스로 정렬 쿼리 최적화
CREATE INDEX CONCURRENTLY idx_products_category_name 
ON products(category_id, name);
```

**쿼리 최적화**
```sql
-- 점주 대시보드용 최적화된 뷰
CREATE MATERIALIZED VIEW store_dashboard_stats AS
SELECT 
  s.id as store_id,
  COALESCE(today_orders.order_count, 0) as today_orders,
  COALESCE(today_orders.total_amount, 0) as today_revenue,
  COALESCE(low_stock.count, 0) as low_stock_items,
  COALESCE(pending_orders.count, 0) as pending_orders
FROM stores s
LEFT JOIN (
  SELECT 
    store_id,
    COUNT(*) as order_count,
    SUM(total_amount) as total_amount
  FROM orders 
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY store_id
) today_orders ON s.id = today_orders.store_id
LEFT JOIN (
  SELECT 
    sp.store_id,
    COUNT(*) as count
  FROM store_products sp
  WHERE sp.stock_quantity <= sp.minimum_stock_level
  GROUP BY sp.store_id
) low_stock ON s.id = low_stock.store_id
LEFT JOIN (
  SELECT 
    store_id,
    COUNT(*) as count
  FROM orders
  WHERE status = 'pending'
  GROUP BY store_id
) pending_orders ON s.id = pending_orders.store_id;

-- 인덱스 생성
CREATE UNIQUE INDEX idx_store_dashboard_stats_store_id 
ON store_dashboard_stats(store_id);

-- 매시간 갱신
SELECT cron.schedule('refresh-dashboard-stats', '0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY store_dashboard_stats;');
```

### 6. 보안 구현

#### 6.1 입력 검증 및 필터링

**TypeScript 스키마 검증**
```typescript
import { z } from 'zod';

// 주문 생성 스키마
const createOrderSchema = z.object({
  storeId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1),
  orderType: z.enum(['pickup', 'delivery']),
  pickupTime: z.date().optional(),
  deliveryAddress: z.string().max(200).optional(),
  customerNotes: z.string().max(500).optional(),
});

// API 엔드포인트에서 검증
const createOrder = async (req: Request) => {
  try {
    const body = await req.json();
    const validatedData = createOrderSchema.parse(body);
    
    // 주문 생성 로직...
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.errors
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
};
```

#### 6.2 SQL 인젝션 방지

**매개변수화된 쿼리 사용**
```typescript
// 안전한 쿼리 실행
const searchProducts = async (searchTerm: string, categoryId?: string) => {
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      category:categories(name),
      images
    `)
    .ilike('name', `%${searchTerm}%`)
    .eq('is_active', true);
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query
    .order('name')
    .limit(50);
  
  if (error) throw error;
  return data;
};

// Edge Function에서 RLS 정책 활용
const getStoreOrders = async (req: Request) => {
  const user = await getUser(req);
  
  // RLS 정책이 자동으로 사용자 권한을 확인
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      customer:profiles(name, phone)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

### 7. 모니터링 및 로깅

#### 7.1 에러 추적 시스템

**에러 바운더리 구현**
```typescript
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅 서비스로 전송
    this.logError(error, errorInfo);
  }
  
  private logError = async (error: Error, errorInfo?: React.ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: this.props.userId,
    };
    
    try {
      await supabase.from('error_logs').insert(errorData);
    } catch (logError) {
      console.error('Error logging failed:', logError);
    }
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>문제가 발생했습니다</h2>
          <p>잠시 후 다시 시도해주세요.</p>
          <button onClick={() => window.location.reload()}>
            페이지 새로고침
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

#### 7.2 성능 모니터링

**성능 메트릭 수집**
```typescript
// 페이지 로드 성능 측정
const performanceMonitor = {
  measurePageLoad: () => {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        page: window.location.pathname,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: 0,
        firstContentfulPaint: 0,
        timestamp: new Date().toISOString(),
      };
      
      // Paint timing 측정
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });
      
      // 성능 데이터 전송
      supabase.from('performance_logs').insert(metrics);
    });
  },
  
  measureApiCall: async <T>(apiCall: () => Promise<T>, endpoint: string): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      
      // 성공한 API 호출 로깅
      supabase.from('api_performance_logs').insert({
        endpoint,
        duration: endTime - startTime,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      // 실패한 API 호출 로깅
      supabase.from('api_performance_logs').insert({
        endpoint,
        duration: endTime - startTime,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      
      throw error;
    }
  },
};
```

## 📈 성능 기준

### 응답 시간 목표
- **페이지 로드**: 2초 이내 (3G 환경)
- **API 응답**: 평균 200ms 이하
- **결제 처리**: 5초 이내
- **실시간 업데이트**: 1초 이내

### 동시 처리 능력
- **동시 사용자**: 1,000명
- **주문 처리**: 초당 100건
- **재고 업데이트**: 실시간 반영
- **알림 발송**: 1초 이내

### 가용성 목표
- **시스템 가동률**: 99.9%
- **데이터 백업**: 일 1회 자동
- **장애 복구**: 5분 이내
- **보안 패치**: 24시간 이내

## 🔍 테스트 전략

### 단위 테스트
```typescript
// Jest + React Testing Library
describe('ProductCard', () => {
  it('상품 정보를 올바르게 표시한다', () => {
    const mockProduct = {
      id: '1',
      name: '테스트 상품',
      price: 1000,
      image: 'test.jpg'
    };
    
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    expect(screen.getByText('1,000원')).toBeInTheDocument();
  });
  
  it('장바구니 담기 버튼이 작동한다', () => {
    const mockOnAddToCart = jest.fn();
    const mockProduct = { id: '1', name: '테스트 상품', price: 1000, image: 'test.jpg' };
    
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);
    
    fireEvent.click(screen.getByText('장바구니 담기'));
    expect(mockOnAddToCart).toHaveBeenCalledWith('1');
  });
});
```

### 통합 테스트
```typescript
// Cypress를 활용한 E2E 테스트
describe('주문 프로세스', () => {
  it('고객이 상품을 주문할 수 있다', () => {
    cy.login('customer@test.com', 'password123');
    cy.visit('/stores');
    
    // 매장 선택
    cy.get('[data-testid=store-card]').first().click();
    
    // 상품 선택
    cy.get('[data-testid=product-card]').first().click();
    cy.get('[data-testid=add-to-cart]').click();
    
    // 장바구니 확인
    cy.get('[data-testid=cart-icon]').click();
    cy.get('[data-testid=checkout-button]').click();
    
    // 결제 진행
    cy.get('[data-testid=payment-method]').select('card');
    cy.get('[data-testid=pay-button]').click();
    
    // 주문 완료 확인
    cy.url().should('include', '/orders/');
    cy.get('[data-testid=order-status]').should('contain', '주문 완료');
  });
});
```

## 📚 관련 문서

- [API 명세서](./api/API_OVERVIEW.md)
- [데이터베이스 스키마](./database/SCHEMA.md)
- [배포 가이드](./DEPLOYMENT_GUIDE.md)
- [보안 가이드](./SECURITY_GUIDE.md)
- [성능 최적화 가이드](./PERFORMANCE_GUIDE.md)

---

**문서 작성자**: 개발팀  
**마지막 업데이트**: 2025년 1월 18일  
**버전**: 2.0