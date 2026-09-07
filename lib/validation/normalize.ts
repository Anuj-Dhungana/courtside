import type { ApiMatch, ApiSport, ApiStream } from "@/lib/streamed/types";
import { badgeUrl, posterUrl } from "@/lib/streamed/images";
import type { EventStatus, Sport, SportEvent, StreamOption } from "@/types";

/**
 * Normalization: raw validated API objects -> application domain models.
 *
 * Status derivation: the Streamed API does not expose an explicit status
 * field, so we derive it from timestamps relative to now:
 *  - present in /matches/live feed  -> "live" (authoritative)
 *  - otherwise: start <= now && within LIVE_WINDOW -> assumed live window
 *  - start > now                    -> "upcoming"
 *  - older than LIVE_WINDOW         -> "finished"
 */

/** How long after kickoff we still consider an event potentially ongoing. */
const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours

export function deriveStatus(
  startTime: number,
  now: number,
  isInLiveFeed: boolean,
): EventStatus {
  if (isInLiveFeed) return "live";
  if (startTime === 0) return "upcoming";
  if (startTime > now) return "upcoming";
  if (now - startTime <= LIVE_WINDOW_MS) return "live";
  return "finished";
}

export function normalizeMatch(
  raw: ApiMatch,
  options: { isLive?: boolean; now?: number } = {},
): SportEvent {
  const now = options.now ?? Date.now();
  return {
    id: raw.id,
    title: raw.title.trim(),
    sportId: raw.category,
    startTime: raw.date,
    posterUrl: posterUrl(raw.poster ?? null),
    popular: raw.popular,
    home: raw.teams?.home
      ? {
          name: raw.teams.home.name.trim(),
          badgeUrl: badgeUrl(raw.teams.home.badge ?? null),
        }
      : null,
    away: raw.teams?.away
      ? {
          name: raw.teams.away.name.trim(),
          badgeUrl: badgeUrl(raw.teams.away.badge ?? null),
        }
      : null,
    sources: raw.sources,
    status: deriveStatus(raw.date, now, options.isLive ?? false),
  };
}

export function normalizeSport(raw: ApiSport): Sport {
  return { id: raw.id, name: raw.name.trim() };
}

export function normalizeStream(raw: ApiStream): StreamOption {
  return {
    id: raw.id,
    streamNo: raw.streamNo,
    language: raw.language,
    hd: raw.hd,
    embedUrl: raw.embedUrl,
    source: raw.source,
  };
}

/** Sort: live first, then soonest upcoming, then most recent finished. */
export function sortEvents(
  events: SportEvent[],
  now = Date.now(),
): SportEvent[] {
  const rank: Record<EventStatus, number> = {
    live: 0,
    upcoming: 1,
    finished: 2,
  };
  return [...events].sort((a, b) => {
    if (rank[a.status] !== rank[b.status])
      return rank[a.status] - rank[b.status];
    if (a.status === "finished") return b.startTime - a.startTime;
    if (a.status === "upcoming") {
      const at = a.startTime || Number.MAX_SAFE_INTEGER;
      const bt = b.startTime || Number.MAX_SAFE_INTEGER;
      return at - bt;
    }
    // live: popular first, then by recency of start
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    return Math.abs(now - a.startTime) - Math.abs(now - b.startTime);
  });
}
