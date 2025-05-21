'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { fetchProducts } from '@/utils/api';
import { logger } from '@/utils/config';
import { newArrivalsProducts, bestsellers } from '@/constants/data';

// Main content component that uses useSearchParams
const ProductsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState(50000);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortOption, setSortOption] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState('');
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all products and apply initial filter
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filters for API call
        const filters = {};
    
    if (categoryParam) {
          // Remove 'cat-' prefix if it exists
          const cleanCategory = categoryParam.startsWith('cat-') 
            ? categoryParam.substring(4) 
            : categoryParam;
          filters.category = cleanCategory;
          setCategory(cleanCategory);
        } else {
          setCategory('all');
        }
        
        // Fetch products from API
        const apiProducts = await fetchProducts(filters);
        
        if (apiProducts && apiProducts.length > 0) {
          setProducts(apiProducts);
          setFilteredProducts(apiProducts);
          logger.info(`Successfully loaded ${apiProducts.length} products from API`);
        } else {
          logger.info('No products found in API, using fallback data');
          
          // Fallback to local data if API returns empty
          const fallbackProducts = [...newArrivalsProducts, ...bestsellers.items];
          
          if (categoryParam) {
            // Filter fallback products by the category from URL
            const filtered = fallbackProducts.filter(product => 
              product.category === categoryParam || 
              (product.tags && product.tags.includes(categoryParam))
            );
            setProducts(filtered);
            setFilteredProducts(filtered);
          } else {
            // Show all fallback products if no category is specified
            setProducts(fallbackProducts);
            setFilteredProducts(fallbackProducts);
          }
        }
      } catch (err) {
        logger.error('Failed to fetch products:', err);
        setError(err.message);
        
        // Use fallback data in case of error
        const fallbackProducts = [...newArrivalsProducts, ...bestsellers.items];
        
        if (categoryParam) {
          // Filter fallback products by the category from URL
          const filtered = fallbackProducts.filter(product => 
        product.category === categoryParam || 
        (product.tags && product.tags.includes(categoryParam))
      );
      setProducts(filtered);
      setFilteredProducts(filtered);
    } else {
          // Show all fallback products if no category is specified
          setProducts(fallbackProducts);
          setFilteredProducts(fallbackProducts);
        }
      } finally {
        setLoading(false);
    }
    };
    
    fetchProductsData();
  }, [categoryParam]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply "New Only" filter
    if (showNewOnly) {
      result = result.filter(product => product.isNew);
    }
    
    // Apply "On Sale" filter to show only discounted products
    if (showDiscountedOnly) {
      result = result.filter(product => product.discount);
    }
    
    // Apply rating filter
    if (minRating > 0) {
      result = result.filter(product => product.rating >= minRating);
    }
    
    // Apply price filter
    result = result.filter(product => product.price <= priceRange);
    
    // Apply fabric filter
    if (selectedFabric) {
      result = result.filter(product => 
        product.fabric === selectedFabric || 
        (product.tags && product.tags.includes(selectedFabric.toLowerCase()))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        // Assuming newer products have higher IDs or have isNew flag
        result = result.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return b.id - a.id;
        });
        break;
      case 'price-low-high':
        result = result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result = result.sort((a, b) => b.price - a.price);
        break;
      case 'discount-high-low':
        result = result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
  }, [products, showNewOnly, minRating, priceRange, sortOption, selectedFabric, showDiscountedOnly]);

  // Format category name for display
  const formatCategoryName = (category) => {
    if (!category || category === 'all') return 'All Products';
    
    // If the category starts with "cat-", it's a category ID from the database
    if (category.startsWith('cat-')) {
      // Remove the "cat-" prefix
      const nameWithoutPrefix = category.substring(4);
      
      // Format the remaining part as a readable name
      return nameWithoutPrefix
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // For regular category slugs or names
    return category.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle price range change
  const handlePriceChange = (e) => {
    setPriceRange(parseInt(e.target.value));
  };

  // Handle sort option change
  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  // Handle rating change
  const handleRatingChange = (rating) => {
    setMinRating(rating);
  };

  // Handle fabric selection
  const handleFabricChange = (fabric) => {
    setSelectedFabric(fabric);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange(50000);
    setShowNewOnly(false);
    setMinRating(0);
    setSortOption('newest');
    setSelectedFabric('');
    setShowDiscountedOnly(false);
  };

  // Toggle sort dropdown
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    router.push(`/products?category=${categoryName.toLowerCase()}`);
  };

  // Render functions

  // Render loading state
  const renderLoading = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 aspect-[3/4] rounded-md mb-3"></div>
          <div className="bg-gray-200 h-4 w-2/3 mb-2 rounded"></div>
          <div className="bg-gray-200 h-4 w-1/3 mb-4 rounded"></div>
          <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-lg text-gray-700 mb-4">Unable to load products. {error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
      >
        Retry
      </button>
    </div>
  );

  // Render no results
  const renderNoResults = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-lg text-gray-700 mb-4">No products match your current filters.</p>
      <button 
        onClick={clearAllFilters} 
        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <section className="container mx-auto py-20 px-4">
      {/* Desktop Header and Sidebar */}
      <div className="hidden lg:block">
        {/* Header - Shows the current category name */}
        <div className="flex justify-between items-baseline mb-8">
          <h1 className="text-4xl font-display text-black">
            {loading ? 'Loading Products...' : formatCategoryName(category)}
          </h1>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </span>
            
            {/* Sorting Controls */}
            <div className="relative">
              <button 
                onClick={toggleSortDropdown}
                className="bg-white dark:bg-white border border-gray-200 rounded px-4 py-2 flex items-center justify-between min-w-[120px] text-black"
              >
                <span>{sortOption === 'newest' ? 'Newest' : 
                      sortOption === 'price-low-high' ? 'Price: Low to High' :
                      sortOption === 'price-high-low' ? 'Price: High to Low' :
                      'Highest Discount'}</span>
                <svg 
                  className="w-4 h-4 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-white border border-gray-200 rounded shadow-lg w-full z-10">
                  <ul>
                    <li 
                      className={`px-4 py-2 cursor-pointer text-black ${sortOption === 'newest' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSortChange('newest')}
                    >
                      <span className={sortOption === 'newest' ? 'font-medium' : ''}>Newest</span>
                    </li>
                    <li 
                      className={`px-4 py-2 cursor-pointer text-black ${sortOption === 'price-low-high' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSortChange('price-low-high')}
                    >
                      Price: Low to High
                    </li>
                    <li 
                      className={`px-4 py-2 cursor-pointer text-black ${sortOption === 'price-high-low' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSortChange('price-high-low')}
                    >
                      Price: High to Low
                    </li>
                    <li 
                      className={`px-4 py-2 cursor-pointer text-black ${sortOption === 'discount-high-low' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSortChange('discount-high-low')}
                    >
                      <span className="flex items-center">
                        Highest Discount
                        <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-sm">Sale</span>
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Update Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="flex flex-col mb-4">
          <div className="mb-4">
            <h1 className="text-3xl font-display text-black">
              {loading ? 'Loading Products...' : formatCategoryName(category)}
            </h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center relative">
              <span className="font-medium text-black">Sort:</span>
              <button 
                onClick={toggleSortDropdown}
                className="bg-white dark:bg-white border border-gray-200 rounded px-3 py-2 flex items-center justify-between min-w-[100px] ml-2 text-black"
              >
                <span>{sortOption === 'newest' ? 'Newest' : 
                       sortOption === 'price-low-high' ? 'Low to High' :
                       sortOption === 'price-high-low' ? 'High to Low' :
                       'Highest Discount'}</span>
                <svg 
                  className="w-4 h-4 ml-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-white border border-gray-200 rounded shadow-lg w-[160px] z-10">
                  <ul>
                    <li 
                      className={`px-4 py-2 cursor-pointer text-black ${sortOption === 'newest' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSortChange('newest')}
                    >
                      <span className={sortOption === 'newest' ? 'font-medium' : ''}>Newest</span>
                    </li>
                    <li 
                      className={`px-4 py-2 cursor-pointer text-black ${sortOption === 'price-low-high' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSortChange('price-low-high')}
                    >
                      Low to High
                    </li>
                    <li 
                      className={`px-4 py-2 cursor-pointer text-black ${sortOption === 'price-high-low' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSortChange('price-high-low')}
                    >
                      High to Low
                    </li>
                    <li 
                      className={`px-4 py-2 cursor-pointer text-black ${sortOption === 'discount-high-low' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSortChange('discount-high-low')}
                    >
                      <span className="flex items-center">
                        Highest Discount
                        <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-sm">Sale</span>
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <button 
              onClick={toggleMobileFilters}
              className="flex items-center px-4 py-2 border border-gray-200 rounded text-black"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
              Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleMobileFilters}>
          <div 
            className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-medium text-black">Filters</h2>
              <button onClick={toggleMobileFilters} className="text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-xl mb-4 font-medium text-black">Price Range</h3>
              <div className="flex justify-between text-gray-600 text-sm mb-2">
                <span>₹0</span>
                <span>₹{priceRange.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="1000"
                value={priceRange}
                onChange={handlePriceChange}
                className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
            </div>
            
            {/* Fabric Segment Filter - Mobile */}
            <div className="mb-8">
              <h3 className="text-xl mb-4 font-medium text-black">Fabric Segment</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-fabric-all"
                    name="mobile-fabric"
                    checked={selectedFabric === ''}
                    onChange={() => handleFabricChange('')}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-fabric-all" className="text-black">All Fabrics</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-fabric-cotton"
                    name="mobile-fabric"
                    checked={selectedFabric === 'Cotton'}
                    onChange={() => handleFabricChange('Cotton')}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-fabric-cotton" className="text-black">Cotton</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-fabric-organza"
                    name="mobile-fabric"
                    checked={selectedFabric === 'Organza'}
                    onChange={() => handleFabricChange('Organza')}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-fabric-organza" className="text-black">Organza</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-fabric-crepe"
                    name="mobile-fabric"
                    checked={selectedFabric === 'Crepe'}
                    onChange={() => handleFabricChange('Crepe')}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-fabric-crepe" className="text-black">Crepe</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-fabric-wool"
                    name="mobile-fabric"
                    checked={selectedFabric === 'Wool'}
                    onChange={() => handleFabricChange('Wool')}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-fabric-wool" className="text-black">Wool</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-fabric-reyan"
                    name="mobile-fabric"
                    checked={selectedFabric === 'Reyan'}
                    onChange={() => handleFabricChange('Reyan')}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-fabric-reyan" className="text-black">Reyan</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-fabric-silk"
                    name="mobile-fabric"
                    checked={selectedFabric === 'Silk'}
                    onChange={() => handleFabricChange('Silk')}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-fabric-silk" className="text-black">Silk</label>
                </div>
              </div>
            </div>
            
            {/* Rating Filter */}
            <div className="mb-8">
              <h3 className="text-xl mb-4 font-medium text-black">Rating</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-rating-all"
                    name="mobile-rating"
                    checked={minRating === 0}
                    onChange={() => handleRatingChange(0)}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-rating-all" className="text-black">All Ratings</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-rating-4+"
                    name="mobile-rating"
                    checked={minRating === 4}
                    onChange={() => handleRatingChange(4)}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-rating-4+" className="text-black">4+ Stars</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-rating-3+"
                    name="mobile-rating"
                    checked={minRating === 3}
                    onChange={() => handleRatingChange(3)}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-rating-3+" className="text-black">3+ Stars</label>
                </div>
              </div>
            </div>
            
            {/* New Arrivals Filter */}
            <div className="mb-8">
              <h3 className="text-xl mb-4 font-medium text-black">Product Type</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="mobile-new-only"
                    checked={showNewOnly}
                    onChange={() => setShowNewOnly(!showNewOnly)}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-new-only" className="text-black">New Arrivals Only</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="mobile-sale-only"
                    checked={showDiscountedOnly}
                    onChange={() => setShowDiscountedOnly(!showDiscountedOnly)}
                    className="mr-3 h-5 w-5 accent-secondary"
                  />
                  <label htmlFor="mobile-sale-only" className="text-black flex items-center">
                    <span>On Sale</span>
                    <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded">Sale</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button 
                onClick={() => {
                  toggleMobileFilters();
                }}
                className="w-full bg-secondary text-white py-3 rounded text-center"
              >
                Apply Filters
              </button>
              <button 
                onClick={() => {
                  clearAllFilters();
                  toggleMobileFilters();
                }}
                className="w-full text-secondary mt-3 py-2 text-center"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters - Left Sidebar (Desktop only) */}
        <div className="hidden lg:block w-1/4">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-black">Filters</h2>
              <button 
                onClick={clearAllFilters}
                className="text-secondary hover:underline text-sm"
              >
                Clear All
              </button>
            </div>
            
            <div className="bg-white dark:bg-white p-6 rounded shadow-sm border border-gray-200 max-h-[calc(100vh-150px)] overflow-y-auto">
              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-xl mb-4 font-medium text-black">Price Range</h3>
                <div className="flex justify-between text-gray-600 text-sm mb-2">
                  <span>₹0</span>
                  <span>₹{priceRange.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  step="1000"
                  value={priceRange}
                  onChange={handlePriceChange}
                  className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>
              
              {/* Fabric Segment Filter - Desktop */}
              <div className="mb-8">
                <h3 className="text-xl mb-4 font-medium text-black">Fabric Segment</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="fabric-all"
                      name="fabric"
                      checked={selectedFabric === ''}
                      onChange={() => handleFabricChange('')}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="fabric-all" className="text-black">All Fabrics</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="fabric-cotton"
                      name="fabric"
                      checked={selectedFabric === 'Cotton'}
                      onChange={() => handleFabricChange('Cotton')}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="fabric-cotton" className="text-black">Cotton</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="fabric-organza"
                      name="fabric"
                      checked={selectedFabric === 'Organza'}
                      onChange={() => handleFabricChange('Organza')}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="fabric-organza" className="text-black">Organza</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="fabric-crepe"
                      name="fabric"
                      checked={selectedFabric === 'Crepe'}
                      onChange={() => handleFabricChange('Crepe')}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="fabric-crepe" className="text-black">Crepe</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="fabric-wool"
                      name="fabric"
                      checked={selectedFabric === 'Wool'}
                      onChange={() => handleFabricChange('Wool')}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="fabric-wool" className="text-black">Wool</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="fabric-reyan"
                      name="fabric"
                      checked={selectedFabric === 'Reyan'}
                      onChange={() => handleFabricChange('Reyan')}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="fabric-reyan" className="text-black">Reyan</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="fabric-silk"
                      name="fabric"
                      checked={selectedFabric === 'Silk'}
                      onChange={() => handleFabricChange('Silk')}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="fabric-silk" className="text-black">Silk</label>
                  </div>
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="mb-8">
                <h3 className="text-xl mb-4 font-medium text-black">Rating</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="rating-all"
                      name="rating"
                      checked={minRating === 0}
                      onChange={() => handleRatingChange(0)}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="rating-all" className="text-black">All Ratings</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="rating-4+"
                      name="rating"
                      checked={minRating === 4}
                      onChange={() => handleRatingChange(4)}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="rating-4+" className="text-black">4+ Stars</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="rating-3+"
                      name="rating"
                      checked={minRating === 3}
                      onChange={() => handleRatingChange(3)}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="rating-3+" className="text-black">3+ Stars</label>
                  </div>
                </div>
              </div>
              
              {/* New Arrivals Filter */}
              <div className="mb-8">
                <h3 className="text-xl mb-4 font-medium text-black">Product Type</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="new-only"
                      checked={showNewOnly}
                      onChange={() => setShowNewOnly(!showNewOnly)}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="new-only" className="text-black">New Arrivals Only</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="sale-only"
                      checked={showDiscountedOnly}
                      onChange={() => setShowDiscountedOnly(!showDiscountedOnly)}
                      className="mr-3 h-5 w-5 accent-secondary"
                    />
                    <label htmlFor="sale-only" className="text-black flex items-center">
                      <span>On Sale</span>
                      <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded">Sale</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Grid - Right Side */}
        <div className="w-full lg:w-3/4">
          {/* Products Display */}
          {loading ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            renderNoResults()
          )}
        </div>
      </div>
    </section>
  );
};

const ProductsPage = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-white">
      <Header />
      <Suspense fallback={<div className="container mx-auto py-20 px-4 text-center">Loading products...</div>}>
        <ProductsContent />
      </Suspense>
      <Footer />
    </main>
  );
};

export default ProductsPage;