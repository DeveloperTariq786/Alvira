'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { newArrivalsProducts, bestsellers } from '@/constants/data';
import Link from 'next/link';
import { addToCart } from '@/utils/cart';
import Image from 'next/image';

const ProductDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('about');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  // Buy Now state
  const [buyNowError, setBuyNowError] = useState(''); // For general buy now errors like size/color missing
  
  // Mock thumbnail images (in a real app these would come from the product data)
  const [thumbnails, setThumbnails] = useState([]);
  
  // Mock reviews data (in a real app, this would come from an API)
  const reviews = [
    {
      id: 1,
      title: "Excellent Quality and Craftsmanship",
      rating: 5,
      content: "I purchased this silk dress for my wedding and was extremely impressed with the quality and attention to detail. The embroidery is exquisite and the fit was perfect. Received many compliments! The color is exactly as shown in the pictures and the material feels very premium. Delivery was also prompt and the packaging was great. Highly recommend this to anyone looking for a special occasion outfit.",
      author: "Rahul Sharma",
      date: "2025-02-15",
    },
    {
      id: 2,
      title: "Beautiful but Sizing Runs Small",
      rating: 4,
      content: "The dress is absolutely beautiful and well-made. The only issue was that it ran a bit small for me. I would recommend ordering one size larger than your usual size. Otherwise, excellent product! The craftsmanship is exceptional, especially the handwork on the embroidery. I'm very pleased with my purchase despite the sizing issue. The customer service was also very helpful when I contacted them for advice.",
      author: "Arjun Patel",
      date: "2025-01-20",
    },
    {
      id: 3,
      title: "Worth Every Penny",
      rating: 5,
      content: "This is the most beautiful piece I've purchased online. The craftsmanship is exceptional, and the material feels so luxurious. It arrived on time and looked exactly as pictured. I wore it to a wedding and received countless compliments. The embroidery detail is stunning and the colors are vibrant. The fit was perfect for me and it was comfortable to wear all day. Will definitely be ordering more items from this store!",
      author: "Priya Desai",
      date: "2024-12-15",
    },
    {
      id: 4,
      title: "Stunning Design",
      rating: 4,
      content: "The design is even more beautiful in person. Colors are vibrant and the embroidery is detailed. I took away one star because delivery took longer than expected. But the product itself exceeded my expectations. The quality of the stitching is excellent and the fabric is very soft against the skin. I appreciate that they included care instructions which were very helpful. Would recommend with the note about potential delivery delays.",
      author: "Vikram Singh",
      date: "2024-12-05",
    },
    {
      id: 5,
      title: "Perfect for Special Occasions",
      rating: 5,
      content: "I bought this for my daughter's engagement ceremony and she looked absolutely stunning. The quality, design, and finish are all top-notch. The color was slightly different from what was shown online but still beautiful. The dress arrived well-packaged and in pristine condition. We received so many inquiries about where we got it from! Will definitely order from this brand again for future events.",
      author: "Meena Agarwal",
      date: "2024-11-20",
    },
    {
      id: 6,
      title: "Elegant and Comfortable",
      rating: 5,
      content: "Not only is this dress beautiful, but it's also surprisingly comfortable for an outfit this formal. The material breathes well and the cut allows for movement without restricting. I wore it for a 6-hour event and felt comfortable throughout. The attention to detail in the embroidery is amazing - you can tell it's handcrafted by skilled artisans. Sizing was perfect based on the measurements provided. Very satisfied with my purchase!",
      author: "Aisha Khan",
      date: "2024-10-18",
    }
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageContainerRef = useRef(null);
  
  // For touch swipe functionality
  const [touchStartX, setTouchStartX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  
  // Touch handlers with direct DOM events for better mobile support
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setSwiping(true);
    setSwipeDirection(null);
  };
  
  const handleTouchMove = (e) => {
    if (!swiping) return;
    
    const touchMoveX = e.touches[0].clientX;
    const diffX = touchStartX - touchMoveX;
    
    // Determine swipe direction for visual feedback
    if (Math.abs(diffX) > 20) {
      setSwipeDirection(diffX > 0 ? 'left' : 'right');
      
      // Prevent default to stop page scrolling during horizontal swipe
      if (Math.abs(diffX) > 10 && thumbnails.length > 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };
  
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    
    // Minimum distance to be considered a swipe
    const minDistance = 50;
    
    if (Math.abs(diffX) > minDistance) {
      if (diffX > 0) {
        // Swiped left, go to next image
        nextImage();
      } else {
        // Swiped right, go to previous image
        prevImage();
      }
    }
    
    // Reset swipe state
    setSwiping(false);
    setSwipeDirection(null);
  };

  // Navigation functions
  const nextImage = () => {
    if (thumbnails.length <= 1) return;
    
    const newIndex = (currentImageIndex + 1) % thumbnails.length;
    setCurrentImageIndex(newIndex);
    setMainImage(thumbnails[newIndex]);
  };
  
  const prevImage = () => {
    if (thumbnails.length <= 1) return;
    
    const newIndex = (currentImageIndex - 1 + thumbnails.length) % thumbnails.length;
    setCurrentImageIndex(newIndex);
    setMainImage(thumbnails[newIndex]);
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity > 1 ? prevQuantity - 1 : 1);
  };

  const handleThumbnailClick = (image, index) => {
    setMainImage(image);
    setCurrentImageIndex(index);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const toggleShowAllReviews = () => {
    setShowAllReviews(!showAllReviews);
  };
  
  // Format date to "X days ago" format
  const formatDate = (dateString) => {
    const reviewDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };
  
  // Star rating component
  const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-[#c5a87f] fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
        
        {hasHalfStar && (
          <svg className="w-4 h-4 text-[#c5a87f] fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fillOpacity="0.5" />
          </svg>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
        
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const handleAddToCart = () => {
    // Reset previous errors
    setSizeError(false);
    setColorError(false);
    
    // Validate size and color selection
    let hasError = false;
    
    if (!selectedSize) {
      setSizeError(true);
      hasError = true;
    }
    
    if (!selectedColor) {
      setColorError(true);
      hasError = true;
    }
    
    // If any validation errors, don't proceed
    if (hasError) {
      return;
    }
    
    // If all validations pass, show phone dialog
    if (product) {
      setShowPhoneDialog(true);
    }
  };
  
  const handleBuyNow = () => {
    // Reset previous errors
    setSizeError(false);
    setColorError(false);
    setBuyNowError('');

    // Validate size and color selection
    let hasError = false;
    let errorMessages = [];

    if (!selectedSize) {
      setSizeError(true);
      errorMessages.push('Please select a size');
      hasError = true;
    }
    
    if (!selectedColor) {
      setColorError(true);
      errorMessages.push('Please select a color');
      hasError = true;
    }
    
    // If any validation errors, show message and don't proceed
    if (hasError) {
      setBuyNowError(errorMessages.join(' and ')); // Combine error messages
      return;
    }

    // If validations pass, add to cart and redirect
    if (product) {
      const productToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        quantity: quantity, // Use the current quantity
        size: selectedSize,
        color: selectedColor,
        // No phone number needed for buy now immediate redirect
      };
      
      // Store item details in sessionStorage for checkout page to pick up
      try {
        sessionStorage.setItem('buyNowItem', JSON.stringify(productToAdd));
      } catch (error) {
        console.error('Error saving to sessionStorage:', error);
        setBuyNowError('Could not initiate Buy Now. Please try again.');
        return; // Prevent redirection if storage fails
      }

      // Redirect to checkout
      router.push('/checkout');
    }
  };

  const handlePhoneSubmit = () => {
    // Basic phone validation
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    
    // You can add more complex validation here if needed
    if (phoneNumber.trim().length < 10) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    
    // Clear any errors
    setPhoneError('');
    
    // Add the product with selected options to cart
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      phoneNumber: phoneNumber // Save the phone number with the cart item
    };
    
    addToCart(productToAdd);
    
    // Close dialog
    setShowPhoneDialog(false);
    
    // Show success message briefly
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
    
    // Dispatch a storage event to update cart count in header
    window.dispatchEvent(new Event('storage'));
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSizeError(false);
  };

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
    if (e.target.value) {
      setColorError(false);
    }
  };

  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };

  useEffect(() => {
    // Combine products from different data sources
    const allProducts = [...newArrivalsProducts, ...bestsellers.items];
    
    // Find the product by ID
    const productId = parseInt(params.id, 10);
    const foundProduct = allProducts.find(p => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
      setMainImage(foundProduct.image);
      
      // Use product images array if available, otherwise fallback to single image
      if (foundProduct.images && foundProduct.images.length > 0) {
        setThumbnails(foundProduct.images);
      } else {
        // Fallback to single image repeated
        setThumbnails([
          foundProduct.image,
          foundProduct.image,
          foundProduct.image,
          foundProduct.image
        ]);
      }

      // Find similar products
      const similar = allProducts
        .filter(p => p.id !== foundProduct.id) // Exclude current product
        .filter(p => 
          p.category === foundProduct.category || // Same category
          (p.tags && foundProduct.tags && p.tags.some(tag => foundProduct.tags.includes(tag))) // Shared tags
        )
        .slice(0, 4); // Limit to 4 similar products
      
      setSimilarProducts(similar);
    }
    
    setLoading(false);
  }, [params.id]);

  // Add this useEffect to handle touch events without passive listeners
  useEffect(() => {
    const element = imageContainerRef.current;
    if (!element) return;
    
    // We need to add non-passive event listeners to be able to prevent default on touchmove
    const touchStartHandler = (e) => handleTouchStart(e);
    const touchMoveHandler = (e) => {
      if (swiping && thumbnails.length > 1) {
        const touchMoveX = e.touches[0].clientX;
        const diffX = touchStartX - touchMoveX;
        
        // Determine swipe direction for visual feedback
        if (Math.abs(diffX) > 20) {
          setSwipeDirection(diffX > 0 ? 'left' : 'right');
          
          // Prevent default to stop page scrolling during horizontal swipe
          if (Math.abs(diffX) > 10) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };
    const touchEndHandler = (e) => handleTouchEnd(e);
    
    // Add event listeners with passive: false to allow preventDefault
    element.addEventListener('touchstart', touchStartHandler, { passive: true });
    element.addEventListener('touchmove', touchMoveHandler, { passive: false });
    element.addEventListener('touchend', touchEndHandler, { passive: true });
    
    return () => {
      // Cleanup
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
    };
  }, [imageContainerRef, swiping, touchStartX, thumbnails.length, handleTouchStart, handleTouchEnd]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-white">
        <Header />
        <div className="container mx-auto pt-16 md:pt-20 pb-20 px-4 flex justify-center items-center">
          <p className="text-black dark:text-black">Loading...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white dark:bg-white">
        <Header />
        <div className="container mx-auto pt-16 md:pt-20 pb-20 px-4 text-center">
          <h1 className="text-3xl font-display mb-4 text-black dark:text-black">Product Not Found</h1>
          <p className="mb-8 text-black dark:text-black">The product you are looking for does not exist.</p>
          <button 
            className="px-6 py-3 bg-[#1e2832] text-white font-medium hover:bg-[#c5a87f] transition-colors rounded"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-white">
      <style jsx global>{`
        /* Override browser default blue color for dropdown options */
        option {
          color: #1e2832 !important;
          background-color: white !important;
        }
        
        option:checked, option:hover, option:focus {
          background-color: #c5a87f !important;
          color: white !important;
        }
        
        select:focus {
          color: #1e2832 !important;
          border-color: #c5a87f !important;
          outline: none !important;
          box-shadow: 0 0 0 1px #c5a87f !important;
        }
        
        /* Firefox specific styles */
        @-moz-document url-prefix() {
          select option:hover,
          select option:focus,
          select option:active,
          select option:checked {
            background-color: #c5a87f !important;
            color: white !important;
            box-shadow: 0 0 0 30px #c5a87f inset !important;
          }
        }
        
        /* For Webkit browsers like Chrome/Safari */
        select option:checked {
          background: #c5a87f linear-gradient(0deg, #c5a87f 0%, #c5a87f 100%) !important;
        }
        
        select option:hover {
          background-color: #c5a87f !important;
        }
      `}</style>
      
      <Header />
      <section className="container mx-auto pt-16 md:pt-20 pb-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className={`relative h-[500px] md:h-[650px] bg-gray-50 overflow-hidden rounded ${
                swiping ? 'cursor-grabbing' : 'cursor-grab'
              } ${
                swipeDirection === 'left' ? 'translate-x-[-5px] transition-transform' : 
                swipeDirection === 'right' ? 'translate-x-[5px] transition-transform' : ''
              }`}
              ref={imageContainerRef}
            >
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              
              {/* Discount Badge - Top Left */}
              {product.discount && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-red-600 text-white px-4 py-1 text-sm font-medium rounded shadow-md">
                    {product.discount}% OFF
                  </div>
                </div>
              )}
              
              {/* NEW Badge - Top Right */}
              {product.isNew && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-[#c5a87f] text-white px-4 py-1 text-sm font-medium rounded">
                    NEW
                  </div>
                </div>
              )}
              
              {/* Navigation Arrows - Only shown on desktop and if more than one image */}
              {thumbnails.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md hidden md:block transition-all"
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md hidden md:block transition-all"
                    aria-label="Next image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Mobile swipe indicator - Only shown on mobile */}
              {thumbnails.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center md:hidden">
                  <div className="bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-xs">
                    Swipe to view more images
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {thumbnails.map((thumb, index) => (
                <button 
                  key={index} 
                  className={`aspect-square border ${currentImageIndex === index ? 'border-[#c5a87f]' : 'border-gray-200'} overflow-hidden rounded hover:border-[#c5a87f] transition-colors relative`}
                  onClick={() => handleThumbnailClick(thumb, index)}
                >
                  <Image 
                    src={thumb} 
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12vw"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col justify-start">
            <h1 className="text-3xl md:text-4xl font-display text-black dark:text-black mb-2">{product.name}</h1>
            
            {/* Rating */}
            {product.rating && (
              <div className="mb-4">
                <StarRating rating={product.rating} />
              </div>
            )}
            
            {/* Price Display with Discount */}
            <div className="flex items-center mb-6">
              <p className="text-2xl font-medium text-[#c5a87f]">
                {product.currency} {product.price.toLocaleString()}
              </p>
              
              {product.originalPrice && (
                <>
                  <p className="ml-3 text-lg line-through text-gray-500">
                    {product.currency} {product.originalPrice.toLocaleString()}
                  </p>
                  <span className="ml-3 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            
            {/* Limited Time Offer - only shown for discounted products */}
            {product.discount && (
              <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-800">
                    Limited time offer! Sale ends in {product.saleEndsIn > 1 ? `${product.saleEndsIn} days` : '1 day'}
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-7">
                  Save {product.currency} {(product.originalPrice - product.price).toLocaleString()} on this purchase
                </p>
              </div>
            )}
            
            <p className="text-gray-700 dark:text-gray-700 mb-6">
              {product.description || 'Elegant silk dress with traditional embroidery, perfect for formal occasions.'}
            </p>

            {/* Tags - scrollable on small screens */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6 overflow-x-auto">
                <div className="flex flex-nowrap gap-2 pb-2 min-w-full">
                  {product.tags
                    .filter(tag => !['bestseller', 'heritage', 'luxury'].includes(tag.toLowerCase()))
                    .map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 text-xs border border-gray-200 rounded-full whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Size Selection - Changed from dropdown to inline buttons */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-black dark:text-black font-medium">
                  Size {sizeError && <span className="text-red-500 text-sm ml-2">*Please select a size</span>}
                </label>
                <button 
                  type="button" 
                  onClick={toggleSizeGuide} 
                  className="text-sm text-[#c5a87f] underline hover:text-[#b39770]"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['s', 'm', 'l', 'xl', 'xxl', 'unstitch'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`min-w-[48px] h-10 px-3 py-1 uppercase font-medium text-sm border transition-all ${
                      selectedSize === size 
                        ? 'border-[#c5a87f] bg-[#c5a87f] text-white' 
                        : 'border-gray-300 text-gray-700 hover:border-[#c5a87f]'
                    } rounded`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              
              {/* Inline Size Guide */}
              {showSizeGuide && (
                <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="bg-white px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h4 className="font-medium text-black dark:text-white">Garment Size Guide (Inches)</h4>
                    <button 
                      onClick={toggleSizeGuide}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#1e2832] text-white">
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center">SIZE</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center">S</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center">M</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center">L</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center">XL</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center">XXL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Length</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">36</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">36</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">36</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">36</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">36</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Chest</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">38</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">40</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">42</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">44</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">46</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Waist</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">34</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">36</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">38</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">40</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">42</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Hip</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">40</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">42</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">44</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">46</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">48</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Shoulder</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">15</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">15.5</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">16</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">16.5</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">17</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Armhole</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">9</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">9.5</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">10</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">10.5</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">11</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Bicep</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">6.5</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">6.8</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">7</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">7.3</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">7.5</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Neck</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">7</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">7.3</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">7.5</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">7.8</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">8.1</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Wrist</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">4</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">4.3</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">4.5</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">4.8</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">5</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-medium bg-white text-black">Trouser Length</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">38</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">38</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">39</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">39</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center bg-white text-black">40</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="p-3 bg-white border border-gray-200 dark:border-gray-700 rounded-md">
                        <p className="font-medium mb-1 text-black">UNSTITCH Option:</p>
                        <p className="text-black">We provide you with the fabric and design pattern. You can then get it tailored according to your exact measurements.</p>
                      </div>
                      <p className="text-xs text-black mt-2 italic">Please note that there may be a slight variation (±0.5") in the measurements provided due to the handcrafted nature of our garments.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-black dark:text-black font-medium mb-2">
                Color {colorError && <span className="text-red-500 text-sm ml-2">*Please select a color</span>}
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'red', hex: '#E53E3E' },
                  { value: 'blue', hex: '#3182CE' },
                  { value: 'green', hex: '#38A169' },
                  { value: 'black', hex: '#1A202C' }
                ].map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color.value);
                      setColorError(false);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      selectedColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-[#c5a87f] scale-110' 
                        : 'hover:scale-110'
                    }`}
                    style={{ 
                      backgroundColor: color.hex,
                      border: color.value === 'black' ? '1px solid #E2E8F0' : 'none'
                    }}
                    aria-label={`Select ${color.value} color`}
                  >
                    {selectedColor === color.value && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={color.value === 'black' ? 'white' : 'white'}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-black dark:text-black font-medium mb-2">Quantity</label>
              <div className="flex items-center">
                <button 
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white hover:bg-[#c5a87f] hover:text-white hover:border-[#c5a87f] text-black rounded-l transition-colors"
                  onClick={handleDecreaseQuantity}
                >
                  −
                </button>
                <div className="w-12 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-white text-black">
                  {quantity}
                </div>
                <button 
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white hover:bg-[#c5a87f] hover:text-white hover:border-[#c5a87f] text-black rounded-r transition-colors"
                  onClick={handleIncreaseQuantity}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              {addedToCart ? (
                <div className="w-full py-3 bg-green-500 text-white font-medium rounded flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Added to Cart</span>
                </div>
              ) : (
                <button 
                  className="w-full py-3 bg-[#1e2832] text-white font-medium hover:bg-[#c5a87f] transition-colors rounded"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              )}
              
              {/* Buy Now Button */}
              <button 
                className="w-full py-3 bg-[#c5a87f] text-black font-medium hover:bg-[#b39770] transition-colors rounded"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>

              {/* Display Buy Now error message */}
              {buyNowError && (
                <p className="text-red-500 text-sm text-center mt-2">{buyNowError}</p>
              )}
            </div>
            
            {/* Product Benefits */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center text-black dark:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Estimated delivery: 3-5 business days</p>
              </div>
              
              <div className="flex items-center text-black dark:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>Pay on delivery available</p>
              </div>
              
              <div className="flex items-center text-black dark:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p>Use coupon <span className="font-medium">FIRST100</span> for ₹100 off on your first order</p>
              </div>
              
              <div className="flex items-center text-black dark:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p>Free shipping nationwide on all orders</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mt-16 border-t border-gray-200">
          <div className="flex overflow-x-auto border-b border-gray-200">
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'about'
                  ? 'border-[#c5a87f] text-[#c5a87f]'
                  : 'border-transparent text-gray-500 hover:text-[#c5a87f]'
              }`}
              onClick={() => handleTabChange('about')}
            >
              About the Product
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'border-[#c5a87f] text-[#c5a87f]'
                  : 'border-transparent text-gray-500 hover:text-[#c5a87f]'
              }`}
              onClick={() => handleTabChange('shipping')}
            >
              Shipping & Returns
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'care'
                  ? 'border-[#c5a87f] text-[#c5a87f]'
                  : 'border-transparent text-gray-500 hover:text-[#c5a87f]'
              }`}
              onClick={() => handleTabChange('care')}
            >
              Care Instructions
            </button>
          </div>
          
          <div className="py-8 text-black dark:text-black">
            {activeTab === 'about' && (
              <div>
                <h3 className="text-xl font-display mb-4">About the Product</h3>
                <p className="mb-4">The Embroidered Silk Dress is our signature design that brings together centuries-old artisanal techniques with modern aesthetics. This exquisite piece stands as a testament to India's rich textile heritage and the expertise of our master craftspeople.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  <div>
                    <h4 className="font-medium text-lg mb-3">Design Philosophy</h4>
                    <p>Our design approach combines traditional motifs with contemporary silhouettes, creating pieces that honor cultural heritage while embracing modern sensibilities. The intricate embroidery patterns tell stories passed down through generations, each stitch meticulously placed by hand.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg mb-3">Ethical Production</h4>
                    <p>We believe in ethical production practices and fair compensation for artisans. Each piece is created in small batches at our workshop where we maintain the highest standards of craftsmanship while ensuring dignified working conditions for our skilled artisans.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg mb-3">Materials</h4>
                    <p>We source the finest pure silk from sustainable producers in Kashmir and South India. The fabric undergoes traditional dyeing processes using natural pigments that are environmentally friendly. Our commitment to quality means we never compromise on materials.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg mb-3">Versatility</h4>
                    <p>While designed for special occasions, our Embroidered Silk Dress can be styled in multiple ways for different events. Pair with minimal accessories for a sophisticated look, or enhance with statement jewelry for festive celebrations. The timeless design ensures it will remain a treasured piece in your wardrobe for years to come.</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-xl font-display mb-4">Shipping & Returns</h3>
                <p className="mb-4">We offer free standard shipping on all orders above ₹5000. For orders below this amount, a flat shipping fee of ₹250 will be applied. Delivery typically takes 3-5 business days depending on your location.</p>
                <p className="mb-4">If you're not completely satisfied with your purchase, you can return it within 30 days of delivery for a full refund or exchange. Please note that items must be unworn, unwashed, and in their original packaging with all tags attached.</p>
                <p>For international orders, please allow 7-14 business days for delivery. Customs duties and taxes may apply based on your country's regulations and are the responsibility of the customer.</p>
              </div>
            )}
            
            {activeTab === 'care' && (
              <div>
                <h3 className="text-xl font-display mb-4">Care Instructions</h3>
                <p className="mb-4">To preserve the beauty and longevity of your Embroidered Silk Dress, we recommend the following care instructions:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Dry clean only</li>
                  <li>Store in a cool, dry place away from direct sunlight</li>
                  <li>Hang on a padded hanger to maintain shape</li>
                  <li>Avoid contact with perfumes, lotions, and oils</li>
                  <li>In case of minor stains, gently blot with a clean, dry cloth (do not rub)</li>
                  <li>Steam on a low setting to remove wrinkles if necessary</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Customer Reviews */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-display text-black mb-8">Customer Reviews</h2>
          
          <div className="space-y-8">
            {reviews.slice(0, showAllReviews ? reviews.length : 2).map(review => (
              <div key={review.id} className="border border-gray-200 p-6 rounded">
                <h3 className="text-lg font-display text-black mb-2">{review.title}</h3>
                
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? 'text-[#c5a87f]' : 'text-gray-300'} fill-current`} 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-gray-700 mb-4">{review.content}</p>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-black">- {review.author}</p>
                  <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                </div>
              </div>
            ))}
          </div>
          
          {reviews.length > 2 && (
            <div className="mt-6 text-center">
              <button 
                className="px-6 py-2 border border-gray-300 rounded text-black font-medium hover:bg-[#c5a87f] hover:text-white hover:border-[#c5a87f] transition-colors"
                onClick={toggleShowAllReviews}
              >
                {showAllReviews ? 'Show Less' : 'View All Reviews'}
              </button>
            </div>
          )}

          {/* Write a Review Section */}
          <div className="mt-12 border-t border-gray-200 pt-10">
            <div className="bg-gray-50 p-6 rounded">
              <h3 className="text-2xl font-display text-black mb-6">Write a Review</h3>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="reviewName" className="block text-black mb-2">Your Name</label>
                  <input 
                    type="text" 
                    id="reviewName"
                    className="w-full border border-gray-300 rounded p-3 text-black focus:outline-none focus:border-[#c5a87f]"
                  />
                </div>
                
                <div>
                  <label className="block text-black mb-2">Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-2xl text-[#c5a87f] focus:outline-none mr-1"
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reviewTitle" className="block text-black mb-2">Review Title</label>
                  <input 
                    type="text" 
                    id="reviewTitle"
                    className="w-full border border-gray-300 rounded p-3 text-black focus:outline-none focus:border-[#c5a87f]"
                  />
                </div>
                
                <div>
                  <label htmlFor="reviewContent" className="block text-black mb-2">Your Review</label>
                  <textarea 
                    id="reviewContent"
                    rows="5"
                    className="w-full border border-gray-300 rounded p-3 text-black focus:outline-none focus:border-[#c5a87f]"
                  ></textarea>
                </div>
                
                <div>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-[#c5a87f] text-white font-medium rounded hover:bg-[#b39770] transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {similarProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-display text-black mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((similarProduct) => (
                <div key={similarProduct.id} className="group">
                  {/* Product Image with "NEW" badge */}
                  <div className="relative overflow-hidden mb-5">
                    <div className="aspect-[3/4] bg-gray-100">
                      <div 
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${similarProduct.image})` }}
                      ></div>
                    </div>
                    
                    {similarProduct.isNew && (
                      <div className="absolute top-3 right-3 bg-[#c5a87f] text-white text-xs font-medium py-1 px-3">
                        NEW
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="text-center">
                    <Link href={`/products/${similarProduct.id}`} className="block">
                      <h3 className="font-display text-lg font-medium text-black hover:text-[#c5a87f] transition-colors">
                        {similarProduct.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">{similarProduct.description}</p>
                    
                    {/* Star Rating */}
                    {similarProduct.rating && (
                      <div className="flex justify-center mt-2">
                        <StarRating rating={similarProduct.rating} />
                      </div>
                    )}
                    
                    <p className="font-medium mt-2 text-black">
                      {similarProduct.currency}{similarProduct.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      
      {/* Phone Number Dialog */}
      {showPhoneDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowPhoneDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-2xl font-display text-black mb-4">Welcome to Alvira!</h3>
            <p className="text-gray-600 mb-2">Please provide your phone number to complete your order.</p>
            
            {/* Coupon Highlight */}
            <div className="bg-[#f8f3ea] border border-[#c5a87f] rounded-md p-4 mb-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#c5a87f] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-sm font-medium text-[#8c7358]">
                  Use coupon <span className="font-bold">FIRST100</span> for ₹100 off on your first order!
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="phoneNumber" className="block text-black mb-2">Phone Number</label>
              <input 
                type="tel" 
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 9876543210"
                className={`w-full border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded p-3 text-black focus:outline-none focus:border-[#c5a87f]`}
              />
              {phoneError && <p className="mt-2 text-red-500 text-sm">{phoneError}</p>}
            </div>
            
            <div className="flex items-center justify-end space-x-4">
              <button 
                onClick={() => setShowPhoneDialog(false)}
                className="px-6 py-2 border border-gray-300 rounded text-black hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePhoneSubmit}
                className="px-6 py-2 bg-[#c5a87f] text-white rounded hover:bg-[#b39770] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </main>
  );
};

export default ProductDetail;