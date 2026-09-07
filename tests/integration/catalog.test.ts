import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __clearMemoryCache } from "@/lib/cache";

/**
 * Integration tests for the catalog service with a mocked Streamed API
 * (global fetch is stubbed — no real network traffic).
 */

const SPORTS = [
  { id: "football", name: "Football" },
  { id: "basketball", name: "Basketball" },
];

const LIVE = [
  {
    id: "live-1",
    title: "Alpha FC vs Beta FC",
    category: "football",
    date: Date.now() - 30 * 60_000,
    popular: true,
    teams: {
      home: { name: "Alpha FC", badge: "badge-alpha" },
      away: { name: "Beta FC", badge: "badge-beta" },
    },
    sources: [{ source: "alpha", id: "src-live-1" }],
  },
];

const ALL = [
  ...LIVE,
  {
    id: "up-1",
    title: "Gamma vs Delta",
    category: "basketball",
    date: Date.now() + 2 * 3_600_000,
    popular: false,
    sources: [],
  },
  { broken: true },
];

const STREAMS = [
  {
    id: "st-1",
    streamNo: 1,
    language: "English",
    hd: true,
    embedUrl: "https://example-embed.com/watch/1",
    source: "alpha",
  },
  {
    id: "st-2",
    streamNo: 2,
    language: "Spanish",
    hd: false,
    embedUrl: "http://insecure.example.com/watch/2", // non-https: filtered
    source: "alpha",
  },
];

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const respond = (body: unknown) =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    if (url.endsWith("/sports")) return respond(SPORTS);
    if (url.endsWith("/matches/live")) return respond(LIVE);
    if (url.endsWith("/matches/all")) return respond(ALL);
    if (url.includes("/matches/all-today")) return respond(ALL);
    if (url.includes("/matches/football")) return respond(LIVE);
    if (url.includes("/stream/alpha/src-live-1")) return respond(STREAMS);
    return new Response("not found", { status: 404 });
  });
}

describe("catalog service (mocked upstream)", () => {
  beforeEach(() => {
    __clearMemoryCache();
    vi.stubGlobal("fetch", mockFetch());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getSports returns normalized sports", async () => {
    const { getSports } = await import("@/server/services/catalog");
    const sports = await getSports();
    expect(sports).toEqual(SPORTS);
  });

  it("getLiveEvents marks events live and maps badges to the proxy", async () => {
    const { getLiveEvents } = await import("@/server/services/catalog");
    const events = await getLiveEvents();
    expect(events).toHaveLength(1);
    expect(events[0].status).toBe("live");
    expect(events[0].home?.badgeUrl).toBe("/api/img/badge/badge-alpha");
  });

  it("getAllEvents drops malformed entries and merges live status", async () => {
    const { getAllEvents } = await import("@/server/services/catalog");
    const events = await getAllEvents();
    expect(events).toHaveLength(2); // broken entry dropped
    const live = events.find((e) => e.id === "live-1");
    expect(live?.status).toBe("live");
  });

  it("searchCatalog finds teams, events and sports", async () => {
    const { searchCatalog } = await import("@/server/services/catalog");
    const results = await searchCatalog("alpha");
    expect(results.events.map((e) => e.id)).toContain("live-1");

    const sportHit = await searchCatalog("basket");
    expect(sportHit.sports.map((s) => s.id)).toContain("basketball");
  });

  it("searchCatalog returns nothing for short queries", async () => {
    const { searchCatalog } = await import("@/server/services/catalog");
    const results = await searchCatalog("a");
    expect(results.events).toEqual([]);
    expect(results.sports).toEqual([]);
  });

  it("getStreams filters out non-https embed URLs", async () => {
    const { getStreams } = await import("@/server/services/catalog");
    const streams = await getStreams("alpha", "src-live-1");
    expect(streams).toHaveLength(1);
    expect(streams[0].embedUrl).toMatch(/^https:/);
  });

  it("getStreams rejects unsafe source identifiers without fetching", async () => {
    const { getStreams } = await import("@/server/services/catalog");
    const streams = await getStreams("../evil", "id");
    expect(streams).toEqual([]);
  });

  it("getEventById finds events across feeds", async () => {
    const { getEventById } = await import("@/server/services/catalog");
    const event = await getEventById("up-1");
    expect(event?.title).toBe("Gamma vs Delta");
    expect(await getEventById("nope")).toBeNull();
  });

  it("isSafeExternalUrl blocks internal hosts", async () => {
    const { isSafeExternalUrl } = await import("@/server/services/catalog");
    expect(isSafeExternalUrl("https://ok.example.com/x")).toBe(true);
    expect(isSafeExternalUrl("https://localhost/x")).toBe(false);
    expect(isSafeExternalUrl("https://10.0.0.1/x")).toBe(false);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("http://plain.example.com")).toBe(false);
  });
});
