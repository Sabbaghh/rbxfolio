import { NextResponse } from 'next/server';

export const revalidate = 3600;

function computeToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(36)
    .replace(/(0+|\.)/g, '');
}

type Entities = {
  hashtags?: unknown[];
  urls?: unknown[];
  user_mentions?: unknown[];
  symbols?: unknown[];
  media?: unknown[];
};

function normalizeEntities(entities: Entities | undefined): Entities {
  if (!entities) {
    return { hashtags: [], urls: [], user_mentions: [], symbols: [] };
  }
  return {
    ...entities,
    hashtags: entities.hashtags ?? [],
    urls: entities.urls ?? [],
    user_mentions: entities.user_mentions ?? [],
    symbols: entities.symbols ?? [],
  };
}

function normalizeTweet(
  tweet: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = {
    ...tweet,
    entities: normalizeEntities(tweet.entities as Entities | undefined),
  };
  if (next.quoted_tweet) {
    next.quoted_tweet = normalizeTweet(
      next.quoted_tweet as Record<string, unknown>,
    );
  }
  if (next.parent) {
    next.parent = normalizeTweet(next.parent as Record<string, unknown>);
  }
  return next;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  const token = computeToken(id);
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token}&lang=en`;

  try {
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) {
      return NextResponse.json({ error: 'not found' }, { status: r.status });
    }
    const data = (await r.json()) as Record<string, unknown>;
    return NextResponse.json(normalizeTweet(data));
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
