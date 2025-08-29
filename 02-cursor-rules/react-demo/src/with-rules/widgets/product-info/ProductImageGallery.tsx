import React, { useState } from 'react';
import type { ProductImage } from '@/with-rules/shared/types/product';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ 
  images, 
  productName 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mainImage = images.find(img => img.isMain) || images[0];
  const currentImage = images[selectedImageIndex] || mainImage;

  return (
    <div className="space-y-4">
      {/* 메인 이미지 */}
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">
            {currentImage?.alt || `${productName} 이미지`}
          </div>
        </div>
      </div>

      {/* 썸네일 이미지들 */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center border-2 transition-colors ${
                selectedImageIndex === index 
                  ? 'border-blue-500' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="text-gray-500 text-xs text-center">
                <div className="text-lg">📷</div>
                <div>{index + 1}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery; 