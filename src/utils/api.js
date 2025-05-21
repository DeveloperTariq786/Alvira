import config, { logger } from './config';

const API_BASE_URL = config.apiUrl;

// Simple in-memory cache
const cache = {
  promotions: {
    data: null,
    timestamp: null,
    categoryCache: {} // Cache by category
  },
  categories: {
    data: null,
    timestamp: null
  }
};

// Cache expiration time from config
const CACHE_EXPIRATION = config.cacheDuration;

/**
 * Check if cache is valid
 * @param {Object} cacheEntry - Cache entry to check
 * @returns {boolean} - Whether the cache is valid
 */
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry || !cacheEntry.timestamp) {
    return false;
  }
  
  const now = Date.now();
  return now - cacheEntry.timestamp < CACHE_EXPIRATION;
};

/**
 * Fetch promotions from the API with caching
 * @param {string} category - Optional category filter
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Array>} - Array of promotion objects
 */
export const fetchPromotions = async (category = null, forceRefresh = false) => {
  // Check if we have a valid cache
  const cacheKey = category ? `category_${category}` : 'all';
  const cacheEntry = category ? 
    cache.promotions.categoryCache[cacheKey] : 
    cache.promotions;
  
  if (!forceRefresh && isCacheValid(cacheEntry)) {
    logger.info('Using cached promotions data');
    return cacheEntry.data;
  }
  
  try {
    const url = category 
      ? `${API_BASE_URL}/promotions?category=${category}` 
      : `${API_BASE_URL}/promotions`;
    
    logger.info(`Fetching promotions from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't use browser's HTTP cache
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch promotions');
    }
    
    const data = await response.json();
    
    // Update cache
    const now = Date.now();
    if (category) {
      cache.promotions.categoryCache[cacheKey] = {
        data,
        timestamp: now
      };
    } else {
      cache.promotions.data = data;
      cache.promotions.timestamp = now;
    }
    
    logger.info(`Fetched ${data.length} promotions`);
    return data;
  } catch (error) {
    logger.error('Error fetching promotions:', error);
    throw error;
  }
};

/**
 * Fetch categories from the API with caching
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Array>} - Array of category objects
 */
export const fetchCategories = async (forceRefresh = false) => {
  // Check if we have a valid cache
  if (!forceRefresh && isCacheValid(cache.categories)) {
    logger.info('Using cached categories data');
    return cache.categories.data;
  }
  
  try {
    const url = `${API_BASE_URL}/categories`;
    logger.info(`Fetching categories from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    
    // Update cache
    cache.categories.data = data;
    cache.categories.timestamp = Date.now();
    
    logger.info(`Fetched ${data.length} categories`);
    return data;
  } catch (error) {
    logger.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetch a promotion by ID
 * @param {string} id - Promotion ID
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Object>} - Promotion object
 */
export const fetchPromotionById = async (id, forceRefresh = false) => {
  // Check if we can find it in the cache first
  if (!forceRefresh && 
      isCacheValid(cache.promotions) && 
      cache.promotions.data) {
    
    const cachedPromotion = cache.promotions.data.find(promo => promo.id === id);
    if (cachedPromotion) {
      logger.info(`Using cached promotion with ID: ${id}`);
      return cachedPromotion;
    }
  }
  
  try {
    const url = `${API_BASE_URL}/promotions/${id}`;
    logger.info(`Fetching promotion from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch promotion');
    }
    
    const data = await response.json();
    logger.info(`Fetched promotion with ID: ${id}`);
    return data;
  } catch (error) {
    logger.error('Error fetching promotion:', error);
    throw error;
  }
};

/**
 * Fetch products from the API with optional filters
 * @param {Object} filters - Optional filters like isBest, isNew, etc.
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Array>} - Array of product objects
 */
export const fetchProducts = async (filters = {}, forceRefresh = false) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    // Add all filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      // Special handling for category to ensure proper formatting
      if (key === 'category' && value) {
        // If category doesn't already start with 'cat-' and it's not a UUID format,
        // we'll pass it as-is since the backend will handle it
        queryParams.append(key, value);
      } else if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    logger.info(`Fetching products from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    logger.info(`Fetched ${data.products.length} products`);
    return data.products;
  } catch (error) {
    logger.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch best-selling products from the API
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Array>} - Array of best-selling product objects
 */
export const fetchBestSellingProducts = async (forceRefresh = false) => {
  return fetchProducts({ isBest: 'true' }, forceRefresh);
};

/**
 * Fetch new arrivals products from the API
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Array>} - Array of new arrivals product objects
 */
export const fetchNewArrivalsProducts = async (forceRefresh = false) => {
  return fetchProducts({ isNew: 'true' }, forceRefresh);
};

/**
 * Fetch a product by ID from the API
 * @param {string} id - Product ID
 * @returns {Promise<Object>} - Product object with all details
 */
export const fetchProductById = async (id) => {
  try {
    const url = `${API_BASE_URL}/products/${id}`;
    logger.info(`Fetching product from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product with ID: ${id}`);
    }
    
    const data = await response.json();
    logger.info(`Fetched product with ID: ${id}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching product with ID: ${id}:`, error);
    throw error;
  }
};

// Authentication APIs
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${config.apiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to create user' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    return { error: 'Failed to connect to the server' };
  }
};

export const verifyPhone = async (verificationData) => {
  try {
    const response = await fetch(`${config.apiUrl}/users/verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to verify phone number' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying phone:', error);
    return { error: 'Failed to connect to the server' };
  }
};

export const resendOTP = async (phone) => {
  try {
    const response = await fetch(`${config.apiUrl}/users/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to resend verification code' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error resending OTP:', error);
    return { error: 'Failed to connect to the server' };
  }
};

export const checkUserExists = async (phone) => {
  try {
    const response = await fetch(`${config.apiUrl}/users/check-exists?phone=${encodeURIComponent(phone)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to check user' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking user:', error);
    return { error: 'Failed to connect to the server' };
  }
};

/**
 * Get the current user's cart
 * @returns {Promise<Object>} - Cart object with items, total, and user info
 */
export const getCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const url = `${API_BASE_URL}/users/cart`;
    logger.info(`Fetching cart from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    
    const data = await response.json();
    logger.info(`Fetched cart with ${data.data.itemCount} items`);
    return data.data;
  } catch (error) {
    logger.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Fetches user profile data
 * @returns {Promise<Object>} User data with name, phone, and dateOfBirth
 */
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    logger.info('Fetching user profile data');
    
    // Fetch user data from the correct API endpoint
    const url = `${API_BASE_URL}/users/profile`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const data = await response.json();
    logger.info('Fetched user profile data successfully');
    
    // Extract only the needed fields
    return {
      name: data.name,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth
    };
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    
    // Provide fallback data in case of error
    logger.warn('Using fallback user data due to error');
    return {
      name: 'John',
      phone: '+91 9876543210',
      dateOfBirth: null
    };
  }
};

/**
 * Fetches user addresses
 * @returns {Promise<Array>} Array of addresses
 */
export const getUserAddresses = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/addresses`;
    logger.info(`Fetching user addresses from: ${url}`);
    
    // Use native fetch
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }
    
    const data = await response.json();
    logger.info(`Fetched ${data.length} user addresses`);
    return data;
  } catch (error) {
    logger.error('Error fetching user addresses:', error);
    throw error;
  }
};

/**
 * Updates an existing address
 * @param {string} addressId - The ID of the address to update
 * @param {Object} addressData - The updated address data
 * @returns {Promise<Object>} Updated address
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/addresses/${addressId}`;
    logger.info(`Updating address at: ${url}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to update address');
    }
    
    const data = await response.json();
    logger.info(`Updated address with ID: ${addressId}`);
    return data;
  } catch (error) {
    logger.error('Error updating address:', error);
    throw error;
  }
};

/**
 * Creates a new address
 * @param {Object} addressData - The address data
 * @returns {Promise<Object>} Created address
 */
export const createAddress = async (addressData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/addresses`;
    logger.info(`Creating new address at: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to add address');
    }
    
    const data = await response.json();
    logger.info('Created new address successfully');
    return data;
  } catch (error) {
    logger.error('Error creating address:', error);
    throw error;
  }
};

/**
 * Sets an address as default
 * @param {string} addressId - The ID of the address to set as default
 * @returns {Promise<Object>} Updated address
 */
export const setAddressAsDefault = async (addressId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/addresses/${addressId}/set-default`;
    logger.info(`Setting address as default at: ${url}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to set default address');
    }
    
    const data = await response.json();
    logger.info(`Set address ${addressId} as default`);
    return data;
  } catch (error) {
    logger.error('Error setting default address:', error);
    throw error;
  }
};

/**
 * Deletes an address
 * @param {string} addressId - The ID of the address to delete
 * @returns {Promise<void>}
 */
export const deleteAddress = async (addressId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/addresses/${addressId}`;
    logger.info(`Deleting address at: ${url}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete address');
    }
    
    logger.info(`Deleted address with ID: ${addressId}`);
  } catch (error) {
    logger.error('Error deleting address:', error);
    throw error;
  }
};

/**
 * Update the cart with new items
 * @param {Array} items - Array of items to add to cart
 * @returns {Promise<Object>} - Updated cart data
 */
export const updateCart = async (items) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const url = `${API_BASE_URL}/users/cart`;
    logger.info(`Updating cart at: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items }),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to update cart');
    }
    
    const data = await response.json();
    logger.info(`Updated cart with ${data.data.itemCount} items`);
    return data.data;
  } catch (error) {
    logger.error('Error updating cart:', error);
    throw error;
  }
};

export const deprecatedClearCartAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const url = `${API_BASE_URL}/users/cart`;
    logger.info(`Clearing cart at: ${url}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
    
    const data = await response.json();
    logger.info('Cart cleared successfully');
    return data.data;
  } catch (error) {
    logger.error('Error clearing cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    logger.info('Attempting to clear the cart via API');
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (!token) {
      logger.warn('No token found, cannot clear cart');
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/users/cart`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to clear cart and could not parse error response' }));
      logger.error('Failed to clear cart:', response.status, errorData);
      throw new Error(errorData.message || 'Failed to clear cart');
    }

    const data = await response.json();
    logger.info('Cart cleared successfully', data);
    return data; // Return the response data which includes the now empty cart
  } catch (error) {
    logger.error('Error clearing cart:', error);
    // Re-throw the error so it can be caught by the calling function if needed
    throw error;
  }
};

