import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuthStore } from '../../stores/common/authStore';
import { supabase } from '../../lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

interface WishlistButtonProps {
  productId: string;
  isWishlisted: boolean;
  onToggle: (newState: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = React.memo(({
  productId,
  isWishlisted,
  onToggle
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showError } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();  // 상품 클릭 이벤트 전파 방지
    
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      setIsLoading(true);

      if (isWishlisted) {
        // 찜 취소
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
        onToggle(false);
      } else {
        // 찜하기
        const { error } = await supabase
          .from('wishlists')
          .insert({ product_id: productId, user_id: user.id });

        if (error) throw error;
        onToggle(true);
      }
    } catch (error) {
      console.error('찜하기 토글 중 오류:', error);
      showError('찜하기 오류', '찜하기 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="relative group"
      aria-label={isWishlisted ? '찜 취소하기' : '찜하기'}
    >
      {isWishlisted ? (
        <HeartSolidIcon className="w-6 h-6 text-red-500 hover:scale-110 transition-transform" />
      ) : (
        <HeartIcon className="w-6 h-6 text-gray-400 group-hover:text-red-500 hover:scale-110 transition-all" />
      )}
      
      {/* 툴팁 */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {isWishlisted ? '찜 취소하기' : '찜하기'}
      </span>
    </button>
  );
});