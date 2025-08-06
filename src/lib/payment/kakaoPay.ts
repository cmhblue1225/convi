
/**
 * 카카오페이 연동을 위한 모듈
 * 
 * @see https://developers.kakao.com/docs/latest/ko/kakaopay/common
 */

// 카카오페이 SDK 로드 (비동기)
const loadKakaoPaySDK = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://pg-web.kakao.com/v2/kakao-pay.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
};

// 카카오페이 인스턴스
let kakaoPay: any = null;

/**
 * 카카오페이 SDK를 초기화하고 결제 준비를 합니다.
 * 
 * @param clientKey - 카카오페이 클라이언트 키
 * @returns KakaoPay 인스턴스
 */
export const initKakaoPaySDK = async (clientKey: string) => {
  if (!kakaoPay) {
    try {
      await loadKakaoPaySDK();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      kakaoPay = window.KakaoPay(clientKey);
    } catch (error) {
      console.error('카카오페이 SDK 로드에 실패했습니다.', error);
      throw new Error('카카오페이 SDK를 로드할 수 없습니다.');
    }
  }
  return kakaoPay;
};

/**
 * 카카오페이 결제를 요청합니다.
 * 
 * @param orderData - 주문 데이터
 * @returns 결제 요청 결과
 */
export const initiateKakaoPayPayment = async (orderData: any) => {
  if (!kakaoPay) {
    throw new Error('카카오페이 SDK가 초기화되지 않았습니다.');
  }

  try {
    const response = await kakaoPay.requestPayment({
      ...orderData,
      // 여기에 필요한 카카오페이 결제 파라미터를 추가합니다.
      // 예: transaction_id, order_name 등
    });
    return response;
  } catch (error) {
    console.error('카카오페이 결제 요청에 실패했습니다.', error);
    throw error;
  }
};

/**
 * 카카오페이 결제 콜백을 처리합니다.
 * 
 * @param params - URL 검색 파라미터
 * @returns 결제 승인 결과
 */
export const handleKakaoPayCallback = async (params: URLSearchParams) => {
  const pgToken = params.get('pg_token');

  if (!pgToken) {
    throw new Error('결제가 취소되었거나 pg_token을 찾을 수 없습니다.');
  }

  // TODO: 백엔드에 pg_token을 전달하여 결제 최종 승인 요청
  // 이 부분은 백엔드 API 구현에 따라 달라집니다.
  console.log('결제 승인 토큰:', pgToken);

  // 임시로 성공 처리
  return {
    success: true,
    message: '결제가 성공적으로 완료되었습니다.',
    pgToken,
  };
};
