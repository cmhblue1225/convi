// ===== 기본 엔티티 타입들 (가장 먼저 정의) =====

// 상품 관련 타입
export interface Product {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  category_id?: string;
  brand?: string;
  manufacturer?: string;
  unit?: string;
  image_urls?: string[];
  base_price?: number;
  cost_price?: number;
  tax_rate?: number;
  is_active?: boolean;
  requires_preparation?: boolean;
  preparation_time?: number;
  nutritional_info?: any;
  allergen_info?: string[];
  created_at?: string;
  updated_at?: string;
  is_wishlisted?: boolean;
  wishlist_count?: number;
  shelf_life_days?: number;
  price?: number;
  image_url?: string;  // 하위 호환성을 위해 유지
}

// 매장별 상품 타입
export interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  price: number;
  stock_quantity: number;
  safety_stock?: number;
  max_stock?: number;
  is_available: boolean;
  discount_rate?: number;
  promotion_start_date?: string | null;
  promotion_end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

// 주문 관련 타입
export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal?: number;
  tax_amount?: number;
  delivery_fee?: number;
  coupon_discount?: number;
  points_used?: number;
  payment_method?: string;
  payment_status?: string;
  order_type?: string;
  pickup_time?: string;
  delivery_address?: any;
  customer_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

// Order 타입의 Insert/Update 버전
export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type OrderUpdate = Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at'>;
export type OrderItemUpdate = Partial<Omit<OrderItem, 'id' | 'created_at'>>;

// ===== 환불 시스템 타입들 =====

export interface RefundRequest {
  id: string;
  order_id: string;
  customer_id: string;
  store_id: string;
  request_type: string;
  reason: string;
  description?: string;
  refund_items: any[];
  requested_refund_amount: number;
  approved_refund_amount?: number;
  status: string;
  priority?: string;
  refund_method?: string;
  admin_notes?: string;
  customer_phone?: string;
  refund_deadline?: string;
  is_urgent?: boolean;
  estimated_processing_time?: number;
  created_at?: string;
  updated_at?: string;
  processed_at?: string;
  processed_by?: string;
  attachments?: any;
  refund_fee?: number;
  rejection_reason?: string;
  requested_at?: string;
}

export interface RefundHistory {
  id: string;
  refund_request_id: string;
  new_status: string;
  previous_status?: string;
  notes?: string;
  processed_by: string;
  processed_at?: string;
  action_type?: string;
  metadata?: any;
  ip_address?: any;
  user_agent?: string;
}

