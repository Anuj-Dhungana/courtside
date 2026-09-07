import { env } from "@/config/env";
import { logger } from "@/lib/utils/logger";

/**
 * Low-level HTTP client for the Streamed API (https://streamed.pk/docs).
 *
 * - Enforces a request timeout (STREAMED_TIMEOUT_MS).
 * - Retries idempotent GETs once on network failure / 5xx.
 * - Only ever called from server code; the browser never talks to
 *   streamed.pk directly (except <img> loads via our own proxy route).
 */

export class StreamedApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly path?: string,
  ) {
    super(message);
    this.name = "StreamedApiError";
  }
}

const RETRYABLE_STATUS = new Set([502, 503, 504]);

async function fetchOnce(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      // We manage caching ourselves in lib/cache; bypass Next's fetch cache.
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET a JSON payload from the Streamed API.
 * `path` must start with "/" and is appended to the configured base URL.
 */
export async function streamedGet(path: string): Promise<unknown> {
  const url = `${env.STREAMED_API_BASE_URL}${path}`;
  const timeoutMs = env.STREAMED_TIMEOUT_MS;
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    const started = Date.now();
    try {
      const res = await fetchOnce(url, timeoutMs);
      const durationMs = Date.now() - started;

      if (res.ok) {
        logger.debug("streamed_api_ok", { path, durationMs, attempt });
        return await res.json();
      }

      if (RETRYABLE_STATUS.has(res.status) && attempt === 0) {
        logger.warn("streamed_api_retryable_status", {
          path,
          status: res.status,
          durationMs,
        });
        continue;
      }

      logger.error("streamed_api_error_status", {
        path,
        status: res.status,
        durationMs,
      });
      throw new StreamedApiError(
        `Streamed API responded with ${res.status}`,
        res.status,
        path,
      );
    } catch (err) {
      if (err instanceof StreamedApiError) throw err;
      lastError = err;
      const aborted = err instanceof Error && err.name === "AbortError";
      logger.warn("streamed_api_network_failure", {
        path,
        attempt,
        aborted,
        error: err instanceof Error ? err.message : String(err),
      });
      if (attempt === 0) continue;
    }
  }

  throw new StreamedApiError(
    `Streamed API request failed: ${
      lastError instanceof Error ? lastError.message : "unknown error"
    }`,
    undefined,
    path,
  );
}
