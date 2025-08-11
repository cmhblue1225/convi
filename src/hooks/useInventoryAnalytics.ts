import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthStore } from '../stores/common/authStore';

export interface InventorySummary {
  total_products: number;
  out_of_stock_count: number;
  low_stock_count: number;
  overstock_count: number;
  dead_stock_count: number;
  slow_moving_count: number;
  normal_stock_count: number;
  total_stock_value: number;
  avg_turnover_ratio: number;
  products_need_attention: number;
}

export interface ProblematicProduct {
  store_product_id: string;
  product_name: string;
  category_name: string;
  current_stock: number;
  stock_status: string;
  days_of_stock: number;
  last_sale_date: string | null;
  sales_last_30_days: number;
  stock_value: number;
  turnover_ratio_monthly: number;
  recommendation: string;
}

export interface InventoryPerformance {
  rank_position: number;
  product_name: string;
  category_name: string;
  turnover_ratio_monthly: number;
  sales_last_30_days: number;
  revenue_last_30_days: number;
  current_stock: number;
  stock_status: string;
  performance_grade: string;
}

export function useInventoryAnalytics() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [problematicProducts, setProblematicProducts] = useState<ProblematicProduct[]>([]);
  const [performanceRanking, setPerformanceRanking] = useState<InventoryPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  const fetchInventorySummary = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_store_inventory_summary', { p_store_id: storeId });

      if (error) throw error;
      if (data && data.length > 0) {
        setSummary(data[0]);
      }
    } catch (err) {
      console.error('재고 요약 조회 오류:', err);
      console.error('상세 오류:', JSON.stringify(err, null, 2));
      throw err;
    }
  };

  const fetchProblematicProducts = async (storeId: string, status: string = 'all') => {
    try {
      const { data, error } = await supabase
        .rpc('get_problematic_inventory', { 
          p_store_id: storeId,
          p_status: status 
        });

      if (error) throw error;
      setProblematicProducts(data || []);
    } catch (err) {
      console.error('문제 재고 조회 오류:', err);
      console.error('상세 오류:', JSON.stringify(err, null, 2));
      throw err;
    }
  };

  const fetchPerformanceRanking = async (storeId: string, limit: number = 20) => {
    try {
      const { data, error } = await supabase
        .rpc('get_inventory_performance_ranking', { 
          p_store_id: storeId,
          p_limit: limit 
        });

      if (error) throw error;
      setPerformanceRanking(data || []);
    } catch (err) {
      console.error('재고 성과 순위 조회 오류:', err);
      console.error('상세 오류:', JSON.stringify(err, null, 2));
      throw err;
    }
  };

  const fetchAllData = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 점주인 경우 자신의 지점 조회
      if (user.role === 'store_owner') {
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (storeError || !storeData) {
          throw new Error('지점 정보를 찾을 수 없습니다.');
        }

        await Promise.all([
          fetchInventorySummary(storeData.id),
          fetchProblematicProducts(storeData.id),
          fetchPerformanceRanking(storeData.id)
        ]);
      } else {
        throw new Error('점주만 재고 분석을 조회할 수 있습니다.');
      }
    } catch (err) {
      console.error('재고 분석 데이터 조회 오류:', err);
      console.error('상세 오류:', JSON.stringify(err, null, 2));
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  return {
    summary,
    problematicProducts,
    performanceRanking,
    loading,
    error,
    refetch,
    fetchProblematicProducts: async (status: string = 'all') => {
      if (!user || user.role !== 'store_owner') return;
      
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (storeData) {
        await fetchProblematicProducts(storeData.id, status);
      }
    }
  };
}
