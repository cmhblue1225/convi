# 고객 API 명세서

## 🛒 고객 API 개요

고객 관련 모든 기능을 제공하는 API로, 상품 조회, 주문 생성, 결제, 주문 추적 등의 기능을 포함합니다.

## 🏪 매장 관련 API

### 1. 매장 목록 조회

```typescript
// GET /api/customer/stores
const getStores = async (params?: {
  latitude?: number;
  longitude?: number;
  radius?: number; // km 단위
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('stores')
    .select(`
      id,
      name,
      address,
      phone,
      latitude,
      longitude,
      business_hours,
      is_open,
      rating,
      image_url,
      created_at
    `)
    .eq('status', 'approved')
    .eq('is_active', true);

  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,address.ilike.%${params.search}%`);
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, (params.offset + (params.limit || 20)) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { stores: data, total: count };
};
```

**응답 예시:**
```json
{
  "stores": [
    {
      "id": "store-uuid-1",
      "name": "편의점 강남점",
      "address": "서울시 강남구 테헤란로 123",
      "phone": "02-1234-5678",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "business_hours": {
        "monday": { "open": "06:00", "close": "24:00" },
        "tuesday": { "open": "06:00", "close": "24:00" }
      },
      "is_open": true,
      "rating": 4.5,
      "image_url": "https://example.com/store1.jpg",
      "created_at": "2025-08-01T00:00:00Z"
    }
  ],
  "total": 25
}
```

### 2. 매장 상세 정보 조회

```typescript
// GET /api/customer/stores/:storeId
const getStoreDetail = async (storeId: string) => {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      owner:profiles!owner_id (
        first_name,
        last_name,
        phone
      )
    `)
    .eq('id', storeId)
    .eq('status', 'approved')
    .single();

  if (error) throw error;
  return data;
};
```

## 📦 상품 관련 API

### 1. 매장별 상품 목록 조회

```typescript
// GET /api/customer/stores/:storeId/products
const getStoreProducts = async (
  storeId: string, 
  params?: {
    category_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    is_available?: boolean;
    sort_by?: 'name' | 'price' | 'created_at';
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
      store_id,
      price,
      stock_quantity,
      discount_rate,
      is_available,
      created_at,
      updated_at,
      product:products (
        id,
        name,
        description,
        image_urls,
        category_id,
        barcode,
        brand,
        unit,
        categories (
          id,
          name,
          icon
        )
      ),
      store:stores (
        id,
        name
      )
    `)
    .eq('store_id', storeId)
    .eq('is_available', true);

  // 필터링
  if (params?.category_id) {
    query = query.eq('product.category_id', params.category_id);
  }

  if (params?.search) {
    query = query.ilike('product.name', `%${params.search}%`);
  }

  if (params?.min_price) {
    query = query.gte('price', params.min_price);
  }

  if (params?.max_price) {
    query = query.lte('price', params.max_price);
  }

  // 정렬
  const sortBy = params?.sort_by || 'created_at';
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

### 2. 상품 상세 정보 조회

