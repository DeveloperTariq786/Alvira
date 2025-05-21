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
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
  });
};
