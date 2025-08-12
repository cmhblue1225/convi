import React from 'react';
import { useAuthStore } from '../../stores/common/authStore';
import { useNavigate } from 'react-router-dom';

const StoreHeader: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1
            className="text-xl font-semibold text-gray-900 cursor-pointer"
            onClick={() => navigate('/')}
            style={{ userSelect: 'none' }}
          >
            점주 대시보드
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.first_name} {profile?.last_name}
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
  );
};

export default StoreHeader; 