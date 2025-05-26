import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/utils/api';
import { logger } from '@/utils/config';
import { newArrivalsProducts, bestsellers } from '@/constants/data'; // For fallback

export const useProducts = (filters) => {
  return useQuery({
    queryKey: ['products', filters], // Include filters in queryKey for unique caching
    queryFn: async () => {
      try {
        logger.info('Fetching products with filters:', filters);
        const apiProducts = await fetchProducts(filters);

        if (apiProducts && apiProducts.length > 0) {
          logger.info(`Successfully loaded ${apiProducts.length} products from API`);
          return apiProducts;
        }
        
        logger.info('No products found in API, attempting to use fallback data based on filters');
        // Fallback logic similar to the original page, but more generalized
        let fallbackData = [...newArrivalsProducts, ...bestsellers.items];
        if (filters && filters.category && filters.category !== 'all') {
          const cleanCategoryFilter = filters.category.startsWith('cat-') 
            ? filters.category.substring(4) 
            : filters.category;

          fallbackData = fallbackData.filter(product => 
            product.category === cleanCategoryFilter || 
            (product.category && product.category.toLowerCase().includes(cleanCategoryFilter.toLowerCase())) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(cleanCategoryFilter.toLowerCase())))
          );
        }
        logger.info(`Using ${fallbackData.length} fallback products after filtering`);
        return fallbackData; // Return filtered fallback data

      } catch (error) {
        logger.error('Failed to fetch products in useProducts hook:', error);
        // Attempt to return fallback data even on API error
        logger.warn('API error, attempting to use fallback data based on filters');
        let fallbackDataOnError = [...newArrivalsProducts, ...bestsellers.items];
        if (filters && filters.category && filters.category !== 'all') {
            const cleanCategoryFilter = filters.category.startsWith('cat-') 
            ? filters.category.substring(4) 
            : filters.category;

            fallbackDataOnError = fallbackDataOnError.filter(product => 
                product.category === cleanCategoryFilter || 
                (product.category && product.category.toLowerCase().includes(cleanCategoryFilter.toLowerCase())) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(cleanCategoryFilter.toLowerCase())))
            );
        }
        logger.info(`Using ${fallbackDataOnError.length} fallback products after API error`);
        if (fallbackDataOnError.length > 0) return fallbackDataOnError;
        
        throw error; // Re-throw if no fallback data is suitable or if you want React Query to handle the error state primarily
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes, adjust as per data volatility
    cacheTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      if (error.status === 429) return false;
      return failureCount < 2; // Retry up to 2 times
    },
    // refetchOnWindowFocus: false, // Consider this if data doesn't change frequently
    // keepPreviousData: true, // Useful for pagination or when filters change to avoid UI jumps
  });
};
