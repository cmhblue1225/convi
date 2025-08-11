

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."check_low_stock"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- 재고가 안전재고 이하로 떨어졌을 때 알림 생성
    IF NEW.stock_quantity <= NEW.safety_stock AND OLD.stock_quantity > OLD.safety_stock THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority
        ) VALUES (
            (SELECT owner_id FROM stores WHERE id = NEW.store_id),
            'low_stock',
            '재고 부족 알림',
            '상품 "' || (SELECT name FROM products WHERE id = NEW.product_id) || '"의 재고가 부족합니다.',
            jsonb_build_object(
                'store_id', NEW.store_id,
                'product_id', NEW.product_id,
                'current_stock', NEW.stock_quantity,
                'safety_stock', NEW.safety_stock
            ),
            'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_low_stock"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'ORD-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
                NEW.order_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '주문 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_shipment_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.shipment_number IS NULL OR NEW.shipment_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'SHIP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM shipments WHERE shipment_number = new_number) THEN
                NEW.shipment_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '배송 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_shipment_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_supply_request_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'SUP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM supply_requests WHERE request_number = new_number) THEN
                NEW.request_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '물류 요청 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_supply_request_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_rankings"("start_date" "date" DEFAULT (CURRENT_DATE - '30 days'::interval), "end_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("product_id" "uuid", "product_name" "text", "category_name" "text", "total_sold" bigint, "total_revenue" numeric, "avg_price" numeric, "rank_position" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        c.name as category_name,
        COUNT(oi.id)::BIGINT as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue,
        COALESCE(AVG(oi.unit_price), 0) as avg_price,
        RANK() OVER (ORDER BY COALESCE(SUM(oi.subtotal), 0) DESC) as rank_position
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.status = 'completed'
        AND DATE(o.created_at) BETWEEN start_date AND end_date
    GROUP BY p.id, p.name, c.name
    ORDER BY total_revenue DESC;
END;
$$;


ALTER FUNCTION "public"."get_product_rankings"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sales_summary"("start_date" "date" DEFAULT (CURRENT_DATE - '30 days'::interval), "end_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("total_orders" bigint, "completed_orders" bigint, "cancelled_orders" bigint, "total_revenue" numeric, "avg_order_value" numeric, "pickup_orders" bigint, "delivery_orders" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::BIGINT as completed_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END)::BIGINT as cancelled_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,
        COUNT(CASE WHEN o.type = 'pickup' THEN 1 END)::BIGINT as pickup_orders,
        COUNT(CASE WHEN o.type = 'delivery' THEN 1 END)::BIGINT as delivery_orders
    FROM orders o
    WHERE DATE(o.created_at) BETWEEN start_date AND end_date;
END;
$$;


ALTER FUNCTION "public"."get_sales_summary"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_store_rankings"("start_date" "date" DEFAULT (CURRENT_DATE - '30 days'::interval), "end_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("store_id" "uuid", "store_name" "text", "total_revenue" numeric, "total_orders" bigint, "avg_order_value" numeric, "rank_position" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as store_id,
        s.name as store_name,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(o.id)::BIGINT as total_orders,
        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,
        RANK() OVER (ORDER BY COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) DESC) as rank_position
    FROM stores s
    LEFT JOIN orders o ON s.id = o.store_id 
        AND DATE(o.created_at) BETWEEN start_date AND end_date
    GROUP BY s.id, s.name
    ORDER BY total_revenue DESC;
END;
$$;


ALTER FUNCTION "public"."get_store_rankings"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_order_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    order_item RECORD;
    store_name TEXT;
