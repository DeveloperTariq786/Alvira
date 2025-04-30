'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCartItems } from '@/utils/cart';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PaymentPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [upiOption, setUpiOption] = useState('scan');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    const calculateTotals = (items) => {
      const itemsSubtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const calculatedTaxes = itemsSubtotal * 0.18; // 18% tax rate
      
      setSubtotal(itemsSubtotal);
      setTaxes(calculatedTaxes);
      setTotal(itemsSubtotal + calculatedTaxes - discount);
    };

    const items = getCartItems();
    setCartItems(items);
    calculateTotals(items);
  }, [discount]);

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleUpiOptionChange = (option) => {
    setUpiOption(option);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayNow = () => {
    // Validate based on payment method
    if (selectedPaymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        alert('Please fill all card details');
        return;
      }
    } else if (selectedPaymentMethod === 'upi' && upiOption === 'id' && !upiId) {
      alert('Please enter UPI ID');
      return;
    }
    
    // In a real app, you would handle payment processing here
    // For this demo, just show a success message
    alert('Payment successful! Your order has been placed.');
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <style jsx global>{`
        ::placeholder {
          color: #666666 !important;
          opacity: 1;
        }
        
        input, textarea, select {
          color: #333333 !important;
          font-weight: 500;
        }
        
        .order-summary-amount {
          color: #333333 !important;
          font-weight: 500;
        }
        
        .address-type-label {
          color: #333333;
          font-weight: 500;
        }
        
        .order-item-details {
          color: #333333 !important;
          font-weight: 500;
        }
        
        .payment-option {
          border-left: 4px solid transparent;
          transition: all 0.2s ease;
        }
        
        .payment-option.selected {
          border-left-color: #c5a87f;
          background-color: #f9f9f9;
        }
        
        .payment-option:hover:not(.selected) {
          background-color: #f5f5f5;
        }
        
        .total-heading {
          color: #1e2832 !important;
          font-weight: 600;
        }
        
        .payment-input {
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          padding: 0.75rem;
          width: 100%;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .payment-input:focus {
          border-color: #c5a87f;
          outline: none;
          box-shadow: 0 0 0 1px #c5a87f;
        }
        
        .upi-option-label {
          color: #1e2832 !important;
          font-weight: 600;
          font-size: 1rem;
        }
        
        /* Mobile responsive styles */
        @media (max-width: 640px) {
          .payment-tabs-container {
            flex-direction: column;
          }
          
          .payment-methods-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .payment-content-area {
            padding: 1rem;
          }
          
          .payment-option {
            border-left: none;
            border-left-width: 0;
            border-left-style: none;
            padding: 0.75rem 1rem;
          }
          
          .payment-option.selected {
            border-left: none;
            border-left-width: 0;
            background-color: #f9f9f9;
            border-radius: 0.375rem;
          }
          
          .card-inputs-grid {
            grid-template-columns: 1fr;
          }
          
          .upi-qr-container {
            width: 100%;
          }
          
          .upi-qr-code {
            width: 100%;
            max-width: 180px;
            height: auto;
            aspect-ratio: 1/1;
          }
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-6 mt-16 sm:py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display mb-4 text-black">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6 sm:mb-8">You need to add items to your cart before payment.</p>
            <Link href="/products">
              <button className="px-6 sm:px-8 py-3 font-medium text-center transition-colors duration-200 rounded-md bg-[#c5a87f] text-white hover:bg-[#b39770]">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="mb-12 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Payment Options */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-display text-[#1e2832]">Choose Payment Mode</h2>
                  </div>
                  
                  <div className="p-0">
                    {/* Payment Options */}
                    <div className="flex payment-tabs-container">
                      <div className="w-full sm:w-64 border-r border-gray-200 payment-methods-sidebar">
                        <div 
                          className={`payment-option p-3 sm:p-4 flex items-center cursor-pointer ${selectedPaymentMethod === 'recommended' ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodChange('recommended')}
                        >
                          <span className="mr-3">⭐</span>
                          <span className="font-medium text-gray-800">Recommended</span>
                        </div>
                        
                        <div 
                          className={`payment-option p-3 sm:p-4 flex items-center cursor-pointer ${selectedPaymentMethod === 'cod' ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodChange('cod')}
                        >
                          <span className="mr-3">💵</span>
                          <span className="font-medium text-gray-800">Cash On Delivery</span>
                        </div>
                        
                        <div 
                          className={`payment-option p-3 sm:p-4 flex items-center cursor-pointer ${selectedPaymentMethod === 'upi' ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodChange('upi')}
                        >
                          <span className="mr-3">📱</span>
                          <span className="font-medium text-gray-800">UPI (Pay via any App)</span>
                        </div>
                        
                        <div 
                          className={`payment-option p-3 sm:p-4 flex items-center cursor-pointer ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodChange('card')}
                        >
                          <span className="mr-3">💳</span>
                          <span className="font-medium text-gray-800">Credit/Debit Card</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-3 sm:p-6 payment-content-area">
                        {selectedPaymentMethod === 'recommended' && (
                          <div>
                            <p className="text-gray-700 mb-4">We recommend paying with UPI for fastest processing.</p>
                            <div className="mb-4">
                              {/* Same as UPI option below */}
                              <div className="text-lg sm:text-xl font-medium text-[#1e2832] mb-4">Pay using UPI</div>
                              
                              <div className="space-y-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="upiOption"
                                    checked={upiOption === 'scan'}
                                    onChange={() => handleUpiOptionChange('scan')}
                                    className="mr-3 accent-[#c5a87f]"
                                  />
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 flex items-center justify-center rounded mr-3">
                                      <span className="text-lg">🔍</span>
                                    </div>
                                    <span className="font-medium text-gray-800 upi-option-label">Scan & Pay</span>
                                  </div>
                                </label>
                                
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="upiOption"
                                    checked={upiOption === 'id'}
                                    onChange={() => handleUpiOptionChange('id')}
                                    className="mr-3 accent-[#c5a87f]"
                                  />
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 flex items-center justify-center rounded mr-3">
                                      <span className="text-lg">📱</span>
                                    </div>
                                    <span className="font-medium upi-option-label">Enter UPI ID</span>
                                  </div>
                                </label>
                                
                                {upiOption === 'id' && (
                                  <div className="ml-6 sm:ml-8 mt-4">
                                    <input
                                      type="text"
                                      value={upiId}
                                      onChange={(e) => setUpiId(e.target.value)}
                                      placeholder="yourname@upi"
                                      className="payment-input"
                                    />
                                  </div>
                                )}
                                
                                {upiOption === 'scan' && (
                                  <div className="ml-6 sm:ml-8 mt-4 text-center">
                                    <div className="inline-block border border-gray-200 p-4 rounded upi-qr-container">
                                      <div className="w-36 h-36 sm:w-48 sm:h-48 bg-gray-100 flex items-center justify-center upi-qr-code">
                                        <div className="text-center">
                                          <p className="text-sm text-gray-500 mb-2">QR Code will appear here</p>
                                          <p className="text-xs text-gray-400">Scan with any UPI app</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {selectedPaymentMethod === 'cod' && (
                          <div>
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                              <div className="flex">
                                <span className="text-amber-600 mr-2">⚠️</span>
                                <div>
                                  <p className="text-amber-700 font-medium">Pay on delivery is not available</p>
                                  <p className="text-amber-600 text-sm">Order amount should be between 1 and 1500</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700">Cash on Delivery is unavailable for orders above ₹1500 for security reasons.</p>
                          </div>
                        )}
                        
                        {selectedPaymentMethod === 'upi' && (
                          <div>
                            <div className="text-lg sm:text-xl font-medium text-[#1e2832] mb-4">Pay using UPI</div>
                            
                            <div className="space-y-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="upiOption"
                                  checked={upiOption === 'scan'}
                                  onChange={() => handleUpiOptionChange('scan')}
                                  className="mr-3 accent-[#c5a87f]"
                                />
                                <div className="flex items-center">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 flex items-center justify-center rounded mr-3">
                                    <span className="text-lg">🔍</span>
                                  </div>
                                  <span className="font-medium text-gray-800 upi-option-label">Scan & Pay</span>
                                </div>
                              </label>
                              
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="upiOption"
                                  checked={upiOption === 'id'}
                                  onChange={() => handleUpiOptionChange('id')}
                                  className="mr-3 accent-[#c5a87f]"
                                />
                                <div className="flex items-center">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 flex items-center justify-center rounded mr-3">
                                    <span className="text-lg">📱</span>
                                  </div>
                                  <span className="font-medium upi-option-label">Enter UPI ID</span>
                                </div>
                              </label>
                              
                              {upiOption === 'id' && (
                                <div className="ml-6 sm:ml-8 mt-4">
                                  <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="yourname@upi"
                                    className="payment-input"
                                  />
                                </div>
                              )}
                              
                              {upiOption === 'scan' && (
                                <div className="ml-6 sm:ml-8 mt-4 text-center">
                                  <div className="inline-block border border-gray-200 p-4 rounded upi-qr-container">
                                    <div className="w-36 h-36 sm:w-48 sm:h-48 bg-gray-100 flex items-center justify-center upi-qr-code">
                                      <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-2">QR Code will appear here</p>
                                        <p className="text-xs text-gray-400">Scan with any UPI app</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {selectedPaymentMethod === 'card' && (
                          <div>
                            <div className="text-lg sm:text-xl font-medium text-[#1e2832] mb-4">CREDIT/ DEBIT CARD</div>
                            
                            <div className="mb-6">
                              <p className="text-sm text-[#c5a87f] mb-6">Please ensure your card can be used for online transactions. <span className="underline">Know More</span></p>
                              
                              <div className="space-y-4">
                                <div>
                                  <input
                                    type="text"
                                    name="number"
                                    value={cardDetails.number}
                                    onChange={handleCardInputChange}
                                    placeholder="Card Number"
                                    className="payment-input"
                                  />
                                </div>
                                
                                <div>
                                  <input
                                    type="text"
                                    name="name"
                                    value={cardDetails.name}
                                    onChange={handleCardInputChange}
                                    placeholder="Name on card"
                                    className="payment-input"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 card-inputs-grid">
                                  <input
                                    type="text"
                                    name="expiry"
                                    value={cardDetails.expiry}
                                    onChange={handleCardInputChange}
                                    placeholder="Valid Thru (MM/YY)"
                                    className="payment-input"
                                  />
                                  <input
                                    type="text"
                                    name="cvv"
                                    value={cardDetails.cvv}
                                    onChange={handleCardInputChange}
                                    placeholder="CVV"
                                    className="payment-input"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Payment Action Button - Only show for valid payment methods */}
                        {(selectedPaymentMethod === 'upi' || selectedPaymentMethod === 'card' || selectedPaymentMethod === 'recommended') && (
                          <div className="mt-8">
                            <button
                              onClick={handlePayNow}
                              className="w-full py-3 bg-[#1e2832] text-white font-medium text-center rounded hover:bg-[#314049]"
                            >
                              PAY NOW
                            </button>
                          </div>
                        )}
                        
                        {/* Order button for COD */}
                        {selectedPaymentMethod === 'cod' && (
                          <div className="mt-8">
                            <button
                              onClick={handlePayNow}
                              className="w-full py-3 bg-[#1e2832] text-white font-medium text-center rounded hover:bg-[#314049]"
                            >
                              PLACE ORDER
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1 order-1 lg:order-2 mb-6 lg:mb-0">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm sticky top-20">
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-display text-[#1e2832]">Order Summary</h2>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    {/* Order Items */}
                    <div className="max-h-48 sm:max-h-60 overflow-y-auto mb-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex py-3 border-b border-gray-100">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 relative flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-3 sm:ml-4 flex-1">
                            <p className="text-xs sm:text-sm text-gray-900 font-medium">{item.name}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.size && <span>Size: {item.size.toUpperCase()} {item.color && '|'} </span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                            <div className="flex justify-between mt-1 sm:mt-2">
                              <span className="text-xs sm:text-sm text-gray-700 font-medium">Qty: {item.quantity}</span>
                              <span className="text-xs sm:text-sm font-medium order-item-details">₹{item.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Price Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price ({cartItems.length} items)</span>
                        <span className="order-summary-amount">₹{subtotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-green-600">- ₹{discount.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Charges</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes</span>
                        <span className="order-summary-amount">₹{taxes.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t border-gray-200 font-medium text-base">
                        <span className="font-medium total-heading">Total Amount</span>
                        <span className="font-medium order-summary-amount">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
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

export default PaymentPage; 