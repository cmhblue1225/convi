import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthStore } from '../stores/common/authStore';

export interface DailySalesData {
  date: string;
  total_revenue: number;
  total_orders: number;
  pickup_orders: number;
  delivery_orders: number;
  avg_order_value: number;
}

export interface ProductSalesData {
  product_name: string;
  quantity_sold: number;
  revenue: number;
  avg_price: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growthRate: number;
  pickupRatio: number;
  deliveryRatio: number;
}

export function useStoreAnalytics(period: 'week' | 'month' | 'year' = 'month') {
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [productSales, setProductSales] = useState<ProductSalesData[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    
    fetchAnalyticsData();
  }, [user, period]);

  const fetchAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // 사용자의 지점 정보 가져오기
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (storeError || !stores) {
        throw new Error('지점 정보를 찾을 수 없습니다.');
      }

      const storeId = stores.id;

      // 기간별 필터링
      let dateFilter = '';
      const now = new Date();
      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString();
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          dateFilter = yearAgo.toISOString();
          break;
      }

      // 실제 주문 데이터에서 일별 매출 집계
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          type,
          total_amount,
          created_at,
          status
        `)
        .eq('store_id', storeId)
        .eq('status', 'completed')
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // 실제 주문 아이템 데이터에서 상품별 매출 집계
      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          product_name,
          quantity,
          unit_price,
          subtotal,
          orders!inner(
            store_id,
            status,
            created_at
          )
        `)
        .eq('orders.store_id', storeId)
        .eq('orders.status', 'completed')
        .gte('orders.created_at', dateFilter);

      if (itemsError) throw itemsError;

      // 일별 데이터 집계
      const dailyMap = new Map<string, {
        total_revenue: number;
        total_orders: number;
        pickup_orders: number;
        delivery_orders: number;
      }>();

      (ordersData || []).forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const current = dailyMap.get(date) || {
          total_revenue: 0,
          total_orders: 0,
          pickup_orders: 0,
          delivery_orders: 0
        };

        current.total_revenue += parseFloat(order.total_amount || '0');
        current.total_orders += 1;
        
        if (order.type === 'pickup') {
          current.pickup_orders += 1;
        } else if (order.type === 'delivery') {
          current.delivery_orders += 1;
        }

        dailyMap.set(date, current);
      });

      // 일별 데이터 변환
      const formattedDailyData: DailySalesData[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          total_revenue: data.total_revenue,
          total_orders: data.total_orders,
          pickup_orders: data.pickup_orders,
          delivery_orders: data.delivery_orders,
          avg_order_value: data.total_orders > 0 ? data.total_revenue / data.total_orders : 0
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // 상품별 데이터 집계
      const productMap = new Map<string, {
        quantity_sold: number;
        revenue: number;
        total_price: number;
        order_count: number;
      }>();

      (orderItemsData || []).forEach(item => {
        const current = productMap.get(item.product_name) || {
          quantity_sold: 0,
          revenue: 0,
          total_price: 0,
          order_count: 0
        };

        current.quantity_sold += item.quantity;
        current.revenue += parseFloat(item.subtotal || '0');
        current.total_price += parseFloat(item.unit_price || '0');
        current.order_count += 1;

        productMap.set(item.product_name, current);
      });

      // 상품별 데이터 변환 (판매량 순으로 정렬)
      const formattedProductData: ProductSalesData[] = Array.from(productMap.entries())
        .map(([product_name, data]) => ({
          product_name,
          quantity_sold: data.quantity_sold,
          revenue: data.revenue,
          avg_price: data.order_count > 0 ? data.total_price / data.order_count : 0
        }))
        .sort((a, b) => b.quantity_sold - a.quantity_sold)
        .slice(0, 10);

      // 메트릭 계산
      const totalRevenue = formattedDailyData.reduce((sum, item) => sum + item.total_revenue, 0);
      const totalOrders = formattedDailyData.reduce((sum, item) => sum + item.total_orders, 0);
      const totalPickup = formattedDailyData.reduce((sum, item) => sum + item.pickup_orders, 0);
      const totalDelivery = formattedDailyData.reduce((sum, item) => sum + item.delivery_orders, 0);
      
      // 성장률 계산 (이전 기간 대비)
      const midPoint = Math.floor(formattedDailyData.length / 2);
      const firstHalf = formattedDailyData.slice(0, midPoint);
      const secondHalf = formattedDailyData.slice(midPoint);
      
      const firstHalfRevenue = firstHalf.reduce((sum, item) => sum + item.total_revenue, 0);
      const secondHalfRevenue = secondHalf.reduce((sum, item) => sum + item.total_revenue, 0);
      
      const growthRate = firstHalfRevenue > 0 
        ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
        : 0;

      const calculatedMetrics: SalesMetrics = {
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        growthRate,
        pickupRatio: totalOrders > 0 ? (totalPickup / totalOrders) * 100 : 0,
        deliveryRatio: totalOrders > 0 ? (totalDelivery / totalOrders) * 100 : 0
      };

      setDailySales(formattedDailyData);
      setProductSales(formattedProductData);
      setMetrics(calculatedMetrics);

    } catch (err) {
      console.error('Analytics data fetch error:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAnalyticsData();
  };

  return {
    dailySales,
    productSales,
    metrics,
    loading,
    error,
    refetch
  };
}