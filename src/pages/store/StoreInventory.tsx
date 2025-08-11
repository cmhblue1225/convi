import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';



interface ExpiryInfo {
  expiresAt: string | null;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  minutesRemaining: number | null;
  status: 'normal' | 'warning' | 'danger' | 'expired' | null;
  formattedRemaining: string;
}

// 유통기한별 재고 정보를 포함한 확장된 인터페이스
interface InventoryWithExpiry {
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
    shelf_life_days: number | null;
  };
  expiryGroup: string; // 유통기한 그룹 식별자
  batchId: string; // 배치별 식별자
  expiryInfo: ExpiryInfo;
  batchQuantity: number; // 해당 배치의 수량
}

interface TransactionData {
  id: string;
  store_product_id: string;
  quantity: number;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  transaction_type: 'in' | 'out' | 'adjustment' | 'expired';
  new_quantity: number | null;
  store_products: {
    id: string;
    price: number;
    safety_stock: number;
    max_stock: number;
    is_available: boolean;
    products: {
      id: string;
      name: string;
      unit: string;
      base_price: number;
      shelf_life_days: number | null;
    };
  };
}

const StoreInventory: React.FC = () => {
  const [inventoryWithExpiry, setInventoryWithExpiry] = useState<InventoryWithExpiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStock, setFilterStock] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'normal' | 'warning' | 'danger' | 'expired'>('all');
  const { user } = useAuthStore();

  // 유통기한 남은 시간을 포맷팅하는 함수
  const formatExpiryRemaining = (days: number, hours: number, minutes: number): string => {
    if (days > 0) {
      return `${days}일 ${hours}시간 ${minutes}분`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분`;
    } else {
      return '0분';
    }
  };



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

      const storeId = storeData.id as string;

      // 유통기한별 재고 정보 조회
      if (storeId) {
        await fetchInventoryWithExpiry(storeId);
      }
    } catch (error) {
      console.error('❌ 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 유통기한별 재고 정보 조회
  const fetchInventoryWithExpiry = async (storeId: string) => {
    try {
      // 모든 재고 트랜잭션 조회 (유통기한 유무와 관계없이)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('inventory_transactions')
        .select(`
          id,
          store_product_id,
          quantity,
          expires_at,
          notes,
          created_at,
          transaction_type,
          new_quantity,
          store_products!inner(
            id,
            price,
            safety_stock,
            max_stock,
            is_available,
            products!inner(
              id,
              name,
              unit,
              base_price,
              shelf_life_days
            )
          )
        `)
        .eq('store_products.store_id', storeId)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('재고 트랜잭션 조회 오류:', transactionsError);
        return;
      }

      if (!transactionsData) return;

      // 유통기한별로 재고를 그룹화
      const inventoryMap = new Map<string, InventoryWithExpiry>();

      transactionsData.forEach((transaction: TransactionData) => {
        const productId = transaction.store_products.products.id;
        const productName = transaction.store_products.products.name;
        const expiresAt = transaction.expires_at;
        
        // 유통기한별로 고유 키 생성 (상품ID + 유통기한)
        const key = `${productId}_${expiresAt || 'no_expiry'}`;
        
        if (!inventoryMap.has(key)) {
          inventoryMap.set(key, {
            id: transaction.store_product_id,
            store_id: storeId,
            product_id: productId,
            price: transaction.store_products.price,
            stock_quantity: 0, // 현재 재고는 트랜잭션에서 계산
            safety_stock: transaction.store_products.safety_stock,
            max_stock: transaction.store_products.max_stock,
            is_available: transaction.store_products.is_available,
            product: {
              name: productName,
              unit: transaction.store_products.products.unit,
              base_price: transaction.store_products.products.base_price,
              shelf_life_days: transaction.store_products.products.shelf_life_days
            },
            expiryGroup: key, // 유통기한별 그룹 키
            batchId: transaction.id,
            expiryInfo: calculateExpiryInfo(expiresAt),
            batchQuantity: 0 // 배치별 수량은 트랜잭션에서 계산
          });
        }

        const item = inventoryMap.get(key)!;
        
        // 입고/출고에 따라 재고 계산
        if (transaction.transaction_type === 'in') {
          item.stock_quantity += transaction.quantity;
          item.batchQuantity += transaction.quantity;
        } else if (transaction.transaction_type === 'out') {
          item.stock_quantity -= transaction.quantity;
          item.batchQuantity -= transaction.quantity;
        } else if (transaction.transaction_type === 'adjustment') {
          item.stock_quantity = transaction.new_quantity || 0;
          item.batchQuantity = transaction.new_quantity || 0;
        } else if (transaction.transaction_type === 'expired') {
          item.stock_quantity -= transaction.quantity;
          item.batchQuantity -= transaction.quantity;
        }
      });

      // 재고가 0 이하인 항목은 제거 (선택사항)
      const validInventory = Array.from(inventoryMap.values())
        .filter(item => item.stock_quantity > 0)
        .sort((a, b) => {
          // 유통기한이 있는 항목을 먼저 정렬
          if (a.expiryInfo.expiresAt && !b.expiryInfo.expiresAt) return -1;
          if (!a.expiryInfo.expiresAt && b.expiryInfo.expiresAt) return 1;
          
          // 유통기한이 있는 경우 빠른 순서로 정렬
          if (a.expiryInfo.expiresAt && b.expiryInfo.expiresAt) {
            return new Date(a.expiryInfo.expiresAt).getTime() - new Date(b.expiryInfo.expiresAt).getTime();
          }
          
          // 상품명 순서로 정렬
          return a.product.name.localeCompare(b.product.name);
        });

      setInventoryWithExpiry(validInventory);
    } catch (error) {
      console.error('재고 조회 오류:', error);
    }
  };

  // 유통기한 정보를 계산하는 함수
  const calculateExpiryInfo = (expiresAt: string | null): ExpiryInfo => {
    if (!expiresAt) {
      return {
        expiresAt: null,
        daysRemaining: null,
        hoursRemaining: null,
        minutesRemaining: null,
        status: 'normal',
        formattedRemaining: '유통기한 없음'
      };
    }

    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const diffMs = expiryDate.getTime() - now.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    let status: 'normal' | 'warning' | 'danger' | 'expired';
    let daysRemaining: number;
    let hoursRemaining: number;
    let minutesRemaining: number;

    if (totalMinutes <= 0) {
      status = 'expired';
      daysRemaining = 0;
      hoursRemaining = 0;
      minutesRemaining = 0;
    } else {
      daysRemaining = Math.floor(totalMinutes / (24 * 60));
      hoursRemaining = Math.floor((totalMinutes % (24 * 60)) / 60);
      minutesRemaining = totalMinutes % 60;
      
      if (totalMinutes <= 3 * 24 * 60) status = 'danger';
      else if (totalMinutes <= 7 * 24 * 60) status = 'warning';
      else status = 'normal';
    }

    return {
      expiresAt,
      daysRemaining,
      hoursRemaining,
      minutesRemaining,
      status,
      formattedRemaining: formatExpiryRemaining(daysRemaining || 0, hoursRemaining || 0, minutesRemaining || 0)
    };
  };

  const getStockStatus = (current: number, safety: number) => {
    if (current <= 0) return { color: 'bg-red-100 text-red-800', text: '품절' };
    if (current <= safety) return { color: 'bg-orange-100 text-orange-800', text: '부족' };
    return { color: 'bg-green-100 text-green-800', text: '충분' };
  };

  const filteredProducts = inventoryWithExpiry
    .filter((product) => (viewMode === 'all' ? true : product.batchQuantity > 0))
    .filter(product => {
      if (filterStock === 'all') return true;
      if (filterStock === 'low' && product.stock_quantity <= product.safety_stock) return true;
      if (filterStock === 'out' && product.stock_quantity <= 0) return true;
      return false;
    })
    .filter((product) => {
      if (expiryFilter === 'all') return true;
      const status = product.expiryInfo?.status || null;
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">전체 상품</div>
          <div className="text-2xl font-bold text-gray-900">{inventoryWithExpiry.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">재고 부족</div>
          <div className="text-2xl font-bold text-orange-600">
            {inventoryWithExpiry.filter(p => p.stock_quantity <= p.safety_stock).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">품절</div>
          <div className="text-2xl font-bold text-red-600">
            {inventoryWithExpiry.filter(p => p.stock_quantity <= 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">유통기한 임박</div>
          <div className="text-2xl font-bold text-yellow-600">
            {inventoryWithExpiry.filter(info => 
              info.expiryInfo.status === 'warning' || info.expiryInfo.status === 'danger'
            ).length}
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
                  배치별 재고
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
                const expiryStatus = product.expiryInfo?.status ?? null;
                const expiryColor = expiryStatus === 'expired'
                  ? 'bg-gray-100 text-gray-800'
                  : expiryStatus === 'danger'
                    ? 'bg-red-100 text-red-800'
                    : expiryStatus === 'warning'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800';
                
                return (
                  <tr key={`${product.id}_${product.expiryGroup}_${product.batchId}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.product.name}</div>
                      <div className="text-xs text-gray-500">배치: {product.batchId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.batchQuantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.safety_stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.max_stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.expiryInfo?.formattedRemaining || '-'}
                      </div>
                      {product.expiryInfo?.expiresAt && (
                        <div className="text-xs text-gray-500">
                          만료: {new Date(product.expiryInfo.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expiryColor}`}>
                        {expiryStatus === 'expired' ? '만료' : 
                         expiryStatus === 'danger' ? '위험' : 
                         expiryStatus === 'warning' ? '임박' : 
                         expiryStatus === 'normal' ? '정상' : '정보없음'}
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