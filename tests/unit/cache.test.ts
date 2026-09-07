import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __clearMemoryCache, getOrSet } from "@/lib/cache";

describe("cache getOrSet", () => {
  beforeEach(() => {
    __clearMemoryCache();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("caches values and serves fresh hits without refetching", async () => {
    const fetcher = vi.fn().mockResolvedValue("value-1");
    const a = await getOrSet("k1", { softTtl: 10 }, fetcher);
    const b = await getOrSet("k1", { softTtl: 10 }, fetcher);
    expect(a).toBe("value-1");
    expect(b).toBe("value-1");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("coalesces concurrent misses into one fetch", async () => {
    let resolve!: (v: string) => void;
    const fetcher = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    const p1 = getOrSet("k2", { softTtl: 10 }, fetcher);
    const p2 = getOrSet("k2", { softTtl: 10 }, fetcher);
    // getOrSet awaits an async cache read before invoking the fetcher;
    // flush microtasks so `resolve` is assigned before we call it.
    await vi.runAllTimersAsync();
    resolve("shared");
    expect(await p1).toBe("shared");
    expect(await p2).toBe("shared");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("serves stale value and revalidates in the background", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce("old")
      .mockResolvedValueOnce("new");

    await getOrSet("k3", { softTtl: 1, hardTtl: 100 }, fetcher);
    vi.advanceTimersByTime(2_000); // past softTtl, before hardTtl

    const stale = await getOrSet("k3", { softTtl: 1, hardTtl: 100 }, fetcher);
    expect(stale).toBe("old"); // stale served immediately
    await vi.runAllTimersAsync(); // let background revalidation finish

    const fresh = await getOrSet("k3", { softTtl: 1, hardTtl: 100 }, fetcher);
    expect(fresh).toBe("new");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("expires values entirely after the hard TTL", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce("first")
      .mockResolvedValueOnce("second");
    await getOrSet("k4", { softTtl: 1, hardTtl: 2 }, fetcher);
    vi.advanceTimersByTime(3_000);
    const v = await getOrSet("k4", { softTtl: 1, hardTtl: 2 }, fetcher);
    expect(v).toBe("second");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("propagates fetch errors on a cold miss", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("upstream down"));
    await expect(getOrSet("k5", { softTtl: 10 }, fetcher)).rejects.toThrow(
      "upstream down",
    );
  });
});
