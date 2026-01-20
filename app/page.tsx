'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { GameCard } from '@/components/game-card';
import { GameModal } from '@/components/game-modal';
import { MediaCarousel } from '@/components/media-carousel';
import { MiniGame } from '@/components/mini-game';
import { ContactButton } from '@/components/contact-button';
import { RobloxCharacter3D } from '@/components/roblox-character-3d';
import {
  ParallaxSection,
  ParallaxBackground,
} from '@/components/parallax-section';
import { Sparkles, Code2, Zap, Users } from 'lucide-react';

import gamesData from '@/data/games.json';
import mediaData from '@/data/media.json';

interface Game {
  id: string;
  title: string;
  studio: string;
  role: string;
  thumbnail: string;
  banner: string;
  description: string;
  responsibilities: string[];
  systems: string[];
  challenges: string[];
  tools: string[];
}

export default function HomePage() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative">
        {/* Hero Section with Parallax */}
        <ParallaxBackground className="border-b border-border min-h-screen flex items-center">
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            {/* Three-column grid: Left Text | Character Space | Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_1fr] xl:grid-cols-[1fr_400px_1fr] gap-8 lg:gap-4 items-center min-h-[70vh]">
              {/* Left Column - Primary Content */}
              <div className="order-2 lg:order-1 text-center lg:text-left">
                <ParallaxSection speed={0.2} direction="down">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6 animate-pulse">
                    <Sparkles className="h-4 w-4" />
                    <span>Available for new projects</span>
                  </div>
                </ParallaxSection>

                <ParallaxSection speed={0.1}>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                    Building{' '}
                    <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                      immersive
                    </span>{' '}
                    Roblox experiences
                  </h1>
                </ParallaxSection>

                <ParallaxSection speed={0.15}>
                  <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                    Professional scripter specializing in game systems,
                    performance optimization, and multiplayer architecture. I
                    turn game concepts into polished, production-ready
                    experiences.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                    <ContactButton />
                  </div>
                </ParallaxSection>
              </div>

              {/* Center Column - Character Space (character is rendered separately) */}
              <div className="order-1 z-30 lg:order-2 flex justify-center items-center h-[300px] lg:h-[400px]">
                {/* This space is reserved for the 3D character which is rendered via RobloxCharacter3D */}
              </div>

              {/* Right Column - Stats */}
              <div className="order-3 text-center lg:text-right">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Code2, label: 'Games Shipped', value: '15+' },
                    { icon: Users, label: 'Total Players', value: '50M+' },
                    { icon: Zap, label: 'Systems Built', value: '100+' },
                    { icon: Sparkles, label: 'Years Experience', value: '5+' },
                  ].map((stat, index) => (
                    <ParallaxSection
                      key={stat.label}
                      speed={0.05 + index * 0.02}
                    >
                      <div className="text-center group">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1 group-hover:text-primary transition-colors">
                          <stat.icon className="h-4 w-4" />
                          <span className="text-sm">{stat.label}</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-foreground">
                          {stat.value}
                        </div>
                      </div>
                    </ParallaxSection>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ParallaxBackground>

        {/* Featured Games Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Background gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 relative">
            <ParallaxSection speed={0.1}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Featured Work
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Games I&apos;ve contributed to as a scripter
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
                  <GameCard {...game} onClick={() => handleGameClick(game)} />
                </ParallaxSection>
              ))}
            </div>
          </div>
        </section>

        {/* Mini Game Section */}
        <section className="py-16 md:py-24 bg-secondary/30 border-y border-border">
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

        {/* Media Section */}
        <section className="py-16 md:py-24">
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

        {/* CTA Section with Parallax */}
        <ParallaxBackground className="py-16 md:py-24 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <ParallaxSection speed={0.1}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to build something{' '}
                <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                  amazing
                </span>
                ?
              </h2>
            </ParallaxSection>
            <ParallaxSection speed={0.15}>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Whether you need a complete game system, performance
                optimization, or just a second opinion on architecture.
              </p>
              <div className="mt-8">
                <ContactButton />
              </div>
            </ParallaxSection>
          </div>
        </ParallaxBackground>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DevName. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/yourhandle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="sr-only">X / Twitter</span>
              </a>
              <a
                href="https://discord.gg/yourserver"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#5865F2] transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span className="sr-only">Discord</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Game Modal */}
      <GameModal
        game={selectedGame}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* 3D Roblox Character that follows scroll */}
      <RobloxCharacter3D />
    </div>
  );
}
