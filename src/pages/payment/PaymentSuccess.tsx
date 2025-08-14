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
  const [countdown, setCountdown] = useState(5); // 카운트다운 추가
  const { clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  // 디버깅을 위한 로그
  console.log('🎯 PaymentSuccess 컴포넌트 로드됨', window.location.href);
  console.log('🔍 전체 URL:', window.location.href);
  console.log('🔍 URL 경로:', window.location.pathname);
  console.log('🔍 URL 검색 파라미터:', window.location.search);
  console.log('🔍 모든 검색 파라미터:', Object.fromEntries(searchParams.entries()));

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

      // URL 파라미터에서 결제 정보 추출 (토스페이먼츠 v2 표준 파라미터)
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      
      // method 파라미터가 없으면 URL 경로에서 추출하거나 기본값 사용
      let method = searchParams.get('method');
      if (!method) {
        // URL 경로에서 payment 타입 추출 시도
        const pathParts = window.location.pathname.split('/');
        if (pathParts.includes('kakao')) {
          method = 'kakao';
        } else if (pathParts.includes('toss')) {
          method = 'toss';
        } else {
          method = 'toss'; // 기본값
        }
      }
      
      console.log('🔍 URL 파라미터 (토스페이먼츠 v2):', { 
        paymentKey, 
        orderId, 
        amount, 
        method
      });

      // 필수 파라미터 검증 (paymentKey는 토스페이먼츠에서 자동으로 전달됨)
      if (!orderId || !amount) {
        console.error('❌ 필수 결제 파라미터 누락:', { paymentKey, orderId, amount });
        setError(`결제 정보가 올바르지 않습니다. 
          ${!orderId ? '주문번호(orderId)가 ' : ''}
          ${!amount ? '결제금액(amount)이 ' : ''}
          누락되었습니다. 
          토스페이먼츠에서 전달된 정보를 확인해주세요.`);
        setIsLoading(false);
        return;
      }

      // paymentKey가 없는 경우 생성 (토스페이먼츠에서 전달되지 않은 경우)
      const finalPaymentKey = paymentKey || `toss_${Date.now()}`;
      
      console.log('🔑 최종 paymentKey:', finalPaymentKey, '원본:', paymentKey);

      // localStorage 기반 중복 처리 방지
      const processedKey = `payment_processed_${orderId}_${finalPaymentKey}`;
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

        // 금액 검증 (0원 포인트 결제 허용)
        const paymentAmount = parseInt(amount);
        if (isNaN(paymentAmount) || paymentAmount < 0) {
          throw new Error('결제 금액이 올바르지 않습니다.');
        }

        setPaymentData({
          paymentKey: finalPaymentKey, // 실제 사용된 paymentKey 저장
          orderId,
          amount: paymentAmount,
          method,
        });

        console.log('✅ 결제 성공 정보:', { paymentKey: finalPaymentKey, orderId, amount: paymentAmount, method });

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
          createdAt: new Date().toISOString()
        };

        console.log('📦 주문 데이터:', orderData);

        // Supabase에 주문 저장 (재고 조회 실패해도 주문은 생성)
        try {
          const newOrder = await addOrder(orderData);
          console.log('✅ 주문 저장 성공:', newOrder);
          console.log('🎯 주문 ID:', newOrder.id, '주문번호:', newOrder.orderNumber);
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
              throw retryError; // 재시도도 실패한 경우 에러를 다시 throw
            }
          } else {
            // 다른 에러의 경우 에러를 다시 throw
            throw orderError;
          }
        }

        // 결제 성공 시 장바구니 비우기 및 localStorage 정리
        clearCart();
        localStorage.removeItem('checkoutData');
        console.log('🛒 장바구니 비우기 및 결제 정보 정리 완료');

        // 카운트다운 시작
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              console.log('⏰ 카운트다운 완료, 주문 내역 페이지로 이동');
              navigate('/customer/orders');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // 5초 후 주문 완료 페이지로 이동 (사용자가 정보를 확인할 수 있도록)
        setTimeout(() => {
          clearInterval(countdownInterval);
          console.log('⏰ 타임아웃, 주문 내역 페이지로 이동');
          navigate('/customer/orders');
        }, 5000);

      } catch (error) {
        console.error('❌ 결제 성공 처리 실패:', error);
        setError(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
        setIsProcessed(false); // 에러 시 플래그 리셋
      } finally {
        setIsLoading(false);
      }
    };

    handlePaymentSuccess();

    // Cleanup 함수 추가
    return () => {
      // 컴포넌트가 언마운트될 때 정리 작업
      console.log('🧹 PaymentSuccess 컴포넌트 정리');
    };
  }, [searchParams, navigate, clearCart, addOrder, isProcessed]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">결제 정보를 확인하고 있습니다...</p>
          <p className="mt-2 text-gray-500 text-sm">잠시만 기다려주세요</p>
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
          <p className="text-gray-600 mb-4 text-left bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
          
          {/* 에러 해결 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-left text-sm">
            <p className="text-blue-800 font-medium mb-2">💡 해결 방법:</p>
            <ul className="text-blue-700 space-y-1">
              <li>• 브라우저를 새로고침해보세요</li>
              <li>• 결제 페이지로 돌아가서 다시 시도해보세요</li>
              <li>• 문제가 지속되면 고객센터에 문의해주세요</li>
            </ul>
          </div>
          
          {/* 추가 안내 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left text-sm">
            <p className="text-yellow-800 font-medium mb-2">⚠️ 주의사항:</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• 결제가 실제로 완료되었는지 확인해주세요</li>
              <li>• 카드사 앱에서 결제 내역을 확인해보세요</li>
              <li>• 결제가 완료되었다면 주문 내역에서 확인할 수 있습니다</li>
            </ul>
          </div>
          
          {/* 토스페이먼츠 관련 안내 */}
          {error && error.includes('토스페이먼츠') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-left text-sm">
              <p className="text-green-800 font-medium mb-2">💚 토스페이먼츠 안내:</p>
              <ul className="text-green-700 space-y-1">
                <li>• 토스페이먼츠 앱에서 결제 내역을 확인해보세요</li>
                <li>• 결제가 완료되었다면 주문 내역에서 확인할 수 있습니다</li>
                <li>• 문제가 지속되면 토스페이먼츠 고객센터에 문의해주세요</li>
              </ul>
            </div>
          )}
          
          {/* 디버깅 정보 표시 */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left text-xs">
            <p className="text-gray-500 mb-2 font-medium">🔍 디버깅 정보:</p>
            <div className="space-y-1">
              <p className="text-gray-600">URL: <span className="font-mono">{window.location.href}</span></p>
              <p className="text-gray-600">Path: <span className="font-mono">{window.location.pathname}</span></p>
              <p className="text-gray-600">Search: <span className="font-mono">{window.location.search}</span></p>
              <p className="text-gray-600">Timestamp: <span className="font-mono">{new Date().toLocaleString()}</span></p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/customer/checkout')}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              🔄 다시 시도하기
            </button>
            <button
              onClick={() => navigate('/customer')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              🏠 홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">결제가 완료되었습니다!</h1>
        
        {/* 결제 성공 안내 메시지 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-green-800 font-medium mb-2">
            🎉 결제가 성공적으로 처리되었습니다!
          </p>
          <p className="text-green-700 text-sm">
            주문 정보가 저장되었으며, 장바구니가 비워졌습니다.
          </p>
        </div>

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
                  {paymentData.method === 'toss' ? '토스페이먼츠' : 
                   paymentData.method === 'kakao' ? '카카오페이' :
                   paymentData.method === 'point' ? '포인트 결제' : 
                   paymentData.method}
                </span>
              </div>
              {paymentData.paymentKey && paymentData.paymentKey.startsWith('tviva') && (
                <div className="flex justify-between">
                  <span className="text-gray-600">토스페이먼츠 결제키:</span>
                  <span className="font-medium text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {paymentData.paymentKey.substring(0, 20)}...
                  </span>
                </div>
              )}
              {paymentData.paymentKey && !paymentData.paymentKey.startsWith('tviva') && (
                <div className="flex justify-between">
                  <span className="text-gray-600">내부 결제키:</span>
                  <span className="font-medium text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {paymentData.paymentKey.substring(0, 20)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-gray-600 mb-6">
          주문이 성공적으로 처리되었습니다.<br />
          {paymentData?.method === 'toss' ? '토스페이먼츠 결제가 완료되었습니다.' : ''}
          <br />
          {countdown > 0 ? (
            <span className="font-semibold text-blue-600">{countdown}초 후</span>
          ) : (
            <span className="font-semibold text-green-600">지금</span>
          )} 주문 내역 페이지로 자동 이동됩니다.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/customer/orders')}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            📋 주문 내역 보기
          </button>
          <button
            onClick={() => navigate('/customer')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            🏠 홈으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;