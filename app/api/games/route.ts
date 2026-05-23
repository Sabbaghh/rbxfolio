import { NextResponse } from 'next/server';
import gamesData from '@/data/games.json';

export const revalidate = 60;

interface StaticGame {
  id: string;
  link: string;
  title?: string;
  studio?: string;
  thumbnail?: string;
  peakCCU?: string;
  visits?: string;
}

interface RobloxGameInfo {
  name: string;
  creatorName: string;
  visits: number;
  playing: number;
}

function extractPlaceId(link: string): string | null {
  const match = link.match(/\/games\/(\d+)/);
  return match ? match[1] : null;
}

function formatVisits(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return String(n);
}

function parseFallbackCCU(value: string | undefined): number {
  if (!value) return 0;
  const n = parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function pick(staticValue: string | undefined, apiValue: string): string {
  return staticValue && staticValue.trim() !== '' ? staticValue : apiValue;
}

async function fetchUniverseId(placeId: string): Promise<number | null> {
  try {
    const r = await fetch(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
      { next: { revalidate: 86_400 } },
    );
    if (!r.ok) return null;
    const j = (await r.json()) as { universeId?: number };
    return j.universeId ?? null;
  } catch {
    return null;
  }
}

async function fetchGameInfo(
  universeIds: number[],
): Promise<Map<number, RobloxGameInfo>> {
  const result = new Map<number, RobloxGameInfo>();
  if (universeIds.length === 0) return result;
  try {
    const r = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`,
      { next: { revalidate: 60 } },
    );
    if (!r.ok) return result;
    const j = (await r.json()) as {
      data?: {
        id: number;
        name?: string;
        creator?: { name?: string };
        visits?: number;
        playing?: number;
      }[];
    };
    for (const entry of j.data ?? []) {
      result.set(entry.id, {
        name: entry.name ?? '',
        creatorName: entry.creator?.name ?? '',
        visits: entry.visits ?? 0,
        playing: entry.playing ?? 0,
      });
    }
  } catch {
    // fall through with whatever we collected
  }
  return result;
}

async function fetchThumbnails(
  universeIds: number[],
): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  if (universeIds.length === 0) return result;
  try {
    const r = await fetch(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeIds.join(',')}&size=768x432&format=Png&countPerUniverse=1`,
      { next: { revalidate: 3600 } },
    );
    if (!r.ok) return result;
    const j = (await r.json()) as {
      data?: {
        universeId: number;
        thumbnails?: { imageUrl?: string }[];
      }[];
    };
    for (const entry of j.data ?? []) {
      const url = entry.thumbnails?.[0]?.imageUrl;
      if (url) result.set(entry.universeId, url);
    }
  } catch {
    // ignore
  }
  return result;
}

export async function GET() {
  const games = gamesData as StaticGame[];

  const universeLookups = await Promise.all(
    games.map(async (game) => {
      const placeId = extractPlaceId(game.link);
      const universeId = placeId ? await fetchUniverseId(placeId) : null;
      return { game, universeId };
    }),
  );

  const universeIds = universeLookups
    .map((u) => u.universeId)
    .filter((id): id is number => id != null);

  const [info, thumbs] = await Promise.all([
    fetchGameInfo(universeIds),
    fetchThumbnails(universeIds),
  ]);

  const enriched = universeLookups.map(({ game, universeId }) => {
    const apiInfo = universeId != null ? info.get(universeId) : undefined;
    const apiThumb = universeId != null ? thumbs.get(universeId) : undefined;
    const visitsRaw = apiInfo?.visits ?? parseFallbackCCU(game.visits);

    const display = {
      id: game.id,
      link: game.link,
      title: pick(game.title, apiInfo?.name ?? ''),
      studio: pick(game.studio, apiInfo?.creatorName ?? ''),
      thumbnail: pick(game.thumbnail, apiThumb ?? ''),
      peakCCU: apiInfo
        ? apiInfo.playing.toLocaleString('en-US')
        : (game.peakCCU ?? ''),
      visits: apiInfo ? formatVisits(apiInfo.visits) : (game.visits ?? ''),
      visitsRaw,
    };

    return display;
  });

  enriched.sort((a, b) => b.visitsRaw - a.visitsRaw);

  return NextResponse.json(enriched);
}
