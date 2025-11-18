import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/common/authStore';
import { useWishlistStore } from '../../stores/wishlistStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { loadWishlists } = useWishlistStore();

  // 로그인한 사용자의 찜 목록 로드
  useEffect(() => {
    if (user) {
      loadWishlists();
    }
  }, [user, loadWishlists]);

  return (
    <div>
      {/* 기존 레이아웃 컴포넌트 내용 */}
      {children}
    </div>
  );
};
