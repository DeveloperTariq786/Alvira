import Link from 'next/link';

const CategorySection = ({ categories }) => {
  // Filter categories by type
  const featuredCategories = categories.filter(cat => cat.type === 'featured');
  const horizontalCategories = categories.filter(cat => cat.type === 'horizontal');
  const smallCategories = categories.filter(cat => cat.type === 'small');

  const CategoryItem = ({ category, height, titleSize = 'text-3xl', mobileTitleSize = '', buttonSize = 'text-sm' }) => (
    <div className={`relative group overflow-hidden ${height}`}>
      <div 
        className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${category.image})` }}
      >
        <div className="absolute inset-0 bg-black/25"></div>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <h3 className={`font-display ${mobileTitleSize || titleSize} md:${titleSize} text-white mb-4`}>{category.name}</h3>
        
        <Link 
          href={`/products?category=${category.id || category.name.toLowerCase().replace(/ /g, '-')}`}
          className={`inline-block px-6 py-2 bg-white text-black font-medium ${buttonSize} uppercase tracking-widest transition-colors group-hover:bg-[#d4b78f] group-hover:text-white`}
        >
          EXPLORE
        </Link>
      </div>
    </div>
  );

  return (
    <section className="py-10 md:py-16 px-4 bg-[#f9f7f5]">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-center font-display text-3xl md:text-4xl text-black mb-6 md:mb-10">Shop by Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Featured categories - List on mobile, 2 columns on desktop */}
          <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {featuredCategories.map((category, index) => (
              <div key={index} className="col-span-1">
                <CategoryItem 
                  category={category} 
                  height="h-[450px]"
                  titleSize="text-3xl"
                  mobileTitleSize="text-2xl"
                />
              </div>
            ))}
          </div>

          {/* Right side - Horizontal and Small Categories */}
          <div className="md:col-span-6 grid grid-rows-[auto_1fr] gap-4 md:gap-6">
            {/* Horizontal categories - wider but shorter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {horizontalCategories.map((category, index) => (
                <div key={index} className="col-span-1">
                  <CategoryItem 
                    category={category} 
                    height="h-[200px]"
                    titleSize="text-2xl"
                    mobileTitleSize="text-xl"
                    buttonSize="text-xs"
                  />
                </div>
              ))}
            </div>
            
            {/* Small categories - stack vertically */}
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {smallCategories.map((category, index) => (
                <CategoryItem 
                  key={index}
                  category={category} 
                  height="h-[140px]"
                  titleSize="text-2xl"
                  mobileTitleSize="text-xl"
                  buttonSize="text-xs"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;