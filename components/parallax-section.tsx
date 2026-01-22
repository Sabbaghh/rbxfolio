'use client';

import type { ReactNode } from 'react';

// --- 1. Static Wrapper (Formerly ParallaxSection) ---
// We keep the component name so your HomePage code doesn't break,
// but it now simply renders the children without moving them.
interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // Kept for compatibility, but ignored
  className?: string;
  direction?: 'up' | 'down'; // Kept for compatibility, but ignored
}

export function ParallaxSection({
  children,
  className = '',
}: ParallaxSectionProps) {
  return <div className={`relative ${className}`}>{children}</div>;
}

// --- 2. Static Background (Formerly ParallaxBackground) ---
// Retains the beautiful gradient and grid visuals, but fixed in place.
interface ParallaxBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function ParallaxBackground({
  children,
  className = '',
}: ParallaxBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Gradient Layer 1 (Purple/Pink Flow) */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-pink/20 pointer-events-none" />

      {/* Gradient Layer 2 (Top Left Glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none" />

      {/* Gradient Layer 3 (Bottom Right Glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.15),transparent_50%)] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
