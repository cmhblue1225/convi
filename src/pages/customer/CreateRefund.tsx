import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/common/authStore';
import { supabase } from '../../lib/supabase/client';
import { RefundRequestForm, Order, Product } from '../../types/common';

const CreateRefund: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderProducts, setOrderProducts] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<RefundRequestForm>({
    defaultValues: {
      order_id: '',
      request_type: 'refund',
      reason: '',
      description: '',
      refund_items: [],
      requested_refund_amount: 0,
      customer_phone: ''
    },
    mode: 'onChange'
  });

  const watchedOrderId = watch('order_id');
  const watchedRefundItems = watch('refund_items');

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    if (watchedOrderId) {
      fetchOrderDetails(watchedOrderId);
    }
  }, [watchedOrderId]);

  useEffect(() => {
    // 환불 금액 자동 계산
    const totalAmount = watchedRefundItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setValue('requested_refund_amount', totalAmount);
  }, [watchedRefundItems, setValue]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items!inner(
            *,
            products!inner(name, price, image_url)
          )
        `)
        .eq('customer_id', user?.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('주문 조회 실패:', error);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products!inner(name, price, image_url, description)
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderProducts(data || []);
      
      // 선택된 주문 정보 저장
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order || null);
    } catch (error) {
      console.error('주문 상세 조회 실패:', error);
    }
  };

  const handleAddRefundItem = (product: any) => {
    const existingItem = watchedRefundItems.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      // 이미 추가된 상품이면 수량 증가
      const updatedItems = watchedRefundItems.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) }
          : item
      );
      setValue('refund_items', updatedItems);
    } else {
      // 새로운 상품 추가
      const newItem = {
        product_id: product.product_id,
        product_name: product.products.name,
        quantity: 1,
        price: product.products.price,
        reason: ''
      };
      setValue('refund_items', [...watchedRefundItems, newItem]);
    }
  };

  const handleRemoveRefundItem = (productId: string) => {
    const updatedItems = watchedRefundItems.filter(item => item.product_id !== productId);
    setValue('refund_items', updatedItems);
  };

  const handleUpdateRefundItem = (productId: string, field: string, value: any) => {
    const updatedItems = watchedRefundItems.map(item =>
      item.product_id === productId ? { ...item, [field]: value } : item
    );
    setValue('refund_items', updatedItems);
  };

  const onSubmit = async (data: RefundRequestForm) => {
    if (!user?.id || !selectedOrder) return;

    try {
      setLoading(true);
      
      const refundData = {
        order_id: data.order_id,
        customer_id: user.id,
        store_id: selectedOrder.storeId, // storeId 필드 사용 (올바른 필드명)
        request_type: data.request_type,
        reason: data.reason,
        description: data.description,
        refund_items: data.refund_items,
        requested_refund_amount: data.requested_refund_amount,
        customer_phone: data.customer_phone || user.phone,
        status: 'pending',
        priority: 'normal',
        refund_method: 'payment_refund',
        is_urgent: false,
        estimated_processing_time: 24
      };

      // Supabase RPC 함수 호출로 환불 요청 생성
      const { data: refundResult, error } = await supabase.rpc('create_refund_request', {
        p_order_id: data.order_id,
        p_customer_id: user.id,
        p_store_id: selectedOrder.storeId, // storeId 필드 사용
        p_request_type: data.request_type,
        p_reason: data.reason,
        p_refund_items: data.refund_items,
        p_requested_refund_amount: data.requested_refund_amount,
        p_description: data.description,
        p_customer_phone: data.customer_phone || '',
        p_priority: 'normal',
        p_refund_method: 'payment_refund',
        p_is_urgent: false,
        p_estimated_processing_time: 24
      });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/customer/refunds');
      }, 2000);
    } catch (error) {
      console.error('환불 요청 생성 실패:', error);
      alert('환불 요청 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">환불 요청이 성공적으로 제출되었습니다!</h2>
          <p className="text-gray-600">처리 상황을 실시간으로 확인할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/customer/refunds')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              뒤로가기
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">환불 요청하기</h1>
              <p className="mt-2 text-gray-600">환불이 필요한 주문을 선택하고 상세 정보를 입력하세요</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 주문 선택 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">1. 환불할 주문 선택</h3>
            
            <Controller
              name="order_id"
              control={control}
              rules={{ required: '주문을 선택해주세요' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주문 선택
                  </label>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">주문을 선택하세요</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        주문번호: {order.order_number} - {new Date(order.created_at).toLocaleDateString('ko-KR')} - {order.total_amount.toLocaleString()}원
                      </option>
                    ))}
                  </select>
                  {errors.order_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.order_id.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* 환불 상품 선택 */}
          {selectedOrder && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">2. 환불할 상품 선택</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {orderProducts.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      watchedRefundItems.some(refundItem => refundItem.product_id === item.product_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAddRefundItem(item)}
                  >
                    {item.products.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-full h-24 object-cover rounded-md mb-2"
                      />
                    )}
                    <h4 className="font-medium text-gray-900 text-sm">{item.products.name}</h4>
                    <p className="text-sm text-gray-500">
                      {item.products.price.toLocaleString()}원 × {item.quantity}개
                    </p>
                    <p className="text-sm text-gray-500">
                      총 {(item.products.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>

              {/* 선택된 환불 상품들 */}
              {watchedRefundItems.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">선택된 환불 상품</h4>
                  {watchedRefundItems.map((item, index) => (
                    <div key={item.product_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                        <button
                          type="button"
                          onClick={() => handleRemoveRefundItem(item.product_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            환불 수량
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={orderProducts.find(p => p.product_id === item.product_id)?.quantity || 1}
                            value={item.quantity}
                            onChange={(e) => handleUpdateRefundItem(item.product_id, 'quantity', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            환불 사유
                          </label>
                          <input
                            type="text"
                            value={item.reason}
                            onChange={(e) => handleUpdateRefundItem(item.product_id, 'reason', e.target.value)}
                            placeholder="환불 사유를 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 환불 정보 입력 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">3. 환불 정보 입력</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Controller
                  name="request_type"
                  control={control}
                  rules={{ required: '환불 유형을 선택해주세요' }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        환불 유형
                      </label>
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="refund">전액 환불</option>
                        <option value="partial_refund">부분 환불</option>
                        <option value="exchange">교환</option>
                        <option value="store_credit">상점 크레딧</option>
                      </select>
                      {errors.request_type && (
                        <p className="mt-1 text-sm text-red-600">{errors.request_type.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="customer_phone"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처 (선택사항)
                      </label>
                      <input
                        {...field}
                        type="tel"
                        placeholder="010-0000-0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="mt-6">
              <Controller
                name="reason"
                control={control}
                rules={{ required: '환불 사유를 입력해주세요' }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      환불 사유 *
                    </label>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">사유를 선택하세요</option>
                      <option value="상품 불량">상품 불량</option>
                      <option value="상품 파손">상품 파손</option>
                      <option value="배송 오류">배송 오류</option>
                      <option value="상품 불일치">상품 불일치</option>
                      <option value="단순 변심">단순 변심</option>
                      <option value="기타">기타</option>
                    </select>
                    {errors.reason && (
                      <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="mt-6">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상세 설명 (선택사항)
                    </label>
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="환불 사유에 대한 자세한 설명을 입력해주세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              />
            </div>

            {/* 환불 금액 요약 */}
            {watchedRefundItems.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">환불 금액 요약</h4>
                <div className="space-y-2">
                  {watchedRefundItems.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span>{item.product_name} × {item.quantity}개</span>
                      <span>{(item.price * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>총 환불 금액</span>
                    <span>{watchedRefundItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/customer/refunds')}
              className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isValid || loading || watchedRefundItems.length === 0}
              className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '제출 중...' : '환불 요청 제출'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRefund;
