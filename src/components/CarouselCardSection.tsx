import React, { useState, ReactNode } from 'react';

interface CarouselCardSectionProps {
  items: {
    key: string;
    component: ReactNode;
  }[];
  className?: string;
}

const CarouselCardSection: React.FC<CarouselCardSectionProps> = ({ items, className }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const goToPrevious = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  if (items.length === 0) {
    return null;
  }

  const getCardStyle = (index: number) => {
    const isActive = index === activeIndex;

    if (isActive) {
      return {
        transform: 'scale(0.9) translateX(0)', // Active card, slightly scaled down for compactness
        zIndex: 10,
        opacity: 1,
        pointerEvents: 'auto',
        filter: 'none',
      };
    } else {
      // For all non-active cards, hide them and place them behind the active one
      return {
        transform: 'scale(0.8) translateX(0)', // Keep them scaled and centered behind
        zIndex: 0,
        opacity: 0, // Fully hide
        pointerEvents: 'none', // Disable interaction
        filter: 'brightness(0.5)', // Optional dimming for effect, even if hidden
      };
    }
  };

  return (
    <div className={`relative flex flex-col justify-center min-h-[700px] md:min-h-0 ${className}`}>
      {/* Container for the stacked cards */}
      <div className="relative flex-grow flex items-center justify-center">
        {items.map((item, index) => (
          <div
            key={item.key}
            className="absolute w-full h-full transition-all duration-300 ease-in-out"
            style={getCardStyle(index)}
          >
            {item.component}
          </div>
        ))}
      </div>

      {/* Navigation buttons are separate, they need a higher z-index to be on top of all cards */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-600 to-gray-500 text-white w-8 h-8 rounded-full z-20 flex items-center justify-center transition-all hover:brightness-125"
            aria-label="Previous item"
          >
            &lt;
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-600 to-gray-500 text-white w-8 h-8 rounded-full z-20 flex items-center justify-center transition-all hover:brightness-125"
            aria-label="Next item"
          >
            &gt;
          </button>
        </>
      )}
    </div>
  );
};

export default CarouselCardSection;
