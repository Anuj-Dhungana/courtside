import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/events/[id]/route";
import * as catalog from "@/server/services/catalog";

describe("GET /api/events/[id]", () => {
  it("returns 200 with event data when found", async () => {
    vi.spyOn(catalog, "getEventById").mockResolvedValueOnce({
      id: "event-123",
      title: "Real Madrid vs Inter Milan",
      sportId: "football",
      startTime: 1720598400000,
      status: "live",
      home: { name: "Real Madrid", badgeUrl: null },
      away: { name: "Inter Milan", badgeUrl: null },
      posterUrl: null,
      popular: true,
      sources: [{ source: "admin", id: "ppv-real-madrid-vs-inter-milan" }],
    });

    const request = new Request("http://localhost:3000/api/events/event-123");
    const response = await GET(request, {
      params: Promise.resolve({ id: "event-123" }),
    });

    expect(response.status).toBe(200);
    const json = (await response.json()) as { event: { id: string; title: string } };
    expect(json.event.id).toBe("event-123");
    expect(json.event.title).toBe("Real Madrid vs Inter Milan");
  });

  it("returns 404 when event is not found", async () => {
    vi.spyOn(catalog, "getEventById").mockResolvedValueOnce(null);

    const request = new Request("http://localhost:3000/api/events/unknown-id");
    const response = await GET(request, {
      params: Promise.resolve({ id: "unknown-id" }),
    });

    expect(response.status).toBe(404);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("Event not found");
  });
});
