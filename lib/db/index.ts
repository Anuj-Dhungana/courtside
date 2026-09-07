import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/config/env";
import { logger } from "@/lib/utils/logger";
import * as schema from "./schema";

/**
 * Optional Postgres connection. The application treats the database as an
 * enhancement: when DATABASE_URL is unset, `getDb()` returns null and all
 * personalization features quietly disable themselves.
 */

type Db = ReturnType<typeof drizzle<typeof schema>>;

let db: Db | null = null;
let attempted = false;

export function getDb(): Db | null {
  if (attempted) return db;
  attempted = true;
  if (!env.DATABASE_URL) {
    logger.info("database_not_configured");
    return null;
  }
  try {
    const client = postgres(env.DATABASE_URL, {
      max: 5,
      connect_timeout: 5,
    });
    db = drizzle(client, { schema });
    logger.info("database_configured");
  } catch (err) {
    logger.error("database_init_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    db = null;
  }
  return db;
}

export { schema };
