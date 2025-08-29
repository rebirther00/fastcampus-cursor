import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/with-rules/shared/types/product';

interface ProductSpecsProps {
  product: Product;
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({ product }) => {
  return (
    <div className="space-y-6">
      {/* 상품 설명 */}
      <Card>
        <CardHeader>
          <CardTitle>상품 설명</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {product.description}
          </p>
        </CardContent>
      </Card>

      {/* 주요 특징 */}
      {product.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>주요 특징</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 상세 스펙 */}
      {product.specifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>상세 스펙</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {product.specifications.map((spec, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start py-2">
                    <span className="font-medium text-gray-700 w-1/3">
                      {spec.name}
                    </span>
                    <span className="text-gray-600 w-2/3 text-right">
                      {spec.value}
                    </span>
                  </div>
                  {index < product.specifications.length - 1 && (
                    <Separator />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductSpecs; 