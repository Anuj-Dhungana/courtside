import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/img/[...slug]/route";

describe("GET /api/img/[...slug]", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns fallback for invalid paths", async () => {
    const request = new Request("http://localhost:3000/api/img/invalid");
    const response = await GET(request, {
      params: Promise.resolve({ slug: ["invalid"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
  });

  it("fetches single badge image upstream", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "Content-Type": "image/webp" },
      }),
    );

    const request = new Request("http://localhost:3000/api/img/badge/badge-123");
    const response = await GET(request, {
      params: Promise.resolve({ slug: ["badge", "badge-123"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/webp");
  });

  it("fetches dual-badge match poster upstream", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "Content-Type": "image/webp" },
      }),
    );

    const request = new Request("http://localhost:3000/api/img/poster/home-1/away-2");
    const response = await GET(request, {
      params: Promise.resolve({ slug: ["poster", "home-1", "away-2"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/webp");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/images/poster/home-1/away-2.webp"),
      expect.anything(),
    );
  });
});
