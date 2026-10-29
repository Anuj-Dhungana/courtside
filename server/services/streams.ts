import "server-only";

import { getOrSet } from "@/lib/cache";
import { logger } from "@/lib/utils/logger";
import { getStreamFreeStream, StreamFreeError } from "@/server/streams/streamfree/client";
import { toStreamOptions } from "@/server/streams/streamfree/matcher";
import { getEventById, getStreams, isSafeExternalUrl } from "@/server/services/catalog";
import type { StreamOption } from "@/types";

export interface EventStreamsResult {
  streams: StreamOption[];
  provider: "streamfree" | "none";
  providers: {
    streamfree: StreamOption[];
  };
}

export async function getEventStreams(eventId: string): Promise<EventStreamsResult> {
  const event = await getEventById(eventId);
  if (!event) {
    return {
      streams: [],
      provider: "none",
      providers: { streamfree: [] },
    };
  }

  const primary = await Promise.all(
    event.sources.map((source) => getStreams(source.source, source.id)),
  ).then((results) => results.flat().filter((stream) => isSafeExternalUrl(stream.embedUrl)));
  const defaultProvider = primary.length > 0 ? "streamfree" : "none";
  return {
    streams: primary,
    provider: defaultProvider,
    providers: { streamfree: primary },
  };
}

export async function getProviderStream(source: string, id: string): Promise<StreamOption[]> {
  if (source !== "streamfree") return [];
  try {
    const stream = await getOrSet(
      `streamfree:stream:${id}`,
      { softTtl: 20, hardTtl: 60 },
      async () => getStreamFreeStream(id),
    );
    return stream
      ? toStreamOptions(stream).filter((option) => isSafeExternalUrl(option.embedUrl))
      : [];
  } catch (error) {
    if (!(error instanceof StreamFreeError && error.status === 404)) {
      logger.warn("streamfree_stream_failed", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
}
