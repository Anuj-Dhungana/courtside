import { describe, expect, it } from "vitest";

import {
  formatTime,
  groupEventsByDay,
  relativeLabel,
  sportLabel,
} from "@/lib/utils/format";
import {
  isSafeImageId,
  matchPosterUrl,
  posterUrl,
  upstreamMatchPosterUrl,
} from "@/lib/streamed/images";
import { rateLimit } from "@/lib/utils/rate-limit";
import type { SportEvent } from "@/types";

describe("format utilities", () => {
  it("formats unknown times as TBD", () => {
    expect(formatTime(0)).toBe("TBD");
    expect(relativeLabel(0)).toBe("Time TBD");
  });

  it("produces relative labels in both directions", () => {
    const now = 1_800_000_000_000;
    expect(relativeLabel(now + 30 * 60_000, now)).toBe("in 30m");
    expect(relativeLabel(now - 90 * 60_000, now)).toBe("1h 30m ago");
  });

  it("title-cases sport ids", () => {
    expect(sportLabel("american-football")).toBe("American Football");
    expect(sportLabel("tennis")).toBe("Tennis");
  });

  it("formats time correctly across different timezones", () => {
    // 1788893100000 = 2026-09-08T18:45:00.000Z
    const kickoffMs = 1788893100000;
    expect(formatTime(kickoffMs, "UTC")).toBe("6:45 PM");
    expect(formatTime(kickoffMs, "Asia/Kathmandu")).toBe("12:30 AM");
    expect(formatTime(kickoffMs, "America/New_York")).toBe("2:45 PM");
    expect(formatTime(kickoffMs, "Europe/London")).toBe("7:45 PM");
  });

  it("groups events by day bucket respecting timezones", () => {
    // 23:25 in Nepal = 17:40 UTC
    const now = new Date("2026-09-08T17:40:00.000Z").getTime();
    // Event is at 18:45 UTC = 00:30 Sep 9 in Nepal
    const kickoffMs = 1788893100000;
    const mk = (id: string, t: number): SportEvent => ({
      id,
      title: id,
      sportId: "football",
      startTime: t,
      posterUrl: null,
      popular: false,
      home: null,
      away: null,
      sources: [],
      status: "upcoming",
    });

    // In UTC, kickoff (18:45 on Sep 8) is "Today"
    const utcGroups = groupEventsByDay([mk("match-1", kickoffMs)], now, "UTC");
    expect(utcGroups[0]?.label).toBe("Today");

    // In Asia/Kathmandu, kickoff (00:30 on Sep 9) is "Tomorrow"
    const nepalGroups = groupEventsByDay(
      [mk("match-1", kickoffMs)],
      now,
      "Asia/Kathmandu",
    );
    expect(nepalGroups[0]?.label).toBe("Tomorrow");
  });

  it("groups events into Today/Tomorrow buckets", () => {
    const now = Date.now();
    const mk = (id: string, t: number): SportEvent => ({
      id,
      title: id,
      sportId: "football",
      startTime: t,
      posterUrl: null,
      popular: false,
      home: null,
      away: null,
      sources: [],
      status: "upcoming",
    });
    const groups = groupEventsByDay(
      [mk("a", now + 60_000), mk("b", now + 86_400_000), mk("c", 0)],
      now,
    );
    const labels = groups.map((g) => g.label);
    expect(labels).toContain("Today");
    expect(labels).toContain("Time TBD");
  });
});

describe("image id safety", () => {
  it("accepts opaque base64-like ids", () => {
    expect(isSafeImageId("GwZg7AZpYEZgHCAjAJgCzrATh+=.-_")).toBe(true);
  });
  it("rejects path traversal and separators", () => {
    expect(isSafeImageId("../etc/passwd")).toBe(false);
    expect(isSafeImageId("a/b")).toBe(false);
    expect(isSafeImageId("")).toBe(false);
  });
  it("normalizes full poster paths", () => {
    expect(posterUrl("/api/images/proxy/opaque.webp")).toBe(
      "/api/img/poster/opaque",
    );
    expect(posterUrl(null)).toBeNull();
  });
  it("generates match poster URLs from team badge ids", () => {
    expect(matchPosterUrl("badge-home", "badge-away")).toBe(
      "/api/img/poster/badge-home/badge-away",
    );
    expect(
      matchPosterUrl(
        "/api/images/badge/home.webp",
        "/api/images/badge/away.webp",
      ),
    ).toBe("/api/img/poster/home/away");
    expect(matchPosterUrl("home", null)).toBeNull();
    expect(matchPosterUrl(null, "away")).toBeNull();
    expect(matchPosterUrl("bad/path", "away")).toBeNull();
  });
  it("builds upstream match poster URLs", () => {
    expect(
      upstreamMatchPosterUrl("home-id", "away-id", "https://upstream.test"),
    ).toBe("https://upstream.test/images/poster/home-id/away-id.webp");
    expect(
      upstreamMatchPosterUrl("../bad", "away-id", "https://upstream.test"),
    ).toBeNull();
  });
});

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000).allowed).toBe(true);
    }
    expect(rateLimit(key, 5, 60_000).allowed).toBe(false);
  });
});
