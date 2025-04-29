'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCartItems, updateCartItemQuantity, removeFromCart } from '@/utils/cart';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [taxes, setTaxes] = useState(0);

  useEffect(() => {
    const items = getCartItems();
    setCartItems(items);
    calculateTotal(items);
  }, []);

  const calculateTotal = (items) => {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const calculatedTaxes = subtotal * 0.18; // 18% tax rate example
    setTotal(subtotal + calculatedTaxes);
    setTaxes(calculatedTaxes);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = updateCartItemQuantity(id, newQuantity);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const removeItem = (id) => {
    const updatedItems = removeFromCart(id);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16">
        {cartItems.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <h2 className="text-3xl font-display mb-4 text-black">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
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
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex space-x-4 pb-6 border-b border-gray-100">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-50 relative flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-display text-lg text-[#1e2832]">{item.name}</h3>
                          <p className="font-medium text-[#1e2832]">₹{item.price.toLocaleString()}</p>
                        </div>
                        
                        {(item.size || item.color) && (
                          <div className="mt-1 text-sm text-gray-600">
                            {item.size && <span>Size: {item.size.toUpperCase()} {item.color && '|'} </span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center">
                            <div className="border border-gray-300 inline-flex rounded">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-[#1e2832] border-r border-gray-300"
                              >
                                -
                              </button>
                              <div className="w-8 h-8 flex items-center justify-center text-green-600 font-medium">
                                {item.quantity}
                              </div>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-[#1e2832] border-l border-gray-300"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                      <button className="w-full py-3 bg-[#1e2832] text-white font-medium text-center rounded">
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