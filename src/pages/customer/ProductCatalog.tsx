import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Product, Category, StoreProduct } from '../../types/common';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import Cart from '../../components/customer/Cart';
import { useCartStore } from '../../stores/cartStore';

interface ProductWithStock extends Product {
  store_products: StoreProduct[];
  promotionInfo?: {
    promotion_type: 'buy_one_get_one' | 'buy_two_get_one' | null;
    promotion_name: string | null;
  };
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const { addItem, getItemCount, items } = useCartStore();

  // 선택된 지점 정보 가져오기
  const selectedStore = JSON.parse(localStorage.getItem('selectedStore') || '{}');

  useEffect(() => {
    if (!selectedStore.id) {
      // 지점이 선택되지 않았으면 지점 선택 페이지로 이동
      navigate('/customer/store');
      return;
    }
    
    // URL 파라미터에서 카테고리 정보 읽기
    const categorySlug = searchParams.get('category');
    const categoryName = location.state?.categoryName;
    
    fetchCategories().then(() => {
      // 카테고리 데이터 로드 후 URL 파라미터 처리
      if (categorySlug) {
        const category = categories.find(cat => cat.slug === categorySlug);
        if (category) {
          setSelectedCategory(category.id);
        }
      }
    });
    
    fetchProducts();
  }, [selectedStore.id, selectedCategory, navigate, searchParams, location.state]);

