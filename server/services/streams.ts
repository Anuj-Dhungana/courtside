import "server-only";

import { getOrSet } from "@/lib/cache";
import { logger } from "@/lib/utils/logger";
import { getStreamFreeStream, listStreamFreeStreams, StreamFreeError } from "@/server/streams/streamfree/client";
import { matchStreamFree, streamFreeCategory, toStreamOptions } from "@/server/streams/streamfree/matcher";
import type { StreamFreeStream } from "@/server/streams/streamfree/types";
import { getEventById, getStreams, isSafeExternalUrl } from "@/server/services/catalog";
import type { SportEvent, StreamOption } from "@/types";

export interface EventStreamsResult {
  streams: StreamOption[];
  provider: "streamed" | "streamfree" | "none";
  providers: {
    streamed: StreamOption[];
    streamfree: StreamOption[];
  };
}

async function primaryStreams(event: SportEvent): Promise<StreamOption[]> {
  if (event.sources.length === 0) return [];
  const results = await Promise.allSettled(
    event.sources.slice(0, 4).map((source) => getStreams(source.source, source.id)),
  );
  return results
    .filter((result): result is PromiseFulfilledResult<StreamOption[]> => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((stream) => isSafeExternalUrl(stream.embedUrl));
}

async function fallbackCatalog(category: string): Promise<StreamFreeStream[]> {
  return getOrSet(
    `streamfree:catalog:${category}`,
    { softTtl: 20, hardTtl: 60 },
    async () => listStreamFreeStreams(category),
  );
}

async function fallbackStreams(event: SportEvent): Promise<StreamOption[]> {
  const category = streamFreeCategory(event.sportId);
  if (!category || !event.home || !event.away) return [];
  try {
    const catalog = await fallbackCatalog(category);
    const match = matchStreamFree(event, catalog);
    if (match.stream && match.confidence !== "low") {
      logger.info("streamfree_match_resolved", { eventId: event.id, confidence: match.confidence });
      return toStreamOptions(match.stream).filter((stream) => isSafeExternalUrl(stream.embedUrl));
    }
    logger.info("streamfree_match_not_found", { eventId: event.id, reason: match.reason });
  } catch (error) {
    logger.warn("streamfree_fallback_failed", {
      eventId: event.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return [];
}

export async function getEventStreams(eventId: string): Promise<EventStreamsResult> {
  const event = await getEventById(eventId);
  if (!event) {
    return {
      streams: [],
      provider: "none",
      providers: { streamed: [], streamfree: [] },
    };
  }

  const primary = await primaryStreams(event).catch((error) => {
    logger.warn("streamed_provider_failed", {
      eventId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  });
  logger.info("loading_streamfree_alternative", { eventId });
  const fallback = await fallbackStreams(event);
  const defaultProvider = primary.length > 0 ? "streamed" : fallback.length > 0 ? "streamfree" : "none";
  return {
    streams: defaultProvider === "streamed" ? primary : fallback,
    provider: defaultProvider,
    providers: { streamed: primary, streamfree: fallback },
  };
}

export async function getProviderStream(source: string, id: string): Promise<StreamOption[]> {
  if (source !== "streamfree") return getStreams(source, id);
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