export interface RefundSettlement {
  id: string;
  refund_request_id: string;
  settlement_amount: number;
  settlement_type: string;
  payment_method?: string;
  external_payment_id?: string;
  external_refund_id?: string;
  processing_fee?: number;
  tax_amount?: number;
  net_refund_amount?: number;
  status: string;
  refund_reason_code?: string;
  customer_communication_log?: any[];
  refund_method_details?: any;
  estimated_completion_date?: string;
  processed_at?: string;
  processed_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RefundPolicy {
  id: string;
  store_id?: string;
  policy_name: string;
  description: string;
  refund_window_minutes: number;
  allow_partial_refund?: boolean;
  allow_cancellation?: boolean;
  require_reason?: boolean;
  refund_fee_rate?: number;
  min_refund_amount?: number;
  perishable_refund_policy?: string;
  prepared_food_refund_policy?: string;
  general_goods_refund_policy?: string;
  is_active?: boolean;
  auto_approve_threshold?: number;
  max_refund_percentage?: number;
  requires_manager_approval?: boolean;
  refund_processing_fee?: number;
  exchange_policy?: string;
  store_credit_expiry_days?: number;
  notification_settings?: any;
  business_hours_start?: string;
  business_hours_end?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RefundNotification {
  id: string;
  refund_request_id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read?: boolean;
  read_at?: string;
  sent_at?: string;
  delivery_method?: string;
  delivery_status?: string;
  created_at?: string;
}

export interface RefundAttachment {
  id: string;
  refund_request_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  upload_purpose?: string;
  is_verified?: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at?: string;
}

export interface RefundTemplate {
  id: string;
  store_id?: string;
  template_name: string;
  template_type: string;
  subject: string;
  body: string;
  variables?: any;
  is_active?: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

// ===== 환불 관련 열거형 타입들 =====

export type RefundStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
export type RefundMethod = 'payment_refund' | 'store_credit' | 'exchange' | 'partial_refund';
export type RefundPriority = 'low' | 'normal' | 'high' | 'urgent';
export type RefundActionType = 'status_change' | 'note_added' | 'priority_changed' | 'deadline_updated';
export type RefundNotificationType = 'status_update' | 'deadline_reminder' | 'approval_required' | 'completion_notice';
export type RefundDeliveryMethod = 'in_app' | 'email' | 'sms' | 'push';
export type RefundAttachmentPurpose = 'evidence' | 'receipt' | 'damage_photo' | 'other';
export type RefundTemplateType = 'approval_email' | 'rejection_email' | 'completion_email' | 'customer_notification';

// ===== 환불 관련 폼 타입들 =====

export interface RefundRequestForm {
  order_id: string;
  request_type: string;
  reason: string;
  description?: string;
  refund_items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    reason: string;
  }>;
  requested_refund_amount: number;
  customer_phone?: string;
}

export interface RefundProcessForm {
  refund_request_id: string;
  new_status: RefundStatus;
  notes?: string;
  approved_amount?: number;
  rejection_reason?: string;
}

export interface RefundStatistics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  completed_requests: number;
  total_refund_amount: number;
  avg_processing_time: number;
  urgent_requests: number;
}

export interface RefundFilter {
  status?: RefundStatus[];
  priority?: RefundPriority[];
  store_id?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  is_urgent?: boolean;
  refund_method?: RefundMethod[];
}

export interface RefundPolicySettings {
  auto_approve_threshold: number;
  max_refund_percentage: number;
  requires_manager_approval: boolean;
  refund_processing_fee: number;
  exchange_policy: string;
  store_credit_expiry_days: number;
  notification_settings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// ===== 시스템 기본 타입들 =====

export type UserRole = 'customer' | 'store_owner' | 'hq_admin' | 'headquarters';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'pickup' | 'delivery';
export type PaymentMethod = 'card' | 'cash' | 'toss_pay' | 'naver_pay';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type SupplyRequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'shipped' | 'delivered' | 'cancelled';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type ShipmentStatus = 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
export type InventoryTransactionType = 'in' | 'out' | 'adjustment' | 'expired' | 'damaged' | 'returned';
export type NotificationType = 'order_status' | 'low_stock' | 'supply_request' | 'system' | 'promotion';

// ===== 사용자 관련 타입들 =====

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

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

// ===== 기타 시스템 타입들 =====

export interface Address {
  id?: string;
  name?: string;
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

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    is_closed?: boolean;
  };
}

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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

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

export interface DashboardData {
  sales_stats: SalesStats;
  inventory_stats?: InventoryStats;
  recent_orders: Order[];
  notifications: any[];
  quick_actions?: string[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface FileUpload {
  file: File;
  url?: string;
  progress?: number;
  error?: string;
}

export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface TableSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: any;
  onConfirm?: () => void;
  onCancel?: () => void;
}

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

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  is_used: boolean;
  used_at?: string | null;
  used_order_id?: string | null;
  expires_at?: string | null;
  created_at: string;
  coupon: Coupon;
}

export interface Point {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'used' | 'expired' | 'bonus' | 'refund';
  description?: string | null;
  order_id?: string | null;
  expires_at?: string | null;
  created_at: string;
}

export interface PointSettings {
  id: string;
  key: string;
  value: any;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponValidation {
  is_valid: boolean;
  discount_amount: number;
  message: string;
}
