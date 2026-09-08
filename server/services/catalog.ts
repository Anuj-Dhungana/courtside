import "server-only";

import { getOrSet } from "@/lib/cache";
import { streamedGet } from "@/lib/streamed/client";
import {
  apiMatchSchema,
  apiSportSchema,
  apiStreamSchema,
  safeParseArray,
} from "@/lib/streamed/types";
import {
  normalizeMatch,
  normalizeSport,
  normalizeStream,
  sortEvents,
} from "@/lib/validation/normalize";
import { logger } from "@/lib/utils/logger";
import type {
  SearchResults,
  Sport,
  SportEvent,
  SportWithCounts,
  StreamOption,
} from "@/types";

/**
 * Catalog service: the single entry point the app uses for sports data.
 *
 * Cache TTLs (soft/hard, seconds) — see docs/architecture.md:
 *   sports list   3600 / 86400
 *   live matches    15 / 90
 *   today matches   60 / 600
 *   all matches    120 / 900
 *   per-sport      60 / 600
 *   streams         30 / 120
 */

const SAFE_SPORT_ID = /^[a-z0-9-]{1,64}$/i;
const SAFE_SOURCE = /^[a-z0-9-]{1,64}$/i;
const SAFE_SOURCE_ID = /^[A-Za-z0-9._-]{1,256}$/;

export async function getSports(): Promise<Sport[]> {
  return getOrSet("sports", { softTtl: 3600, hardTtl: 86400 }, async () => {
    const payload = await streamedGet("/sports");
    const { items, dropped } = safeParseArray(apiSportSchema, payload);
    if (dropped > 0) logger.warn("sports_validation_dropped", { dropped });
    return items.map(normalizeSport);
  });
}

async function fetchMatches(
  path: string,
  cacheKey: string,
  softTtl: number,
  hardTtl: number,
  isLive: boolean,
): Promise<SportEvent[]> {
  return getOrSet(cacheKey, { softTtl, hardTtl }, async () => {
    const payload = await streamedGet(path);
    const { items, dropped } = safeParseArray(apiMatchSchema, payload);
    if (dropped > 0) {
      logger.warn("matches_validation_dropped", { path, dropped });
    }
    return items.map((m) => normalizeMatch(m, { isLive }));
  });
}

export async function getLiveEvents(): Promise<SportEvent[]> {
  const [events, todayMatches] = await Promise.all([
    fetchMatches("/matches/live", "matches:live", 15, 90, true),
    fetchMatches("/matches/all-today", "matches:today", 60, 600, false).catch(
      () => [] as SportEvent[],
    ),
  ]);

  // Include 24/7 dedicated live broadcast channels (e.g. US Open, Tennis Channel)
  const channels = todayMatches.filter(
    (c) => c.status === "live" && c.startTime === 0,
  );

  // Deduplicate: If an admin channel represents the same event as a live match
  // (shares a source ID or matching title), the admin channel takes priority because
  // it has active streams and correct category (e.g. tennis vs other).
  const supersededLiveIds = new Set<string>();
  for (const ch of channels) {
    const cleanChTitle = ch.title.replace(/[^\w\s]/g, "").trim().toLowerCase();
    for (const ev of events) {
      const sharesSource =
        ch.sources &&
        ch.sources.some(
          (cs) =>
            ev.sources &&
            ev.sources.some(
              (es) => es.id === cs.id || es.id === ch.id || ev.id === cs.id,
            ),
        );
      const cleanEvTitle = ev.title.replace(/[^\w\s]/g, "").trim().toLowerCase();
      const sameTitle = cleanChTitle.length > 2 && cleanChTitle === cleanEvTitle;

      if (sharesSource || sameTitle) {
        supersededLiveIds.add(ev.id);
      }
    }
  }

  const existingIds = new Set<string>();
  const merged: SportEvent[] = [];

  for (const ev of events) {
    if (!supersededLiveIds.has(ev.id) && !existingIds.has(ev.id)) {
      existingIds.add(ev.id);
      merged.push(ev);
    }
  }

  for (const ch of channels) {
    if (!existingIds.has(ch.id)) {
      existingIds.add(ch.id);
      merged.push(ch);
    }
  }

  return sortEvents(merged);
}

export async function getTodayEvents(): Promise<SportEvent[]> {
  const [today, live] = await Promise.all([
    fetchMatches("/matches/all-today", "matches:today", 60, 600, false),
    getLiveEvents().catch(() => [] as SportEvent[]),
  ]);
  return sortEvents(mergeLiveStatus(today, live));
}

export async function getAllEvents(): Promise<SportEvent[]> {
  const [all, live] = await Promise.all([
    fetchMatches("/matches/all", "matches:all", 120, 900, false),
    getLiveEvents().catch(() => [] as SportEvent[]),
  ]);
  return sortEvents(mergeLiveStatus(all, live));
}

export async function getPopularEvents(): Promise<SportEvent[]> {
  const events = await fetchMatches(
    "/matches/all-today/popular",
    "matches:today:popular",
    60,
    600,
    false,
  );
  const live = await getLiveEvents().catch(() => [] as SportEvent[]);
  return sortEvents(mergeLiveStatus(events, live));
}

export async function getSportEvents(sportId: string): Promise<SportEvent[]> {
  if (!SAFE_SPORT_ID.test(sportId)) return [];
  const [events, live] = await Promise.all([
    fetchMatches(
      `/matches/${encodeURIComponent(sportId)}`,
      `matches:sport:${sportId}`,
      60,
      600,
      false,
    ),
    getLiveEvents().catch(() => [] as SportEvent[]),
  ]);
  return sortEvents(mergeLiveStatus(events, live));
}

/** Mark events as live when they appear in the authoritative live feed. */
function mergeLiveStatus(
  events: SportEvent[],
  live: SportEvent[],
): SportEvent[] {
  if (live.length === 0) return events;
  const liveMap = new Map(live.map((e) => [e.id, e]));
  const existingIds = new Set<string>();

  const merged = events.map((e) => {
    existingIds.add(e.id);
    const liveMatch = liveMap.get(e.id);
    if (liveMatch) {
      return {
        ...e,
        status: "live" as const,
        sources: liveMatch.sources.length > 0 ? liveMatch.sources : e.sources,
      };
    }
    return e;
  });

  for (const liveEvent of live) {
    if (!existingIds.has(liveEvent.id)) {
      merged.push(liveEvent);
    }
  }

  return merged;
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
  if (!SAFE_SOURCE.test(source) || !SAFE_SOURCE_ID.test(sourceId)) {
    return [];
  }
  return getOrSet(
    `streams:${source}:${sourceId}`,
    { softTtl: 30, hardTtl: 120 },
    async () => {
      const payload = await streamedGet(
        `/stream/${encodeURIComponent(source)}/${encodeURIComponent(sourceId)}`,
      );
      const { items, dropped } = safeParseArray(apiStreamSchema, payload);
      if (dropped > 0) {
        logger.warn("streams_validation_dropped", { source, dropped });
      }
      return items
        .map(normalizeStream)
        .filter((s) => isSafeExternalUrl(s.embedUrl));
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
    await streamedGet("/sports");
    return { ok: true, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, latencyMs: Date.now() - started };
  }
}
