import React from 'react';
import { useAuthStore } from '../../stores/common/authStore';

const HQHeader: React.FC = () => {
  const { profile, signOut, forceSignOut } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">본사 관리 시스템</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.first_name} {profile?.last_name}
            </span>
            <button
              onClick={async () => {
                console.log('🔓 HQ 로그아웃 버튼 클릭');
                try {
                  const result = await signOut();
                  console.log('🔓 로그아웃 결과:', result);
                  
                  if (result.success) {
                    // 성공하면 1초 후 리다이렉트
                    setTimeout(() => {
                      console.log('🔄 성공 후 페이지 이동');
                      window.location.href = '/';
                    }, 1000);
                  } else {
                    // 실패하면 강제 로그아웃
                    console.warn('⚠️ 일반 로그아웃 실패, 강제 로그아웃 시도');
                    forceSignOut();
                  }
                  
                } catch (error) {
                  console.warn('⚠️ 로그아웃 중 예외, 강제 로그아웃:', error);
                  // 예외 발생 시 강제 로그아웃
                  forceSignOut();
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

export default HQHeader; 