import { create } from 'zustand';
import { getCart as getCartAPI, updateCart as updateCartAPI, clearCart as clearCartAPI } from '@/utils/api';

const useCartStore = create((set, get) => ({
  items: [],
  loading: true,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await getCartAPI();
      const items = Array.isArray(cart.items) ? cart.items : [];
      set({ items, loading: false });
    } catch (error) {
      console.error('Error fetching cart:', error);
      set({ items: [], loading: false, error: 'Failed to fetch cart.' });
    }
  },

  addToCart: async (product) => {
    const { items } = get();
    const existingItemIndex = items.findIndex(item => item.productId === product.id);

    let updatedItems;
    if (existingItemIndex !== -1) {
      updatedItems = items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + product.quantity }
          : item
      );
    } else {
      updatedItems = [...items, { 
        productId: product.id, 
        quantity: product.quantity,
        name: product.name,
        price: product.price,
        image: product.image
      }];
    }
    
    set({ items: updatedItems }); // Optimistic update

    try {
      await updateCartAPI(updatedItems.map(({ productId, quantity }) => ({ productId, quantity })));
    } catch (error) {
      console.error('Error adding to cart:', error);
      set({ items }); // Revert on failure
      // Optionally, notify the user of the failure
    }
  },

  updateQuantity: async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const { items } = get();
    const originalItems = [...items];
    const updatedItems = items.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );

    set({ items: updatedItems }); // Optimistic update

    try {
      await updateCartAPI(updatedItems.map(({ productId, quantity }) => ({ productId, quantity })));
    } catch (error) {
      console.error('Error updating quantity:', error);
      set({ items: originalItems }); // Revert on failure
    }
  },

  removeFromCart: async (productId) => {
    const { items } = get();
    const originalItems = [...items];
    const updatedItems = items.filter(item => item.productId !== productId);

    set({ items: updatedItems }); // Optimistic update

    try {
      await updateCartAPI(updatedItems.map(({ productId, quantity }) => ({ productId, quantity })));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      set({ items: originalItems }); // Revert on failure
    }
  },

  clearCart: async () => {
    const { items } = get();
    const originalItems = [...items];
    set({ items: [] }); // Optimistic update

    try {
      await clearCartAPI();
    } catch (error) {
      console.error('Error clearing cart:', error);
      set({ items: originalItems }); // Revert on failure
    }
  },
}));

export default useCartStore; 