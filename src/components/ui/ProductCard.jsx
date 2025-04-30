import Link from 'next/link';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  return (
    <Link href={`/products/${product.id}`} className="block group cursor-pointer hover:no-underline">
      <div className="relative h-full">
        {/* Product Image with badges */}
        <div className="relative overflow-hidden mb-5">
          <div className="aspect-[3/4] bg-gray-100">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${product.image})` }}
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
          {product.rating && (
            <div className="flex justify-center mt-2">
              <StarRating rating={product.rating} />
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