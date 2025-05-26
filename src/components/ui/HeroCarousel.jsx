'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Button from './Button';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const HeroCarousel = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const carouselRef = useRef(null);
  const minSwipeDistance = 50;
  const slideTimerRef = useRef(null);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [slides.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [slides.length, isTransitioning]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleButtonClick = (slide) => {
    let categoryParam;
    if (typeof slide === 'string') {
      categoryParam = `cat-${slide}`;
    } else {
      categoryParam = slide.categoryId || (slide.id && slide.category === 'category' ? `cat-${slide.id}` : `cat-${slide.category}`);
    }
    router.push(`/products?category=${categoryParam}`);
  };

  const handleTouchStart = (e) => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
    }
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      startAutoPlay();
      return;
    }
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
    startAutoPlay();
  };

  const startAutoPlay = useCallback(() => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
    }
    slideTimerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  }, [nextSlide]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
      }
    };
  }, [startAutoPlay]);

  const handleMouseEnter = () => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
    }
  };

  const handleMouseLeave = () => {
    startAutoPlay();
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative h-[85vh] w-full overflow-hidden bg-gray-900 group"
      ref={carouselRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-full w-full">
        <div
          className="absolute inset-0 overflow-hidden transition-opacity duration-300 ease-in-out"
          style={{ opacity: isTransitioning ? 0.5 : 1 }}
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 ease-in-out transform group-hover:scale-105"
            style={{
              backgroundImage: `url(${slides[currentSlide].image})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="max-w-4xl px-4">
              <h2 
                className="font-display text-5xl md:text-7xl text-white mb-3 tracking-tight drop-shadow-lg"
              >
                {slides[currentSlide].title}
              </h2>
              <p 
                className="text-white text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light drop-shadow-sm"
              >
                {slides[currentSlide].description}
              </p>
              <div>
                <Button 
                  variant="white" 
                  className="text-black hover:scale-105 transition-transform duration-300 ease-out shadow-lg"
                  onClick={() => handleButtonClick(slides[currentSlide])}
                >
                  {slides[currentSlide].buttonText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <button 
          onClick={prevSlide} 
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          aria-label="Previous slide"
        >
          <FaChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          aria-label="Next slide"
        >
          <FaChevronRight size={24} />
        </button>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/70 w-2.5'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;