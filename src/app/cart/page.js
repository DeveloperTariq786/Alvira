'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCartItems, updateCartItemQuantity, removeFromCart } from '@/utils/cart';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingState from '@/components/ui/LoadingState';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState({
    items: {},
    checkout: false
  });

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const items = await getCartItems();
        setCartItems(Array.isArray(items) ? items : []);
        calculateTotal(Array.isArray(items) ? items : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setCartItems([]);
        calculateTotal([]);
        setLoading(false);
      }
    };

    fetchCartItems();

    // Listen for cart updates
    const handleCartUpdate = async () => {
      try {
        const items = await getCartItems();
        setCartItems(Array.isArray(items) ? items : []);
        calculateTotal(Array.isArray(items) ? items : []);
        // Clear any pending updates after a successful fetch
        setPendingUpdates({ items: {}, checkout: false });
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const calculateTotal = (items) => {
    if (!Array.isArray(items)) {
      console.error('Items is not an array:', items);
      setTotal(0);
      setTaxes(0);
      return;
    }

    const subtotal = items.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
    const calculatedTaxes = subtotal * 0.18; // 18% tax rate example
    setTotal(subtotal + calculatedTaxes);
    setTaxes(calculatedTaxes);
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Apply optimistic update
    const updatedItems = cartItems.map(item => 
      item.productId === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    
    // Track pending update only for this specific item
    setPendingUpdates(prev => ({
      ...prev,
      items: { ...prev.items, [id]: true }
    }));
    
    try {
      // Make the API call in the background
      await updateCartItemQuantity(id, newQuantity);
      // Clear this specific pending update
      setPendingUpdates(prev => ({
        ...prev,
        items: Object.fromEntries(
          Object.entries(prev.items).filter(([key]) => key !== id)
        )
      }));
    } catch (error) {
      console.error('Error updating quantity:', error);
      // If the API call fails, you might want to revert the optimistic update
      // by fetching the latest cart data
      try {
        const items = await getCartItems();
        setCartItems(Array.isArray(items) ? items : []);
        calculateTotal(Array.isArray(items) ? items : []);
        setPendingUpdates(prev => ({
          ...prev,
          items: Object.fromEntries(
            Object.entries(prev.items).filter(([key]) => key !== id)
          )
        }));
      } catch (fetchError) {
        console.error('Error fetching cart after failed update:', fetchError);
      }
    }
  };

  const removeItem = async (id) => {
    // Apply optimistic update for removal
    const filteredItems = cartItems.filter(item => item.productId !== id);
    setCartItems(filteredItems);
    calculateTotal(filteredItems);
    
    // Track pending update only for this specific item
    setPendingUpdates(prev => ({
      ...prev,
      items: { ...prev.items, [id]: true }
    }));
    
    try {
      // Make the API call in the background
      await removeFromCart(id);
      // Clear this specific pending update
      setPendingUpdates(prev => ({
        ...prev,
        items: Object.fromEntries(
          Object.entries(prev.items).filter(([key]) => key !== id)
        )
      }));
    } catch (error) {
      console.error('Error removing item:', error);
      // If the API call fails, revert the optimistic update
      try {
        const items = await getCartItems();
        setCartItems(Array.isArray(items) ? items : []);
        calculateTotal(Array.isArray(items) ? items : []);
        setPendingUpdates(prev => ({
          ...prev,
          items: Object.fromEntries(
            Object.entries(prev.items).filter(([key]) => key !== id)
          )
        }));
      } catch (fetchError) {
        console.error('Error fetching cart after failed removal:', fetchError);
      }
    }
  };

  // Safely calculate subtotal
  const subtotal = Array.isArray(cartItems) 
    ? cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0)
    : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16">
          <LoadingState message="Loading your cart..." />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16">
        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <h2 className="text-3xl font-display mb-4 text-black">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
            <Link href="/products">
              <button className="px-8 py-3 font-medium text-center transition-colors duration-200 rounded-md bg-[#c5a87f] text-white hover:bg-[#b39770]">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="mb-16">
            <h1 className="text-3xl font-display mb-8 text-[#1e2832]">Your Shopping Bag</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {cartItems.map((item) => {
                    const isPending = pendingUpdates.items[item.productId];
                    return (
                      <div key={item.productId} className="flex space-x-4 pb-6 border-b border-gray-100">                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-50 relative flex-shrink-0">
                          <Image
                            src={item.image || 'https://via.placeholder.com/100x100'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-display text-lg text-[#1e2832]">{item.name}</h3>
                            <p className="font-medium text-[#1e2832]">₹{(item.price || 0).toLocaleString()}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center">
                              <div className="border border-gray-300 inline-flex rounded">
                                <button 
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-[#1e2832] border-r border-gray-300 hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <div className="w-8 h-8 flex items-center justify-center text-green-600 font-medium">
                                  {item.quantity}
                                </div>
                                <button 
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-[#1e2832] border-l border-gray-300 hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => removeItem(item.productId)}
                              className="text-red-500 text-sm font-medium hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-md shadow-sm border border-gray-100">
                  <h2 className="text-xl font-display mb-6 text-[#1e2832]">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-[#1e2832]">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-[#1e2832]">Free</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes</span>
                      <span className="font-medium text-[#1e2832]">₹{taxes.toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between">
                        <span className="font-medium text-[#1e2832]">Total</span>
                        <span className="font-medium text-[#1e2832]">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Link href="/checkout">
                      <button 
                        className="w-full py-3 bg-[#1e2832] text-white font-medium text-center rounded hover:bg-[#323b44]"
                      >
                        Proceed to Checkout
                      </button>
                    </Link>
                    
                    <div className="mt-8"></div>
                    
                    <Link href="/products">
                      <button className="w-full py-3 border border-gray-300 bg-white text-[#1e2832] font-medium text-center rounded hover:bg-gray-50">
                        Continue Shopping
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default CartPage;