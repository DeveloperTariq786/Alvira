'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// This component ensures that when we navigate to an anchor link,
// the page scrolls to the correct position accounting for the fixed header
function ScrollToTopContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Function to handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash) {
        // Wait for DOM to be ready
        setTimeout(() => {
          const element = document.getElementById(hash.substring(1));
          
          if (element) {
            // Get header height to offset scroll (account for fixed header)
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            
            // Calculate position
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            
            // Scroll to element
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };
    
    // Handle initial load with hash
    if (window.location.hash) {
      handleHashChange();
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname, searchParams]);
  
  return null;
}

export default function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopContent />
    </Suspense>
  );
} 