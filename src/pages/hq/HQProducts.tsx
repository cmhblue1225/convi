import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Product, Category, Coupon, PointSettings } from '../../types/common';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';
import LazyImage from '../../components/common/LazyImage';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'coupons' | 'points'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pointSettings, setPointSettings] = useState<PointSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingPointSetting, setEditingPointSetting] = useState<PointSettings | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // 행사 관련 상태
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionProducts, setPromotionProducts] = useState<PromotionProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: 'buy_one_get_one' | 'buy_two_get_one' | null}>({});
  
  // 검색 및 필터 관련 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K로 검색창 포커스
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="검색"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      // Escape으로 검색 초기화
      if (event.key === 'Escape' && activeTab === 'products') {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedPromotion('all');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        await Promise.all([fetchProducts(), fetchCategories(), fetchPromotions(), fetchPromotionProducts()]);
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

  // 상품 관리 함수들
  const handleProductSave = async (productData: Partial<Product>) => {
    try {
      if (editingProduct && editingProduct.id) {
        // 수정
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        // 새 상품 추가
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }
      setEditingProduct(null);
      setShowProductModal(false);
      fetchProducts();
      alert('상품이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('상품 저장 오류:', error);
      alert('상품 저장 중 오류가 발생했습니다.');
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?\n\n⚠️ 주의: 이 상품과 연결된 모든 지점의 재고 정보도 함께 삭제됩니다.')) return;
    
    try {
      console.log('🗑️ 상품 삭제 시작:', productId);
      
      // 1단계: 관련된 store_products 먼저 삭제
      console.log('1️⃣ store_products 삭제 중...');
      const { error: storeProductsError } = await supabase
        .from('store_products')
        .delete()
        .eq('product_id', productId);
      
      if (storeProductsError) {
        console.error('store_products 삭제 실패:', storeProductsError);
        throw new Error(`지점 상품 정보 삭제 실패: ${storeProductsError.message}`);
      }
      
      console.log('✅ store_products 삭제 완료');
      
      // 2단계: 관련된 promotion_products 삭제
      console.log('2️⃣ promotion_products 삭제 중...');
      const { error: promotionProductsError } = await supabase
        .from('promotion_products')
        .delete()
        .eq('product_id', productId);
      
      if (promotionProductsError) {
        console.error('promotion_products 삭제 실패:', promotionProductsError);
        // 경고만 표시하고 계속 진행
        console.warn('⚠️ promotion_products 삭제 실패, 계속 진행');
      } else {
        console.log('✅ promotion_products 삭제 완료');
      }
      
      // 3단계: 상품 삭제
      console.log('3️⃣ 상품 삭제 중...');
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (productError) {
        console.error('상품 삭제 실패:', productError);
        throw new Error(`상품 삭제 실패: ${productError.message}`);
      }
      
      console.log('✅ 상품 삭제 완료');
      
      // 성공 시 처리
      fetchProducts();
      alert('상품이 성공적으로 삭제되었습니다.');
      
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      alert(`상품 삭제 중 오류가 발생했습니다:\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 카테고리 관리 함수들
  const handleCategorySave = async (categoryData: Partial<Category>) => {
    try {
      if (editingCategory && editingCategory.id) {
        // 수정
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        // 새 카테고리 추가
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);
        if (error) throw error;
      }
      setEditingCategory(null);
      setShowCategoryModal(false);
      fetchCategories();
      alert('카테고리가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('카테고리 저장 오류:', error);
      alert('카테고리 저장 중 오류가 발생했습니다.');
    }
  };

  const handleCategoryDelete = async (categoryId: string) => {
    if (!confirm('정말로 이 카테고리를 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      fetchCategories();
      alert('카테고리가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('카테고리 삭제 오류:', error);
      alert('카테고리 삭제 중 오류가 발생했습니다.');
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

  // 필터링된 상품 목록을 반환하는 함수
  const getFilteredProducts = () => {
    return products.filter(product => {
      // 검색어 필터링
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      // 카테고리 필터링
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;

      // 행사 필터링
      const productPromotionType = getProductPromotionType(product.id);
      const matchesPromotion = selectedPromotion === 'all' || 
        (selectedPromotion === 'none' && productPromotionType === null) ||
        (selectedPromotion === 'buy_one_get_one' && productPromotionType === 'buy_one_get_one') ||
        (selectedPromotion === 'buy_two_get_one' && productPromotionType === 'buy_two_get_one');

      return matchesSearch && matchesCategory && matchesPromotion;
    });
  };

  const renderProductsTab = () => {
    const filteredProducts = getFilteredProducts();
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">상품 및 행사 관리</h2>
          <button
            onClick={() => navigate('/hq/product-excel-template')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>엑셀로 추가</span>
          </button>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="mb-6 space-y-4">
          {/* 검색창 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="상품명, 설명, 브랜드로 검색... (Ctrl+K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* 필터 드롭다운 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">행사 유형</label>
              <select
                value={selectedPromotion}
                onChange={(e) => setSelectedPromotion(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체 행사</option>
                <option value="none">행사 없음</option>
                <option value="buy_one_get_one">1+1 행사</option>
                <option value="buy_two_get_one">2+1 행사</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedPromotion('all');
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                필터 초기화
              </button>
            </div>
          </div>

          {/* 결과 요약 및 빠른 통계 */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <div>
              총 {products.length}개 상품 중 {filteredProducts.length}개 표시
            </div>
            <div className="flex space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                1+1 행사: {filteredProducts.filter(p => getProductPromotionType(p.id) === 'buy_one_get_one').length}개
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                2+1 행사: {filteredProducts.filter(p => getProductPromotionType(p.id) === 'buy_two_get_one').length}개
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                행사 없음: {filteredProducts.filter(p => getProductPromotionType(p.id) === null).length}개
              </span>
            </div>
          </div>
        </div>
            <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">행사</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const currentPromotion = getProductPromotionType(product.id);
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <LazyImage
                          src={product.image_urls[0]}
                          alt={product.name}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <EyeIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.base_price?.toLocaleString()}원
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleProductDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 검색 결과가 없을 때 표시 */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">🔍</div>
          <p className="text-gray-500">검색 조건에 맞는 상품이 없습니다.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedPromotion('all');
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            모든 필터 초기화
          </button>
        </div>
      )}
    </div>
    );
  };

  const renderCategoriesTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">카테고리 관리</h2>
        <button
          onClick={() => {
            setEditingCategory({} as Category);
            setShowCategoryModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>새 카테고리 추가</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">슬러그</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순서</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCategoryDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
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

        {/* 상품 모달 */}
        {showProductModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onSave={handleProductSave}
            onClose={() => {
              setShowProductModal(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* 카테고리 모달 */}
        {showCategoryModal && (
          <CategoryModal
            category={editingCategory}
            onSave={handleCategorySave}
            onClose={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// 상품 모달 컴포넌트
const ProductModal: React.FC<{
  product: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>) => void;
  onClose: () => void;
}> = ({ product, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    brand: product?.brand || '',
    manufacturer: product?.manufacturer || '',
    unit: product?.unit || '개',
    base_price: product?.base_price || 0,
    cost_price: product?.cost_price || 0,
    tax_rate: product?.tax_rate || 0.1,
    is_active: product?.is_active ?? true,
    requires_preparation: product?.requires_preparation || false,
    preparation_time: product?.preparation_time || 0,
    image_urls: product?.image_urls || [],
    barcode: product?.barcode || '',
    allergen_info: product?.allergen_info || [],
    nutritional_info: product?.nutritional_info || {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.base_price) {
      alert('상품명과 가격은 필수 입력 사항입니다.');
      return;
    }
    onSave(formData);
  };

  const handleImageChange = (imageUrls: string[]) => {
    setFormData(prev => ({ ...prev, image_urls: imageUrls }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {product?.id ? '상품 수정' : '새 상품 추가'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="상품명을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">카테고리 선택</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                브랜드
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="브랜드명"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제조사
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="제조사명"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                단위
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="개, 병, kg 등"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                바코드
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="바코드 번호"
              />
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                판매가 *
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                원가
              </label>
              <input
                type="number"
                value={formData.cost_price}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세율
              </label>
              <input
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.1"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="상품에 대한 자세한 설명을 입력하세요"
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품 이미지
            </label>
            <ImageUpload
              productId={product?.id}
              initialImages={formData.image_urls || []}
              onImagesChange={handleImageChange}
              maxImages={5}
            />
          </div>

          {/* 옵션들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                활성 상태
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="requires_preparation"
                checked={formData.requires_preparation}
                onChange={(e) => setFormData(prev => ({ ...prev, requires_preparation: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requires_preparation" className="text-sm font-medium text-gray-700">
                조리 필요
              </label>
            </div>
          </div>

          {formData.requires_preparation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                조리 시간 (분)
              </label>
              <input
                type="number"
                value={formData.preparation_time}
                onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {product?.id ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 카테고리 모달 컴포넌트
const CategoryModal: React.FC<{
  category: Category | null;
  onSave: (data: Partial<Category>) => void;
  onClose: () => void;
}> = ({ category, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
    icon_url: category?.icon_url || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('카테고리명은 필수 입력 사항입니다.');
      return;
    }
    
    // 슬러그가 없으면 이름으로부터 생성
    if (!formData.slug) {
      formData.slug = formData.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {category?.id ? '카테고리 수정' : '새 카테고리 추가'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리명 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="카테고리명을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                슬러그
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="URL에 사용될 슬러그"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표시 순서
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이콘 URL
              </label>
              <input
                type="url"
                value={formData.icon_url}
                onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/icon.png"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="카테고리에 대한 설명을 입력하세요"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="category_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="category_active" className="text-sm font-medium text-gray-700">
              활성 상태
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {category?.id ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HQProducts; 