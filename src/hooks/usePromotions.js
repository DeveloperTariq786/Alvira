'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPromotions } from '@/utils/api';
import { logger } from '@/utils/config';

export const usePromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      try {
        const data = await fetchPromotions();
        if (data && data.length > 0) {
          logger.info('Successfully loaded promotional slides from API');
          return data;
        }
        logger.info('No promotions found in API');
        return [];
      } catch (err) {
        logger.error('Failed to fetch promotions:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
  });
};
