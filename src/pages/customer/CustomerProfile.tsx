import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/common/authStore';
import { supabase } from '../../lib/supabase/client';
import type { Profile, Order, Notification } from '../../types/common';
import PasswordChangeModal from '../../components/common/PasswordChangeModal';
import {
  UserIcon,
  CogIcon,
  ShoppingBagIcon,
  GiftIcon,
  HeartIcon,
  TruckIcon,
  BellIcon,
  LinkIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  KeyIcon,
  StarIcon,
  TicketIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface ProfileSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface UserAddress {
  id: string;
  name: string;
  address: string;
  detail_address?: string;
  postal_code?: string;
  is_default: boolean;
}

interface Coupon {
  id: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  expires_at: string;
  is_used: boolean;
}

interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  price: number;
  is_available: boolean;
  added_at: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'digital';
  name: string;
  last_digits?: string;
  is_default: boolean;
}

interface PointTransaction {
  id: string;
  transaction_type: 'earn' | 'spend' | 'expire' | 'bonus' | 'refund';
  points: number;
  balance_after: number;
  description: string;
  reference_type?: string;
  created_at: string;
  expires_at?: string;
}

interface LoyaltyTier {
  tier_name: string;
  min_points: number;
  max_points?: number;
  benefits: any;
  point_earn_rate: number;
}