BEGIN
    -- 주문이 완료 상태로 변경될 때만 실행
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- 지점명 조회
        SELECT name INTO store_name FROM stores WHERE id = NEW.store_id;
        
        -- 고객에게 주문 완료 알림 생성
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority
        ) VALUES (
            NEW.customer_id,
            'order_completed',
            '주문이 완료되었습니다',
            '주문번호 ' || NEW.order_number || '의 준비가 완료되었습니다. ' || COALESCE(store_name, '지점') || '에서 픽업 가능합니다.',
            jsonb_build_object(
                'order_id', NEW.id,
                'order_number', NEW.order_number,
                'store_id', NEW.store_id,
                'store_name', COALESCE(store_name, '지점')
            ),
            'high'
        );
        
        -- 주문 아이템들을 순회하며 재고 차감
        FOR order_item IN 
            SELECT oi.product_id, oi.quantity, sp.id as store_product_id
            FROM order_items oi
            LEFT JOIN store_products sp ON sp.store_id = NEW.store_id AND sp.product_id = oi.product_id
            WHERE oi.order_id = NEW.id
        LOOP
            -- 재고가 있는 경우에만 차감
            IF order_item.store_product_id IS NOT NULL THEN
                -- 재고 차감
                UPDATE store_products 
                SET stock_quantity = GREATEST(0, stock_quantity - order_item.quantity),
                    updated_at = NOW()
                WHERE id = order_item.store_product_id;
                
                -- 재고 이력 기록
                INSERT INTO inventory_transactions (
                    store_product_id,
                    transaction_type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference_type,
                    reference_id,
                    reason,
                    created_by
                ) VALUES (
                    order_item.store_product_id,
                    'out',
                    order_item.quantity,
                    (SELECT stock_quantity + order_item.quantity FROM store_products WHERE id = order_item.store_product_id),
                    (SELECT stock_quantity FROM store_products WHERE id = order_item.store_product_id),
                    'order',
                    NEW.id,
                    '주문 완료로 인한 재고 차감',
                    NEW.customer_id
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_order_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_shipment_delivery"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    request_item RECORD;
    store_product_id UUID;
BEGIN
    -- 배송이 완료 상태로 변경될 때만 실행
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- 물류 요청 아이템들을 순회하며 재고 증가
        FOR request_item IN 
            SELECT sri.product_id, sri.approved_quantity, sr.store_id
            FROM supply_request_items sri
            JOIN supply_requests sr ON sr.id = sri.supply_request_id
            WHERE sr.id = NEW.supply_request_id AND sri.approved_quantity > 0
        LOOP
            -- store_products에서 해당 상품의 ID 조회
            SELECT id INTO store_product_id 
            FROM store_products 
            WHERE store_id = request_item.store_id AND product_id = request_item.product_id;
            
            IF store_product_id IS NOT NULL THEN
                -- 재고 증가
                UPDATE store_products 
                SET stock_quantity = stock_quantity + request_item.approved_quantity,
                    updated_at = NOW()
                WHERE id = store_product_id;
                
                -- 재고 이력 기록
                INSERT INTO inventory_transactions (
                    store_product_id,
                    transaction_type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference_type,
                    reference_id,
                    reason,
                    created_by
                ) VALUES (
                    store_product_id,
                    'in',
                    request_item.approved_quantity,
                    (SELECT stock_quantity - request_item.approved_quantity FROM store_products WHERE id = store_product_id),
                    (SELECT stock_quantity FROM store_products WHERE id = store_product_id),
                    'supply_request',
                    NEW.supply_request_id,
                    '물류 배송 완료로 인한 재고 증가',
                    NEW.id
                );
            END IF;
        END LOOP;
        
        -- 물류 요청 상태를 delivered로 업데이트
        UPDATE supply_requests 
        SET status = 'delivered',
            actual_delivery_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = NEW.supply_request_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_shipment_delivery"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."initialize_store_products"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- 새로 생성된 지점에 대해 모든 활성 상품에 대한 초기 재고 레코드 생성
    INSERT INTO store_products (store_id, product_id, price, stock_quantity, is_available)
    SELECT 
        NEW.id as store_id,
        p.id as product_id,
        p.base_price as price,
        0 as stock_quantity,  -- 초기 재고는 0개
        true as is_available
    FROM products p
    WHERE p.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM store_products sp 
        WHERE sp.store_id = NEW.id AND sp.product_id = p.id
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."initialize_store_products"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_order_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, status, changed_by, notes)
        VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_order_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_duplicate_orders"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    existing_order_id UUID;
    payment_key TEXT;
