import { NextResponse } from "next/server";

import { clientKeyFromHeaders, rateLimit } from "@/lib/utils/rate-limit";
import { getEventStreams } from "@/server/services/streams";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const key = clientKeyFromHeaders(request.headers);
  if (!rateLimit(`event-streams:${key}`, 30, 60_000).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const decodedId = decodeURIComponent(id);
  if (!/^[A-Za-z0-9._-]{1,256}$/.test(decodedId)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  try {
    const result = await getEventStreams(decodedId);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=45" },
    });
  } catch {
    return NextResponse.json(
      {
        streams: [],
        provider: "none",
        providers: { streamed: [], streamfree: [] },
        error: "No playable stream is currently available.",
      },
      { status: 200 },
    );
  }
}
