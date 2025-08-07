import React, { useState, useEffect } from 'react';
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

interface DailySales {
  sale_date: string;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

interface HourlySales {
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
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodAnalytics[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
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
      setDailySales(dailyData);

      // 5. 시간대별 매출
      const { data: hourlyData, error: hourlyError } = await supabase
        .from('hourly_sales_analytics')
        .select('*')
        .order('hour_of_day', { ascending: true });

      if (hourlyError) throw hourlyError;
      setHourlySales(hourlyData);

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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="매출 분석 데이터를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">매출 분석</h1>
              <p className="text-gray-600 mt-1">전사 매출 현황 및 분석</p>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 매출 요약 카드 */}
        {salesSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesSummary.total_revenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">완료 주문</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(salesSummary.completed_orders)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">평균 주문액</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesSummary.avg_order_value)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 주문</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(salesSummary.total_orders)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 일별 매출 차트 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일별 매출 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="sale_date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '매출']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('ko-KR')}
                />
                <Area type="monotone" dataKey="total_revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 시간대별 매출 차트 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">시간대별 매출</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour_of_day" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '매출']}
                  labelFormatter={(label) => `${label}시`}
                />
                <Bar dataKey="total_revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 지점별 순위 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">지점별 매출 순위</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지점명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 매출</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문 수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 주문액</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {storeRankings.map((store) => (
                  <tr key={store.store_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        store.rank_position === 1 ? 'bg-yellow-100 text-yellow-800' :
                        store.rank_position === 2 ? 'bg-gray-100 text-gray-800' :
                        store.rank_position === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {store.rank_position}위
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {store.store_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(store.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(store.total_orders)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(store.avg_order_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 상품별 순위 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상품별 매출 순위</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">판매량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 매출</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 가격</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productRankings.slice(0, 10).map((product) => (
                  <tr key={product.product_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.rank_position === 1 ? 'bg-yellow-100 text-yellow-800' :
                        product.rank_position === 2 ? 'bg-gray-100 text-gray-800' :
                        product.rank_position === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {product.rank_position}위
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(product.total_sold)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.avg_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 결제 방법별 분석 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 방법별 분석</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payment_method, total_revenue }) => 
                      `${payment_method}: ${formatCurrency(total_revenue)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_revenue"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '매출']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={method.payment_method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{method.payment_method}</p>
                      <p className="text-sm text-gray-600">{formatNumber(method.total_orders)} 주문</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(method.total_revenue)}</p>
                    <p className="text-sm text-gray-600">평균 {formatCurrency(method.avg_order_value)}</p>
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