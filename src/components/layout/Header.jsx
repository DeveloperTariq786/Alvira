'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCartItems } from '@/utils/cart';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const items = getCartItems();
      const count = items.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(count);
    };

    // Initial count
    updateCartCount();

    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo and brand section */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-secondary/50 shadow-sm hover:shadow-md transition-all duration-300">
              <Image 
                src="/logo.jpg" 
                alt="Alvira Logo" 
                fill
                sizes="40px"
                className="object-cover scale-105"
                priority
              />
            </div>
          </Link>
          <div className="ml-3 flex flex-col items-center">
            <div className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-wide">ALVIRA</div>
            <div className="text-xs text-gray-600 font-light tracking-wide text-center">A house of hand embroidery</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/#new-arrivals" className="text-black hover:text-secondary transition-colors">
            NEW ARRIVALS
          </Link>
          <Link href="/about" className="text-black hover:text-secondary transition-colors">
            ABOUT
          </Link>
          <Link href="/about#contact" className="text-black hover:text-secondary transition-colors">
            CONTACT
          </Link>
          <Link href="/#summer-collection" className="text-black hover:text-secondary transition-colors">
            NEW COLLECTION
          </Link>
        </nav>

        {/* User Actions - Desktop & Mobile */}
        <div className="flex items-center space-x-5">
          {/* Account Icon */}
          <button aria-label="Account" className="text-black hover:text-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          
          {/* Cart Icon with Badge */}
          <Link href="/cart" className="relative text-black hover:text-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-black ml-1"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pb-4 px-4 shadow-md">
          <nav className="flex flex-col space-y-3 pt-2">
            <Link 
              href="/#new-arrivals" 
              className="text-black hover:text-secondary transition-colors py-2 border-b border-gray-100"
              onClick={closeMenu}
            >
              NEW ARRIVALS
            </Link>
            <Link 
              href="/about" 
              className="text-black hover:text-secondary transition-colors py-2 border-b border-gray-100"
              onClick={closeMenu}
            >
              ABOUT
            </Link>
            <Link 
              href="/about#contact" 
              className="text-black hover:text-secondary transition-colors py-2 border-b border-gray-100"
              onClick={closeMenu}
            >
              CONTACT
            </Link>
            <Link 
              href="/#summer-collection" 
              className="text-black hover:text-secondary transition-colors py-2"
              onClick={closeMenu}
            >
              NEW COLLECTION
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 