import {
  bigint,
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * PostgreSQL schema — application-owned data ONLY.
 *
 * Deliberately, no Streamed event/match data is persisted here: the external
 * API remains the source of truth for events and is cached in Redis/memory.
 * These tables exist for personalization and admin configuration and are
 * OPTIONAL — the app runs fully without a DATABASE_URL.
 */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** "team" | "sport" | "event" */
    kind: text("kind").notNull(),
    /** external identifier (sport id, event id, or team name slug) */
    refId: text("ref_id").notNull(),
    label: text("label").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("favorites_unique_idx").on(t.userId, t.kind, t.refId)],
);

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Admin-curated featured events (references external event ids). */
export const featuredEvents = pgTable("featured_events", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull(),
  note: text("note"),
  pinnedUntil: timestamp("pinned_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appSettings = pgTable(
  "app_settings",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("app_settings_key_idx").on(t.key)],
);
