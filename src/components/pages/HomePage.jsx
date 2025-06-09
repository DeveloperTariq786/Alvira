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
import useHomeStore from '@/store/home';
import { instagramFeed } from '@/constants/data';

const HomePage = () => {
  const {
    heroSlides,
    categories,
    summerCollection,
    loading,
    error,
    fetchHomePageData,
  } = useHomeStore();

  useEffect(() => {
    fetchHomePageData();
  }, [fetchHomePageData]);

  const renderHeroSection = () => {
    if (loading && !heroSlides.length) {
      return <HeroCarouselSkeleton />;
    }
    
    if (error && !heroSlides.length) {
      return (
        <ErrorState 
          message="Unable to load featured collections." 
          retryFn={fetchHomePageData} 
        />
      );
    }
    
    return heroSlides?.length > 0 ? <HeroCarousel slides={heroSlides} /> : null;
  };

  const renderCategorySection = () => {
    if (loading && !categories.length) {
      return <CategorySkeleton />;
    }
    
    if (error && !categories.length) {
      return (
        <ErrorState 
          message="Unable to load categories."
          retryFn={fetchHomePageData}
        />
      );
    }
    
    return categories?.length > 0 ? <CategorySection categories={categories} /> : null;
  };

  const renderSummerCollection = () => {
    if (loading && !summerCollection) {
      return <LoadingState message="Loading summer collection..." />;
    }
    
    if (error && !summerCollection) {
      return (
        <ErrorState 
          message="Unable to load summer collection." 
          retryFn={fetchHomePageData}
        />
      );
    }
    
    return summerCollection && <SummerCollectionSection collection={summerCollection} />;
  };

  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-16">
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