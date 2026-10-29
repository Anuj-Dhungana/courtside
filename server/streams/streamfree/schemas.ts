import { z } from "zod";

const sourceSchema = z.string().url();

const teamSchema = z
  .object({
    name: z.string().min(1),
    logo: z.string().url().nullable().optional(),
  })
  .passthrough();

export const streamFreeStreamSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1),
    category: z.string().min(1),
    league: z.string().nullable().optional(),
    stream_key: z.string().min(1),
    match_timestamp: z.number().finite().nullable().optional(),
    sources: z.array(sourceSchema),
    live_sources: z.array(sourceSchema).catch([]),
    thumbnail_url: z.string().url().nullable().optional(),
    viewers: z.number().int().nonnegative().optional(),
    team1: teamSchema.nullable().optional(),
    team2: teamSchema.nullable().optional(),
  })
  .passthrough();

export const streamFreeListResponseSchema = z
  .object({
    count: z.number().int().nonnegative().optional(),
    streams: z.array(z.unknown()).catch([]),
  })
  .passthrough();

export const streamFreeSingleResponseSchema = streamFreeStreamSchema;
export const streamFreeSourcesResponseSchema = z
  .object({
    stream_key: z.string().min(1),
    sources: z.array(sourceSchema).catch([]),
  })
  .passthrough();
