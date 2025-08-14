import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Point } from '../../types/common';

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

interface CouponStats {
  total_coupons: number;
  active_coupons: number;
  used_coupons: number;
  total_discount_amount: number;
}

interface PointStats {
  total_points_issued: number;
  total_points_used: number;
  active_points: number;
  total_members: number;
}

const HQDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeStats, setStoreStats] = useState<StoreStats[]>([]);
  const [supplyStats, setSupplyStats] = useState<SupplyRequestStats>({
    total_requests: 0,
    pending_requests: 0,
    urgent_requests: 0,
    total_amount: 0
  });
  const [couponStats, setCouponStats] = useState<CouponStats>({
    total_coupons: 0,
    active_coupons: 0,
    used_coupons: 0,
    total_discount_amount: 0
  });
  const [pointStats, setPointStats] = useState<PointStats>({
    total_points_issued: 0,
    total_points_used: 0,
    active_points: 0,
    total_members: 0
  });
  const [pointsData, setPointsData] = useState<Point[]>([]);
  const [activeTab, setActiveTab] = useState<'coupons' | 'points'>('coupons');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStores(),
        fetchStoreStats(),
        fetchSupplyStats(),
        fetchCouponStats(),
        fetchPointStats()
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

  const fetchCouponStats = async () => {
    try {
      console.log('🎫 쿠폰 통계 조회 시작...');
      
      // 쿠폰 정보 조회
      const { data: coupons, error: couponError } = await supabase
        .from('coupons')
        .select('*');

      if (couponError) throw couponError;

      // 사용자 쿠폰 정보 조회
      const { data: userCoupons, error: userCouponError } = await supabase
        .from('user_coupons')
        .select('*, coupon:coupons(discount_value, discount_type)');

      if (userCouponError) throw userCouponError;

      // 주문에서 쿠폰 할인 금액 조회
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('coupon_discount_amount');

      if (orderError) throw orderError;

      const stats = {
        total_coupons: coupons?.length || 0,
        active_coupons: coupons?.filter(c => c.is_active).length || 0,
        used_coupons: userCoupons?.filter(uc => uc.is_used).length || 0,
        total_discount_amount: orders?.reduce((sum, order) => sum + (order.coupon_discount_amount || 0), 0) || 0
      };

      console.log('✅ 쿠폰 통계 조회 성공:', stats);
      setCouponStats(stats);
    } catch (error) {
      console.error('❌ 쿠폰 통계 조회 실패:', error);
    }
  };

  // 포인트 통계 계산 (메모이제이션)
  const calculatedPointStats = useMemo(() => {
    const totalIssued = pointsData.filter(p => p.type === 'earned' || p.type === 'bonus').reduce((sum, p) => sum + p.amount, 0);
    const totalUsed = pointsData.filter(p => p.type === 'used').reduce((sum, p) => sum + p.amount, 0);

    return {
      total_points_issued: totalIssued,
      total_points_used: totalUsed,
      active_points: totalIssued - totalUsed,
      total_members: pointStats.total_members // 이 값은 API에서 가져옴
    };
  }, [pointsData, pointStats.total_members]);

  const fetchPointStats = async () => {
    try {
      console.log('💰 포인트 통계 조회 시작...');
      
      // 포인트 정보 조회
      const { data: points, error: pointError } = await supabase
        .from('points')
        .select('*');

      if (pointError) throw pointError;

      // 회원 수 조회
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'customer');

      if (profileError) throw profileError;

      // 포인트 데이터 저장
      setPointsData(points || []);
      
      // 회원 수만 별도로 업데이트
      setPointStats(prev => ({
        ...prev,
        total_members: profiles?.length || 0
      }));

      console.log('✅ 포인트 통계 조회 성공');
    } catch (error) {
      console.error('❌ 포인트 통계 조회 실패:', error);
    }
  };

  // 계산된 포인트 통계를 실제 상태에 반영
  useEffect(() => {
    setPointStats(calculatedPointStats);
  }, [calculatedPointStats]);

  // Store 매핑 (메모이제이션)
  const storeMap = useMemo(() => {
    return stores.reduce((map, store) => {
      map[store.id] = store;
      return map;
    }, {} as Record<string, Store>);
  }, [stores]);

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
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              👥
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">총 회원수</p>
              <p className="text-2xl font-bold text-gray-900">{pointStats.total_members}</p>
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

      {/* 지점별 현황 - 상단으로 이동 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">지점별 현황</h3>
          <p className="text-sm text-gray-600">각 지점의 실시간 운영 현황을 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {storeStats.map((stats) => {
            const store = storeMap[stats.store_id];
            return (
              <div
                key={stats.store_id}
                className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getStoreStatusColor(stats)}`}
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

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
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
                  <div className="mb-3 p-2 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      🚨 물류 요청 대기: {stats.supply_requests_pending}건
                    </p>
                  </div>
                )}

                {/* 상세 정보 - 항상 표시 */}
                <div className="pt-4 border-t border-gray-200">
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

      {/* 쿠폰 & 포인트 관리 - 탭 형태로 변경 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* 탭 헤더 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('coupons')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'coupons'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎫 쿠폰 관리
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'points'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💰 포인트 관리
            </button>
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6">
          {activeTab === 'coupons' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">쿠폰 통계</h3>
                <button
                  onClick={() => navigate('/hq/products')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  쿠폰 관리하기
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{couponStats.total_coupons}</div>
                  <div className="text-sm text-gray-600">총 쿠폰</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{couponStats.active_coupons}</div>
                  <div className="text-sm text-gray-600">활성 쿠폰</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{couponStats.used_coupons}</div>
                  <div className="text-sm text-gray-600">사용된 쿠폰</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">₩{couponStats.total_discount_amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">총 할인 금액</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">쿠폰 사용률</span>
                  <span className="font-medium">
                    {couponStats.total_coupons > 0 
                      ? Math.round((couponStats.used_coupons / couponStats.total_coupons) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all" 
                    style={{ 
                      width: `${couponStats.total_coupons > 0 
                        ? (couponStats.used_coupons / couponStats.total_coupons) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">포인트 통계</h3>
                <button
                  onClick={() => navigate('/hq/products')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  포인트 관리하기
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{pointStats.total_points_issued.toLocaleString()}P</div>
                  <div className="text-sm text-gray-600">총 발행 포인트</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{pointStats.total_points_used.toLocaleString()}P</div>
                  <div className="text-sm text-gray-600">사용된 포인트</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{pointStats.active_points.toLocaleString()}P</div>
                  <div className="text-sm text-gray-600">활성 포인트</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {pointStats.total_members > 0 
                      ? Math.round(pointStats.active_points / pointStats.total_members).toLocaleString()
                      : 0}P
                  </div>
                  <div className="text-sm text-gray-600">회원당 평균</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">포인트 사용률</span>
                  <span className="font-medium">
                    {pointStats.total_points_issued > 0 
                      ? Math.round((pointStats.total_points_used / pointStats.total_points_issued) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all" 
                    style={{ 
                      width: `${pointStats.total_points_issued > 0 
                        ? (pointStats.total_points_used / pointStats.total_points_issued) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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