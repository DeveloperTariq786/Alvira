'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useRouter } from 'next/navigation';
import { getCart, getUserAddresses, deleteAddress, createOrder } from '@/utils/api';
import { calculateTotalPrice } from '@/utils/priceCalculations';
import { validateCoupon } from '@/utils/couponValidation';
import LoadingState from '@/components/ui/LoadingState';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressList, setAddressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const router = useRouter();
  
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        
        // Use the getCart utility function from api.js
        const cartData = await getCart();
        
        // Set cart data from the API response
        setCartItems(cartData.items);
        const subtotalAmount = cartData.total;
        setSubtotal(subtotalAmount);
        
        // Calculate price details
        const { tax, shipping, total } = calculateTotalPrice(subtotalAmount);
        setTaxes(tax);
        setShipping(shipping);
        setTotal(total - discount); // Apply any existing discount
        
      } catch (err) {
        console.error('Error fetching cart data:', err);
        
        // Check if error is authentication related
        if (err.message?.includes('Authentication required')) {
          setError('Please login to view checkout');
        } else {
          setError('Failed to load cart items. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAddresses = async () => {
      try {
        setAddressesLoading(true);
        
        // Use the getUserAddresses utility function from api.js
        const data = await getUserAddresses();
        
        if (data && data.length > 0) {
          setAddressList(data);
          
          // Find default address
          const defaultAddress = data.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id);
          } else {
            setSelectedAddress(data[0].id);
          }
        } else {
          // If no addresses found, clear the address list
          setAddressList([]);
          setSelectedAddress(null);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setAddressList([]);
        setSelectedAddress(null);
      } finally {
        setAddressesLoading(false);
      }
    };
    
    fetchCartData();
    fetchAddresses();
  }, [discount]);

  const handleAddressSelection = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handleRemoveAddress = async (id) => {
    try {
      // Use the deleteAddress utility function from api.js
      await deleteAddress(id);
      
      // Update local state
      setAddressList(prev => prev.filter(addr => addr.id !== id));
      
      // If the removed address was selected, select another one
      if (selectedAddress === id) {
        const defaultAddress = addressList.find(addr => addr.isDefault && addr.id !== id);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        } else if (addressList.length > 1) {
          const nextAddress = addressList.find(addr => addr.id !== id);
          if (nextAddress) setSelectedAddress(nextAddress.id);
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (err) {
      console.error('Error removing address:', err);
      alert('Failed to remove address. Please try again.');
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Set loading state
    setCouponLoading(true);
    
    try {
      // Use the validateCoupon function from our utility
      const result = await validateCoupon(couponCode);
      
      if (result.isValid) {
        setDiscount(result.discount);
        setCouponApplied(true);
        // Recalculate total with discount
        setTotal(subtotal + taxes + shipping - result.discount);
      } else {
        setCouponError(result.error);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    
    // Show button loading state immediately
    const buttonElement = document.activeElement;
    const originalButtonText = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<div class="flex justify-center items-center"><div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>Processing...</div>';
    
    try {
      // Create order payload
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          selectedColor: item.color,
          selectedSize: item.size
        })),
        addressId: selectedAddress,
        subtotal: subtotal,
        shipping: shipping, // Use calculated shipping cost
        tax: taxes,
        total: total,
        currency: 'INR'
      };
      
      // Call API to create order
      const createdOrder = await createOrder(orderData);
      
      // Store order ID in sessionStorage for use in payment page
      sessionStorage.setItem('orderSummary', JSON.stringify({
        orderId: createdOrder.id,
        subtotal,
        taxes,
        discount,
        total,
        items: cartItems.length
      }));
      
      // Prefetch the payment page to make the transition faster
      router.prefetch('/payment');
      
      // Redirect to payment page
      router.push('/payment');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred while creating your order. Please try again.');
      
      // Reset button state
      buttonElement.disabled = false;
      buttonElement.innerHTML = originalButtonText;
    }
  };

  const goToAddNewAddress = () => {
    router.push('/profile');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16">
          <LoadingState message="Loading checkout information..." />
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">{error}</p>
            <Link href="/cart">
              <button className="mt-4 px-4 py-2 bg-[#c5a87f] text-white rounded">
                Return to Cart
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <style jsx global>{`
        ::placeholder {
          color: #666666 !important;
          opacity: 1;
        }
        
        /* Make input text darker */
        input, textarea, select {
          color: #333333 !important;
          font-weight: 500;
        }
        
        /* Make order summary amounts darker */
        .order-summary-amount {
          color: #333333 !important;
          font-weight: 500;
        }
        
        /* Make radio button labels darker */
        .address-type-label {
          color: #333333;
          font-weight: 500;
        }
        
        /* Make order item details darker */
        .order-item-details {
          color: #333333 !important;
          font-weight: 500;
        }
        
        /* Make address details darker */
        .address-name {
          color: #333333 !important;
          font-weight: 600;
        }
        
        .address-type-tag {
          background-color: #f0f0f0;
          color: #333333;
          font-weight: 500;
        }
        
        .address-details {
          color: #333333 !important;
        }
        
        /* Make total amount heading more visible */
        .total-heading {
          color: #1e2832 !important;
          font-weight: 600;
        }
      `}</style>
      <div className="container mx-auto px-4 py-8 mt-16">
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Address Selection */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-display text-[#1e2832]">Select Delivery Address</h2>
                    <button 
                      className="px-4 py-1 bg-[#c5a87f] text-white text-sm font-medium rounded"
                      onClick={goToAddNewAddress}
                    >
                      ADD NEW ADDRESS
                    </button>
                  </div>
                  
                  <div className="p-4">
                    {addressesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#c5a87f]"></div>
                      </div>
                    ) : addressList.length > 0 ? (
                      <>
                        <h3 className="text-sm font-medium text-gray-500 mb-4">YOUR ADDRESSES</h3>
                        
                        {/* Address List */}
                        <div className="space-y-4">
                          {addressList.map((address) => (
                            <div 
                              key={address.id} 
                              className={`border ${selectedAddress === address.id ? 'border-[#c5a87f]' : 'border-gray-200'} rounded-md p-4 relative`}
                            >
                              <div className="flex items-start">
                                <div className="flex items-center mr-3">
                                  <input
                                    type="radio"
                                    id={`address-${address.id}`}
                                    name="deliveryAddress"
                                    checked={selectedAddress === address.id}
                                    onChange={() => handleAddressSelection(address.id)}
                                    className="w-5 h-5 accent-[#c5a87f]"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-[#1e2832] address-name">{address.name}</span>
                                    <span className="bg-gray-100 text-xs px-2 py-0.5 rounded address-type-tag">{address.type}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm address-details">
                                    {address.address}
                                  </p>
                                  <p className="text-gray-700 text-sm address-details">
                                    {address.city}, {address.state} - {address.pincode}
                                  </p>
                                  <p className="text-gray-700 text-sm mt-1 address-details">
                                    Mobile: {address.mobile}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-4 mt-3 border-t border-gray-100 pt-3">
                                {!address.isDefault && (
                                  <button 
                                    onClick={() => handleRemoveAddress(address.id)}
                                    className="text-red-500 text-sm font-medium"
                                  >
                                    REMOVE
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">You don&apos;t have any saved addresses</p>
                        <button 
                          className="px-4 py-2 bg-[#c5a87f] text-white font-medium rounded"
                          onClick={goToAddNewAddress}
                        >
                          Add New Address
                        </button>
                      </div>
                    )}
                    
                    <button 
                      className="flex items-center text-[#c5a87f] font-medium mt-4"
                      onClick={goToAddNewAddress}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add New Address
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-display text-[#1e2832]">Order Summary</h2>
                  </div>
                  
                  <div className="p-4">
                    {/* Order Items */}
                    <div className="max-h-60 overflow-y-auto mb-4">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex py-3 border-b border-gray-100">
                          <div className="w-16 h-16 bg-gray-50 relative flex-shrink-0">
                            <Image
                              src={item.image || 'https://via.placeholder.com/100x100'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-sm text-gray-900 font-medium">{item.name}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.size && <span>Size: {item.size.toUpperCase()} {item.color && '|'} </span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-sm text-gray-700 font-medium">Qty: {item.quantity}</span>
                              <span className="text-sm font-medium order-item-details">₹{item.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Coupon Section */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      {!couponApplied ? (
                        <div>
                          <div className="flex">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="Enter coupon code"
                              className="flex-1 p-2 border border-gray-300 rounded-l"
                              disabled={couponLoading}
                            />
                            <button
                              onClick={handleApplyCoupon}
                              disabled={couponLoading}
                              className="px-4 py-2 bg-[#c5a87f] text-white font-medium rounded-r flex items-center justify-center min-w-[80px]"
                            >
                              {couponLoading ? (
                                <LoadingState type="button" message="Applying..." size="small" />
                              ) : (
                                "Apply"
                              )}
                            </button>
                          </div>
                          {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                          <p className="text-gray-600 text-xs mt-2">Try coupon code: FIRST100</p>
                        </div>
                      ) : (
                        <div className="bg-green-50 p-3 rounded flex justify-between items-center">
                          <div>
                            <p className="text-green-700 font-medium">Coupon Applied</p>
                            <p className="text-sm text-green-600">FIRST100 - ₹100 off</p>
                          </div>
                          <button
                            onClick={() => {
                              setCouponApplied(false);
                              setCouponCode('');
                              setDiscount(0);
                              setTotal(subtotal + taxes + shipping);
                            }}
                            className="text-sm text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      )}
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
                        <span className="text-green-600 font-medium">Free</span>
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
                    
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!selectedAddress}
                      className={`w-full py-3 mt-6 font-medium text-center rounded ${
                        !selectedAddress 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-[#1e2832] text-white hover:bg-[#314049]'
                      }`}
                    >
                      Continue to Payment
                    </button>
                    
                    {couponApplied && (
                      <p className="text-green-600 text-sm text-center mt-3">
                        You will save ₹{discount.toLocaleString()} on this order
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default CheckoutPage;