import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';

interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  price: number;
  stock_quantity: number;
  safety_stock: number;
  max_stock: number;
  is_available: boolean;
  product: {
    name: string;
    unit: string;
    base_price: number;
  };
}

const StoreInventory: React.FC = () => {
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStock, setFilterStock] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'normal' | 'warning' | 'danger' | 'expired'>('all');
  const [expiryByStoreProductId, setExpiryByStoreProductId] = useState<Record<string, { expiresAt: string | null; daysRemaining: number | null; status: 'normal' | 'warning' | 'danger' | 'expired' | null }>>({});
  const { user } = useAuthStore();

  // 실시간 구독 설정
  useEffect(() => {
    fetchData();

    // 실시간 구독
    const subscription = supabase
      .channel('store_inventory_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'store_products' }, 
        (payload) => {
          console.log('🔄 재고 데이터 변경 감지:', payload);
          fetchData(); // 데이터 새로고침
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        return;
      }

      const storeId = storeData.id;

      // 재고 현황 조회 - LEFT JOIN을 사용하여 재고가 없는 상품도 포함
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          unit,
          base_price,
          is_active,
          store_products!left(
            id,
            price,
            stock_quantity,
            safety_stock,
            max_stock,
            is_available
          )
        `)
        .eq('is_active', true)
        .eq('store_products.store_id', storeId)
        .order('name', { ascending: true });

      if (productsError) {
        console.error('❌ 재고 현황 조회 실패:', productsError);
      } else {
        // 데이터 구조 변환
        const transformedData = (productsData || []).map((product: any) => {
          const storeProduct = product.store_products?.[0];
          return {
            id: storeProduct?.id || `temp_${product.id}`,
            store_id: storeId,
            product_id: product.id,
            price: storeProduct?.price || product.base_price,
            stock_quantity: storeProduct?.stock_quantity || 0,
            safety_stock: storeProduct?.safety_stock || 10,
            max_stock: storeProduct?.max_stock || 100,
            is_available: storeProduct?.is_available ?? true,
            product: {
              name: product.name,
              unit: product.unit,
              base_price: product.base_price
            }
          };
        });
        setStoreProducts(transformedData);

        // 유통기한 정보 조회: 각 store_product_id 별 가장 빠른 expires_at
        const realIds = transformedData
          .map((p) => p.id)
          .filter((id) => typeof id === 'string' && !id.startsWith('temp_')) as string[];
        if (realIds.length > 0) {
          const { data: txRows, error: txError } = await supabase
            .from('inventory_transactions')
            .select('store_product_id, expires_at')
            .in('store_product_id', realIds)
            .not('expires_at', 'is', null);

          if (txError) {
            console.error('❌ 유통기한 조회 실패:', txError);
          } else {
            const earliestMap = new Map<string, string>();
            for (const row of txRows || []) {
              const spId = (row as any).store_product_id as string;
              const expiresAt = (row as any).expires_at as string;
              const prev = earliestMap.get(spId);
              if (!prev || new Date(expiresAt) < new Date(prev)) {
                earliestMap.set(spId, expiresAt);
              }
            }

            const now = Date.now();
            const mapObj: Record<string, { expiresAt: string | null; daysRemaining: number | null; status: 'normal' | 'warning' | 'danger' | 'expired' | null }> = {};
            for (const spId of realIds) {
              const exp = earliestMap.get(spId) || null;
              if (exp) {
                const diffDays = Math.ceil((new Date(exp).getTime() - now) / (1000 * 60 * 60 * 24));
                let status: 'normal' | 'warning' | 'danger' | 'expired';
                if (diffDays <= 0) status = 'expired';
                else if (diffDays <= 3) status = 'danger';
                else if (diffDays <= 7) status = 'warning';
                else status = 'normal';
                mapObj[spId] = { expiresAt: exp, daysRemaining: diffDays, status };
              } else {
                mapObj[spId] = { expiresAt: null, daysRemaining: null, status: null };
              }
            }
            setExpiryByStoreProductId(mapObj);
          }
        } else {
          setExpiryByStoreProductId({});
        }
      }
    } catch (error) {
      console.error('❌ 데이터 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, safety: number) => {
    if (current <= 0) return { color: 'bg-red-100 text-red-800', text: '품절' };
    if (current <= safety) return { color: 'bg-orange-100 text-orange-800', text: '부족' };
    return { color: 'bg-green-100 text-green-800', text: '충분' };
  };

  const filteredProducts = storeProducts
    .filter((product) => (viewMode === 'all' ? true : product.stock_quantity > 0))
    .filter(product => {
      if (filterStock === 'all') return true;
      if (filterStock === 'low' && product.stock_quantity <= product.safety_stock) return true;
      if (filterStock === 'out' && product.stock_quantity <= 0) return true;
      return false;
    })
    .filter((product) => {
      if (expiryFilter === 'all') return true;
      const info = expiryByStoreProductId[product.id];
      const status = info?.status || null;
      if (!status) return expiryFilter === 'normal';
      return status === expiryFilter;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">재고 관리</h1>
        <p className="text-gray-600">현재 재고 현황을 확인하고 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">전체 상품</div>
          <div className="text-2xl font-bold text-gray-900">{storeProducts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">재고 부족</div>
          <div className="text-2xl font-bold text-orange-600">
            {storeProducts.filter(p => p.stock_quantity <= p.safety_stock).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">품절</div>
          <div className="text-2xl font-bold text-red-600">
            {storeProducts.filter(p => p.stock_quantity <= 0).length}
          </div>
        </div>
      </div>

      {/* 재고 현황 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">재고 현황</h2>
          <div className="flex space-x-2">
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              title="유통기한 상태 필터"
            >
              <option value="all">유통기한 전체</option>
              <option value="warning">임박(≤7일)</option>
              <option value="danger">위험(≤3일)</option>
              <option value="expired">만료</option>
              <option value="normal">정상</option>
            </select>
            <button
              onClick={() => setViewMode('current')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'current'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              현재 재고
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              모든 재고
            </button>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">전체</option>
              <option value="low">재고 부족</option>
              <option value="out">품절</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  현재재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  안전재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  최대재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유통기한
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유통기한 상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판매가
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  단위
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity, product.safety_stock);
                const expiryInfo = expiryByStoreProductId[product.id];
                const daysRemaining = expiryInfo?.daysRemaining ?? null;
                const expiryStatus = expiryInfo?.status ?? null;
                const expiryColor = expiryStatus === 'expired'
                  ? 'bg-gray-100 text-gray-800'
                  : expiryStatus === 'danger'
                    ? 'bg-red-100 text-red-800'
                    : expiryStatus === 'warning'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800';
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.safety_stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.max_stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{daysRemaining === null ? '-' : `${daysRemaining}일`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expiryColor}`}>
                        {expiryStatus === 'expired' ? '만료' : expiryStatus === 'danger' ? '위험' : expiryStatus === 'warning' ? '임박' : '정상'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.price.toLocaleString()}원</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.product.unit}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreInventory; 