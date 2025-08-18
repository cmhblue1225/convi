import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeAuth, useAuthStore } from './stores/common/authStore';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { enhanceFocusVisibility, checkAccessibility } from './utils/accessibility';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';


// Customer Pages
import CustomerHome from './pages/customer/CustomerHome';
import CustomerLayout from './pages/customer/CustomerLayout';
import StoreSelection from './pages/customer/StoreSelection';
import ProductCatalog from './pages/customer/ProductCatalog';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import CustomerCategories from './pages/customer/CustomerCategories';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerProfile from './pages/customer/CustomerProfile';
import CartPage from './pages/customer/CartPage';
import PromotionProducts from './pages/customer/PromotionProducts';
import CustomerRefunds from './pages/customer/CustomerRefunds';
import CreateRefund from './pages/customer/CreateRefund';

// Payment Pages
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFail from './pages/payment/PaymentFail';

// Store Pages
import StoreLayout from './pages/store/StoreLayout';
import StoreDashboard from './pages/store/StoreDashboard';
import StoreOrders from './pages/store/StoreOrders';
import StoreInventory from './pages/store/StoreInventory';
import StoreSupply from './pages/store/StoreSupply';
import StoreAnalytics from './pages/store/StoreAnalytics';
import StoreInventoryAnalytics from './pages/store/StoreInventoryAnalytics';
import StoreRefunds from './pages/store/StoreRefunds';

// HQ Pages
import HQLayout from './pages/hq/HQLayout';
import HQDashboard from './pages/hq/HQDashboard';
import HQStores from './pages/hq/HQStores';
import HQProducts from './pages/hq/HQProducts';
import HQMembers from './pages/hq/HQMembers';
import HQSupply from './pages/hq/HQSupply';
import HQAnalytics from './pages/hq/HQAnalytics';
import ProductExcelTemplate from './pages/hq/ProductExcelTemplate';

// Support Pages
import CustomerSupport from './pages/support/CustomerSupport';
import QASupport from './pages/support/QASupport';
import FAQSupport from './pages/support/FAQSupport';

// Company Pages
import About from './pages/company/About';
import Careers from './pages/company/Careers';
import Privacy from './pages/company/Privacy';

// Manual Pages
import ManualMain from './pages/manual/ManualMain';
import CustomerManual from './pages/manual/CustomerManual';
import StoreManual from './pages/manual/StoreManual';
import HQManual from './pages/manual/HQManual';

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 인증 초기화
    const initAuth = async () => {
      console.log('🔐 App.tsx - 인증 초기화 시작 (세션 복원)');
      try {
        await initializeAuth();
      } catch (error) {
        console.error('❌ 인증 초기화 실패:', error);
      } finally {
        setIsInitialized(true);
        console.log('✅ App.tsx - 인증 초기화 완료');
      }
    };

    // 접근성 초기화
    const initAccessibility = () => {
      console.log('♿ 접근성 기능 초기화 중...');
      enhanceFocusVisibility();
      
      // 개발 모드에서만 접근성 검사
      if (process.env.NODE_ENV === 'development') {
        // 페이지 로드 후 1초 뒤에 접근성 검사
        setTimeout(() => {
          checkAccessibility();
        }, 1000);
      }
      
      console.log('✅ 접근성 기능 초기화 완료');
    };

    initAuth();
    initAccessibility();
  }, []);

  console.log('🎯 App.tsx 렌더링 - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user?.role, 'isInitialized:', isInitialized);

  // 초기화가 완료되지 않았거나 인증 로딩 중일 때는 로딩 스피너 표시
  if (!isInitialized || isLoading) {
    console.log('⏳ App.tsx - 초기화 또는 인증 로딩 중, 로딩 스피너 표시');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  console.log('✅ App.tsx - 초기화 완료, 라우터 렌더링');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <main id="main-content">
                <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route path="/test-store-selection" element={<StoreSelection />} />
            <Route path="/test-products" element={<ProductCatalog />} />
            
            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<CustomerHome />} />
              <Route path="home" element={<CustomerHome />} />
              <Route path="store" element={<StoreSelection />} />
              <Route path="products" element={<ProductCatalog />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="orders/:orderId" element={<OrderTracking />} />
              <Route path="orders/:orderId/tracking" element={<OrderTracking />} />
              <Route path="categories" element={<CustomerCategories />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="promotions" element={<PromotionProducts />} />
              <Route path="refunds" element={<CustomerRefunds />} />
              <Route path="refunds/create" element={<CreateRefund />} />
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
              <Route path="analytics" element={<StoreAnalytics />} />
              <Route path="inventory-analytics" element={<StoreInventoryAnalytics />} />
              <Route path="refunds" element={<StoreRefunds />} />
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
              <Route path="product-excel-template" element={<ProductExcelTemplate />} />
              <Route path="members" element={<HQMembers />} />
              <Route path="supply" element={<HQSupply />} />
              <Route path="analytics" element={<HQAnalytics />} />
            </Route>

            {/* Support Routes */}
            <Route path="/support">
              <Route path="customer" element={<CustomerSupport />} />
              <Route path="qa" element={<QASupport />} />
              <Route path="faq" element={<FAQSupport />} />
            </Route>

            {/* Company Routes */}
            <Route path="/company">
              <Route path="about" element={<About />} />
              <Route path="careers" element={<Careers />} />
              <Route path="privacy" element={<Privacy />} />
            </Route>

            {/* Manual Routes */}
            <Route path="/manual">
              <Route index element={<ManualMain />} />
              <Route path="customer" element={<CustomerManual />} />
              <Route path="store" element={<StoreManual />} />
              <Route path="hq" element={<HQManual />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
