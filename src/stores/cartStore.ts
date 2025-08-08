import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, StoreProduct } from '../types/common';

export interface CartItem {
  id: string;
  product: Product;
  storeProduct: StoreProduct;
  quantity: number;
  subtotal: number;
}

// Coupon 인터페이스 정의 (데이터베이스 연동을 고려한 구조)
// %%수정됨: Coupon 인터페이스에 user_coupon_id 추가
export interface Coupon {
  code: string; // coupon_id
  user_coupon_id: string; // user_coupons.id
  discount: number; // 할인 금액 또는 비율
  type: 'percentage' | 'fixed';
  minAmount?: number;
  name?: string;
  description?: string;
}

interface CartStore {
  items: CartItem[];
  storeId: string | null;
  storeName: string | null;
  orderType: 'pickup' | 'delivery';
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  appliedPoints: number; // 적용된 포인트
  appliedCoupon: Coupon | null; // 적용된 쿠폰 정보
  
  // Actions
  addItem: (product: Product, storeProduct: StoreProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
  getItemCount: () => number;
  setOrderType: (type: 'pickup' | 'delivery') => void;
  applyPoints: (points: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,
      storeName: null,
      orderType: 'pickup' as const,
      subtotal: 0,
      taxAmount: 0,
      deliveryFee: 0,
      totalAmount: 0,
      appliedPoints: 0, // 초기 상태 추가
      appliedCoupon: null, // 초기 상태 추가

      addItem: (product, storeProduct, quantity = 1) => {
        let { items, storeId } = get();
        
        // 다른 지점의 상품이면 장바구니 초기화 확인
        if (storeId && storeId !== storeProduct.store_id) {
          const confirmed = window.confirm(
            '다른 지점의 상품입니다. 기존 장바구니를 비우고 새로 담으시겠습니까?'
          );
          if (!confirmed) return;
          
          console.log('🗑️ 다른 지점으로 인한 장바구니 초기화');
          set({
            items: [],
            storeId: storeProduct.store_id,
            storeName: null,
            orderType: 'pickup',
            subtotal: 0,
            taxAmount: 0,
            deliveryFee: 0,
            totalAmount: 0,
            appliedPoints: 0, // 장바구니 초기화 시 포인트/쿠폰도 초기화
            appliedCoupon: null
          });
          
          // 장바구니를 비운 후 새로운 상태를 가져오기
          items = [];
        }

        const existingItemIndex = items.findIndex(item => item.product.id === product.id);
        
        if (existingItemIndex >= 0) {
          // 기존 상품 수량 업데이트
          const updatedItems = [...items];
          const newQuantity = Math.min(
            updatedItems[existingItemIndex].quantity + quantity,
            storeProduct.stock_quantity
          );
          
          if (newQuantity > storeProduct.stock_quantity) {
            alert('재고가 부족합니다.');
            return;
          }
          
          const finalPrice = storeProduct.discount_rate > 0 
            ? storeProduct.price * (1 - storeProduct.discount_rate)
            : storeProduct.price;
            
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity,
            subtotal: finalPrice * newQuantity
          };
          set({ items: updatedItems });
        } else {
          // 재고 확인
          if (quantity > storeProduct.stock_quantity) {
            alert('재고가 부족합니다.');
            return;
          }
          
          // 새 상품 추가
          const finalPrice = storeProduct.discount_rate > 0 
            ? storeProduct.price * (1 - storeProduct.discount_rate)
            : storeProduct.price;
            
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            storeProduct,
            quantity,
            subtotal: finalPrice * quantity
          };
          set({
            items: [...items, newItem],
            storeId: storeProduct.store_id
          });
        }
        
        get().calculateTotals();
      },

      removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.product.id !== productId);
        set({ items: updatedItems });
        get().calculateTotals();
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const { items } = get();
        const updatedItems = items.map(item => {
          if (item.product.id === productId) {
            // 재고 확인
            if (quantity > item.storeProduct.stock_quantity) {
              alert('재고가 부족합니다.');
              return item;
            }
            
            const finalPrice = item.storeProduct.discount_rate > 0 
              ? item.storeProduct.price * (1 - item.storeProduct.discount_rate)
              : item.product.price;
              
            return {
              ...item,
              quantity,
              subtotal: finalPrice * quantity
            };
          }
          return item;
        });
        set({ items: updatedItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          storeId: null,
          storeName: null,
          orderType: 'pickup',
          subtotal: 0,
          taxAmount: 0,
          deliveryFee: 0,
          totalAmount: 0,
          appliedPoints: 0, // 장바구니 초기화 시 포인트/쿠폰도 초기화
          appliedCoupon: null
        });
      },

      calculateTotals: () => {
        const { items, orderType, appliedPoints, appliedCoupon } = get();
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const taxAmount = subtotal * 0.1; // 10% 세율
        
        // 배송비 계산 (픽업은 0원, 배송은 2만원 이상 무료배송)
        const deliveryFee = orderType === 'pickup' ? 0 : (subtotal >= 20000 ? 0 : 3000);
        let currentTotal = subtotal + taxAmount + deliveryFee;

        let discountAmount = 0;

        // 쿠폰 할인 적용
        if (appliedCoupon) {
          if (appliedCoupon.minAmount && currentTotal < appliedCoupon.minAmount) {
            // 최소 주문 금액 미달 시 쿠폰 적용 안 함
            console.warn(`쿠폰 "${appliedCoupon.code}"은(는) 최소 주문 금액 ${appliedCoupon.minAmount.toLocaleString()}원 이상에서만 적용됩니다.`);
            // 쿠폰 적용 해제 (사용자에게 알림 후)
            set({ appliedCoupon: null });
          } else {
            if (appliedCoupon.type === 'percentage') {
              discountAmount += currentTotal * appliedCoupon.discount;
            } else { // fixed
              discountAmount += appliedCoupon.discount;
            }
          }
        }

        // 포인트 할인 적용 (쿠폰 할인 후 금액에서 차감)
        // 포인트는 총 결제 금액을 0원 미만으로 만들 수 없음
        discountAmount += Math.min(appliedPoints, currentTotal - discountAmount);
        
        currentTotal -= discountAmount;
        
        // 최종 금액이 0원 미만이 되지 않도록 보정
        currentTotal = Math.max(0, currentTotal);

        set({
          subtotal,
          taxAmount,
          deliveryFee,
          totalAmount: currentTotal,
          // 할인 금액은 totalAmount에 반영되므로 별도 저장 필요 없음
        });
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      setOrderType: (type: 'pickup' | 'delivery') => {
        console.log('🚚 주문 타입 변경:', type);
        set({ orderType: type });
        get().calculateTotals(); // 배송비 및 할인 재계산
      },

      applyPoints: (points: number) => {
        set({ appliedPoints: points });
        get().calculateTotals(); // 포인트 적용 후 총 금액 재계산
      },

      applyCoupon: (coupon: Coupon) => {
        set({ appliedCoupon: coupon });
        get().calculateTotals(); // 쿠폰 적용 후 총 금액 재계산
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
        get().calculateTotals(); // 쿠폰 제거 후 총 금액 재계산
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        storeId: state.storeId,
        storeName: state.storeName,
        orderType: state.orderType,
        subtotal: state.subtotal,
        taxAmount: state.taxAmount,
        deliveryFee: state.deliveryFee,
        totalAmount: state.totalAmount,
        appliedPoints: state.appliedPoints, // persist에 추가
        appliedCoupon: state.appliedCoupon // persist에 추가
      })
    }
  )
);

export default useCartStore;
