import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import CustomerHeader from '../../components/customer/CustomerHeader';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CustomerLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 로딩이 완료된 후 인증 상태 확인
    if (!isLoading && !isAuthenticated) {
      console.log('🔓 CustomerLayout: 인증되지 않은 사용자, 랜딩 페이지로 이동');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 인증되지 않은 경우 (navigate가 처리되기 전까지 빈 화면)
  if (!isAuthenticated) {
    return null;
  }

  // 고객이 아닌 경우 적절한 페이지로 리디렉션
  if (user && user.role !== 'customer') {
    const roleRoutes = {
      store_owner: '/store/dashboard',
      headquarters: '/hq/dashboard',
      hq_admin: '/hq/dashboard',
    };
    const defaultRoute = roleRoutes[user.role as keyof typeof roleRoutes] || '/';
    navigate(defaultRoute, { replace: true });
    return null;
  }

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