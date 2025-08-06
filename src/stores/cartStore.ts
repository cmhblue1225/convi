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

interface CartStore {
  items: CartItem[];
  storeId: string | null;
  storeName: string | null;
  orderType: 'pickup' | 'delivery';
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  
  // Actions
  addItem: (product: Product, storeProduct: StoreProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
  getItemCount: () => number;
  setOrderType: (type: 'pickup' | 'delivery') => void;
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
        totalAmount: state.totalAmount
      })
    }
  )
);

export default useCartStore;