BEGIN
    -- payment_data에서 paymentKey 추출
    payment_key := NEW.payment_data->>'paymentKey';
    
    -- paymentKey가 있는 경우에만 중복 검사
    IF payment_key IS NOT NULL AND payment_key != '' THEN
        -- 같은 paymentKey를 가진 주문이 이미 있는지 확인
        SELECT id INTO existing_order_id
        FROM orders 
        WHERE payment_data->>'paymentKey' = payment_key
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        LIMIT 1;
        
        -- 중복 주문이 발견되면 에러 발생
        IF existing_order_id IS NOT NULL THEN
            RAISE EXCEPTION '중복 주문이 감지되었습니다. PaymentKey: %', payment_key;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_duplicate_orders"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_wishlist"("product_id_param" "uuid", "user_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    is_wishlisted BOOLEAN;
BEGIN
    -- 현재 찜 상태 확인
    SELECT EXISTS (
        SELECT 1 
        FROM product_wishlists 
        WHERE product_id = product_id_param 
        AND user_id = user_id_param
    ) INTO is_wishlisted;

    IF is_wishlisted THEN
        -- 찜 취소
        DELETE FROM product_wishlists 
        WHERE product_id = product_id_param 
        AND user_id = user_id_param;
        
        -- 찜 카운트 감소
        UPDATE products 
        SET wishlist_count = wishlist_count - 1
        WHERE id = product_id_param;
        
        RETURN false;
    ELSE
        -- 찜하기
        INSERT INTO product_wishlists (product_id, user_id)
        VALUES (product_id_param, user_id_param);
        
        -- 찜 카운트 증가
        UPDATE products 
        SET wishlist_count = wishlist_count + 1
        WHERE id = product_id_param;
        
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION "public"."toggle_wishlist"("product_id_param" "uuid", "user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_inventory_on_supply_delivery"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
            -- store_products 테이블의 재고 증가 (RLS 우회)
            UPDATE public.store_products 
            SET stock_quantity = stock_quantity + supply_item.approved_quantity,
                updated_at = NOW()
            WHERE store_id = supply_item.store_id 
                AND product_id = supply_item.product_id;
            
            -- 재고 거래 이력 기록 (RLS 우회)
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
$$;


ALTER FUNCTION "public"."update_inventory_on_supply_delivery"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_store_product_stock"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE store_products 
    SET stock_quantity = NEW.new_quantity,
        updated_at = NOW()
    WHERE id = NEW.store_product_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_store_product_stock"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_order_service"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- 지점의 서비스 가능 여부 검증
    IF NOT validate_store_service(NEW.store_id, NEW.type) THEN
        RAISE EXCEPTION '선택한 지점에서 % 서비스를 이용할 수 없습니다.', 
            CASE NEW.type 
                WHEN 'delivery' THEN '배송'
                WHEN 'pickup' THEN '픽업'
                ELSE NEW.type
            END;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_order_service"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_store_service"("p_store_id" "uuid", "p_service_type" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    store_record RECORD;
BEGIN
    -- 지점 정보 조회
    SELECT 
        is_active,
        delivery_available,
        pickup_available
    INTO store_record
    FROM stores
    WHERE id = p_store_id;
    
    -- 지점이 존재하지 않거나 비활성화된 경우
    IF NOT FOUND OR NOT store_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- 서비스 타입에 따른 검증
    CASE p_service_type
        WHEN 'delivery' THEN
            RETURN store_record.delivery_available;
        WHEN 'pickup' THEN
            RETURN store_record.pickup_available;
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;


ALTER FUNCTION "public"."validate_store_service"("p_store_id" "uuid", "p_service_type" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "parent_id" "uuid",
    "icon_url" "text",
    "description" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" NOT NULL,
    "customer_id" "uuid",
    "store_id" "uuid",
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "subtotal" numeric DEFAULT 0 NOT NULL,
    "tax_amount" numeric DEFAULT 0 NOT NULL,
    "delivery_fee" numeric DEFAULT 0,
    "discount_amount" numeric DEFAULT 0,
    "total_amount" numeric DEFAULT 0 NOT NULL,
    "delivery_address" "jsonb",
    "delivery_notes" "text",
    "payment_method" "text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "payment_data" "jsonb" DEFAULT '{}'::"jsonb",
    "pickup_time" timestamp with time zone,
    "estimated_preparation_time" integer DEFAULT 0,
    "completed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "notes" "text",
    "cancel_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "orders_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['card'::"text", 'cash'::"text", 'kakao_pay'::"text", 'toss_pay'::"text", 'naver_pay'::"text"]))),
    CONSTRAINT "orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'refunded'::"text", 'failed'::"text"]))),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'preparing'::"text", 'ready'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "orders_type_check" CHECK (("type" = ANY (ARRAY['pickup'::"text", 'delivery'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."daily_sales_analytics" AS
 SELECT "date"("created_at") AS "sale_date",
    "count"(*) AS "total_orders",
    "count"(
        CASE
            WHEN ("status" = 'completed'::"text") THEN 1
            ELSE NULL::integer
        END) AS "completed_orders",
    "count"(
        CASE
            WHEN ("status" = 'cancelled'::"text") THEN 1
            ELSE NULL::integer
        END) AS "cancelled_orders",
    "sum"(
        CASE
            WHEN ("status" = 'completed'::"text") THEN "total_amount"
            ELSE (0)::numeric
        END) AS "total_revenue",
    "avg"(
        CASE
            WHEN ("status" = 'completed'::"text") THEN "total_amount"
            ELSE NULL::numeric
        END) AS "avg_order_value",
    "count"(
        CASE
            WHEN ("type" = 'pickup'::"text") THEN 1
            ELSE NULL::integer
        END) AS "pickup_orders",
    "count"(
        CASE
            WHEN ("type" = 'delivery'::"text") THEN 1
            ELSE NULL::integer
        END) AS "delivery_orders"
   FROM "public"."orders" "o"
  GROUP BY ("date"("created_at"))
  ORDER BY ("date"("created_at")) DESC;


ALTER VIEW "public"."daily_sales_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_sales_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid",
    "date" "date" NOT NULL,
    "total_orders" integer DEFAULT 0,
    "pickup_orders" integer DEFAULT 0,
    "delivery_orders" integer DEFAULT 0,
    "cancelled_orders" integer DEFAULT 0,
    "total_revenue" numeric DEFAULT 0,
    "total_items_sold" integer DEFAULT 0,
    "avg_order_value" numeric DEFAULT 0,
    "hourly_stats" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."daily_sales_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."hourly_sales_analytics" AS
 SELECT EXTRACT(hour FROM "created_at") AS "hour_of_day",
    "count"(*) AS "total_orders",
    "sum"(
        CASE
            WHEN ("status" = 'completed'::"text") THEN "total_amount"
            ELSE (0)::numeric
        END) AS "total_revenue",
    "avg"(
        CASE
            WHEN ("status" = 'completed'::"text") THEN "total_amount"
            ELSE NULL::numeric
        END) AS "avg_order_value"
   FROM "public"."orders" "o"
  GROUP BY (EXTRACT(hour FROM "created_at"))
  ORDER BY (EXTRACT(hour FROM "created_at"));


ALTER VIEW "public"."hourly_sales_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_product_id" "uuid",
    "transaction_type" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "previous_quantity" integer NOT NULL,
    "new_quantity" integer NOT NULL,
    "reference_type" "text",
    "reference_id" "uuid",
    "unit_cost" numeric DEFAULT 0,
    "total_cost" numeric DEFAULT 0,
    "reason" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "inventory_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['in'::"text", 'out'::"text", 'adjustment'::"text", 'expired'::"text", 'damaged'::"text", 'returned'::"text"])))
);


