import { beforeEach, describe, expect, it, vi } from "vitest";

import { matchStreamFree, streamFreeCategory, toStreamOptions } from "@/server/streams/streamfree/matcher";
import type { StreamFreeStream } from "@/server/streams/streamfree/types";
import type { SportEvent } from "@/types";

const event: SportEvent = {
  id: "event-1",
  title: "Fenerbahce vs Besiktas",
  sportId: "football",
  startTime: Date.parse("2026-09-13T18:00:00.000Z"),
  posterUrl: null,
  popular: false,
  home: { name: "Fenerbahce", badgeUrl: null },
  away: { name: "Besiktas", badgeUrl: null },
  sources: [],
  status: "live",
};

const stream: StreamFreeStream = {
  name: "Fenerbahçe - Beşiktaş",
  category: "soccer",
  league: "Super Lig",
  streamKey: "fenerbahce-besiktas",
  matchTimestamp: Math.floor(event.startTime / 1000),
  sources: [
    "https://strmfree.st/embed/fenerbahce-besiktas720p",
    "https://strmfree.st/embed/fenerbahce-besiktas1080p",
  ],
  thumbnailUrl: null,
};

describe("StreamFree matching", () => {
  it("maps CourtSide sports to StreamFree categories", () => {
    expect(streamFreeCategory("football")).toBe("soccer");
    expect(streamFreeCategory("basketball")).toBe("basketball");
    expect(streamFreeCategory("golf")).toBeNull();
  });

  it("matches accents, punctuation, category, and kickoff time", () => {
    const result = matchStreamFree(event, [stream]);
    expect(result.confidence).toBe("high");
    expect(result.stream?.streamKey).toBe(stream.streamKey);
  });

  it("rejects the wrong sport and unrelated teams", () => {
    expect(matchStreamFree({ ...event, sportId: "golf" }, [stream]).stream).toBeNull();
    expect(
      matchStreamFree(
        { ...event, home: { name: "Manchester City", badgeUrl: null } },
        [stream],
      ).stream,
    ).toBeNull();
  });

  it("rejects a large timestamp difference", () => {
    expect(
      matchStreamFree(
        { ...event, startTime: event.startTime + 86_400_000 },
        [stream],
      ).stream,
    ).toBeNull();
  });

  it("preserves multiple valid sources as unified stream options", () => {
    const options = toStreamOptions(stream);
    expect(options).toHaveLength(2);
    expect(options[0]).toMatchObject({ source: "streamfree", streamNo: 1 });
    expect(options[1]?.hd).toBe(true);
  });
});

describe("StreamFree client", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("validates the live catalog and ignores malformed entries", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            count: 2,
            streams: [
              {
                name: stream.name,
                category: stream.category,
                league: stream.league,
                stream_key: stream.streamKey,
                match_timestamp: stream.matchTimestamp,
                sources: stream.sources,
                thumbnail_url: stream.thumbnailUrl,
              },
              { name: "broken", category: "soccer", stream_key: "bad" },
            ],
          }),
          { status: 200 },
        ),
      ),
    );
    const { listStreamFreeStreams } = await import("@/server/streams/streamfree/client");
    const result = await listStreamFreeStreams("soccer");
    expect(result).toHaveLength(1);
    expect(result[0]?.streamKey).toBe(stream.streamKey);
  });

  it("returns no single stream on a 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not found", { status: 404 })),
    );
    const { getStreamFreeStream } = await import("@/server/streams/streamfree/client");
    await expect(getStreamFreeStream("missing-stream")).resolves.toBeNull();
  });
});
