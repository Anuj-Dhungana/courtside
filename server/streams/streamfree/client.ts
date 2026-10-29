import "server-only";

import {
  streamFreeListResponseSchema,
  streamFreeSingleResponseSchema,
} from "@/server/streams/streamfree/schemas";
import type { StreamFreeStream } from "@/server/streams/streamfree/types";

const BASE_URL = "https://streamfree.top/api/v1";

export class StreamFreeError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "StreamFreeError";
  }
}

async function getJson(path: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new StreamFreeError("StreamFree request failed");
  }

  if (!response.ok) {
    throw new StreamFreeError(
      `StreamFree returned ${response.status}`,
      response.status,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new StreamFreeError("StreamFree returned malformed JSON");
  }
}

function mapStream(raw: unknown): StreamFreeStream | null {
  const parsed = streamFreeSingleResponseSchema.safeParse(raw);
  if (!parsed.success) return null;
  return {
    id: parsed.data.id,
    name: parsed.data.name.trim(),
    category: parsed.data.category.trim().toLowerCase(),
    league: parsed.data.league?.trim() || null,
    streamKey: parsed.data.stream_key,
    matchTimestamp: parsed.data.match_timestamp ?? null,
    sources: parsed.data.sources,
    liveSources: parsed.data.live_sources,
    thumbnailUrl: parsed.data.thumbnail_url ?? null,
    viewers: parsed.data.viewers ?? 0,
    team1: parsed.data.team1
      ? {
          name: parsed.data.team1.name.trim(),
          logo: parsed.data.team1.logo ?? null,
        }
      : null,
    team2: parsed.data.team2
      ? {
          name: parsed.data.team2.name.trim(),
          logo: parsed.data.team2.logo ?? null,
        }
      : null,
  };
}

export async function listStreamFreeStreams(
  category?: string,
): Promise<StreamFreeStream[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const payload = await getJson(`/streams${query}`);
  const parsed = streamFreeListResponseSchema.safeParse(payload);
  if (!parsed.success) throw new StreamFreeError("StreamFree response was malformed");
  return parsed.data.streams
    .map(mapStream)
    .filter((stream): stream is StreamFreeStream => stream !== null);
}

export async function getStreamFreeStream(
  streamKey: string,
): Promise<StreamFreeStream | null> {
  if (!/^[A-Za-z0-9._-]{1,256}$/.test(streamKey)) return null;
  try {
    return mapStream(await getJson(`/streams/${encodeURIComponent(streamKey)}`));
  } catch (error) {
    if (error instanceof StreamFreeError && error.status === 404) return null;
    throw error;
  }
}
