# Phase 4: 고객 기능 구현 가이드

## 🎯 개발 목표

실제 편의점 고객이 사용할 수 있는 완전한 주문 시스템을 구현합니다.

## 📋 구현할 기능 목록

### 1. 지점 선택 시스템 🏪
- [ ] 위치 기반 지점 검색
- [ ] 지점별 배송 가능 여부 확인  
- [ ] 지점 상세 정보 표시
- [ ] 즐겨찾는 지점 저장

### 2. 상품 카탈로그 🛍️
- [ ] 카테고리별 상품 조회
- [ ] 상품 검색 및 필터링
- [ ] 상품 상세 정보 모달
- [ ] 실시간 재고 상태 표시
- [ ] 프로모션 상품 하이라이트

### 3. 장바구니 시스템 🛒
- [ ] 상품 추가/제거/수량 변경
- [ ] 실시간 총 금액 계산
- [ ] 장바구니 지속성 (새로고침 후에도 유지)
- [ ] 재고 부족 시 알림

### 4. 주문 프로세스 📦
- [ ] 배송/픽업 선택
- [ ] 배송 주소 관리
- [ ] 결제 방법 선택
- [ ] 주문 확인 및 생성
- [ ] 주문 완료 알림

### 5. 주문 추적 📱
- [ ] 실시간 주문 상태 표시
- [ ] 주문 이력 조회
- [ ] 주문 취소 기능
- [ ] 픽업 알림

## 🚀 개발 시작하기

### 1단계: 개발 환경 확인

```bash
# 프로젝트 디렉터리로 이동
cd convenience-store-v2

# 의존성 설치 확인
npm install

# 개발 서버 시작
npm run dev

# 새 터미널에서 타입 체크
npm run type-check
```

### 2단계: 지점 선택 페이지 구현

#### 파일 생성: `src/pages/customer/StoreSelection.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Store } from '../../types/common';

