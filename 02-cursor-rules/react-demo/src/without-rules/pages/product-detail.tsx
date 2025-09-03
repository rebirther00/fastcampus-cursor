import { useState } from 'react'
import type { Product } from '../types/product'
import { sampleProduct } from '../../data/sampleProduct'



function ProductDetail() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    alert(`${quantity}개 상품을 장바구니에 추가했습니다!`)
  }

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 상단 네비게이션 */}
      <nav className="mb-6">
        <a href="/without-rules" className="text-blue-600 hover:underline">
          ← 상품 목록으로 돌아가기
        </a>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 이미지 갤러리 */}
        <div>
          <div className="mb-4">
            <img
              src={sampleProduct.images[selectedImageIndex].url}
              alt={sampleProduct.images[selectedImageIndex].alt}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/600x400?text=상품+이미지'
              }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {sampleProduct.images.map((image, index) => (
              <img
                key={image.id}
                src={image.url}
                alt={image.alt}
                className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                  selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                }`}
                onClick={() => setSelectedImageIndex(index)}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/80x80?text=썸네일'
                }}
              />
            ))}
          </div>
        </div>

        {/* 상품 정보 */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-gray-500">{sampleProduct.brand}</span>
            <h1 className="text-3xl font-bold mb-2">{sampleProduct.name}</h1>
            
            {/* 평점 */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Math.floor(sampleProduct.rating.average)} />
              <span className="text-gray-600">
                {sampleProduct.rating.average} ({sampleProduct.rating.totalReviews}개 리뷰)
              </span>
            </div>

            {/* 가격 */}
            <div className="mb-6">
              {sampleProduct.originalPrice && (
                <div className="text-lg text-gray-500 line-through">
                  {sampleProduct.originalPrice.toLocaleString()}원
                </div>
              )}
              <div className="text-3xl font-bold text-red-600">
                {sampleProduct.price.toLocaleString()}원
              </div>
              {sampleProduct.discount && (
                <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                  {sampleProduct.discount}% 할인
                </span>
              )}
            </div>
          </div>

          {/* 상품 설명 */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{sampleProduct.description}</p>
          </div>

          {/* 태그 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {sampleProduct.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 재고 및 배송 정보 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>재고 상태:</span>
              <span className={`font-medium ${
                sampleProduct.availability === 'in-stock' ? 'text-green-600' : 'text-red-600'
              }`}>
                {sampleProduct.availability === 'in-stock' ? `구매 가능 (${sampleProduct.stock}개)` : '품절'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>배송:</span>
              <span className="font-medium">
                {sampleProduct.shipping.freeShipping ? '무료배송' : '유료배송'} 
                (예상 {sampleProduct.shipping.estimatedDays}일)
              </span>
            </div>
          </div>

          {/* 구매 옵션 */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium">수량:</label>
              <div className="flex border border-gray-300 rounded">
                <button
                  className="px-3 py-1 hover:bg-gray-100"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                <button
                  className="px-3 py-1 hover:bg-gray-100"
                  onClick={() => setQuantity(Math.min(sampleProduct.stock, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={sampleProduct.availability !== 'in-stock'}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                장바구니 담기
              </button>
              <button
                disabled={sampleProduct.availability !== 'in-stock'}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                바로 구매
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 정보 탭 */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <a className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
              상세 정보
            </a>
            <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              스펙
            </a>
            <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              리뷰 ({sampleProduct.rating.totalReviews})
            </a>
          </nav>
        </div>

        <div className="py-8">
          {/* 주요 특징 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">주요 특징</h3>
            <ul className="space-y-2">
              {sampleProduct.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* 상세 스펙 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">상세 스펙</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {sampleProduct.specifications.map((spec, index) => (
                <div
                  key={index}
                  className={`flex py-3 px-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="w-1/3 font-medium text-gray-700">{spec.name}</div>
                  <div className="w-2/3 text-gray-900">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 리뷰 섹션 */}
          <div>
            <h3 className="text-xl font-bold mb-4">고객 리뷰</h3>
            <div className="space-y-6">
              {sampleProduct.reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.username}</span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          구매 확인
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} />
                    <span className="font-medium">{review.title}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.content}</p>
                  <div className="text-sm text-gray-500">
                    도움이 됨 {review.helpful}명
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail 