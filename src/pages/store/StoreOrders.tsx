import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrderStore } from '../../stores/orderStore';
import { useAuthStore } from '../../stores/common/authStore';
import { supabase } from '../../lib/supabase/client';
import ReceiptModal from '../../components/store/ReceiptModal';
import RefundReceiptModal from '../../components/store/RefundReceiptModal';
import type { Order } from '../../stores/orderStore';

const StoreOrders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { orders, isLoading, fetchOrders, subscribeToOrders, unsubscribeFromOrders, updateOrderStatus } = useOrderStore();
  const { user } = useAuthStore();
  const [storeInfo, setStoreInfo] = useState<any>(null);

  // 지점 정보 가져오기
  const fetchStoreInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('name, address, phone')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        console.error('지점 정보 조회 실패:', error);
        return;
      }

      setStoreInfo(data);
    } catch (error) {
      console.error('지점 정보 조회 중 오류:', error);
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 주문 목록 조회 및 실시간 구독
    fetchOrders();
    subscribeToOrders();
    fetchStoreInfo();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribeFromOrders();
    };
  }, [fetchOrders, subscribeToOrders, unsubscribeFromOrders, user]);

  // 환불 요청 관련 상태
  const [refunds, setRefunds] = useState<any[]>([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [showRefundProcessModal, setShowRefundProcessModal] = useState(false);
  const [showRefundReceiptModal, setShowRefundReceiptModal] = useState(false);
  
  // 환불 처리 모달 상태
  const [selectedRefundStatus, setSelectedRefundStatus] = useState<string>('');
  const [refundProcessNotes, setRefundProcessNotes] = useState('');

  // URL 파라미터에서 탭 정보 읽기
  const tabParam = searchParams.get('tab') as 'all' | 'pending' | 'processing' | 'completed' | 'refunds' | null;
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'processing' | 'completed' | 'refunds'>(
    tabParam && ['all', 'pending', 'processing', 'completed', 'refunds'].includes(tabParam) ? tabParam : 'pending'
  );
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // URL 파라미터 변경 시 탭 업데이트
  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'all' | 'pending' | 'processing' | 'completed' | 'refunds' | null;
    if (tabParam && ['all', 'pending', 'processing', 'completed', 'refunds'].includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [searchParams]);

  // 탭 변경 시 환불 요청 조회
  useEffect(() => {
    if (selectedTab === 'refunds') {
      fetchRefunds();
    }
  }, [selectedTab]);

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
      case 'refunds':
        // 환불 요청은 별도로 처리 (주문과는 다른 데이터)
        filtered = [];
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

  // getTabCount 함수는 refunds 상태 정의 이후로 이동

  // 환불 요청 조회
  const fetchRefunds = async () => {
    if (!user?.id) return;
    
    try {
      setRefundsLoading(true);
      
      // 점주의 store_id 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (storeError || !storeData) {
        console.error('점주의 store_id 조회 실패:', storeError);
        return;
      }

      const storeId = storeData.id;
      console.log('점주 store_id:', storeId);

      // 환불 요청 조회
      const { data, error } = await supabase
        .from('refund_requests' as any)
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('환불 요청 조회 실패:', error);
    } finally {
      setRefundsLoading(false);
    }
  };

  // 환불 승인 시 상품 재고 복귀
  const restoreProductInventory = async (refundRequestId: string) => {
    try {
      console.log('🔄 상품 재고 복귀 시작:', refundRequestId);
      
      // 1. 환불 요청에서 상품 정보 조회
      const { data: refundData, error: refundError } = await supabase
        .from('refund_requests' as any)
        .select('*')
        .eq('id', refundRequestId)
        .single();

      if (refundError || !refundData) {
        console.error('환불 요청 데이터 조회 실패:', refundError);
        return;
      }

      // 2. order_items 테이블에서 상품 정보 조회 (orders.items 컬럼 대신)
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items' as any)
        .select('*')
        .eq('order_id', (refundData as any).order_id);

      if (orderItemsError || !orderItems) {
        console.error('주문 상품 데이터 조회 실패:', orderItemsError);
        return;
      }

      console.log('📦 복귀할 상품들:', orderItems);

      // 3. 각 상품의 재고 복귀 (store_products 테이블 사용)
      for (const item of orderItems as any[]) {
        // 현재 재고 조회 (store_products 테이블)
        const { data: currentInventory, error: fetchError } = await supabase
          .from('store_products' as any)
          .select('stock_quantity')
          .eq('product_id', item.product_id)
          .eq('store_id', (refundData as any).store_id)
          .single();

        if (fetchError) {
          console.error(`상품 ${item.product_id} 현재 재고 조회 실패:`, fetchError);
          continue;
        }

        // 새로운 수량 계산
        const newQuantity = ((currentInventory as any)?.stock_quantity || 0) + item.quantity;

        // 재고 업데이트 (store_products 테이블)
        const { error: updateError } = await supabase
          .from('store_products' as any)
          .update({ 
            stock_quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('product_id', item.product_id)
          .eq('store_id', (refundData as any).store_id);

        if (updateError) {
          console.error(`상품 ${item.product_id} 재고 복귀 실패:`, updateError);
        } else {
          console.log(`✅ 상품 ${item.product_id} 재고 ${item.quantity}개 복귀 완료 (${(currentInventory as any)?.stock_quantity || 0} → ${newQuantity})`);
        }
      }

      console.log('🎉 모든 상품 재고 복귀 완료');
    } catch (error) {
      console.error('상품 재고 복귀 실패:', error);
    }
  };

  // 쿠폰과 포인트 회수 함수
  const restoreCouponsAndPoints = async (refundRequestId: string) => {
    try {
      console.log('🔄 쿠폰 및 포인트 회수 시작...');

      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('사용자 인증 정보를 찾을 수 없습니다.');
        return;
      }

      // 데이터베이스 함수 호출
      const { data, error } = await supabase.rpc('restore_coupons_and_points' as any, {
        p_refund_request_id: refundRequestId,
        p_processed_by: user.id
      });

      if (error) {
        console.error('쿠폰 및 포인트 회수 함수 호출 실패:', error);
        return;
      }

      if (data && (data as any).success) {
        console.log('🎉 쿠폰 및 포인트 회수 완료:', data);
        console.log(`✅ 쿠폰 ${(data as any).coupons_restored}개 회수 완료`);
        console.log(`✅ 포인트 ${(data as any).points_restored}점 회수 완료`);
      } else {
        console.error('쿠폰 및 포인트 회수 실패:', (data as any)?.error);
      }
    } catch (error) {
      console.error('쿠폰 및 포인트 회수 실패:', error);
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
      case 'refunds':
        return refunds.length;
      default:
        return orders.length;
    }
  };

  const handleViewReceipt = (order: Order) => {
    setSelectedOrderForReceipt(order);
    setReceiptModalOpen(true);
  };

  // 환불 요청 처리 모달 열기
  const handleProcessRefund = (refund: any) => {
    setSelectedRefund(refund);
    setSelectedRefundStatus('');
    setRefundProcessNotes('');
    setShowRefundProcessModal(true);
  };

  // 환불 영수증 모달 열기
  const handleViewRefundReceipt = (refund: any) => {
    setSelectedRefund(refund);
    setShowRefundReceiptModal(true);
  };

  // 구매 영수증 보기 함수 (환불 요청의 원주문)
  const handleViewOrderReceipt = async (refund: any) => {
    try {
      // 환불 요청의 원주문 정보 조회 (주문 상품 정보 포함)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            discount_amount,
            subtotal,
            options
          )
        `)
        .eq('id', refund.order_id)
        .single();

      if (orderError) {
        console.error('주문 정보 조회 실패:', orderError);
        alert('주문 정보를 불러올 수 없습니다.');
        return;
      }

      // 데이터베이스 구조 확인을 위한 로그
      console.log('원주문 데이터:', orderData);
      console.log('포인트 사용:', orderData.points_used);
      console.log('쿠폰 할인:', orderData.coupon_discount_amount);
      console.log('쿠폰 할인 타입:', typeof orderData.coupon_discount_amount);
      console.log('세금:', orderData.tax_amount);
      console.log('orders 테이블의 모든 필드:', Object.keys(orderData));
      
              // 주문 데이터를 Receipt 컴포넌트가 기대하는 형식으로 변환 (소수점 단위 금액을 반올림으로 처리)
        const formattedOrder = {
          ...orderData,
          items: orderData.order_items?.map((item: any) => ({
            ...item,
            productName: item.product_name,
            price: Math.round(Number(item.unit_price) || 0),
            discountRate: item.discount_amount > 0 ? (item.discount_amount / item.subtotal) : 0,
            subtotal: Math.round(Number(item.subtotal) || 0)
          })) || [],
          orderNumber: orderData.order_number || orderData.id,
          createdAt: orderData.created_at,
          completedAt: orderData.completed_at,
          orderType: orderData.type || 'pickup',
          paymentMethod: orderData.payment_method || 'card',
          deliveryAddress: orderData.delivery_address,
          deliveryFee: Math.round(Number(orderData.delivery_fee) || 0),
          pointsUsed: Math.round(Number(orderData.points_used) || 0),
          couponDiscountAmount: Math.round(Number(orderData.coupon_discount_amount) || 0),
          appliedCouponId: orderData.applied_coupon_id,
          taxAmount: Math.round(Number(orderData.tax_amount) || 0),
          totalAmount: Math.round(Number(orderData.total_amount) || 0),
          status: orderData.status
        };

      console.log('변환된 주문 데이터:', formattedOrder);
      console.log('포인트 사용 (변환 후):', formattedOrder.pointsUsed);
      console.log('쿠폰 할인 (변환 후):', formattedOrder.couponDiscountAmount);
      console.log('세금 (변환 후):', formattedOrder.taxAmount);
      setSelectedOrderForReceipt(formattedOrder as any);
      setReceiptModalOpen(true);
    } catch (error) {
      console.error('구매 영수증 조회 실패:', error);
      alert('구매 영수증을 불러올 수 없습니다.');
    }
  };

  // 환불 상태 업데이트
  const handleRefundStatusUpdate = async () => {
    if (!selectedRefund || !user?.id || !selectedRefundStatus) return;

    try {
      const notes = refundProcessNotes || '사유 없음';

      // 환불 요청 상태 업데이트
      const { error } = await supabase
        .from('refund_requests' as any)
        .update({
          status: selectedRefundStatus,
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          admin_notes: notes
        })
        .eq('id', selectedRefund.id);

      if (error) throw error;

      // 환불 이력 추가
      await supabase
        .from('refund_history' as any)
        .insert([{
          refund_request_id: selectedRefund.id,
          new_status: selectedRefundStatus,
          notes: notes,
          processed_by: user.id,
          action_type: 'status_change',
          metadata: { previous_status: selectedRefund.status }
        }]);

        // 환불 승인 시 상품 재고 복귀 및 쿠폰/포인트 회수
  if (selectedRefundStatus === 'approved') {
    await restoreProductInventory(selectedRefund.id);
    await restoreCouponsAndPoints(selectedRefund.id);
    alert(`환불 요청이 승인되었습니다.\n\n✅ 상품이 재고에 복귀되었습니다.\n✅ 쿠폰과 포인트가 회수되었습니다.`);
  } else {
    alert(`환불 요청이 ${selectedRefundStatus === 'rejected' ? '거절' : '검토중'}되었습니다.`);
  }

      setShowRefundProcessModal(false);
      fetchRefunds(); // 목록 새로고침
    } catch (error) {
      console.error('환불 상태 업데이트 실패:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setSelectedOrderForReceipt(null);
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
              { key: 'refunds', label: '환불 요청', count: getTabCount('refunds') },
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

        {/* 주문 목록 또는 환불 요청 목록 */}
        <div className="p-6">
          {selectedTab === 'refunds' ? (
            // 환불 요청 목록
            refundsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">환불 요청을 불러오는 중...</p>
              </div>
            ) : refunds.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg">환불 요청이 없습니다</p>
                <p className="text-gray-400 text-sm mt-2">고객이 환불을 요청하면 여기에 표시됩니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {refunds.map((refund) => (
                  <div key={refund.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            환불 요청 #{refund.id.slice(0, 8)}...
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                            refund.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {refund.status === 'pending' ? '검토 대기중' :
                             refund.status === 'approved' ? '승인됨' :
                             refund.status === 'rejected' ? '거절됨' : refund.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>요청일: {new Date(refund.created_at).toLocaleString('ko-KR')}</div>
                          <div>요청 금액: {refund.requested_refund_amount?.toLocaleString()}원</div>
                          <div>사유: {refund.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-2">
                          {refund.status === 'pending' && (
                            <button
                              onClick={() => handleProcessRefund(refund)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              처리하기
                            </button>
                          )}
                          {(refund.status === 'approved' || refund.status === 'rejected') && (
                            <button
                              onClick={() => handleViewRefundReceipt(refund)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              영수증 보기
                            </button>
                          )}
                          {/* 모든 환불 요청에 구매 영수증 보기 버튼 추가 */}
                          <button
                            onClick={() => handleViewOrderReceipt(refund)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            구매 영수증
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredOrders.length === 0 ? (
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
                        {/* 처리 중인 주문과 완료/취소된 주문에 영수증 보기 버튼 추가 */}
                        {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready' || order.status === 'completed' || order.status === 'cancelled') && (
                          <button
                            onClick={() => handleViewReceipt(order)}
                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            영수증 보기
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

      {/* 영수증 모달 */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={closeReceiptModal}
        order={selectedOrderForReceipt}
        storeName={storeInfo?.name}
        storeAddress={storeInfo?.address}
        storePhone={storeInfo?.phone}
      />

      {/* 환불 요청 처리 모달 */}
      {showRefundProcessModal && selectedRefund && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">환불 요청 처리</h3>
                <button
                  onClick={() => setShowRefundProcessModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">처리 결과</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedRefundStatus('approved')}
                      className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                        selectedRefundStatus === 'approved'
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-green-50 hover:border-green-300'
                      }`}
                    >
                      승인
                    </button>
                    <button
                      onClick={() => setSelectedRefundStatus('rejected')}
                      className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                        selectedRefundStatus === 'rejected'
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:border-red-300'
                      }`}
                    >
                      거절
                    </button>
                    <button
                      onClick={() => setSelectedRefundStatus('pending')}
                      className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                        selectedRefundStatus === 'pending'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      검토중
                    </button>
                  </div>
                  
                  {/* 선택된 상태 표시 */}
                  {selectedRefundStatus && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm text-blue-800">
                        <span className="font-medium">선택된 처리 결과:</span> {
                          selectedRefundStatus === 'approved' ? '승인' :
                          selectedRefundStatus === 'rejected' ? '거절' :
                          '검토중'
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">사유 (선택사항)</label>
                  <textarea
                    rows={3}
                    value={refundProcessNotes}
                    onChange={(e) => setRefundProcessNotes(e.target.value)}
                    placeholder="처리 결과에 대한 사유를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRefundProcessModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                
                {/* 최종 확인 버튼 */}
                <button
                  onClick={handleRefundStatusUpdate}
                  disabled={!selectedRefundStatus}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedRefundStatus
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!selectedRefundStatus ? '처리 결과를 선택해주세요' : '환불 요청을 처리합니다'}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 환불 영수증 모달 */}
      {showRefundReceiptModal && selectedRefund && (
        <RefundReceiptModal
          isOpen={showRefundReceiptModal}
          onClose={() => setShowRefundReceiptModal(false)}
          refund={selectedRefund}
          order={orders.find(o => o.id === selectedRefund.order_id)}
          storeInfo={storeInfo}
        />
      )}
    </div>
  );
};

export default StoreOrders; 