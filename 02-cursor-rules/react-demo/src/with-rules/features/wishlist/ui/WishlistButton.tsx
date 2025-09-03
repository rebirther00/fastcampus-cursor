import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '../model/wishlistStore';
import type { Product } from '@/with-rules/shared/types/product';

interface WishlistButtonProps {
  product: Product;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  product, 
  variant = 'icon',
  size = 'md',
  className = '' 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const isInWishlistState = isInWishlist(product.id);

  const handleToggleWishlist = async () => {
    setIsAnimating(true);
    
    // 애니메이션 효과를 위한 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (isInWishlistState) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    
    setIsAnimating(false);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const heartIcon = isInWishlistState ? '❤️' : '🤍';

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleWishlist}
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center 
          rounded-full 
          bg-white 
          shadow-md 
          hover:shadow-lg 
          transition-all 
          duration-200
          ${isAnimating ? 'scale-110' : 'scale-100'}
          ${className}
        `}
        title={isInWishlistState ? '위시리스트에서 제거' : '위시리스트에 추가'}
      >
        {heartIcon}
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggleWishlist}
      variant={isInWishlistState ? "default" : "outline"}
      size={size}
      className={`
        transition-all 
        duration-200
        ${isAnimating ? 'scale-105' : 'scale-100'}
        ${className}
      `}
    >
      <span className="mr-2">{heartIcon}</span>
      {isInWishlistState ? '위시리스트에서 제거' : '위시리스트에 추가'}
    </Button>
  );
};

export default WishlistButton;
