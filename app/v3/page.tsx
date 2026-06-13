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

const V3Scene = dynamic(
  () => import('@/components/v3/scene').then((m) => m.V3Scene),
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
  { id: 'hero', label: 'Home' },
  { id: 'work', label: 'Games' },
  { id: 'planet', label: 'World' },
  { id: 'updates', label: 'Updates' },
  { id: 'cta', label: 'Contact' },
];

function SectionBadge({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/85 border-2 border-slate-900/10 px-4 py-1.5 shadow-sm mb-4">
      <span>{emoji}</span>
      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
        {title}
      </span>
    </div>
  );
}

export default function V3Page() {
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
    <div className="min-h-screen overflow-x-hidden text-slate-900">
      <V3Scene />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <p className="rounded-xl bg-white/85 border-2 border-slate-900/10 px-4 py-2 text-sm font-extrabold tracking-wide shadow-sm">
            🧱 SABBZ
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/v2"
              className="rounded-xl bg-white/70 border-2 border-slate-900/10 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-colors shadow-sm"
            >
              neon v2
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-white/70 border-2 border-slate-900/10 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-colors shadow-sm"
            >
              classic
            </Link>
          </div>
        </div>
      </header>

      {/* Dot nav */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className="group flex items-center gap-2 justify-end"
          >
            <span className="text-[11px] font-bold text-slate-700 bg-white/85 rounded-full px-2 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {n.label}
            </span>
            <span className="h-3 w-3 rounded-full bg-white/80 border-2 border-slate-900/20 group-hover:bg-red-500 transition-colors shadow-sm" />
          </a>
        ))}
      </nav>

      <main className="relative z-10">
        {/* 0 — HERO */}
        <section
          id="hero"
          data-v3-section
          className="min-h-screen flex items-center"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 border-2 border-slate-900/10 px-4 py-1.5 shadow-sm mb-5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Available for new projects
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-sm">
                Hi, I&apos;m{' '}
                <span className="text-red-600">S</span>
                <span className="text-amber-500">a</span>
                <span className="text-green-600">b</span>
                <span className="text-sky-600">b</span>
                <span className="text-violet-600">z</span>!
              </h1>
              <p className="mt-5 text-lg font-medium text-slate-700 leading-relaxed bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-slate-900/5">
                Roblox scripter & frontend developer. I turn game design
                documents into polished, launch-ready Roblox games.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <ContactButton />
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { icon: Code2, label: 'Games', value: `${games.length}+` },
                  {
                    icon: Users,
                    label: 'Visits',
                    value: formatTotalVisits(
                      games.reduce((sum, g) => sum + (g.visitsRaw ?? 0), 0),
                    ),
                  },
                  { icon: Sparkles, label: 'Years', value: '2+' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white/85 border-2 border-slate-900/10 p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <stat.icon className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 1 — WORK */}
        <section id="work" data-v3-section className="min-h-screen py-28">
          <div className="container mx-auto px-4">
            <SectionBadge emoji="🎮" title="Featured Games" />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-10 drop-shadow-sm">
              Games I&apos;ve shipped
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="rounded-2xl bg-white/85 border-2 border-slate-900/10 p-1.5 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <GameCard {...game} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2 — MINI PLANET (mostly visual) */}
        <section
          id="planet"
          data-v3-section
          className="min-h-[160vh] relative"
        >
          <div className="container mx-auto px-4 sticky top-[68vh]">
            <div className="max-w-sm rounded-2xl bg-white/85 border-2 border-slate-900/10 p-5 shadow-md">
              <SectionBadge emoji="🌍" title="My World" />
              <p className="text-slate-700 font-medium leading-relaxed text-sm">
                I live on this stuff. Scripting, UI, game loops, optimization —
                one block at a time, around the clock.
              </p>
            </div>
          </div>
        </section>

        {/* 3 — UPDATES */}
        <section id="updates" data-v3-section className="min-h-screen py-28">
          <div className="container mx-auto px-4">
            <SectionBadge emoji="📦" title="Latest Updates" />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-10 drop-shadow-sm">
              Clips & demos from the feed
            </h2>
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-slate-900/10 p-4 shadow-md">
              <MediaCarousel items={mediaData} />
            </div>
          </div>
        </section>

        {/* 4 — CTA */}
        <section
          id="cta"
          data-v3-section
          className="min-h-screen flex items-center"
        >
          <div className="container mx-auto px-4 text-center">
            <SectionBadge emoji="🚀" title="Start a Project" />
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-sm">
              Let&apos;s build something{' '}
              <span className="text-red-600">awesome</span>!
            </h2>
            <p className="mt-5 text-lg font-medium text-slate-700 max-w-xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-slate-900/5">
              Complete games, performance optimization, or a second opinion on
              architecture.
            </p>
            <div className="mt-9 flex justify-center">
              <ContactButton />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 bg-white/70 rounded-full px-3 py-1.5 shadow-sm">
            © {new Date().getFullYear()} Sabbz — All rights reserved
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/v2"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/70 rounded-full px-3 py-1.5 shadow-sm transition-colors"
            >
              neon v2
            </Link>
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/70 rounded-full px-3 py-1.5 shadow-sm transition-colors"
            >
              classic site
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
