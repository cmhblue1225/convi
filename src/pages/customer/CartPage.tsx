import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    storeId,
    storeName,
    orderType,
    subtotal,
    taxAmount,
    deliveryFee,
    totalAmount,
    removeItem,
    updateQuantity,
    clearCart,
    setOrderType,
    calculateTotals
  } = useCartStore();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setIsUpdating(true);
    try {
      updateQuantity(productId, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    if (window.confirm('이 상품을 장바구니에서 제거하시겠습니까?')) {
      removeItem(productId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니의 모든 상품을 제거하시겠습니까?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
    navigate('/customer/checkout');
  };

  const handleContinueShopping = () => {
    if (storeId) {
      navigate(`/customer/products?store=${storeId}`);
    } else {
      navigate('/customer/store');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
            <button
              onClick={handleContinueShopping}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
              <p className="text-gray-600 mt-1">
                {storeName} • 총 {items.length}개 상품
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearCart}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                장바구니 비우기
              </button>
              <button
                onClick={handleContinueShopping}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                쇼핑 계속하기
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 장바구니 상품 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">상품 목록</h2>
              </div>
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* 상품 이미지 */}
                      <div className="flex-shrink-0">
                        {(item.product.image_urls && item.product.image_urls.length > 0) || item.product.image_url ? (
                          <img
                            src={item.product.image_urls?.[0] || item.product.image_url}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* 상품 정보 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.storeProduct.discount_rate > 0 ? (
                            <>
                              <span className="line-through text-gray-400">
                                {item.storeProduct.price.toLocaleString()}원
                              </span>
                              <span className="ml-2 text-red-600 font-medium">
                                {Math.round(item.storeProduct.price * (1 - item.storeProduct.discount_rate)).toLocaleString()}원
                              </span>
                            </>
                          ) : (
                            <span>{item.storeProduct.price.toLocaleString()}원</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          재고: {item.storeProduct.stock_quantity}개
                        </p>
                      </div>

                      {/* 수량 조절 */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          disabled={isUpdating || item.quantity >= item.storeProduct.stock_quantity}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* 소계 */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {item.subtotal.toLocaleString()}원
                        </p>
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">주문 요약</h2>
              
              {/* 주문 타입 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주문 타입
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrderType('pickup')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      orderType === 'pickup'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    픽업
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      orderType === 'delivery'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    배송
                  </button>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>부가세 (10%)</span>
                  <span>{taxAmount.toLocaleString()}원</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span>{deliveryFee.toLocaleString()}원</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>총 결제 금액</span>
                    <span className="text-blue-600">{totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              {/* 주문하기 버튼 */}
              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || isUpdating}
                className="w-full mt-6 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">처리 중...</span>
                  </div>
                ) : (
                  '주문하기'
                )}
              </button>

              {/* 안내 메시지 */}
              <div className="mt-4 text-xs text-gray-500">
                {orderType === 'delivery' && (
                  <p>• 2만원 이상 주문 시 배송비 무료</p>
                )}
                <p>• 주문 후 결제 페이지에서 결제 방법을 선택하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
