import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import { useCartStore } from '../../stores/cartStore';

interface QuickCategory {
  id: string;
  name: string;
  icon: string;
  path: string;
}

interface RecentOrder {
  id: string;
  store_name: string;
  items_count: number;
  total_amount: number;
  status: string;
  created_at: string;
}

const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const quickCategories: QuickCategory[] = [
    { id: '1', name: '음료', icon: '🥤', path: '/customer/products?category=beverages' },
    { id: '2', name: '과자', icon: '🍪', path: '/customer/products?category=snacks' },
    { id: '3', name: '라면', icon: '🍜', path: '/customer/products?category=instant' },
    { id: '4', name: '유제품', icon: '🥛', path: '/customer/products?category=dairy' },
    { id: '5', name: '아이스크림', icon: '🍦', path: '/customer/products?category=ice-cream' },
    { id: '6', name: '생활용품', icon: '🧴', path: '/customer/products?category=daily' },
  ];

  const promoItems = [
    { id: '1', title: '2+1 할인 이벤트', subtitle: '음료수 전품목', discount: '33%' },
    { id: '2', title: '신상품 출시', subtitle: '프리미엄 도시락', discount: '신상' },
    { id: '3', title: '밤 10시 이후', subtitle: '김밥 할인', discount: '20%' },
  ];

  useEffect(() => {
    // 선택된 지점 정보 로드
    const storeData = localStorage.getItem('selectedStore');
    if (storeData) {
      setSelectedStore(JSON.parse(storeData));
    }

    // 최근 주문 내역 설정 (임시 데이터)
    setRecentOrders([
      {
        id: '1',
        store_name: 'GS25 강남역점',
        items_count: 3,
        total_amount: 8500,
        status: 'completed',
        created_at: '2024-01-15'
      },
      {
        id: '2', 
        store_name: 'GS25 홍대입구점',
        items_count: 2,
        total_amount: 5200,
        status: 'completed',
        created_at: '2024-01-14'
      }
    ]);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const getDisplayName = () => {
    if (profile && profile.first_name) {
      return `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`;
    }
    return '고객';
  };

  const handleStoreSelect = () => {
    navigate('/customer/store');
  };

  const handleCategoryClick = (category: QuickCategory) => {
    navigate(category.path);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/customer/orders/${orderId}`);
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'pending': '주문 접수',
      'confirmed': '주문 확인',
      'preparing': '준비 중',
      'ready': '픽업 대기',
      'completed': '완료',
      'cancelled': '취소됨'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        {/* 인사말 섹션 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {getDisplayName()}님!
          </h1>
          <p className="text-gray-600">
            편리한 편의점 쇼핑을 시작해보세요
          </p>
        </div>

        {/* 현재 선택된 지점 */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">현재 선택 지점</p>
                <p className="font-semibold text-gray-900">
                  {selectedStore ? selectedStore.name : '지점을 선택해주세요'}
                </p>
              </div>
            </div>
            <button
              onClick={handleStoreSelect}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              {selectedStore ? '변경' : '선택'}
            </button>
          </div>
        </div>

        {/* 프로모션 배너 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">🎉 특가 혜택</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {promoItems.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs opacity-90">{item.subtitle}</p>
                  </div>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-medium">
                    {item.discount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 빠른 카테고리 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">빠른 쇼핑</h2>
          <div className="grid grid-cols-3 gap-4">
            {quickCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <p className="text-sm font-medium text-gray-900">{category.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 빠른 기능 바로가기 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">빠른 기능</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/customer/categories')}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">전체 카테고리</p>
                  <p className="text-sm text-gray-500">모든 상품 보기</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/customer/orders')}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">주문 내역</p>
                  <p className="text-sm text-gray-500">주문 현황 확인</p>
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 최근 주문 내역 */}
        {recentOrders.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">최근 주문</h2>
              <button 
                onClick={() => navigate('/customer/orders')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                전체보기
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.slice(0, 2).map((order) => (
                <button
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{order.store_name}</p>
                      <p className="text-sm text-gray-500">
                        {order.items_count}개 상품 • {order.total_amount.toLocaleString()}원
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{order.created_at}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 고객 지원 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">고객 지원</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm">고객센터</span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">자주 묻는 질문</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome; 