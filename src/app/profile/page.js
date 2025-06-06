'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Products } from '@/constants/data';
import { 
  getCart, 
  getUserProfile, 
  getUserAddresses, 
  updateAddress, 
  createAddress, 
  setAddressAsDefault, 
  deleteAddress,
  fetchMyOrders
} from '@/utils/api';
import LoadingState from '@/components/ui/LoadingState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ProfilePage = () => {
  const router = useRouter();
  // User data state
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    dateOfBirth: null
  });
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Order state
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // State for new address form visibility
  const [showAddressForm, setShowAddressForm] = useState(false);
  // State for the new address form data
  const [newAddressData, setNewAddressData] = useState({
    name: '',
    type: 'Home',
    address: '',
    city: '',
    state: '',
    pincode: '',
    mobile: '',
    isDefault: false
  });
  
  // State for form validation errors
  const [errors, setErrors] = useState({});

  // Fetch user data and addresses on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Use API functions from route.js
        const userData = await getUserProfile();
        setUserData(userData);
        
        // Fetch user addresses
        const addressData = await getUserAddresses();
        
        if (addressData && addressData.length > 0) {
          setAddresses(addressData);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Fetch recent orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        // Fetch only the first page with a limit of 3 recent orders
        const data = await fetchMyOrders({ page: 1, limit: 3 });
        setOrderHistory(data.orders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        // Don't set error state to avoid blocking the entire profile
        // Just leave the orders empty
        setOrderHistory([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Get user initials from name
  const getUserInitials = () => {
    if (!userData.name) return '??';
    return userData.name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get product details for order items
  const getOrderProducts = (productIds) => {
    // Check if Products array exists and has items
    if (!Products || Products.length === 0) {
      // Return dummy product data when Products array is empty
      return productIds.map(id => ({
        id,
        name: `Product ${id}`,
        price: 0,
        // Add other necessary fields with fallback values
      }));
    }
    
    // Original logic when Products array has items
    return productIds.map(id => {
      const product = Products.find(product => product.id === id);
      // If product not found, return a dummy product
      if (!product) {
        return {
          id,
          name: `Product ${id}`,
          price: 0,
        };
      }
      return product;
    });
  };

  // Handle input change for the address form
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox change for default address
  const handleDefaultAddressChange = (e) => {
    setNewAddressData(prev => ({
      ...prev,
      isDefault: e.target.checked
    }));
  };

  // Validate the address form
  const validateAddressForm = () => {
    const newErrors = {};
    
    if (!newAddressData.name) newErrors.name = 'Full name is required';
    if (!newAddressData.address) newErrors.address = 'Address is required';
    if (!newAddressData.city) newErrors.city = 'City is required';
    if (!newAddressData.state) newErrors.state = 'State is required';
    if (!newAddressData.pincode) newErrors.pincode = 'Postal code is required';
    if (!newAddressData.mobile) newErrors.mobile = 'Mobile number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Initialize edit address form
  const handleEditAddress = (address) => {
    setNewAddressData({
      name: address.name,
      type: address.type,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      mobile: address.mobile,
      isDefault: address.isDefault
    });
    setIsEditingAddress(true);
    setEditingAddressId(address.id);
    setShowAddressForm(true);
    setErrors({});
  };

  // Handle address form submission
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    if (validateAddressForm()) {
      try {
        setIsSubmitting(true);
        
        if (isEditingAddress) {
          // Update existing address using API function
          const updatedAddress = await updateAddress(editingAddressId, newAddressData);
          
          // Update addresses list with updated address
          setAddresses(prev => prev.map(addr => 
            addr.id === editingAddressId ? {...updatedAddress} : addr
          ));
          
        } else {
          // Add new address using API function
          const newAddress = await createAddress(newAddressData);
          
          // Update addresses list with new address
          setAddresses(prev => [...prev, newAddress]);
        }
        
        // Reset form and hide it
        setNewAddressData({
          name: '',
          type: 'Home',
          address: '',
          city: '',
          state: '',
          pincode: '',
          mobile: '',
          isDefault: false
        });
        setShowAddressForm(false);
        setIsEditingAddress(false);
        setEditingAddressId(null);
        router.back();
        
      } catch (err) {
        console.error('Error adding/updating address:', err);
        alert('Failed to save address. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (id) => {
    try {
      setLoading(true);
      
      // Use API function from route.js
      await setAddressAsDefault(id);
      
      // Update addresses in state
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      })));
      
    } catch (err) {
      console.error('Error setting default address:', err);
      alert('Failed to set default address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (id) => {
    try {
      setLoading(true);
      
      // Use API function from route.js
      await deleteAddress(id);
      
      // Remove address from state
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open new address form with prefilled user data
  const handleOpenAddressForm = () => {
    setNewAddressData({
      name: userData.name || '',
      type: 'Home',
      address: '',
      city: '',
      state: '',
      pincode: '',
      mobile: userData.phone || '',
      isDefault: addresses.length === 0 // Set as default if it's the first address
    });
    setShowAddressForm(true);
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setErrors({});
  };

  // Handle form cancellation
  const handleCancel = () => {
    setNewAddressData({
      name: '',
      type: 'Home',
      address: '',
      city: '',
      state: '',
      pincode: '',
      mobile: '',
      isDefault: false
    });
    setErrors({});
    setShowAddressForm(false);
    setIsEditingAddress(false);
    setEditingAddressId(null);
  };

  // Format date of birth for display
  const formatDateOfBirth = (dob) => {
    if (!dob) return 'Not provided';
    
    // Create a date object from the ISO string
    const date = new Date(dob);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Not provided';
    
    // Format as DD/MM/YYYY
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge styling
  const getStatusStyle = (status) => {
    switch(status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'PAYMENT_PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'RETURNED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text for display
  const formatStatus = (status) => {
    switch(status) {
      case 'PAYMENT_PENDING':
        return 'Payment Pending';
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-20 pb-10">
          <LoadingState message="Loading profile..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">{error}</p>
            <Link href="/">
              <button className="mt-4 px-4 py-2 bg-[#c5a87f] text-white rounded">
                Return to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-black mb-8 text-center">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile and Address Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Personal Information & Addresses</h2>
              </div>
              
              {/* Personal Info Section */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* User initials avatar */}
                  <div className="mb-4 md:mb-0 md:mr-6 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-[#c5a87f] flex items-center justify-center text-white text-2xl font-bold">
                      {getUserInitials()}
                    </div>
                  </div>
                
                  {/* User details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-gray-800 font-medium">{userData.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mobile Number</p>
                        <p className="text-gray-800 font-medium">{userData.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-gray-800 font-medium">{formatDateOfBirth(userData.dateOfBirth)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Addresses Section */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Saved Addresses</h3>
                  <button 
                    onClick={handleOpenAddressForm}
                    className="text-[#c5a87f] hover:text-[#b39770] text-sm font-medium"
                    disabled={isSubmitting}
                  >
                    + Add New Address
                  </button>
                </div>
                
                {addresses.length > 0 ? (
                  <div className="space-y-6">
                    {addresses.map((address) => (
                      <div key={address.id} className={`border ${address.isDefault ? 'border-[#c5a87f]' : 'border-gray-200'} rounded-lg p-4 relative`}>
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 bg-[#c5a87f] text-white text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                        
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-gray-800">{address.name}</span>
                              <span className="ml-2 bg-gray-100 text-xs px-2 py-0.5 rounded">{address.type}</span>
                            </div>
                            
                            <p className="text-gray-600 text-sm">{address.address}</p>
                            <p className="text-gray-600 text-sm">{address.city}, {address.state} - {address.pincode}</p>
                            <p className="text-gray-600 text-sm mt-1">Mobile: {address.mobile}</p>
                            
                            <div className="flex space-x-4 mt-3 pt-2 border-t border-gray-100">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  className="text-blue-600 text-sm font-medium"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <span className="flex items-center">
                                      <span className="h-3 w-3 mr-1 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
                                      Setting...
                                    </span>
                                  ) : 'Set as Default'}
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="text-[#c5a87f] text-sm font-medium"
                                disabled={isSubmitting}
                              >
                                Edit
                              </button>
                              
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="text-red-500 text-sm font-medium"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <span className="flex items-center">
                                      <span className="h-3 w-3 mr-1 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></span>
                                      Removing...
                                    </span>
                                  ) : 'Remove'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">You don't have any saved addresses</p>
                    <button 
                      className="px-4 py-2 bg-[#c5a87f] text-white font-medium rounded hover:bg-[#b39770]"
                      onClick={handleOpenAddressForm}
                      disabled={isSubmitting}
                    >
                      Add New Address
                    </button>
                  </div>
                )}
                
                {/* Add/Edit Address Form */}
                {showAddressForm && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    
                    <form onSubmit={handleAddressSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name*</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={newAddressData.name}
                            onChange={handleAddressChange}
                            placeholder="Enter recipient's full name"
                            className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-[#c5a87f] focus:border-[#c5a87f]`}
                            disabled={isSubmitting}
                          />
                          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Address Type</label>
                          <select
                            id="type"
                            name="type"
                            value={newAddressData.type}
                            onChange={handleAddressChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-800 focus:outline-none focus:ring-[#c5a87f] focus:border-[#c5a87f]"
                            disabled={isSubmitting}
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street Address*</label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={newAddressData.address}
                            onChange={handleAddressChange}
                            placeholder="Enter street address"
                            className={`mt-1 block w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-[#c5a87f] focus:border-[#c5a87f]`}
                            disabled={isSubmitting}
                          />
                          {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City*</label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={newAddressData.city}
                              onChange={handleAddressChange}
                              placeholder="Enter city"
                              className={`mt-1 block w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-[#c5a87f] focus:border-[#c5a87f]`}
                              disabled={isSubmitting}
                            />
                            {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                          </div>
                          
                          <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State/Province*</label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={newAddressData.state}
                              onChange={handleAddressChange}
                              placeholder="Enter state/province"
                              className={`mt-1 block w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-[#c5a87f] focus:border-[#c5a87f]`}
                              disabled={isSubmitting}
                            />
                            {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Postal/ZIP Code*</label>
                            <input
                              type="text"
                              id="pincode"
                              name="pincode"
                              value={newAddressData.pincode}
                              onChange={handleAddressChange}
                              placeholder="Enter postal/zip code"
                              className={`mt-1 block w-full border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-[#c5a87f] focus:border-[#c5a87f]`}
                              disabled={isSubmitting}
                            />
                            {errors.pincode && <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>}
                          </div>
                          
                          <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number*</label>
                            <input
                              type="tel"
                              id="mobile"
                              name="mobile"
                              value={newAddressData.mobile}
                              onChange={handleAddressChange}
                              placeholder="Enter mobile number"
                              className={`mt-1 block w-full border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-[#c5a87f] focus:border-[#c5a87f]`}
                              disabled={isSubmitting}
                            />
                            {errors.mobile && <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isDefault"
                            name="isDefault"
                            checked={newAddressData.isDefault}
                            onChange={handleDefaultAddressChange}
                            className="h-4 w-4 text-[#c5a87f] focus:ring-[#c5a87f] border-gray-300 rounded"
                            disabled={isSubmitting}
                          />
                          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                            Set as default address
                          </label>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#c5a87f] text-white px-4 py-2 rounded-md hover:bg-[#b39770] relative"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center">
                              <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                              Saving...
                            </span>
                          ) : (
                            isEditingAddress ? 'Update Address' : 'Save Address'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Order History Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
              </div>
              
              <div className="p-6">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c5a87f]"></div>
                  </div>
                ) : orderHistory.length > 0 ? (
                  <div className="space-y-6">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="border-b border-gray-100 pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium text-gray-800">{order.orderNumber}</div>
                          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                              {formatStatus(order.status)}
                            </span>
                          </div>
                          <div className="font-medium text-[#c5a87f]">₹{order.total.toLocaleString()}</div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center space-x-2 mb-1">
                              <span>•</span>
                              <span className="truncate">{item.name}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-xs text-gray-500 mt-1">
                              + {order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                        
                        <Link href={`/orders/${order.id}`} className="text-[#c5a87f] text-sm hover:underline mt-2 inline-block">
                          View Order Details
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">You have no order history yet.</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Link href="/orders" className="w-full block text-center bg-[#1e2832] text-white py-2 px-4 rounded-md hover:bg-[#1e2832]/90">
                    View All Orders
                  </Link>
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

export default ProfilePage; 