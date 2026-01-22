'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tweet } from 'react-tweet';

// Custom components to style the tweet to match your app's "Neon" vibe
// (react-tweet allows replacing internal parts if needed, but the default is usually great)

interface MediaItem {
  id: string;
  tweetId: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
}

export function MediaCarousel({ items }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400; // Tweets are a bit wider
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group w-full">
      {/* --- Scroll Buttons --- */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hover:bg-background border border-border"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hover:bg-background border border-border"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* --- Carousel Container --- */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 pt-2 px-4 items-start"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[350px] md:w-[400px] snap-center"
          >
            {/* We wrap the Tweet in a div with 'light' or 'dark' class 
               to force the theme if your website uses a specific class strategy.
               Since your site is dark, we ensure the wrapper supports it.
            */}
            <div className="tweet-container-dark">
              <Tweet id={item.tweetId} />
            </div>
          </div>
        ))}

        {/* --- View More Card --- */}
        <a
          href="https://x.com/afsdev9"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-[300px] snap-center flex flex-col"
        >
          {/* Aligned height visually with typical tweet height */}
          <div className="h-[400px] w-full rounded-xl overflow-hidden bg-secondary/30 border border-border transition-all hover:border-primary/50 hover:bg-secondary/50 flex flex-col items-center justify-center gap-4 group/more">
            <div className="p-4 rounded-full bg-background border border-border group-hover/more:scale-110 transition-transform duration-300">
              <ExternalLink className="h-8 w-8 text-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">
              View more on X
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
