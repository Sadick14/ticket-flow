
'use client';

import { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryFiltersProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const categories = ["All Events", "Nightlife & Parties", "Movies & Cinema", "Arts & Theatre", "Food & Drinks", "Networking", "Travel & Outdoor", "Professional", "Health & Wellness"];

export function CategoryFilters({ activeCategory, setActiveCategory }: CategoryFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div
        ref={scrollRef}
        className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide"
      >
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category)}
            className="flex-shrink-0 rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
