import { useQuery } from '@tanstack/react-query';
import { fetchSummerCollection } from '@/utils/api';
import { logger } from '@/utils/config';

export const useSummerCollection = () => {
  return useQuery({
    queryKey: ['summerCollection'],
    queryFn: async () => {
      try {
        const data = await fetchSummerCollection();
        if (data) {
          const formattedData = {
            ...data,
            badge: {
              year: data.badgeYear,
              text: data.badgeText,
            },
          };
          logger.info('Successfully loaded summer collection from API');
          return formattedData;
        }
        logger.info('No summer collection found in API');
        return null;
      } catch (error) {
        logger.error('Failed to fetch summer collection:', error);
        throw error; // Re-throw to let React Query handle the error
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour, adjust as needed
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours, adjust as needed
    retry: (failureCount, error) => {
      // Don't retry rate limit errors
      if (error.status === 429) return false;
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    // Add other configurations as needed, e.g., refetchOnWindowFocus: false
  });
}; 