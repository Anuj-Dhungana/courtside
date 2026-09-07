import { NextResponse } from "next/server";

import { getStreams } from "@/server/services/catalog";
import { clientKeyFromHeaders, rateLimit } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/** Internal endpoint: stream options for one source of an event. */
export async function GET(
  request: Request,
  context: { params: Promise<{ source: string; id: string }> },
) {
  const key = clientKeyFromHeaders(request.headers);
  const { allowed } = rateLimit(`streams:${key}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { source, id } = await context.params;
  try {
    const streams = await getStreams(
      decodeURIComponent(source),
      decodeURIComponent(id),
    );
    return NextResponse.json(
      { streams },
      {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    logger.error("api_streams_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Streams are currently unavailable." },
      { status: 502 },
    );
  }
}
