import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { useCartStore } from '../../stores/cartStore';

interface PromotionProduct {
  id: string;
  name: string;
  price: number;
  basePrice: number;
  imageUrl: string | null;
  promotionType: 'buy_one_get_one' | 'buy_two_get_one';
  promotionName: string;
  unit: string;
  stockQuantity: number;
  storeProductId: string;
}

const PromotionProducts: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [promotionProducts, setPromotionProducts] = useState<PromotionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'buy_one_get_one' | 'buy_two_get_one'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPromotionProducts = async () => {
    try {
      setLoading(true);
      
      // 선택된 지점 정보 가져오기
      const selectedStore = JSON.parse(localStorage.getItem('selectedStore') || '{}');
      if (!selectedStore.id) {
        console.log('지점이 선택되지 않음');
        setPromotionProducts([]);
        return;
      }
      
      // 먼저 행사 상품 정보를 가져옵니다
      const { data: promotionData, error: promotionError } = await (supabase as any)
        .from('promotion_products')
        .select(`
          product_id,
          store_id,
          promotions!inner(
            name,
            promotion_type
          ),
          products!inner(
            id,
            name,
            base_price,
            image_urls,
            unit
          )
        `)
        .or(`store_id.is.null,store_id.eq.${selectedStore.id}`) // 전체 매장 행사 또는 해당 지점 행사
        .eq('promotions.is_active', true);

      if (promotionError) throw promotionError;

      // 행사 상품들의 product_id 목록을 추출
      const productIds = (promotionData as any[])?.map(item => item.product_id) || [];

      if (productIds.length === 0) {
        setPromotionProducts([]);
        return;
      }

      // 해당 지점의 store_products 정보를 가져옵니다
      const { data: storeProductsData, error: storeProductsError } = await supabase
        .from('store_products')
        .select(`
          id,
          product_id,
          price,
          stock_quantity,
          is_available
        `)
        .eq('store_id', selectedStore.id)
        .in('product_id', productIds)
        .eq('is_available', true);

      if (storeProductsError) throw storeProductsError;

      // store_products 데이터를 product_id로 매핑
      const storeProductsMap = new Map();
      storeProductsData?.forEach(item => {
        storeProductsMap.set(item.product_id, item);
      });

      // 행사 상품과 store_products 정보를 결합
      const products = ((promotionData as any[]) || [])
        .filter(item => storeProductsMap.has(item.product_id))
        .map((item: any) => {
          const storeProduct = storeProductsMap.get(item.product_id);
          return {
            id: item.product_id,
            name: item.products.name,
            price: storeProduct.price,
            basePrice: item.products.base_price,
            imageUrl: item.products.image_urls?.[0] || null,
            promotionType: item.promotions.promotion_type,
            promotionName: item.promotions.name,
            unit: item.products.unit,
            stockQuantity: storeProduct.stock_quantity,
            storeProductId: storeProduct.id
          };
        });

      setPromotionProducts(products);
    } catch (error) {
      console.error('행사 상품 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotionProducts();
  }, []);

  const handleAddToCart = (product: PromotionProduct) => {
    // 재고 확인
    if (product.stockQuantity <= 0) {
      alert('재고가 없습니다!');
      return;
    }

    // Product 객체 생성
    const productObj = {
      id: product.id,
      name: product.name,
      description: '',
      category_id: null,
      brand: '',
      manufacturer: '',
      unit: product.unit,
      image_urls: product.imageUrl ? [product.imageUrl] : [],
      base_price: product.basePrice,
      cost_price: null,
      tax_rate: 0.1,
      is_active: true,
      requires_preparation: false,
      preparation_time: 0,
      nutritional_info: {},
      allergen_info: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_wishlisted: false,
      wishlist_count: 0,
      shelf_life_days: null
    };

    // 선택된 지점 정보 가져오기
    const selectedStore = JSON.parse(localStorage.getItem('selectedStore') || '{}');
    
    // StoreProduct 객체 생성 (실제 지점 정보 사용)
    const storeProductObj = {
      id: product.storeProductId,
      store_id: selectedStore.id,
      product_id: product.id,
      price: product.price,
      stock_quantity: product.stockQuantity,
      safety_stock: 10,
      max_stock: 100,
      is_available: true,
      discount_rate: 0,
      promotion_start_date: null,
      promotion_end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 행사 정보를 StoreProduct에 추가
    const promotionStoreProduct = {
      ...storeProductObj,
      promotionType: product.promotionType,
      promotionName: product.promotionName
    };

    // 장바구니에 추가 (1개씩, 행사 정보 포함)
    addItem(productObj, promotionStoreProduct, 1);
    
    // 행사 혜택 알림
    const promotionMessage = product.promotionType === 'buy_one_get_one' 
      ? '1+1 행사! 2개를 담으면 1개 가격으로 계산됩니다! 🎉'
      : '2+1 행사! 3개를 담으면 2개 가격으로 계산됩니다! 🎉';
    
    alert(promotionMessage);
  };

  const filteredProducts = promotionProducts.filter(product => {
    // 검색어 필터링
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 카테고리 필터링
    const matchesFilter = filterType === 'all' || product.promotionType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getPromotionBadge = (type: string) => {
    const isOnePlusOne = type === 'buy_one_get_one';
    return (
      <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
        isOnePlusOne ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`}>
        {isOnePlusOne ? '1+1' : '2+1'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">행사 상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">🎉 특가 혜택</h1>
          </div>
        </div>
      </div>

      {/* 검색바 */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="행사 상품 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* 필터 */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterType('buy_one_get_one')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
              filterType === 'buy_one_get_one'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            1+1 행사
          </button>
          <button
            onClick={() => setFilterType('buy_two_get_one')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
              filterType === 'buy_two_get_one'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            2+1 행사
          </button>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="px-4 py-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? '검색 결과가 없습니다' : '행사 상품이 없습니다'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? '다른 검색어를 시도해보세요.' : '현재 진행 중인 특가 행사가 없습니다.'}
            </p>
            <button
              onClick={() => navigate('/customer/products')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              전체 상품 보기
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
                  {/* 상품 이미지 */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="p-3 flex-1 flex flex-col">
                    {/* 행사 배지 */}
                    <div className="flex items-center justify-between mb-2">
                      {getPromotionBadge(product.promotionType)}
                      {product.basePrice > product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          {product.basePrice.toLocaleString()}원
                        </span>
                      )}
                    </div>

                    {/* 상품명 */}
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">
                      {product.name}
                    </h3>

                    {/* 가격 */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold text-red-600">
                        {product.price.toLocaleString()}원
                      </span>
                    </div>

                    {/* 재고 정보 */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${
                        product.stockQuantity > 0 
                          ? product.stockQuantity <= 5 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {product.stockQuantity > 0 
                          ? `재고: ${product.stockQuantity}개`
                          : '품절'
                        }
                      </span>
                      {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                        <span className="text-xs text-orange-600 font-medium">
                          마감임박
                        </span>
                      )}
                    </div>

                    {/* 장바구니 버튼 */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity <= 0}
                      className={`w-full py-1.5 px-3 rounded-lg transition-colors text-sm font-medium mt-auto ${
                        product.stockQuantity > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.stockQuantity > 0 ? '담기' : '품절'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionProducts;
