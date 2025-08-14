import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../stores/orderStore';
import { useCartStore } from '../../stores/cartStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import ReorderHistory from '../../components/customer/ReorderHistory';
import { supabase } from '../../lib/supabase/client';
import { useAuthStore } from '../../stores/common/authStore';
import RefundReceiptModal from '../../components/store/RefundReceiptModal';

interface RefundItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  reason: string;
  max_quantity: number;
}

const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading, fetchOrders, subscribeToOrders, unsubscribeFromOrders, clearOrders } = useOrderStore();
  const { reorderFromOrder } = useCartStore();
  const { user } = useAuthStore();
  
  // 환불 모달 상태
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundReason, setRefundReason] = useState('');
  const [refundDescription, setRefundDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 환불 상태 조회
  const [refundStatuses, setRefundStatuses] = useState<{[key: string]: any}>({});
  const [showRefundReceiptModal, setShowRefundReceiptModal] = useState(false);
  const [selectedRefundForReceipt, setSelectedRefundForReceipt] = useState<any>(null);

  console.log('📋 주문 내역 페이지 - 총 주문 수:', orders.length);

  // 환불 상태 조회 함수
  const fetchRefundStatuses = async () => {
    if (!user?.id || orders.length === 0) return;
    
    try {
      const orderIds = orders.map(order => order.id);
      const { data, error } = await supabase
        .from('refund_requests' as any)
        .select('order_id, status, created_at, processed_at, admin_notes')
        .in('order_id', orderIds)
        .eq('customer_id', user.id);

      if (error) throw error;
      
      const statusMap: {[key: string]: any} = {};
      data?.forEach((refund: any) => {
        statusMap[refund.order_id] = refund;
      });
      
      setRefundStatuses(statusMap);
      console.log('🔄 환불 상태 조회 완료:', statusMap);
    } catch (error) {
      console.error('환불 상태 조회 실패:', error);
    }
  };

  useEffect(() => {
    console.log('📋 CustomerOrders 컴포넌트 마운트됨 - 주문 목록 강제 새로고침');
    
    // 컴포넌트 마운트 시 주문 목록 조회 및 실시간 구독
    fetchOrders();
    subscribeToOrders();

    // 추가로 1초 후 한 번 더 새로고침 (결제 완료 직후 접근한 경우를 위해)
    const refreshTimer = setTimeout(() => {
      console.log('🔄 CustomerOrders - 1초 후 추가 새로고침');
      fetchOrders();
    }, 1000);

    // 컴포넌트 언마운트 시 구독 해제 및 타이머 정리
    return () => {
      unsubscribeFromOrders();
      clearTimeout(refreshTimer);
    };
  }, [fetchOrders, subscribeToOrders, unsubscribeFromOrders]);

  // 주문 목록이 변경될 때 환불 상태도 조회
  useEffect(() => {
    if (orders.length > 0) {
      fetchRefundStatuses();
    }
  }, [orders]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '주문 접수';
      case 'confirmed': return '주문 확인';
      case 'preparing': return '제조 중';
      case 'ready': return '픽업 대기';
      case 'delivering': return '배송 중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivering': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 환불 상태 텍스트 및 색상 반환
  const getRefundStatusInfo = (orderId: string) => {
    const refund = refundStatuses[orderId];
    if (!refund) return null;

    // 디버깅용 로그 추가
    console.log(`🔍 getRefundStatusInfo 호출 - orderId: ${orderId}`, {
      refund,
      refundStatuses,
      allOrderIds: Object.keys(refundStatuses)
    });

    switch (refund.status) {
      case 'pending':
        return { status: 'pending', text: '환불 검토 중', color: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { status: 'approved', text: '환불 승인됨', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { status: 'rejected', text: '환불 거절됨', color: 'bg-red-100 text-red-800' };
      case 'under_review':
        return { status: 'under_review', text: '환불 검토 중', color: 'bg-blue-100 text-blue-800' };
      default:
        return { status: refund.status, text: refund.status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 환불 영수증 모달 열기
  const handleViewRefundReceipt = (orderId: string) => {
    const refund = refundStatuses[orderId];
    if (refund) {
      setSelectedRefundForReceipt(refund);
      setShowRefundReceiptModal(true);
    }
  };

  const handleReorder = async (order: any) => {
    console.log('🔄 재주문 시작:', order);
    
    try {
      // 주문 타입과 배송 주소 정보, 주문 정보 전달
      const result = await reorderFromOrder(
        order.items, 
        order.storeId, 
        order.storeName,
        order.orderType,
        order.deliveryAddress,
        {
          orderId: order.id,
          orderNumber: order.orderNumber
        }
      );
      
      if (result.success) {
        // 성공 메시지 표시
        const message = result.message;
        
        // 더 친화적인 성공 메시지
        const successMessage = `✅ 재주문이 완료되었습니다!\n\n${message}\n\n장바구니에 ${result.itemCount}개 상품이 담겼습니다.`;
        alert(successMessage);
        
        // 체크아웃 페이지로 직접 이동 (장바구니를 거치지 않음)
        navigate('/customer/checkout');
      } else {
        // 실패 시 상세 메시지 표시
        if (result.unavailableItems && result.unavailableItems.length > 0) {
          const errorMessage = `❌ 재주문이 불가능합니다:\n\n${result.message}`;
          alert(errorMessage);
        } else {
          alert(`❌ 재주문 실패: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('❌ 재주문 처리 중 오류:', error);
      alert('재주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 환불 유형 변경 처리
  const handleRefundTypeChange = (type: 'full' | 'partial') => {
    setRefundType(type);
    
    if (type === 'full') {
      // 전체 환불 시 모든 상품을 최대 수량으로 선택
      setRefundItems((prevItems: RefundItem[]) => 
        prevItems.map((item: RefundItem) => ({
          ...item,
          quantity: item.max_quantity
        }))
      );
    } else {
      // 부분 환불 시 모든 상품을 선택 해제 (0으로 설정)
      setRefundItems((prevItems: RefundItem[]) => 
        prevItems.map((item: RefundItem) => ({
          ...item,
          quantity: 0
        }))
      );
    }
  };

  // 환불 모달 열기
  const openRefundModal = (order: any) => {
    setSelectedOrder(order);
    
    // 환불 상품 초기화
    const initialRefundItems = order.items.map((item: any) => ({
      product_id: item.productId || item.id,
      product_name: item.productName,
      quantity: item.quantity, // 전체 환불이 기본값이므로 최대 수량으로 설정
      price: item.unitPrice || (item.subtotal / item.quantity),
      reason: '',
      max_quantity: item.quantity
    }));
    
    setRefundItems(initialRefundItems);
    setRefundType('full'); // 전체 환불을 기본값으로 설정
    setRefundReason('');
    setRefundDescription('');
    setIsRefundModalOpen(true);
  };

  // 환불 모달 닫기
  const closeRefundModal = () => {
    setIsRefundModalOpen(false);
    setSelectedOrder(null);
    setRefundItems([]);
  };

  // 환불 상품 수량 변경
  const updateRefundItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...refundItems];
    updatedItems[index].quantity = Math.min(Math.max(1, quantity), updatedItems[index].max_quantity);
    setRefundItems(updatedItems);
  };

  // 환불 상품 사유 변경
  const updateRefundItemReason = (index: number, reason: string) => {
    const updatedItems = [...refundItems];
    updatedItems[index].reason = reason;
    setRefundItems(updatedItems);
  };

  // 환불 상품 선택/해제
  const toggleRefundItem = (index: number) => {
    const updatedItems = [...refundItems];
    if (updatedItems[index].quantity > 0) {
      updatedItems[index].quantity = 0;
    } else {
      updatedItems[index].quantity = updatedItems[index].max_quantity;
    }
    setRefundItems(updatedItems);
  };

  // 총 환불 금액 계산
  const totalRefundAmount = refundItems.reduce((sum: number, item: RefundItem) => sum + (item.price * item.quantity), 0);

  // 환불 요청 제출
  const submitRefundRequest = async () => {
    if (!user?.id || !selectedOrder) return;

    // 환불할 상품이 있는지 확인
    const selectedItems = refundItems.filter((item: RefundItem) => item.quantity > 0);
    if (selectedItems.length === 0) {
      alert('환불할 상품을 선택해주세요.');
      return;
    }

    if (!refundReason) {
      alert('환불 사유를 선택해주세요.');
      return;
    }

    // 전체 환불 시 모든 상품이 선택되었는지 확인
    if (refundType === 'full') {
      const allItemsSelected = selectedItems.length === refundItems.length;
      const allMaxQuantities = selectedItems.every((item: RefundItem) => 
        item.quantity === item.max_quantity
      );
      
      if (!allItemsSelected || !allMaxQuantities) {
        alert('전체 환불을 선택하셨습니다. 모든 상품을 최대 수량으로 선택해주세요.');
        return;
      }
    }

    // 부분 환불 시 최소 1개 상품은 선택되어야 함
    if (refundType === 'partial' && selectedItems.length === 0) {
      alert('부분 환불을 선택하셨습니다. 환불할 상품을 최소 1개 이상 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 환불 요청 데이터 구성
      const refundRequestData = {
        p_order_id: selectedOrder.id,
        p_customer_id: user.id,
        p_store_id: selectedOrder.storeId, // storeId 필드 사용 (올바른 필드명)
        p_request_type: refundType === 'full' ? 'full_refund' : 'partial_refund',
        p_reason: refundReason,
        p_refund_items: selectedItems.map((item: RefundItem) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          reason: item.reason || refundReason
        })),
        p_requested_refund_amount: totalRefundAmount,
        p_description: refundDescription || `${refundType === 'full' ? '전체' : '부분'} 환불 요청`,
        p_customer_phone: '', // 사용자 프로필에서 전화번호 가져오기
        p_priority: 'normal',
        p_refund_method: 'payment_refund',
        p_is_urgent: false,
        p_estimated_processing_time: 24
      };

      console.log('환불 요청 데이터:', refundRequestData);
      console.log('주문 데이터 구조:', selectedOrder); // 디버깅용
      console.log('storeId 값:', selectedOrder.storeId); // storeId 값 확인
      console.log('주문 데이터의 모든 키:', Object.keys(selectedOrder)); // 모든 키 확인

      // store_id가 없는 경우 에러 처리
      if (!refundRequestData.p_store_id) {
        console.error('매장 정보 누락:', {
          selectedOrder,
          storeId: selectedOrder.storeId,
          allKeys: Object.keys(selectedOrder)
        });
        throw new Error('매장 정보를 찾을 수 없습니다. 주문 데이터를 확인해주세요.');
      }

      // Supabase 함수 호출로 환불 요청 생성
      const { data, error } = await supabase.rpc('create_refund_request' as any, refundRequestData);

      if (error) throw error;

      alert('환불 요청이 성공적으로 제출되었습니다.');
      closeRefundModal();
      
      // 환불 요청 페이지로 이동
      navigate('/customer/refunds');
    } catch (error) {
      console.error('환불 요청 생성 실패:', error);
      alert('환불 요청 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">주문 내역</h1>
              <p className="text-gray-600 mt-1">지금까지 주문한 상품들을 확인하세요</p>
            </div>
            <button
              onClick={() => navigate('/customer/products')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              새 주문하기
            </button>
          </div>
        </div>

        {/* 주문 목록 */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">아직 주문 내역이 없습니다.</p>
            <button
              onClick={() => navigate('/customer/products')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              첫 주문하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">주문번호: {order.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      {/* 환불 상태 표시 */}
                      {getRefundStatusInfo(order.id) && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRefundStatusInfo(order.id)?.color}`}>
                          {getRefundStatusInfo(order.id)?.text}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 text-sm">
                      <div>{order.storeName} • {order.orderType === 'pickup' ? '픽업' : '배송'}</div>
                      <div>주문일시: {new Date(order.createdAt).toLocaleString()}</div>
                      {order.completedAt && (
                        <div>완료일시: {new Date(order.completedAt).toLocaleString()}</div>
                      )}
                      {/* 환불 정보 표시 */}
                      {getRefundStatusInfo(order.id) && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-orange-400">
                          <div className="text-sm font-medium text-gray-700">
                            환불 정보: {getRefundStatusInfo(order.id)?.text}
                          </div>
                          {refundStatuses[order.id]?.admin_notes && (
                            <div className="text-xs text-gray-600 mt-1">
                              처리 사유: {refundStatuses[order.id].admin_notes}
                            </div>
                          )}
                          {refundStatuses[order.id]?.processed_at && (
                            <div className="text-xs text-gray-600 mb-2">
                              처리일시: {new Date(refundStatuses[order.id].processed_at).toLocaleString()}
                            </div>
                          )}
                          {/* 환불 영수증 보기 버튼 - 디버깅 로그 추가 */}
                          {(() => {
                            const refundInfo = getRefundStatusInfo(order.id);
                            const shouldShowButton = refundInfo?.status === 'approved' || refundInfo?.status === 'rejected';
                            
                            console.log(`🔍 환불 영수증 버튼 렌더링 - orderId: ${order.id}`, {
                              refundInfo,
                              shouldShowButton,
                              refundStatus: refundInfo?.status,
                              refundStatuses: refundStatuses[order.id]
                            });
                            
                            return shouldShowButton ? (
                              <button
                                onClick={() => handleViewRefundReceipt(order.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                환불 영수증 보기
                              </button>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {order.totalAmount.toLocaleString()}원
                    </div>
                    {order.pointsUsed && order.pointsUsed > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        포인트 {order.pointsUsed.toLocaleString()}P 사용
                      </div>
                    )}
                  </div>
                </div>

                {/* 주문 상품 */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">주문 상품</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-gray-500 ml-2">× {item.quantity}</span>
                        </div>
                        <div className="font-medium">
                          {item.subtotal.toLocaleString()}원
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="border-t pt-4 mt-4 flex gap-2">
                  <button 
                    onClick={() => navigate(`/customer/orders/${order.id}/tracking`)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                  >
                    주문 추적
                  </button>
                  
                  {/* 환불 요청 버튼 - 완료된 주문만, 환불 상태에 따라 비활성화 */}
                  {order.status === 'completed' && !getRefundStatusInfo(order.id) && (
                    <button 
                      onClick={() => openRefundModal(order)}
                      className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      환불 요청
                    </button>
                  )}
                  
                  {/* 환불 요청 완료된 경우 - 버튼 비활성화 */}
                  {order.status === 'completed' && getRefundStatusInfo(order.id) && (
                    <button 
                      disabled
                      className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      title={`환불 ${getRefundStatusInfo(order.id)?.text}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      {getRefundStatusInfo(order.id)?.text}
                    </button>
                  )}
                  
                  {/* 재주문 가능한 상태: 완료, 취소된 주문 (환불 승인된 주문은 제외) */}
                  {(order.status === 'completed' || order.status === 'cancelled') && 
                   getRefundStatusInfo(order.id)?.status !== 'approved' && (
                    <button 
                      onClick={() => handleReorder(order)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      재주문
                    </button>
                  )}
                  
                  {/* 환불 승인된 주문의 경우 재주문 불가 */}
                  {(order.status === 'completed' || order.status === 'cancelled') && 
                   getRefundStatusInfo(order.id)?.status === 'approved' && (
                    <button 
                      disabled
                      className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      title="환불이 승인된 주문은 재주문할 수 없습니다"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      재주문 불가
                    </button>
                  )}
                  
                  {/* 진행 중인 주문의 경우 재주문 불가 안내 */}
                  {['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status) && (
                    <button 
                      disabled
                      className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      title="진행 중인 주문은 재주문할 수 없습니다"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      재주문 불가
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 환불 요청 모달 */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">환불 요청</h2>
                <button
                  onClick={closeRefundModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 주문 정보 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">주문 정보</h3>
                <div className="text-sm text-gray-600">
                  <div>주문번호: {selectedOrder.orderNumber}</div>
                  <div>매장: {selectedOrder.storeName}</div>
                  <div>주문일시: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* 환불 유형 선택 */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">환불 유형</h3>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="full"
                      checked={refundType === 'full'}
                      onChange={(e) => handleRefundTypeChange(e.target.value as 'full' | 'partial')}
                      className="mr-2"
                    />
                    전체 환불
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="partial"
                      checked={refundType === 'partial'}
                      onChange={(e) => handleRefundTypeChange(e.target.value as 'full' | 'partial')}
                      className="mr-2"
                    />
                    부분 환불
                  </label>
                </div>
              </div>

              {/* 환불할 상품 선택 */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">환불할 상품 선택</h3>
                <div className="space-y-3">
                  {refundItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.quantity > 0}
                            onChange={() => toggleRefundItem(index)}
                            className="mr-2"
                          />
                          <span className="font-medium">{item.product_name}</span>
                        </label>
                        <span className="text-sm text-gray-500">
                          단가: {item.price.toLocaleString()}원
                        </span>
                      </div>
                      
                      {item.quantity > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">환불 수량</label>
                            <input
                              type="number"
                              min="1"
                              max={item.max_quantity}
                              value={item.quantity}
                              onChange={(e) => updateRefundItemQuantity(index, parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">환불 사유</label>
                            <input
                              type="text"
                              value={item.reason}
                              onChange={(e) => updateRefundItemReason(index, e.target.value)}
                              placeholder="상품별 사유 (선택사항)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 환불 사유 */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">환불 사유 *</h3>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">사유를 선택하세요</option>
                  <option value="상품 불량">상품 불량</option>
                  <option value="상품 파손">상품 파손</option>
                  <option value="배송 오류">배송 오류</option>
                  <option value="상품 불일치">상품 불일치</option>
                  <option value="단순 변심">단순 변심</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              {/* 상세 설명 */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">상세 설명 (선택사항)</h3>
                <textarea
                  value={refundDescription}
                  onChange={(e) => setRefundDescription(e.target.value)}
                  placeholder="환불 사유에 대한 자세한 설명을 입력해주세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* 환불 금액 요약 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-3">환불 금액 요약</h3>
                <div className="space-y-2 text-sm">
                  {refundItems.filter((item: RefundItem) => item.quantity > 0).map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.product_name} × {item.quantity}개</span>
                      <span>{(item.price * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium text-lg">
                    <span>총 환불 금액</span>
                    <span className="text-blue-600">{totalRefundAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={closeRefundModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={submitRefundRequest}
                  disabled={isSubmitting || totalRefundAmount === 0 || !refundReason}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '제출 중...' : '환불 요청 제출'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 환불 영수증 모달 */}
      {showRefundReceiptModal && selectedRefundForReceipt && (
        <RefundReceiptModal
          isOpen={showRefundReceiptModal}
          onClose={() => setShowRefundReceiptModal(false)}
          refund={selectedRefundForReceipt}
          order={orders.find(o => o.id === selectedRefundForReceipt.order_id)}
          storeInfo={{ name: '매장명', address: '매장 주소', phone: '전화번호' }}
        />
      )}
    </div>
  );
};

export default CustomerOrders; 