import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { Product, Category, Coupon, PointSettings } from '../../types/common';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';

interface PromotionProduct {
  id: string;
  promotion_id: string;
  product_id: string;
  store_id: string;
  is_primary: boolean;
  free_quantity: number;
  created_at: string;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  promotion_type: 'buy_one_get_one' | 'buy_two_get_one';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const HQProducts: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'coupons' | 'points'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pointSettings, setPointSettings] = useState<PointSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingPointSetting, setEditingPointSetting] = useState<PointSettings | null>(null);
  
  // 행사 관련 상태
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionProducts, setPromotionProducts] = useState<PromotionProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: 'buy_one_get_one' | 'buy_two_get_one' | null}>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        await Promise.all([fetchProducts(), fetchPromotions(), fetchPromotionProducts()]);
      } else if (activeTab === 'categories') {
        await fetchCategories();
      } else if (activeTab === 'coupons') {
        await fetchCoupons();
      } else if (activeTab === 'points') {
        await fetchPointSettings();
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setProducts(data || []);
  };

  const fetchPromotions = async () => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPromotions(data || []);
  };

  const fetchPromotionProducts = async () => {
    const { data, error } = await supabase
      .from('promotion_products')
      .select('*');

    if (error) throw error;
    setPromotionProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    setCategories(data || []);
  };

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setCoupons(data || []);
  };

  const fetchPointSettings = async () => {
    const { data, error } = await supabase
      .from('point_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw error;
    setPointSettings(data || []);
  };

  const handleCouponSave = async (couponData: Partial<Coupon>) => {
    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);
        if (error) throw error;
      } else {
      const { error } = await supabase
          .from('coupons')
          .insert([couponData]);
        if (error) throw error;
      }
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error) {
      console.error('쿠폰 저장 오류:', error);
      alert('쿠폰 저장 중 오류가 발생했습니다.');
    }
  };

  const handlePointSettingSave = async (settingData: Partial<PointSettings>) => {
    try {
      if (editingPointSetting) {
      const { error } = await supabase
          .from('point_settings')
          .update(settingData)
          .eq('id', editingPointSetting.id);
        if (error) throw error;
      }
      setEditingPointSetting(null);
      fetchPointSettings();
    } catch (error) {
      console.error('포인트 설정 저장 오류:', error);
      alert('포인트 설정 저장 중 오류가 발생했습니다.');
    }
  };

  const handlePromotionChange = async (productId: string, promotionType: 'buy_one_get_one' | 'buy_two_get_one' | null) => {
    try {
      // 사용자 ID 확인
      if (!user?.id) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 먼저 해당 상품의 기존 행사 제거
      const { error: deleteError } = await supabase
        .from('promotion_products')
        .delete()
        .eq('product_id', productId);
      
      if (deleteError) throw deleteError;

      // 새로운 행사 설정
      if (promotionType !== null) {
        // 기존 행사가 있는지 확인
        const existingPromotion = promotions.find(p => p.promotion_type === promotionType);
        
        if (existingPromotion) {
          // 기존 행사에 상품 추가 (insert 사용, upsert 대신)
          const { error } = await supabase
            .from('promotion_products')
            .insert({
              promotion_id: existingPromotion.id,
              product_id: productId,
              store_id: null, // 전체 매장 (NULL로 설정)
              is_primary: true,
              free_quantity: promotionType === 'buy_one_get_one' ? 1 : 1
            });
          
          if (error) {
            console.error('행사 상품 추가 오류:', error);
            throw error;
          }
        } else {
          // 새 행사 생성
          const newPromotion = {
            name: promotionType === 'buy_one_get_one' ? '1+1 행사' : '2+1 행사',
            description: promotionType === 'buy_one_get_one' ? '1개 구매시 1개 추가 증정' : '2개 구매시 1개 추가 증정',
            promotion_type: promotionType,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
            is_active: true,
            created_by: user.id // 현재 로그인한 사용자 ID
          };

          const { data: promotionData, error: promotionError } = await supabase
            .from('promotions')
            .insert([newPromotion])
            .select()
            .single();

          if (promotionError) {
            console.error('행사 생성 오류:', promotionError);
            throw promotionError;
          }

          // 새 행사에 상품 추가
          const { error: productError } = await supabase
            .from('promotion_products')
            .insert({
              promotion_id: promotionData.id,
              product_id: productId,
              store_id: null, // 전체 매장 (NULL로 설정)
              is_primary: true,
              free_quantity: promotionType === 'buy_one_get_one' ? 1 : 1
            });

          if (productError) {
            console.error('행사 상품 추가 오류:', productError);
            throw productError;
          }
        }
      }

      // 상태 업데이트
      setSelectedProducts(prev => ({
        ...prev,
        [productId]: promotionType
      }));

      // 데이터 새로고침
      await Promise.all([fetchPromotions(), fetchPromotionProducts()]);
      
    } catch (error) {
      console.error('행사 설정 오류:', error);
      alert('행사 설정 중 오류가 발생했습니다.');
    }
  };

  // 상품이 어떤 행사에 포함되어 있는지 확인하는 함수
  const getProductPromotionType = (productId: string): 'buy_one_get_one' | 'buy_two_get_one' | null => {
    const promotionProduct = promotionProducts.find(pp => pp.product_id === productId);
    if (!promotionProduct) return null;
    
    const promotion = promotions.find(p => p.id === promotionProduct.promotion_id);
    return promotion ? promotion.promotion_type : null;
  };

  const renderProductsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">상품 및 행사 관리</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">행사</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const currentPromotion = getProductPromotionType(product.id);
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.base_price?.toLocaleString()}원</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`promotion-${product.id}`}
                          checked={currentPromotion === 'buy_one_get_one'}
                          onChange={() => handlePromotionChange(product.id, 'buy_one_get_one')}
                          className="mr-1"
                        />
                        <span className="text-xs text-blue-600">1+1</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`promotion-${product.id}`}
                          checked={currentPromotion === 'buy_two_get_one'}
                          onChange={() => handlePromotionChange(product.id, 'buy_two_get_one')}
                          className="mr-1"
                        />
                        <span className="text-xs text-green-600">2+1</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`promotion-${product.id}`}
                          checked={currentPromotion === null}
                          onChange={() => handlePromotionChange(product.id, null)}
                          className="mr-1"
                        />
                        <span className="text-xs text-gray-500">없음</span>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">카테고리 관리</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">슬러그</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순서</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.display_order}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.is_active ? '활성' : '비활성'}
                  </span>
                    </td>
                  </tr>
            ))}
            </tbody>
          </table>
        </div>
    </div>
  );

  const renderCouponsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">쿠폰 관리</h2>
        <button
          onClick={() => setEditingCoupon({} as Coupon)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          새 쿠폰 추가
        </button>
      </div>

      {editingCoupon && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-4">쿠폰 {editingCoupon.id ? '수정' : '추가'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 코드</label>
                    <input
                      type="text"
                value={editingCoupon.code || ''}
                onChange={(e) => setEditingCoupon({...editingCoupon, code: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="WELCOME10"
                    />
                  </div>
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰명</label>
                    <input
                      type="text"
                value={editingCoupon.name || ''}
                onChange={(e) => setEditingCoupon({...editingCoupon, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="신규 가입 쿠폰"
                    />
                  </div>
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">할인 타입</label>
                    <select
                value={editingCoupon.discount_type || 'percentage'}
                onChange={(e) => setEditingCoupon({...editingCoupon, discount_type: e.target.value as 'percentage' | 'fixed_amount'})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="percentage">퍼센트</option>
                <option value="fixed_amount">고정 금액</option>
                    </select>
                  </div>
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">할인 값</label>
                    <input
                      type="number"
                value={editingCoupon.discount_value || ''}
                onChange={(e) => setEditingCoupon({...editingCoupon, discount_value: parseFloat(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="10"
                    />
                  </div>
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최소 주문 금액</label>
                    <input
                      type="number"
                value={editingCoupon.min_order_amount || ''}
                onChange={(e) => setEditingCoupon({...editingCoupon, min_order_amount: parseFloat(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="10000"
                    />
                  </div>
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 할인 금액</label>
                    <input
                      type="number"
                value={editingCoupon.max_discount_amount || ''}
                onChange={(e) => setEditingCoupon({...editingCoupon, max_discount_amount: parseFloat(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="5000"
                    />
                  </div>
                </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => handleCouponSave(editingCoupon)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              저장
            </button>
                  <button
              onClick={() => setEditingCoupon(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    취소
                  </button>
          </div>
        </div>
      )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">코드</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">쿠폰명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">할인</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최소 주문</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용 횟수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value.toLocaleString()}원`}
                          </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.min_order_amount?.toLocaleString()}원</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.used_count || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {coupon.is_active ? '활성' : '비활성'}
                              </span>
                          </td>
                        </tr>
            ))}
                  </tbody>
                </table>
              </div>
            </div>
  );

  const renderPointsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">포인트 설정</h2>
      
      {pointSettings.map((setting) => (
        <div key={setting.id} className="mb-6 p-4 border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{setting.key}</h3>
            <button
              onClick={() => setEditingPointSetting(setting)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              수정
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
          <div className="bg-gray-100 p-3 rounded">
            <pre className="text-sm">{JSON.stringify(setting.value, null, 2)}</pre>
          </div>
        </div>
      ))}

      {editingPointSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-medium mb-4">포인트 설정 수정</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">설정 값 (JSON)</label>
              <textarea
                value={JSON.stringify(editingPointSetting.value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditingPointSetting({...editingPointSetting, value: parsed});
                  } catch (error) {
                    // JSON 파싱 오류 무시
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={6}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePointSettingSave(editingPointSetting)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                저장
              </button>
                <button
                onClick={() => setEditingPointSetting(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  취소
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">상품 및 행사 관리</h1>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'products', name: '제품', icon: '📦' },
              { id: 'categories', name: '카테고리', icon: '📂' },
              { id: 'coupons', name: '쿠폰', icon: '🎫' },
              { id: 'points', name: '포인트', icon: '⭐' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'coupons' && renderCouponsTab()}
        {activeTab === 'points' && renderPointsTab()}
      </div>
    </div>
  );
};

export default HQProducts; 