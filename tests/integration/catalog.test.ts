import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __clearMemoryCache } from "@/lib/cache";

const CATALOG = [
  {
    id: "live-1",
    name: "Alpha FC vs Beta FC",
    category: "football",
    league: "Premier League",
    stream_key: "alpha-fc-vs-beta-fc",
    match_timestamp: Math.floor((Date.now() - 30 * 60_000) / 1000),
    sources: ["https://example-embed.com/watch/1"],
    live_sources: ["https://example-embed.com/watch/1"],
    thumbnail_url: "https://images.example.com/alpha.jpg",
    viewers: 10,
    team1: { name: "Alpha FC", logo: "https://images.example.com/alpha.png" },
    team2: { name: "Beta FC", logo: "https://images.example.com/beta.png" },
  },
  {
    id: "up-1",
    name: "Gamma vs Delta",
    category: "basketball",
    league: "League",
    stream_key: "gamma-vs-delta",
    match_timestamp: Math.floor((Date.now() + 2 * 3_600_000) / 1000),
    sources: ["https://example-embed.com/watch/2"],
    live_sources: [],
    thumbnail_url: null,
    viewers: 0,
    team1: { name: "Gamma", logo: null },
    team2: { name: "Delta", logo: null },
  },
];

const STREAM = {
  ...CATALOG[0],
  sources: [
    "https://example-embed.com/watch/1",
    "http://insecure.example.com/watch/2",
  ],
};

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const respond = (body: unknown) =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    if (url.endsWith("/streams")) return respond({ streams: CATALOG });
    if (url.endsWith("/streams/alpha-fc-vs-beta-fc")) {
      return respond(STREAM);
    }
    return new Response("not found", { status: 404 });
  });
}

describe("catalog service (mocked StreamFree API)", () => {
  beforeEach(() => {
    __clearMemoryCache();
    vi.stubGlobal("fetch", mockFetch());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getSports returns categories from the catalog", async () => {
    const { getSports } = await import("@/server/services/catalog");
    expect(await getSports()).toEqual([
      { id: "basketball", name: "Basketball" },
      { id: "football", name: "Football" },
    ]);
  });

  it("getLiveEvents returns events with live sources", async () => {
    const { getLiveEvents } = await import("@/server/services/catalog");
    const events = await getLiveEvents();
    expect(events).toHaveLength(1);
    expect(events[0].status).toBe("live");
    expect(events[0].home?.badgeUrl).toBe("https://images.example.com/alpha.png");
  });

  it("getAllEvents maps the complete catalog", async () => {
    const { getAllEvents } = await import("@/server/services/catalog");
    const events = await getAllEvents();
    expect(events).toHaveLength(2);
    expect(events.find((event) => event.title === "Gamma vs Delta")?.status).toBe(
      "scheduled",
    );
  });

  it("searchCatalog finds teams, events and sports", async () => {
    const { searchCatalog } = await import("@/server/services/catalog");
    expect((await searchCatalog("alpha")).events.map((event) => event.id)).toContain(
      "streamfree-alpha-fc-vs-beta-fc",
    );
    expect((await searchCatalog("basket")).sports.map((sport) => sport.id)).toContain(
      "basketball",
    );
  });

  it("searchCatalog returns nothing for short queries", async () => {
    const { searchCatalog } = await import("@/server/services/catalog");
    expect(await searchCatalog("a")).toEqual({ events: [], sports: [], query: "a" });
  });

  it("getStreams filters out non-https embed URLs", async () => {
    const { getStreams } = await import("@/server/services/catalog");
    const streams = await getStreams("streamfree", "alpha-fc-vs-beta-fc");
    expect(streams).toHaveLength(1);
    expect(streams[0].embedUrl).toMatch(/^https:/);
  });

  it("getStreams rejects unsafe source identifiers without fetching", async () => {
    const { getStreams } = await import("@/server/services/catalog");
    expect(await getStreams("streamfree", "../evil")).toEqual([]);
  });

  it("getEventById finds events in the catalog", async () => {
    const { getEventById } = await import("@/server/services/catalog");
    expect((await getEventById("streamfree-gamma-vs-delta"))?.title).toBe(
      "Gamma vs Delta",
    );
    expect(await getEventById("nope")).toBeNull();
  });

  it("does not fabricate live status without live sources", async () => {
    const { getTodayEvents } = await import("@/server/services/catalog");
    const events = await getTodayEvents();
    expect(events.find((event) => event.title === "Gamma vs Delta")?.status).not.toBe(
      "live",
    );
  });
});
