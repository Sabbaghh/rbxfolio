'use client';

import { useEffect, useRef, useState } from 'react';

export function TweetCard({ tweetId }: { tweetId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if the Twitter script is loaded
    const twttr = (window as any).twttr;
    if (!twttr?.widgets) return;

    // 2. Clear previous content if React re-renders (prevents duplicates)
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // 3. Programmatically create the tweet
    twttr.widgets
      .createTweet(tweetId, containerRef.current, {
        theme: 'dark', // Matches your site
        dnt: true, // Privacy friendly
        conversation: 'none', // Hides replies for a cleaner look
        cards: 'visible', // ENSURES VIDEOS/IMAGES SHOW
        align: 'center',
      })
      .then(() => {
        setLoading(false);
      });
  }, [tweetId]);

  return (
    <div className="w-full min-h-[300px] flex items-center justify-center">
      {/* Loading Skeleton while Twitter fetches data */}
      {loading && (
        <div className="w-full h-48 bg-secondary/30 rounded-xl animate-pulse flex items-center justify-center text-muted-foreground text-sm">
          Loading Tweet...
        </div>
      )}

      {/* The container where Twitter injects the iframe */}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
