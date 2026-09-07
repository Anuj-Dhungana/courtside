import { NextResponse } from "next/server";

import { searchCatalog } from "@/server/services/catalog";
import { clientKeyFromHeaders, rateLimit } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const key = clientKeyFromHeaders(request.headers);
  const { allowed } = rateLimit(`search:${key}`, 40, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 100);

  try {
    const results = await searchCatalog(q);
    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    logger.error("api_search_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 502 },
    );
  }
}
