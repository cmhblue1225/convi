export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          name: string
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name?: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      daily_sales_summary: {
        Row: {
          avg_order_value: number | null
          cancelled_orders: number | null
          created_at: string | null
          date: string
          delivery_orders: number | null
          hourly_stats: Json | null
          id: string
          pickup_orders: number | null
          store_id: string | null
          total_items_sold: number | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          avg_order_value?: number | null
          cancelled_orders?: number | null
          created_at?: string | null
          date: string
          delivery_orders?: number | null
          hourly_stats?: Json | null
          id?: string
          pickup_orders?: number | null
          store_id?: string | null
          total_items_sold?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_order_value?: number | null
          cancelled_orders?: number | null
          created_at?: string | null
          date?: string
          delivery_orders?: number | null
          hourly_stats?: Json | null
          id?: string
          pickup_orders?: number | null
          store_id?: string | null
          total_items_sold?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_sales_summary_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_sales_analytics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "daily_sales_summary_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          new_quantity: number
          notes: string | null
          previous_quantity: number
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          store_product_id: string | null
          total_cost: number | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          new_quantity: number
          notes?: string | null
          previous_quantity: number
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          store_product_id?: string | null
          total_cost?: number | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          new_quantity?: number
          notes?: string | null
          previous_quantity?: number
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          store_product_id?: string | null
          total_cost?: number | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_store_product_id_fkey"
            columns: ["store_product_id"]
            isOneToOne: false
            referencedRelation: "inventory_turnover_analysis"
            referencedColumns: ["store_product_id"]
          },
          {
            foreignKeyName: "inventory_transactions_store_product_id_fkey"
            columns: ["store_product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          id: string
          options: Json | null
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          options?: Json | null
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          options?: Json | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_sales_analytics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          applied_coupon_id: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          coupon_discount_amount: number | null
          created_at: string | null
          customer_id: string | null
          delivery_address: Json | null
          delivery_fee: number | null
          delivery_notes: string | null
          discount_amount: number | null
          estimated_preparation_time: number | null
          id: string
          notes: string | null
          order_number: string
          payment_data: Json | null
          payment_method: string | null
          payment_status: string | null
          pickup_time: string | null
          points_discount_amount: number | null
          points_used: number | null
          status: string
          store_id: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          type: string
          updated_at: string | null
        }
        Insert: {
          applied_coupon_id?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          coupon_discount_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_fee?: number | null
          delivery_notes?: string | null
          discount_amount?: number | null
          estimated_preparation_time?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_data?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_time?: string | null
          points_discount_amount?: number | null
          points_used?: number | null
          status?: string
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          type: string
          updated_at?: string | null
        }
        Update: {
          applied_coupon_id?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          coupon_discount_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_fee?: number | null
          delivery_notes?: string | null
          discount_amount?: number | null
          estimated_preparation_time?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_data?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_time?: string | null
          points_discount_amount?: number | null
          points_used?: number | null
          status?: string
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_applied_coupon_id_fkey"
            columns: ["applied_coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_sales_analytics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      point_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      points: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sales_summary: {
        Row: {
          avg_price: number | null
          created_at: string | null
          date: string
          id: string
          product_id: string | null
          quantity_sold: number | null
          revenue: number | null
          store_id: string | null
        }
        Insert: {
          avg_price?: number | null
          created_at?: string | null
          date: string
          id?: string
          product_id?: string | null
          quantity_sold?: number | null
          revenue?: number | null
          store_id?: string | null
        }
        Update: {
          avg_price?: number | null
          created_at?: string | null
          date?: string
          id?: string
          product_id?: string | null
          quantity_sold?: number | null
          revenue?: number | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_sales_analytics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_sales_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sales_summary_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_sales_analytics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "product_sales_summary_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          image_url: string
          is_primary: boolean | null
          alt_text: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          image_url: string
          is_primary?: boolean | null
          alt_text?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          image_url?: string
          is_primary?: boolean | null
          alt_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_sales_analytics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coupons: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          coupon_id: string
          is_used: boolean | null
          used_at: string | null
          used_order_id: string | null
          expires_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          coupon_id: string
          is_used?: boolean | null
          used_at?: string | null
          used_order_id?: string | null
          expires_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          coupon_id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_order_id?: string | null
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allergen_info: string[] | null
          barcode: string | null
          base_price: number
          brand: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          image_urls: string[] | null
          is_active: boolean | null
          is_wishlisted: boolean | null
          manufacturer: string | null
          name: string
          nutritional_info: Json | null
          preparation_time: number | null
          requires_preparation: boolean | null
          shelf_life_days: number | null
          tax_rate: number | null
          unit: string
          updated_at: string | null
          wishlist_count: number | null
        }
        Insert: {
          allergen_info?: string[] | null
          barcode?: string | null
          base_price: number
          brand?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean | null
          is_wishlisted?: boolean | null
          manufacturer?: string | null
          name: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          requires_preparation?: boolean | null
          shelf_life_days?: number | null
          tax_rate?: number | null
          unit?: string
          updated_at?: string | null
          wishlist_count?: number | null
        }
        Update: {
          allergen_info?: string[] | null
          barcode?: string | null
          base_price?: number
          brand?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean | null
          is_wishlisted?: boolean | null
          manufacturer?: string | null
          name?: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          requires_preparation?: boolean | null
          shelf_life_days?: number | null
          tax_rate?: number | null
          unit?: string
          updated_at?: string | null
          wishlist_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          email: string | null
          first_name: string
          full_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          notification_settings: Json | null
          phone: string | null
          preferences: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          full_name: string
          gender?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          notification_settings?: Json | null
          phone?: string | null
          preferences?: Json | null
          role: string
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          full_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          notification_settings?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string | null
          delivered_at: string | null
          estimated_delivery: string | null
          failure_reason: string | null
          id: string
          notes: string | null
          shipment_number: string
          shipped_at: string | null
          status: string
          supply_request_id: string | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          failure_reason?: string | null
          id?: string
          notes?: string | null
          shipment_number: string
          shipped_at?: string | null
          status?: string
          supply_request_id?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          failure_reason?: string | null
          id?: string
          notes?: string | null
          shipment_number?: string
          shipped_at?: string | null
          status?: string
          supply_request_id?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_supply_request_id_fkey"
            columns: ["supply_request_id"]
            isOneToOne: false
            referencedRelation: "supply_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          created_at: string | null
          discount_rate: number | null
          id: string
          is_available: boolean | null
          max_stock: number | null
          price: number
          product_id: string | null
          promotion_end_date: string | null
          promotion_start_date: string | null
          safety_stock: number | null
          stock_quantity: number
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_rate?: number | null
          id?: string
          is_available?: boolean | null
          max_stock?: number | null
          price: number
          product_id?: string | null
          promotion_end_date?: string | null
          promotion_start_date?: string | null
          safety_stock?: number | null
          stock_quantity?: number
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_rate?: number | null
          id?: string
          is_available?: boolean | null
          max_stock?: number | null
          price?: number
          product_id?: string | null
          promotion_end_date?: string | null
          promotion_start_date?: string | null
          safety_stock?: number | null
          stock_quantity?: number
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_sales_analytics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "store_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_sales_analytics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          address_details: Json | null
          business_hours: Json
          created_at: string | null
          delivery_available: boolean | null
          delivery_fee: number | null
          delivery_radius: number | null
          id: string
          is_active: boolean | null
          location: unknown | null
          min_order_amount: number | null
          name: string
          owner_id: string | null
          phone: string
          pickup_available: boolean | null
          updated_at: string | null
        }
        Insert: {
          address: string
          address_details?: Json | null
          business_hours?: Json
          created_at?: string | null
          delivery_available?: boolean | null
          delivery_fee?: number | null
          delivery_radius?: number | null
          id?: string
          is_active?: boolean | null
          location?: unknown | null
          min_order_amount?: number | null
          name: string
          owner_id?: string | null
          phone: string
          pickup_available?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          address_details?: Json | null
          business_hours?: Json
          created_at?: string | null
          delivery_available?: boolean | null
          delivery_fee?: number | null
          delivery_radius?: number | null
          id?: string
          is_active?: boolean | null
          location?: unknown | null
          min_order_amount?: number | null
          name?: string
          owner_id?: string | null
          phone?: string
          pickup_available?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_request_items: {
        Row: {
          approved_quantity: number | null
          created_at: string | null
          current_stock: number | null
          id: string
          product_id: string | null
          product_name: string
          reason: string | null
          requested_quantity: number
          supply_request_id: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          approved_quantity?: number | null
          created_at?: string | null
          current_stock?: number | null
          id?: string
          product_id?: string | null
          product_name: string
          reason?: string | null
          requested_quantity: number
          supply_request_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          approved_quantity?: number | null
          created_at?: string | null
          current_stock?: number | null
          id?: string
          product_id?: string | null
          product_name?: string
          reason?: string | null
          requested_quantity?: number
          supply_request_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_sales_analytics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "supply_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_request_items_supply_request_id_fkey"
            columns: ["supply_request_id"]
            isOneToOne: false
            referencedRelation: "supply_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_requests: {
        Row: {
          actual_delivery_date: string | null
          approved_amount: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          priority: string | null
          rejection_reason: string | null
          request_number: string
          requested_by: string | null
          status: string
          store_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          approved_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          rejection_reason?: string | null
          request_number: string
          requested_by?: string | null
          status?: string
          store_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          approved_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          rejection_reason?: string | null
          request_number?: string
          requested_by?: string | null
          status?: string
          store_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_sales_analytics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "supply_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_coupon: {
        Args: {
          coupon_code: string
          user_uuid: string
          order_amount: number
        }
        Returns: {
          is_valid: boolean
          discount_amount: number
          message: string
        }[]
      }
      earn_points: {
        Args: {
          user_uuid: string
          order_amount: number
          order_uuid: string
        }
        Returns: undefined
      }
      get_user_total_points: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
      add_welcome_bonus: {
        Args: {
          user_uuid: string
        }
        Returns: undefined
      }
      use_coupon: {
        Args: {
          user_uuid: string
          coupon_uuid: string
          order_uuid: string
        }
        Returns: boolean
      }
      give_coupon_to_user: {
        Args: {
          user_uuid: string
          coupon_code: string
          expires_at?: string
        }
        Returns: boolean
      }
      distribute_coupon_to_all_users: {
        Args: {
          coupon_code: string
          expires_at?: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database & "public"]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never