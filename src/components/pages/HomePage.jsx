'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/ui/HeroCarousel';
import HeroCarouselSkeleton from '@/components/ui/HeroCarouselSkeleton';
import CategorySkeleton from '@/components/ui/CategorySkeleton';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import CategorySection from '@/components/sections/CategorySection';
import NewArrivalsSection from '@/components/sections/NewArrivalsSection';
import SummerCollectionSection from '@/components/sections/SummerCollectionSection';
import BestsellersSection from '@/components/sections/BestsellersSection';
import InstagramFeedSection from '@/components/sections/InstagramFeedSection';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { fetchSummerCollection } from '@/utils/api';
import { usePromotions } from '@/hooks/usePromotions';
import { useCategories } from '@/hooks/useCategories';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/config';
import { instagramFeed } from '@/constants/data';

const HomePage = () => {
  const queryClient = useQueryClient();
  const { data: heroSlides, isLoading: isHeroLoading, error: heroError } = usePromotions();
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategories();
  const [summerCollection, setSummerCollection] = useState(null);
  const [loading, setLoading] = useState({
    summerCollection: true
  });
  const [error, setError] = useState({
    summerCollection: null
  });
  const [retryCount, setRetryCount] = useState({
    summerCollection: 0
  });
  const maxRetries = 3;

  const getSummerCollection = async (isRetry = false) => {
    try {
      setLoading(prev => ({ ...prev, summerCollection: true }));
      setError(prev => ({ ...prev, summerCollection: null }));
      
      if (isRetry) {
        logger.info(`Retrying summer collection API call. Attempt: ${retryCount.summerCollection + 1}/${maxRetries}`);
        setRetryCount(prev => ({ ...prev, summerCollection: prev.summerCollection + 1 }));
      }
      
      const data = await fetchSummerCollection();
      
      if (data) {
        const formattedData = {
          ...data,
          badge: {
            year: data.badgeYear,
            text: data.badgeText
          }
        };
        
        setSummerCollection(formattedData);
        logger.info('Successfully loaded summer collection from API');
      } else {
        setSummerCollection(null);
        logger.info('No summer collection found in API');
      }
    } catch (err) {
      logger.error('Failed to fetch summer collection:', err);
      setError(prev => ({ ...prev, summerCollection: err.message }));
      setSummerCollection(null);
    } finally {
      setLoading(prev => ({ ...prev, summerCollection: false }));
    }
  };

  const handleRetrySummerCollection = () => {
    if (retryCount.summerCollection < maxRetries) {
      getSummerCollection(true);
    } else {
      logger.warn('Max retry attempts reached for summer collection');
      setError(prev => ({ 
        ...prev, 
        summerCollection: 'Could not connect to the server after multiple attempts.' 
      }));
    }
  };

  useEffect(() => {
    getSummerCollection();
    setRetryCount({
      summerCollection: 0
    });
  }, []);

  const renderHeroSection = () => {
    if (isHeroLoading) {
      return <HeroCarouselSkeleton />;
    }
    
    if (heroError) {
      return (
        <ErrorState 
          message={`Unable to load featured collections. ${heroError.message}`} 
          retryFn={() => queryClient.invalidateQueries(['promotions'])} 
        />
      );
    }
    
    return heroSlides?.length > 0 ? <HeroCarousel slides={heroSlides} /> : null;
  };

  const renderCategorySection = () => {
    if (isCategoriesLoading) {
      return <CategorySkeleton />;
    }
    
    if (categoriesError) {
      return (
        <ErrorState 
          message={`Unable to load categories. ${categoriesError.message}`} 
          retryFn={() => queryClient.invalidateQueries(['categories'])} 
        />
      );
    }
    
    return categories?.length > 0 ? <CategorySection categories={categories} /> : null;
  };

  const renderSummerCollection = () => {
    if (loading.summerCollection) {
      return <LoadingState message="Loading summer collection..." />;
    }
    
    if (error.summerCollection && !summerCollection) {
      return (
        <ErrorState 
          message={`Unable to load summer collection. ${error.summerCollection}`} 
          retryFn={handleRetrySummerCollection} 
        />
      );
    }
    
    return summerCollection && <SummerCollectionSection collection={summerCollection} />;
  };

  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-16"> {/* Add padding-top to account for fixed header */}
        {renderHeroSection()}
      </section>
      {renderCategorySection()}
      <NewArrivalsSection />
      {renderSummerCollection()}
      <BestsellersSection />
      <InstagramFeedSection data={instagramFeed} />
      <Footer />
      <WhatsAppButton />
    </main>
  );
};

export default HomePage;