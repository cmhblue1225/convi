import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Tables } from '../../lib/supabase/types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type Category = Tables<'categories'>;

// 카테고리별 아이콘 매핑
const categoryIcons: Record<string, string> = {
  // 대분류
  '음료': '🥤',
  '식품': '🍱',
  '간식': '🍪',
  '생활용품': '🧴',

  // 음료 세부
  '탄산음료': '🥤',
  '커피/차': '☕',
  '우유/유제품': '🥛',
  '주스/음료': '🧃',
  '에너지음료': '⚡',

  // 식품 세부
  '즉석식품': '🍲',
  '라면/면류': '🍜',
  '냉동식품': '🧊',
  '빵/베이커리': '🥐',
  '계란': '🥚', // 🥚(계란) 이 일부 환경에서 안 보일 수 있습니다. 대체: '🍳'(계란 프라이), '🐣'(병아리), '🦤'(알), '🍥'(어묵/나선), '🧈'(버터)

  // 간식 세부
  '과자/스낵': '🍟',
  '초콜릿/사탕': '🍫',
  '아이스크림': '🍦',
  '견과류': '🥜',
  '껌/젤리': '🍬',

  // 생활용품 세부
  '세제/청소용품': '🧹',
  '화장지/휴지': '🧻',
  '개인위생용품': '🧼',
  '화장품/미용': '💄',
  '의약품/건강': '💊',
  '문구/사무용품': '✏️',
  '전자제품/배터리': '🔋',
  '담배/주류': '🍶',
  '반려동물용품': '🐾',
  '자동차용품': '🚗',
};

// 카테고리별 배경색 매핑
const categoryColors: Record<string, string> = {
  '음료': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  '식품': 'bg-green-50 border-green-200 hover:bg-green-100',
  '간식': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  '생활용품': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
};

const CustomerCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('카테고리 로딩 오류:', err);
      setError('카테고리를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/customer/products?category=${category.slug}`, {
      state: { categoryName: category.name }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          상품 카테고리
        </h1>
        <p className="text-gray-600">
          원하는 카테고리를 선택하여 상품을 둘러보세요
        </p>
      </div>

      {/* 카테고리 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`
              relative group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200
              ${categoryColors[category.name] || 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
              transform hover:scale-105 hover:shadow-lg
            `}
          >
            {/* 카테고리 아이콘 */}
            <div className="text-4xl mb-4 text-center">
              {categoryIcons[category.name] || '📦'}
            </div>

            {/* 카테고리 정보 */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
              )}
              
              {/* 클릭 안내 */}
              <div className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                클릭하여 상품 보기 →
              </div>
            </div>

            {/* 호버 효과 */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-current opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>

      {/* 카테고리가 없을 때 */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            카테고리가 없습니다
          </h3>
          <p className="text-gray-600">
            현재 등록된 카테고리가 없습니다.
          </p>
        </div>
      )}

      {/* 추가 정보 섹션 */}
      <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🛍️ 쇼핑 안내
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">1.</span>
            <span>원하는 카테고리를 선택하세요</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">2.</span>
            <span>상품을 장바구니에 담으세요</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">3.</span>
            <span>결제 후 픽업 또는 배송을 받으세요</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCategories; 