'use client';

import Image from 'next/image';
import { Users, Eye } from 'lucide-react'; // Icons for stats

interface GameCardProps {
  title: string;
  studio: string;
  thumbnail: string;
  link: string;
  peakCCU: string;
  visits: string;
}

export function GameCard({
  title,
  studio,
  thumbnail,
  link,
  peakCCU,
  visits,
}: GameCardProps) {
  const handleClick = () => {
    window.open(link, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="group relative w-full overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary text-left"
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={thumbnail || '/placeholder.svg'}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Content Section */}
      <div className="p-4 relative">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{studio}</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-neon-blue" />
            <span>
              Peak: <span className="text-foreground">{peakCCU}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-neon-pink" />
            <span>
              Visits: <span className="text-foreground">{visits}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
      </div>
    </button>
  );
}
