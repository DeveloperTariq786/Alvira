'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import StarRating from '@/components/ui/StarRating';
import Image from 'next/image';

const BestsellersSection = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const { title, description, items } = data;

  // Rotate to previous item
  const prevItem = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  // Rotate to next item
  const nextItem = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Open modal with selected image
  const openImageModal = (imageSrc, e) => {
    e.stopPropagation(); // Prevent triggering parent onClick events
    setSelectedImage(imageSrc);
    setModalOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Handle zooming with mouse wheel
  const handleWheel = (e) => {
    if (!modalOpen) return;
    e.preventDefault();
    
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 4);
    setScale(newScale);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setPosition({
      x: position.x + dx,
      y: position.y + dy
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset zoom
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom in
  const zoomIn = (e) => {
    e.stopPropagation();
    setScale(Math.min(scale + 0.5, 4));
  };

  // Zoom out
  const zoomOut = (e) => {
    e.stopPropagation();
    setScale(Math.max(0.5, scale - 0.5));
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Add wheel event listener to the container when modal is open
    const container = imageContainerRef.current;
    if (modalOpen && container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      document.body.style.overflow = 'auto'; // Ensure scrolling is re-enabled on unmount
    };
  }, [modalOpen, handleWheel]);

  // Add mouse event listeners for drag when isDragging changes
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white">
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '20px'
          }}
        ></div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Heading section with gold accent */}
        <div className="flex flex-col items-center mb-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#d4b78f] blur-xl opacity-60"></div>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4 text-center">
            {title}
          </h2>
          <div className="w-20 h-1 bg-[#d4b78f] mb-4"></div>
          <p className="text-gray-300 max-w-2xl text-center text-base md:text-lg">
            {description}
          </p>
        </div>

        {/* Circular showcase */}
        <div className="relative h-[500px] md:h-[600px]">
          {/* The circular track */}
          <div className="hidden md:block absolute left-1/2 top-1/2 w-[550px] h-[550px] rounded-full border border-[#d4b78f]/20 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Products positioned in circular formation for desktop */}
          <div className="hidden md:block">
            {items.map((item, index) => {
              // Calculate position on circle
              const isActive = index === activeIndex;
              const angle = ((2 * Math.PI) / items.length) * index - Math.PI / 2;
              const radius = 250; // Circle radius
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div
                  key={item.id}
                  className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out ${
                    isActive ? 'scale-110 z-20' : 'scale-90 opacity-60 z-10'
                  }`}
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${isActive ? 1.1 : 0.9})`,
                  }}
                >
                  <div 
                    className={`w-40 h-40 rounded-full bg-cover bg-center cursor-pointer ring-4 ${
                      isActive ? 'ring-[#d4b78f]' : 'ring-white/30'
                    } relative group`} 
                    style={{ backgroundImage: `url(${item.image})` }}
                    onClick={() => setActiveIndex(index)}
                  >
                    {/* Quick view overlay */}
                    <div 
                      className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      onClick={(e) => openImageModal(item.image, e)}
                    >
                      <div className="bg-white/90 text-black text-xs px-2 py-1 rounded-full font-medium">
                        Quick View
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile carousel view */}
          <div className="block md:hidden">
            <div className="flex justify-center mb-8">
              <div 
                className="w-56 h-56 rounded-full bg-cover bg-center ring-4 ring-[#d4b78f] relative group" 
                style={{ backgroundImage: `url(${items[activeIndex].image})` }}
              >
                {/* Quick view overlay for mobile */}
                <div 
                  className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 active:opacity-100 flex items-center justify-center transition-opacity"
                  onClick={(e) => openImageModal(items[activeIndex].image, e)}
                >
                  <div className="bg-white/90 text-black text-xs px-2 py-1 rounded-full font-medium">
                    Quick View
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mb-8">
              {items.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === activeIndex ? 'bg-[#d4b78f]' : 'bg-white/40'
                  }`}
                ></button>
              ))}
            </div>
          </div>

          {/* Featured product details - centered */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-64">
            <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl">
              <h3 className="font-display text-xl text-white mb-1">
                {items[activeIndex].name}
              </h3>
              <div className="flex justify-center my-1">
                <StarRating rating={items[activeIndex].rating} />
              </div>
              <div className="text-[#d4b78f] font-medium mb-1">
                {items[activeIndex].currency}{items[activeIndex].price.toLocaleString()}
              </div>
              <div className="text-[#d4b78f]/80 text-sm mb-4">
                {items[activeIndex].stock}
              </div>
              <Link 
                href={`/products/${items[activeIndex].id}`} 
                className="block w-full py-2 bg-[#d4b78f] text-black text-sm font-medium hover:bg-white transition-colors rounded-md"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevItem}
            className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-[#d4b78f] text-white flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextItem}
            className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-[#d4b78f] text-white flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image Modal with Zoom */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          {/* Image container with zoom functionality */}
          <div 
            ref={imageContainerRef}
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            style={{
              cursor: scale > 1 ? 'move' : 'default'
            }}
          >
            <div
              className="transition-transform duration-150"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center',
                willChange: 'transform'
              }}
            >
              <img 
                src={selectedImage} 
                alt="Product image" 
                className="max-w-full max-h-[85vh] object-contain select-none"
                draggable="false"
              />
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 p-2 rounded-full">
              <button 
                onClick={zoomOut}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white"
                disabled={scale <= 0.5}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button 
                onClick={resetZoom}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
              <button 
                onClick={zoomIn}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white"
                disabled={scale >= 4}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white/80 text-sm">
              {Math.round(scale * 100)}%
            </div>

            {/* Close button */}
            <button 
              className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              onClick={closeModal}
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Zoom instructions */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white/80 text-xs">
              Use mouse wheel to zoom, drag to pan
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BestsellersSection; 