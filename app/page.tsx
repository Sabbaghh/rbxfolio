'use client';

import { useState, useEffect, useRef } from 'react';
import { GameCard } from '@/components/game-card';
import { MediaCarousel } from '@/components/media-carousel';
import { MiniGame } from '@/components/mini-game';
import { ContactButton } from '@/components/contact-button';
import { RobloxCharacter3D } from '@/components/roblox-character-3d';
import { Button } from '@/components/ui/button'; // Added for social buttons
import {
  ParallaxSection,
  ParallaxBackground,
} from '@/components/parallax-section';
import { Sparkles, Code2, Users } from 'lucide-react';

import gamesData from '@/data/games.json';
import mediaData from '@/data/media.json';

// --- ICONS (Moved from Header) ---
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

// Interface matches your new data structure
interface Game {
  id: string;
  title: string;
  studio: string;
  thumbnail: string;
  link: string;
  peakCCU: string;
  visits: string;
}

export default function HomePage() {
  // --- SECTION TRACKING ---
  const [activeSection, setActiveSection] = useState(0);

  // Refs for tracking visibility
  const heroRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const miniGameRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The order here MUST match SECTION_DATA in RobloxCharacter3D
    const sections = [
      heroRef.current, // Index 0
      workRef.current, // Index 1
      miniGameRef.current, // Index 2
      mediaRef.current, // Index 3
      ctaRef.current, // Index 4
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target as any);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      },
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header Removed */}

      <main className="relative">
        {/* Hero Section with Parallax */}
        <ParallaxBackground className="border-b border-border min-h-screen flex items-center md:pl-20">
          <div
            ref={heroRef}
            className="container mx-auto px-4 py-16 md:py-24 relative"
          >
            {/* 2-Column Grid (Left: Content, Right: Empty/Character) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
              {/* --- LEFT COLUMN: CONTENT --- */}
              <div className="flex flex-col justify-center text-center lg:text-left z-10">
                <ParallaxSection speed={0.2} direction="down">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6 animate-pulse mx-auto lg:mx-0">
                    <Sparkles className="h-4 w-4" />
                    <span>Available for new projects</span>
                  </div>
                </ParallaxSection>

                <ParallaxSection speed={0.1}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                    Hi I'm{' '}
                    <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                      Sabbz
                    </span>{' '}
                  </h1>
                </ParallaxSection>

                <ParallaxSection speed={0.15}>
                  <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Roblox scripter specializing in frotnend development, I turn
                    game design documents into polished, launch-ready Roblox
                    games.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                    <ContactButton />

                    {/* --- Social Buttons Added Here --- */}
                    <div className="flex items-center gap-2">
                      <a
                        href="https://x.com/afsdev9" // Update with your actual link
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <XIcon className="h-5 w-5" />
                          <span className="sr-only">X / Twitter</span>
                        </Button>
                      </a>
                      <a
                        href="https://discord.gg/DRevBgGG" // Update with your actual link
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-muted-foreground hover:text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors"
                        >
                          <DiscordIcon className="h-5 w-5" />
                          <span className="sr-only">Discord</span>
                        </Button>
                      </a>
                    </div>
                  </div>
                </ParallaxSection>

                {/* STATS */}
                <div className="mt-12 pt-8 border-t border-border/50">
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { icon: Code2, label: 'Games', value: '7+' },
                      { icon: Users, label: 'Visits', value: '55M+' },
                      { icon: Sparkles, label: 'Years', value: '6+' },
                    ].map((stat, index) => (
                      <ParallaxSection
                        key={stat.label}
                        speed={0.05 + index * 0.02}
                      >
                        <div className="text-center lg:text-left group">
                          <div className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground mb-1 group-hover:text-primary transition-colors">
                            <stat.icon className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-wider">
                              {stat.label}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-foreground">
                            {stat.value}
                          </div>
                        </div>
                      </ParallaxSection>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN: EMPTY (Reserved for Character) --- */}
              <div className="hidden lg:block h-full min-h-[400px]">
                {/* The RobloxCharacter3D component floats here via fixed positioning logic */}
              </div>
            </div>
          </div>
        </ParallaxBackground>

        {/* Featured Games Section */}
        <section
          ref={workRef}
          className="py-16 md:py-24 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 relative">
            <ParallaxSection speed={0.1}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Featured Work
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Games I&apos;ve made as a scripter
                  </p>
                </div>
              </div>
            </ParallaxSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(gamesData as Game[]).map((game, index) => (
                <ParallaxSection
                  key={game.id}
                  speed={0.03 + (index % 3) * 0.02}
                >
                  {/* No onClick needed, GameCard handles the link internally now */}
                  <GameCard {...game} />
                </ParallaxSection>
              ))}
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section ref={mediaRef} className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Latest Updates
              </h2>
              <p className="text-muted-foreground mt-1">
                Clips and demos from my X feed
              </p>
            </div>

            <MediaCarousel items={mediaData} />
          </div>
        </section>

        {/* Mini Game Section */}
        <section
          ref={miniGameRef}
          className="py-16 md:py-24 bg-secondary/30 border-y border-border"
        >
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Try My Skills
              </h2>
              <p className="text-muted-foreground mt-1">
                A mini-game showcasing game logic, physics, and input handling
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <MiniGame />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="py-16 md:py-60 border-t border-border">
          <div ref={ctaRef} className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to build something{' '}
              <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                amazing
              </span>
              ?
            </h2>

            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Whether you need a complete game, performance optimization, or
              just a second opinion on architecture.
            </p>
            <div className="mt-8">
              <ContactButton />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Sabbz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* 3D Roblox Character */}
      <RobloxCharacter3D activeSection={activeSection} />
    </div>
  );
}
