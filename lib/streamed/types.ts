import { z } from "zod";

/**
 * Zod schemas for raw Streamed API responses.
 *
 * Schemas verified against https://streamed.pk/docs (Matches, Streams,
 * Sports, Images) and live responses on 2026-09-07.
 *
 * Every schema is deliberately tolerant: unknown/malformed items in an array
 * are dropped rather than failing the whole response (see safeParseArray).
 */

export const apiSportSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});
export type ApiSport = z.infer<typeof apiSportSchema>;

const apiTeamSchema = z.object({
  name: z.string().min(1),
  badge: z.string().nullish(),
});

export const apiMatchSchema = z.object({
  id: z.coerce.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  // Unix ms timestamp; tolerate 0 / missing (some events have no set time).
  date: z.number().int().nonnegative().catch(0),
  poster: z.string().nullish(),
  popular: z.boolean().catch(false),
  teams: z
    .object({
      home: apiTeamSchema.nullish(),
      away: apiTeamSchema.nullish(),
    })
    .nullish(),
  sources: z
    .array(
      z.object({
        source: z.string().min(1),
        id: z.coerce.string().min(1),
      }),
    )
    .catch([]),
  status: z.string().nullish(),
  state: z.string().nullish(),
  period: z.string().nullish(),
});
export type ApiMatch = z.infer<typeof apiMatchSchema>;

export const apiStreamSchema = z.object({
  id: z.coerce.string().min(1),
  streamNo: z.number().int().catch(0),
  language: z.string().catch("Unknown"),
  hd: z.boolean().catch(false),
  embedUrl: z.string().url(),
  source: z.string().min(1),
});
export type ApiStream = z.infer<typeof apiStreamSchema>;

/**
 * Parse an unknown payload as an array of `schema` items, silently skipping
 * invalid entries so a single malformed event never breaks a whole page.
 * Returns the parsed items and the number of dropped entries (for logging).
 */
export function safeParseArray<S extends z.ZodTypeAny>(
  schema: S,
  payload: unknown,
): { items: z.infer<S>[]; dropped: number } {
  if (!Array.isArray(payload)) {
    return { items: [], dropped: 0 };
  }
  const items: z.infer<S>[] = [];
  let dropped = 0;
  for (const raw of payload) {
    const result = schema.safeParse(raw);
    if (result.success) items.push(result.data);
    else dropped += 1;
  }
  return { items, dropped };
}
