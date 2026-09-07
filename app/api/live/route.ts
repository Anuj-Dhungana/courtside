import { NextResponse } from "next/server";

import { getLiveEvents } from "@/server/services/catalog";
import { clientKeyFromHeaders, rateLimit } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/** Internal endpoint used by the live page for client-side auto-refresh. */
export async function GET(request: Request) {
  const key = clientKeyFromHeaders(request.headers);
  const { allowed } = rateLimit(`live:${key}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const events = await getLiveEvents();
    return NextResponse.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    logger.error("api_live_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Live events are temporarily unavailable." },
      { status: 502 },
    );
  }
}
