import { NextResponse } from "next/server";

import { env } from "@/config/env";
import {
  isSafeImageId,
  upstreamImageUrl,
  upstreamMatchPosterUrl,
} from "@/lib/streamed/images";
import { logger } from "@/lib/utils/logger";
import { clientKeyFromHeaders, rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

/**
 * Same-origin image proxy for Streamed badges/posters.
 * Supports:
 * - /api/img/badge/:id
 * - /api/img/poster/:id
 * - /api/img/poster/:homeBadge/:awayBadge
 *
 * SSRF-safe by construction: the upstream URL is assembled from a fixed
 * base + strictly validated opaque ids — user input can never supply a
 * host, scheme, or path traversal.
 */

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
  context: { params: Promise<{ slug: string[] }> },
) {
  // Rate limit: 60 req/min per IP. Images are immutably cached 24h on the
  // client, so this only triggers on hard misses or abusive clients.
  const key = clientKeyFromHeaders(request.headers);
  const { allowed } = rateLimit(`img:${key}`, 60, 60_000);
  if (!allowed) {
    return new NextResponse(null, { status: 429 });
  }

  const { slug } = await context.params;
  if (!Array.isArray(slug) || slug.length < 2 || slug.length > 3) {
    return fallback();
  }

  const kind = slug[0];
  let upstream: string | null = null;

  if (kind === "badge" && slug.length === 2) {
    const id = decodeURIComponent(slug[1]);
    if (!isSafeImageId(id)) return fallback();
    upstream = upstreamImageUrl("badge", id, env.STREAMED_API_BASE_URL);
  } else if (kind === "poster" && slug.length === 2) {
    const id = decodeURIComponent(slug[1]);
    if (!isSafeImageId(id)) return fallback();
    upstream = upstreamImageUrl("poster", id, env.STREAMED_API_BASE_URL);
  } else if (kind === "poster" && slug.length === 3) {
    const homeBadge = decodeURIComponent(slug[1]);
    const awayBadge = decodeURIComponent(slug[2]);
    if (!isSafeImageId(homeBadge) || !isSafeImageId(awayBadge)) return fallback();
    upstream = upstreamMatchPosterUrl(
      homeBadge,
      awayBadge,
      env.STREAMED_API_BASE_URL,
    );
  } else {
    return fallback();
  }

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
      slug,
      error: err instanceof Error ? err.message : String(err),
    });
    return fallback();
  }
}
