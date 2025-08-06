import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../../stores/orderStore';

const StoreOrders: React.FC = () => {
  const { orders, isLoading, fetchOrders, subscribeToOrders, unsubscribeFromOrders, updateOrderStatus } = useOrderStore();

  useEffect(() => {
    // 컴포넌트 마운트 시 주문 목록 조회 및 실시간 구독
    fetchOrders();
    subscribeToOrders();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribeFromOrders();
    };
  }, [fetchOrders, subscribeToOrders, unsubscribeFromOrders]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('pending');
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    let filtered = orders;
    
    switch (selectedTab) {
      case 'pending':
        filtered = orders.filter(order => order.status === 'pending');
        break;
      case 'processing':
        filtered = orders.filter(order => ['confirmed', 'preparing', 'ready'].includes(order.status));
        break;
      case 'completed':
        filtered = orders.filter(order => ['completed', 'cancelled'].includes(order.status));
        break;
      default:
        filtered = orders;
    }
    
    // 최신 주문부터 표시
    setFilteredOrders(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [orders, selectedTab]);

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { text: '주문 접수', color: 'bg-yellow-100 text-yellow-800', nextAction: '주문 확인' },
      confirmed: { text: '주문 확인', color: 'bg-blue-100 text-blue-800', nextAction: '준비 시작' },
      preparing: { text: '준비 중', color: 'bg-orange-100 text-orange-800', nextAction: '준비 완료' },
      ready: { text: '픽업 대기', color: 'bg-purple-100 text-purple-800', nextAction: '완료 처리' },
      completed: { text: '완료', color: 'bg-green-100 text-green-800', nextAction: null },
      cancelled: { text: '취소', color: 'bg-red-100 text-red-800', nextAction: null }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getNextStatus = (currentStatus: string): string => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'completed'
    };
    
    return statusFlow[currentStatus as keyof typeof statusFlow] || currentStatus;
  };

  const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus === currentStatus) return;

    setIsUpdating(orderId);
    
    try {
      // Supabase에 상태 업데이트 (실시간 연동)
      await updateOrderStatus(orderId, nextStatus as any);
      console.log('✅ 주문 상태가 업데이트되었습니다');
    } catch (error) {
      console.error('❌ 주문 상태 업데이트 실패:', error);
      alert('주문 상태 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('정말로 이 주문을 취소하시겠습니까?')) {
      try {
        await updateOrderStatus(orderId, 'cancelled');
        console.log('✅ 주문이 취소되었습니다');
      } catch (error) {
        console.error('❌ 주문 취소 실패:', error);
        alert('주문 취소에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pending':
        return orders.filter(order => order.status === 'pending').length;
      case 'processing':
        return orders.filter(order => ['confirmed', 'preparing', 'ready'].includes(order.status)).length;
      case 'completed':
        return orders.filter(order => ['completed', 'cancelled'].includes(order.status)).length;
      default:
        return orders.length;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
          <p className="text-gray-600 mt-1">실시간 주문 현황 및 관리</p>
        </div>
        <div className="text-sm text-gray-500">
          총 {orders.length}개 주문
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'pending', label: '신규 주문', count: getTabCount('pending') },
              { key: 'processing', label: '처리 중', count: getTabCount('processing') },
              { key: 'completed', label: '완료/취소', count: getTabCount('completed') },
              { key: 'all', label: '전체', count: getTabCount('all') }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    selectedTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* 주문 목록 */}
        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg">
                {selectedTab === 'pending' && '신규 주문이 없습니다'}
                {selectedTab === 'processing' && '처리 중인 주문이 없습니다'}
                {selectedTab === 'completed' && '완료된 주문이 없습니다'}
                {selectedTab === 'all' && '주문이 없습니다'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                고객이 주문을 하면 여기에 표시됩니다
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const isProcessing = isUpdating === order.id;
                
                return (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                    {/* 주문 헤더 */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                          {order.orderType === 'delivery' && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              배송
                            </span>
                          )}
                          {order.orderType === 'pickup' && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                              픽업
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>주문시간: {new Date(order.createdAt).toLocaleString('ko-KR')}</div>
                          {order.deliveryAddress && (
                            <div className="mt-1">
                              배송지: {order.deliveryAddress.address} {order.deliveryAddress.detailAddress}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {order.totalAmount.toLocaleString()}원
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length}개 상품
                        </div>
                      </div>
                    </div>

                    {/* 주문 상품 */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">주문 상품</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
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
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                          >
                            주문 취소
                          </button>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {statusInfo.nextAction && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, order.status)}
                            disabled={isProcessing}
                            className={`px-4 py-2 rounded-lg font-medium text-sm ${
                              isProcessing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {isProcessing ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                처리 중...
                              </div>
                            ) : (
                              statusInfo.nextAction
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreOrders; 