import React from 'react';
import { NavLink } from 'react-router-dom';

const HQSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-8">
        <div className="px-4">
          <NavLink
            to="/hq/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            대시보드
          </NavLink>
          <NavLink
            to="/hq/stores"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            지점 관리
          </NavLink>
          <NavLink
            to="/hq/products"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            상품 관리
          </NavLink>

          <NavLink
            to="/hq/supply"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-accent-100 text-accent-700'
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
            to="/hq/members"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            회원 관리
          </NavLink>
          <NavLink
            to="/hq/analytics"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            매출 분석
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default HQSidebar; 