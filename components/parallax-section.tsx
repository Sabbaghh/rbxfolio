'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const HeroBackground3D = dynamic(
  () =>
    import('@/components/hero-background-3d').then((m) => m.HeroBackground3D),
  { ssr: false },
);

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
      {/* 3D Scene (grid, floating blocks, bloom) */}
      <HeroBackground3D />

      {/* Gradient Layer 1 (Purple/Pink Flow) */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-pink/20 pointer-events-none" />

      {/* Gradient Layer 2 (Top Left Glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none" />

      {/* Gradient Layer 3 (Bottom Right Glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.15),transparent_50%)] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