ALTER TABLE "public"."inventory_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "priority" "text" DEFAULT 'normal'::"text",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "product_id" "uuid",
    "product_name" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric NOT NULL,
    "discount_amount" numeric DEFAULT 0,
    "subtotal" numeric NOT NULL,
    "options" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "status" "text" NOT NULL,
    "changed_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_status_history" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."payment_method_analytics" AS
 SELECT "payment_method",
    "count"(*) AS "total_orders",
    "sum"(
        CASE
            WHEN ("status" = 'completed'::"text") THEN "total_amount"
            ELSE (0)::numeric
        END) AS "total_revenue",
    "avg"(
        CASE
            WHEN ("status" = 'completed'::"text") THEN "total_amount"
            ELSE NULL::numeric
        END) AS "avg_order_value",
    "count"(
        CASE
            WHEN ("payment_status" = 'paid'::"text") THEN 1
            ELSE NULL::integer
        END) AS "paid_orders",
    "count"(
        CASE
            WHEN ("payment_status" = 'failed'::"text") THEN 1
            ELSE NULL::integer
        END) AS "failed_orders"
   FROM "public"."orders" "o"
  GROUP BY "payment_method"
  ORDER BY ("sum"(
        CASE
            WHEN ("status" = 'completed'::"text") THEN "total_amount"
            ELSE (0)::numeric
        END)) DESC;


ALTER VIEW "public"."payment_method_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "barcode" "text",
    "category_id" "uuid",
    "brand" "text",
    "manufacturer" "text",
    "unit" "text" DEFAULT '개'::"text" NOT NULL,
    "image_urls" "text"[] DEFAULT '{}'::"text"[],
    "base_price" numeric NOT NULL,
    "cost_price" numeric,
    "tax_rate" numeric DEFAULT 0.10,
    "is_active" boolean DEFAULT true,
    "requires_preparation" boolean DEFAULT false,
    "preparation_time" integer DEFAULT 0,
    "nutritional_info" "jsonb" DEFAULT '{}'::"jsonb",
    "allergen_info" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_wishlisted" boolean DEFAULT false,
    "wishlist_count" integer DEFAULT 0
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."product_sales_analytics" AS
 SELECT "p"."id" AS "product_id",
    "p"."name" AS "product_name",
    "c"."name" AS "category_name",
    "count"("oi"."id") AS "total_sold",
    "sum"("oi"."subtotal") AS "total_revenue",
    "avg"("oi"."unit_price") AS "avg_price",
    "count"(DISTINCT "o"."id") AS "order_count"
   FROM ((("public"."products" "p"
     LEFT JOIN "public"."categories" "c" ON (("p"."category_id" = "c"."id")))
     LEFT JOIN "public"."order_items" "oi" ON (("p"."id" = "oi"."product_id")))
     LEFT JOIN "public"."orders" "o" ON ((("oi"."order_id" = "o"."id") AND ("o"."status" = 'completed'::"text"))))
  GROUP BY "p"."id", "p"."name", "c"."name"
  ORDER BY ("sum"("oi"."subtotal")) DESC;


