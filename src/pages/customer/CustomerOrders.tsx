import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../stores/orderStore';
import { useCartStore } from '../../stores/cartStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import ReorderHistory from '../../components/customer/ReorderHistory';

const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading, fetchOrders, subscribeToOrders, unsubscribeFromOrders, clearOrders } = useOrderStore();
  const { reorderFromOrder } = useCartStore();

  console.log('📋 주문 내역 페이지 - 총 주문 수:', orders.length);

  useEffect(() => {
    // 컴포넌트 마운트 시 주문 목록 조회 및 실시간 구독
    fetchOrders();
    subscribeToOrders();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribeFromOrders();
    };
  }, [fetchOrders, subscribeToOrders, unsubscribeFromOrders]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">주문 내역</h1>
              <p className="text-gray-600 mt-1">총 {orders.length}개의 주문</p>
            </div>
            <div className="flex gap-2">
              {orders.length > 0 && (
                <button
                  onClick={async () => {
                    console.log('🗑️ 전체 삭제 버튼 클릭됨');
                    if (window.confirm('모든 주문 내역을 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.')) {
                      console.log('✅ 사용자 확인됨, clearOrders 함수 호출 시작');
                      try {
                        await clearOrders();
                        console.log('✅ clearOrders 함수 완료');
                        alert('모든 주문 내역이 삭제되었습니다.');
                      } catch (error) {
                        console.error('❌ 주문 내역 삭제 실패:', error);
                        alert('주문 내역 삭제에 실패했습니다. 다시 시도해주세요.');
                      }
                    } else {
                      console.log('❌ 사용자가 취소함');
                    }
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? '삭제 중...' : '전체 삭제'}
                </button>
              )}
              <button
                onClick={() => navigate('/customer/store')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                쇼핑 계속하기
              </button>
            </div>
          </div>
        </div>

        {/* 재주문 히스토리 */}
        <ReorderHistory />

        {/* 주문 목록 */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">주문 내역을 불러오는 중...</p>
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
                    </div>
                    <div className="text-gray-600 text-sm">
                      <div>{order.storeName} • {order.orderType === 'pickup' ? '픽업' : '배송'}</div>
                      <div>주문일시: {new Date(order.createdAt).toLocaleString()}</div>
                      {order.completedAt && (
                        <div>완료일시: {new Date(order.completedAt).toLocaleString()}</div>
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
                  {/* 재주문 가능한 상태: 완료, 취소된 주문 */}
                  {(order.status === 'completed' || order.status === 'cancelled') && (
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
    </div>
  );
};

export default CustomerOrders; 