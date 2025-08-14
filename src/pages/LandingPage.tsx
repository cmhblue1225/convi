import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/common/authStore';
import SystemDemo from '../components/demo/SystemDemo';

const LandingPage: React.FC = () => {
  const { isAuthenticated, user, profile, signOut } = useAuthStore();
  const [showDemo, setShowDemo] = useState(false);

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        // 로그아웃 성공 시 페이지 새로고침하여 상태 업데이트
        window.location.reload();
      } else {
        // 에러가 있어도 로컬 상태는 정리되었으므로 페이지 새로고침
        console.warn('로그아웃 중 일부 오류:', result.error);
        window.location.reload();
      }
    } catch (error) {
      // 예외가 발생해도 페이지를 새로고침하여 상태 정리
      console.warn('로그아웃 중 예외 발생, 페이지 새로고침:', error);
      window.location.reload();
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/auth';
    
    switch (user.role) {
      case 'customer':
        return '/customer';
      case 'store_owner':
        return '/store';
      case 'headquarters':
      case 'hq_admin':
        return '/hq';
      default:
        return '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                편의점 솔루션
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    {profile?.first_name} {profile?.last_name}님
                  </span>
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost">대시보드</Button>
                  </Link>
                  <Button variant="ghost" onClick={handleSignOut}>
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost">로그인</Button>
                  </Link>
                  <Link to="/auth">
                    <Button>시작하기</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              편의점의
              <span className="text-primary-600"> 디지털 혁신</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              고객, 점주, 본사가 모두 만족하는 통합 플랫폼으로 
              편의점 비즈니스를 더욱 스마트하게 만들어보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  무료로 시작하기
                </Button>
              </Link>
              <Link to="/manual">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  📋 사용자 매뉴얼 보기
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => setShowDemo(true)}
              >
                데모 보기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              모든 것을 한 곳에서
            </h2>
            <p className="text-xl text-gray-600">
              편의점 운영에 필요한 모든 기능을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Customer Feature */}
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">고객</h3>
              <p className="text-gray-600 mb-6">
                간편한 주문부터 픽업까지, 
                편리한 쇼핑 경험을 제공합니다.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 실시간 주문 상태 확인</li>
                <li>• 간편한 결제 시스템</li>
                <li>• 개인화된 추천</li>
              </ul>
            </div>

            {/* Store Owner Feature */}
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-secondary-50 to-secondary-100">
              <div className="w-16 h-16 bg-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">점주</h3>
              <p className="text-gray-600 mb-6">
                효율적인 매장 관리와 
                실시간 재고 관리를 지원합니다.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 실시간 주문 관리</li>
                <li>• 스마트 재고 시스템</li>
                <li>• 매출 분석 대시보드</li>
              </ul>
            </div>

            {/* HQ Feature */}
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-accent-50 to-accent-100">
              <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">본사</h3>
              <p className="text-gray-600 mb-6">
                전체 지점의 통합 관리와 
                데이터 기반 의사결정을 지원합니다.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 전체 지점 통합 관리</li>
                <li>• 실시간 매출 분석</li>
                <li>• 물류 최적화</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            편의점 비즈니스의 새로운 시대를 열어보세요
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
              무료 계정 만들기
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">편의점 솔루션</h3>
              <p className="text-gray-400">
                편의점 비즈니스의 디지털 혁신을 이끄는 통합 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">제품</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => {
                    if (!isAuthenticated) {
                    window.location.href = '/auth';
                    return;
                    }
                    if (user?.role === 'customer') {
                    window.location.href = '/customer';
                    } else {
                    alert('계정을 확인해주세요!');
                    }
                  }}
                  >
                  고객 앱
                  </button>
                </li>
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => {
                    if (!isAuthenticated) {
                    window.location.href = '/auth';
                    return;
                    }
                    if (user?.role === 'store_owner') {
                    window.location.href = '/store';
                    } else {
                    alert('계정을 확인해주세요!');
                    }
                  }}
                  >
                  점주 대시보드
                  </button>
                </li>
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => {
                    if (!isAuthenticated) {
                    window.location.href = '/auth';
                    return;
                    }
                    if (user?.role === 'headquarters' || user?.role === 'hq_admin') {
                    window.location.href = '/hq';
                    } else {
                    alert('계정을 확인해주세요!');
                    }
                  }}
                  >
                  본사 관리 시스템
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => window.location.href = '/support/customer'}
                  >
                  고객센터
                  </button>
                </li>
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => window.location.href = '/support/qa'}
                  >
                  문의하기
                  </button>
                </li>
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => window.location.href = '/support/faq'}
                  >
                  FAQ
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => window.location.href = '/company/about'}
                  >
                  소개
                  </button>
                </li>
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => window.location.href = '/company/careers'}
                  >
                  채용
                  </button>
                </li>
                <li>
                  <button
                  className="p-0 text-left text-gray-400 hover:underline"
                  onClick={() => window.location.href = '/company/privacy'}
                  >
                  개인정보처리방침
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 편의점 솔루션. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <SystemDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
};

export default LandingPage; 