'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GameCardV4 } from '@/components/v4/game-card';
import { TweetGridV4 } from '@/components/v4/tweet-grid';

import gamesData from '@/data/games.json';
import mediaData from '@/data/media.json';

const V4Scene = dynamic(
  () => import('@/components/v4/scene').then((m) => m.V4Scene),
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

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function RobloxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M5.164 0 .16 18.928 18.836 24 23.84 5.071 5.164 0Zm9.236 14.789-5.214-1.41 1.41-5.214 5.214 1.41-1.41 5.214Z" />
    </svg>
  );
}

function WorkWithMeButton() {
  return (
    <a
      href="https://discord.com/users/759498023453196308"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-500 border border-red-500/60 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-[0_0_30px_rgba(255,36,56,0.35)] hover:shadow-[0_0_45px_rgba(255,36,56,0.5)] transition-all"
    >
      <DiscordIcon className="h-5 w-5" />
      WORK WITH ME
    </a>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center border border-white/15 bg-black/50 backdrop-blur-md p-3 text-white/60 hover:text-white hover:border-red-500/60 transition-colors"
    >
      {children}
    </a>
  );
}

function MissionLabel({ code, title }: { code: string; title?: string }) {
  return (
    <p className="font-mono text-xs tracking-[0.35em] text-red-500 mb-3">
      [{code}]
      {title && <span className="text-white/40"> {title}</span>}
    </p>
  );
}

function HudCorners() {
  const c = 'fixed z-30 h-10 w-10 border-red-500/40 pointer-events-none';
  return (
    <>
      <div className={`${c} top-3 left-3 border-l-2 border-t-2`} />
      <div className={`${c} top-3 right-3 border-r-2 border-t-2`} />
      <div className={`${c} bottom-3 left-3 border-l-2 border-b-2`} />
      <div className={`${c} bottom-3 right-3 border-r-2 border-b-2`} />
    </>
  );
}

export default function V4Page() {
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

  const totalVisits = formatTotalVisits(
    games.reduce((sum, g) => sum + (g.visitsRaw ?? 0), 0),
  );

  return (
    <div className="min-h-screen overflow-x-hidden text-white">
      <V4Scene />
      <HudCorners />

      {/* Header */}
      <header className="fixed top-5 left-6 z-30">
        <p className="font-mono text-sm tracking-[0.3em]">
          SABBZ<span className="text-red-500">.</span>
        </p>
      </header>

      {/* Status mark */}
      <div className="fixed bottom-5 right-6 z-30 pointer-events-none">
        <span className="inline-block rotate-180 font-mono text-xs tracking-[0.3em] text-white/30">
          SABBZ<span className="text-red-500/70">.</span>
        </span>
      </div>

      <main className="relative z-10">
        {/* 0 — HERO: face cam */}
        <section
          id="hero"
          data-v4-section
          className="min-h-screen flex items-end"
        >
          <div className="container mx-auto px-6 pb-28">
            <MissionLabel code="INTRO" />
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight">
              SABBZ<span className="text-red-500">.</span>
            </h1>
            <p className="mt-4 max-w-md text-white/60 leading-relaxed">
              Roblox scripter & frontend developer.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <WorkWithMeButton />
              <IconLink href="https://x.com/sabbz2z" label="X / Twitter">
                <XIcon className="h-5 w-5" />
              </IconLink>
              <IconLink
                href="https://www.roblox.com/users/6079049520/profile"
                label="Roblox profile"
              >
                <RobloxIcon className="h-5 w-5" />
              </IconLink>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
              {[
                { label: 'GAMES', value: `${games.length}+` },
                { label: 'VISITS', value: totalVisits },
                { label: 'YEARS', value: '2+' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border border-white/10 bg-black/50 backdrop-blur-md p-3"
                >
                  <span className="block h-px w-6 bg-red-500/70 mb-2" />
                  <p className="font-mono text-[10px] tracking-[0.25em] text-white/40">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">{stat.value}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Transit gap: corridor A walk */}
        <section data-v4-section aria-hidden className="h-[85vh]" />

        {/* 2 — GAMES ROOM: normal page flow, avatar idles in the room */}
        <section id="work" data-v4-section className="min-h-screen py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <MissionLabel code="ROOM_01" title="SHIPPED GAMES" />
              <h2 className="text-3xl md:text-5xl font-extrabold">
                The work<span className="text-red-500">.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {games.map((game) => (
                <GameCardV4 key={game.id} {...game} />
              ))}
            </div>
          </div>
        </section>

        {/* Transit gap: corridor B walk */}
        <section data-v4-section aria-hidden className="h-[85vh]" />

        {/* 4 — UPDATES ROOM: cutscene first, field logs below */}
        <section id="updates" data-v4-section className="min-h-screen pb-32">
          <div className="container mx-auto px-6 pt-[48vh]">
            <div className="text-center mb-12">
              <MissionLabel code="ROOM_02" title="FIELD LOGS" />
              <h2 className="text-3xl md:text-5xl font-extrabold">
                Latest updates<span className="text-red-500">.</span>
              </h2>
            </div>
            <TweetGridV4 items={mediaData} />
          </div>
        </section>

        {/* Transit gap: out the airlock onto the observation deck */}
        <section data-v4-section aria-hidden className="h-[85vh]" />

        {/* 6 — CTA: planet scene */}
        <section
          id="cta"
          data-v4-section
          className="min-h-screen flex items-end"
        >
          <div className="container mx-auto px-6 pb-32">
            <MissionLabel code="MISSION" title="YOURS" />
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] max-w-3xl">
              LET&apos;S BUILD SOMETHING{' '}
              <span className="text-red-500">OUT OF THIS WORLD</span>.
            </h2>
            <p className="mt-5 text-white/60 max-w-md">
              Complete games, performance optimization, or a second opinion on
              architecture.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <WorkWithMeButton />
              <IconLink href="https://x.com/sabbz2z" label="X / Twitter">
                <XIcon className="h-5 w-5" />
              </IconLink>
              <IconLink
                href="https://www.roblox.com/users/6079049520/profile"
                label="Roblox profile"
              >
                <RobloxIcon className="h-5 w-5" />
              </IconLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-6 bg-black/60 backdrop-blur-sm">
        <div className="px-6 font-mono text-[11px] text-white/40">
          <p>© {new Date().getFullYear()} SABBZ — ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}
