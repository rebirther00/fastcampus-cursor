import type { Product } from '../types/product'

const sampleProduct: Product = {
  id: 1,
  name: '샘플 상품',
  price: 20000,
  originalPrice: 25000,
  discount: 20,
  category: '전자제품',
  brand: '브랜드A',
  description: '이것은 샘플 상품의 상세 설명입니다.',
  features: ['특징1', '특징2', '특징3'],
  specifications: [
    { name: '색상', value: '블랙' },
    { name: '무게', value: '1kg' },
  ],
  images: [
    { id: '1', url: 'https://via.placeholder.com/300', alt: '샘플 이미지', isMain: true },
  ],
  rating: {
    average: 4.5,
    totalReviews: 10,
    distribution: { 5: 7, 4: 2, 3: 1, 2: 0, 1: 0 },
  },
  reviews: [],
  stock: 5,
  availability: 'in-stock',
  shipping: { freeShipping: true, estimatedDays: 2 },
  tags: ['신상품', '인기'],
}

function ProductDetail() {
  return (
    <div>
      <h1>{sampleProduct.name}</h1>
      <img src={sampleProduct.images[0].url} alt={sampleProduct.images[0].alt} width={300} />
      <p>{sampleProduct.description}</p>
      <p>가격: {sampleProduct.price.toLocaleString()}원</p>
      {sampleProduct.originalPrice && (
        <p>할인 전 가격: <s>{sampleProduct.originalPrice.toLocaleString()}원</s></p>
      )}
      <p>카테고리: {sampleProduct.category}</p>
      <p>브랜드: {sampleProduct.brand}</p>
      <h3>주요 특징</h3>
      <ul>
        {sampleProduct.features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <h3>상세 스펙</h3>
      <ul>
        {sampleProduct.specifications.map((s, i) => (
          <li key={i}>{s.name}: {s.value}</li>
        ))}
      </ul>
      <p>재고: {sampleProduct.stock}개 ({sampleProduct.availability === 'in-stock' ? '구매 가능' : '품절'})</p>
      <p>평점: {sampleProduct.rating.average} / 5 ({sampleProduct.rating.totalReviews}명 참여)</p>
      <p>배송: {sampleProduct.shipping.freeShipping ? '무료배송' : '유료배송'} (예상 {sampleProduct.shipping.estimatedDays}일)</p>
      <div>
        {sampleProduct.tags.map((tag, i) => (
          <span key={i} style={{ border: '1px solid #ccc', padding: '2px 6px', marginRight: 4 }}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

export default ProductDetail 