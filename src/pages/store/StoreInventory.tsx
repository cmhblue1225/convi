import React, { useState, useEffect, useCallback } from 'react';
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

// 모든 재고 모드를 위한 인터페이스 (상품별로 그룹화)
interface AllInventoryItem {
  id: string;
  store_id: string;
  product_id: string;
  price: number;
  total_stock_quantity: number; // 전체 재고 수량
  safety_stock: number;
  max_stock: number;
  is_available: boolean;
  product: {
    name: string;
    unit: string;
    base_price: number;
    shelf_life_days: number | null;
  };
  expiryDetails: Array<{
    expiresAt: string | null;
    quantity: number;
    formattedRemaining: string;
    status: 'normal' | 'warning' | 'danger' | 'expired' | null;
  }>;
}

interface TransactionData {
  id: string;
  store_product_id: string | null;
  quantity: number;
  expires_at: string | null;
  notes: string | null;
  created_at: string | null;
  transaction_type: string;
  new_quantity: number;
  store_products: {
    id: string;
    price: number;
    safety_stock: number | null;
    max_stock: number | null;
    is_available: boolean | null;
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
  const [allInventoryItems, setAllInventoryItems] = useState<AllInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStock, setFilterStock] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'normal' | 'warning' | 'danger' | 'expired'>('all');
  const { user } = useAuthStore();