ALTER VIEW "public"."product_sales_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_sales_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid",
    "product_id" "uuid",
    "date" "date" NOT NULL,
    "quantity_sold" integer DEFAULT 0,
    "revenue" numeric DEFAULT 0,
    "avg_price" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_sales_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_wishlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_wishlists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "avatar_url" "text",
    "address" "jsonb",
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['customer'::"text", 'store_owner'::"text", 'headquarters'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shipments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shipment_number" "text" NOT NULL,
    "supply_request_id" "uuid",
    "status" "text" DEFAULT 'preparing'::"text" NOT NULL,
    "carrier" "text",
    "tracking_number" "text",
    "shipped_at" timestamp with time zone,
    "estimated_delivery" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "notes" "text",
    "failure_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shipments_status_check" CHECK (("status" = ANY (ARRAY['preparing'::"text", 'shipped'::"text", 'in_transit'::"text", 'delivered'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."shipments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid",
    "product_id" "uuid",
    "price" numeric NOT NULL,
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "safety_stock" integer DEFAULT 10,
    "max_stock" integer DEFAULT 100,
    "is_available" boolean DEFAULT true,
    "discount_rate" numeric DEFAULT 0,
    "promotion_start_date" timestamp with time zone,
    "promotion_end_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."store_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "uuid",
    "address" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "business_hours" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "location" "public"."geography"(Point,4326),
    "delivery_available" boolean DEFAULT true,
    "pickup_available" boolean DEFAULT true,
    "delivery_radius" integer DEFAULT 3000,
    "min_order_amount" numeric DEFAULT 0,
    "delivery_fee" numeric DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."stores" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."store_sales_analytics" AS
 SELECT "s"."id" AS "store_id",
    "s"."name" AS "store_name",
    "count"("o"."id") AS "total_orders",
    "count"(
        CASE
            WHEN ("o"."status" = 'completed'::"text") THEN 1
            ELSE NULL::integer
        END) AS "completed_orders",
    "sum"(
        CASE
            WHEN ("o"."status" = 'completed'::"text") THEN "o"."total_amount"
            ELSE (0)::numeric
        END) AS "total_revenue",
    "avg"(
        CASE
            WHEN ("o"."status" = 'completed'::"text") THEN "o"."total_amount"
            ELSE NULL::numeric
        END) AS "avg_order_value",
    "count"(
        CASE
            WHEN ("o"."type" = 'pickup'::"text") THEN 1
            ELSE NULL::integer
        END) AS "pickup_orders",
    "count"(
        CASE
            WHEN ("o"."type" = 'delivery'::"text") THEN 1
            ELSE NULL::integer
        END) AS "delivery_orders",
    "max"("o"."created_at") AS "last_order_date"
   FROM ("public"."stores" "s"
     LEFT JOIN "public"."orders" "o" ON (("s"."id" = "o"."store_id")))
  GROUP BY "s"."id", "s"."name"
  ORDER BY ("sum"(
        CASE
            WHEN ("o"."status" = 'completed'::"text") THEN "o"."total_amount"
            ELSE (0)::numeric
        END)) DESC;


ALTER VIEW "public"."store_sales_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supply_request_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supply_request_id" "uuid",
    "product_id" "uuid",
    "product_name" "text" NOT NULL,
    "requested_quantity" integer NOT NULL,
    "approved_quantity" integer DEFAULT 0,
    "unit_cost" numeric DEFAULT 0,
    "total_cost" numeric DEFAULT 0,
    "reason" "text",
    "current_stock" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "supply_request_items_approved_quantity_check" CHECK (("approved_quantity" >= 0)),
    CONSTRAINT "supply_request_items_requested_quantity_check" CHECK (("requested_quantity" > 0))
);


ALTER TABLE "public"."supply_request_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supply_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_number" "text" NOT NULL,
    "store_id" "uuid",
    "requested_by" "uuid",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text",
    "total_amount" numeric DEFAULT 0,
    "approved_amount" numeric DEFAULT 0,
    "expected_delivery_date" "date",
    "actual_delivery_date" "date",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "notes" "text",
    "rejection_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "supply_requests_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "supply_requests_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'submitted'::"text", 'approved'::"text", 'rejected'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."supply_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wishlists" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL
);


ALTER TABLE "public"."wishlists" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."daily_sales_summary"
    ADD CONSTRAINT "daily_sales_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_sales_summary"
    ADD CONSTRAINT "product_sales_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_wishlists"
    ADD CONSTRAINT "product_wishlists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_wishlists"
    ADD CONSTRAINT "product_wishlists_product_id_user_id_key" UNIQUE ("product_id", "user_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_barcode_key" UNIQUE ("barcode");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipments"
    ADD CONSTRAINT "shipments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipments"
    ADD CONSTRAINT "shipments_shipment_number_key" UNIQUE ("shipment_number");



ALTER TABLE ONLY "public"."store_products"
    ADD CONSTRAINT "store_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supply_request_items"
    ADD CONSTRAINT "supply_request_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supply_requests"
    ADD CONSTRAINT "supply_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supply_requests"
    ADD CONSTRAINT "supply_requests_request_number_key" UNIQUE ("request_number");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_user_product_unique" UNIQUE ("user_id", "product_id");



CREATE INDEX "idx_categories_parent_id" ON "public"."categories" USING "btree" ("parent_id");



CREATE INDEX "idx_daily_sales_summary_store_date" ON "public"."daily_sales_summary" USING "btree" ("store_id", "date");



CREATE INDEX "idx_inventory_transactions_store_product_id" ON "public"."inventory_transactions" USING "btree" ("store_product_id");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_status_history_order_id" ON "public"."order_status_history" USING "btree" ("order_id");



CREATE INDEX "idx_orders_customer_created" ON "public"."orders" USING "btree" ("customer_id", "created_at");



CREATE INDEX "idx_orders_customer_id" ON "public"."orders" USING "btree" ("customer_id");



CREATE INDEX "idx_orders_payment_key" ON "public"."orders" USING "btree" ((("payment_data" ->> 'paymentKey'::"text")));



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_store_id" ON "public"."orders" USING "btree" ("store_id");



CREATE INDEX "idx_product_sales_summary_store_product_date" ON "public"."product_sales_summary" USING "btree" ("store_id", "product_id", "date");



CREATE INDEX "idx_products_category_id" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_store_products_store_id" ON "public"."store_products" USING "btree" ("store_id");



CREATE INDEX "idx_stores_owner_id" ON "public"."stores" USING "btree" ("owner_id");



CREATE INDEX "idx_supply_requests_store_id" ON "public"."supply_requests" USING "btree" ("store_id");



CREATE OR REPLACE TRIGGER "log_order_status_change_trigger" AFTER UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."log_order_status_change"();



CREATE OR REPLACE TRIGGER "set_order_number_trigger" BEFORE INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."generate_order_number"();



CREATE OR REPLACE TRIGGER "set_shipment_number_trigger" BEFORE INSERT ON "public"."shipments" FOR EACH ROW EXECUTE FUNCTION "public"."generate_shipment_number"();



CREATE OR REPLACE TRIGGER "set_supply_request_number_trigger" BEFORE INSERT ON "public"."supply_requests" FOR EACH ROW EXECUTE FUNCTION "public"."generate_supply_request_number"();



CREATE OR REPLACE TRIGGER "trigger_initialize_store_products" AFTER INSERT ON "public"."stores" FOR EACH ROW EXECUTE FUNCTION "public"."initialize_store_products"();



CREATE OR REPLACE TRIGGER "trigger_low_stock_check" AFTER UPDATE ON "public"."store_products" FOR EACH ROW EXECUTE FUNCTION "public"."check_low_stock"();



CREATE OR REPLACE TRIGGER "trigger_order_completion" AFTER UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."handle_order_completion"();



CREATE OR REPLACE TRIGGER "trigger_prevent_duplicate_orders" BEFORE INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_duplicate_orders"();



CREATE OR REPLACE TRIGGER "trigger_shipment_delivery" AFTER UPDATE ON "public"."shipments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_shipment_delivery"();



CREATE OR REPLACE TRIGGER "trigger_update_inventory_on_supply_delivery" AFTER UPDATE ON "public"."supply_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_inventory_on_supply_delivery"();



CREATE OR REPLACE TRIGGER "trigger_validate_order_service" BEFORE INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."validate_order_service"();



CREATE OR REPLACE TRIGGER "update_store_product_stock_trigger" AFTER INSERT ON "public"."inventory_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_store_product_stock"();



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."daily_sales_summary"
    ADD CONSTRAINT "daily_sales_summary_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_store_product_id_fkey" FOREIGN KEY ("store_product_id") REFERENCES "public"."store_products"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id");



ALTER TABLE ONLY "public"."product_sales_summary"
    ADD CONSTRAINT "product_sales_summary_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."product_sales_summary"
    ADD CONSTRAINT "product_sales_summary_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id");



ALTER TABLE ONLY "public"."product_wishlists"
    ADD CONSTRAINT "product_wishlists_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_wishlists"
    ADD CONSTRAINT "product_wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."shipments"
    ADD CONSTRAINT "shipments_supply_request_id_fkey" FOREIGN KEY ("supply_request_id") REFERENCES "public"."supply_requests"("id");



ALTER TABLE ONLY "public"."store_products"
    ADD CONSTRAINT "store_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."store_products"
    ADD CONSTRAINT "store_products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id");



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."supply_request_items"
    ADD CONSTRAINT "supply_request_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."supply_request_items"
    ADD CONSTRAINT "supply_request_items_supply_request_id_fkey" FOREIGN KEY ("supply_request_id") REFERENCES "public"."supply_requests"("id");



ALTER TABLE ONLY "public"."supply_requests"
    ADD CONSTRAINT "supply_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."supply_requests"
    ADD CONSTRAINT "supply_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."supply_requests"
    ADD CONSTRAINT "supply_requests_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id");



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow creating notifications for users" ON "public"."notifications" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."orders" "o"
     JOIN "public"."stores" "s" ON (("s"."id" = "o"."store_id")))
  WHERE (("o"."customer_id" = "notifications"."user_id") AND ("s"."owner_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'headquarters'::"text")))) OR ("auth"."uid"() IS NULL)));



CREATE POLICY "Anyone can view active stores" ON "public"."stores" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can view products" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Anyone can view public settings" ON "public"."system_settings" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Customers can create inventory transactions for own orders" ON "public"."inventory_transactions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "inventory_transactions"."reference_id") AND ("o"."customer_id" = "auth"."uid"()) AND ("inventory_transactions"."reference_type" = 'order'::"text")))));



