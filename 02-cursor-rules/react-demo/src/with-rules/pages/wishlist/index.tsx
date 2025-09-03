import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WishlistItem from '@/with-rules/features/wishlist/ui/WishlistItem';
import { useWishlistStore } from '@/with-rules/features/wishlist/model/wishlistStore';

const WishlistPage: React.FC = () => {
  const { items, clearWishlist, getTotalItems } = useWishlistStore();
  const totalItems = getTotalItems();

  const handleClearWishlist = () => {
    if (window.confirm('위시리스트를 모두 삭제하시겠습니까?')) {
      clearWishlist();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">위시리스트</h1>
              <p className="text-gray-600 mt-1">
                관심 있는 상품들을 저장하고 관리해보세요
              </p>
            </div>
            
            <Link to="/with-rules">
              <Button variant="outline">
                ← 상품 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 위시리스트 상태 및 액션 */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-medium text-gray-900">
                총 {totalItems}개의 상품
              </span>
            </div>
            
            <Button 
              onClick={handleClearWishlist}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              전체 삭제
            </Button>
          </div>
        )}

        {/* 위시리스트 아이템들 */}
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <WishlistItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          // 빈 위시리스트 상태
          <Card className="text-center py-12">
            <CardHeader>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">🤍</span>
              </div>
              <CardTitle className="text-xl text-gray-900">
                위시리스트가 비어있습니다
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                관심 있는 상품들을 위시리스트에 추가해보세요.<br />
                마음에 드는 상품을 발견하면 하트 버튼을 눌러주세요!
              </p>
              
              <div className="space-y-3">
                <Link to="/with-rules">
                  <Button size="lg">
                    상품 둘러보기
                  </Button>
                </Link>
                
                <div className="text-sm text-gray-500">
                  💡 팁: 상품 목록이나 상세 페이지에서 하트 버튼을 눌러<br />
                  위시리스트에 상품을 추가할 수 있습니다
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
