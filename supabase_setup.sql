-- =====================================================
-- 편의점 종합 솔루션 데이터베이스 설정
-- Supabase SQL Editor에서 실행 가능한 완전한 스키마
-- =====================================================

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- 1. 테이블 생성
-- =====================================================

-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'store_owner', 'headquarters')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 편의점 지점 테이블
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id),
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  location GEOGRAPHY(POINT, 4326),
  delivery_available BOOLEAN DEFAULT true,
  pickup_available BOOLEAN DEFAULT true,
  delivery_radius INTEGER DEFAULT 3000,
  min_order_amount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 상품 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.categories(id),
  icon_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 상품 마스터 테이블
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES public.categories(id),
  brand TEXT,
  manufacturer TEXT,
  unit TEXT NOT NULL DEFAULT '개',
  image_urls TEXT[] DEFAULT '{}',
  base_price NUMERIC NOT NULL,
  cost_price NUMERIC,
  tax_rate NUMERIC DEFAULT 0.10,
  is_active BOOLEAN DEFAULT true,
  requires_preparation BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 0,
  nutritional_info JSONB DEFAULT '{}'::jsonb,
  allergen_info TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 지점별 상품 정보 테이블
CREATE TABLE IF NOT EXISTS public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  safety_stock INTEGER DEFAULT 10,
  max_stock INTEGER DEFAULT 100,
  is_available BOOLEAN DEFAULT true,
  discount_rate NUMERIC DEFAULT 0,
  promotion_start_date TIMESTAMPTZ,
  promotion_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id),
  store_id UUID REFERENCES public.stores(id),
  type TEXT NOT NULL CHECK (type IN ('pickup', 'delivery')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  delivery_address JSONB,
  delivery_notes TEXT,
  payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'kakao_pay', 'toss_pay', 'naver_pay')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_data JSONB DEFAULT '{}'::jsonb,
  pickup_time TIMESTAMPTZ,
  estimated_preparation_time INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  notes TEXT,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주문 상품 테이블
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  subtotal NUMERIC NOT NULL,
  options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주문 상태 이력 테이블
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 재고 요청 테이블
CREATE TABLE IF NOT EXISTS public.supply_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  store_id UUID REFERENCES public.stores(id),
  requested_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  total_amount NUMERIC DEFAULT 0,
  approved_amount NUMERIC DEFAULT 0,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 재고 요청 상품 테이블
CREATE TABLE IF NOT EXISTS public.supply_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_request_id UUID REFERENCES public.supply_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
  approved_quantity INTEGER DEFAULT 0 CHECK (approved_quantity >= 0),
  unit_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  reason TEXT,
  current_stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 물류 배송 테이블
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  supply_request_id UUID REFERENCES public.supply_requests(id),
  status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'failed')),
  carrier TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 재고 거래 이력 테이블
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_product_id UUID REFERENCES public.store_products(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'expired', 'damaged', 'returned')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  unit_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일별 매출 요약 테이블
CREATE TABLE IF NOT EXISTS public.daily_sales_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  date DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  pickup_orders INTEGER DEFAULT 0,
  delivery_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_items_sold INTEGER DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  hourly_stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, date)
);

-- 상품별 매출 요약 테이블
CREATE TABLE IF NOT EXISTS public.product_sales_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  product_id UUID REFERENCES public.products(id),
  date DATE NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  avg_price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id, date)
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. 인덱스 생성
-- =====================================================

-- 성능 최적화를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_location ON public.stores USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON public.stores(is_active);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

CREATE INDEX IF NOT EXISTS idx_store_products_store_id ON public.store_products(store_id);
CREATE INDEX IF NOT EXISTS idx_store_products_product_id ON public.store_products(product_id);
CREATE INDEX IF NOT EXISTS idx_store_products_is_available ON public.store_products(is_available);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_supply_requests_store_id ON public.supply_requests(store_id);
CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON public.supply_requests(status);
CREATE INDEX IF NOT EXISTS idx_supply_requests_created_at ON public.supply_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_supply_request_items_supply_request_id ON public.supply_request_items(supply_request_id);

