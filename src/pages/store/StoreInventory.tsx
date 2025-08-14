import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


interface ExpiryInfo {
  expiresAt: string | null;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  minutesRemaining: number | null;
  status: 'normal' | 'warning' | 'danger' | 'expired' | null;
  formattedRemaining: string;
}

interface PromotionInfo {
  promotion_type: 'buy_one_get_one' | 'buy_two_get_one' | null;
  promotion_name: string | null;
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
  promotionInfo: PromotionInfo;
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
  promotionInfo: PromotionInfo;
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
  const [promotionFilter, setPromotionFilter] = useState<'all' | 'buy_one_get_one' | 'buy_two_get_one'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  // 키보드 단축키 설정
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K 또는 Cmd+K로 검색창 포커스
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="검색"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        
        // 유통기한별로 고유 키 생성 (상품명 + 유통기한)
        const key = `${productName}_${expiresAt || 'no_expiry'}`;
        
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
            batchId: key, // 같은 상품명과 유통기한을 가진 상품들은 같은 batchId 사용
            expiryInfo: calculateExpiryInfo(expiresAt),
            batchQuantity: 0, // 배치별 수량은 트랜잭션에서 계산
            promotionInfo: { promotion_type: null, promotion_name: null }
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
        } else if (transaction.transaction_type === 'returned') {
          // 반품의 경우 재고 증가
          item.stock_quantity += transaction.quantity;
          item.batchQuantity += transaction.quantity;
        } else if (transaction.transaction_type === 'adjustment') {
          // adjustment의 경우 기존 재고에 차이만큼 반영
          const newQuantity = transaction.new_quantity || 0;
          const currentQuantity = item.stock_quantity;
          const difference = newQuantity - currentQuantity;
          item.stock_quantity = newQuantity;
          item.batchQuantity += difference;
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

      // 행사 정보 가져오기 - 임시로 주석 처리
      /*
      const { data: promotionData, error: promotionError } = await supabase
        .from('promotion_products')
        .select(`
          product_id,
          promotions!inner(
            name,
            promotion_type
          )
        `)
        .is('store_id', null); // 전체 매장 행사 (NULL)

      if (promotionError) {
        console.error('행사 정보 조회 오류:', promotionError);
      } else {
        // 행사 정보를 재고 데이터에 추가
        promotionData?.forEach(promotion => {
          const productId = promotion.product_id;
          validInventory.forEach(inventory => {
            if (inventory.product_id === productId) {
              inventory.promotionInfo = {
                promotion_type: promotion.promotions.promotion_type,
                promotion_name: promotion.promotions.name
              };
            }
          });
        });
      }
      */

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
              } else if (transaction.transaction_type === 'returned') {
                // 반품의 경우 재고 증가
                totalStock += transaction.quantity;
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
            promotionInfo: { promotion_type: null, promotion_name: null }
          };
        })
      );

      // null 값 제거하고 정렬
      const validItems = allInventoryItems.filter(item => item !== null) as AllInventoryItem[];
      validItems.sort((a, b) => a.product.name.localeCompare(b.product.name));

      // 행사 정보 가져오기 - 임시로 주석 처리
      /*
      const { data: promotionData, error: promotionError } = await supabase
        .from('promotion_products')
        .select(`
          product_id,
          promotions!inner(
            name,
            promotion_type
          )
        `)
        .is('store_id', null); // 전체 매장 행사 (NULL)

      if (promotionError) {
        console.error('행사 정보 조회 오류:', promotionError);
      } else {
        // 행사 정보를 재고 데이터에 추가
        promotionData?.forEach(promotion => {
          const productId = promotion.product_id;
          validItems.forEach(inventory => {
            if (inventory.product_id === productId) {
              inventory.promotionInfo = {
                promotion_type: promotion.promotions.promotion_type,
                promotion_name: promotion.promotions.name
              };
            }
          });
        });
      }
      */

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

  // useMemo를 사용하여 필터링 성능 최적화
  const filteredProducts = useMemo(() => {
    let filtered = inventoryWithExpiry;

    // 재고 상태 필터
    if (filterStock !== 'all') {
      filtered = filtered.filter(product => {
        if (filterStock === 'low') return product.stock_quantity <= product.safety_stock;
        if (filterStock === 'out') return product.stock_quantity <= 0;
        return true;
      });
    }

    // 유통기한 필터
    if (expiryFilter !== 'all') {
      filtered = filtered.filter((product) => {
        const status = product.expiryInfo?.status || null;
        if (!status) return expiryFilter === 'normal';
        return status === expiryFilter;
      });
    }

    // 프로모션 필터
    if (promotionFilter !== 'all') {
      filtered = filtered.filter((product) => {
        return product.promotionInfo.promotion_type === promotionFilter;
      });
    }

    // 검색 필터 (상품명, 단위, 바코드 등)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        return product.product.name.toLowerCase().includes(query) ||
               product.product.unit.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [inventoryWithExpiry, filterStock, expiryFilter, promotionFilter, searchQuery]);

  // viewMode에 따라 표시할 데이터 결정
  const filteredAllProducts = useMemo(() => {
    let filtered = allInventoryItems;

    // 재고 상태 필터
    if (filterStock !== 'all') {
      filtered = filtered.filter(product => {
        if (filterStock === 'low') return product.total_stock_quantity <= product.safety_stock;
        if (filterStock === 'out') return product.total_stock_quantity <= 0;
        return true;
      });
    }

    // 프로모션 필터
    if (promotionFilter !== 'all') {
      filtered = filtered.filter((product) => {
        return product.promotionInfo.promotion_type === promotionFilter;
      });
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        return product.product.name.toLowerCase().includes(query) ||
               product.product.unit.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [allInventoryItems, filterStock, promotionFilter, searchQuery]);

  const finalDisplayData = viewMode === 'current' ? filteredProducts : filteredAllProducts;

  // 엑셀 다운로드 함수
  const downloadExcel = async () => {
    try {
      console.log('📊 재고 엑셀 다운로드 시작');
      
      // 현재 사용자의 지점 정보 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('name, address, phone')
        .eq('owner_id', user?.id || '')
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        alert('지점 정보를 찾을 수 없습니다.');
        return;
      }

      // 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('재고현황');

      // 제목 행 - 깔끔하고 전문적인 디자인
      worksheet.getCell('A1').value = '지점 재고 현황';
      worksheet.getCell('A1').font = { name: '맑은 고딕', size: 18, bold: true, color: { argb: 'FF1F4E79' } };
      worksheet.mergeCells('A1:J1');
      worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      
      // 제목 행 테두리
      worksheet.getCell('A1').border = {
        top: { style: 'thick', color: { argb: 'FF1F4E79' } },
        left: { style: 'thick', color: { argb: 'FF1F4E79' } },
        bottom: { style: 'thick', color: { argb: 'FF1F4E79' } },
        right: { style: 'thick', color: { argb: 'FF1F4E79' } }
      };

      // 기본 정보 섹션
      const basicInfoStartRow = 3;
      worksheet.getCell(`A${basicInfoStartRow}`).value = '지점명';
      worksheet.getCell(`B${basicInfoStartRow}`).value = storeData.name;
      worksheet.getCell(`A${basicInfoStartRow + 1}`).value = '주소';
      worksheet.getCell(`B${basicInfoStartRow + 1}`).value = storeData.address || '-';
      worksheet.getCell(`A${basicInfoStartRow + 2}`).value = '연락처';
      worksheet.getCell(`B${basicInfoStartRow + 2}`).value = storeData.phone || '-';
      worksheet.getCell(`A${basicInfoStartRow + 3}`).value = '생성일시';
      worksheet.getCell(`B${basicInfoStartRow + 3}`).value = new Date().toLocaleString('ko-KR');

      // 기본 정보 스타일 적용
      for (let row = basicInfoStartRow; row <= basicInfoStartRow + 3; row++) {
        for (let col = 1; col <= 2; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 1) {
            cell.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF1F4E79' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF2F2F2F' } };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF1F4E79' } },
            left: { style: 'thin', color: { argb: 'FF1F4E79' } },
            bottom: { style: 'thin', color: { argb: 'FF1F4E79' } },
            right: { style: 'thin', color: { argb: 'FF1F4E79' } }
          };
        }
      }

      // 셀 병합
      worksheet.mergeCells(`B${basicInfoStartRow}:J${basicInfoStartRow}`);
      worksheet.mergeCells(`B${basicInfoStartRow + 1}:J${basicInfoStartRow + 1}`);
      worksheet.mergeCells(`B${basicInfoStartRow + 2}:J${basicInfoStartRow + 2}`);
      worksheet.mergeCells(`B${basicInfoStartRow + 3}:J${basicInfoStartRow + 3}`);

      // 재고 현황 테이블 헤더
      const inventoryStartRow = basicInfoStartRow + 6;
      if (viewMode === 'current') {
        // 현재 재고 모드
        worksheet.getCell(`A${inventoryStartRow}`).value = '카테고리';
        worksheet.getCell(`B${inventoryStartRow}`).value = '상품명';
        worksheet.getCell(`C${inventoryStartRow}`).value = '재고수량';
        worksheet.getCell(`D${inventoryStartRow}`).value = '안전재고';
        worksheet.getCell(`E${inventoryStartRow}`).value = '최대재고';
        worksheet.getCell(`F${inventoryStartRow}`).value = '유통기한';
        worksheet.getCell(`G${inventoryStartRow}`).value = '재고상태';
        worksheet.getCell(`H${inventoryStartRow}`).value = '프로모션';
        worksheet.getCell(`I${inventoryStartRow}`).value = '가격';
        worksheet.getCell(`J${inventoryStartRow}`).value = '단위';
      } else {
        // 모든 재고 모드
        worksheet.getCell(`A${inventoryStartRow}`).value = '카테고리';
        worksheet.getCell(`B${inventoryStartRow}`).value = '상품명';
        worksheet.getCell(`C${inventoryStartRow}`).value = '총재고수량';
        worksheet.getCell(`D${inventoryStartRow}`).value = '안전재고';
        worksheet.getCell(`E${inventoryStartRow}`).value = '최대재고';
        worksheet.getCell(`F${inventoryStartRow}`).value = '유통기한';
        worksheet.getCell(`G${inventoryStartRow}`).value = '재고상태';
        worksheet.getCell(`H${inventoryStartRow}`).value = '프로모션';
        worksheet.getCell(`I${inventoryStartRow}`).value = '가격';
        worksheet.getCell(`J${inventoryStartRow}`).value = '단위';
      }

      // 재고 현황 테이블 헤더 스타일
      for (let col = 1; col <= 10; col++) {
        const cell = worksheet.getCell(inventoryStartRow, col);
        cell.font = { name: '맑은 고딕', size: 11, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF0066CC' } },
          left: { style: 'medium', color: { argb: 'FF0066CC' } },
          bottom: { style: 'medium', color: { argb: 'FF0066CC' } },
          right: { style: 'medium', color: { argb: 'FF0066CC' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // 자동 필터 기능 추가
      worksheet.autoFilter = {
        from: {
          row: inventoryStartRow,
          column: 1
        },
        to: {
          row: inventoryStartRow + (finalDisplayData?.length || 0),
          column: 10
        }
      };

      // 단순한 오름차순/내림차순 정렬을 위한 데이터 준비
      const sortedData = [...finalDisplayData];
      
      // 기본 정렬: 상품명 오름차순
      sortedData.sort((a, b) => {
        const aName = (a as InventoryWithExpiry | AllInventoryItem).product?.name || '';
        const bName = (b as InventoryWithExpiry | AllInventoryItem).product?.name || '';
        return aName.localeCompare(bName);
      });

      // 재고 데이터 추가
      if (sortedData && sortedData.length > 0) {
        sortedData.forEach((item, index) => {
          const row = inventoryStartRow + 1 + index;
          
          if (viewMode === 'current') {
            const currentItem = item as InventoryWithExpiry;
            worksheet.getCell(row, 1).value = '기타'; // category 정보가 없으므로 기본값
            worksheet.getCell(row, 2).value = currentItem.product?.name || '';
            worksheet.getCell(row, 3).value = currentItem.batchQuantity || 0;
            worksheet.getCell(row, 3).numFmt = '#,##0';
            worksheet.getCell(row, 4).value = currentItem.safety_stock || 0;
            worksheet.getCell(row, 4).numFmt = '#,##0';
            worksheet.getCell(row, 5).value = currentItem.max_stock || 0;
            worksheet.getCell(row, 5).numFmt = '#,##0';
            worksheet.getCell(row, 6).value = currentItem.expiryInfo?.formattedRemaining || '유통기한 없음';
            worksheet.getCell(row, 7).value = currentItem.expiryInfo?.status === 'expired' ? '만료' : 
              currentItem.expiryInfo?.status === 'danger' ? '위험' : 
              currentItem.expiryInfo?.status === 'warning' ? '임박' : '정상';
            worksheet.getCell(row, 8).value = currentItem.promotionInfo?.promotion_type || '-';
            worksheet.getCell(row, 9).value = currentItem.price || 0;
            worksheet.getCell(row, 9).numFmt = '#,##0';
            worksheet.getCell(row, 10).value = currentItem.product?.unit || '';
          } else {
            const allItem = item as AllInventoryItem;
            worksheet.getCell(row, 1).value = '기타'; // category 정보가 없으므로 기본값
            worksheet.getCell(row, 2).value = allItem.product?.name || '';
            worksheet.getCell(row, 3).value = allItem.total_stock_quantity || 0;
            worksheet.getCell(row, 3).numFmt = '#,##0';
            worksheet.getCell(row, 4).value = allItem.safety_stock || 0;
            worksheet.getCell(row, 4).numFmt = '#,##0';
            worksheet.getCell(row, 5).value = allItem.max_stock || 0;
            worksheet.getCell(row, 5).numFmt = '#,##0';
            worksheet.getCell(row, 6).value = allItem.product?.shelf_life_days ? `${allItem.product.shelf_life_days}일` : '유통기한 없음';
            worksheet.getCell(row, 7).value = '정상';
            worksheet.getCell(row, 8).value = allItem.promotionInfo?.promotion_type || '-';
            worksheet.getCell(row, 9).value = allItem.price || 0;
            worksheet.getCell(row, 9).numFmt = '#,##0';
            worksheet.getCell(row, 10).value = allItem.product?.unit || '';
          }

          // 데이터 행 스타일
          for (let col = 1; col <= 10; col++) {
            const cell = worksheet.getCell(row, col);
            cell.font = { name: '맑은 고딕', size: 10 };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF1F4E79' } },
              left: { style: 'thin', color: { argb: 'FF1F4E79' } },
              bottom: { style: 'thin', color: { argb: 'FF1F4E79' } },
              right: { style: 'thin', color: { argb: 'FF1F4E79' } }
            };
            
            // 카테고리 열은 중앙 정렬, 숫자 데이터는 중앙 정렬, 텍스트는 좌측 정렬
            if (col === 1 || col === 3 || col === 4 || col === 5 || col === 9) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
          }
        });

        // 재고 현황 테이블 외곽 테두리 추가
        const lastDataRow = inventoryStartRow + sortedData.length;
        
        // 왼쪽 외곽 테두리 (A열)
        for (let row = inventoryStartRow; row <= lastDataRow; row++) {
          const cell = worksheet.getCell(row, 1);
          cell.border = {
            ...cell.border,
            left: { style: 'thick', color: { argb: 'FF1F4E79' } }
          };
        }
        
        // 오른쪽 외곽 테두리 (J열)
        for (let row = inventoryStartRow; row <= lastDataRow; row++) {
          const cell = worksheet.getCell(row, 10);
          cell.border = {
            ...cell.border,
            right: { style: 'thick', color: { argb: 'FF1F4E79' } }
          };
        }
        
        // 상단 외곽 테두리 (헤더 행)
        for (let col = 1; col <= 10; col++) {
          const cell = worksheet.getCell(inventoryStartRow, col);
          cell.border = {
            ...cell.border,
            top: { style: 'thick', color: { argb: 'FF1F4E79' } }
          };
        }
        
        // 하단 외곽 테두리 (마지막 데이터 행)
        for (let col = 1; col <= 10; col++) {
          const cell = worksheet.getCell(lastDataRow, col);
          cell.border = {
            ...cell.border,
            bottom: { style: 'thick', color: { argb: 'FF1F4E79' } }
          };
        }
      }

      // 요약 정보
      const summaryStartRow = inventoryStartRow + (sortedData?.length || 0) + 2;
      worksheet.getCell(`A${summaryStartRow}`).value = '총 상품 수';
      worksheet.getCell(`B${summaryStartRow}`).value = sortedData?.length || 0;
      worksheet.getCell(`B${summaryStartRow}`).numFmt = '#,##0';
      worksheet.getCell(`A${summaryStartRow + 1}`).value = '총 재고 수량';
      worksheet.getCell(`B${summaryStartRow + 1}`).value = sortedData?.reduce((sum, item) => {
        if (viewMode === 'current') {
          return sum + ((item as InventoryWithExpiry).batchQuantity || 0);
        } else {
          return sum + ((item as AllInventoryItem).total_stock_quantity || 0);
        }
      }, 0) || 0;
      worksheet.getCell(`B${summaryStartRow + 1}`).numFmt = '#,##0';

      // 요약 정보 스타일
      for (let row = summaryStartRow; row <= summaryStartRow + 1; row++) {
        for (let col = 1; col <= 2; col++) {
          const cell = worksheet.getCell(row, col);
          if (col === 1) {
            cell.font = { name: '맑은 고딕', size: 11, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2F2' } };
          } else {
            cell.font = { name: '맑은 고딕', size: 11, bold: true };
          }
          cell.border = {
            top: { style: 'medium', color: { argb: 'FFCC6666' } },
            left: { style: 'medium', color: { argb: 'FFCC6666' } },
            bottom: { style: 'medium', color: { argb: 'FFCC6666' } },
            right: { style: 'medium', color: { argb: 'FFCC6666' } }
          };
          cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'center' : 'right' };
        }
      }

      // 셀 병합
      worksheet.mergeCells(`B${summaryStartRow}:J${summaryStartRow}`);
      worksheet.mergeCells(`B${summaryStartRow + 1}:J${summaryStartRow + 1}`);

      // 열 너비 설정 - 카테고리 열 추가로 인한 조정
      worksheet.getColumn('A').width = 20;  // 카테고리
      worksheet.getColumn('B').width = 30;  // 상품명
      worksheet.getColumn('C').width = 15;  // 재고수량
      worksheet.getColumn('D').width = 15;  // 안전재고
      worksheet.getColumn('E').width = 15;  // 최대재고
      worksheet.getColumn('F').width = 25;  // 유통기한
      worksheet.getColumn('G').width = 15;  // 재고상태
      worksheet.getColumn('H').width = 15;  // 프로모션
      worksheet.getColumn('I').width = 18;  // 가격
      worksheet.getColumn('J').width = 12;  // 단위

      // 인쇄 설정
      const lastRow = summaryStartRow + 1;
      worksheet.pageSetup.printArea = `A1:J${lastRow}`;
      worksheet.pageSetup.fitToPage = true;
      worksheet.pageSetup.fitToWidth = 1;
      worksheet.pageSetup.fitToHeight = 0;
      worksheet.pageSetup.orientation = 'portrait';
      worksheet.pageSetup.margins = {
        top: 0.3,
        left: 0.3,
        bottom: 0.3,
        right: 0.3,
        header: 0.3,
        footer: 0.3
      };

      // 파일 저장
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `재고현황_${storeData.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      console.log('✅ 재고 엑셀 다운로드 완료');
      
    } catch (error) {
      console.error('❌ 엑셀 다운로드 중 오류:', error);
      alert('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

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

      {/* 엑셀 다운로드 버튼 */}
      <div className="mb-6">
        <button
          onClick={downloadExcel}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          📊 엑셀 다운로드
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">전체 상품</div>
          <div className="text-2xl font-bold text-gray-900">
            {viewMode === 'current' 
              ? new Set(inventoryWithExpiry.map(item => item.product.name)).size
              : allInventoryItems.length
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">재고 부족</div>
          <div className="text-2xl font-bold text-orange-600">
            {viewMode === 'current' 
              ? (() => {
                  // 상품별로 그룹화하여 총 재고량 계산
                  const productStocks = new Map<string, { totalStock: number, safetyStock: number }>();
                  inventoryWithExpiry.forEach(item => {
                    const existing = productStocks.get(item.product.name);
                    if (existing) {
                      existing.totalStock += item.stock_quantity;
                    } else {
                      productStocks.set(item.product.name, {
                        totalStock: item.stock_quantity,
                        safetyStock: item.safety_stock
                      });
                    }
                  });
                  return Array.from(productStocks.values()).filter(p => p.totalStock <= p.safetyStock).length;
                })()
              : allInventoryItems.filter(p => p.total_stock_quantity <= p.safety_stock).length
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">품절</div>
          <div className="text-2xl font-bold text-red-600">
            {viewMode === 'current' 
              ? (() => {
                  // 상품별로 그룹화하여 총 재고량 계산
                  const productStocks = new Map<string, number>();
                  inventoryWithExpiry.forEach(item => {
                    const existing = productStocks.get(item.product.name) || 0;
                    productStocks.set(item.product.name, existing + item.stock_quantity);
                  });
                  return Array.from(productStocks.values()).filter(stock => stock <= 0).length;
                })()
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
              ? (() => {
                  // 상품별로 그룹화하여 유통기한 임박 상품 계산
                  const productExpiryStatus = new Map<string, boolean>();
                  inventoryWithExpiry.forEach(item => {
                    const hasWarning = item.expiryInfo.status === 'warning' || item.expiryInfo.status === 'danger';
                    if (hasWarning || !productExpiryStatus.has(item.product.name)) {
                      productExpiryStatus.set(item.product.name, hasWarning);
                    }
                  });
                  return Array.from(productExpiryStatus.values()).filter(hasWarning => hasWarning).length;
                })()
              : allInventoryItems.filter(p => p.total_stock_quantity > 0).length
            }
          </div>
        </div>
      </div>

      {/* 재고 현황 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">재고 현황</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode('current')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'current'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                현재 재고
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                모든 재고
              </button>
            </div>
          </div>
          
          {/* 검색창과 필터 */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* 검색창 */}
            <div className="flex-1 min-w-[250px] max-w-[400px] relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="상품명 또는 단위로 검색... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchQuery('');
                    }
                  }}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoComplete="off"
                  spellCheck="false"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* 필터들 */}
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="min-w-[90px] px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="low">재고 부족</option>
              <option value="out">품절</option>
            </select>
            
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value as 'all' | 'normal' | 'warning' | 'danger' | 'expired')}
              className="min-w-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              title="유통기한 상태 필터"
            >
              <option value="all">유통기한 전체</option>
              <option value="warning">임박(≤7일)</option>
              <option value="danger">위험(≤3일)</option>
              <option value="expired">만료</option>
              <option value="normal">정상</option>
            </select>
            
            <select
              value={promotionFilter}
              onChange={(e) => setPromotionFilter(e.target.value as 'all' | 'buy_one_get_one' | 'buy_two_get_one')}
              className="min-w-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              title="행사 필터"
            >
              <option value="all">행사 전체</option>
              <option value="buy_one_get_one">1+1 행사</option>
              <option value="buy_two_get_one">2+1 행사</option>
            </select>
          </div>
          
          {/* 검색 결과 요약 */}
          {searchQuery && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>"{searchQuery}"</strong> 검색 결과: {finalDisplayData.length}개 상품
                </span>
              </div>
              {finalDisplayData.length === 0 && (
                <span className="text-orange-600">검색 결과가 없습니다.</span>
              )}
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {viewMode === 'current' ? '통합 재고' : '배치별 재고'}
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
                  행사
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
                        <div className="text-sm font-medium text-gray-900">
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: currentProduct.product.name.replace(
                                new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                '<mark className="bg-yellow-200 px-1 rounded">$1</mark>'
                              )
                            }} />
                          ) : (
                            currentProduct.product.name
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {currentProduct.expiryInfo?.expiresAt 
                            ? `유통기한: ${new Date(currentProduct.expiryInfo.expiresAt).toLocaleDateString()}`
                            : '유통기한 없음'
                          }
                        </div>
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
                        {currentProduct.promotionInfo.promotion_type ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            currentProduct.promotionInfo.promotion_type === 'buy_one_get_one' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {currentProduct.promotionInfo.promotion_type === 'buy_one_get_one' ? '1+1' : '2+1'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
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
                        <div className="text-sm font-medium text-gray-900">
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: allProduct.product.name.replace(
                                new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                '<mark className="bg-yellow-200 px-1 rounded">$1</mark>'
                              )
                            }} />
                          ) : (
                            allProduct.product.name
                          )}
                        </div>
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
                        {allProduct.promotionInfo.promotion_type ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            allProduct.promotionInfo.promotion_type === 'buy_one_get_one' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {allProduct.promotionInfo.promotion_type === 'buy_one_get_one' ? '1+1' : '2+1'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
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
          
          {/* 빈 상태 메시지 */}
          {finalDisplayData.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery ? '검색 결과가 없습니다' : '재고가 없습니다'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? `"${searchQuery}"와 일치하는 상품을 찾을 수 없습니다. 다른 검색어를 시도해보세요.`
                  : '아직 등록된 재고가 없습니다. 상품을 입고하여 재고를 등록해보세요.'
                }
              </p>
              {searchQuery && (
                <div className="mt-4">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    검색 초기화
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreInventory; 