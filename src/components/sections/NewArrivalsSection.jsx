import { useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import Link from 'next/link';

const NewArrivalsSection = ({ products }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Show only the first 8 products initially or all if showAll is true
  const displayProducts = showAll ? products : products.slice(0, 8);
  
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