import { create } from 'zustand';
import { fetchPromotions, fetchCategories, fetchSummerCollection } from '@/utils/api';

const useHomeStore = create((set) => ({
  heroSlides: [],
  categories: [],
  summerCollection: null,
  loading: true,
  error: null,

  fetchHomePageData: async () => {
    set({ loading: true, error: null });
    try {
      const [heroSlides, categories, summerCollection] = await Promise.all([
        fetchPromotions(),
        fetchCategories(),
        fetchSummerCollection(),
      ]);

      set({
        heroSlides: heroSlides || [],
        categories: categories || [],
        summerCollection,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching home page data:', error);
      set({ loading: false, error: 'Failed to fetch home page data.' });
    }
  },
}));

export default useHomeStore; 