import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface PaymentFailData {
  code: string;
  message: string;
  orderId?: string;
  amount?: number;
  paymentKey?: string;
}

const PaymentFail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [failData, setFailData] = useState<PaymentFailData | null>(null);

  useEffect(() => {
    // URL 파라미터에서 실패 정보 추출 (토스페이먼츠 v2 표준 파라미터)
    const code = searchParams.get('code');
    const message = searchParams.get('message');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const paymentKey = searchParams.get('paymentKey');

    setFailData({
      code: code || 'UNKNOWN_ERROR',
      message: message || '알 수 없는 오류가 발생했습니다.',
      orderId: orderId || undefined,
      amount: amount ? parseInt(amount) : undefined,
      paymentKey: paymentKey || undefined,
    });

    console.log('❌ 결제 실패 정보:', { code, message, orderId, amount, paymentKey });
  }, [searchParams]);

  const getErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
      'UNAUTHORIZED_KEY': '인증되지 않은 API 키입니다.',
      'NOT_FOUND_PAYMENT_SESSION': '결제 세션이 만료되었습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 결제를 거절했습니다.',
      'FORBIDDEN_REQUEST': '잘못된 결제 요청입니다.',
      'INVALID_ORDER_ID': '주문번호가 올바르지 않습니다.',
      'INVALID_AMOUNT': '결제 금액이 올바르지 않습니다.',
      'PAYMENT_CANCELED': '결제가 취소되었습니다.',
      'PAYMENT_FAILED': '결제에 실패했습니다.',
      'UNKNOWN_ERROR': '알 수 없는 오류가 발생했습니다.',
    };

    return errorMessages[code] || '결제 처리 중 오류가 발생했습니다.';
  };

  const handleRetry = () => {
    navigate('/customer/checkout');
  };

  const handleGoHome = () => {
    navigate('/customer');
  };

  const handleGoOrders = () => {
    navigate('/customer/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">결제에 실패했습니다</h1>
        
        {failData && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">오류 코드:</span>
                <span className="font-medium text-red-600">{failData.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">오류 메시지:</span>
                <span className="font-medium text-red-600">{getErrorMessage(failData.code)}</span>
              </div>
              {failData.orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호:</span>
                  <span className="font-medium">{failData.orderId}</span>
                </div>
              )}
              {failData.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">결제금액:</span>
                  <span className="font-medium">₩{failData.amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-gray-600 mb-6">
          결제 처리 중 문제가 발생했습니다.<br />
          다시 시도하거나 다른 결제 방법을 선택해주세요.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            다시 시도하기
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleGoOrders}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              주문 내역
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              홈으로
            </button>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>문제가 지속되면 고객센터로 문의해주세요.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;