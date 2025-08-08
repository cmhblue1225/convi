import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    items,
    orderType,
    subtotal,
    taxAmount,
    deliveryFee,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    setOrderType
  } = useCartStore();

  if (!isOpen) return null;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const item = items.find(item => item.product.id === productId);
    if (item) {
      console.log(`📦 수량 변경: ${item.product.name} ${item.quantity} → ${newQuantity}`);
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    const item = items.find(item => item.product.id === productId);
    if (item) {
      console.log(`🗑️ 상품 삭제: ${item.product.name} (${item.quantity}개)`);
    }
    removeItem(productId);
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니를 비우시겠습니까?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
    
    console.log('🛒 주문 진행:', { orderType, itemCount: getItemCount(), totalAmount });
    
    // 장바구니 닫기
    onClose();
    
    // 주문 페이지로 이동
    navigate('/customer/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 장바구니 패널 */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">장바구니</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 장바구니 내용 */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m6-5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                  </svg>
                </div>
                <p className="text-gray-500">장바구니가 비어있습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const discountRate = item.storeProduct.discount_rate || 0;
                  const hasDiscount = discountRate > 0;
                  const originalPrice = item.storeProduct.price;
                  const discountedPrice = hasDiscount 
                    ? originalPrice * (1 - discountRate)
                    : originalPrice;

                  return (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.product.name}</h3>
                          {item.product.brand && (
                            <p className="text-xs text-gray-500">{item.product.brand}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* 가격 정보 */}
                      <div className="mb-2">
                        {hasDiscount ? (
                          <div>
                            <span className="text-sm font-medium text-red-600">
                              {discountedPrice.toLocaleString()}원
                            </span>
                            <span className="text-xs text-gray-500 line-through ml-2">
                              {originalPrice.toLocaleString()}원
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium">
                            {originalPrice.toLocaleString()}원
                          </span>
                        )}
                      </div>
                      
                      {/* 수량 조절 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            disabled={item.quantity >= item.storeProduct.stock_quantity}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm font-semibold">
                          {(item.subtotal || 0).toLocaleString()}원
                        </div>
                      </div>
                      
                      {/* 재고 정보 */}
                      <div className="text-xs text-gray-500 mt-1">
                        원래 재고: {item.storeProduct.stock_quantity}개 / 
                        남은 재고: {item.storeProduct.stock_quantity - item.quantity}개
                      </div>
                    </div>
                  );
                })}
                
                {/* 전체 삭제 버튼 */}
                <button
                  onClick={handleClearCart}
                  className="w-full text-sm text-red-600 hover:text-red-800 py-2"
                >
                  장바구니 비우기
                </button>
              </div>
            )}
          </div>

          {/* 주문 옵션 및 결제 정보 */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* 주문 타입 선택 */}
              <div>
                <p className="text-sm font-medium mb-2">주문 방식</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrderType('pickup')}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border ${
                      orderType === 'pickup'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    🏪 픽업
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border ${
                      orderType === 'delivery'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    🚚 배송
                  </button>
                </div>
              </div>
              
              {/* 금액 정보 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{(subtotal || 0).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>부가세</span>
                  <span>{(taxAmount || 0).toLocaleString()}원</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">무료</span>
                      ) : (
                        `${(deliveryFee || 0).toLocaleString()}원`
                      )}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>총 결제 금액</span>
                  <span>{(totalAmount || 0).toLocaleString()}원</span>
                </div>
                
                {/* 무료배송 안내 */}
                {orderType === 'delivery' && subtotal < 20000 && (
                  <p className="text-xs text-gray-500">
                    {(20000 - (subtotal || 0)).toLocaleString()}원 더 주문하면 무료배송
                  </p>
                )}
              </div>
              
              {/* 주문하기 버튼 */}
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
              >
                주문하기 ({getItemCount()}개)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;