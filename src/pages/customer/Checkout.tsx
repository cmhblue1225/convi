import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import type { DeliveryAddress } from '../../stores/orderStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { supabase } from '../../lib/supabase/client';
import { useAuthStore } from '../../stores/common/authStore';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import PaymentProcessor from '../../components/payment/PaymentProcessor';
import type { UserCoupon, CouponValidation } from '../../types/common';

// 결제 방법 타입 정의 (orderStore와 통일)
type PaymentMethod = 'card' | 'cash' | 'mobile' | 'toss' | 'kakao' | 'naver' | 'payco';

// DeliveryAddress는 orderStore에서 import

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    storeId,
    orderType: cartOrderType,
    subtotal,
    taxAmount,
    deliveryFee,
    totalAmount,
    setOrderType: setCartOrderType
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

  // 쿠폰/포인트 관련 상태 (최소한으로 추가)
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string>('');
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  const [orderNumber, setOrderNumber] = useState<string>('');

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

    // 재주문된 배송 주소가 있으면 복원
    const reorderDeliveryAddress = localStorage.getItem('reorder-delivery-address');
    if (reorderDeliveryAddress && orderType === 'delivery') {
      try {
        const restoredAddress = JSON.parse(reorderDeliveryAddress);
        setDeliveryAddress(restoredAddress);
        console.log('✅ 재주문 배송 주소 복원됨:', restoredAddress);
        
        // 복원 후 로컬 스토리지에서 제거
        localStorage.removeItem('reorder-delivery-address');
      } catch (error) {
        console.error('❌ 재주문 배송 주소 복원 실패:', error);
      }
    }

    // 쿠폰/포인트 정보 로드
    if (user) {
      fetchUserCoupons();
      fetchTotalPoints();
    }
  }, [items, selectedStore, navigate, user, orderType]);

  useEffect(() => {
    calculateFinalAmount();
  }, [totalAmount, couponValidation, pointsToUse]);

  // 쿠폰/포인트 관련 함수들
  const fetchUserCoupons = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_coupons')
        .select(`
          *,
          coupon:coupons(*)
        `)
        .eq('user_id', user.id)
        .eq('is_used', false);

      if (error) throw error;
      setUserCoupons(data || []);
    } catch (error) {
      console.error('쿠폰 조회 오류:', error);
    }
  };

  const fetchTotalPoints = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_total_points', {
        user_uuid: user.id
      });

      if (error) throw error;
      setTotalPoints(data || 0);
    } catch (error) {
      console.error('포인트 조회 오류:', error);
    }
  };

  const validateCoupon = async (couponCode: string) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        coupon_code: couponCode,
        user_uuid: user.id,
        order_amount: totalAmount
      });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      console.error('쿠폰 검증 오류:', error);
      return null;
    }
  };

  const calculateFinalAmount = () => {
    let amount = totalAmount;
    
    if (couponValidation?.is_valid) {
      amount -= couponValidation.discount_amount;
    }
    
    amount -= pointsToUse;
    
    setFinalAmount(Math.max(0, amount));
  };

  const handleCouponApply = async () => {
    if (!selectedCoupon) return;
    
    const validation = await validateCoupon(selectedCoupon);
    setCouponValidation(validation);
  };

  const handlePointsChange = (points: number) => {
    const maxPoints = Math.min(totalPoints, finalAmount);
    setPointsToUse(Math.min(points, maxPoints));
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOrderTypeChange = (type: 'pickup' | 'delivery') => {
    console.log('🚚 주문 타입 변경:', type);
    
    // 지점의 서비스 가능 여부 확인
    if (type === 'delivery' && !selectedStore.delivery_available) {
      alert('이 지점에서는 배송 서비스를 이용할 수 없습니다.');
      return;
    }
    
    if (type === 'pickup' && !selectedStore.pickup_available) {
      alert('이 지점에서는 픽업 서비스를 이용할 수 없습니다.');
      return;
    }
    
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
    
    // 주문번호 생성 (한 번만)
    if (!orderNumber) {
      const newOrderNumber = generateOrderNumber();
      setOrderNumber(newOrderNumber);
    }
    
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
      totalAmount: finalAmount, // 할인 적용된 최종 금액
      originalAmount: totalAmount, // 원래 금액
      paymentMethod: paymentMethod,
      // 쿠폰/포인트 정보 추가
      selectedCoupon: selectedCoupon,
      couponDiscount: couponValidation?.discount_amount || 0,
      pointsUsed: pointsToUse,
      orderNumber: orderNumber || generateOrderNumber()
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    console.log('💾 결제 정보 저장:', checkoutData);
    
    setCurrentStep('payment');
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
      amount: finalAmount.toString()
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
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep === step.id 
                  ? 'bg-primary-color text-white' 
                  : steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                <span className="text-lg">{step.icon}</span>
              </div>
              <span className={`ml-2 font-medium ${
                currentStep === step.id ? 'text-primary-color' : 'text-gray-600'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`mx-4 h-px w-12 ${
                  steps.findIndex(s => s.id === currentStep) > index
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
                {selectedStore.pickup_available && (
                  <button
                    onClick={() => handleOrderTypeChange('pickup')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      orderType === 'pickup'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏪</div>
                    <div className="font-medium">픽업</div>
                    <div className="text-sm text-gray-500">매장에서 직접 픽업</div>
                  </button>
                )}
                {selectedStore.delivery_available && (
                  <button
                    onClick={() => handleOrderTypeChange('delivery')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      orderType === 'delivery'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="font-medium">배송</div>
                    <div className="text-sm text-gray-500">집까지 배송</div>
                  </button>
                )}
                {!selectedStore.pickup_available && !selectedStore.delivery_available && (
                  <div className="col-span-2 p-4 text-center text-gray-500">
                    현재 이 지점에서는 주문 서비스를 이용할 수 없습니다.
                  </div>
                )}
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

            {/* 쿠폰/포인트 할인 (최소한으로 추가) */}
            {(userCoupons.length > 0 || totalPoints > 0) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">할인 혜택</h2>
                
                {userCoupons.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      쿠폰 ({userCoupons.length}개 보유)
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedCoupon}
                        onChange={(e) => setSelectedCoupon(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">쿠폰 선택</option>
                        {userCoupons.map((userCoupon) => (
                          <option key={userCoupon.id} value={userCoupon.coupon.code}>
                            {userCoupon.coupon.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleCouponApply}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        적용
                      </button>
                    </div>
                    {couponValidation && (
                      <p className={`text-sm mt-1 ${
                        couponValidation.is_valid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {couponValidation.message}
                      </p>
                    )}
                  </div>
                )}

                {totalPoints > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      포인트 ({totalPoints.toLocaleString()}P 보유)
                    </label>
                    <input
                      type="number"
                      value={pointsToUse}
                      onChange={(e) => handlePointsChange(Number(e.target.value))}
                      max={Math.min(totalPoints, finalAmount)}
                      min="0"
                      placeholder="사용할 포인트"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            )}

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
                {couponValidation?.is_valid && (
                  <div className="flex justify-between text-red-600">
                    <span>쿠폰 할인</span>
                    <span>-{couponValidation.discount_amount.toLocaleString()}원</span>
                  </div>
                )}
                {pointsToUse > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>포인트 할인</span>
                    <span>-{pointsToUse.toLocaleString()}원</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>총 결제 금액</span>
                  <span className="text-blue-600">{finalAmount.toLocaleString()}원</span>
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
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                !agreedToTerms
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              결제 방법 선택하기
            </button>
          </div>
        </div>
        )}

        {/* 결제 방법 선택 단계 */}
        {currentStep === 'payment' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                  amount={finalAmount}
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
                {couponValidation?.is_valid && (
                  <div className="flex justify-between text-red-600">
                    <span>쿠폰 할인</span>
                    <span>-₩{couponValidation.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                {pointsToUse > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>포인트 할인</span>
                    <span>-₩{pointsToUse.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>총 결제금액</span>
                  <span className="text-primary-color">₩{finalAmount.toLocaleString()}</span>
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
                  orderId: orderNumber || generateOrderNumber(),
                  orderName: `${selectedStore.name} 주문`,
                  amount: finalAmount,
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