'use client';

import Image from 'next/image';

interface GameCardV4Props {
  link: string;
  title?: string;
  studio?: string;
  thumbnail?: string;
  peakCCU?: string;
  visits?: string;
}

export function GameCardV4({
  title,
  studio,
  thumbnail,
  link,
  peakCCU,
  visits,
}: GameCardV4Props) {
  return (
    <button
      onClick={() => window.open(link, '_blank')}
      className="group relative w-full overflow-hidden border border-white/10 bg-black/60 backdrop-blur-md text-left transition-colors duration-300 hover:border-red-500/60 focus:outline-none focus:border-red-500"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={thumbnail || '/placeholder.svg'}
          alt={title || 'Game'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
        {/* Corner tick */}
        <span className="absolute top-2 left-2 h-3 w-3 border-l border-t border-red-500/70" />
        <span className="absolute top-2 right-2 h-3 w-3 border-r border-t border-red-500/70" />
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-bold text-white leading-tight line-clamp-1 group-hover:text-red-400 transition-colors">
          {title || 'Loading…'}
        </h3>
        <p className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase line-clamp-1">
          {studio || '—'}
        </p>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between font-mono text-[10px] tracking-[0.15em] text-white/40">
          <span>
            CCU <span className="text-white/85">{peakCCU || '—'}</span>
          </span>
          <span>
            VISITS <span className="text-white/85">{visits || '—'}</span>
          </span>
          <span className="text-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity">
            OPEN ▸
          </span>
        </div>
      </div>

      {/* Scan sweep on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-red-500/70 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
