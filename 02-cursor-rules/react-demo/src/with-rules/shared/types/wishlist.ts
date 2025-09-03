import type { Product } from './product';

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export interface WishlistStore {
  items: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}
