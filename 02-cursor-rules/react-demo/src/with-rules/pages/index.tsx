import { Link } from 'react-router-dom';
import { sampleProducts } from '@/data/sampleProduct';
import WishlistButton from '@/with-rules/features/wishlist/ui/WishlistButton';

function WithRules() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">With Rules - 상품 목록</h1>
        <p className="text-gray-600 mb-8">FSD 패턴과 Cursor Rules를 적용한 상품 목록입니다.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative"
            >
              {/* 위시리스트 버튼 - 우상단에 위치 */}
              <div 
                className="absolute top-4 right-4 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <WishlistButton 
                  product={product}
                  variant="icon"
                  size="md"
                />
              </div>

              <Link
                to={`/with-rules/product/${product.id}`}
                className="block"
              >
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-gray-500 text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm">{product.name} 이미지</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('ko-KR').format(product.price)}원
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {new Intl.NumberFormat('ko-KR').format(product.originalPrice)}원
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600">{product.rating.average}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WithRules