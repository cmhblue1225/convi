import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  owner_id: string | null;
  created_at: string | null;
  profiles: {
    full_name: string;
    phone: string | null;
  };
}

interface StoreStats {
  store_id: string;
  store_name: string;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  low_stock_products: number;
  last_order_date: string | null;
  supply_requests_pending: number;
}

interface SupplyRequestStats {
  total_requests: number;
  pending_requests: number;
  urgent_requests: number;
  total_amount: number;
}

const HQDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeStats, setStoreStats] = useState<StoreStats[]>([]);
  const [supplyStats, setSupplyStats] = useState<SupplyRequestStats>({
    total_requests: 0,
    pending_requests: 0,
    urgent_requests: 0,
    total_amount: 0
  });
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStores(),
        fetchStoreStats(),
        fetchSupplyStats()
      ]);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      console.log('🏪 지점 목록 조회 시작...');
      
      // 지점 목록 조회 (소유자 정보 없이)
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (storesError) throw storesError;

      // 기본 소유자 정보 설정
      const storesWithProfiles = (storesData || []).map((store) => ({
        ...store,
        profiles: {
          full_name: store.owner_id ? '점주' : '미지정',
          phone: store.owner_id ? '***-****-****' : 'N/A'
        }
      }));

      console.log('✅ 지점 목록 조회 성공:', storesWithProfiles.length, '개');
      setStores(storesWithProfiles);
    } catch (error) {
      console.error('❌ 지점 목록 조회 실패:', error);
    }
  };

  const fetchStoreStats = async () => {
    try {
      console.log('📊 지점별 통계 조회 시작...');
      
      // 지점별 주문 통계
      const { data: orderStats, error: orderError } = await supabase
        .from('orders')
        .select(`
          store_id,
          total_amount,
          status,
          created_at,
          stores!inner(name)
        `);

      if (orderError) throw orderError;

      // 지점별 재고 부족 상품 통계
      const { data: stockStats, error: stockError } = await supabase
        .from('store_products')
        .select(`
          store_id,
          stock_quantity,
          safety_stock,
          stores!inner(name)
        `);

      if (stockError) throw stockError;

      // 지점별 물류 요청 통계
      const { data: supplyRequestStats, error: supplyError } = await supabase
        .from('supply_requests')
        .select(`
          store_id,
          status,
          stores!inner(name)
        `);

      if (supplyError) throw supplyError;

      // 데이터 집계
      const statsMap = new Map<string, StoreStats>();

      // 주문 통계 집계
      orderStats?.forEach(order => {
        const storeId = order.store_id;
        const storeName = order.stores?.name || '알 수 없는 지점';
        
        if (storeId && !statsMap.has(storeId)) {
          statsMap.set(storeId, {
            store_id: storeId,
            store_name: storeName,
            total_orders: 0,
            total_revenue: 0,
            pending_orders: 0,
            low_stock_products: 0,
            last_order_date: null,
            supply_requests_pending: 0
          });
        }

        if (storeId) {
          const stats = statsMap.get(storeId);
          if (stats) {
            stats.total_orders++;
            stats.total_revenue += order.total_amount;
            
            if (order.status === 'pending') {
              stats.pending_orders++;
            }

            if (!stats.last_order_date || (order.created_at && order.created_at > stats.last_order_date)) {
              stats.last_order_date = order.created_at;
            }
          }
        }
      });

      // 재고 부족 상품 집계
      stockStats?.forEach(product => {
        const storeId = product.store_id;
        const storeName = product.stores?.name || '알 수 없는 지점';
        
        if (storeId && !statsMap.has(storeId)) {
          statsMap.set(storeId, {
            store_id: storeId,
            store_name: storeName,
            total_orders: 0,
            total_revenue: 0,
            pending_orders: 0,
            low_stock_products: 0,
            last_order_date: null,
            supply_requests_pending: 0
          });
        }

        if (storeId) {
          const stats = statsMap.get(storeId);
          if (stats && product.safety_stock !== null && product.stock_quantity <= product.safety_stock) {
            stats.low_stock_products++;
          }
        }
      });

      // 물류 요청 집계
      supplyRequestStats?.forEach(request => {
        const storeId = request.store_id;
        const storeName = request.stores?.name || '알 수 없는 지점';
        
        if (storeId && !statsMap.has(storeId)) {
          statsMap.set(storeId, {
            store_id: storeId,
            store_name: storeName,
            total_orders: 0,
            total_revenue: 0,
            pending_orders: 0,
            low_stock_products: 0,
            last_order_date: null,
            supply_requests_pending: 0
          });
        }

        if (storeId) {
          const stats = statsMap.get(storeId);
          if (stats && request.status === 'submitted') {
            stats.supply_requests_pending++;
          }
        }
      });

      console.log('✅ 지점별 통계 조회 성공:', statsMap.size, '개');
      setStoreStats(Array.from(statsMap.values()));
    } catch (error) {
      console.error('❌ 지점별 통계 조회 실패:', error);
    }
  };

  const fetchSupplyStats = async () => {
    try {
      console.log('📦 물류 요청 통계 조회 시작...');
      const { data, error } = await supabase
        .from('supply_requests')
        .select('status, priority, total_amount');

      if (error) throw error;

      const stats = {
        total_requests: data?.length || 0,
        pending_requests: data?.filter(r => r.status === 'submitted').length || 0,
        urgent_requests: data?.filter(r => r.priority === 'urgent' && r.status === 'submitted').length || 0,
        total_amount: data?.filter(r => r.status === 'submitted').reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0
      };

      console.log('✅ 물류 요청 통계 조회 성공:', stats);
      setSupplyStats(stats);
    } catch (error) {
      console.error('❌ 물류 요청 통계 조회 실패:', error);
    }
  };

  const getStoreStatusColor = (stats: StoreStats) => {
    if (stats.supply_requests_pending > 0 || stats.low_stock_products > 0) {
      return 'border-red-200 bg-red-50';
    }
    if (stats.pending_orders > 0) {
      return 'border-yellow-200 bg-yellow-50';
    }
    return 'border-green-200 bg-green-50';
  };

  const getStoreStatusIcon = (stats: StoreStats) => {
    if (stats.supply_requests_pending > 0 || stats.low_stock_products > 0) {
      return '🚨';
    }
    if (stats.pending_orders > 0) {
      return '⚠️';
    }
    return '✅';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">본사 대시보드</h1>
        <p className="text-accent-100">전국 지점 현황을 실시간으로 모니터링하세요</p>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              🏪
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">총 지점수</p>
              <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              💰
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">총 매출</p>
              <p className="text-2xl font-bold text-gray-900">
                ₩{storeStats.reduce((sum, s) => sum + s.total_revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              📋
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">대기중 물류요청</p>
              <p className="text-2xl font-bold text-gray-900">{supplyStats.pending_requests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              🚨
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">긴급 요청</p>
              <p className="text-2xl font-bold text-gray-900">{supplyStats.urgent_requests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 지점별 현황 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">지점별 현황</h3>
          <p className="text-sm text-gray-600">각 지점의 실시간 운영 현황을 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {storeStats.map((stats) => {
            const store = stores.find(s => s.id === stats.store_id);
            return (
              <div
                key={stats.store_id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getStoreStatusColor(stats)}`}
                onClick={() => setSelectedStore(selectedStore === stats.store_id ? null : stats.store_id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getStoreStatusIcon(stats)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{stats.store_name}</h4>
                      <p className="text-sm text-gray-600">{store?.address}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">총 주문</p>
                    <p className="font-semibold text-gray-900">{stats.total_orders}건</p>
                  </div>
                  <div>
                    <p className="text-gray-600">총 매출</p>
                    <p className="font-semibold text-gray-900">₩{stats.total_revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">대기 주문</p>
                    <p className={`font-semibold ${stats.pending_orders > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {stats.pending_orders}건
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">재고 부족</p>
                    <p className={`font-semibold ${stats.low_stock_products > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {stats.low_stock_products}개
                    </p>
                  </div>
                </div>

                {stats.supply_requests_pending > 0 && (
                  <div className="mt-3 p-2 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      🚨 물류 요청 대기: {stats.supply_requests_pending}건
                    </p>
                  </div>
                )}

                {selectedStore === stats.store_id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">지점장:</span>
                        <span className="font-medium">{store?.profiles?.full_name || '미등록'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">연락처:</span>
                        <span className="font-medium">{store?.phone || '미등록'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">최근 주문:</span>
                        <span className="font-medium">
                          {stats.last_order_date 
                            ? new Date(stats.last_order_date).toLocaleDateString()
                            : '주문 없음'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">개점일:</span>
                        <span className="font-medium">
                          {store && store.created_at ? new Date(store.created_at).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {storeStats.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            등록된 지점이 없습니다.
          </div>
        )}
      </div>

      {/* 물류 요청 요약 */}
      {supplyStats.pending_requests > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-red-50 border-b border-red-200">
            <h3 className="text-lg font-semibold text-red-900">🚨 긴급 처리 필요</h3>
            <p className="text-sm text-red-700">승인 대기중인 물류 요청이 있습니다</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{supplyStats.pending_requests}</div>
                <div className="text-sm text-gray-600">대기중 요청</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{supplyStats.urgent_requests}</div>
                <div className="text-sm text-gray-600">긴급 요청</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">₩{supplyStats.total_amount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">총 요청 금액</div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => window.location.href = '/hq/supply'}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                물류 요청 관리로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HQDashboard; 