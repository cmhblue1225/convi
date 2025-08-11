import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useCartStore } from '../../stores/cartStore';
import { useOrderStore } from '../../stores/orderStore';
import { supabase } from '../../lib/supabase/client';

interface PaymentSuccessData {
  paymentKey: string;
  orderId: string;
  amount: number;
  method: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false); // 중복 처리 방지
  const { clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  // 고유한 주문번호 생성 함수
  const generateUniqueOrderNumber = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  };

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // 중복 처리 방지 - 상태 플래그 확인
      if (isProcessed) {
        console.log('⚠️ 이미 처리된 결제 (상태 플래그), 중복 처리 방지');
        return;
      }

      // URL 파라미터에서 결제 정보 추출
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      const method = searchParams.get('method') || 'toss';

      // localStorage 기반 중복 처리 방지
      const processedKey = `payment_processed_${orderId}_${paymentKey}`;
      const alreadyProcessed = localStorage.getItem(processedKey);
      
      if (alreadyProcessed) {
        console.log('⚠️ 이미 처리된 결제 (localStorage), 중복 처리 방지');
        setIsLoading(false);
        setTimeout(() => {
          navigate('/customer/orders');
        }, 1000);
        return;
      }

      try {
        setIsProcessed(true); // 처리 시작 플래그 설정
        localStorage.setItem(processedKey, Date.now().toString()); // 처리 완료 표시

        console.log('🔍 URL 파라미터:', { paymentKey, orderId, amount, method });

        if (!orderId || !amount) {
          throw new Error('결제 정보가 올바르지 않습니다.');
        }

        // 금액 검증 (0원 포인트 결제 허용)
        const paymentAmount = parseInt(amount);
        if (isNaN(paymentAmount) || paymentAmount < 0) {
          throw new Error('결제 금액이 올바르지 않습니다.');
        }

        setPaymentData({
          paymentKey: paymentKey || `toss_${Date.now()}`,
          orderId,
          amount: paymentAmount,
          method,
        });

        console.log('✅ 결제 성공 정보:', { paymentKey, orderId, amount: paymentAmount, method });

        // localStorage에서 결제 정보 가져오기
        const checkoutDataStr = localStorage.getItem('checkoutData');
        if (!checkoutDataStr) {
          throw new Error('결제 정보를 찾을 수 없습니다. 다시 시도해주세요.');
        }

        const checkoutData = JSON.parse(checkoutDataStr);
        console.log('🛒 저장된 결제 정보:', checkoutData);

        if (!checkoutData.items || !checkoutData.items.length || !checkoutData.storeId) {
          throw new Error('주문 정보가 올바르지 않습니다. 장바구니가 비어있거나 지점이 선택되지 않았습니다.');
        }

        // 지점 정보 가져오기
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, name')
          .eq('id', checkoutData.storeId)
          .single();

        if (storeError || !storeData) {
          throw new Error('지점 정보를 찾을 수 없습니다.');
        }

        // 고유한 주문번호 생성 (중복 방지)
        const uniqueOrderNumber = generateUniqueOrderNumber();
        console.log('🔢 생성된 주문번호:', uniqueOrderNumber);

        // 주문 데이터 생성
        const orderData = {
          orderNumber: uniqueOrderNumber, // 고유한 주문번호 사용
          storeId: storeData.id,
          storeName: storeData.name,
          orderType: checkoutData.orderType as 'pickup' | 'delivery',
          items: checkoutData.items.map((item: any) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.storeProduct.price,
            discountRate: item.storeProduct.discount_rate || 0,
            subtotal: item.subtotal
          })),
          deliveryAddress: checkoutData.deliveryAddress,
          paymentMethod: method === 'point' ? 'cash' : method as any, // 포인트 결제는 현금으로 매핑
          subtotal: checkoutData.subtotal,
          taxAmount: checkoutData.taxAmount,
          deliveryFee: checkoutData.deliveryFee,
          totalAmount: checkoutData.originalAmount || paymentAmount, // 원래 금액 사용
          // 포인트 정보 추가
          pointsUsed: checkoutData.pointsUsed || 0,
          pointsDiscountAmount: checkoutData.pointsUsed || 0,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          paymentResult: {
            paymentKey: paymentKey || (method === 'point' ? `point_${Date.now()}` : `toss_${Date.now()}`),
            method: method,
            amount: paymentAmount,
            status: 'paid',
            originalOrderId: orderId // 원본 주문번호 보관
          }
        };

        console.log('📦 주문 데이터:', orderData);

        // Supabase에 주문 저장 (재고 조회 실패해도 주문은 생성)
        try {
          const newOrder = await addOrder(orderData);
          console.log('✅ 주문 저장 성공:', newOrder);
        } catch (orderError) {
          console.error('❌ 주문 저장 실패:', orderError);
          
          // 주문번호 중복인 경우 새로운 주문번호로 재시도
          if (orderError && typeof orderError === 'object' && 'code' in orderError && orderError.code === '23505') {
            console.log('🔄 주문번호 중복, 새로운 주문번호로 재시도...');
            const retryOrderData = {
              ...orderData,
              orderNumber: generateUniqueOrderNumber()
            };
            
            try {
              const retryOrder = await addOrder(retryOrderData);
              console.log('✅ 재시도 주문 저장 성공:', retryOrder);
            } catch (retryError) {
              console.error('❌ 재시도 주문 저장도 실패:', retryError);
              // 재시도 실패해도 결제는 성공으로 처리
            }
          } else {
            // 주문 저장 실패해도 결제는 성공으로 처리 (나중에 수동으로 주문 생성 가능)
          }
        }

        // 결제 성공 시 장바구니 비우기 및 localStorage 정리
        clearCart();
        localStorage.removeItem('checkoutData');
        console.log('🛒 장바구니 비우기 및 결제 정보 정리 완료');

        // 3초 후 주문 완료 페이지로 이동
        setTimeout(() => {
          navigate('/customer/orders');
        }, 3000);

      } catch (error) {
        console.error('❌ 결제 성공 처리 실패:', error);
        setError(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
        setIsProcessed(false); // 에러 시 플래그 리셋
      } finally {
        setIsLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, navigate, clearCart, addOrder, isProcessed]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">결제 정보를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 처리 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/customer/checkout')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">결제가 완료되었습니다!</h1>
        
        {paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호:</span>
                <span className="font-medium">{paymentData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제금액:</span>
                <span className="font-medium">₩{paymentData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제방법:</span>
                <span className="font-medium">
                  {paymentData.method === 'toss' ? '토스페이' : 
                   paymentData.method === 'point' ? '포인트 결제' : 
                   paymentData.method}
                </span>
              </div>
              {paymentData.paymentKey && (
                <div className="flex justify-between">
                  <span className="text-gray-600">결제키:</span>
                  <span className="font-medium text-xs">{paymentData.paymentKey.substring(0, 20)}...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-gray-600 mb-6">
          주문이 성공적으로 처리되었습니다.<br />
          잠시 후 주문 내역 페이지로 이동합니다.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/customer/orders')}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            주문 내역 보기
          </button>
          <button
            onClick={() => navigate('/customer')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;