import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import { useCartStore } from '../../stores/cartStore';
import Cart from './Cart';

const CustomerHeader: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getDisplayName = () => {
    if (profile) {
      return `${profile.first_name} ${profile.last_name}`.trim() || '고객';
    }
    return '고객';
  };

  const itemCount = getItemCount();

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">편의점 솔루션</h1>
            <div className="flex items-center space-x-4">
              {/* 장바구니 아이콘 */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
              
              {/* 장바구니 전체 페이지로 이동 버튼 */}
              <button
                onClick={() => navigate('/customer/cart')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                장바구니
              </button>
              
              <span className="text-sm text-gray-600">
                {getDisplayName()}님
              </span>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.reload();
                  } catch (error) {
                    console.warn('로그아웃 중 오류, 페이지 새로고침:', error);
                    window.location.reload();
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 장바구니 사이드 패널 */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default CustomerHeader; 