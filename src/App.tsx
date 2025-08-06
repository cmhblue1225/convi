import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeAuth, useAuthStore } from './stores/common/authStore';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';


// Customer Pages
import CustomerLayout from './pages/customer/CustomerLayout';
import StoreSelection from './pages/customer/StoreSelection';
import ProductCatalog from './pages/customer/ProductCatalog';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import CustomerCategories from './pages/customer/CustomerCategories';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerProfile from './pages/customer/CustomerProfile';

// Payment Pages
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFail from './pages/payment/PaymentFail';

// Store Pages
import StoreLayout from './pages/store/StoreLayout';
import StoreDashboard from './pages/store/StoreDashboard';
import StoreOrders from './pages/store/StoreOrders';
import StoreInventory from './pages/store/StoreInventory';
import StoreSupply from './pages/store/StoreSupply';

// HQ Pages
import HQLayout from './pages/hq/HQLayout';
import HQDashboard from './pages/hq/HQDashboard';
import HQStores from './pages/hq/HQStores';
import HQProducts from './pages/hq/HQProducts';
import HQSupply from './pages/hq/HQSupply';
import HQAnalytics from './pages/hq/HQAnalytics';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // 인증 초기화 (보편적인 수준으로 복원)
    console.log('🔐 App.tsx - 인증 초기화 시작 (세션 복원)');
    initializeAuth();
  }, []);

  console.log('🎯 App.tsx 렌더링 - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user?.role);

  // 초기 인증 확인 중에는 로딩 스피너 표시
  if (isLoading) {
    console.log('⏳ App.tsx - 인증 로딩 중, 로딩 스피너 표시');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  console.log('✅ App.tsx - 인증 완료, 라우터 렌더링');

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route path="/test-store-selection" element={<StoreSelection />} />
            <Route path="/test-products" element={<ProductCatalog />} />
            
            {/* Customer Routes - 임시로 보호 해제 (테스트용) */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<StoreSelection />} />
              <Route path="products" element={<ProductCatalog />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="orders/:orderId/tracking" element={<OrderTracking />} />
              <Route path="categories" element={<CustomerCategories />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

            {/* Payment Routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            <Route path="/payment/kakao/success" element={<PaymentSuccess />} />
            <Route path="/payment/kakao/fail" element={<PaymentFail />} />
            <Route path="/payment/kakao/cancel" element={<PaymentFail />} />

            {/* Store Routes */}
            <Route
              path="/store"
              element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <StoreLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StoreDashboard />} />
              <Route path="orders" element={<StoreOrders />} />
              <Route path="inventory" element={<StoreInventory />} />
              <Route path="supply" element={<StoreSupply />} />
            </Route>

            {/* HQ Routes */}
            <Route
              path="/hq"
              element={
                <ProtectedRoute allowedRoles={['headquarters', 'hq_admin']}>
                  <HQLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HQDashboard />} />
              <Route path="stores" element={<HQStores />} />
              <Route path="products" element={<HQProducts />} />
              <Route path="supply" element={<HQSupply />} />
              <Route path="analytics" element={<HQAnalytics />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
