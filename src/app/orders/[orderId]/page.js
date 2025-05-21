'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchOrderById } from '@/utils/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingState from '@/components/ui/LoadingState';

const OrderDetailsPage = ({ params }) => {
  const { orderId } = params;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        
        // Check if error is authentication related
        if (err.message?.includes('Authentication required')) {
          setError('Please login to view order details');
        } else {
          setError('Failed to load order details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // Format status text for display
  const formatStatus = (status) => {
    switch(status) {
      case 'PAYMENT_PENDING':
        return 'Payment Pending';
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
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
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-20 pb-10 flex items-center justify-center">
          <LoadingState message="Loading order details..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-10">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">{error}</p>
            <Link href="/orders">
              <button className="mt-4 px-4 py-2 bg-[#c5a87f] text-white rounded">
                Return to Orders
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-10">
          <div className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-[#1e2832] mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
            <Link href="/orders" className="bg-[#c5a87f] text-white py-2 px-4 rounded-md hover:bg-[#b39770] transition-colors">
              Return to Orders
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="mb-6">
          <Link href="/orders" className="text-[#c5a87f] hover:underline inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 max-w-4xl mx-auto">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-semibold text-[#1e2832]">{order.orderNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}>
              {formatStatus(order.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Order Information */}
            <div>
              <h2 className="text-lg font-medium text-[#1e2832] mb-3">Order Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-[#1e2832]">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-[#1e2832]">{order.isPaid ? 'Online Payment' : 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium text-[#1e2832]">{order.isPaid ? 'Paid' : 'Pending'}</span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-medium text-[#1e2832]">{formatDate(order.paidAt)}</span>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span className="font-medium text-[#1e2832]">{formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivered On:</span>
                    <span className="font-medium text-[#1e2832]">{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
                {order.tracking && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-medium text-[#1e2832]">{order.tracking}</span>
                  </div>
                )}
                {order.carrier && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carrier:</span>
                    <span className="font-medium text-[#1e2832]">{order.carrier}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Shipping Address */}
            <div>
              <h2 className="text-lg font-medium text-[#1e2832] mb-3">Shipping Address</h2>
              <div className="space-y-1 text-sm">
                <div className="font-medium text-[#1e2832]">{order.shippingAddress.name}</div>
                <div className="text-gray-600">{order.shippingAddress.address}</div>
                <div className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </div>
                <div className="pt-1 text-gray-600">Mobile: {order.shippingAddress.mobile}</div>
                <div className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-xs rounded text-gray-700">
                  {order.shippingAddress.type}
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-[#1e2832] mb-3 border-b border-gray-200 pb-2">Order Status History</h2>
              <div className="space-y-3">
                {order.statusHistory.map((status, index) => (
                  <div key={status.id} className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm text-gray-500">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2832]">
                        {formatStatus(status.newStatus)}
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(status.createdAt)}</div>
                      {status.comment && (
                        <div className="text-sm text-gray-600 mt-1">{status.comment}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Order Items */}
          <h2 className="text-lg font-medium text-[#1e2832] mb-3 border-b border-gray-200 pb-2">Order Items</h2>
          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row border-b border-gray-100 pb-4">
                <div className="w-full sm:w-20 h-20 relative mb-3 sm:mb-0 sm:mr-4 flex-shrink-0 bg-gray-100">
                  {item.image && item.image !== 'product_image_url' ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <Link href={`/products/${item.productId}`} className="text-[#1e2832] font-medium hover:text-[#c5a87f]">
                      {item.name}
                    </Link>
                    <div className="font-medium text-[#c5a87f]">
                      ₹{item.price.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-2">
                    <span>Quantity: {item.quantity}</span>
                    {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span>• Color: {item.selectedColor}</span>}
                  </div>
                  
                  {item.isReturned && (
                    <div className="mt-2 px-2 py-1 bg-red-50 text-red-700 text-xs rounded inline-block">
                      Returned: {item.returnReason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-medium text-[#1e2832] mb-3">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-[#1e2832]">₹{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-[#1e2832]">₹{order.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="text-[#1e2832]">₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200">
                <span className="text-[#1e2832]">Total:</span>
                <span className="text-[#c5a87f]">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetailsPage; 