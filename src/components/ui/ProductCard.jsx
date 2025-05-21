import Link from 'next/link';
import StarRating from './StarRating';
import { useState, useEffect } from 'react';
import { fetchProductReviews, calculateAverageRating } from '@/utils/api';

const ProductCard = ({ product }) => {
  const [productRating, setProductRating] = useState(product.rating || 0);

  // Helper function to get the primary image URL
  const getPrimaryImageURL = (product) => {
    // Check if product has images array with objects (API format)
    if (product.images && product.images.length > 0) {
      // First check if the images are objects with imageUrl property
      if (typeof product.images[0] === 'object' && product.images[0].imageUrl) {
        // Try to find the primary image
        const primaryImage = product.images.find(img => img.isPrimary);
        if (primaryImage) {
          return primaryImage.imageUrl;
        }
        // If no primary image, return the first image
        return product.images[0].imageUrl;
      }
      
      // If images are simple strings (from fallback data)
      if (typeof product.images[0] === 'string') {
        return product.images[0];
      }
    }
    
    // Fallback to placeholder
    return 'https://via.placeholder.com/300x400';
  };
  
  // Get the display image using our helper function
  const displayImage = getPrimaryImageURL(product);

  // Fetch the product reviews and calculate average rating
  useEffect(() => {
    const fetchRating = async () => {
      try {
        if (product.id) {
          const reviews = await fetchProductReviews(product.id);
          const averageRating = calculateAverageRating(reviews);
          setProductRating(averageRating);
        }
      } catch (error) {
        console.error('Error fetching product rating:', error);
      }
    };

    fetchRating();
  }, [product.id]);
    
  return (
    <Link href={`/products/${product.id}`} className="block group cursor-pointer hover:no-underline">
      <div className="relative h-full">
        {/* Product Image with badges */}
        <div className="relative overflow-hidden mb-5">
          <div className="aspect-[3/4] bg-gray-100">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${displayImage})` }}
            ></div>
          </div>
          
          {/* Discount Badge - Top Left */}
          {product.discount && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-red-600 text-white text-xs font-medium py-1 px-3 rounded-sm shadow-md">
                {product.discount}% OFF
              </div>
            </div>
          )}
          
          {/* NEW Badge - Top Right */}
          {product.isNew && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-[#d4b78f] text-white text-xs font-medium py-1 px-3">
                NEW
              </div>
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="text-center">
          <h3 className="font-display text-lg font-medium text-black group-hover:text-[#d4b78f] transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mt-1">{product.description}</p>
          
          {/* Star Rating */}
          {productRating > 0 && (
            <div className="flex justify-center mt-2">
              <StarRating rating={productRating} />
            </div>
          )}
          
          {/* Price Display */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {/* Current price */}
            <p className="font-medium text-black">
              {product.currency}{product.price.toLocaleString()}
            </p>
            
            {/* Original price (if discounted) */}
            {product.originalPrice && (
              <p className="text-gray-500 text-sm line-through">
                {product.currency}{product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
          
          {/* Stock information */}
          {product.stock && (
            <p className="text-xs text-red-600 mt-1 font-medium">{product.stock}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 