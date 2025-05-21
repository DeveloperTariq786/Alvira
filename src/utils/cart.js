import { updateCart as updateCartAPI, getCart as getCartAPI, clearCart as clearCartAPI } from './api';

export const addToCart = async (product) => {
  try {
    // Get current cart items from API
    let cartItems = [];
    try {
      const cart = await getCartAPI();
      cartItems = cart.items || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Continue with empty cart if there's an error
    }
    
    // For products with the same ID, size, and color, increase quantity
    const existingItemIndex = cartItems.findIndex(
      item => item.productId === product.id
    );

    let updatedItems = [];
    
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      updatedItems = cartItems.map((item, index) => {
        if (index === existingItemIndex) {
          return {
            ...item,
            quantity: item.quantity + product.quantity
          };
        }
        return item;
      });
    } else {
      // Add new item
      updatedItems = [
        ...cartItems,
        {
          productId: product.id,
          quantity: product.quantity
        }
      ];
    }
    
    // Update cart on server
    const updatedCart = await updateCartAPI(updatedItems);
    
    // Trigger storage event for real-time cart updates
    window.dispatchEvent(new Event('cart-updated'));
    
    return updatedCart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getCartItems = async () => {
  try {
    const cart = await getCartAPI();
    return cart.items || [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};

export const clearCart = async () => {
  try {
    await clearCartAPI();
    
    // Trigger storage event for real-time cart updates
    window.dispatchEvent(new Event('cart-updated'));
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (id, quantity) => {
  try {
    // Get current cart items
    let cartItems = [];
    try {
      const cart = await getCartAPI();
      cartItems = cart.items || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
    
    // Update the quantity of the specified item
    const updatedItems = cartItems.map(item => 
      item.productId === id ? { ...item, quantity } : item
    );
    
    // Update cart on server
    const updatedCart = await updateCartAPI(updatedItems);
    
    // Trigger storage event for real-time cart updates
    window.dispatchEvent(new Event('cart-updated'));
    
    return updatedCart.items;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

export const removeFromCart = async (id) => {
  try {
    // Get current cart items
    let cartItems = [];
    try {
      const cart = await getCartAPI();
      cartItems = cart.items || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
    
    // Remove the specified item
    const updatedItems = cartItems.filter(item => item.productId !== id);
    
    // Update cart on server
    const updatedCart = await updateCartAPI(updatedItems);
    
    // Trigger storage event for real-time cart updates
    window.dispatchEvent(new Event('cart-updated'));
    
    return updatedCart.items;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
}; 