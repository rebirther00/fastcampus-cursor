import React from 'react';
import ProductImageGallery from './ProductImageGallery';
import ProductActions from '@/with-rules/features/product-detail/ui/ProductActions';
import ProductSpecs from '@/with-rules/features/product-detail/ui/ProductSpecs';
import ProductReviews from '@/with-rules/features/product-detail/ui/ProductReviews';
import type { Product } from '@/with-rules/shared/types/product';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 상품 기본 정보 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 이미지 갤러리 */}
        <div>
          <ProductImageGallery 
            images={product.images} 
            productName={product.name} 
          />
        </div>

        {/* 상품 정보 및 액션 */}
        <div className="space-y-6">
          {/* 브랜드 및 카테고리 */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{product.brand}</span>
            <span>•</span>
            <span>{product.category}</span>
          </div>

          {/* 상품명 */}
          <h1 className="text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* 평점 */}
          <div className="flex items-center space-x-2">
            <div className="flex">
              {renderStars(product.rating.average)}
            </div>
            <span className="text-lg font-medium text-gray-900">
              {product.rating.average}
            </span>
            <span className="text-sm text-gray-600">
              ({product.rating.totalReviews.toLocaleString()}개 리뷰)
            </span>
          </div>

          {/* 상품 액션 */}
          <ProductActions product={product} />
        </div>
      </div>

      {/* 탭 섹션 */}
      <div className="space-y-8">
        {/* 상품 스펙 */}
        <section>
          <ProductSpecs product={product} />
        </section>

        {/* 리뷰 섹션 */}
        <section>
          <ProductReviews product={product} />
        </section>
      </div>
    </div>
  );
};

export default ProductInfo; 