import type { SportEvent, StreamOption } from "@/types";
import type { StreamFreeStream } from "@/server/streams/streamfree/types";

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(fc|cf|afc|sc|fk|club|football club)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function streamFreeCategory(sportId: string): string | null {
  const sport = sportId.toLowerCase();
  if (["football", "soccer", "association-football"].includes(sport)) return "soccer";
  if (["basketball"].includes(sport)) return "basketball";
  if (["hockey", "ice-hockey"].includes(sport)) return "hockey";
  if (["baseball"].includes(sport)) return "baseball";
  if (["tennis"].includes(sport)) return "tennis";
  if (["cricket"].includes(sport)) return "cricket";
  if (["racing", "motorsports", "motor-sports"].includes(sport)) return "racing";
  return null;
}

function teamScore(expected: string, actual: string): number {
  const a = normalizeName(expected);
  const b = normalizeName(actual);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length >= 5 && (a.includes(b) || b.includes(a))) return 0.8;
  return 0;
}

function splitStreamName(name: string): [string, string] | null {
  const parts = name.split(/\s+(?:vs?\.?|[-–—])\s+/i);
  return parts.length === 2 ? [parts[0], parts[1]] : null;
}

function timeScore(eventTime: number, streamTime: number | null): number {
  if (!streamTime || eventTime <= 0) return 0;
  const difference = Math.abs(eventTime - streamTime * 1000);
  if (difference <= 90 * 60_000) return 1;
  if (difference <= 6 * 60 * 60_000) return 0.5;
  return 0;
}

function categoryScore(event: SportEvent, stream: StreamFreeStream): number {
  const expected = streamFreeCategory(event.sportId);
  if (!expected) return 0;
  return stream.category === expected || (expected === "soccer" && stream.category === "football") ? 1 : 0;
}

export interface StreamFreeMatchResult {
  stream: StreamFreeStream | null;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export function matchStreamFree(
  event: SportEvent,
  streams: StreamFreeStream[],
): StreamFreeMatchResult {
  if (!streamFreeCategory(event.sportId) || !event.home || !event.away) {
    return { stream: null, confidence: "low", reason: "Unsupported sport or missing teams" };
  }

  const candidates = streams
    .map((stream) => {
      const parsed = splitStreamName(stream.name);
      const direct = parsed
        ? (teamScore(event.home!.name, parsed[0]) + teamScore(event.away!.name, parsed[1])) / 2
        : 0;
      const reverse = parsed
        ? (teamScore(event.home!.name, parsed[1]) + teamScore(event.away!.name, parsed[0])) / 2
        : 0;
      const titleScore = Math.max(direct, reverse);
      const score = titleScore * 0.6 + timeScore(event.startTime, stream.matchTimestamp) * 0.25 + categoryScore(event, stream) * 0.15;
      return { stream, score, titleScore };
    })
    .filter((candidate) => candidate.stream.sources.length > 0 && candidate.titleScore >= 0.75 && categoryScore(event, candidate.stream) === 1)
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  const second = candidates[1];
  if (!best || best.score < 0.8) return { stream: null, confidence: "low", reason: "No reliable StreamFree match" };
  if (second && best.score - second.score < 0.08) return { stream: null, confidence: "low", reason: "StreamFree match was ambiguous" };

  return {
    stream: best.stream,
    confidence: best.score >= 0.92 ? "high" : "medium",
    reason: best.score >= 0.92 ? "Team, category and time match" : "Team and category match",
  };
}

export function toStreamOptions(stream: StreamFreeStream): StreamOption[] {
  return stream.sources.map((embedUrl, index) => ({
    id: `${stream.streamKey}-${index + 1}`,
    streamNo: index + 1,
    language: "StreamFree",
    hd: /1080|720/i.test(embedUrl),
    embedUrl,
    source: "streamfree",
  }));
}
