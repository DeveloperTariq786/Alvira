'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import Link from 'next/link';
import { fetchNewArrivalsProducts } from '@/utils/api';
import { logger } from '@/utils/config';
import { newArrivalsProducts as fallbackProducts } from '@/constants/data';

const NewArrivalsSection = () => {
  const [products, setProducts] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const newArrivalsProducts = await fetchNewArrivalsProducts();
        
        if (newArrivalsProducts && newArrivalsProducts.length > 0) {
          setProducts(newArrivalsProducts);
          logger.info('Successfully loaded new arrivals products from API');
        } else if (fallbackProducts && fallbackProducts.length > 0) {
          // Use fallback data if API returns empty
          logger.info('No new arrivals products found in API, using fallback data');
          setProducts(fallbackProducts);
        } else {
          // If both API and fallback are empty, set error
          throw new Error('No new arrivals products available');
        }
      } catch (err) {
        logger.error('Failed to fetch new arrivals products:', err);
        setError(err.message);
        
        // Use fallback data if available
        if (fallbackProducts && fallbackProducts.length > 0) {
          logger.info('Error occurred, using fallback new arrivals products data');
          setProducts(fallbackProducts);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewArrivals();
  }, []);
  
  // Show only the first 8 products initially or all if showAll is true
  const displayProducts = showAll ? products : products.slice(0, 8);
  
  if (loading) {
    return (
      <section id="new-arrivals" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-black mb-4">New Arrivals</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-base">
              Discover our latest additions crafted with exquisite attention to detail and timeless elegance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-md aspect-[3/4] mb-3"></div>
                <div className="bg-gray-200 h-4 w-2/3 mb-2 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/3 mb-4 rounded"></div>
                <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (error && products.length === 0) {
    return (
      <section id="new-arrivals" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-black mb-4">New Arrivals</h2>
          </div>
          
          <div className="flex justify-center items-center h-[200px]">
            <div className="text-center">
              <p className="mb-4 text-gray-600">Unable to load new arrivals products. {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (products.length === 0) {
    return null;
  }
  
  return (
    <section id="new-arrivals" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-black mb-4">New Arrivals</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-base">
            Discover our latest additions crafted with exquisite attention to detail and timeless elegance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {!showAll && products.length > 8 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setShowAll(true)}
              className="inline-block px-8 py-3 border border-black text-black font-medium rounded-md hover:bg-[#d4b78f] hover:text-white hover:border-[#d4b78f] transition-colors"
            >
              Browse All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalsSection; 