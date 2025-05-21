import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SummerCollectionSection = ({ collection }) => {
  if (!collection) return null;
  // Handle both legacy string category and new category object format
  const getCategoryParam = () => {
    if (!collection.category) {
      return '';
    }
    
    // If category is an object (new format), use its id or name
    if (typeof collection.category === 'object') {
      if (collection.category.id) {
        return collection.category.id;
      } else if (collection.category.name) {
        return collection.category.name.toLowerCase().replace(/ /g, '-');
      }
    }
    
    // If category is a string (old format), remove any 'cat-' prefix first
    if (typeof collection.category === 'string') {
      const cleanCategory = collection.category.startsWith('cat-') 
        ? collection.category.substring(4)
        : collection.category;
      return cleanCategory.toLowerCase().replace(/ /g, '-');
    }
    
    // If categoryId is available directly
    if (collection.categoryId) {
      return collection.categoryId;
    }
    
    return '';
  };
  
  const categoryParam = getCategoryParam();
  
  return (
    <section id="summer-collection" className="bg-[#e5dfd9] py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Text Content - Shows first on mobile, left on desktop */}
          <div className="w-full lg:w-1/2 lg:pr-12 mb-10 lg:mb-0 order-1 lg:order-1">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-black mb-6">{collection.title}</h2>
            <p className="text-gray-700 mb-4 text-base md:text-lg">
              {collection.description}
            </p>
            <p className="text-gray-700 mb-8 text-base md:text-lg">
              {collection.additionalText}
            </p>
            <Link 
              href={`/products?category=${categoryParam}`}
              className="inline-block px-8 py-3 bg-[#1e2832] text-white font-medium hover:bg-[#d4b78f] transition-colors"
            >
              {collection.buttonText}
            </Link>
          </div>
          
          {/* Image - Shows second on mobile, right on desktop */}
          <div className="w-full lg:w-1/2 order-2 lg:order-2 relative">
            <div className="relative">
              <div 
                className="w-full h-[600px] bg-cover bg-center"
                style={{ backgroundImage: `url(${collection.image})` }}
              ></div>
              
              {/* Badge overlay */}
              <div className="absolute bottom-0 left-0 bg-white p-4 md:p-6 shadow-md">
                <div className="text-center">
                  <p className="text-[#d4b78f] text-xl md:text-2xl font-light">
                    {collection.badgeYear || (collection.badge && collection.badge.year) || '2025'}
                  </p>
                  <p className="text-[#1e2832] text-sm md:text-base font-semibold tracking-wider">
                    {collection.badgeText || (collection.badge && collection.badge.text) || 'SUMMER COLLECTION'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummerCollectionSection;