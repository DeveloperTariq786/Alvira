'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCartItems } from '@/utils/cart';
import { calculateTotalPrice } from '@/utils/priceCalculations';
import { createCODPayment, createRazorpayPayment, verifyRazorpayPayment, getUserProfile, clearCart } from '@/utils/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingState from '@/components/ui/LoadingState';

const PaymentPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online'); // cod or online
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    // Start loading Razorpay script immediately
    loadRazorpayScript();
    
    // Try to get order summary from session storage immediately
    let orderSummaryData = {};
    try {
      orderSummaryData = JSON.parse(sessionStorage.getItem('orderSummary') || '{}');
      if (orderSummaryData.orderId) {
        setOrderId(orderSummaryData.orderId);
        // If we have order data, we can use it directly instead of refetching
        if (orderSummaryData.total) {
          setTotal(orderSummaryData.total);
        }
        if (orderSummaryData.subtotal) {
          setSubtotal(orderSummaryData.subtotal);
        }
      }
    } catch (err) {
      console.error('Error parsing order summary from session storage:', err);
    }
    
    const calculateTotals = (items) => {
      if (!Array.isArray(items) || items.length === 0) {
        // Only set these if we don't already have them from order summary
        if (!orderSummaryData.subtotal) {
          setSubtotal(0);
          setTaxes(0);
          setShipping(0);
          setTotal(0);
        }
        return;
      }
      
      const itemsSubtotal = items.reduce((acc, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return acc + (price * quantity);
      }, 0);
      
      // Calculate totals using the utility
      const { tax, shipping, total } = calculateTotalPrice(itemsSubtotal);
      
      // Only update if not already set from order summary
      if (!orderSummaryData.subtotal) {
        setSubtotal(itemsSubtotal);
        setTaxes(tax);
        setShipping(shipping);
        setTotal(total);
      }
    };

    const fetchInitialData = async () => {
      try {
        const [items, profile] = await Promise.all([
          getCartItems(),
          getUserProfile(),
        ]);
        
        setCartItems(Array.isArray(items) ? items : []);
        calculateTotals(Array.isArray(items) ? items : []);
        setUserProfile(profile);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        setCartItems([]);
        calculateTotals([]);
      } finally {
        // Short timeout to reduce perceived loading time
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    fetchInitialData();
  }, []);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    
    // If user selects online payment, immediately initiate Razorpay
    if (method === 'online') {
      initiateRazorpayPayment();
    }
  };

  const initiateRazorpayPayment = async () => {
    if (!orderId) {
      alert('Order information missing. Please return to checkout.');
      router.push('/checkout');
      return;
    }
    
    if (!userProfile) {
      alert('User profile is not loaded yet. Please wait a moment.');
      return;
    }

    try {
      setLoading(true);
      
      // Create Razorpay payment using API
      const paymentData = {
        orderId: orderId,
        amount: total,
        currency: 'INR'
      };
      
      const response = await createRazorpayPayment(paymentData);
      
      if (!response.success || !response.order || !response.order.id) {
        throw new Error('Failed to create Razorpay order');
      }
      
      // Configure Razorpay options
      const options = {
        key: "rzp_test_rLL4rZbzslJYKw", // Razorpay test key
        amount: response.order.amount, // Amount from server in paise
        currency: response.order.currency,
        name: "Alvira",
        description: `Order #${orderId.substring(0, 8)}`,
        order_id: response.order.id, // Use actual Razorpay order ID
        prefill: {
          name: userProfile.name || "Customer",
          email: "customer@example.com",
          contact: userProfile.phone?.replace(/\+91\s?/, '') || "9876543210",
        },
        notes: {
          orderId: orderId
        },
        theme: {
          color: "#c5a87f", // Beige/gold color to match checkout page
        },
        image: "/logo.jpg", // Use logo.jpg for the Razorpay checkout
        handler: async function (razorpayResponse) {
          try {
            setLoading(true);
            // Verify payment with backend
            const verificationData = {
              razorpayOrderId: response.order.id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature
            };
            
            const verificationResult = await verifyRazorpayPayment(verificationData);
            
            if (verificationResult.success) {
              // Payment successful
              // Clear session storage
              sessionStorage.removeItem('orderSummary');
              await clearCart(); // Clear the cart
              // Redirect to orders page
              router.push('/orders');
            } else {
              setLoading(false);
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled');
            // Reset to COD if payment modal dismissed
            setPaymentMethod('cod');
            setLoading(false);
          },
          escape: true,
          backdropclose: false
        },
        config: {
          display: {
            blocks: {
              utib: { //name for AXIS block
                name: "Pay using Axis Bank",
                instruments: [
                  {
                    method: "card",
                    issuers: ["UTIB"]
                  },
                  {
                    method: "netbanking",
                    banks: ["UTIB"]
                  },
                ]
              },
              other: { //  name for other block
                name: "Other Payment Methods",
                instruments: [
                  {
                    method: "card",
                    issuers: ["ICIC"]
                  },
                  {
                    method: 'card',
                    issuers: ["HDFC"]
                  },
                  {
                    method: 'netbanking',
                  },
                  {
                    method: 'upi'
                  }
                ]
              }
            },
            hide: [
              {
                method: "paylater"
              }
            ],
            sequence: ["block.utib", "block.other"],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      };

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      alert('There was an error initializing the payment: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!orderId) {
      alert('Order information missing. Please return to checkout.');
      router.push('/checkout');
      return;
    }

    try {
      if (paymentMethod === 'online') {
        await initiateRazorpayPayment();
      } else if (paymentMethod === 'cod') {
        // Create COD payment using the API
        setLoading(true);
        const paymentData = {
          orderId: orderId,
          amount: total,
          currency: 'INR'
        };
        
        const response = await createCODPayment(paymentData);
        
        if (response.success) {
          // Clear order data from session storage
          sessionStorage.removeItem('orderSummary');
          await clearCart(); // Clear the cart
          // Show success message and redirect to orders page
          router.push('/orders');
        } else {
          setLoading(false);
          throw new Error(response.error || 'Failed to create COD payment');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('There was an error processing your payment: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
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
        
        .payment-option {
          transition: all 0.3s ease;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .payment-option.selected {
          border-color: #1e2832;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .payment-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        /* Make payment text more visible */
        .payment-label {
          color: #1e2832 !important;
          font-weight: 600 !important;
        }
        
        .payment-amount {
          color: #1e2832 !important;
          font-weight: 600 !important;
        }
        
        .radio-custom {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          display: inline-block;
          position: relative;
          transition: all 0.2s ease;
          background-color: white;
        }
        
        .radio-custom.selected {
          border-color: #1e2832;
          background-color: #1e2832;
        }
        
        .radio-custom.selected:after {
          content: '';
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .expanded-section {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        
        .expanded-section.open {
          max-height: 500px;
        }

        /* Dark theme adjustments - keep elements styled but background white */
        :global(.dark) body {
          background-color: white !important;
        }
        
        :global(.dark) .order-summary-amount {
          color: #333333 !important;
        }
        
        :global(.dark) .payment-label {
          color: #1e2832 !important;
        }
        
        :global(.dark) .payment-amount {
          color: #1e2832 !important;
        }

        :global(.dark) .payment-option {
          background-color: white;
          border-color: #d1d5db;
        }

        :global(.dark) .payment-option.selected {
          background-color: rgba(30, 40, 50, 0.07);
          border-color: #1e2832;
        }

        :global(.dark) .radio-custom {
          border-color: #d1d5db;
        }

        :global(.dark) .radio-custom.selected {
          border-color: #1e2832;
          background-color: #1e2832;
        }
        
        /* Make summary labels and amounts more visible */
        .summary-label {
          color: #1e2832 !important;
          font-weight: 500 !important;
        }
        
        .summary-amount {
          color: #1e2832 !important;
          font-weight: 600 !important;
        }
        
        :global(.dark) .summary-label,
        :global(.dark) .summary-amount {
          color: #1e2832 !important;
        }

        /* Make payment labels more professional */
        .payment-method-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .payment-label {
          color: #1e2832 !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em;
        }
        
        .payment-amount {
          color: #1e2832 !important;
          font-weight: 700 !important;
          padding: 4px 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }

        /* Place order button pulse animation */
        @keyframes soft-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        
        .place-order-btn {
          animation: soft-pulse 2s infinite;
          transition: all 0.3s ease;
        }
        
        .place-order-btn:hover {
          animation: none;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-6 mt-16 sm:py-8">
        {loading ? (
          <LoadingState message="Processing your payment..." />
        ) : (
          <div className="mb-12 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Payment Info */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                  <div className="p-5 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-display font-semibold text-[#1e2832]">Select Payment Method</h2>
                  </div>
                  
                  <div className="p-5">
                    <div className="payment-method-container">
                      {/* Cash on Delivery Option */}
                      <div 
                        className={`payment-option border p-1 cursor-not-allowed opacity-50 ${
                          paymentMethod === 'cod' 
                            ? 'selected border-[#1e2832] bg-[#f9f9f9]' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => {}} // Prevent selection
                        title="Cash on Delivery is currently unavailable"
                      >
                        <div className="flex items-center justify-center p-4">
                          <div className="flex items-center">
                            <span className="mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e2832" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <circle cx="12" cy="12" r="2" />
                                <path d="M6 12h.01M18 12h.01" />
                              </svg>
                            </span>
                            <span className="font-medium payment-label">COD not available - Coming soon</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Online Payment Option */}
                      <div 
                        className={`payment-option border p-1 cursor-pointer ${
                          paymentMethod === 'online' 
                            ? 'selected border-[#1e2832] bg-[#f9f9f9]' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => handlePaymentMethodChange('online')}
                      >
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center">
                            <span className="payment-amount mr-4">₹{total}</span>
                            <div className="flex items-center">
                              <span className="mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e2832" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                  <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                              </span>
                              <span className="font-medium payment-label">Pay Online</span>
                            </div>
                          </div>
                          <div className={`radio-custom ${paymentMethod === 'online' ? 'selected' : ''}`}>
                            {paymentMethod === 'online' && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1 order-1 lg:order-2 mb-6 lg:mb-0">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm sticky top-20">
                  <div className="p-5 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-display font-semibold text-[#1e2832]">Order Summary</h2>
                  </div>
                  
                  <div className="p-5">
                    {/* Price Details */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="summary-label">Total Product Price</span>
                        <span className="summary-amount">₹{total.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t border-gray-200 font-medium text-base">
                        <span className="font-semibold text-[#1e2832]">Order Total</span>
                        <span className="font-semibold text-[#1e2832]">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handlePlaceOrder}
                      className="place-order-btn w-full mt-6 bg-[#1e2832] text-white py-3.5 rounded-md font-medium hover:bg-[#2a3642] transition-all shadow-sm"
                    >
                      Place Order
                    </button>
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