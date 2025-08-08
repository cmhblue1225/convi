import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
// import { useAuthStore } from '../../stores/common/authStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface Store {
  id: string;
  name: string;
  address: string;
  is_active: boolean | null;
}

interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  price: number;
  stock_quantity: number;
  safety_stock: number;
  max_stock: number;
  is_available: boolean;
  discount_rate: number;
  store?: Store;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  barcode: string | null;
  category_id: string | null;
  brand: string | null;
  manufacturer: string | null;
  unit: string;
  image_urls: string[] | null;
  base_price: number;
  cost_price: number | null;
  tax_rate: number;
  is_active: boolean;
  requires_preparation: boolean;
  preparation_time: number;
  nutritional_info?: any;
  allergen_info: string[] | null;
  created_at: string | null;
  category?: Category;
  store_products?: StoreProduct[];
}

const HQProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStoreDetailsModal, setShowStoreDetailsModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // const { user } = useAuthStore();

  // 실시간 구독 설정
  useEffect(() => {
    fetchData();

    // 실시간 구독
    const subscription = supabase
      .channel('products_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        (payload) => {
          console.log('🔄 상품 데이터 변경 감지:', payload);
          fetchData(); // 데이터 새로고침
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        (payload) => {
          console.log('🔄 카테고리 데이터 변경 감지:', payload);
          fetchData(); // 데이터 새로고침
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'store_products' }, 
        (payload) => {
          console.log('🔄 지점 상품 데이터 변경 감지:', payload);
          fetchData(); // 데이터 새로고침
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 카테고리 조회
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (categoriesError) {
        console.error('❌ 카테고리 조회 실패:', categoriesError);
      } else {
        setCategories(categoriesData || [] as any);
      }

      // 지점 조회
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (storesError) {
        console.error('❌ 지점 조회 실패:', storesError);
      } else {
        setStores(storesData || [] as any);
      }

      // 상품 조회 (지점별 상품 정보 포함)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          store_products(
            *,
            store:stores(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('❌ 상품 목록 조회 실패:', productsError);
        return;
      }

      setProducts((productsData || []) as Product[]);
    } catch (error) {
      console.error('❌ 데이터 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 상품 목록
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 상품별 지점 현황 계산
  const getProductStats = (product: Product) => {
    const storeProducts = product.store_products || [];
    const totalStores = stores.length;
    const sellingStores = storeProducts.length;
    const lowStockStores = storeProducts.filter(sp => sp.stock_quantity <= sp.safety_stock).length;
    const outOfStockStores = storeProducts.filter(sp => sp.stock_quantity === 0).length;
    const totalStock = storeProducts.reduce((sum, sp) => sum + sp.stock_quantity, 0);
    const avgPrice = storeProducts.length > 0 
      ? storeProducts.reduce((sum, sp) => sum + sp.price, 0) / storeProducts.length 
      : product.base_price;

    return {
      totalStores,
      sellingStores,
      lowStockStores,
      outOfStockStores,
      totalStock,
      avgPrice,
      coverageRate: totalStores > 0 ? (sellingStores / totalStores) * 100 : 0
    };
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleViewStoreDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowStoreDetailsModal(true);
  };

  const saveProduct = async (formData: FormData, isEdit: boolean = false) => {
    try {
      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || null,
        barcode: formData.get('barcode') as string || null,
        category_id: formData.get('category_id') as string || null,
        brand: formData.get('brand') as string || null,
        manufacturer: formData.get('manufacturer') as string || null,
        unit: formData.get('unit') as string,
        base_price: parseFloat(formData.get('base_price') as string),
        cost_price: formData.get('cost_price') ? parseFloat(formData.get('cost_price') as string) : null,
        tax_rate: parseFloat(formData.get('tax_rate') as string) || 0.1,
        is_active: formData.get('is_active') === 'on',
        requires_preparation: formData.get('requires_preparation') === 'on',
        preparation_time: parseInt(formData.get('preparation_time') as string) || 0,
        image_urls: [], // 이미지 업로드 기능은 별도 구현 필요
      };

      let error;
      if (isEdit && editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert(productData);
        error = insertError;
      }

      if (error) {
        console.error('❌ 상품 저장 실패:', error);
        alert('상품 저장에 실패했습니다.');
        return;
      }

      console.log('✅ 상품 저장 완료');
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingProduct(null);
      fetchData();
    } catch (error) {
      console.error('❌ 상품 저장 중 오류:', error);
      alert('상품 저장 중 오류가 발생했습니다.');
    }
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    try {
      // 관련 데이터 확인
      const { data: storeProducts } = await supabase
        .from('store_products')
        .select('id')
        .eq('product_id', productToDelete.id)
        .limit(1);

      if (storeProducts && storeProducts.length > 0) {
        alert('지점에서 판매 중인 상품은 삭제할 수 없습니다.');
        return;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) {
        console.error('❌ 상품 삭제 실패:', error);
        alert('상품 삭제에 실패했습니다.');
        return;
      }

      console.log('✅ 상품 삭제 완료');
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchData();
    } catch (error) {
      console.error('❌ 상품 삭제 중 오류:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) {
        console.error('❌ 상품 상태 변경 실패:', error);
        alert('상품 상태 변경에 실패했습니다.');
        return;
      }

      console.log('✅ 상품 상태 변경 완료');
      fetchData();
    } catch (error) {
      console.error('❌ 상품 상태 변경 중 오류:', error);
      alert('상품 상태 변경 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <p className="text-gray-600">본사 상품을 관리하고 지점별 현황을 모니터링합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">전체 상품</div>
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">활성 상품</div>
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">제조 필요</div>
          <div className="text-2xl font-bold text-blue-600">
            {products.filter(p => p.requires_preparation).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">전체 지점</div>
          <div className="text-2xl font-bold text-purple-600">{stores.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">평균 보급률</div>
          <div className="text-2xl font-bold text-indigo-600">
            {products.length > 0 
              ? Math.round(products.reduce((sum, p) => sum + getProductStats(p).coverageRate, 0) / products.length)
              : 0}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">재고 부족</div>
          <div className="text-2xl font-bold text-orange-600">
            {products.reduce((sum, p) => sum + getProductStats(p).lowStockStores, 0)}
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="상품명, 설명, 브랜드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 카테고리</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddProduct}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            상품 추가
          </button>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">상품 목록</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지점 현황
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  재고 현황
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stats = getProductStats(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                      {product.brand && (
                        <div className="text-xs text-gray-400">{product.brand}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category?.name || '미분류'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.base_price.toLocaleString()}원
                      </div>
                      {stats.avgPrice !== product.base_price && (
                        <div className="text-xs text-gray-500">
                          평균: {stats.avgPrice.toLocaleString()}원
                        </div>
                      )}
                      {product.cost_price && (
                        <div className="text-xs text-gray-500">
                          원가: {product.cost_price.toLocaleString()}원
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stats.sellingStores}/{stats.totalStores} 지점
                      </div>
                      <div className="text-xs text-gray-500">
                        보급률: {stats.coverageRate.toFixed(1)}%
                      </div>
                      <button
                        onClick={() => handleViewStoreDetails(product)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        상세보기
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        총 {stats.totalStock.toLocaleString()}개
                      </div>
                      {stats.lowStockStores > 0 && (
                        <div className="text-xs text-orange-600">
                          재고부족: {stats.lowStockStores}지점
                        </div>
                      )}
                      {stats.outOfStockStores > 0 && (
                        <div className="text-xs text-red-600">
                          품절: {stats.outOfStockStores}지점
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? '활성' : '비활성'}
                        </span>
                        {product.requires_preparation && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            제조필요
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleProductStatus(product)}
                          className={`px-3 py-1 text-xs rounded ${
                            product.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {product.is_active ? '비활성' : '활성'}
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 추가/수정 모달 */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showAddModal ? '상품 추가' : '상품 정보 수정'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                saveProduct(new FormData(e.currentTarget), showEditModal);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상품명 *</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingProduct?.name}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">바코드</label>
                    <input
                      type="text"
                      name="barcode"
                      defaultValue={editingProduct?.barcode || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리</label>
                    <select
                      name="category_id"
                      defaultValue={editingProduct?.category_id || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">카테고리 선택</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">브랜드</label>
                    <input
                      type="text"
                      name="brand"
                      defaultValue={editingProduct?.brand || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">제조사</label>
                    <input
                      type="text"
                      name="manufacturer"
                      defaultValue={editingProduct?.manufacturer || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">단위 *</label>
                    <input
                      type="text"
                      name="unit"
                      defaultValue={editingProduct?.unit || '개'}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">기본 가격 *</label>
                    <input
                      type="number"
                      name="base_price"
                      defaultValue={editingProduct?.base_price}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">원가</label>
                    <input
                      type="number"
                      name="cost_price"
                      defaultValue={editingProduct?.cost_price || 0}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">세율</label>
                    <input
                      type="number"
                      name="tax_rate"
                      defaultValue={editingProduct?.tax_rate || 0.1}
                      min="0"
                      max="1"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">제조 시간 (분)</label>
                    <input
                      type="number"
                      name="preparation_time"
                      defaultValue={editingProduct?.preparation_time || 0}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">설명</label>
                    <textarea
                      name="description"
                      defaultValue={editingProduct?.description || ''}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={editingProduct?.is_active ?? true}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">활성 상태</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="requires_preparation"
                        defaultChecked={editingProduct?.requires_preparation ?? false}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">제조 필요</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {showAddModal ? '추가' : '수정'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 지점별 상세 현황 모달 */}
      {showStoreDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  "{selectedProduct.name}" 지점별 현황
                </h3>
                <button
                  onClick={() => setShowStoreDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">지점명</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">판매가</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">재고</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">안전재고</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">할인율</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stores.map((store) => {
                      const storeProduct = selectedProduct.store_products?.find(sp => sp.store_id === store.id);
                      return (
                        <tr key={store.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{store.name}</div>
                            <div className="text-xs text-gray-500">{store.address}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {storeProduct ? (
                              <div className="text-sm text-gray-900">
                                {storeProduct.price.toLocaleString()}원
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">미등록</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {storeProduct ? (
                              <div className={`text-sm font-medium ${
                                storeProduct.stock_quantity === 0 ? 'text-red-600' :
                                storeProduct.stock_quantity <= storeProduct.safety_stock ? 'text-orange-600' :
                                'text-gray-900'
                              }`}>
                                {storeProduct.stock_quantity.toLocaleString()}개
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">-</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {storeProduct ? (
                              <div className="text-sm text-gray-900">{storeProduct.safety_stock}개</div>
                            ) : (
                              <div className="text-sm text-gray-400">-</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {storeProduct && storeProduct.discount_rate > 0 ? (
                              <div className="text-sm text-red-600">
                                {Math.round(storeProduct.discount_rate * 100)}%
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">-</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {storeProduct ? (
                              <div className="flex flex-col space-y-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  storeProduct.is_available 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {storeProduct.is_available ? '판매중' : '판매중단'}
                                </span>
                                {storeProduct.stock_quantity === 0 && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    품절
                                  </span>
                                )}
                                {storeProduct.stock_quantity > 0 && storeProduct.stock_quantity <= storeProduct.safety_stock && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                    재고부족
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                미등록
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">상품 삭제 확인</h3>
              <p className="text-sm text-gray-600 mb-4">
                정말로 "{productToDelete.name}" 상품을 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HQProducts; 