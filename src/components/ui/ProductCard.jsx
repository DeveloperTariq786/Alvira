import Link from 'next/link';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  return (
    <Link href={`/products/${product.id}`} className="block group cursor-pointer hover:no-underline">
      <div className="relative h-full">
        {/* Product Image with "NEW" badge */}
        <div className="relative overflow-hidden mb-5">
          <div className="aspect-[3/4] bg-gray-100">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${product.image})` }}
            ></div>
          </div>
          
          {product.isNew && (
            <div className="absolute top-3 right-3 bg-[#d4b78f] text-white text-xs font-medium py-1 px-3 z-10">
              NEW
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
          
          <p className="font-medium mt-2 text-black">
            {product.currency}{product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 