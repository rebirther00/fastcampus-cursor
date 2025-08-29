import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/with-rules/shared/types/product';

interface ProductReviewsProps {
  product: Product;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const { rating, reviews } = product;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="space-y-6">
      {/* 평점 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>고객 리뷰</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {rating.average}
              </div>
              <div className="flex justify-center mb-1">
                {renderStars(rating.average)}
              </div>
              <div className="text-sm text-gray-600">
                총 {rating.totalReviews.toLocaleString()}개 리뷰
              </div>
            </div>
            
            <div className="flex-1">
              {Object.entries(rating.distribution)
                .reverse()
                .map(([star, count]) => (
                  <div key={star} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm w-4">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${(count / rating.totalReviews) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 개별 리뷰들 */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>리뷰 ({reviews.length}개)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="space-y-3">
                    {/* 리뷰 헤더 */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {review.username}
                          </span>
                                                     {review.verified && (
                             <Badge>
                               구매 확인
                             </Badge>
                           )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {formatDate(review.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 리뷰 내용 */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        {review.title}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {review.content}
                      </p>
                    </div>

                    {/* 도움됨 버튼 */}
                    <div className="flex items-center space-x-2 text-sm">
                      <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                        <span>👍</span>
                        <span>도움됨 {review.helpful}</span>
                      </button>
                    </div>
                  </div>
                  
                  {index < reviews.length - 1 && (
                    <Separator className="mt-6" />
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

export default ProductReviews; 