CREATE POLICY "Customers can create order items for own orders" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."customer_id" = "auth"."uid"())))));



CREATE POLICY "Customers can create own orders" ON "public"."orders" FOR INSERT WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "Customers can delete own order items" ON "public"."order_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."customer_id" = "auth"."uid"())))));



CREATE POLICY "Customers can delete own orders" ON "public"."orders" FOR DELETE USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "Customers can view available store products" ON "public"."store_products" FOR SELECT USING ((("is_available" = true) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'customer'::"text"))))));



CREATE POLICY "Customers can view own orders" ON "public"."orders" FOR SELECT USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "HQ can manage all inventory transactions" ON "public"."inventory_transactions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "HQ can manage all settings" ON "public"."system_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "HQ can manage all store products" ON "public"."store_products" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "HQ can manage all stores" ON "public"."stores" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "HQ can manage all supply requests" ON "public"."supply_requests" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "HQ can view all orders" ON "public"."orders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "HQ can view all product sales" ON "public"."product_sales_summary" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "HQ can view all sales summary" ON "public"."daily_sales_summary" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "Only HQ can manage categories" ON "public"."categories" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "Only HQ can manage products" ON "public"."products" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "Only HQ can manage shipments" ON "public"."shipments" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'headquarters'::"text")))));



CREATE POLICY "Store owners can create order status history" ON "public"."order_status_history" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."orders" "o"
     JOIN "public"."stores" "s" ON (("s"."id" = "o"."store_id")))
  WHERE (("o"."id" = "order_status_history"."order_id") AND ("s"."owner_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'headquarters'::"text"))))));



CREATE POLICY "Store owners can create own store" ON "public"."stores" FOR INSERT WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Store owners can manage own inventory transactions" ON "public"."inventory_transactions" USING ((EXISTS ( SELECT 1
   FROM ("public"."store_products" "sp"
     JOIN "public"."stores" "s" ON (("s"."id" = "sp"."store_id")))
  WHERE (("sp"."id" = "inventory_transactions"."store_product_id") AND ("s"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Store owners can manage own store products" ON "public"."store_products" USING (("store_id" IN ( SELECT "stores"."id"
   FROM "public"."stores"
  WHERE ("stores"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Store owners can manage own supply requests" ON "public"."supply_requests" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "supply_requests"."store_id") AND ("s"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Store owners can manage store orders" ON "public"."orders" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "orders"."store_id") AND ("s"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Store owners can update own store" ON "public"."stores" FOR UPDATE USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Store owners can view own product sales" ON "public"."product_sales_summary" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "product_sales_summary"."store_id") AND ("s"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Store owners can view own sales summary" ON "public"."daily_sales_summary" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "daily_sales_summary"."store_id") AND ("s"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Store owners can view own shipments" ON "public"."shipments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."supply_requests" "sr"
     JOIN "public"."stores" "s" ON (("s"."id" = "sr"."store_id")))
  WHERE (("sr"."id" = "shipments"."supply_request_id") AND ("s"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Store owners can view own store" ON "public"."stores" FOR SELECT USING ((("owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['headquarters'::"text", 'customer'::"text"])))))));



