import "server-only";

import { getOrSet } from "@/lib/cache";
import {
  getStreamFreeStream,
  listStreamFreeStreams,
} from "@/server/streams/streamfree/client";
import { streamFreeCategory, toStreamOptions } from "@/server/streams/streamfree/matcher";
import type { StreamFreeStream } from "@/server/streams/streamfree/types";
import type {
  SearchResults,
  Sport,
  SportEvent,
  SportWithCounts,
  StreamOption,
} from "@/types";

/**
 * Catalog service backed by StreamFree's live catalog.
 * StreamFree is the active source for both event discovery and streams.
 */

const SAFE_SPORT_ID = /^[a-z0-9-]{1,64}$/i;
const SAFE_SOURCE_ID = /^[A-Za-z0-9._-]{1,256}$/;

function catalogCache(): Promise<StreamFreeStream[]> {
  return getOrSet(
    "streamfree:catalog:all",
    { softTtl: 20, hardTtl: 60 },
    () => listStreamFreeStreams(),
  );
}

function streamStatus(stream: StreamFreeStream, now = Date.now()): SportEvent["status"] {
  if ((stream.liveSources?.length ?? 0) > 0) return "live";
  if (!stream.matchTimestamp) return "unknown";
  const startTime = stream.matchTimestamp * 1000;
  return startTime > now ? "scheduled" : "finished";
}

function toEvent(stream: StreamFreeStream): SportEvent {
  const id = `streamfree-${stream.streamKey}`;
  const home = stream.team1
    ? { name: stream.team1.name, badgeUrl: stream.team1.logo }
    : null;
  const away = stream.team2
    ? { name: stream.team2.name, badgeUrl: stream.team2.logo }
    : null;

  return {
    id,
    title: stream.name,
    sportId: stream.category,
    startTime: stream.matchTimestamp ? stream.matchTimestamp * 1000 : 0,
    posterUrl: stream.thumbnailUrl,
    popular: (stream.viewers ?? 0) > 0,
    home,
    away,
    sources: [{ source: "streamfree", id: stream.streamKey }],
    status: streamStatus(stream),
  };
}

function sortEvents(events: SportEvent[]): SportEvent[] {
  return [...events].sort((a, b) => {
    const rank = (event: SportEvent) =>
      event.status === "live"
        ? 0
        : event.status === "scheduled" || event.status === "upcoming"
          ? 1
          : 2;
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;
    return (a.startTime || Number.MAX_SAFE_INTEGER) - (b.startTime || Number.MAX_SAFE_INTEGER);
  });
}

export async function getSports(): Promise<Sport[]> {
  return getOrSet("streamfree:sports", { softTtl: 300, hardTtl: 1800 }, async () => {
    const streams = await catalogCache();
    const categories = new Set(streams.map((stream) => stream.category));
    return [...categories]
      .sort()
      .map((id) => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1) }));
  });
}

async function catalogEvents(): Promise<SportEvent[]> {
  return (await catalogCache()).map(toEvent);
}

export async function getLiveEvents(): Promise<SportEvent[]> {
  return sortEvents((await catalogEvents()).filter((event) => event.status === "live"));
}

export async function getTodayEvents(): Promise<SportEvent[]> {
  return sortEvents(await catalogEvents());
}

export async function getAllEvents(): Promise<SportEvent[]> {
  return sortEvents(await catalogEvents());
}

export async function getPopularEvents(): Promise<SportEvent[]> {
  return sortEvents((await catalogEvents()).filter((event) => event.popular));
}

export async function getSportEvents(sportId: string): Promise<SportEvent[]> {
  if (!SAFE_SPORT_ID.test(sportId)) return [];
  const category = streamFreeCategory(sportId) ?? sportId.toLowerCase();
  return sortEvents((await catalogEvents()).filter((event) => event.sportId === category));
}

export async function getEventById(id: string): Promise<SportEvent | null> {
  // Event ids come from match feeds; look the event up across cached feeds.
  const [all, live] = await Promise.all([
    getAllEvents().catch(() => [] as SportEvent[]),
    getLiveEvents().catch(() => [] as SportEvent[]),
  ]);
  return live.find((e) => e.id === id) ?? all.find((e) => e.id === id) ?? null;
}

export async function getStreams(
  source: string,
  sourceId: string,
): Promise<StreamOption[]> {
  if (source !== "streamfree" || !SAFE_SOURCE_ID.test(sourceId)) {
    return [];
  }
  return getOrSet(
    `streamfree:streams:${sourceId}`,
    { softTtl: 30, hardTtl: 120 },
    async () => {
      const stream = await getStreamFreeStream(sourceId);
      return stream
        ? toStreamOptions(stream).filter((s) => isSafeExternalUrl(s.embedUrl))
        : [];
    },
  );
}

/** Only allow https URLs to plausible public hosts (SSRF/JS-URL protection). */
export function isSafeExternalUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    const host = url.hostname;
    if (!host.includes(".")) return false;
    if (
      host === "localhost" ||
      /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function getSportsWithCounts(): Promise<SportWithCounts[]> {
  const [sports, live, today] = await Promise.all([
    getSports(),
    getLiveEvents().catch(() => [] as SportEvent[]),
    getTodayEvents().catch(() => [] as SportEvent[]),
  ]);
  return sports.map((s) => ({
    ...s,
    liveCount: live.filter((e) => e.sportId === s.id).length,
    todayCount: today.filter((e) => e.sportId === s.id).length,
  }));
}

export async function searchCatalog(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase().slice(0, 100);
  if (q.length < 2) return { events: [], sports: [], query: q };

  const [events, sports] = await Promise.all([
    getAllEvents().catch(() => [] as SportEvent[]),
    getSports().catch(() => [] as Sport[]),
  ]);

  const matchedSports = sports.filter(
    (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
  );

  const matchedEvents = events
    .filter((e) => {
      if (e.title.toLowerCase().includes(q)) return true;
      if (e.home?.name.toLowerCase().includes(q)) return true;
      if (e.away?.name.toLowerCase().includes(q)) return true;
      return false;
    })
    .slice(0, 60);

  return { events: matchedEvents, sports: matchedSports, query: q };
}

/** Health probe for the upstream API (used by /api/health). */
export async function checkUpstreamHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
}> {
  const started = Date.now();
  try {
    await catalogCache();
    return { ok: true, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, latencyMs: Date.now() - started };
  }
}
