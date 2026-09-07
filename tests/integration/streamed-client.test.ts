import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StreamedApiError, streamedGet } from "@/lib/streamed/client";

describe("streamed client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify([{ ok: true }]), { status: 200 }),
      ),
    );
    const data = await streamedGet("/sports");
    expect(data).toEqual([{ ok: true }]);
  });

  it("retries once on 503 then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("bad", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: 1 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const data = await streamedGet("/matches/live");
    expect(data).toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws StreamedApiError with status on 404 (no retry)", async () => {
    const fetchMock = vi.fn(async () => new Response("nope", { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(streamedGet("/matches/unknown")).rejects.toMatchObject({
      name: "StreamedApiError",
      status: 404,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries network failures once then throws", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("ECONNRESET");
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(streamedGet("/sports")).rejects.toBeInstanceOf(
      StreamedApiError,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
