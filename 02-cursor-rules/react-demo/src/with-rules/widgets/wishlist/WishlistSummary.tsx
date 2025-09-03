import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/with-rules/features/wishlist/model/wishlistStore';

interface WishlistSummaryProps {
  className?: string;
}

const WishlistSummary: React.FC<WishlistSummaryProps> = ({ className = '' }) => {
  const getTotalItems = useWishlistStore(state => state.getTotalItems);
  const totalItems = getTotalItems();

  return (
    <Link 
      to="/with-rules/wishlist" 
      className={`
        relative inline-flex items-center space-x-2 
        px-3 py-2 
        rounded-lg 
        bg-white 
        border border-gray-200 
        hover:bg-gray-50 
        transition-colors
        ${className}
      `}
    >
      <span className="text-lg">🤍</span>
      <span className="text-sm font-medium text-gray-700">위시리스트</span>
      
      {totalItems > 0 && (
        <Badge className="ml-1 min-w-[1.25rem] h-5 text-xs">
          {totalItems}
        </Badge>
      )}
    </Link>
  );
};

export default WishlistSummary;
