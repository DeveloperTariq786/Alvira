'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from './Button';
import { useRouter } from 'next/navigation';

const HeroCarousel = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleButtonClick = (category) => {
    router.push(`/products?category=${category}`);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [nextSlide]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      {/* Slides */}
      <div className="h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-black/30"></div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="max-w-4xl px-4">
                <h2 className="font-display text-5xl md:text-7xl text-white mb-3">
                  {slide.title}
                </h2>
                <p className="text-white text-lg mb-6 max-w-2xl mx-auto">
                  {slide.description}
                </p>
                <Button 
                  variant="white" 
                  className="text-black"
                  onClick={() => handleButtonClick(slide.category)}
                >
                  {slide.buttonText}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-10'
                : 'bg-white/50 hover:bg-white/80 w-3'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel; 