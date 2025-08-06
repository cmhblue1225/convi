// 카카오페이 결제 정보 타입 정의
export interface KakaoPaymentInfo {
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

// 카카오페이 결제 준비 응답 타입
export interface KakaoPayReadyResponse {
  tid: string;
  next_redirect_pc_url: string;
  next_redirect_mobile_url: string;
  next_redirect_app_url: string;
  android_app_scheme: string;
  ios_app_scheme: string;
  created_at: string;
}

// 카카오페이 결제 승인 응답 타입
export interface KakaoPayApprovalResponse {
  aid: string;
  tid: string;
  cid: string;
  sid?: string;
  partner_order_id: string;
  partner_user_id: string;
  payment_method_type: string;
  amount: {
    total: number;
    tax_free: number;
    vat: number;
    point: number;
    discount: number;
    green_deposit: number;
  };
  card_info?: {
    kakaopay_purchase_corp: string;
    kakaopay_purchase_corp_code: string;
    kakaopay_issuer_corp: string;
    kakaopay_issuer_corp_code: string;
    bin: string;
    card_type: string;
    install_month: string;
    approved_id: string;
    card_mid: string;
    interest_free_install: string;
    installment_type: string;
    card_item_code: string;
  };
  item_name: string;
  item_code?: string;
  quantity: number;
  created_at: string;
  approved_at: string;
  payload?: string;
}

// 카카오페이 결제 준비 시뮬레이션
export const prepareKakaoPayment = async (paymentInfo: KakaoPaymentInfo): Promise<KakaoPayReadyResponse> => {
  console.log('🔄 카카오페이 결제 준비 시뮬레이션...', paymentInfo);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const result: KakaoPayReadyResponse = {
        tid: `test_tid_${Date.now()}`,
        next_redirect_pc_url: `${window.location.origin}/payment/kakao/success?orderId=${paymentInfo.orderId}&amount=${paymentInfo.amount}`,
        next_redirect_mobile_url: `${window.location.origin}/payment/kakao/success?orderId=${paymentInfo.orderId}&amount=${paymentInfo.amount}`,
        next_redirect_app_url: `kakaotalk://kakaopay/pg?url=${encodeURIComponent(`${window.location.origin}/payment/kakao/success?orderId=${paymentInfo.orderId}&amount=${paymentInfo.amount}`)}`,
        android_app_scheme: 'intent://kakaopay/pg?url=',
        ios_app_scheme: 'kakaotalk://kakaopay/pg?url=',
        created_at: new Date().toISOString(),
      };
      
      console.log('✅ 카카오페이 결제 준비 시뮬레이션 성공:', result);
      resolve(result);
    }, 1000);
  });
};

// 카카오페이 결제 승인 시뮬레이션
export const approveKakaoPayment = async (
  tid: string, 
  orderId: string, 
  pgToken: string,
  customerEmail?: string
): Promise<KakaoPayApprovalResponse> => {
  console.log('🔄 카카오페이 결제 승인 시뮬레이션...', { tid, orderId, pgToken });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const result: KakaoPayApprovalResponse = {
        aid: `test_aid_${Date.now()}`,
        tid: tid,
        cid: 'TC0ONETIME',
        partner_order_id: orderId,
        partner_user_id: customerEmail || 'demo_user',
        payment_method_type: 'MONEY',
        amount: {
          total: 10000,
          tax_free: 0,
          vat: 909,
          point: 0,
          discount: 0,
          green_deposit: 0,
        },
        item_name: '테스트 상품',
        quantity: 1,
        created_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      };
      
      console.log('✅ 카카오페이 결제 승인 시뮬레이션 성공:', result);
      resolve(result);
    }, 1000);
  });
};

// 카카오페이 결제 취소 시뮬레이션
export const cancelKakaoPayment = async (tid: string, cancelAmount: number, cancelReason: string) => {
  console.log('🔄 카카오페이 결제 취소 시뮬레이션...', { tid, cancelAmount, cancelReason });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        tid: tid,
        cancel_amount: cancelAmount,
        cancel_tax_free_amount: 0,
        cancel_reason: cancelReason,
        canceled_at: new Date().toISOString(),
      };
      
      console.log('✅ 카카오페이 결제 취소 시뮬레이션 성공:', result);
      resolve(result);
    }, 1000);
  });
};

// 카카오페이 결제 상태 조회 시뮬레이션
export const getKakaoPaymentStatus = async (tid: string, orderId: string, customerEmail?: string) => {
  console.log('🔄 카카오페이 결제 상태 조회 시뮬레이션...', { tid, orderId });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        tid: tid,
        cid: 'TC0ONETIME',
        status: 'SUCCESS_PAYMENT',
        partner_order_id: orderId,
        partner_user_id: customerEmail || 'demo_user',
        payment_method_type: 'MONEY',
        amount: {
          total: 10000,
          tax_free: 0,
          vat: 909,
          point: 0,
          discount: 0,
          green_deposit: 0,
        },
        item_name: '테스트 상품',
        quantity: 1,
        created_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      };
      
      console.log('✅ 카카오페이 결제 상태 조회 시뮬레이션 성공:', result);
      resolve(result);
    }, 500);
  });
};

// 카카오페이 결제 창 열기 시뮬레이션
export const openKakaoPayment = async (paymentInfo: KakaoPaymentInfo) => {
  console.log('🔄 카카오페이 결제 창 열기 시뮬레이션...', paymentInfo);
  
  try {
    // 결제 준비 시뮬레이션
    const response = await prepareKakaoPayment(paymentInfo);
    console.log('✅ 카카오페이 결제 준비 완료:', response);
    
    // 3초 후 성공 페이지로 리다이렉트 시뮬레이션
    setTimeout(() => {
      window.location.href = response.next_redirect_pc_url;
    }, 3000);
    
    return {
      tid: response.tid,
      paymentWindow: null, // 팝업 대신 리다이렉트 사용
    };
  } catch (error) {
    console.error('❌ 카카오페이 결제 창 열기 시뮬레이션 실패:', error);
    throw error;
  }
};