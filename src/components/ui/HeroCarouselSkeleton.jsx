const HeroCarouselSkeleton = () => {
  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-gray-200">
      <div className="absolute inset-0 overflow-hidden">
        <div className="relative h-full w-full">
          {/* Main background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>
          
          {/* Shimmer effect animation overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
          
          {/* Content placeholders */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-4xl px-4">
              {/* Title placeholder */}
              <div className="h-14 w-3/5 bg-gray-300 mx-auto mb-6 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
              
              {/* Description placeholder */}
              <div className="h-6 w-4/5 bg-gray-300 mx-auto mb-3 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
              <div className="h-6 w-3/5 bg-gray-300 mx-auto mb-6 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
              
              {/* Button placeholder */}
              <div className="h-12 w-40 bg-gray-300 mx-auto rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation dots placeholder */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
        {[...Array(3)].map((_, index) => (
          <div 
            key={index}
            className={`h-3 rounded-full bg-gray-300 ${index === 0 ? 'w-10' : 'w-3'} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarouselSkeleton; 