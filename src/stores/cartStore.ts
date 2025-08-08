import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, StoreProduct } from '../types/common';
import { supabase } from '../lib/supabase/client'; // Supabase 클라이언트 임포트

export interface CartItem {
  id: string;
  product: Product;
  storeProduct: StoreProduct;
  quantity: number;
  subtotal: number;
}

// Coupon 인터페이스 정의 (데이터베이스 연동을 고려한 구조)
export interface Coupon {
  id: string; // Added
  code: string;
  name: string; // Made required as per DB
  description: string | null; // Can be null as per DB
  discount_type: 'percentage' | 'fixed'; // Renamed from 'type'
  discount_value: number; // Renamed from 'discount'
  min_amount: number; // Renamed from 'minAmount', made required
  max_discount?: number; // Added
  is_membership_only: boolean; // Added
  valid_from: string; // Added, assuming ISO string from DB
  valid_until?: string; // Added, assuming ISO string from DB
  is_active: boolean; // Added
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
  userAvailablePoints: number; // 사용자 보유 포인트 상태 추가
  
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
  fetchUserPoints: () => Promise<void>; // 사용자 포인트 가져오는 액션 추가
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
      userAvailablePoints: 0, // 초기값 0으로 설정

      fetchUserPoints: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('사용자 포인트 조회 실패:', error);
            set({ userAvailablePoints: 0 }); // 오류 시 0으로 설정
          } else if (data) {
            set({ userAvailablePoints: data.points || 0 });
          }
        } else {
          set({ userAvailablePoints: 0 }); // 사용자 로그인 안 되어 있으면 0
        }
      },

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
          
          const discountRate = storeProduct.discount_rate || 0;
          const finalPrice = discountRate > 0 
            ? storeProduct.price * (1 - discountRate)
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
          const discountRate2 = storeProduct.discount_rate || 0;
          const finalPrice = discountRate2 > 0 
            ? storeProduct.price * (1 - discountRate2)
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
            
            const discountRate3 = item.storeProduct.discount_rate || 0;
            const finalPrice = discountRate3 > 0 
              ? item.storeProduct.price * (1 - discountRate3)
              : item.product.base_price;
              
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
          if (appliedCoupon.min_amount && currentTotal < appliedCoupon.min_amount) {
            // 최소 주문 금액 미달 시 쿠폰 적용 안 함
            console.warn(`쿠폰 "${appliedCoupon.code}"은(는) 최소 주문 금액 ${appliedCoupon.min_amount.toLocaleString()}원 이상에서만 적용됩니다.`);
            // 쿠폰 적용 해제 (사용자에게 알림 후)
            set({ appliedCoupon: null });
          } else {
            if (appliedCoupon.discount_type === 'percentage') {
              discountAmount += currentTotal * appliedCoupon.discount_value;
            } else { // fixed
              discountAmount += appliedCoupon.discount_value;
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

      applyPoints: async (points: number) => { // async로 변경
        const { userAvailablePoints, calculateTotals } = get();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          alert('로그인이 필요합니다.');
          return;
        }

        if (points > userAvailablePoints) {
          alert(`보유 포인트(${userAvailablePoints.toLocaleString()}P)를 초과할 수 없습니다.`);
          return;
        }

        // Supabase 함수 호출 (포인트 사용)
        // 실제 결제 시점에 호출하는 것이 더 정확하지만, 일단 여기서 호출 예시
        try {
          // 포인트 사용은 음수로 전달
          const { data, error } = await supabase.rpc('update_user_points', {
            p_user_id: user.id,
            p_points: -points, // 사용은 음수
            p_transaction_type: 'spend',
            p_description: '장바구니 포인트 사용',
            p_reference_type: 'cart_checkout', // 임시 참조 타입
            p_reference_id: undefined // 주문 ID는 결제 완료 후 할당
          });

          if (error) {
            console.error('포인트 사용 실패:', error);
            alert('포인트 사용에 실패했습니다. 다시 시도해주세요.');
            return;
          }

          if (data) { // data는 BOOLEAN (TRUE)
            set({ appliedPoints: points });
            calculateTotals(); // 포인트 적용 후 총 금액 재계산
            get().fetchUserPoints(); // 사용 후 잔액 업데이트
            alert(`${points.toLocaleString()} 포인트가 적용되었습니다.`);
          }
        } catch (error) {
          console.error('포인트 사용 RPC 호출 오류:', error);
          alert('포인트 사용 중 오류가 발생했습니다.');
        }
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
