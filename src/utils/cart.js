export const addToCart = (product) => {
  // Check if localStorage is available (client-side only)
  if (typeof window === 'undefined') return;
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // For products with the same ID, size, and color, increase quantity
  const existingItemIndex = cart.findIndex(
    item => item.id === product.id && 
    item.size === product.size && 
    item.color === product.color
  );

  if (existingItemIndex !== -1) {
    // Update existing item
    cart[existingItemIndex].quantity += product.quantity;
  } else {
    // Add new item
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.quantity,
      size: product.size,
      color: product.color
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Trigger storage event for real-time cart updates
  window.dispatchEvent(new Event('storage'));
};

export const getCartItems = () => {
  // Check if localStorage is available (client-side only)
  if (typeof window === 'undefined') return [];
  
  return JSON.parse(localStorage.getItem('cart')) || [];
};

export const clearCart = () => {
  // Check if localStorage is available (client-side only)
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('cart');
  
  // Trigger storage event for real-time cart updates
  window.dispatchEvent(new Event('storage'));
};

export const updateCartItemQuantity = (id, quantity) => {
  // Check if localStorage is available (client-side only)
  if (typeof window === 'undefined') return [];
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const updatedCart = cart.map(item => 
    item.id === id ? { ...item, quantity } : item
  );
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  
  // Trigger storage event for real-time cart updates
  window.dispatchEvent(new Event('storage'));
  
  return updatedCart;
};

export const removeFromCart = (id) => {
  // Check if localStorage is available (client-side only)
  if (typeof window === 'undefined') return [];
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const updatedCart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  
  // Trigger storage event for real-time cart updates
  window.dispatchEvent(new Event('storage'));
  
  return updatedCart;
}; 