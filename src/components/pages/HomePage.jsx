'use client';

import { useEffect } from 'react';
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
import { usePromotions } from '@/hooks/usePromotions';
import { useCategories } from '@/hooks/useCategories';
import { useSummerCollection } from '@/hooks/useSummerCollection';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/config';
import { instagramFeed } from '@/constants/data';

const HomePage = () => {
  const queryClient = useQueryClient();
  const { data: heroSlides, isLoading: isHeroLoading, error: heroError } = usePromotions();
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategories();
  const { 
    data: summerCollection, 
    isLoading: isSummerCollectionLoading, 
    error: summerCollectionError,
    refetch: refetchSummerCollection
  } = useSummerCollection();

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
    if (isSummerCollectionLoading) {
      return <LoadingState message="Loading summer collection..." />;
    }
    
    if (summerCollectionError && !summerCollection) {
      return (
        <ErrorState 
          message={`Unable to load summer collection. ${summerCollectionError.message}`} 
          retryFn={refetchSummerCollection}
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