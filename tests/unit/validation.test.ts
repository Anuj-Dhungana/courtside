import { describe, expect, it } from "vitest";

import {
  apiMatchSchema,
  apiSportSchema,
  apiStreamSchema,
  safeParseArray,
} from "@/lib/streamed/types";

describe("apiMatchSchema", () => {
  const valid = {
    id: "match-1",
    title: "Team A vs Team B",
    category: "football",
    date: 1720598400000,
    poster: "/api/images/proxy/abc.webp",
    popular: true,
    teams: {
      home: { name: "Team A", badge: "badge-a" },
      away: { name: "Team B", badge: "badge-b" },
    },
    sources: [{ source: "alpha", id: "src-1" }],
  };

  it("accepts a fully populated match", () => {
    const result = apiMatchSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts a minimal match without teams/poster", () => {
    const result = apiMatchSchema.safeParse({
      id: "m2",
      title: "Grand Prix",
      category: "motor-sports",
      date: 0,
      popular: false,
      sources: [],
    });
    expect(result.success).toBe(true);
  });

  it("tolerates malformed popular/date/sources via catch fallbacks", () => {
    const result = apiMatchSchema.safeParse({
      id: "m3",
      title: "X vs Y",
      category: "tennis",
      date: "not-a-number",
      popular: "yes",
      sources: "oops",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe(0);
      expect(result.data.popular).toBe(false);
      expect(result.data.sources).toEqual([]);
    }
  });

  it("rejects a match missing required fields", () => {
    expect(apiMatchSchema.safeParse({ id: "x" }).success).toBe(false);
  });
});

describe("apiSportSchema", () => {
  it("accepts valid sports and rejects empty ids", () => {
    expect(
      apiSportSchema.safeParse({ id: "football", name: "Football" }).success,
    ).toBe(true);
    expect(apiSportSchema.safeParse({ id: "", name: "Nope" }).success).toBe(
      false,
    );
  });
});

describe("apiStreamSchema", () => {
  it("accepts a valid stream", () => {
    const result = apiStreamSchema.safeParse({
      id: "s1",
      streamNo: 1,
      language: "English",
      hd: true,
      embedUrl: "https://example.com/watch",
      source: "alpha",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a stream without an embedUrl", () => {
    const result = apiStreamSchema.safeParse({
      id: "s2",
      streamNo: 1,
      language: "English",
      hd: false,
      source: "alpha",
    });
    expect(result.success).toBe(false);
  });
});

describe("safeParseArray", () => {
  it("drops invalid entries and keeps valid ones", () => {
    const payload = [
      { id: "football", name: "Football" },
      { id: "", name: "Broken" },
      "garbage",
      { id: "tennis", name: "Tennis" },
    ];
    const { items, dropped } = safeParseArray(apiSportSchema, payload);
    expect(items).toHaveLength(2);
    expect(dropped).toBe(2);
  });

  it("returns empty for non-array payloads", () => {
    const { items, dropped } = safeParseArray(apiSportSchema, { nope: true });
    expect(items).toEqual([]);
    expect(dropped).toBe(0);
  });
});
