import React from 'react';
import { NavLink } from 'react-router-dom';

const StoreSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-8">
        <div className="px-4">
          <NavLink
            to="/store/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-secondary-100 text-secondary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            대시보드
          </NavLink>
          <NavLink
            to="/store/orders"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-secondary-100 text-secondary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            주문 관리
          </NavLink>
          <NavLink
            to="/store/inventory"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-secondary-100 text-secondary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            재고 관리
          </NavLink>
          <NavLink
            to="/store/supply"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-secondary-100 text-secondary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            물류 관리
          </NavLink>
          <NavLink
            to="/store/analytics"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-secondary-100 text-secondary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
            </svg>
            매출 분석
          </NavLink>

          <NavLink
            to="/store/inventory-analytics"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-secondary-100 text-secondary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            재고 분석
          </NavLink>


        </div>
      </nav>
    </aside>
  );
};

export default StoreSidebar; 