import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, type Coupon as CartCoupon } from '../../stores/cartStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { supabase } from '../../lib/supabase/client';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import PaymentProcessor from '../../components/payment/PaymentProcessor';
import { useAuthStore } from '../../stores/common/authStore';

// %%수정됨: 데이터베이스 스키마와 일치하는 타입 정의
interface DbCoupon {
  id: string; // coupons.id
  user_coupon_id: string; // user_coupons.id
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  expires_at?: string;
}

interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  detail_address?: string;
  postal_code?: string;
  is_default?: boolean;
}

type PaymentMethod = 'card' | 'cash' | 'mobile' | 'toss' | 'kakao' | 'naver' | 'payco';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const {
    items,
    storeId,
    orderType: cartOrderType,
    subtotal,
    taxAmount,
    deliveryFee,
    totalAmount,
    appliedPoints,
    appliedCoupon,
    setOrderType: setCartOrderType,
    applyPoints,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>(cartOrderType);
  const [deliveryAddress, setDeliveryAddress] = useState<Partial<DeliveryAddress>>({ name: '', address: '' });
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'processing'>('info');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [pointsToApply, setPointsToApply] = useState<number>(appliedPoints);
  const [showCouponList, setShowCouponList] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [userAvailablePoints, setUserAvailablePoints] = useState<number>(0);
  const [availableCoupons, setAvailableCoupons] = useState<DbCoupon[]>([]);

  const selectedStore = useMemo(() => JSON.parse(localStorage.getItem('selectedStore') || '{}'), []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        alert('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }

      setIsLoading(true);

      try {
        const [profileRes, couponRes, addressRes] = await Promise.all([
          supabase.from('profiles').select('points').eq('id', user.id).single(),
          supabase.from('user_coupons').select('id, is_used, used_at, coupons(*)').eq('user_id', user.id).eq('is_used', false),
          supabase.from('user_addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
        ]);

        if (profileRes.error) throw profileRes.error;
        setUserAvailablePoints(profileRes.data?.points || 0);

        if (couponRes.error) throw couponRes.error;
        const validCoupons: DbCoupon[] = (couponRes.data || [])
          .filter(uc => uc.coupons && (!uc.coupons.expires_at || new Date(uc.coupons.expires_at) > new Date()))
          .map(uc => ({
            id: uc.coupons!.id,
            user_coupon_id: uc.id,
            name: uc.coupons!.name,
            description: uc.coupons!.description || '',
            discount_type: uc.coupons!.discount_type as 'percentage' | 'fixed',
            discount_value: uc.coupons!.discount_value,
            min_order_amount: uc.coupons!.min_order_amount || undefined,
            expires_at: uc.coupons!.expires_at || undefined,
          }));
        setAvailableCoupons(validCoupons);

        if (addressRes.error) throw addressRes.error;
        setSavedAddresses(addressRes.data || []);
        const defaultAddress = (addressRes.data || []).find(addr => addr.is_default) || addressRes.data?.[0];
        if (defaultAddress) setDeliveryAddress(defaultAddress);

      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
        alert('정보를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      alert('장바구니가 비어있습니다.');
      navigate('/customer/products');
    } else if (!isLoading && !selectedStore.id) {
      alert('지점을 먼저 선택해주세요.');
      navigate('/customer');
    }
  }, [items, selectedStore, navigate, isLoading]);

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setPointsToApply(value);
  };

  const handleApplyPoints = () => {
    if (pointsToApply > userAvailablePoints) {
      alert(`보유 포인트(${userAvailablePoints.toLocaleString()}P)를 초과할 수 없습니다.`);
      setPointsToApply(userAvailablePoints);
      return;
    }
    applyPoints(pointsToApply);
    alert(`${pointsToApply.toLocaleString()} 포인트가 적용되었습니다.`);
  };

  const handleUseAllPoints = () => {
    let currentTotal = subtotal + taxAmount + deliveryFee;
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (!appliedCoupon.minAmount || currentTotal >= appliedCoupon.minAmount) {
        couponDiscount = appliedCoupon.type === 'percentage'
          ? currentTotal * appliedCoupon.discount
          : appliedCoupon.discount;
      }
    }
    const remainingAmount = currentTotal - couponDiscount;
    const maxUsablePoints = Math.min(userAvailablePoints, Math.floor(remainingAmount));
    setPointsToApply(maxUsablePoints);
  };

  const getUsableCoupons = () => {
    const currentOrderTotal = subtotal + taxAmount + deliveryFee;
    return availableCoupons.filter(coupon =>
      !coupon.min_order_amount || currentOrderTotal >= coupon.min_order_amount
    );
  };

  const handleSelectCoupon = (coupon: DbCoupon) => {
    const couponForStore: CartCoupon = {
      code: coupon.id,
      user_coupon_id: coupon.user_coupon_id,
      discount: coupon.discount_value,
      type: coupon.discount_type,
      minAmount: coupon.min_order_amount,
      name: coupon.name,
      description: coupon.description,
    };
    applyCoupon(couponForStore);
    setShowCouponList(false);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    alert('쿠폰 적용이 해제되었습니다.');
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value, id: undefined }));
  };

  const handleSelectSavedAddress = (addressId: string) => {
    const selected = savedAddresses.find(addr => addr.id === addressId);
    if (selected) setDeliveryAddress(selected);
  };

  const handleOrderTypeChange = (type: 'pickup' | 'delivery') => {
    setOrderType(type);
    setCartOrderType(type);
  };

  const validateForm = (): boolean => {
    if (!agreedToTerms) {
      alert('이용약관에 동의해주세요.');
      return false;
    }
    if (orderType === 'delivery' && (!deliveryAddress.name?.trim() || !deliveryAddress.address?.trim())) {
      alert('배송 정보를 모두 입력해주세요.');
      return false;
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

    const checkoutData = {
      items,
      storeId,
      storeName: selectedStore.name,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      subtotal,
      taxAmount,
      deliveryFee,
      totalAmount,
      paymentMethod,
      appliedPoints,
      appliedCoupon,
    };

    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('💳 결제 성공:', paymentResult);
  };

  const handlePaymentFail = (error: any) => {
    console.error('❌ 결제 실패:', error);
    const failParams = new URLSearchParams({
      code: 'PAYMENT_FAILED',
      message: error.message || '결제에 실패했습니다.',
      orderId: generateOrderNumber(),
      amount: totalAmount.toString(),
    });
    navigate(`/payment/fail?${failParams.toString()}`);
  };

  const discountDetails = useMemo(() => {
    const currentOrderTotal = subtotal + taxAmount + deliveryFee;
    let couponDiscount = 0;

    if (appliedCoupon) {
      if (!appliedCoupon.minAmount || currentOrderTotal >= appliedCoupon.minAmount) {
        couponDiscount = appliedCoupon.type === 'percentage'
          ? currentOrderTotal * appliedCoupon.discount
          : appliedCoupon.discount;
      }
    }

    const remainingAfterCoupon = currentOrderTotal - couponDiscount;
    const pointDiscount = Math.min(appliedPoints, Math.max(0, remainingAfterCoupon));

    return { couponDiscount, pointDiscount, totalDiscount: couponDiscount + pointDiscount };
  }, [subtotal, taxAmount, deliveryFee, appliedCoupon, appliedPoints]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">주문하기</h1>
        </div>

        {currentStep === 'info' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {orderType === 'delivery' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">배송 정보</h2>
                  {savedAddresses.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">배송지 선택</label>
                      <select
                        onChange={(e) => handleSelectSavedAddress(e.target.value)}
                        value={deliveryAddress.id || ''}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">직접 입력</option>
                        {savedAddresses.map(addr => (
                          <option key={addr.id} value={addr.id}>
                            {`[${addr.name}] ${addr.address}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                   {/* 배송 정보 입력 폼 */}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">포인트 적용</h2>
                  <span className="text-sm text-gray-600">
                    보유: {userAvailablePoints.toLocaleString()}P
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="number" value={pointsToApply} onChange={handlePointsChange} className="..." />
                  <button onClick={handleUseAllPoints} className="...">전체</button>
                  <button onClick={handleApplyPoints} className="...">적용</button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">쿠폰 적용</h2>
                  <button onClick={() => setShowCouponList(!showCouponList)} className="...">
                    {showCouponList ? '접기' : '쿠폰 선택'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div>...</div>
                )}
                {showCouponList && (
                  <div className="space-y-2">
                    {getUsableCoupons().length > 0 ? (
                      getUsableCoupons().map((coupon) => (
                        <div key={coupon.user_coupon_id} onClick={() => handleSelectCoupon(coupon)} className="... cursor-pointer">
                          <div className="font-medium">{coupon.name}</div>
                          <div className="text-sm">{coupon.description}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-3 text-center">사용 가능한 쿠폰이 없습니다</div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">결제 금액</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>상품 금액</span><span>{subtotal.toLocaleString()}원</span></div>
                    {discountDetails.couponDiscount > 0 && (
                        <div className="flex justify-between text-red-500"><span>🎫 쿠폰 할인</span><span>-{discountDetails.couponDiscount.toLocaleString()}원</span></div>
                    )}
                    {discountDetails.pointDiscount > 0 && (
                        <div className="flex justify-between text-red-500"><span>💰 포인트 할인</span><span>-{discountDetails.pointDiscount.toLocaleString()}P</span></div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg"><span>총 결제 금액</span><span className="text-blue-600">{totalAmount.toLocaleString()}원</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'payment' && user && (
          <PaymentProcessor
            paymentMethod={paymentMethod}
            orderInfo={{
              orderId: generateOrderNumber(),
              orderName: `${selectedStore.name} 주문`,
              amount: totalAmount,
              customerName: user.user_metadata.full_name || '고객',
              customerEmail: user.email || 'email@example.com',
              customerPhone: deliveryAddress.phone || undefined
            }}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFail={handlePaymentFail}
            onCancel={() => setCurrentStep('info')}
          />
        )}
      </div>
    </div>
  );
};

export default Checkout;