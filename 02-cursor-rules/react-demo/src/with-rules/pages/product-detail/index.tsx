import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductInfo from '@/with-rules/widgets/product-info/ProductInfo';
import LoadingSpinner from '@/with-rules/shared/ui/LoadingSpinner';
import ErrorMessage from '@/with-rules/shared/ui/ErrorMessage';
import { getProductById } from '@/with-rules/entities/product/api/productQueries';
import type { Product } from '@/with-rules/shared/types/product';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('상품 ID가 제공되지 않았습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const productData = await getProductById(parseInt(id));
        
        if (!productData) {
          setError('상품을 찾을 수 없습니다.');
        } else {
          setProduct(productData);
        }
      } catch (err) {
        setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleRetry = () => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          setError(null);
          const productData = await getProductById(parseInt(id));
          if (!productData) {
            setError('상품을 찾을 수 없습니다.');
          } else {
            setProduct(productData);
          }
                 } catch {
           setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
         } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ErrorMessage 
          message={error || '상품을 찾을 수 없습니다.'} 
          onRetry={error ? handleRetry : undefined}
        />
        <Button 
          onClick={handleGoBack}
          className="mt-4"
        >
          이전 페이지로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            onClick={handleGoBack}
          >
            ← 뒤로가기
          </Button>
        </div>
      </div>

      {/* 상품 정보 */}
      <ProductInfo product={product} />
    </div>
  );
};

export default ProductDetailPage; 