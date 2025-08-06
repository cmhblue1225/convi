import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';

const CustomerHeader: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        // 로그아웃 성공 시 랜딩페이지로 이동
        navigate('/');
      } else {
        console.error('로그아웃 실패:', result.error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">편의점 솔루션</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.first_name} {profile?.last_name}
            </span>
            <button
              onClick={handleSignOut}
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