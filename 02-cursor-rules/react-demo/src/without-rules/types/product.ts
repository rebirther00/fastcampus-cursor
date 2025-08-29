export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  brand: string;
  description: string;
  features: string[];
  specifications: ProductSpecification[];
  images: ProductImage[];
  rating: ProductRating;
  reviews: ProductReview[];
  stock: number;
  availability: 'in-stock' | 'out-of-stock' | 'limited';
  shipping: ShippingInfo;
  tags: string[];
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
}

export interface ProductRating {
  average: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ProductReview {
  id: string;
  userId: string;
  username: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface ShippingInfo {
  freeShipping: boolean;
  estimatedDays: number;
  cost?: number;
}