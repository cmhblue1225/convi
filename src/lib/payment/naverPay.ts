// src/lib/payment/naverPay.ts

interface NaverPayConfig {
  merchantId: string; // 가맹점 ID
  clientId: string; // 클라이언트 ID (API Key)
  // 기타 필요한 설정 (예: returnUrl, callbackUrl 등)
}

interface NaverPayPaymentOptions {
  // 결제 요청에 필요한 파라미터 (네이버 페이 문서 참조)
  // 예: amount, productName, orderId, buyerName, buyerTel, buyerEmail 등
  amount: string;
  productName: string;
  orderId: string;
  returnUrl: string; // 결제 완료 후 돌아올 URL
  // 기타 필요한 파라미터
}

declare global {
  interface Window {
    Naver: any; // 네이버 페이 SDK 전역 객체
  }
}

/**
 * 네이버 페이 SDK를 동적으로 로드합니다.
 */
const loadNaverPaySdk = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Naver && window.Naver.Pay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pay.naver.com/static/js/naverpay.js'; // 네이버 페이 SDK URL
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.onload = () => {
      if (window.Naver && window.Naver.Pay) {
        resolve();
      } else {
        reject(new Error('네이버 페이 SDK 로드 실패'));
      }
    };
    script.onerror = () => reject(new Error('네이버 페이 SDK 로드 중 오류 발생'));
    document.head.appendChild(script);
  });
};

/**
 * 네이버 페이 결제를 시작합니다.
 * @param config 네이버 페이 설정 (가맹점 ID 등)
 * @param options 결제 요청 옵션 (금액, 상품명 등)
 */
export const startNaverPay = async (config: NaverPayConfig, options: NaverPayPaymentOptions): Promise<void> => {
  try {
    await loadNaverPaySdk();

    // 네이버 페이 객체 생성
    const naverPay = new window.Naver.Pay({
      clientId: config.clientId, // 클라이언트 ID
      mode: 'development', // 'development' 또는 'production'
      // 기타 초기화 옵션 (네이버 페이 문서 참조)
    });

    // 결제 요청
    naverPay.open({
      merchantUserKey: options.orderId, // 가맹점 사용자 키 (주문 ID 등)
      merchantPayKey: options.orderId, // 가맹점 결제 키 (주문 ID 등)
      productName: options.productName,
      totalAmount: options.amount,
      returnUrl: options.returnUrl,
      // 기타 결제 요청 파라미터 (네이버 페이 문서 참조)
      // 예: taxScopeAmount, taxSupplyAmount, shippingType, deliveryFee 등
    });
  } catch (error) {
    console.error('네이버 페이 결제 시작 중 오류 발생:', error);
    alert('네이버 페이 결제에 실패했습니다. 다시 시도해주세요.');
    throw error;
  }
};