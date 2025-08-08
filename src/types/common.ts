import type { Database } from '../lib/supabase/types';

// 데이터베이스 테이블 타입들
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Store = Database['public']['Tables']['stores']['Row'];
export type StoreInsert = Database['public']['Tables']['stores']['Insert'];
export type StoreUpdate = Database['public']['Tables']['stores']['Update'];

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type StoreProduct = Database['public']['Tables']['store_products']['Row'];
export type StoreProductInsert = Database['public']['Tables']['store_products']['Insert'];
export type StoreProductUpdate = Database['public']['Tables']['store_products']['Update'];

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update'];

export type OrderStatusHistory = Database['public']['Tables']['order_status_history']['Row'];

export type SupplyRequest = Database['public']['Tables']['supply_requests']['Row'];
export type SupplyRequestInsert = Database['public']['Tables']['supply_requests']['Insert'];
export type SupplyRequestUpdate = Database['public']['Tables']['supply_requests']['Update'];

export type SupplyRequestItem = Database['public']['Tables']['supply_request_items']['Row'];
export type SupplyRequestItemInsert = Database['public']['Tables']['supply_request_items']['Insert'];
export type SupplyRequestItemUpdate = Database['public']['Tables']['supply_request_items']['Update'];

export type Shipment = Database['public']['Tables']['shipments']['Row'];
export type ShipmentInsert = Database['public']['Tables']['shipments']['Insert'];
export type ShipmentUpdate = Database['public']['Tables']['shipments']['Update'];

export type InventoryTransaction = Database['public']['Tables']['inventory_transactions']['Row'];
export type InventoryTransactionInsert = Database['public']['Tables']['inventory_transactions']['Insert'];
export type InventoryTransactionUpdate = Database['public']['Tables']['inventory_transactions']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type DailySalesSummary = Database['public']['Tables']['daily_sales_summary']['Row'];
export type ProductSalesSummary = Database['public']['Tables']['product_sales_summary']['Row'];

export type SystemSetting = Database['public']['Tables']['system_settings']['Row'];

// 사용자 역할 타입
export type UserRole = 'customer' | 'store_owner' | 'hq_admin' | 'headquarters';

// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive' | 'suspended';

// 주문 상태 타입
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// 주문 타입
export type OrderType = 'pickup' | 'delivery';

// 결제 방법 타입
export type PaymentMethod = 'card' | 'cash' | 'kakao_pay' | 'toss_pay' | 'naver_pay';

// 결제 상태 타입
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// 공급 요청 상태 타입
export type SupplyRequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'shipped' | 'delivered' | 'cancelled';

// 우선순위 타입
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

// 배송 상태 타입
export type ShipmentStatus = 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'failed';

// 재고 거래 타입
export type InventoryTransactionType = 'in' | 'out' | 'adjustment' | 'expired' | 'damaged' | 'returned';

// 알림 타입
export type NotificationType = 'order_status' | 'low_stock' | 'supply_request' | 'system' | 'promotion';

// 확장된 사용자 타입 (기존 호환성을 위해)
export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// 확장된 사용자 프로필 타입 (기존 호환성을 위해) 
export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  notification_settings?: {
    email_notifications: boolean;
    push_notifications: boolean;
    order_updates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  created_at: string;
  updated_at: string;
}

// 주소 타입
export interface Address {
  id?: string;
  name?: string; // 주소 별칭 (집, 회사 등)
  address: string;
  detail_address?: string;
  postal_code?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

// 영업시간 타입
export interface BusinessHours {
  [key: string]: {
    open: string; // HH:MM 형식
    close: string; // HH:MM 형식
    is_closed?: boolean;
  };
}

// 장바구니 아이템 타입
export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  price: number;
  quantity: number;
  options?: Record<string, any>;
  subtotal: number;
  store_id: string;
}

// 장바구니 타입
export interface Cart {
  id: string;
  customer_id: string;
  store_id: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// 검색 필터 타입
export interface SearchFilters {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  is_available?: boolean;
  requires_preparation?: boolean;
  sort_by?: 'name' | 'price' | 'created_at' | 'popularity';
  sort_order?: 'asc' | 'desc';
}

// 페이지네이션 타입
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

// 통계 데이터 타입
export interface SalesStats {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  total_items_sold: number;
  growth_rate?: number;
  comparison_period?: string;
}

export interface InventoryStats {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_value: number;
}

// 대시보드 데이터 타입
export interface DashboardData {
  sales_stats: SalesStats;
  inventory_stats?: InventoryStats;
  recent_orders: Order[];
  notifications: Notification[];
  quick_actions?: string[];
}

// 위치 정보 타입
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// 파일 업로드 타입
export interface FileUpload {
  file: File;
  url?: string;
  progress?: number;
  error?: string;
}

// 폼 상태 타입
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// 테이블 정렬 타입
export interface TableSort {
  field: string;
  direction: 'asc' | 'desc';
}

// 테이블 필터 타입
export interface TableFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

// 모달/다이얼로그 상태 타입
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// 토스트/알림 메시지 타입
export interface ToastMessage {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 기존 호환성을 위한 re-export
export { User, UserProfile, UserRole, UserStatus };