/**
 * Create a new review for a product
 * @param {Object} reviewData - Contains rating, comment, productId
 * @returns {Promise<Object>} - Created review object
 */
export const createReview = async (reviewData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Get userId from token
    let userId;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id || payload.userId || payload.sub;
      if (!userId) {
        throw new Error('User ID not found in token');
      }
    } catch (error) {
      throw new Error('Invalid authentication token');
    }

    // Format the data as expected by the API
    const formattedData = {
      rating: reviewData.rating,
      comment: reviewData.comment,
      productId: reviewData.productId,
      userId: userId
    };

    const url = `${API_BASE_URL}/reviews`;
    logger.info(`Creating review at: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formattedData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to create review');
    }

    const data = await response.json();
    logger.info(`Created review with ID: ${data.id}`);
    return data;
  } catch (error) {
    logger.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Fetch Instagram posts from the API
 * @returns {Promise<Array>} - Array of Instagram post objects
 */
export const fetchInstagramPosts = async () => {
  try {
    const url = `${API_BASE_URL}/instagram`;
    logger.info(`Fetching Instagram posts from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      logger.warn(`Instagram API returned status ${response.status}`);
      return []; // Return empty array instead of throwing error
    }
    
    const data = await response.json();
    
    // Check if data is an array, and log appropriate message
    if (Array.isArray(data)) {
      logger.info(`Fetched ${data.length} Instagram posts`);
      return data;
    } else {
      // If response is not an array, try to handle common API response formats
      if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          // Handle {data: [...]} format
          logger.info(`Fetched ${data.data.length} Instagram posts from data property`);
          return data.data;
        } else if (data.posts && Array.isArray(data.posts)) {
          // Handle {posts: [...]} format
          logger.info(`Fetched ${data.posts.length} Instagram posts from posts property`);
          return data.posts;
        } else if (data.items && Array.isArray(data.items)) {
          // Handle {items: [...]} format
          logger.info(`Fetched ${data.items.length} Instagram posts from items property`);
          return data.items;
        }
      }
      
      // If we couldn't find an array in the response, log and return an empty array
      logger.warn('Instagram API did not return an array. Got:', typeof data, data);
      return [];
    }
  } catch (error) {
    logger.error('Error fetching Instagram posts:', error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Fetch reviews for a specific product
 * @param {string} productId - The ID of the product to get reviews for
 * @returns {Promise<Array>} - Array of review objects
 */
export const fetchProductReviews = async (productId) => {
  try {
    const url = `${config.apiUrl}/reviews/product/${productId}`;
    logger.info(`Fetching product reviews from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews for product: ${productId}`);
    }
    
    const data = await response.json();
    logger.info(`Fetched ${data.length} reviews for product: ${productId}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching reviews for product ${productId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Calculate average rating from an array of reviews
 * @param {Array} reviews - Array of review objects with rating property
 * @returns {number} - Average rating (0 if no reviews)
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || !reviews.length) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

/**
 * Fetch summer collection data from the API
 * @returns {Promise<Object>} - Summer collection object with title, description, etc.
 */
export const fetchSummerCollection = async () => {
  try {
    const url = `${config.apiUrl}/summer-collection`;
    logger.info(`Fetching summer collection from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch summer collection');
    }
    
    const responseData = await response.json();
    logger.info('Fetched summer collection data successfully');
    
    // Return the data nested under the 'data' field in the response
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // Fallback to returning the direct response if it doesn't match the expected format
    return responseData;
  } catch (error) {
    logger.error('Error fetching summer collection:', error);
    // Return fallback data in case of error
    return {
      title: 'The Summer Collection',
      description: 'Introducing our summer collection - a celebration of light fabrics and vibrant designs.',
      additionalText: 'Experience the perfect blend of traditional craftsmanship and contemporary design.',
      buttonText: 'Explore Collection',
      image: 'https://firebasestorage.googleapis.com/v0/b/draftai-b5cb9.appspot.com/o/Demo%2FWhatsApp%20Image%202025-04-25%20at%206.08.19%20PM.jpeg?alt=media&token=c41b0f44-3b83-4fa3-adba-ee4e9f9ab0aa',
      categoryId: '4f103d06-71e9-40d8-9c3b-caef0dc5e22c',
      badgeYear: '2027',
      badgeText: 'SUMMER COLLECTION',
      category: {
        id: '4f103d06-71e9-40d8-9c3b-caef0dc5e22c',
        name: 'Traditional Wear',
        image: 'https://firebasestorage.googleapis.com/v0/b/draftai-b5cb9.appspot.com/o/Demo%2FWhatsApp%20Image%202025-04-25%20at%208.43.59%20PM.jpeg?alt=media&token=8474baff-2547-443f-958a-e9a7b6dd208d',
        type: 'featured'
      }
    };
  }
};

/**
 * Creates a new order
 * @param {Object} orderData - Order data including items, addressId, paymentMethod, etc.
 * @returns {Promise<Object>} - Created order object
 */
export const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/orders`;
    logger.info(`Creating new order at: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }
    
    const data = await response.json();
    logger.info(`Created order with ID: ${data.id}`);
    return data;
  } catch (error) {
    logger.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Create a COD (Cash on Delivery) payment
 * @param {Object} paymentData - Payment data including orderId, amount, and currency
 * @returns {Promise<Object>} - Created payment object
 */
export const createCODPayment = async (paymentData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/payments/cod`;
    logger.info(`Creating COD payment at: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create COD payment');
    }
    
    const data = await response.json();
    logger.info(`Created COD payment with ID: ${data.payment.id}`);
    return data;
  } catch (error) {
    logger.error('Error creating COD payment:', error);
    throw error;
  }
};