const CustomerProfile: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [activeSection, setActiveSection] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState('Bronze');
  const [totalEarnedPoints, setTotalEarnedPoints] = useState(0);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 프로필 섹션 정의 (고객만 포인트 섹션 표시)
  const profileSections: ProfileSection[] = [
    {
      id: 'basic',
      title: '기본 정보 및 계정 관리',
      icon: UserIcon,
      description: '개인정보, 비밀번호, 알림 설정'
    },
    ...(user?.role === 'customer' ? [{
      id: 'orders',
      title: '구매/이용 내역',
      icon: ShoppingBagIcon,
      description: '주문 내역, 결제 내역, 포인트 내역'
    }] : []),
    ...(user?.role === 'customer' ? [{
      id: 'benefits',
      title: '맞춤형 혜택 및 쿠폰',
      icon: GiftIcon,
      description: '할인 쿠폰, 멤버십 혜택'
    }] : []),
    ...(user?.role === 'customer' ? [{
      id: 'wishlist',
      title: '장바구니 및 찜 목록',
      icon: HeartIcon,
      description: '관심상품, 찜 목록 관리'
    }] : []),
    ...(user?.role === 'customer' ? [{
      id: 'delivery',
      title: '배송 관련 정보',
      icon: TruckIcon,
      description: '배송지 관리, 배송 현황'
    }] : []),
    {
      id: 'notifications',
      title: '알림 및 소통',
      icon: BellIcon,
      description: '알림 설정, 고객센터, 리뷰'
    },
    {
      id: 'connections',
      title: '로그인 및 연결된 서비스',
      icon: LinkIcon,
      description: '간편 로그인, 결제수단'
    },
    {
      id: 'privacy',
      title: '개인정보 및 데이터 관리',
      icon: ShieldCheckIcon,
      description: '개인정보 설정, 접속 기록'
    }
  ];

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 프로필 정보 로드
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
        // 고객인 경우에만 포인트 정보 설정
        if (user.role === 'customer') {
          setLoyaltyPoints(profileData.points || 0);
          setLoyaltyTier(profileData.loyalty_tier || 'Bronze');
          setTotalEarnedPoints(profileData.total_earned_points || 0);
        }
      }

      // 주문 내역 로드
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, image_urls)
          ),
          stores(name)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersData) {
        setOrders(ordersData);
      }

      // 알림 로드
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationsData) {
        setNotifications(notificationsData);
      }

      // 고객인 경우에만 포인트 관련 데이터 로드
      if (user.role === 'customer') {
        // 포인트 거래 내역 로드
        const { data: pointTransactionsData } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (pointTransactionsData) {
          setPointTransactions(pointTransactionsData);
        }

        // 멤버십 등급 정보 로드
        const { data: loyaltyTiersData } = await supabase
          .from('loyalty_tiers')
          .select('*')
          .order('min_points', { ascending: true });

        if (loyaltyTiersData) {
          setLoyaltyTiers(loyaltyTiersData);
        }
      }

      // 목업 데이터 설정
      setAddresses([
        {
          id: '1',
          name: '집',
          address: '서울시 강남구 테헤란로 123',
          detail_address: '456호',
          postal_code: '06234',
          is_default: true
        },
        {
          id: '2',
          name: '회사',
          address: '서울시 서초구 서초대로 789',
          detail_address: '10층',
          postal_code: '06789',
          is_default: false
        }
      ]);

      setCoupons([
        {
          id: '1',
          name: '신규 가입 축하 쿠폰',
          discount_type: 'percentage',
          discount_value: 10,
          min_order_amount: 10000,
          expires_at: '2024-12-31',
          is_used: false
        },
        {
          id: '2',
          name: '5만원 이상 구매 시 5천원 할인',
          discount_type: 'fixed',
          discount_value: 5000,
          min_order_amount: 50000,
          expires_at: '2024-09-30',
          is_used: false
        }
      ]);

      setWishlist([
        {
          id: '1',
          product_id: 'p1',
          product_name: '코카콜라 355ml',
          product_image: '/images/products/coke.jpg',
          price: 1500,
          is_available: true,
          added_at: '2024-08-01'
        }
      ]);

      setPaymentMethods([
        {
          id: '1',
          type: 'card',
          name: '신한카드',
          last_digits: '1234',
          is_default: true
        },
        {
          id: '2',
          type: 'digital',
          name: '카카오페이',
          is_default: false
        }
      ]);

      // 목업 데이터는 고객이 아닌 경우에만 설정
      if (user.role !== 'customer') {
        setLoyaltyPoints(0);
        setLoyaltyTier('Bronze');
      }

    } catch (error) {
      console.error('사용자 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 포인트 사용 함수
  const usePoints = async (points: number, description: string, referenceType?: string, referenceId?: string) => {
    if (!user || user.role !== 'customer') return false;
    
    try {
      const { data, error } = await supabase.rpc('update_user_points', {
        p_user_id: user.id,
        p_points: -points,
        p_transaction_type: 'spend',
        p_description: description,
        p_reference_type: referenceType,
        p_reference_id: referenceId
      });

      if (error) {
        console.error('포인트 사용 실패:', error);
        return false;
      }

      // 데이터 새로고침
      await loadUserData();
      return true;
    } catch (error) {
      console.error('포인트 사용 중 오류:', error);
      return false;
    }
  };

  // 포인트 적립 함수
  const earnPoints = async (points: number, description: string, referenceType?: string, referenceId?: string) => {
    if (!user || user.role !== 'customer') return false;
    
    try {
      const { data, error } = await supabase.rpc('update_user_points', {
        p_user_id: user.id,
        p_points: points,
        p_transaction_type: 'earn',
        p_description: description,
        p_reference_type: referenceType,
        p_reference_id: referenceId
      });

      if (error) {
        console.error('포인트 적립 실패:', error);
        return false;
      }

      // 데이터 새로고침
      await loadUserData();
      return true;
    } catch (error) {
      console.error('포인트 적립 중 오류:', error);
      return false;
    }
  };

  // 다음 등급까지 필요한 포인트 계산
  const getPointsToNextTier = () => {
    if (!loyaltyTiers.length) return 0;
    
    const currentTierIndex = loyaltyTiers.findIndex(tier => tier.tier_name === loyaltyTier);
    if (currentTierIndex === -1 || currentTierIndex === loyaltyTiers.length - 1) return 0;
    
    const nextTier = loyaltyTiers[currentTierIndex + 1];
    return nextTier.min_points - totalEarnedPoints;
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          개인정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <div className="flex items-center">
              <span className="text-gray-900">{userProfile?.full_name || '이름 없음'}</span>
              <PencilIcon className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <div className="flex items-center">
              <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-900">{user?.email}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <div className="flex items-center">
              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-900">{userProfile?.phone || '연락처 없음'}</span>
              <PencilIcon className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
            <span className="text-gray-900">
              {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <KeyIcon className="w-5 h-5 mr-2" />
          보안 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">비밀번호 변경</p>
              <p className="text-sm text-gray-500">계정 보안을 위해 정기적으로 변경하세요</p>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              변경
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2단계 인증</p>
              <p className="text-sm text-gray-500">계정 보안을 강화하세요</p>
            </div>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              설정
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BellIcon className="w-5 h-5 mr-2" />
          알림 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>주문 상태 알림</span>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <span>프로모션 알림</span>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <span>이메일 수신 동의</span>
            <input type="checkbox" className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <span>SMS 수신 동의</span>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ShoppingBagIcon className="w-5 h-5 mr-2" />
          최근 주문 내역
        </h3>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">주문번호: {order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.total_amount.toLocaleString()}원</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                      {order.status === 'completed' ? '완료' :
                        order.status === 'cancelled' ? '취소' :
                          order.status === 'preparing' ? '준비중' : '진행중'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {order.type === 'delivery' ? '배송' : '픽업'} 주문
                  </p>
                  <button className="text-blue-500 text-sm hover:underline">
                    상세보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">주문 내역이 없습니다.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <StarIcon className="w-5 h-5 mr-2" />
          포인트 내역
        </h3>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">보유 포인트</p>
              <p className="text-2xl font-bold">{loyaltyPoints.toLocaleString()}P</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">등급</p>
              <p className="text-lg font-semibold">{loyaltyTier}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span className="opacity-90">총 적립 포인트</span>
              <span>{totalEarnedPoints.toLocaleString()}P</span>
            </div>
            {getPointsToNextTier() > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span className="opacity-90">다음 등급까지</span>
                <span>{getPointsToNextTier().toLocaleString()}P</span>
              </div>
            )}
          </div>
        </div>

        {/* 포인트 관리 버튼 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={() => earnPoints(100, '테스트 포인트 적립', 'test')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            테스트 적립 (+100P)
          </button>
          <button 
            onClick={() => usePoints(50, '테스트 포인트 사용', 'test')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            disabled={loyaltyPoints < 50}
          >
            테스트 사용 (-50P)
          </button>
        </div>

        {/* 실제 포인트 거래 내역 */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-3">최근 포인트 내역</h4>
          {pointTransactions.length > 0 ? (
            pointTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="text-sm font-medium">{transaction.description}</span>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-medium ${
                  transaction.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.transaction_type === 'earn' ? '+' : ''}{transaction.points}P
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">포인트 내역이 없습니다.</p>
          )}
          {pointTransactions.length > 5 && (
            <button className="w-full text-center text-blue-500 text-sm hover:underline mt-2">
              전체 내역 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderBenefits = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TicketIcon className="w-5 h-5 mr-2" />
          보유 쿠폰
        </h3>
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="border rounded-lg p-4 relative">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{coupon.name}</h4>
                  <p className="text-sm text-gray-500">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% 할인`
                      : `${coupon.discount_value.toLocaleString()}원 할인`
                    }
                  </p>
                  <p className="text-xs text-gray-400">
                    최소 주문금액: {coupon.min_order_amount.toLocaleString()}원
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(coupon.expires_at).toLocaleDateString()} 까지
                  </p>
                  {!coupon.is_used && (
                    <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                      사용하기
                    </button>
                  )}
                </div>
              </div>
              {coupon.is_used && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
                  <span className="text-gray-500 font-medium">사용 완료</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <GiftIcon className="w-5 h-5 mr-2" />
          멤버십 혜택
        </h3>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">현재 등급</p>
              <p className="text-xl font-bold">{loyaltyTier} 멤버</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">다음 등급까지</p>
              <p className="text-lg font-semibold">
                {getPointsToNextTier() > 0 ? `${getPointsToNextTier().toLocaleString()}P` : '최고 등급'}
              </p>
            </div>
          </div>
        </div>

        {/* 현재 등급 혜택 표시 */}
        {loyaltyTiers.length > 0 && (
          <div className="space-y-3">
            {(() => {
              const currentTier = loyaltyTiers.find(tier => tier.tier_name === loyaltyTier);
              if (!currentTier) return null;
              
              const benefits = currentTier.benefits?.benefits || [];
              return benefits.map((benefit: string, index: number) => (
                <div key={index} className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ));
            })()}
            
            {/* 다음 등급 혜택 미리보기 */}
            {(() => {
              const currentTierIndex = loyaltyTiers.findIndex(tier => tier.tier_name === loyaltyTier);
              if (currentTierIndex === -1 || currentTierIndex === loyaltyTiers.length - 1) return null;
              
              const nextTier = loyaltyTiers[currentTierIndex + 1];
              const nextBenefits = nextTier.benefits?.benefits || [];
              
              return (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-700 mb-2">{nextTier.tier_name} 등급 혜택 (미리보기)</h4>
                  {nextBenefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <XCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">{benefit}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <HeartIcon className="w-5 h-5 mr-2" />
          찜한 상품
        </h3>
        {wishlist.length > 0 ? (
          <div className="grid gap-4">
            {wishlist.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-gray-400 text-xs">이미지</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.product_name}</h4>
                  <p className="text-sm text-gray-500">
                    찜한 날짜: {new Date(item.added_at).toLocaleDateString()}
                  </p>
                  <p className="font-semibold text-blue-600">{item.price.toLocaleString()}원</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                    장바구니
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">찜한 상품이 없습니다.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BellIcon className="w-5 h-5 mr-2" />
          알림 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>찜한 상품 할인 알림</span>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <span>찜한 상품 재입고 알림</span>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDelivery = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2" />
          배송지 관리
        </h3>
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="font-medium">{address.name}</span>
                    {address.is_default && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        기본 배송지
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.address}</p>
                  {address.detail_address && (
                    <p className="text-sm text-gray-600">{address.detail_address}</p>
                  )}
                  <p className="text-sm text-gray-500">우편번호: {address.postal_code}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                    수정
                  </button>
                  <button className="px-3 py-1 bg-red-200 text-red-700 text-sm rounded hover:bg-red-300">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400">
            + 새 배송지 추가
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TruckIcon className="w-5 h-5 mr-2" />
          배송 현황
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium">진행 중인 배송</p>
              <p className="text-sm text-gray-600">주문번호: ORD-20240804-001</p>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              추적하기
            </button>
          </div>
          <p className="text-gray-500 text-center py-4">진행 중인 배송이 없습니다.</p>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BellIcon className="w-5 h-5 mr-2" />
          최근 알림
        </h3>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 rounded-lg border ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">알림이 없습니다.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
          고객센터
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">1:1 문의</p>
              <p className="text-sm text-gray-500">개인적인 문의사항을 남겨주세요</p>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              문의하기
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">자주 묻는 질문</p>
              <p className="text-sm text-gray-500">빠른 답변을 확인하세요</p>
            </div>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              보기
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-2" />
          내 리뷰
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">작성한 리뷰가 없습니다.</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            리뷰 작성하기
          </button>
        </div>
      </div>
    </div>
  );

  const renderConnections = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <LinkIcon className="w-5 h-5 mr-2" />
          간편 로그인 연동
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold">K</span>
              </div>
              <div>
                <p className="font-medium">카카오</p>
                <p className="text-sm text-gray-500">연결되지 않음</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500">
              연결하기
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-white">N</span>
              </div>
              <div>
                <p className="font-medium">네이버</p>
                <p className="text-sm text-gray-500">연결되지 않음</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              연결하기
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-white">G</span>
              </div>
              <div>
                <p className="font-medium">구글</p>
                <p className="text-sm text-green-600">연결됨</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300">
              연결 해제
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCardIcon className="w-5 h-5 mr-2" />
          결제수단 관리
        </h3>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-3">
                  <CreditCardIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-gray-500">
                    {method.last_digits && `**** ${method.last_digits}`}
                    {method.is_default && ' (기본 결제수단)'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                  수정
                </button>
                <button className="px-3 py-1 bg-red-200 text-red-700 text-sm rounded hover:bg-red-300">
                  삭제
                </button>
              </div>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400">
            + 새 결제수단 추가
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2" />
          개인정보 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">마케팅 정보 수신 동의</p>
              <p className="text-sm text-gray-500">할인 쿠폰, 이벤트 정보를 받아보세요</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">개인정보 수집 및 이용 동의</p>
              <p className="text-sm text-gray-500">서비스 이용을 위한 필수 동의</p>
            </div>
            <input type="checkbox" defaultChecked disabled className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">위치 정보 이용 동의</p>
              <p className="text-sm text-gray-500">근처 매장 찾기 서비스</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          최근 접속 기록
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p className="text-sm font-medium">웹 브라우저</p>
              <p className="text-xs text-gray-500">Chrome 127.0.0.0</p>
            </div>
            <div className="text-right">
              <p className="text-sm">2024-08-04 14:30</p>
              <p className="text-xs text-gray-500">서울, 대한민국</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p className="text-sm font-medium">모바일 앱</p>
              <p className="text-xs text-gray-500">iOS 17.5</p>
            </div>
            <div className="text-right">
              <p className="text-sm">2024-08-03 09:15</p>
              <p className="text-xs text-gray-500">서울, 대한민국</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <EyeIcon className="w-5 h-5 mr-2" />
          데이터 관리
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">내 데이터 다운로드</p>
              <p className="text-sm text-gray-500">개인정보 및 활동 내역을 다운로드</p>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              다운로드
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">계정 삭제</p>
              <p className="text-sm text-gray-500">모든 데이터가 영구적으로 삭제됩니다</p>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              삭제 요청
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'basic': return renderBasicInfo();
      case 'orders': return user?.role === 'customer' ? renderOrders() : renderBasicInfo();
      case 'benefits': return user?.role === 'customer' ? renderBenefits() : renderBasicInfo();
      case 'wishlist': return user?.role === 'customer' ? renderWishlist() : renderBasicInfo();
      case 'delivery': return user?.role === 'customer' ? renderDelivery() : renderBasicInfo();
      case 'notifications': return renderNotifications();
      case 'connections': return renderConnections();
      case 'privacy': return renderPrivacy();
      default: return renderBasicInfo();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 프로필</h1>
          <p className="text-gray-600">계정 정보와 설정을 관리하세요</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">{userProfile?.full_name || '사용자'}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              {user?.role === 'customer' && (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-3 text-white">
                    <p className="text-sm opacity-90">멤버십 등급</p>
                    <p className="font-bold">{loyaltyTier}</p>
                  </div>
                </div>
              )}
            </div>

            <nav className="bg-white rounded-lg shadow">
              {profileSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeSection === section.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{section.title}</p>
                        <p className="text-xs text-gray-500">{section.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:w-3/4">
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          // 비밀번호 변경 성공 시 추가 작업이 필요하면 여기에 작성
          console.log('비밀번호 변경 완료');
        }}
      />
    </div>
  );
};

export default CustomerProfile; 