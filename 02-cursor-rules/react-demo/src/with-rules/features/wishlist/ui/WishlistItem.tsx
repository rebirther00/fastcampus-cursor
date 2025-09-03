import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlistStore } from '../model/wishlistStore';
import { useCartStore } from '@/with-rules/features/cart/model/cartStore';
import type { WishlistItem as WishlistItemType } from '@/with-rules/shared/types/wishlist';

interface WishlistItemProps {
  item: WishlistItemType;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item }) => {
  const { product } = item;
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const addToCart = useCartStore(state => state.addToCart);

  const handleRemoveFromWishlist = () => {
    removeFromWishlist(product.id);
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
    // 성공 피드백 (실제로는 toast 등을 사용)
    alert(`${product.name}이(가) 장바구니에 추가되었습니다!`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-sm ${
          index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* 상품 이미지 */}
          <div className="sm:w-48 h-48 sm:h-auto bg-gray-200 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm">{product.name} 이미지</div>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {/* 상품 기본 정보 */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span>{product.brand}</span>
                  <span>•</span>
                  <span>{product.category}</span>
                </div>

                <Link 
                  to={`/with-rules/product/${product.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* 평점 */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex">
                    {renderStars(product.rating.average)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating.average} ({product.rating.totalReviews})
                  </span>
                </div>

                {/* 가격 */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}원
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}원
                    </span>
                  )}
                  {product.discount && (
                    <Badge>
                      {product.discount}% 할인
                    </Badge>
                  )}
                </div>

                {/* 재고 상태 */}
                <div className="mb-4">
                  <Badge variant={product.availability === 'in-stock' ? 'default' : 'secondary'}>
                    {product.availability === 'in-stock' ? '재고 있음' : 
                     product.availability === 'limited' ? '재고 부족' : '품절'}
                  </Badge>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.availability === 'out-of-stock'}
                  className="flex-1"
                >
                  장바구니에 담기
                </Button>
                <Button
                  onClick={handleRemoveFromWishlist}
                  variant="outline"
                  className="flex-1"
                >
                  위시리스트에서 제거
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistItem;