const StoreSelection: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
    getUserLocation();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error);
        }
      );
    }
  };

  const selectStore = (store: Store) => {
    // 선택한 지점을 로컬 스토리지에 저장
    localStorage.setItem('selectedStore', JSON.stringify(store));
    navigate('/customer/products');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">지점 선택</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <div
            key={store.id}
            className="border rounded-lg p-4 hover:shadow-lg cursor-pointer transition-shadow"
            onClick={() => selectStore(store)}
          >
            <h3 className="font-semibold text-lg">{store.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{store.address}</p>
            <p className="text-gray-600 text-sm">{store.phone}</p>
            
            <div className="mt-3 flex gap-2">
              {store.delivery_available && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  배송 가능
                </span>
              )}
              {store.pickup_available && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  픽업 가능
                </span>
              )}
            </div>
            
            {store.min_order_amount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                최소 주문금액: {store.min_order_amount.toLocaleString()}원
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreSelection;
```

#### 라우팅 추가: `src/App.tsx` 수정

```typescript
// CustomerHome 대신 StoreSelection을 기본 페이지로 설정
import StoreSelection from './pages/customer/StoreSelection';

// Routes 섹션에서
<Route index element={<StoreSelection />} />
<Route path="products" element={<CustomerHome />} />
```

### 3단계: 상품 카탈로그 구현

#### 파일 생성: `src/pages/customer/ProductCatalog.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { Product, Category, StoreProduct } from '../../types/common';

interface ProductWithStock extends Product {
  store_products: StoreProduct[];
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const selectedStore = JSON.parse(localStorage.getItem('selectedStore') || '{}');

  useEffect(() => {
    if (selectedStore.id) {
      fetchCategories();
      fetchProducts();
    }
  }, [selectedStore.id, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          store_products!inner(*)
        `)
        .eq('store_products.store_id', selectedStore.id)
        .eq('store_products.is_available', true)
        .eq('is_active', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: ProductWithStock) => {
    // 장바구니 로직 (다음 단계에서 구현)
    console.log('Add to cart:', product);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">
          {selectedStore.name} - 상품 목록
        </h1>
        
        {/* 검색 */}
        <input
          type="text"
          placeholder="상품 검색..."
          className="w-full p-3 border rounded-lg mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center">로딩 중...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const storeProduct = product.store_products[0];
            const discountedPrice = storeProduct.discount_rate > 0
              ? storeProduct.price * (1 - storeProduct.discount_rate)
              : storeProduct.price;

            return (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                {product.image_urls && product.image_urls.length > 0 && (
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                )}
                
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    {storeProduct.discount_rate > 0 ? (
                      <>
                        <span className="text-lg font-bold text-red-600">
                          {discountedPrice.toLocaleString()}원
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {storeProduct.price.toLocaleString()}원
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">
                        {storeProduct.price.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    재고: {storeProduct.stock_quantity}개
                  </span>
                </div>
                
                <button
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => addToCart(product)}
                  disabled={storeProduct.stock_quantity === 0}
                >
                  {storeProduct.stock_quantity === 0 ? '품절' : '장바구니 추가'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
```

### 4단계: 장바구니 스토어 구현

#### 파일 생성: `src/stores/cartStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, StoreProduct } from '../types/common';

interface CartItem {
  id: string;
  product: Product;
  storeProduct: StoreProduct;
  quantity: number;
  subtotal: number;
}

interface CartStore {
  items: CartItem[];
  storeId: string | null;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  
  // Actions
  addItem: (product: Product, storeProduct: StoreProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,
      subtotal: 0,
      taxAmount: 0,
      deliveryFee: 0,
      totalAmount: 0,

      addItem: (product, storeProduct, quantity = 1) => {
        const { items, storeId } = get();
        
        // 다른 지점의 상품이면 장바구니 초기화
        if (storeId && storeId !== storeProduct.store_id) {
          set({
            items: [],
            storeId: storeProduct.store_id
          });
        }

        const existingItemIndex = items.findIndex(item => item.product.id === product.id);
        
        if (existingItemIndex >= 0) {
          // 기존 상품 수량 업데이트
          const updatedItems = [...items];
          const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity,
            subtotal: storeProduct.price * newQuantity
          };
          set({ items: updatedItems });
        } else {
          // 새 상품 추가
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            storeProduct,
            quantity,
            subtotal: storeProduct.price * quantity
          };
          set({
            items: [...items, newItem],
            storeId: storeProduct.store_id
          });
        }
        
        get().calculateTotals();
      },

      removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.product.id !== productId);
        set({ items: updatedItems });
        get().calculateTotals();
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const updatedItems = items.map(item => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity,
              subtotal: item.storeProduct.price * quantity
            };
          }
          return item;
        });
        set({ items: updatedItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          storeId: null,
          subtotal: 0,
          taxAmount: 0,
          deliveryFee: 0,
          totalAmount: 0
        });
      },

      calculateTotals: () => {
        const { items } = get();
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const taxAmount = subtotal * 0.1; // 10% 세율
        const deliveryFee = subtotal >= 20000 ? 0 : 3000; // 2만원 이상 무료배송
        const totalAmount = subtotal + taxAmount + deliveryFee;
        
        set({
          subtotal,
          taxAmount,
          deliveryFee,
          totalAmount
        });
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

## 📝 개발 체크리스트

### 매일 확인사항
- [ ] `npm run dev` 정상 실행
- [ ] `npm run type-check` 오류 없음
- [ ] `npm run lint` 경고 최소화
- [ ] 브라우저 콘솔 오류 확인
- [ ] 모바일 반응형 테스트

### 주요 테스트 시나리오
1. **지점 선택**
   - [ ] 지점 목록 정상 로딩
   - [ ] 지점 선택 후 상품 페이지 이동
   - [ ] 선택한 지점 정보 저장 확인

2. **상품 조회**
   - [ ] 카테고리별 필터링
   - [ ] 검색 기능
   - [ ] 재고 상태 표시
   - [ ] 프로모션 가격 계산

3. **장바구니**
   - [ ] 상품 추가/제거
   - [ ] 수량 변경
   - [ ] 총 금액 계산
   - [ ] 페이지 새로고침 후 유지

## 🔗 유용한 참고 자료

### Supabase 쿼리 예시
```typescript
// 지점별 상품 조회 (재고 포함)
const { data } = await supabase
  .from('products')
  .select(`
    *,
    categories(*),
    store_products!inner(*)
  `)
  .eq('store_products.store_id', storeId)
  .eq('store_products.is_available', true);

// 실시간 재고 업데이트 구독
const subscription = supabase
  .channel('store-products')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'store_products',
    filter: `store_id=eq.${storeId}`
  }, (payload) => {
    console.log('재고 업데이트:', payload);
  })
  .subscribe();
```

### 주요 컴포넌트 위치
- **공통 컴포넌트**: `src/components/common/`
- **고객 컴포넌트**: `src/components/customer/`
- **레이아웃**: `src/pages/customer/CustomerLayout.tsx`
- **타입 정의**: `src/types/common.ts`

---

**개발 시작 준비 완료!** 🚀  
위 가이드를 따라 단계별로 구현하면 완전한 고객 주문 시스템을 구축할 수 있습니다.