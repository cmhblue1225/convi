import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useCartStore } from '../../stores/cartStore';
import { useOrderStore } from '../../stores/orderStore';
// import { supabase } from '../../lib/supabase/client';

interface PaymentSuccessData {
  paymentKey: string;
  orderId: string;
  amount: number;
  method: string;
}

import { handleKakaoPayCallback } from '../../lib/payment/kakaoPay';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const { clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const createOrderFromCheckoutData = async (_paymentResult: any) => {
    const checkoutDataStr = localStorage.getItem('checkoutData');
    if (!checkoutDataStr) {
      throw new Error('결제 정보를 찾을 수 없습니다. 다시 시도해주세요.');
    }
    // const checkoutData = JSON.parse(checkoutDataStr);

    // const orderData = {
    //   // ... (기존 주문 데이터 생성 로직)
    // };

    // TODO: orderData 생성 구현 필요
    // await addOrder(orderData);
    clearCart();
    localStorage.removeItem('checkoutData');
  };

  useEffect(() => {
    const processPayment = async () => {
      if (isProcessed) return;
      setIsProcessed(true);

      const pgToken = searchParams.get('pg_token');
      const paymentKey = searchParams.get('paymentKey');

      try {
        if (pgToken) {
          // 카카오페이 처리
          const orderId = searchParams.get('orderId');
          const amount = searchParams.get('amount');
          const tid = searchParams.get('tid'); // KakaoPay specific
          const payload = {
            pg_token: pgToken,
            order_id: orderId,
            amount: amount,
            tid: tid // Pass tid if needed for final approval
          };
          const kakaoResult = await handleKakaoPayCallback(new URLSearchParams(payload as any));
          await createOrderFromCheckoutData(kakaoResult);
          setPaymentData({ paymentKey: 'kakao_pay', orderId: orderId || '', amount: parseInt(amount || '0'), method: 'kakao' });
        } else if (paymentKey) {
          // 토스페이먼츠 처리
          const orderId = searchParams.get('orderId');
          const amount = searchParams.get('amount');
          // ... (기존 토스페이먼츠 처리 로직)
          await createOrderFromCheckoutData({ paymentKey, orderId, amount });
          setPaymentData({ paymentKey, orderId: orderId || '', amount: parseInt(amount || '0'), method: 'toss' });
        } else {
          throw new Error('잘못된 접근입니다.');
        }
        setTimeout(() => navigate('/customer/orders'), 3000);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [searchParams, isProcessed, navigate, addOrder, clearCart]);

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
                  {paymentData.method === 'toss' ? '토스페이' : paymentData.method}
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