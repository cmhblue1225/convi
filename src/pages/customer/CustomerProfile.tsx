import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import { useOrderStore } from '../../stores/orderStore';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { UserCoupon, Point, Product, StoreProduct } from '../../types/common';
import { ProductCard } from '../../components/product/ProductCard';
import { useCartStore } from '../../stores/cartStore';
import { useToast } from '../../hooks/useToast';

interface Profile {
  id: string;
  role: string;
  full_name: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  profile_image?: string;
  address?: any;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferences?: any;
  notification_settings?: {
    email_notifications: boolean;
    push_notifications: boolean;
    order_updates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profile_image?: string;
}

const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders } = useOrderStore();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [wishlistProducts, setWishlistProducts] = useState<(Product & { store_products: StoreProduct[] })[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: 'prefer_not_to_say',
    profile_image: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    order_updates: true,
    promotions: true,
    newsletter: false
  });
  
  const { addItem } = useCartStore();
  const { showWarning, showSuccess, showError } = useToast();

  // 프로필 데이터 로드
  const fetchProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('프로필 조회 실패:', error);
        return;
      }

      setProfile(data as Profile);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        birth_date: data.birth_date || '',
        gender: (data.gender as any) || 'prefer_not_to_say',
        profile_image: (data as any).profile_image || ''
      });
      setNotificationSettings((data.notification_settings as any) || {
        email_notifications: true,
        push_notifications: true,
        order_updates: true,
        promotions: true,
        newsletter: false
      });
    } catch (err) {
      console.error('프로필 로딩 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserCoupons();
      fetchPoints();
      fetchWishlistProducts();
    }
  }, [user]);

  const fetchUserCoupons = async () => {
    if (!user?.id) return;
    
    try {
      // 모든 쿠폰 조회 (사용 가능 + 사용 완료)
      const { data, error } = await supabase
        .from('user_coupons')
        .select(`
          *,
          coupon:coupons(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserCoupons(data as UserCoupon[] || []);
    } catch (error) {
      console.error('쿠폰 조회 오류:', error);
    }
  };

  const fetchPoints = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPoints(data as Point[] || []);

      // 총 포인트 계산 (amount가 이미 양수/음수로 저장되어 있으므로 그대로 합산)
      const total = (data || []).reduce((sum, point) => {
        return sum + point.amount;
      }, 0);
      setTotalPoints(total);
    } catch (error) {
      console.error('포인트 조회 오류:', error);
    }
  };

  // 찜 목록 상품 조회
  const fetchWishlistProducts = async () => {
    if (!user?.id) return;
    
    setWishlistLoading(true);
    try {
      // 찜한 상품 ID 조회
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);
      
      if (wishlistError) throw wishlistError;
      
      if (!wishlistData || wishlistData.length === 0) {
        setWishlistProducts([]);
        return;
      }
      
      const productIds = wishlistData.map(item => item.product_id);
      
      // 상품 정보와 매장 정보 조회
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          store_products(*)
        `)
        .in('id', productIds)
        .eq('is_active', true);
      
      if (productsError) throw productsError;
      
      setWishlistProducts(productsData || []);
    } catch (error) {
      console.error('찜 목록 조회 오류:', error);
    } finally {
      setWishlistLoading(false);
    }
  };
  
  // 찜 목록에서 장바구니 담기
  const addWishlistToCart = (product: Product & { store_products: StoreProduct[] }) => {
    if (!product.store_products || product.store_products.length === 0) {
      showWarning('상품 없음', '현재 판매하지 않는 상품입니다.');
      return;
    }
    
    // 첫 번째 매장 상품 정보 사용 (추후 매장 선택 기능 추가 가능)
    const storeProduct = product.store_products[0];
    
    if (storeProduct.stock_quantity <= 0) {
      showWarning('재고 부족', '재고가 부족합니다.');
      return;
    }
    
    addItem(product, storeProduct, 1);
    showSuccess('장바구니 담기', `${product.name}을(를) 장바구니에 담았습니다!`);
  };
  
  // 찜 목록에서 제거
  const removeFromWishlist = async (productId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
      
      // 로컬 상태 업데이트
      setWishlistProducts(prev => prev.filter(product => product.id !== productId));
    } catch (error) {
      console.error('찜 목록 제거 오류:', error);
      showError('삭제 오류', '찜 목록에서 제거하는 중 오류가 발생했습니다.');
    }
  };

  // 프로필 저장
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          birth_date: formData.birth_date || null,
          gender: formData.gender,
          profile_image: formData.profile_image || null,
          notification_settings: notificationSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('프로필 업데이트 실패:', error);
        showError('업데이트 실패', '프로필 업데이트에 실패했습니다.');
        return;
      }

      // 로컬 상태 업데이트
      setProfile(prev => prev ? {
        ...prev,
        ...formData,
        notification_settings: notificationSettings,
        updated_at: new Date().toISOString()
      } : null);

      setIsEditing(false);
      showSuccess('업데이트 성공', '프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      console.error('프로필 저장 오류:', err);
      showError('저장 실패', '프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 프로필 이미지 변경
  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB 이하)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      // 파일을 Base64로 변환
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          profile_image: result
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('이미지 처리 오류:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
    }
  };

  // 알림 설정 변경
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 주문 통계 계산
  const getOrderStats = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return { totalOrders, completedOrders, totalSpent };
  };

  const orderStats = getOrderStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">프로필을 불러올 수 없습니다.</p>
          <button
            onClick={() => navigate('/customer/home')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* 프로필 이미지 */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-white shadow-md overflow-hidden">
                        {profile.profile_image ? (
                          <img
                            src={profile.profile_image}
                            alt="프로필 이미지"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 이름만 표시 */}
                    <div className="flex flex-col">
                      <p className="text-lg font-semibold text-gray-900">
                        {profile.first_name} {profile.last_name || ''}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {isEditing ? '취소' : '수정'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-6">
                    {/* 프로필 이미지 섹션 */}
                    <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-100">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-white shadow-lg overflow-hidden">
                          {formData.profile_image ? (
                            <img
                              src={formData.profile_image}
                              alt="프로필 이미지"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => document.getElementById('profile-image-input')?.click()}
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        <input
                          id="profile-image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">프로필 이미지를 클릭하여 변경하세요</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG 파일만 지원됩니다</p>
                      </div>
                    </div>

                    {/* 개인정보 입력 폼 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          이름 *
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          required
                          placeholder="이름을 입력하세요"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          성
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="성을 입력하세요"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        placeholder="이메일을 입력하세요"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        전화번호
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        placeholder="010-1234-5678"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          생년월일
                        </label>
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          성별
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          <option value="prefer_not_to_say">선택하지 않음</option>
                          <option value="male">남성</option>
                          <option value="female">여성</option>
                          <option value="other">기타</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                      >
                        {isSaving ? '저장 중...' : '저장'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="text-sm text-gray-500">이름</span>
                        <p className="font-medium text-gray-900 mt-1">
                          {profile.first_name} {profile.last_name || ''}
                        </p>
                      </div>
                      {profile.email && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <span className="text-sm text-gray-500">이메일</span>
                          <p className="font-medium text-gray-900 mt-1">{profile.email}</p>
                        </div>
                      )}
                    </div>
                    {profile.phone && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="text-sm text-gray-500">전화번호</span>
                        <p className="font-medium text-gray-900 mt-1">{profile.phone}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.birth_date && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <span className="text-sm text-gray-500">생년월일</span>
                          <p className="font-medium text-gray-900 mt-1">
                            {new Date(profile.birth_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {profile.gender && profile.gender !== 'prefer_not_to_say' && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <span className="text-sm text-gray-500">성별</span>
                          <p className="font-medium text-gray-900 mt-1">
                            {profile.gender === 'male' ? '남성' : 
                             profile.gender === 'female' ? '여성' : '기타'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.82A9 9 0 0112 3c4.97 0 9 4.03 9 9a9 9 0 01-9 9 9 9 0 01-7.81-7.19z" />
                  </svg>
                  알림 설정
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">이메일 알림</p>
                      <p className="text-sm text-gray-500">주문 상태 및 프로모션 정보를 이메일로 받습니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_notifications}
                        onChange={(e) => handleNotificationChange('email_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">푸시 알림</p>
                      <p className="text-sm text-gray-500">주문 상태 업데이트를 푸시로 받습니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_notifications}
                        onChange={(e) => handleNotificationChange('push_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">주문 업데이트</p>
                      <p className="text-sm text-gray-500">주문 상태 변경 시 알림을 받습니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.order_updates}
                        onChange={(e) => handleNotificationChange('order_updates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">프로모션 알림</p>
                      <p className="text-sm text-gray-500">할인 및 이벤트 정보를 받습니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.promotions}
                        onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">뉴스레터 구독</p>
                      <p className="text-sm text-gray-500">주간 뉴스레터를 이메일로 받습니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.newsletter}
                        onChange={(e) => handleNotificationChange('newsletter', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 포인트 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  보유 포인트
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {totalPoints.toLocaleString()}P
                  </div>
                  <p className="text-sm text-gray-500">1P = 1원</p>
                </div>
                
                {points.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">최근 포인트 내역</h3>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {points.slice(0, 5).map((point) => (
                        <div key={point.id} className="flex justify-between items-center text-sm py-2 px-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="text-gray-700 font-medium">{point.description || '포인트'}</span>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(point.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`font-bold ${
                            point.type === 'earned' || point.type === 'bonus' || point.type === 'refund'
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {point.type === 'earned' || point.type === 'bonus' || point.type === 'refund' ? '+' : '-'}
                            {Math.abs(point.amount).toLocaleString()}P
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 쿠폰 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  보유 쿠폰
                </h2>
              </div>
              <div className="p-6">
                {(() => {
                  // 사용 가능한 쿠폰 필터링
                  const availableCoupons = userCoupons.filter(uc => !uc.is_used && uc.coupon);
                  // 사용 완료된 쿠폰 필터링
                  const usedCoupons = userCoupons.filter(uc => uc.is_used && uc.coupon);
                  
                  // 쿠폰이 없는 경우
                  if (userCoupons.length === 0) {
                    return (
                      <div className="text-center text-gray-500 py-8">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p className="text-sm">보유한 쿠폰이 없습니다</p>
                      </div>
                    );
                  }
                  
                  // 쿠폰이 있는 경우
                  return (
                    <div className="space-y-4">
                      {/* 사용 가능한 쿠폰 */}
                      {availableCoupons.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-green-700 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            사용 가능한 쿠폰 ({availableCoupons.length}개)
                          </h3>
                          <div className="space-y-3">
                            {availableCoupons.map((userCoupon) => (
                              <div key={userCoupon.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium text-sm text-gray-900">{userCoupon.coupon?.name || '쿠폰명 없음'}</h3>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                    {userCoupon.coupon?.discount_type === 'percentage' 
                                      ? `${userCoupon.coupon?.discount_value || 0}%` 
                                      : `${(userCoupon.coupon?.discount_value || 0).toLocaleString()}원`}
                                  </span>
                                </div>
                                {userCoupon.coupon?.description && (
                                  <p className="text-xs text-gray-600 mb-2">{userCoupon.coupon.description}</p>
                                )}
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div>최소 주문: {(userCoupon.coupon?.min_order_amount || 0).toLocaleString()}원</div>
                                  {userCoupon.expires_at && (
                                    <div>만료: {new Date(userCoupon.expires_at).toLocaleDateString()}</div>
                                  )}
                                  {userCoupon.coupon?.valid_until && (
                                    <div>유효기간: {new Date(userCoupon.coupon.valid_until).toLocaleDateString()}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 사용 완료된 쿠폰 */}
                      {usedCoupons.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            사용 완료된 쿠폰 ({usedCoupons.length}개)
                          </h3>
                          <div className="space-y-3">
                            {usedCoupons.map((userCoupon) => (
                              <div key={userCoupon.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium text-sm text-gray-500 line-through">{userCoupon.coupon?.name || '쿠폰명 없음'}</h3>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                    {userCoupon.coupon?.discount_type === 'percentage' 
                                      ? `${userCoupon.coupon?.discount_value || 0}%` 
                                      : `${(userCoupon.coupon?.discount_value || 0).toLocaleString()}원`}
                                  </span>
                                </div>
                                {userCoupon.coupon?.description && (
                                  <p className="text-xs text-gray-500 mb-2">{userCoupon.coupon.description}</p>
                                )}
                                <div className="text-xs text-gray-400 space-y-1">
                                  <div>사용일: {userCoupon.used_at ? new Date(userCoupon.used_at).toLocaleDateString() : '알 수 없음'}</div>
                                  {userCoupon.used_order_id && (
                                    <div>주문 ID: {userCoupon.used_order_id.slice(0, 8)}...</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 찜 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-500 to-red-600">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  찜한 상품
                </h2>
              </div>
              <div className="p-6">
                {wishlistLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p className="text-sm mb-3">찜한 상품이 없습니다</p>
                    <button
                      onClick={() => navigate('/customer/products')}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      상품 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-700 mb-3">
                      총 {wishlistProducts.length}개의 상품을 찜했습니다
                    </div>
                    <div className="grid gap-3">
                      {wishlistProducts.slice(0, 3).map((product) => {
                        const storeProduct = product.store_products?.[0];
                        const hasStock = storeProduct && storeProduct.stock_quantity > 0;
                        
                        return (
                          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {product.image_urls && product.image_urls.length > 0 ? (
                                  <img
                                    src={product.image_urls[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm text-gray-900 line-clamp-1">{product.name}</h3>
                                {storeProduct && (
                                  <p className="text-sm font-bold text-gray-900 mt-1">
                                    {storeProduct.price.toLocaleString()}원
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {hasStock ? '구매 가능' : '품절'}
                                </p>
                              </div>
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => removeFromWishlist(product.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  title="찜 해제"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                {hasStock && (
                                  <button
                                    onClick={() => addWishlistToCart(product)}
                                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                    title="장바구니 담기"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {wishlistProducts.length > 3 && (
                      <button
                        onClick={() => navigate('/customer/products')} // 추후 전용 찜 목록 페이지 추가 가능
                        className="w-full text-center py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        {wishlistProducts.length - 3}개 더 보기
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 주문 통계 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-500 to-green-600">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  주문 통계
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">총 주문 수</span>
                    <span className="font-bold text-gray-900">{orderStats.totalOrders}건</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">완료된 주문</span>
                    <span className="font-bold text-green-600">{orderStats.completedOrders}건</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">총 구매 금액</span>
                    <span className="font-bold text-blue-600">{orderStats.totalSpent.toLocaleString()}원</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/customer/orders')}
                  className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  주문 내역 보기
                </button>
              </div>
            </div>

            {/* 계정 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  계정 정보
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">가입일</span>
                    <span className="font-medium text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">마지막 업데이트</span>
                    <span className="font-medium text-gray-900">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">계정 상태</span>
                    <span className={`font-medium ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {profile.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  빠른 액션
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/customer/home')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">홈으로 돌아가기</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/customer/orders')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">주문 내역</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/customer/products')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">상품 보기</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/customer/refunds')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">환불 요청 현황</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile; 