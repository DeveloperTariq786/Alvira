import useCartStore from '@/store/cart';

export const addToCart = async (product) => {
  try {
    await useCartStore.getState().addToCart(product);
    // Trigger storage event for real-time cart updates in other tabs/windows if needed
    window.dispatchEvent(new Event('cart-updated'));
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getCartItems = async () => {
  try {
    // We get items from the store, but fetch if needed
    let items = useCartStore.getState().items;
    if (items.length === 0) {
      await useCartStore.getState().fetchCart();
      items = useCartStore.getState().items;
    }
    return items;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};

export const clearCart = async () => {
  try {
    await useCartStore.getState().clearCart();
    window.dispatchEvent(new Event('cart-updated'));
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (id, quantity) => {
  try {
    await useCartStore.getState().updateQuantity(id, quantity);
    window.dispatchEvent(new Event('cart-updated'));
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

export const removeFromCart = async (id) => {
  try {
    await useCartStore.getState().removeFromCart(id);
    window.dispatchEvent(new Event('cart-updated'));
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
}; 