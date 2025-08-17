# 본사 관리자 API 명세서

## 🏢 본사 관리자 API 개요

본사 관리자가 전체 편의점 네트워크를 관리하는데 필요한 모든 기능을 제공하는 API로, 매장 승인, 물류 관리, 전체 분석, 시스템 관리 등의 기능을 포함합니다.

## 📊 통합 대시보드 API

### 1. 통합 대시보드 데이터 조회

```typescript
// GET /api/hq/dashboard
const getHQDashboard = async () => {
  const { data, error } = await supabase.rpc('get_hq_dashboard');

  if (error) throw error;
  return data;
};
```

**응답 예시:**
```json
{
  "overview": {
    "total_stores": 156,
    "active_stores": 142,
    "pending_approvals": 8,
    "total_orders_today": 1247,
    "total_revenue_today": 18750000,
    "growth_rate": 12.5
  },
  "regional_stats": [
    {
      "region": "서울",
      "store_count": 45,
      "revenue": 8500000,
      "order_count": 567
    },
    {
      "region": "부산",
      "store_count": 23,
      "revenue": 3200000,
      "order_count": 234
    }
  ],
  "top_performing_stores": [
    {
      "store_id": "store-uuid-1",
      "store_name": "편의점 강남점",
      "revenue": 450000,
      "order_count": 78,
      "growth_rate": 15.2
    }
  ],
  "urgent_notifications": [
    {
      "id": "notif-uuid-1",
      "type": "store_approval",
      "title": "새로운 매장 승인 요청",
      "store_name": "편의점 신촌점",
      "created_at": "2025-08-13T10:30:00Z"
    }
  ],
  "system_health": {
    "api_response_time": 120,
    "database_status": "healthy",
    "payment_system_status": "healthy",
    "error_rate": 0.02
  }
}
```

### 2. 지역별 성과 분석

```typescript
// GET /api/hq/analytics/regional
const getRegionalAnalytics = async (params: {
  period: 'today' | 'week' | 'month' | 'quarter';
  region?: string;
}) => {
  const { data, error } = await supabase.rpc('get_regional_analytics', {
    p_period: params.period,
    p_region: params.region
  });

  if (error) throw error;
  return data;
};
```

## 🏪 매장 관리 API

### 1. 매장 승인 대기 목록 조회

```typescript
// GET /api/hq/stores/pending-approval
const getPendingStores = async (params?: {
  sort_by?: 'created_at' | 'priority' | 'region';
  sort_order?: 'asc' | 'desc';
  region?: string;
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
      business_license,
      region,
      created_at,
      priority,
      documents,
      owner:profiles!owner_id (
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('status', 'pending');

  // 필터링
  if (params?.region) {
    query = query.eq('region', params.region);
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

  return { stores: data, total: count };
};
```

### 2. 매장 승인 처리

```typescript
// PUT /api/hq/stores/:storeId/approve
const approveStore = async (
  storeId: string, 
  data: {
    approved: boolean;
    notes?: string;
    conditions?: string[];
  }
) => {
  const { data: result, error } = await supabase.rpc('process_store_approval', {
    p_store_id: storeId,
    p_approved: data.approved,
    p_notes: data.notes,
    p_conditions: data.conditions
  });

  if (error) throw error;
  return result;
};
```

**요청 예시:**
```json
{
  "approved": true,
  "notes": "모든 서류가 적합하며 위치도 양호함",
  "conditions": [
    "개점 후 1개월 내 실적 보고",
    "위생 관리 교육 이수 필수"
  ]
}
```

### 3. 전체 매장 목록 조회

