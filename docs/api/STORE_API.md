# 점주 API 명세서

## 🏪 점주 API 개요

점주가 매장을 운영하는데 필요한 모든 기능을 제공하는 API로, 주문 관리, 재고 관리, 매출 분석, 물류 요청 등의 기능을 포함합니다.

## 📊 대시보드 관련 API

### 1. 점주 대시보드 데이터 조회

```typescript
// GET /api/store/dashboard
const getStoreDashboard = async (storeId: string) => {
  const { data, error } = await supabase.rpc('get_store_dashboard', {
    p_store_id: storeId
  });

  if (error) throw error;
  return data;
};
```

**응답 예시:**
```json
{
  "store_info": {
    "id": "store-uuid",
    "name": "편의점 강남점",
    "status": "approved",
    "is_open": true
  },
  "today_stats": {
    "total_orders": 45,
    "total_revenue": 234500,
    "pending_orders": 3,
    "completed_orders": 42
  },
  "recent_orders": [
    {
      "id": "order-uuid-1",
      "order_number": "ORD-20250813-001",
      "customer_name": "홍길동",
      "status": "pending",
      "total_amount": 15500,
      "order_type": "pickup",
      "created_at": "2025-08-13T10:30:00Z"
    }
  ],
  "low_stock_items": [
    {
      "product_name": "코카콜라 500ml",
      "current_stock": 5,
      "minimum_stock": 10
    }
  ],
  "notifications": [
    {
      "id": "notif-uuid-1",
      "type": "new_order",
      "title": "새 주문이 접수되었습니다",
      "message": "ORD-20250813-001 주문을 확인해주세요",
      "created_at": "2025-08-13T10:30:00Z",
      "is_read": false
    }
  ]
}
```

### 2. 매출 통계 조회

```typescript
// GET /api/store/analytics/sales
const getSalesAnalytics = async (
  storeId: string,
  params: {
    period: 'today' | 'week' | 'month' | 'custom';
    start_date?: string;
    end_date?: string;
  }
) => {
  const { data, error } = await supabase.rpc('get_sales_analytics', {
    p_store_id: storeId,
    p_period: params.period,
    p_start_date: params.start_date,
    p_end_date: params.end_date
  });

  if (error) throw error;
  return data;
};
```

## 📋 주문 관리 API

### 1. 주문 목록 조회

