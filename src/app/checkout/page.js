'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCartItems } from '@/utils/cart';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useRouter } from 'next/navigation';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [total, setTotal] = useState(0);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressList, setAddressList] = useState([
    {
      id: 1,
      name: 'Tariq Hameed',
      type: 'HOME',
      address: 'Parnewa, Budgam, Budgam',
      city: 'Srinagar',
      state: 'Jammu and Kashmir',
      pincode: '190011',
      mobile: '7889396003',
      isDefault: true
    }
  ]);
  
  // Form state
  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    type: 'HOME'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const router = useRouter();

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
    
    // Set default address
    const defaultAddress = addressList.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id);
    }
  }, [addressList, discount]);

  const handleAddressSelection = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newAddress.name.trim()) errors.name = 'Name is required';
    if (!newAddress.mobile.trim()) errors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(newAddress.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
    
    if (!newAddress.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(newAddress.pincode)) errors.pincode = 'Enter a valid 6-digit pincode';
    
    if (!newAddress.address.trim()) errors.address = 'Address is required';
    if (!newAddress.city.trim()) errors.city = 'City is required';
    if (!newAddress.state.trim()) errors.state = 'State is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const newId = addressList.length > 0 ? Math.max(...addressList.map(a => a.id)) + 1 : 1;
    
    const addressToAdd = {
      id: newId,
      ...newAddress,
      isDefault: addressList.length === 0 // Make it default if it's the first address
    };
    
    setAddressList(prev => [...prev, addressToAdd]);
    setSelectedAddress(newId);
    setShowAddAddressForm(false);
    
    // Reset form
    setNewAddress({
      name: '',
      mobile: '',
      pincode: '',
      address: '',
      city: '',
      state: '',
      type: 'HOME'
    });
  };

  const handleRemoveAddress = (id) => {
    setAddressList(prev => prev.filter(addr => addr.id !== id));
    
    // If the removed address was selected, select the default one
    if (selectedAddress === id) {
      const defaultAddress = addressList.find(addr => addr.isDefault && addr.id !== id);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else if (addressList.length > 1) {
        // Select first available address that's not the one being removed
        const nextAddress = addressList.find(addr => addr.id !== id);
        if (nextAddress) setSelectedAddress(nextAddress.id);
      } else {
        setSelectedAddress(null);
      }
    }
  };

  const handleEditAddress = (id) => {
    // Implementation for editing an existing address would go here
    // For this example, we'll just show a placeholder
    alert('Edit functionality would be implemented here');
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Check if it's our demo coupon code
    if (couponCode.toUpperCase() === 'FIRST100') {
      setDiscount(100);
      setCouponApplied(true);
      
      // Recalculate total with discount
      setTotal(subtotal + taxes - 100);
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    
    // Navigate to the payment page
    router.push('/payment');
  };

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
        {cartItems.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <h2 className="text-3xl font-display mb-4 text-black">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">You need to add items to your cart before checkout.</p>
            <Link href="/products">
              <button className="px-8 py-3 font-medium text-center transition-colors duration-200 rounded-md bg-[#c5a87f] text-white hover:bg-[#b39770]">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Address Selection */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-display text-[#1e2832]">Select Delivery Address</h2>
                    <button 
                      className="px-4 py-1 bg-[#c5a87f] text-white text-sm font-medium rounded"
                      onClick={() => setShowAddAddressForm(true)}
                    >
                      ADD NEW ADDRESS
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">DEFAULT ADDRESS</h3>
                    
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
                              
                              {/* This would be dynamic based on payment methods available */}
                              <p className="text-red-500 text-sm mt-3">• Pay on Delivery not available</p>
                            </div>
                          </div>
                          <div className="flex space-x-4 mt-3 border-t border-gray-100 pt-3">
                            <button 
                              onClick={() => handleEditAddress(address.id)}
                              className="text-[#c5a87f] text-sm font-medium"
                            >
                              EDIT
                            </button>
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
                      
                      {addressList.length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-gray-500 mb-4">You don&apos;t have any saved addresses</p>
                          <button 
                            className="px-4 py-2 bg-[#c5a87f] text-white font-medium rounded"
                            onClick={() => setShowAddAddressForm(true)}
                          >
                            Add New Address
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {!showAddAddressForm && (
                      <button 
                        className="flex items-center text-[#c5a87f] font-medium mt-4"
                        onClick={() => setShowAddAddressForm(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Address
                      </button>
                    )}
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
                        <div key={item.id} className="flex py-3 border-b border-gray-100">
                          <div className="w-16 h-16 bg-gray-50 relative flex-shrink-0">
                            <Image
                              src={item.image}
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
                            />
                            <button
                              onClick={handleApplyCoupon}
                              className="px-4 py-2 bg-[#c5a87f] text-white font-medium rounded-r"
                            >
                              Apply
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
                              setTotal(subtotal + taxes);
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
                    
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!selectedAddress}
                      className={`w-full py-3 mt-6 font-medium text-center rounded ${
                        !selectedAddress 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-[#1e2832] text-white hover:bg-[#314049]'
                      }`}
                    >
                      Continue
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
        )}
      </div>
      
      {/* Add New Address Dialog */}
      {showAddAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative mx-auto my-8">
            <button 
              onClick={() => setShowAddAddressForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-lg font-display text-[#1e2832] mb-4">Add New Address</h3>
            
            <form onSubmit={handleAddAddress}>
              <div className="mb-6">
                <h4 className="font-medium text-[#1e2832] mb-4 uppercase text-sm">CONTACT DETAILS</h4>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={newAddress.name}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded`}
                      placeholder="Name*"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <input
                      type="tel"
                      name="mobile"
                      value={newAddress.mobile}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.mobile ? 'border-red-500' : 'border-gray-300'} rounded`}
                      placeholder="Mobile No*"
                    />
                    {formErrors.mobile && <p className="text-red-500 text-xs mt-1">{formErrors.mobile}</p>}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-[#1e2832] mb-4 uppercase text-sm">ADDRESS</h4>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="pincode"
                      value={newAddress.pincode}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.pincode ? 'border-red-500' : 'border-gray-300'} rounded`}
                      placeholder="Pin Code*"
                    />
                    {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
                  </div>
                  
                  <div>
                    <textarea
                      name="address"
                      value={newAddress.address}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded`}
                      rows="3"
                      placeholder="Address (House No, Building, Street, Area)*"
                    ></textarea>
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                    <p className="text-amber-600 text-xs mt-1">*Please update flat/house no and society/apartment details</p>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded`}
                      placeholder="Locality / Town*"
                    />
                    {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleInputChange}
                        className={`w-full p-3 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded`}
                        placeholder="City / District*"
                      />
                      {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        name="state"
                        value={newAddress.state}
                        onChange={handleInputChange}
                        className={`w-full p-3 border ${formErrors.state ? 'border-red-500' : 'border-gray-300'} rounded`}
                        placeholder="State*"
                      />
                      {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center address-type-label">
                    <input
                      type="radio"
                      name="type"
                      value="HOME"
                      checked={newAddress.type === 'HOME'}
                      onChange={handleInputChange}
                      className="mr-2 accent-[#c5a87f]"
                    />
                    Home
                  </label>
                  <label className="flex items-center address-type-label">
                    <input
                      type="radio"
                      name="type"
                      value="WORK"
                      checked={newAddress.type === 'WORK'}
                      onChange={handleInputChange}
                      className="mr-2 accent-[#c5a87f]"
                    />
                    Work
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddAddressForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#c5a87f] text-white font-medium rounded"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </main>
  );
};

export default CheckoutPage; 