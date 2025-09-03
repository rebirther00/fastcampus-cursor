import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/with-rules/features/cart/model/cartStore';
import WishlistButton from '@/with-rules/features/wishlist/ui/WishlistButton';
import type { Product } from '@/with-rules/shared/types/product';

interface ProductActionsProps {
  product: Product;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    // 장바구니 추가 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addToCart(product, quantity);
    setIsAddingToCart(false);
    
    // 성공 피드백 (실제로는 toast 등을 사용)
    alert(`${product.name}이(가) 장바구니에 추가되었습니다!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    // 실제로는 결제 페이지로 이동
    alert('결제 페이지로 이동합니다.');
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="space-y-6">
      {/* 가격 정보 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(product.price)}원
          </span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(product.originalPrice)}원
            </span>
          )}
          {product.discount && (
            <Badge>
              {product.discount}% 할인
            </Badge>
          )}
        </div>
        
        {/* 배송 정보 */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {product.shipping.freeShipping && (
            <Badge>무료배송</Badge>
          )}
          <span>
            {product.shipping.estimatedDays}일 내 배송
          </span>
        </div>
      </div>

      {/* 재고 상태 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Badge>
            {product.availability === 'in-stock' ? '재고 있음' : 
             product.availability === 'limited' ? '재고 부족' : '품절'}
          </Badge>
          <span className="text-sm text-gray-600">
            재고: {product.stock}개
          </span>
        </div>
      </div>

      {/* 수량 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">수량</label>
        <div className="flex items-center space-x-3">
                  <Button
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
        >
          -
        </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
          onClick={increaseQuantity}
          disabled={quantity >= product.stock}
        >
          +
        </Button>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <Button
            onClick={handleAddToCart}
            disabled={product.availability === 'out-of-stock' || isAddingToCart}
            className="flex-1"
          >
            {isAddingToCart ? '장바구니에 추가 중...' : '장바구니에 담기'}
          </Button>
          
          <WishlistButton 
            product={product} 
            variant="icon" 
            size="lg"
            className="flex-shrink-0"
          />
        </div>
        
        <Button
          onClick={handleBuyNow}
          disabled={product.availability === 'out-of-stock'}
          className="w-full"
        >
          바로 구매하기
        </Button>
        
        {/* 위시리스트 버튼 (풀 사이즈) */}
        <WishlistButton 
          product={product} 
          variant="button" 
          size="md"
          className="w-full"
        />
      </div>

      {/* 태그들 */}
      {product.tags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">태그</div>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <Badge key={index}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductActions; 