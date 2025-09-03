import { Link } from 'react-router-dom'
import { sampleProducts } from '../../data/sampleProduct'

function WithoutRules() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">상품 목록 (Without Rules)</h1>
      <p className="text-gray-600 mb-8">이 페이지는 cursor rules 없이 개발되었습니다.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sampleProducts.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img
              src={product.images[0]?.url}
              alt={product.images[0]?.alt}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=상품+이미지'
              }}
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-red-600">
                    {product.price.toLocaleString()}원
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  )}
                </div>
                {product.discount && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                    {product.discount}% 할인
                  </span>
                )}
              </div>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${star <= Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  ({product.rating.totalReviews})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link 
          to="/without-rules/product-detail" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          상품 상세 페이지로 이동 →
        </Link>
      </div>
    </div>
  )
}

export default WithoutRules