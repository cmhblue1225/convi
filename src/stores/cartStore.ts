import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, StoreProduct } from '../types/common';

export interface CartItem {
  id: string;
  product: Product;
  storeProduct: StoreProduct;
  quantity: number;
  subtotal: number;
  options?: Record<string, any>; // 상품 옵션 정보 (색상, 사이즈 등)
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
  reorderHistory: Array<{
    orderId: string;
    orderNumber: string;
    reorderDate: string;
    itemCount: number;
    totalAmount: number;
  }>;
  
  // Actions
  addItem: (product: Product, storeProduct: StoreProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
  getItemCount: () => number;
  setOrderType: (type: 'pickup' | 'delivery') => void;
  reorderFromOrder: (orderItems: any[], storeId: string, storeName: string, orderType?: 'pickup' | 'delivery', deliveryAddress?: any) => Promise<{ success: boolean; message: string; unavailableItems?: string[]; itemCount?: number; totalAmount?: number }>;
  addToReorderHistory: (orderInfo: { orderId: string; orderNumber: string; reorderDate: string; itemCount: number; totalAmount: number }) => void;
  getReorderHistory: () => Array<{ orderId: string; orderNumber: string; reorderDate: string; itemCount: number; totalAmount: number }>;
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
      reorderHistory: [],

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
          totalAmount: 0
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
          
          const finalPrice = (storeProduct.discount_rate || 0) > 0 
            ? storeProduct.price * (1 - (storeProduct.discount_rate || 0))
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
          const finalPrice = (storeProduct.discount_rate || 0) > 0 
            ? storeProduct.price * (1 - (storeProduct.discount_rate || 0))
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
            
            const finalPrice = (item.storeProduct.discount_rate || 0) > 0 
              ? item.storeProduct.price * (1 - (item.storeProduct.discount_rate || 0))
              : item.storeProduct.price;
              
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
          totalAmount: 0
        });
      },

      calculateTotals: () => {
        const { items, orderType } = get();
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const taxAmount = subtotal * 0.1; // 10% 세율
        
        // 배송비 계산 (픽업은 0원, 배송은 2만원 이상 무료배송)
        const deliveryFee = orderType === 'pickup' ? 0 : (subtotal >= 20000 ? 0 : 3000);
        const totalAmount = subtotal + taxAmount + deliveryFee;
        
        set({
          subtotal,
          taxAmount,
          deliveryFee,
          totalAmount
        });
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      setOrderType: (type: 'pickup' | 'delivery') => {
        console.log('🚚 주문 타입 변경:', type);
        set({ orderType: type });
        get().calculateTotals(); // 배송비 재계산
      },

      reorderFromOrder: async (orderItems, storeId, storeName, orderType = 'pickup', deliveryAddress = null) => {
        console.log('🔄 재주문 시작:', { orderItems, storeId, storeName, orderType, deliveryAddress });
        
        try {
          // Supabase에서 현재 재고 상태 확인
          const { supabase } = await import('../lib/supabase/client');
          
          const unavailableItems: string[] = [];
          const availableItems: any[] = [];
          
          // 각 상품의 재고 상태 확인
          for (const item of orderItems) {
            const { data: storeProduct, error } = await supabase
              .from('store_products')
              .select(`
                *,
                products (*)
              `)
              .eq('store_id', storeId)
              .eq('product_id', item.productId)
              .single();
            
            if (error || !storeProduct) {
              console.warn(`⚠️ 상품 정보 조회 실패: ${item.productName}`, error);
              unavailableItems.push(`${item.productName} (상품 정보 없음)`);
              continue;
            }
            
            // 재고 확인
            if (storeProduct.stock_quantity < item.quantity) {
              unavailableItems.push(`${item.productName} (재고 부족: ${storeProduct.stock_quantity}/${item.quantity})`);
              continue;
            }
            
            // 상품이 비활성화되었는지 확인
            if (!storeProduct.is_available) {
              unavailableItems.push(`${item.productName} (판매 중단)`);
              continue;
            }
            
            availableItems.push({
              product: storeProduct.products,
              storeProduct,
              quantity: item.quantity,
              originalOptions: item.options || {} // 원본 옵션 정보 보존
            });
          }
          
          // 사용 불가능한 상품이 있으면 에러 반환
          if (unavailableItems.length > 0) {
            const message = `다음 상품들은 재주문이 불가능합니다:\n\n${unavailableItems.join('\n')}`;
            return {
              success: false,
              message,
              unavailableItems
            };
          }
          
          // 장바구니 초기화 (다른 지점이거나 기존 장바구니가 있는 경우)
          const currentStoreId = get().storeId;
          if (currentStoreId && currentStoreId !== storeId) {
            const confirmed = window.confirm(
              '다른 지점의 상품입니다. 기존 장바구니를 비우고 새로 담으시겠습니까?'
            );
            if (!confirmed) {
              return {
                success: false,
                message: '재주문이 취소되었습니다.'
              };
            }
          }
          
          // 장바구니 초기화 및 새 상품들 추가
          set({
            items: [],
            storeId,
            storeName,
            orderType,
            subtotal: 0,
            taxAmount: 0,
            deliveryFee: 0,
            totalAmount: 0
          });
          
          // 배송 주소가 있으면 설정
          if (deliveryAddress && orderType === 'delivery') {
            // 배송 주소 정보를 로컬 스토리지에 저장 (체크아웃 페이지에서 사용)
            localStorage.setItem('reorder-delivery-address', JSON.stringify(deliveryAddress));
            console.log('📍 재주문 배송 주소 복원:', deliveryAddress);
          }
          
          // 사용 가능한 상품들을 장바구니에 추가
          for (const item of availableItems) {
            // 할인율 계산 (store_products의 discount_rate 사용)
            const discountRate = item.storeProduct.discount_rate || 0;
            const finalPrice = discountRate > 0 
              ? item.storeProduct.price * (1 - discountRate)
              : item.storeProduct.price;
              
            const newItem: CartItem = {
              id: `${item.product.id}-${Date.now()}-${Math.random()}`,
              product: item.product,
              storeProduct: item.storeProduct,
              quantity: item.quantity,
              subtotal: finalPrice * item.quantity,
              options: item.originalOptions // 원본 옵션 정보 복원
            };
            
            set((state) => ({
              items: [...state.items, newItem]
            }));
          }
          
          // 총액 계산
          get().calculateTotals();
          
          // 재주문 히스토리에 추가
          const reorderInfo = {
            orderId: orderItems[0]?.orderId || 'unknown',
            orderNumber: orderItems[0]?.orderNumber || 'unknown',
            reorderDate: new Date().toISOString(),
            itemCount: availableItems.length,
            totalAmount: get().totalAmount
          };
          get().addToReorderHistory(reorderInfo);
          
          console.log('✅ 재주문 완료:', availableItems.length, '개 상품');
          return {
            success: true,
            message: `${availableItems.length}개 상품이 장바구니에 담겼습니다.${orderType === 'delivery' ? ' 배송 정보도 복원되었습니다.' : ''}`,
            itemCount: availableItems.length,
            totalAmount: get().totalAmount
          };
          
        } catch (error) {
          console.error('❌ 재주문 실패:', error);
          return {
            success: false,
            message: '재주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
          };
        }
      },

      addToReorderHistory: (orderInfo) => {
        set((state) => ({
          reorderHistory: [...state.reorderHistory, orderInfo]
        }));
      },

      getReorderHistory: () => {
        return get().reorderHistory;
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
        reorderHistory: state.reorderHistory
      })
    }
  )
);

export default useCartStore;