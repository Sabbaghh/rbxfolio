'use client';

import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmbeddedTweet, TweetSkeleton } from 'react-tweet';
import type { Tweet } from 'react-tweet/api';

interface MediaItem {
  id: string;
  tweetId: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
}

function NormalizedTweet({ id }: { id: string }) {
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tweet/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Tweet) => {
        if (!cancelled) setTweet(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (failed) throw new Error('tweet load failed');
  if (!tweet) return <TweetSkeleton />;
  return <EmbeddedTweet tweet={tweet} />;
}

class TweetErrorBoundary extends Component<
  { children: ReactNode; tweetId: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <a
          href={`https://x.com/i/status/${this.props.tweetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[400px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-secondary/30 p-6 text-center transition-all hover:border-primary/50 hover:bg-secondary/50"
        >
          <ExternalLink className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Tweet unavailable — view on X
          </span>
        </a>
      );
    }
    return this.props.children;
  }
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
            <TweetErrorBoundary tweetId={item.tweetId}>
              <div className="tweet-container-dark">
                <NormalizedTweet id={item.tweetId} />
              </div>
            </TweetErrorBoundary>
          </div>
        ))}

        {/* --- View More Card --- */}
        <a
          href="https://x.com/sabbz2z"
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
