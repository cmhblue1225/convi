// 테스트용 헬퍼 함수들
import { useCartStore } from '../stores/cartStore';
import { useOrderStore } from '../stores/orderStore';

export const setTestStore = (storeName: '강남점' | '홍대점' | '잠실점' = '강남점') => {
  const storeData = {
    '강남점': {
      id: 'd18ff50c-135e-4249-838e-165f78be9965',
      name: '강남점',
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      delivery_available: true,
      pickup_available: true,
      min_order_amount: 15000,
      delivery_fee: 3000
    },
    '홍대점': {
      id: '0f73f114-9fc7-4a46-8f94-67ff3dc06477',
      name: '홍대점',
      address: '서울특별시 마포구 홍익로 456',
      phone: '02-2345-6789',
      delivery_available: true,
      pickup_available: true,
      min_order_amount: 12000,
      delivery_fee: 2500
    },
    '잠실점': {
      id: '3b51f8ea-d2bd-456f-8b24-256def94e3d6',
      name: '잠실점',
      address: '서울특별시 송파구 올림픽로 789',
      phone: '02-3456-7890',
      delivery_available: true,
      pickup_available: true,
      min_order_amount: 15000,
      delivery_fee: 3000
    }
  };

  const selectedStore = storeData[storeName];
  localStorage.setItem('selectedStore', JSON.stringify(selectedStore));
  console.log(`✅ 테스트 지점 설정: ${storeName}`, selectedStore);
  return selectedStore;
};

export const clearTestData = () => {
  localStorage.removeItem('selectedStore');
  useCartStore.getState().clearCart();
  useOrderStore.getState().clearOrders();
  console.log('🗑️ 테스트 데이터 (선택된 지점, 장바구니, 주문내역) 초기화 완료. 페이지를 새로고침하세요.');
};

export const getTestInstructions = () => {
  return `
🧪 완전한 편의점 쇼핑 테스트 가이드

=== 📱 전체 주문 플로우 테스트 ===
1. 지점 선택: http://localhost:5173/test-store-selection
2. 상품 선택: 상품 추가 후 장바구니에서 픽업/배송 선택
3. 주문하기: 결제 정보 입력 후 주문 완료
4. 주문 추적: 자동으로 주문 추적 페이지로 이동
5. 상태 변경: "다음 단계" 버튼으로 주문 진행 시뮬레이션

=== 🛍️ 개별 기능 테스트 ===

1. 지점 선택 테스트:
   URL: http://localhost:5173/test-store-selection
   - 3개 지점 카드 표시 확인
   - 지점 클릭 시 상품 페이지로 이동 확인

2. 상품 카탈로그 테스트:
   URL: http://localhost:5173/test-products
   ⚠️ 준비: 콘솔에서 'setTestStore("강남점")' 실행 후 새로고침
   - 7개 상품 표시 (할인, 재고부족, 품절 포함)
   - 5개 카테고리 필터링 및 검색 기능
   - 실시간 재고 표시 및 장바구니 수량 반영

3. 장바구니 & 주문 연동 테스트:
   - 픽업/배송 선택 → 주문 페이지에 자동 적용 확인
   - 배송비 실시간 계산 (픽업: 0원, 배송: 조건부 무료)
   - 장바구니-주문 페이지 양방향 동기화

4. 주문 프로세스 테스트:
   - 주문 정보 입력 (배송 정보, 결제 방법)
   - 이용약관 동의 및 폼 유효성 검증
   - 주문 완료 후 자동으로 주문 추적 페이지 이동

5. 주문 추적 시스템 테스트:
   - 실시간 진행 상황 표시
   - "다음 단계" 버튼으로 상태 변경 시뮬레이션
   - 픽업/배송별 다른 진행 단계 표시
   - 주문 상세 정보 및 배송 정보 표시

6. 주문 내역 관리 테스트:
   - 여러 주문 생성 후 모든 주문 표시 확인
   - 주문 추적 버튼으로 개별 주문 추적
   - 완료된 주문의 재주문 버튼 표시

=== 🎮 헬퍼 함수 (F12 콘솔에서 실행) ===
setTestStore('강남점')     // 지점 설정 (강남점/홍대점/잠실점)
clearTestData()           // 모든 테스트 데이터 초기화
getTestInstructions()     // 이 가이드 다시 보기

=== 🚀 권장 테스트 순서 ===
1. clearTestData() → 페이지 새로고침
2. 지점 선택 → 상품 선택 → 주문 완료
3. 주문 추적에서 "다음 단계" 버튼으로 진행 상황 시뮬레이션
4. 여러 번 주문하여 주문 내역 누적 확인
5. 다른 지점으로 변경하여 장바구니 초기화 확인
-----------------------------------
  `;
};

// 전역 객체에 테스트 함수 노출 (개발 환경에서만)
if (import.meta.env.DEV) {
  (window as any).setTestStore = setTestStore;
  (window as any).clearTestData = clearTestData;
  (window as any).getTestInstructions = getTestInstructions;
}