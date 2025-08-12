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

interface ReturnRequestItem {
  product_id: string;
  product_name: string;
  requested_quantity: number;
  unit_cost: number;
  total_cost: number;
  condition_notes: string;
  current_stock: number;
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
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
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
      fetchStoreProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id]);

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

  const updateItemQuantity = (productId: string, quantity: number) => {
    const product = storeProducts.find(p => p.product_id === productId);
    const maxQuantity = product?.stock_quantity || 0;
    const validQuantity = Math.max(1, Math.min(quantity, maxQuantity));
    
    setSelectedItems(prev => prev.map(item => 
      item.product_id === productId 
        ? { 
            ...item, 
            requested_quantity: validQuantity,
            total_cost: validQuantity * item.unit_cost
          }
        : item
    ));
  };

  const updateItemNotes = (productId: string, notes: string) => {
    setSelectedItems(prev => prev.map(item => 
      item.product_id === productId 
        ? { ...item, condition_notes: notes }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const calculateTotalAmount = () => {
    return selectedItems.reduce((total, item) => total + item.total_cost, 0);
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

      // 반품 요청 번호 생성
      const { data: requestNumberData, error: requestNumberError } = await supabase
        .rpc('generate_return_request_number' as any);

      if (requestNumberError) {
        throw new Error('반품 요청 번호 생성에 실패했습니다.');
      }

      const finalReason = returnReason === '기타' ? customReason : returnReason;
      const totalAmount = calculateTotalAmount();

      // 반품 요청 생성
      const { data: returnRequest, error: returnRequestError } = await supabase
        .from('return_requests' as any)
        .insert({
          request_number: requestNumberData,
          store_id: storeData.id,
          requested_by: user?.id,
          status: 'submitted',
          priority,
          total_amount: totalAmount,
          return_reason: finalReason,
          additional_notes: additionalNotes.trim() || null
        })
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
        current_stock: item.current_stock
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
    setSelectedItems([]);
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
                    <h4 className="text-md font-medium text-gray-700 mb-3">보유 상품</h4>
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
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
                      {!fetchingProducts && storeProducts.length === 0 && (
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
                    </div>
                  </div>

                  {/* 선택된 상품 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">선택된 반품 상품</h4>
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                      {selectedItems.map((item) => (
                        <div key={item.product_id} className="p-3 border-b last:border-b-0">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-900">
                                {item.product_name}
                              </div>
                              <button
                                onClick={() => removeItem(item.product_id)}
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
                                onChange={(e) => updateItemQuantity(item.product_id, parseInt(e.target.value) || 1)}
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
                                onChange={(e) => updateItemNotes(item.product_id, e.target.value)}
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
