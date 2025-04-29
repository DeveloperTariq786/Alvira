'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/ui/HeroCarousel';
import CategorySection from '@/components/sections/CategorySection';
import NewArrivalsSection from '@/components/sections/NewArrivalsSection';
import SummerCollectionSection from '@/components/sections/SummerCollectionSection';
import BestsellersSection from '@/components/sections/BestsellersSection';
import InstagramFeedSection from '@/components/sections/InstagramFeedSection';
import { 
  heroSlides, 
  categories, 
  newArrivalsProducts, 
  summerCollection, 
  bestsellers,
  instagramFeed
} from '@/constants/data';

const HomePage = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-16"> {/* Add padding-top to account for fixed header */}
        <HeroCarousel slides={heroSlides} />
      </section>
      <CategorySection categories={categories} />
      <NewArrivalsSection products={newArrivalsProducts} />
      <SummerCollectionSection collection={summerCollection} />
      <BestsellersSection data={bestsellers} />
      <InstagramFeedSection data={instagramFeed} />
      <Footer />
    </main>
  );
};

export default HomePage; 