import React, { useState } from 'react';
import { requestCardPayment, requestEasyPayment, requestTossPayment } from '../../lib/payment/tossPayments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import TossPaymentWindow from './TossPaymentWidget';

// 결제 방법 타입 정의 (orderStore와 통일)
type PaymentMethod = 'card' | 'cash' | 'mobile' | 'toss' | 'naver' | 'payco';

// 토스페이먼츠 결제 정보 타입 정의 (로컬에서 정의)
interface PaymentInfo {
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerMobilePhone?: string;
  successUrl?: string;
  failUrl?: string;
}


interface PaymentProcessorProps {
  paymentMethod: PaymentMethod;
  orderInfo: {
    orderId: string;
    orderName: string;
    amount: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
  onPaymentSuccess: (result: any) => void;
  onPaymentFail: (error: any) => void;
  onCancel: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  paymentMethod,
  orderInfo,
  onPaymentSuccess,
  onPaymentFail,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [showTossWidget, setShowTossWidget] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      switch (paymentMethod) {
        case 'card':
          await handleCardPayment();
          break;
        case 'toss':
          await handleTossPayment();
          break;
        case 'naver':
        case 'payco':
          await handleOtherPayment();
          break;
        case 'mobile':
          await handleMobilePayment();
          break;
        case 'cash':
          await handleCashPayment();
          break;
        default:
          throw new Error('지원하지 않는 결제 방법입니다.');
      }
    } catch (error) {
      console.error('결제 처리 실패:', error);
      onPaymentFail(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    setProcessingMessage('카드 결제를 처리하고 있습니다...');
    
    // 카드 결제 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          paymentKey: `card_payment_${Date.now()}`,
          orderId: orderInfo.orderId,
          orderName: orderInfo.orderName,
          amount: orderInfo.amount,
          method: '신용카드',
          status: 'DONE',
          requestedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          useEscrow: false,
          card: {
            company: '신한카드',
            number: '1234-****-****-5678',
            installmentPlanMonths: 0,
            isInterestFree: false,
            approveNo: `AP${Date.now()}`,
            useCardPoint: false,
            cardType: '신용',
            ownerType: '개인',
            acquireStatus: 'APPROVED',
            amount: orderInfo.amount
          }
        };
        
        console.log('✅ 카드 결제 시뮬레이션 성공:', result);
        onPaymentSuccess(result);
      }, 3000);
    });
  };

  const handleTossPayment = async () => {
    console.log('🏦 토스페이 결제 처리 시작...');
    
    // 이미 토스 위젯이 표시되어 있으면 중복 실행 방지
    if (showTossWidget) {
      console.log('⚠️ 토스페이 위젯이 이미 표시되어 있습니다.');
      return;
    }
    
    // 토스페이 결제창 표시
    setShowTossWidget(true);
  };


  

  const handleOtherPayment = async () => {
    setProcessingMessage(`${getPaymentMethodName(paymentMethod)} 결제를 처리하고 있습니다...`);
    
    // 네이버페이, 페이코 결제 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          paymentKey: `${paymentMethod}_payment_${Date.now()}`,
          orderId: orderInfo.orderId,
          orderName: orderInfo.orderName,
          amount: orderInfo.amount,
          method: getPaymentMethodName(paymentMethod),
          status: 'DONE',
          requestedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          useEscrow: false,
          easyPay: {
            provider: paymentMethod.toUpperCase(),
            amount: orderInfo.amount,
            discountAmount: 0
          }
        };
        
        console.log(`✅ ${getPaymentMethodName(paymentMethod)} 결제 시뮬레이션 성공:`, result);
        onPaymentSuccess(result);
      }, 3000);
    });
  };

  const handleMobilePayment = async () => {
    setProcessingMessage('휴대폰 결제를 준비하고 있습니다...');
    
    // 휴대폰 결제 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          paymentKey: `mobile_payment_${Date.now()}`,
          orderId: orderInfo.orderId,
          orderName: orderInfo.orderName,
          amount: orderInfo.amount,
          method: '휴대폰 결제',
          status: 'DONE',
          requestedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          useEscrow: false,
          mobilePhone: {
            carrier: 'SKT',
            phoneNumber: '010-****-1234',
            amount: orderInfo.amount
          }
        };
        
        console.log('✅ 휴대폰 결제 시뮬레이션 성공:', result);
        onPaymentSuccess(result);
      }, 3000);
    });
  };

  const handleCashPayment = async () => {
    setProcessingMessage('현금 결제를 준비하고 있습니다...');
    
    // 현금 결제 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          paymentKey: `cash_payment_${Date.now()}`,
          orderId: orderInfo.orderId,
          orderName: orderInfo.orderName,
          amount: orderInfo.amount,
          method: '현금 결제',
          status: 'DONE',
          requestedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          useEscrow: false,
          cashReceipt: {
            type: '소득공제',
            amount: orderInfo.amount,
            receiptNumber: `CR${Date.now()}`
          }
        };
        
        console.log('✅ 현금 결제 시뮬레이션 성공:', result);
        onPaymentSuccess(result);
      }, 2000);
    });
  };

  // 토스페이 결제창 성공 핸들러
  const handleTossWidgetSuccess = (result: any) => {
    console.log('✅ 토스페이 결제창 성공:', result);
    setShowTossWidget(false);
    onPaymentSuccess(result);
  };

  // 토스페이 결제창 실패 핸들러
  const handleTossWidgetFail = (error: any) => {
    console.error('❌ 토스페이 결제창 실패:', error);
    setShowTossWidget(false);
    onPaymentFail(error);
  };

  const getPaymentMethodName = (method: PaymentMethod): string => {
    const methodNames: Record<PaymentMethod, string> = {
      card: '카드',
      toss: '토스페이',
      naver: '네이버페이',
      payco: '페이코',
      mobile: '휴대폰 결제',
      cash: '현금 결제',
    };
    return methodNames[method];
  };

  const getPaymentMethodIcon = (method: PaymentMethod): string => {
    const icons: Record<PaymentMethod, string> = {
      card: '💳',
      toss: '💚',
      naver: '🟢',
      payco: '🔵',
      mobile: '📱',
      cash: '💵',
    };
    return icons[method];
  };

  // 결제 시작 버튼 클릭 핸들러
  const handleStartPayment = () => {
    handlePayment();
  };

  // 토스페이 결제창 표시
  if (showTossWidget) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {getPaymentMethodIcon(paymentMethod)} {getPaymentMethodName(paymentMethod)} 결제
          </h3>
          <button
            onClick={() => setShowTossWidget(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <TossPaymentWindow
          orderId={orderInfo.orderId}
          orderName={orderInfo.orderName}
          amount={orderInfo.amount}
          customerName={orderInfo.customerName}
          customerEmail={orderInfo.customerEmail}
          customerMobilePhone={orderInfo.customerPhone}
          onSuccess={handleTossWidgetSuccess}
          onFail={handleTossWidgetFail}
        />
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <LoadingSpinner size="lg" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getPaymentMethodIcon(paymentMethod)} {getPaymentMethodName(paymentMethod)} 결제
        </h3>
        <p className="text-gray-600 mb-4">{processingMessage}</p>
        <div className="text-sm text-gray-500">
          결제 창이 열리지 않았다면 팝업 차단을 해제해주세요.
        </div>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          결제 취소
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="text-4xl mb-2">{getPaymentMethodIcon(paymentMethod)}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getPaymentMethodName(paymentMethod)} 결제
        </h3>
        <p className="text-gray-600 mb-4">아래 버튼을 클릭하여 결제를 진행하세요.</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={handleStartPayment}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          {getPaymentMethodIcon(paymentMethod)} {getPaymentMethodName(paymentMethod)}로 결제하기
        </button>
        
        <button
          onClick={onCancel}
          className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          결제 취소
        </button>
      </div>
    </div>
  );
};

export default PaymentProcessor;