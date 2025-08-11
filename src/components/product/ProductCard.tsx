import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WishlistButton } from '../common/WishlistButton';
import { formatPrice } from '../../utils/format';
import type { Product } from '../../types/common';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="relative group">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          )}
          
          {/* 찜하기 버튼 - 우측 상단에 위치 */}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton productId={product.id} />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(product.price)}원
          </p>
        </div>
      </Link>
    </div>
  );
};