CREATE POLICY "Users can create their own wishlists" ON "public"."wishlists" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own wishlists" ON "public"."wishlists" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage supply request items based on request access" ON "public"."supply_request_items" USING ((EXISTS ( SELECT 1
   FROM "public"."supply_requests" "sr"
  WHERE (("sr"."id" = "supply_request_items"."supply_request_id") AND ((EXISTS ( SELECT 1
           FROM "public"."stores" "s"
          WHERE (("s"."id" = "sr"."store_id") AND ("s"."owner_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
           FROM "public"."profiles" "p"
          WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'headquarters'::"text")))))))));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view order items based on order access" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND (("o"."customer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."stores" "s"
          WHERE (("s"."id" = "o"."store_id") AND ("s"."owner_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
           FROM "public"."profiles" "p"
          WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'headquarters'::"text")))))))));



CREATE POLICY "Users can view order status history based on order access" ON "public"."order_status_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_status_history"."order_id") AND (("o"."customer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."stores" "s"
          WHERE (("s"."id" = "o"."store_id") AND ("s"."owner_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
           FROM "public"."profiles" "p"
          WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'headquarters'::"text")))))))));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own wishlists" ON "public"."wishlists" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_sales_summary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_sales_summary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_wishlists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shipments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supply_request_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supply_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wishlists" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "사용자는 자신의 찜 목록만 볼 수 있음" ON "public"."product_wishlists" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "사용자는 자신의 찜 목록만 삭제 가능" ON "public"."wishlists" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "사용자는 자신의 찜 목록만 조회 가능" ON "public"."wishlists" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "사용자는 자신의 찜 목록만 추가 가능" ON "public"."wishlists" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "사용자는 찜하기/취소만 할 수 있음" ON "public"."product_wishlists" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."check_low_stock"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_low_stock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_low_stock"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_shipment_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_shipment_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_shipment_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_supply_request_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_supply_request_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_supply_request_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_rankings"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_rankings"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_rankings"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sales_summary"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_sales_summary"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sales_summary"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_store_rankings"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_store_rankings"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_store_rankings"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_order_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_order_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_order_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_shipment_delivery"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_shipment_delivery"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_shipment_delivery"() TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_store_products"() TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_store_products"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_store_products"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_order_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_order_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_order_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_duplicate_orders"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_duplicate_orders"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_duplicate_orders"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_wishlist"("product_id_param" "uuid", "user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_wishlist"("product_id_param" "uuid", "user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_wishlist"("product_id_param" "uuid", "user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_inventory_on_supply_delivery"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_inventory_on_supply_delivery"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_inventory_on_supply_delivery"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_store_product_stock"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_store_product_stock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_store_product_stock"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_order_service"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_order_service"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_order_service"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_store_service"("p_store_id" "uuid", "p_service_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_store_service"("p_store_id" "uuid", "p_service_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_store_service"("p_store_id" "uuid", "p_service_type" "text") TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."daily_sales_analytics" TO "anon";
GRANT ALL ON TABLE "public"."daily_sales_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_sales_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."daily_sales_summary" TO "anon";
GRANT ALL ON TABLE "public"."daily_sales_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_sales_summary" TO "service_role";



GRANT ALL ON TABLE "public"."hourly_sales_analytics" TO "anon";
GRANT ALL ON TABLE "public"."hourly_sales_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."hourly_sales_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_transactions" TO "anon";
GRANT ALL ON TABLE "public"."inventory_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."order_status_history" TO "anon";
GRANT ALL ON TABLE "public"."order_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."payment_method_analytics" TO "anon";
GRANT ALL ON TABLE "public"."payment_method_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_method_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."product_sales_analytics" TO "anon";
GRANT ALL ON TABLE "public"."product_sales_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."product_sales_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."product_sales_summary" TO "anon";
GRANT ALL ON TABLE "public"."product_sales_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."product_sales_summary" TO "service_role";



GRANT ALL ON TABLE "public"."product_wishlists" TO "anon";
GRANT ALL ON TABLE "public"."product_wishlists" TO "authenticated";
GRANT ALL ON TABLE "public"."product_wishlists" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."shipments" TO "anon";
GRANT ALL ON TABLE "public"."shipments" TO "authenticated";
GRANT ALL ON TABLE "public"."shipments" TO "service_role";



GRANT ALL ON TABLE "public"."store_products" TO "anon";
GRANT ALL ON TABLE "public"."store_products" TO "authenticated";
GRANT ALL ON TABLE "public"."store_products" TO "service_role";



GRANT ALL ON TABLE "public"."stores" TO "anon";
GRANT ALL ON TABLE "public"."stores" TO "authenticated";
GRANT ALL ON TABLE "public"."stores" TO "service_role";



GRANT ALL ON TABLE "public"."store_sales_analytics" TO "anon";
GRANT ALL ON TABLE "public"."store_sales_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."store_sales_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."supply_request_items" TO "anon";
GRANT ALL ON TABLE "public"."supply_request_items" TO "authenticated";
GRANT ALL ON TABLE "public"."supply_request_items" TO "service_role";



GRANT ALL ON TABLE "public"."supply_requests" TO "anon";
GRANT ALL ON TABLE "public"."supply_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."supply_requests" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."wishlists" TO "anon";
GRANT ALL ON TABLE "public"."wishlists" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlists" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
