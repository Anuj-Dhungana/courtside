import { describe, expect, it } from "vitest";

import {
  deriveStatus,
  normalizeMatch,
  sortEvents,
} from "@/lib/validation/normalize";
import type { ApiMatch } from "@/lib/streamed/types";
import type { SportEvent } from "@/types";

const NOW = 1_800_000_000_000;

function makeMatch(overrides: Partial<ApiMatch> = {}): ApiMatch {
  return {
    id: "m1",
    title: "  A vs B  ",
    category: "football",
    date: NOW + 3_600_000,
    poster: null,
    popular: false,
    teams: {
      home: { name: "A", badge: "badge-a" },
      away: { name: "B", badge: null },
    },
    sources: [{ source: "alpha", id: "x" }],
    ...overrides,
  };
}

describe("deriveStatus", () => {
  it("returns live when in the authoritative live feed regardless of time", () => {
    expect(deriveStatus(NOW + 9_999_999, NOW, true)).toBe("live");
    expect(deriveStatus(NOW - 1000, NOW, true)).toBe("live");
  });

  it("returns scheduled for future events", () => {
    expect(deriveStatus(NOW + 1000, NOW, false)).toBe("scheduled");
    expect(deriveStatus(NOW + 3_600_000, NOW, false)).toBe("scheduled");
  });

  it("returns unknown for missing or 0 timestamps", () => {
    expect(deriveStatus(0, NOW, false)).toBe("unknown");
  });

  it("never returns live for past kickoff events outside the live feed, returning delayed instead", () => {
    // Crucial reliability test: an event past kickoff NOT in the live feed must NOT be marked live
    expect(deriveStatus(NOW - 30 * 60_000, NOW, false)).toBe("delayed");
    expect(deriveStatus(NOW - 2 * 3_600_000, NOW, false)).toBe("delayed");
  });

  it("returns finished after the max event duration threshold", () => {
    expect(deriveStatus(NOW - 5 * 3_600_000, NOW, false)).toBe("finished");
  });

  it("detects postponed status from title or upstream metadata", () => {
    expect(
      deriveStatus(NOW - 1000, NOW, false, { title: "Team A vs Team B [Postponed]" }),
    ).toBe("postponed");
    expect(
      deriveStatus(NOW + 1000, NOW, false, { upstreamStatus: "postponed" }),
    ).toBe("postponed");
  });

  it("detects cancelled status from title or upstream metadata", () => {
    expect(
      deriveStatus(NOW, NOW, false, { title: "Team C vs Team D (Cancelled)" }),
    ).toBe("cancelled");
    expect(
      deriveStatus(NOW, NOW, false, { title: "Team C vs Team D (Canceled)" }),
    ).toBe("cancelled");
    expect(
      deriveStatus(NOW, NOW, false, { upstreamStatus: "cancelled" }),
    ).toBe("cancelled");
  });

  it("detects delayed or suspended status from title or upstream metadata", () => {
    expect(
      deriveStatus(NOW + 1000, NOW, false, { title: "Match X [Delayed]" }),
    ).toBe("delayed");
    expect(
      deriveStatus(NOW, NOW, false, { title: "Match Y [Suspended]" }),
    ).toBe("suspended");
    expect(
      deriveStatus(NOW, NOW, false, { upstreamStatus: "suspended" }),
    ).toBe("suspended");
  });
});

describe("normalizeMatch", () => {
  it("trims titles and maps team badges through the internal proxy", () => {
    const event = normalizeMatch(makeMatch(), { now: NOW });
    expect(event.title).toBe("A vs B");
    expect(event.home?.badgeUrl).toBe("/api/img/badge/badge-a");
    expect(event.away?.badgeUrl).toBeNull();
    expect(event.status).toBe("scheduled");
  });

  it("normalizes poster paths from full proxy form", () => {
    const event = normalizeMatch(
      makeMatch({ poster: "/api/images/proxy/opaque-id.webp" }),
      { now: NOW },
    );
    expect(event.posterUrl).toBe("/api/img/poster/opaque-id");
  });

  it("rejects unsafe badge ids", () => {
    const event = normalizeMatch(
      makeMatch({
        teams: {
          home: { name: "Evil", badge: "../../etc/passwd" },
          away: null,
        },
      }),
      { now: NOW },
    );
    expect(event.home?.badgeUrl).toBeNull();
  });

  it("handles matches without teams", () => {
    const event = normalizeMatch(makeMatch({ teams: null }), { now: NOW });
    expect(event.home).toBeNull();
    expect(event.away).toBeNull();
  });
});

describe("sortEvents", () => {
  function ev(
    id: string,
    status: SportEvent["status"],
    startTime: number,
    popular = false,
  ): SportEvent {
    return {
      id,
      title: id,
      sportId: "football",
      startTime,
      posterUrl: null,
      popular,
      home: null,
      away: null,
      sources: [],
      status,
    };
  }

  it("orders live, then upcoming by soonest, then finished by most recent", () => {
    const sorted = sortEvents(
      [
        ev("finished-old", "finished", NOW - 9_000_000),
        ev("upcoming-later", "upcoming", NOW + 7_200_000),
        ev("live-1", "live", NOW - 600_000),
        ev("upcoming-soon", "upcoming", NOW + 600_000),
        ev("finished-recent", "finished", NOW - 5_000_000),
      ],
      NOW,
    );
    expect(sorted.map((e) => e.id)).toEqual([
      "live-1",
      "upcoming-soon",
      "upcoming-later",
      "finished-recent",
      "finished-old",
    ]);
  });

  it("puts popular live events first", () => {
    const sorted = sortEvents(
      [
        ev("live-a", "live", NOW - 60_000),
        ev("live-pop", "live", NOW - 60_000, true),
      ],
      NOW,
    );
    expect(sorted[0].id).toBe("live-pop");
  });
});
