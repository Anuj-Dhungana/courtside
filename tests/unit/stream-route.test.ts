import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/events/[id]/streams/route";
import * as streamsService from "@/server/services/streams";

function request() {
  return new Request("http://localhost:3000/api/events/event-1/streams", {
    headers: { "x-forwarded-for": `stream-test-${Math.random()}` },
  });
}

describe("GET /api/events/[id]/streams", () => {
  it("returns the unified primary provider result", async () => {
    vi.spyOn(streamsService, "getEventStreams").mockResolvedValueOnce({
      provider: "streamed",
      streams: [
        {
          id: "primary-1",
          streamNo: 1,
          language: "English",
          hd: true,
          embedUrl: "https://streamed.example/embed/1",
          source: "alpha",
        },
      ],
      providers: {
        streamed: [
          {
            id: "primary-1",
            streamNo: 1,
            language: "English",
            hd: true,
            embedUrl: "https://streamed.example/embed/1",
            source: "alpha",
          },
        ],
        streamfree: [],
      },
    });
    const response = await GET(request(), {
      params: Promise.resolve({ id: "event-1" }),
    });
    expect(response.status).toBe(200);
    expect((await response.json()).provider).toBe("streamed");
  });

  it("returns the unified StreamFree fallback result", async () => {
    vi.spyOn(streamsService, "getEventStreams").mockResolvedValueOnce({
      provider: "streamfree",
      streams: [
        {
          id: "match-1-1",
          streamNo: 1,
          language: "StreamFree",
          hd: true,
          embedUrl: "https://strmfree.st/embed/match720p",
          source: "streamfree",
        },
      ],
      providers: {
        streamed: [],
        streamfree: [
          {
            id: "match-1-1",
            streamNo: 1,
            language: "StreamFree",
            hd: true,
            embedUrl: "https://strmfree.st/embed/match720p",
            source: "streamfree",
          },
        ],
      },
    });
    const response = await GET(request(), {
      params: Promise.resolve({ id: "event-1" }),
    });
    expect((await response.json()).provider).toBe("streamfree");
  });

  it("returns an empty successful response when both providers fail", async () => {
    vi.spyOn(streamsService, "getEventStreams").mockRejectedValueOnce(
      new Error("provider failure"),
    );
    const response = await GET(request(), {
      params: Promise.resolve({ id: "event-1" }),
    });
    expect(response.status).toBe(200);
    expect((await response.json()).provider).toBe("none");
  });

  it("rejects invalid event IDs", async () => {
    const response = await GET(request(), {
      params: Promise.resolve({ id: "../private" }),
    });
    expect(response.status).toBe(400);
  });
});
