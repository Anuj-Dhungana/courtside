import { NextResponse } from "next/server";

import { checkUpstreamHealth } from "@/server/services/catalog";
import { getCacheHealth } from "@/lib/cache";
import { getDb } from "@/lib/db";
import { env } from "@/config/env";

export const runtime = "nodejs";

/** Health check for load balancers / uptime monitors. */
export async function GET() {
  const [upstream, cache] = await Promise.all([
    checkUpstreamHealth(),
    getCacheHealth(),
  ]);

  const dbConfigured = Boolean(env.DATABASE_URL);
  const dbConnected = dbConfigured ? Boolean(getDb()) : false;

  const isDegraded = !upstream.ok || (Boolean(env.REDIS_URL) && !cache.redisConnected);

  const body = {
    status: isDegraded ? "degraded" : "ok",
    app: "healthy",
    cache: {
      mode: cache.mode,
      redis: env.REDIS_URL
        ? cache.redisConnected
          ? "connected"
          : "unavailable"
        : "not_configured",
      memoryEntries: cache.memoryEntries,
      inflightCount: cache.inflightCount,
    },
    database: dbConfigured
      ? dbConnected
        ? "connected"
        : "unavailable"
      : "not_configured",
    upstream: {
      streamedApi: upstream.ok ? "reachable" : "unreachable",
      latencyMs: upstream.latencyMs,
    },
    timestamp: new Date().toISOString(),
  };

  // The application gracefully degrades if upstream or redis is down.
  // Return HTTP 200 even when degraded so orchestrators do not restart a healthy app.
  return NextResponse.json(body, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
