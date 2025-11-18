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
            <h1
              className="text-lg font-semibold text-gray-900 cursor-pointer"
              onClick={() => navigate('/')}
              style={{ userSelect: 'none' }}
            >
              편의점 솔루션
            </h1>
            <div className="flex items-center space-x-4">
              {/* 장바구니 아이콘 */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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