/**
 * Image URL helpers for the Streamed Images API.
 *
 * Per https://streamed.pk/docs/images:
 *   badge:  GET /api/images/badge/[id].webp
 *   poster: GET /api/images/poster/[badge]/[badge].webp
 *   proxy:  GET /api/images/proxy/[poster].webp
 *
 * We route all image loads through OUR OWN proxy (/api/img/...) so:
 *  - the browser never depends on streamed.pk directly,
 *  - we can apply long-lived immutable cache headers,
 *  - we strictly validate ids (SSRF-safe: only known upstream paths).
 */

/** Ids are opaque tokens: restrict to URL-safe characters. */
const SAFE_ID = /^[A-Za-z0-9_+=.-]{1,512}$/;

export function isSafeImageId(id: string): boolean {
  return SAFE_ID.test(id);
}

/** Internal (same-origin) URL for a team badge. */
export function badgeUrl(badgeId: string | null | undefined): string | null {
  if (!badgeId || !isSafeImageId(badgeId)) return null;
  return `/api/img/badge/${encodeURIComponent(badgeId)}`;
}

/**
 * Internal URL for an event poster. The API returns `poster` either as an
 * id or as a full path like "/api/images/proxy/<id>.webp" — normalize both.
 */
export function posterUrl(poster: string | null | undefined): string | null {
  if (!poster) return null;
  let id = poster;
  const proxyPrefix = "/api/images/proxy/";
  if (id.startsWith(proxyPrefix)) id = id.slice(proxyPrefix.length);
  if (id.endsWith(".webp")) id = id.slice(0, -".webp".length);
  if (!isSafeImageId(id)) return null;
  return `/api/img/poster/${encodeURIComponent(id)}`;
}

/** Upstream URL used by our proxy route handler (server-side only). */
export function upstreamImageUrl(
  kind: "badge" | "poster",
  id: string,
  base: string,
): string | null {
  if (!isSafeImageId(id)) return null;
  if (kind === "badge") return `${base}/images/badge/${id}.webp`;
  return `${base}/images/proxy/${id}.webp`;
}

/**
 * Internal URL for a match poster constructed from two team badge ids.
 * Streamed.pk generates these posters via /api/images/poster/[badge1]/[badge2].webp.
 */
export function matchPosterUrl(
  homeBadge: string | null | undefined,
  awayBadge: string | null | undefined,
): string | null {
  if (!homeBadge || !awayBadge) return null;
  let h = homeBadge;
  let a = awayBadge;
  const badgePrefix = "/api/images/badge/";
  if (h.startsWith(badgePrefix)) h = h.slice(badgePrefix.length);
  if (h.endsWith(".webp")) h = h.slice(0, -".webp".length);
  if (a.startsWith(badgePrefix)) a = a.slice(badgePrefix.length);
  if (a.endsWith(".webp")) a = a.slice(0, -".webp".length);
  if (!isSafeImageId(h) || !isSafeImageId(a)) return null;
  return `/api/img/poster/${encodeURIComponent(h)}/${encodeURIComponent(a)}`;
}

/** Upstream URL for a composite match poster (server-side only). */
export function upstreamMatchPosterUrl(
  homeBadge: string,
  awayBadge: string,
  base: string,
): string | null {
  if (!isSafeImageId(homeBadge) || !isSafeImageId(awayBadge)) return null;
  return `${base}/images/poster/${homeBadge}/${awayBadge}.webp`;
}

