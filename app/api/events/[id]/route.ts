import { NextResponse } from "next/server";

import { getEventById } from "@/server/services/catalog";
import { clientKeyFromHeaders, rateLimit } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/** Internal endpoint: fetch single event details and sources by ID. */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const key = clientKeyFromHeaders(request.headers);
  const { allowed } = rateLimit(`event:${key}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  try {
    const event = await getEventById(decodeURIComponent(id));
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(
      { event },
      {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    logger.error("api_event_by_id_failed", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Event is temporarily unavailable." },
      { status: 502 },
    );
  }
}
