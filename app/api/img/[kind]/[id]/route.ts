import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { isSafeImageId, upstreamImageUrl } from "@/lib/streamed/images";
import { logger } from "@/lib/utils/logger";
import { clientKeyFromHeaders, rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

/**
 * Same-origin image proxy for Streamed badges/posters.
 *
 * SSRF-safe by construction: the upstream URL is assembled from a fixed
 * base + a strictly validated opaque id — user input can never supply a
 * host, scheme, or path traversal.
 */

const VALID_KINDS = new Set(["badge", "poster"]);

// Transparent 1x1 PNG served when the upstream image is missing.
const FALLBACK_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

function fallback(): NextResponse {
  return new NextResponse(FALLBACK_PNG as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
    },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ kind: string; id: string }> },
) {
  // Rate limit: 60 req/min per IP. Images are immutably cached 24h on the
  // client, so this only triggers on hard misses or abusive clients.
  const key = clientKeyFromHeaders(request.headers);
  const { allowed } = rateLimit(`img:${key}`, 60, 60_000);
  if (!allowed) {
    return new NextResponse(null, { status: 429 });
  }

  const { kind, id } = await context.params;
  const decodedId = decodeURIComponent(id);

  if (!VALID_KINDS.has(kind) || !isSafeImageId(decodedId)) {
    return fallback();
  }

  const upstream = upstreamImageUrl(
    kind as "badge" | "poster",
    decodedId,
    env.STREAMED_API_BASE_URL,
  );
  if (!upstream) return fallback();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(upstream, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return fallback();
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return fallback();

    const bytes = await res.arrayBuffer();
    // Guard against absurdly large payloads (2 MB cap for badges/posters).
    if (bytes.byteLength > 2 * 1024 * 1024) return fallback();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    logger.warn("image_proxy_failed", {
      kind,
      error: err instanceof Error ? err.message : String(err),
    });
    return fallback();
  }
}
