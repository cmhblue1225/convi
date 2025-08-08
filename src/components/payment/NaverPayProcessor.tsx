// src/components/payment/NaverPayProcessor.tsx
import React, { useEffect } from 'react';
import { startNaverPay } from '../../lib/payment/naverPay'; // naverPay.ts에서 함수 임포트

interface NaverPayProcessorProps {
  orderId: string;
  productName: string;
  amount: string; // 네이버 페이는 금액을 문자열로 받음
  returnUrl: string;
  onSuccess: (result: any) => void;
  onFailure: (error: any) => void;
}

const NaverPayProcessor: React.FC<NaverPayProcessorProps> = ({
  orderId,
  productName,
  amount,
  returnUrl,
  onSuccess,
  onFailure,
}) => {
  useEffect(() => {
    const handleNaverPay = async () => {
      try {
        // 실제 가맹점 ID와 클라이언트 ID는 환경 변수나 안전한 방법으로 관리되어야 합니다.
        // 여기서는 예시 값을 사용합니다.
        const config = {
          merchantId: 'YOUR_NAVER_PAY_MERCHANT_ID', // 실제 가맹점 ID로 변경 필요
          clientId: 'YOUR_NAVER_PAY_CLIENT_ID',     // 실제 클라이언트 ID로 변경 필요
        };

        await startNaverPay(config, {
          orderId,
          productName,
          amount,
          returnUrl,
        });

        // 네이버 페이 팝업이 뜨면 이 이후의 로직은 콜백 URL에서 처리됩니다.
        // 여기서는 결제창 호출 성공을 의미합니다.
        // 실제 결제 성공/실패는 returnUrl로 리다이렉트된 페이지에서 처리해야 합니다.
        // onSuccess(true); // 이 부분은 실제 결제 완료 후 호출되어야 함
      } catch (error) {
        console.error('네이버 페이 결제 처리 중 오류:', error);
        onFailure(error);
      }
    };

    handleNaverPay();
  }, [orderId, productName, amount, returnUrl, onSuccess, onFailure]);

  return (
    <div className="naver-pay-processor">
      <p>네이버 페이 결제창을 준비 중입니다...</p>
      {/* 로딩 스피너 등을 여기에 추가할 수 있습니다. */}
    </div>
  );
};

export default NaverPayProcessor;
