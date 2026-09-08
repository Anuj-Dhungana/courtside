/**
 * Application domain models.
 *
 * These are the normalized shapes the UI consumes. Raw Streamed API responses
 * are validated and mapped into these types inside lib/validation/normalize.ts
 * so external schema quirks never leak into components.
 */

export type EventStatus =
  | "live"
  | "scheduled"
  | "upcoming"
  | "delayed"
  | "postponed"
  | "cancelled"
  | "suspended"
  | "finished"
  | "unknown";

export interface Sport {
  id: string;
  name: string;
}

export interface Team {
  name: string;
  /** Absolute URL to the team badge image, or null when unavailable. */
  badgeUrl: string | null;
}

export interface StreamSourceRef {
  source: string;
  id: string;
}

export interface SportEvent {
  id: string;
  title: string;
  /** Sport/category id, e.g. "football". */
  sportId: string;
  /** Unix timestamp in ms. 0 means "time unknown". */
  startTime: number;
  posterUrl: string | null;
  popular: boolean;
  home: Team | null;
  away: Team | null;
  sources: StreamSourceRef[];
  status: EventStatus;
}

export interface StreamOption {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  /** Third-party embed/watch URL. Always treated as external content. */
  embedUrl: string;
  source: string;
}

export interface SportWithCounts extends Sport {
  liveCount: number;
  todayCount: number;
}

export interface SearchResults {
  events: SportEvent[];
  sports: Sport[];
  query: string;
}
