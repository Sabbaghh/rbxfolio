'use client';

import { useEffect, useState } from 'react';
import type { Tweet } from 'react-tweet/api';

interface MediaItem {
  id: string;
  tweetId: string;
}

function useTweetData(id: string) {
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

  return { tweet, failed };
}

function formatStamp(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function formatCount(n: number | undefined) {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

function TweetCardV4({ id }: { id: string }) {
  const { tweet, failed } = useTweetData(id);
  const url = `https://x.com/i/status/${id}`;

  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-40 flex-col items-center justify-center gap-2 border border-white/10 bg-black/60 font-mono text-[10px] tracking-[0.25em] text-white/40 hover:border-red-500/50 transition-colors"
      >
        <span className="text-red-500/80">[SIGNAL LOST]</span>
        <span>VIEW ON X ▸</span>
      </a>
    );
  }

  if (!tweet) {
    return (
      <div className="h-56 border border-white/10 bg-black/60 animate-pulse" />
    );
  }

  const text = tweet.text.replace(/https?:\/\/t\.co\/\S+/g, '').trim();
  const mp4 = tweet.video?.variants
    ?.filter((v) => v.type === 'video/mp4')
    .pop();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-white/10 bg-black/60 backdrop-blur-md hover:border-red-500/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-3.5 py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tweet.user.profile_image_url_https}
          alt={tweet.user.name}
          className="h-7 w-7 border border-white/15"
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-bold text-white">
            {tweet.user.name}
          </p>
          <p className="truncate font-mono text-[10px] tracking-[0.15em] text-white/35">
            @{tweet.user.screen_name}
          </p>
        </div>
        <span className="font-mono text-[10px] tracking-[0.15em] text-white/30">
          {formatStamp(tweet.created_at)}
        </span>
      </div>

      {/* Text */}
      {text && (
        <p className="px-3.5 py-3 text-sm leading-relaxed text-white/80 whitespace-pre-line">
          {text}
        </p>
      )}

      {/* Media */}
      {mp4 ? (
        <video
          src={mp4.src}
          poster={tweet.video?.poster}
          muted
          loop
          autoPlay
          playsInline
          className="w-full border-y border-white/10"
        />
      ) : (
        tweet.photos &&
        tweet.photos.length > 0 && (
          <div
            className={`grid gap-px border-y border-white/10 ${
              tweet.photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {tweet.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.url}
                src={p.url}
                alt=""
                className="w-full object-cover"
              />
            ))}
          </div>
        )
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3.5 py-2.5 font-mono text-[10px] tracking-[0.2em] text-white/40">
        <span>
          ♥ {formatCount(tweet.favorite_count)} — ⊠{' '}
          {formatCount(tweet.conversation_count)}
        </span>
        <span className="text-red-500/80">VIEW ON X ▸</span>
      </div>
    </a>
  );
}

export function TweetGridV4({ items }: { items: MediaItem[] }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid">
      {items.map((item) => (
        <TweetCardV4 key={item.id} id={item.tweetId} />
      ))}
    </div>
  );
}
