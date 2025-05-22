'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/utils/api';
import { logger } from '@/utils/config';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const data = await fetchCategories();
        if (data && data.length > 0) {
          logger.info('Successfully loaded categories from API');
          return data;
        }
        logger.info('No categories found in API');
        return [];
      } catch (err) {
        logger.error('Failed to fetch categories:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: (failureCount, error) => {
      // Don't retry if we hit the rate limit
      if (error.status === 429) {
        return false;
      }
      // Only retry 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff with max 30s
  });
};
