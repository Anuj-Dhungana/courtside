import "server-only";

import { z } from "zod";

/**
 * Server-side environment configuration.
 *
 * All values are optional except where noted: the application is designed to
 * degrade gracefully (no Redis -> in-memory cache, no Postgres -> personalization
 * features disabled). Validation happens once at module load on the server.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  /** Base URL of the external Streamed API. */
  STREAMED_API_BASE_URL: z.string().url().default("https://streamed.pk/api"),
  /** Public site origin, used for canonical URLs / sitemap / OG metadata. */
  SITE_URL: z.string().url().default("http://localhost:3000"),
  /** Optional Redis connection string (redis:// or rediss://). */
  REDIS_URL: z.string().optional(),
  /** Optional Postgres connection string. */
  DATABASE_URL: z.string().optional(),
  /** Upstream request timeout in milliseconds. */
  STREAMED_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable message; never print secret values.
  const issues = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === "production";
