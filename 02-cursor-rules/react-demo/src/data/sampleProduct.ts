import type { Product } from '../with-rules/shared/types/product';

export const sampleProduct: Product = {
  id: 1,
  name: "MacBook Pro 14-inch",
  price: 1999000,
  originalPrice: 2199000,
  discount: 9,
  category: "Laptop",
  brand: "Apple",
  description: "Apple의 최신 MacBook Pro 14인치는 M3 Pro 칩을 탑재하여 뛰어난 성능과 효율성을 제공합니다. 전문가급 작업을 위한 완벽한 노트북입니다.",
  features: [
    "M3 Pro 칩",
    "14.2인치 Liquid Retina XDR 디스플레이",
    "18시간 배터리 수명",
    "12MP FaceTime HD 카메라",
    "Magic Keyboard with Touch ID"
  ],
  specifications: [
    { name: "프로세서", value: "Apple M3 Pro 12코어 CPU" },
    { name: "메모리", value: "18GB 통합 메모리" },
    { name: "저장공간", value: "512GB SSD 저장장치" },
    { name: "디스플레이", value: "14.2인치 (대각선) Liquid Retina XDR 디스플레이" },
    { name: "해상도", value: "3024 x 1964 픽셀" },
    { name: "그래픽", value: "18코어 GPU" },
    { name: "무게", value: "1.61kg" },
    { name: "두께", value: "1.55cm" }
  ],
  images: [
    {
      id: "img1",
      url: "/images/macbook-pro-14-main.jpg",
      alt: "MacBook Pro 14-inch 메인 이미지",
      isMain: true
    },
    {
      id: "img2",
      url: "/images/macbook-pro-14-side.jpg",
      alt: "MacBook Pro 14-inch 측면 이미지",
      isMain: false
    },
    {
      id: "img3",
      url: "/images/macbook-pro-14-keyboard.jpg",
      alt: "MacBook Pro 14-inch 키보드 이미지",
      isMain: false
    },
    {
      id: "img4",
      url: "/images/macbook-pro-14-ports.jpg",
      alt: "MacBook Pro 14-inch 포트 이미지",
      isMain: false
    }
  ],
  rating: {
    average: 4.7,
    totalReviews: 1247,
    distribution: {
      5: 876,
      4: 248,
      3: 87,
      2: 24,
      1: 12
    }
  },
  reviews: [
    {
      id: "rev1",
      userId: "user123",
      username: "김개발자",
      rating: 5,
      title: "개발자에게 완벽한 노트북",
      content: "M3 Pro 칩의 성능이 정말 뛰어나고, 배터리 수명도 길어서 하루 종일 사용할 수 있습니다. 특히 멀티태스킹 성능이 인상적입니다.",
      date: "2024-01-15",
      verified: true,
      helpful: 23
    },
    {
      id: "rev2",
      userId: "user456",
      username: "디자이너A",
      rating: 5,
      title: "디스플레이가 정말 선명해요",
      content: "Liquid Retina XDR 디스플레이의 색감과 선명도가 정말 좋습니다. 포토샵이나 일러스트레이터 작업할 때 색상 재현이 뛰어나네요.",
      date: "2024-01-10",
      verified: true,
      helpful: 18
    },
    {
      id: "rev3",
      userId: "user789",
      username: "학생B",
      rating: 4,
      title: "성능은 좋지만 가격이...",
      content: "성능은 정말 만족스럽지만 가격이 좀 부담스러워요. 그래도 장기적으로 사용할 것을 생각하면 투자할 만한 가치가 있다고 생각합니다.",
      date: "2024-01-08",
      verified: true,
      helpful: 15
    }
  ],
  stock: 12,
  availability: "in-stock",
  shipping: {
    freeShipping: true,
    estimatedDays: 2
  },
  tags: ["인기상품", "신제품", "무료배송", "Apple", "프로페셔널"]
};

export const sampleProducts: Product[] = [
  sampleProduct,
  {
    ...sampleProduct,
    id: 2,
    name: "iPad Pro 12.9-inch",
    price: 1499000,
    originalPrice: 1599000,
    discount: 6,
    category: "Tablet",
    description: "Apple의 가장 진보된 iPad Pro로, M2 칩과 12.9인치 Liquid Retina XDR 디스플레이를 탑재했습니다.",
    stock: 8,
    rating: {
      ...sampleProduct.rating,
      average: 4.6,
      totalReviews: 892
    }
  },
  {
    ...sampleProduct,
    id: 3,
    name: "iPhone 15 Pro",
    price: 1350000,
    category: "Smartphone",
    brand: "Apple",
    description: "티타늄으로 제작된 iPhone 15 Pro는 A17 Pro 칩과 향상된 카메라 시스템을 갖추고 있습니다.",
    stock: 25,
    availability: "in-stock" as const,
    rating: {
      ...sampleProduct.rating,
      average: 4.8,
      totalReviews: 2156
    }
  }
];