```typescript
// GET /api/store/orders
const getStoreOrders = async (
  storeId: string,
  params?: {
    status?: string[];
    order_type?: 'pickup' | 'delivery';
    date_from?: string;
    date_to?: string;
    customer_search?: string;
    limit?: number;
    offset?: number;
  }
) => {
  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      order_type,
      total_amount,
      pickup_time,
      delivery_address,
      customer_notes,
      payment_method,
      payment_status,
      created_at,
      updated_at,
      customer:profiles!customer_id (
        first_name,
        last_name,
        phone,
        email
      ),
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        store_product:store_products (
          product:products (
            name,
            image_urls
          )
        )
      )
    `)
    .eq('store_id', storeId);

  // 필터링
  if (params?.status && params.status.length > 0) {
    query = query.in('status', params.status);
  }

  if (params?.order_type) {
    query = query.eq('order_type', params.order_type);
  }

  if (params?.date_from) {
    query = query.gte('created_at', params.date_from);
  }

  if (params?.date_to) {
    query = query.lte('created_at', params.date_to);
  }

  if (params?.customer_search) {
    query = query.or(
      `customer.first_name.ilike.%${params.customer_search}%,` +
      `customer.last_name.ilike.%${params.customer_search}%,` +
      `customer.phone.ilike.%${params.customer_search}%`
    );
  }

  // 정렬 및 페이지네이션
  query = query.order('created_at', { ascending: false });

  if (params?.limit && params?.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { orders: data, total: count };
};
```

### 2. 주문 상세 조회

```typescript
// GET /api/store/orders/:orderId
const getOrderDetail = async (orderId: string, storeId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:profiles!customer_id (*),
      order_items (
        *,
        store_product:store_products (
          *,
          product:products (*)
        )
      ),
      order_status_history (
        id,
        status,
        notes,
        created_at,
        updated_by
      )
    `)
    .eq('id', orderId)
    .eq('store_id', storeId)
    .single();

  if (error) throw error;
  return data;
};
```

### 3. 주문 상태 업데이트

```typescript
// PUT /api/store/orders/:orderId/status
const updateOrderStatus = async (
  orderId: string,
  data: {
    status: 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    notes?: string;
    estimated_ready_time?: string; // preparing 상태일 때
  }
) => {
  const { data: result, error } = await supabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_new_status: data.status,
    p_notes: data.notes,
    p_estimated_ready_time: data.estimated_ready_time
  });

  if (error) throw error;
  return result;
};
```

### 4. 주문 접수 확인

```typescript
// PUT /api/store/orders/:orderId/confirm
const confirmOrder = async (
  orderId: string, 
  estimatedReadyTime?: string
) => {
  const { data, error } = await supabase.rpc('confirm_order', {
    p_order_id: orderId,
    p_estimated_ready_time: estimatedReadyTime
  });

  if (error) throw error;
  return data;
};
```

### 5. 주문 거부

```typescript
// PUT /api/store/orders/:orderId/reject
const rejectOrder = async (orderId: string, reason: string) => {
  const { data, error } = await supabase.rpc('reject_order', {
    p_order_id: orderId,
    p_reason: reason
  });

  if (error) throw error;
  return data;
};
```

## 📦 재고 관리 API

### 1. 매장 상품 목록 조회

```typescript
// GET /api/store/products
const getStoreProducts = async (
  storeId: string,
  params?: {
    category_id?: string;
    search?: string;
    stock_status?: 'all' | 'low_stock' | 'out_of_stock' | 'in_stock';
    is_available?: boolean;
    sort_by?: 'name' | 'stock_quantity' | 'price' | 'updated_at';
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }
) => {
  let query = supabase
    .from('store_products')
    .select(`
      id,
      product_id,
      price,
      stock_quantity,
      minimum_stock,
      discount_rate,
      is_available,
      last_restocked_at,
      created_at,
      updated_at,
      product:products (
        id,
        name,
        description,
        image_urls,
        barcode,
        brand,
        unit,
        category:categories (
          id,
          name,
          icon
        )
      )
    `)
    .eq('store_id', storeId);

  // 필터링
  if (params?.category_id) {
    query = query.eq('product.category_id', params.category_id);
  }

  if (params?.search) {
    query = query.or(
      `product.name.ilike.%${params.search}%,` +
      `product.barcode.ilike.%${params.search}%,` +
      `product.brand.ilike.%${params.search}%`
    );
  }

  if (params?.stock_status) {
    switch (params.stock_status) {
      case 'low_stock':
        query = query.filter('stock_quantity', 'lte', 'minimum_stock');
        break;
      case 'out_of_stock':
        query = query.eq('stock_quantity', 0);
        break;
      case 'in_stock':
        query = query.gt('stock_quantity', 0);
        break;
    }
  }

  if (params?.is_available !== undefined) {
    query = query.eq('is_available', params.is_available);
  }

  // 정렬
  const sortBy = params?.sort_by || 'updated_at';
  const sortOrder = params?.sort_order === 'asc' ? { ascending: true } : { ascending: false };
  query = query.order(sortBy, sortOrder);

  // 페이지네이션
  if (params?.limit && params?.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { products: data, total: count };
};
```

### 2. 재고 업데이트

```typescript
// PUT /api/store/products/:storeProductId/stock
const updateStock = async (
  storeProductId: string,
  data: {
    stock_quantity?: number;
    price?: number;
    discount_rate?: number;
    minimum_stock?: number;
    is_available?: boolean;
  }
) => {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString()
  };

  // 재고 변경 시 last_restocked_at 업데이트
  if (data.stock_quantity !== undefined) {
    updateData.last_restocked_at = new Date().toISOString();
  }

  const { data: result, error } = await supabase
    .from('store_products')
    .update(updateData)
    .eq('id', storeProductId)
    .select(`
      *,
      product:products (*)
    `)
    .single();

  if (error) throw error;

  // 재고 거래 내역 기록
  if (data.stock_quantity !== undefined) {
    await supabase
      .from('inventory_transactions')
      .insert({
        store_product_id: storeProductId,
        transaction_type: 'adjustment',
        quantity_change: data.stock_quantity, // 실제 변경량 계산 필요
        reason: 'manual_adjustment',
        notes: '점주 수동 조정'
      });
  }

  return result;
};
```

### 3. 대량 재고 업데이트

```typescript
// PUT /api/store/products/bulk-update
const bulkUpdateStock = async (
  updates: Array<{
    store_product_id: string;
    stock_quantity?: number;
    price?: number;
    is_available?: boolean;
  }>
) => {
  const { data, error } = await supabase.rpc('bulk_update_store_products', {
    p_updates: updates
  });

  if (error) throw error;
  return data;
};
```

### 4. 상품 추가 (카탈로그에서)

```typescript
// POST /api/store/products
const addProductToStore = async (data: {
  store_id: string;
  product_id: string;
  price: number;
  stock_quantity: number;
  minimum_stock?: number;
  discount_rate?: number;
}) => {
  const { data: result, error } = await supabase
    .from('store_products')
    .insert({
      ...data,
      is_available: true
    })
    .select(`
      *,
      product:products (*)
    `)
    .single();

  if (error) throw error;
  return result;
};
```

### 5. 상품 제거

```typescript
// DELETE /api/store/products/:storeProductId
const removeProductFromStore = async (storeProductId: string) => {
  const { error } = await supabase
    .from('store_products')
    .delete()
    .eq('id', storeProductId);

  if (error) throw error;
};
```

## 🚚 물류 요청 API

### 1. 물류 요청 목록 조회

```typescript
// GET /api/store/supply-requests
const getSupplyRequests = async (
  storeId: string,
  params?: {
    status?: string[];
    priority?: string[];
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }
) => {
  let query = supabase
    .from('supply_requests')
    .select(`
      id,
      request_number,
      status,
      priority,
      total_amount,
      requested_delivery_date,
      notes,
      created_at,
      updated_at,
      approved_at,
      approved_by,
      supply_request_items (
        id,
        quantity,
        unit_price,
        total_price,
        product:products (
          name,
          image_urls,
          unit
        )
      )
    `)
    .eq('store_id', storeId);

  // 필터링
  if (params?.status && params.status.length > 0) {
    query = query.in('status', params.status);
  }

  if (params?.priority && params.priority.length > 0) {
    query = query.in('priority', params.priority);
  }

  if (params?.date_from) {
    query = query.gte('created_at', params.date_from);
  }

  if (params?.date_to) {
    query = query.lte('created_at', params.date_to);
  }

  // 정렬 및 페이지네이션
  query = query.order('created_at', { ascending: false });

  if (params?.limit && params?.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { requests: data, total: count };
};
```

### 2. 물류 요청 생성

```typescript
// POST /api/store/supply-requests
const createSupplyRequest = async (data: {
  store_id: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requested_delivery_date?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}) => {
  const { data: result, error } = await supabase.rpc('create_supply_request', {
    p_store_id: data.store_id,
    p_priority: data.priority,
    p_requested_delivery_date: data.requested_delivery_date,
    p_notes: data.notes,
    p_items: data.items
  });

  if (error) throw error;
  return result;
};
```

### 3. 물류 요청 상세 조회

```typescript
// GET /api/store/supply-requests/:requestId
const getSupplyRequestDetail = async (requestId: string, storeId: string) => {
  const { data, error } = await supabase
    .from('supply_requests')
    .select(`
      *,
      supply_request_items (
        *,
        product:products (*)
      ),
      approved_by_profile:profiles!approved_by (
        first_name,
        last_name
      ),
      shipments (
        id,
        tracking_number,
        status,
        estimated_delivery_date,
        actual_delivery_date,
        notes
      )
    `)
    .eq('id', requestId)
    .eq('store_id', storeId)
    .single();

  if (error) throw error;
  return data;
};
```

### 4. 물류 요청 수정

```typescript
// PUT /api/store/supply-requests/:requestId
const updateSupplyRequest = async (
  requestId: string,
  data: {
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    requested_delivery_date?: string;
    notes?: string;
    items?: Array<{
      id?: string; // 기존 아이템 수정용
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
  }
) => {
  const { data: result, error } = await supabase.rpc('update_supply_request', {
    p_request_id: requestId,
    p_priority: data.priority,
    p_requested_delivery_date: data.requested_delivery_date,
    p_notes: data.notes,
    p_items: data.items
  });

  if (error) throw error;
  return result;
};
```

### 5. 물류 요청 제출

```typescript
// PUT /api/store/supply-requests/:requestId/submit
const submitSupplyRequest = async (requestId: string) => {
  const { data, error } = await supabase
    .from('supply_requests')
    .update({ 
      status: 'submitted',
      submitted_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'draft') // 초안 상태에서만 제출 가능
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### 6. 물류 요청 취소

```typescript
// PUT /api/store/supply-requests/:requestId/cancel
const cancelSupplyRequest = async (requestId: string, reason?: string) => {
  const { data, error } = await supabase.rpc('cancel_supply_request', {
    p_request_id: requestId,
    p_reason: reason
  });

  if (error) throw error;
  return data;
};
```

## 📊 매출 분석 API

### 1. 일별 매출 조회

```typescript
// GET /api/store/analytics/daily-sales
const getDailySales = async (
  storeId: string,
  params: {
    start_date: string;
    end_date: string;
  }
) => {
  const { data, error } = await supabase
    .from('daily_sales_summary')
    .select('*')
    .eq('store_id', storeId)
    .gte('sale_date', params.start_date)
    .lte('sale_date', params.end_date)
    .order('sale_date', { ascending: true });

  if (error) throw error;
  return data;
};
```

### 2. 상품별 매출 조회

```typescript
// GET /api/store/analytics/product-sales
const getProductSales = async (
  storeId: string,
  params: {
    start_date: string;
    end_date: string;
    limit?: number;
  }
) => {
  const { data, error } = await supabase
    .from('product_sales_summary')
    .select(`
      *,
      product:products (
        name,
        image_urls,
        category:categories (name)
      )
    `)
    .eq('store_id', storeId)
    .gte('sale_date', params.start_date)
    .lte('sale_date', params.end_date)
    .order('total_revenue', { ascending: false });

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (error) throw error;
  return data;
};
```

### 3. 시간대별 매출 조회

```typescript
// GET /api/store/analytics/hourly-sales
const getHourlySales = async (storeId: string, date: string) => {
  const { data, error } = await supabase.rpc('get_hourly_sales', {
    p_store_id: storeId,
    p_date: date
  });

  if (error) throw error;
  return data;
};
```

## 🏪 매장 정보 관리 API

### 1. 매장 정보 조회

```typescript
// GET /api/store/info
const getStoreInfo = async (storeId: string) => {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      owner:profiles!owner_id (
        first_name,
        last_name,
        phone,
        email
      )
    `)
    .eq('id', storeId)
    .single();

  if (error) throw error;
  return data;
};
```

### 2. 매장 정보 업데이트

```typescript
// PUT /api/store/info
const updateStoreInfo = async (
  storeId: string,
  data: {
    name?: string;
    phone?: string;
    business_hours?: Record<string, any>;
    description?: string;
    delivery_radius?: number;
    minimum_order_amount?: number;
  }
) => {
  const { data: result, error } = await supabase
    .from('stores')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', storeId)
    .select()
    .single();

  if (error) throw error;
  return result;
};
```

### 3. 매장 운영 상태 변경

```typescript
// PUT /api/store/operating-status
const updateOperatingStatus = async (
  storeId: string,
  isOpen: boolean,
  reason?: string
) => {
  const { data, error } = await supabase
    .from('stores')
    .update({
      is_open: isOpen,
      updated_at: new Date().toISOString()
    })
    .eq('id', storeId)
    .select()
    .single();

  if (error) throw error;

  // 상태 변경 로그 기록
  await supabase
    .from('store_operation_logs')
    .insert({
      store_id: storeId,
      action: isOpen ? 'opened' : 'closed',
      reason: reason,
      timestamp: new Date().toISOString()
    });

  return data;
};
```

## 🔔 알림 관리 API

### 1. 알림 목록 조회

```typescript
// GET /api/store/notifications
const getStoreNotifications = async (
  storeId: string,
  params?: {
    type?: string;
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('store_id', storeId);

  if (params?.type) {
    query = query.eq('type', params.type);
  }

  if (params?.is_read !== undefined) {
    query = query.eq('is_read', params.is_read);
  }

  query = query.order('created_at', { ascending: false });

  if (params?.limit && params?.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { notifications: data, total: count };
};
```

### 2. 알림 읽음 처리

```typescript
// PUT /api/store/notifications/:notificationId/read
const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

## 🔄 실시간 구독

### 새 주문 실시간 수신

```typescript
// 매장별 새 주문 구독
const subscribeToNewOrders = (storeId: string, callback: (order: any) => void) => {
  return supabase
    .channel(`store-orders-${storeId}`)
    .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`
        },
        (payload) => {
          callback(payload.new);
        }
    )
    .subscribe();
};
```

### 주문 상태 변경 알림

```typescript
// 주문 상태 변경 구독
const subscribeToOrderStatusChanges = (storeId: string, callback: (order: any) => void) => {
  return supabase
    .channel(`store-order-updates-${storeId}`)
    .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`
        },
        (payload) => {
          callback(payload.new);
        }
    )
    .subscribe();
};
```

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-13