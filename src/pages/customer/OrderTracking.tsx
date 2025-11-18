import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrderStore } from '../../stores/orderStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const OrderTracking: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, fetchOrders, subscribeToOrders, unsubscribeFromOrders, getOrderById } = useOrderStore();
  
  const [order, setOrder] = useState(getOrderById(orderId || ''));

  useEffect(() => {
    // 컴포넌트 마운트 시 주문 목록 조회 및 실시간 구독
    fetchOrders();
    subscribeToOrders();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribeFromOrders();
    };
  }, [fetchOrders, subscribeToOrders, unsubscribeFromOrders]);

  useEffect(() => {
    if (!orderId) {
      navigate('/customer/orders');
      return;
    }

    const foundOrder = getOrderById(orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    } else if (orders.length > 0) {
      // 주문 목록이 로드되었지만 해당 주문을 찾을 수 없음
      alert('주문을 찾을 수 없습니다.');
      navigate('/customer/orders');
    }
    // orders.length === 0인 경우는 아직 로딩 중이므로 기다림
  }, [orderId, orders, getOrderById, navigate]);

  // 주문 상태는 점주가 관리하므로 고객은 조회만 가능

  const getStatusInfo = (status: typeof order.status) => {
    switch (status) {
      case 'pending':
        return {
          text: '주문 접수',
          description: '주문이 접수되었습니다.',
          color: 'text-yellow-600 bg-yellow-50',
          icon: '📝'
        };
      case 'confirmed':
        return {
          text: '주문 확인',
          description: '매장에서 주문을 확인했습니다.',
          color: 'text-blue-600 bg-blue-50',
          icon: '✅'
        };
      case 'preparing':
        return {
          text: '준비 중',
          description: order?.orderType === 'pickup' ? '상품을 준비하고 있습니다.' : '배송을 준비하고 있습니다.',
          color: 'text-orange-600 bg-orange-50',
          icon: '👨‍🍳'
        };
      case 'ready':
        return {
          text: order?.orderType === 'pickup' ? '픽업 대기' : '배송 중',
          description: order?.orderType === 'pickup' ? '매장에서 픽업 가능합니다.' : '상품이 배송 중입니다.',
          color: 'text-purple-600 bg-purple-50',
          icon: order?.orderType === 'pickup' ? '🏪' : '🚚'
        };
      case 'completed':
        return {
          text: '완료',
          description: order?.orderType === 'pickup' ? '픽업이 완료되었습니다.' : '배송이 완료되었습니다.',
          color: 'text-green-600 bg-green-50',
          icon: '🎉'
        };
      case 'cancelled':
        return {
          text: '취소',
          description: '주문이 취소되었습니다.',
          color: 'text-red-600 bg-red-50',
          icon: '❌'
        };
      default:
        return {
          text: status,
          description: '',
          color: 'text-gray-600 bg-gray-50',
          icon: '❓'
        };
    }
  };

  const getProgressSteps = () => {
    const baseSteps = [
      { key: 'pending', label: '주문 접수' },
      { key: 'confirmed', label: '주문 확인' },
      { key: 'preparing', label: '준비 중' }
    ];

    if (order?.orderType === 'pickup') {
      baseSteps.push(
        { key: 'ready', label: '픽업 대기' },
        { key: 'completed', label: '픽업 완료' }
      );
    } else {
      baseSteps.push(
        { key: 'ready', label: '배송 중' },
        { key: 'completed', label: '배송 완료' }
      );
    }

    return baseSteps;
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const steps = getProgressSteps();
    return steps.findIndex(step => step.key === order.status);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const progressSteps = getProgressSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">주문 추적</h1>
              <p className="text-gray-600 mt-1">주문번호: {order.orderNumber}</p>
            </div>
            <button
              onClick={() => navigate('/customer/orders')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 현재 상태 */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${statusInfo.color}`}>
            <span className="text-2xl mr-2">{statusInfo.icon}</span>
            <div>
              <div className="font-semibold">{statusInfo.text}</div>
              <div className="text-sm">{statusInfo.description}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 진행 상황 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-6">주문 진행 상황</h2>
              
              {/* 진행 단계 */}
              <div className="space-y-4">
                {progressSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? isCurrent 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted && !isCurrent ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.label}
                        </div>
                        {isCurrent && (
                          <div className="text-sm text-blue-600 mt-1">
                            {statusInfo.description}
                          </div>
                        )}
                      </div>
                      
                      {isCurrent && (
                        <div className="ml-4 text-sm text-blue-600 font-medium">
                          진행 중
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 배송 정보 (배송 주문인 경우) */}
            {order.orderType === 'delivery' && order.deliveryAddress && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">배송 정보</h2>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">받는 분:</span> {order.deliveryAddress.name}</div>
                  <div><span className="font-medium">연락처:</span> {order.deliveryAddress.phone}</div>
                  <div><span className="font-medium">주소:</span> {order.deliveryAddress.address}</div>
                  {order.deliveryAddress.detailAddress && (
                    <div><span className="font-medium">상세 주소:</span> {order.deliveryAddress.detailAddress}</div>
                  )}
                  {order.deliveryAddress.memo && (
                    <div><span className="font-medium">배송 메모:</span> {order.deliveryAddress.memo}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 주문 정보 */}
          <div className="space-y-6">
            {/* 주문 상품 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.productName}</div>
                      <div className="text-xs text-gray-500">
                        {item.price.toLocaleString()}원 × {item.quantity}개
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {item.subtotal.toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">결제 정보</h2>
              <div className="space-y-3 text-sm">
                {/* 주문 금액 계산 */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide">주문 금액</h3>
                  <div className="flex justify-between">
                    <span>상품 금액</span>
                    <span>{order.subtotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>부가세</span>
                    <span>{order.taxAmount.toLocaleString()}원</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>배송비</span>
                      <span>{order.deliveryFee.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                    <span>소계</span>
                    <span>{(order.subtotal + order.taxAmount + (order.deliveryFee || 0)).toLocaleString()}원</span>
                  </div>
                </div>

                {/* 할인 및 혜택 적용 */}
                {(order.couponDiscount > 0 || order.pointsUsed > 0) && (
                  <div className="bg-green-50 rounded-lg p-3 space-y-2">
                    <h3 className="text-xs font-medium text-green-700 uppercase tracking-wide">할인 혜택</h3>
                    {order.couponDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-green-600">🎫</span>
                          <span className="ml-1">쿠폰 할인</span>
                        </div>
                        <span className="text-green-600 font-medium">-{order.couponDiscount.toLocaleString()}원</span>
                      </div>
                    )}
                    {order.pointsUsed > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-green-600">⭐</span>
                          <span className="ml-1">포인트 사용</span>
                        </div>
                        <span className="text-green-600 font-medium">-{order.pointsUsed.toLocaleString()}P</span>
                      </div>
                    )}
                    <div className="border-t border-green-200 pt-2 flex justify-between font-medium text-green-700">
                      <span>총 할인 금액</span>
                      <span>-{((order.couponDiscount || 0) + (order.pointsUsed || 0)).toLocaleString()}원</span>
                    </div>
                  </div>
                )}

                {/* 실제 결제 금액 */}
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <h3 className="text-xs font-medium text-blue-700 uppercase tracking-wide">실제 결제</h3>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">최종 결제 금액</span>
                    <span className="text-blue-600 font-bold text-lg">{order.totalAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>결제 방법</span>
                    <span className="flex items-center">
                      {/* 디버깅을 위한 로그 */}
                      {(() => {
                        console.log('🔍 결제 방법 확인:', {
                          paymentMethod: order.paymentMethod,
                          type: typeof order.paymentMethod,
                          originalOrder: order
                        });
                        return null;
                      })()}
                      
                      {/* 실제 데이터베이스에 저장된 매핑 값들 기준으로 수정 */}
                      {order.paymentMethod === 'card' && (
                        <>
                          <span className="mr-1">💳</span>
                          <span>카드 결제</span>
                        </>
                      )}
                      {order.paymentMethod === 'cash' && (
                        <>
                          <span className="mr-1">💵</span>
                          <span>현금</span>
                        </>
                      )}
                      {order.paymentMethod === 'toss_pay' && (
                        <>
                          <span className="mr-1">💰</span>
                          <span>토스페이먼츠</span>
                        </>
                      )}
                      {order.paymentMethod === 'kakao_pay' && (
                        <>
                          <span className="mr-1">💛</span>
                          <span>카카오페이</span>
                        </>
                      )}
                      {order.paymentMethod === 'naver_pay' && (
                        <>
                          <span className="mr-1">💚</span>
                          <span>네이버페이</span>
                        </>
                      )}
                      
                      {/* 알 수 없는 결제 방법이거나 값이 없는 경우 */}
                      {!order.paymentMethod && (
                        <span className="text-gray-500">결제 방법 미확인</span>
                      )}
                      
                      {/* 매핑되지 않은 결제 방법이 있는 경우 원본 값 표시 */}
                      {order.paymentMethod && 
                       !['card', 'cash', 'toss_pay', 'kakao_pay', 'naver_pay'].includes(order.paymentMethod) && (
                        <>
                          <span className="mr-1">💳</span>
                          <span>{order.paymentMethod}</span>
                        </>
                      )}
                    </span>
                  </div>
                  {order.paymentStatus && (
                    <div className="flex justify-between text-sm">
                      <span>결제 상태</span>
                      <span className={`font-medium ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 
                        order.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {order.paymentStatus === 'paid' && '✅ 결제 완료'}
                        {order.paymentStatus === 'pending' && '⏳ 결제 대기'}
                        {order.paymentStatus === 'failed' && '❌ 결제 실패'}
                        {order.paymentStatus === 'refunded' && '🔄 환불 완료'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 결제 요약 */}
                <div className="border-t border-gray-200 pt-3 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>주문 총액</span>
                    <span>{(order.subtotal + order.taxAmount + (order.deliveryFee || 0)).toLocaleString()}원</span>
                  </div>
                  {(order.couponDiscount > 0 || order.pointsUsed > 0) && (
                    <div className="flex justify-between text-green-600">
                      <span>혜택 할인</span>
                      <span>-{((order.couponDiscount || 0) + (order.pointsUsed || 0)).toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-sm text-gray-900 pt-1 border-t border-gray-100">
                    <span>실제 지불</span>
                    <span>{order.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 매장 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">매장 정보</h2>
              <div className="text-sm">
                <div className="font-medium">{order.storeName}</div>
                <div className="text-gray-600 mt-1">
                  {order.orderType === 'pickup' ? '매장 픽업' : '배송 주문'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;