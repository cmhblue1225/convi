import React from 'react';
import { useAuthStore } from '../../stores/common/authStore';

const CustomerHeader: React.FC = () => {
  const { profile, signOut } = useAuthStore();

  const getDisplayName = () => {
    if (profile) {
      return `${profile.first_name} ${profile.last_name}`.trim() || '고객';
    }
    return '고객';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">편의점 솔루션</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {getDisplayName()}님
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader; 