  // 폐기 처리 함수
  const handleDisposal = async (product: InventoryWithExpiry) => {
    if (!window.confirm(`${product.product.name} (배치: ${product.batchId})을 폐기하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('inventory_transactions')
        .insert({
          store_product_id: product.id,
          transaction_type: 'expired',
          quantity: product.batchQuantity,
          previous_quantity: product.stock_quantity,
          new_quantity: product.stock_quantity - product.batchQuantity,
          reason: '유통기한 만료로 인한 폐기',
          notes: `만료일: ${product.expiryInfo.expiresAt ? new Date(product.expiryInfo.expiresAt).toLocaleDateString() : '정보없음'}`,
          created_by: user?.id,
          expires_at: product.expiryInfo.expiresAt
        });

      if (error) {
        console.error('폐기 처리 실패:', error);
        alert('폐기 처리에 실패했습니다.');
        return;
      }

      alert('폐기 처리가 완료되었습니다.');
      // 데이터 새로고침
      fetchData();
    } catch (error) {
      console.error('폐기 처리 중 오류:', error);
      alert('폐기 처리 중 오류가 발생했습니다.');
    }
  };

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 현재 사용자의 지점 ID 조회
      if (!user?.id) {
        console.error('❌ 사용자 정보 없음');
        return;
      }

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        return;
      }

      const storeId = storeData.id as string;

      // 유통기한별 재고 정보 조회
      if (storeId) {
        if (viewMode === 'current') {
          await fetchInventoryWithExpiry(storeId);
        } else {
          await fetchAllInventoryItems(storeId);
        }
      }
    } catch (error) {
      console.error('❌ 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [fetchData]); // fetchData를 의존성에 추가

  // viewMode가 변경될 때마다 데이터 다시 조회
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [fetchData, user?.id]);

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
        if (!transaction.store_product_id || !transaction.store_products) return;
        
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
            safety_stock: transaction.store_products.safety_stock || 0,
            max_stock: transaction.store_products.max_stock || 0,
            is_available: transaction.store_products.is_available || false,
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

      // viewMode에 따라 필터링
      let validInventory: InventoryWithExpiry[];
      
      if (viewMode === 'current') {
        // 현재 재고: 재고가 0인 항목 제외
        validInventory = Array.from(inventoryMap.values())
          .filter(item => item.stock_quantity > 0);
      } else {
        // 모든 재고: 모든 항목 포함 (재고가 0인 항목도 포함)
        validInventory = Array.from(inventoryMap.values());
      }

      // 정렬
      validInventory.sort((a, b) => {
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

  // 모든 재고 모드를 위한 데이터 조회 함수
  const fetchAllInventoryItems = async (storeId: string) => {
    try {
      // store_products 테이블에서 상품 정보 조회
      const { data: storeProductsData, error: storeProductsError } = await supabase
        .from('store_products')
        .select(`
          id,
          store_id,
          product_id,
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
        `)
        .eq('store_id', storeId);

      if (storeProductsError) {
        console.error('상품 정보 조회 오류:', storeProductsError);
        return;
      }

      if (!storeProductsData) return;

      // 각 상품별로 재고 트랜잭션을 조회하여 총 재고량 계산
      const allInventoryItems: (AllInventoryItem | null)[] = await Promise.all(
        storeProductsData.map(async (storeProduct) => {
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('inventory_transactions')
            .select('quantity, transaction_type, new_quantity')
            .eq('store_product_id', storeProduct.id);

          if (transactionsError) {
            console.error('트랜잭션 조회 오류:', transactionsError);
            return null;
          }

          // 총 재고량 계산
          let totalStock = 0;
          if (transactionsData) {
            transactionsData.forEach((transaction) => {
              if (transaction.transaction_type === 'in') {
                totalStock += transaction.quantity;
              } else if (transaction.transaction_type === 'out') {
                totalStock -= transaction.quantity;
              } else if (transaction.transaction_type === 'adjustment') {
                totalStock = transaction.new_quantity || 0;
              } else if (transaction.transaction_type === 'expired') {
                totalStock -= transaction.quantity;
              }
            });
          }

          return {
            id: storeProduct.id,
            store_id: storeProduct.store_id || '',
            product_id: storeProduct.product_id || '',
            price: storeProduct.price,
            total_stock_quantity: totalStock,
            safety_stock: storeProduct.safety_stock || 0,
            max_stock: storeProduct.max_stock || 0,
            is_available: storeProduct.is_available || false,
            product: {
              name: storeProduct.products.name,
              unit: storeProduct.products.unit,
              base_price: storeProduct.products.base_price,
              shelf_life_days: storeProduct.products.shelf_life_days // 실제 데이터베이스 값 사용
            },
            expiryDetails: [], // 모든 재고 모드에서는 유통기한 상세 정보는 표시하지 않음
          };
        })
      );

      // null 값 제거하고 정렬
      const validItems = allInventoryItems.filter(item => item !== null) as AllInventoryItem[];
      validItems.sort((a, b) => a.product.name.localeCompare(b.product.name));

      setAllInventoryItems(validItems);
    } catch (error) {
      console.error('모든 재고 조회 오류:', error);
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

  // viewMode에 따라 표시할 데이터 결정
  const filteredAllProducts = allInventoryItems.filter(product => {
    if (filterStock === 'all') return true;
    if (filterStock === 'low' && product.total_stock_quantity <= product.safety_stock) return true;
    if (filterStock === 'out' && product.total_stock_quantity <= 0) return true;
    return false;
  });

  const finalDisplayData = viewMode === 'current' ? filteredProducts : filteredAllProducts;

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
          <div className="text-2xl font-bold text-gray-900">
            {viewMode === 'current' ? inventoryWithExpiry.length : allInventoryItems.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">재고 부족</div>
          <div className="text-2xl font-bold text-orange-600">
            {viewMode === 'current' 
              ? inventoryWithExpiry.filter(p => p.stock_quantity <= p.safety_stock).length
              : allInventoryItems.filter(p => p.total_stock_quantity <= p.safety_stock).length
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">품절</div>
          <div className="text-2xl font-bold text-red-600">
            {viewMode === 'current' 
              ? inventoryWithExpiry.filter(p => p.stock_quantity <= 0).length
              : allInventoryItems.filter(p => p.total_stock_quantity <= 0).length
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">
            {viewMode === 'current' ? '유통기한 임박' : '재고 현황'}
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {viewMode === 'current' 
              ? inventoryWithExpiry.filter(info => 
                  info.expiryInfo.status === 'warning' || info.expiryInfo.status === 'danger'
                ).length
              : allInventoryItems.filter(p => p.total_stock_quantity > 0).length
            }
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
              onChange={(e) => setExpiryFilter(e.target.value as 'all' | 'normal' | 'warning' | 'danger' | 'expired')}
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
                  {viewMode === 'current' ? '현재 재고' : '배치별 재고'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  안전재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  최대재고
                </th>
                {viewMode === 'current' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유통기한
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유통기한 상태
                    </th>
                  </>
                )}
                {viewMode === 'all' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품별 유통기한
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판매가
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  단위
                </th>
                {viewMode === 'current' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {finalDisplayData.map((product) => {
                if (viewMode === 'current') {
                  // 현재 재고 모드
                  const currentProduct = product as InventoryWithExpiry;
                  const stockStatus = getStockStatus(currentProduct.stock_quantity, currentProduct.safety_stock);
                  const expiryStatus = currentProduct.expiryInfo?.status ?? null;
                  const expiryColor = expiryStatus === 'expired'
                    ? 'bg-gray-100 text-gray-800'
                    : expiryStatus === 'danger'
                      ? 'bg-red-100 text-red-800'
                      : expiryStatus === 'warning'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800';
                  
                  return (
                    <tr key={`${currentProduct.id}_${currentProduct.expiryGroup}_${currentProduct.batchId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{currentProduct.product.name}</div>
                        <div className="text-xs text-gray-500">배치: {currentProduct.batchId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{currentProduct.batchQuantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{currentProduct.safety_stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{currentProduct.max_stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {currentProduct.expiryInfo?.formattedRemaining || '-'}
                        </div>
                        {currentProduct.expiryInfo?.expiresAt && (
                          <div className="text-xs text-gray-500">
                            만료: {new Date(currentProduct.expiryInfo.expiresAt).toLocaleDateString()}
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
                        <div className="text-sm text-gray-900">{currentProduct.price.toLocaleString()}원</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{currentProduct.product.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentProduct.expiryInfo?.status === 'expired' && (
                          <button
                            onClick={() => handleDisposal(currentProduct)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            폐기완료
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                } else {
                  // 모든 재고 모드
                  const allProduct = product as AllInventoryItem;
                  const stockStatus = getStockStatus(allProduct.total_stock_quantity, allProduct.safety_stock);
                  
                  return (
                    <tr key={allProduct.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{allProduct.product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{allProduct.total_stock_quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{allProduct.safety_stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{allProduct.max_stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {allProduct.product.shelf_life_days ? `${allProduct.product.shelf_life_days}일` : '유통기한 없음'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{allProduct.price.toLocaleString()}원</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{allProduct.product.unit}</div>
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreInventory; 