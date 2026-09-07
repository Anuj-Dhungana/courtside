import { NextResponse } from "next/server";

import { checkUpstreamHealth } from "@/server/services/catalog";

export const runtime = "nodejs";

/** Health check for load balancers / uptime monitors. */
export async function GET() {
  const upstream = await checkUpstreamHealth();
  const body = {
    status: upstream.ok ? "ok" : "degraded",
    upstream: {
      streamedApi: upstream.ok ? "reachable" : "unreachable",
      latencyMs: upstream.latencyMs,
    },
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    status: upstream.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
