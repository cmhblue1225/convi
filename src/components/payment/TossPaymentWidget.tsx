import React, { useEffect, useCallback, useRef } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TossPaymentWindowProps {
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerMobilePhone?: string;
  onSuccess: (result: any) => void;
  onFail: (error: any) => void;
}

const TossPaymentWindow: React.FC<TossPaymentWindowProps> = ({
  orderId,
  orderName,
  amount,
  customerName,
  customerEmail,
  customerMobilePhone,
  onSuccess,
  onFail,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const hasInitialized = useRef(false);

  // 콜백 함수들을 안정화
  const stableOnSuccess = useCallback(onSuccess, []);
  const stableOnFail = useCallback(onFail, []);

  useEffect(() => {
    // 이미 초기화되었으면 중복 실행 방지
    if (hasInitialized.current) {
      return;
    }

    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 중복 초기화 방지
        hasInitialized.current = true;

        // 토스페이먼츠 SDK 동적 로드 (이미 로드된 경우 재사용)
        const loadTossPayments = async (): Promise<any> => {
          // 이미 로드된 경우
          if ((window as any).TossPayments) {
            return (window as any).TossPayments;
          }
          
          // 이미 로딩 중인 스크립트가 있는지 확인
          const existingScript = document.querySelector('script[src="https://js.tosspayments.com/v2/standard"]');
          if (existingScript) {
            return new Promise((resolve, reject) => {
              existingScript.addEventListener('load', () => {
                if ((window as any).TossPayments) {
                  resolve((window as any).TossPayments);
                } else {
                  reject(new Error('토스페이먼츠 SDK 로드 실패'));
                }
              });
              existingScript.addEventListener('error', () => {
                reject(new Error('토스페이먼츠 SDK 로드 실패'));
              });
            });
          }
          
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.tosspayments.com/v2/standard';
            script.onload = () => {
              if ((window as any).TossPayments) {
                resolve((window as any).TossPayments);
              } else {
                reject(new Error('토스페이먼츠 SDK 로드 실패'));
              }
            };
            script.onerror = () => {
              reject(new Error('토스페이먼츠 SDK 로드 실패'));
            };
            document.head.appendChild(script);
          });
        };

        const TossPayments = await loadTossPayments();
        const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoqo56A';

        console.log('🔑 토스페이먼츠 클라이언트 키:', clientKey);

        // 토스페이먼츠 SDK 초기화
        const tossPayments = TossPayments(clientKey);

        // 결제창 인스턴스 생성 (비회원 결제)
        const payment = tossPayments.payment({
          customerKey: TossPayments.ANONYMOUS
        });

        // 전화번호 형식 정리 (더 강력한 정리)
        let cleanPhoneNumber = '';
        if (customerMobilePhone) {
          // 모든 특수문자 제거하고 숫자만 추출
          const numbersOnly = customerMobilePhone.replace(/[^0-9]/g, '');
          
          // 한국 전화번호 형식으로 정리
          if (numbersOnly.startsWith('82')) {
            // 82로 시작하면 0으로 변경
            cleanPhoneNumber = '0' + numbersOnly.substring(2);
          } else if (numbersOnly.startsWith('0')) {
            // 0으로 시작하면 그대로 사용
            cleanPhoneNumber = numbersOnly;
          } else if (numbersOnly.length === 10) {
            // 10자리면 앞에 0 추가
            cleanPhoneNumber = '0' + numbersOnly;
          } else if (numbersOnly.length === 11) {
            // 11자리면 그대로 사용
            cleanPhoneNumber = numbersOnly;
          } else {
            // 기본값으로 01012345678 사용
            cleanPhoneNumber = '01012345678';
          }
        } else {
          // 전화번호가 없으면 기본값 사용
          cleanPhoneNumber = '01012345678';
        }
        
        console.log('📞 원본 전화번호:', customerMobilePhone);
        console.log('📞 정리된 전화번호:', cleanPhoneNumber);

        // 결제 요청 파라미터 준비
        const paymentRequest = {
          method: "CARD", // 카드 및 간편결제
          amount: {
            currency: "KRW",
            value: amount,
          },
          orderId: orderId,
          orderName: orderName,
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
          customerEmail: customerEmail || 'test@example.com',
          customerName: customerName || '테스트 고객',
          customerMobilePhone: cleanPhoneNumber,
          // 카드 결제에 필요한 정보
          card: {
            useEscrow: false,
            flowMode: "DEFAULT", // 통합결제창 여는 옵션
            useCardPoint: false,
            useAppCardOnly: false,
          },
        };

        console.log('📦 결제 요청 파라미터:', paymentRequest);

        // 결제 요청 전 검증
        if (!paymentRequest.orderId || !paymentRequest.orderName || !paymentRequest.amount.value) {
          throw new Error('필수 결제 정보가 누락되었습니다.');
        }
        
        // 전화번호 형식 검증
        if (!cleanPhoneNumber || cleanPhoneNumber.length !== 11 || !cleanPhoneNumber.startsWith('0')) {
          console.warn('⚠️ 전화번호 형식이 올바르지 않아 기본값을 사용합니다.');
          cleanPhoneNumber = '01012345678';
        }

        console.log('🚀 결제창 요청 시작...');

        // 결제창 요청 (새 창에서 열림)
        await payment.requestPayment(paymentRequest);

        console.log('✅ 토스페이먼츠 결제창 열기 성공');
        
        // 결제창이 열리면 로딩 상태 해제 (실제 결과는 successUrl/failUrl로 리다이렉트됨)
        setIsLoading(false);

      } catch (error) {
        console.error('❌ 토스페이먼츠 결제창 초기화 실패:', error);
        
        // 더 자세한 에러 정보 로깅
        if (error instanceof Error) {
          console.error('에러 상세:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
        
        setError(error instanceof Error ? error.message : '결제창 초기화에 실패했습니다.');
        setIsLoading(false);
        stableOnFail(error);
      }
    };

    initializePayment();
  }, [orderId, orderName, amount, customerName, customerEmail, customerMobilePhone]); // 콜백 함수 제거

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">결제창을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-500 text-2xl mb-2">❌</div>
        <p className="text-red-700 font-medium">결제창 로드 실패</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="w-full text-center py-8">
      <div className="mb-6">
        <div className="text-4xl mb-2">💚</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">토스페이 결제창</h3>
        <p className="text-gray-600 mb-4">결제창이 새 창에서 열립니다.</p>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>• 결제창이 열리지 않았다면 팝업 차단을 해제해주세요.</p>
        <p>• 결제 정보는 토스페이먼츠에서 안전하게 처리됩니다.</p>
        <p>• 테스트 환경에서는 실제 결제가 이루어지지 않습니다.</p>
        <p>• 결제 완료 후 자동으로 주문 내역 페이지로 이동합니다.</p>
      </div>
    </div>
  );
};

export default TossPaymentWindow; 