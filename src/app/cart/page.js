'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cart'; // Import the Zustand store
import { calculateTotalPrice } from '@/utils/priceCalculations';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingState from '@/components/ui/LoadingState';

const CartPage = () => {
  const { items: cartItems, loading, fetchCart, updateQuantity, removeFromCart } = useCartStore();
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const calculateTotal = (items) => {
      if (!Array.isArray(items)) {
        setTotal(0);
        setTaxes(0);
        setSubtotal(0);
        setShipping(0);
        return;
      }
  
      const subtotalAmount = items.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
      const { tax, shipping, total } = calculateTotalPrice(subtotalAmount);
  
      setSubtotal(subtotalAmount);
      setTaxes(tax);
      setShipping(shipping);
      setTotal(total);
    };

    calculateTotal(cartItems);
  }, [cartItems]);

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
                    return (
                      <div key={item.productId} className="flex space-x-4 pb-6 border-b border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 relative flex-shrink-0">
                          <Image
                            src={item.image || 'https://via.placeholder.com/100x100'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
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
                              onClick={() => removeFromCart(item.productId)}
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
                <div className="bg-[#fcfaf7] p-6 sticky top-20 rounded-md">
                  <h2 className="text-xl font-display text-[#1e2832] mb-6">Order Summary</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-[#1e2832]">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes</span>
                      <span className="font-medium text-[#1e2832]">₹{taxes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-[#1e2832]">₹{shipping.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t my-6"></div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-display text-[#1e2832]">Total</span>
                    <span className="text-2xl font-bold text-[#1e2832]">₹{total.toLocaleString()}</span>
                  </div>
                  
                  <Link href="/checkout">
                    <button 
                      className="w-full mt-6 py-3 font-medium text-center transition-colors duration-200 rounded-md bg-[#c5a87f] text-white hover:bg-[#b39770] disabled:bg-gray-400"
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </button>
                  </Link>
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