// 토스페이먼츠 결제 정보 타입 정의
export interface TossPaymentInfo {
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerMobilePhone?: string;
  successUrl?: string;
  failUrl?: string;
}

export interface TossPaymentResult {
  paymentKey: string;
  orderId: string;
  orderName: string;
  amount: number;
  method: string;
  status: string;
  requestedAt: string;
  approvedAt?: string;
  useEscrow: boolean;
  card?: any;
  easyPay?: any;
}

// 토스페이먼츠 결제 SDK 로드 (v2)
let tossPayments: any = null;

const loadTossPayments = async (): Promise<any> => {
  if (tossPayments) {
    return tossPayments;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v2/standard';
    script.onload = () => {
      if ((window as any).TossPayments) {
        tossPayments = (window as any).TossPayments;
        resolve(tossPayments);
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

// 토스페이먼츠 결제 요청 (v2)
export const requestTossPayment = async (paymentInfo: TossPaymentInfo): Promise<TossPaymentResult> => {
  try {
    console.log('🔄 토스페이먼츠 결제 요청 시작...', paymentInfo);
    
    const TossPayments = await loadTossPayments();
    // 토스페이먼츠 공식 테스트 키 사용 (환경 변수가 없거나 잘못된 경우)
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoqo56A';
    
    // 토스페이먼츠 공식 문서의 테스트 키로 대체 (문제가 지속되는 경우)
    // const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoqo56A';
    
    console.log('🔑 클라이언트 키:', clientKey);
    console.log('🔑 클라이언트 키 타입:', typeof clientKey);
    
    if (!clientKey) {
      throw new Error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.');
    }

    // 토스페이먼츠 SDK 초기화
    const tossPaymentsInstance = TossPayments(clientKey);
    
    // 결제창 인스턴스 생성 (비회원 결제)
    const payment = tossPaymentsInstance.payment({
      customerKey: TossPayments.ANONYMOUS
    });
    
    console.log('🔧 결제창 인스턴스 생성 완료');
    
    // 전화번호 형식 정리 (특수문자 제거)
    const cleanPhoneNumber = paymentInfo.customerMobilePhone?.replace(/[^0-9]/g, '') || '';
    
    // 결제 요청 파라미터 준비
    const paymentRequest = {
      method: "CARD", // 카드 및 간편결제
      amount: {
        currency: "KRW",
        value: paymentInfo.amount,
      },
      orderId: paymentInfo.orderId,
      orderName: paymentInfo.orderName,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
      customerEmail: paymentInfo.customerEmail,
      customerName: paymentInfo.customerName,
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
    
    console.log('🚀 결제 요청 시작...');
    
    // 결제 요청
    await payment.requestPayment(paymentRequest);

    // 결제창이 열리면 여기서 Promise가 resolve되지 않음
    // 실제 결제 결과는 successUrl 또는 failUrl로 리다이렉트됨
    console.log('✅ 토스페이먼츠 결제창 열기 성공');
    
    // 임시로 성공 응답 반환 (실제로는 리다이렉트됨)
    return {
      paymentKey: `toss_${Date.now()}`,
      orderId: paymentInfo.orderId,
      orderName: paymentInfo.orderName,
      amount: paymentInfo.amount,
      method: '토스페이',
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      approvedAt: undefined,
      useEscrow: false,
      card: {
        issuerCode: '61',
        acquirerCode: '31',
        number: '12345678****789*',
        installmentPlanMonths: 0,
        isInterestFree: false,
        interestPayer: null,
        approveNo: '00000000',
        useCardPoint: false,
        cardType: '신용',
        ownerType: '개인',
        acquireStatus: 'READY',
        amount: paymentInfo.amount
      }
    };
  } catch (error) {
    console.error('❌ 토스페이먼츠 결제 요청 실패:', error);
    throw error;
  }
};

// 토스페이먼츠 카드 결제 요청 (기존 인터페이스 호환성)
export const requestCardPayment = async (paymentInfo: TossPaymentInfo): Promise<TossPaymentResult> => {
  return requestTossPayment(paymentInfo);
};

// 토스페이먼츠 간편결제 요청 (기존 인터페이스 호환성)
export const requestEasyPayment = async (paymentInfo: TossPaymentInfo, method: string = '토스페이'): Promise<TossPaymentResult> => {
  return requestTossPayment(paymentInfo);
};

// 결제 승인 (서버 사이드에서 처리)
export const confirmPayment = async (paymentKey: string, orderId: string, amount: number) => {
  console.log('🔄 토스페이먼츠 결제 승인 요청...', { paymentKey, orderId, amount });
  
  // 실제로는 서버에서 결제 승인 API를 호출해야 함
  // 클라이언트에서는 리다이렉트로 처리됨
  throw new Error('결제 승인은 서버에서 처리해야 합니다.');
};

// 결제 취소 (서버 사이드에서 처리)
export const cancelPayment = async (paymentKey: string, cancelReason: string) => {
  console.log('🔄 토스페이먼츠 결제 취소 요청...', { paymentKey, cancelReason });
  
  // 실제로는 서버에서 결제 취소 API를 호출해야 함
  throw new Error('결제 취소는 서버에서 처리해야 합니다.');
};