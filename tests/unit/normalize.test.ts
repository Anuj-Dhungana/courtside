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
  it("returns live when in the live feed regardless of time", () => {
    expect(deriveStatus(NOW + 9_999_999, NOW, true)).toBe("live");
  });
  it("returns upcoming for future events", () => {
    expect(deriveStatus(NOW + 1000, NOW, false)).toBe("upcoming");
  });
  it("returns upcoming for unknown times", () => {
    expect(deriveStatus(0, NOW, false)).toBe("upcoming");
  });
  it("returns live within the 4h window after start", () => {
    expect(deriveStatus(NOW - 2 * 3_600_000, NOW, false)).toBe("live");
  });
  it("returns finished after the live window", () => {
    expect(deriveStatus(NOW - 5 * 3_600_000, NOW, false)).toBe("finished");
  });
});

describe("normalizeMatch", () => {
  it("trims titles and maps team badges through the internal proxy", () => {
    const event = normalizeMatch(makeMatch(), { now: NOW });
    expect(event.title).toBe("A vs B");
    expect(event.home?.badgeUrl).toBe("/api/img/badge/badge-a");
    expect(event.away?.badgeUrl).toBeNull();
    expect(event.status).toBe("upcoming");
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
