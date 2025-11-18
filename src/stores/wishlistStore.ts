import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';

interface WishlistState {
  wishlists: Record<string, boolean>;  // product_id를 키로 하는 찜 상태
  isLoading: boolean;
  error: string | null;

  // Actions
  toggleWishlist: (productId: string) => Promise<void>;
  loadWishlists: () => Promise<void>;
  checkIsWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  wishlists: {},
  isLoading: false,
  error: null,

  toggleWishlist: async (productId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { wishlists } = get();
      const isWishlisted = wishlists[productId];

      if (isWishlisted) {
        // 찜 취소
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('product_id', productId);

        if (error) throw error;

        set(state => ({
          wishlists: {
            ...state.wishlists,
            [productId]: false
          }
        }));
      } else {
        // 찜하기
        const { error } = await supabase
          .from('wishlists')
          .insert({ product_id: productId });

        if (error) throw error;

        set(state => ({
          wishlists: {
            ...state.wishlists,
            [productId]: true
          }
        }));
      }
    } catch (error) {
      console.error('찜하기 토글 중 오류:', error);
      set({ error: '찜하기 처리 중 오류가 발생했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadWishlists: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id');

      if (error) throw error;

      const wishlistMap: Record<string, boolean> = {};
      data.forEach(item => {
        wishlistMap[item.product_id] = true;
      });

      set({ wishlists: wishlistMap });
    } catch (error) {
      console.error('찜 목록 로드 중 오류:', error);
      set({ error: '찜 목록을 불러오는 중 오류가 발생했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  checkIsWishlisted: (productId: string) => {
    return get().wishlists[productId] || false;
  },
}));