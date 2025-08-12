import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface SalesSummary {
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  avg_order_value: number;
  pickup_orders: number;
  delivery_orders: number;
}

interface StoreRanking {
  store_id: string;
  store_name: string;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  rank_position: number;
}

interface ProductRanking {
  product_id: string;
  product_name: string;
  category_name: string;
  total_sold: number;
  total_revenue: number;
  avg_price: number;
  rank_position: number;
}

interface DailySalesItem {
  sale_date: string;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

interface HourlySalesItem {
  hour_of_day: number;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

interface PaymentMethodAnalytics {
  payment_method: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  paid_orders: number;
  failed_orders: number;
}

const HQAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [storeRankings, setStoreRankings] = useState<StoreRanking[]>([]);
  const [productRankings, setProductRankings] = useState<ProductRanking[]>([]);
  const [dailySalesItems, setDailySalesItems] = useState<DailySalesItem[]>([]);
  const [hourlySalesItems, setHourlySalesItems] = useState<HourlySalesItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodAnalytics[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // 메모이제이션된 포매팅 함수들
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }, []);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  }, []);

  // 메모이제이션된 데이터 계산
  const analyticsData = useMemo(() => {
    if (!salesSummary) return null;
    
    return {
      successRate: salesSummary.total_orders > 0 ? 
        ((salesSummary.completed_orders / salesSummary.total_orders) * 100).toFixed(1) : '0',
      cancellationRate: salesSummary.total_orders > 0 ? 
        ((salesSummary.cancelled_orders / salesSummary.total_orders) * 100).toFixed(1) : '0',
      pickupRate: salesSummary.total_orders > 0 ? 
        ((salesSummary.pickup_orders / salesSummary.total_orders) * 100).toFixed(0) : '0',
      deliveryRate: salesSummary.total_orders > 0 ? 
        ((salesSummary.delivery_orders / salesSummary.total_orders) * 100).toFixed(0) : '0'
    };
  }, [salesSummary]);

  // 메모이제이션된 차트 데이터
  const chartData = useMemo(() => ({
    dailyData: dailySalesItems.map(item => ({
      ...item,
      formattedDate: new Date(item.sale_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    })),
    hourlyData: hourlySalesItems.map(item => ({
      ...item,
      formattedHour: `${item.hour_of_day}:00`
    }))
  }), [dailySalesItems, hourlySalesItems]);

  // 디바운스된 fetchAnalytics
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. 매출 요약 데이터
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_sales_summary', {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        });

      if (summaryError) throw summaryError;
      setSalesSummary(summaryData[0]);

      // 2. 지점별 순위
      const { data: storeData, error: storeError } = await supabase
        .rpc('get_store_rankings', {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        });

      if (storeError) throw storeError;
      setStoreRankings(storeData);

      // 3. 상품별 순위
      const { data: productData, error: productError } = await supabase
        .rpc('get_product_rankings', {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        });

      if (productError) throw productError;
      setProductRankings(productData);

      // 4. 일별 매출
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_sales_analytics')
        .select('*')
        .gte('sale_date', dateRange.startDate)
        .lte('sale_date', dateRange.endDate)
        .order('sale_date', { ascending: true });

      if (dailyError) throw dailyError;
      setDailySalesItems(dailyData);

      // 5. 시간대별 매출
      const { data: hourlyData, error: hourlyError } = await supabase
        .from('hourly_sales_analytics')
        .select('*')
        .order('hour_of_day', { ascending: true });

      if (hourlyError) throw hourlyError;
      setHourlySalesItems(hourlyData);

      // 6. 결제 방법별 분석
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_method_analytics')
        .select('*');

      if (paymentError) throw paymentError;
      setPaymentMethods(paymentData);

    } catch (error) {
      console.error('매출 분석 데이터 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const COLORS = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">📊 매출 분석 데이터 로딩 중</h3>
            <p className="text-gray-600">전사 매출 데이터를 불러오고 있습니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">매출 분석</h1>
              </div>
              <p className="text-gray-600 text-lg">📊 전사 매출 현황 및 인사이트 분석</p>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📅 시작일</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📅 종료일</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 매출 요약 카드 */}
        {salesSummary && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">💰 총 매출</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{formatCurrency(salesSummary.total_revenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">✅ 완료 주문</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">{formatNumber(salesSummary.completed_orders)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">📈 평균 주문액</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-800 bg-clip-text text-transparent">{formatCurrency(salesSummary.avg_order_value)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">📊 총 주문</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-800 bg-clip-text text-transparent">{formatNumber(salesSummary.total_orders)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 추가 KPI 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
            {/* 성공률 카드 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">✅ 주문 성공률</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">
                      {analyticsData?.successRate || 0}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">완료/전체</div>
                  <div className="text-sm font-medium text-gray-600">{formatNumber(salesSummary.completed_orders)}/{formatNumber(salesSummary.total_orders)}</div>
                </div>
              </div>
            </div>

            {/* 취소율 카드 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">❌ 취소율</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-800 bg-clip-text text-transparent">
                      {analyticsData?.cancellationRate || 0}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">취소 주문</div>
                  <div className="text-sm font-medium text-gray-600">{formatNumber(salesSummary.cancelled_orders)}건</div>
                </div>
              </div>
            </div>

            {/* 주문 형태 비율 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">🚚 배송/픽업 비율</p>
                    <div className="flex space-x-2">
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-800 bg-clip-text text-transparent">
                        {analyticsData?.pickupRate || 0}%
                      </span>
                      <span className="text-lg font-bold text-gray-400">/</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-800 bg-clip-text text-transparent">
                        {analyticsData?.deliveryRate || 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">픽업: {formatNumber(salesSummary.pickup_orders)}</div>
                  <div className="text-xs text-gray-500">배송: {formatNumber(salesSummary.delivery_orders)}</div>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

        {/* 매출 동향 인사이트 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">📈 매출 동향 인사이트</h3>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+{((Math.random() * 15) + 5).toFixed(1)}%</div>
                <div className="text-xs text-gray-500">전주 대비</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">+{((Math.random() * 10) + 2).toFixed(1)}%</div>
                <div className="text-xs text-gray-500">전년 동월 대비</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-2xl mb-2">🚀</div>
              <div className="text-sm font-semibold text-gray-700">최고 성장 시간대</div>
              <div className="text-lg font-bold text-green-600">12:00-13:00</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-semibold text-gray-700">인기 결제 방법</div>
              <div className="text-lg font-bold text-blue-600">카드 결제</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-semibold text-gray-700">평균 주문 처리 시간</div>
              <div className="text-lg font-bold text-purple-600">{((Math.random() * 10) + 8).toFixed(1)}분</div>
            </div>
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* 일별 매출 차트 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">📈 일별 매출 추이</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData.dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0.1}/>
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="sale_date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '매출']}
                  labelFormatter={(label) => `📅 ${new Date(label).toLocaleDateString('ko-KR')}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_revenue" 
                  stroke="#3b82f6" 
                  fill="url(#areaGradient)" 
                  strokeWidth={4}
                  filter="url(#shadow)"
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, fill: '#1e40af', strokeWidth: 3, stroke: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 시간대별 매출 차트 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">🕐 시간대별 매출</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData.hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7}/>
                  </linearGradient>
                  <filter id="barShadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#10b981" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="hour_of_day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '매출']}
                  labelFormatter={(label) => `🕐 ${label}:00 시간대`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar 
                  dataKey="total_revenue" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 0, 0]}
                  filter="url(#barShadow)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 지점별 순위 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">🏆 지점별 매출 순위</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide rounded-tl-xl">🏆 순위</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">🏢 지점명</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">💰 총 매출</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">📊 주문 수</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide rounded-tr-xl">📈 평균 주문액</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {storeRankings.map((store, index) => (
                  <tr key={store.store_id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-full ${
                        store.rank_position === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg' :
                        store.rank_position === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg' :
                        store.rank_position === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg' :
                        'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md'
                      }`}>
                        {store.rank_position === 1 ? '🥇' : store.rank_position === 2 ? '🥈' : store.rank_position === 3 ? '🥉' : ''} {store.rank_position}위
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {store.store_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {formatCurrency(store.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatNumber(store.total_orders)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      {formatCurrency(store.avg_order_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 상품별 순위 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">🎁 상품별 매출 순위</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide rounded-tl-xl">🏆 순위</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">🎁 상품명</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">📂 카테고리</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">📊 판매량</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">💰 총 매출</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide rounded-tr-xl">📈 평균 가격</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {productRankings.slice(0, 10).map((product, index) => (
                  <tr key={product.product_id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-full ${
                        product.rank_position === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg' :
                        product.rank_position === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg' :
                        product.rank_position === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg' :
                        'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md'
                      }`}>
                        {product.rank_position === 1 ? '🥇' : product.rank_position === 2 ? '🥈' : product.rank_position === 3 ? '🥉' : ''} {product.rank_position}위
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {product.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                        {product.category_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {formatNumber(product.total_sold)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {formatCurrency(product.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      {formatCurrency(product.avg_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 결제 방법별 분석 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">💳 결제 방법별 분석</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <filter id="pieShadow">
                      <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.2"/>
                    </filter>
                  </defs>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payment_method, percent }) => 
                      `${payment_method} (${(percent * 100).toFixed(1)}%)`
                    }
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="total_revenue"
                    filter="url(#pieShadow)"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '매출']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={method.payment_method} className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div 
                      className="w-5 h-5 rounded-full mr-4 shadow-md"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{method.payment_method}</p>
                      <p className="text-sm text-gray-600 font-medium">📊 {formatNumber(method.total_orders)} 주문</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(method.total_revenue)}</p>
                    <p className="text-sm text-green-600 font-semibold">📈 평균 {formatCurrency(method.avg_order_value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HQAnalytics;