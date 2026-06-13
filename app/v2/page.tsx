'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GameCard } from '@/components/game-card';
import { MediaCarousel } from '@/components/media-carousel';
import { ContactButton } from '@/components/contact-button';
import { Sparkles, Code2, Users } from 'lucide-react';

import gamesData from '@/data/games.json';
import mediaData from '@/data/media.json';

const V2Scene = dynamic(
  () => import('@/components/v2/scene').then((m) => m.V2Scene),
  { ssr: false },
);

interface Game {
  id: string;
  link: string;
  title?: string;
  studio?: string;
  thumbnail?: string;
  peakCCU?: string;
  visits?: string;
  visitsRaw?: number;
}

function formatTotalVisits(n: number): string {
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M+`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`;
  return `${n}`;
}

function parseStat(value: string | undefined): number {
  if (!value) return 0;
  const n = parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

const sortedFallback = [...(gamesData as Game[])].sort(
  (a, b) => parseStat(b.visits) - parseStat(a.visits),
);

const NAV = [
  { id: 'hero', label: 'INTRO' },
  { id: 'work', label: 'WORK' },
  { id: 'planet', label: 'WORLD' },
  { id: 'updates', label: 'UPDATES' },
  { id: 'cta', label: 'CONTACT' },
];

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <p className="font-mono text-xs tracking-[0.3em] text-neon-cyan/80 mb-3">
      {index} <span className="text-muted-foreground">//</span> {title}
    </p>
  );
}

export default function V2Page() {
  const [games, setGames] = useState<Game[]>(sortedFallback);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/games')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Game[] | null) => {
        if (!cancelled && data) setGames(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <V2Scene />

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 z-20 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(196,181,253,0.6) 3px)',
        }}
      />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <p className="font-mono text-sm tracking-[0.25em] text-foreground">
            SABBZ<span className="text-neon-pink">//</span>V2
          </p>
          <Link
            href="/"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/60 rounded-full px-3 py-1.5 backdrop-blur-sm bg-background/30"
          >
            classic site →
          </Link>
        </div>
      </header>

      {/* Dot nav */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-4">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className="group flex items-center gap-2 justify-end"
          >
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {n.label}
            </span>
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 group-hover:bg-neon-pink transition-colors" />
          </a>
        ))}
      </nav>

      <main className="relative z-10">
        {/* 0 — HERO */}
        <section
          id="hero"
          data-v2-section
          className="min-h-screen flex items-center"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <p className="font-mono text-xs text-neon-cyan/80 mb-4">
                {'>'} initializing portfolio_v2 ... <span className="animate-pulse">▊</span>
              </p>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  SABBZ
                </span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Roblox scripter & frontend developer. I turn game design
                documents into polished, launch-ready Roblox games.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ContactButton />
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                {[
                  { icon: Code2, label: 'GAMES', value: `${games.length}+` },
                  {
                    icon: Users,
                    label: 'VISITS',
                    value: formatTotalVisits(
                      games.reduce((sum, g) => sum + (g.visitsRaw ?? 0), 0),
                    ),
                  },
                  { icon: Sparkles, label: 'YEARS', value: '2+' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border/50 bg-background/30 backdrop-blur-sm p-3"
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <stat.icon className="h-3.5 w-3.5" />
                      <span className="font-mono text-[10px] tracking-widest">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 1 — WORK */}
        <section id="work" data-v2-section className="min-h-screen py-28">
          <div className="container mx-auto px-4">
            <SectionLabel index="01" title="FEATURED WORK" />
            <h2 className="text-3xl md:text-4xl font-bold mb-10">
              Games I&apos;ve shipped
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="rounded-xl border border-border/50 bg-background/40 backdrop-blur-md p-1 hover:border-neon-purple/60 transition-colors"
                >
                  <GameCard {...game} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2 — PLANET (mostly visual) */}
        <section
          id="planet"
          data-v2-section
          className="min-h-[160vh] relative"
        >
          <div className="container mx-auto px-4 sticky top-[68vh]">
            <div className="max-w-sm rounded-xl border border-border/50 bg-background/40 backdrop-blur-md p-5">
              <SectionLabel index="02" title="MY WORLD" />
              <p className="text-muted-foreground leading-relaxed text-sm">
                I live on this stuff. Scripting, UI, game loops, optimization —
                one block at a time, around the clock.
              </p>
            </div>
          </div>
        </section>

        {/* 3 — UPDATES */}
        <section id="updates" data-v2-section className="min-h-screen py-28">
          <div className="container mx-auto px-4">
            <SectionLabel index="03" title="LATEST UPDATES" />
            <h2 className="text-3xl md:text-4xl font-bold mb-10">
              Clips & demos from the feed
            </h2>
            <MediaCarousel items={mediaData} />
          </div>
        </section>

        {/* 4 — CTA */}
        <section
          id="cta"
          data-v2-section
          className="min-h-screen flex items-center"
        >
          <div className="container mx-auto px-4 text-center">
            <SectionLabel index="04" title="START A PROJECT" />
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Ready to build something{' '}
              <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                amazing
              </span>
              ?
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              Complete games, performance optimization, or a second opinion on
              architecture.
            </p>
            <div className="mt-9 flex justify-center">
              <ContactButton />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/40 py-8 backdrop-blur-sm bg-background/30">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} SABBZ — ALL RIGHTS RESERVED
          </p>
          <Link
            href="/"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← classic site
          </Link>
        </div>
      </footer>
    </div>
  );
}