CREATE INDEX IF NOT EXISTS idx_shipments_supply_request_id ON public.shipments(supply_request_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_store_product_id ON public.inventory_transactions(store_product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON public.inventory_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_sales_summary_store_id ON public.daily_sales_summary(store_id);
CREATE INDEX IF NOT EXISTS idx_daily_sales_summary_date ON public.daily_sales_summary(date);

CREATE INDEX IF NOT EXISTS idx_product_sales_summary_store_id ON public.product_sales_summary(store_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_summary_date ON public.product_sales_summary(date);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- =====================================================
-- 3. Row Level Security (RLS) 활성화
-- =====================================================

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS 정책 생성
-- =====================================================

-- profiles 정책
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "HQ can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- stores 정책
CREATE POLICY "Store owners can view own stores" ON public.stores
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

CREATE POLICY "Store owners can update own stores" ON public.stores
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "HQ can manage all stores" ON public.stores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- categories 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "HQ can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- products 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "HQ can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- store_products 정책
CREATE POLICY "Store owners can view own store products" ON public.store_products
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

CREATE POLICY "Store owners can update own store products" ON public.store_products
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "HQ can manage all store products" ON public.store_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- orders 정책
CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT USING (
    customer_id = auth.uid() OR
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

CREATE POLICY "Store owners can update own store orders" ON public.orders
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "HQ can manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- order_items 정책
CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE customer_id = auth.uid() OR
            store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'headquarters')
    )
  );

-- order_status_history 정책
CREATE POLICY "Users can view order status history" ON public.order_status_history
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE customer_id = auth.uid() OR
            store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'headquarters')
    )
  );

-- supply_requests 정책
CREATE POLICY "Store owners can view own supply requests" ON public.supply_requests
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

CREATE POLICY "Store owners can create supply requests" ON public.supply_requests
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "HQ can manage all supply requests" ON public.supply_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- supply_request_items 정책
CREATE POLICY "Users can view supply request items" ON public.supply_request_items
  FOR SELECT USING (
    supply_request_id IN (
      SELECT id FROM public.supply_requests 
      WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'headquarters')
    )
  );

-- shipments 정책
CREATE POLICY "Users can view shipments" ON public.shipments
  FOR SELECT USING (
    supply_request_id IN (
      SELECT id FROM public.supply_requests 
      WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'headquarters')
    )
  );

-- inventory_transactions 정책
CREATE POLICY "Store owners can view own inventory transactions" ON public.inventory_transactions
  FOR SELECT USING (
    store_product_id IN (
      SELECT sp.id FROM public.store_products sp
      JOIN public.stores s ON sp.store_id = s.id
      WHERE s.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- daily_sales_summary 정책
CREATE POLICY "Store owners can view own sales summary" ON public.daily_sales_summary
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- product_sales_summary 정책
CREATE POLICY "Store owners can view own product sales summary" ON public.product_sales_summary
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- notifications 정책
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- system_settings 정책
CREATE POLICY "Anyone can view public settings" ON public.system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "HQ can manage all settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'headquarters'
    )
  );

-- =====================================================
-- 5. 함수 및 트리거 생성
-- =====================================================

-- 주문 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('order_number_seq') AS TEXT), 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 시퀀스 생성
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- 주문 번호 자동 생성 트리거
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- 재고 요청 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_supply_request_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number := 'SUP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('supply_request_number_seq') AS TEXT), 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 시퀀스 생성
CREATE SEQUENCE IF NOT EXISTS supply_request_number_seq START 1;

-- 재고 요청 번호 자동 생성 트리거
CREATE TRIGGER trigger_generate_supply_request_number
  BEFORE INSERT ON public.supply_requests
  FOR EACH ROW
  EXECUTE FUNCTION generate_supply_request_number();

-- 배송 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.shipment_number := 'SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('shipment_number_seq') AS TEXT), 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 시퀀스 생성
CREATE SEQUENCE IF NOT EXISTS shipment_number_seq START 1;

-- 배송 번호 자동 생성 트리거
CREATE TRIGGER trigger_generate_shipment_number
  BEFORE INSERT ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION generate_shipment_number();

-- 주문 완료 시 재고 차감 함수
CREATE OR REPLACE FUNCTION update_inventory_on_order_complete()
RETURNS TRIGGER AS $$
DECLARE
  order_item RECORD;
BEGIN
  -- 주문이 완료 상태로 변경되었을 때만 실행
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- 주문 상품들의 재고를 차감
    FOR order_item IN 
      SELECT oi.product_id, oi.quantity, o.store_id
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      WHERE oi.order_id = NEW.id
    LOOP
      -- store_products 테이블의 재고 차감
      UPDATE public.store_products 
      SET stock_quantity = stock_quantity - order_item.quantity,
          updated_at = NOW()
      WHERE store_id = order_item.store_id 
        AND product_id = order_item.product_id;
      
      -- 재고 거래 이력 기록
      INSERT INTO public.inventory_transactions (
        store_product_id,
        transaction_type,
        quantity,
        previous_quantity,
        new_quantity,
        reference_type,
        reference_id,
        reason,
        created_by
      )
      SELECT 
        sp.id,
        'out',
        order_item.quantity,
        sp.stock_quantity + order_item.quantity,
        sp.stock_quantity,
        'order',
        NEW.id,
        '주문 완료로 인한 재고 차감',
        NEW.customer_id
      FROM public.store_products sp
      WHERE sp.store_id = order_item.store_id 
        AND sp.product_id = order_item.product_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 완료 시 재고 차감 트리거