  const fetchCategories = async () => {
    try {
      console.log('📂 카테고리 데이터 조회 중...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      
      setCategories(data || []);
      console.log('📂 카테고리 데이터 로드 완료:', data?.length || 0, '개');
      
      // URL 파라미터에서 카테고리 정보 읽기 (카테고리 로드 후)
      const categorySlug = searchParams.get('category');
      if (categorySlug) {
        const category = data?.find(cat => cat.slug === categorySlug);
        if (category) {
          setSelectedCategory(category.id);
        }
      }
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('카테고리를 불러오는데 실패했습니다.');
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('🛍️ 상품 데이터 조회 중...');
      setLoading(true);
      setError(null);

      // 선택된 지점의 상품만 조회
      let query = supabase
        .from('products')
        .select(`
          *,
          store_products!inner(*)
        `)
        .eq('store_products.store_id', selectedStore.id)
        .eq('store_products.is_available', true)
        .eq('is_active', true);

      // 카테고리 필터 적용
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // 행사 정보 가져오기
      const { data: promotionData, error: promotionError } = await supabase
        .from('promotion_products')
        .select(`
          product_id,
          promotions!inner(
            name,
            promotion_type
          )
        `)
        .is('store_id', null) // 전체 매장 행사 (NULL)
        .eq('promotions.is_active', true);

      if (promotionError) {
        console.error('행사 정보 조회 오류:', promotionError);
      }

      // 행사 정보를 상품 데이터에 추가
      const productsWithPromotion = (data || []).map((product: any) => {
        const promotion = promotionData?.find(p => p.product_id === product.id);
        return {
          ...product,
          promotionInfo: promotion ? {
            promotion_type: promotion.promotions.promotion_type,
            promotion_name: promotion.promotions.name
          } : {
            promotion_type: null,
            promotion_name: null
          }
        };
      });
      
      setProducts(productsWithPromotion);
      console.log('🛍️ 상품 데이터 로드 완료:', productsWithPromotion?.length || 0, '개');
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: ProductWithStock) => {
    const storeProduct = product.store_products[0];
    
    // 현재 장바구니에 담긴 수량 확인
    const cartItem = items.find(item => item.product.id === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    const realTimeStock = storeProduct.stock_quantity - cartQuantity;
    
    if (realTimeStock <= 0) {
      alert(`${product.name}은(는) 재고가 부족합니다. (남은 재고: ${realTimeStock}개)`);
      return;
    }
    
    console.log(`🛒 장바구니 추가: ${product.name} (재고: ${storeProduct.stock_quantity} → ${realTimeStock - 1})`);
    addItem(product, storeProduct, 1);
  };

  const goBackToStoreSelection = () => {
    console.log('🔄 지점 변경 버튼 클릭');
    localStorage.removeItem('selectedStore');
    
    // 지점 선택 페이지로 이동
    const targetRoute = '/customer/store';
    console.log('🎯 이동할 경로:', targetRoute);
    navigate(targetRoute);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // URL 업데이트 (선택적)
    if (categoryId === 'all') {
      navigate('/customer/products', { replace: true });
    } else {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        navigate(`/customer/products?category=${category.slug}`, { replace: true });
      }
    }
  };

  // 현재 선택된 카테고리 이름 가져오기
  const getCurrentCategoryName = () => {
    if (selectedCategory === 'all') return '전체 상품';
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.name : '전체 상품';
  };

  if (!selectedStore.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">지점을 먼저 선택해주세요.</div>
          <button 
            onClick={goBackToStoreSelection}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            지점 선택하기
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            다시 시도
          </button>
          <button 
            onClick={goBackToStoreSelection}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            지점 다시 선택
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedStore.name}</h1>
              <p className="text-gray-600 text-sm">{selectedStore.address}</p>
              {/* 현재 카테고리 표시 */}
              <p className="text-blue-600 text-sm font-medium mt-1">
                📂 {getCurrentCategoryName()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* 장바구니 아이콘 */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m6-5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>
              
              <button
                onClick={goBackToStoreSelection}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                지점 변경
              </button>
            </div>
          </div>
          
          {/* 검색 */}
          <div className="relative">
            <input
              type="text"
              placeholder="상품 검색..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* 카테고리 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleCategoryChange('all')}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 상품 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const storeProduct = product.store_products[0];
              const hasDiscount = storeProduct.discount_rate > 0;
              const discountedPrice = hasDiscount
                ? storeProduct.price * (1 - storeProduct.discount_rate)
                : storeProduct.price;
              
              // 장바구니에 담긴 수량 계산
              const cartItem = items.find(item => item.product.id === product.id);
              const cartQuantity = cartItem ? cartItem.quantity : 0;
              
              // 실시간 재고 계산 (원래 재고 - 장바구니 수량)
              const realTimeStock = storeProduct.stock_quantity - cartQuantity;
              const isLowStock = realTimeStock <= storeProduct.safety_stock;
              const isOutOfStock = realTimeStock <= 0;

              return (
                <div 
                  key={product.id} 
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative"
                >
                  {/* 프로모션 배지 */}
                  {hasDiscount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {Math.round(storeProduct.discount_rate * 100)}% OFF
                    </div>
                  )}
                  
                  {/* 행사 배지 */}
                  {product.promotionInfo?.promotion_type && (
                    <div className={`absolute top-2 ${hasDiscount ? 'left-20' : 'left-2'} text-white text-xs px-2 py-1 rounded-full font-bold ${
                      product.promotionInfo.promotion_type === 'buy_one_get_one' 
                        ? 'bg-blue-500' 
                        : 'bg-green-500'
                    }`}>
                      {product.promotionInfo.promotion_type === 'buy_one_get_one' ? '1+1' : '2+1'}
                    </div>
                  )}
                  
                  {/* 재고 상태 배지 */}
                  {isOutOfStock && (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                      품절
                    </div>
                  )}
                  {isLowStock && !isOutOfStock && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      재고부족
                    </div>
                  )}
                  
                  {/* 상품 이미지 */}
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <img
                        src={product.image_urls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className="text-gray-400 text-sm">
                      📦 {product.name}
                    </div>
                  </div>
                  
                  {/* 상품 정보 */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    {/* 브랜드 정보 */}
                    {product.brand && (
                      <p className="text-gray-500 text-xs">
                        {product.brand}
                      </p>
                    )}
                    
                    {/* 가격 */}
                    <div className="flex items-center justify-between">
                      <div>
                        {hasDiscount ? (
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-red-600">
                              {discountedPrice.toLocaleString()}원
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              {storeProduct.price.toLocaleString()}원
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-gray-900">
                            {storeProduct.price.toLocaleString()}원
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          isOutOfStock ? 'text-red-600' : 
                          isLowStock ? 'text-orange-600' : 
                          'text-gray-500'
                        }`}>
                          {isOutOfStock ? '품절' : 
                           isLowStock ? '재고 부족' : 
                           '재고 있음'} {realTimeStock}개
                          {cartQuantity > 0 && (
                            <span className="text-xs text-blue-600 block">
                              (장바구니: {cartQuantity}개)
                            </span>
                          )}
                        </div>
                        {product.requires_preparation && (
                          <div className="text-xs text-blue-600">
                            제조시간 {product.preparation_time}분
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 단위 정보 */}
                    <div className="text-xs text-gray-500">
                      단위: {product.unit}
                    </div>
                    
                    {/* 장바구니 버튼 */}
                    <button
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        isOutOfStock
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock ? '품절' : '장바구니 추가'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* 상품이 없는 경우 */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchTerm ? '검색 결과가 없습니다.' : `${getCurrentCategoryName()}에 등록된 상품이 없습니다.`}
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                전체 상품 보기
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* 장바구니 */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default ProductCatalog;