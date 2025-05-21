'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Button from './Button';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const HeroCarousel = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const carouselRef = useRef(null);
  const minSwipeDistance = 50; // Minimum swipe distance to trigger slide change
  const slideTimerRef = useRef(null);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(1);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 800);
  }, [slides.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 800);
  }, [slides.length, isTransitioning]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleButtonClick = (slide) => {
    let categoryParam;
    
    // Check if the slide argument is an object or a string
    if (typeof slide === 'string') {
      // If it's a string, add cat- prefix
      categoryParam = `cat-${slide}`;
    } else {
      // Use categoryId if available, otherwise use id or fallback to category name
      categoryParam = slide.categoryId || (slide.id && slide.category === 'category' ? `cat-${slide.id}` : `cat-${slide.category}`);
    }
    
    router.push(`/products?category=${categoryParam}`);
  };

  // Handle touch events for swipe
  const handleTouchStart = (e) => {
    // Pause autoplay on touch
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
      // Restart autoplay
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
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
    
    // Restart autoplay
    startAutoPlay();
  };

  // Auto-advance slides
  const startAutoPlay = useCallback(() => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
    }
    
    slideTimerRef.current = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds
  }, [nextSlide]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
      }
    };
  }, [startAutoPlay]);

  // Pause autoplay when user hovers over carousel
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

  // Framer Motion variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      }
    })
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5,
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div 
      className="relative h-[85vh] w-full overflow-hidden bg-gray-900"
      ref={carouselRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides */}
      <div className="h-full w-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 overflow-hidden"
          >
            {/* Background image with advanced animation effects */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ scale: 1.1, filter: "blur(8px) brightness(80%)" }}
              animate={{ 
                scale: 1, 
                filter: "blur(0px) brightness(100%)",
                transition: { duration: 1.2, ease: "easeOut" }
              }}
              exit={{ scale: 1.05, filter: "blur(4px) brightness(90%)" }}
            >
              <motion.div 
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${slides[currentSlide].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                animate={{
                  scale: 1.05,
                  transition: { 
                    duration: 10, 
                    ease: "linear",
                  }
                }}
              />
            </motion.div>
            
            {/* Animated overlay layers for visual depth and interest */}
            <div className="absolute inset-0">
              {/* Light sweep effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                initial={{ x: "-100%" }}
                animate={{ 
                  x: "100%",
                  transition: { 
                    duration: 3, 
                    ease: "easeInOut",
                    delay: 0.5,
                  }
                }}
              />
              
              {/* Color tint layer that changes based on image */}
              <motion.div 
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 0.2,
                  transition: { duration: 1 }
                }}
                style={{
                  background: `linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)`
                }}
              />
              
              {/* Gradient overlay for text readability with enhanced animation */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8 } }}
              />
            </div>
            
            {/* Content */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center text-center"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="max-w-4xl px-4">
                <motion.h2 
                  className="font-display text-5xl md:text-7xl text-white mb-3 tracking-tight drop-shadow-lg"
                  variants={itemVariants}
                >
                  {slides[currentSlide].title}
                </motion.h2>
                <motion.p 
                  className="text-white text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light"
                  variants={itemVariants}
                >
                  {slides[currentSlide].description}
                </motion.p>
                <motion.div variants={itemVariants}>
                  <Button 
                    variant="white" 
                    className="text-black hover:scale-105 transition-transform duration-300 ease-out shadow-lg"
                    onClick={() => handleButtonClick(slides[currentSlide])}
                  >
                    {slides[currentSlide].buttonText}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrow Navigation - Enhanced with animations */}
      <div className="hidden md:block">
        {/* Left Arrow */}
        <motion.button 
          onClick={prevSlide} 
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          aria-label="Previous slide"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            transition: { duration: 0.6, delay: 1 }
          }}
        >
          <FaChevronLeft size={24} />
        </motion.button>

        {/* Right Arrow */}
        <motion.button 
          onClick={nextSlide} 
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          aria-label="Next slide"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            transition: { duration: 0.6, delay: 1 }
          }}
        >
          <FaChevronRight size={24} />
        </motion.button>
      </div>

      {/* Enhanced Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-4">
        {slides.map((_, index) => (
          <motion.div
            key={index}
            className="indicator-wrapper"
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: index === currentSlide ? 1.1 : 1,
              transition: { duration: 0.3 }
            }}
          >
            <motion.button
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-12'
                  : 'bg-white/30 hover:bg-white/60 w-3'
              }`}
              whileHover={{ scale: 1.2, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0.6 }}
              animate={{ 
                opacity: index === currentSlide ? 1 : 0.6,
                width: index === currentSlide ? 48 : 12
              }}
              transition={{ duration: 0.3 }}
            ></motion.button>
            {index === currentSlide && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/50"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.4, 1.8],
                  opacity: [0.7, 0.4, 0],
                  transition: { 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;