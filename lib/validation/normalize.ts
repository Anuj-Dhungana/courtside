import type { ApiMatch, ApiSport, ApiStream } from "@/lib/streamed/types";
import { badgeUrl, posterUrl } from "@/lib/streamed/images";
import type { EventStatus, Sport, SportEvent, StreamOption } from "@/types";

/**
 * Normalization: raw validated API objects -> application domain models.
 *
 * Status Priority Rules:
 *  1. Explicit Title/Metadata Indicators: Check title and raw upstream status
 *     for cancellation, postponement, suspension, or delay.
 *  2. Authoritative Live Feed: If present in /matches/live -> "live".
 *  3. Upstream status field (if provided by upstream API).
 *  4. Strict Kickoff Fallback (NEVER automatically label LIVE):
 *     - startTime === 0: "unknown"
 *     - startTime > now: "scheduled"
 *     - startTime <= now && NOT in live feed:
 *         - elapsed > 4h: "finished"
 *         - elapsed <= 4h: "delayed" (never "live" - avoids false live on unconfirmed matches)
 */

/** Max expected duration of an active fixture before assuming conclusion. */
const MAX_EVENT_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

export function parseStatusFromTitle(title: string): EventStatus | null {
  if (!title) return null;
  const lower = title.toLowerCase();
  if (/\b(?:postponed|postp\.)\b/i.test(lower)) return "postponed";
  if (/\b(?:cancelled|canceled|canc\.)\b/i.test(lower)) return "cancelled";
  if (/\b(?:suspended|interrupted|abandoned)\b/i.test(lower)) return "suspended";
  if (/\b(?:delayed)\b/i.test(lower)) return "delayed";
  return null;
}

export function parseUpstreamStatus(rawStatus?: string | null): EventStatus | null {
  if (!rawStatus) return null;
  const s = rawStatus.trim().toLowerCase();
  if (["live", "in_progress", "ongoing", "active"].includes(s)) return "live";
  if (["finished", "ft", "completed", "ended", "final"].includes(s)) return "finished";
  if (["postponed", "postp"].includes(s)) return "postponed";
  if (["cancelled", "canceled"].includes(s)) return "cancelled";
  if (["suspended", "interrupted", "abandoned"].includes(s)) return "suspended";
  if (["delayed"].includes(s)) return "delayed";
  if (["scheduled", "upcoming", "not_started"].includes(s)) return "scheduled";
  return null;
}

export function deriveStatus(
  startTime: number,
  now: number,
  isInLiveFeed: boolean,
  meta?: { title?: string; upstreamStatus?: string | null; id?: string },
): EventStatus {
  // 1. Explicit title indicator has highest override priority
  if (meta?.title) {
    const titleStatus = parseStatusFromTitle(meta.title);
    if (titleStatus) return titleStatus;
  }

  // 2. Explicit upstream status if recognized
  if (meta?.upstreamStatus) {
    const parsed = parseUpstreamStatus(meta.upstreamStatus);
    if (parsed) return parsed;
  }

  // 3. Authoritative live feed inclusion
  if (isInLiveFeed) return "live";

  // 4. 24/7 dedicated broadcast channels from admin (e.g. admin-espn for US Open, admin-tennis-channel)
  // Some admin channels use negative timestamps (e.g. -3600000) instead of exactly 0.
  if (startTime <= 0 && meta?.id?.startsWith("admin-")) {
    return "live";
  }

  // 5. Time-based fallback with strict safeguards
  if (startTime === 0) return "unknown";
  if (startTime > now) return "scheduled";

  // Event start time is in the past, but it is NOT in the authoritative live feed.
  // NEVER assume an event is LIVE without authoritative live feed confirmation.
  const elapsed = now - startTime;
  if (elapsed > MAX_EVENT_DURATION_MS) return "finished";

  // Past kickoff time but not confirmed live: mark as delayed awaiting feed
  return "delayed";
}

export function normalizeMatch(
  raw: ApiMatch,
  options: { isLive?: boolean; now?: number } = {},
): SportEvent {
  const now = options.now ?? Date.now();
  const title = raw.title.trim();
  const status = deriveStatus(raw.date, now, options.isLive ?? false, {
    title,
    upstreamStatus: raw.status ?? raw.state,
    id: raw.id,
  });

  return {
    id: raw.id,
    title,
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
    status,
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

/** Sort: live first, then delayed, then upcoming/scheduled by soonest, then others. */
export function sortEvents(
  events: SportEvent[],
  now = Date.now(),
): SportEvent[] {
  const rank: Record<EventStatus, number> = {
    live: 0,
    delayed: 1,
    scheduled: 2,
    upcoming: 2,
    suspended: 3,
    postponed: 4,
    cancelled: 5,
    finished: 6,
    unknown: 7,
  };
  return [...events].sort((a, b) => {
    const rankDiff = (rank[a.status] ?? 8) - (rank[b.status] ?? 8);
    if (rankDiff !== 0) return rankDiff;

    if (a.status === "finished") return b.startTime - a.startTime;
    if (a.status === "scheduled" || a.status === "upcoming") {
      const at = a.startTime || Number.MAX_SAFE_INTEGER;
      const bt = b.startTime || Number.MAX_SAFE_INTEGER;
      return at - bt;
    }
    // live: popular first, real fixtures with teams before 24/7 channels, then by recency of start
    if (a.status === "live") {
      const aHasTeams = Boolean(a.home && a.away);
      const bHasTeams = Boolean(b.home && b.away);
      if (aHasTeams !== bHasTeams) return aHasTeams ? -1 : 1;

      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return Math.abs(now - a.startTime) - Math.abs(now - b.startTime);
    }
    // other statuses: soonest startTime first
    return (a.startTime || 0) - (b.startTime || 0);
  });
}