/**
 * Create a Razorpay payment order
 * @param {Object} paymentData - Payment data including orderId, amount, and currency
 * @returns {Promise<Object>} - Created payment object with Razorpay order details
 */
export const createRazorpayPayment = async (paymentData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/payments`;
    logger.info(`Creating Razorpay payment at: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create Razorpay payment');
    }
    
    const data = await response.json();
    logger.info(`Created Razorpay payment with ID: ${data.payment.id}`);
    return data;
  } catch (error) {
    logger.error('Error creating Razorpay payment:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment after completion
 * @param {Object} verificationData - Verification data including razorpayOrderId, razorpayPaymentId, and razorpaySignature
 * @returns {Promise<Object>} - Verified payment details
 */
export const verifyRazorpayPayment = async (verificationData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/payments/verify`;
    logger.info(`Verifying Razorpay payment at: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(verificationData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment');
    }
    
    const data = await response.json();
    logger.info(`Verified payment successfully`);
    return data;
  } catch (error) {
    logger.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Fetch all orders for the current user
 * @param {Object} options - Options for pagination
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of orders per page
 * @returns {Promise<Object>} - List of orders with pagination info
 */
export const fetchMyOrders = async (options = { page: 1, limit: 10 }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/orders/myorders?page=${options.page}&limit=${options.limit}`;
    logger.info(`Fetching orders from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const data = await response.json();
    logger.info(`Fetched ${data.orders.length} orders`);
    return data;
  } catch (error) {
    logger.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Fetch a specific order by ID
 * @param {string} orderId - ID of the order to fetch
 * @returns {Promise<Object>} - Order details
 */
export const fetchOrderById = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const url = `${API_BASE_URL}/orders/${orderId}`;
    logger.info(`Fetching order details from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order with ID: ${orderId}`);
    }
    
    const data = await response.json();
    logger.info(`Fetched order details for order: ${orderId}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};