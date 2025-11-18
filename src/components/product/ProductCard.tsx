import React, { useState } from 'react';
import { WishlistButton } from '../common/WishlistButton';
import LazyImage from '../common/LazyImage';
import ImageGallery from '../common/ImageGallery';
import type { Product } from '../../types/common';

interface ProductCardProps {
  product: Product & {
    image_urls?: string[];
    base_price?: number;
    discount_rate?: number;
    stock_quantity?: number;
    safety_stock?: number;
    brand?: string;
    promotionInfo?: {
      promotion_type: 'buy_one_get_one' | 'buy_two_get_one' | null;
      promotion_name: string | null;
    };
  };
  onAddToCart?: () => void;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: (newState: boolean) => void;
  layout?: 'grid' | 'list';
  showGallery?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  onAddToCart,
  showWishlist = true,
  isWishlisted = false,
  onWishlistToggle,
  layout = 'grid',
  showGallery = false
}) => {
  const [showImageModal, setShowImageModal] = useState(false);

  const hasImages = product.image_urls && product.image_urls.length > 0;
  const imageUrls = hasImages ? product.image_urls : [];
  const price = product.base_price || product.price || 0;

  // 행사 배지 렌더링 함수
  const getPromotionBadge = () => {
    if (!product.promotionInfo?.promotion_type) return null;
    
    const isOnePlusOne = product.promotionInfo.promotion_type === 'buy_one_get_one';
    return (
      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
        isOnePlusOne ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`}>
        {isOnePlusOne ? '1+1' : '2+1'}
      </span>
    );
  };

  // 할인 정보 계산
  const hasDiscount = product.discount_rate && product.discount_rate > 0;
  const discountedPrice = hasDiscount 
    ? price * (1 - product.discount_rate)
    : price;

  // 재고 상태
  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity !== undefined && 
                     product.stock_quantity > 0 && 
                     product.stock_quantity <= (product.safety_stock || 5);

  if (layout === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
        <div className="flex space-x-4">
          {/* 이미지 섹션 */}
          <div className="flex-shrink-0 w-24 h-24">
            {showGallery && imageUrls.length > 1 ? (
              <ImageGallery
                images={imageUrls}
                productName={product.name}
                showThumbnails={false}
                className="w-full h-full"
              />
            ) : (
              <div className="relative w-full h-full">
                <LazyImage
                  src={imageUrls[0] || ''}
                  alt={product.name}
                  className="w-full h-full rounded-lg cursor-pointer"
                  onClick={() => showGallery && setShowImageModal(true)}
                />
                {imageUrls.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                    +{imageUrls.length - 1}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 정보 섹션 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                {product.brand && (
                  <p className="text-sm text-gray-500">{product.brand}</p>
                )}
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                )}
              </div>
              
              {/* 찜하기 버튼 */}
              {showWishlist && (
                <div className="ml-2">
                  <WishlistButton
                    productId={product.id}
                    isWishlisted={isWishlisted}
                    onToggle={onWishlistToggle || (() => {})}
                  />
                </div>
              )}
            </div>

            {/* 가격 및 액션 */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-col">
                {hasDiscount ? (
                  <>
                    <span className="text-lg font-bold text-red-600">
                      {discountedPrice.toLocaleString()}원
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {price.toLocaleString()}원
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {price.toLocaleString()}원
                  </span>
                )}
                
                {/* 재고 상태 */}
                {product.stock_quantity !== undefined && (
                  <>
                    {isOutOfStock && (
                      <span className="text-sm text-red-500 font-medium">품절</span>
                    )}
                    {isLowStock && !isOutOfStock && (
                      <span className="text-sm text-orange-500">재고 {product.stock_quantity}개 남음</span>
                    )}
                    {!isOutOfStock && !isLowStock && (
                      <span className="text-sm text-green-500">재고 {product.stock_quantity}개</span>
                    )}
                  </>
                )}
              </div>

              {onAddToCart && (
                <button
                  onClick={onAddToCart}
                  disabled={isOutOfStock}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isOutOfStock ? '품절' : '담기'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid 레이아웃 (기본)
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative group">
      {/* 찜하기 버튼 */}
      {showWishlist && (
        <div className="absolute top-2 right-2 z-20">
          <WishlistButton
            productId={product.id}
            isWishlisted={isWishlisted}
            onToggle={onWishlistToggle || (() => {})}
          />
        </div>
      )}

      {/* 배지들 */}
      <div className="absolute top-2 left-2 z-10 space-y-1">
        {/* 할인 배지 */}
        {hasDiscount && (
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            {Math.round(product.discount_rate * 100)}% 할인
          </div>
        )}
        
        {/* 행사 배지 */}
        {getPromotionBadge()}
      </div>

      {/* 이미지 섹션 */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {showGallery && imageUrls.length > 1 ? (
          <ImageGallery
            images={imageUrls}
            productName={product.name}
            showThumbnails={false}
            className="w-full h-full"
          />
        ) : (
          <div className="relative w-full h-full">
            <LazyImage
              src={imageUrls[0] || ''}
              alt={product.name}
              className="w-full h-full cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => showGallery && imageUrls.length > 0 && setShowImageModal(true)}
            />
            {imageUrls.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                +{imageUrls.length - 1}개
              </div>
            )}
          </div>
        )}

        {/* 품절 오버레이 */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">품절</span>
          </div>
        )}
      </div>
      
      {/* 상품 정보 */}
      <div className="space-y-2">
        <div>
          <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
          {product.brand && (
            <p className="text-sm text-gray-500">{product.brand}</p>
          )}
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}
        
        {/* 가격 정보 */}
        <div className="space-y-1">
          {hasDiscount ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600">
                  {discountedPrice.toLocaleString()}원
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {price.toLocaleString()}원
                </span>
              </div>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {price.toLocaleString()}원
            </span>
          )}
        </div>

        {/* 재고 정보 */}
        {product.stock_quantity !== undefined && (
          <div className="text-sm">
            {isOutOfStock && (
              <span className="text-red-500 font-medium">품절</span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="text-orange-500">재고 {product.stock_quantity}개 남음</span>
            )}
            {!isOutOfStock && !isLowStock && (
              <span className="text-green-500">
                재고 {product.stock_quantity}개
              </span>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        {onAddToCart && (
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isOutOfStock ? '품절' : '장바구니 담기'}
          </button>
        )}
      </div>

      {/* 이미지 모달 */}
      {showImageModal && imageUrls.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
          <ImageGallery
            images={imageUrls}
            productName={product.name}
            showThumbnails={true}
            className="w-full h-full"
          />
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
});
