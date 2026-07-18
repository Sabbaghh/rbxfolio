import { NextResponse } from 'next/server';

export const revalidate = 60;

// Sabbz2z's Roblox user ID.
const ROBLOX_USER_ID = 6079049520;
const FAVORITES_PAGE_SIZE = 50;

interface RobloxCreator {
  id: number;
  type: string;
  name: string;
}

interface RobloxFavoriteGame {
  id: number; // universeId
  name: string;
  creator: RobloxCreator;
  rootPlace?: { id: number };
  placeVisits?: number;
}

interface RobloxGameInfo {
  visits: number;
  playing: number;
}

function formatVisits(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return String(n);
}

async function fetchFavorites(): Promise<RobloxFavoriteGame[]> {
  try {
    const r = await fetch(
      `https://games.roblox.com/v2/users/${ROBLOX_USER_ID}/favorite/games?limit=${FAVORITES_PAGE_SIZE}`,
      { next: { revalidate: 60 } },
    );
    if (!r.ok) return [];
    const j = (await r.json()) as { data?: RobloxFavoriteGame[] };
    return j.data ?? [];
  } catch {
    return [];
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
      data?: { id: number; visits?: number; playing?: number }[];
    };
    for (const entry of j.data ?? []) {
      result.set(entry.id, {
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
      data?: { universeId: number; thumbnails?: { imageUrl?: string }[] }[];
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
  const favorites = await fetchFavorites();

  const universeIds = favorites.map((f) => f.id);
  const [info, thumbs] = await Promise.all([
    fetchGameInfo(universeIds),
    fetchThumbnails(universeIds),
  ]);

  const enriched = favorites.map((fav) => {
    const live = info.get(fav.id);
    const visitsRaw = live?.visits ?? fav.placeVisits ?? 0;
    const rootPlaceId = fav.rootPlace?.id;
    return {
      id: String(fav.id),
      link: rootPlaceId
        ? `https://www.roblox.com/games/${rootPlaceId}`
        : `https://www.roblox.com/games/`,
      title: fav.name,
      studio: fav.creator?.name ?? '',
      thumbnail: thumbs.get(fav.id) ?? '',
      peakCCU: live ? live.playing.toLocaleString('en-US') : '',
      visits: formatVisits(visitsRaw),
      visitsRaw,
      ccuRaw: live?.playing ?? 0,
    };
  });

  enriched.sort((a, b) => b.visitsRaw - a.visitsRaw);

  return NextResponse.json(enriched);
}
