import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import CustomerHeader from '../../components/customer/CustomerHeader';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CustomerLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const navigate = useNavigate();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // 로딩이 완료된 후에만 인증 상태 확인
    if (!isLoading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      if (!isAuthenticated) {
        console.log('🔓 CustomerLayout: 인증되지 않은 사용자, 랜딩 페이지로 이동');
        navigate('/', { replace: true });
      } else if (user && user.role !== 'customer') {
        // 고객이 아닌 경우 적절한 페이지로 리디렉션
        const roleRoutes = {
          store_owner: '/store/dashboard',
          headquarters: '/hq/dashboard',
          hq_admin: '/hq/dashboard',
        };
        const defaultRoute = roleRoutes[user.role as keyof typeof roleRoutes] || '/';
        console.log(`🔄 CustomerLayout: ${user.role} 역할 사용자, ${defaultRoute}로 이동`);
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, hasCheckedAuth]);

  // 로딩 중일 때는 로딩 스피너만 표시 (리디렉션하지 않음)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 인증 상태 확인이 완료되지 않았거나 인증되지 않은 경우
  if (!hasCheckedAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 고객이 아닌 경우 (navigate가 처리되기 전까지 빈 화면)
  if (user && user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 정상적인 고객 사용자인 경우
  console.log('✅ CustomerLayout: 고객 사용자 확인, 페이지 렌더링');
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      <main className="pb-20">
        <Outlet />
      </main>
      <CustomerBottomNav />
    </div>
  );
};

export default CustomerLayout; 