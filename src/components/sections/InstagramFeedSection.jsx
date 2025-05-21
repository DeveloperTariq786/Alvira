'use client';
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchInstagramPosts } from '../../utils/api';

const InstagramFeedSection = ({ data }) => {
  const { username, description } = data;
  const scrollContainerRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching Instagram posts...");
        const fetchedPosts = await fetchInstagramPosts();
        
        // More detailed logging for debugging
        if (!fetchedPosts) {
          console.warn("fetchInstagramPosts returned undefined");
          setPosts([]);
        } else if (!Array.isArray(fetchedPosts)) {
          console.warn("fetchInstagramPosts returned non-array:", typeof fetchedPosts, fetchedPosts);
          setPosts([]);
        } else {
          console.log(`Successfully fetched ${fetchedPosts.length} Instagram posts`);
          setPosts(fetchedPosts);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch Instagram posts:", err);
        setError('Failed to load Instagram posts. Please try again later.');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl text-black mb-4">
            {username}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {isLoading && (
          <div className="relative">
            {/* Shimmer effect for loading state */}
            <div 
              className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {[...Array(5)].map((_, index) => (
                <div 
                  key={`shimmer-${index}`} 
                  className="flex-shrink-0 w-[180px] md:w-[220px] relative overflow-hidden snap-start rounded-xl animate-pulse"
                  style={{ height: 'calc(180px * 16/9)' }}
                >
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && posts && posts.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            <p className="text-gray-600 font-medium text-lg">No Instagram posts to display at the moment.</p>
            <p className="text-gray-500 mt-2">Check back later for our latest content!</p>
          </div>
        )}

        {!isLoading && !error && posts && posts.length > 0 && (
          <div className="relative">
            {/* Scroll controls - Only on desktop */}
            <div className="hidden md:block">
              <button 
                onClick={scrollLeft}
                className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-black hover:bg-[#d4b78f] hover:text-white transition-colors"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={scrollRight}
                className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-black hover:bg-[#d4b78f] hover:text-white transition-colors"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Scrollable container */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4 snap-x scrollbar-hide -mx-4 px-4"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {posts.map((post) => {
                // Handle missing properties in post objects
                if (!post || typeof post !== 'object') {
                  console.warn("Invalid post object:", post);
                  return null;
                }

                const postId = post.id || post.postId || 'unknown';
                const postLink = post.link || '#';
                
                // Extract reel ID from link or use postId as fallback for placeholder
                let reelId;
                try {
                  reelId = postLink.includes('/') ? postLink.split('/').filter(Boolean).pop() : postId;
                } catch (e) {
                  reelId = postId;
                }
                
                // Use actual imageUrl when available, otherwise generate a placeholder
                const placeholderImage = `https://picsum.photos/seed/${reelId}/400/225`;
                const imageUrl = post.imageUrl || placeholderImage;
                
                return (
                  <Link 
                    key={postId}
                    href={postLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[180px] md:w-[220px] group relative overflow-hidden snap-start rounded-xl"
                    style={{ height: 'calc(180px * 16/9)' }} 
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ 
                        backgroundImage: `url(${imageUrl})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {!post.imageUrl && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                          <svg
                            className="w-10 h-10 text-white mb-2 opacity-80"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <span className="text-xs font-medium text-white text-center bg-black/50 px-2 py-1 rounded-full">Instagram Reel</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Instagram overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 group-hover:to-black/80 transition-all duration-300 flex flex-col items-center justify-end p-4">
                      {/* Instagram icon and info */}
                      <div className="flex items-center space-x-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg
                          className="w-6 h-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span className="text-white text-sm">View Reel</span>
                      </div>
                      
                      {/* Reel bottom controls */}
                      <div className="w-full flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex space-x-2">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Custom scrollbar indicator */}
            <div className="mt-6 flex justify-center space-x-1">
              {[...Array(Math.min(5, Math.ceil(posts.length / 2)))].map((_, index) => (
                <div 
                  key={index} 
                  className="w-8 h-1 rounded-full bg-gray-300 hover:bg-[#d4b78f] cursor-pointer transition-colors"
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const scrollWidth = scrollContainerRef.current.scrollWidth;
                      const containerWidth = scrollContainerRef.current.clientWidth;
                      const maxScroll = scrollWidth - containerWidth;
                      const scrollFraction = index / (Math.ceil(posts.length / 2) - 1);
                      scrollContainerRef.current.scrollLeft = maxScroll * scrollFraction;
                    }
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile swipe instruction */}
        <p className="text-center text-gray-400 text-xs mt-4 md:hidden">
          Swipe left to see more
        </p>
      </div>

      {/* Custom CSS to hide scrollbar */}
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Shimmer effect */
        .shimmer-effect {
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.5s infinite;
          background-size: 200% 100%;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </section>
  );
};

export default InstagramFeedSection; 