```typescript
// GET /api/customer/products/:productId
const getProductDetail = async (productId: string, storeId?: string) => {
  let query = supabase
    .from('store_products')
    .select(`
      *,
      product:products (*),
      store:stores (
        id,
        name,
        address,
        phone
      )
    `)
    .eq('product_id', productId);

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

### 3. 카테고리 목록 조회

```typescript
// GET /api/customer/categories
const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
};
```

## 🛒 장바구니 관련 API

### 1. 장바구니 조회

```typescript
// GET /api/customer/cart
const getCart = async (customerId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      options,
      created_at,
      store_product:store_products (
        *,
        product:products (*),
        store:stores (id, name)
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
```

### 2. 장바구니에 상품 추가

```typescript
// POST /api/customer/cart/items
const addToCart = async (data: {
  customer_id: string;
  store_product_id: string;
  quantity: number;
  options?: Record<string, any>;
}) => {
  // 재고 확인
  const { data: storeProduct, error: stockError } = await supabase
    .from('store_products')
    .select('stock_quantity, is_available')
    .eq('id', data.store_product_id)
    .single();

  if (stockError) throw stockError;

  if (!storeProduct.is_available) {
    throw new Error('현재 판매하지 않는 상품입니다.');
  }

  if (storeProduct.stock_quantity < data.quantity) {
    throw new Error('재고가 부족합니다.');
  }

  // 기존 장바구니 아이템 확인
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('customer_id', data.customer_id)
    .eq('store_product_id', data.store_product_id)
    .single();

  if (existingItem) {
    // 기존 아이템 수량 업데이트
    const newQuantity = existingItem.quantity + data.quantity;
    
    if (newQuantity > storeProduct.stock_quantity) {
      throw new Error('재고를 초과할 수 없습니다.');
    }

    const { data: updated, error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } else {
    // 새 아이템 추가
    const { data: newItem, error } = await supabase
      .from('cart_items')
      .insert({
        customer_id: data.customer_id,
        store_product_id: data.store_product_id,
        quantity: data.quantity,
        options: data.options
      })
      .select()
      .single();

    if (error) throw error;
    return newItem;
  }
};
```

### 3. 장바구니 상품 수량 변경

```typescript
// PUT /api/customer/cart/items/:itemId
const updateCartItem = async (
  itemId: string, 
  data: { quantity: number }
) => {
  const { data: updated, error } = await supabase
    .from('cart_items')
    .update({ quantity: data.quantity })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return updated;
};
```

### 4. 장바구니 상품 삭제

```typescript
// DELETE /api/customer/cart/items/:itemId
const removeFromCart = async (itemId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};
```

### 5. 장바구니 비우기

```typescript
// DELETE /api/customer/cart
const clearCart = async (customerId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('customer_id', customerId);

  if (error) throw error;
};
```

## 📋 주문 관련 API

### 1. 주문 생성

```typescript
// POST /api/customer/orders
const createOrder = async (orderData: {
  customer_id: string;
  store_id: string;
  order_type: 'pickup' | 'delivery';
  pickup_time?: string;
  delivery_address?: string;
  customer_notes?: string;
  payment_method: string;
  items: Array<{
    store_product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  coupon_code?: string;
  points_used?: number;
}) => {
  // 트랜잭션으로 주문 생성
  const { data, error } = await supabase.rpc('create_order_transaction', {
    p_customer_id: orderData.customer_id,
    p_store_id: orderData.store_id,
    p_order_type: orderData.order_type,
    p_pickup_time: orderData.pickup_time,
    p_delivery_address: orderData.delivery_address,
    p_customer_notes: orderData.customer_notes,
    p_payment_method: orderData.payment_method,
    p_items: orderData.items,
    p_coupon_code: orderData.coupon_code,
    p_points_used: orderData.points_used
  });

  if (error) throw error;
  return data;
};
```

**요청 예시:**
```json
{
  "customer_id": "customer-uuid",
  "store_id": "store-uuid",
  "order_type": "pickup",
  "pickup_time": "2025-08-13T15:30:00Z",
  "customer_notes": "빨대 추가해주세요",
  "payment_method": "toss_pay",
  "items": [
    {
      "store_product_id": "sp-uuid-1",
      "quantity": 2,
      "unit_price": 1500
    },
    {
      "store_product_id": "sp-uuid-2",
      "quantity": 1,
      "unit_price": 2500
    }
  ],
  "coupon_code": "WELCOME10",
  "points_used": 500
}
```

### 2. 주문 목록 조회

```typescript
// GET /api/customer/orders
const getCustomerOrders = async (
  customerId: string,
  params?: {
    status?: string[];
    order_type?: 'pickup' | 'delivery';
    from_date?: string;
    to_date?: string;
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
      created_at,
      updated_at,
      store:stores (
        id,
        name,
        address,
        phone
      ),
      order_items (
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
    .eq('customer_id', customerId);

  // 필터링
  if (params?.status && params.status.length > 0) {
    query = query.in('status', params.status);
  }

  if (params?.order_type) {
    query = query.eq('order_type', params.order_type);
  }

  if (params?.from_date) {
    query = query.gte('created_at', params.from_date);
  }

  if (params?.to_date) {
    query = query.lte('created_at', params.to_date);
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

### 3. 주문 상세 조회

```typescript
// GET /api/customer/orders/:orderId
const getOrderDetail = async (orderId: string, customerId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      store:stores (*),
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
        created_at
      )
    `)
    .eq('id', orderId)
    .eq('customer_id', customerId)
    .single();

  if (error) throw error;
  return data;
};
```

### 4. 주문 취소

```typescript
// PUT /api/customer/orders/:orderId/cancel
const cancelOrder = async (orderId: string, reason?: string) => {
  const { data, error } = await supabase.rpc('cancel_order', {
    p_order_id: orderId,
    p_reason: reason
  });

  if (error) throw error;
  return data;
};
```

## 💳 결제 관련 API

### 1. 결제 준비

```typescript
// POST /api/customer/orders/:orderId/payments/prepare
const preparePayment = async (orderId: string, paymentMethod: string) => {
  const { data, error } = await supabase.rpc('prepare_payment', {
    p_order_id: orderId,
    p_payment_method: paymentMethod
  });

  if (error) throw error;
  return data;
};
```

### 2. 결제 완료 처리

```typescript
// POST /api/customer/orders/:orderId/payments/complete
const completePayment = async (data: {
  order_id: string;
  payment_key: string;
  amount: number;
  payment_method: string;
}) => {
  const { data: result, error } = await supabase.rpc('complete_payment', {
    p_order_id: data.order_id,
    p_payment_key: data.payment_key,
    p_amount: data.amount,
    p_payment_method: data.payment_method
  });

  if (error) throw error;
  return result;
};
```

## 🎫 쿠폰 관련 API

### 1. 사용 가능한 쿠폰 조회

```typescript
// GET /api/customer/coupons
const getAvailableCoupons = async (customerId: string) => {
  const { data, error } = await supabase
    .from('user_coupons')
    .select(`
      id,
      is_used,
      expires_at,
      coupon:coupons (
        id,
        code,
        name,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount_amount
      )
    `)
    .eq('user_id', customerId)
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString());

  if (error) throw error;
  return data;
};
```

### 2. 쿠폰 적용 가능 여부 확인

```typescript
// POST /api/customer/coupons/validate
const validateCoupon = async (data: {
  coupon_code: string;
  order_amount: number;
  customer_id: string;
}) => {
  const { data: result, error } = await supabase.rpc('validate_coupon', {
    p_coupon_code: data.coupon_code,
    p_order_amount: data.order_amount,
    p_customer_id: data.customer_id
  });

  if (error) throw error;
  return result;
};
```

## 🏆 포인트 관련 API

### 1. 포인트 내역 조회

```typescript
// GET /api/customer/points
const getPointHistory = async (
  customerId: string,
  params?: {
    type?: 'earned' | 'used' | 'expired';
    limit?: number;
    offset?: number;
  }
) => {
  let query = supabase
    .from('points')
    .select('*')
    .eq('user_id', customerId);

  if (params?.type) {
    query = query.eq('type', params.type);
  }

  query = query.order('created_at', { ascending: false });

  if (params?.limit && params?.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { points: data, total: count };
};
```

### 2. 포인트 잔액 조회

```typescript
// GET /api/customer/points/balance
const getPointBalance = async (customerId: string) => {
  const { data, error } = await supabase.rpc('get_point_balance', {
    p_user_id: customerId
  });

  if (error) throw error;
  return data;
};
```

## 🔔 알림 관련 API

### 1. 알림 목록 조회

```typescript
// GET /api/customer/notifications
const getNotifications = async (
  customerId: string,
  params?: {
    is_read?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
  }
) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', customerId);

  if (params?.is_read !== undefined) {
    query = query.eq('is_read', params.is_read);
  }

  if (params?.type) {
    query = query.eq('type', params.type);
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
// PUT /api/customer/notifications/:notificationId/read
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

### 주문 상태 실시간 업데이트

```typescript
// 특정 주문의 상태 변경 구독
const subscribeToOrderUpdates = (orderId: string, callback: (order: any) => void) => {
  return supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          callback(payload.new);
        }
    )
    .subscribe();
};
```

### 새로운 알림 실시간 수신

```typescript
// 고객별 새 알림 구독
const subscribeToNotifications = (customerId: string, callback: (notification: any) => void) => {
  return supabase
    .channel(`customer-notifications-${customerId}`)
    .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${customerId}`
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