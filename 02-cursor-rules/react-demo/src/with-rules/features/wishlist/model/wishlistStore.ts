import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/with-rules/shared/types/product';
import type { WishlistItem, WishlistStore } from '@/with-rules/shared/types/wishlist';

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToWishlist: (product: Product) => {
        set((state) => {
          const isAlreadyInWishlist = state.items.some(item => item.product.id === product.id);
          
          if (isAlreadyInWishlist) {
            return state;
          }
          
          const newItem: WishlistItem = {
            id: `wishlist-${product.id}-${Date.now()}`,
            product,
            addedAt: new Date().toISOString()
          };
          
          return {
            items: [newItem, ...state.items]
          };
        });
      },
      
      removeFromWishlist: (productId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }));
      },
      
      isInWishlist: (productId: number) => {
        return get().items.some(item => item.product.id === productId);
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.length;
      }
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
