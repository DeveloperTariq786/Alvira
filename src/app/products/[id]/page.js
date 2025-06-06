'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import LoadingState from '@/components/ui/LoadingState';
import { addToCart } from '@/utils/cart';
import { fetchProductById, fetchProducts, createUser, verifyPhone, resendOTP, createReview, fetchProductReviews, calculateAverageRating } from '@/utils/api';
import Image from 'next/image';
import PhoneVerification from '@/components/ui/PhoneVerification';
import ProductCard from '@/components/ui/ProductCard';

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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authError, setAuthError] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageContainerRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    verificationCode: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 0,
    content: ''
  });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmittingPreorder, setIsSubmittingPreorder] = useState(false);
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState(false);
  const actionAfterAuth = useRef(null);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      return false;
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setSwiping(true);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e) => {
    if (!swiping) return;

    const touchMoveX = e.touches[0].clientX;
    const diffX = touchStartX - touchMoveX;

    if (Math.abs(diffX) > 20) {
      setSwipeDirection(diffX > 0 ? 'left' : 'right');
      if (Math.abs(diffX) > 10 && thumbnails.length > 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    const minDistance = 50;

    if (Math.abs(diffX) > minDistance) {
      if (diffX > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    setSwiping(false);
    setSwipeDirection(null);
  };

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

  const StarRating = ({ rating }) => {
    if (!rating) {
      return (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
          <span className="ml-2 text-sm text-gray-600">No ratings yet</span>
        </div>
      );
    }

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

  const handleAddToCart = async () => {
    setSizeError(false);
    setColorError(false);
    setAuthError('');

    if (product?.stockStatus === 'OUT_OF_STOCK') {
      console.log("Product is out of stock. Cannot add to cart.");
      return;
    }

    let hasError = false;
    if (!selectedSize) {
      setSizeError(true);
      hasError = true;
    }
    if (!selectedColor) {
      setColorError(true);
      hasError = true;
    }
    if (hasError) return;

    const executeActualAddToCart = async () => {
      try {
        setIsAddingToCart(true);
        const productToAdd = {
          id: product.id,
          quantity: quantity
        };
        await addToCart(productToAdd);
        window.dispatchEvent(new Event('cart-updated'));
        setAddedToCart(true);
        setTimeout(() => {
          router.push('/cart');
        }, 800);
      } catch (error) {
        console.error('Error adding to cart:', error);
        setAuthError('Failed to add item to cart. Please try again.');
        setIsAddingToCart(false);
        setAddedToCart(false);
      } finally {
        if (isAddingToCart) setIsAddingToCart(false);
      }
    };

    if (!checkAuth()) {
      actionAfterAuth.current = executeActualAddToCart;
      setShowAuthDialog(true);
      return;
    }
    await executeActualAddToCart();
  };

  const handlePreorder = async () => {
    setAuthError('');
    setSizeError(false);
    setColorError(false);
    
    let hasError = false;
    if (!selectedSize) {
      setSizeError(true);
      hasError = true;
    }
    if (!selectedColor) {
      setColorError(true);
      hasError = true;
    }
    if (hasError) return;

    const proceedToPreorderPage = () => {
      setIsSubmittingPreorder(true);
      const preorderItemDetails = {
        productId: product.id,
        name: product.name,
        image: mainImage, 
        price: product.price,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
        currency: product.currency,
        isPreorder: true
      };
      sessionStorage.setItem('preorderItemDetails', JSON.stringify(preorderItemDetails));
      console.log('Proceeding to preorder page with:', preorderItemDetails);
      router.push('/checkout');
    };

    if (!checkAuth()) {
      actionAfterAuth.current = proceedToPreorderPage;
      setShowAuthDialog(true);
      return;
    }
    proceedToPreorderPage();
  };

  const handleBuyNow = async () => {
    setAuthError('');
    setSizeError(false);
    setColorError(false);

    let hasError = false;
    if (!selectedSize) {
      setSizeError(true);
      hasError = true;
    }
    if (!selectedColor) {
      setColorError(true);
      hasError = true;
    }
    if (hasError) return;

    const proceedToCheckoutPage = () => {
      setIsProcessingBuyNow(true);
      const buyNowItemDetails = {
        productId: product.id,
        name: product.name,
        image: mainImage,
        price: product.price,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
        currency: product.currency,
        isPreorder: false // Explicitly not a preorder
      };
      sessionStorage.setItem('buyNowItemDetails', JSON.stringify(buyNowItemDetails)); // Use a different key than preorder
      console.log('Proceeding to checkout page with:', buyNowItemDetails);
      router.push('/checkout');
    };

    if (!checkAuth()) {
      actionAfterAuth.current = proceedToCheckoutPage;
      setShowAuthDialog(true);
      return;
    }
    proceedToCheckoutPage();
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

  const handleAuthSuccess = (response) => {
    localStorage.setItem('token', response.token);
    try {
      const payload = JSON.parse(atob(response.token.split('.')[1]));
      const userId = payload.id || payload.userId || payload.sub;
      setCurrentUser({ id: userId, name: payload.name }); 
    } catch (error) {
      console.error('Error parsing token in handleAuthSuccess:', error);
    }
    setShowAuthDialog(false);
    
    if (actionAfterAuth.current) {
      actionAfterAuth.current(); 
      actionAfterAuth.current = null; 
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setShowAuthDialog(true);
      return;
    }
    
    if (reviewFormData.rating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    
    if (!reviewFormData.content.trim()) {
      setReviewError('Please write your review');
      return;
    }
    
    setReviewSubmitting(true);
    setReviewError('');
    
    try {
      const productId = params.id;
      if (!productId) {
        throw new Error('Product ID is missing');
      }
      
      console.log('Submitting review for product:', productId);
      
      const reviewData = {
        rating: reviewFormData.rating,
        comment: reviewFormData.content,
        productId: productId
      };
      
      console.log('Review data being sent:', reviewData);
      
      const response = await createReview(reviewData);
      
      const newReview = {
        id: response.id,
        rating: response.rating,
        comment: response.comment,
        author: currentUser.name,
        createdAt: response.createdAt
      };
      
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      
      const averageRating = calculateAverageRating(updatedReviews);
      setProduct(prevProduct => ({
        ...prevProduct,
        rating: averageRating
      }));
      
      setHasUserReviewed(true);
      
      setReviewFormData({
        rating: 0,
        content: ''
      });
      
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productId = params.id;
        const data = await fetchProductById(productId);
        setProduct(data);

        if (data.images && data.images.length > 0) {
          const imageUrls = data.images.map(img => img.imageUrl);
          setThumbnails(imageUrls);
          const primaryImage = data.images.find(img => img.isPrimary);
          setMainImage(primaryImage ? primaryImage.imageUrl : imageUrls[0]);
        }

        if (data.categoryId) {
          try {
            const similar = await fetchProducts({
              category: data.categoryId,
              limit: 4,
              exclude: productId
            });
            setSimilarProducts(similar);
          } catch (error) {
            console.error('Error fetching similar products:', error);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProductData();
    }
  }, [params.id, currentUser]);

  useEffect(() => {
    const element = imageContainerRef.current;
    if (!element) return;

    const touchStartHandler = (e) => handleTouchStart(e);
    const touchMoveHandler = (e) => {
      if (swiping && thumbnails.length > 1) {
        const touchMoveX = e.touches[0].clientX;
        const diffX = touchStartX - touchMoveX;

        if (Math.abs(diffX) > 20) {
          setSwipeDirection(diffX > 0 ? 'left' : 'right');

          if (Math.abs(diffX) > 10) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };
    const touchEndHandler = (e) => handleTouchEnd(e);

    element.addEventListener('touchstart', touchStartHandler, { passive: true });
    element.addEventListener('touchmove', touchMoveHandler, { passive: false });
    element.addEventListener('touchend', touchEndHandler, { passive: true });

    return () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
    };
  }, [imageContainerRef, swiping, touchStartX, thumbnails.length, handleTouchStart, handleTouchEnd]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id || payload.userId || payload.sub;
        setCurrentUser({ id: userId, name: payload.name });
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const handleStarClick = (star) => {
    setReviewFormData({
      ...reviewFormData,
      rating: star
    });
  };

  const handleStarHover = (star) => {
    setHoveredRating(star);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        if (params.id) {
          const productReviews = await fetchProductReviews(params.id);
          setReviews(productReviews);
          
          if (productReviews.length > 0) {
            const averageRating = calculateAverageRating(productReviews);
            setProduct(prevProduct => ({
              ...prevProduct,
              rating: averageRating
            }));
            
            if (currentUser) {
              const userReview = productReviews.find(review => 
                review.userId === currentUser.id
              );
              if (userReview) {
                setHasUserReviewed(true);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product rating:', error);
      }
    };

    fetchRatingData();
    
    const intervalId = setInterval(fetchRatingData, 30000);
    
    return () => clearInterval(intervalId);
  }, [params.id, currentUser]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-white">
        <Header />
        <div className="container mx-auto pt-16 md:pt-20 pb-20 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
              <div className="space-y-4">
                <div className="h-[500px] md:h-[650px] bg-gray-200 rounded-md"></div>
                
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-md"></div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col justify-start space-y-6">
                <div className="h-10 bg-gray-200 rounded-md w-3/4"></div>
                
                <div className="h-5 bg-gray-200 rounded-md w-1/4"></div>
                
                <div className="h-8 bg-gray-200 rounded-md w-1/2"></div>
                
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
                </div>
                
                <div className="h-6 bg-gray-200 rounded-md w-2/5"></div>
                
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="h-10 w-16 bg-gray-200 rounded-md"></div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
                  <div className="flex flex-wrap gap-3">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-l-md"></div>
                    <div className="h-10 w-12 bg-gray-200"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-r-md"></div>
                  </div>
                </div>
                
                <div className="space-y-4 w-full">
                  <div className="h-12 bg-gray-200 rounded-md w-full"></div>
                  <div className="h-12 bg-gray-200 rounded-md w-full"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 border-t border-gray-200 pt-6">
              <div className="flex overflow-x-auto space-x-6 border-b border-gray-200 pb-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-8 bg-gray-200 rounded-md w-24 flex-shrink-0"></div>
                ))}
              </div>
              <div className="py-8">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (isAddingToCart) {
    return (
      <main className="min-h-screen bg-white dark:bg-white">
        <Header />
        <LoadingState message="Adding to Cart..." />
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

  const isOutOfStock = product?.stockStatus === 'OUT_OF_STOCK';

  return (
    <main className="min-h-screen bg-white dark:bg-white">
      <style jsx global>{`
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
          <div className="space-y-4">
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
              
              {product.discount && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-red-600 text-white px-4 py-1 text-sm font-medium rounded shadow-md">
                    {product.discount}% OFF
                  </div>
                </div>
              )}
              
              {product.isNew && !isOutOfStock && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-[#c5a87f] text-white px-4 py-1 text-sm font-medium rounded">
                    NEW
                  </div>
                </div>
              )}

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
              
              {thumbnails.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center md:hidden">
                  <div className="bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-xs">
                    Swipe to view more images
                  </div>
                </div>
              )}
            </div>
            
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
          
          <div className="flex flex-col justify-start">
            <h1 className="text-3xl md:text-4xl font-display text-black dark:text-black mb-2">{product.name}</h1>
            
            {isOutOfStock && (
              <p className="text-xl font-semibold text-red-600 mb-3">
                Currently Out of Stock
              </p>
            )}
            
            <div className="mb-4">
              <StarRating rating={product.rating} />
            </div>
            
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
            
            {product.discount && product.saleEndsIn && (
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

            {product.fabric && (
              <div className="mb-6">
                <p className="text-black font-medium">Fabric: <span className="font-normal">{product.fabric}</span></p>
              </div>
            )}

            <div className="mb-6 flex gap-2">
              {product.isBest && (
                <span className="px-3 py-1 text-xs border border-amber-500 text-amber-700 bg-amber-50 rounded-full whitespace-nowrap">
                  Bestseller
                </span>
              )}
              {product.isNew && (
                <span className="px-3 py-1 text-xs border border-emerald-500 text-emerald-700 bg-emerald-50 rounded-full whitespace-nowrap">
                  New Arrival
                </span>
              )}
              {product.category && (
                <span className="px-3 py-1 text-xs border border-indigo-500 text-indigo-700 bg-indigo-50 rounded-full whitespace-nowrap">
                  {product.category.name}
                </span>
              )}
            </div>
            
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
                {product.sizes && product.sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleSizeChange(size.value)}
                    className={`min-w-[48px] h-10 px-3 py-1 uppercase font-medium text-sm border transition-all ${
                      selectedSize === size.value 
                        ? 'border-[#c5a87f] bg-[#c5a87f] text-white' 
                        : 'border-gray-300 text-gray-700 hover:border-[#c5a87f]'
                    } rounded`}
                  >
                    {size.value === 'unstitch' ? 'Unstitch' : size.label}
                  </button>
                ))}
              </div>
              
              {showSizeGuide && (
                <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="bg-white px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h4 className="font-medium text-black dark:text-white">Garment Size Guide (Inches)</h4>
                    <button 
                      onClick={toggleSizeGuide}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
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
            
            <div className="mb-6">
              <label className="block text-black dark:text-black font-medium mb-2">
                Color {colorError && <span className="text-red-500 text-sm ml-2">*Please select a color</span>}
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors && product.colors.map(color => (
                  <button
                    key={color.id}
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
                      backgroundColor: color.hexCode,
                      border: color.value === 'black' ? '1px solid #E2E8F0' : 'none'
                    }}
                    aria-label={`Select ${color.name} color`}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={['black', 'burgundy', 'navy'].includes(color.value) ? 'white' : 'white'}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-black dark:text-black font-medium mb-2">Quantity</label>
              <div className="flex items-center">
                <button 
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white hover:bg-[#c5a87f] hover:text-white hover:border-[#c5a87f] text-black rounded-l transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDecreaseQuantity}
                  disabled={isOutOfStock || quantity <= 1 || isAddingToCart || isSubmittingPreorder}
                >
                  −
                </button>
                <div className={`w-12 h-10 flex items-center justify-center border-t border-b border-gray-300 text-black ${isOutOfStock ? 'bg-gray-100' : 'bg-white'}`}>
                  {quantity}
                </div>
                <button 
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white hover:bg-[#c5a87f] hover:text-white hover:border-[#c5a87f] text-black rounded-r transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleIncreaseQuantity}
                  disabled={isOutOfStock || isAddingToCart || isSubmittingPreorder}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {isOutOfStock ? (
                <button
                  onClick={handlePreorder}
                  disabled={isSubmittingPreorder || !selectedSize || !selectedColor}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 rounded flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmittingPreorder ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Preorder...
                    </>
                  ) : (
                    'Preorder Now'
                  )}
                </button>
              ) : (
                <button
                  className={`w-full py-3 ${addedToCart ? 'bg-green-500 cursor-default' : (!selectedSize || !selectedColor) ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-[#1e2832] hover:bg-[#c5a87f]'} text-white font-medium transition-all duration-300 rounded flex items-center justify-center ${isAddingToCart ? 'cursor-wait' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || addedToCart || !selectedSize || !selectedColor}
                >
                  {addedToCart ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Added! Redirecting to Cart...</span>
                    </div>
                  ) : isAddingToCart ? (
                    <LoadingState type="button" message="Adding to Cart..." />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              )}
              {authError && (
                <p className="text-red-500 text-sm mt-2 text-center">{authError}</p>
              )}
            </div>
            
            {!isOutOfStock && (
              <div className="mt-4">
                <button
                  onClick={handleBuyNow}
                  disabled={isProcessingBuyNow || !selectedSize || !selectedColor || isAddingToCart}
                  className="w-full py-3 bg-[#c5a87f] hover:bg-[#b39770] text-white font-medium transition-all duration-300 rounded flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessingBuyNow ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </button>
              </div>
            )}
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-display mb-3 text-black">Other Information</h3>
              <div className="space-y-4">
                {product.productBenefits && product.productBenefits.map((benefit) => (
                  <div key={benefit.id} className="flex items-center text-black dark:text-black">
                    {benefit.icon === 'clock' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c5a87f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {benefit.icon === 'cash' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c5a87f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    )}
                    {benefit.icon === 'coupon' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c5a87f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    )}
                    {benefit.icon === 'shipping' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c5a87f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    )}
                    <p dangerouslySetInnerHTML={{ __html: benefit.text.replace('FIRST100', '<span class="font-medium">FIRST100</span>') }}></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
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
              {product.productInformation?.title || "About the Product"}
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
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-[#c5a87f] text-[#c5a87f]'
                  : 'border-transparent text-gray-500 hover:text-[#c5a87f]'
              }`}
              onClick={() => handleTabChange('reviews')}
            >
              Reviews
            </button>
          </div>
          
          <div className="py-8 text-black dark:text-black">
            {activeTab === 'about' && (
              <div>
                <h3 className="text-xl font-display mb-4">{product.productInformation?.title || "About the Product"}</h3>
                <p className="mb-4">{product.productInformation?.description || product.description}</p>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-xl font-display mb-4">Shipping & Returns</h3>
                {product.shippingPoints ? (
                  product.shippingPoints.map((point, index) => (
                    <p key={index} className={index !== product.shippingPoints.length - 1 ? "mb-4" : ""}>
                      {point}
                    </p>
                  ))
                ) : (
                  <p>Shipping information not available</p>
                )}
              </div>
            )}
            
            {activeTab === 'care' && (
              <div>
                <h3 className="text-xl font-display mb-4">Care Instructions</h3>
                {product.careInstructions && Array.isArray(product.careInstructions) && product.careInstructions.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {product.careInstructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Care instructions not available</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="p-6">
                <div className="mb-8">
                  <h3 className="text-xl font-display text-black mb-4">Customer Reviews</h3>
                  
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-8">
                      {reviews.slice(0, showAllReviews ? reviews.length : 2).map(review => (
                        <div key={review.id} className="border border-gray-200 p-6 rounded">
                          <div className="flex mb-3">
                            <StarRating rating={review.rating} />
                            <span className="ml-3 text-sm text-gray-600">
                              {typeof review.date === 'string' ? formatDate(review.date) : formatDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="mb-2 text-black">{review.content || review.comment}</p>
                          <p className="text-sm font-medium text-[#c5a87f]">{review.author || review.name || "Verified User"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review this product.</p>
                  )}
                  
                  {reviews && reviews.length > 2 && (
                    <div className="mt-6 text-center">
                      <button 
                        className="px-6 py-2 text-sm font-medium text-[#c5a87f] border border-[#c5a87f] rounded hover:bg-[#c5a87f] hover:text-white transition-colors"
                        onClick={toggleShowAllReviews}
                      >
                        {showAllReviews ? 'Show Less Reviews' : `Show All Reviews (${reviews.length})`}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-12 border-t border-gray-200 pt-10">
                  <div className="bg-gray-50 p-6 rounded">
                    <h3 className="text-2xl font-display text-black mb-6">Write a Review</h3>
                    
                    {!currentUser ? (
                      <div className="text-center p-6">
                        <p className="text-gray-600 mb-4">Please sign in to write a review</p>
                        <button
                          onClick={() => setShowAuthDialog(true)}
                          className="px-6 py-3 bg-[#c5a87f] text-white font-medium rounded hover:bg-[#b39770] transition-colors"
                        >
                          Sign In
                        </button>
                      </div>
                    ) : hasUserReviewed ? (
                      <div className="text-center p-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-xl font-medium text-black mb-2">Thank You for Your Review!</h4>
                        <p className="text-gray-600">Your feedback helps other shoppers make better decisions.</p>
                      </div>
                    ) : (
                      <form className="space-y-6" onSubmit={handleReviewSubmit}>
                        <div>
                          <label className="block text-black mb-2">Rating*</label>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="text-2xl focus:outline-none mr-1"
                                style={{ 
                                  color: (hoveredRating || reviewFormData.rating) >= star ? '#c5a87f' : '#d1d5db' 
                                }}
                                onClick={() => handleStarClick(star)}
                                onMouseEnter={() => handleStarHover(star)}
                                onMouseLeave={handleStarLeave}
                              >
                                ★
                              </button>
                            ))}
                            {reviewFormData.rating > 0 && (
                              <span className="ml-2 text-sm text-gray-600 self-center">
                                ({reviewFormData.rating}.0)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="reviewContent" className="block text-black mb-2">Your Review*</label>
                          <textarea 
                            id="reviewContent"
                            rows={5}
                            className="w-full border border-gray-300 rounded p-3 text-black focus:outline-none focus:border-[#c5a87f]"
                            value={reviewFormData.content}
                            onChange={(e) => setReviewFormData({...reviewFormData, content: e.target.value})}
                            placeholder="Share your experience with this product"
                            required
                          ></textarea>
                        </div>
                        
                        {reviewError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-600 text-sm">{reviewError}</p>
                          </div>
                        )}
                        
                        {reviewSuccess && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-green-600 text-sm">Review submitted successfully!</p>
                          </div>
                        )}
                        
                        <div>
                          <button 
                            type="submit"
                            className="px-6 py-3 bg-[#c5a87f] text-white font-medium rounded hover:bg-[#b39770] transition-colors disabled:bg-gray-400"
                            disabled={reviewSubmitting}
                          >
                            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {similarProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-display text-black mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>
      
      {showAuthDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <PhoneVerification
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowAuthDialog(false)}
          />
        </div>
      )}
      
      <Footer />
      <style jsx>{`
        .cart-animation-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        
        .cart-animation-wrapper {
          animation: cartBounce 1.5s ease-in-out;
        }
        
        .cart-animation-icon {
          animation: cartShake 1.5s ease-in-out;
        }
        
        .cart-animation-badge {
          animation: badgePop 0.5s ease-out 0.2s both;
        }
        
        .cart-animation-plus {
          animation: plusFadeIn 0.5s ease-out 0.4s both;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes cartBounce {
          0%, 20%, 40%, 100% { transform: translateY(0); }
          30% { transform: translateY(-30px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes cartShake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-10deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
          60% { transform: rotate(0deg); }
        }
        
        @keyframes badgePop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes plusFadeIn {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </main>
  );
};

export default ProductDetail;