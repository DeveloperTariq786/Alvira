'use client';

import { useState, useEffect } from 'react';

const ProfileForm = ({ userData, onSubmit, onCancel, initialTab = 'personal' }) => {
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    email: userData?.email || '',
    mobile: userData?.mobile || '',
    shippingAddress: {
      fullName: userData?.shippingAddress?.fullName || '',
      street: userData?.shippingAddress?.street || '',
      city: userData?.shippingAddress?.city || '',
      state: userData?.shippingAddress?.state || '',
      postal: userData?.shippingAddress?.postal || '',
      country: userData?.shippingAddress?.country || '',
      phone: userData?.shippingAddress?.phone || '',
    }
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Personal info validation
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Shipping address validation
    if (!formData.shippingAddress.fullName) newErrors['shippingAddress.fullName'] = 'Full name is required';
    if (!formData.shippingAddress.street) newErrors['shippingAddress.street'] = 'Street address is required';
    if (!formData.shippingAddress.city) newErrors['shippingAddress.city'] = 'City is required';
    if (!formData.shippingAddress.state) newErrors['shippingAddress.state'] = 'State is required';
    if (!formData.shippingAddress.postal) newErrors['shippingAddress.postal'] = 'Postal code is required';
    if (!formData.shippingAddress.country) newErrors['shippingAddress.country'] = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-accent/30 max-w-4xl mx-auto">
      <div className="flex mb-6 border-b border-accent/30">
        <button
          className={`pb-3 px-4 text-sm font-medium ${activeTab === 'personal' ? 'text-secondary border-b-2 border-secondary' : 'text-black'}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Information
        </button>
        <button
          className={`pb-3 px-4 text-sm font-medium ${activeTab === 'shipping' ? 'text-secondary border-b-2 border-secondary' : 'text-black'}`}
          onClick={() => setActiveTab('shipping')}
        >
          Shipping Address
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-black">Full Name*</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`mt-1 block w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary`}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">Email Address*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-black">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="shippingAddress.fullName" className="block text-sm font-medium text-black">Full Name*</label>
              <input
                type="text"
                id="shippingAddress.fullName"
                name="shippingAddress.fullName"
                value={formData.shippingAddress.fullName}
                onChange={handleChange}
                placeholder="Enter recipient's full name"
                className={`mt-1 block w-full border ${errors['shippingAddress.fullName'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary`}
              />
              {errors['shippingAddress.fullName'] && <p className="mt-1 text-sm text-red-500">{errors['shippingAddress.fullName']}</p>}
            </div>
            
            <div>
              <label htmlFor="shippingAddress.street" className="block text-sm font-medium text-black">Street Address*</label>
              <input
                type="text"
                id="shippingAddress.street"
                name="shippingAddress.street"
                value={formData.shippingAddress.street}
                onChange={handleChange}
                placeholder="Enter street address"
                className={`mt-1 block w-full border ${errors['shippingAddress.street'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary`}
              />
              {errors['shippingAddress.street'] && <p className="mt-1 text-sm text-red-500">{errors['shippingAddress.street']}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shippingAddress.city" className="block text-sm font-medium text-black">City*</label>
                <input
                  type="text"
                  id="shippingAddress.city"
                  name="shippingAddress.city"
                  value={formData.shippingAddress.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className={`mt-1 block w-full border ${errors['shippingAddress.city'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary`}
                />
                {errors['shippingAddress.city'] && <p className="mt-1 text-sm text-red-500">{errors['shippingAddress.city']}</p>}
              </div>
              
              <div>
                <label htmlFor="shippingAddress.state" className="block text-sm font-medium text-black">State/Province*</label>
                <input
                  type="text"
                  id="shippingAddress.state"
                  name="shippingAddress.state"
                  value={formData.shippingAddress.state}
                  onChange={handleChange}
                  placeholder="Enter state/province"
                  className={`mt-1 block w-full border ${errors['shippingAddress.state'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary`}
                />
                {errors['shippingAddress.state'] && <p className="mt-1 text-sm text-red-500">{errors['shippingAddress.state']}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shippingAddress.postal" className="block text-sm font-medium text-black">Postal/ZIP Code*</label>
                <input
                  type="text"
                  id="shippingAddress.postal"
                  name="shippingAddress.postal"
                  value={formData.shippingAddress.postal}
                  onChange={handleChange}
                  placeholder="Enter postal/zip code"
                  className={`mt-1 block w-full border ${errors['shippingAddress.postal'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary`}
                />
                {errors['shippingAddress.postal'] && <p className="mt-1 text-sm text-red-500">{errors['shippingAddress.postal']}</p>}
              </div>
              
              <div>
                <label htmlFor="shippingAddress.country" className="block text-sm font-medium text-black">Country*</label>
                <input
                  type="text"
                  id="shippingAddress.country"
                  name="shippingAddress.country"
                  value={formData.shippingAddress.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                  className={`mt-1 block w-full border ${errors['shippingAddress.country'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary`}
                />
                {errors['shippingAddress.country'] && <p className="mt-1 text-sm text-red-500">{errors['shippingAddress.country']}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="shippingAddress.phone" className="block text-sm font-medium text-black">Phone Number</label>
              <input
                type="tel"
                id="shippingAddress.phone"
                name="shippingAddress.phone"
                value={formData.shippingAddress.phone}
                onChange={handleChange}
                placeholder="Enter phone number for delivery"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary"
              />
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-secondary text-white py-2 px-4 rounded-md hover:bg-secondary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm; 