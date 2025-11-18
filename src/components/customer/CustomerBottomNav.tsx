import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';

const CustomerBottomNav: React.FC = () => {
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around">
        <NavLink
          to="/customer/home"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 text-xs ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`
          }
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          홈
        </NavLink>
        <NavLink
          to="/customer/categories"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 text-xs ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`
          }
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          카테고리
        </NavLink>
        <NavLink
          to="/customer/cart"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 text-xs relative ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`
          }
        >
          <div className="relative">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          장바구니
        </NavLink>
        <NavLink
          to="/customer/orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 text-xs ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`
          }
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          주문
        </NavLink>
        <NavLink
          to="/customer/profile"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 text-xs ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`
          }
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          프로필
        </NavLink>
      </div>
    </nav>
  );
};

export default CustomerBottomNav; 