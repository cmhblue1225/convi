import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import { useCartStore } from '../../stores/cartStore';
import { supabase } from '../../lib/supabase/client';
import type { Product, StoreProduct } from '../../types/common';

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

interface PromotionProduct {
  id: string;
  name: string;
  price: number;
  basePrice: number;
  imageUrl: string | null;
  promotionType: string;
  promotionName: string;
  stockQuantity: number;
  storeProductId: string;
}

interface PromotionBanner {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  product: PromotionProduct;
}

const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { getItemCount, addItem } = useCartStore();
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [quickCategories, setQuickCategories] = useState<QuickCategory[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [promotionProducts, setPromotionProducts] = useState<PromotionProduct[]>([]);
  const [promotionBanners, setPromotionBanners] = useState<PromotionBanner[]>([]);
  const [selectedPromotionFilter, setSelectedPromotionFilter] = useState<'all' | 'buy_one_get_one' | 'buy_two_get_one'>('all');

  const getCategoryIcon = (slug?: string, name?: string) => {
    const key = (slug || name || '').toLowerCase();
    const map: Record<string, string> = {
      // 대분류
      'beverages': '🥤',
      'food': '🍱',
      'snacks': '🍪',
      'household': '🧴',
      // 음료 하위
      'carbonated-drinks': '🥤',
      'coffee-tea': '☕',
      'juice-sports-drinks': '🧃',
      'milk-dairy': '🥛',
      // 식품 하위
      'instant-food': '🍜',
      'frozen-food': '❄️',
      'fresh-food': '🥗',
      // 간식 하위
      'cookies-snacks': '🍪',
      'chocolate-candy': '🍫',
      'nuts': '🥜',
      // 생활용품 하위
      'cleaning-supplies': '🧼',
      'tissue-personal-care': '🧻',
      'stationery-office': '✏️',
    };
    return map[key] || '📦';
  };

  const fetchQuickCategories = async (storeId?: string) => {
    try {
      // 제품 기준으로 실제 존재하는 카테고리만 추출
      if (storeId) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            category:categories(id, name, slug),
            store_products!inner(store_id, is_available)
          `)
          .eq('store_products.store_id', storeId)
          .eq('store_products.is_available', true)
          .eq('is_active', true);
        if (error) throw error;
        const unique: Record<string, { id: string; name: string; slug: string }> = {};
        (data || []).forEach((row: any) => {
          if (row.category) {
            unique[row.category.id] = row.category;
          }
        });
        const items = Object.values(unique)
          .slice(0, 6)
          .map((c) => ({
            id: c.id,
            name: c.name,
            icon: getCategoryIcon(c.slug, c.name),
            path: `/customer/products?category=${c.slug}`,
          }));
        setQuickCategories(items);
      } else {
        const { data, error } = await supabase
          .from('products')
          .select(`category:categories(id, name, slug)`) 
          .eq('is_active', true);
        if (error) throw error;
        const unique: Record<string, { id: string; name: string; slug: string }> = {};
        (data || []).forEach((row: any) => {
          if (row.category) unique[row.category.id] = row.category;
        });
        const items = Object.values(unique)
          .slice(0, 6)
          .map((c) => ({
            id: c.id,
            name: c.name,
            icon: getCategoryIcon(c.slug, c.name),
            path: `/customer/products?category=${c.slug}`,
          }));
        setQuickCategories(items);
      }
    } catch (err) {
      console.error('빠른 카테고리 로딩 오류:', err);
      setQuickCategories([]);
    }
  };

  const fetchPromotionProducts = async (storeId?: string) => {
    try {
      // 선택된 지점 정보 가져오기
      const selectedStore = JSON.parse(localStorage.getItem('selectedStore') || '{}');
      if (!selectedStore.id) {
        console.log('지점이 선택되지 않음');
        setPromotionProducts([]);
        setPromotionBanners([]);
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
            image_urls
          )
        `)
        .or(`store_id.is.null,store_id.eq.${selectedStore.id}`) // 전체 매장 행사 또는 해당 지점 행사
        .eq('promotions.is_active', true);

      if (promotionError) throw promotionError;

      // 행사 상품들의 product_id 목록을 추출
      const productIds = (promotionData as any[])?.map(item => item.product_id) || [];

      if (productIds.length === 0) {
        setPromotionProducts([]);
        setPromotionBanners([]);
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
            stockQuantity: storeProduct.stock_quantity,
            storeProductId: storeProduct.id
          };
        });

      setPromotionProducts(products); // 모든 행사 상품 표시
      
      // 배너용 데이터 생성 (최대 8개)
      const banners = products.slice(0, 8).map((product, index) => ({
        id: `banner-${index}`,
        title: `${product.promotionType === 'buy_one_get_one' ? '1+1' : '2+1'} 할인 이벤트`,
        subtitle: product.name,
        discount: product.promotionType === 'buy_one_get_one' ? '50%' : '33%',
        product: product
      }));
      
      setPromotionBanners(banners);
    } catch (error) {
      console.error('행사 상품 조회 오류:', error);
    }
  };

  const fetchRecentOrders = async () => {
    if (!user) return;
    
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          store_id,
          stores(name),
          total_amount,
          status,
          created_at,
          order_items(id)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('최근 주문 조회 실패:', error);
        return;
      }

      const orders: RecentOrder[] = (data || []).map(order => ({
        id: order.id,
        store_name: order.stores?.name || '알 수 없는 지점',
        items_count: order.order_items?.length || 0,
        total_amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount,
        status: order.status,
        created_at: order.created_at || new Date().toISOString()
      }));

      setRecentOrders(orders);
    } catch (err) {
      console.error('최근 주문 로딩 오류:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // 하드코딩된 promoItems 제거
  // const promoItems = [
  //   { id: '1', title: '2+1 할인 이벤트', subtitle: '음료수 전품목', discount: '33%' },
  //   { id: '2', title: '신상품 출시', subtitle: '프리미엄 도시락', discount: '신상' },
  //   { id: '3', title: '밤 10시 이후', subtitle: '김밥 할인', discount: '20%' },
  // ];

  useEffect(() => {
    // 선택된 지점 정보 로드
    const storeData = localStorage.getItem('selectedStore');
    if (storeData) {
      const selectedStore = JSON.parse(storeData);
      // 빠른 카테고리 로딩 (선택된 지점 기준)
      fetchQuickCategories(selectedStore.id);
      fetchPromotionProducts(selectedStore.id);
    } else {
      // 선택된 지점 정보가 없으면 전체 카테고리 로딩
      fetchQuickCategories();
      fetchPromotionProducts();
    }

    // 최근 주문 내역 로드
    fetchRecentOrders();
  }, [user]);

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

  const handleViewAllOrders = () => {
    navigate('/customer/orders');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // 같은 날인지 확인 (년, 월, 일로 비교)
    const dateYMD = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowYMD.getTime() - dateYMD.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      // 7일 이상 차이나면 날짜 형식으로 표시
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleAddToCart = async (product: PromotionProduct) => {
    const storeData = localStorage.getItem('selectedStore');
    if (!storeData) {
      alert('먼저 매장을 선택해주세요.');
      return;
    }

    const selectedStore = JSON.parse(storeData);

    // 재고 확인
    if (product.stockQuantity <= 0) {
      alert('재고가 없습니다!');
      return;
    }

    try {
      // Product 객체 생성
      const productObj: Product = {
        id: product.id,
        name: product.name,
        description: '',
        category_id: null,
        brand: '',
        manufacturer: '',
        unit: '개',
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

      // StoreProduct 객체 생성 (실제 지점 정보 사용)
      const storeProductObj: StoreProduct = {
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
        ? '1+1 행사! 1개 가격으로 1개씩 담으세요! 🎉'
        : '2+1 행사! 2개 가격으로 3개 효과! 🎉';
      
      alert(promotionMessage);
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const handleBannerClick = async (item: PromotionBanner) => {
    const storeData = localStorage.getItem('selectedStore');
    if (!storeData) {
      alert('먼저 매장을 선택해주세요.');
      return;
    }

    const selectedStore = JSON.parse(storeData);

    // 사용자에게 선택 옵션 제공
    const choice = confirm(`${item.subtitle} 상품을 장바구니에 추가하시겠습니까?\n\n확인: 장바구니 추가\n취소: 상품 상세 보기`);
    
    if (choice) {
      // 재고 확인
      if (item.product.stockQuantity <= 0) {
        alert('재고가 없습니다!');
        return;
      }

      // 장바구니에 추가
      try {
        // Product 객체 생성
        const productObj: Product = {
          id: item.product.id,
          name: item.product.name,
          description: '',
          category_id: null,
          brand: '',
          manufacturer: '',
          unit: '개',
          image_urls: item.product.imageUrl ? [item.product.imageUrl] : [],
          base_price: item.product.basePrice,
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

        // StoreProduct 객체 생성 (실제 지점 정보 사용)
        const storeProductObj: StoreProduct = {
          id: item.product.storeProductId,
          store_id: selectedStore.id,
          product_id: item.product.id,
          price: item.product.price,
          stock_quantity: item.product.stockQuantity,
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
          promotionType: item.product.promotionType,
          promotionName: item.product.promotionName
        };

        // 장바구니에 추가 (1개씩, 행사 정보 포함)
        addItem(productObj, promotionStoreProduct, 1);
        
        // 행사 혜택 알림
        const promotionMessage = item.product.promotionType === 'buy_one_get_one' 
          ? '1+1 행사! 1개 가격으로 1개씩 담으세요! 🎉'
          : '2+1 행사! 2개 가격으로 3개 효과! 🎉';
        
        alert(promotionMessage);
      } catch (error) {
        console.error('장바구니 추가 오류:', error);
        alert('장바구니 추가 중 오류가 발생했습니다.');
      }
    } else {
      // 상품 상세 페이지로 이동
      navigate(`/customer/products?product=${item.product.id}`);
    }
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
                  {(() => {
                    const storeData = localStorage.getItem('selectedStore');
                    return storeData ? JSON.parse(storeData).name : '지점을 선택해주세요';
                  })()}
                </p>
              </div>
            </div>
            <button
              onClick={handleStoreSelect}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              {localStorage.getItem('selectedStore') ? '변경' : '선택'}
            </button>
          </div>
        </div>

        {/* 행사 상품 섹션 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">🎉 행사 상품</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {promotionProducts
                  .filter(product => 
                    selectedPromotionFilter === 'all' || 
                    product.promotionType === selectedPromotionFilter
                  ).length}개 상품
              </span>
              <button
                onClick={() => navigate('/customer/promotions')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                전체보기
              </button>
            </div>
          </div>
          {promotionProducts.filter(product => 
            selectedPromotionFilter === 'all' || 
            product.promotionType === selectedPromotionFilter
          ).length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 max-h-64 overflow-hidden">
              <div className="h-64 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* 필터 버튼 */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button 
                      onClick={() => setSelectedPromotionFilter('all')}
                      className={`flex-shrink-0 px-3 py-1 text-sm rounded-full ${
                        selectedPromotionFilter === 'all'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      전체
                    </button>
                    <button 
                      onClick={() => setSelectedPromotionFilter('buy_one_get_one')}
                      className={`flex-shrink-0 px-3 py-1 text-sm rounded-full ${
                        selectedPromotionFilter === 'buy_one_get_one'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      1+1 행사
                    </button>
                    <button 
                      onClick={() => setSelectedPromotionFilter('buy_two_get_one')}
                      className={`flex-shrink-0 px-3 py-1 text-sm rounded-full ${
                        selectedPromotionFilter === 'buy_two_get_one'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      2+1 행사
                    </button>
                  </div>
                  
                  {/* 상품 그리드 */}
                  <div className="grid grid-cols-2 gap-3">
                    {promotionProducts
                      .filter(product => 
                        selectedPromotionFilter === 'all' || 
                        product.promotionType === selectedPromotionFilter
                      )
                      .map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.promotionType === 'buy_one_get_one' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.promotionType === 'buy_one_get_one' ? '1+1' : '2+1'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            장바구니+
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-1 truncate">{product.name}</div>
                        <div className="text-lg font-bold text-red-600">{product.price.toLocaleString()}원</div>
                        <div className="text-xs text-gray-500 mt-1">
                          할인율: {product.promotionType === 'buy_one_get_one' ? '50%' : '33%'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 하단 정보 */}
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-700">
                      💡 행사 상품은 매장별로 재고 상황이 다를 수 있습니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-3">
                {selectedPromotionFilter === 'all' 
                  ? '현재 진행 중인 행사 상품이 없습니다.'
                  : selectedPromotionFilter === 'buy_one_get_one'
                    ? '현재 진행 중인 1+1 행사 상품이 없습니다.'
                    : '현재 진행 중인 2+1 행사 상품이 없습니다.'
                }
              </p>
              <button
                onClick={() => navigate('/customer/products')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
              >
                전체 상품 보기
              </button>
            </div>
          )}
        </div>

        {/* 특가 혜택 배너 */}
        {promotionBanners.length > 0 && (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">🎉 특가 혜택</h2>
            </div>
          <div 
            onClick={() => navigate('/customer/promotions')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">1+1 & 2+1 행사 진행중!</h3>
                <p className="text-sm opacity-90 mt-1">다양한 상품들이 특별한 할인으로 준비되어 있어요</p>
              </div>
              <div className="text-right">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  최대 50% 할인
                </span>
                <div className="text-xs opacity-75 mt-1">
                  {promotionProducts.length}개 상품
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">최근 주문</h2>
            <button 
              onClick={handleViewAllOrders}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              전체보기
            </button>
          </div>
          
          {isLoadingOrders ? (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">주문 내역을 불러오는 중...</p>
            </div>
          ) : recentOrders.length > 0 ? (
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
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-3">아직 주문 내역이 없습니다.</p>
              <button
                onClick={() => navigate('/customer/products')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
              >
                첫 주문하기
              </button>
            </div>
          )}
        </div>

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