```typescript
// GET /api/hq/stores
const getAllStores = async (params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  region?: string;
  search?: string;
  sort_by?: 'name' | 'created_at' | 'revenue' | 'order_count';
  sort_order?: 'asc' | 'desc';
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
      status,
      region,
      is_active,
      is_open,
      created_at,
      approved_at,
      owner:profiles!owner_id (
        first_name,
        last_name,
        email,
        phone
      ),
      daily_sales_summary!inner(
        total_revenue,
        total_orders
      )
    `);

  // 필터링
  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.region) {
    query = query.eq('region', params.region);
  }

  if (params?.search) {
    query = query.or(
      `name.ilike.%${params.search}%,` +
      `address.ilike.%${params.search}%,` +
      `owner.first_name.ilike.%${params.search}%,` +
      `owner.last_name.ilike.%${params.search}%`
    );
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

  return { stores: data, total: count };
};
```

### 4. 매장 상태 변경

```typescript
// PUT /api/hq/stores/:storeId/status
const updateStoreStatus = async (
  storeId: string,
  data: {
    status?: 'approved' | 'suspended' | 'closed';
    is_active?: boolean;
    reason?: string;
  }
) => {
  const { data: result, error } = await supabase.rpc('update_store_status', {
    p_store_id: storeId,
    p_status: data.status,
    p_is_active: data.is_active,
    p_reason: data.reason
  });

  if (error) throw error;
  return result;
};
```

### 5. 매장 상세 정보 조회

```typescript
// GET /api/hq/stores/:storeId
const getStoreDetail = async (storeId: string) => {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      owner:profiles!owner_id (*),
      daily_sales_summary (
        sale_date,
        total_revenue,
        total_orders,
        avg_order_value
      ),
      recent_orders:orders (
        id,
        order_number,
        status,
        total_amount,
        created_at
      )
    `)
    .eq('id', storeId)
    .order('sale_date', { ascending: false })
    .limit(30, { foreignTable: 'daily_sales_summary' })
    .limit(10, { foreignTable: 'recent_orders' })
    .single();

  if (error) throw error;
  return data;
};
```

## 📦 물류 관리 API

### 1. 물류 요청 목록 조회

```typescript
// GET /api/hq/supply-requests
const getSupplyRequests = async (params?: {
  status?: string[];
  priority?: string[];
  region?: string;
  store_search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'priority' | 'total_amount';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) => {
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
      store:stores (
        id,
        name,
        address,
        region,
        owner:profiles!owner_id (
          first_name,
          last_name,
          phone
        )
      ),
      supply_request_items (
        id,
        quantity,
        unit_price,
        total_price,
        product:products (
          name,
          unit
        )
      )
    `);

  // 필터링
  if (params?.status && params.status.length > 0) {
    query = query.in('status', params.status);
  }

  if (params?.priority && params.priority.length > 0) {
    query = query.in('priority', params.priority);
  }

  if (params?.region) {
    query = query.eq('store.region', params.region);
  }

  if (params?.store_search) {
    query = query.ilike('store.name', `%${params.store_search}%`);
  }

  if (params?.date_from) {
    query = query.gte('created_at', params.date_from);
  }

  if (params?.date_to) {
    query = query.lte('created_at', params.date_to);
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

  return { requests: data, total: count };
};
```

### 2. 물류 요청 승인 처리

```typescript
// PUT /api/hq/supply-requests/:requestId/approve
const approveSupplyRequest = async (
  requestId: string,
  data: {
    approved: boolean;
    notes?: string;
    estimated_delivery_date?: string;
    modifications?: Array<{
      item_id: string;
      approved_quantity: number;
      reason?: string;
    }>;
  }
) => {
  const { data: result, error } = await supabase.rpc('process_supply_request', {
    p_request_id: requestId,
    p_approved: data.approved,
    p_notes: data.notes,
    p_estimated_delivery_date: data.estimated_delivery_date,
    p_modifications: data.modifications
  });

  if (error) throw error;
  return result;
};
```

### 3. 배송 생성 및 관리

```typescript
// POST /api/hq/shipments
const createShipment = async (data: {
  supply_request_ids: string[];
  estimated_delivery_date: string;
  vehicle_info?: string;
  driver_info?: string;
  notes?: string;
}) => {
  const { data: result, error } = await supabase.rpc('create_shipment', {
    p_supply_request_ids: data.supply_request_ids,
    p_estimated_delivery_date: data.estimated_delivery_date,
    p_vehicle_info: data.vehicle_info,
    p_driver_info: data.driver_info,
    p_notes: data.notes
  });

  if (error) throw error;
  return result;
};
```

### 4. 배송 상태 업데이트

```typescript
// PUT /api/hq/shipments/:shipmentId/status
const updateShipmentStatus = async (
  shipmentId: string,
  data: {
    status: 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
    notes?: string;
    actual_delivery_date?: string;
  }
) => {
  const { data: result, error } = await supabase
    .from('shipments')
    .update({
      status: data.status,
      notes: data.notes,
      actual_delivery_date: data.actual_delivery_date,
      updated_at: new Date().toISOString()
    })
    .eq('id', shipmentId)
    .select()
    .single();

  if (error) throw error;

  // 배송 완료 시 매장 재고 자동 업데이트
  if (data.status === 'delivered') {
    await supabase.rpc('process_delivery_completion', {
      p_shipment_id: shipmentId
    });
  }

  return result;
};
```

## 📊 상품 관리 API

### 1. 상품 카탈로그 관리

```typescript
// GET /api/hq/products
const getProductCatalog = async (params?: {
  category_id?: string;
  search?: string;
  is_active?: boolean;
  sort_by?: 'name' | 'created_at' | 'total_sales';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      image_urls,
      barcode,
      brand,
      unit,
      recommended_price,
      category_id,
      is_active,
      created_at,
      updated_at,
      category:categories (
        id,
        name,
        icon
      ),
      product_sales_summary (
        total_quantity_sold,
        total_revenue
      )
    `);

  // 필터링
  if (params?.category_id) {
    query = query.eq('category_id', params.category_id);
  }

  if (params?.search) {
    query = query.or(
      `name.ilike.%${params.search}%,` +
      `brand.ilike.%${params.search}%,` +
      `barcode.ilike.%${params.search}%`
    );
  }

  if (params?.is_active !== undefined) {
    query = query.eq('is_active', params.is_active);
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

### 2. 신규 상품 등록

```typescript
// POST /api/hq/products
const createProduct = async (data: {
  name: string;
  description?: string;
  image_urls?: string[];
  barcode?: string;
  brand?: string;
  unit: string;
  category_id: string;
  recommended_price: number;
  cost_price?: number;
  supplier_info?: Record<string, any>;
}) => {
  const { data: result, error } = await supabase
    .from('products')
    .insert({
      ...data,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;

  // 모든 매장에 신규 상품 알림 전송
  await supabase.rpc('notify_new_product', {
    p_product_id: result.id
  });

  return result;
};
```

### 3. 상품 정보 수정

```typescript
// PUT /api/hq/products/:productId
const updateProduct = async (
  productId: string,
  data: {
    name?: string;
    description?: string;
    image_urls?: string[];
    recommended_price?: number;
    cost_price?: number;
    is_active?: boolean;
  }
) => {
  const { data: result, error } = await supabase
    .from('products')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return result;
};
```

### 4. 카테고리 관리

```typescript
// GET /api/hq/categories
const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      description,
      icon,
      sort_order,
      is_active,
      parent_category_id,
      created_at,
      products (count)
    `)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
};

// POST /api/hq/categories
const createCategory = async (data: {
  name: string;
  description?: string;
  icon?: string;
  parent_category_id?: string;
  sort_order?: number;
}) => {
  const { data: result, error } = await supabase
    .from('categories')
    .insert({
      ...data,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};
```

## 📈 분석 및 리포트 API

### 1. 전체 매출 분석

```typescript
// GET /api/hq/analytics/revenue
const getRevenueAnalytics = async (params: {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  region?: string;
  store_ids?: string[];
}) => {
  const { data, error } = await supabase.rpc('get_revenue_analytics', {
    p_period: params.period,
    p_start_date: params.start_date,
    p_end_date: params.end_date,
    p_region: params.region,
    p_store_ids: params.store_ids
  });

  if (error) throw error;
  return data;
};
```

### 2. 상품별 성과 분석

```typescript
// GET /api/hq/analytics/products
const getProductAnalytics = async (params: {
  period: string;
  start_date: string;
  end_date: string;
  category_id?: string;
  top_n?: number;
}) => {
  const { data, error } = await supabase.rpc('get_product_performance', {
    p_period: params.period,
    p_start_date: params.start_date,
    p_end_date: params.end_date,
    p_category_id: params.category_id,
    p_top_n: params.top_n || 50
  });

  if (error) throw error;
  return data;
};
```

### 3. 지역별 성과 비교

```typescript
// GET /api/hq/analytics/regional-comparison
const getRegionalComparison = async (params: {
  period: string;
  start_date: string;
  end_date: string;
  metrics: string[]; // ['revenue', 'orders', 'avg_order_value', 'growth_rate']
}) => {
  const { data, error } = await supabase.rpc('get_regional_comparison', {
    p_period: params.period,
    p_start_date: params.start_date,
    p_end_date: params.end_date,
    p_metrics: params.metrics
  });

  if (error) throw error;
  return data;
};
```

### 4. 리포트 생성 및 내보내기

```typescript
// POST /api/hq/reports/generate
const generateReport = async (data: {
  report_type: 'sales' | 'inventory' | 'performance' | 'financial';
  period: string;
  start_date: string;
  end_date: string;
  filters?: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
}) => {
  const { data: result, error } = await supabase.rpc('generate_report', {
    p_report_type: data.report_type,
    p_period: data.period,
    p_start_date: data.start_date,
    p_end_date: data.end_date,
    p_filters: data.filters,
    p_format: data.format
  });

  if (error) throw error;
  return result;
};
```

## ⚙️ 시스템 관리 API

### 1. 사용자 관리

```typescript
// GET /api/hq/users
const getUsers = async (params?: {
  role?: 'customer' | 'store_owner' | 'headquarters';
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('profiles')
    .select(`
      id,
      user_id,
      role,
      status,
      first_name,
      last_name,
      email,
      phone,
      created_at,
      last_sign_in_at,
      stores (
        id,
        name,
        status
      )
    `);

  // 필터링
  if (params?.role) {
    query = query.eq('role', params.role);
  }

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.search) {
    query = query.or(
      `first_name.ilike.%${params.search}%,` +
      `last_name.ilike.%${params.search}%,` +
      `email.ilike.%${params.search}%,` +
      `phone.ilike.%${params.search}%`
    );
  }

  // 정렬 및 페이지네이션
  query = query.order('created_at', { ascending: false });

  if (params?.limit && params?.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { users: data, total: count };
};
```

### 2. 사용자 상태 변경

```typescript
// PUT /api/hq/users/:userId/status
const updateUserStatus = async (
  userId: string,
  data: {
    status: 'active' | 'inactive' | 'suspended';
    reason?: string;
  }
) => {
  const { data: result, error } = await supabase.rpc('update_user_status', {
    p_user_id: userId,
    p_status: data.status,
    p_reason: data.reason
  });

  if (error) throw error;
  return result;
};
```

### 3. 시스템 설정 관리

```typescript
// GET /api/hq/settings
const getSystemSettings = async () => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('category', { ascending: true });

  if (error) throw error;
  return data;
};

// PUT /api/hq/settings/:settingKey
const updateSystemSetting = async (
  settingKey: string,
  value: any
) => {
  const { data, error } = await supabase
    .from('system_settings')
    .update({
      value: value,
      updated_at: new Date().toISOString()
    })
    .eq('key', settingKey)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### 4. 시스템 로그 조회

```typescript
// GET /api/hq/logs
const getSystemLogs = async (params: {
  level?: 'info' | 'warn' | 'error';
  service?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('system_logs')
    .select('*');

  // 필터링
  if (params.level) {
    query = query.eq('level', params.level);
  }

  if (params.service) {
    query = query.eq('service', params.service);
  }

  if (params.start_date) {
    query = query.gte('created_at', params.start_date);
  }

  if (params.end_date) {
    query = query.lte('created_at', params.end_date);
  }

  // 정렬 및 페이지네이션
  query = query.order('created_at', { ascending: false });

  if (params.limit && params.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { logs: data, total: count };
};
```

## 🔔 알림 및 커뮤니케이션 API

### 1. 공지사항 관리

```typescript
// POST /api/hq/announcements
const createAnnouncement = async (data: {
  title: string;
  content: string;
  target_audience: 'all' | 'customers' | 'store_owners';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  expires_at?: string;
}) => {
  const { data: result, error } = await supabase
    .from('announcements')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // 대상 사용자들에게 알림 전송
  await supabase.rpc('send_announcement_notifications', {
    p_announcement_id: result.id
  });

  return result;
};
```

### 2. 긴급 알림 전송

```typescript
// POST /api/hq/emergency-notifications
const sendEmergencyNotification = async (data: {
  title: string;
  message: string;
  target_stores?: string[];
  target_regions?: string[];
  notification_channels: ('in_app' | 'email' | 'sms')[];
}) => {
  const { data: result, error } = await supabase.rpc('send_emergency_notification', {
    p_title: data.title,
    p_message: data.message,
    p_target_stores: data.target_stores,
    p_target_regions: data.target_regions,
    p_channels: data.notification_channels
  });

  if (error) throw error;
  return result;
};
```

## 🔄 실시간 모니터링

### 실시간 매장 현황 구독

```typescript
// 전체 매장 상태 변경 구독
const subscribeToStoreUpdates = (callback: (update: any) => void) => {
  return supabase
    .channel('hq-store-updates')
    .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stores'
        },
        (payload) => {
          callback(payload);
        }
    )
    .subscribe();
};

// 긴급 상황 알림 구독
const subscribeToEmergencyAlerts = (callback: (alert: any) => void) => {
  return supabase
    .channel('emergency-alerts')
    .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_notifications'
        },
        (payload) => {
          callback(payload.new);
        }
    )
    .subscribe();
};
```

---
**편의점 종합 솔루션 v2.0** | 최신 업데이트: 2025-08-17