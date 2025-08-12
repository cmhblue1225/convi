import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';

interface StoreProduct {
  id: string;
  store_id: string | null;
  product_id: string | null;
  price: number;
  stock_quantity: number;
  safety_stock: number | null;
  max_stock: number | null;
  is_available: boolean | null;
  product: {
    name: string;
    unit: string;
    base_price: number;
  } | null;
}

interface SupplyRequest {
  id: string;
  request_number: string;
  status: string;
  total_amount: number | null;
  approved_amount: number | null;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  created_at: string | null;
  items?: SupplyRequestItem[];
}

interface SupplyRequestItem {
  id: string;
  supply_request_id: string | null;
  product_id: string | null;
  product_name: string;
  requested_quantity: number;
  approved_quantity: number | null;
  unit_cost: number | null;
  total_cost: number | null;
  current_stock: number | null;
}

interface ReturnRequestItem {
  product_id: string;
  product_name: string;
  requested_quantity: number;
  unit_cost: number;
  total_cost: number;
  condition_notes: string;
  current_stock: number;
  supply_request_item_id?: string;
}

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RETURN_REASONS = [
  '유통기한 임박',
  '상품 손상',
  '품질 불량',
  '잘못된 입고',
  '과다 재고',
  '고객 클레임',
  '기타'
];

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [returnType, setReturnType] = useState<'general' | 'supply_request'>('general');
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [selectedSupplyRequest, setSelectedSupplyRequest] = useState<SupplyRequest | null>(null);
  const [selectedItems, setSelectedItems] = useState<ReturnRequestItem[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      if (!user?.id) {
        console.error('❌ 사용자 정보가 없습니다');
        alert('로그인이 필요합니다.');
        onClose();
        return;
      }
      if (returnType === 'general') {
        fetchStoreProducts();
      } else {
        fetchSupplyRequests();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id, returnType]);

  const fetchStoreProducts = async () => {
    try {
      setFetchingProducts(true);
      console.log('🔍 반품 상품 조회 시작...', { userId: user?.id });
      
      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('owner_id', user?.id || '')
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        alert('지점 정보를 찾을 수 없습니다. 관리자에게 문의하세요.');
        return;
      }

      console.log('✅ 지점 정보 조회 성공:', storeData);

      // 재고가 있는 상품들만 조회 (관계형 정렬 제거)
      const { data: productsData, error: productsError } = await supabase
        .from('store_products')
        .select(`
          id,
          store_id,
          product_id,
          price,
          stock_quantity,
          safety_stock,
          max_stock,
          is_available,
          product:products(
            name,
            unit,
            base_price
          )
        `)
        .eq('store_id', storeData.id)
        .gt('stock_quantity', 0)
        .eq('is_available', true);

      if (productsError) {
        console.error('❌ 상품 정보 조회 실패:', productsError);
        alert('상품 정보를 불러오는데 실패했습니다.');
        return;
      }

      console.log('✅ 상품 조회 완료:', { 
        storeId: storeData.id, 
        productCount: productsData?.length || 0,
        products: productsData?.slice(0, 3).map(p => p.product?.name) // 처음 3개만 로그
      });

      // 상품명으로 정렬 (클라이언트 사이드)
      const sortedProducts = (productsData || [])
        .filter(p => p.product) // null 체크
        .sort((a, b) => 
          a.product!.name.localeCompare(b.product!.name)
        );

      setStoreProducts(sortedProducts);
    } catch (error) {
      console.error('❌ 데이터 조회 중 오류:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setFetchingProducts(false);
    }
  };

  const fetchSupplyRequests = async () => {
    try {
      setFetchingProducts(true);
      console.log('🔍 물류 요청 조회 시작...');
      
      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user?.id || '')
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        alert('지점 정보를 찾을 수 없습니다.');
        return;
      }

      // 배송 완료된 물류 요청들만 조회 (반품 가능한 항목들)
      const { data: requestsData, error: requestsError } = await supabase
        .from('supply_requests')
        .select(`
          id,
          request_number,
          status,
          total_amount,
          approved_amount,
          expected_delivery_date,
          actual_delivery_date,
          created_at,
          items:supply_request_items(
            id,
            supply_request_id,
            product_id,
            product_name,
            requested_quantity,
            approved_quantity,
            unit_cost,
            total_cost,
            current_stock
          )
        `)
        .eq('store_id', storeData.id)
        .eq('status', 'delivered') // 배송 완료된 것만
        .order('created_at', { ascending: false })
        .limit(20); // 최근 20개만

      if (requestsError) {
        console.error('❌ 물류 요청 조회 실패:', requestsError);
        alert('물류 요청을 불러오는데 실패했습니다.');
        return;
      }

      console.log('✅ 물류 요청 조회 완료:', requestsData?.length || 0);
      setSupplyRequests(requestsData || []);
    } catch (error) {
      console.error('❌ 물류 요청 조회 중 오류:', error);
      alert('물류 요청을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setFetchingProducts(false);
    }
  };

  const addItem = (product: StoreProduct) => {
    if (!product.product_id || !product.product) return;
    
    const existingItem = selectedItems.find(item => item.product_id === product.product_id);
    if (existingItem) {
      setSelectedItems(prev => prev.map(item => 
        item.product_id === product.product_id 
          ? { 
              ...item, 
              requested_quantity: Math.min(item.requested_quantity + 1, product.stock_quantity),
              total_cost: (Math.min(item.requested_quantity + 1, product.stock_quantity)) * item.unit_cost
            }
          : item
      ));
    } else {
      const newItem: ReturnRequestItem = {
        product_id: product.product_id,
        product_name: product.product.name,
        requested_quantity: 1,
        unit_cost: product.price,
        total_cost: product.price,
        condition_notes: '',
        current_stock: product.stock_quantity
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
  };

  const addSupplyRequestItem = (supplyItem: SupplyRequestItem) => {
    if (!supplyItem.product_id || !supplyItem.approved_quantity || !supplyItem.unit_cost) return;
    
    const existingItem = selectedItems.find(item => 
      item.product_id === supplyItem.product_id && 
      item.supply_request_item_id === supplyItem.id
    );
    
    if (existingItem) {
      setSelectedItems(prev => prev.map(item => 
        item.supply_request_item_id === supplyItem.id
          ? { 
              ...item, 
              requested_quantity: Math.min(item.requested_quantity + 1, supplyItem.approved_quantity || 0),
              total_cost: (Math.min(item.requested_quantity + 1, supplyItem.approved_quantity || 0)) * item.unit_cost
            }
          : item
      ));
    } else {
      const newItem: ReturnRequestItem = {
        product_id: supplyItem.product_id,
        product_name: supplyItem.product_name,
        requested_quantity: 1,
        unit_cost: supplyItem.unit_cost,
        total_cost: supplyItem.unit_cost,
        condition_notes: '',
        current_stock: supplyItem.approved_quantity, // 승인된 수량 기준
        supply_request_item_id: supplyItem.id
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
  };

  const updateItemQuantity = (productId: string, quantity: number, supplyRequestItemId?: string) => {
    const maxQuantity = returnType === 'general' 
      ? storeProducts.find(p => p.product_id === productId)?.stock_quantity || 0
      : selectedSupplyRequest?.items?.find(i => i.id === supplyRequestItemId)?.approved_quantity || 0;
    
    const validQuantity = Math.max(1, Math.min(quantity, maxQuantity));
    
    setSelectedItems(prev => prev.map(item => {
      const isTargetItem = supplyRequestItemId 
        ? item.supply_request_item_id === supplyRequestItemId
        : item.product_id === productId && !item.supply_request_item_id;
      
      return isTargetItem
        ? { 
            ...item, 
            requested_quantity: validQuantity,
            total_cost: validQuantity * item.unit_cost
          }
        : item;
    }));
  };

  const updateItemNotes = (productId: string, notes: string, supplyRequestItemId?: string) => {
    setSelectedItems(prev => prev.map(item => {
      const isTargetItem = supplyRequestItemId 
        ? item.supply_request_item_id === supplyRequestItemId
        : item.product_id === productId && !item.supply_request_item_id;
      
      return isTargetItem
        ? { ...item, condition_notes: notes }
        : item;
    }));
  };

  const removeItem = (productId: string, supplyRequestItemId?: string) => {
    setSelectedItems(prev => prev.filter(item => {
      if (supplyRequestItemId) {
        return item.supply_request_item_id !== supplyRequestItemId;
      }
      return !(item.product_id === productId && !item.supply_request_item_id);
    }));
  };

  const calculateTotalAmount = () => {
    return selectedItems.reduce((total, item) => total + item.total_cost, 0);
  };

  const handleReturnTypeChange = (type: 'general' | 'supply_request') => {
    setReturnType(type);
    setSelectedItems([]); // 선택된 아이템 초기화
    setSelectedSupplyRequest(null);
  };

  const handleSupplyRequestSelect = (request: SupplyRequest) => {
    setSelectedSupplyRequest(request);
    setSelectedItems([]); // 이전 선택 초기화
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert('반품할 상품을 선택해주세요.');
      return;
    }

    if (!returnReason) {
      alert('반품 사유를 선택해주세요.');
      return;
    }

    if (returnReason === '기타' && !customReason.trim()) {
      alert('기타 사유를 입력해주세요.');
      return;
    }

    // 수량 검증
    for (const item of selectedItems) {
      if (item.requested_quantity <= 0) {
        alert(`${item.product_name}의 반품 수량이 올바르지 않습니다.`);
        return;
      }
      if (item.requested_quantity > item.current_stock) {
        alert(`${item.product_name}의 반품 수량이 현재 재고보다 많습니다.`);
        return;
      }
    }

    try {
      setLoading(true);

      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user?.id || '')
        .single();

      if (storeError || !storeData) {
        throw new Error('지점 정보를 찾을 수 없습니다.');
      }

      // 반품 요청 번호 생성 (클라이언트 측에서 생성)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const timestamp = now.getTime().toString().slice(-6); // 마지막 6자리
      const requestNumberData = `RET-${year}${month}-${timestamp}`;

      const finalReason = returnReason === '기타' ? customReason : returnReason;
      const totalAmount = calculateTotalAmount();

      // 반품 요청 생성
      const returnRequestData: any = {
        request_number: requestNumberData,
        store_id: storeData.id,
        requested_by: user?.id,
        status: 'submitted',
        priority,
        total_amount: totalAmount,
        return_reason: finalReason,
        additional_notes: additionalNotes.trim() || null,
        return_type: returnType
      };

      // 물류 요청별 반품인 경우 supply_request_id 추가
      if (returnType === 'supply_request' && selectedSupplyRequest) {
        returnRequestData.supply_request_id = selectedSupplyRequest.id;
      }

      const { data: returnRequest, error: returnRequestError } = await supabase
        .from('return_requests' as any)
        .insert(returnRequestData)
        .select()
        .single();

      if (returnRequestError) {
        throw new Error('반품 요청 생성에 실패했습니다.');
      }

      // 반품 요청 아이템 생성
      const itemsToInsert = selectedItems.map(item => ({
        return_request_id: (returnRequest as any).id,
        product_id: item.product_id,
        product_name: item.product_name,
        requested_quantity: item.requested_quantity,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
        condition_notes: item.condition_notes.trim() || null,
        current_stock: item.current_stock,
        supply_request_item_id: item.supply_request_item_id || null
      }));

      const { error: itemsError } = await supabase
        .from('return_request_items' as any)
        .insert(itemsToInsert);

      if (itemsError) {
        throw new Error('반품 상품 정보 저장에 실패했습니다.');
      }

      alert('반품 요청이 성공적으로 제출되었습니다.');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('❌ 반품 요청 제출 실패:', error);
      alert(error instanceof Error ? error.message : '반품 요청 제출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReturnType('general');
    setSelectedItems([]);
    setSelectedSupplyRequest(null);
    setReturnReason('');
    setCustomReason('');
    setAdditionalNotes('');
    setPriority('normal');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">반품 요청</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* 반품 유형 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반품 유형 *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="general"
                    checked={returnType === 'general'}
                    onChange={(e) => handleReturnTypeChange(e.target.value as 'general')}
                    className="mr-2"
                  />
                  <span>보유 상품 전체에서 선택</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="supply_request"
                    checked={returnType === 'supply_request'}
                    onChange={(e) => handleReturnTypeChange(e.target.value as 'supply_request')}
                    className="mr-2"
                  />
                  <span>물류 요청 번호별 반품</span>
                </label>
              </div>
            </div>

            {/* 반품 사유 및 우선순위 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반품 사유 *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">사유를 선택하세요</option>
                  {RETURN_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {returnReason === '기타' && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="상세 사유를 입력하세요"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  우선순위
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">낮음</option>
                  <option value="normal">보통</option>
                  <option value="high">높음</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>
            </div>

            {/* 추가 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 메모
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                placeholder="추가적인 설명이나 요청사항을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 물류 요청별 반품인 경우 물류 요청 선택 */}
            {returnType === 'supply_request' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">물류 요청 선택</h3>
                
                {fetchingProducts ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    {supplyRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                          selectedSupplyRequest?.id === request.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => handleSupplyRequestSelect(request)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {request.request_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              배송 완료: {request.actual_delivery_date ? 
                                new Date(request.actual_delivery_date).toLocaleDateString('ko-KR') : '정보 없음'}
                            </div>
                                                          <div className="text-sm text-gray-500">
                                승인 금액: {request.approved_amount?.toLocaleString() || '0'}원 | 
                                상품 수: {request.items?.length || 0}개
                              </div>
                          </div>
                          <div className="ml-4">
                            <input
                              type="radio"
                              checked={selectedSupplyRequest?.id === request.id}
                              onChange={() => handleSupplyRequestSelect(request)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {supplyRequests.length === 0 && (
                      <div className="p-8 text-center">
                        <div className="text-gray-500 mb-2">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H1" />
                          </svg>
                        </div>
                        <p className="text-gray-500">반품 가능한 물류 요청이 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-1">배송 완료된 물류 요청만 반품할 수 있습니다.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 상품 선택 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">반품 상품 선택</h3>
              
              {fetchingProducts ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 상품 목록 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      {returnType === 'general' ? '보유 상품' : '물류 요청 상품'}
                    </h4>
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                      {returnType === 'general' ? (
                        // 일반 반품 - 보유 상품 목록
                        <>
                          {storeProducts.map((product) => (
                            <div
                              key={product.id}
                              className="p-3 border-b last:border-b-0 hover:bg-gray-50"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {product.product?.name || '상품명 없음'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    현재 재고: {product.stock_quantity}{product.product?.unit || ''} | 
                                    단가: {product.price.toLocaleString()}원
                                  </div>
                                </div>
                                <button
                                  onClick={() => addItem(product)}
                                  disabled={!product.product_id || !product.product}
                                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  추가
                                </button>
                              </div>
                            </div>
                          ))}
                          {storeProducts.length === 0 && (
                            <div className="p-8 text-center">
                              <div className="text-gray-500 mb-2">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H1" />
                                </svg>
                              </div>
                              <p className="text-gray-500">반품 가능한 상품이 없습니다.</p>
                              <p className="text-sm text-gray-400 mt-1">재고가 있고 판매 가능한 상품만 반품할 수 있습니다.</p>
                            </div>
                          )}
                        </>
                      ) : (
                        // 물류 요청별 반품 - 선택된 물류 요청의 상품 목록
                        <>
                          {selectedSupplyRequest ? (
                            <>
                              {selectedSupplyRequest.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-3 border-b last:border-b-0 hover:bg-gray-50"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {item.product_name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        승인 수량: {item.approved_quantity || 0} | 
                                        단가: {item.unit_cost?.toLocaleString() || '0'}원
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => addSupplyRequestItem(item)}
                                      disabled={(item.approved_quantity || 0) <= 0}
                                      className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      추가
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {(!selectedSupplyRequest.items || selectedSupplyRequest.items.length === 0) && (
                                <div className="p-8 text-center">
                                  <p className="text-gray-500">이 물류 요청에는 상품이 없습니다.</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="p-8 text-center">
                              <p className="text-gray-500">물류 요청을 먼저 선택해주세요.</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* 선택된 상품 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">선택된 반품 상품</h4>
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                      {selectedItems.map((item, index) => (
                        <div key={`${item.product_id}-${item.supply_request_item_id || index}`} className="p-3 border-b last:border-b-0">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-900">
                                {item.product_name}
                                {item.supply_request_item_id && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    물류요청상품
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.product_id, item.supply_request_item_id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-600">수량:</label>
                              <input
                                type="number"
                                min="1"
                                max={item.current_stock}
                                value={item.requested_quantity}
                                onChange={(e) => updateItemQuantity(
                                  item.product_id, 
                                  parseInt(e.target.value) || 1,
                                  item.supply_request_item_id
                                )}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <span className="text-sm text-gray-500">
                                (최대 {item.current_stock})
                              </span>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-1">상품 상태:</label>
                              <input
                                type="text"
                                value={item.condition_notes}
                                onChange={(e) => updateItemNotes(
                                  item.product_id, 
                                  e.target.value,
                                  item.supply_request_item_id
                                )}
                                placeholder="손상 정도, 유통기한 등"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>

                            <div className="text-sm text-gray-600">
                              소계: {item.total_cost.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedItems.length === 0 && (
                        <div className="p-8 text-center">
                          <div className="text-gray-500 mb-2">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <p className="text-gray-500">반품할 상품을 선택해주세요.</p>
                          <p className="text-sm text-gray-400 mt-1">좌측 상품 목록에서 "추가" 버튼을 클릭하세요.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 총 금액 */}
            {selectedItems.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">총 반품 금액:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {calculateTotalAmount().toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedItems.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && <LoadingSpinner />}
              반품 요청 제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestModal;