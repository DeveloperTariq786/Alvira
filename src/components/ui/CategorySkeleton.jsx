const CategorySkeleton = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      {/* Section header placeholder */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 mx-auto rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Featured Categories (larger size) */}
          {[...Array(2)].map((_, index) => (
            <div key={`featured-${index}`} className="relative overflow-hidden rounded-lg bg-gray-200" style={{ paddingBottom: '133.33%' /* 4:3 aspect ratio */ }}>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              
              {/* Category name placeholder */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-900/60 to-transparent">
                <div className="h-6 w-24 bg-gray-300/50 rounded relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Smaller Categories */}
          {[...Array(2)].map((_, index) => (
            <div key={`small-${index}`} className="relative overflow-hidden rounded-lg bg-gray-200" style={{ paddingBottom: '100%' /* 1:1 aspect ratio */ }}>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              
              {/* Category name placeholder */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-900/60 to-transparent">
                <div className="h-5 w-20 bg-gray-300/50 rounded relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Horizontal Category (spans full width) */}
        <div className="mt-6 relative overflow-hidden rounded-lg bg-gray-200" style={{ paddingBottom: '31.25%' /* 16:5 aspect ratio, adjust to 33.33% for md screens */ }}>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
          
          {/* Category name placeholder */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-900/60 to-transparent">
            <div className="h-6 w-32 bg-gray-300/50 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          </div>
        </div>
        
        {/* Mobile-specific aspect ratio adjustment (hidden on larger screens) */}
        <style jsx>{`
          @media (min-width: 768px) {
            .mt-6 {
              padding-bottom: 33.33%; /* 3:1 aspect ratio for md screens */
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CategorySkeleton; 