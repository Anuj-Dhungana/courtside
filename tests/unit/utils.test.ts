import { describe, expect, it } from "vitest";

import {
  formatTime,
  groupEventsByDay,
  relativeLabel,
  sportLabel,
} from "@/lib/utils/format";
import { isSafeImageId, posterUrl } from "@/lib/streamed/images";
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