CREATE TRIGGER trigger_update_inventory_on_order_complete
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_order_complete();

-- 주문 상태 변경 시 이력 기록 함수
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (
      order_id,
      status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      NEW.status,
      COALESCE(NEW.customer_id, auth.uid()),
      CASE 
        WHEN NEW.status = 'cancelled' THEN NEW.cancel_reason
        ELSE NULL
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 상태 변경 이력 트리거
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- 재고 부족 시 알림 생성 함수
CREATE OR REPLACE FUNCTION create_low_stock_notification()
RETURNS TRIGGER AS $$
DECLARE
  store_owner_id UUID;
BEGIN
  -- 재고가 안전 재고 이하로 떨어졌을 때
  IF NEW.stock_quantity <= NEW.safety_stock AND OLD.stock_quantity > NEW.safety_stock THEN
    -- 점주 ID 조회
    SELECT s.owner_id INTO store_owner_id
    FROM public.stores s
    WHERE s.id = NEW.store_id;
    
    -- 알림 생성
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      store_owner_id,
      'low_stock',
      '재고 부족 알림',
      '상품의 재고가 안전 재고 수준 이하로 떨어졌습니다.',
      jsonb_build_object(
        'store_id', NEW.store_id,
        'product_id', NEW.product_id,
        'current_stock', NEW.stock_quantity,
        'safety_stock', NEW.safety_stock
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 재고 부족 알림 트리거
CREATE TRIGGER trigger_create_low_stock_notification
  AFTER UPDATE ON public.store_products
  FOR EACH ROW
  EXECUTE FUNCTION create_low_stock_notification();

-- 물류 요청 배송 완료 시 재고 업데이트 함수
CREATE OR REPLACE FUNCTION update_inventory_on_supply_delivery()
RETURNS TRIGGER AS $$
DECLARE
  supply_item RECORD;
BEGIN
  -- 물류 요청이 배송 완료 상태로 변경되었을 때만 실행
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- 물류 요청 상품들의 재고를 증가
    FOR supply_item IN 
      SELECT sri.product_id, sri.approved_quantity, sr.store_id
      FROM public.supply_request_items sri
      JOIN public.supply_requests sr ON sri.supply_request_id = sr.id
      WHERE sri.supply_request_id = NEW.id
        AND sri.approved_quantity > 0
    LOOP
      -- store_products 테이블의 재고 증가
      UPDATE public.store_products 
      SET stock_quantity = stock_quantity + supply_item.approved_quantity,
          updated_at = NOW()
      WHERE store_id = supply_item.store_id 
        AND product_id = supply_item.product_id;
      
      -- 재고 거래 이력 기록
      INSERT INTO public.inventory_transactions (
        store_product_id,
        transaction_type,
        quantity,
        previous_quantity,
        new_quantity,
        reference_type,
        reference_id,
        reason,
        created_by
      )
      SELECT 
        sp.id,
        'in',
        supply_item.approved_quantity,
        sp.stock_quantity - supply_item.approved_quantity,
        sp.stock_quantity,
        'supply_request',
        NEW.id,
        '물류 요청 배송 완료로 인한 재고 증가',
        NEW.requested_by
      FROM public.store_products sp
      WHERE sp.store_id = supply_item.store_id 
        AND sp.product_id = supply_item.product_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 물류 요청 배송 완료 시 재고 업데이트 트리거
CREATE TRIGGER trigger_update_inventory_on_supply_delivery
  AFTER UPDATE ON public.supply_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_supply_delivery();

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 갱신 트리거들
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_store_products_updated_at
  BEFORE UPDATE ON public.store_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_supply_requests_updated_at
  BEFORE UPDATE ON public.supply_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_daily_sales_summary_updated_at
  BEFORE UPDATE ON public.daily_sales_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. 초기 데이터 삽입
-- =====================================================

-- 기본 카테고리 데이터
INSERT INTO public.categories (name, slug, description, display_order) VALUES
('음료', 'beverages', '다양한 음료 제품', 1),
('식품', 'food', '간편 식품 및 스낵', 2),
('생활용품', 'household', '일상 생활용품', 3),
('담배', 'tobacco', '담배 제품', 4),
('주류', 'alcohol', '주류 제품', 5)
ON CONFLICT (slug) DO NOTHING;

-- 음료 하위 카테고리
INSERT INTO public.categories (name, slug, parent_id, description, display_order) VALUES
('탄산음료', 'carbonated-drinks', (SELECT id FROM public.categories WHERE slug = 'beverages'), '탄산음료', 1),
('커피', 'coffee', (SELECT id FROM public.categories WHERE slug = 'beverages'), '커피 제품', 2),
('차', 'tea', (SELECT id FROM public.categories WHERE slug = 'beverages'), '차 제품', 3),
('주스', 'juice', (SELECT id FROM public.categories WHERE slug = 'beverages'), '주스 제품', 4)
ON CONFLICT (slug) DO NOTHING;

-- 식품 하위 카테고리
INSERT INTO public.categories (name, slug, parent_id, description, display_order) VALUES
('라면', 'ramen', (SELECT id FROM public.categories WHERE slug = 'food'), '라면 제품', 1),
('과자', 'snacks', (SELECT id FROM public.categories WHERE slug = 'food'), '과자 및 스낵', 2),
('빵', 'bread', (SELECT id FROM public.categories WHERE slug = 'food'), '빵 제품', 3),
('아이스크림', 'ice-cream', (SELECT id FROM public.categories WHERE slug = 'food'), '아이스크림', 4)
ON CONFLICT (slug) DO NOTHING;

-- 기본 시스템 설정
INSERT INTO public.system_settings (key, value, description, category) VALUES
('delivery_fee_base', '{"amount": 2000}', '기본 배송비', 'delivery'),
('min_order_amount', '{"amount": 5000}', '최소 주문 금액', 'order'),
('tax_rate', '{"rate": 0.1}', '기본 세율', 'tax'),
('business_hours_default', '{"monday": {"open": "06:00", "close": "24:00"}, "tuesday": {"open": "06:00", "close": "24:00"}, "wednesday": {"open": "06:00", "close": "24:00"}, "thursday": {"open": "06:00", "close": "24:00"}, "friday": {"open": "06:00", "close": "24:00"}, "saturday": {"open": "06:00", "close": "24:00"}, "sunday": {"open": "06:00", "close": "24:00"}}', '기본 영업시간', 'store')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 7. 뷰 생성
-- =====================================================

-- 지점별 상품 재고 현황 뷰
CREATE OR REPLACE VIEW store_inventory_view AS
SELECT 
  s.id as store_id,
  s.name as store_name,
  p.id as product_id,
  p.name as product_name,
  c.name as category_name,
  sp.price,
  sp.stock_quantity,
  sp.safety_stock,
  sp.max_stock,
  sp.is_available,
  CASE 
    WHEN sp.stock_quantity <= sp.safety_stock THEN 'low'
    WHEN sp.stock_quantity = 0 THEN 'out'
    ELSE 'normal'
  END as stock_status
FROM public.stores s
JOIN public.store_products sp ON s.id = sp.store_id
JOIN public.products p ON sp.product_id = p.id
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE s.is_active = true AND p.is_active = true;

-- 일별 매출 통계 뷰
CREATE OR REPLACE VIEW daily_sales_view AS
SELECT 
  dss.store_id,
  s.name as store_name,
  dss.date,
  dss.total_orders,
  dss.total_revenue,
  dss.total_items_sold,
  dss.pickup_orders,
  dss.delivery_orders,
  dss.cancelled_orders,
  dss.avg_order_value,
  CASE 
    WHEN dss.total_orders > 0 THEN 
      ROUND((dss.delivery_orders::numeric / dss.total_orders) * 100, 2)
    ELSE 0 
  END as delivery_rate
FROM public.daily_sales_summary dss
JOIN public.stores s ON dss.store_id = s.id
ORDER BY dss.date DESC, dss.total_revenue DESC;

-- 주문 현황 뷰
CREATE OR REPLACE VIEW order_status_view AS
SELECT 
  o.id,
  o.order_number,
  o.customer_id,
  p.full_name as customer_name,
  o.store_id,
  s.name as store_name,
  o.type,
  o.status,
  o.total_amount,
  o.payment_status,
  o.created_at,
  o.estimated_preparation_time,
  o.pickup_time
FROM public.orders o
JOIN public.profiles p ON o.customer_id = p.id
JOIN public.stores s ON o.store_id = s.id
ORDER BY o.created_at DESC;

-- =====================================================
-- 완료 메시지
-- =====================================================

-- 모든 설정이 완료되었습니다.
-- 이제 Supabase 프로젝트에서 편의점 종합 솔루션을 사용할 수 있습니다. 