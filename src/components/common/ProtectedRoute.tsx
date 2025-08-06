import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import type { UserRole } from '../../types/common';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 권한이 없는 경우
  if (!allowedRoles.includes(user.role)) {
    // 역할에 따른 기본 페이지로 리다이렉트
    const roleRoutes = {
      customer: '/customer/home',
      store_owner: '/store/dashboard',
      headquarters: '/hq/dashboard',
      hq_admin: '/hq/dashboard', // 호환성을 위해 유지
    };

    const defaultRoute = roleRoutes[user.role] || '/';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 