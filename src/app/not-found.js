'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Create a client component that uses useSearchParams
const NotFoundContent = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 max-w-md mx-auto">
      <h1 className="text-6xl font-bold text-[#1e2832] mb-4">404</h1>
      <h2 className="text-3xl font-display mb-4 text-black">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/">
        <button className="px-8 py-3 font-medium text-center transition-colors duration-200 rounded-md bg-[#c5a87f] text-white hover:bg-[#b39770]">
          Return to Homepage
        </button>
      </Link>
    </div>
  );
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16">
        <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
          <NotFoundContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
} 