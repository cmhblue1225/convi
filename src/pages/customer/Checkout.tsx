import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, type Coupon } from '../../stores/cartStore'; // Coupon 타입 import
import { useOrderStore, type DeliveryAddress } from '../../stores/orderStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { supabase } from '../../lib/supabase/client';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import PaymentProcessor from '../../components/payment/PaymentProcessor';

// 결제 방법 타입 정의 (orderStore와 통일)
type PaymentMethod = 'card' | 'cash' | 'mobile' | 'toss' | 'kakao' | 'naver' | 'payco';

// DeliveryAddress는 orderStore에서 import

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    storeId,
    orderType: cartOrderType,
    subtotal,
    taxAmount,
    deliveryFee,
    totalAmount,
    appliedPoints, // 추가
    appliedCoupon, // 추가
    setOrderType: setCartOrderType,
    applyPoints, // 추가
    applyCoupon, // 추가
    removeCoupon // 추가
  } = useCartStore();

  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>(cartOrderType);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    name: '',
    phone: '',
    address: '',
    detailAddress: '',
    memo: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'processing'>('info');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [pointsToApply, setPointsToApply] = useState<number>(appliedPoints); // 포인트 입력 상태
  const [couponCode, setCouponCode] = useState<string>(appliedCoupon?.code || ''); // 쿠폰 코드 입력 상태
  const [showCouponList, setShowCouponList] = useState<boolean>(false); // 쿠폰 목록 표시 상태

  // 임시 사용자 보유 포인트 (추후 API로 대체)
  const userAvailablePoints = 50000;

  // 선택된 지점 정보
  const selectedStore = JSON.parse(localStorage.getItem('selectedStore') || '{}');

  useEffect(() => {
    // 장바구니가 비어있으면 상품 페이지로 리다이렉트
    if (items.length === 0) {
      alert('장바구니가 비어있습니다.');
      navigate('/customer/products');
      return;
    }

    // 지점이 선택되지 않았으면 지점 선택 페이지로 리다이렉트
    if (!selectedStore.id) {
      alert('지점을 먼저 선택해주세요.');
      navigate('/customer');
      return;
    }
  }, [items, selectedStore, navigate]);

  // 포인트 입력 필드 변경 핸들러
  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPointsToApply(value);
  };

  // 포인트 적용 핸들러
  const handleApplyPoints = () => {
    if (pointsToApply > userAvailablePoints) {
      alert(`보유 포인트(${userAvailablePoints.toLocaleString()}P)를 초과할 수 없습니다.`);
      setPointsToApply(userAvailablePoints);
      return;
    }

    if (pointsToApply > 0) {
      applyPoints(pointsToApply);
      alert(`${pointsToApply.toLocaleString()} 포인트가 적용되었습니다.`);
    } else {
      applyPoints(0); // 0 포인트 적용 (포인트 해제)
      alert('포인트 적용이 해제되었습니다.');
    }
  };

  // 전체 포인트 사용 핸들러 (쿠폰 할인 고려)
  const handleUseAllPoints = () => {
    // 쿠폰 할인 후 실제 결제 가능 금액 계산
    let currentTotal = subtotal + taxAmount + deliveryFee;
    let couponDiscount = 0;

    if (appliedCoupon) {
      if (!appliedCoupon.minAmount || currentTotal >= appliedCoupon.minAmount) {
        if (appliedCoupon.type === 'percentage') {
          couponDiscount = currentTotal * appliedCoupon.discount;
        } else {
          couponDiscount = appliedCoupon.discount;
        }
      }
    }

    const remainingAmount = currentTotal - couponDiscount;
    const maxUsablePoints = Math.min(userAvailablePoints, Math.max(0, remainingAmount));
    setPointsToApply(maxUsablePoints);
  };



  // 사용 가능한 쿠폰 목록 (추후 API로 대체 가능)
  const availableCoupons: Coupon[] = [
    { code: 'WELCOME10', discount: 0.1, type: 'percentage', minAmount: 10000, name: '신규 회원 10% 할인', description: '1만원 이상 주문 시' },
    { code: 'FREEDELIVERY', discount: 3000, type: 'fixed', name: '무료배송 쿠폰', description: '배송비 3,000원 할인' },
    { code: 'FIRSTORDER5000', discount: 5000, type: 'fixed', minAmount: 20000, name: '첫 주문 5천원 할인', description: '2만원 이상 주문 시' }
  ];

  // 현재 주문 금액 기준으로 사용 가능한 쿠폰 필터링
  const getUsableCoupons = () => {
    const currentOrderTotal = subtotal + taxAmount + deliveryFee;
    return availableCoupons.filter(coupon =>
      !coupon.minAmount || currentOrderTotal >= coupon.minAmount
    );
  };

  // 쿠폰 선택 핸들러
  const handleSelectCoupon = (coupon: Coupon) => {
    applyCoupon(coupon);
    setCouponCode(coupon.code);
  };

  // 쿠폰 해제 핸들러
  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode('');
    alert('쿠폰 적용이 해제되었습니다.');
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOrderTypeChange = (type: 'pickup' | 'delivery') => {
    console.log('🚚 주문 타입 변경:', type);
    setOrderType(type);
    setCartOrderType(type); // 장바구니에도 반영
  };

  const validateForm = (): boolean => {
    if (!agreedToTerms) {
      alert('이용약관에 동의해주세요.');
      return false;
    }

    if (orderType === 'delivery') {
      if (!deliveryAddress.name.trim()) {
        alert('받는 분 성함을 입력해주세요.');
        return false;
      }
      if (!deliveryAddress.phone.trim()) {
        alert('연락처를 입력해주세요.');
        return false;
      }
      if (!deliveryAddress.address.trim()) {
        alert('배송 주소를 입력해주세요.');
        return false;
      }
    }

    return true;
  };

  const generateOrderNumber = (): string => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = today.getTime().toString().slice(-4);
    return `ORD-${dateStr}-${timeStr}`;
  };

  const handleProceedToPayment = () => {
    if (!validateForm()) return;

    // 결제 진행 전 장바구니 정보를 localStorage에 저장 (PaymentSuccess 페이지에서 사용)
    const checkoutData = {
      items: items,
      storeId: storeId,
      storeName: selectedStore.name,
      orderType: orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      subtotal: subtotal,
      taxAmount: taxAmount,
      deliveryFee: deliveryFee,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      appliedPoints: appliedPoints, // 추가
      appliedCoupon: appliedCoupon // 추가
    };

    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    console.log('💾 결제 정보 저장:', checkoutData);

    setCurrentStep('payment');
  };

  // 재고 확인 함수
  const checkStockAvailability = async (): Promise<boolean> => {
    try {
      console.log('📦 재고 확인 시작...');

      for (const item of items) {
        const { data: stockData, error: stockError } = await supabase
          .from('store_products')
          .select('stock_quantity, is_available')
          .eq('store_id', selectedStore.id)
          .eq('product_id', item.product.id)
          .single();

        if (stockError) {
          console.error(`❌ 재고 조회 실패 (${item.product.name}):`, stockError);
          return false;
        }

        if (!stockData.is_available) {
          alert(`상품 "${item.product.name}"이 현재 판매 중지되었습니다.`);
          return false;
        }

        if (stockData.stock_quantity < item.quantity) {
          alert(`상품 "${item.product.name}"의 재고가 부족합니다.\n현재 재고: ${stockData.stock_quantity}개\n주문 수량: ${item.quantity}개`);
          return false;
        }
      }

      console.log('✅ 재고 확인 완료');
      return true;
    } catch (error) {
      console.error('❌ 재고 확인 중 오류:', error);
      return false;
    }
  };

  const handlePaymentSuccess = async (paymentResult: any) => {
    console.log('💳 토스페이먼츠 결제창 열기 성공:', paymentResult);
    // 토스페이먼츠는 successUrl/failUrl로 리다이렉트되므로 여기서는 아무것도 하지 않음
    // 실제 주문 생성은 PaymentSuccess 페이지에서 처리됨
  };

  const handlePaymentFail = (error: any) => {
    console.error('❌ 결제 실패:', error);

    // 결제 실패 페이지로 이동
    const failParams = new URLSearchParams({
      code: 'PAYMENT_FAILED',
      message: error.message || '결제에 실패했습니다.',
      orderId: generateOrderNumber(),
      amount: totalAmount.toString()
    });

    navigate(`/payment/fail?${failParams.toString()}`);
  };

  const handlePaymentCancel = () => {
    setCurrentStep('info');
  };

  if (items.length === 0 || !selectedStore.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 단계별 진행 상황 표시
  const renderProgressSteps = () => {
    const steps = [
      { id: 'info', name: '주문 정보', icon: '📝' },
      { id: 'payment', name: '결제 방법', icon: '💳' },
      { id: 'processing', name: '결제 처리', icon: '⏳' }
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === step.id
                ? 'bg-primary-color text-white'
                : steps.findIndex(s => s.id === currentStep) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                }`}>
                <span className="text-lg">{step.icon}</span>
              </div>
              <span className={`ml-2 font-medium ${currentStep === step.id ? 'text-primary-color' : 'text-gray-600'
                }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`mx-4 h-px w-12 ${steps.findIndex(s => s.id === currentStep) > index
                  ? 'bg-green-500'
                  : 'bg-gray-300'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 할인 금액 계산 (cartStore와 동일한 로직 사용)
  const calculateDiscountDetails = () => {
    const currentOrderTotal = subtotal + taxAmount + deliveryFee;
    let couponDiscount = 0;
    let pointDiscount = 0;

    // 쿠폰 할인 계산
    if (appliedCoupon) {
      if (!appliedCoupon.minAmount || currentOrderTotal >= appliedCoupon.minAmount) {
        if (appliedCoupon.type === 'percentage') {
          couponDiscount = currentOrderTotal * appliedCoupon.discount;
        } else {
          couponDiscount = appliedCoupon.discount;
        }
      }
    }

    // 포인트 할인 계산 (쿠폰 할인 후 금액에서 차감, 0원 미만 방지)
    const remainingAfterCoupon = currentOrderTotal - couponDiscount;
    pointDiscount = Math.min(appliedPoints, Math.max(0, remainingAfterCoupon));

    return {
      couponDiscount,
      pointDiscount,
      totalDiscount: couponDiscount + pointDiscount
    };
  };

  const discountDetails = calculateDiscountDetails();


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">주문하기</h1>
          <p className="text-gray-600">{selectedStore.name}</p>
        </div>

        {/* 진행 단계 표시 */}
        {renderProgressSteps()}

        {/* 단계별 컨텐츠 */}
        {currentStep === 'info' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 주문 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 주문 방식 선택 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">주문 방식</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleOrderTypeChange('pickup')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${orderType === 'pickup'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="text-2xl mb-2">🏪</div>
                    <div className="font-medium">픽업</div>
                    <div className="text-sm text-gray-500">매장에서 직접 픽업</div>
                  </button>
                  <button
                    onClick={() => handleOrderTypeChange('delivery')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${orderType === 'delivery'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="font-medium">배송</div>
                    <div className="text-sm text-gray-500">집까지 배송</div>
                  </button>
                </div>
              </div>

              {/* 배송 정보 (배송 선택 시에만 표시) */}
              {orderType === 'delivery' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">배송 정보</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          받는 분 성함 *
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.name}
                          onChange={(e) => handleAddressChange('name', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="성함을 입력하세요"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          연락처 *
                        </label>
                        <input
                          type="tel"
                          value={deliveryAddress.phone}
                          onChange={(e) => handleAddressChange('phone', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="010-0000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        배송 주소 *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.address}
                        onChange={(e) => handleAddressChange('address', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                        placeholder="기본 주소를 입력하세요"
                      />
                      <input
                        type="text"
                        value={deliveryAddress.detailAddress}
                        onChange={(e) => handleAddressChange('detailAddress', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="상세 주소를 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        배송 메모
                      </label>
                      <textarea
                        value={deliveryAddress.memo}
                        onChange={(e) => handleAddressChange('memo', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="배송 시 요청사항을 입력하세요"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 결제 방법 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">결제 방법</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span>💳 신용카드</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="toss"
                      checked={paymentMethod === 'toss'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span>🏦 토스페이</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="kakao"
                      checked={paymentMethod === 'kakao'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span>💛 카카오페이</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="naver"
                      checked={paymentMethod === 'naver'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span>🟢 네이버페이</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="payco"
                      checked={paymentMethod === 'payco'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span>🔴 페이코</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="mobile"
                      checked={paymentMethod === 'mobile'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span>📱 휴대폰 결제</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span>💵 현금 ({orderType === 'pickup' ? '매장결제' : '선불결제'})</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 주문 요약 */}
            <div className="space-y-6">
              {/* 주문 상품 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.product.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.storeProduct.price.toLocaleString()}원 × {item.quantity}개
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {item.subtotal.toLocaleString()}원
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 포인트 적용 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">포인트 적용</h2>
                  <span className="text-sm text-gray-600">
                    보유: {userAvailablePoints.toLocaleString()}P
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={pointsToApply}
                      onChange={handlePointsChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="사용할 포인트"
                      min="0"
                      max={userAvailablePoints}
                    />
                    <button
                      onClick={handleUseAllPoints}
                      className="px-3 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      전체
                    </button>
                    <button
                      onClick={handleApplyPoints}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      적용
                    </button>
                  </div>
                  {appliedPoints > 0 && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-700">
                        💰 {appliedPoints.toLocaleString()}P 적용 중
                      </span>
                      <button
                        onClick={() => {
                          applyPoints(0);
                          setPointsToApply(0);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        해제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 쿠폰 적용 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">쿠폰 적용</h2>
                  <button
                    onClick={() => setShowCouponList(!showCouponList)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showCouponList ? '접기' : '쿠폰 선택'}
                  </button>
                </div>

                {/* 현재 적용된 쿠폰 표시 */}
                {appliedCoupon ? (
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg mb-3">
                    <div>
                      <div className="text-sm font-medium text-green-700">
                        🎫 {appliedCoupon.name || appliedCoupon.code}
                      </div>
                      <div className="text-xs text-green-600">
                        {appliedCoupon.type === 'percentage'
                          ? `${appliedCoupon.discount * 100}% 할인`
                          : `${appliedCoupon.discount.toLocaleString()}원 할인`}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      해제
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mb-3">
                    적용된 쿠폰이 없습니다
                  </div>
                )}

                {/* 쿠폰 목록 */}
                {showCouponList && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">사용 가능한 쿠폰</div>
                    {getUsableCoupons().length > 0 ? (
                      getUsableCoupons().map((coupon) => (
                        <div
                          key={coupon.code}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${appliedCoupon?.code === coupon.code
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          onClick={() => handleSelectCoupon(coupon)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {coupon.name || coupon.code}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {coupon.description}
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                {coupon.type === 'percentage'
                                  ? `${coupon.discount * 100}% 할인`
                                  : `${coupon.discount.toLocaleString()}원 할인`}
                              </div>
                            </div>
                            {appliedCoupon?.code === coupon.code && (
                              <div className="text-green-500 text-sm">✓</div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-3 text-center">
                        현재 주문 금액에서 사용 가능한 쿠폰이 없습니다
                      </div>
                    )}

                    {/* 사용 불가능한 쿠폰들 */}
                    {availableCoupons.filter(coupon => {
                      const currentOrderTotal = subtotal + taxAmount + deliveryFee;
                      return coupon.minAmount && currentOrderTotal < coupon.minAmount;
                    }).length > 0 && (
                        <>
                          <div className="text-sm font-medium text-gray-500 mt-4 mb-2">사용 불가능한 쿠폰</div>
                          {availableCoupons
                            .filter(coupon => {
                              const currentOrderTotal = subtotal + taxAmount + deliveryFee;
                              return coupon.minAmount && currentOrderTotal < coupon.minAmount;
                            })
                            .map((coupon) => (
                              <div
                                key={coupon.code}
                                className="p-3 border border-gray-200 rounded-lg bg-gray-50 opacity-60"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-600">
                                      {coupon.name || coupon.code}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {coupon.description}
                                    </div>
                                    <div className="text-xs text-red-500 mt-1">
                                      최소 주문 금액: {coupon.minAmount?.toLocaleString()}원
                                    </div>
                                  </div>
                                  <div className="text-gray-400 text-sm">✗</div>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                  </div>
                )}
              </div>

              {/* 결제 금액 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">결제 금액</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>상품 금액</span>
                    <span>{subtotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>부가세</span>
                    <span>{taxAmount.toLocaleString()}원</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between">
                      <span>배송비</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-green-600">무료</span>
                        ) : (
                          `${deliveryFee.toLocaleString()}원`
                        )}
                      </span>
                    </div>
                  )}
                  {discountDetails.totalDiscount > 0 && (
                    <div className="space-y-1">
                      {discountDetails.couponDiscount > 0 && (
                        <div className="flex justify-between text-red-500">
                          <span>🎫 쿠폰 할인</span>
                          <span>-{discountDetails.couponDiscount.toLocaleString()}원</span>
                        </div>
                      )}
                      {discountDetails.pointDiscount > 0 && (
                        <div className="flex justify-between text-red-500">
                          <span>💰 포인트 할인</span>
                          <span>-{discountDetails.pointDiscount.toLocaleString()}P</span>
                        </div>
                      )}
                      <div className="flex justify-between text-red-500 font-medium border-t pt-1">
                        <span>총 할인 금액</span>
                        <span>-{discountDetails.totalDiscount.toLocaleString()}원</span>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>총 결제 금액</span>
                    <span className="text-blue-600">{totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              {/* 이용약관 동의 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    개인정보 수집·이용 및 주문 내용을 확인하였으며, 이에 동의합니다.
                  </span>
                </label>
              </div>

              {/* 주문하기 버튼 */}
              <button
                onClick={handleProceedToPayment}
                disabled={!agreedToTerms}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${!agreedToTerms
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                결제 방법 선택하기
              </button>
            </div>
          </div>)}

        {/* 결제 방법 선택 단계 */}
        {currentStep === 'payment' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                  amount={totalAmount}
                />

                {/* 결제 진행 버튼 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentStep('processing')}
                    className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                  >
                    {paymentMethod === 'card' && '💳 카드로 결제하기'}
                    {paymentMethod === 'toss' && '💚 토스페이로 결제하기'}
                    {paymentMethod === 'kakao' && '💛 카카오페이로 결제하기'}
                    {paymentMethod === 'naver' && '🟢 네이버페이로 결제하기'}
                    {paymentMethod === 'payco' && '🔵 페이코로 결제하기'}
                  </button>
                </div>
              </div>
            </div>

            {/* 주문 요약 (결제 단계) */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
              <h3 className="text-lg font-semibold mb-4">주문 요약</h3>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.storeProduct.id}`} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium">₩{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>소계</span>
                  <span>₩{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>세금</span>
                  <span>₩{taxAmount.toLocaleString()}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span>₩{deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>총 결제금액</span>
                  <span className="text-primary-color">₩{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handlePaymentCancel}
                  className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  이전 단계로
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 결제 처리 단계 */}
        {currentStep === 'processing' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <PaymentProcessor
                paymentMethod={paymentMethod}
                orderInfo={{
                  orderId: generateOrderNumber(),
                  orderName: `${selectedStore.name} 주문`,
                  amount: totalAmount,
                  customerName: deliveryAddress.name || '고객',
                  customerEmail: 'customer@example.com', // 실제로는 로그인한 사용자 정보 사용
                  customerPhone: deliveryAddress.phone
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFail={handlePaymentFail}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;