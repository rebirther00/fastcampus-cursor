import { sampleProducts } from '@/data/sampleProduct';
import type { Product } from '@/with-rules/shared/types/product';

// 모든 상품 조회
export const getProducts = async (): Promise<Product[]> => {
  // 실제 API 호출을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 500));
  return sampleProducts;
};

// 특정 상품 조회
export const getProductById = async (id: number): Promise<Product | null> => {
  // 실제 API 호출을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const product = sampleProducts.find(p => p.id === id);
  return product || null;
};

// 카테고리별 상품 조회
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return sampleProducts.filter(p => 
    p.category.toLowerCase() === category.toLowerCase()
  );
};

// 상품 검색
export const searchProducts = async (query: string): Promise<Product[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const lowercaseQuery = query.toLowerCase();
  return sampleProducts.filter(p => 
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.description.toLowerCase().includes(lowercaseQuery) ||
    p.category.toLowerCase().includes(lowercaseQuery) ||
    p.brand.toLowerCase().includes(lowercaseQuery)
  );
}; 